package com.molcube.workmanager.geofence

import android.Manifest
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.content.ContextCompat
import com.google.android.gms.location.Geofence
import com.google.android.gms.location.GeofencingClient
import com.google.android.gms.location.GeofencingRequest
import com.google.android.gms.location.LocationServices
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel

/**
 * Bridges Dart `GeofenceServiceShim` ↔ Android `GeofencingClient`.
 *
 * Dart channel: `com.molcube.workmanager/geofence`
 * Methods:
 *   - `initBackground()` — initialise the GeofencingClient (no-op once
 *     primed; here for parity with the Dart contract).
 *   - `addGeofence(id, lat, lng, radius, label)` — register a single
 *     region. Idempotent: re-sending the same id replaces it.
 *   - `removeGeofence(id)` — drop a single region.
 *   - `getActiveFences()` — return the locally-tracked id list. The
 *     Android API does not expose registered geofences, so we mirror them
 *     in SharedPreferences.
 *
 * Permission expectation: ACCESS_FINE_LOCATION + ACCESS_BACKGROUND_LOCATION
 * are declared in AndroidManifest. Runtime grant is the Flutter layer's
 * job (via `permission_handler`); this handler returns a `PERM_DENIED`
 * error on missing grant rather than crashing.
 */
class GeofenceMethodChannelHandler(
    private val context: Context,
) : MethodChannel.MethodCallHandler {

    companion object {
        const val CHANNEL = "com.molcube.workmanager/geofence"
        private const val PREFS = "wm_geofence_prefs"
        private const val KEY_IDS = "active_ids"
        private const val PI_REQUEST_CODE = 0xC0DE
    }

    private val client: GeofencingClient = LocationServices.getGeofencingClient(context)

    private val prefs: SharedPreferences
        get() = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    private fun pendingIntent(): PendingIntent {
        val intent = Intent(context, GeofenceBroadcastReceiver::class.java).apply {
            action = GeofenceBroadcastReceiver.ACTION_GEOFENCE
        }
        var flags = PendingIntent.FLAG_UPDATE_CURRENT
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            flags = flags or PendingIntent.FLAG_MUTABLE
        }
        return PendingIntent.getBroadcast(context, PI_REQUEST_CODE, intent, flags)
    }

    private fun hasFinePermission(): Boolean =
        ContextCompat.checkSelfPermission(
            context, Manifest.permission.ACCESS_FINE_LOCATION,
        ) == PackageManager.PERMISSION_GRANTED

    override fun onMethodCall(call: MethodCall, result: MethodChannel.Result) {
        when (call.method) {
            "initBackground" -> result.success(mapOf("ok" to true))
            "addGeofence" -> handleAdd(call, result)
            "removeGeofence" -> handleRemove(call, result)
            "getActiveFences" -> result.success(loadIds().toList())
            else -> result.notImplemented()
        }
    }

    private fun handleAdd(call: MethodCall, result: MethodChannel.Result) {
        val id = call.argument<String>("id")
        val lat = (call.argument<Number>("lat"))?.toDouble()
        val lng = (call.argument<Number>("lng"))?.toDouble()
        val radius = (call.argument<Number>("radius"))?.toFloat()
        if (id.isNullOrEmpty() || lat == null || lng == null || radius == null) {
            result.error("BAD_ARGS", "id/lat/lng/radius required", null); return
        }
        if (!hasFinePermission()) {
            result.error("PERM_DENIED", "ACCESS_FINE_LOCATION not granted", null); return
        }

        val fence = Geofence.Builder()
            .setRequestId(id)
            .setCircularRegion(lat, lng, radius)
            .setExpirationDuration(Geofence.NEVER_EXPIRE)
            .setTransitionTypes(
                Geofence.GEOFENCE_TRANSITION_ENTER or
                    Geofence.GEOFENCE_TRANSITION_EXIT,
            )
            .build()

        val req = GeofencingRequest.Builder()
            .setInitialTrigger(GeofencingRequest.INITIAL_TRIGGER_ENTER)
            .addGeofence(fence)
            .build()

        try {
            client.addGeofences(req, pendingIntent())
                .addOnSuccessListener {
                    saveId(id)
                    result.success(mapOf("ok" to true, "id" to id))
                }
                .addOnFailureListener { e ->
                    result.error("ADD_FAILED", e.message, null)
                }
        } catch (sec: SecurityException) {
            result.error("PERM_DENIED", sec.message, null)
        }
    }

    private fun handleRemove(call: MethodCall, result: MethodChannel.Result) {
        val id = call.argument<String>("id")
        if (id.isNullOrEmpty()) {
            result.error("BAD_ARGS", "id required", null); return
        }
        client.removeGeofences(listOf(id))
            .addOnSuccessListener {
                forgetId(id)
                result.success(mapOf("ok" to true, "id" to id))
            }
            .addOnFailureListener { e ->
                // Even if the OS rejected the remove, drop our mirror so we
                // don't leak a stale id forever.
                forgetId(id)
                result.error("REMOVE_FAILED", e.message, null)
            }
    }

    private fun loadIds(): Set<String> =
        prefs.getStringSet(KEY_IDS, emptySet())?.toSet() ?: emptySet()

    private fun saveId(id: String) {
        val updated = loadIds().toMutableSet().apply { add(id) }
        prefs.edit().putStringSet(KEY_IDS, updated).apply()
    }

    private fun forgetId(id: String) {
        val updated = loadIds().toMutableSet().apply { remove(id) }
        prefs.edit().putStringSet(KEY_IDS, updated).apply()
    }
}
