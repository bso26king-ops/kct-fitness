/**
 * health.js — Unified health platform abstraction
 */
import { Capacitor } from '@capacitor/core';
export const PLATFORM = Capacitor.getPlatform();
export const IS_NATIVE = Capacitor.isNativePlatform();
export const IS_IOS = PLATFORM === 'ios';
export const IS_ANDROID = PLATFORM === 'android';
export function isHealthAvailable() { return IS_IOS || IS_ANDROID; }
export function healthPlatformName() {
  if (IS_IOS) return 'Apple Health';
  if (IS_ANDROID) return 'Google Health Connect';
  return null;
}
export async function requestHealthPermissions() { return { ok: false, error: 'Not available' }; }
export async function fetchTodaySummary() { return { ok: false, error: 'Not available' }; }
export async function fetchRecentWorkouts() { return { ok: false, error: 'Not available' }; }
