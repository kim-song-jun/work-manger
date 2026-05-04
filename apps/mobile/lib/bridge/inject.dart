/// JS shim for `window.NativeBridge`. Injected on every onLoadStop so the
/// bridge survives SPA route changes / soft reloads. Methods return Promises
/// resolving to the same shapes as the Dart handlers in `native_bridge.dart`.
Future<String> bridgeInjectionScript() async {
  return r'''
(function () {
  if (window.NativeBridge && window.NativeBridge.__installed) return;
  function call(name, args) {
    args = args || [];
    if (!window.flutter_inappwebview ||
        typeof window.flutter_inappwebview.callHandler !== 'function') {
      return Promise.reject({ error: 'BRIDGE_UNAVAILABLE' });
    }
    return window.flutter_inappwebview.callHandler(name, ...args);
  }
  window.NativeBridge = {
    __installed: true,
    requestLocation: function () { return call('requestLocation'); },
    watchLocation:   function () { return call('watchLocation'); },
    stopWatching:    function () { return call('stopWatching'); },
    registerDeviceToken: function () { return call('registerDeviceToken'); },
    haptic: function (intensity) { return call('haptic', [intensity || 'light']); },
    share:  function (payload)   { return call('share', [payload || {}]); },
    appInfo: function () { return call('appInfo'); },
    // ---- Home-screen widgets (iOS WidgetKit / Android Glance) -------------
    pushTodayStatus: function (payload) {
      return call('pushTodayStatus', [payload || {}]);
    },
    reloadWidgets: function () { return call('reloadWidgets'); },
    // ---- Geofencing (registered after /v1/onboarding/locations) -----------
    registerGeofences: function (items) {
      return call('registerGeofences', [items || []]);
    }
  };
  // Notify SPA that the bridge is ready (in case it boots before us).
  try {
    window.dispatchEvent(new Event('wm:bridgeready'));
  } catch (_) { /* noop */ }
})();
''';
}
