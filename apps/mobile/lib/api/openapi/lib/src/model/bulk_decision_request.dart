//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:wm_api/src/model/decision_enum.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'bulk_decision_request.g.dart';

/// BulkDecisionRequest
///
/// Properties:
/// * [ids] 
/// * [decision] 
/// * [reason] 
@BuiltValue()
abstract class BulkDecisionRequest implements Built<BulkDecisionRequest, BulkDecisionRequestBuilder> {
  @BuiltValueField(wireName: r'ids')
  BuiltList<String> get ids;

  @BuiltValueField(wireName: r'decision')
  DecisionEnum get decision;
  // enum decisionEnum {  approve,  reject,  };

  @BuiltValueField(wireName: r'reason')
  String? get reason;

  BulkDecisionRequest._();

  factory BulkDecisionRequest([void updates(BulkDecisionRequestBuilder b)]) = _$BulkDecisionRequest;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(BulkDecisionRequestBuilder b) => b
      ..reason = '';

  @BuiltValueSerializer(custom: true)
  static Serializer<BulkDecisionRequest> get serializer => _$BulkDecisionRequestSerializer();
}

class _$BulkDecisionRequestSerializer implements PrimitiveSerializer<BulkDecisionRequest> {
  @override
  final Iterable<Type> types = const [BulkDecisionRequest, _$BulkDecisionRequest];

  @override
  final String wireName = r'BulkDecisionRequest';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    BulkDecisionRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'ids';
    yield serializers.serialize(
      object.ids,
      specifiedType: const FullType(BuiltList, [FullType(String)]),
    );
    yield r'decision';
    yield serializers.serialize(
      object.decision,
      specifiedType: const FullType(DecisionEnum),
    );
    if (object.reason != null) {
      yield r'reason';
      yield serializers.serialize(
        object.reason,
        specifiedType: const FullType(String),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    BulkDecisionRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required BulkDecisionRequestBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'ids':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(String)]),
          ) as BuiltList<String>;
          result.ids.replace(valueDes);
          break;
        case r'decision':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DecisionEnum),
          ) as DecisionEnum;
          result.decision = valueDes;
          break;
        case r'reason':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.reason = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  BulkDecisionRequest deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = BulkDecisionRequestBuilder();
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

