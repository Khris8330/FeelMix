import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/vibe_provider.dart';
import '../theme/app_theme.dart';
import '../widgets/explanation_bubble.dart';
import '../widgets/movie_card.dart';
import '../widgets/shimmer_card.dart';
import '../widgets/share_card.dart';
import '../widgets/tactile_scale.dart';
import '../widgets/track_card.dart';

/// Screen 2 — "The Mix". Shows the AI's top matched Track + Flick, its
/// contextual explanation, and a Share Card export action.
class MixResultScreen extends StatefulWidget {
  const MixResultScreen({super.key});

  @override
  State<MixResultScreen> createState() => _MixResultScreenState();
}

class _MixResultScreenState extends State<MixResultScreen> {
  final _exporter = ShareCardExporter();
  bool _sharing = false;

  Future<void> _share() async {
    final result = context.read<VibeProvider>().result;
    if (result == null || _sharing) return;
    setState(() => _sharing = true);
    try {
      await _exporter.exportAndShare(result);
    } finally {
      if (mounted) setState(() => _sharing = false);
    }
  }

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
                          onTap: () => Navigator.of(context).pop(),
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
                        Text('THE MIX',
                            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                  letterSpacing: 1.2,
                                  fontWeight: FontWeight.w800,
                                )),
                      ],
                    ),
                    const SizedBox(height: 24),
                    Expanded(child: _buildBody(provider)),
                  ],
                ),
              );
            },
          ),
        ),
      ),
    );
  }

  Widget _buildBody(VibeProvider provider) {
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
                onTap: () => Navigator.of(context).pop(),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceGlass,
                    borderRadius: BorderRadius.circular(AppRadii.pill),
                    border: Border.all(color: AppColors.borderGlass),
                  ),
                  child: const Text('Try again',
                      style: TextStyle(
                          color: Colors.white, fontWeight: FontWeight.w600)),
                ),
              ),
            ],
          ),
        );

      case VibeStatus.success:
        final result = provider.result!;
        return ListView(
          children: [
            ExplanationBubble(
              primaryEmotion: result.analysis.primaryEmotion,
              explanation: result.analysis.explanation,
            ),
            const SizedBox(height: 18),
            TrackCard(track: result.track),
            const SizedBox(height: 16),
            MovieCard(movie: result.movie),
            const SizedBox(height: 24),
            TactileScale(
              onTap: _sharing ? null : _share,
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 16),
                decoration: BoxDecoration(
                  gradient: AppColors.equalizerGradient,
                  borderRadius: BorderRadius.circular(AppRadii.pill),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x66FF3D8A),
                      blurRadius: 20,
                      spreadRadius: 1,
                    ),
                  ],
                ),
                child: Center(
                  child: _sharing
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : Row(
                          mainAxisSize: MainAxisSize.min,
                          children: const [
                            Icon(Icons.ios_share_rounded, color: Colors.white, size: 18),
                            SizedBox(width: 8),
                            Text(
                              'Share Card',
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ),
                ),
              ),
            ),
            const SizedBox(height: 24),
          ],
        );
    }
  }
}
