//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:wm_api/src/model/date.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'weekly_stats_response.g.dart';

/// WeeklyStatsResponse
///
/// Properties:
/// * [weekStart] 
/// * [weekEnd] 
/// * [regularMinutes] 
/// * [overtimeMinutes] 
/// * [breakMinutes] 
/// * [daysWorked] 
@BuiltValue()
abstract class WeeklyStatsResponse implements Built<WeeklyStatsResponse, WeeklyStatsResponseBuilder> {
  @BuiltValueField(wireName: r'week_start')
  Date get weekStart;

  @BuiltValueField(wireName: r'week_end')
  Date get weekEnd;

  @BuiltValueField(wireName: r'regular_minutes')
  int get regularMinutes;

  @BuiltValueField(wireName: r'overtime_minutes')
  int get overtimeMinutes;

  @BuiltValueField(wireName: r'break_minutes')
  int get breakMinutes;

  @BuiltValueField(wireName: r'days_worked')
  int get daysWorked;

  WeeklyStatsResponse._();

  factory WeeklyStatsResponse([void updates(WeeklyStatsResponseBuilder b)]) = _$WeeklyStatsResponse;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(WeeklyStatsResponseBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<WeeklyStatsResponse> get serializer => _$WeeklyStatsResponseSerializer();
}

class _$WeeklyStatsResponseSerializer implements PrimitiveSerializer<WeeklyStatsResponse> {
  @override
  final Iterable<Type> types = const [WeeklyStatsResponse, _$WeeklyStatsResponse];

  @override
  final String wireName = r'WeeklyStatsResponse';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    WeeklyStatsResponse object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'week_start';
    yield serializers.serialize(
      object.weekStart,
      specifiedType: const FullType(Date),
    );
    yield r'week_end';
    yield serializers.serialize(
      object.weekEnd,
      specifiedType: const FullType(Date),
    );
    yield r'regular_minutes';
    yield serializers.serialize(
      object.regularMinutes,
      specifiedType: const FullType(int),
    );
    yield r'overtime_minutes';
    yield serializers.serialize(
      object.overtimeMinutes,
      specifiedType: const FullType(int),
    );
    yield r'break_minutes';
    yield serializers.serialize(
      object.breakMinutes,
      specifiedType: const FullType(int),
    );
    yield r'days_worked';
    yield serializers.serialize(
      object.daysWorked,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    WeeklyStatsResponse object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required WeeklyStatsResponseBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'week_start':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Date),
          ) as Date;
          result.weekStart = valueDes;
          break;
        case r'week_end':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Date),
          ) as Date;
          result.weekEnd = valueDes;
          break;
        case r'regular_minutes':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.regularMinutes = valueDes;
          break;
        case r'overtime_minutes':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.overtimeMinutes = valueDes;
          break;
        case r'break_minutes':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.breakMinutes = valueDes;
          break;
        case r'days_worked':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.daysWorked = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  WeeklyStatsResponse deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = WeeklyStatsResponseBuilder();
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

