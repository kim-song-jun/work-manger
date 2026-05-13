//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

import 'package:dio/dio.dart';
import 'package:built_value/serializer.dart';
import 'package:wm_api/src/serializers.dart';
import 'package:wm_api/src/auth/api_key_auth.dart';
import 'package:wm_api/src/auth/basic_auth.dart';
import 'package:wm_api/src/auth/bearer_auth.dart';
import 'package:wm_api/src/auth/oauth.dart';
import 'package:wm_api/src/api/admin_api.dart';
import 'package:wm_api/src/api/admin_approvals_api.dart';
import 'package:wm_api/src/api/admin_leave_api.dart';
import 'package:wm_api/src/api/admin_settings_api.dart';
import 'package:wm_api/src/api/attendance_api.dart';
import 'package:wm_api/src/api/attendance_stats_api.dart';
import 'package:wm_api/src/api/auth_api.dart';
import 'package:wm_api/src/api/billing_api.dart';
import 'package:wm_api/src/api/compliance_api.dart';
import 'package:wm_api/src/api/dev_api.dart';
import 'package:wm_api/src/api/inbox_api.dart';
import 'package:wm_api/src/api/leave_api.dart';
import 'package:wm_api/src/api/me_api.dart';
import 'package:wm_api/src/api/notices_api.dart';
import 'package:wm_api/src/api/notifications_api.dart';
import 'package:wm_api/src/api/onboarding_api.dart';
import 'package:wm_api/src/api/overtime_api.dart';
import 'package:wm_api/src/api/team_api.dart';
import 'package:wm_api/src/api/trip_api.dart';

class WmApi {
  static const String basePath = r'http://localhost';

  final Dio dio;
  final Serializers serializers;

  WmApi({
    Dio? dio,
    Serializers? serializers,
    String? basePathOverride,
    List<Interceptor>? interceptors,
  })  : this.serializers = serializers ?? standardSerializers,
        this.dio = dio ??
            Dio(BaseOptions(
              baseUrl: basePathOverride ?? basePath,
              connectTimeout: const Duration(milliseconds: 5000),
              receiveTimeout: const Duration(milliseconds: 3000),
            )) {
    if (interceptors == null) {
      this.dio.interceptors.addAll([
        OAuthInterceptor(),
        BasicAuthInterceptor(),
        BearerAuthInterceptor(),
        ApiKeyAuthInterceptor(),
      ]);
    } else {
      this.dio.interceptors.addAll(interceptors);
    }
  }

  void setOAuthToken(String name, String token) {
    if (this.dio.interceptors.any((i) => i is OAuthInterceptor)) {
      (this.dio.interceptors.firstWhere((i) => i is OAuthInterceptor) as OAuthInterceptor).tokens[name] = token;
    }
  }

  /// Removes the OAuth token associated with the given [name].
  ///
  /// If no [OAuthInterceptor] is registered or no token exists for the given
  /// [name], this method has no effect.
  void removeOAuthToken(String name) {
    if (this.dio.interceptors.any((i) => i is OAuthInterceptor)) {
      (this.dio.interceptors.firstWhere((i) => i is OAuthInterceptor) as OAuthInterceptor).tokens.remove(name);
    }
  }

  void setBearerAuth(String name, String token) {
    if (this.dio.interceptors.any((i) => i is BearerAuthInterceptor)) {
      (this.dio.interceptors.firstWhere((i) => i is BearerAuthInterceptor) as BearerAuthInterceptor).tokens[name] = token;
    }
  }

  /// Removes the bearer authentication token associated with the given [name].
  ///
  /// If no [BearerAuthInterceptor] is registered or no token exists for the
  /// given [name], this method has no effect.
  void removeBearerAuth(String name) {
    if (this.dio.interceptors.any((i) => i is BearerAuthInterceptor)) {
      (this.dio.interceptors.firstWhere((i) => i is BearerAuthInterceptor) as BearerAuthInterceptor).tokens.remove(name);
    }
  }

  void setBasicAuth(String name, String username, String password) {
    if (this.dio.interceptors.any((i) => i is BasicAuthInterceptor)) {
      (this.dio.interceptors.firstWhere((i) => i is BasicAuthInterceptor) as BasicAuthInterceptor).authInfo[name] = BasicAuthInfo(username, password);
    }
  }

  /// Removes the basic authentication credentials associated with the given [name].
  ///
  /// If no [BasicAuthInterceptor] is registered or no credentials exist for the
  /// given [name], this method has no effect.
  void removeBasicAuth(String name) {
    if (this.dio.interceptors.any((i) => i is BasicAuthInterceptor)) {
      (this.dio.interceptors.firstWhere((i) => i is BasicAuthInterceptor) as BasicAuthInterceptor).authInfo.remove(name);
    }
  }

  void setApiKey(String name, String apiKey) {
    if (this.dio.interceptors.any((i) => i is ApiKeyAuthInterceptor)) {
      (this.dio.interceptors.firstWhere((element) => element is ApiKeyAuthInterceptor) as ApiKeyAuthInterceptor).apiKeys[name] = apiKey;
    }
  }

  /// Removes the API key associated with the given [name].
  ///
  /// If no [ApiKeyAuthInterceptor] is registered or no API key exists for the
  /// given [name], this method has no effect.
  void removeApiKey(String name) {
    if (this.dio.interceptors.any((i) => i is ApiKeyAuthInterceptor)) {
      (this.dio.interceptors.firstWhere((element) => element is ApiKeyAuthInterceptor) as ApiKeyAuthInterceptor).apiKeys.remove(name);
    }
  }

  /// Get AdminApi instance, base route and serializer can be overridden by a given but be careful,
  /// by doing that all interceptors will not be executed
  AdminApi getAdminApi() {
    return AdminApi(dio, serializers);
  }

  /// Get AdminApprovalsApi instance, base route and serializer can be overridden by a given but be careful,
  /// by doing that all interceptors will not be executed
  AdminApprovalsApi getAdminApprovalsApi() {
    return AdminApprovalsApi(dio, serializers);
  }

  /// Get AdminLeaveApi instance, base route and serializer can be overridden by a given but be careful,
  /// by doing that all interceptors will not be executed
  AdminLeaveApi getAdminLeaveApi() {
    return AdminLeaveApi(dio, serializers);
  }

  /// Get AdminSettingsApi instance, base route and serializer can be overridden by a given but be careful,
  /// by doing that all interceptors will not be executed
  AdminSettingsApi getAdminSettingsApi() {
    return AdminSettingsApi(dio, serializers);
  }

  /// Get AttendanceApi instance, base route and serializer can be overridden by a given but be careful,
  /// by doing that all interceptors will not be executed
  AttendanceApi getAttendanceApi() {
    return AttendanceApi(dio, serializers);
  }

  /// Get AttendanceStatsApi instance, base route and serializer can be overridden by a given but be careful,
  /// by doing that all interceptors will not be executed
  AttendanceStatsApi getAttendanceStatsApi() {
    return AttendanceStatsApi(dio, serializers);
  }

  /// Get AuthApi instance, base route and serializer can be overridden by a given but be careful,
  /// by doing that all interceptors will not be executed
  AuthApi getAuthApi() {
    return AuthApi(dio, serializers);
  }

  /// Get BillingApi instance, base route and serializer can be overridden by a given but be careful,
  /// by doing that all interceptors will not be executed
  BillingApi getBillingApi() {
    return BillingApi(dio, serializers);
  }

  /// Get ComplianceApi instance, base route and serializer can be overridden by a given but be careful,
  /// by doing that all interceptors will not be executed
  ComplianceApi getComplianceApi() {
    return ComplianceApi(dio, serializers);
  }

  /// Get DevApi instance, base route and serializer can be overridden by a given but be careful,
  /// by doing that all interceptors will not be executed
  DevApi getDevApi() {
    return DevApi(dio, serializers);
  }

  /// Get InboxApi instance, base route and serializer can be overridden by a given but be careful,
  /// by doing that all interceptors will not be executed
  InboxApi getInboxApi() {
    return InboxApi(dio, serializers);
  }

  /// Get LeaveApi instance, base route and serializer can be overridden by a given but be careful,
  /// by doing that all interceptors will not be executed
  LeaveApi getLeaveApi() {
    return LeaveApi(dio, serializers);
  }

  /// Get MeApi instance, base route and serializer can be overridden by a given but be careful,
  /// by doing that all interceptors will not be executed
  MeApi getMeApi() {
    return MeApi(dio, serializers);
  }

  /// Get NoticesApi instance, base route and serializer can be overridden by a given but be careful,
  /// by doing that all interceptors will not be executed
  NoticesApi getNoticesApi() {
    return NoticesApi(dio, serializers);
  }

  /// Get NotificationsApi instance, base route and serializer can be overridden by a given but be careful,
  /// by doing that all interceptors will not be executed
  NotificationsApi getNotificationsApi() {
    return NotificationsApi(dio, serializers);
  }

  /// Get OnboardingApi instance, base route and serializer can be overridden by a given but be careful,
  /// by doing that all interceptors will not be executed
  OnboardingApi getOnboardingApi() {
    return OnboardingApi(dio, serializers);
  }

  /// Get OvertimeApi instance, base route and serializer can be overridden by a given but be careful,
  /// by doing that all interceptors will not be executed
  OvertimeApi getOvertimeApi() {
    return OvertimeApi(dio, serializers);
  }

  /// Get TeamApi instance, base route and serializer can be overridden by a given but be careful,
  /// by doing that all interceptors will not be executed
  TeamApi getTeamApi() {
    return TeamApi(dio, serializers);
  }

  /// Get TripApi instance, base route and serializer can be overridden by a given but be careful,
  /// by doing that all interceptors will not be executed
  TripApi getTripApi() {
    return TripApi(dio, serializers);
  }
}
