package com.molcube.workmanager

import android.content.Context
import androidx.glance.appwidget.GlanceAppWidgetManager
import androidx.glance.appwidget.updateAll
import com.molcube.workmanager.geofence.GeofenceMethodChannelHandler
import com.molcube.workmanager.glance.WorkStatusWidget
import com.molcube.workmanager.widget.ThisWeekWidget
import com.molcube.workmanager.widget.TodayStatusWidget
import com.molcube.workmanager.widget.writeSnapshot
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * Hosts the Flutter engine + registers the `com.molcube.workmanager/widget`
 * MethodChannel. Dart calls land here, mutate DataStore, then ping Glance.
 */
class MainActivity : FlutterActivity() {
    private val widgetChannel = "com.molcube.workmanager/widget"
    private val scope = CoroutineScope(Dispatchers.Main)

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, widgetChannel)
            .setMethodCallHandler { call, result -> handle(call, result) }

        // iter13 T5: native geofence binding (GeofencingClient).
        MethodChannel(
            flutterEngine.dartExecutor.binaryMessenger,
            GeofenceMethodChannelHandler.CHANNEL,
        ).setMethodCallHandler(GeofenceMethodChannelHandler(applicationContext))
    }

    private fun handle(call: MethodCall, result: MethodChannel.Result) {
        when (call.method) {
            "widget.pushTodayStatus" -> pushTodayStatus(call, result)
            "widget.reload" -> { reload(); result.success(mapOf("ok" to true)) }
            else -> result.notImplemented()
        }
    }

    private fun pushTodayStatus(call: MethodCall, result: MethodChannel.Result) {
        val ctx: Context = applicationContext
        val status = call.argument<String>("status")
        val clockInAt = call.argument<String>("clockInAt")
        val workedMinutes = call.argument<Int>("workedMinutes")
        val annualLeave = (call.argument<Number>("annualLeaveRemaining"))?.toDouble()
        val weekHours = (call.argument<Number>("weekHours"))?.toDouble()
        val metric = call.argument<String>("metric")

        scope.launch {
            ctx.writeSnapshot(
                status = status,
                clockInAt = clockInAt,
                workedMinutes = workedMinutes,
                weekHours = weekHours,
                annualLeaveRemaining = annualLeave,
                metric = metric,
            )
            reload()
            result.success(mapOf("ok" to true))
        }
    }

    private fun reload() {
        val ctx = applicationContext
        scope.launch {
            runCatching { TodayStatusWidget().updateAll(ctx) }
            runCatching { ThisWeekWidget().updateAll(ctx) }
            // iter13 T5: also refresh the compact WorkStatusWidget.
            runCatching { WorkStatusWidget().updateAll(ctx) }
        }
    }
}
