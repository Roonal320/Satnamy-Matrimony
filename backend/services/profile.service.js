/**
 * Compute matchmaking score between user profile and current authenticated user.
 */
function calculateMatchScore(profile, currentUser) {
  let score = 0;

  // Premium plan priority
  if (profile.is_premium) {
    const plan = profile.premium_plan || "";
    if (plan.includes("platinum")) {
      score += 1000;
    } else if (plan.includes("diamond")) {
      score += 500;
    } else if (plan.includes("gold")) {
      score += 200;
    }
  }

  // Matching algorithm criteria
  if (currentUser) {
    if (profile.caste && currentUser.caste && profile.caste.toLowerCase() === currentUser.caste.toLowerCase()) {
      score += 150;
    }
    if (profile.state && currentUser.state && profile.state.toLowerCase() === currentUser.state.toLowerCase()) {
      score += 100;
    }
    if (profile.city && currentUser.city && profile.city.toLowerCase() === currentUser.city.toLowerCase()) {
      score += 50;
    }
    if (profile.marital_status && currentUser.marital_status && profile.marital_status.toLowerCase() === currentUser.marital_status.toLowerCase()) {
      score += 40;
    }
    if (profile.religion && currentUser.religion && profile.religion.toLowerCase() === currentUser.religion.toLowerCase()) {
      score += 30;
    }
  }

  return score;
}

/**
 * Return numeric priority based on premium subscription tier.
 */
function getPlanPriority(profile) {
  if (!profile.is_premium) return 0;
  const plan = profile.premium_plan || "";
  if (plan.includes("platinum")) return 3;
  if (plan.includes("diamond")) return 2;
  if (plan.includes("gold")) return 1;
  return 0;
}

module.exports = {
  calculateMatchScore,
  getPlanPriority
};
