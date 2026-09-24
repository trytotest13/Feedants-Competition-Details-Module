import React from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, PlayCircle } from '../common/ui';
import { colors, fontFamily, fontSize } from '../../theme/tokens';
import { useLocale } from '../../i18n/strings';
import { Competition } from '../../api/types';

/** Prize-money explainer, refund policy and payment provider row. */
export function PaymentsCard({ competition }: { competition: Competition }) {
  const { t } = useLocale();

  const showRefundPolicy = () => {
    Alert.alert(t.refundPolicy, competition.payments.refundPolicy);
  };

  const openPrizeVideo = () => {
    if (competition.payments.prizeVideoUrl) {
      void Linking.openURL(competition.payments.prizeVideoUrl);
    }
  };

  return (
    <Card>
      <View style={styles.row}>
        <View style={styles.prizeCol}>
          <PlayCircle size={40} onPress={openPrizeVideo} />
          <View style={styles.prizeMeta}>
            <Text style={styles.prizeTitle}>{t.howReceivePrize}</Text>
            <Text style={styles.prizeSub}>{competition.payments.prizeInfoText || t.watchVideo}</Text>
          </View>
        </View>

        <View style={styles.policiesCol}>
          <Pressable
            onPress={showRefundPolicy}
            style={({ pressed }) => [styles.policyRow, { opacity: pressed ? 0.6 : 1 }]}
            accessibilityRole="button"
            accessibilityLabel={t.refundPolicy}
          >
            <Ionicons name="shield-checkmark-outline" size={17} color={colors.navy} />
            <Text style={styles.policyText}>{t.refundPolicy}</Text>
          </Pressable>
          <View style={styles.policyRow}>
            <Ionicons name="shield-checkmark-outline" size={17} color={colors.navy} />
            <Text style={styles.policyText}>
              {t.securePayments}{' '}
              <Text style={styles.razorpay}>{competition.payments.providerName}</Text>
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 14,
  },
  prizeCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingRight: 10,
  },
  prizeMeta: {
    flex: 1,
    gap: 2,
  },
  prizeTitle: {
    color: colors.navy,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.body,
    lineHeight: 19,
  },
  prizeSub: {
    color: colors.textMuted,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.caption,
  },
  policiesCol: {
    flex: 1,
    gap: 12,
    justifyContent: 'center',
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  policyText: {
    flex: 1,
    color: colors.textBody,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.caption,
  },
  razorpay: {
    color: colors.navy,
    fontFamily: fontFamily.semibold,
  },
});
