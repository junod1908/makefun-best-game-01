import { TUNING } from './config.js';

export function createRng(seed) {
  let a = seed >>> 0;
  return function rng() {
    a += 0x6D2B79F5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const UPGRADES = [
  { id: 'widen', name: 'Aegis Widening', blurb: 'Shield grows 24 wider, for good.' },
  { id: 'chrono', name: 'Chrono Field', blurb: 'Slow-time runs deeper and drains less.' },
  { id: 'repair', name: 'City Repairs', blurb: 'Restore 30 city integrity now.' },
  { id: 'magnet', name: 'Mote Magnet', blurb: 'Motes drift toward your shield and pay more.' },
  { id: 'dynamo', name: 'Dash Dynamo', blurb: 'Dashes cost half and recharge faster.' },
];

export function createGame(seed) {
  const rng = createRng(seed);
  const stars = Array.from({ length: 90 }, () => ({ x: rng() * 960, y: rng() * 540, r: 0.6 + rng() * 1.8, phase: rng() * Math.PI * 2 }));
  return { phase: 'title', time: 0, seed, rng, score: 0, mult: 1, cityHp: TUNING.cityMaxHp, energy: 35,
    wave: 0, waveTime: 0, spawnIn: 0, banner: '', bannerUntil: 0,
    shield: { x: 480, vx: 0, dashUntil: 0, dashReadyAt: 0 },
    shards: [], motes: [], bolts: [], rings: [], particles: [], choices: [], picked: [],
    stats: { reflected: 0, ringHits: 0, motesCaught: 0, cityHits: 0 },
    upgrades: { widen: 0, chrono: 0, magnet: 0, dynamo: 0 }, stars, slowActive: false };
}

export function pickChoices(rng) {
  const pool = UPGRADES.slice(), out = [];
  while (out.length < 3) out.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  return out;
}

export function applyUpgrade(state, id) {
  const upgrade = UPGRADES.find(u => u.id === id);
  if (!upgrade) return;
  if (id === 'repair') state.cityHp = Math.min(TUNING.cityMaxHp, state.cityHp + 30);
  else if (state.upgrades[id] !== undefined) state.upgrades[id]++;
  state.picked.push(id);
}

export const shieldWidth = state => Math.min(TUNING.shieldWidth + 24 * state.upgrades.widen, TUNING.shieldWidth + TUNING.shieldMaxBonus);
export const slowScale = state => state.upgrades.chrono > 0 ? TUNING.slowScaleChrono : TUNING.slowScale;
export const slowDrain = state => state.upgrades.chrono > 0 ? TUNING.slowDrainChrono : TUNING.slowDrain;
export const dashCost = state => state.upgrades.dynamo > 0 ? TUNING.dashCostDynamo : TUNING.dashCost;
export const dashCooldown = state => state.upgrades.dynamo > 0 ? TUNING.dashCooldownDynamo : TUNING.dashCooldown;

export function startWave(state, n) {
  state.wave = n; state.waveTime = 0; state.spawnIn = 0.6;
  state.banner = 'WAVE ' + n; state.bannerUntil = state.time + 1.6;
  state.shards.length = 0; state.motes.length = 0; state.bolts.length = 0;
}
