import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Redirect, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../src/auth/AuthContext';
import { authApi } from '../src/api/endpoints';
import { colors, fontFamily, fontSize, radius } from '../src/theme/tokens';

/**
 * Auth screen — login or create an account (with optional referral code).
 * Ships prefilled with the seeded demo account for quick evaluation.
 */
export default function LoginScreen() {
  const { signIn, token, loading } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('demo@feedants.com');
  const [password, setPassword] = useState('Demo@1234');
  const [referralCode, setReferralCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!loading && token) return <Redirect href="/(tabs)" />;

  const submit = async () => {
    setError('');
    setBusy(true);
    try {
      const { user, token: newToken } =
        mode === 'login'
          ? await authApi.login({ email: email.trim(), password })
          : await authApi.register({
              name: name.trim(),
              email: email.trim(),
              password,
              referralCode: referralCode.trim() || undefined,
            });
      await signIn(newToken, user);
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.brandRow}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>F</Text>
          </View>
          <Text style={styles.brand}>Feedants</Text>
        </View>
        <Text style={styles.heading}>
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </Text>
        <Text style={styles.sub}>Compete from anywhere. Win real prizes.</Text>

        <View style={styles.form}>
          {mode === 'register' ? (
            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          ) : null}
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {mode === 'register' ? (
            <TextInput
              style={styles.input}
              placeholder="Referral code (optional)"
              placeholderTextColor={colors.textMuted}
              value={referralCode}
              onChangeText={setReferralCode}
              autoCapitalize="characters"
            />
          ) : null}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            onPress={() => void submit()}
            disabled={busy}
            style={({ pressed }) => [styles.cta, busy && { opacity: 0.6 }, pressed && { opacity: 0.8 }]}
            accessibilityRole="button"
          >
            <Text style={styles.ctaText}>{mode === 'login' ? 'Login' : 'Create account'}</Text>
          </Pressable>

          <Pressable onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
            <Text style={styles.switchText}>
              {mode === 'login'
                ? 'New here? Create an account'
                : 'Already registered? Login'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 6,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: colors.white,
    fontFamily: fontFamily.bold,
    fontSize: 20,
  },
  brand: {
    color: colors.navy,
    fontFamily: fontFamily.bold,
    fontSize: 20,
  },
  heading: {
    color: colors.navy,
    fontFamily: fontFamily.bold,
    fontSize: 24,
  },
  sub: {
    color: colors.textBody,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    marginBottom: 16,
  },
  form: {
    gap: 12,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.button,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.navy,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
  },
  error: {
    color: colors.danger,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.caption,
  },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: radius.button,
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 4,
  },
  ctaText: {
    color: colors.white,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.bodyStrong,
  },
  switchText: {
    color: colors.accent,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.caption,
    textAlign: 'center',
    paddingVertical: 6,
  },
});
