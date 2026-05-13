import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

import 'bridge/inject.dart';
import 'bridge/native_bridge.dart';

/// WebView URL is wired at build time via:
///   flutter run --dart-define=WEBVIEW_URL=https://app.work-manager.molcube.com
/// Default targets the Android emulator's host loopback (10.0.2.2 == host).
const String _kWebviewUrl = String.fromEnvironment(
  'WEBVIEW_URL',
  defaultValue: 'http://10.0.2.2:4444',
);

/// Parameterised WebView host — opens [url] in a full-screen InAppWebView.
///
/// Used by Plan-D Task 2 to push any SPA path from the native home screen.
/// The existing [WebShellScreen] keeps using the compile-time [_kWebviewUrl];
/// this widget is a thin layer that accepts a runtime URL.
class WebViewHost extends StatefulWidget {
  const WebViewHost({super.key, required this.url});

  final String url;

  @override
  State<WebViewHost> createState() => _WebViewHostState();
}

class _WebViewHostState extends State<WebViewHost> {
  InAppWebViewController? _controller;
  PullToRefreshController? _pullToRefresh;
  bool _firstLoadComplete = false;

  @override
  void initState() {
    super.initState();
    _pullToRefresh = PullToRefreshController(
      settings: PullToRefreshSettings(color: const Color(0xFF1F6FEB)),
      onRefresh: () async => _controller?.reload(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: BackButton(onPressed: () => Navigator.of(context).pop()),
      ),
      body: SafeArea(
        child: Stack(
          children: [
            InAppWebView(
              initialUrlRequest: URLRequest(url: WebUri(widget.url)),
              initialSettings: InAppWebViewSettings(
                javaScriptEnabled: true,
                useShouldOverrideUrlLoading: false,
                mediaPlaybackRequiresUserGesture: false,
                allowsInlineMediaPlayback: true,
                supportZoom: false,
                transparentBackground: true,
              ),
              pullToRefreshController: _pullToRefresh,
              onWebViewCreated: (controller) => _controller = controller,
              onLoadStop: (controller, url) async {
                _pullToRefresh?.endRefreshing();
                if (!_firstLoadComplete && mounted) {
                  setState(() => _firstLoadComplete = true);
                }
              },
              onReceivedError: (controller, request, error) {
                _pullToRefresh?.endRefreshing();
              },
            ),
            if (!_firstLoadComplete) const _SplashOverlay(),
          ],
        ),
      ),
    );
  }
}

/// Full-screen WebView host with splash overlay + pull-to-refresh.
class WebShellScreen extends StatefulWidget {
  const WebShellScreen({super.key});

  @override
  State<WebShellScreen> createState() => _WebShellScreenState();
}

class _WebShellScreenState extends State<WebShellScreen> {
  InAppWebViewController? _controller;
  NativeBridge? _bridge;
  PullToRefreshController? _pullToRefresh;
  bool _firstLoadComplete = false;

  @override
  void initState() {
    super.initState();
    _pullToRefresh = PullToRefreshController(
      settings: PullToRefreshSettings(color: const Color(0xFF1F6FEB)),
      onRefresh: () async => _controller?.reload(),
    );
  }

  @override
  void dispose() {
    _bridge?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Stack(
          children: [
            InAppWebView(
              initialUrlRequest: URLRequest(url: WebUri(_kWebviewUrl)),
              initialSettings: InAppWebViewSettings(
                javaScriptEnabled: true,
                useShouldOverrideUrlLoading: false,
                mediaPlaybackRequiresUserGesture: false,
                allowsInlineMediaPlayback: true,
                supportZoom: false,
                transparentBackground: true,
              ),
              pullToRefreshController: _pullToRefresh,
              onWebViewCreated: (controller) {
                _controller = controller;
                _bridge = NativeBridge(controller)..register();
              },
              onLoadStop: (controller, url) async {
                _pullToRefresh?.endRefreshing();
                await controller.evaluateJavascript(
                  source: await bridgeInjectionScript(),
                );
                if (!_firstLoadComplete && mounted) {
                  setState(() => _firstLoadComplete = true);
                }
              },
              onReceivedError: (controller, request, error) {
                _pullToRefresh?.endRefreshing();
              },
            ),
            if (!_firstLoadComplete) const _SplashOverlay(),
          ],
        ),
      ),
    );
  }
}

class _SplashOverlay extends StatelessWidget {
  const _SplashOverlay();

  @override
  Widget build(BuildContext context) {
    return const ColoredBox(
      color: Colors.white,
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(
              width: 48,
              height: 48,
              child: CircularProgressIndicator(strokeWidth: 3),
            ),
            SizedBox(height: 16),
            Text('근무 관리', style: TextStyle(fontSize: 16)),
          ],
        ),
      ),
    );
  }
}
