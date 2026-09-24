import { Alert, Linking, Platform, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';

/**
 * Cross-platform dialogs and sharing.
 * react-native-web's Alert.alert is a no-op and Share.share rejects on
 * browsers without the Web Share API — these helpers keep every button
 * functional on native AND web.
 */

/** Open an external URL — synchronous window.open on web avoids popup blocking. */
export async function openExternal(url: string): Promise<void> {
  if (!url) return;
  if (Platform.OS === 'web') {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  await Linking.openURL(url);
}

export function showAlert(title: string, message?: string): void {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}

export function confirmAsync(title: string, message: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'No', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Yes, continue', style: 'destructive', onPress: () => resolve(true) },
    ], { cancelable: true, onDismiss: () => resolve(false) });
  });
}

/** Share text natively; on web fall back to the Web Share API, then clipboard. */
export async function shareOrCopy(text: string): Promise<'shared' | 'copied'> {
  if (Platform.OS !== 'web') {
    await Share.share({ message: text });
    return 'shared';
  }
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ text });
      return 'shared';
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return 'shared'; // user dismissed the share sheet — nothing to do
      }
      await Clipboard.setStringAsync(text);
      return 'copied';
    }
  }
  await Clipboard.setStringAsync(text);
  return 'copied';
}
