import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/vibe_provider.dart';
import '../theme/app_theme.dart';
import '../widgets/explanation_bubble.dart';
import '../widgets/movie_card.dart';
import '../widgets/share_card.dart';
import '../widgets/track_card.dart';

class MixResultScreen extends StatelessWidget {
  const MixResultScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<VibeProvider>();
    final result = provider.result;

    if (result == null) {
      return const Scaffold(
        backgroundColor: AppColors.bg,
        body: Center(child: Text('No mix yet')),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () {
            provider.clear();
            Navigator.of(context).pop();
          },
        ),
        title: const Text(
          'Your Mix',
          style: TextStyle(
            fontWeight: FontWeight.w700,
            letterSpacing: -0.5,
          ),
        ),
        centerTitle: true,
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 40),
          children: [
            if (provider.error != null)
              Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.orange.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.orange.withOpacity(0.3)),
                ),
                child: Text(
                  provider.error!,
                  style: const TextStyle(color: Colors.orangeAccent, fontSize: 13),
                ),
              ),
            ExplanationBubble(text: result.explanation),
            const SizedBox(height: 24),
            TrackCard(track: result.track),
            const SizedBox(height: 16),
            MovieCard(movie: result.movie),
            const SizedBox(height: 32),
            ShareCard(result: result),
            const SizedBox(height: 24),
            Text(
              'Mood: ${result.analysis.moodSummary}',
              style: const TextStyle(
                color: AppColors.textSecondary,
                fontSize: 13,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Wrap(
              alignment: WrapAlignment.center,
              spacing: 8,
              children: result.analysis.keywords
                  .map((k) => Chip(
                        label: Text(k),
                        backgroundColor: AppColors.surface,
                        labelStyle: const TextStyle(fontSize: 12),
                      ))
                  .toList(),
            ),
          ],
        ),
      ),
    );
  }
}
