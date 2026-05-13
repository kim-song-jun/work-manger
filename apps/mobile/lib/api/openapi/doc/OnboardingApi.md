# wm_api.api.OnboardingApi

## Load the API package
```dart
import 'package:wm_api/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**onboardingCompleteCreate**](OnboardingApi.md#onboardingcompletecreate) | **POST** /v1/onboarding/complete | 
[**onboardingJoinCompanyCreate**](OnboardingApi.md#onboardingjoincompanycreate) | **POST** /v1/onboarding/join-company | 
[**onboardingLocationsCreate**](OnboardingApi.md#onboardinglocationscreate) | **POST** /v1/onboarding/locations | 
[**onboardingLocationsRetrieve**](OnboardingApi.md#onboardinglocationsretrieve) | **GET** /v1/onboarding/locations | 
[**onboardingNotificationsPartialUpdate**](OnboardingApi.md#onboardingnotificationspartialupdate) | **PATCH** /v1/onboarding/notifications | 
[**onboardingProfilePartialUpdate**](OnboardingApi.md#onboardingprofilepartialupdate) | **PATCH** /v1/onboarding/profile | 
[**onboardingSchedulePartialUpdate**](OnboardingApi.md#onboardingschedulepartialupdate) | **PATCH** /v1/onboarding/schedule | 


# **onboardingCompleteCreate**
> onboardingCompleteCreate()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getOnboardingApi();

try {
    api.onboardingCompleteCreate();
} on DioException catch (e) {
    print('Exception when calling OnboardingApi->onboardingCompleteCreate: $e\n');
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

# **onboardingJoinCompanyCreate**
> onboardingJoinCompanyCreate()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getOnboardingApi();

try {
    api.onboardingJoinCompanyCreate();
} on DioException catch (e) {
    print('Exception when calling OnboardingApi->onboardingJoinCompanyCreate: $e\n');
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

# **onboardingLocationsCreate**
> onboardingLocationsCreate()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getOnboardingApi();

try {
    api.onboardingLocationsCreate();
} on DioException catch (e) {
    print('Exception when calling OnboardingApi->onboardingLocationsCreate: $e\n');
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

# **onboardingLocationsRetrieve**
> onboardingLocationsRetrieve()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getOnboardingApi();

try {
    api.onboardingLocationsRetrieve();
} on DioException catch (e) {
    print('Exception when calling OnboardingApi->onboardingLocationsRetrieve: $e\n');
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

# **onboardingNotificationsPartialUpdate**
> onboardingNotificationsPartialUpdate()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getOnboardingApi();

try {
    api.onboardingNotificationsPartialUpdate();
} on DioException catch (e) {
    print('Exception when calling OnboardingApi->onboardingNotificationsPartialUpdate: $e\n');
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

# **onboardingProfilePartialUpdate**
> onboardingProfilePartialUpdate()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getOnboardingApi();

try {
    api.onboardingProfilePartialUpdate();
} on DioException catch (e) {
    print('Exception when calling OnboardingApi->onboardingProfilePartialUpdate: $e\n');
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

# **onboardingSchedulePartialUpdate**
> onboardingSchedulePartialUpdate()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getOnboardingApi();

try {
    api.onboardingSchedulePartialUpdate();
} on DioException catch (e) {
    print('Exception when calling OnboardingApi->onboardingSchedulePartialUpdate: $e\n');
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

