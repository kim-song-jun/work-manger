import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

import 'local_notifs.dart';

/// Self-hosted push client — subscribes to the per-membership ntfy topic over
/// WebSocket and surfaces messages as local notifications.
///
/// Topic shape mirrors the BE side
/// (`apps.notification.providers.ntfy.topic_for`):
///
///     {NTFY_TOPIC_PREFIX}-membership-{membership.id}
///
/// The SPA pushes the prefix + topic to us through
/// `NativeBridge.registerDeviceToken`, so we don't have to hardcode env-config
/// in the Flutter shell. Reconnects with exponential backoff (1s → 30s) on
/// transport errors. See ADR-006.
class NtfyClient {
  NtfyClient({required this.baseUrl, this.onError});

  /// Base URL incl. scheme — typically `wss://app.work-manager.molcube.com`.
  /// nginx proxies `/v1/ntfy/{topic}/ws` → upstream `ntfy:80`.
  final String baseUrl;
  final void Function(Object error)? onError;

  WebSocketChannel? _channel;
  StreamSubscription<dynamic>? _sub;
  String? _activeTopic;
  Duration _backoff = const Duration(seconds: 1);
  static const Duration _maxBackoff = Duration(seconds: 30);
  bool _disposed = false;

  /// Subscribe to ``topic``. Re-subscribing to the same topic is a no-op so
  /// the FE bridge can call this on every navigation without churn.
  Future<void> subscribe(String topic) async {
    if (_activeTopic == topic && _channel != null) return;
    _activeTopic = topic;
    await _close();
    _connect();
  }

  Future<void> dispose() async {
    _disposed = true;
    _activeTopic = null;
    await _close();
  }

  void _connect() {
    final topic = _activeTopic;
    if (topic == null || _disposed) return;
    final uri = Uri.parse(_buildUrl(baseUrl, topic));
    try {
      final channel = WebSocketChannel.connect(uri);
      _channel = channel;
      _sub = channel.stream.listen(
        _onMessage,
        onError: _onTransportError,
        onDone: _onTransportClosed,
        cancelOnError: true,
      );
      // Successful connect → reset backoff.
      _backoff = const Duration(seconds: 1);
    } catch (e) {
      _onTransportError(e);
    }
  }

  void _onMessage(dynamic raw) {
    final msg = parseNtfyMessage(raw is String ? raw : raw?.toString() ?? '');
    if (msg == null) return;
    LocalNotifs.instance.show(
      title: msg.title,
      body: msg.body,
      payload: msg.click,
    );
  }

  void _onTransportError(Object err) {
    if (kDebugMode) debugPrint('[ntfy] error: $err');
    onError?.call(err);
    _scheduleReconnect();
  }

  void _onTransportClosed() {
    _scheduleReconnect();
  }

  void _scheduleReconnect() {
    if (_disposed || _activeTopic == null) return;
    final delay = _backoff;
    _backoff = Duration(
      milliseconds: (_backoff.inMilliseconds * 2).clamp(
        1000,
        _maxBackoff.inMilliseconds,
      ),
    );
    Future.delayed(delay, _connect);
  }

  Future<void> _close() async {
    await _sub?.cancel();
    _sub = null;
    try {
      await _channel?.sink.close();
    } catch (_) {/* ignore */}
    _channel = null;
  }

  static String _buildUrl(String base, String topic) {
    // Ensure ws(s) scheme — accept either http(s) or ws(s) base.
    var b = base.trim();
    if (b.endsWith('/')) b = b.substring(0, b.length - 1);
    if (b.startsWith('http://')) b = 'ws://${b.substring(7)}';
    if (b.startsWith('https://')) b = 'wss://${b.substring(8)}';
    return '$b/v1/ntfy/$topic/ws';
  }
}

/// Pure parser exposed for unit tests.
@visibleForTesting
class NtfyMessage {
  const NtfyMessage({required this.title, required this.body, this.click});
  final String title;
  final String body;
  final String? click;
}

/// Decode a single ntfy WebSocket frame. ntfy emits one JSON object per
/// message with at minimum `event` and `topic`; only `event=="message"` is
/// surfaced as a notification.
@visibleForTesting
NtfyMessage? parseNtfyMessage(String raw) {
  if (raw.isEmpty) return null;
  try {
    final data = jsonDecode(raw);
    if (data is! Map) return null;
    if (data['event'] != null && data['event'] != 'message') return null;
    final title = (data['title'] as String?)?.trim() ?? '';
    final body = (data['message'] as String?) ?? '';
    final click = data['click'] as String?;
    if (title.isEmpty && body.isEmpty) return null;
    return NtfyMessage(
      title: title.isEmpty ? '근무 관리' : title,
      body: body,
      click: click,
    );
  } catch (_) {
    return null;
  }
}
