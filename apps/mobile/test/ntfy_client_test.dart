/// Test: mobile notif · ntfy WebSocket message parsing
/// Type: Unit (Dart, flutter_test)
/// Why:  ADR-006 — ntfy 가 Android 푸시 채널이라 WebSocket 프레임 파서가
///       조용히 깨지면 사용자에게 알림이 안 뜬다. ntfy 는 한 프레임당 JSON
///       오브젝트 하나를 보내며 event 가 'message' 인 경우만 surface 한다.
///       본 테스트는 (a) 정상 메시지 → NtfyMessage 객체, (b) keepalive 등
///       비-message 이벤트 → null, (c) 잘못된 JSON → null, (d) title 비었을
///       때 기본 제목 fallback 을 회귀 보호한다.
/// Covers:
///   - parseNtfyMessage(): event=='message' 경로 + keepalive 무시
///   - parseNtfyMessage(): malformed JSON → null
///   - parseNtfyMessage(): title 비었을 때 기본 '근무 관리' 사용
/// Out of scope:
///   - 실제 WebSocket 연결 / 백오프 (integration 테스트가 다룸)
///   - LocalNotifs.show 호출 (flutter_local_notifications 책임)
/// Coverage target: 100% branches for parseNtfyMessage

import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:work_manager_mobile/notif/ntfy_client.dart';

void main() {
  group('parseNtfyMessage', () {
    test('decodes a normal ntfy message frame', () {
      // Why: confirms the happy path the BE publishes from
      // apps.notification.providers.ntfy.send.
      final raw = jsonEncode({
        'event': 'message',
        'topic': 'wm-prod-membership-abc',
        'title': '연차 승인',
        'message': '5/10 연차가 승인됐어요',
        'click': '/inbox/123',
      });

      final msg = parseNtfyMessage(raw);

      expect(msg, isNotNull);
      expect(msg!.title, '연차 승인');
      expect(msg.body, '5/10 연차가 승인됐어요');
      expect(msg.click, '/inbox/123');
    });

    test('returns null for keepalive (event != message)', () {
      // Why: ntfy emits 'keepalive' / 'open' frames we MUST NOT surface as a
      // notification — would spam the user every 30s.
      final raw = jsonEncode({'event': 'keepalive', 'topic': 'wm-prod-x'});
      expect(parseNtfyMessage(raw), isNull);
    });

    test('returns null on malformed JSON', () {
      // Why: defensive — a corrupted frame must not crash the listener loop.
      expect(parseNtfyMessage('not-json'), isNull);
      expect(parseNtfyMessage(''), isNull);
    });

    test('falls back to default title when ntfy omits title', () {
      // Why: ops can publish a body-only message; the user still sees a useful
      // app-name banner instead of an empty title.
      final raw = jsonEncode({'event': 'message', 'message': '점심시간이에요'});
      final msg = parseNtfyMessage(raw);
      expect(msg, isNotNull);
      expect(msg!.title, '근무 관리');
      expect(msg.body, '점심시간이에요');
    });
  });
}
