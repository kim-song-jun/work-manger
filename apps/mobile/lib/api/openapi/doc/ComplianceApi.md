# wm_api.api.ComplianceApi

## Load the API package
```dart
import 'package:wm_api/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**complianceMeRetrieve**](ComplianceApi.md#compliancemeretrieve) | **GET** /v1/compliance/me | 
[**complianceTeamRetrieve**](ComplianceApi.md#complianceteamretrieve) | **GET** /v1/compliance/team | 


# **complianceMeRetrieve**
> complianceMeRetrieve()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getComplianceApi();

try {
    api.complianceMeRetrieve();
} on DioException catch (e) {
    print('Exception when calling ComplianceApi->complianceMeRetrieve: $e\n');
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

# **complianceTeamRetrieve**
> complianceTeamRetrieve()



GET /v1/compliance/team?week=YYYY-MM-DD — MANAGER+ 팀 단위 52h 현황.  F-MANAGER-02: MANAGER 는 본인 부서 멤버만, ADMIN/OWNER 는 전사 조회.

### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getComplianceApi();

try {
    api.complianceTeamRetrieve();
} on DioException catch (e) {
    print('Exception when calling ComplianceApi->complianceTeamRetrieve: $e\n');
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

