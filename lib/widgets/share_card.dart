import 'package:flutter/material.dart';
import 'package:screenshot/screenshot.dart';
import 'package:share_plus/share_plus.dart';

import '../models/vibe_result.dart';
import '../theme/app_theme.dart';

class ShareCard extends StatefulWidget {
  final VibeResult result;

  const ShareCard({super.key, required this.result});

  @override
  State<ShareCard> createState() => _ShareCardState();
}

class _ShareCardState extends State<ShareCard> {
  final _screenshotController = ScreenshotController();
  bool _sharing = false;

  static const _brandGrad = LinearGradient(
    colors: [Color(0xFFFF3D8A), Color(0xFFFF7A59)],
    begin: Alignment.bottomCenter,
    end: Alignment.topCenter,
  );

  Future<void> _share() async {
    setState(() => _sharing = true);
    try {
      final image = await _screenshotController.captureFromWidget(
        _buildShareable(),
        delay: const Duration(milliseconds: 100),
        pixelRatio: 2.5,
      );
      await Share.shareXFiles(
        [XFile.fromData(image, name: 'feelmix.png', mimeType: 'image/png')],
        text: 'My FeelMix vibe: ${widget.result.analysis.moodSummary}',
      );
    } catch (e) {
      debugPrint('Share failed: $e');
    } finally {
      if (mounted) setState(() => _sharing = false);
    }
  }

  Widget _buildShareable() {
    final r = widget.result;
    return Container(
      width: 360,
      padding: const EdgeInsets.all(24),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF0B0B12), Color(0xFF14121F)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              // Official fm monogram mark
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: const Color(0xFF0A0E1F),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Stack(
                  children: [
                    Positioned(
                      top: 5,
                      right: 6,
                      child: Container(
                        width: 5,
                        height: 5,
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: _brandGrad,
                        ),
                      ),
                    ),
                    Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            'fm',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w800,
                              height: 1.0,
                              letterSpacing: -0.8,
                              foreground: Paint()
                                ..shader = _brandGrad.createShader(
                                  const Rect.fromLTWH(0, 0, 28, 16),
                                ),
                            ),
                          ),
                          const SizedBox(height: 2),
                          Container(
                            width: 16,
                            height: 2,
                            decoration: BoxDecoration(
                              gradient: _brandGrad,
                              borderRadius: BorderRadius.circular(99),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 10),
              const Text(
                'FeelMix',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Text(
            r.analysis.moodSummary,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.w600,
              height: 1.3,
            ),
          ),
          const SizedBox(height: 18),
          _row(Icons.music_note_rounded, r.track.name, r.track.artist),
          const SizedBox(height: 12),
          _row(Icons.movie_rounded, r.movie.title, r.movie.releaseDate ?? ''),
          const SizedBox(height: 20),
          Text(
            r.explanation,
            style: TextStyle(
              color: Colors.white.withOpacity(0.75),
              fontSize: 13,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }

  Widget _row(IconData icon, String title, String subtitle) {
    return Row(
      children: [
        Icon(icon, color: AppColors.primary, size: 18),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              if (subtitle.isNotEmpty)
                Text(
                  subtitle,
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.55),
                    fontSize: 12,
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        onPressed: _sharing ? null : _share,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
        icon: _sharing
            ? const SizedBox(
                width: 18,
                height: 18,
                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
              )
            : const Icon(Icons.ios_share_rounded),
        label: Text(_sharing ? 'Preparing…' : 'Share this mix'),
      ),
    );
  }
}
