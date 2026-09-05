import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import 'glass_container.dart';

class ExplanationBubble extends StatelessWidget {
  final String text;
  final String? primaryEmotion;

  const ExplanationBubble({
    super.key,
    required this.text,
    this.primaryEmotion,
  });

  /// Convenience constructor used by the richer result screen
  const ExplanationBubble.rich({
    super.key,
    required String primaryEmotion,
    required String explanation,
  })  : primaryEmotion = primaryEmotion,
        text = explanation;

  @override
  Widget build(BuildContext context) {
    return GlassContainer(
      padding: const EdgeInsets.all(18),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              gradient: AppColors.equalizerGradient,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.auto_awesome, color: Colors.white, size: 18),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (primaryEmotion != null) ...[
                  Text(
                    primaryEmotion!.toUpperCase(),
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1.1,
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(height: 6),
                ],
                Text(
                  text,
                  style: const TextStyle(
                    fontSize: 15,
                    height: 1.45,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
