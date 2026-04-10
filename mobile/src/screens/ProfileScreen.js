import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../utils/constants';

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [stats] = useState({
    totalWorkouts: 142,
    streak: 7,
    totalCalories: 28500,
    personalRecords: 5,
  });

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Sign Out',
        onPress: async () => {
          await logout();
        },
        style: 'destructive',
      },
    ]);
  };

  const trialDaysLeft = 7;
  const subscriptionActive = true;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email || ''}</Text>
          </View>
        </View>

        {subscriptionActive && (
          <LinearGradient
            colors={['#0080FF', '#0056CC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.subscriptionBanner}
          >
            <View>
              <Text style={styles.subscriptionLabel}>Premium Member</Text>
              <Text style={styles.subscriptionStatus}>
                {trialDaysLeft > 0
                  ? `${trialDaysLeft} days free trial left`
                  : 'Active subscription'}
              </Text>
            </View>
            <TouchableOpacity style={styles.upgradeButton}>
              <Text style={styles.upgradeButtonText}>Manage</Text>
            </TouchableOpacity>
          </LinearGradient>
        )}

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>💪</Text>
            <Text style={styles.statValue}>{stats.totalWorkouts}</Text>
            <Text style={styles.statLabel}>Total Workouts</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statValue}>{stats.streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⚡</Text>
            <Text style={styles.statValue}>{(stats.totalCalories / 1000).toFixed(1)}k</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🏆</Text>
            <Text style={styles.statValue}>{stats.personalRecords}</Text>
            <Text style={styles.statLabel}>Records</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fitness Info</Text>
          <TouchableOpacity
            style={styles.settingsItem}
            onPress={() => navigation.navigate('Settings')}
          >
            <View>
              <Text style={styles.settingsLabel}>Skill Level</Text>
              <Text style={styles.settingsValue}>Advanced</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingsItem}
            onPress={() => navigation.navigate('Settings')}
          >
            <View>
              <Text style={styles.settingsLabel}>Equipment</Text>
              <Text style={styles.settingsValue}>Full Home Gym</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemDanger]}
            onPress={handleLogout}
          >
            <Text style={styles.menuIcon}>🚪</Text>
            <Text style={[styles.menuLabel, styles.menuLabelDanger]}>Sign Out</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  content: { flex: 1, paddingHorizontal: 20, paddingVertical: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarText: { color: COLORS.bgPrimary, fontSize: 24, fontWeight: 'bold' },
  userInfo: { flex: 1 },
  userName: { color: COLORS.textPrimary, fontSize: 18, fontWeight: 'bold' },
  userEmail: { color: COLORS.textSecondary, fontSize: 12, marginTop: 4 },
  subscriptionBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, borderRadius: 12, marginBottom: 24 },
  subscriptionLabel: { color: COLORS.bgPrimary, fontSize: 12, fontWeight: '600', opacity: 0.9 },
  subscriptionStatus: { color: COLORS.bgPrimary, fontSize: 14, fontWeight: 'bold', marginTop: 4 },
  upgradeButton: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  upgradeButtonText: { color: COLORS.bgPrimary, fontSize: 12, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4, marginBottom: 28 },
  statCard: { width: '48%', marginHorizontal: '1%', marginBottom: 12, backgroundColor: COLORS.bgCard, borderRadius: 12, paddingVertical: 16, paddingHorizontal: 12, alignItems: 'center' },
  statIcon: { fontSize: 28, marginBottom: 8 },
  statValue: { color: COLORS.accent, fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '600', textAlign: 'center' },
  section: { marginBottom: 24 },
  sectionTitle: { color: COLORS.textPrimary, fontSize: 14, fontWeight: 'bold', marginBottom: 12 },
  settingsItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, backgroundColor: COLORS.bgCard, marginBottom: 8, borderRadius: 8 },
  settingsLabel: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
  settingsValue: { color: COLORS.accent, fontSize: 13, fontWeight: 'bold', marginTop: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12, backgroundColor: COLORS.bgCard, marginBottom: 8, borderRadius: 8 },
  menuItemDanger: { backgroundColor: COLORS.danger + '15' },
  menuIcon: { fontSize: 20, marginRight: 12 },
  menuLabel: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '600', flex: 1 },
  menuLabelDanger: { color: COLORS.danger },
  chevron: { color: COLORS.textSecondary, fontSize: 18 },
});
