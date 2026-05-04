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

/** "이번 주 요약" — weekly hours bar + 잔여 연차. */
class ThisWeekWidget : GlanceAppWidget() {
    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val snap = context.readSnapshot()
        provideContent { GlanceTheme { ThisWeekContent(snap) } }
    }
}

@Composable
private fun ThisWeekContent(snap: WMSnapshot) {
    val target = 40.0
    val ratio = (snap.weekHours / target).coerceIn(0.0, 1.0)
    Column(
        modifier = GlanceModifier.fillMaxSize().padding(14.dp)
            .background(GlanceTheme.colors.surface),
    ) {
        Text("이번 주", style = TextStyle(fontSize = 11f.sp(),
            color = GlanceTheme.colors.onSurfaceVariant))
        Spacer(GlanceModifier.height(2.dp))
        Row {
            Text(
                text = "%.1f".format(snap.weekHours),
                style = TextStyle(fontSize = 26f.sp(), fontWeight = FontWeight.Medium,
                    color = GlanceTheme.colors.onSurface),
            )
            Spacer(GlanceModifier.width(4.dp))
            Text("시간 / ${target.toInt()}",
                style = TextStyle(fontSize = 11f.sp(),
                    color = GlanceTheme.colors.onSurfaceVariant))
        }
        Spacer(GlanceModifier.height(6.dp))
        Box(
            modifier = GlanceModifier.fillMaxWidth().height(8.dp).cornerRadius(4.dp)
                .background(GlanceTheme.colors.primaryContainer),
        ) {
            Box(
                modifier = GlanceModifier
                    .fillMaxWidth(/* placeholder until glance fractional width */)
                    .width((220 * ratio).dp).height(8.dp).cornerRadius(4.dp)
                    .background(GlanceTheme.colors.primary),
            ) {}
        }
        Spacer(GlanceModifier.height(8.dp))
        Text("잔여 연차 ${formatLeave(snap.annualLeaveRemaining)}일",
            style = TextStyle(fontSize = 11f.sp(),
                color = GlanceTheme.colors.onSurfaceVariant))
    }
}

private fun formatLeave(v: Double): String =
    if (v == v.toInt().toDouble()) v.toInt().toString() else "%.1f".format(v)

private fun Float.sp(): androidx.compose.ui.unit.TextUnit =
    androidx.compose.ui.unit.TextUnit(this, androidx.compose.ui.unit.TextUnitType.Sp)
