import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';
import { COLORS } from '../utils/constants';

export default function ActiveWorkoutScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { workoutId } = route.params || {};
  const [workout, setWorkout] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [restTime, setRestTime] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [completedSets, setCompletedSets] = useState({});
  const [weights, setWeights] = useState({});
  const [loading, setLoading] = useState(true);
  const scaleAnim = new Animated.Value(1);

  useEffect(() => { loadWorkout(); }, []);

  useEffect(() => {
    if (!isResting || restTime === 0) return;
    const interval = setInterval(() => {
      setRestTime(prev => { if (prev <= 1) { setIsResting(false); return 0; } return prev - 1; });
    }, 1000);
    return () => clearInterval(interval);
  }, [isResting, restTime]);

  const loadWorkout = async () => {
    try {
      let data;
      if (workoutId) { const res = await api.get(`/workouts/${workoutId}`); data = res.data; }
      else { const res = await api.get('/workouts/current'); data = res.data; }
      setWorkout(data); setCompletedSets({}); setWeights({});
    } catch (error) { Alert.alert('Error', 'Failed to load workout'); navigation.goBack(); }
    finally { setLoading(false); }
  };

  if (loading || !workout) return (<View style={[styles.container,{paddingTop:insets.top}]}><Text style={styles.loadingText}>Loading workout...</Text></View>);

  const exercises = workout.exercises || [];
  const currentExercise = exercises[currentExerciseIndex];
  const currentSet = currentExercise?.sets?.[currentSetIndex];
  const key = `${currentExerciseIndex}-${currentSetIndex}`;
  const isSetCompleted = completedSets[key];

  const handleCompleteSet = () => {
    Animated.sequence([Animated.timing(scaleAnim,{toValue:1.1,duration:100,useNativeDriver:true}),Animated.timing(scaleAnim,{toValue:1,duration:100,useNativeDriver:true})]).start();
    setCompletedSets(prev => ({...prev,[key]:true}));
    setRestTime(60); setIsResting(true);
  };

  const handleNextSet = () => {
    if (currentSetIndex < (currentExercise?.sets?.length || 1) - 1) { setCurrentSetIndex(currentSetIndex + 1); setIsResting(false); }
    else { handleNextExercise(); }
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) { setCurrentExerciseIndex(currentExerciseIndex + 1); setCurrentSetIndex(0); setIsResting(false); }
    else { completeWorkout(); }
  };

  const completeWorkout = async () => {
    try { const { data } = await api.post('/workouts/complete',{workoutId:workout.id,weights}); navigation.replace('Complete',{workoutData:data}); }
    catch (error) { Alert.alert('Error','Failed to complete workout'); }
  };

  const progress = ((currentExerciseIndex + (currentSetIndex + 1) / (currentExercise?.sets?.length || 1)) / exercises.length) * 100;

  return (
    <View style={[styles.container,{paddingTop:insets.top}]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><text style={styles.backButton}>← Exit</text></TouchableOpacity>
        <Text style={styles.title}>{workout.name}</Text>
      </View>
      <View style={styles.progressBar}>
        <LinearGradient colors={['#0080FF','#0056CC']} start={{x:0,y:0}} end={{x:1,y:0}} style={[styles.progressFill,{width:`${progress}%`}]}/>
      </View>
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.exerciseSection}>
          <Text style={styles.exerciseNumber}>Exercise {currentExerciseIndex+1} of {exercises.length}</Text>
          <Text style={styles.exerciseName}>{currentExercise?.name}</Text>
        </View>
        <LinearGradient colors={[COLORS.bgCard,`${COLORS.accent}15`]} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.setCard}>
          <View style={styles.setHeader}>
            <Text style={styles.setLabel}>Set {currentSetIndex+1}</Text>
            <Text style={styles.setReps}>{currentSet?.reps||10} reps</Text>
          </View>
          {isResting ? (
            <View style={styles.restSection}>
              <Text style={styles.restLabel}>Rest Time</Text>
              <Text style={styles.restTimer}>{restTime}s</Text>
              <TouchableOpacity style={styles.skipButton} onPress={() => setIsResting(false)}>
                <Text style={styles.skipButtonText}>Skip Rest</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.setInstruction}>{isSetCompleted ? '✓ �ompleted' : 'Ready?'}</Text>
              {!isSetCompleted ? (
                <Animated.View style={[styles.completeButtonGradient,{transform:[{scale:scaleAnim}]}]}>
                  <LinearGradient colors={['#00C853','#00A040']} start={{x:0,y:0}} end={{x:1,y:1}}>
                    <TouchableOpacity style={styles.completeButton} onPress={handleCompleteSet}>
                      <Text style={styles.completeButtonText}>Complete Set</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </Animated.View>
              ) : (
                <LinearGradient colors={['#0080FF','#0056CC']} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.completeButtonGradient}>
                  <TouchableOpacity style={styles.completeButton} onPress={handleNextSet}>
                    <Text style={styles.completeButtonText}>{currentSetIndex < (currentExercise?.sets?.length||1)-1 ? 'Next Set' : 'Next Exercise'}</Text>
                  </TouchableOpacity>
                </LinearGradient>
              )}
            </>
          )}
        </LinearGradient>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:COLORS.bgPrimary },
  header:{ flexDirection:'row', alignItems:'center', paddingHorizontal:20, paddingVertical:12 },
  backButton:{ color:COLORS.accent, fontSize:14, fontWeight:'600' },
  title:{ flex:1, textAlign:'center', color:COLORS.textPrimary, fontSize:18, fontWeight:'bold' },
  progressBar:{ height:4, backgroundColor:COLORS.bgCard, marginHorizontal:20, borderRadius:2 },
  progressFill:{ height:4, borderRadius:2 },
  content:{ flex:1 },
  scrollContent:{ paddingHorizontal:20, paddingVertical:20 },
  loadingText:{ color:COLORS.textSecondary, fontSize:14, textAlign:'center', marginTop:20 },
  exerciseSection:{ marginBottom:24 },
  exerciseNumber:{ color:COLORS.textSecondary, fontSize:12, fontWeight:#600' },
  exerciseName:{ color:COLORS.textPrimary, fontSize:28, fontWeight:'bold', marginTop:4, marginBottom:12 },
  setCard:{ borderRadius:12, padding:20, marginBottom:24, borderWidth:1, borderColor:COLORS.accent },
  setHeader:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:16 },
  setLabel:{ color:COLORS.textSecondary, fontSize:12, fontWeight:#600' },
  setReps:{ color:COLORS.accent, fontSize:16, fontWeight:'bold' },
  setInstruction:{ color:COLORS.textPrimary, fontSize:18, fontWeight:'bold', textAlign: 'center', marginBottom:16 },
  restSection:{ alignItems: 'center' },
  restLabel:{ color:COLORS.textSecondary, fontSize:12, fontWeight:'600', marginBottom:12 },
  restTimer:{ color:COLORS.accent, fontSize:56, fontWeight:'bold', marginBottom:16 },
  skipButton:{ borderWidth:1, borderColor:COLORS.accent, paddingVertical:8, paddingHorizontal:16, borderRadius:6 },
  skipButtonText:{ color:COLORS.accent, fontSize:12, fontWeight:#600' },
  weightSection:{ marginBottom:16 },
  weightLabel:{ color:COLORS.textSecondary, fontSize:12, fontWeight:#600', marginBottom:6 },
  weightInput:{ backgroundColor:COLORS.bgSecondary, borderRadius:6, paddingVertical:10, paddingHorizontal:12 },
  weightValue:{ color:COLORS.textPrimary, fontSize:14, fontWeight:'600' },
  completeButtonGradient:{ borderRadius:8, overflow:'hidden' },
  completeButton:{ paddingVertical:14, paddingHorizontal:20, alignItems:'center' },
  completeButtonText:{ color:COLORS.bgPrimary, fontSize:16, fontWeight:'bold' },
  exerciseList:{ marginTop:20 },
  listTitle:{ color:COLORS.textPrimary, fontSize:14, fontWeight:'bold', marginBottom:12 },
  exerciseListItem:{ flexDirection:'row', alignItems:'center', paddingVertical:10, paddingHorizontal:12, backgroundColor:COLORS.bgCard, borderRadius:6, marginBottom:8 },
  exerciseListItemActive:{ backgroundColor:`${COLORS.accent}15`, borderWidth:1, borderColor:COLORS.accent },
  exerciseListNumber:{ color:COLORS.textSecondary, fontSize:12, fontWeight:'bold', width:24, textAlign:'center' },
  exerciseListNumberActive:{ color:COLORS.accent },
  exerciseListName:{ color:COLORS.textPrimary, fontSize:13, fontWeight:'600', flex:1, marginLeft:12 },
  exerciseListNameActive:{ color:COLORS.accent },
});
