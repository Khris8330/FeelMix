import { Router } from 'expo-router';

/** Go back if possible; otherwise land on the main tabs. */
export function safeGoBack(router: Router, fallback: string = '/(tabs)') {
  try {
    if (typeof (router as any).canGoBack === 'function' && (router as any).canGoBack()) {
      router.back();
      return;
    }
  } catch {
    // fall through
  }

  // Web / deep-link cases where history is empty
  router.replace(fallback as any);
}
