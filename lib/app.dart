import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'providers/vibe_provider.dart';
import 'screens/vibe_check_screen.dart';
import 'theme/app_theme.dart';

class FeelMixApp extends StatelessWidget {
  const FeelMixApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => VibeProvider(),
      child: MaterialApp(
        title: 'FeelMix',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.dark,
        home: const VibeCheckScreen(),
      ),
    );
  }
}
