import React, { useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState, SectionTitle } from '../common/ui';
import { colors, fontFamily, fontSize, radius } from '../../theme/tokens';
import { ordinal } from '../../utils/format';
import { useLocale } from '../../i18n/strings';
import { openExternal } from '../../utils/feedback';
import { Winner } from '../../api/types';

/** Horizontal strip of previous-edition winners with video links. */
export function WinnersStrip({ winners }: { winners: Winner[] }) {
  const { t } = useLocale();

  return (
    <View>
      <View style={{ paddingHorizontal: 16 }}>
        <SectionTitle>{t.previousWinners}</SectionTitle>
      </View>
      {winners.length === 0 ? (
        <View style={{ paddingHorizontal: 16 }}>
          <EmptyState message={t.noWinnersYet} icon="medal-outline" />
        </View>
      ) : (
        <FlatList
          horizontal
          data={winners}
          keyExtractor={(w) => w._id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Pressable
                onPress={() => item.videoUrl && void openExternal(item.videoUrl)}
                accessibilityRole={item.videoUrl ? 'button' : undefined}
                accessibilityLabel={`${item.name} performance video`}
              >
                <View style={styles.photoWrap}>
                  {/* Photo with graceful fallback handled by background + initial */}
                  <WinnerPhoto winner={item} />
                  {item.videoUrl ? (
                    <View style={styles.playOverlay}>
                      <Ionicons name="play" size={12} color={colors.white} />
                    </View>
                  ) : null}
                </View>
              </Pressable>
              <View style={styles.meta}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.position}>{ordinal(item.position)} Winner</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

function WinnerPhoto({ winner }: { winner: Winner }) {
  const [failed, setFailed] = useState(false);
  const initial = winner.name.trim().charAt(0).toUpperCase();

  if (!winner.photoUrl || failed) {
    return (
      <View style={[styles.photo, styles.photoFallback]}>
        <Text style={styles.photoInitial}>{initial}</Text>
      </View>
    );
  }
  return (
    <Image source={{ uri: winner.photoUrl }} style={styles.photo} onError={() => setFailed(true)} />
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.inner,
    padding: 8,
    width: 190,
  },
  photoWrap: {
    position: 'relative',
  },
  photo: {
    width: 62,
    height: 62,
    borderRadius: 10,
  },
  photoFallback: {
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoInitial: {
    color: colors.accent,
    fontFamily: fontFamily.bold,
    fontSize: 20,
  },
  playOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  meta: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: colors.navy,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.caption,
  },
  position: {
    color: colors.primary,
    fontFamily: fontFamily.medium,
    fontSize: 11,
  },
});
