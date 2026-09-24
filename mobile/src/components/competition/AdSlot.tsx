import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily, fontSize, radius } from '../../theme/tokens';
import { useLocale } from '../../i18n/strings';
import { Competition } from '../../api/types';

/** Dashed ad placeholder (or the served ad creative when enabled). */
export function AdSlot({ competition }: { competition: Competition }) {
  const { t } = useLocale();
  const { adSlot } = competition;

  if (adSlot.enabled && adSlot.imageUrl) {
    return (
      <View style={styles.filled}>
        <Image source={{ uri: adSlot.imageUrl }} style={styles.image} resizeMode="cover" />
      </View>
    );
  }

  return (
    <View style={styles.placeholder}>
      <Ionicons name="megaphone-outline" size={16} color={colors.textMuted} />
      <Text style={styles.text}>{t.adHere}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: radius.inner,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filled: {
    marginHorizontal: 16,
    borderRadius: radius.inner,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 90,
  },
  text: {
    color: colors.textMuted,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.caption,
  },
});
