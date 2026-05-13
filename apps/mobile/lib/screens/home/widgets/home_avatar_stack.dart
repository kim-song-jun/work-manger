import 'package:flutter/material.dart';

import '../../../theme/tokens.g.dart';

class HomeAvatarStack extends StatelessWidget {
  const HomeAvatarStack({super.key, required this.urls, this.maxVisible = 5});

  final List<String> urls;
  final int maxVisible;

  @override
  Widget build(BuildContext context) {
    if (urls.isEmpty) return const SizedBox.shrink();
    final visible = urls.take(maxVisible).toList();
    final extra = urls.length - visible.length;
    return SizedBox(
      height: 32,
      child: Stack(
        children: [
          for (var i = 0; i < visible.length; i++)
            Positioned(
              left: i * 22.0,
              child: Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: WMTokens.grey200,
                  shape: BoxShape.circle,
                  border: Border.all(color: WMTokens.white, width: 2),
                ),
                clipBehavior: Clip.hardEdge,
                child: Image.network(
                  visible[i],
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => const Icon(
                    Icons.person,
                    size: 18,
                    color: WMTokens.grey500,
                  ),
                ),
              ),
            ),
          if (extra > 0)
            Positioned(
              left: visible.length * 22.0,
              child: Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: WMTokens.grey100,
                  shape: BoxShape.circle,
                  border: Border.all(color: WMTokens.white, width: 2),
                ),
                alignment: Alignment.center,
                child: Text(
                  '+$extra',
                  style: const TextStyle(
                    color: WMTokens.grey700,
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
