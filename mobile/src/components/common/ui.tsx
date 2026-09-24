import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, ctaGradient, fontFamily, fontSize, radius } from '../../theme/tokens';

// ── Card ────────────────────────────────────────────────────────────────
export function Card({
  children,
  style,
  bordered = true,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  bordered?: boolean;
}) {
  return (
    <View style={[styles.card, bordered && styles.cardBorder, style]}>{children}</View>
  );
}

// ── Chip ────────────────────────────────────────────────────────────────
export function Chip({ label, icon }: { label: string; icon?: React.ReactNode }) {
  return (
    <View style={styles.chip}>
      {icon}
      {icon ? <View style={{ width: 4 }} /> : null}
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

// ── Section title ───────────────────────────────────────────────────────
export function SectionTitle({ children, suffix }: { children: string; suffix?: string }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionTitle}>{children}</Text>
      {suffix ? <Text style={styles.sectionSuffix}> {suffix}</Text> : null}
    </View>
  );
}

// ── Progress bar (gradient fill) ────────────────────────────────────────
export function ProgressBar({ percent }: { percent: number }) {
  return (
    <View style={styles.track}>
      <LinearGradient
        colors={[...ctaGradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.fill, { width: `${Math.max(percent, 4)}%` }]}
      />
    </View>
  );
}

// ── Play circle (mint disc + teal triangle) ─────────────────────────────
export function PlayCircle({ size = 44, onPress }: { size?: number; onPress?: () => void }) {
  const content = (
    <View style={[styles.play, { width: size, height: size, borderRadius: size / 2 }]}>
      <Ionicons name="play" size={size * 0.42} color={colors.primary} />
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Play video">
      {({ pressed }) => <View style={{ opacity: pressed ? 0.7 : 1 }}>{content}</View>}
    </Pressable>
  );
}

// ── Skeleton block (loading state) ──────────────────────────────────────
export function Skeleton({ height = 16, style }: { height?: number; style?: ViewStyle }) {
  return <View style={[styles.skeleton, { height }, style]} />;
}

export function DetailsSkeleton() {
  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Skeleton height={100} style={{ borderRadius: radius.card }} />
      <Skeleton height={72} style={{ borderRadius: radius.card }} />
      <Skeleton height={44} style={{ borderRadius: radius.button }} />
      <Skeleton height={160} style={{ borderRadius: radius.card }} />
      <Skeleton height={120} style={{ borderRadius: radius.card }} />
    </View>
  );
}

// ── Error state ─────────────────────────────────────────────────────────
export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.errorWrap}>
      <Ionicons name="cloud-offline-outline" size={40} color={colors.silver} />
      <Text style={styles.errorText}>{message}</Text>
      <Pressable
        onPress={onRetry}
        style={styles.retryBtn}
        accessibilityRole="button"
        accessibilityLabel="Try again"
      >
        {({ pressed }) => (
          <Text style={[styles.retryText, { opacity: pressed ? 0.7 : 1 }]}>Try again</Text>
        )}
      </Pressable>
    </View>
  );
}

// ── Empty state ─────────────────────────────────────────────────────────
export function EmptyState({ message, icon = 'sparkles-outline' }: { message: string; icon?: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.emptyWrap}>
      <Ionicons name={icon} size={22} color={colors.textMuted} />
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

// ── Primary button (teal→green gradient, soft glow) ────────────────────
export function PrimaryButton({
  label,
  subtitle,
  onPress,
  disabled,
  loading,
}: {
  label: string;
  subtitle?: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const content = loading ? (
    <ActivityIndicator color={colors.white} />
  ) : (
    <>
      <Text style={styles.primaryLabel}>{label}</Text>
      {subtitle ? <Text style={styles.primarySubtitle}>{subtitle}</Text> : null}
    </>
  );

  if (disabled && !loading) {
    return (
      <View style={[styles.primaryBtn, styles.primaryBtnDisabled]}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [styles.primaryGlow, pressed && { opacity: 0.85 }]}
    >
      <LinearGradient
        colors={[...ctaGradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.primaryBtn}
      >
        {content}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: 16,
  },
  cardBorder: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.chipBg,
    borderRadius: radius.chip,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipText: {
    color: colors.navy,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.chip,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  sectionTitle: {
    color: colors.navy,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.heading,
  },
  sectionSuffix: {
    color: colors.textMuted,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.caption,
  },
  track: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.track,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  play: {
    backgroundColor: colors.mint,
    borderWidth: 1,
    borderColor: colors.mintBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeleton: {
    backgroundColor: '#EEF2F5',
    borderRadius: radius.inner,
  },
  errorWrap: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  errorText: {
    color: colors.textBody,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.button,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryText: {
    color: colors.white,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.bodyStrong,
  },
  emptyWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  emptyText: {
    color: colors.textMuted,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.caption,
    flex: 1,
  },
  primaryBtn: {
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    minHeight: 52,
  },
  primaryGlow: {
    borderRadius: radius.button,
    shadowColor: colors.gradStart,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  primaryBtnDisabled: {
    backgroundColor: '#C4D3D8',
    opacity: 1,
  },
  primaryLabel: {
    color: colors.white,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.bodyStrong,
  },
  primarySubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontFamily: fontFamily.regular,
    fontSize: fontSize.caption,
    marginTop: 1,
  },
});
