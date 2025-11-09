import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Avatar, Surface, Text, useTheme } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';

interface SidebarItemProps {
  icon: string;
  label: string;
  route: string;
  isActive: boolean;
  onPress: () => void;
}

function SidebarItem({ icon, label, route, isActive, onPress }: SidebarItemProps) {
  const theme = useTheme();
  
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.sidebarItem,
        isActive && {
          backgroundColor: theme.colors.primaryContainer,
        },
      ]}
    >
      <MaterialCommunityIcons
        name={icon as any}
        size={24}
        color={isActive ? theme.colors.primary : theme.colors.onSurfaceVariant}
      />
      <Text
        variant="labelLarge"
        style={[
          styles.sidebarItemLabel,
          { color: isActive ? theme.colors.primary : theme.colors.onSurfaceVariant },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

interface ResponsiveSidebarProps {
  isCompact?: boolean;
}

export default function ResponsiveSidebar({ isCompact = false }: ResponsiveSidebarProps) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const navigationItems = [
    { icon: 'school', label: 'Learn', route: '/(tabs)/learn' },
    { icon: 'account', label: 'Profile', route: '/(tabs)/profile' },
  ];

  const handleNavigation = (route: string) => {
    router.push(route as any);
  };

  return (
    <Surface
      style={[
        styles.sidebar,
        isCompact ? styles.sidebarCompact : styles.sidebarFull,
        { backgroundColor: theme.colors.elevation.level1 },
      ]}
      elevation={1}
    >
      <View style={styles.sidebarContent}>
        {/* App Logo/Title */}
        <View style={styles.logoContainer}>
          {user?.photoURL ? (
            <Avatar.Image size={isCompact ? 40 : 48} source={{ uri: user.photoURL }} />
          ) : (
            <Avatar.Text
              size={isCompact ? 40 : 48}
              label={user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
              style={{ backgroundColor: theme.colors.primary }}
            />
          )}
          {!isCompact && (
            <View style={styles.logoText}>
              <Text variant="titleMedium" style={[styles.appTitle, { color: theme.colors.primary }]}>
                Namma Kannada
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {user?.displayName || user?.email}
              </Text>
            </View>
          )}
        </View>

        {/* Navigation Items */}
        <View style={styles.navItems}>
          {navigationItems.map((item) => (
            <SidebarItem
              key={item.route}
              icon={item.icon}
              label={isCompact ? '' : item.label}
              route={item.route}
              isActive={pathname.includes(item.route.replace('/(tabs)', ''))}
              onPress={() => handleNavigation(item.route)}
            />
          ))}
        </View>

        {/* Footer */}
        {!isCompact && (
          <View style={styles.footer}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Version 1.2.0
            </Text>
          </View>
        )}
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    height: '100%',
  },
  sidebarFull: {
    width: 280,
  },
  sidebarCompact: {
    width: 80,
  },
  sidebarContent: {
    flex: 1,
    paddingVertical: 24,
  },
  logoContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoText: {
    flex: 1,
  },
  appTitle: {
    fontWeight: 'bold',
  },
  navItems: {
    flex: 1,
    gap: 4,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 16,
    borderRadius: 12,
    marginHorizontal: 12,
  },
  sidebarItemLabel: {
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
});
