import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { auth, provider } from '../lib/firebase';

export type AuthSnapshot = Readonly<{ ready: boolean; user: User | null }>;

const createAuthStore = () => {
  const state: { snapshot: AuthSnapshot } = {
    snapshot: { ready: false, user: auth.currentUser },
  };

  const emitter = new EventTarget();

  const subscribe = (fn: () => void) => {
    const handler = () => fn();
    emitter.addEventListener('change', handler);
    return () => emitter.removeEventListener('change', handler);
  };

  const getSnapshot = (): AuthSnapshot => state.snapshot;

  onAuthStateChanged(auth, (u) => {
    state.snapshot = { ready: true, user: u };
    emitter.dispatchEvent(new Event('change'));
  });

  const onceReady = (): Promise<AuthSnapshot> =>
    state.snapshot.ready
      ? Promise.resolve(state.snapshot)
      : new Promise((resolve) => {
          const handler = () => {
            emitter.removeEventListener('change', handler);
            resolve(state.snapshot);
          };
          emitter.addEventListener('change', handler);
        });

  return {
    subscribe,
    getSnapshot,
    onceReady,
    signIn: () => signInWithPopup(auth, provider),
    signOut: () => signOut(auth),
  };
};

export const authStore = createAuthStore();
