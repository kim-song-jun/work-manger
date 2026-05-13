import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../theme/tokens.g.dart';
import 'state/owner_billing_controller.dart';

class OwnerBillingScreen extends StatefulWidget {
  const OwnerBillingScreen({
    super.key,
    required this.controller,
    this.onOpenWebView,
  });

  final OwnerBillingController controller;
  final void Function(String path)? onOpenWebView;

  @override
  State<OwnerBillingScreen> createState() => _OwnerBillingScreenState();
}

class _OwnerBillingScreenState extends State<OwnerBillingScreen> {
  final _krw = NumberFormat('#,###', 'ko');

  @override
  void initState() {
    super.initState();
    widget.controller.addListener(_on);
    widget.controller.load();
  }

  @override
  void dispose() {
    widget.controller.removeListener(_on);
    super.dispose();
  }

  void _on() {
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final c = widget.controller;
    return Scaffold(
      backgroundColor: WMTokens.grey50,
      appBar: AppBar(
        title: const Text(
          '결제',
          style: TextStyle(fontWeight: FontWeight.w700),
        ),
        backgroundColor: WMTokens.white,
        elevation: 0,
      ),
      body: RefreshIndicator(
        onRefresh: c.load,
        child: ListView(
          padding: const EdgeInsets.all(WMTokens.sp4),
          children: [
            if (c.loading && c.plan == null && c.invoices.isEmpty)
              const LinearProgressIndicator(minHeight: 2),
            if (c.error != null) _errorBanner(c.error!),
            _planCard(c),
            const SizedBox(height: WMTokens.sp4),
            _invoicesSection(c),
            const SizedBox(height: WMTokens.sp6),
            _actionButtons(),
          ],
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Plan card
  // ---------------------------------------------------------------------------

  Widget _planCard(OwnerBillingController c) {
    if (c.plan == null && !c.loading) {
      return const _InfoCard(
        label: '현재 플랜',
        child: Text(
          '결제 모듈 준비 중',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: WMTokens.grey500,
          ),
        ),
      );
    }
    final p = c.plan;
    return _InfoCard(
      label: '현재 플랜',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                p != null && p.name.isNotEmpty ? p.name : '—',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: WMTokens.grey900,
                ),
              ),
              const Spacer(),
              if (p != null && p.status.isNotEmpty)
                _StatusChip(status: p.status),
            ],
          ),
          const SizedBox(height: WMTokens.sp2),
          if (p != null && p.monthlyCost > 0) ...[
            Text(
              '${_krw.format(p.monthlyCost)}원 / 월',
              style: const TextStyle(
                fontSize: 14,
                color: WMTokens.grey700,
              ),
            ),
            const SizedBox(height: WMTokens.sp1),
          ],
          if (p != null && p.nextBillingDate.isNotEmpty)
            Text(
              '다음 결제일: ${p.nextBillingDate}',
              style: const TextStyle(fontSize: 13, color: WMTokens.grey500),
            ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Invoices section
  // ---------------------------------------------------------------------------

  Widget _invoicesSection(OwnerBillingController c) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.only(left: 4, bottom: WMTokens.sp2),
          child: Text(
            '최근 인보이스',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: WMTokens.grey600,
            ),
          ),
        ),
        if (c.invoices.isEmpty && !c.loading)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(
                vertical: WMTokens.sp6, horizontal: WMTokens.sp4,),
            decoration: BoxDecoration(
              color: WMTokens.white,
              borderRadius: BorderRadius.circular(WMTokens.rLg),
            ),
            child: const Center(
              child: Text(
                '인보이스가 없습니다.',
                style: TextStyle(color: WMTokens.grey500, fontSize: 14),
              ),
            ),
          )
        else
          ...c.invoices.map((inv) => _InvoiceTile(invoice: inv, krw: _krw)),
      ],
    );
  }

  // ---------------------------------------------------------------------------
  // Action buttons
  // ---------------------------------------------------------------------------

  Widget _actionButtons() {
    return Column(
      children: [
        SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            onPressed: () =>
                widget.onOpenWebView?.call('/owner/billing/portal'),
            icon: const Icon(Icons.open_in_new, size: 18),
            label: const Text('Stripe Portal 열기'),
            style: ElevatedButton.styleFrom(
              backgroundColor: WMTokens.blue500,
              foregroundColor: WMTokens.white,
              padding: const EdgeInsets.symmetric(vertical: WMTokens.sp3),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(WMTokens.rMd),
              ),
            ),
          ),
        ),
        const SizedBox(height: WMTokens.sp3),
        SizedBox(
          width: double.infinity,
          child: OutlinedButton.icon(
            onPressed: () =>
                widget.onOpenWebView?.call('/owner/billing/portal'),
            icon: const Icon(Icons.credit_card_outlined, size: 18),
            label: const Text('결제 수단 변경'),
            style: OutlinedButton.styleFrom(
              foregroundColor: WMTokens.blue500,
              side: const BorderSide(color: WMTokens.blue500),
              padding: const EdgeInsets.symmetric(vertical: WMTokens.sp3),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(WMTokens.rMd),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _errorBanner(String msg) {
    return Container(
      margin: const EdgeInsets.only(bottom: WMTokens.sp3),
      padding: const EdgeInsets.all(WMTokens.sp3),
      decoration: BoxDecoration(
        color: WMTokens.dangerSoft,
        borderRadius: BorderRadius.circular(WMTokens.rMd),
      ),
      child: Row(
        children: [
          const Icon(Icons.error_outline, color: WMTokens.danger, size: 18),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              msg,
              style:
                  const TextStyle(color: WMTokens.danger, fontSize: 13),
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Invoice tile
// ---------------------------------------------------------------------------

class _InvoiceTile extends StatelessWidget {
  const _InvoiceTile({required this.invoice, required this.krw});

  final BillingInvoice invoice;
  final NumberFormat krw;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: WMTokens.sp2),
      padding: const EdgeInsets.symmetric(
          horizontal: WMTokens.sp4, vertical: WMTokens.sp3,),
      decoration: BoxDecoration(
        color: WMTokens.white,
        borderRadius: BorderRadius.circular(WMTokens.rLg),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0A000000),
            blurRadius: 4,
            offset: Offset(0, 1),
          ),
        ],
      ),
      child: Row(
        children: [
          const Icon(Icons.receipt_outlined,
              size: 20, color: WMTokens.grey500,),
          const SizedBox(width: WMTokens.sp3),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  invoice.date.isNotEmpty ? invoice.date : '—',
                  style: const TextStyle(
                      fontSize: 14, color: WMTokens.grey900,),
                ),
                Text(
                  '${krw.format(invoice.amount)}원',
                  style: const TextStyle(
                      fontSize: 13, color: WMTokens.grey600,),
                ),
              ],
            ),
          ),
          _StatusChip(status: invoice.status),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Reusable InfoCard
// ---------------------------------------------------------------------------

class _InfoCard extends StatelessWidget {
  const _InfoCard({required this.label, required this.child});

  final String label;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(WMTokens.sp4),
      decoration: BoxDecoration(
        color: WMTokens.white,
        borderRadius: BorderRadius.circular(WMTokens.rLg),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0A000000),
            blurRadius: 4,
            offset: Offset(0, 1),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              color: WMTokens.grey600,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: WMTokens.sp2),
          child,
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Status chip
// ---------------------------------------------------------------------------

class _StatusChip extends StatelessWidget {
  const _StatusChip({required this.status});

  final String status;

  @override
  Widget build(BuildContext context) {
    final (label, bg, fg) = switch (status.toLowerCase()) {
      'active' => ('활성', const Color(0xFFE6F4E6), const Color(0xFF1A7A1A)),
      'trialing' => ('체험', const Color(0xFFE8F0FE), WMTokens.blue500),
      'paid' => ('납부', const Color(0xFFE6F4E6), const Color(0xFF1A7A1A)),
      'canceled' || 'cancelled' => (
          '취소',
          WMTokens.dangerSoft,
          WMTokens.danger
        ),
      'void' => ('무효', WMTokens.grey100, WMTokens.grey500),
      _ => (status, WMTokens.grey100, WMTokens.grey700),
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(WMTokens.rSm),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: fg,
        ),
      ),
    );
  }
}
