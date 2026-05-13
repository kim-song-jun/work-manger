import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/screens/loc_picker/loc_picker_screen.dart';

void main() {
  testWidgets('LocPickerScreen renders Scaffold with AppBar title 위치 선택',
      (tester) async {
    // LocPickerScreen is a StatelessWidget whose build() only constructs the
    // Scaffold + AppBar; the InAppWebView is isolated in _LocPickerBody (a
    // child widget).  pumpWidget completes the first frame for the outer
    // Scaffold before _LocPickerBody's build tries to initialise the WebView
    // platform channel.  We use pump() (one frame) and tester.takeException()
    // to drain the known platform-channel assertion, then assert the AppBar.
    await tester.pumpWidget(
      const MaterialApp(
        home: LocPickerScreen(
          webViewUrl: 'http://stub/m/loc-picker?baseUrl=http%3A%2F%2Fstub',
        ),
      ),
    );

    // Drain the platform-channel assertion thrown by InAppWebView; it is an
    // expected failure in the unit-test environment.
    tester.takeException();

    expect(find.text('위치 선택'), findsOneWidget);
    expect(find.byType(Scaffold), findsOneWidget);
  });
}
