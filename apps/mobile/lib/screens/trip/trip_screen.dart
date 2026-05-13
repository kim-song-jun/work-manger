import 'package:flutter/material.dart';

import '../../theme/tokens.g.dart';
import 'state/trip_controller.dart';

class TripScreen extends StatefulWidget {
  const TripScreen({super.key, required this.controller});
  final TripController controller;

  @override
  State<TripScreen> createState() => _TripScreenState();
}

class _TripScreenState extends State<TripScreen> {
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

  void _on() => mounted ? setState(() {}) : null;

  Color _statusColor(String? status) {
    switch (status) {
      case 'APPROVED':
        return WMTokens.success;
      case 'REJECTED':
        return WMTokens.danger;
      case 'PENDING':
        return WMTokens.warn;
      default:
        return WMTokens.grey500;
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = widget.controller;
    return Scaffold(
      backgroundColor: WMTokens.grey50,
      appBar: AppBar(
        title: const Text('출장', style: TextStyle(fontWeight: FontWeight.w700)),
        backgroundColor: WMTokens.white,
        elevation: 0,
      ),
      body: RefreshIndicator(
        onRefresh: c.load,
        child: ListView(
          padding: const EdgeInsets.all(WMTokens.sp4),
          children: [
            if (c.loading && c.items.isEmpty) const LinearProgressIndicator(minHeight: 2),
            if (c.items.isEmpty && !c.loading && c.error == null)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 48),
                child: Center(
                  child: Text('출장 내역이 없습니다.', style: TextStyle(color: WMTokens.grey500)),
                ),
              ),
            ...c.items.map((item) {
              final from = item['start_date']?.toString() ?? '';
              final to = item['end_date']?.toString() ?? '';
              final title = item['destination']?.toString() ?? item['title']?.toString() ?? '출장';
              final status = item['status']?.toString();
              return Container(
                margin: const EdgeInsets.only(bottom: WMTokens.sp2),
                decoration: BoxDecoration(
                  color: WMTokens.white,
                  borderRadius: BorderRadius.circular(WMTokens.rMd),
                ),
                child: ListTile(
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: WMTokens.sp4,
                    vertical: WMTokens.sp2,
                  ),
                  title: Text(
                    title,
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      color: WMTokens.grey900,
                    ),
                  ),
                  subtitle: Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Text(
                      '$from ~ $to',
                      style: const TextStyle(color: WMTokens.grey600, fontSize: 13),
                    ),
                  ),
                  trailing: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: _statusColor(status).withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(WMTokens.rSm),
                    ),
                    child: Text(
                      status ?? '-',
                      style: TextStyle(
                        color: _statusColor(status),
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              );
            }),
            if (c.error != null)
              Padding(
                padding: const EdgeInsets.only(top: WMTokens.sp4),
                child: Text(c.error!, style: const TextStyle(color: WMTokens.danger)),
              ),
          ],
        ),
      ),
    );
  }
}
