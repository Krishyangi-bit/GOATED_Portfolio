import { useEffect, useRef } from 'react';

/** Calls `onUnlock` whenever the visitor types `code` (outside form fields). */
export function useSecretCode(code: string, onUnlock: () => void) {
  const cb = useRef(onUnlock);
  cb.current = onUnlock;

  useEffect(() => {
    let buffer = '';
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
      buffer = (buffer + e.key.toLowerCase()).slice(-code.length);
      if (buffer === code) {
        buffer = '';
        cb.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [code]);
}
