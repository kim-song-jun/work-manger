package com.molcube.workmanager.widget

import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver

/**
 * AppWidget receiver that hosts the Glance composable. Registered in
 * AndroidManifest.xml with action APPWIDGET_UPDATE + meta-data pointing
 * at xml/today_status_widget_info.xml.
 */
class TodayStatusWidgetReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = TodayStatusWidget()
}
