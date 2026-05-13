//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:wm_api/src/model/decision_enum.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'patched_admin_decision_request.g.dart';

/// PatchedAdminDecisionRequest
///
/// Properties:
/// * [decision] 
/// * [reason] 
@BuiltValue()
abstract class PatchedAdminDecisionRequest implements Built<PatchedAdminDecisionRequest, PatchedAdminDecisionRequestBuilder> {
  @BuiltValueField(wireName: r'decision')
  DecisionEnum? get decision;
  // enum decisionEnum {  approve,  reject,  };

  @BuiltValueField(wireName: r'reason')
  String? get reason;

  PatchedAdminDecisionRequest._();

  factory PatchedAdminDecisionRequest([void updates(PatchedAdminDecisionRequestBuilder b)]) = _$PatchedAdminDecisionRequest;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PatchedAdminDecisionRequestBuilder b) => b
      ..reason = '';

  @BuiltValueSerializer(custom: true)
  static Serializer<PatchedAdminDecisionRequest> get serializer => _$PatchedAdminDecisionRequestSerializer();
}

class _$PatchedAdminDecisionRequestSerializer implements PrimitiveSerializer<PatchedAdminDecisionRequest> {
  @override
  final Iterable<Type> types = const [PatchedAdminDecisionRequest, _$PatchedAdminDecisionRequest];

  @override
  final String wireName = r'PatchedAdminDecisionRequest';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PatchedAdminDecisionRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    if (object.decision != null) {
      yield r'decision';
      yield serializers.serialize(
        object.decision,
        specifiedType: const FullType(DecisionEnum),
      );
    }
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
    PatchedAdminDecisionRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PatchedAdminDecisionRequestBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
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
  PatchedAdminDecisionRequest deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PatchedAdminDecisionRequestBuilder();
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

