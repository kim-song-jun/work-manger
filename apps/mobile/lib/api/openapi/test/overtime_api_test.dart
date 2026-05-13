import 'package:test/test.dart';
import 'package:wm_api/wm_api.dart';


/// tests for OvertimeApi
void main() {
  final instance = WmApi().getOvertimeApi();

  group(OvertimeApi, () {
    // Monthly aggregates for current and past months.
    //
    //Future overtimeHistoryRetrieve() async
    test('test overtimeHistoryRetrieve', () async {
      // TODO
    });

    //Future overtimeRequestsCancelCreate(String id) async
    test('test overtimeRequestsCancelCreate', () async {
      // TODO
    });

    //Future overtimeRequestsCreate() async
    test('test overtimeRequestsCreate', () async {
      // TODO
    });

    //Future overtimeRequestsRetrieve() async
    test('test overtimeRequestsRetrieve', () async {
      // TODO
    });

    //Future overtimeRequestsRetrieve2(String id) async
    test('test overtimeRequestsRetrieve2', () async {
      // TODO
    });

    // Stub — auto-request thresholds. Stored on Company in future; static for now.
    //
    //Future overtimeSettingsPartialUpdate() async
    test('test overtimeSettingsPartialUpdate', () async {
      // TODO
    });

    // Stub — auto-request thresholds. Stored on Company in future; static for now.
    //
    //Future overtimeSettingsRetrieve() async
    test('test overtimeSettingsRetrieve', () async {
      // TODO
    });

  });
}
