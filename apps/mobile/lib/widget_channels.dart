import 'package:flutter/services.dart';

/// Placeholder for future iOS WidgetKit / Android RemoteViews integration.
/// The channel name is contractual — both platforms must register the same
/// `com.molcube.workmanager/widget` MethodChannel when widgets ship.
class WidgetChannels {
  WidgetChannels._();

  static const MethodChannel channel =
      MethodChannel('com.molcube.workmanager/widget');

  /// Push the latest attendance snapshot to home-screen widgets. Returns
  /// `null` until the native side implements the channel.
  static Future<Map<String, dynamic>?> updateAttendanceSnapshot({
    required String status,
    String? subtitle,
  }) async {
    try {
      final result = await channel.invokeMapMethod<String, dynamic>(
        'updateAttendanceSnapshot',
        {'status': status, 'subtitle': subtitle},
      );
      return result;
    } on MissingPluginException {
      return null;
    } on PlatformException {
      return null;
    }
  }
}
