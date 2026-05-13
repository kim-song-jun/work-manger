import 'package:test/test.dart';
import 'package:wm_api/wm_api.dart';


/// tests for LeaveApi
void main() {
  final instance = WmApi().getLeaveApi();

  group(LeaveApi, () {
    //Future leaveBalanceRetrieve() async
    test('test leaveBalanceRetrieve', () async {
      // TODO
    });

    //Future leavePolicyRetrieve() async
    test('test leavePolicyRetrieve', () async {
      // TODO
    });

    //Future leaveRequestsCancelCreate(String requestId) async
    test('test leaveRequestsCancelCreate', () async {
      // TODO
    });

    //Future leaveRequestsCreate() async
    test('test leaveRequestsCreate', () async {
      // TODO
    });

    //Future leaveRequestsRetrieve() async
    test('test leaveRequestsRetrieve', () async {
      // TODO
    });

    //Future leaveRequestsRetrieve2(String requestId) async
    test('test leaveRequestsRetrieve2', () async {
      // TODO
    });

    //Future leaveTeamCalendarRetrieve() async
    test('test leaveTeamCalendarRetrieve', () async {
      // TODO
    });

  });
}
