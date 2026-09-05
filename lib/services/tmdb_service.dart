import 'dart:convert';
import 'dart:math';

import 'package:http/http.dart' as http;

import '../models/movie.dart';
import '../models/vibe_result.dart';

class TmdbService {
  static const _base = 'https://api.themoviedb.org/3';

  String? get _apiKey {
    // Strictly read the key compiled directly from GitHub Secrets via dart-define
    const fromDefine = String.fromEnvironment('TMDB_API_KEY');
    if (fromDefine.isNotEmpty) return fromDefine;
    return null;
  }

  Future<Movie> findMovieForMood(VibeAnalysis analysis) async {
    if (_apiKey == null || _apiKey!.isEmpty) {
      return Movie.mock();
    }

    final keywords = analysis.keywords.isNotEmpty
        ? analysis.keywords.map((k) => k.toLowerCase()).toList()
        : ['drama'];

    bool matchesAny(List<String> terms) =>
        keywords.any((k) => terms.any((t) => k.contains(t)));

    int? genreId;
    if (matchesAny(['horror', 'scary', 'fear', 'creepy', 'terrify'])) {
      genreId = 27; // Horror
    } else if (matchesAny(['thriller', 'suspense', 'tense', 'dread'])) {
      genreId = 53; // Thriller
    } else if (matchesAny(['melanch', 'sad', 'heart', 'grief'])) {
      genreId = 18; // Drama
    } else if (matchesAny(['upbeat', 'happy', 'celebrat', 'joy'])) {
      genreId = 35; // Comedy
    } else if (matchesAny(['romant', 'love'])) {
      genreId = 10749; // Romance
    } else if (matchesAny(['adventur', 'epic', 'journey'])) {
      genreId = 12; // Adventure
    } else if (matchesAny(['atmospher', 'cinematic', 'dreamy', 'surreal'])) {
      genreId = 878; // Sci-Fi
    }

    try {
      final queryParams = {
        'api_key': _apiKey!,
        'language': 'en-US',
        'sort_by': 'popularity.desc',
        'include_adult': 'false',
        'page': '1',
      };
      if (genreId != null) {
        queryParams['with_genres'] = genreId.toString();
      }

      final uri = Uri.parse('$_base/discover/movie').replace(queryParameters: queryParams);
      final res = await http.get(uri);

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        final results = data['results'] as List?;
        if (results != null && results.isNotEmpty) {
          final idx = Random().nextInt(min(5, results.length));
          return Movie.fromTmdb(results[idx] as Map<String, dynamic>);
        }
      }
    } catch (e) {
      // TEMP DEBUG — remove after diagnosing
      // ignore: avoid_print
      print('API CALL FAILED: $e');
    }

    return Movie.mock();
  }
}
