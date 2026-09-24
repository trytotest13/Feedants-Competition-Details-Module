/**
 * Design tokens — single source of truth (docs/design.md).
 * Never hardcode colors/spacing outside this file.
 */
export const colors = {
  primary: '#0E7C74',
  primaryStrong: '#0B655E',
  accent: '#0D9488',
  mint: '#E7F4F1',
  mintBorder: '#D3EAE5',
  navy: '#1C3D5A',
  textBody: '#5B7183',
  textMuted: '#8FA3B0',
  border: '#E9EEF2',
  surface: '#FFFFFF',
  bg: '#F7FAFB',
  chipBg: '#F1F5F7',
  amber: '#F59E0B',
  silver: '#94A3B8',
  danger: '#DC2626',
  track: '#DDE7EA',
  white: '#FFFFFF',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const radius = {
  chip: 8,
  button: 12,
  inner: 12,
  card: 16,
  pill: 999,
} as const;

export const fontSize = {
  chip: 12,
  caption: 12,
  body: 13.5,
  bodyStrong: 14,
  heading: 17,
  title: 22,
  price: 24,
} as const;

export const fontFamily = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
} as const;
