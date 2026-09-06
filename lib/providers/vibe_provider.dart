import 'package:flutter/foundation.dart';

import '../models/life_event.dart';
import '../models/movie.dart';
import '../models/track.dart';
import '../models/vibe_result.dart';
import '../services/groq_service.dart';
import '../services/lastfm_service.dart';
import '../services/supabase_service.dart';
import '../services/tmdb_service.dart';

enum VibeStatus { idle, loading, success, error }

class VibeProvider extends ChangeNotifier {
  final GroqService _groq = GroqService();
  final TmdbService _tmdb = TmdbService();
  final LastFmService _lastfm = LastFmService();
  final SupabaseService _supabase = SupabaseService();

  VibeStatus status = VibeStatus.idle;
  bool isLoading = false;
  String? error;
  String? get errorMessage => error;
  VibeResult? result;
  String? lastInput;

  /// True when the raw input contains language suggesting a serious personal
  /// safety concern — shown as a supportive banner alongside the normal mix,
  /// never as a replacement for it.
  bool showSupportBanner = false;

  // Keep this list to *patterns*, not exhaustive phrasing — it only needs to
  // catch clearly serious language, not every possible way of expressing it.
  // Expand as needed; false positives here are low-cost (just an extra banner).
  static const _concernPatterns = [
    'stalk',
    'following me',
    'watching me',
    'someone is after me',
    'abuse',
    'abusive',
    'being hurt',
    'hurting me',
    'threatened',
    'threatening me',
    'unsafe at home',
    'assault',
    'harass',
    'suicid',
    'kill myself',
    'want to die',
    'end my life',
    'no reason to live',
    'self harm',
    'self-harm',
    'hurt myself',
    'cutting myself',
    'rape',
    'molest',
  ];

  bool _detectsSeriousConcern(String input) {
    final lower = input.toLowerCase();
    return _concernPatterns.any((p) => lower.contains(p));
  }

  Future<void> analyzeVibe(String input, {LifeEvent? lifeEvent}) async {
    if (input.trim().isEmpty && lifeEvent == null) return;

    status = VibeStatus.loading;
    isLoading = true;
    error = null;
    result = null;
    lastInput = input.isNotEmpty ? input : lifeEvent?.label;
    showSupportBanner = _detectsSeriousConcern(input);
    notifyListeners();

    try {
      final prompt = lifeEvent != null
          ? '${lifeEvent.promptHint}. User also said: $input'
          : input;

      final analysis = await _groq.analyzeMood(prompt);

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

      status = VibeStatus.success;
      _supabase.saveVibeResult(result!);
    } catch (e, st) {
      debugPrint('Vibe analysis failed: $e\n$st');
      error = 'Something went wrong. Showing a curated fallback mix.';
      status = VibeStatus.error;

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
    status = VibeStatus.idle;
    result = null;
    error = null;
    lastInput = null;
    isLoading = false;
    showSupportBanner = false;
    notifyListeners();
  }
}
