import 'package:test/test.dart';
import 'package:wm_api/wm_api.dart';


/// tests for AdminApi
void main() {
  final instance = WmApi().getAdminApi();

  group(AdminApi, () {
    //Future adminApprovalsRetrieve() async
    test('test adminApprovalsRetrieve', () async {
      // TODO
    });

    //Future adminAuditRetrieve() async
    test('test adminAuditRetrieve', () async {
      // TODO
    });

    //Future adminCompanyCodesCreate() async
    test('test adminCompanyCodesCreate', () async {
      // TODO
    });

    //Future adminCompanyCodesDestroy(String codeId) async
    test('test adminCompanyCodesDestroy', () async {
      // TODO
    });

    //Future adminCompanyCodesRetrieve() async
    test('test adminCompanyCodesRetrieve', () async {
      // TODO
    });

    //Future adminCompliance52hRetrieve() async
    test('test adminCompliance52hRetrieve', () async {
      // TODO
    });

    //Future adminDashboardRetrieve() async
    test('test adminDashboardRetrieve', () async {
      // TODO
    });

    // CSV bulk-register employees. Multipart `file` + optional `dry_run=true`.
    //
    //Future adminEmployeesBulkCreate() async
    test('test adminEmployeesBulkCreate', () async {
      // TODO
    });

    //Future adminEmployeesDeactivateCreate(String membershipId) async
    test('test adminEmployeesDeactivateCreate', () async {
      // TODO
    });

    //Future adminEmployeesRetrieve() async
    test('test adminEmployeesRetrieve', () async {
      // TODO
    });

    //Future adminEmployeesRetrieve2(String membershipId) async
    test('test adminEmployeesRetrieve2', () async {
      // TODO
    });

    //Future adminEmployeesUpdatePartialUpdate(String membershipId) async
    test('test adminEmployeesUpdatePartialUpdate', () async {
      // TODO
    });

    // CBV so we can swap content negotiation. Spec mandates `?format=csv|pdf`, but DRF's default content-negotiator inspects that same query key and 404s when it doesn't match a registered renderer. We override to always return the JSON renderer (used only for the 422 error path); the success path writes raw HttpResponse and bypasses the renderer entirely.
    //
    //Future adminReportsExportRetrieve() async
    test('test adminReportsExportRetrieve', () async {
      // TODO
    });

    //Future adminReportsMonthlyRetrieve() async
    test('test adminReportsMonthlyRetrieve', () async {
      // TODO
    });

  });
}
