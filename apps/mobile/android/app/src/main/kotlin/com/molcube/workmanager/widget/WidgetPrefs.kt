package com.molcube.workmanager.widget

import android.content.Context
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.doublePreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.first

/**
 * DataStore-backed preferences shared between the Flutter MainActivity
 * (which writes from the `com.molcube.workmanager/widget` MethodChannel)
 * and the Glance widget receivers (which read on update).
 */
val Context.widgetDataStore by preferencesDataStore(name = "wm_widget_prefs")

object WidgetKeys {
    val STATUS = stringPreferencesKey("status")               // WORKING|OFF|LEAVE|UNKNOWN
    val CLOCK_IN_AT = stringPreferencesKey("clockInAt")       // ISO-8601
    val WORKED_MINUTES = intPreferencesKey("workedMinutes")
    val WEEK_HOURS = doublePreferencesKey("weekHours")
    val ANNUAL_LEAVE_REMAINING = doublePreferencesKey("annualLeaveRemaining")
    val METRIC = stringPreferencesKey("metric")               // hours|leave|overtime
}

data class WMSnapshot(
    val status: String,
    val clockInAt: String?,
    val workedMinutes: Int,
    val weekHours: Double,
    val annualLeaveRemaining: Double,
    val metric: String,
) {
    companion object {
        fun fromPrefs(p: Preferences) = WMSnapshot(
            status = p[WidgetKeys.STATUS] ?: "UNKNOWN",
            clockInAt = p[WidgetKeys.CLOCK_IN_AT],
            workedMinutes = p[WidgetKeys.WORKED_MINUTES] ?: 0,
            weekHours = p[WidgetKeys.WEEK_HOURS] ?: 0.0,
            annualLeaveRemaining = p[WidgetKeys.ANNUAL_LEAVE_REMAINING] ?: 0.0,
            metric = p[WidgetKeys.METRIC] ?: "hours",
        )

        fun placeholder() = WMSnapshot(
            status = "WORKING",
            clockInAt = "2026-05-04T09:00:00Z",
            workedMinutes = 240,
            weekHours = 18.5,
            annualLeaveRemaining = 12.0,
            metric = "hours",
        )
    }
}

suspend fun Context.readSnapshot(): WMSnapshot =
    WMSnapshot.fromPrefs(widgetDataStore.data.first().toPreferences())

suspend fun Context.writeSnapshot(
    status: String?,
    clockInAt: String?,
    workedMinutes: Int?,
    weekHours: Double?,
    annualLeaveRemaining: Double?,
    metric: String?,
) {
    widgetDataStore.edit { p ->
        if (status != null) p[WidgetKeys.STATUS] = status
        if (clockInAt != null) p[WidgetKeys.CLOCK_IN_AT] = clockInAt
        if (workedMinutes != null) p[WidgetKeys.WORKED_MINUTES] = workedMinutes
        if (weekHours != null) p[WidgetKeys.WEEK_HOURS] = weekHours
        if (annualLeaveRemaining != null) p[WidgetKeys.ANNUAL_LEAVE_REMAINING] = annualLeaveRemaining
        if (metric != null) p[WidgetKeys.METRIC] = metric
    }
}

private fun Preferences.toPreferences(): Preferences = this
