import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, SectionTitle } from '../common/ui';
import { colors, fontFamily, fontSize } from '../../theme/tokens';
import { formatShortDate, formatTime } from '../../utils/format';
import { useLocale } from '../../i18n/strings';
import { Competition } from '../../api/types';

/** 2×2 grid of the competition's key dates with icons. */
export function ImportantDatesCard({ competition }: { competition: Competition }) {
  const { t } = useLocale();
  const s = competition.schedule;

  const cells: { icon: keyof typeof Ionicons.glyphMap; label: string; iso: string }[] = [
    { icon: 'calendar-outline', label: t.registerBefore, iso: s.registrationCloseAt },
    { icon: 'paper-plane-outline', label: t.submissionStarts, iso: s.submissionStartAt },
    { icon: 'cloud-upload-outline', label: t.submissionEnds, iso: s.submissionEndAt },
    { icon: 'trophy-outline', label: t.resultDate, iso: s.resultAt },
  ];

  return (
    <Card style={{ padding: 14 }}>
      <SectionTitle>{t.importantDates}</SectionTitle>
      <View style={styles.grid}>
        {cells.map((cell, i) => (
          <View
            key={cell.label}
            style={[styles.cell, i % 2 === 0 && styles.cellLeft, i < 2 && styles.cellTop]}
          >
            <View style={styles.iconWrap}>
              <Ionicons name={cell.icon} size={20} color={colors.accent} />
            </View>
            <View>
              <Text style={styles.label}>{cell.label}</Text>
              <Text style={styles.date}>{formatShortDate(cell.iso)}</Text>
              <Text style={styles.time}>{formatTime(cell.iso)}</Text>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cell: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    backgroundColor: colors.surface,
  },
  cellLeft: {
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  cellTop: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: colors.textMuted,
    fontFamily: fontFamily.regular,
    fontSize: 11,
  },
  date: {
    color: colors.navy,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.bodyStrong,
  },
  time: {
    color: colors.navy,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.caption,
  },
});
