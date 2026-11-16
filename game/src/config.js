export const VIEW = { width: 960, height: 540 };

export const PALETTE = {
  skyTop: '#070b26',
  skyBottom: '#202553',
  star: '#d9e4ff',
  skylineFar: '#252c55',
  skylineNear: '#36406c',
  cityBody: '#49547b',
  cityRoof: '#b99452',
  windowLit: '#ffd580',
  windowDark: '#192141',
  shield: '#ffc45c',
  shieldCore: '#fff3ce',
  shard: '#e1e9ff',
  shardHeavy: '#ff718a',
  mote: '#8ff1cb',
  ring: '#ffb744',
  ringFlash: '#fff7dc',
  textMain: '#fff2cf',
  textDim: '#9aaad5',
  good: '#80edb5',
  bad: '#ff6c82',
  panelBg: '#101735',
};

export const TUNING = {
  cityMaxHp: 100,
  shardDamage: 9,
  heavyDamage: 14,
  shieldWidth: 120,
  shieldMaxBonus: 96,
  shieldY: 438,
  cityTopY: 492,
  shieldSpeed: 780,
  dashCost: 20,
  dashCostDynamo: 10,
  dashCooldown: 0.9,
  dashCooldownDynamo: 0.5,
  dashTimeScale: 2.4,
  moteEnergy: 18,
  moteScore: 25,
  moteScoreMagnet: 35,
  reflectScore: 10,
  ringScore: 50,
  maxMult: 8,
  slowScale: 0.45,
  slowScaleChrono: 0.32,
  slowDrain: 26,
  slowDrainChrono: 19,
  waveCount: 10,
};

export function waveParams(wave) {
  return {
    duration: 19 + wave,
    spawnEvery: Math.max(0.55, 1.15 - (wave - 1) * 0.065),
    fallSpeed: 112 + wave * 13,
    heavyChance: 0.13,
    swayChance: wave < 3 ? 0 : 0.3,
    moteChance: 0.16,
    ringCount: 2,
  };
}
