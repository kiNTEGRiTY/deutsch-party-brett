/**
 * Rewards - Reward distribution system
 * 
 * Handles coin/star/joker/badge granting with fairness rules.
 */

export const RewardType = {
  COINS: 'coins',
  STARS: 'stars',
  BADGE: 'badge',
  JOKER_HINT: 'hint',
  JOKER_PROTECTION: 'protection',
  JOKER_EXTRA_ROLL: 'extraRoll'
};

// Reward presets for different scenarios
export const REWARD_PRESETS = {
  // Single player task rewards
  taskCorrect: { coins: 3, description: 'Richtig gelöst!' },
  taskPartial: { coins: 1, description: 'Fast richtig!' },
  taskWrong:   { coins: 0, description: 'Nicht schlimm, versuch es weiter!' },

  // Challenge field rewards (all players)
  challengeFirst:  { coins: 5, description: '1. Platz!' },
  challengeSecond: { coins: 3, description: '2. Platz!' },
  challengeThird:  { coins: 2, description: '3. Platz!' },
  challengeOther:  { coins: 1, description: 'Gut mitgemacht!' },

  // Team task
  teamSuccess: { coins: 4, description: 'Tolles Teamwork!' },
  teamPartial: { coins: 2, description: 'Guter Versuch im Team!' },

  // Special fields
  rewardField:   { coins: 3, description: 'Bonus-Münzen!' },
  treasureField: { stars: 1, description: 'Ein Stern für dich! ⭐' },
  helperField:   { joker: 'hint', description: 'Du hast einen Tipp-Joker bekommen! 💡' },
  trapField:     { coins: -2, description: 'Au weia! Eine Falle! 2 Münzen weg.' },
  portalField:   { coins: 0, description: 'Huiii! Ein geheimes Portal! 🌀' },

  // Surprise outcomes
  surpriseGood:   { coins: 5, description: 'Was für ein Glück!' },
  surpriseMedium: { coins: 2, description: 'Eine kleine Überraschung!' },
  surpriseJoker:  { joker: 'extraRoll', description: 'Noch einmal würfeln! 🎲' },
};

/**
 * Grant a reward preset to a player
 */
export function grantReward(player, presetKey) {
  const preset = REWARD_PRESETS[presetKey];
  if (!preset) return null;

  const granted = { type: presetKey, description: preset.description, items: [] };

  if (preset.coins) {
    player.addCoins(preset.coins);
    granted.items.push({ type: 'coins', amount: preset.coins });
  }
  if (preset.stars) {
    player.addStars(preset.stars);
    granted.items.push({ type: 'stars', amount: preset.stars });
  }
  if (preset.joker) {
    player.addJoker(preset.joker);
    granted.items.push({ type: 'joker', subtype: preset.joker, amount: 1 });
  }

  return granted;
}

/**
 * Distribute challenge rewards based on rankings
 * Rankings: array of { player, score, timeMs }
 */
export function distributeChallengeRewards(rankings) {
  const results = [];
  
  for (let i = 0; i < rankings.length; i++) {
    const { player } = rankings[i];
    let presetKey;
    
    if (i === 0) presetKey = 'challengeFirst';
    else if (i === 1) presetKey = 'challengeSecond';
    else if (i === 2) presetKey = 'challengeThird';
    else presetKey = 'challengeOther';
    
    const reward = grantReward(player, presetKey);
    results.push({ player, reward, rank: i + 1 });
  }
  
  return results;
}

/**
 * Get a random surprise outcome
 */
export function getRandomSurprise() {
  const surprises = ['surpriseGood', 'surpriseMedium', 'surpriseJoker'];
  return surprises[Math.floor(Math.random() * surprises.length)];
}

/**
 * Get movement field effect
 */
export function getMovementEffect() {
  // Weighted: more likely forward than backward
  const effects = [
    { move: 2, description: '2 Felder vor! 🏃' },
    { move: 3, description: '3 Felder vor! 🚀' },
    { move: 1, description: '1 Feld vor!' },
    { move: -1, description: '1 Feld zurück 😅' },
    { move: -2, description: '2 Felder zurück 😅' },
  ];
  const weights = [30, 15, 25, 20, 10];
  
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < effects.length; i++) {
    random -= weights[i];
    if (random <= 0) return effects[i];
  }
  return effects[0];
}
