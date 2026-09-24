import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCompetitions } from '../../src/hooks/useCompetition';
import { CompetitionSummary } from '../../src/api/endpoints';
import { DetailsSkeleton, ErrorState } from '../../src/components/common/ui';
import { colors, ctaGradient, fontFamily, fontSize, radius } from '../../src/theme/tokens';
import { formatRupees, formatShortDate } from '../../src/utils/format';
import { useLocale } from '../../src/i18n/strings';

const STATE_LABEL: Record<string, string> = {
  upcoming: 'Coming soon',
  registration_open: 'Registration open',
  registration_full: 'All spots filled',
  awaiting_submission: 'Submissions soon',
  submission_open: 'Submissions open',
  judging: 'Judging',
  completed: 'Completed',
};

/** Per-state badge colors — saturated signal chips (contrast system). */
const STATE_BADGE: Record<string, { bg: string; fg: string; filled?: boolean }> = {
  registration_open: { bg: colors.gradStart, fg: colors.white, filled: true },
  submission_open: { bg: colors.emeraldTint, fg: '#0B815A' },
  judging: { bg: colors.tangerineTint, fg: '#C25E12' },
  registration_full: { bg: colors.coralTint, fg: '#D64545' },
  completed: { bg: colors.slateTint, fg: colors.textBody },
  awaiting_submission: { bg: colors.slateTint, fg: colors.textBody },
  upcoming: { bg: colors.surface, fg: colors.textMuted },
};

export function CompetitionCard({ item }: { item: CompetitionSummary }) {
  const state = item.view.state;
  const stateLabel = STATE_LABEL[state] ?? state;
  const badge = STATE_BADGE[state] ?? { bg: colors.slateTint, fg: colors.textBody };
  const open = state === 'registration_open';

  return (
    <Pressable
      onPress={() => router.push(`/competition/${item.slug}`)}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.title}`}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.badgeWrap, { backgroundColor: badge.bg }]}>
          <Ionicons
            name={badge.filled ? 'ellipse' : 'ellipse-outline'}
            size={8}
            color={badge.filled ? colors.white : badge.fg}
          />
          <Text style={[styles.badge, { color: badge.fg }]}>{stateLabel}</Text>
        </View>
        <Text style={styles.category}>{item.category}</Text>
      </View>

      <Text style={styles.title}>{item.title}</Text>

      <View style={styles.statsRow}>
        <View>
          <Text style={styles.statLabel}>Prize Pool</Text>
          {open ? (
            <LinearGradient
              colors={[...ctaGradient]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.prizeUnderline}
            >
              <Text style={[styles.prize, { color: colors.white }]}>
                {formatRupees(item.prizePool)}
              </Text>
            </LinearGradient>
          ) : (
            <Text style={styles.prize}>{formatRupees(item.prizePool)}</Text>
          )}
        </View>
        <View>
          <Text style={styles.statLabel}>Entry Fee</Text>
          <Text style={styles.fee}>{formatRupees(item.entryFee)}</Text>
        </View>
        <View style={styles.right}>
          <Text
            style={[
              styles.spots,
              state === 'registration_full' && { color: '#D64545' },
            ]}
          >
            {item.view.state === 'registration_full'
              ? 'Full'
              : `${item.view.spotsLeft} spots left`}
          </Text>
          <Text style={styles.close}>
            {state === 'completed'
              ? 'Result declared'
              : state === 'judging'
                ? 'Judging in progress'
                : state === 'upcoming'
                  ? `Opens ${formatShortDate(item.schedule.registrationOpenAt)}`
                  : `Closes ${formatShortDate(item.schedule.registrationCloseAt)}`}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

/** Home tab — featured competition + everything else. */
export default function HomeScreen() {
  const { data, isLoading, isError, refetch } = useCompetitions();
  const { t } = useLocale();

  const items = data?.items ?? [];
  const featured =
    items.find((c) => c.view.state === 'registration_open') ?? items[0];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.brand}>Feedants</Text>
        <Text style={styles.tagline}>Compete from anywhere</Text>
      </View>

      {isLoading ? (
        <DetailsSkeleton />
      ) : isError ? (
        <ErrorState message={t.couldntLoad} onRetry={() => void refetch()} />
      ) : (
        <FlatList
          data={featured ? items.filter((c) => c._id !== featured._id) : items}
          keyExtractor={(c) => c._id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            featured ? (
              <View style={styles.featuredWrap}>
                <Text style={styles.sectionLabel}>Featured</Text>
                <CompetitionCard item={featured} />
              </View>
            ) : null
          }
          renderItem={({ item }) => <CompetitionCard item={item} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  brand: {
    color: colors.navy,
    fontFamily: fontFamily.bold,
    fontSize: 22,
  },
  tagline: {
    color: colors.textMuted,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.caption,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.chip,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  featuredWrap: {
    marginBottom: 14,
  },
  list: {
    padding: 16,
    gap: 12,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    padding: 14,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badge: {
    fontFamily: fontFamily.semibold,
    fontSize: 11,
  },
  prizeUnderline: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    marginHorizontal: -6,
    borderRadius: 6,
    paddingVertical: 1,
  },
  category: {
    color: colors.textMuted,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.chip,
  },
  title: {
    color: colors.navy,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.heading,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 22,
    alignItems: 'flex-end',
  },
  statLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.regular,
    fontSize: 11,
  },
  prize: {
    color: colors.primary,
    fontFamily: fontFamily.bold,
    fontSize: 18,
  },
  fee: {
    color: colors.navy,
    fontFamily: fontFamily.bold,
    fontSize: 18,
  },
  right: {
    flex: 1,
    alignItems: 'flex-end',
  },
  spots: {
    color: colors.accent,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.chip,
  },
  close: {
    color: colors.textMuted,
    fontFamily: fontFamily.regular,
    fontSize: 11,
  },
});
