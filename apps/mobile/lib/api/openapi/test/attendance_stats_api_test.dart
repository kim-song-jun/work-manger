import 'package:test/test.dart';
import 'package:wm_api/wm_api.dart';


/// tests for AttendanceStatsApi
void main() {
  final instance = WmApi().getAttendanceStatsApi();

  group(AttendanceStatsApi, () {
    // Today's attendance stats (FE-flat shape)
    //
    // ``GET /v1/attendance/stats/today`` — flat KPI shape for m-home.  Mirrors the contract used by the FE MSW handler: ``work_minutes`` / ``break_minutes`` flat fields plus an ``is_clocked_in`` boolean derived from record status. Returns zeros / nulls when the user has not yet clocked in today.
    //
    //Future<TodayStatsResponse> attendanceStatsTodayRetrieve() async
    test('test attendanceStatsTodayRetrieve', () async {
      // TODO
    });

    // Weekly attendance aggregate (current ISO week, company tz)
    //
    // ``GET /v1/attendance/stats/weekly`` — F-EMPLOYEE-012 KPI source.  Returns regular / overtime / break minutes and days worked for the current ISO week (Mon..Sun in the company timezone). Empty weeks return all zeros so the FE can render dashes safely.
    //
    //Future<WeeklyStatsResponse> attendanceStatsWeeklyRetrieve() async
    test('test attendanceStatsWeeklyRetrieve', () async {
      // TODO
    });

  });
}
