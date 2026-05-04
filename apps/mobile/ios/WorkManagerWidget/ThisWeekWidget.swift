// ThisWeekWidget.swift
// Medium widget — this week's hours bar + remaining annual leave.

import WidgetKit
import SwiftUI

struct ThisWeekWidget: Widget {
    let kind: String = "ThisWeekWidget"

    var body: some WidgetConfiguration {
        if #available(iOS 17.0, *) {
            return AppIntentConfiguration(
                kind: kind, intent: WMConfigurationIntent.self, provider: WMProvider()
            ) { entry in
                ThisWeekWidgetView(entry: entry)
            }
            .configurationDisplayName("이번 주 요약")
            .description("주간 누적 시간과 잔여 연차를 한눈에 봅니다.")
            .supportedFamilies([.systemMedium])
        } else {
            return EmptyWidgetConfiguration() as! WidgetConfiguration
        }
    }
}

struct ThisWeekWidgetView: View {
    let entry: WMSnapshot

    private let weeklyTarget: Double = 40.0

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("이번 주").font(.caption).foregroundColor(.secondary)
                Spacer()
                Text(metricLabel())
                    .font(.caption2).foregroundColor(.secondary)
            }

            HStack(alignment: .firstTextBaseline, spacing: 4) {
                Text(String(format: "%.1f", entry.weekHours))
                    .font(.system(size: 30, weight: .semibold)).monospacedDigit()
                Text("시간 / \(Int(weeklyTarget))").font(.caption).foregroundColor(.secondary)
            }

            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color.secondary.opacity(0.15))
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color.accentColor)
                        .frame(width: geo.size.width * progress())
                }
            }.frame(height: 8)

            Text("잔여 연차 \(formattedLeave())일")
                .font(.caption).foregroundColor(.secondary)
            Spacer(minLength: 0)
        }
        .padding(14)
        .containerBackground(.fill.tertiary, for: .widget)
    }

    private func progress() -> CGFloat {
        guard weeklyTarget > 0 else { return 0 }
        return CGFloat(min(1.0, max(0.0, entry.weekHours / weeklyTarget)))
    }
    private func formattedLeave() -> String {
        let r = entry.annualLeaveRemaining
        return r == r.rounded() ? String(Int(r)) : String(format: "%.1f", r)
    }
    private func metricLabel() -> String {
        switch entry.metric {
        case "leave": return "연차 중심"
        case "overtime": return "초과근무 중심"
        default: return "근무시간 중심"
        }
    }
}
