# wm_api.api.AdminLeaveApi

## Load the API package
```dart
import 'package:wm_api/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**adminLeaveExpiringRetrieve**](AdminLeaveApi.md#adminleaveexpiringretrieve) | **GET** /v1/admin/leave/expiring | Aggregate expiring leave for all active company members


# **adminLeaveExpiringRetrieve**
> adminLeaveExpiringRetrieve()

Aggregate expiring leave for all active company members

GET /v1/admin/leave/expiring — aggregate expiring leave for all active members.  Replaces FE per-employee fan-out. Returns rows sorted by expiring desc, omitting members with 0 expiring days.

### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getAdminLeaveApi();

try {
    api.adminLeaveExpiringRetrieve();
} on DioException catch (e) {
    print('Exception when calling AdminLeaveApi->adminLeaveExpiringRetrieve: $e\n');
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

