# wm_api.api.NoticesApi

## Load the API package
```dart
import 'package:wm_api/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**noticesArchiveCreate**](NoticesApi.md#noticesarchivecreate) | **POST** /v1/notices/{notice_id}/archive | 
[**noticesCreate**](NoticesApi.md#noticescreate) | **POST** /v1/notices | 
[**noticesPartialUpdate**](NoticesApi.md#noticespartialupdate) | **PATCH** /v1/notices/{notice_id} | 
[**noticesRetrieve**](NoticesApi.md#noticesretrieve) | **GET** /v1/notices | 
[**noticesRetrieve2**](NoticesApi.md#noticesretrieve2) | **GET** /v1/notices/{notice_id} | 


# **noticesArchiveCreate**
> noticesArchiveCreate(noticeId)



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getNoticesApi();
final String noticeId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    api.noticesArchiveCreate(noticeId);
} catch on DioException (e) {
    print('Exception when calling NoticesApi->noticesArchiveCreate: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **noticeId** | **String**|  | 

### Return type

void (empty response body)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **noticesCreate**
> noticesCreate()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getNoticesApi();

try {
    api.noticesCreate();
} catch on DioException (e) {
    print('Exception when calling NoticesApi->noticesCreate: $e\n');
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

# **noticesPartialUpdate**
> noticesPartialUpdate(noticeId)



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getNoticesApi();
final String noticeId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    api.noticesPartialUpdate(noticeId);
} catch on DioException (e) {
    print('Exception when calling NoticesApi->noticesPartialUpdate: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **noticeId** | **String**|  | 

### Return type

void (empty response body)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **noticesRetrieve**
> noticesRetrieve()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getNoticesApi();

try {
    api.noticesRetrieve();
} catch on DioException (e) {
    print('Exception when calling NoticesApi->noticesRetrieve: $e\n');
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

# **noticesRetrieve2**
> noticesRetrieve2(noticeId)



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getNoticesApi();
final String noticeId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    api.noticesRetrieve2(noticeId);
} catch on DioException (e) {
    print('Exception when calling NoticesApi->noticesRetrieve2: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **noticeId** | **String**|  | 

### Return type

void (empty response body)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

