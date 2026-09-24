import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily } from '../../theme/tokens';

interface Props {
  uri?: string;
  name: string;
  size?: number;
}

/** Avatar with graceful initial fallback when a photo URL is missing/broken. */
export function Avatar({ uri, name, size = 48 }: Props) {
  const [failed, setFailed] = React.useState(false);
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  if (!uri || failed) {
    return (
      <View
        style={[
          styles.fallback,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
        accessible
        accessibilityLabel={`${name} avatar`}
      >
        <Text style={[styles.initial, { fontSize: size * 0.42 }]}>{initial}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      onError={() => setFailed(true)}
      accessible
      accessibilityLabel={`${name} avatar`}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: colors.mint,
    borderWidth: 1,
    borderColor: colors.mintBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    color: colors.accent,
    fontFamily: fontFamily.semibold,
  },
});
