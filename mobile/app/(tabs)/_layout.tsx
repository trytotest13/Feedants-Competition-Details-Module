import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/auth/AuthContext';
import { Avatar } from '../../src/components/common/Avatar';
import { useLocale } from '../../src/i18n/strings';
import { colors, ctaGradient, fontFamily, radius } from '../../src/theme/tokens';

/**
 * Bottom tab bar matching the reference design:
 * Home · Explore · (+) · Competitions · Profile — active item teal.
 */
function TabBar({ state, navigation }: BottomTabBarProps) {
  const { t } = useLocale();
  const insets = useSafeAreaInsets();
  const activeIndex = state.index;
  const activeName = state.routes[state.index]?.name;

  const items: { name: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { name: 'index', label: t.home, icon: 'home' },
    { name: 'explore', label: t.explore, icon: 'search' },
    { name: 'competitions', label: t.competitions, icon: 'trophy' },
    { name: 'profile', label: t.profile, icon: 'person' },
  ];

  const before = items.slice(0, 2);
  const after = items.slice(2);

  const renderItem = (
    item: { name: string; label: string; icon: keyof typeof Ionicons.glyphMap },
  ) => {
    const active = activeName === item.name;
    return (
      <Pressable
        key={item.name}
        onPress={() => navigation.navigate(item.name)}
        accessibilityRole="tab"
        accessibilityState={{ selected: active }}
        style={styles.tabItem}
      >
        {item.name === 'profile' ? (
          <ProfileTab active={active} />
        ) : (
          <Ionicons
            name={item.icon}
            size={22}
            color={active ? colors.primary : colors.silver}
          />
        )}
        <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{item.label}</Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {before.map(renderItem)}

      <Pressable
        onPress={() => navigation.navigate('competitions')}
        accessibilityRole="button"
        accessibilityLabel="Create"
        style={styles.plusWrap}
      >
        <LinearGradient
          colors={[...ctaGradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.plus}
        >
          <Ionicons name="add" size={24} color={colors.white} />
        </LinearGradient>
      </Pressable>

      {after.map(renderItem)}
    </View>
  );
}

function ProfileTab({ active }: { active: boolean }) {
  const { user } = useAuth();
  return (
    <View style={[styles.avatarWrap, active && styles.avatarWrapActive]}>
      <Avatar uri={undefined} name={user?.name ?? 'F'} size={22} />
    </View>
  );
}

export default function TabsLayout() {
  const { token, loading } = useAuth();
  if (!loading && !token) return <Redirect href="/login" />;

  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="competitions" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    paddingHorizontal: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  tabLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.medium,
    fontSize: 10,
  },
  tabLabelActive: {
    color: colors.primary,
  },
  plusWrap: {
    flex: 1,
    alignItems: 'center',
    marginBottom: 10,
  },
  plus: {
    width: 48,
    height: 44,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.gradStart,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  avatarWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarWrapActive: {
    borderColor: colors.primary,
  },
});
