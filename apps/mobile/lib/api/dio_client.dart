import 'dart:async';

import 'package:dio/dio.dart';

import 'jwt_store.dart';

/// Configured Dio with JWT Bearer + silent-refresh interceptor.
///
/// Usage:
///   final dio = await createWMDio(baseUrl: 'https://api.work-manager.molcube.com');
///   final res = await dio.get('/v1/me/settings');
Future<Dio> createWMDio({required String baseUrl, JwtStore? store}) async {
  final dio = Dio(BaseOptions(
    baseUrl: baseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 15),
    headers: {'Content-Type': 'application/json'},
  ),);
  final jwt = store ?? JwtStore();

  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (options, handler) async {
      final access = await jwt.readAccess();
      if (access != null) options.headers['Authorization'] = 'Bearer $access';
      handler.next(options);
    },
    onError: (e, handler) async {
      if (e.response?.statusCode != 401) return handler.next(e);
      final refresh = await jwt.readRefresh();
      if (refresh == null) return handler.next(e);
      // Silent refresh attempt
      try {
        final r = await Dio(BaseOptions(baseUrl: baseUrl)).post(
          '/v1/auth/refresh',
          data: {'refresh': refresh},
        );
        final data = r.data as Map<String, dynamic>;
        final newAccess = data['data']?['access'] as String?;
        if (newAccess == null) return handler.next(e);
        await jwt.write(access: newAccess, refresh: refresh);
        // Retry original request once
        final req = e.requestOptions;
        req.headers['Authorization'] = 'Bearer $newAccess';
        final retry = await dio.fetch(req);
        return handler.resolve(retry);
      } catch (_) {
        return handler.next(e);
      }
    },
  ),);

  return dio;
}
