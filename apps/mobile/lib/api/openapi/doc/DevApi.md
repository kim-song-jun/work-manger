# wm_api.api.DevApi

## Load the API package
```dart
import 'package:wm_api/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**devBootstrapCompanyCreate**](DevApi.md#devbootstrapcompanycreate) | **POST** /v1/dev/bootstrap-company | 


# **devBootstrapCompanyCreate**
> devBootstrapCompanyCreate()



Create a company + make current user the OWNER. Dev-only convenience.

### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getDevApi();

try {
    api.devBootstrapCompanyCreate();
} on DioException catch (e) {
    print('Exception when calling DevApi->devBootstrapCompanyCreate: $e\n');
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

