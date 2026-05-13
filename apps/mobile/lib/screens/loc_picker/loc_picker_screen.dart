import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

import '../../theme/tokens.g.dart';

/// Native AppBar shell wrapping an InAppWebView for the location picker SPA page.
///
/// The AppBar renders in a plain [StatelessWidget] (LocPickerScreen); the
/// WebView is isolated inside [_LocPickerBody] so that any platform-channel
/// error from the WebView does not prevent the AppBar from rendering.
class LocPickerScreen extends StatelessWidget {
  const LocPickerScreen({super.key, required this.webViewUrl});

  /// Full URL including query parameters, e.g.:
  /// `https://app.example.com/m/loc-picker?baseUrl=...`
  final String webViewUrl;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WMTokens.white,
      appBar: AppBar(
        backgroundColor: WMTokens.white,
        elevation: 0,
        leading: BackButton(onPressed: () => Navigator.of(context).pop()),
        title: const Text(
          '위치 선택',
          style: TextStyle(fontWeight: FontWeight.w700),
        ),
      ),
      body: SafeArea(child: _LocPickerBody(webViewUrl: webViewUrl)),
    );
  }
}

/// Isolates the InAppWebView so its platform-channel init does not affect
/// the parent Scaffold.
class _LocPickerBody extends StatefulWidget {
  const _LocPickerBody({required this.webViewUrl});

  final String webViewUrl;

  @override
  State<_LocPickerBody> createState() => _LocPickerBodyState();
}

class _LocPickerBodyState extends State<_LocPickerBody> {
  InAppWebViewController? _webCtrl;
  bool _loaded = false;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        InAppWebView(
          initialUrlRequest: URLRequest(url: WebUri(widget.webViewUrl)),
          initialSettings: InAppWebViewSettings(
            javaScriptEnabled: true,
            useShouldOverrideUrlLoading: false,
            mediaPlaybackRequiresUserGesture: false,
            allowsInlineMediaPlayback: true,
            supportZoom: false,
            transparentBackground: true,
          ),
          onWebViewCreated: (controller) => _webCtrl = controller,
          onLoadStop: (controller, url) {
            if (!_loaded && mounted) setState(() => _loaded = true);
          },
          onReceivedError: (controller, request, error) {},
        ),
        if (!_loaded)
          const ColoredBox(
            color: Colors.white,
            child: Center(child: CircularProgressIndicator()),
          ),
      ],
    );
  }
}
