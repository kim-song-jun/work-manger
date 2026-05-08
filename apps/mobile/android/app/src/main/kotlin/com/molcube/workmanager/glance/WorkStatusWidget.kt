package com.molcube.workmanager.glance

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.GlanceTheme
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.cornerRadius
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.layout.Box
import androidx.glance.layout.Column
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider
import com.molcube.workmanager.widget.WMSnapshot
import com.molcube.workmanager.widget.readSnapshot

/**
 * iter13 T5: compact "근무 상태" Glance widget. Distinct from
 * `TodayStatusWidget` (which targets a 3x2 cell with a status pill +
 * worked time + clock-in label) — this one is a 2x1 minimalist tile
 * showing only the current status badge and today's worked HH:MM, sized
 * for the user's "must-fit-on-the-home-row" feedback in iter12 live test.
 *
 * Reads from the same DataStore as the existing widgets
 * (`com.molcube.workmanager.widget.WidgetPrefs`) so the Flutter side
 * doesn't need a second push channel — `WidgetChannels.pushTodayStatus`
 * already feeds all three widgets.
 */
class WorkStatusWidget : GlanceAppWidget() {
    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val snap = context.readSnapshot()
        provideContent { GlanceTheme { WorkStatusContent(snap) } }
    }
}

class WorkStatusWidgetReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = WorkStatusWidget()
}

@Composable
private fun WorkStatusContent(snap: WMSnapshot) {
    Column(
        modifier = GlanceModifier
            .fillMaxSize()
            .padding(10.dp)
            .background(GlanceTheme.colors.surface),
    ) {
        StatusBadge(snap.status)
        Spacer(GlanceModifier.height(4.dp))
        Text(
            text = workedHHmm(snap.workedMinutes),
            style = TextStyle(
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                color = GlanceTheme.colors.onSurface,
            ),
        )
    }
}

@Composable
private fun StatusBadge(status: String) {
    val (label, bg) = when (status) {
        "WORKING" -> "근무중" to 0xFF10B981.toInt()
        "OFF" -> "퇴근" to 0xFF6B7280.toInt()
        "LEAVE" -> "연차" to 0xFFF59E0B.toInt()
        else -> "—" to 0xFF9CA3AF.toInt()
    }
    Box(
        modifier = GlanceModifier
            .background(ColorProvider(android.graphics.Color.valueOf(bg).toArgb()))
            .cornerRadius(8.dp)
            .padding(horizontal = 6.dp, vertical = 2.dp),
    ) {
        Text(
            text = label,
            style = TextStyle(
                fontSize = 10.sp,
                fontWeight = FontWeight.Medium,
                color = ColorProvider(android.graphics.Color.WHITE),
            ),
        )
    }
}

private fun workedHHmm(minutes: Int): String {
    val h = minutes / 60; val m = minutes % 60
    return "${h}:${"%02d".format(m)}"
}
