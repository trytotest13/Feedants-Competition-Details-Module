import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState } from '../../src/components/common/ui';
import { colors, fontFamily } from '../../src/theme/tokens';
import { useLocale } from '../../src/i18n/strings';

/** Explore tab — intentional empty state for this assignment scope. */
export default function ExploreScreen() {
  const { t } = useLocale();
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.explore}</Text>
      </View>
      <View style={styles.body}>
        <EmptyState message={t.emptyExplore} icon="compass-outline" />
      </View>
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
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
});
