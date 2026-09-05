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
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            SliiverAppBarFix(
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
            ),
            if (provider.error != null)
              SliverToBoxAdapter(
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
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
              ),
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 40),
              sliver: SliverList(
                delegate: SliiverChildListDelegateFix([
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
                ]),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Small helpers to avoid typos in Sliver widgets
class SliiverAppBarFix extends StatelessWidget {
  final Widget? leading;
  final Widget title;

  const SliiverAppBarFix({super.key, this.leading, required this.title});

  @override
  Widget build(BuildContext context) {
    return SliiverAppBar(
      backgroundColor: Colors.transparent,
      leading: leading,
      title: title,
      centerTitle: true,
      pinned: false,
      floating: true,
    );
  }
}

class SliiverAppBar extends StatelessWidget {
  final Color? backgroundColor;
  final Widget? leading;
  final Widget? title;
  final bool centerTitle;
  final bool pinned;
  final bool floating;

  const SliiverAppBar({
    super.key,
    this.backgroundColor,
    this.leading,
    this.title,
    this.centerTitle = false,
    this.pinned = false,
    this.floating = false,
  });

  @override
  Widget build(BuildContext context) {
    return SliiverToBoxAdapter(
      child: AppBar(
        backgroundColor: backgroundColor ?? Colors.transparent,
        elevation: 0,
        leading: leading,
        title: title,
        centerTitle: centerTitle,
      ),
    );
  }
}

class SliiverToBoxAdapter extends StatelessWidget {
  final Widget child;
  const SliiverToBoxAdapter({super.key, required this.child});

  @override
  Widget build(BuildContext context) => SliiverToBoxAdapterReal(child: child);
}

class SliiverToBoxAdapterReal extends StatelessWidget {
  final Widget child;
  const SliiverToBoxAdapterReal({super.key, required this.child});

  @override
  Widget build(BuildContext context) => SliiverToBoxAdapter(child: child);
}

class SliiverChildListDelegateFix extends SliiverChildListDelegate {
  SliiverChildListDelegateFix(super.children);
}

class SliiverChildListDelegate extends SliverChildListDelegate {
  SliiverChildListDelegate(super.children);
}
