//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:wm_api/src/model/company_subscription_status_enum.dart';
import 'package:wm_api/src/model/subscription_plan.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'company_subscription.g.dart';

/// CompanySubscription
///
/// Properties:
/// * [id] 
/// * [plan] 
/// * [status] 
/// * [startedAt] 
/// * [currentPeriodEnd] 
/// * [canceledAt] 
@BuiltValue()
abstract class CompanySubscription implements Built<CompanySubscription, CompanySubscriptionBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'plan')
  SubscriptionPlan get plan;

  @BuiltValueField(wireName: r'status')
  CompanySubscriptionStatusEnum? get status;
  // enum statusEnum {  TRIAL,  ACTIVE,  PAST_DUE,  CANCELED,  };

  @BuiltValueField(wireName: r'started_at')
  DateTime? get startedAt;

  @BuiltValueField(wireName: r'current_period_end')
  DateTime? get currentPeriodEnd;

  @BuiltValueField(wireName: r'canceled_at')
  DateTime? get canceledAt;

  CompanySubscription._();

  factory CompanySubscription([void updates(CompanySubscriptionBuilder b)]) = _$CompanySubscription;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CompanySubscriptionBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CompanySubscription> get serializer => _$CompanySubscriptionSerializer();
}

class _$CompanySubscriptionSerializer implements PrimitiveSerializer<CompanySubscription> {
  @override
  final Iterable<Type> types = const [CompanySubscription, _$CompanySubscription];

  @override
  final String wireName = r'CompanySubscription';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CompanySubscription object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'plan';
    yield serializers.serialize(
      object.plan,
      specifiedType: const FullType(SubscriptionPlan),
    );
    if (object.status != null) {
      yield r'status';
      yield serializers.serialize(
        object.status,
        specifiedType: const FullType(CompanySubscriptionStatusEnum),
      );
    }
    if (object.startedAt != null) {
      yield r'started_at';
      yield serializers.serialize(
        object.startedAt,
        specifiedType: const FullType(DateTime),
      );
    }
    if (object.currentPeriodEnd != null) {
      yield r'current_period_end';
      yield serializers.serialize(
        object.currentPeriodEnd,
        specifiedType: const FullType.nullable(DateTime),
      );
    }
    if (object.canceledAt != null) {
      yield r'canceled_at';
      yield serializers.serialize(
        object.canceledAt,
        specifiedType: const FullType.nullable(DateTime),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    CompanySubscription object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CompanySubscriptionBuilder result,
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
        case r'plan':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(SubscriptionPlan),
          ) as SubscriptionPlan;
          result.plan.replace(valueDes);
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(CompanySubscriptionStatusEnum),
          ) as CompanySubscriptionStatusEnum;
          result.status = valueDes;
          break;
        case r'started_at':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.startedAt = valueDes;
          break;
        case r'current_period_end':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.currentPeriodEnd = valueDes;
          break;
        case r'canceled_at':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.canceledAt = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  CompanySubscription deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CompanySubscriptionBuilder();
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

