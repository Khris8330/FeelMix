import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../models/vibe_result.dart';

class SupabaseService {
  bool get _ready {
    try {
      Supabase.instance.client;
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<void> saveVibeResult(VibeResult result) async {
    if (!_ready) return;

    try {
      final client = Supabase.instance.client;
      await client.from('vibe_logs').insert({
        'mood_summary': result.analysis.moodSummary,
        'keywords': result.analysis.keywords,
        'energy': result.analysis.energy,
        'valence': result.analysis.valence,
        'track_name': result.track.name,
        'track_artist': result.track.artist,
        'movie_title': result.movie.title,
        'explanation': result.explanation,
        'created_at': DateTime.now().toIso8601String(),
      });
    } catch (e) {
      debugPrint('Supabase save skipped: $e');
    }
  }
}
