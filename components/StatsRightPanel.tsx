import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Surface, useTheme } from 'react-native-paper';
import { Unit, UserProgress } from '../types';
import StatsDisplay from './StatsDisplay';

interface StatsRightPanelProps {
  userProgress: UserProgress | null;
  units: Unit[];
}

export default function StatsRightPanel({ userProgress, units }: StatsRightPanelProps) {
  const theme = useTheme();

  return (
    <Surface
      style={[styles.panel, { backgroundColor: theme.colors.elevation.level1 }]}
      elevation={1}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <StatsDisplay userProgress={userProgress} units={units} variant="full" />
      </ScrollView>
    </Surface>
  );
}

const styles = StyleSheet.create({
  panel: {
    width: 340,
    height: '100%',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
