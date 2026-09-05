import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import 'tactile_scale.dart';

class VibeInputBar extends StatefulWidget {
  final TextEditingController controller;
  final bool enabled;
  final VoidCallback onSubmit;

  const VibeInputBar({
    super.key,
    required this.controller,
    required this.enabled,
    required this.onSubmit,
  });

  @override
  State<VibeInputBar> createState() => _VibeInputBarState();
}

class _VibeInputBarState extends State<VibeInputBar> {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 6),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(28),
            border: Border.all(color: Colors.white.withOpacity(0.06)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.35),
                blurRadius: 20,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: widget.controller,
                  enabled: widget.enabled,
                  style: const TextStyle(fontSize: 15),
                  decoration: const InputDecoration(
                    hintText: 'Describe your vibe…',
                    hintStyle: TextStyle(color: AppColors.textSecondary),
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  ),
                  onSubmitted: (_) {
                    if (widget.enabled) widget.onSubmit();
                  },
                  textInputAction: TextInputAction.send,
                ),
              ),
              const SizedBox(width: 4),
              TactileScale(
                onTap: widget.enabled ? widget.onSubmit : null,
                child: Container(
                  width: 46,
                  height: 46,
                  decoration: const BoxDecoration(
                    gradient: AppColors.equalizerGradient,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: Color(0x66FF3D8A),
                        blurRadius: 14,
                        spreadRadius: 1,
                      ),
                    ],
                  ),
                  child: const Icon(
                    Icons.arrow_upward_rounded,
                    color: Colors.white,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
