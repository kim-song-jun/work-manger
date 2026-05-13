# wm_api.model.Invoice

## Load the model package
```dart
import 'package:wm_api/api.dart';
```

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **String** |  | 
**amountKrw** | **int** |  | 
**status** | [**InvoiceStatusEnum**](InvoiceStatusEnum.md) |  | [optional] 
**issuedAt** | [**DateTime**](DateTime.md) |  | [optional] 
**paidAt** | [**DateTime**](DateTime.md) |  | [optional] 
**externalId** | **String** | Stripe invoice ID (iter14) | [optional] 
**pdfUrl** | **String** |  | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


