//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/json_object.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'subscription_plan.g.dart';

/// SubscriptionPlan
///
/// Properties:
/// * [id] 
/// * [name] 
/// * [priceMonthlyKrw] 
/// * [maxEmployees] - 0 = unlimited
/// * [featuresJsonb] 
/// * [isActive] 
@BuiltValue()
abstract class SubscriptionPlan implements Built<SubscriptionPlan, SubscriptionPlanBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'name')
  String get name;

  @BuiltValueField(wireName: r'price_monthly_krw')
  int get priceMonthlyKrw;

  /// 0 = unlimited
  @BuiltValueField(wireName: r'max_employees')
  int? get maxEmployees;

  @BuiltValueField(wireName: r'features_jsonb')
  JsonObject? get featuresJsonb;

  @BuiltValueField(wireName: r'is_active')
  bool? get isActive;

  SubscriptionPlan._();

  factory SubscriptionPlan([void updates(SubscriptionPlanBuilder b)]) = _$SubscriptionPlan;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(SubscriptionPlanBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<SubscriptionPlan> get serializer => _$SubscriptionPlanSerializer();
}

class _$SubscriptionPlanSerializer implements PrimitiveSerializer<SubscriptionPlan> {
  @override
  final Iterable<Type> types = const [SubscriptionPlan, _$SubscriptionPlan];

  @override
  final String wireName = r'SubscriptionPlan';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    SubscriptionPlan object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'name';
    yield serializers.serialize(
      object.name,
      specifiedType: const FullType(String),
    );
    yield r'price_monthly_krw';
    yield serializers.serialize(
      object.priceMonthlyKrw,
      specifiedType: const FullType(int),
    );
    if (object.maxEmployees != null) {
      yield r'max_employees';
      yield serializers.serialize(
        object.maxEmployees,
        specifiedType: const FullType(int),
      );
    }
    if (object.featuresJsonb != null) {
      yield r'features_jsonb';
      yield serializers.serialize(
        object.featuresJsonb,
        specifiedType: const FullType.nullable(JsonObject),
      );
    }
    if (object.isActive != null) {
      yield r'is_active';
      yield serializers.serialize(
        object.isActive,
        specifiedType: const FullType(bool),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    SubscriptionPlan object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required SubscriptionPlanBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'id':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.id = valueDes;
          break;
        case r'name':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.name = valueDes;
          break;
        case r'price_monthly_krw':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.priceMonthlyKrw = valueDes;
          break;
        case r'max_employees':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.maxEmployees = valueDes;
          break;
        case r'features_jsonb':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(JsonObject),
          ) as JsonObject?;
          if (valueDes == null) continue;
          result.featuresJsonb = valueDes;
          break;
        case r'is_active':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.isActive = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  SubscriptionPlan deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = SubscriptionPlanBuilder();
    final serializedList = (serialized as Iterable<Object?>).toList();
    final unhandled = <Object?>[];
    _deserializeProperties(
      serializers,
      serialized,
      specifiedType: specifiedType,
      serializedList: serializedList,
      unhandled: unhandled,
      result: result,
    );
    return result.build();
  }
}

