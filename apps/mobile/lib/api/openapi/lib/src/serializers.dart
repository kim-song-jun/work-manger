//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_import

import 'package:one_of_serializer/any_of_serializer.dart';
import 'package:one_of_serializer/one_of_serializer.dart';
import 'package:built_collection/built_collection.dart';
import 'package:built_value/json_object.dart';
import 'package:built_value/serializer.dart';
import 'package:built_value/standard_json_plugin.dart';
import 'package:built_value/iso_8601_date_time_serializer.dart';
import 'package:wm_api/src/date_serializer.dart';
import 'package:wm_api/src/model/date.dart';

import 'package:wm_api/src/model/bulk_decision_request.dart';
import 'package:wm_api/src/model/company_settings.dart';
import 'package:wm_api/src/model/company_subscription.dart';
import 'package:wm_api/src/model/company_subscription_status_enum.dart';
import 'package:wm_api/src/model/decision_enum.dart';
import 'package:wm_api/src/model/invoice.dart';
import 'package:wm_api/src/model/invoice_status_enum.dart';
import 'package:wm_api/src/model/patched_admin_decision_request.dart';
import 'package:wm_api/src/model/patched_company_settings_request.dart';
import 'package:wm_api/src/model/subscription_plan.dart';
import 'package:wm_api/src/model/today_stats_response.dart';
import 'package:wm_api/src/model/weekly_stats_response.dart';

part 'serializers.g.dart';

@SerializersFor([
  BulkDecisionRequest,
  CompanySettings,
  CompanySubscription,
  CompanySubscriptionStatusEnum,
  DecisionEnum,
  Invoice,
  InvoiceStatusEnum,
  PatchedAdminDecisionRequest,
  PatchedCompanySettingsRequest,
  SubscriptionPlan,
  TodayStatsResponse,
  WeeklyStatsResponse,
])
Serializers serializers = (_$serializers.toBuilder()
      ..addBuilderFactory(
        const FullType(BuiltList, [FullType(Invoice)]),
        () => ListBuilder<Invoice>(),
      )
      ..add(const OneOfSerializer())
      ..add(const AnyOfSerializer())
      ..add(const DateSerializer())
      ..add(Iso8601DateTimeSerializer())
    ).build();

Serializers standardSerializers =
    (serializers.toBuilder()..addPlugin(StandardJsonPlugin())).build();
