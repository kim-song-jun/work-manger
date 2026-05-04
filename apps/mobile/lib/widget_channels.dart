import 'package:flutter/services.dart';

/// Client for the `com.molcube.workmanager/widget` MethodChannel.
///
/// The native side (iOS `WidgetMethodChannel.swift`, Android
/// `MainActivity.kt`) writes the payload into the App Group shared store
/// (UserDefaults / DataStore) and then reloads home-screen widget timelines.
///
/// All methods resolve to `null` on platforms where the channel isn't
/// registered yet (e.g. plain Flutter dev runs without the widget
/// extension built in Xcode), so callers can `await` without try/catch
/// noise.
class WidgetChannels {
  WidgetChannels._();

  static const MethodChannel channel =
      MethodChannel('com.molcube.workmanager/widget');

  /// Push the latest attendance snapshot to home-screen widgets.
  ///
  /// Field shapes mirror `apps/web/src/shared/lib/native.ts` so the FE can
  /// pass-through the `/v1/attendance/today` response payload directly.
  ///
  /// * [status] one of `WORKING` | `OFF` | `LEAVE` | `UNKNOWN`.
  /// * [clockInAt] ISO-8601 UTC, optional (null when not yet clocked in).
  /// * [workedMinutes] today's total worked minutes.
  /// * [annualLeaveRemaining] in days (decimal allowed, e.g. 12.5).
  /// * [weekHours] this week's accumulated hours.
  /// * [metric] optional widget-config metric: `hours` | `leave` | `overtime`.
  static Future<Map<String, dynamic>?> pushTodayStatus({
    required String status,
    String? clockInAt,
    int workedMinutes = 0,
    double annualLeaveRemaining = 0,
    double weekHours = 0,
    String? metric,
  }) async {
    return _invoke('widget.pushTodayStatus', {
      'status': status,
      'clockInAt': clockInAt,
      'workedMinutes': workedMinutes,
      'annualLeaveRemaining': annualLeaveRemaining,
      'weekHours': weekHours,
      if (metric != null) 'metric': metric,
    });
  }

  /// Force-reload widgets without changing the underlying snapshot.
  /// Useful after an explicit pull-to-refresh from the FE.
  static Future<Map<String, dynamic>?> requestWidgetReload() {
    return _invoke('widget.reload', const <String, dynamic>{});
  }

  static Future<Map<String, dynamic>?> _invoke(
    String method,
    Map<String, dynamic> args,
  ) async {
    try {
      return await channel.invokeMapMethod<String, dynamic>(method, args);
    } on MissingPluginException {
      return null;
    } on PlatformException {
      return null;
    }
  }
}
