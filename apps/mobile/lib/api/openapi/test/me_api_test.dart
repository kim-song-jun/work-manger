import 'package:test/test.dart';
import 'package:wm_api/wm_api.dart';


/// tests for MeApi
void main() {
  final instance = WmApi().getMeApi();

  group(MeApi, () {
    //Future meRetrieve() async
    test('test meRetrieve', () async {
      // TODO
    });

    // GET — returns the authenticated user's settings. PATCH — partial update (currently only `use_native_home`). See docs/superpowers/specs/2026-05-13-home-native-poc-design.md §6.
    //
    //Future meSettingsPartialUpdate() async
    test('test meSettingsPartialUpdate', () async {
      // TODO
    });

    // GET — returns the authenticated user's settings. PATCH — partial update (currently only `use_native_home`). See docs/superpowers/specs/2026-05-13-home-native-poc-design.md §6.
    //
    //Future meSettingsRetrieve() async
    test('test meSettingsRetrieve', () async {
      // TODO
    });

  });
}
