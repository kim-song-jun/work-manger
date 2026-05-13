/// Golden tests for HomeKpiTile widget — normal and caution accent states.
/// Baseline PNGs generated via: flutter test --update-goldens
/// Re-run without flag to verify no regression.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/screens/home/widgets/home_kpi_tile.dart';
import 'package:work_manager_mobile/theme/wm_theme.dart';

void main() {
  testWidgets('HomeKpiTile normal golden', (tester) async {
    await tester.pumpWidget(MaterialApp(
      theme: WMTheme.light(),
      home: Scaffold(
        body: Center(
          child: SizedBox(
            width: 120,
            child: HomeKpiTile(label: '오늘', value: '4h 00m'),
          ),
        ),
      ),
    ));
    await tester.pump(const Duration(milliseconds: 0));
    await expectLater(
      find.byType(HomeKpiTile),
      matchesGoldenFile('goldens/home_kpi_tile_normal.png'),
    );
  });

  testWidgets('HomeKpiTile caution golden', (tester) async {
    await tester.pumpWidget(MaterialApp(
      theme: WMTheme.light(),
      home: Scaffold(
        body: Center(
          child: SizedBox(
            width: 120,
            child: HomeKpiTile(label: '연장', value: '1h 15m', accent: KpiAccent.caution),
          ),
        ),
      ),
    ));
    await tester.pump(const Duration(milliseconds: 0));
    await expectLater(
      find.byType(HomeKpiTile),
      matchesGoldenFile('goldens/home_kpi_tile_caution.png'),
    );
  });
}
