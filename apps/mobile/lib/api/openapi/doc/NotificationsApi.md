# wm_api.api.NotificationsApi

## Load the API package
```dart
import 'package:wm_api/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**notificationsDevicesCreate**](NotificationsApi.md#notificationsdevicescreate) | **POST** /v1/notifications/devices | 
[**notificationsDevicesDestroy**](NotificationsApi.md#notificationsdevicesdestroy) | **DELETE** /v1/notifications/devices/{device_id} | 
[**notificationsReadAllCreate**](NotificationsApi.md#notificationsreadallcreate) | **POST** /v1/notifications/read-all | 
[**notificationsReadCreate**](NotificationsApi.md#notificationsreadcreate) | **POST** /v1/notifications/{log_id}/read | 
[**notificationsRetrieve**](NotificationsApi.md#notificationsretrieve) | **GET** /v1/notifications | 
[**notificationsVapidPublicKeyRetrieve**](NotificationsApi.md#notificationsvapidpublickeyretrieve) | **GET** /v1/notifications/vapid-public-key | 


# **notificationsDevicesCreate**
> notificationsDevicesCreate()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getNotificationsApi();

try {
    api.notificationsDevicesCreate();
} on DioException catch (e) {
    print('Exception when calling NotificationsApi->notificationsDevicesCreate: $e\n');
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

# **notificationsDevicesDestroy**
> notificationsDevicesDestroy(deviceId)



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getNotificationsApi();
final String deviceId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    api.notificationsDevicesDestroy(deviceId);
} on DioException catch (e) {
    print('Exception when calling NotificationsApi->notificationsDevicesDestroy: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **deviceId** | **String**|  | 

### Return type

void (empty response body)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **notificationsReadAllCreate**
> notificationsReadAllCreate()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getNotificationsApi();

try {
    api.notificationsReadAllCreate();
} on DioException catch (e) {
    print('Exception when calling NotificationsApi->notificationsReadAllCreate: $e\n');
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

# **notificationsReadCreate**
> notificationsReadCreate(logId)



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getNotificationsApi();
final String logId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    api.notificationsReadCreate(logId);
} on DioException catch (e) {
    print('Exception when calling NotificationsApi->notificationsReadCreate: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **logId** | **String**|  | 

### Return type

void (empty response body)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **notificationsRetrieve**
> notificationsRetrieve()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getNotificationsApi();

try {
    api.notificationsRetrieve();
} on DioException catch (e) {
    print('Exception when calling NotificationsApi->notificationsRetrieve: $e\n');
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

# **notificationsVapidPublicKeyRetrieve**
> notificationsVapidPublicKeyRetrieve()



Return the active VAPID public key for FE Web Push subscription.  Public on purpose: it's the same key embedded in static FE bundles via ``VITE_VAPID_PUBLIC_KEY``. Exposing the runtime endpoint lets ops rotate the key without rebuilding FE artefacts.

### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getNotificationsApi();

try {
    api.notificationsVapidPublicKeyRetrieve();
} on DioException catch (e) {
    print('Exception when calling NotificationsApi->notificationsVapidPublicKeyRetrieve: $e\n');
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

