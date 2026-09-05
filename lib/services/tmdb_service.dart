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

    final keyword = analysis.keywords.isNotEmpty
        ? analysis.keywords.first.toLowerCase()
        : 'drama';

    int? genreId;
    if (keyword.contains('melanch') || keyword.contains('sad') || keyword.contains('heart')) {
      genreId = 18;
    } else if (keyword.contains('upbeat') || keyword.contains('happy') || keyword.contains('celebrat')) {
      genreId = 35;
    } else if (keyword.contains('atmospher') || keyword.contains('cinematic')) {
      genreId = 878;
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
