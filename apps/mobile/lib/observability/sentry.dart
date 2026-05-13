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

/// Wrap [fn] in a Sentry transaction measuring its latency (PoC KPI).
///
/// [name] becomes the transaction name (e.g. `home.boot`).
/// [operation] is the Sentry op category (e.g. `app.start`, `http.client`).
///
/// If [fn] throws, the exception is captured and rethrown; the span is
/// finished with status `internalError` so the failure is visible in the
/// Performance tab.
///
/// On dev machines (no SENTRY_DSN), Sentry is a no-op — the span is still
/// created but never uploaded.
Future<T> wrapTransaction<T>(
  String name,
  String operation,
  Future<T> Function() fn,
) async {
  final transaction = Sentry.startTransaction(
    name,
    operation,
    bindToScope: true,
  );
  try {
    final result = await fn();
    transaction.status = const SpanStatus.ok();
    return result;
  } catch (e, st) {
    transaction.status = const SpanStatus.internalError();
    transaction.throwable = e;
    await Sentry.captureException(e, stackTrace: st);
    rethrow;
  } finally {
    await transaction.finish();
  }
}
