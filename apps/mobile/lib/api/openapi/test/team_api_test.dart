import 'package:test/test.dart';
import 'package:wm_api/wm_api.dart';


/// tests for TeamApi
void main() {
  final instance = WmApi().getTeamApi();

  group(TeamApi, () {
    // Dense matrix of statuses per member per day.  GET /v1/team/calendar/matrix?from=YYYY-MM-DD&to=YYYY-MM-DD&group_by=team|all
    //
    //Future teamCalendarMatrixRetrieve() async
    test('test teamCalendarMatrixRetrieve', () async {
      // TODO
    });

    //Future teamMembersRetrieve(String membershipId) async
    test('test teamMembersRetrieve', () async {
      // TODO
    });

    //Future teamStatusGridRetrieve() async
    test('test teamStatusGridRetrieve', () async {
      // TODO
    });

    //Future teamStatusGroupedRetrieve() async
    test('test teamStatusGroupedRetrieve', () async {
      // TODO
    });

    // `/v1/team/status` — alias for the grid view.  Calls the inner ``_today_data`` helper directly (NOT the wrapped ``status_grid`` view, which would receive a DRF ``Request`` and a second time pass it through ``api_view`` causing ``AssertionError: The `request` argument must be an instance of `django.http.HttpRequest```).
    //
    //Future teamStatusRetrieve() async
    test('test teamStatusRetrieve', () async {
      // TODO
    });

    //Future teamStatusTimelineRetrieve() async
    test('test teamStatusTimelineRetrieve', () async {
      // TODO
    });

  });
}
