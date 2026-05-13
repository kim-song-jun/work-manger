# wm_api.api.AttendanceStatsApi

## Load the API package
```dart
import 'package:wm_api/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**attendanceStatsTodayRetrieve**](AttendanceStatsApi.md#attendancestatstodayretrieve) | **GET** /v1/attendance/stats/today | Today&#39;s attendance stats (FE-flat shape)
[**attendanceStatsWeeklyRetrieve**](AttendanceStatsApi.md#attendancestatsweeklyretrieve) | **GET** /v1/attendance/stats/weekly | Weekly attendance aggregate (current ISO week, company tz)


# **attendanceStatsTodayRetrieve**
> TodayStatsResponse attendanceStatsTodayRetrieve()

Today's attendance stats (FE-flat shape)

``GET /v1/attendance/stats/today`` — flat KPI shape for m-home.  Mirrors the contract used by the FE MSW handler: ``work_minutes`` / ``break_minutes`` flat fields plus an ``is_clocked_in`` boolean derived from record status. Returns zeros / nulls when the user has not yet clocked in today.

### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getAttendanceStatsApi();

try {
    final response = api.attendanceStatsTodayRetrieve();
    print(response);
} on DioException catch (e) {
    print('Exception when calling AttendanceStatsApi->attendanceStatsTodayRetrieve: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**TodayStatsResponse**](TodayStatsResponse.md)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **attendanceStatsWeeklyRetrieve**
> WeeklyStatsResponse attendanceStatsWeeklyRetrieve()

Weekly attendance aggregate (current ISO week, company tz)

``GET /v1/attendance/stats/weekly`` — F-EMPLOYEE-012 KPI source.  Returns regular / overtime / break minutes and days worked for the current ISO week (Mon..Sun in the company timezone). Empty weeks return all zeros so the FE can render dashes safely.

### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getAttendanceStatsApi();

try {
    final response = api.attendanceStatsWeeklyRetrieve();
    print(response);
} on DioException catch (e) {
    print('Exception when calling AttendanceStatsApi->attendanceStatsWeeklyRetrieve: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**WeeklyStatsResponse**](WeeklyStatsResponse.md)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

