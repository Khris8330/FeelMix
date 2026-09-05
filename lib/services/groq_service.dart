import 'dart:convert';

import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;

import '../models/movie.dart';
import '../models/track.dart';
import '../models/vibe_result.dart';

class GroqService {
  static const _baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
  static const _model = 'llama-3.1-8b-instant';

  String? get _apiKey {
    // Strictly read the key compiled directly from GitHub Secrets via dart-define
    const fromDefine = String.fromEnvironment('GROQ_API_KEY');
    if (fromDefine.isNotEmpty) return fromDefine;
    
    // Emergency Hardcoded Fallback (Optional): 
    // If dart-define fails on web, you can temporarily paste your key as a string here:
    // return "gsk_your_actual_key_here";
    
    return null;
  }

  Future<VibeAnalysis> analyzeMood(String userInput) async {
    if (_apiKey == null || _apiKey!.isEmpty) {
      return _mockAnalysis('KEY_WAS: ${_apiKey ?? "NULL"}');
    }

    final system = '''
You are a precise mood analyst for a media recommendation app.
Given a short user description of how they feel, return ONLY valid JSON with these keys:
- mood_summary: one short poetic sentence
- keywords: array of 3-5 short tags
- energy: "low" | "medium" | "high"
- valence: "negative" | "neutral" | "positive"
No markdown, no extra text.
''';

    final body = {
      'model': _model,
      'messages': [
        {'role': 'system', 'content': system},
        {'role': 'user', 'content': userInput},
      ],
      'temperature': 0.4,
      'max_tokens': 200,
    };

    try {
      final res = await http.post(
        Uri.parse(_baseUrl),
        headers: {
          'Authorization': 'Bearer $_apiKey',
          'Content-Type': 'application/json',
        },
        body: jsonEncode(body),
      );

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        final content = data['choices'][0]['message']['content'] as String;
        final cleaned = content.replaceAll(RegExp(r'```json|```'), '').trim();
        return VibeAnalysis.fromJson(jsonDecode(cleaned));
      }
    } catch (e) {
  // TEMP DEBUG — remove after diagnosing
  // ignore: avoid_print
  print('API CALL FAILED: $e');
    }

    return _mockAnalysis(userInput);
  }

  Future<String> explainMatch({
    required VibeAnalysis analysis,
    required Track track,
    required Movie movie,
  }) async {
    if (_apiKey == null || _apiKey!.isEmpty) {
      return 'When the world feels heavy, "${track.name}" by ${track.artist} and ${movie.title} meet you exactly where you are.';
    }

    final prompt = '''
Write one warm, concise paragraph (max 2 sentences) explaining why the song "${track.name}" by ${track.artist} and the film "${movie.title}" perfectly match this mood: ${analysis.moodSummary}.
Keep it human, poetic, and under 40 words.
''';

    final body = {
      'model': _model,
      'messages': [
        {'role': 'user', 'content': prompt},
      ],
      'temperature': 0.7,
      'max_tokens': 100,
    };

    try {
      final res = await http.post(
        Uri.parse(_baseUrl),
        headers: {
          'Authorization': 'Bearer $_apiKey',
          'Content-Type': 'application/json',
        },
        body: jsonEncode(body),
      );

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        return data['choices'][0]['message']['content'] as String;
      }
    } catch (_) {}

    return 'When the world feels heavy, "${track.name}" by ${track.artist} and ${movie.title} meet you exactly where you are.';
  }

  VibeAnalysis _mockAnalysis(String input) {
    final lower = input.toLowerCase();
    if (lower.contains('heart') || lower.contains('break') || lower.contains('sad')) {
      return const VibeAnalysis(
        moodSummary: 'A quiet ache that still wants beauty',
        keywords: ['melancholy', 'reflective', 'soft'],
        energy: 'low',
        valence: 'negative',
      );
    }
    if (lower.contains('celebrat') || lower.contains('happy') || lower.contains('win')) {
      return const VibeAnalysis(
        moodSummary: 'Bright energy looking for a soundtrack',
        keywords: ['upbeat', 'grateful', 'energetic'],
        energy: 'high',
        valence: 'positive',
      );
    }
    return const VibeAnalysis(
      moodSummary: 'A layered, thoughtful headspace',
      keywords: ['atmospheric', 'introspective', 'cinematic'],
      energy: 'medium',
      valence: 'neutral',
    );
  }
}
