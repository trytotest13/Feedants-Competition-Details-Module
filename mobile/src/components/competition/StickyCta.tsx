import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { formatShortDate } from '../../utils/format';
import { useLocale } from '../../i18n/strings';
import { useRegistrationActions } from '../../hooks/useCompetition';
import { competitionApi } from '../../api/endpoints';
import { useQueryClient } from '@tanstack/react-query';
import { Competition, CompetitionView } from '../../api/types';
import { PrimaryButton } from '../common/ui';
import { colors, fontFamily, fontSize } from '../../theme/tokens';
import { confirmAsync, showAlert } from '../../utils/feedback';

interface Props {
  idOrSlug: string;
  competition: Competition;
  view: CompetitionView;
}

/**
 * Lifecycle-driven bottom CTA:
 *  - registration_open & !registered → "Register Now"
 *  - registered & submission window not open → "Upload Submission" (tap explains when)
 *  - submission_open & registered & paid → opens document picker → uploads
 *  - full / upcoming / judging / completed → state-appropriate disabled CTA
 * A "Cancel registration" text action appears while cancellation is allowed.
 */
export function StickyCta({ idOrSlug, competition, view }: Props) {
  const { t } = useLocale();
  const { register, cancel } = useRegistrationActions(idOrSlug);
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const onUpload = async () => {
    const now = Date.now();
    const start = new Date(competition.schedule.submissionStartAt).getTime();
    const end = new Date(competition.schedule.submissionEndAt).getTime();

    if (now < start) {
      showAlert(
        t.uploadSubmission,
        `Submissions open on ${formatShortDate(competition.schedule.submissionStartAt)} at your pace — you'll be able to upload until ${formatShortDate(competition.schedule.submissionEndAt)}.`,
      );
      return;
    }
    if (now > end) {
      showAlert(t.uploadSubmission, 'The submission window has closed.');
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: false,
        copyToCacheDirectory: true,
      });
      if (result.canceled || result.assets.length === 0) return;
      const asset = result.assets[0]!;

      const form = new FormData();
      // RN network FormData: attach with uri/name/type so the blob is streamed from cache
      form.append('title', competition.title);
      form.append('media', {
        uri: asset.uri,
        name: asset.name ?? 'submission',
        type: asset.mimeType ?? 'application/octet-stream',
      } as unknown as Blob);

      setUploading(true);
      await competitionApi.uploadSubmission(idOrSlug, form);
      setHasSubmitted(true);
      void qc.invalidateQueries({ queryKey: ['submission', idOrSlug] });
      showAlert(t.submitted, 'Your entry was submitted successfully. Good luck!');
    } catch (err) {
      showAlert('Upload failed', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setUploading(false);
    }
  };

  let cta: { label: string; subtitle?: string; disabled?: boolean; onPress: () => void };
  if (view.flags.canRegister) {
    cta = {
      label: t.registerNow,
      subtitle: `Entry Fee ₹${competition.entryFee}`,
      onPress: () => register.mutate(),
    };
  } else if (view.isRegistered) {
    cta = {
      label: hasSubmitted ? `${t.submitted} ✓` : t.uploadSubmission,
      subtitle: t.registered,
      disabled: hasSubmitted,
      onPress: () => void onUpload(),
    };
  } else if (view.state === 'registration_full') {
    cta = { label: t.allSpotsFilled, disabled: true, onPress: () => {} };
  } else if (view.state === 'upcoming') {
    cta = {
      label: t.registrationOpensSoon,
      subtitle: formatShortDate(competition.schedule.registrationOpenAt),
      disabled: true,
      onPress: () => {},
    };
  } else if (view.state === 'judging') {
    cta = { label: t.judgingInProgress, disabled: true, onPress: () => {} };
  } else if (view.state === 'completed') {
    cta = {
      label: t.viewResults,
      onPress: () =>
        showAlert(
          t.viewResults,
          `Results were declared on ${formatShortDate(competition.schedule.resultAt)}. See the Rewards section for the prize distribution.`,
        ),
    };
  } else {
    // registration closed but submission window hasn't opened (awaiting_submission)
    cta = {
      label: t.registrationOpensSoon,
      subtitle: `Registration closed · submissions open ${formatShortDate(competition.schedule.submissionStartAt)}`,
      disabled: true,
      onPress: () => {},
    };
  }

  return (
    <View style={styles.wrap}>
      {view.flags.canCancel ? (
        <Pressable
          onPress={() =>
            confirmAsync(t.cancelRegistration, 'Are you sure? Your spot will be released.').then(
              (ok) => ok && cancel.mutate(),
            )
          }
          style={styles.cancelBtn}
          accessibilityRole="button"
        >
          <Text style={styles.cancelText}>{t.cancelRegistration}</Text>
        </Pressable>
      ) : null}

      <PrimaryButton
        label={cta.label}
        subtitle={cta.subtitle}
        disabled={cta.disabled}
        loading={register.isPending || uploading}
        onPress={cta.onPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 4,
    gap: 6,
  },
  cancelBtn: {
    alignSelf: 'center',
    paddingVertical: 4,
  },
  cancelText: {
    color: colors.danger,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.caption,
  },
});
