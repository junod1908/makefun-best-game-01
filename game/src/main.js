import { VIEW, TUNING, waveParams } from './config.js';
import { Input } from './input.js';
import { SoundBank } from './audio.js';
import { createGame, UPGRADES, pickChoices, applyUpgrade, shieldWidth, slowScale, slowDrain, dashCost, dashCooldown, startWave } from './world.js';
import { placeRings, spawnShard, spawnMote, updateEntities, burst } from './shots.js';
import { drawGame, choiceRects } from './render.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const input = new Input(canvas);
const sound = new SoundBank();
['mousemove','mousedown','contextmenu'].forEach(e => canvas.addEventListener(e, () => sound.unlock()));
['keydown','keyup','mouseup'].forEach(e => window.addEventListener(e, () => sound.unlock()));

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
const parsedSeed = Number.parseInt(params.get('seed') || '1', 10);
const seed = Number.isFinite(parsedSeed) ? parsedSeed : 1;
let state;

function setupShot(kind) {
  state = createGame(seed);
  if (kind === 'start') { state.phase = 'title'; return; }
  if (kind === 'play') {
    startWave(state, 4); state.phase = 'playing'; Object.assign(state, { score: 1250, mult: 3, cityHp: 76, energy: 62, waveTime: 8.2 }); state.shield.x = 545; placeRings(state);
    for (let i=0;i<5;i++) state.shards.push({ x: 110 + state.rng()*740, y: 85 + state.rng()*190, vx: 0, vy: 0, r: i===2?16:11, kind: i===2?'heavy':'plain', swayPhase:0, spin:state.rng()*6 });
    for (let i=0;i<2;i++) spawnMote(state);
    state.bolts.push({ x: state.rings[0].x - 20, y: 360, vx: 20, vy: -250, r: 10, scoredRings: [] });
    burst(state, 540, 300, '#ffc45c', 8); return;
  }
  if (kind === 'upgrade') { state.phase='upgrade'; Object.assign(state,{score:1840,wave:3,cityHp:84,energy:47}); state.choices=[UPGRADES[0],UPGRADES[1],UPGRADES[2]]; placeRings(state); return; }
  state.phase='lost'; Object.assign(state,{score:2730,wave:8,cityHp:0,mult:1,stats:{reflected:61,ringHits:9,motesCaught:23,cityHits:12}});
}

function startRun() { state = createGame((Date.now() % 90000) + 7); startWave(state, 1); placeRings(state); state.phase = 'playing'; }

if (shot) setupShot(shot); else { state = createGame((Date.now() % 90000) + 7); state.phase = 'title'; }

function update(dt) {
  if (input.wasPressed('KeyM')) sound.toggleMute();
  if (state.phase === 'title') { if (input.takeConfirm()) startRun(); return; }
  if (state.phase === 'playing') {
    const slowActive = input.slowHeld && state.energy > 0.5; state.slowActive = slowActive;
    const scale = slowActive ? slowScale(state) : 1; if (slowActive) state.energy = Math.max(0, state.energy - slowDrain(state) * dt); const edt = dt * scale;
    let target = input.mouseX; const left = input.keysDown.has('ArrowLeft') || input.keysDown.has('KeyA'); const right = input.keysDown.has('ArrowRight') || input.keysDown.has('KeyD');
    if (left || right) target = state.shield.x + (right ? 1 : -1) * TUNING.shieldSpeed * dt;
    if (input.takeDash() && state.time >= state.shield.dashReadyAt && state.energy >= dashCost(state)) { state.energy -= dashCost(state); state.shield.dashUntil = state.time + .22; state.shield.dashReadyAt = state.time + dashCooldown(state); sound.dash(); }
    const speed = state.time < state.shield.dashUntil ? TUNING.shieldSpeed * TUNING.dashTimeScale : TUNING.shieldSpeed; state.shield.x += Math.max(-speed*dt, Math.min(speed*dt, target-state.shield.x)); state.shield.x = Math.max(shieldWidth(state)/2, Math.min(VIEW.width-shieldWidth(state)/2, state.shield.x));
    state.waveTime += edt; const wp=waveParams(state.wave); if(state.waveTime<wp.duration){state.spawnIn-=edt; while(state.spawnIn<=0){rngSpawn(state,wp); state.spawnIn += wp.spawnEvery*(.7+state.rng()*.6);}}
    const events=[]; updateEntities(state,edt,events); events.forEach(e=>sound[e] && sound[e]());
    if(state.cityHp<=0){state.cityHp=0;state.phase='lost';sound.lose();return;} if(state.waveTime>=wp.duration&&state.shards.length===0){state.score+=100*state.wave;if(state.wave>=TUNING.waveCount){state.phase='won';sound.win();}else{state.phase='upgrade';state.choices=pickChoices(state.rng);sound.upgrade();}} return;
  }
  if (state.phase === 'upgrade') { const n=input.takeChoice(); const click=input.takeClick(); let i=n? n-1 : -1; if(i<0&&click){const rs=choiceRects();i=rs.findIndex(r=>click.x>=r.x&&click.x<=r.x+r.w&&click.y>=r.y&&click.y<=r.y+r.h);} if(i>=0&&state.choices[i]){applyUpgrade(state,state.choices[i].id);sound.click();sound.upgrade();startWave(state,state.wave+1);placeRings(state);state.phase='playing';} return; }
  if ((state.phase==='won'||state.phase==='lost') && (input.takeRestart() || input.takeClick())) startRun();
}
function rngSpawn(s,wp){ s.rng()<wp.moteChance ? spawnMote(s) : spawnShard(s); }

let last=performance.now();
function frame(now){const dt=Math.max(0,Math.min(.033,(now-last)/1000));last=now;state.time+=dt;if(!shot)update(dt);const hover=shot==='upgrade'?0:(state.phase==='upgrade'?choiceRects().findIndex(r=>input.mouseX>=r.x&&input.mouseX<=r.x+r.w&&input.mouseY>=r.y&&input.mouseY<=r.y+r.h):-1);drawGame(ctx,state,hover);input.postUpdate();requestAnimationFrame(frame);}
requestAnimationFrame(frame);
