import React, { useState } from 'react';
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
import {
  COLORS,
  EQUIPMENT_OPTIONS,
  MUSCLE_GROUPS,
  WORKOUT_DURATIONS,
} from '../utils/constants';

export default function WorkoutGeneratorScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [duration, setDuration] = useState('30');
  const [equipment, setEquipment] = useState([]);
  const [muscleGroup, setMuscleGroup] = useState('');
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleEquipment = (item) => {
    setEquipment(prev =>
      prev.includes(item) ? prev.filter(e => e !== item) : [...prev, item]
    );
  };

  const generateWorkout = async () => {
    if (!duration) {
      Alert.alert('Error', 'Please select a duration');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/workouts/generate', {
        duration: parseInt(duration),
        equipment,
        muscleGroup: muscleGroup || undefined,
      });
      setExercises(data.exercises || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate workout');
    } finally {
      setLoading(false);
    }
  };

  const swapExercise = (index) => {
    Alert.alert('Swap Exercise', 'Feature coming soon');
  };

  const startWorkout = async () => {
    if (exercises.length === 0) {
      Alert.alert('Error', 'Please generate a workout first');
      return;
    }

    try {
      const { data } = await api.post('/workouts/start', {
        exercises,
      });
      navigation.navigate('Active', { workoutId: data.id });
    } catch (error) {
      Alert.alert('Error', 'Failed to start workout');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Workout Generator</Text>
          <Text style={styles.subtitle}>
            Customize and generate your personalized workout
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Duration</Text>
          <View style={styles.chipsContainer}>
            {WORKOUT_DURATIONS.map(dur => (
              <TouchableOpacity
                key={dur}
                style={[
                  styles.chip,
                  duration === String(dur) && styles.chipActive,
                ]}
                onPress={() => setDuration(String(dur))}
              >
                <Text
                  style={[
                    styles.chipText,
                    duration === String(dur) && styles.chipTextActive,
                  ]}
                >
                  {dur}m
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Equipment</Text>
          <View style={styles.chipsContainer}>
            {EQUIPMENT_OPTIONS.map(item => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.chip,
                  equipment.includes(item) && styles.chipActive,
                ]}
                onPress={() => toggleEquipment(item)}
              >
                <Text
                  style={[
                    styles.chipText,
                    equipment.includes(item) && styles.chipTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Target Muscle Group (Optional)</Text>
          <View style={styles.chipsContainer}>
            {MUSCLE_GROUPS.map(group => (
              <TouchableOpacity
                key={group}
                style={[
                  styles.chip,
                  muscleGroup === group && styles.chipActive,
                ]}
                onPress={() => setMuscleGroup(muscleGroup === group ? '' : group)}
              >
                <Text
                  style={[
                    styles.chipText,
                    muscleGroup === group && styles.chipTextActive,
                  ]}
                >
                  {group}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <LinearGradient
          colors={['#0080FF', '#0056CC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.generateButtonGradient}
        >
          <TouchableOpacity
            style={styles.generateButton}
            onPress={generateWorkout}
            disabled={loading}
          >
            <Text style={styles.generateButtonText}>
              {loading ? 'Generating...' : 'GENERATE WORKOUT'}
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        {exercises.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Workout</Text>
            <FlatList
              scrollEnabled={false}
              data={exercises}
              keyExtractor={(item, idx) => `${item.id}-${idx}`}
              renderItem={({ item, index }) => (
                <View style={styles.exerciseCard}>
                  <View style={styles.exerciseInfo}>
                    <View>
                      <Text style={styles.exerciseName}>{item.name}</Text>
                      <View style={styles.exerciseMeta}>
                        <Text style={styles.metaText}>{item.sets}x{item.reps}</Text>
                        {item.muscleGroups && (
                          <Text style={styles.metaText}>
                            {item.muscleGroups.join(', ')}
                          </Text>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.swapButton}
                      onPress={() => swapExercise(index)}
                    >
                      <Text style={styles.swapIcon}>↕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />

            <LinearGradient
              colors={['#00C853', '#00A040']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.startButtonGradient}
            >
              <TouchableOpacity
                style={styles.startButton}
                onPress={startWorkout}
              >
                <Text style={styles.startButtonText}>Start Workout</Text>
              </TouchableOpacity>
            </LinearGradient>
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
  },
  scrollContent: {
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
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  chip: {
    marginHorizontal: 6,
    marginVertical: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.bgCard,
  },
  chipActive: {
    borderColor: COLORS.accent,
    backgroundColor: `${COLORS.accent}15`,
  },
  chipText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: COLORS.accent,
  },
  generateButtonGradient: {
    borderRadius: 8,
    marginBottom: 24,
  },
  generateButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  generateButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  exerciseCard: {
    backgroundColor: COLORS.bgCard,
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.bgSecondary,
  },
  exerciseInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  exerciseName: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  exerciseMeta: {
    marginTop: 8,
    gap: 8,
  },
  metaText: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  swapButton: {
    width: 32,
    height: 32,
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swapIcon: {
    color: COLORS.accent,
    fontSize: 18,
    fontWeight: 'bold',
  },
  startButtonGradient: {
    borderRadius: 8,
    marginTop: 8,
  },
  startButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  startButtonText: {
    color: COLORS.bgPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
