import { supabase } from './supabase';
import type { VibeEmbed } from '@/data/mock';

export type MoodMixResult = VibeEmbed & { insight?: string };

const FUNCTIONS_URL = 'https://zdstgohvufnoafoiizvu.supabase.co/functions/v1/mood-mix';
const ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpkc3Rnb2h2dWZub2Fmb2lpenZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2NjM1NDUsImV4cCI6MjEwOTIzOTU0NX0.s9rS79uuUXsN_9oSofmpXwXu7KLtd_lMikTt965bREw';

export async function requestMoodMix(input: {
  text: string;
  lifeEvent: string | null;
}): Promise<{ result: MoodMixResult | null; error: string | null }> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) {
    return { result: null, error: 'Please sign in to use Mood Mix.' };
  }

  try {
    const res = await fetch(FUNCTIONS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        apikey: ANON_KEY,
      },
      body: JSON.stringify({
        text: input.text,
        lifeEvent: input.lifeEvent,
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      return {
        result: null,
        error: json.error || json.detail || 'Mood Mix failed. Try again.',
      };
    }

    const r = json.result;
    if (!r) return { result: null, error: 'Empty response from Mood Mix.' };

    return {
      result: {
        moodTitle: r.moodTitle,
        moodSubtitle: r.moodSubtitle,
        trackName: r.trackName,
        trackArtist: r.trackArtist,
        movieTitle: r.movieTitle,
        movieYear: r.movieYear,
        movieDirector: r.movieDirector,
        coverUrl: r.coverUrl,
        insight: r.insight,
      },
      error: null,
    };
  } catch (e: any) {
    return { result: null, error: e?.message || 'Network error' };
  }
}
