import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import api from '../services/api';
import { COLORS } from '../utils/constants';

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const [weightData, setWeightData] = useState(null);
  const [photos, setPhotos] = useState({});
  const [personalRecords, setPersonalRecords] = useState([]);
  const [badges, setBadges] = useState([]);
  const [selectedAngle, setSelectedAngle] = useState('Front');

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      const [weightsRes, photosRes, prsRes, badgesRes] = await Promise.all([
        api.get('/progress/weight-history'),
        api.get('/progress/photos'),
        api.get('/progress/personal-records'),
        api.get('/progress/badges'),
      ]).catch(() => [null, null, null, null]);

      if (weightsRes?.data) setWeightData(weightsRes.data);
      if (photosRes?.data) setPhotos(photosRes.data);
      if (prsRes?.data) setPersonalRecords(prsRes.data);
      if (badgesRes?.data) setBadges(badgesRes.data);
    } catch (error) {
      console.log('Failed to load progress');
    }
  };

  const chartData = weightData ? {
    labels: weightData.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [{
      data: weightData.values || [180, 178, 177, 179, 176, 175],
    }],
  } : null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Progress</Text>
        </View>

        {chartData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weight Trend</Text>
            <LineChart
              data={chartData}
              width={340}
              height={200}
              chartConfig={{
                backgroundColor: COLORS.bgPrimary,
                backgroundGradientFrom: COLORS.bgCard,
                backgroundGradientTo: COLORS.bgCard,
                color: () => COLORS.accent,
                strokeWidth: 2,
                style: { borderRadius: 8 },
              }}
              bezier
              style={styles.chart}
            />
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Progress Photos</Text>
            <TouchableOpacity style={styles.uploadButton}>
              <Text style={styles.uploadIcon}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.angleTabs}>
            {['Front', 'Side', 'Back'].map(angle => (
              <TouchableOpacity
                key={angle}
                style={[
                  styles.angleTab,
                  selectedAngle === angle && styles.angleTabActive,
                ]}
                onPress={() => setSelectedAngle(angle)}
              >
                <Text
                  style={[
                    styles.angleTabText,
                    selectedAngle === angle && styles.angleTabTextActive,
                  ]}
                >
                  {angle}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {photos[selectedAngle]?.length > 0 ? (
            <View style={styles.photosGrid}>
              {photos[selectedAngle].map((photo, idx) => (
                <View key={idx} style={styles.photoItem}>
                  <Image
                    source={{ uri: photo.url }}
                    style={styles.photo}
                  />
                  <Text style={styles.photoDate}>
                    {new Date(photo.date).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noPhotosText}>No photos yet. Add one to track your transformation!</Text>
          )}
        </View>

        {personalRecords.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Records</Text>
            <FlatList
              scrollEnabled={false}
              data={personalRecords}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.prCard}>
                  <View style={styles.prInfo}>
                    <Text style={styles.prName}>{item.exerciseName}</Text>
                    <Text style={styles.prWeight}>{item.weight}lbs</Text>
                  </View>
                  <View style={styles.prBadge}>
                    <Text style={styles.prBadgeIcon}>🏆</Text>
                  </View>
                </View>
              )}
            />
          </View>
        )}

        {badges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Badges & Achievements</Text>
            <View style={styles.badgesGrid}>
              {badges.map((badge, idx) => (
                <View key={idx} style={styles.badgeItem}>
                  <Text style={styles.badgeEmoji}>{badge.icon}</Text>
                  <Text style={styles.badgeName}>{badge.name}</Text>
                </View>
              ))}
            </View>
          </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontWeight: 'bold',
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
    fontSize: 16,
    fontWeight: 'bold',
  },
  uploadButton: {
    width: 32,
    height: 32,
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadIcon: {
    color: COLORS.bgPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  chart: {
    borderRadius: 8,
    marginVertical: 8,
  },
  angleTabs: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  angleTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: COLORS.bgCard,
    alignItems: 'center',
  },
  angleTabActive: {
    backgroundColor: COLORS.accent,
  },
  angleTabText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  angleTabTextActive: {
    color: COLORS.bgPrimary,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  photoItem: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: 12,
  },
  photo: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    backgroundColor: COLORS.bgCard,
  },
  photoDate: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  noPhotosText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 20,
  },
  prCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  prInfo: {
    flex: 1,
  },
  prName: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  prWeight: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  prBadge: {
    width: 40,
    height: 40,
    backgroundColor: `${COLORS.accent}20`,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prBadgeIcon: {
    fontSize: 20,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
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
  },
  badgeEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  badgeName: {
    color: COLORS.textPrimary,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
});
