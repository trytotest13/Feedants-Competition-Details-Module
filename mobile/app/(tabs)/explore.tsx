import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { useCompetitions } from '../../src/hooks/useCompetition';
import { useDebounce } from '../../src/hooks/useDebounce';
import { competitionApi, CompetitionSummary } from '../../src/api/endpoints';
import { CompetitionCard } from './index';
import { DetailsSkeleton, ErrorState } from '../../src/components/common/ui';
import { colors, ctaGradient, fontFamily, fontSize, radius } from '../../src/theme/tokens';
import { useLocale } from '../../src/i18n/strings';

/**
 * Explore tab — live competition search. Free-text query (debounced) hits the
 * server's `?q=` search across title/category/tags; category chips filter via
 * `?category=`. All data comes from the API, nothing hardcoded.
 */
export default function ExploreScreen() {
  const { t } = useLocale();
  const [text, setText] = useState('');
  const [category, setCategory] = useState('All');
  const debouncedQuery = useDebounce(text, 300);

  // Category chips are derived from the full dataset (server data, not hardcoded)
  const { data: allData } = useCompetitions();
  const categories: string[] = [
    'All',
    ...Array.from(new Set((allData?.items ?? []).map((c) => c.category))),
  ];

  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['explore', debouncedQuery, category],
    queryFn: () => competitionApi.list(debouncedQuery, category),
    placeholderData: (prev) => prev, // keep previous results visible while typing
  });

  const items: CompetitionSummary[] = data?.items ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.exploreTitle}</Text>

        <View style={styles.searchWrap}>
          <Ionicons name="search" size={17} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder={t.searchPlaceholder}
            placeholderTextColor={colors.textMuted}
            value={text}
            onChangeText={setText}
            autoCapitalize="none"
            returnKeyType="search"
            accessibilityLabel={t.searchPlaceholder}
          />
          {text.length > 0 ? (
            <Pressable
              onPress={() => setText('')}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              hitSlop={8}
            >
              <Ionicons name="close-circle" size={17} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.chipsRow}>
          {categories.map((cat) => {
            const active = category === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => setCategory(cat)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={({ pressed }) => [styles.chipOuter, pressed && { opacity: 0.8 }]}
              >
                {active ? (
                  <LinearGradient
                    colors={[...ctaGradient]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.chip}
                  >
                    <Text style={styles.chipTextActive}>{cat}</Text>
                  </LinearGradient>
                ) : (
                  <View style={[styles.chip, styles.chipInactive]}>
                    <Text style={styles.chipText}>{cat}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      {isError ? (
        <ErrorState message={t.couldntLoad} onRetry={() => void refetch()} />
      ) : isLoading ? (
        <DetailsSkeleton />
      ) : items.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="search-outline" size={36} color={colors.silver} />
          <Text style={styles.emptyTitle}>{t.noResults}</Text>
          <Text style={styles.emptyHint}>{t.noResultsHint}</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(c) => c._id}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 24 }}
          renderItem={({ item }) => <CompetitionCard item={item} />}
        />
      )}

      {isFetching && !isLoading && items.length > 0 ? (
        <Text style={styles.refreshing}>{t.loading}</Text>
      ) : null}
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
    paddingBottom: 10,
    gap: 10,
  },
  title: {
    color: colors.navy,
    fontFamily: fontFamily.bold,
    fontSize: 22,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.button,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    color: colors.navy,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    paddingVertical: 0,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipOuter: {
    borderRadius: radius.pill,
  },
  chip: {
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  chipInactive: {
    backgroundColor: colors.chipBg,
  },
  chipText: {
    color: colors.textBody,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.chip,
  },
  chipTextActive: {
    color: colors.white,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.chip,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: colors.navy,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.bodyStrong,
  },
  emptyHint: {
    color: colors.textMuted,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.caption,
    textAlign: 'center',
  },
  refreshing: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    color: colors.textMuted,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.caption,
  },
});
