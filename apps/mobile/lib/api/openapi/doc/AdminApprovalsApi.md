# wm_api.api.AdminApprovalsApi

## Load the API package
```dart
import 'package:wm_api/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**adminApprovalsBulkCreate**](AdminApprovalsApi.md#adminapprovalsbulkcreate) | **POST** /v1/admin/approvals/bulk | Admin bulk decide approval tasks
[**adminApprovalsPartialUpdate**](AdminApprovalsApi.md#adminapprovalspartialupdate) | **PATCH** /v1/admin/approvals/{task_id} | Admin override: decide single approval task


# **adminApprovalsBulkCreate**
> adminApprovalsBulkCreate(bulkDecisionRequest)

Admin bulk decide approval tasks

Admin bulk decide: POST /v1/admin/approvals/bulk.  Per-id atomic — bad rows don't poison the rest. Out-of-company / non-PENDING / unknown ids are reported in ``failed_ids[]`` (not raised).

### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getAdminApprovalsApi();
final BulkDecisionRequest bulkDecisionRequest = ; // BulkDecisionRequest | 

try {
    api.adminApprovalsBulkCreate(bulkDecisionRequest);
} on DioException catch (e) {
    print('Exception when calling AdminApprovalsApi->adminApprovalsBulkCreate: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **bulkDecisionRequest** | [**BulkDecisionRequest**](BulkDecisionRequest.md)|  | 

### Return type

void (empty response body)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, multipart/form-data
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminApprovalsPartialUpdate**
> adminApprovalsPartialUpdate(taskId, patchedAdminDecisionRequest)

Admin override: decide single approval task

Admin override: PATCH /v1/admin/approvals/<uuid>.  Bypasses :class:`IsApprover` (admin acts on behalf). Idempotency: returns 409 ALREADY_DECIDED if task is not PENDING.

### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getAdminApprovalsApi();
final String taskId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final PatchedAdminDecisionRequest patchedAdminDecisionRequest = ; // PatchedAdminDecisionRequest | 

try {
    api.adminApprovalsPartialUpdate(taskId, patchedAdminDecisionRequest);
} on DioException catch (e) {
    print('Exception when calling AdminApprovalsApi->adminApprovalsPartialUpdate: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **taskId** | **String**|  | 
 **patchedAdminDecisionRequest** | [**PatchedAdminDecisionRequest**](PatchedAdminDecisionRequest.md)|  | [optional] 

### Return type

void (empty response body)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, multipart/form-data
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

