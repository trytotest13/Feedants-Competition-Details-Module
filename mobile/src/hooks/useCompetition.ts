import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { competitionApi } from '../api/endpoints';
import { ApiClientError } from '../api/client';
import { useLocale, StringKey } from '../i18n/strings';

export function useCompetitions() {
  return useQuery({
    queryKey: ['competitions'],
    queryFn: () => competitionApi.list(),
  });
}

export function useCompetition(idOrSlug: string) {
  return useQuery({
    queryKey: ['competition', idOrSlug],
    queryFn: () => competitionApi.detail(idOrSlug),
  });
}

export function useMySubmission(idOrSlug: string, enabled: boolean) {
  return useQuery({
    queryKey: ['submission', idOrSlug],
    queryFn: () => competitionApi.mySubmission(idOrSlug),
    enabled,
  });
}

const ERROR_KEY_MAP: Record<string, StringKey> = {
  COMPETITION_FULL: 'allSpotsFilled',
};

/** Register / cancel mutations shared by the details screen CTA. */
export function useRegistrationActions(idOrSlug: string) {
  const qc = useQueryClient();
  const { t } = useLocale();

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['competition', idOrSlug] });
    void qc.invalidateQueries({ queryKey: ['competitions'] });
  };

  const register = useMutation({
    mutationFn: () => competitionApi.register(idOrSlug),
    onSuccess: invalidate,
    onError: (err) => {
      const key = err instanceof ApiClientError ? ERROR_KEY_MAP[err.code] : undefined;
      Alert.alert(key ? t[key] : err.message);
    },
  });

  const cancel = useMutation({
    mutationFn: () => competitionApi.cancelRegistration(idOrSlug),
    onSuccess: invalidate,
    onError: (err) => Alert.alert(err.message),
  });

  return { register, cancel };
}
