/** Browser storage that never throws (private mode, blocked site data, previews). */
export function readFlag(store: 'local' | 'session', key: string): string | null {
  try {
    return (store === 'local' ? window.localStorage : window.sessionStorage).getItem(key);
  } catch {
    return null;
  }
}

export function writeFlag(store: 'local' | 'session', key: string, value: string) {
  try {
    (store === 'local' ? window.localStorage : window.sessionStorage).setItem(key, value);
  } catch {
    /* ignore */
  }
}
