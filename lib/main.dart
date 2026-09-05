import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'app.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Optional .env — ignore any failure (missing file is normal)
  try {
    await dotenv.load(fileName: '.env');
  } catch (e) {
    debugPrint('dotenv: $e');
  }

  // Optional Supabase — only init when keys exist
  try {
    String supabaseUrl = '';
    String supabaseAnonKey = '';
    try {
      supabaseUrl = dotenv.env['SUPABASE_URL'] ?? '';
      supabaseAnonKey = dotenv.env['SUPABASE_ANON_KEY'] ?? '';
    } catch (_) {}

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
