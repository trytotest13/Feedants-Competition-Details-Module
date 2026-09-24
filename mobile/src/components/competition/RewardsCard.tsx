import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, SectionTitle } from '../common/ui';
import { colors, fontFamily, fontSize } from '../../theme/tokens';
import { formatRupees } from '../../utils/format';
import { useLocale } from '../../i18n/strings';
import { Reward } from '../../api/types';

/** Rewards list — trophy/medal/star icons by position, amounts right-aligned. */
export function RewardsCard({ rewards }: { rewards: Reward[] }) {
  const { t } = useLocale();

  return (
    <Card>
      <SectionTitle suffix={t.allPositions}>{t.rewards}</SectionTitle>
      <View style={styles.rows}>
        {rewards.map((reward) => (
          <View key={reward.position} style={styles.row}>
            <View style={styles.left}>
              <RewardIcon position={reward.position} />
              <Text style={styles.label}>{reward.label}</Text>
            </View>
            <Text style={styles.amount}>{formatRupees(reward.amount)}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

function RewardIcon({ position }: { position: number }) {
  if (position === 1) {
    return <Ionicons name="trophy" size={18} color={colors.amber} />;
  }
  if (position === 2 || position === 3) {
    return <Ionicons name="medal" size={18} color={position === 2 ? colors.silver : '#CD7F32'} />;
  }
  return <Ionicons name="star-outline" size={17} color={colors.silver} />;
}

const styles = StyleSheet.create({
  rows: {
    marginTop: 10,
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    color: colors.navy,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.body,
  },
  amount: {
    color: colors.navy,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.bodyStrong,
  },
});
