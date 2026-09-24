import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'feedants.auth.token';
const USER_KEY = 'feedants.auth.user';

/**
 * SecureStore (Keychain/Keystore) on native; localStorage fallback on web —
 * Expo Go runs the same code everywhere.
 */
async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {
      // storage unavailable (private mode) — session-only auth
    }
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return globalThis.localStorage?.getItem(key) ?? null;
  }
  return SecureStore.getItemAsync(key);
}

async function removeItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export const tokenStorage = {
  getToken: () => getItem(TOKEN_KEY),
  saveToken: (token: string) => setItem(TOKEN_KEY, token),
  clearToken: () => removeItem(TOKEN_KEY),
  getUser: async () => {
    const raw = await getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  saveUser: (user: unknown) => setItem(USER_KEY, JSON.stringify(user)),
  clearUser: () => removeItem(USER_KEY),
};
