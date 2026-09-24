import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCompetitions } from '../../src/hooks/useCompetition';
import { CompetitionCard } from './index';
import { CompetitionSummary } from '../../src/api/endpoints';
import { DetailsSkeleton, ErrorState } from '../../src/components/common/ui';
import { colors, fontFamily } from '../../src/theme/tokens';
import { useLocale } from '../../src/i18n/strings';

/** Competitions tab — all competitions. */
export default function CompetitionsScreen() {
  const { data, isLoading, isError, refetch } = useCompetitions();
  const { t } = useLocale();
  const items: CompetitionSummary[] = data?.items ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.competitions}</Text>
      </View>

      {isLoading ? (
        <DetailsSkeleton />
      ) : isError ? (
        <ErrorState message={t.couldntLoad} onRetry={() => void refetch()} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(c) => c._id}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 24 }}
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
  title: {
    color: colors.navy,
    fontFamily: fontFamily.bold,
    fontSize: 22,
  },
});
