# wm_api.api.AttendanceApi

## Load the API package
```dart
import 'package:wm_api/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**attendanceBreakEndCreate**](AttendanceApi.md#attendancebreakendcreate) | **POST** /v1/attendance/break/end | 
[**attendanceBreakStartCreate**](AttendanceApi.md#attendancebreakstartcreate) | **POST** /v1/attendance/break/start | 
[**attendanceClockInCreate**](AttendanceApi.md#attendanceclockincreate) | **POST** /v1/attendance/clock-in | 
[**attendanceClockOutCreate**](AttendanceApi.md#attendanceclockoutcreate) | **POST** /v1/attendance/clock-out | 
[**attendanceManualRequestCreate**](AttendanceApi.md#attendancemanualrequestcreate) | **POST** /v1/attendance/manual-request | 
[**attendanceRecordsRetrieve**](AttendanceApi.md#attendancerecordsretrieve) | **GET** /v1/attendance/records | 
[**attendanceRecordsRetrieve2**](AttendanceApi.md#attendancerecordsretrieve2) | **GET** /v1/attendance/records/{id} | 
[**attendanceTodayRetrieve**](AttendanceApi.md#attendancetodayretrieve) | **GET** /v1/attendance/today | 


# **attendanceBreakEndCreate**
> attendanceBreakEndCreate()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getAttendanceApi();

try {
    api.attendanceBreakEndCreate();
} on DioException catch (e) {
    print('Exception when calling AttendanceApi->attendanceBreakEndCreate: $e\n');
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

# **attendanceBreakStartCreate**
> attendanceBreakStartCreate()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getAttendanceApi();

try {
    api.attendanceBreakStartCreate();
} on DioException catch (e) {
    print('Exception when calling AttendanceApi->attendanceBreakStartCreate: $e\n');
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

# **attendanceClockInCreate**
> attendanceClockInCreate()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getAttendanceApi();

try {
    api.attendanceClockInCreate();
} on DioException catch (e) {
    print('Exception when calling AttendanceApi->attendanceClockInCreate: $e\n');
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

# **attendanceClockOutCreate**
> attendanceClockOutCreate()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getAttendanceApi();

try {
    api.attendanceClockOutCreate();
} on DioException catch (e) {
    print('Exception when calling AttendanceApi->attendanceClockOutCreate: $e\n');
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

# **attendanceManualRequestCreate**
> attendanceManualRequestCreate()



Create a :class:`ManualClockInRequest` + matching :class:`ApprovalTask`.  Spec §3.4 — the actual :class:`AttendanceRecord` is only materialized once an approver decides; on APPROVE the approval domain calls :func:`apps.attendance.services.materialize_manual_clock_in` using this persisted payload. Both rows are written in one transaction so the task can never reference a missing target_id.

### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getAttendanceApi();

try {
    api.attendanceManualRequestCreate();
} on DioException catch (e) {
    print('Exception when calling AttendanceApi->attendanceManualRequestCreate: $e\n');
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

# **attendanceRecordsRetrieve**
> attendanceRecordsRetrieve()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getAttendanceApi();

try {
    api.attendanceRecordsRetrieve();
} on DioException catch (e) {
    print('Exception when calling AttendanceApi->attendanceRecordsRetrieve: $e\n');
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

# **attendanceRecordsRetrieve2**
> attendanceRecordsRetrieve2(id)



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getAttendanceApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    api.attendanceRecordsRetrieve2(id);
} on DioException catch (e) {
    print('Exception when calling AttendanceApi->attendanceRecordsRetrieve2: $e\n');
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

# **attendanceTodayRetrieve**
> attendanceTodayRetrieve()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getAttendanceApi();

try {
    api.attendanceTodayRetrieve();
} on DioException catch (e) {
    print('Exception when calling AttendanceApi->attendanceTodayRetrieve: $e\n');
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

