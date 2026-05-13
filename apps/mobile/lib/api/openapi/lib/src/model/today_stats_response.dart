//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'today_stats_response.g.dart';

/// TodayStatsResponse
///
/// Properties:
/// * [clockInAt] 
/// * [clockOutAt] 
/// * [workMinutes] 
/// * [breakMinutes] 
/// * [isClockedIn] 
@BuiltValue()
abstract class TodayStatsResponse implements Built<TodayStatsResponse, TodayStatsResponseBuilder> {
  @BuiltValueField(wireName: r'clock_in_at')
  DateTime? get clockInAt;

  @BuiltValueField(wireName: r'clock_out_at')
  DateTime? get clockOutAt;

  @BuiltValueField(wireName: r'work_minutes')
  int get workMinutes;

  @BuiltValueField(wireName: r'break_minutes')
  int get breakMinutes;

  @BuiltValueField(wireName: r'is_clocked_in')
  bool get isClockedIn;

  TodayStatsResponse._();

  factory TodayStatsResponse([void updates(TodayStatsResponseBuilder b)]) = _$TodayStatsResponse;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(TodayStatsResponseBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<TodayStatsResponse> get serializer => _$TodayStatsResponseSerializer();
}

class _$TodayStatsResponseSerializer implements PrimitiveSerializer<TodayStatsResponse> {
  @override
  final Iterable<Type> types = const [TodayStatsResponse, _$TodayStatsResponse];

  @override
  final String wireName = r'TodayStatsResponse';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    TodayStatsResponse object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'clock_in_at';
    yield object.clockInAt == null ? null : serializers.serialize(
      object.clockInAt,
      specifiedType: const FullType.nullable(DateTime),
    );
    yield r'clock_out_at';
    yield object.clockOutAt == null ? null : serializers.serialize(
      object.clockOutAt,
      specifiedType: const FullType.nullable(DateTime),
    );
    yield r'work_minutes';
    yield serializers.serialize(
      object.workMinutes,
      specifiedType: const FullType(int),
    );
    yield r'break_minutes';
    yield serializers.serialize(
      object.breakMinutes,
      specifiedType: const FullType(int),
    );
    yield r'is_clocked_in';
    yield serializers.serialize(
      object.isClockedIn,
      specifiedType: const FullType(bool),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    TodayStatsResponse object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required TodayStatsResponseBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'clock_in_at':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.clockInAt = valueDes;
          break;
        case r'clock_out_at':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.clockOutAt = valueDes;
          break;
        case r'work_minutes':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.workMinutes = valueDes;
          break;
        case r'break_minutes':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.breakMinutes = valueDes;
          break;
        case r'is_clocked_in':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.isClockedIn = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  TodayStatsResponse deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = TodayStatsResponseBuilder();
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

