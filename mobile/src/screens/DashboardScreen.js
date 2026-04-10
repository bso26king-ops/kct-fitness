import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../utils/constants';

export default function DashboardScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [suggestedWorkout, setSuggestedWorkout] = useState(null);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [groupFeed, setGroupFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [streakRes, workoutRes, sessionsRes, feedRes] = await Promise.all([
        api.get('/users/streak'),
        api.get('/workouts/suggested'),
        api.get('/sessions/upcoming'),
        api.get('/groups/feed'),
      ]).catch(errors => [null, null, null, null]);

      if (streakRes?.data) setStreak(streakRes.data.streak);
      if (workoutRes?.data) setSuggestedWorkout(workoutRes.data);
      if (sessionsRes?.data) setUpcomingSessions(sessionsRes.data);
      if (feedRes?.data) setGroupFeed(feedRes.data);
    } catch (error) {
      console.log('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <LinearGradient
        colors={[COLORS.bgCard, `${COLORS.accent}15`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.streakCard}
      >
        <View>
          <Text style={styles.streakLabel}>Current Streak</Text>
          <Text style={styles.streakValue}>{streak}</Text>
          <Text style={styles.streakDays}>days</Text>
        </View>
        <View style={styles.streakIcon}>
          <Text style={styles.fireIcon}>🔥</Text>
        </View>
      </LinearGradient>

      {suggestedWorkout && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suggested Workout</Text>
          <LinearGradient
            colors={[COLORS.bgCard, `${COLORS.accent}10`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.workoutCard}
          >
            <View style={styles.workoutHeader}>
              <View>
                <Text style={styles.workoutName}>{suggestedWorkout.name}</Text>
                <View style={styles.workoutBadges}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      ⏱️ {suggestedWorkout.duration}m
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: suggestedWorkout.difficulty === 'HARD'
                          ? `${COLORS.danger}20`
                          : `${COLORS.warning}20`,
                      },
                    ]}
                  >
                    <Text style={styles.badgeText}>{suggestedWorkout.difficulty}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={styles.startButton}
                onPress={() => navigation.navigate('Workout', { screen: 'Active', params: { workoutId: suggestedWorkout.id } })}
              >
                <Text style={styles.startButtonText}>Start</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      )}

      {upcomingSessions.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Dashboard', { screen: 'Challenges' })}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            scrollEnabled={false}
            data={upcomingSessions.slice(0, 3)}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.sessionItem}>
                <View>
                  <Text style={styles.sessionName}>{item.name}</Text>
                  <Text style={styles.sessionTime}>
                    {new Date(item.scheduledAt).toLocaleString()}
                  </Text>
                </View>
                <Text style={styles.sessionIcon}>📅</Text>
              </View>
            )}
          />
        </View>
      )}

      {groupFeed.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Group Feed</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Profile', { screen: 'Groups' })}>
              <Text style={styles.seeAll}>View</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            scrollEnabled={false}
            data={groupFeed.slice(0, 3)}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.feedItem}>
                <View style={styles.feedAvatar}>
                  <Text style={styles.avatarText}>
                    {item.user.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.feedAuthor}>{item.user.name}</Text>
                  <Text style={styles.feedMessage} numberOfLines={2}>
                    {item.message}
                  </Text>
                </View>
              </View>
            )}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  name: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 4,
  },
  settingsButton: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.bgCard,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 20,
  },
  streakCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  streakLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  streakValue: {
    color: COLORS.accent,
    fontSize: 44,
    fontWeight: 'bold',
    lineHeight: 52,
  },
  streakDays: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  streakIcon: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fireIcon: {
    fontSize: 56,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAll: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  workoutCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  workoutName: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  workoutBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    backgroundColor: `${COLORS.accent}20`,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  badgeText: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  startButtonText: {
    color: COLORS.bgPrimary,
    fontSize: 13,
    fontWeight: 'bold',
  },
  sessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: COLORS.bgCard,
    marginBottom: 8,
    borderRadius: 8,
  },
  sessionName: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  sessionTime: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  sessionIcon: {
    fontSize: 18,
  },
  feedItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bgCard,
  },
  feedAvatar: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.accent,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: COLORS.bgPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  feedAuthor: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  feedMessage: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
});
