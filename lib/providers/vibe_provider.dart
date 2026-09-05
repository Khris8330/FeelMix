import 'package:flutter/foundation.dart';

import '../models/life_event.dart';
import '../models/movie.dart';
import '../models/track.dart';
import '../models/vibe_result.dart';
import '../services/groq_service.dart';
import '../services/lastfm_service.dart';
import '../services/supabase_service.dart';
import '../services/tmdb_service.dart';

class VibeProvider extends ChangeNotifier {
  final GroqService _groq = GroqService();
  final TmdbService _tmdb = TmdbService();
  final LastFmService _lastfm = LastFmService();
  final SupabaseService _supabase = SupabaseService();

  bool isLoading = false;
  String? error;
  VibeResult? result;
  String? lastInput;

  Future<void> analyzeVibe(String input, {LifeEvent? lifeEvent}) async {
    if (input.trim().isEmpty && lifeEvent == null) return;

    isLoading = true;
    error = null;
    result = null;
    lastInput = input.isNotEmpty ? input : lifeEvent?.label;
    notifyListeners();

    try {
      final prompt = lifeEvent != null
          ? '${lifeEvent.promptHint}. User also said: $input'
          : input;

      final analysis = await _groq.analyzeMood(prompt);

      // Parallel fetch for speed
      final results = await Future.wait([
        _lastfm.findTrackForMood(analysis),
        _tmdb.findMovieForMood(analysis),
      ]);

      final track = results[0] as Track;
      final movie = results[1] as Movie;

      final explanation = await _groq.explainMatch(
        analysis: analysis,
        track: track,
        movie: movie,
      );

      result = VibeResult(
        analysis: analysis,
        track: track,
        movie: movie,
        explanation: explanation,
      );

      // Fire-and-forget persistence
      _supabase.saveVibeResult(result!);
    } catch (e, st) {
      debugPrint('Vibe analysis failed: $e\n$st');
      error = 'Something went wrong. Showing a curated fallback mix.';
      // Graceful degradation
      result = VibeResult(
        analysis: VibeAnalysis(
          moodSummary: 'A reflective moment',
          keywords: ['melancholy', 'atmospheric'],
          energy: 'low',
          valence: 'negative',
        ),
        track: Track.mock(),
        movie: Movie.mock(),
        explanation:
            'When words fail, sometimes the right song and film say everything for you.',
      );
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  void clear() {
    result = null;
    error = null;
    lastInput = null;
    notifyListeners();
  }
}
