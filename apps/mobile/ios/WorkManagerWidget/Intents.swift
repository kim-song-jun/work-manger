// Intents.swift
// Configurable widget options shown in the long-press "Edit Widget" sheet.
// Lets the user pick which metric ThisWeekWidget emphasises.
//
// In a real Xcode setup this file is generated from a .intentdefinition.
// We hand-roll a minimal stand-in here so the Swift compiles without that
// asset; replace with the generated `WMConfigurationIntent` after running
// "Editor → Add Intent Definition File" in Xcode.

import AppIntents
import WidgetKit

@available(iOS 17.0, *)
struct WMConfigurationIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "위젯 설정"
    static var description = IntentDescription("표시할 지표를 선택하세요.")

    @Parameter(title: "지표", default: WMMetric.hours)
    var metric: WMMetric
}

@available(iOS 17.0, *)
enum WMMetric: String, AppEnum {
    case hours
    case leave
    case overtime

    static var typeDisplayRepresentation: TypeDisplayRepresentation = "지표"
    static var caseDisplayRepresentations: [WMMetric: DisplayRepresentation] = [
        .hours: "주간 근무시간",
        .leave: "잔여 연차",
        .overtime: "초과근무"
    ]

    var stringValue: String { rawValue }
}
