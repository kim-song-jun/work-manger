# wm_api.api.TripApi

## Load the API package
```dart
import 'package:wm_api/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**tripRequestsCancelCreate**](TripApi.md#triprequestscancelcreate) | **POST** /v1/trip/requests/{request_id}/cancel | 
[**tripRequestsCreate**](TripApi.md#triprequestscreate) | **POST** /v1/trip/requests | 
[**tripRequestsRetrieve**](TripApi.md#triprequestsretrieve) | **GET** /v1/trip/requests | 
[**tripRequestsRetrieve2**](TripApi.md#triprequestsretrieve2) | **GET** /v1/trip/requests/{request_id} | 


# **tripRequestsCancelCreate**
> tripRequestsCancelCreate(requestId)



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getTripApi();
final String requestId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    api.tripRequestsCancelCreate(requestId);
} on DioException catch (e) {
    print('Exception when calling TripApi->tripRequestsCancelCreate: $e\n');
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

# **tripRequestsCreate**
> tripRequestsCreate()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getTripApi();

try {
    api.tripRequestsCreate();
} on DioException catch (e) {
    print('Exception when calling TripApi->tripRequestsCreate: $e\n');
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

# **tripRequestsRetrieve**
> tripRequestsRetrieve()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getTripApi();

try {
    api.tripRequestsRetrieve();
} on DioException catch (e) {
    print('Exception when calling TripApi->tripRequestsRetrieve: $e\n');
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

# **tripRequestsRetrieve2**
> tripRequestsRetrieve2(requestId)



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getTripApi();
final String requestId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    api.tripRequestsRetrieve2(requestId);
} on DioException catch (e) {
    print('Exception when calling TripApi->tripRequestsRetrieve2: $e\n');
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

