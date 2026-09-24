import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily, fontSize, radius } from '../../theme/tokens';
import { useLocale } from '../../i18n/strings';
import { Competition } from '../../api/types';

/** Mint disclaimer banner. */
export function DisclaimerBanner({ competition }: { competition: Competition }) {
  const { t } = useLocale();
  if (!competition.disclaimer) return null;

  return (
    <View style={styles.banner}>
      <Ionicons name="information-circle" size={16} color={colors.accent} />
      <Text style={styles.text}>
        <Text style={styles.strong}>{t.disclaimer} </Text>
        {competition.disclaimer.replace(/^Disclaimer:\s*/i, '')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.mint,
    borderRadius: radius.inner,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 16,
  },
  text: {
    flex: 1,
    color: colors.textBody,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.caption,
  },
  strong: {
    color: colors.accent,
    fontFamily: fontFamily.semibold,
  },
});
