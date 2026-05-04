// TodayStatusWidget.swift
// Small + medium widget. Shows today's status (출근/퇴근/연차) + clock-in time
// + worked minutes. Mirrors the FE's `/v1/attendance/today` shape.

import WidgetKit
import SwiftUI

struct TodayStatusWidget: Widget {
    let kind: String = "TodayStatusWidget"

    var body: some WidgetConfiguration {
        if #available(iOS 17.0, *) {
            return AppIntentConfiguration(
                kind: kind, intent: WMConfigurationIntent.self, provider: WMProvider()
            ) { entry in
                TodayStatusWidgetView(entry: entry)
            }
            .configurationDisplayName("오늘 근무 상태")
            .description("출근/퇴근 상태와 누적 근무 시간을 표시합니다.")
            .supportedFamilies([.systemSmall, .systemMedium])
        } else {
            return EmptyWidgetConfiguration() as! WidgetConfiguration
        }
    }
}

struct TodayStatusWidgetView: View {
    let entry: WMSnapshot
    @Environment(\.widgetFamily) private var family

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(statusLabel(entry.status))
                    .font(.caption)
                    .padding(.horizontal, 8).padding(.vertical, 3)
                    .background(statusColor(entry.status).opacity(0.15))
                    .foregroundColor(statusColor(entry.status))
                    .clipShape(Capsule())
                Spacer()
            }
            Text(workedHHmm(entry.workedMinutes))
                .font(.system(size: family == .systemSmall ? 28 : 36, weight: .semibold))
                .monospacedDigit()
            if let clockIn = entry.clockInAt {
                Text("출근 \(formatTime(clockIn))")
                    .font(.caption2).foregroundColor(.secondary)
            } else {
                Text("아직 출근 전").font(.caption2).foregroundColor(.secondary)
            }
            Spacer(minLength: 0)
        }
        .padding(12)
        .containerBackground(.fill.tertiary, for: .widget)
    }

    private func statusLabel(_ s: String) -> String {
        switch s {
        case "WORKING": return "근무중"
        case "OFF": return "퇴근"
        case "LEAVE": return "연차"
        default: return "—"
        }
    }
    private func statusColor(_ s: String) -> Color {
        switch s {
        case "WORKING": return .green
        case "OFF": return .gray
        case "LEAVE": return .orange
        default: return .secondary
        }
    }
    private func workedHHmm(_ minutes: Int) -> String {
        let h = minutes / 60, m = minutes % 60
        return String(format: "%d시간 %02d분", h, m)
    }
    private func formatTime(_ iso: String) -> String {
        let f = ISO8601DateFormatter()
        guard let d = f.date(from: iso) else { return iso }
        let out = DateFormatter()
        out.dateFormat = "HH:mm"
        return out.string(from: d)
    }
}
