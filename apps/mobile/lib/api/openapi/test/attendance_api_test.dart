import 'package:test/test.dart';
import 'package:wm_api/wm_api.dart';


/// tests for AttendanceApi
void main() {
  final instance = WmApi().getAttendanceApi();

  group(AttendanceApi, () {
    //Future attendanceBreakEndCreate() async
    test('test attendanceBreakEndCreate', () async {
      // TODO
    });

    //Future attendanceBreakStartCreate() async
    test('test attendanceBreakStartCreate', () async {
      // TODO
    });

    //Future attendanceClockInCreate() async
    test('test attendanceClockInCreate', () async {
      // TODO
    });

    //Future attendanceClockOutCreate() async
    test('test attendanceClockOutCreate', () async {
      // TODO
    });

    // Create a :class:`ManualClockInRequest` + matching :class:`ApprovalTask`.  Spec §3.4 — the actual :class:`AttendanceRecord` is only materialized once an approver decides; on APPROVE the approval domain calls :func:`apps.attendance.services.materialize_manual_clock_in` using this persisted payload. Both rows are written in one transaction so the task can never reference a missing target_id.
    //
    //Future attendanceManualRequestCreate() async
    test('test attendanceManualRequestCreate', () async {
      // TODO
    });

    //Future attendanceRecordsRetrieve() async
    test('test attendanceRecordsRetrieve', () async {
      // TODO
    });

    //Future attendanceRecordsRetrieve2(String id) async
    test('test attendanceRecordsRetrieve2', () async {
      // TODO
    });

    //Future attendanceTodayRetrieve() async
    test('test attendanceTodayRetrieve', () async {
      // TODO
    });

  });
}
