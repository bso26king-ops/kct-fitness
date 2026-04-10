import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../utils/constants';

export default function WorkoutCompleteScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { workoutData } = route.params || {};
  const scaleAnim = new Animated.Value(0);
  const opacityAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        speed: 8,
        bounciness: 12,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const stats = workoutData || {
    exercisesCompleted: 8,
    duration: 45,
    caloriesBurned: 280,
    personalRecords: ['Bench Press', 'Squat'],
    badges: ['🔥 7-Day Streak', '💪 Strength Beast', '🎯 Perfect Form'],
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.celebrationContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <Text style={styles.celebrationIcon}>🎉</Text>
          <Text style={styles.celebrationText}>Awesome Work!</Text>
        </Animated.View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🏋️</Text>
            <Text style={styles.statNumber}>
              {stats.exercisesCompleted || 8}
            </Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⏱️</Text>
            <Text style={styles.statNumber}>{stats.duration || 45}m</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statNumber}>{stats.caloriesBurned || 280}</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
        </View>

        {(stats.personalRecords || []).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>New Personal Records! 🏆</Text>
            {(stats.personalRecords || []).map((pr, idx) => (
              <View key={idx} style={styles.prItem}>
                <Text style={styles.prIcon}>⭐</Text>
                <Text style={styles.prText}>{pr}</Text>
              </View>
            ))}
          </View>
        )}

        {(stats.badges || []).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Badges Earned</Text>
            <View style={styles.badgesGrid}>
              {(stats.badges || []).map((badge, idx) => (
                <View key={idx} style={styles.badgeItem}>
                  <Text style={styles.badgeText}>{badge}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Next Steps</Text>
          <View style={styles.actionCard}>
            <Text style={styles.actionIcon}>👥</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionTitle}>Share with Group</Text>
              <Text style={styles.actionDescription}>
                Inspire your friends with your workout
              </Text>
            </View>
          </View>
          <View style={styles.actionCard}>
            <Text style={styles.actionIcon}>📊</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionTitle}>View Leaderboard</Text>
              <Text style={styles.actionDescription}>
                See how you stack up against others
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Dashboard', { screen: 'DashboardMain' })}
        >
          <Text style={styles.secondaryButtonText}>Home</Text>
        </TouchableOpacity>
        <LinearGradient
          colors={['#0080FF', '#0056CC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.primaryButtonGradient}
        >
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Workout', { screen: 'Generator' })}
          >
            <Text style={styles.primaryButtonText}>New Workout</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  celebrationContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  celebrationIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  celebrationText: {
    color: COLORS.textPrimary,
    fontSize: 32,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  statCard: {
    width: '31%',
    backgroundColor: COLORS.bgCard,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${COLORS.accent}30`,
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  statNumber: {
    color: COLORS.accent,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  prItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.accent}15`,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 4,
  },
  prIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  prText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  badgeItem: {
    width: '31%',
    marginHorizontal: '1%',
    marginBottom: 12,
    backgroundColor: COLORS.bgCard,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${COLORS.success}30`,
  },
  badgeText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.bgSecondary,
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  actionTitle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  actionDescription: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  bottomButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 28,
    gap: 12,
  },
  secondaryButton: {
    flex: 0.4,
    borderWidth: 1,
    borderColor: COLORS.bgCard,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButtonGradient: {
    flex: 0.6,
    borderRadius: 8,
  },
  primaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: COLORS.bgPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
