import 'package:test/test.dart';
import 'package:wm_api/wm_api.dart';


/// tests for AdminLeaveApi
void main() {
  final instance = WmApi().getAdminLeaveApi();

  group(AdminLeaveApi, () {
    // Aggregate expiring leave for all active company members
    //
    // GET /v1/admin/leave/expiring — aggregate expiring leave for all active members.  Replaces FE per-employee fan-out. Returns rows sorted by expiring desc, omitting members with 0 expiring days.
    //
    //Future adminLeaveExpiringRetrieve() async
    test('test adminLeaveExpiringRetrieve', () async {
      // TODO
    });

  });
}
