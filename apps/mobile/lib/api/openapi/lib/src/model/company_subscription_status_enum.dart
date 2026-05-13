//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'company_subscription_status_enum.g.dart';

class CompanySubscriptionStatusEnum extends EnumClass {

  /// * `TRIAL` - Trial * `ACTIVE` - Active * `PAST_DUE` - Past due * `CANCELED` - Canceled
  @BuiltValueEnumConst(wireName: r'TRIAL')
  static const CompanySubscriptionStatusEnum TRIAL = _$TRIAL;
  /// * `TRIAL` - Trial * `ACTIVE` - Active * `PAST_DUE` - Past due * `CANCELED` - Canceled
  @BuiltValueEnumConst(wireName: r'ACTIVE')
  static const CompanySubscriptionStatusEnum ACTIVE = _$ACTIVE;
  /// * `TRIAL` - Trial * `ACTIVE` - Active * `PAST_DUE` - Past due * `CANCELED` - Canceled
  @BuiltValueEnumConst(wireName: r'PAST_DUE')
  static const CompanySubscriptionStatusEnum PAST_DUE = _$PAST_DUE;
  /// * `TRIAL` - Trial * `ACTIVE` - Active * `PAST_DUE` - Past due * `CANCELED` - Canceled
  @BuiltValueEnumConst(wireName: r'CANCELED')
  static const CompanySubscriptionStatusEnum CANCELED = _$CANCELED;

  static Serializer<CompanySubscriptionStatusEnum> get serializer => _$companySubscriptionStatusEnumSerializer;

  const CompanySubscriptionStatusEnum._(String name): super(name);

  static BuiltSet<CompanySubscriptionStatusEnum> get values => _$values;
  static CompanySubscriptionStatusEnum valueOf(String name) => _$valueOf(name);
}

/// Optionally, enum_class can generate a mixin to go with your enum for use
/// with Angular. It exposes your enum constants as getters. So, if you mix it
/// in to your Dart component class, the values become available to the
/// corresponding Angular template.
///
/// Trigger mixin generation by writing a line like this one next to your enum.
abstract class CompanySubscriptionStatusEnumMixin = Object with _$CompanySubscriptionStatusEnumMixin;

