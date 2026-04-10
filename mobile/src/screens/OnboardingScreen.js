import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';
import { COLORS, SKILL_LEVELS, EQUIPMENT_OPTIONS, WORKOUT_DURATIONS, GOALS } from '../utils/constants';

export default function OnboardingScreen({ navigation }) {
  const [step, setStep] = useState(0);
  const [skillLevel, setSkillLevel] = useState('');
  const [equipment, setEquipment] = useState([]);
  const [duration, setDuration] = useState('');
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (step === 0 && !skillLevel) {
      Alert.alert('Error', 'Please select a skill level');
      return;
    }
    if (step === 1 && equipment.length === 0) {
      Alert.alert('Error', 'Please select at least one equipment');
      return;
    }
    if (step === 2 && !duration) {
      Alert.alert('Error', 'Please select a workout duration');
      return;
    }
    if (step === 3 && selectedGoals.length === 0) {
      Alert.alert('Error', 'Please select at least one goal');
      return;
    }
    if (step === 4) {
      await completeOnboarding();
      return;
    }
    if (step === 4) {
      setLoading(true);
      try {
        const { data } = await api.get('/groups');
        setGroups(data);
      } catch (error) {
        console.log('Failed to load groups');
      }
      setLoading(false);
    }
    setStep(step + 1);
  };

  const completeOnboarding = async () => {
    setLoading(true);
    try {
      await api.post('/users/onboarding', {
        skillLevel,
        equipment,
        workoutDuration: parseInt(duration),
        goals: selectedGoals, selectedGroups,
        groupIds: selectedGroups,
      });
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  const toggleEquipment = (item) => {
    setEquipment(prev =>
      prev.includes(item) ? prev.filter(e => e !== item) : [...prev, item]
    );
  };

  const toggleGoal = (item) => {
    setSelectedGoals(prev =>
      prev.includes(item) ? prev.filter(g => g !== item) : [...prev, item]
    );
  };

  const toggleGroup = (id) => {
    setSelectedGroups(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const progressPercent = ((step + 1) / 5) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <LinearGradient
          colors={['#0080FF', '#0056CC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressFill, { width: `${progressPercent}%` }]}
        />
      </View>

      <View style={styles.stepIndicator}>
        <Text style={styles.stepText}>Step {step + 1} of 5</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {step === 0 && (
          <View style={styles.stepContent}>
            <Text style={styles.title}>What's Your Fitness Level?</Text>
            <Text style={styles.subtitle}>
              This helps us create personalized workouts for you
            </Text>
            <View style={styles.optionsContainer}>
              {SKILL_LEVELS.map(level => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.option,
                    skillLevel === level && styles.optionSelected,
                  ]}
                  onPress={() => setSkillLevel(level)}
                >
                  <Text style={[styles.optionText, skillLevel === level && styles.optionTextSelected]}>{level}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        {step > 0 && (
          <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep(step - 1)} disabled={loading}>
            <Text style={styles.secondaryButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        <LinearGradient colors={['#0080FF', '#0056CC']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.buttonGradient, step > 0 && { flex: 1, marginLeft: 12 }]}>
          <TouchableOpacity style={[styles.button, step > 0 && { flex: 1 }]} onPress={handleNext} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? '...' : step === 4 ? 'Get Started' : 'Next'}</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  progressBar: { height: 4, backgroundColor: COLORS.bgCard, marginTop: 60 },
  progressFill: { height: 4 },
  stepIndicator: { paddingVertical: 16, paddingHorizontal: 20 },
  stepText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
  content: { flex: 1, paddingHorizontal: 20 },
  stepContent: { paddingVertical: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 24 },
  optionsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  option: { width: '48%', marginRight: '4%', marginBottom: 12, paddingVertical: 12, paddingHorizontal: 12, backgroundColor: COLORS.bgCard, borderWidth: 2, borderColor: COLORS.bgCard, borderRadius: 8, alignItems: 'center' },
  optionSelected: { borderColor: COLORS.accent, backgroundColor: `${COLORS.accent}15` },
  optionText: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  optionTextSelected: { color: COLORS.accent },
  noGroupsText: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', marginVertical: 20 },
  buttonContainer: { flexDirection: 'row', padding: 20, paddingBottom: 30 },
  secondaryButton: { paddingVertical: 12, paddingHorizontal: 20, borderWidth: 1, borderColor: COLORS.bgCard, borderRadius: 8, alignItems: 'center', justifyContent: 'center', minWidth: 80 },
  secondaryButtonText: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '600' },
  buttonGradient: { borderRadius: 8, flex: 1 },
  button: { paddingVertical: 12, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: COLORS.textPrimary, fontSize: 14, fontWeight: 'bold' },
});
