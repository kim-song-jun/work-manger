# wm_api.api.MeApi

## Load the API package
```dart
import 'package:wm_api/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**meRetrieve**](MeApi.md#meretrieve) | **GET** /v1/me | 
[**meSettingsPartialUpdate**](MeApi.md#mesettingspartialupdate) | **PATCH** /v1/me/settings | 
[**meSettingsRetrieve**](MeApi.md#mesettingsretrieve) | **GET** /v1/me/settings | 


# **meRetrieve**
> meRetrieve()



### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getMeApi();

try {
    api.meRetrieve();
} on DioException catch (e) {
    print('Exception when calling MeApi->meRetrieve: $e\n');
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

# **meSettingsPartialUpdate**
> meSettingsPartialUpdate()



GET — returns the authenticated user's settings. PATCH — partial update (currently only `use_native_home`). See docs/superpowers/specs/2026-05-13-home-native-poc-design.md §6.

### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getMeApi();

try {
    api.meSettingsPartialUpdate();
} on DioException catch (e) {
    print('Exception when calling MeApi->meSettingsPartialUpdate: $e\n');
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

# **meSettingsRetrieve**
> meSettingsRetrieve()



GET — returns the authenticated user's settings. PATCH — partial update (currently only `use_native_home`). See docs/superpowers/specs/2026-05-13-home-native-poc-design.md §6.

### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getMeApi();

try {
    api.meSettingsRetrieve();
} on DioException catch (e) {
    print('Exception when calling MeApi->meSettingsRetrieve: $e\n');
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

