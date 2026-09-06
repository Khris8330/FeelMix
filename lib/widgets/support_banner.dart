// lib/widgets/support_banner.dart
import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

/// A calm, non-alarming banner shown alongside (never instead of) the normal
/// mix, when the user's input contained language suggesting a serious
/// personal safety concern.
///
/// NOTE for whoever deploys this: replace the placeholder text below with a
/// hotline / resource genuinely relevant to your primary user base's region.
/// A wrong or generic number here is worse than no number — verify before
/// shipping to a specific country.
class SupportBanner extends StatelessWidget {
  const SupportBanner({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: AppColors.surfaceGlass,
        borderRadius: BorderRadius.circular(AppRadii.md),
        border: Border.all(color: AppColors.borderGlass),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.favorite_rounded, color: Colors.pinkAccent, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "If something serious is going on, you don't have to handle it alone.",
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                      ),
                ),
                const SizedBox(height: 6),
                Text(
                  // TODO: replace with a region-appropriate helpline before launch.
                  'Consider reaching out to a trusted adult, local authorities, or a helpline in your area.',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.white70,
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
