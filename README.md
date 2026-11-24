# Krimie

Social app with mood-to-media (Mood Mix), posts, stories, DMs, and follows.
Built with **Expo (React Native) + Expo Router** and **Supabase**.

Web is live via Vercel. Mobile runs with **Expo Go** (this pass).

## Stack

- Expo SDK 52 + Expo Router
- Supabase (auth, database, storage, realtime)
- One codebase for web, iOS, and Android
- Dark UI, pink/coral accents

## Run on your phone (Expo Go)

1. Install **Expo Go** from the Play Store (Android) or App Store (iOS).
2. On a computer (same Wi‑Fi as your phone if possible):

```bash
git clone https://github.com/Khris8330/FeelMix.git
cd FeelMix
npm install
npm start
```

3. When the QR code appears:
   - **Android:** open Expo Go → Scan QR code
   - **iOS:** open the Camera app → scan the QR code → open in Expo Go

If the phone cannot reach your computer (different networks / hotspot):

```bash
npm run start:tunnel
```

Then scan the new QR code.

## Run on web (local)

```bash
npm install
npm run web
```

## What works on mobile

- Sign up / sign in (email OTP)
- Feed, profile, discover, create post
- Stories, reactions, comments
- Messages and message requests
- Mood Mix, notifications, settings
- Photo picker for avatar, posts, and stories (permissions configured)

## Notes

- Supabase is already wired in the app for Expo Go.
- Logo and custom domain can come later; current branding uses the placeholder icon.
- Store builds (EAS / Play Store / App Store) are a later step after Expo Go testing.
