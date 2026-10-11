// Fixed 20 Hz simulation. Units are blocks and blocks per tick.
export const TICK=50, REACH=3;
export const WEAPONS=[{name:'sword',damage:7,cooldown:12.5},{name:'axe',damage:9,cooldown:20},{name:'apple',damage:1,cooldown:5}];
export const SOLIDS=[[-15,-3,-15,15,0,15],[-15,0,-15,-14,2,15],[14,0,-15,15,2,15],[-14,0,-15,14,2,-14],[-14,0,14,14,2,15],...[-9,9].flatMap(x=>[-9,9].map(z=>[x,0,z,x+1,3,z+1])),[-7,0,-1,-6,1,1],[6,0,-1,7,1,1]];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const emptyInput=()=>({forward:0,strafe:0,yaw:0,pitch:0,jump:false,sprint:false,sneak:false,shield:false,attack:false,slot:0});
export function sanitizeInput(raw={}){const n=(k,a,b)=>Number.isFinite(raw[k])?clamp(raw[k],a,b):0;return {forward:n('forward',-1,1),strafe:n('strafe',-1,1),yaw:n('yaw',-10000,10000),pitch:n('pitch',-1.5,1.5),slot:Math.round(n('slot',0,2)),...Object.fromEntries(['jump','sprint','sneak','shield','attack'].map(k=>[k,raw[k]===true]))};}
export function player(id=0){return {id,x:0,y:0,z:id?6:-6,vx:0,vy:0,vz:0,yaw:id?0:Math.PI,pitch:0,ground:true,fall:0,jumpDelay:0,health:20,absorption:0,absorptionTicks:0,regen:0,apples:2,use:0,slot:0,charge:40,shieldTicks:0,shieldDisabled:0,hurt:0,lastDamage:0,sprint:false,swing:0,hitFlash:0};}
function box(p){return [p.x-.3,p.y,p.z-.3,p.x+.3,p.y+1.8,p.z+.3];}
function overlaps(a,b,axis){return [0,1,2].filter(k=>k!==axis).every(k=>a[k+3]>b[k]+1e-7&&a[k]<b[k+3]-1e-7);}
function moveAxis(p,axis,amount,solids){const a=box(p);let d=amount;for(const b of solids){if(!overlaps(a,b,axis))continue;if(d>0&&a[axis+3]<=b[axis]+1e-7)d=Math.min(d,b[axis]-a[axis+3]);if(d<0&&a[axis]>=b[axis+3]-1e-7)d=Math.max(d,b[axis+3]-a[axis]);}p[['x','y','z'][axis]]+=d;return Math.abs(d-amount)>1e-7;}
export function tickPlayer(p,raw,solids=SOLIDS){
 const i=sanitizeInput(raw);p.yaw=i.yaw;p.pitch=i.pitch;p.hitFlash=Math.max(0,p.hitFlash-1);p.swing=Math.max(0,p.swing-1);p.hurt=Math.max(0,p.hurt-1);p.shieldDisabled=Math.max(0,p.shieldDisabled-1);p.jumpDelay=Math.max(0,p.jumpDelay-1);p.charge=Math.min(40,p.charge+1);
 if(p.slot!==i.slot){p.slot=i.slot;p.charge=0;p.use=0;}
 const using=i.shield&&p.slot===2&&p.apples>0;
 if(p.absorptionTicks>0){p.absorptionTicks--;if(!p.absorptionTicks)p.absorption=0;}
 if(using){p.use++;if(p.use>=32){p.apples--;p.absorption=4;p.absorptionTicks=2400;p.regen=100;p.use=0;}}else p.use=0;
 if(p.regen>0){p.regen--;if(p.regen%25===0)p.health=Math.min(20,p.health+1);}
 p.shieldTicks=i.shield&&p.slot!==2&&p.shieldDisabled===0?p.shieldTicks+1:0;
 p.sprint=i.sprint&&i.forward>0&&!i.sneak&&!i.shield;
 const wasGround=p.ground;
 if(i.jump&&p.ground&&!p.jumpDelay){p.vy=.42;p.ground=false;p.jumpDelay=10;if(p.sprint){p.vx-=Math.sin(p.yaw)*.2;p.vz-=Math.cos(p.yaw)*.2;}}
 let forward=i.forward,strafe=i.strafe;const length=Math.hypot(forward,strafe);if(length>1){forward/=length;strafe/=length;}
 const friction=wasGround?.546:.91;
 const acceleration=(wasGround?.1*.16277136/(friction**3):.02)*(p.sprint?1.3:1)*(i.sneak?.3:1)*(i.shield?.2:1);
 p.vx+=(strafe*Math.cos(p.yaw)-forward*Math.sin(p.yaw))*acceleration;p.vz+=(-forward*Math.cos(p.yaw)-strafe*Math.sin(p.yaw))*acceleration;
 const falling=p.vy<0,hitY=moveAxis(p,1,p.vy,solids);p.ground=falling&&hitY;if(hitY)p.vy=0;
 if(moveAxis(p,0,p.vx,solids))p.vx=0;if(moveAxis(p,2,p.vz,solids))p.vz=0;
 if(p.ground)p.fall=0;else if(falling)p.fall+=Math.abs(p.vy);
 p.vy=(p.vy-.08)*.98;p.vx*=friction;p.vz*=friction;
 if(Math.abs(p.vx)<.003)p.vx=0;if(Math.abs(p.vz)<.003)p.vz=0;
 if(p.y< -8)p.health=0;
}
export function direction(p){const c=Math.cos(p.pitch);return [-Math.sin(p.yaw)*c,Math.sin(p.pitch),-Math.cos(p.yaw)*c];}
export function rayBox(origin,dir,b){let near=0,far=Infinity;for(let k=0;k<3;k++){if(Math.abs(dir[k])<1e-8){if(origin[k]<b[k]||origin[k]>b[k+3])return Infinity;}else{let a=(b[k]-origin[k])/dir[k],c=(b[k+3]-origin[k])/dir[k];if(a>c)[a,c]=[c,a];near=Math.max(near,a);far=Math.min(far,c);if(near>far)return Infinity;}}return near;}
export function charge(p){return Math.min(1,(p.charge+.5)/WEAPONS[p.slot].cooldown);}
export function armorDamage(damage,armor=20,toughness=8){return damage*(1-clamp(armor-damage/(2+toughness/4),armor*.2,20)/25);}
export function attack(a,b,solids=SOLIDS){
 if(a.health<=0||b.health<=0||a.shieldTicks>0||a.use>0)return null;
 const power=charge(a),weapon=WEAPONS[a.slot],critical=power>.9&&!a.ground&&a.vy<0&&a.fall>0&&!a.sprint;
 a.charge=0;a.swing=5;
 const origin=[a.x,a.y+1.62,a.z],dir=direction(a),distance=rayBox(origin,dir,box(b));
 if(distance>REACH||solids.some(s=>rayBox(origin,dir,s)<distance-.001))return {kind:'miss',id:a.id};
 const dx=a.x-b.x,dz=a.z-b.z,front=(-Math.sin(b.yaw)*dx-Math.cos(b.yaw)*dz)>0;
 if(b.shieldTicks>=5&&front){const disabled=a.slot===1&&power>.9;if(disabled){b.shieldDisabled=100;b.shieldTicks=0;}return {kind:disabled?'disable':'block',id:a.id,target:b.id};}
 let damage=armorDamage(weapon.damage*(.2+.8*power*power)*(critical?1.5:1));
 if(b.hurt>10){if(damage<=b.lastDamage)return {kind:'immune',id:a.id};const original=damage;damage-=b.lastDamage;b.lastDamage=original;}else{b.lastDamage=damage;b.hurt=20;}
 const absorbed=Math.min(b.absorption,damage);b.absorption-=absorbed;b.health=Math.max(0,b.health-(damage-absorbed));b.hitFlash=4;
 const len=Math.hypot(dx,dz)||1,boost=a.sprint&&power>.9?.5:0,k=.4+boost;
 b.vx=b.vx*.5-dx/len*k;b.vz=b.vz*.5-dz/len*k;if(b.ground)b.vy=Math.min(.4,b.vy*.5+.4);
 if(boost){a.sprint=false;a.vx*=.6;a.vz*=.6;}
 return {kind:critical?'crit':'hit',id:a.id,target:b.id,damage,health:b.health};
}
export function separatePlayers(a,b){const dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz);if(d>0&&d<.6&&Math.abs(a.y-b.y)<1.8){const k=(.6-d)*.04;a.vx-=dx/d*k;a.vz-=dz/d*k;b.vx+=dx/d*k;b.vz+=dz/d*k;}}
export function botInput(bot,target,tick,dummy=false){
 const dx=target.x-bot.x,dz=target.z-bot.z,dist=Math.hypot(dx,dz),i=emptyInput();
 const aimYaw=Math.atan2(-dx,-dz),aimPitch=Math.atan2(target.y+.95-(bot.y+1.62),dist);
 if(dummy){i.yaw=aimYaw;i.pitch=aimPitch;return i;}
 // Easy practice: reassess aim every 300 ms instead of tracking perfectly.
 i.yaw=bot.yaw;i.pitch=bot.pitch;
 if(tick%6===0){const turn=Math.atan2(Math.sin(aimYaw-bot.yaw),Math.cos(aimYaw-bot.yaw));i.yaw+=clamp(turn,-.32,.32);i.pitch+=clamp(aimPitch-bot.pitch,-.18,.18);}
 // Short breaks leave time to recover, reposition, or eat an apple.
 if(tick%120>=90)return i;
 i.forward=dist>2.4?.6:dist<1.5?-.25:0;
 i.strafe=dist<5?Math.sin(tick/30)*.18:0;
 i.shield=dist<3.2&&tick%100>=80&&tick%100<90;
 i.attack=tick>=36&&tick%36===0&&dist<3&&charge(bot)>.95&&!i.shield;
 return i;
}
