# wm_api.api.LeaveApi

## Load the API package
```dart
import 'package:wm_api/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**leaveBalanceRetrieve**](LeaveApi.md#leavebalanceretrieve) | **GET** /v1/leave/balance | 
[**leavePolicyRetrieve**](LeaveApi.md#leavepolicyretrieve) | **GET** /v1/leave/policy | 
[**leaveRequestsCancelCreate**](LeaveApi.md#leaverequestscancelcreate) | **POST** /v1/leave/requests/{request_id}/cancel | 
[**leaveRequestsCreate**](LeaveApi.md#leaverequestscreate) | **POST** /v1/leave/requests | 
[**leaveRequestsRetrieve**](LeaveApi.md#leaverequestsretrieve) | **GET** /v1/leave/requests | 
[**leaveRequestsRetrieve2**](LeaveApi.md#leaverequestsretrieve2) | **GET** /v1/leave/requests/{request_id} | 
[**leaveTeamCalendarRetrieve**](LeaveApi.md#leaveteamcalendarretrieve) | **GET** /v1/leave/team-calendar | 


# **leaveBalanceRetrieve**
> leaveBalanceRetrieve()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getLeaveApi();

try {
    api.leaveBalanceRetrieve();
} catch on DioException (e) {
    print('Exception when calling LeaveApi->leaveBalanceRetrieve: $e\n');
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

# **leavePolicyRetrieve**
> leavePolicyRetrieve()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getLeaveApi();

try {
    api.leavePolicyRetrieve();
} catch on DioException (e) {
    print('Exception when calling LeaveApi->leavePolicyRetrieve: $e\n');
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

# **leaveRequestsCancelCreate**
> leaveRequestsCancelCreate(requestId)



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getLeaveApi();
final String requestId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    api.leaveRequestsCancelCreate(requestId);
} catch on DioException (e) {
    print('Exception when calling LeaveApi->leaveRequestsCancelCreate: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **requestId** | **String**|  | 

### Return type

void (empty response body)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **leaveRequestsCreate**
> leaveRequestsCreate()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getLeaveApi();

try {
    api.leaveRequestsCreate();
} catch on DioException (e) {
    print('Exception when calling LeaveApi->leaveRequestsCreate: $e\n');
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

# **leaveRequestsRetrieve**
> leaveRequestsRetrieve()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getLeaveApi();

try {
    api.leaveRequestsRetrieve();
} catch on DioException (e) {
    print('Exception when calling LeaveApi->leaveRequestsRetrieve: $e\n');
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

# **leaveRequestsRetrieve2**
> leaveRequestsRetrieve2(requestId)



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getLeaveApi();
final String requestId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    api.leaveRequestsRetrieve2(requestId);
} catch on DioException (e) {
    print('Exception when calling LeaveApi->leaveRequestsRetrieve2: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **requestId** | **String**|  | 

### Return type

void (empty response body)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **leaveTeamCalendarRetrieve**
> leaveTeamCalendarRetrieve()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getLeaveApi();

try {
    api.leaveTeamCalendarRetrieve();
} catch on DioException (e) {
    print('Exception when calling LeaveApi->leaveTeamCalendarRetrieve: $e\n');
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

