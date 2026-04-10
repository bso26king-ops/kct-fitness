import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../services/api';
import { COLORS } from '../utils/constants';

export default function GroupsScreen() {
  const insets = useSafeAreaInsets();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [feed, setFeed] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      loadGroupFeed(selectedGroup.id);
    }
  }, [selectedGroup]);

  const loadGroups = async () => {
    try {
      const { data } = await api.get('/groups');
      setGroups(data);
      if (data.length > 0) {
        setSelectedGroup(data[0]);
      }
    } catch (error) {
      console.log('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const loadGroupFeed = async (groupId) => {
    try {
      const { data } = await api.get(`/groups/${groupId}/feed`);
      setFeed(data);
    } catch (error) {
      console.log('Failed to load feed');
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedGroup) return;

    try {
      await api.post(`/groups/${selectedGroup.id}/messages`, {
        message: message.trim(),
      });
      setMessage('');
      loadGroupFeed(selectedGroup.id);
    } catch (error) {
      console.log('Failed to send message');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.loadingText}>Loading groups...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Groups</Text>
      </View>

      {groups.length > 0 ? (
        <View style={styles.content}>
          <View style={styles.groupsList}>
            <FlatList
              horizontal
              scrollEnabled={true}
              showsHorizontalScrollIndicator={false}
              data={groups}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.groupChip,
                    selectedGroup?.id === item.id && styles.groupChipActive,
                  ]}
                  onPress={() => setSelectedGroup(item)}
                >
                  <Text
                    style={[
                      styles.groupChipText,
                      selectedGroup?.id === item.id && styles.groupChipTextActive,
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>

          {selectedGroup && (
            <>
              <View style={styles.groupInfo}>
                <Text style={styles.groupName}>{selectedGroup.name}</Text>
                <View style={styles.groupMeta}>
                  <Text style={styles.metaText}>
                    👥 {selectedGroup.memberCount || 0} members
                  </Text>
                  <Text style={styles.metaDot}>•</Text>
                  <Text style={styles.metaText}>
                    💪 {selectedGroup.totalWorkouts || 0} workouts
                  </Text>
                </View>
                <Text style={styles.groupDescription}>
                  {selectedGroup.description}
                </Text>
              </View>

              <ScrollView style={styles.feedContainer}>
                {feed.length > 0 ? (
                  <FlatList
                    scrollEnabled={false}
                    data={feed}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                      <View style={styles.feedItem}>
                        <View style={styles.feedAvatar}>
                          <Text style={styles.avatarText}>
                            {item.user.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.feedContent}>
                          <View style={styles.feedHeader}>
                            <Text style={styles.feedAuthor}>{item.user.name}</Text>
                            <Text style={styles.feedTime}>
                              {new Date(item.createdAt).toLocaleString()}
                            </Text>
                          </View>
                          <Text style={styles.feedMessage}>{item.message}</Text>
                          {item.workout && (
                            <View style={styles.workoutBadge}>
                              <Text style={styles.badgeText}>
                                💪 {item.workout.name}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    )}
                  />
                ) : (
                  <Text style={styles.noFeedText}>
                    No messages yet. Be the first to share!
                  </Text>
                )}
              </ScrollView>

              <View style={styles.messageInput}>
                <TextInput
                  style={styles.input}
                  placeholder="Share your workout..."
                  placeholderTextColor={COLORS.textSecondary}
                  value={message}
                  onChangeText={setMessage}
                  multiline
                />
                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={handleSendMessage}
                  disabled={!message.trim()}
                >
                  <Text style={styles.sendIcon}>→</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyText}>No groups yet</Text>
          <Text style={styles.emptySubtext}>
            Join a group to collaborate with other fitness enthusiasts
          </Text>
        </View>
      )}
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
  content: {
    flex: 1,
    flexDirection: 'column',
  },
  groupsList: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  groupChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.bgCard,
  },
  groupChipActive: {
    borderColor: COLORS.accent,
    backgroundColor: `${COLORS.accent}15`,
  },
  groupChipText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  groupChipTextActive: {
    color: COLORS.accent,
  },
  groupInfo: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bgCard,
  },
  groupName: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  metaDot: {
    color: COLORS.textSecondary,
    marginHorizontal: 6,
  },
  groupDescription: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  feedContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  feedItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  feedAvatar: {
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
  feedContent: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    padding: 12,
    borderRadius: 8,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  feedAuthor: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  feedTime: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  feedMessage: {
    color: COLORS.textPrimary,
    fontSize: 12,
    lineHeight: 16,
  },
  workoutBadge: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: `${COLORS.accent}20`,
    borderRadius: 4,
  },
  badgeText: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '600',
  },
  noFeedText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 20,
  },
  messageInput: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.bgCard,
    gap: 8,
    paddingBottom: 28,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: COLORS.textPrimary,
    fontSize: 13,
    maxHeight: 80,
  },
  sendButton: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    color: COLORS.bgPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
});
