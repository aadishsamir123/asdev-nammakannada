import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  Lesson,
  LessonProgress,
  LessonResult,
  Unit,
  UserProgress,
} from '../types';

// Lesson Services
export const getLessonsByUnit = async (unitId: string): Promise<Lesson[]> => {
  try {
    const lessonsRef = collection(db, 'lessons');
    const q = query(
      lessonsRef,
      where('unitId', '==', unitId),
      orderBy('order', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Lesson));
  } catch (error) {
    console.error('Error fetching lessons:', error);
    throw error;
  }
};

export const getLessonById = async (lessonId: string): Promise<Lesson | null> => {
  try {
    const lessonDoc = await getDoc(doc(db, 'lessons', lessonId));
    if (lessonDoc.exists()) {
      return { id: lessonDoc.id, ...lessonDoc.data() } as Lesson;
    }
    return null;
  } catch (error) {
    console.error('Error fetching lesson:', error);
    throw error;
  }
};

export const getAllUnits = async (): Promise<Unit[]> => {
  try {
    const unitsRef = collection(db, 'units');
    const q = query(unitsRef, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    
    const units: Unit[] = [];
    for (const unitDoc of snapshot.docs) {
      const unitData = unitDoc.data();
      const lessons = await getLessonsByUnit(unitDoc.id);
      units.push({
        id: unitDoc.id,
        ...unitData,
        lessons,
      } as Unit);
    }
    
    return units;
  } catch (error) {
    console.error('Error fetching units:', error);
    throw error;
  }
};

// User Progress Services
export const getUserProgress = async (userId: string): Promise<UserProgress | null> => {
  try {
    const progressDoc = await getDoc(doc(db, 'userProgress', userId));
    if (progressDoc.exists()) {
      return progressDoc.data() as UserProgress;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user progress:', error);
    throw error;
  }
};

export const updateUserProgress = async (
  userId: string,
  progress: Partial<UserProgress>
): Promise<void> => {
  try {
    const progressRef = doc(db, 'userProgress', userId);
    await updateDoc(progressRef, { ...progress });
  } catch (error) {
    console.error('Error updating user progress:', error);
    throw error;
  }
};

export const completeLessonAndUpdateProgress = async (
  userId: string,
  lessonResult: LessonResult
): Promise<void> => {
  try {
    // Save lesson result (without timeSpent - kept on device only)
    // Only save essential completion data to Firestore
    const { timeSpent, answers, ...essentialResult } = lessonResult;
    await setDoc(
      doc(db, 'lessonResults', `${userId}_${lessonResult.lessonId}_${Date.now()}`),
      {
        ...essentialResult,
        // Don't save individual answers to reduce storage
        totalQuestions: lessonResult.totalQuestions,
        correctAnswers: lessonResult.correctAnswers,
      }
    );

    // Update user progress
    const progressDoc = await getDoc(doc(db, 'userProgress', userId));
    
    const lessonProgress: LessonProgress = {
      lessonId: lessonResult.lessonId,
      completed: true,
      score: (lessonResult.correctAnswers / lessonResult.totalQuestions) * 100,
      attempts: 0,
      completedAt: lessonResult.completedAt,
      stars: lessonResult.stars,
    };

    if (progressDoc.exists()) {
      // Update existing progress
      const currentProgress = progressDoc.data() as UserProgress;
      
      lessonProgress.attempts = (currentProgress.lessonProgress[lessonResult.lessonId]?.attempts || 0) + 1;

      const updatedCompletedLessonIds = currentProgress.completedLessonIds.includes(
        lessonResult.lessonId
      )
        ? currentProgress.completedLessonIds
        : [...currentProgress.completedLessonIds, lessonResult.lessonId];

      await updateDoc(doc(db, 'userProgress', userId), {
        completedLessonIds: updatedCompletedLessonIds,
        xp: currentProgress.xp + lessonResult.xpEarned,
        lastActivityDate: new Date(),
        [`lessonProgress.${lessonResult.lessonId}`]: lessonProgress,
      });
    } else {
      // Create new progress document if it doesn't exist
      const newProgress: UserProgress = {
        userId,
        currentLessonId: lessonResult.lessonId,
        completedLessonIds: [lessonResult.lessonId],
        xp: lessonResult.xpEarned,
        streak: 1,
        lastActivityDate: new Date(),
        lessonProgress: {
          [lessonResult.lessonId]: { ...lessonProgress, attempts: 1 },
        },
      };

      await setDoc(doc(db, 'userProgress', userId), newProgress);
    }
  } catch (error) {
    console.error('Error completing lesson:', error);
    throw error;
  }
};

export const updateStreak = async (userId: string): Promise<void> => {
  try {
    const progressDoc = await getDoc(doc(db, 'userProgress', userId));
    if (progressDoc.exists()) {
      const progress = progressDoc.data() as UserProgress;
      const lastActivity = progress.lastActivityDate;
      const today = new Date();
      const daysDiff = Math.floor(
        (today.getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24)
      );

      let newStreak = progress.streak;
      if (daysDiff === 1) {
        // Continue streak
        newStreak += 1;
      } else if (daysDiff > 1) {
        // Streak broken
        newStreak = 1;
      }
      // If daysDiff === 0, same day, don't change streak

      await updateDoc(doc(db, 'userProgress', userId), {
        streak: newStreak,
        lastActivityDate: today,
      });
    }
  } catch (error) {
    console.error('Error updating streak:', error);
    throw error;
  }
};
