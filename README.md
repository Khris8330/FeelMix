# FeelMix 🎧🎬

AI-powered mood-to-media matcher. Tell it your vibe (text, emoji, or a
one-tap Life Event), get back one song + one movie that matches, plus a
share-ready image card.

Built as a **zero-budget MVP**  every external call has a free-tier home
and every service class ships with a mock-data fallback, so the app is
fully runnable and demoable with **no API keys configured at all**.

## Stack

| Layer          | Tech                                              |
|----------------|----------------------------------------------------|
| Frontend       | Flutter (mobile + PWA)                             |
| State mgmt     | Provider (`ChangeNotifier`)                        |
| AI / mood NLP  | Groq Cloud (Llama 3, free tier)  Gemini-swappable  |
| Music metadata | Last.fm API (free/unrestricted)                    |
| Movie metadata | TMDB API (free w/ attribution)                     |
| Backend        | Supabase (free tier, Postgres + pgvector-ready)     |

## Project layout

```
lib/
  main.dart                 entry point  loads .env, inits Supabase, runApp
  app.dart                  MaterialApp + theme + Provider root
  theme/app_theme.dart      "Emotional Equalizer" brand system
  models/                   Track, Movie, VibeAnalysis/VibeResult, LifeEvent
  services/                 GroqService, TmdbService, LastFmService, SupabaseService
  providers/vibe_provider.dart   orchestrates the analyze -> match pipeline
  screens/
    vibe_check_screen.dart  Screen 1  "The Vibe Check" (home)
    mix_result_screen.dart  Screen 2  "The Mix" (results)
  widgets/                  glassmorphic UI kit (cards, chips, shimmer, share card, etc.)
```

## Getting started

1. **Get the Flutter platform scaffolding.** This repo ships the Dart
   source only (no `android/`, `ios/`, `web/` folders, since those are
   machine-generated). From the project root:

   ```bash
   flutter create .
   flutter pub get
   ```

2. **(Optional) Add real API keys.** Copy `.env.example` to `.env` and
   fill in whichever free-tier keys you have:

   ```bash
   cp .env.example .env
   # edit .env with your keys
   ```

3. **Run it.**

   ```bash
   flutter run
   # or for web: flutter run -d chrome
   ```

The app works out of the box with mock data if no keys are present.
