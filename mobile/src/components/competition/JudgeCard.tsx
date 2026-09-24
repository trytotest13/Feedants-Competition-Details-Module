import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card, PlayCircle } from '../common/ui';
import { Avatar } from '../common/Avatar';
import { colors, fontFamily, fontSize } from '../../theme/tokens';
import { useLocale } from '../../i18n/strings';
import { openExternal } from '../../utils/feedback';
import { Judge } from '../../api/types';

/** Judge card with intro-video play button (opens the video URL). */
export function JudgeCard({ judge }: { judge: Judge }) {
  const { t } = useLocale();

  const openIntro = () => {
    void openExternal(judge.introVideoUrl);
  };

  return (
    <Card>
      <View style={styles.row}>
        <Avatar uri={judge.avatarUrl} name={judge.name} size={64} />
        <View style={styles.meta}>
          <Text style={styles.judgeLabel}>{t.judge}</Text>
          <Text style={styles.name}>{judge.name}</Text>
          <Text style={styles.line}>{judge.title}</Text>
          <Text style={styles.line}>{judge.experienceYears}+ {t.yearsExperience}</Text>
        </View>
        <View style={styles.videoCol}>
          <PlayCircle size={44} onPress={openIntro} />
          <Text style={styles.videoCaption}>{t.introVideo}</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  meta: {
    flex: 1,
    gap: 1,
  },
  judgeLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.caption,
  },
  name: {
    color: colors.navy,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.bodyStrong,
  },
  line: {
    color: colors.textBody,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.caption,
  },
  videoCol: {
    alignItems: 'center',
    gap: 4,
  },
  videoCaption: {
    color: colors.textBody,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.caption,
  },
});
