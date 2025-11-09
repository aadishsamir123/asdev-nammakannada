import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Surface, Text, useTheme } from 'react-native-paper';
import StatsDisplay from '../../components/StatsDisplay';
import { useAuth } from '../../contexts/AuthContext';
import { getAllUnits, getUserProgress } from '../../services/firestore';
import { Unit, UserProgress } from '../../types';

export default function StatsScreen() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const theme = useTheme();

  const loadData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [unitsData, progressData] = await Promise.all([
        getAllUnits(),
        getUserProgress(user.uid),
      ]);

      setUnits(unitsData);
      setUserProgress(progressData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Surface style={[styles.header, { backgroundColor: theme.colors.primaryContainer }]} elevation={0}>
        <Text variant="headlineMedium" style={[styles.headerTitle, { color: theme.colors.onPrimaryContainer }]}>
          Statistics
        </Text>
        <Text variant="bodyLarge" style={[styles.headerSubtitle, { color: theme.colors.onPrimaryContainer }]}>
          Track your learning progress
        </Text>
      </Surface>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.statsCard} elevation={2}>
          <StatsDisplay userProgress={userProgress} units={units} variant="full" />
        </Surface>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  statsCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
});
