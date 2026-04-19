// Difficulty levels configuration
export const DIFFICULTY_LEVELS = {
  BEGINNER: {
    name: 'Beginner',
    level: 1,
    pointsRequired: 0,
    icon: '🌱',
    color: '#10b981',
    description: 'Basic syntax and variable scope',
    topics: ['variables', 'functions', 'loops', 'conditionals'],
    questionCount: 5
  },
  JUNIOR: {
    name: 'Junior Developer',
    level: 2,
    pointsRequired: 200,
    icon: '👨‍💻',
    color: '#3b82f6',
    description: 'Functions, loops, basic async',
    topics: ['async/await', 'promises', 'array methods', 'objects'],
    questionCount: 10
  },
  MID_LEVEL: {
    name: 'Mid-Level Developer',
    level: 3,
    pointsRequired: 500,
    icon: '🚀',
    color: '#f59e0b',
    description: 'Closures, promises, error handling',
    topics: ['closures', 'event loop', 'prototypes', 'error handling'],
    questionCount: 15
  },
  SENIOR: {
    name: 'Senior Developer',
    level: 4,
    pointsRequired: 1000,
    icon: '👑',
    color: '#ef4444',
    description: 'Race conditions, memory leaks, system design',
    topics: ['race conditions', 'memory leaks', 'performance', 'optimization'],
    questionCount: 20
  },
  EXPERT: {
    name: 'FAANG Ready',
    level: 5,
    pointsRequired: 2000,
    icon: '🏆',
    color: '#8b5cf6',
    description: 'Advanced concurrency, optimization, security',
    topics: ['concurrency', 'web workers', 'streaming', 'security'],
    questionCount: 25
  }
};

// Questions by difficulty level
export const QUESTIONS_BY_DIFFICULTY = {
  BEGINNER: [
    { id: 'b1', topic: 'undefined_variable', points: 20, timeEstimate: 60 },
    { id: 'b2', topic: 'syntax_error', points: 20, timeEstimate: 60 },
    { id: 'b3', topic: 'type_mismatch', points: 30, timeEstimate: 90 },
    { id: 'b4', topic: 'missing_async', points: 30, timeEstimate: 90 },
    { id: 'b5', topic: 'indentation_error', points: 20, timeEstimate: 60 }
  ],
  JUNIOR: [
    { id: 'j1', topic: 'async_await', points: 40, timeEstimate: 120 },
    { id: 'j2', topic: 'array_methods', points: 40, timeEstimate: 120 },
    { id: 'j3', topic: 'object_reference', points: 50, timeEstimate: 150 },
    { id: 'j4', topic: 'callback_hell', points: 50, timeEstimate: 150 },
    { id: 'j5', topic: 'promise_chaining', points: 60, timeEstimate: 180 }
  ],
  MID_LEVEL: [
    { id: 'm1', topic: 'closures', points: 70, timeEstimate: 180 },
    { id: 'm2', topic: 'event_loop', points: 70, timeEstimate: 180 },
    { id: 'm3', topic: 'prototype_chain', points: 80, timeEstimate: 210 },
    { id: 'm4', topic: 'hoisting', points: 80, timeEstimate: 210 },
    { id: 'm5', topic: 'this_binding', points: 90, timeEstimate: 240 }
  ],
  SENIOR: [
    { id: 's1', topic: 'race_conditions', points: 100, timeEstimate: 300 },
    { id: 's2', topic: 'memory_leaks', points: 100, timeEstimate: 300 },
    { id: 's3', topic: 'debounce_throttle', points: 110, timeEstimate: 330 },
    { id: 's4', topic: 'currying', points: 110, timeEstimate: 330 },
    { id: 's5', topic: 'composition', points: 120, timeEstimate: 360 }
  ],
  EXPERT: [
    { id: 'e1', topic: 'concurrency', points: 150, timeEstimate: 450 },
    { id: 'e2', topic: 'web_workers', points: 150, timeEstimate: 450 },
    { id: 'e3', topic: 'service_workers', points: 160, timeEstimate: 480 },
    { id: 'e4', topic: 'streaming', points: 160, timeEstimate: 480 },
    { id: 'e5', topic: 'optimization', points: 170, timeEstimate: 510 }
  ]
};

// Get user progress from localStorage (frontend) or database
export function getUserProgress(userId) {
  // This would normally fetch from database
  // For now, return default structure
  return {
    userId,
    totalPoints: 0,
    currentLevel: 'BEGINNER',
    solvedQuestions: [],
    levelHistory: [{ level: 'BEGINNER', unlockedAt: new Date().toISOString() }],
    stats: {
      totalAttempts: 0,
      averageScore: 0,
      bestStreak: 0,
      currentStreak: 0
    }
  };
}

// Update user progress after solving a question
export function updateProgress(progress, question, hintsUsed, success, timeTaken) {
  if (!success) return progress;
  
  // Calculate points based on difficulty and hints used
  let pointsEarned = question.points || 50;
  
  if (hintsUsed === 1) pointsEarned = Math.floor(pointsEarned * 0.8);
  else if (hintsUsed === 2) pointsEarned = Math.floor(pointsEarned * 0.5);
  else if (hintsUsed >= 3) pointsEarned = Math.floor(pointsEarned * 0.2);
  
  // Time bonus
  if (timeTaken && timeTaken < question.timeEstimate) {
    pointsEarned = Math.floor(pointsEarned * 1.1);
  }
  
  progress.totalPoints += pointsEarned;
  progress.solvedQuestions.push({
    id: question.id,
    topic: question.topic,
    pointsEarned,
    hintsUsed,
    timeTaken,
    timestamp: new Date().toISOString()
  });
  
  // Check for level up
  let newLevel = progress.currentLevel;
  const levels = Object.keys(DIFFICULTY_LEVELS);
  const currentIndex = levels.indexOf(progress.currentLevel);
  
  for (let i = currentIndex + 1; i < levels.length; i++) {
    const level = levels[i];
    if (progress.totalPoints >= DIFFICULTY_LEVELS[level].pointsRequired) {
      newLevel = level;
    }
  }
  
  const leveledUp = newLevel !== progress.currentLevel;
  if (leveledUp) {
    progress.currentLevel = newLevel;
    progress.levelHistory.push({
      level: newLevel,
      unlockedAt: new Date().toISOString(),
      pointsAtUnlock: progress.totalPoints
    });
  }
  
  return {
    ...progress,
    pointsEarned,
    leveledUp,
    newLevel,
    nextLevelPoints: DIFFICULTY_LEVELS[levels[levels.indexOf(newLevel) + 1]]?.pointsRequired || null
  };
}

// Get recommended next questions based on weak areas
export function getRecommendedQuestions(progress, count = 3) {
  const currentLevelQuestions = QUESTIONS_BY_DIFFICULTY[progress.currentLevel];
  const solvedIds = progress.solvedQuestions.map(q => q.id);
  
  const unsolved = currentLevelQuestions.filter(q => !solvedIds.includes(q.id));
  
  if (unsolved.length === 0) {
    const levels = Object.keys(QUESTIONS_BY_DIFFICULTY);
    const currentIndex = levels.indexOf(progress.currentLevel);
    const nextLevel = levels[currentIndex + 1];
    
    if (nextLevel) {
      return {
        levelUp: true,
        message: `🎉 Congratulations! You've mastered ${progress.currentLevel}. Ready for ${nextLevel}?`,
        questions: QUESTIONS_BY_DIFFICULTY[nextLevel].slice(0, count)
      };
    }
    
    return {
      completed: true,
      message: "🏆 Amazing! You've mastered all levels! You're FAANG ready!",
      questions: []
    };
  }
  
  return {
    levelUp: false,
    questions: unsolved.slice(0, count)
  };
}

// Calculate interview readiness score
export function calculateReadinessScore(progress) {
  const totalPossiblePoints = 2000; // Expert level points required
  const percentage = (progress.totalPoints / totalPossiblePoints) * 100;
  
  let level = "Beginner";
  if (percentage >= 80) level = "FAANG Ready";
  else if (percentage >= 60) level = "Senior";
  else if (percentage >= 40) level = "Mid-Level";
  else if (percentage >= 20) level = "Junior";
  
  return {
    score: Math.min(100, Math.floor(percentage)),
    level,
    remainingPoints: Math.max(0, totalPossiblePoints - progress.totalPoints),
    estimatedTimeToReady: Math.ceil((totalPossiblePoints - progress.totalPoints) / 50) // 50 points per day average
  };
}

export default {
  DIFFICULTY_LEVELS,
  QUESTIONS_BY_DIFFICULTY,
  getUserProgress,
  updateProgress,
  getRecommendedQuestions,
  calculateReadinessScore
};