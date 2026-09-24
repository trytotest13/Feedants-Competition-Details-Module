import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { competitionApi } from '../api/endpoints';
import { ApiClientError } from '../api/client';
import { useLocale, StringKey } from '../i18n/strings';
import { showAlert } from '../utils/feedback';

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
      showAlert(key ? t[key] : err.message);
    },
  });

  const cancel = useMutation({
    mutationFn: () => competitionApi.cancelRegistration(idOrSlug),
    onSuccess: invalidate,
    onError: (err) => showAlert(err.message),
  });

  return { register, cancel };
}
