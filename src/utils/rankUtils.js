// Rank system: points to rank mapping
// Honor Thespian: 60-119 points
// National Honor Thespian: 120-179 points  
// International Honor Thespian: 180+ points

export const RANK_THRESHOLDS = {
  HONOR_THESPIAN: 60,
  NATIONAL_HONOR_THESPIAN: 120,
  INTERNATIONAL_HONOR_THESPIAN: 180,
};

export const getRankInfo = (points) => {
  const numPoints = Number(points) || 0;
  
  if (numPoints >= RANK_THRESHOLDS.INTERNATIONAL_HONOR_THESPIAN) {
    return {
      rank: 'International Honor Thespian',
      stars: 3,
      color: '#fbbf24',
      nextThreshold: null,
      pointsToNext: 0,
    };
  } else if (numPoints >= RANK_THRESHOLDS.NATIONAL_HONOR_THESPIAN) {
    return {
      rank: 'National Honor Thespian',
      stars: 2,
      color: '#60a5fa',
      nextThreshold: RANK_THRESHOLDS.INTERNATIONAL_HONOR_THESPIAN,
      pointsToNext: RANK_THRESHOLDS.INTERNATIONAL_HONOR_THESPIAN - numPoints,
    };
  } else if (numPoints >= RANK_THRESHOLDS.HONOR_THESPIAN) {
    return {
      rank: 'Honor Thespian',
      stars: 1,
      color: '#34d399',
      nextThreshold: RANK_THRESHOLDS.NATIONAL_HONOR_THESPIAN,
      pointsToNext: RANK_THRESHOLDS.NATIONAL_HONOR_THESPIAN - numPoints,
    };
  } else {
    return {
      rank: 'Thespian',
      stars: 0,
      color: '#9ca3af',
      nextThreshold: RANK_THRESHOLDS.HONOR_THESPIAN,
      pointsToNext: RANK_THRESHOLDS.HONOR_THESPIAN - numPoints,
    };
  }
};

export const getStarRating = (points) => {
  const { stars } = getRankInfo(points);
  return '⭐'.repeat(stars) || 'No Rank Yet';
};

export const getProgressPercent = (points) => {
  const numPoints = Number(points) || 0;
  let currentThreshold, nextThreshold;
  
  if (numPoints >= RANK_THRESHOLDS.INTERNATIONAL_HONOR_THESPIAN) {
    return 100; // Max reached
  } else if (numPoints >= RANK_THRESHOLDS.NATIONAL_HONOR_THESPIAN) {
    currentThreshold = RANK_THRESHOLDS.NATIONAL_HONOR_THESPIAN;
    nextThreshold = RANK_THRESHOLDS.INTERNATIONAL_HONOR_THESPIAN;
  } else if (numPoints >= RANK_THRESHOLDS.HONOR_THESPIAN) {
    currentThreshold = RANK_THRESHOLDS.HONOR_THESPIAN;
    nextThreshold = RANK_THRESHOLDS.NATIONAL_HONOR_THESPIAN;
  } else {
    currentThreshold = 0;
    nextThreshold = RANK_THRESHOLDS.HONOR_THESPIAN;
  }
  
  const progress = ((numPoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  return Math.min(100, Math.max(0, progress));
};
