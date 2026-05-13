import 'package:shared_preferences/shared_preferences.dart';

/// JWT storage backed by shared_preferences (PoC).
///
/// Production: migrate to flutter_secure_storage (Plan-D / post-PoC) so the
/// access/refresh tokens live in OS keychain instead of plain prefs.
class JwtStore {
  static const _kAccess = 'wm.jwt.access';
  static const _kRefresh = 'wm.jwt.refresh';

  Future<String?> readAccess() async => (await SharedPreferences.getInstance()).getString(_kAccess);
  Future<String?> readRefresh() async => (await SharedPreferences.getInstance()).getString(_kRefresh);

  Future<void> write({required String access, required String refresh}) async {
    final p = await SharedPreferences.getInstance();
    await p.setString(_kAccess, access);
    await p.setString(_kRefresh, refresh);
  }

  Future<void> clear() async {
    final p = await SharedPreferences.getInstance();
    await p.remove(_kAccess);
    await p.remove(_kRefresh);
  }
}
