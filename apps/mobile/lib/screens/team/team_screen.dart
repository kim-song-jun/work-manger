import 'package:flutter/material.dart';

import '../../theme/tokens.g.dart';
import 'state/team_controller.dart';

class TeamScreen extends StatefulWidget {
  const TeamScreen({super.key, required this.controller});

  final TeamController controller;

  @override
  State<TeamScreen> createState() => _TeamScreenState();
}

class _TeamScreenState extends State<TeamScreen> {
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
          '팀',
          style: TextStyle(fontWeight: FontWeight.w700),
        ),
        backgroundColor: WMTokens.white,
        elevation: 0,
      ),
      body: Column(
        children: [
          if (c.loading && c.members.isEmpty)
            const LinearProgressIndicator(minHeight: 2),
          if (c.error != null) _errorBanner(c.error!),
          Expanded(
            child: RefreshIndicator(
              onRefresh: c.load,
              child: c.members.isEmpty && !c.loading
                  ? _empty()
                  : ListView.builder(
                      itemCount: c.members.length,
                      itemBuilder: (_, i) => _MemberTile(member: c.members[i]),
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _errorBanner(String msg) {
    return Container(
      margin: const EdgeInsets.all(12),
      padding: const EdgeInsets.all(12),
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
              style: const TextStyle(color: WMTokens.danger, fontSize: 13),
            ),
          ),
        ],
      ),
    );
  }

  Widget _empty() {
    return ListView(
      children: const [
        SizedBox(height: 80),
        Icon(Icons.group_outlined, size: 64, color: WMTokens.grey400),
        SizedBox(height: 12),
        Center(
          child: Text(
            '팀원이 없습니다.',
            style: TextStyle(color: WMTokens.grey600, fontSize: 14),
          ),
        ),
      ],
    );
  }
}

class _MemberTile extends StatelessWidget {
  const _MemberTile({required this.member});

  final TeamMember member;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: WMTokens.white,
        borderRadius: BorderRadius.circular(WMTokens.rMd),
      ),
      child: Row(
        children: [
          const Icon(Icons.person, size: 36, color: WMTokens.grey400),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  member.name,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 15,
                    color: WMTokens.grey900,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  member.role,
                  style: const TextStyle(
                    fontSize: 13,
                    color: WMTokens.grey600,
                  ),
                ),
              ],
            ),
          ),
          _StatusBadge(status: member.status),
        ],
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({required this.status});

  final String status;

  @override
  Widget build(BuildContext context) {
    final (label, bg, fg) = switch (status) {
      'WORKING' => ('근무중', WMTokens.successSoft, WMTokens.success),
      'OVERTIME' => ('연장중', WMTokens.warnSoft, WMTokens.warn),
      'ON_LEAVE' => ('휴가', WMTokens.infoSoft, WMTokens.info),
      _ => ('부재', WMTokens.grey100, WMTokens.grey500),
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(WMTokens.rSm),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: fg,
        ),
      ),
    );
  }
}
