import 'package:test/test.dart';
import 'package:wm_api/wm_api.dart';


/// tests for NotificationsApi
void main() {
  final instance = WmApi().getNotificationsApi();

  group(NotificationsApi, () {
    //Future notificationsDevicesCreate() async
    test('test notificationsDevicesCreate', () async {
      // TODO
    });

    //Future notificationsDevicesDestroy(String deviceId) async
    test('test notificationsDevicesDestroy', () async {
      // TODO
    });

    //Future notificationsReadAllCreate() async
    test('test notificationsReadAllCreate', () async {
      // TODO
    });

    //Future notificationsReadCreate(String logId) async
    test('test notificationsReadCreate', () async {
      // TODO
    });

    //Future notificationsRetrieve() async
    test('test notificationsRetrieve', () async {
      // TODO
    });

    // Return the active VAPID public key for FE Web Push subscription.  Public on purpose: it's the same key embedded in static FE bundles via ``VITE_VAPID_PUBLIC_KEY``. Exposing the runtime endpoint lets ops rotate the key without rebuilding FE artefacts.
    //
    //Future notificationsVapidPublicKeyRetrieve() async
    test('test notificationsVapidPublicKeyRetrieve', () async {
      // TODO
    });

  });
}
