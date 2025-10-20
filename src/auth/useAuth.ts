import { useSyncExternalStore } from 'react';
import { authStore } from './authStore';

export const useAuth = () =>
  useSyncExternalStore(authStore.subscribe, authStore.getSnapshot, authStore.getSnapshot);
