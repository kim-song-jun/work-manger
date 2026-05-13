# wm_api.api.AuthApi

## Load the API package
```dart
import 'package:wm_api/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**auth2faChallengeCreate**](AuthApi.md#auth2fachallengecreate) | **POST** /v1/auth/2fa/challenge | 
[**auth2faDisableCreate**](AuthApi.md#auth2fadisablecreate) | **POST** /v1/auth/2fa/disable | 
[**auth2faEnableCreate**](AuthApi.md#auth2faenablecreate) | **POST** /v1/auth/2fa/enable | 
[**auth2faVerifyCreate**](AuthApi.md#auth2faverifycreate) | **POST** /v1/auth/2fa/verify | 
[**authEmailResendCreate**](AuthApi.md#authemailresendcreate) | **POST** /v1/auth/email/resend | 
[**authEmailVerifyCreate**](AuthApi.md#authemailverifycreate) | **POST** /v1/auth/email/verify | 
[**authLoginCreate**](AuthApi.md#authlogincreate) | **POST** /v1/auth/login | 
[**authLogoutCreate**](AuthApi.md#authlogoutcreate) | **POST** /v1/auth/logout | 
[**authOauthCallbackRetrieve**](AuthApi.md#authoauthcallbackretrieve) | **GET** /v1/auth/oauth/{provider}/callback | 
[**authPasswordChangeCreate**](AuthApi.md#authpasswordchangecreate) | **POST** /v1/auth/password/change | 
[**authPasswordForgotCreate**](AuthApi.md#authpasswordforgotcreate) | **POST** /v1/auth/password/forgot | 
[**authPasswordResetCreate**](AuthApi.md#authpasswordresetcreate) | **POST** /v1/auth/password/reset | 
[**authRefreshCreate**](AuthApi.md#authrefreshcreate) | **POST** /v1/auth/refresh | 
[**authSignupCreate**](AuthApi.md#authsignupcreate) | **POST** /v1/auth/signup | 


# **auth2faChallengeCreate**
> auth2faChallengeCreate()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getAuthApi();

try {
    api.auth2faChallengeCreate();
} on DioException catch (e) {
    print('Exception when calling AuthApi->auth2faChallengeCreate: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

void (empty response body)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **auth2faDisableCreate**
> auth2faDisableCreate()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getAuthApi();

try {
    api.auth2faDisableCreate();
} on DioException catch (e) {
    print('Exception when calling AuthApi->auth2faDisableCreate: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

void (empty response body)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **auth2faEnableCreate**
> auth2faEnableCreate()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getAuthApi();

try {
    api.auth2faEnableCreate();
} on DioException catch (e) {
    print('Exception when calling AuthApi->auth2faEnableCreate: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

void (empty response body)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **auth2faVerifyCreate**
> auth2faVerifyCreate()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getAuthApi();

try {
    api.auth2faVerifyCreate();
} on DioException catch (e) {
    print('Exception when calling AuthApi->auth2faVerifyCreate: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

void (empty response body)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authEmailResendCreate**
> authEmailResendCreate()



Re-issue an email-verification link; ALWAYS returns 200 (no enumeration).  If the email matches an unverified user we enqueue an EMAIL row in the notification outbox. Verified or unknown emails silently no-op.

### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getAuthApi();

try {
    api.authEmailResendCreate();
} on DioException catch (e) {
    print('Exception when calling AuthApi->authEmailResendCreate: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

void (empty response body)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authEmailVerifyCreate**
> authEmailVerifyCreate()



Validate an email-verification token and flip ``is_email_verified``.  Errors map to the standard envelope:   - 400 EMAIL_VERIFY_INVALID: bad/expired signature or unknown user   - 409 EMAIL_ALREADY_VERIFIED: idempotent re-use after success

### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getAuthApi();

try {
    api.authEmailVerifyCreate();
} on DioException catch (e) {
    print('Exception when calling AuthApi->authEmailVerifyCreate: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

void (empty response body)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authLoginCreate**
> authLoginCreate()



Lockout-aware login. Emits audit on success/failure.  If TOTP enabled, returns a short-lived ``two_fa_token`` instead of an access pair — client must call /v1/auth/2fa/challenge to exchange.

### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getAuthApi();

try {
    api.authLoginCreate();
} on DioException catch (e) {
    print('Exception when calling AuthApi->authLoginCreate: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

void (empty response body)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authLogoutCreate**
> authLogoutCreate()



Blacklist the supplied refresh token. Emits ``auth.logout``.

### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getAuthApi();

try {
    api.authLogoutCreate();
} on DioException catch (e) {
    print('Exception when calling AuthApi->authLogoutCreate: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

void (empty response body)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authOauthCallbackRetrieve**
> authOauthCallbackRetrieve(provider)



Complete OAuth and respond with login tokens (or a 2FA challenge).

### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getAuthApi();
final String provider = provider_example; // String | 

try {
    api.authOauthCallbackRetrieve(provider);
} on DioException catch (e) {
    print('Exception when calling AuthApi->authOauthCallbackRetrieve: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **provider** | **String**|  | 

### Return type

void (empty response body)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authPasswordChangeCreate**
> authPasswordChangeCreate()



Validate old password, apply new (with django validators), blacklist all refresh.

### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getAuthApi();

try {
    api.authPasswordChangeCreate();
} on DioException catch (e) {
    print('Exception when calling AuthApi->authPasswordChangeCreate: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

void (empty response body)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authPasswordForgotCreate**
> authPasswordForgotCreate()



Trigger a password-reset email; ALWAYS returns 200 (no enumeration).

### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getAuthApi();

try {
    api.authPasswordForgotCreate();
} on DioException catch (e) {
    print('Exception when calling AuthApi->authPasswordForgotCreate: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

void (empty response body)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authPasswordResetCreate**
> authPasswordResetCreate()



Consume a reset token + apply the new password.  On success: blacklists every refresh token, clears the lockout counter, and emits ``auth.password.reset_completed``.

### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getAuthApi();

try {
    api.authPasswordResetCreate();
} on DioException catch (e) {
    print('Exception when calling AuthApi->authPasswordResetCreate: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

void (empty response body)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authRefreshCreate**
> authRefreshCreate()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getAuthApi();

try {
    api.authRefreshCreate();
} on DioException catch (e) {
    print('Exception when calling AuthApi->authRefreshCreate: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

void (empty response body)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authSignupCreate**
> authSignupCreate()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getAuthApi();

try {
    api.authSignupCreate();
} on DioException catch (e) {
    print('Exception when calling AuthApi->authSignupCreate: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

void (empty response body)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

