/**
 * health.js — Unified health platform abstraction
 *
 * Detects the device platform and routes to:
 *   iOS native    → Apple HealthKit  (@perfood/capacitor-healthkit)
 *   Android native → Health Connect  (@perfood/capacitor-health-connect)
 *   Web/unknown   → unavailable
 *
 * All public functions return { ok: bool, data?, error? } so callers
 * never have to worry about try/catch themselves.
 */

import { Capacitor } from '@capacitor/core';

// ─── Platform detection ───────────────────────────────────────────────────────

export const PLATFORM = Capacitor.getPlatform(); // 'ios' | 'android' | 'web'
export const IS_NATIVE = Capacitor.isNativePlatform();
export const IS_IOS     = PLATFORM === 'ios';
export const IS_ANDROID = PLATFORM === 'android';

// ─── Lazy plugin loaders ──────────────────────────────────────────────────────

let _hk  = null; // HealthKit plugin instance
let _hc  = null; // Health Connect plugin instance

async function getHK() {
  if (_hk !== null) return _hk;
  try {
    const mod = await import(/* @vite-ignore */ '@perfood/capacitor-healthkit');
    _hk = mod.CapacitorHealthkit;
  } catch {
    _hk = false;
  }
  return _hk;
}

async function getHC() {
  if (_hc !== null) return _hc;
  try {
    const mod = await import(/* @vite-ignore */ '@perfood/capacitor-health-connect');
    _hc = mod.HealthConnect;
  } catch {
    _hc = false;
  }
  return _hc;
}

// ─── HealthKit (iOS) helpers ──────────────────────────────────────────────────

const HK_READ = ['steps', 'calories', 'workout', 'heartRate', 'distance'];

async function hkRequestAuth() {
  const hk = await getHK();
  if (!hk) throw new Error('HealthKit plugin not available');
  await hk.requestAuthorization({ all: [], read: HK_READ, write: [] });
}

async function hkQueryToday(sampleName) {
  const hk = await getHK();
  if (!hk) return null;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const res = await hk.queryHKitSampleType({
    sampleName,
    startDate: start.toISOString(),
    endDate:   new Date().toISOString(),
    limit: 1000,
    ascending: false,
  });
  return res?.output ?? [];
}

async function hkQueryWorkouts(limit = 5) {
  const hk = await getHK();
  if (!hk) return [];
  const start = new Date();
  start.setDate(start.getDate() - 30);
  const res = await hk.queryWorkouts({
    startDate: start.toISOString(),
    endDate:   new Date().toISOString(),
    limit,
  });
  return res?.output ?? [];
}

function sumSamples(samples, field = 'quantity') {
  return Math.round(samples.reduce((s, x) => s + (x[field] ?? x.value ?? 0), 0));
}

function avgSamples(samples, field = 'quantity') {
  if (!samples.length) return 0;
  return Math.round(samples.reduce((s, x) => s + (x[field] ?? x.value ?? 0), 0) / samples.length);
}

// ─── Health Connect (Android / Samsung) helpers ───────────────────────────────

const HC_READ = ['Steps', 'ActiveCaloriesBurned', 'HeartRate', 'ExerciseSession', 'Distance'];

async function hcRequestAuth() {
  const hc = await getHC();
  if (!hc) throw new Error('Health Connect plugin not available');
  await hc.requestHealthPermissions({ read: HC_READ, write: [] });
}

function hcTimeRange(daysBack = 0) {
  const end   = new Date();
  const start = new Date();
  start.setDate(start.getDate() - daysBack);
  if (daysBack === 0) start.setHours(0, 0, 0, 0);
  return {
    operator: 'between',
    startTime: start.toISOString(),
    endTime:   end.toISOString(),
  };
}

async function hcReadToday(type) {
  const hc = await getHC();
  if (!hc) return [];
  const res = await hc.readRecords({ type, timeRangeFilter: hcTimeRange(0) });
  return res?.records ?? [];
}

async function hcReadWorkouts(limit = 5) {
  const hc = await getHC();
  if (!hc) return [];
  const res = await hc.readRecords({
    type: 'ExerciseSession',
    timeRangeFilter: hcTimeRange(30),
  });
  const sessions = res?.records ?? [];
  return sessions.slice(0, limit);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns whether a health platform is available on this device.
 */
export function isHealthAvailable() {
  return IS_IOS || IS_ANDROID;
}

/**
 * Returns a human-readable label for the current health platform.
 */
export function healthPlatformName() {
  if (IS_IOS)     return 'Apple Health';
  if (IS_ANDROID) return 'Google Health Connect';
  return null;
}

/**
 * Request health data permissions.
 * Returns { ok: true } on success, { ok: false, error } on failure.
 */
export async function requestHealthPermissions() {
  try {
    if (IS_IOS)     { await hkRequestAuth(); return { ok: true }; }
    if (IS_ANDROID) { await hcRequestAuth(); return { ok: true }; }
    return { ok: false, error: 'Health platform not available on this device.' };
  } catch (err) {
    return { ok: false, error: err?.message ?? 'Permission request failed.' };
  }
}

/**
 * Fetch today's summary: steps, active calories, resting heart rate.
 * Returns { ok, data: { steps, calories, heartRate } }
 */
export async function fetchTodaySummary() {
  try {
    if (IS_IOS) {
      const [stepSamples, calSamples, hrSamples] = await Promise.all([
        hkQueryToday('HKQuantityTypeIdentifierStepCount'),
        hkQueryToday('HKQuantityTypeIdentifierActiveEnergyBurned'),
        hkQueryToday('HKQuantityTypeIdentifierHeartRate'),
      ]);
      return {
        ok: true,
        data: {
          steps:     sumSamples(stepSamples),
          calories:  sumSamples(calSamples),
          heartRate: avgSamples(hrSamples),
        },
      };
    }

    if (IS_ANDROID) {
      const [stepRecs, calRecs, hrRecs] = await Promise.all([
        hcReadToday('Steps'),
        hcReadToday('ActiveCaloriesBurned'),
        hcReadToday('HeartRate'),
      ]);
      const steps    = stepRecs.reduce((s, r) => s + (r.count ?? 0), 0);
      const calories = Math.round(calRecs.reduce((s, r) => s + (r.energy?.inKilocalories ?? 0), 0));
      const hrValues = hrRecs.flatMap(r => r.samples ?? []);
      const heartRate = hrValues.length
        ? Math.round(hrValues.reduce((s, x) => s + x.beatsPerMinute, 0) / hrValues.length)
        : 0;
      return { ok: true, data: { steps, calories, heartRate } };
    }

    return { ok: false, error: 'Not available' };
  } catch (err) {
    return { ok: false, error: err?.message ?? 'Failed to fetch health data.' };
  }
}

/**
 * Fetch the last N workouts from the health platform.
 * Returns { ok, data: [{ name, date, duration, calories, type }] }
 */
export async function fetchRecentWorkouts(limit = 5) {
  try {
    if (IS_IOS) {
      const workouts = await hkQueryWorkouts(limit);
      const data = workouts.map(w => ({
        name:     w.workoutActivityType ?? 'Workout',
        date:     new Date(w.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        duration: Math.round((new Date(w.endDate) - new Date(w.startDate)) / 60000),
        calories: Math.round(w.totalEnergyBurned?.quantity ?? 0),
        type:     w.workoutActivityType ?? 'workout',
      }));
      return { ok: true, data };
    }

    if (IS_ANDROID) {
      const sessions = await hcReadWorkouts(limit);
      const data = sessions.map(s => ({
        name:     s.title ?? s.exerciseType ?? 'Workout',
        date:     new Date(s.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        duration: Math.round((new Date(s.endTime) - new Date(s.startTime)) / 60000),
        calories: Math.round(s.energy?.inKilocalories ?? 0),
        type:     s.exerciseType ?? 'workout',
      }));
      return { ok: true, data };
    }

    return { ok: false, error: 'Not available' };
  } catch (err) {
    return { ok: false, error: err?.message ?? 'Failed to fetch workouts.' };
  }
}
