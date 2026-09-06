import 'dart:convert';
import 'dart:math';

import 'package:http/http.dart' as http;

import '../models/track.dart';
import '../models/vibe_result.dart';

class LastFmService {
  static const _base = 'https://ws.audioscrobbler.com/2.0/';

  String? get _apiKey {
    // Strictly read the key compiled directly from GitHub Secrets via dart-define
    const fromDefine = String.fromEnvironment('LASTFM_API_KEY');
    if (fromDefine.isNotEmpty) return fromDefine;
    return null;
  }

  Future<Track> findTrackForMood(VibeAnalysis analysis) async {
    if (_apiKey == null || _apiKey!.isEmpty) {
      return Track.mock();
    }

    // Try every keyword Groq gave us, not just the first — plus a guaranteed
    // fallback tag derived from energy/valence, since Last.fm's tag catalog
    // is patchy and a specific mood word may return zero tracks.
    final candidateTags = <String>[
      ...analysis.keywords.map((k) => k.toLowerCase()),
      if (analysis.valence == 'negative') 'sad',
      if (analysis.valence == 'positive') 'happy',
      if (analysis.energy == 'high') 'energetic',
      if (analysis.energy == 'low') 'chill',
      'chill', // last-resort tag that virtually always has results
    ];

    for (final tag in candidateTags) {
      try {
        final uri = Uri.parse(_base).replace(queryParameters: {
          'method': 'tag.gettoptracks',
          'tag': tag,
          'api_key': _apiKey!,
          'format': 'json',
          'limit': '5',
        });

        final res = await http.get(uri);
        if (res.statusCode == 200) {
          final data = jsonDecode(res.body);
          final tracks = data['tracks']?['track'] as List?;
          if (tracks != null && tracks.isNotEmpty) {
            final idx = Random().nextInt(min(5, tracks.length));
            return Track.fromLastFm(tracks[idx] as Map<String, dynamic>);
          }
        }
      } catch (e) {
        // TEMP DEBUG — remove after diagnosing
        // ignore: avoid_print
        print('API CALL FAILED (tag: $tag): $e');
      }
    }

    return Track.mock();
  }
}
