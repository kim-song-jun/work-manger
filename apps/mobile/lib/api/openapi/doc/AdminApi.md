# wm_api.api.AdminApi

## Load the API package
```dart
import 'package:wm_api/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**adminApprovalsRetrieve**](AdminApi.md#adminapprovalsretrieve) | **GET** /v1/admin/approvals | 
[**adminAuditRetrieve**](AdminApi.md#adminauditretrieve) | **GET** /v1/admin/audit | 
[**adminCompanyCodesCreate**](AdminApi.md#admincompanycodescreate) | **POST** /v1/admin/company-codes | 
[**adminCompanyCodesDestroy**](AdminApi.md#admincompanycodesdestroy) | **DELETE** /v1/admin/company-codes/{code_id} | 
[**adminCompanyCodesRetrieve**](AdminApi.md#admincompanycodesretrieve) | **GET** /v1/admin/company-codes | 
[**adminCompliance52hRetrieve**](AdminApi.md#admincompliance52hretrieve) | **GET** /v1/admin/compliance/52h | 
[**adminDashboardRetrieve**](AdminApi.md#admindashboardretrieve) | **GET** /v1/admin/dashboard | 
[**adminEmployeesBulkCreate**](AdminApi.md#adminemployeesbulkcreate) | **POST** /v1/admin/employees/bulk | 
[**adminEmployeesDeactivateCreate**](AdminApi.md#adminemployeesdeactivatecreate) | **POST** /v1/admin/employees/{membership_id}/deactivate | 
[**adminEmployeesRetrieve**](AdminApi.md#adminemployeesretrieve) | **GET** /v1/admin/employees | 
[**adminEmployeesRetrieve2**](AdminApi.md#adminemployeesretrieve2) | **GET** /v1/admin/employees/{membership_id} | 
[**adminEmployeesUpdatePartialUpdate**](AdminApi.md#adminemployeesupdatepartialupdate) | **PATCH** /v1/admin/employees/{membership_id}/update | 
[**adminReportsExportRetrieve**](AdminApi.md#adminreportsexportretrieve) | **GET** /v1/admin/reports/export | 
[**adminReportsMonthlyRetrieve**](AdminApi.md#adminreportsmonthlyretrieve) | **GET** /v1/admin/reports/monthly | 


# **adminApprovalsRetrieve**
> adminApprovalsRetrieve()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getAdminApi();

try {
    api.adminApprovalsRetrieve();
} catch on DioException (e) {
    print('Exception when calling AdminApi->adminApprovalsRetrieve: $e\n');
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

# **adminAuditRetrieve**
> adminAuditRetrieve()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getAdminApi();

try {
    api.adminAuditRetrieve();
} catch on DioException (e) {
    print('Exception when calling AdminApi->adminAuditRetrieve: $e\n');
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

# **adminCompanyCodesCreate**
> adminCompanyCodesCreate()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getAdminApi();

try {
    api.adminCompanyCodesCreate();
} catch on DioException (e) {
    print('Exception when calling AdminApi->adminCompanyCodesCreate: $e\n');
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

# **adminCompanyCodesDestroy**
> adminCompanyCodesDestroy(codeId)



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getAdminApi();
final String codeId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    api.adminCompanyCodesDestroy(codeId);
} catch on DioException (e) {
    print('Exception when calling AdminApi->adminCompanyCodesDestroy: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **codeId** | **String**|  | 

### Return type

void (empty response body)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminCompanyCodesRetrieve**
> adminCompanyCodesRetrieve()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getAdminApi();

try {
    api.adminCompanyCodesRetrieve();
} catch on DioException (e) {
    print('Exception when calling AdminApi->adminCompanyCodesRetrieve: $e\n');
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

# **adminCompliance52hRetrieve**
> adminCompliance52hRetrieve()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getAdminApi();

try {
    api.adminCompliance52hRetrieve();
} catch on DioException (e) {
    print('Exception when calling AdminApi->adminCompliance52hRetrieve: $e\n');
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

# **adminDashboardRetrieve**
> adminDashboardRetrieve()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getAdminApi();

try {
    api.adminDashboardRetrieve();
} catch on DioException (e) {
    print('Exception when calling AdminApi->adminDashboardRetrieve: $e\n');
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

# **adminEmployeesBulkCreate**
> adminEmployeesBulkCreate()



CSV bulk-register employees. Multipart `file` + optional `dry_run=true`.

### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getAdminApi();

try {
    api.adminEmployeesBulkCreate();
} catch on DioException (e) {
    print('Exception when calling AdminApi->adminEmployeesBulkCreate: $e\n');
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

# **adminEmployeesDeactivateCreate**
> adminEmployeesDeactivateCreate(membershipId)



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getAdminApi();
final String membershipId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    api.adminEmployeesDeactivateCreate(membershipId);
} catch on DioException (e) {
    print('Exception when calling AdminApi->adminEmployeesDeactivateCreate: $e\n');
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

# **adminEmployeesRetrieve**
> adminEmployeesRetrieve()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getAdminApi();

try {
    api.adminEmployeesRetrieve();
} catch on DioException (e) {
    print('Exception when calling AdminApi->adminEmployeesRetrieve: $e\n');
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

# **adminEmployeesRetrieve2**
> adminEmployeesRetrieve2(membershipId)



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getAdminApi();
final String membershipId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    api.adminEmployeesRetrieve2(membershipId);
} catch on DioException (e) {
    print('Exception when calling AdminApi->adminEmployeesRetrieve2: $e\n');
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

# **adminEmployeesUpdatePartialUpdate**
> adminEmployeesUpdatePartialUpdate(membershipId)



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getAdminApi();
final String membershipId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    api.adminEmployeesUpdatePartialUpdate(membershipId);
} catch on DioException (e) {
    print('Exception when calling AdminApi->adminEmployeesUpdatePartialUpdate: $e\n');
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

# **adminReportsExportRetrieve**
> adminReportsExportRetrieve()



CBV so we can swap content negotiation. Spec mandates `?format=csv|pdf`, but DRF's default content-negotiator inspects that same query key and 404s when it doesn't match a registered renderer. We override to always return the JSON renderer (used only for the 422 error path); the success path writes raw HttpResponse and bypasses the renderer entirely.

### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getAdminApi();

try {
    api.adminReportsExportRetrieve();
} catch on DioException (e) {
    print('Exception when calling AdminApi->adminReportsExportRetrieve: $e\n');
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

# **adminReportsMonthlyRetrieve**
> adminReportsMonthlyRetrieve()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getAdminApi();

try {
    api.adminReportsMonthlyRetrieve();
} catch on DioException (e) {
    print('Exception when calling AdminApi->adminReportsMonthlyRetrieve: $e\n');
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

