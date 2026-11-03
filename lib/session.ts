const KEY = 'krimie_auth';

export function isAuthed(): boolean {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(KEY) === '1';
    }
  } catch {
    // ignore
  }
  return false;
}

export function signIn(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(KEY, '1');
    }
  } catch {
    // ignore
  }
}

export function signOut(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(KEY);
    }
  } catch {
    // ignore
  }
}
