import 'package:flutter/foundation.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

/// Initialize Sentry mobile (PoC).
///
/// Reads DSN from `--dart-define=SENTRY_DSN=...`. If empty, Sentry is
/// disabled (PoC stays silent on dev machines without a key).
Future<void> initSentry(Future<void> Function() runApp) async {
  const dsn = String.fromEnvironment('SENTRY_DSN');
  if (dsn.isEmpty) {
    await runApp();
    return;
  }
  await SentryFlutter.init(
    (o) {
      o.dsn = dsn;
      o.tracesSampleRate = kReleaseMode ? 0.1 : 1.0;
      o.environment = const String.fromEnvironment('SENTRY_ENV', defaultValue: 'dev');
      o.release = const String.fromEnvironment('APP_VERSION', defaultValue: 'unknown');
    },
    appRunner: runApp,
  );
}
