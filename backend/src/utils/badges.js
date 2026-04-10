const prisma = require('../lib/prisma');

const BADGE_TYPES = {
  FIRST_WORKOUT: 'FIRST_WORKOUT',
  TEN_WORKOUTS: 'TEN_WORKOUTS',
  FIFTY_WORKOUTS: 'FIFTY_WORKOUTS',
  CENTURY_WORKOUTS: 'CENTURY_WORKOUTS',
  SEVEN_DAY_STREAK: 'SEVEN_DAY_STREAK',
  THIRTY_DAY_STREAK: 'THIRTY_DAY_STREAK',
  FIRST_PR: 'FIRST_PR',
};

const BADGE_DESCRIPTIONS = {
  FIRST_WORKOUT: 'Complete your first workout',
  TEN_WORKOUTS: 'Complete 10 workouts',
  FIFTY_WORKOUTS: 'Complete 50 workouts',
  CENTURY_WORKOUTS: 'Complete 100 workouts',
  SEVEN_DAY_STREAK: 'Maintain a 7-day workout streak',
  THIRTY_DAY_STREAK: 'Maintain a 30-day workout streak',
  FIRST_PR: 'Record your first personal record',
};

async function checkAndAwardBadges(userId) {
  const newBadges = [];
  try {
    const workoutCount = await prisma.userWorkoutLog.count({ where: { userId } });
    const existingBadges = await prisma.badge.findMany({ where: { userId } });
    const existingTypes = new Set(existingBadges.map(b => b.badgeType));
    const checks = [[1,'FIRST_WORKOUT'],[10,'TEN_WORKOUTS'],[50,'FIFTY_WORKOUTS'],[100,'CENTURY_WORKOUTS']];
    for (const [count,type] of checks) {
      if (workoutCount >= count && !existingTypes.has(type)) {
        newBadges.push(await prisma.badge.create({ data: { userId, badgeType: type } }));
      }
    }
    return newBadges;
  } catch (e) { console.error(e); return []; }
}

module.exports = { checkAndAwardBadges, BADGE_TYPES, BADGE_DESCRIPTIONS };
