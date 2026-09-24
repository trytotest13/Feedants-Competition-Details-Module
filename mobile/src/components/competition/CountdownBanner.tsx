import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily, radius } from '../../theme/tokens';
import { useCountdown } from '../../hooks/useCountdown';
import { useLocale } from '../../i18n/strings';
import { CountdownTarget } from '../../api/types';

const pad = (n: number) => String(n).padStart(2, '0');

/** Mint countdown banner — live ticking, label depends on the lifecycle target. */
export function CountdownBanner({
  target,
  endsAt,
}: {
  target: CountdownTarget;
  endsAt: string;
}) {
  const { t } = useLocale();
  const parts = useCountdown(endsAt);

  const label =
    target === 'registration_close'
      ? t.registrationClosesIn
      : target === 'submission_start'
        ? t.submissionOpensIn
        : target === 'submission_end'
          ? t.submissionClosesIn
          : t.resultsIn;

  const urgent = target === 'registration_close' || target === 'submission_end';

  return (
    <View style={styles.banner}>
      <View style={styles.side}>
        <Ionicons name="hourglass-outline" size={16} color={colors.primary} />
        <Text style={styles.label}>{label}</Text>
      </View>

      <Text style={styles.digits}>
        {parts
          ? `${pad(parts.days)}d : ${pad(parts.hours)}h : ${pad(parts.minutes)}m : ${pad(parts.seconds)}s`
          : '--d : --h : --m : --s'}
      </Text>

      {urgent ? (
        <View style={styles.side}>
          <Ionicons name="alarm-outline" size={16} color={colors.tangerine} />
          <Text style={styles.hurry}>{t.hurryUp}</Text>
        </View>
      ) : (
        <View style={styles.sideSpacer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.mint,
    borderWidth: 1,
    borderColor: colors.mintBorder,
    borderRadius: radius.inner,
    paddingHorizontal: 10,
    paddingVertical: 12,
    gap: 6,
  },
  side: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexShrink: 1,
  },
  sideSpacer: {
    width: 52,
  },
  label: {
    color: colors.ink,
    fontFamily: fontFamily.semibold,
    fontSize: 11,
    flexShrink: 1,
  },
  digits: {
    color: colors.ink,
    fontFamily: fontFamily.bold,
    fontSize: 13,
    fontVariant: ['tabular-nums'],
    flexShrink: 0,
  },
  hurry: {
    color: colors.tangerineText,
    fontFamily: fontFamily.bold,
    fontSize: 11,
  },
});
