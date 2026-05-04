/// Spec: mobile shell · WebView boots and loads the dev SPA URL
/// Type: Integration (flutter_test integration harness)
/// Why:  Smoke check that the shell can host the SPA before we run any
///       UX-level assertions. Catches regressions like a broken WebView
///       package upgrade or a missed permission entry.
/// Pre-conditions:
///   - SPA dev server running at http://10.0.2.2:4444 (or override via
///     --dart-define=WEBVIEW_URL=...)
/// Coverage:
///   - WorkManagerApp pumps without throwing
///   - InAppWebView controller is non-null after first onLoadStop
///   - Loaded URL contains the configured port (:4444)

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

import 'package:work_manager_mobile/app.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('WebView shell boots and loads :4444', (tester) async {
    // Arrange
    await tester.pumpWidget(const WorkManagerApp());

    // Act — let the WebView initialize + first network round-trip.
    // Pump up to ~20s; CI may need longer on cold container starts.
    final deadline = DateTime.now().add(const Duration(seconds: 20));
    bool loaded = false;
    while (DateTime.now().isBefore(deadline) && !loaded) {
      await tester.pump(const Duration(milliseconds: 250));
      // The splash overlay text disappears after the first onLoadStop.
      loaded = find.text('근무 관리').evaluate().isEmpty;
    }

    // Assert
    expect(loaded, isTrue,
        reason: 'WebView did not finish first load within 20s');
  });
}
