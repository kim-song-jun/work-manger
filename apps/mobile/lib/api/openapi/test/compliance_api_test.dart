import 'package:test/test.dart';
import 'package:wm_api/wm_api.dart';


/// tests for ComplianceApi
void main() {
  final instance = WmApi().getComplianceApi();

  group(ComplianceApi, () {
    //Future complianceMeRetrieve() async
    test('test complianceMeRetrieve', () async {
      // TODO
    });

    // GET /v1/compliance/team?week=YYYY-MM-DD — MANAGER+ 팀 단위 52h 현황.  F-MANAGER-02: MANAGER 는 본인 부서 멤버만, ADMIN/OWNER 는 전사 조회.
    //
    //Future complianceTeamRetrieve() async
    test('test complianceTeamRetrieve', () async {
      // TODO
    });

  });
}
