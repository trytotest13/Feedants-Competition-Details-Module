import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCompetitions } from '../../src/hooks/useCompetition';
import { CompetitionSummary } from '../../src/api/endpoints';
import { DetailsSkeleton, ErrorState } from '../../src/components/common/ui';
import { colors, fontFamily, fontSize, radius } from '../../src/theme/tokens';
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

export function CompetitionCard({ item }: { item: CompetitionSummary }) {
  const stateLabel = STATE_LABEL[item.view.state] ?? item.view.state;
  const open = item.view.state === 'registration_open';

  return (
    <Pressable
      onPress={() => router.push(`/competition/${item.slug}`)}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.title}`}
    >
      <View style={styles.cardHeader}>
        <View style={styles.badgeWrap}>
          <Ionicons
            name={open ? 'ellipse' : 'ellipse-outline'}
            size={8}
            color={open ? colors.accent : colors.silver}
          />
          <Text style={[styles.badge, open && styles.badgeOpen]}>{stateLabel}</Text>
        </View>
        <Text style={styles.category}>{item.category}</Text>
      </View>

      <Text style={styles.title}>{item.title}</Text>

      <View style={styles.statsRow}>
        <View>
          <Text style={styles.statLabel}>Prize Pool</Text>
          <Text style={styles.prize}>{formatRupees(item.prizePool)}</Text>
        </View>
        <View>
          <Text style={styles.statLabel}>Entry Fee</Text>
          <Text style={styles.fee}>{formatRupees(item.entryFee)}</Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.spots}>
            {item.view.state === 'registration_full'
              ? 'Full'
              : `${item.view.spotsLeft} spots left`}
          </Text>
          <Text style={styles.close}>
            Closes {formatShortDate(item.schedule.registrationCloseAt)}
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
    backgroundColor: colors.mint,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badge: {
    color: colors.textBody,
    fontFamily: fontFamily.medium,
    fontSize: 11,
  },
  badgeOpen: {
    color: colors.accent,
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
