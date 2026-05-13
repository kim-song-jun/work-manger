//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'patched_company_settings_request.g.dart';

/// PatchedCompanySettingsRequest
///
/// Properties:
/// * [defaultLocale] 
/// * [timezone] 
/// * [brandColor] 
/// * [logoUrl] 
/// * [complianceBlockWhenOver] 
/// * [leavePromotionEnabled] 
@BuiltValue()
abstract class PatchedCompanySettingsRequest implements Built<PatchedCompanySettingsRequest, PatchedCompanySettingsRequestBuilder> {
  @BuiltValueField(wireName: r'default_locale')
  String? get defaultLocale;

  @BuiltValueField(wireName: r'timezone')
  String? get timezone;

  @BuiltValueField(wireName: r'brand_color')
  String? get brandColor;

  @BuiltValueField(wireName: r'logo_url')
  String? get logoUrl;

  @BuiltValueField(wireName: r'compliance_block_when_over')
  bool? get complianceBlockWhenOver;

  @BuiltValueField(wireName: r'leave_promotion_enabled')
  bool? get leavePromotionEnabled;

  PatchedCompanySettingsRequest._();

  factory PatchedCompanySettingsRequest([void updates(PatchedCompanySettingsRequestBuilder b)]) = _$PatchedCompanySettingsRequest;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PatchedCompanySettingsRequestBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PatchedCompanySettingsRequest> get serializer => _$PatchedCompanySettingsRequestSerializer();
}

class _$PatchedCompanySettingsRequestSerializer implements PrimitiveSerializer<PatchedCompanySettingsRequest> {
  @override
  final Iterable<Type> types = const [PatchedCompanySettingsRequest, _$PatchedCompanySettingsRequest];

  @override
  final String wireName = r'PatchedCompanySettingsRequest';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PatchedCompanySettingsRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    if (object.defaultLocale != null) {
      yield r'default_locale';
      yield serializers.serialize(
        object.defaultLocale,
        specifiedType: const FullType(String),
      );
    }
    if (object.timezone != null) {
      yield r'timezone';
      yield serializers.serialize(
        object.timezone,
        specifiedType: const FullType(String),
      );
    }
    if (object.brandColor != null) {
      yield r'brand_color';
      yield serializers.serialize(
        object.brandColor,
        specifiedType: const FullType(String),
      );
    }
    if (object.logoUrl != null) {
      yield r'logo_url';
      yield serializers.serialize(
        object.logoUrl,
        specifiedType: const FullType(String),
      );
    }
    if (object.complianceBlockWhenOver != null) {
      yield r'compliance_block_when_over';
      yield serializers.serialize(
        object.complianceBlockWhenOver,
        specifiedType: const FullType(bool),
      );
    }
    if (object.leavePromotionEnabled != null) {
      yield r'leave_promotion_enabled';
      yield serializers.serialize(
        object.leavePromotionEnabled,
        specifiedType: const FullType(bool),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    PatchedCompanySettingsRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PatchedCompanySettingsRequestBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'default_locale':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.defaultLocale = valueDes;
          break;
        case r'timezone':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.timezone = valueDes;
          break;
        case r'brand_color':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.brandColor = valueDes;
          break;
        case r'logo_url':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.logoUrl = valueDes;
          break;
        case r'compliance_block_when_over':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.complianceBlockWhenOver = valueDes;
          break;
        case r'leave_promotion_enabled':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.leavePromotionEnabled = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PatchedCompanySettingsRequest deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PatchedCompanySettingsRequestBuilder();
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

