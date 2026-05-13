# wm_api.api.OvertimeApi

## Load the API package
```dart
import 'package:wm_api/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**overtimeHistoryRetrieve**](OvertimeApi.md#overtimehistoryretrieve) | **GET** /v1/overtime/history | 
[**overtimeRequestsCancelCreate**](OvertimeApi.md#overtimerequestscancelcreate) | **POST** /v1/overtime/requests/{id}/cancel | 
[**overtimeRequestsCreate**](OvertimeApi.md#overtimerequestscreate) | **POST** /v1/overtime/requests | 
[**overtimeRequestsRetrieve**](OvertimeApi.md#overtimerequestsretrieve) | **GET** /v1/overtime/requests | 
[**overtimeRequestsRetrieve2**](OvertimeApi.md#overtimerequestsretrieve2) | **GET** /v1/overtime/requests/{id} | 
[**overtimeSettingsPartialUpdate**](OvertimeApi.md#overtimesettingspartialupdate) | **PATCH** /v1/overtime/settings | 
[**overtimeSettingsRetrieve**](OvertimeApi.md#overtimesettingsretrieve) | **GET** /v1/overtime/settings | 


# **overtimeHistoryRetrieve**
> overtimeHistoryRetrieve()



Monthly aggregates for current and past months.

### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getOvertimeApi();

try {
    api.overtimeHistoryRetrieve();
} catch on DioException (e) {
    print('Exception when calling OvertimeApi->overtimeHistoryRetrieve: $e\n');
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

# **overtimeRequestsCancelCreate**
> overtimeRequestsCancelCreate(id)



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getOvertimeApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    api.overtimeRequestsCancelCreate(id);
} catch on DioException (e) {
    print('Exception when calling OvertimeApi->overtimeRequestsCancelCreate: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 

### Return type

void (empty response body)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **overtimeRequestsCreate**
> overtimeRequestsCreate()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getOvertimeApi();

try {
    api.overtimeRequestsCreate();
} catch on DioException (e) {
    print('Exception when calling OvertimeApi->overtimeRequestsCreate: $e\n');
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

# **overtimeRequestsRetrieve**
> overtimeRequestsRetrieve()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getOvertimeApi();

try {
    api.overtimeRequestsRetrieve();
} catch on DioException (e) {
    print('Exception when calling OvertimeApi->overtimeRequestsRetrieve: $e\n');
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

# **overtimeRequestsRetrieve2**
> overtimeRequestsRetrieve2(id)



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getOvertimeApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    api.overtimeRequestsRetrieve2(id);
} catch on DioException (e) {
    print('Exception when calling OvertimeApi->overtimeRequestsRetrieve2: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 

### Return type

void (empty response body)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **overtimeSettingsPartialUpdate**
> overtimeSettingsPartialUpdate()



Stub — auto-request thresholds. Stored on Company in future; static for now.

### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getOvertimeApi();

try {
    api.overtimeSettingsPartialUpdate();
} catch on DioException (e) {
    print('Exception when calling OvertimeApi->overtimeSettingsPartialUpdate: $e\n');
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

# **overtimeSettingsRetrieve**
> overtimeSettingsRetrieve()



Stub — auto-request thresholds. Stored on Company in future; static for now.

### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getOvertimeApi();

try {
    api.overtimeSettingsRetrieve();
} catch on DioException (e) {
    print('Exception when calling OvertimeApi->overtimeSettingsRetrieve: $e\n');
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

