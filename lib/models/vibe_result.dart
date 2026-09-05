import 'movie.dart';
import 'track.dart';

class VibeAnalysis {
  final String moodSummary;
  final List<String> keywords;
  final String energy; // low | medium | high
  final String valence; // negative | neutral | positive

  const VibeAnalysis({
    required this.moodSummary,
    required this.keywords,
    required this.energy,
    required this.valence,
  });

  factory VibeAnalysis.fromJson(Map<String, dynamic> json) {
    return VibeAnalysis(
      moodSummary: json['mood_summary'] as String? ?? 'A complex feeling',
      keywords: (json['keywords'] as List?)?.cast<String>() ?? [],
      energy: json['energy'] as String? ?? 'medium',
      valence: json['valence'] as String? ?? 'neutral',
    );
  }
}

class VibeResult {
  final VibeAnalysis analysis;
  final Track track;
  final Movie movie;
  final String explanation;

  const VibeResult({
    required this.analysis,
    required this.track,
    required this.movie,
    required this.explanation,
  });
}
