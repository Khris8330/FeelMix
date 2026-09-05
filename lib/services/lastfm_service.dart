import 'dart:convert';

import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;

import '../models/track.dart';
import '../models/vibe_result.dart';

class LastFmService {
  static const _base = 'https://ws.audioscrobbler.com/2.0/';

  String? get _apiKey {
    const fromDefine = String.fromEnvironment('LASTFM_API_KEY');
    if (fromDefine.isNotEmpty) return fromDefine;
    try {
      return dotenv.env['LASTFM_API_KEY'];
    } catch (_) {
      return null;
    }
  }

  Future<Track> findTrackForMood(VibeAnalysis analysis) async {
    if (_apiKey == null || _apiKey!.isEmpty) {
      return Track.mock();
    }

    final tag = analysis.keywords.isNotEmpty
        ? analysis.keywords.first
        : analysis.moodSummary.split(' ').first;

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
          return Track.fromLastFm(tracks.first as Map<String, dynamic>);
        }
      }
    } catch (_) {}

    return Track.mock();
  }
}
