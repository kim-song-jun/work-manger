# wm_api.api.BillingApi

## Load the API package
```dart
import 'package:wm_api/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**billingInvoicesList**](BillingApi.md#billinginvoiceslist) | **GET** /v1/billing/invoices | Invoice history (OWNER only, paginated)
[**billingSubscriptionRetrieve**](BillingApi.md#billingsubscriptionretrieve) | **GET** /v1/billing/subscription | Current company subscription (OWNER only)


# **billingInvoicesList**
> BuiltList<Invoice> billingInvoicesList()

Invoice history (OWNER only, paginated)

``GET /v1/billing/invoices`` — newest first, capped at 100 rows.  Pagination is intentionally simple (count-then-slice) for the skeleton; iter14 swaps to cursor pagination once Stripe webhook starts emitting more rows than fit in a single screen.

### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getBillingApi();

try {
    final response = api.billingInvoicesList();
    print(response);
} on DioException catch (e) {
    print('Exception when calling BillingApi->billingInvoicesList: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**BuiltList&lt;Invoice&gt;**](Invoice.md)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **billingSubscriptionRetrieve**
> CompanySubscription billingSubscriptionRetrieve()

Current company subscription (OWNER only)

``GET /v1/billing/subscription`` — F-OWNER-07 view-only.  Returns the latest subscription row for the OWNER's company. A 404 is returned (not an empty body) when nothing has been provisioned yet so the FE can branch cleanly into a \"Choose a plan\" CTA.

### Example
```dart
import 'package:wm_api/api.dart';

final api = WmApi().getBillingApi();

try {
    final response = api.billingSubscriptionRetrieve();
    print(response);
} on DioException catch (e) {
    print('Exception when calling BillingApi->billingSubscriptionRetrieve: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**CompanySubscription**](CompanySubscription.md)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

