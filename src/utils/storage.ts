export const getStoredString = (storageKey: string): string => {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.localStorage.getItem(storageKey) ?? '';
};
