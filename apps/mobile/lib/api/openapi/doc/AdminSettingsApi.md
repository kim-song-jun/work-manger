# wm_api.api.AdminSettingsApi

## Load the API package
```dart
import 'package:wm_api/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**adminSettingsRetrieve**](AdminSettingsApi.md#adminsettingsretrieve) | **GET** /v1/admin/settings | Get company settings (ADMIN+)
[**adminSettingsUpdatePartialUpdate**](AdminSettingsApi.md#adminsettingsupdatepartialupdate) | **PATCH** /v1/admin/settings/update | Update company settings (OWNER only)


# **adminSettingsRetrieve**
> CompanySettings adminSettingsRetrieve()

Get company settings (ADMIN+)

GET /v1/admin/settings — 회사 설정 조회 (ADMIN+).

### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getAdminSettingsApi();

try {
    final response = api.adminSettingsRetrieve();
    print(response);
} on DioException catch (e) {
    print('Exception when calling AdminSettingsApi->adminSettingsRetrieve: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**CompanySettings**](CompanySettings.md)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminSettingsUpdatePartialUpdate**
> CompanySettings adminSettingsUpdatePartialUpdate(patchedCompanySettingsRequest)

Update company settings (OWNER only)

PATCH /v1/admin/settings — OWNER 만 쓰기 가능. ADMIN 은 read-only.

### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getAdminSettingsApi();
final PatchedCompanySettingsRequest patchedCompanySettingsRequest = ; // PatchedCompanySettingsRequest | 

try {
    final response = api.adminSettingsUpdatePartialUpdate(patchedCompanySettingsRequest);
    print(response);
} on DioException catch (e) {
    print('Exception when calling AdminSettingsApi->adminSettingsUpdatePartialUpdate: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **patchedCompanySettingsRequest** | [**PatchedCompanySettingsRequest**](PatchedCompanySettingsRequest.md)|  | [optional] 

### Return type

[**CompanySettings**](CompanySettings.md)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, multipart/form-data
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

