import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  static const bg = Color(0xFF0B0B12);
  static const surface = Color(0xFF161622);
  static const surfaceElevated = Color(0xFF1E1E2E);
  static const primary = Color(0xFFFF3D8A); // hot pink
  static const secondary = Color(0xFF7B61FF); // soft purple
  static const accent = Color(0xFF00E5C7); // teal
  static const textPrimary = Color(0xFFF5F5F7);
  static const textSecondary = Color(0xFF9A9AB0);
  static const glass = Color(0x22FFFFFF);

  static const equalizerGradient = LinearGradient(
    colors: [Color(0xFFFF3D8A), Color(0xFF7B61FF), Color(0xFF00E5C7)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}

class AppTheme {
  static ThemeData get dark {
    final base = ThemeData.dark(useMaterial3: true);
    return base.copyWith(
      scaffoldBackgroundColor: AppColors.bg,
      colorScheme: base.colorScheme.copyWith(
        primary: AppColors.primary,
        secondary: AppColors.secondary,
        surface: AppColors.surface,
        onSurface: AppColors.textPrimary,
      ),
      textTheme: GoogleFonts.plusJakartaSansTextTheme(base.textTheme).apply(
        bodyColor: AppColors.textPrimary,
        displayColor: AppColors.textPrimary,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
      chipTheme: ChipThemeData(
        backgroundColor: AppColors.surface,
        labelStyle: const TextStyle(color: AppColors.textPrimary, fontSize: 13),
        side: BorderSide.none,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      ),
    );
  }
}
