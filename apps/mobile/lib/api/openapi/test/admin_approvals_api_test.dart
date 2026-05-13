import 'package:test/test.dart';
import 'package:wm_api/wm_api.dart';


/// tests for AdminApprovalsApi
void main() {
  final instance = WmApi().getAdminApprovalsApi();

  group(AdminApprovalsApi, () {
    // Admin bulk decide approval tasks
    //
    // Admin bulk decide: POST /v1/admin/approvals/bulk.  Per-id atomic — bad rows don't poison the rest. Out-of-company / non-PENDING / unknown ids are reported in ``failed_ids[]`` (not raised).
    //
    //Future adminApprovalsBulkCreate(BulkDecisionRequest bulkDecisionRequest) async
    test('test adminApprovalsBulkCreate', () async {
      // TODO
    });

    // Admin override: decide single approval task
    //
    // Admin override: PATCH /v1/admin/approvals/<uuid>.  Bypasses :class:`IsApprover` (admin acts on behalf). Idempotency: returns 409 ALREADY_DECIDED if task is not PENDING.
    //
    //Future adminApprovalsPartialUpdate(String taskId, { PatchedAdminDecisionRequest patchedAdminDecisionRequest }) async
    test('test adminApprovalsPartialUpdate', () async {
      // TODO
    });

  });
}
