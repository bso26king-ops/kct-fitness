const prisma = require('../lib/prisma');
const { v4: uuidv4 } = require('uuid');

/**
 * Get all exercises with filters
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function getExercises(req, res, next) {
  try {
    const { skip = 0, take = 20, muscleGroup, difficulty, equipment } = req.query;

    const where = {};
    if (muscleGroup) {
      where.muscleGroups = { contains: muscleGroup };
    }
    if (difficulty) where.difficulty = difficulty;
    if (equipment) {
      where.equipment = { contains: equipment };
    }

    const exercises = await prisma.exercise.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(take),
      orderBy: { name: 'asc' },
    });

    const total = await prisma.exercise.count({ where });

    res.json({
      exercises,
      pagination: { skip: parseInt(skip), take: parseInt(take), total },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get exercise by ID
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function getExerciseById(req, res, next) {
  try {
    const { id } = req.params;

    const exercise = await prisma.exercise.findUnique({
      where: { id },
    });

    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    res.json({
      ...exercise,
      muscleGroups: JSON.parse(exercise.muscleGroups || '[]'),
      equipment: JSON.parse(exercise.equipment || '[]'),
      alternatives: JSON.parse(exercise.alternatives || '[]'),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new exercise
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function createExercise(req, res, next) {
  try {
    const {
      name,
      description,
      muscleGroups,
      equipment,
      difficulty,
      videoUrl,
      alternatives,
      beginnerMod,
      advancedProg,
    } = req.body;

    const exercise = await prisma.exercise.create({
      data: {
        id: uuidv4(),
        name,
        description,
        muscleGroups: JSON.stringify(muscleGroups || []),
        equipment: JSON.stringify(equipment || []),
        difficulty,
        videoUrl,
        alternatives: JSON.stringify(alternatives || []),
        beginnerMod,
        advancedProg,
      },
    });

    res.status(201).json({
      ...exercise,
      muscleGroups: JSON.parse(exercise.muscleGroups || '[]'),
      equipment: JSON.parse(exercise.equipment || '[]'),
      alternatives: JSON.parse(exercise.alternatives || '[]'),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update an exercise
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function updateExercise(req, res, next) {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      muscleGroups,
      equipment,
      difficulty,
      videoUrl,
      alternatives,
      beginnerMod,
      advancedProg,
    } = req.body;

    const exercise = await prisma.exercise.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(muscleGroups && { muscleGroups: JSON.stringify(muscleGroups) }),
        ...(equipment && { equipment: JSON.stringify(equipment) }),
        ...(difficulty && { difficulty }),
        ...(videoUrl && { videoUrl }),
        ...(alternatives && { alternatives: JSON.stringify(alternatives) }),
        ...(beginnerMod && { beginnerMod }),
        ...(advancedProg && { advancedProg }),
      },
    });

    res.json({
      ...exercise,
      muscleGroups: JSON.parse(exercise.muscleGroups || '[]'),
      equipment: JSON.parse(exercise.equipment || '[]'),
      alternatives: JSON.parse(exercise.alternatives || '[]'),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete an exercise
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function deleteExercise(req, res, next) {
  try {
    const { id } = req.params;

    const exercise = await prisma.exercise.findUnique({
      where: { id },(€€€ô¤ì((€€€¥˜€ …•á•É¥Í”¤ì(€€€€€É•ÑÕÉ¸É•Ì¹ÍÑ…ÑÕÌ ĞÀĞ¤¹©Í½¸¡ì•ÉÉ½Èè€á•É¥Í”¹½Ğ™½Õ¹œô¤ì(€€€ô((€€€…İ…¥ĞÁÉ¥Íµ„¹•á•É¥Í”¹‘•±•Ñ”¡ì(€€€€€İ¡•É”èì¥ô°(€€€ô¤ì((€€€É•Ì¹©Í½¸¡ìµ•ÍÍ…”è€á•É¥Í”‘•±•Ñ•œô¤ì(€ô…Ñ €¡•ÉÉ½È¤ì(€€€¹•áĞ¡•ÉÉ½È¤ì(€ô)ô((¼¨¨(€¨•Ğ…±Ñ•É¹…Ñ¥Ù”•á•É¥Í•Ì™½È„¥Ù•¸•á•É¥Í”(€¨Á…É…´í½‰©•ÑôÉ•Ä€´áÁÉ•ÍÌÉ•ÅÕ•ÍĞ(€¨Á…É…´í½‰©•ÑôÉ•Ì€´áÁÉ•ÍÌÉ•ÍÁ½¹Í”(€¨Á…É…´í™Õ¹Ñ¥½¹ô¹•áĞ€´áÁÉ•ÍÌ¹•áĞ(€¨¼)…Íå¹Œ™Õ¹Ñ¥½¸•Ñ±Ñ•É¹…Ñ¥Ù•Ì¡É•Ä°É•Ì°¹•áĞ¤ì(€ÑÉäì(€€€½¹ÍĞì¥ô€ôÉ•Ä¹Á…É…µÌì(€€(€€€½¹ÍĞ•á•É¥Í”€ô…İ…¥ĞÁÉ¥Íµ„¹•á•É¥Í”¹™¥¹‘U¹¥ÅÕ”¡ì(€€€€€İ¡•É”èì¥ô°(€€€ô¤ì((€€€¥˜€ …•á•É¥Í”¤ì(€€€€€É•ÑÕÉ¸É•Ì¹ÍÑ…ÑÕÌ ĞÀĞ¤¹©Í½¸¡ì•ÉÉ½Èè€á•É¥Í”¹½Ğ™½Õ¹œô¤ì(€€€ô((€€€½¹ÍĞ…±Ñ•É¹…Ñ¥Ù•Ì€ô)M=8¹Á…ÉÍ”¡•á•É¥Í”¹…±Ñ•É¹…Ñ¥Ù•Ìñğ€mtœ¤ì((€€€½¹ÍĞ…±Ñ•É¹…Ñ¥Ù•á•É¥Í•Ì€ô…İ…¥ĞÁÉ¥Íµ„¹•á•É¥Í”¹™¥¹‘5…¹ä¡ì(€€€€€İ¡•É”èì¥èì¥¸è…±Ñ•É¹…Ñ¥Ù•Ìôô°(€€€ô¤ì((€€€É•Ì¹©Í½¸¡…±Ñ•É¹…Ñ¥Ù•á•É¥Í•Ì¤ì(€ô…Ñ €¡•ÉÉ½È¤ì(€€€¹•áĞ¡•ÉÉ½È¤ì(€ô)ô()µ½‘Õ±”¹•áÁ½ÉÑÌ€ôì(€•Ñá•É¥Í•Ì°(€•Ñá•É¥Í•	å%°(€É•…Ñ•á•É¥Í”°(€ÕÁ‘…Ñ•á•É¥Í”°(€‘•±•Ñ•á•É¥Í”°(€•Ñ±Ñ•É¹…Ñ¥Ù•Ì°)ôì(