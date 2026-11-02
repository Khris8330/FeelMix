# FeelMix (placeholder name)

Social app with mood to media. V1 is frontend only (Expo React Native), mock data, no backend.

## Stack

- Expo (React Native) + Expo Router
- Web, iOS, Android from one codebase
- Dark UI, pink/coral brand accents

## V1 features (frontend wired)

- Home feed with posts and embedded vibes
- Like / comment / share actions (local state)
- Discover + mood mix flow
- Create post
- Friends: follow style list
- Profile (posts / vibes / about)
- User profile with follow + DM request rules
- Mood to media demo (mock result + share to feed)

## Run locally

```bash
npm install
npm run web
# or
npm start
```

## V2 (later)

- Supabase auth, database, realtime
- Real API keys server-side
- DM request accept flow
- Production deploy

## Note

The previous Flutter app remains in `lib/` until migration is complete. The active product path is the Expo app at the repo root.
