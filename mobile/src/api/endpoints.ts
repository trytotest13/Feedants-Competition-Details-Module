import { api, apiUpload } from './client';
import {
  Competition,
  CompetitionDetail,
  Registration,
  ReferralInfo,
  Submission as SubmissionT,
  Testimonial,
  User,
} from './types';

export interface CompetitionSummary extends Competition {
  view: CompetitionDetail['view'];
}

export interface DetailData {
  competition: Competition;
  view: CompetitionDetail['view'];
  winners: CompetitionDetail['winners'];
  testimonials: Testimonial[];
}

export const authApi = {
  register: (body: { name: string; email: string; password: string; referralCode?: string }) =>
    api<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  login: (body: { email: string; password: string }) =>
    api<{ user: User; token: string }>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => api<{ user: User; referral: ReferralInfo }>('/auth/me'),
};

export const competitionApi = {
  list: (q?: string, category?: string) => {
    const params = new URLSearchParams({ limit: '50' });
    if (q && q.trim()) params.set('q', q.trim());
    if (category && category !== 'All') params.set('category', category);
    return api<{ items: CompetitionSummary[]; total: number }>(
      `/competitions?${params.toString()}`,
    );
  },
  detail: (idOrSlug: string) => api<DetailData>(`/competitions/${idOrSlug}`),
  register: (idOrSlug: string) =>
    api<{ registration: Registration; view: CompetitionDetail['view'] }>(
      `/competitions/${idOrSlug}/register`,
      { method: 'POST', body: JSON.stringify({}) },
    ),
  cancelRegistration: (idOrSlug: string) =>
    api<{ view: CompetitionDetail['view'] }>(`/competitions/${idOrSlug}/registration`, {
      method: 'DELETE',
    }),
  uploadSubmission: (idOrSlug: string, form: FormData) =>
    apiUpload<{ submission: SubmissionT }>(`/competitions/${idOrSlug}/submission`, form),
};

export const referralApi = {
  me: () => api<{ referral: ReferralInfo }>('/referrals/me'),
};
