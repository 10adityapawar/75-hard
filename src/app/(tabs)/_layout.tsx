import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { IconName } from '../../components/ui';
import { colors } from '../../lib/theme';

const icon =
  (name: IconName) =>
  ({ color, size }: { color: ColorValue; size: number }) => <Ionicons name={name} size={size} color={color} />;

export default function TabLayout() {
  // Explicit height so the bar reaches the bottom edge (behind the iPhone home bar) and labels aren't clipped.
  const { bottom } = useSafeAreaInsets();
  const pad = Math.max(bottom, 8);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border, height: 66 + pad, paddingTop: 6, paddingBottom: pad },
        tabBarLabelStyle: { fontSize: 11, lineHeight: 16, fontWeight: '600' },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Today', tabBarIcon: icon('checkbox') }} />
      <Tabs.Screen name="progress" options={{ title: 'Progress', tabBarIcon: icon('flame') }} />
      <Tabs.Screen name="diet" options={{ title: 'Diet', tabBarIcon: icon('restaurant') }} />
      <Tabs.Screen name="photos" options={{ title: 'Photos', tabBarIcon: icon('images') }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: icon('settings') }} />
    </Tabs>
  );
}
