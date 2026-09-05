import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

class EqualizerLogo extends StatelessWidget {
  const EqualizerLogo({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: 72,
          height: 72,
          decoration: BoxDecoration(
            gradient: AppColors.equalizerGradient,
            borderRadius: BorderRadius.circular(22),
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withOpacity(0.35),
                blurRadius: 24,
                spreadRadius: 2,
              ),
            ],
          ),
          child: const Icon(
            Icons.graphic_eq_rounded,
            color: Colors.white,
            size: 38,
          ),
        ),
        const SizedBox(height: 12),
        Text(
          'FeelMix',
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.6,
            foreground: Paint()
              ..shader = AppColors.equalizerGradient.createShader(
                const Rect.fromLTWH(0, 0, 120, 30),
              ),
          ),
        ),
      ],
    );
  }
}
