import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fontFamily, fontSize, radius } from '../../theme/tokens';
import { useLocale } from '../../i18n/strings';

/** Header row: back + language pills (ENG | हिंदी). */
export function DetailsHeader() {
  const router = useRouter();
  const { locale, setLocale, t } = useLocale();

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.back, { opacity: pressed ? 0.6 : 1 }]}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={8}
      >
        <Ionicons name="arrow-back" size={22} color={colors.navy} />
        <Text style={styles.backText}>{t.goBack}</Text>
      </Pressable>

      <View style={styles.langRow}>
        {(['en', 'hi'] as const).map((l) => (
          <Pressable
            key={l}
            onPress={() => setLocale(l)}
            accessibilityRole="button"
            accessibilityLabel={l === 'en' ? 'English' : 'हिंदी'}
            style={[styles.langPill, locale === l ? styles.langActive : styles.langInactive]}
          >
            <Text style={[styles.langText, locale === l ? styles.langTextActive : styles.langTextInactive]}>
              {l === 'en' ? 'ENG' : 'हिंदी'}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backText: {
    color: colors.navy,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.bodyStrong,
  },
  langRow: {
    flexDirection: 'row',
    backgroundColor: colors.chipBg,
    borderRadius: radius.pill,
    padding: 3,
    gap: 2,
  },
  langPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  langActive: {
    backgroundColor: colors.primary,
  },
  langInactive: {
    backgroundColor: 'transparent',
  },
  langText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.chip,
  },
  langTextActive: {
    color: colors.white,
  },
  langTextInactive: {
    color: colors.textBody,
  },
});
