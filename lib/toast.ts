import { Alert, Platform } from 'react-native';

/** Lightweight feedback that works on web and native. */
export function showToast(title: string, message?: string) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const text = message ? `${title}\n${message}` : title;
    // Prefer a non-blocking feel on web
    try {
      const el = document.createElement('div');
      el.setAttribute('role', 'status');
      el.textContent = text;
      el.style.cssText = [
        'position:fixed',
        'left:50%',
        'bottom:88px',
        'transform:translateX(-50%)',
        'max-width:90vw',
        'background:#1E1E2E',
        'color:#F5F5F7',
        'border:1px solid rgba(255,255,255,0.12)',
        'border-radius:999px',
        'padding:12px 18px',
        'font:600 13px/1.3 system-ui,sans-serif',
        'z-index:99999',
        'box-shadow:0 8px 24px rgba(0,0,0,0.35)',
        'white-space:pre-line',
        'text-align:center',
      ].join(';');
      document.body.appendChild(el);
      window.setTimeout(() => {
        el.style.opacity = '0';
        el.style.transition = 'opacity 200ms';
        window.setTimeout(() => el.remove(), 220);
      }, 2400);
      return;
    } catch {
      // fall through
    }
  }

  Alert.alert(title, message);
}

export function showError(message: string, title = 'Something went wrong') {
  showToast(title, message);
}
