// WorkManagerWidgetBundle.swift
// Entry point for the WidgetKit extension target. Lists every widget that
// will appear in the iOS widget gallery (screen-catalog.md §8 widget.ios).
//
// Manual Xcode setup is required to wire this file into a Widget Extension
// target — see README.md in this directory.

import WidgetKit
import SwiftUI

@main
struct WorkManagerWidgetBundle: WidgetBundle {
    @WidgetBundleBuilder
    var body: some Widget {
        TodayStatusWidget()
        ThisWeekWidget()
    }
}
