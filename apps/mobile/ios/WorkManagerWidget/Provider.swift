// Provider.swift
// Shared TimelineProvider for both widgets. Reads the latest snapshot
// pushed by the Flutter side via the `com.molcube.workmanager/widget`
// MethodChannel into the App Group's UserDefaults.
//
// Refresh policy: every 30 minutes. Dart calls
// `WidgetCenter.shared.reloadAllTimelines()` opportunistically when fresher
// data is available (after `/v1/attendance/today` resolves), so this is a
// fall-back floor, not the primary cadence.

import WidgetKit
import SwiftUI

struct WMSnapshot: TimelineEntry {
    let date: Date
    let status: String           // "WORKING" | "OFF" | "LEAVE" | "UNKNOWN"
    let clockInAt: String?       // ISO-8601, optional
    let workedMinutes: Int       // today
    let weekHours: Double        // 0.0 ... ~60.0
    let annualLeaveRemaining: Double
    let metric: String           // configurable: "hours" | "leave" | "overtime"
}

enum WMSnapshotStore {
    static let suite = "group.com.molcube.workmanager"
    static let key = "wm.todaySnapshot"

    static func load() -> WMSnapshot {
        let defaults = UserDefaults(suiteName: suite)
        let data = defaults?.dictionary(forKey: key) ?? [:]
        return WMSnapshot(
            date: Date(),
            status: (data["status"] as? String) ?? "UNKNOWN",
            clockInAt: data["clockInAt"] as? String,
            workedMinutes: (data["workedMinutes"] as? Int) ?? 0,
            weekHours: (data["weekHours"] as? Double) ?? 0,
            annualLeaveRemaining: (data["annualLeaveRemaining"] as? Double) ?? 0,
            metric: (data["metric"] as? String) ?? "hours"
        )
    }

    static func placeholder() -> WMSnapshot {
        WMSnapshot(
            date: Date(),
            status: "WORKING",
            clockInAt: "2026-05-04T09:00:00Z",
            workedMinutes: 240,
            weekHours: 18.5,
            annualLeaveRemaining: 12.0,
            metric: "hours"
        )
    }
}

struct WMProvider: IntentTimelineProvider {
    typealias Entry = WMSnapshot
    typealias Intent = WMConfigurationIntent

    func placeholder(in context: Context) -> WMSnapshot {
        WMSnapshotStore.placeholder()
    }

    func getSnapshot(for configuration: WMConfigurationIntent,
                     in context: Context,
                     completion: @escaping (WMSnapshot) -> Void) {
        var snap = WMSnapshotStore.load()
        snap = withMetric(snap, configuration.metric.stringValue)
        completion(snap)
    }

    func getTimeline(for configuration: WMConfigurationIntent,
                     in context: Context,
                     completion: @escaping (Timeline<WMSnapshot>) -> Void) {
        var snap = WMSnapshotStore.load()
        snap = withMetric(snap, configuration.metric.stringValue)
        let next = Calendar.current.date(byAdding: .minute, value: 30, to: Date()) ?? Date()
        completion(Timeline(entries: [snap], policy: .after(next)))
    }

    private func withMetric(_ s: WMSnapshot, _ metric: String) -> WMSnapshot {
        WMSnapshot(
            date: s.date, status: s.status, clockInAt: s.clockInAt,
            workedMinutes: s.workedMinutes, weekHours: s.weekHours,
            annualLeaveRemaining: s.annualLeaveRemaining, metric: metric
        )
    }
}
