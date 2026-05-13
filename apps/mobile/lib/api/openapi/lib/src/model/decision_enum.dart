//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'decision_enum.g.dart';

class DecisionEnum extends EnumClass {

  /// * `approve` - approve * `reject` - reject
  @BuiltValueEnumConst(wireName: r'approve')
  static const DecisionEnum approve = _$approve;
  /// * `approve` - approve * `reject` - reject
  @BuiltValueEnumConst(wireName: r'reject')
  static const DecisionEnum reject = _$reject;

  static Serializer<DecisionEnum> get serializer => _$decisionEnumSerializer;

  const DecisionEnum._(String name): super(name);

  static BuiltSet<DecisionEnum> get values => _$values;
  static DecisionEnum valueOf(String name) => _$valueOf(name);
}

/// Optionally, enum_class can generate a mixin to go with your enum for use
/// with Angular. It exposes your enum constants as getters. So, if you mix it
/// in to your Dart component class, the values become available to the
/// corresponding Angular template.
///
/// Trigger mixin generation by writing a line like this one next to your enum.
abstract class DecisionEnumMixin = Object with _$DecisionEnumMixin;

