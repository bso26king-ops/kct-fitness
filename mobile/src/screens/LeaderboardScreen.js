import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../utils/constants';

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [scope, setScope] = useState('global');
  const [filter, setFilter] = useState('workout');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [scope, filter]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/leaderboard', {
        params: { scope, filter },
      });
      setLeaderboard(data);
    } catch (error) {
      console.log('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
      </View>

      <View style={styles.filterContainer}>
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Scope</Text>
          <View style={styles.filterChips}>
            {['global', 'friends', 'group'].map(s => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.chip,
                  scope === s && styles.chipActive,
                ]}
                onPress={() => setScope(s)}
              >
                <Text
                  style={[
                    styles.chipText,
                    scope === s && styles.chipTextActive,
                  ]}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Filter</Text>
          <View style={styles.filterChips}>
            {['workout', 'challenge'].map(f => (
              <TouchableOpacity
                key={f}
                style={[
                  styles.chip,
                  filter === f && styles.chipActive,
                ]}
                onPress={() => setFilter(f)}
              >
                <Text
                  style={[
                    styles.chipText,
                    filter === f && styles.chipTextActive,
                  ]}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : (
          <FlatList
            scrollEnabled={false}
            data={leaderboard}
            keyExtractor={item => item.id}
            renderItem={({ item, index }) => {
              const isCurrentUser = item.id === user?.id;
              return (
                <View
                  style={[
                    styles.rankItem,
                    isCurrentUser && styles.rankItemActive,
                  ]}
                >
                  <View style={styles.rankNumber}>
                    <Text
                      style={[
                        styles.rankNumberText,
                        isCurrentUser && styles.rankNumberTextActive,
                      ]}
                    >
                      {index + 1}
                    </Text>
                  </View>

                  <View style={styles.userInfo}>
                    <View style={styles.userAvatar}>
                      <Text style={styles.avatarText}>
                        {item.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.userName}>
                        {item.name} {isCurrentUser ? '(You)' : ''}
                      </Text>
                      <Text style={styles.userSubtitle}>
                        {item.badge || 'Member'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.scoreContainer}>
                    <Text style={styles.scoreValue}>{item.score}</Text>
                    <Text style={styles.scoreLabel}>pts</Text>
                  </View>
                </View>
              );
            }}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bgCard,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontWeight: 'bold',
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bgCard,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
  },
  chipActive: {
    backgroundColor: COLORS.accent,
  },
  chipText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: COLORS.bgPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: COLORS.bgCard,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.bgSecondary,
  },
  rankItemActive: {
    borderColor: COLORS.accent,
    backgroundColor: `${COLORS.accent}15`,
  },
  rankNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumberText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  rankNumberTextActive: {
    color: COLORS.accent,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: COLORS.bgPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  userName: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  userSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
});
