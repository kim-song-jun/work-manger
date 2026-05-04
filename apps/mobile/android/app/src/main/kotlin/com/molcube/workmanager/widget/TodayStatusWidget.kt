package com.molcube.workmanager.widget

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.GlanceTheme
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.cornerRadius
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.color.ColorProvider
import androidx.glance.layout.Alignment
import androidx.glance.layout.Box
import androidx.glance.layout.Column
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.layout.width
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider

/**
 * "오늘 근무 상태" widget — small/medium box: status pill + worked time +
 * clock-in time. Mirrors `apps/mobile/ios/WorkManagerWidget/TodayStatusWidget.swift`.
 */
class TodayStatusWidget : GlanceAppWidget() {
    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val snap = context.readSnapshot()
        provideContent {
            GlanceTheme { TodayStatusContent(snap) }
        }
    }
}

@Composable
private fun TodayStatusContent(snap: WMSnapshot) {
    Column(
        modifier = GlanceModifier.fillMaxSize().padding(12.dp)
            .background(GlanceTheme.colors.surface)
    ) {
        StatusPill(snap.status)
        Spacer(GlanceModifier.height(6.dp))
        Text(
            text = workedHHmm(snap.workedMinutes),
            style = TextStyle(fontSize = 28f.sp(), fontWeight = FontWeight.Medium,
                color = GlanceTheme.colors.onSurface),
        )
        Text(
            text = snap.clockInAt?.let { "출근 ${formatTime(it)}" } ?: "아직 출근 전",
            style = TextStyle(fontSize = 11f.sp(), color = GlanceTheme.colors.onSurfaceVariant),
        )
    }
}

@Composable
private fun StatusPill(status: String) {
    val (label, bg) = when (status) {
        "WORKING" -> "근무중" to 0xFFD1FAE5.toInt()
        "OFF" -> "퇴근" to 0xFFE5E7EB.toInt()
        "LEAVE" -> "연차" to 0xFFFFE4B5.toInt()
        else -> "—" to 0xFFE5E7EB.toInt()
    }
    Box(
        modifier = GlanceModifier.background(ColorProvider(android.graphics.Color.valueOf(bg).toArgb()))
            .cornerRadius(12.dp).padding(horizontal = 8.dp, vertical = 3.dp),
    ) { Text(label, style = TextStyle(fontSize = 11f.sp())) }
}

private fun workedHHmm(minutes: Int): String {
    val h = minutes / 60; val m = minutes % 60
    return "${h}시간 ${"%02d".format(m)}분"
}

private fun formatTime(iso: String): String {
    return try {
        val z = java.time.OffsetDateTime.parse(iso)
        val local = z.atZoneSameInstant(java.time.ZoneId.systemDefault())
        java.time.format.DateTimeFormatter.ofPattern("HH:mm").format(local)
    } catch (_: Throwable) { iso }
}

private fun Float.sp(): androidx.compose.ui.unit.TextUnit =
    androidx.compose.ui.unit.TextUnit(this, androidx.compose.ui.unit.TextUnitType.Sp)
