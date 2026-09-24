import React from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { colors, fontFamily, fontSize, radius } from '../../theme/tokens';
import { useLocale } from '../../i18n/strings';
import { useAuth } from '../../auth/AuthContext';
import { formatRupees } from '../../utils/format';

/** Refer & Earn card — copy/share the user's referral link. */
export function ReferEarnCard({ rewardPerSignup }: { rewardPerSignup: number }) {
  const { t } = useLocale();
  const { user } = useAuth();

  const link = user?.referralCode ? `https://feedants.com/r/${user.referralCode}` : '';

  const copy = async () => {
    if (!link) return;
    await Clipboard.setStringAsync(link);
  };

  const share = async () => {
    if (!link) return;
    await Share.share({ message: `Join me on Feedants and win exciting prizes! ${link}` });
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.megaphone}>
          <Ionicons name="megaphone" size={20} color={colors.primary} />
        </View>
        <Text style={styles.title}>{t.referEarn}</Text>
      </View>

      <View style={styles.contentRow}>
        <View style={styles.left}>
          {link ? (
            <View style={styles.linkRow}>
              <Text style={styles.linkText} numberOfLines={1}>{link}</Text>
              <Text
                onPress={() => void copy()}
                style={styles.copyBtn}
                accessibilityRole="button"
                accessibilityLabel={t.copyLink}
              >
                {t.copyLink}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.right}>
          <Text
            onPress={() => void share()}
            style={styles.referBtn}
            accessibilityRole="button"
            accessibilityLabel={t.referNow}
          >
            {t.referNow}
          </Text>
          <Text style={styles.earnText}>
            {t.youEarn} <Text style={styles.earnAmount}>{formatRupees(rewardPerSignup)}</Text>{' '}
            {t.forEverySignup}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.mint,
    borderWidth: 1,
    borderColor: colors.mintBorder,
    borderRadius: radius.card,
    padding: 14,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  megaphone: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.navy,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.bodyStrong,
    flex: 1,
  },
  contentRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  left: {
    flex: 1.2,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.mintBorder,
    borderRadius: radius.button,
    overflow: 'hidden',
  },
  linkText: {
    flex: 1,
    color: colors.textBody,
    fontFamily: fontFamily.regular,
    fontSize: 11,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  copyBtn: {
    color: colors.primary,
    fontFamily: fontFamily.semibold,
    fontSize: 11,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderLeftWidth: 1,
    borderLeftColor: colors.mintBorder,
    backgroundColor: colors.surface,
  },
  right: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  referBtn: {
    backgroundColor: colors.primary,
    color: colors.white,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.chip,
    borderRadius: radius.button,
    paddingHorizontal: 22,
    paddingVertical: 10,
    overflow: 'hidden',
    textAlign: 'center',
  },
  earnText: {
    color: colors.textBody,
    fontFamily: fontFamily.regular,
    fontSize: 11,
    textAlign: 'center',
  },
  earnAmount: {
    color: colors.navy,
    fontFamily: fontFamily.bold,
  },
});
