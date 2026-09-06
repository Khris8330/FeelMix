import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

/// Official FeelMix logo — dark rounded tile with gradient "fm" monogram,
/// accent bar, and status dot. Matches the branding SVG.
class EqualizerLogo extends StatelessWidget {
  final double size;

  const EqualizerLogo({super.key, this.size = 88});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        _FmMonogram(size: size),
        const SizedBox(height: 14),
        Text(
          'FeelMix',
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.8,
            foreground: Paint()
              ..shader = const LinearGradient(
                colors: [Color(0xFFFF3D8A), Color(0xFFFF7A59)],
                begin: Alignment.bottomCenter,
                end: Alignment.topCenter,
              ).createShader(const Rect.fromLTWH(0, 0, 140, 30)),
          ),
        ),
      ],
    );
  }
}

class _FmMonogram extends StatelessWidget {
  final double size;

  const _FmMonogram({required this.size});

  static const _grad = LinearGradient(
    colors: [Color(0xFFFF3D8A), Color(0xFFFF7A59)],
    begin: Alignment.bottomCenter,
    end: Alignment.topCenter,
  );

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: const Color(0xFF0A0E1F),
        borderRadius: BorderRadius.circular(size * 0.22),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(0.28),
            blurRadius: 22,
            spreadRadius: 1,
          ),
        ],
      ),
      child: Stack(
        children: [
          // Small accent dot (top-right)
          Positioned(
            top: size * 0.14,
            right: size * 0.16,
            child: Container(
              width: size * 0.07,
              height: size * 0.07,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                gradient: _grad,
              ),
            ),
          ),
          // "fm" monogram + underline
          Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'fm',
                  style: TextStyle(
                    fontSize: size * 0.38,
                    fontWeight: FontWeight.w800,
                    height: 1.0,
                    letterSpacing: -1.5,
                    foreground: Paint()
                      ..shader = _grad.createShader(
                        Rect.fromLTWH(0, 0, size * 0.55, size * 0.4),
                      ),
                  ),
                ),
                SizedBox(height: size * 0.04),
                Container(
                  width: size * 0.42,
                  height: size * 0.045,
                  decoration: BoxDecoration(
                    gradient: _grad,
                    borderRadius: BorderRadius.circular(99),
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
