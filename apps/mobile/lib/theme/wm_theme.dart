import 'package:flutter/material.dart';

import 'tokens.g.dart';

/// Factory for the Work Manager Flutter native theme.
///
/// Bridges the web design system (CSS custom properties in
/// apps/web/src/shared/styles/tokens.css → tokens.g.dart) into Flutter
/// Material 3 ThemeData. Plan-C consumes this in WMHomeScreen.
///
/// Token name divergence from Plan-B spec (adapted to actual tokens.g.dart):
///   - colorPrimary      → WMTokens.blue500   (--brand maps to --blue-500)
///   - colorBackground   → WMTokens.grey50    (--grey-50: page background)
///   - colorSurface      → WMTokens.white     (--white: card/sheet surface)
///   - colorTextPrimary  → WMTokens.grey900   (--grey-900: primary text)
///   - radiusMd          → WMTokens.rMd       (--r-md: 12px)
class WMTheme {
  WMTheme._();

  static ThemeData light() {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: ColorScheme.fromSeed(
        seedColor: WMTokens.blue500,
        brightness: Brightness.light,
        primary: WMTokens.blue500,
      ),
      scaffoldBackgroundColor: WMTokens.grey50,
      textTheme: const TextTheme().apply(
        bodyColor: WMTokens.grey900,
        displayColor: WMTokens.grey900,
      ),
      cardTheme: CardTheme(
        color: WMTokens.white,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(WMTokens.rMd),
        ),
      ),
    );
  }
}
