import 'package:test/test.dart';
import 'package:wm_api/wm_api.dart';


/// tests for DevApi
void main() {
  final instance = WmApi().getDevApi();

  group(DevApi, () {
    // Create a company + make current user the OWNER. Dev-only convenience.
    //
    //Future devBootstrapCompanyCreate() async
    test('test devBootstrapCompanyCreate', () async {
      // TODO
    });

  });
}
