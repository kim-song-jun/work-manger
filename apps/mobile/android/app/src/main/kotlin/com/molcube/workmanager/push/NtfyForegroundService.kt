package com.molcube.workmanager.push

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat

/**
 * Foreground service that keeps the ntfy WebSocket alive while the Flutter
 * shell is suspended (Doze, app backgrounded, screen off). Without this the
 * Android OS would tear down the socket within minutes and the user would
 * miss pushes — defeating the point of self-hosting (see ADR-006).
 *
 * Owns NO socket logic itself: the actual WebSocket lives in the Dart
 * isolate (`apps/mobile/lib/notif/ntfy_client.dart`). This service exists
 * solely to (a) raise an ongoing notification so the OS keeps the process
 * alive and (b) collect WAKE_LOCK so background frames are delivered.
 *
 * Wired into `AndroidManifest.xml` via:
 *
 *     <service
 *         android:name=".push.NtfyForegroundService"
 *         android:foregroundServiceType="dataSync"
 *         android:exported="false" />
 *
 * Started by the SPA via the bridge once `registerDeviceToken` resolves.
 */
class NtfyForegroundService : Service() {

    companion object {
        const val CHANNEL_ID = "wm-ntfy-fg"
        const val NOTIF_ID = 0xC0FE
        const val ACTION_START = "com.molcube.workmanager.push.START"
        const val ACTION_STOP = "com.molcube.workmanager.push.STOP"

        fun start(ctx: Context) {
            val i = Intent(ctx, NtfyForegroundService::class.java).apply {
                action = ACTION_START
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                ctx.startForegroundService(i)
            } else {
                ctx.startService(i)
            }
        }

        fun stop(ctx: Context) {
            val i = Intent(ctx, NtfyForegroundService::class.java).apply {
                action = ACTION_STOP
            }
            ctx.startService(i)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        ensureChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_STOP -> {
                stopForeground(STOP_FOREGROUND_REMOVE)
                stopSelf()
                return START_NOT_STICKY
            }
            else -> {
                startForeground(NOTIF_ID, buildOngoingNotification())
            }
        }
        // STICKY so Android restarts us if the OOM killer reaps the process.
        return START_STICKY
    }

    private fun ensureChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (nm.getNotificationChannel(CHANNEL_ID) != null) return
        val ch = NotificationChannel(
            CHANNEL_ID,
            "근무 관리 푸시 연결",
            NotificationManager.IMPORTANCE_LOW
        ).apply {
            description = "ntfy 실시간 푸시 연결을 유지합니다."
            setShowBadge(false)
        }
        nm.createNotificationChannel(ch)
    }

    private fun buildOngoingNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("근무 관리")
            .setContentText("실시간 알림 연결 중")
            .setSmallIcon(android.R.drawable.stat_notify_sync)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build()
    }
}
