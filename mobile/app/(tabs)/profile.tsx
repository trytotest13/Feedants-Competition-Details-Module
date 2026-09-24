import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../src/auth/AuthContext';
import { referralApi } from '../../src/api/endpoints';
import { Avatar } from '../../src/components/common/Avatar';
import { Card } from '../../src/components/common/ui';
import { colors, fontFamily, fontSize, radius } from '../../src/theme/tokens';
import { formatRupees } from '../../src/utils/format';
import { useLocale } from '../../src/i18n/strings';

/** Profile tab — account, referral summary, logout. */
export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);

  const { data } = useQuery({ queryKey: ['referrals'], queryFn: referralApi.me });
  const referral = data?.referral;

  if (!user) return null;

  const copyCode = async () => {
    if (!referral?.link) return;
    await Clipboard.setStringAsync(referral.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.profile}</Text>
      </View>

      <Card style={styles.userCard}>
        <Avatar uri={undefined} name={user.name} size={56} />
        <View style={styles.userMeta}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
        <View style={styles.earnChip}>
          <Text style={styles.earnChipText}>{formatRupees(referral?.earnings ?? 0)}</Text>
          <Text style={styles.earnChipLabel}>earned</Text>
        </View>
      </Card>

      <Card style={styles.referralCard}>
        <View style={styles.referralHeader}>
          <Ionicons name="megaphone" size={18} color={colors.primary} />
          <Text style={styles.referralTitle}>{t.referEarn}</Text>
        </View>
        <View style={styles.codeRow}>
          <Text style={styles.code}>{referral?.code ?? '—'}</Text>
          <Pressable onPress={() => void copyCode()} accessibilityRole="button">
            <Text style={styles.copy}>{copied ? '✓ Copied' : t.copyLink}</Text>
          </Pressable>
        </View>
        <View style={styles.statsRow}>
          <View>
            <Text style={styles.statLabel}>Signups</Text>
            <Text style={styles.statValue}>{referral?.count ?? 0}</Text>
          </View>
          <View>
            <Text style={styles.statLabel}>Earnings</Text>
            <Text style={styles.statValue}>{formatRupees(referral?.earnings ?? 0)}</Text>
          </View>
        </View>
      </Card>

      <Pressable
        onPress={() => void signOut()}
        style={({ pressed }) => [styles.logout, pressed && { opacity: 0.7 }]}
        accessibilityRole="button"
      >
        <Ionicons name="log-out-outline" size={18} color={colors.danger} />
        <Text style={styles.logoutText}>{t.logout}</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 16,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    color: colors.navy,
    fontFamily: fontFamily.bold,
    fontSize: 22,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  earnChip: {
    alignItems: 'flex-end',
  },
  earnChipText: {
    color: colors.gradEnd,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.bodyStrong,
  },
  earnChipLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.regular,
    fontSize: 11,
  },
  userMeta: {
    flex: 1,
  },
  name: {
    color: colors.onDark,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.bodyStrong,
  },
  email: {
    color: colors.onDarkSoft,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.caption,
  },
  referralCard: {
    marginTop: 12,
    gap: 12,
  },
  referralHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  referralTitle: {
    color: colors.navy,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.body,
    flex: 1,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.mint,
    borderWidth: 1,
    borderColor: colors.mintBorder,
    borderRadius: radius.button,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  code: {
    color: colors.primary,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.body,
  },
  copy: {
    color: colors.primary,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.chip,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 28,
  },
  statLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.regular,
    fontSize: 11,
  },
  statValue: {
    color: colors.navy,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.bodyStrong,
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  logoutText: {
    color: colors.danger,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.body,
  },
});
