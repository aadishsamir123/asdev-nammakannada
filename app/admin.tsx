import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, deleteDoc, doc, getDocs, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import {
    ActivityIndicator,
    Card,
    FAB,
    IconButton,
    Searchbar,
    Surface,
    Text,
    useTheme,
} from 'react-native-paper';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import type { Lesson, Unit } from '../types';

export default function AdminScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user?.admin) {
      Alert.alert('Access Denied', 'You do not have permission to access this page.');
      router.back();
      return;
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadData = async () => {
    try {
      // Load units
      const unitsQuery = query(collection(db, 'units'));
      const unitsSnapshot = await getDocs(unitsQuery);
      const unitsData = unitsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Unit));
      setUnits(unitsData.sort((a, b) => a.order - b.order));

      // Load lessons
      const lessonsQuery = query(collection(db, 'lessons'));
      const lessonsSnapshot = await getDocs(lessonsQuery);
      const lessonsData = lessonsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lesson));
      setLessons(lessonsData.sort((a, b) => {
        if (a.unitId !== b.unitId) {
          return a.unitId.localeCompare(b.unitId);
        }
        return a.order - b.order;
      }));
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load lessons');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = (lessonId: string) => {
    Alert.alert(
      'Delete Lesson',
      'Are you sure you want to delete this lesson? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'lessons', lessonId));
              setLessons(lessons.filter(l => l.id !== lessonId));
              Alert.alert('Success', 'Lesson deleted successfully');
            } catch (error) {
              console.error('Error deleting lesson:', error);
              Alert.alert('Error', 'Failed to delete lesson');
            }
          },
        },
      ]
    );
  };

  const handleDeleteUnit = (unitId: string) => {
    const unitLessons = lessons.filter(l => l.unitId === unitId);
    if (unitLessons.length > 0) {
      Alert.alert('Cannot Delete', `This unit has ${unitLessons.length} lesson(s). Delete all lessons first.`);
      return;
    }

    Alert.alert(
      'Delete Unit',
      'Are you sure you want to delete this unit? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'units', unitId));
              setUnits(units.filter(u => u.id !== unitId));
              Alert.alert('Success', 'Unit deleted successfully');
            } catch (error) {
              console.error('Error deleting unit:', error);
              Alert.alert('Error', 'Failed to delete unit');
            }
          },
        },
      ]
    );
  };

  const getUnitName = (unitId: string) => {
    return units.find(u => u.id === unitId)?.title || unitId;
  };

  const filteredLessons = lessons.filter(lesson =>
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lesson.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getUnitName(lesson.unitId).toLowerCase().includes(searchQuery.toLowerCase())
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
      <Surface style={styles.header} elevation={0}>
        <View style={styles.headerTop}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => router.back()}
          />
          <Text variant="headlineMedium">Lesson Manager</Text>
          <View style={{ width: 48 }} />
        </View>
        <Searchbar
          placeholder="Search lessons..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </Surface>

      <View style={styles.statsContainer}>
        <Card style={styles.statCard} mode="outlined">
          <Card.Content style={styles.statContent}>
            <MaterialCommunityIcons name="folder-multiple" size={24} color={theme.colors.primary} />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Units</Text>
            <Text variant="titleLarge" style={{ fontWeight: '600' }}>{units.length}</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard} mode="outlined">
          <Card.Content style={styles.statContent}>
            <MaterialCommunityIcons name="book-open-variant" size={24} color={theme.colors.secondary} />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Lessons</Text>
            <Text variant="titleLarge" style={{ fontWeight: '600' }}>{lessons.length}</Text>
          </Card.Content>
        </Card>
      </View>

      <FlatList
        data={filteredLessons}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Card style={styles.lessonCard} mode="outlined">
            <Card.Content>
              <View style={styles.lessonHeader}>
                <View style={{ flex: 1 }}>
                  <Text variant="labelSmall" style={[styles.unitLabel, { color: theme.colors.primary }]}>
                    {getUnitName(item.unitId)}
                  </Text>
                  <Text variant="titleMedium" style={styles.lessonTitle}>
                    {item.title}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {item.description}
                  </Text>
                  <View style={styles.lessonMeta}>
                    <View style={styles.metaItem}>
                      <MaterialCommunityIcons name="help-circle" size={16} color={theme.colors.onSurfaceVariant} />
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        {item.questions.length} questions
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <MaterialCommunityIcons name="star" size={16} color={theme.colors.onSurfaceVariant} />
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        {item.xpReward} XP
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.lessonActions}>
                  <IconButton
                    icon="pencil"
                    size={20}
                    iconColor={theme.colors.primary}
                    onPress={() => router.push(`/admin/lesson/${item.id}` as any)}
                  />
                  <IconButton
                    icon="delete"
                    size={20}
                    iconColor={theme.colors.error}
                    onPress={() => handleDeleteLesson(item.id)}
                  />
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="book-off" size={64} color={theme.colors.onSurfaceVariant} />
            <Text variant="titleMedium" style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
              No lessons found
            </Text>
            <Text variant="bodyMedium" style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>
              Create your first lesson to get started
            </Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => Alert.alert('Coming Soon', 'Lesson creation UI will be added soon!')}
      />
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
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  searchbar: {
    elevation: 0,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
  },
  statContent: {
    alignItems: 'center',
    gap: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  lessonCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  unitLabel: {
    fontWeight: '600',
    marginBottom: 4,
  },
  lessonTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  lessonMeta: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lessonActions: {
    flexDirection: 'row',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
