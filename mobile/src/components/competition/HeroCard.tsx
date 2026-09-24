import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Chip, ProgressBar } from '../common/ui';
import { colors, fontFamily, fontSize, radius } from '../../theme/tokens';
import { formatRupees } from '../../utils/format';
import { useLocale } from '../../i18n/strings';
import { Competition, CompetitionView } from '../../api/types';

/** Hero card: title + Registered badge, chips, prize/fee, spots progress. */
export function HeroCard({ competition, view }: { competition: Competition; view: CompetitionView }) {
  const { t } = useLocale();

  return (
    <Card>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{competition.title}</Text>
        {view.isRegistered ? (
          <View style={styles.registeredBadge}>
            <Ionicons name="checkmark-circle" size={14} color={colors.accent} />
            <Text style={styles.registeredText}>{t.registered}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.chipsRow}>
        <Chip label={competition.category} />
        {competition.tags.map((tag) => (
          <Chip key={tag} label={tag} />
        ))}
        {competition.certificate ? (
          <View style={styles.certificateChip}>
            <Ionicons name="trophy-outline" size={13} color={colors.accent} />
            <Text style={styles.certificateText}>{t.winnersGetCertificate}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>{t.prizePool}</Text>
          <Text style={styles.prize}>{formatRupees(competition.prizePool)}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>{t.entryFee}</Text>
          <Text style={styles.fee}>{formatRupees(competition.entryFee)}</Text>
        </View>
        <View style={styles.spots}>
          <View style={styles.spotsLabelRow}>
            <Ionicons name="people-outline" size={14} color={colors.tangerine} />
            <Text style={styles.spotsText}>
              {view.state === 'registration_full'
                ? t.allSpotsFilled
                : `${view.spotsLeft} ${t.spotsLeft}`}
            </Text>
          </View>
          <ProgressBar percent={view.fillPercent} />
          <Text style={styles.bookedCaption}>
            {view.bookedCount} / {view.capacity} {t.booked}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  title: {
    flex: 1,
    color: colors.navy,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.title,
  },
  registeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.mint,
    borderWidth: 1,
    borderColor: colors.mintBorder,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  registeredText: {
    color: colors.primary,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.chip,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  certificateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  certificateText: {
    color: colors.primary,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.chip,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 24,
  },
  stat: {
    minWidth: 88,
  },
  statLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.caption,
  },
  prize: {
    color: colors.primary,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.price,
    marginTop: 2,
  },
  fee: {
    color: colors.navy,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.price,
    marginTop: 2,
  },
  spots: {
    flex: 1,
    minWidth: 120,
    alignSelf: 'flex-end',
    gap: 6,
  },
  spotsLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  spotsText: {
    color: colors.tangerineText,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.chip,
  },
  bookedCaption: {
    color: colors.textBody,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.caption,
  },
});
