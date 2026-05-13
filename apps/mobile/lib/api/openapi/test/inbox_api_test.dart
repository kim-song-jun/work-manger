import 'package:test/test.dart';
import 'package:wm_api/wm_api.dart';


/// tests for InboxApi
void main() {
  final instance = WmApi().getInboxApi();

  group(InboxApi, () {
    //Future inboxApproveCreate(String taskId) async
    test('test inboxApproveCreate', () async {
      // TODO
    });

    //Future inboxRejectCreate(String taskId) async
    test('test inboxRejectCreate', () async {
      // TODO
    });

    //Future inboxRetrieve() async
    test('test inboxRetrieve', () async {
      // TODO
    });

  });
}
