//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'invoice_status_enum.g.dart';

class InvoiceStatusEnum extends EnumClass {

  /// * `DRAFT` - Draft * `PAID` - Paid * `VOID` - Void
  @BuiltValueEnumConst(wireName: r'DRAFT')
  static const InvoiceStatusEnum DRAFT = _$DRAFT;
  /// * `DRAFT` - Draft * `PAID` - Paid * `VOID` - Void
  @BuiltValueEnumConst(wireName: r'PAID')
  static const InvoiceStatusEnum PAID = _$PAID;
  /// * `DRAFT` - Draft * `PAID` - Paid * `VOID` - Void
  @BuiltValueEnumConst(wireName: r'VOID')
  static const InvoiceStatusEnum VOID = _$VOID;

  static Serializer<InvoiceStatusEnum> get serializer => _$invoiceStatusEnumSerializer;

  const InvoiceStatusEnum._(String name): super(name);

  static BuiltSet<InvoiceStatusEnum> get values => _$values;
  static InvoiceStatusEnum valueOf(String name) => _$valueOf(name);
}

/// Optionally, enum_class can generate a mixin to go with your enum for use
/// with Angular. It exposes your enum constants as getters. So, if you mix it
/// in to your Dart component class, the values become available to the
/// corresponding Angular template.
///
/// Trigger mixin generation by writing a line like this one next to your enum.
abstract class InvoiceStatusEnumMixin = Object with _$InvoiceStatusEnumMixin;

