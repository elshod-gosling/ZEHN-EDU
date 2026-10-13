import {direction,rayBox,armorDamage,SOLIDS} from './physics.mjs';

const bounds=p=>[p.x-.3,p.y,p.z-.3,p.x+.3,p.y+1.8,p.z+.3];
const intersects=(a,b)=>[0,1,2].every(k=>a[k]<b[k+3]-1e-6&&a[k+3]>b[k]+1e-6);
export const SPLASH_RADIUS=4;
export const POTIONS=['healing','speed','strength'];
export function launchProjectile(p,event,id){
 const dir=direction(p),speed=event.item==='arrow'?.5+event.power*2.5:POTIONS.includes(event.item)?.6:1.5;
 return {id,owner:p.id,item:event.item,x:p.x,y:p.y+1.62,z:p.z,vx:dir[0]*speed,vy:dir[1]*speed,vz:dir[2]*speed,power:event.power,age:0};
}
export function splashPotion(shot,players,directTarget=null){
 const events=[{kind:'splash',id:shot.owner,item:shot.item,x:shot.x,y:shot.y,z:shot.z}];
 for(const p of players){
  if(p.health<=0)continue;
  const b=bounds(p),point=[shot.x,shot.y,shot.z];
  const distance=Math.hypot(...point.map((v,k)=>v-Math.max(b[k],Math.min(b[k+3],v))));
  if(distance>=SPLASH_RADIUS&&p!==directTarget)continue;
  const intensity=p===directTarget?1:1-distance/SPLASH_RADIUS;
  if(shot.item==='healing'){const before=p.health;p.health=Math.min(20,p.health+8*intensity);if(p.health>before)events.push({kind:'heal',id:p.id});}
  else{const key=shot.item==='speed'?'speedTicks':'strengthTicks';p[key]=Math.max(p[key],Math.round(1200*intensity));events.push({kind:shot.item,id:p.id});}
 }
 return events;
}
// Search backwards from impact for a supported, empty player-sized landing.
// Pearls never place a fighter inside a pillar or outside the playable walls.
export function pearlLanding(shot,point,solids=SOLIDS){
 const length=Math.hypot(shot.vx,shot.vz)||1;
 for(const offset of [.65,1,1.5,2]){
  const x=point[0]-shot.vx/length*offset,z=point[2]-shot.vz/length*offset;
  if(Math.abs(x)>13.65||Math.abs(z)>13.65)continue;
  const supports=solids.filter(s=>x+.3>s[0]&&x-.3<s[3]&&z+.3>s[2]&&z-.3<s[5]&&s[4]<=point[1]+.05);
  const y=Math.max(0,...supports.map(s=>s[4]));
  const p={x,y,z};if(supports.length&&!solids.some(s=>intersects(bounds(p),s)))return p;
 }
 return null;
}
export function tickProjectiles(shots,players,solids=SOLIDS){
 const events=[];
 for(let index=shots.length-1;index>=0;index--){
  const s=shots[index],owner=players.find(p=>p.id===s.owner);
  if(!owner||owner.health<=0||++s.age>160){shots.splice(index,1);continue;}
  const origin=[s.x,s.y,s.z],velocity=[s.vx,s.vy,s.vz];let time=1,target=null,impact=false;
  for(const solid of solids){const t=rayBox(origin,velocity,solid);if(t<=time){time=t;impact=true;target=null;}}
  for(const p of players){if(p.id===s.owner||p.health<=0)continue;const t=rayBox(origin,velocity,bounds(p));if(t<time){time=t;impact=true;target=p;}}
  s.x+=s.vx*time;s.y+=s.vy*time;s.z+=s.vz*time;
  if(impact){
   if(POTIONS.includes(s.item))events.push(...splashPotion(s,players,target));
   else if(s.item==='pearl'){
    const landing=pearlLanding(s,[s.x,s.y,s.z],solids);
    if(landing){Object.assign(owner,landing,{vx:0,vy:0,vz:0,fall:0,ground:true,draw:0,use:0});const absorbed=Math.min(owner.absorption,4);owner.absorption-=absorbed;owner.health=Math.max(0,owner.health-4+absorbed);events.push({kind:'teleport',id:owner.id});}
   }else if(target){
    const front=Math.sin(target.yaw)*s.vx+Math.cos(target.yaw)*s.vz>0;
    if(target.shieldTicks>=5&&front)events.push({kind:'block',id:s.owner,target:target.id});
    else if(s.item==='snowball'){
     if(!target.snowballHurt){knockback(target,s,.25);target.snowballHurt=10;events.push({kind:'snowballHit',id:s.owner,target:target.id});}
    }else{
     let damage=armorDamage(2+7*s.power);
     if(target.hurt>10){if(damage<=target.lastDamage){shots.splice(index,1);continue;}const full=damage;damage-=target.lastDamage;target.lastDamage=full;}else{target.lastDamage=damage;target.hurt=20;}
     const absorbed=Math.min(target.absorption,damage);target.absorption-=absorbed;target.health=Math.max(0,target.health-damage+absorbed);target.hitFlash=4;knockback(target,s,.4);
     events.push({kind:'arrowHit',id:s.owner,target:target.id,damage});
    }
   }
   shots.splice(index,1);
  }else{s.vx*=.99;s.vy=s.vy*.99-(s.item==='arrow'||POTIONS.includes(s.item)?.05:.03);s.vz*=.99;}
 }
 return events;
}
function knockback(p,s,power){const length=Math.hypot(s.vx,s.vz)||1;p.vx=p.vx*.5+s.vx/length*power;p.vz=p.vz*.5+s.vz/length*power;if(p.ground)p.vy=.3;}
export function validProjectiles(shots){return Array.isArray(shots)&&shots.length<=64&&shots.every(s=>s&&['arrow','pearl','snowball',...POTIONS].includes(s.item)&&[0,1].includes(s.owner)&&['id','x','y','z','vx','vy','vz','power','age'].every(k=>Number.isFinite(s[k]))&&Math.abs(s.x)<200&&Math.abs(s.y)<200&&Math.abs(s.z)<200&&s.power>=0&&s.power<=1);}
