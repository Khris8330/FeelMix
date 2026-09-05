import 'package:flutter/material.dart';

import '../models/life_event.dart';
import '../theme/app_theme.dart';

class LifeEventChip extends StatelessWidget {
  final LifeEvent event;
  final bool selected;
  final VoidCallback onTap;

  const LifeEventChip({
    super.key,
    required this.event,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: selected ? AppColors.primary.withOpacity(0.2) : AppColors.surface,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: selected ? AppColors.primary : Colors.white.withOpacity(0.06),
            width: selected ? 1.5 : 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(event.emoji, style: const TextStyle(fontSize: 16)),
            const SizedBox(width: 6),
            Text(
              event.label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
                color: selected ? AppColors.primary : AppColors.textPrimary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
