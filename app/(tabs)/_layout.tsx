import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTheme as usePaperTheme } from 'react-native-paper';
import ResponsiveSidebar from '../../components/ResponsiveSidebar';
import { useIsLargeScreen } from '../../hooks/useResponsive';

export default function TabsLayout() {
  const theme = usePaperTheme();
  const isLargeScreen = useIsLargeScreen();

  if (isLargeScreen) {
    // Desktop/Tablet layout with sidebar
    return (
      <View style={styles.largeScreenContainer}>
        <ResponsiveSidebar />
        <View style={styles.contentArea}>
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarStyle: { display: 'none' }, // Hide tab bar on large screens
            }}
          >
            <Tabs.Screen name="learn" />
            <Tabs.Screen name="stats" options={{ href: null }} /> {/* Hide stats tab on large screens */}
            <Tabs.Screen name="profile" />
          </Tabs>
        </View>
      </View>
    );
  }

  // Mobile layout with bottom tabs
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 0,
          elevation: 0,
          height: 80,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="school" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-bar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  largeScreenContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  contentArea: {
    flex: 1,
  },
});
