# wm_api.api.TeamApi

## Load the API package
```dart
import 'package:wm_api/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**teamCalendarMatrixRetrieve**](TeamApi.md#teamcalendarmatrixretrieve) | **GET** /v1/team/calendar/matrix | 
[**teamMembersRetrieve**](TeamApi.md#teammembersretrieve) | **GET** /v1/team/members/{membership_id} | 
[**teamStatusGridRetrieve**](TeamApi.md#teamstatusgridretrieve) | **GET** /v1/team/status/grid | 
[**teamStatusGroupedRetrieve**](TeamApi.md#teamstatusgroupedretrieve) | **GET** /v1/team/status/grouped | 
[**teamStatusRetrieve**](TeamApi.md#teamstatusretrieve) | **GET** /v1/team/status | 
[**teamStatusTimelineRetrieve**](TeamApi.md#teamstatustimelineretrieve) | **GET** /v1/team/status/timeline | 


# **teamCalendarMatrixRetrieve**
> teamCalendarMatrixRetrieve()



Dense matrix of statuses per member per day.  GET /v1/team/calendar/matrix?from=YYYY-MM-DD&to=YYYY-MM-DD&group_by=team|all

### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getTeamApi();

try {
    api.teamCalendarMatrixRetrieve();
} catch on DioException (e) {
    print('Exception when calling TeamApi->teamCalendarMatrixRetrieve: $e\n');
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

# **teamMembersRetrieve**
> teamMembersRetrieve(membershipId)



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getTeamApi();
final String membershipId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    api.teamMembersRetrieve(membershipId);
} catch on DioException (e) {
    print('Exception when calling TeamApi->teamMembersRetrieve: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **membershipId** | **String**|  | 

### Return type

void (empty response body)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **teamStatusGridRetrieve**
> teamStatusGridRetrieve()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getTeamApi();

try {
    api.teamStatusGridRetrieve();
} catch on DioException (e) {
    print('Exception when calling TeamApi->teamStatusGridRetrieve: $e\n');
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

# **teamStatusGroupedRetrieve**
> teamStatusGroupedRetrieve()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getTeamApi();

try {
    api.teamStatusGroupedRetrieve();
} catch on DioException (e) {
    print('Exception when calling TeamApi->teamStatusGroupedRetrieve: $e\n');
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

# **teamStatusRetrieve**
> teamStatusRetrieve()



`/v1/team/status` — alias for the grid view.  Calls the inner ``_today_data`` helper directly (NOT the wrapped ``status_grid`` view, which would receive a DRF ``Request`` and a second time pass it through ``api_view`` causing ``AssertionError: The `request` argument must be an instance of `django.http.HttpRequest```).

### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getTeamApi();

try {
    api.teamStatusRetrieve();
} catch on DioException (e) {
    print('Exception when calling TeamApi->teamStatusRetrieve: $e\n');
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

# **teamStatusTimelineRetrieve**
> teamStatusTimelineRetrieve()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getTeamApi();

try {
    api.teamStatusTimelineRetrieve();
} catch on DioException (e) {
    print('Exception when calling TeamApi->teamStatusTimelineRetrieve: $e\n');
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

