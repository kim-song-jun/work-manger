/// Golden tests for HomeHero widget — OFF and WORKING states.
/// Baseline PNGs generated via: flutter test --update-goldens
/// Re-run without flag to verify no regression.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/screens/home/widgets/home_hero.dart';
import 'package:work_manager_mobile/theme/wm_theme.dart';

void main() {
  testWidgets('HomeHero OFF state golden', (tester) async {
    await tester.pumpWidget(MaterialApp(
      theme: WMTheme.light(),
      home: Scaffold(
        body: HomeHero(status: 'OFF', todayMinutes: 0, onClockIn: () {}),
      ),
    ));
    await tester.pump(const Duration(milliseconds: 0)); // capture frame 0 (no animation)
    await expectLater(
      find.byType(HomeHero),
      matchesGoldenFile('goldens/home_hero_off.png'),
    );
  });

  testWidgets('HomeHero WORKING state golden', (tester) async {
    await tester.pumpWidget(MaterialApp(
      theme: WMTheme.light(),
      home: Scaffold(
        body: HomeHero(status: 'WORKING', todayMinutes: 240, onClockIn: () {}),
      ),
    ));
    await tester.pump(const Duration(milliseconds: 0)); // capture frame 0 (pulse dot)
    await expectLater(
      find.byType(HomeHero),
      matchesGoldenFile('goldens/home_hero_working.png'),
    );
  });
}
