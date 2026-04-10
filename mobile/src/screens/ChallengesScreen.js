import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';
import { COLORS } from '../utils/constants';

export default function ChallengesScreen() {
  const insets = useSafeAreaInsets();
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [tab, setTab] = useState('active');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      const [activeRes, completedRes] = await Promise.all([
        api.get('/challenges/active'),
        api.get('/challenges/completed'),
      ]).catch(() => [null, null]);

      if (activeRes?.data) setActiveChallenges(activeRes.data);
      if (completedRes?.data) setCompletedChallenges(completedRes.data);
    } catch (error) {
      console.log('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const handleAttempt = async (challengeId) => {
    try {
      await api.post(`/challenges/${challengeId}/attempt`);
      Alert.alert('Success', 'Challenge started!');
      loadChallenges();
    } catch (error) {
      Alert.alert('Error', 'Failed to start challenge');
    }
  };

  const challenges = tab === 'active' ? activeChallenges : completedChallenges;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Challenges</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'active' && styles.tabActive]}
          onPress={() => setTab('active')}
        >
          <Text
            style={[
              styles.tabText,
              tab === 'active' && styles.tabTextActive,
            ]}
          >
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'completed' && styles.tabActive]}
          onPress={() => setTab('completed')}
        >
          <Text
            style={[
              styles.tabText,
              tab === 'completed' && styles.tabTextActive,
            ]}
          >
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <Text style={styles.loadingText}>Loading challenges...</Text>
        ) : challenges.length > 0 ? (
          <FlatList
            scrollEnabled={false}
            data={challenges}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <LinearGradient
                colors={[COLORS.bgCard, `${COLORS.accent}10`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.challengeCard}
              >
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.challengeName}>{item.name}</Text>
                    <Text style={styles.challengeDescription}>
                      {item.description}
                    </Text>
                  </View>
                  <View style={styles.challengeIcon}>
                    <Text style={styles.icon}>üéØ</Text>
                  </View>
                </View>

                <View style={styles.cardDetails}>
                  <View style={styles.detail}>
                    <Text style={styles.detailLabel}>Duration</Text>
                    <Text style={styles.detailValue}>
                      {item.duration || '7'} days
                    </Text>
                  </View>
                  <View style={styles.detail}>
                    <Text style={styles.detailLabel}>Difficulty</Text>
                    <Text
                      style={[
                        styles.detailValue,
                        {
                          color: item.difficulty === 'HARD' ? COLORS.danger : COLORS.warning,
                        },
                      ]}
                    >
                      {item.difficulty || 'Medium'}
                    </Text>
                  </View>
                  <View style={styles.detail}>
                    <Text style={styles.detailLabel}>Participants</Text>
                    <Text style={styles.detailValue}>
                      {item.participantCount || 0}
                    </Text>
                  </View>
                </View>

                {tab === 'active' ? (
                  <LinearGradient
                    colors={['#0080FF', '#0056CC']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.buttonGradient}
                  >
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => handleAttempt(item.id)}
                    >
                      <Text style={styles.buttonText}>Attempt Challenge</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                ) : (
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedBadgeIcon}>‚úì</Text>
                    <Text style={styles.completedBadgeText}>Completed</Text>
                  </View>
                )}
              </LinearGradient>
            )}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>
              {tab === 'active' ? 'üéØ' : 'üèÜ'}
            </Text>
            <Text style={styles.emptyText}>
              {tab === 'active'
                ? 'No active challenges. Check back soon!'
                : 'No completed challenges yet. Start one to complete it!'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  
  '‡ùå

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontWeight: 'bold',
  },
  tabs: {J flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bgCard,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.accent,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.accent,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTet: 20,
  },
  challengeCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  challengeName: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  challengeDescription: {
    color: COLORS.textSecondary,
    fontSize: 12,
    maxWidth: 220,
  },
  challengeIcon: {
    width: 44,
    height: 44,
    backgroundColor: `${COLORS.accent}20`,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
  },
  cardDetails: {
    flexDirection: 'row',
    marginBottom: 14,
    gap: 8,
  },
  detail: {
    flex: 1,
    backgroundColor: COLORS.bgSecondary,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  detailLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  detailValue: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: 'bold',
    marginTet: 2,
  },
  buttonGradient: {
    borderRadius: 8,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.bgPrimary,
    fontSize: 13,
    fontWeight: 'bold',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: `${COLORS.success}20`,
    borderRadius: 8,
  },
  completedBadgeIcon: {
    color: COLORS.success,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 6,
  },
  completedBadgeText: {
    color: COLORS.success,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 280,
  },
});
