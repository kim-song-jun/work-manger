import 'package:test/test.dart';
import 'package:wm_api/wm_api.dart';


/// tests for BillingApi
void main() {
  final instance = WmApi().getBillingApi();

  group(BillingApi, () {
    // Invoice history (OWNER only, paginated)
    //
    // ``GET /v1/billing/invoices`` — newest first, capped at 100 rows.  Pagination is intentionally simple (count-then-slice) for the skeleton; iter14 swaps to cursor pagination once Stripe webhook starts emitting more rows than fit in a single screen.
    //
    //Future<BuiltList<Invoice>> billingInvoicesList() async
    test('test billingInvoicesList', () async {
      // TODO
    });

    // Current company subscription (OWNER only)
    //
    // ``GET /v1/billing/subscription`` — F-OWNER-07 view-only.  Returns the latest subscription row for the OWNER's company. A 404 is returned (not an empty body) when nothing has been provisioned yet so the FE can branch cleanly into a \"Choose a plan\" CTA.
    //
    //Future<CompanySubscription> billingSubscriptionRetrieve() async
    test('test billingSubscriptionRetrieve', () async {
      // TODO
    });

  });
}
