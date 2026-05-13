import 'package:test/test.dart';
import 'package:wm_api/wm_api.dart';


/// tests for AdminSettingsApi
void main() {
  final instance = WmApi().getAdminSettingsApi();

  group(AdminSettingsApi, () {
    // Get company settings (ADMIN+)
    //
    // GET /v1/admin/settings — 회사 설정 조회 (ADMIN+).
    //
    //Future<CompanySettings> adminSettingsRetrieve() async
    test('test adminSettingsRetrieve', () async {
      // TODO
    });

    // Update company settings (OWNER only)
    //
    // PATCH /v1/admin/settings — OWNER 만 쓰기 가능. ADMIN 은 read-only.
    //
    //Future<CompanySettings> adminSettingsUpdatePartialUpdate({ PatchedCompanySettingsRequest patchedCompanySettingsRequest }) async
    test('test adminSettingsUpdatePartialUpdate', () async {
      // TODO
    });

  });
}
