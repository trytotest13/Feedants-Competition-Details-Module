import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../common/ui';
import { colors, fontFamily, fontSize } from '../../theme/tokens';
import { useLocale, StringKey } from '../../i18n/strings';
import { Competition } from '../../api/types';

type TabKey = 'about' | 'judging' | 'rules';

const TABS: { key: TabKey; labelKey: StringKey }[] = [
  { key: 'about', labelKey: 'tabAbout' },
  { key: 'judging', labelKey: 'tabJudging' },
  { key: 'rules', labelKey: 'tabRules' },
];

/** About / Judging Parameters / Rules & Eligibility tabs with View more expansion. */
export function InfoTabs({ competition }: { competition: Competition }) {
  const { t } = useLocale();
  const [active, setActive] = useState<TabKey>('about');
  const [expanded, setExpanded] = useState(false);

  return (
    <Card style={{ paddingVertical: 0, paddingHorizontal: 0 }}>
      <View style={styles.tabRow}>
        {TABS.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => {
              setActive(tab.key);
              setExpanded(false);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: active === tab.key }}
            style={styles.tabBtn}
          >
            <Text style={[styles.tabText, active === tab.key && styles.tabTextActive]}>
              {t[tab.labelKey]}
            </Text>
            {active === tab.key ? <View style={styles.underline} /> : null}
          </Pressable>
        ))}
      </View>

      <View style={styles.content}>
        {active === 'about' ? (
          <Text style={styles.body} numberOfLines={expanded ? undefined : 3}>
            {competition.content.about}
          </Text>
        ) : null}

        {active === 'judging' ? (
          <View style={{ gap: 8 }}>
            {competition.content.judgingParameters.map((param) => (
              <View key={param.name} style={styles.paramRow}>
                <Text style={styles.paramName}>{param.name}</Text>
                <View style={styles.paramTrack}>
                  <View style={[styles.paramFill, { width: `${param.weight}%` }]} />
                </View>
                <Text style={styles.paramWeight}>{param.weight}%</Text>
              </View>
            ))}
          </View>
        ) : null}

        {active === 'rules' ? (
          <View style={{ gap: 8 }}>
            {competition.content.rules.map((rule, i) => (
              <View key={i} style={styles.ruleRow}>
                <View style={styles.ruleDot}>
                  <Text style={styles.ruleIndex}>{i + 1}</Text>
                </View>
                <Text style={styles.body}>{rule}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      {active === 'about' ? (
        <Pressable
          onPress={() => setExpanded((e) => !e)}
          style={({ pressed }) => [styles.viewMore, { opacity: pressed ? 0.6 : 1 }]}
          accessibilityRole="button"
          accessibilityLabel={expanded ? t.viewLess : t.viewMore}
        >
          <Text style={styles.viewMoreText}>{expanded ? t.viewLess : t.viewMore}</Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={colors.accent}
          />
        </Pressable>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 8,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  tabText: {
    color: colors.textBody,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.chip,
    textAlign: 'center',
  },
  tabTextActive: {
    color: colors.navy,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.body,
  },
  underline: {
    height: 2.5,
    borderRadius: 2,
    backgroundColor: colors.accent,
    alignSelf: 'stretch',
    marginTop: 6,
    marginHorizontal: 8,
  },
  content: {
    padding: 16,
    minHeight: 96,
  },
  body: {
    color: colors.textBody,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    lineHeight: 21,
    flex: 1,
  },
  paramRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paramName: {
    width: 150,
    color: colors.navy,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.chip,
  },
  paramTrack: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.track,
    overflow: 'hidden',
  },
  paramFill: {
    height: '100%',
    backgroundColor: colors.accent,
  },
  paramWeight: {
    width: 34,
    textAlign: 'right',
    color: colors.navy,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.chip,
  },
  ruleRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  ruleDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  ruleIndex: {
    color: colors.accent,
    fontFamily: fontFamily.semibold,
    fontSize: 10,
  },
  viewMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingBottom: 14,
  },
  viewMoreText: {
    color: colors.accent,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.chip,
  },
});
