# wm_api.api.InboxApi

## Load the API package
```dart
import 'package:wm_api/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**inboxApproveCreate**](InboxApi.md#inboxapprovecreate) | **POST** /v1/inbox/{task_id}/approve | 
[**inboxRejectCreate**](InboxApi.md#inboxrejectcreate) | **POST** /v1/inbox/{task_id}/reject | 
[**inboxRetrieve**](InboxApi.md#inboxretrieve) | **GET** /v1/inbox | 


# **inboxApproveCreate**
> inboxApproveCreate(taskId)



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getInboxApi();
final String taskId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    api.inboxApproveCreate(taskId);
} on DioException catch (e) {
    print('Exception when calling InboxApi->inboxApproveCreate: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **taskId** | **String**|  | 

### Return type

void (empty response body)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **inboxRejectCreate**
> inboxRejectCreate(taskId)



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getInboxApi();
final String taskId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    api.inboxRejectCreate(taskId);
} on DioException catch (e) {
    print('Exception when calling InboxApi->inboxRejectCreate: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **taskId** | **String**|  | 

### Return type

void (empty response body)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **inboxRetrieve**
> inboxRetrieve()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getInboxApi();

try {
    api.inboxRetrieve();
} on DioException catch (e) {
    print('Exception when calling InboxApi->inboxRetrieve: $e\n');
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

