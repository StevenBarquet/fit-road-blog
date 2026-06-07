'use client';

// ---Dependencies
import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  // -----------------------CONSTS, HOOKS, STATES

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
  }, []);

  // -----------------------RENDER
  return null;
}
