import 'dart:async';
import 'dart:convert';

import 'package:web_socket_channel/web_socket_channel.dart';

/// Dart client for the Channels WS endpoint `/ws/clock-in`.
///
/// Backoff: 1s → 2s → 5s → 30s (cap). Reconnects automatically.
class WsClient {
  WsClient({required this.baseWsUrl, required this.accessTokenProvider});

  final String baseWsUrl; // e.g. ws://localhost:4455
  final Future<String?> Function() accessTokenProvider;

  WebSocketChannel? _ch;
  final _events = StreamController<Map<String, dynamic>>.broadcast();
  Stream<Map<String, dynamic>> get events => _events.stream;
  Duration _backoff = const Duration(seconds: 1);
  bool _closed = false;

  Future<void> connect() async {
    _closed = false;
    while (!_closed) {
      try {
        final token = await accessTokenProvider();
        final uri = Uri.parse('$baseWsUrl/ws/clock-in${token != null ? '?token=$token' : ''}');
        _ch = WebSocketChannel.connect(uri);
        await _ch!.ready;
        _backoff = const Duration(seconds: 1);
        _ch!.stream.listen(
          (raw) {
            try {
              final m = jsonDecode(raw as String) as Map<String, dynamic>;
              _events.add(m);
            } catch (_) {
              // ignore malformed payload
            }
          },
          onDone: () {},
          onError: (_) {},
          cancelOnError: true,
        );
        await _ch!.sink.done;
      } catch (_) {
        // swallow — fall through to backoff
      }
      if (_closed) break;
      await Future.delayed(_backoff);
      _backoff = _backoff * 2;
      if (_backoff > const Duration(seconds: 30)) {
        _backoff = const Duration(seconds: 30);
      }
    }
  }

  Future<void> dispose() async {
    _closed = true;
    await _ch?.sink.close();
    await _events.close();
  }
}
