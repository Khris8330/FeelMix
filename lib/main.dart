import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'app.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Completely optional .env loading — never crash on web or missing file
  try {
    await dotenv.load(fileName: '.env');
  } catch (e) {
    debugPrint('dotenv load skipped: $e');
  }

  // Safely initialize Supabase only when both keys are present
  try {
    final supabaseUrl = dotenv.maybeGet('SUPABASE_URL') ?? '';
    final supabaseAnonKey = dotenv.maybeGet('SUPABASE_ANON_KEY') ?? '';

    if (supabaseUrl.isNotEmpty && supabaseAnonKey.isNotEmpty) {
      await Supabase.initialize(
        url: supabaseUrl,
        anonKey: supabaseAnonKey,
      );
    }
  } catch (e) {
    debugPrint('Supabase init skipped: $e');
  }

  runApp(const FeelMixApp());
}
