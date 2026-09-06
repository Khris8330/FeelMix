import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/vibe_provider.dart';
import '../theme/app_theme.dart';
import '../widgets/explanation_bubble.dart';
import '../widgets/movie_card.dart';
import '../widgets/share_card.dart';
import '../widgets/shimmer_card.dart';
import '../widgets/support_banner.dart';
import '../widgets/tactile_scale.dart';
import '../widgets/track_card.dart';

class MixResultScreen extends StatelessWidget {
  const MixResultScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: AppColors.backgroundGradient),
        child: SafeArea(
          child: Consumer<VibeProvider>(
            builder: (context, provider, _) {
              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        TactileScale(
                          onTap: () {
                            provider.clear();
                            Navigator.of(context).pop();
                          },
                          child: Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: AppColors.surfaceGlass,
                              borderRadius: BorderRadius.circular(AppRadii.sm),
                              border: Border.all(color: AppColors.borderGlass),
                            ),
                            child: const Icon(Icons.arrow_back_rounded, size: 20),
                          ),
                        ),
                        const SizedBox(width: 14),
                        Text(
                          'THE MIX',
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                letterSpacing: 1.2,
                                fontWeight: FontWeight.w800,
                              ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    Expanded(child: _buildBody(context, provider)),
                  ],
                ),
              );
            },
          ),
        ),
      ),
    );
  }

  Widget _buildBody(BuildContext context, VibeProvider provider) {
    switch (provider.status) {
      case VibeStatus.idle:
      case VibeStatus.loading:
        return const Column(
          children: [
            ShimmerCard(),
            SizedBox(height: 16),
            ShimmerCard(),
            SizedBox(height: 16),
            ShimmerCard(),
          ],
        );

      case VibeStatus.error:
        return Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.cloud_off_rounded, size: 48, color: Colors.white54),
              const SizedBox(height: 16),
              Text(
                provider.errorMessage ?? 'Something went wrong',
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.white70),
              ),
              const SizedBox(height: 20),
              TactileScale(
                onTap: () {
                  provider.clear();
                  Navigator.of(context).pop();
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceGlass,
                    borderRadius: BorderRadius.circular(AppRadii.pill),
                    border: Border.all(color: AppColors.borderGlass),
                  ),
                  child: const Text(
                    'Try again',
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
                  ),
                ),
              ),
            ],
          ),
        );

      case VibeStatus.success:
        final result = provider.result!;
        return ListView(
          children: [
            if (provider.showSupportBanner) const SupportBanner(),
            ExplanationBubble(
              primaryEmotion: result.analysis.primaryEmotion,
              text: result.explanation,
            ),
            const SizedBox(height: 18),
            TrackCard(track: result.track),
            const SizedBox(height: 16),
            MovieCard(movie: result.movie),
            const SizedBox(height: 24),
            ShareCard(result: result),
            const SizedBox(height: 24),
          ],
        );
    }
  }
}
