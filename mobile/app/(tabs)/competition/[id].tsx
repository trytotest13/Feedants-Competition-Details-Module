import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCompetition } from '../../../src/hooks/useCompetition';
import { DetailsHeader } from '../../../src/components/competition/DetailsHeader';
import { HeroCard } from '../../../src/components/competition/HeroCard';
import { JudgeCard } from '../../../src/components/competition/JudgeCard';
import { CountdownBanner } from '../../../src/components/competition/CountdownBanner';
import { ImportantDatesCard } from '../../../src/components/competition/ImportantDatesCard';
import { WinnersStrip } from '../../../src/components/competition/WinnersStrip';
import { InfoTabs } from '../../../src/components/competition/InfoTabs';
import { RewardsCard } from '../../../src/components/competition/RewardsCard';
import { DisclaimerBanner } from '../../../src/components/competition/DisclaimerBanner';
import { PaymentsCard } from '../../../src/components/competition/PaymentsCard';
import { ReferEarnCard } from '../../../src/components/competition/ReferEarnCard';
import { TestimonialsCard } from '../../../src/components/competition/TestimonialsCard';
import { AdSlot } from '../../../src/components/competition/AdSlot';
import { StickyCta } from '../../../src/components/competition/StickyCta';
import { DetailsSkeleton, ErrorState } from '../../../src/components/common/ui';
import { useLocale } from '../../../src/i18n/strings';
import { colors } from '../../../src/theme/tokens';

/**
 * Competition Details screen — the assignment's core deliverable.
 * Sections render in the reference design's order, driven entirely by the
 * aggregated API response (server-computed lifecycle view + winners + testimonials).
 */
export default function CompetitionDetailsScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const idOrSlug = Array.isArray(params.id) ? params.id[0]! : params.id!;
  const { data, isLoading, isError, refetch } = useCompetition(idOrSlug);
  const { t } = useLocale();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <DetailsHeader />

      {isLoading ? (
        <DetailsSkeleton />
      ) : isError || !data ? (
        <ErrorState message={t.couldntLoad} onRetry={() => void refetch()} />
      ) : (
        <View style={styles.flex}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <HeroCard competition={data.competition} view={data.view} />
            <JudgeCard judge={data.competition.judge} />

            {data.view.countdown ? (
              <View style={styles.bannerWrap}>
                <CountdownBanner
                  target={data.view.countdown.target}
                  endsAt={data.view.countdown.endsAt}
                />
              </View>
            ) : null}

            <ImportantDatesCard competition={data.competition} />
            <WinnersStrip winners={data.winners} />
            <InfoTabs competition={data.competition} />
            <View style={styles.padding}>
              <RewardsCard rewards={data.competition.rewards} />
            </View>
            <DisclaimerBanner competition={data.competition} />
            <View style={styles.padding}>
              <PaymentsCard competition={data.competition} />
            </View>
            <View style={styles.padding}>
              <ReferEarnCard rewardPerSignup={data.competition.referral.rewardPerSignup} />
            </View>
            <TestimonialsCard testimonials={data.testimonials} />
            <View style={styles.adWrap}>
              <AdSlot competition={data.competition} />
            </View>
          </ScrollView>

          <View style={styles.ctaWrap}>
            <StickyCta
              idOrSlug={idOrSlug}
              competition={data.competition}
              view={data.view}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingBottom: 12,
    gap: 12,
  },
  bannerWrap: {
    paddingHorizontal: 16,
  },
  padding: {
    paddingHorizontal: 16,
  },
  adWrap: {
    marginTop: 2,
  },
  ctaWrap: {
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 0,
    paddingTop: 8,
    paddingBottom: 6,
  },
});
