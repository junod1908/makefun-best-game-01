import { TUNING, waveParams, PALETTE } from './config.js';
import { shieldWidth } from './world.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const shieldHit = (x, y, r, state) => Math.abs(y - TUNING.shieldY) <= 12 && Math.abs(x - state.shield.x) <= shieldWidth(state) / 2 + r;

export function placeRings(state) {
  const count = waveParams(state.wave).ringCount, rings = [];
  for (let i = 0; i < count; i++) {
    let x, tries = 0;
    do { x = 150 + state.rng() * 660; tries++; } while (rings.some(r => Math.abs(r.x - x) < 160) && tries < 30);
    rings.push({ x, y: 140 + state.rng() * 100, r: 26, flash: 0 });
  }
  state.rings = rings;
}

export function spawnShard(state) {
  const p = waveParams(state.wave), q = state.rng();
  const kind = q < p.heavyChance ? 'heavy' : q < p.heavyChance + p.swayChance ? 'sway' : 'plain';
  state.shards.push({ x: 40 + state.rng() * 880, y: -20, vx: 0, vy: p.fallSpeed * (0.9 + state.rng() * 0.25), r: kind === 'heavy' ? 16 : 11, kind, swayPhase: state.rng() * Math.PI * 2, spin: state.rng() * Math.PI * 2 });
}
export function spawnMote(state) { state.motes.push({ x: 40 + state.rng() * 880, y: -16, vx: 0, vy: 82 + state.rng() * 20, r: 9, glow: state.rng() * Math.PI * 2 }); }
export function burst(state, x, y, color, n) { for (let i=0;i<n;i++) { const a=state.rng()*Math.PI*2, s=40+state.rng()*130; const life=.5+state.rng()*.4; state.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life,maxLife:life,color,size:2+state.rng()*1.5}); } }

export function updateEntities(state, dt, events) {
  for (let i=state.shards.length-1;i>=0;i--) { const s=state.shards[i]; if(s.kind==='sway') s.vx=Math.sin(state.time*3+s.swayPhase)*26; s.x+=s.vx*dt; s.y+=s.vy*dt;
    if(shieldHit(s.x,s.y,s.r,state)){ const off=clamp((s.x-state.shield.x)/(shieldWidth(state)/2),-1,1); state.bolts.push({x:s.x,y:TUNING.shieldY-14,vx:off*260,vy:-(330+Math.abs(off)*120+state.rng()*40),r:s.r,scoredRings:[]}); state.score+=TUNING.reflectScore*state.mult; state.stats.reflected++; burst(state,s.x,TUNING.shieldY,PALETTE.shield,8); events.push('reflect'); state.shards.splice(i,1); continue; }
    if(s.y>=TUNING.cityTopY){state.cityHp-=s.kind==='heavy'?TUNING.heavyDamage:TUNING.shardDamage;state.mult=1;state.stats.cityHits++;burst(state,s.x,TUNING.cityTopY,PALETTE.bad,10);events.push('cityHit');state.shards.splice(i,1);}
  }
  for(let i=state.bolts.length-1;i>=0;i--){const b=state.bolts[i];b.x+=b.vx*dt;b.y+=b.vy*dt; for(const r of state.rings) if(!b.scoredRings.includes(r)&&Math.hypot(b.x-r.x,b.y-r.y)<=r.r){b.scoredRings.push(r);state.score+=TUNING.ringScore*state.mult;state.mult=Math.min(TUNING.maxMult,state.mult+1);r.flash=1;state.stats.ringHits++;burst(state,r.x,r.y,PALETTE.ring,10);events.push('ring');} if(b.y<-24)state.bolts.splice(i,1);}
  for(let i=state.motes.length-1;i>=0;i--){const m=state.motes[i];if(state.upgrades.magnet>0&&m.y<TUNING.shieldY&&Math.abs(m.x-state.shield.x)<150)m.vx=clamp((state.shield.x-m.x)*2,-180,180);m.x+=m.vx*dt;m.y+=m.vy*dt;if(shieldHit(m.x,m.y,m.r,state)){state.energy=Math.min(100,state.energy+TUNING.moteEnergy);state.score+=state.upgrades.magnet?TUNING.moteScoreMagnet:TUNING.moteScore;state.stats.motesCaught++;burst(state,m.x,m.y,PALETTE.mote,8);events.push('mote');state.motes.splice(i,1);}else if(m.y>=TUNING.cityTopY){burst(state,m.x,TUNING.cityTopY,PALETTE.textDim,3);state.motes.splice(i,1);}}
  for(let i=state.particles.length-1;i>=0;i--){const p=state.particles[i];p.vy+=160*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)state.particles.splice(i,1);} for(const r of state.rings)r.flash=Math.max(0,r.flash-dt*3); state.energy=clamp(state.energy,0,100);state.cityHp=clamp(state.cityHp,0,100);
}
