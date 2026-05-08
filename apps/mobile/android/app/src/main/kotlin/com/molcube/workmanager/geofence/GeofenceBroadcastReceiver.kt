package com.molcube.workmanager.geofence

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.google.android.gms.location.Geofence
import com.google.android.gms.location.GeofencingEvent
import java.io.OutputStream
import java.net.HttpURLConnection
import java.net.URL
import kotlin.concurrent.thread

/**
 * BroadcastReceiver that fires when the OS detects a transition (ENTER /
 * EXIT) for one of our registered geofences.
 *
 * Side effects:
 *   1. Show a local notification ("근무 위치 진입") so the user sees something
 *      even when the app is fully backgrounded.
 *   2. POST a one-line ping to the user-configured ntfy server so the SPA
 *      (which is subscribed to the same topic via WebSocket — see
 *      `apps/mobile/lib/notif/ntfy_client.dart`) receives the event in
 *      real time. The ntfy URL is read from SharedPreferences (written by
 *      the Dart bridge during onboarding); a missing URL is a no-op.
 *
 * ADR-006 reminder: NO Firebase / FCM. ntfy + APNs only.
 */
class GeofenceBroadcastReceiver : BroadcastReceiver() {

    companion object {
        const val ACTION_GEOFENCE = "com.molcube.workmanager.geofence.TRANSITION"
        private const val CHANNEL_ID = "wm-geofence"
        private const val CHANNEL_NAME = "근무 위치 알림"
        private const val PREFS = "wm_geofence_prefs"
        private const val KEY_NTFY_URL = "ntfy_url"
        private const val KEY_NTFY_TOPIC = "ntfy_topic"
    }

    override fun onReceive(context: Context, intent: Intent) {
        val event = GeofencingEvent.fromIntent(intent) ?: return
        if (event.hasError()) return

        val transition = event.geofenceTransition
        val ids = event.triggeringGeofences?.map { it.requestId } ?: emptyList()
        if (ids.isEmpty()) return

        val (title, body) = when (transition) {
            Geofence.GEOFENCE_TRANSITION_ENTER ->
                "근무 위치 진입" to "자동 출근 확인이 필요한지 앱에서 확인해주세요."
            Geofence.GEOFENCE_TRANSITION_EXIT ->
                "근무 위치 이탈" to "퇴근 처리를 잊지 마세요."
            else -> return
        }

        showNotification(context, title, body)
        pingNtfy(context, transition, ids)
    }

    private fun showNotification(ctx: Context, title: String, body: String) {
        val nm = ctx.getSystemService(Context.NOTIFICATION_SERVICE)
            as NotificationManager
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O &&
            nm.getNotificationChannel(CHANNEL_ID) == null
        ) {
            val ch = NotificationChannel(
                CHANNEL_ID, CHANNEL_NAME, NotificationManager.IMPORTANCE_HIGH,
            ).apply { description = "근무 위치 진입/이탈 알림" }
            nm.createNotificationChannel(ch)
        }
        val n = NotificationCompat.Builder(ctx, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(body)
            .setSmallIcon(android.R.drawable.ic_dialog_map)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .build()
        nm.notify(System.currentTimeMillis().toInt(), n)
    }

    /**
     * Fire-and-forget ntfy POST. Must run off the main thread (Receivers
     * have a strict 10s budget, so we cap the connect+read timeout).
     */
    private fun pingNtfy(ctx: Context, transition: Int, ids: List<String>) {
        val prefs = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val url = prefs.getString(KEY_NTFY_URL, null) ?: return
        val topic = prefs.getString(KEY_NTFY_TOPIC, null) ?: return
        val tag = if (transition == Geofence.GEOFENCE_TRANSITION_ENTER)
            "geofence:enter" else "geofence:exit"

        thread(name = "wm-geofence-ntfy", isDaemon = true) {
            try {
                val full = "${url.trimEnd('/')}/$topic"
                val conn = (URL(full).openConnection() as HttpURLConnection).apply {
                    requestMethod = "POST"
                    connectTimeout = 4_000
                    readTimeout = 4_000
                    doOutput = true
                    setRequestProperty("Title", tag)
                    setRequestProperty("Tags", tag)
                    setRequestProperty("Content-Type", "text/plain; charset=utf-8")
                }
                val payload = ids.joinToString(",")
                conn.outputStream.use { os: OutputStream ->
                    os.write(payload.toByteArray(Charsets.UTF_8))
                }
                conn.inputStream.close()
                conn.disconnect()
            } catch (_: Throwable) {
                // Swallow network errors; the in-app WebSocket will reconcile
                // on next foreground.
            }
        }
    }
}
