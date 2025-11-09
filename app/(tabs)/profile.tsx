import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import {
    ActivityIndicator,
    Avatar,
    Button,
    Divider,
    List,
    Menu,
    Surface,
    Text,
    useTheme as usePaperTheme,
} from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { seedTestData } from '../../services/seedData';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const theme = usePaperTheme();
  const { themeMode, setThemeMode } = useTheme();
  const [isSeeding, setIsSeeding] = useState(false);
  const [themeMenuVisible, setThemeMenuVisible] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login' as any);
  };

  const handleSeedData = async () => {
    Alert.alert(
      'Seed Test Data',
      'This will create/overwrite test lessons in Firestore. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Create',
          onPress: async () => {
            try {
              setIsSeeding(true);
              await seedTestData();
              Alert.alert('Success!', 'Test lessons have been created in Firestore.');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to seed test data');
            } finally {
              setIsSeeding(false);
            }
          },
        },
      ]
    );
  };

  const getThemeLabel = () => {
    switch (themeMode) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'auto':
        return 'System';
      default:
        return 'System';
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Surface style={styles.header} elevation={0}>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          Profile
        </Text>
      </Surface>

      <Surface style={styles.profileCard} elevation={1}>
        <View style={styles.avatarContainer}>
          {user?.photoURL ? (
            <Avatar.Image size={80} source={{ uri: user.photoURL }} />
          ) : (
            <Avatar.Text
              size={80}
              label={user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
              style={{ backgroundColor: theme.colors.primary }}
            />
          )}
        </View>

        <Text variant="headlineSmall" style={styles.displayName}>
          {user?.displayName || 'User'}
        </Text>
        <Text variant="bodyMedium" style={[styles.email, { color: theme.colors.onSurfaceVariant }]}>
          {user?.email}
        </Text>
      </Surface>

      <Surface style={styles.section} elevation={0}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
          Appearance
        </Text>

        <Menu
          visible={themeMenuVisible}
          onDismiss={() => setThemeMenuVisible(false)}
          anchor={
            <List.Item
              title="Theme"
              description={getThemeLabel()}
              left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => setThemeMenuVisible(true)}
            />
          }
        >
          <Menu.Item
            onPress={() => {
              setThemeMode('light');
              setThemeMenuVisible(false);
            }}
            title="Light"
            leadingIcon={themeMode === 'light' ? 'check' : undefined}
          />
          <Menu.Item
            onPress={() => {
              setThemeMode('dark');
              setThemeMenuVisible(false);
            }}
            title="Dark"
            leadingIcon={themeMode === 'dark' ? 'check' : undefined}
          />
          <Menu.Item
            onPress={() => {
              setThemeMode('auto');
              setThemeMenuVisible(false);
            }}
            title="System"
            leadingIcon={themeMode === 'auto' ? 'check' : undefined}
          />
        </Menu>
        <Divider />
      </Surface>

      <Surface style={styles.section} elevation={0}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
          Account
        </Text>

        <List.Item
          title="Edit Profile"
          left={(props) => <List.Icon {...props} icon="account-edit" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {}}
        />
        <Divider />

        <List.Item
          title="Settings"
          left={(props) => <List.Icon {...props} icon="cog" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {}}
        />
        <Divider />

        <List.Item
          title="Learning Reminders"
          left={(props) => <List.Icon {...props} icon="bell" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {}}
        />
        <Divider />
      </Surface>

      <Surface style={styles.section} elevation={0}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
          About
        </Text>

        <List.Item
          title="Privacy Policy"
          left={(props) => <List.Icon {...props} icon="shield-lock" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {}}
        />
        <Divider />

        <List.Item
          title="Terms of Service"
          left={(props) => <List.Icon {...props} icon="file-document" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {}}
        />
        <Divider />

        <List.Item
          title="Help & Support"
          left={(props) => <List.Icon {...props} icon="help-circle" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {}}
        />
        <Divider />
      </Surface>

      {user?.admin && (
        <Surface style={styles.section} elevation={0}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            Admin
          </Text>

          <List.Item
            title="Lesson Manager"
            description="Create and edit lessons"
            left={(props) => <List.Icon {...props} icon="book-edit" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push('/admin' as any)}
          />
          <Divider />

          <List.Item
            title={isSeeding ? 'Creating Test Data...' : 'Create Test Lessons'}
            description="Seed database with sample lessons"
            left={(props) => <List.Icon {...props} icon="hammer-wrench" />}
            right={() => isSeeding ? <ActivityIndicator size="small" /> : <List.Icon icon="chevron-right" />}
            onPress={handleSeedData}
            disabled={isSeeding}
          />
          <Divider />
        </Surface>
      )}

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          buttonColor={theme.colors.error}
          textColor={theme.colors.onError}
          icon="logout"
        >
          Logout
        </Button>
      </View>

      <Text
        variant="bodySmall"
        style={[styles.version, { color: theme.colors.onSurfaceVariant }]}
      >
        Version 1.0.0
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  profileCard: {
    padding: 24,
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  displayName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    marginBottom: 8,
  },
  section: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  logoutButton: {
    borderRadius: 12,
  },
  version: {
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
});
