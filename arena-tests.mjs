import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {player,emptyInput,tickPlayer,attack,armorDamage,charge,cooldownSeconds,sanitizeInput,SOLIDS} from './dist/arena/physics.mjs';
const advance=(p,i,n)=>{for(let k=0;k<n;k++)tickPlayer(p,i);};
let p=player(),i=emptyInput();i.forward=1;advance(p,i,30);assert(p.z< -11,'Walking moves forward');assert(p.z> -13.7,'Wall collision stops player');
p=player();i=emptyInput();i.jump=true;let apex=0;for(let k=0;k<10;k++){tickPlayer(p,i);apex=Math.max(apex,p.y);}assert(apex>1.2&&apex<1.3,'Jump arc reaches Minecraft-scale height');i.jump=false;advance(p,i,20);assert(Math.abs(p.y)<1e-6&&p.ground,'Land on the floor');
p=player();i=emptyInput();i.forward=1;i.sprint=true;i.jump=true;tickPlayer(p,i);assert(Math.abs(p.z+6)>.3&&Math.abs(p.vz)>.15,'Sprint jump preserves a directional impulse');
const pair=()=>{const a=player(),b=player(1);a.z=0;a.yaw=0;b.z=-2;b.yaw=Math.PI;return [a,b];};
let [a,b]=pair();let hit=attack(a,b);assert.equal(hit.kind,'hit');assert(Math.abs(hit.damage-1.89)<1e-8);const hp=b.health;attack(a,b);assert.equal(b.health,hp,'Spam cannot bypass damage immunity');assert(charge(a)<.05,'Attacks reset cooldown');
for(const [slot,period] of [[0,12.5],[1,20]]){
 [a,b]=pair();a.slot=slot;const full=attack(a,b).damage;
 assert.equal(cooldownSeconds(a),period/20);
 // Fresh targets isolate attack strength from the separate hurt-immunity window.
 for(const elapsed of [0,3,6]){
  [a,b]=pair();a.slot=slot;a.charge=elapsed;
  const result=attack(a,b);
  assert.equal(result.kind,'hit','Early swings are allowed');
  assert(result.damage<full,'Early swings deal less damage');
  assert(Math.abs(result.damage-armorDamage((slot?9:7)*(.2+.8*Math.min(1,(elapsed+.5)/period)**2)))<1e-9,'Vanilla attack-strength curve');
  assert.equal(a.charge,0,'Every swing restarts recharge');
 }
 [a,b]=pair();a.slot=slot;a.charge=Math.ceil(period-.5);
 assert.equal(attack(a,b).damage,full,'Half-tick sampling reaches full damage at the correct tick');
}
[a,b]=pair();a.z=4;assert.equal(attack(a,b).kind,'miss');assert.equal(a.charge,0,'A missed swing resets recharge');a.z=0;assert.equal(attack(a,b).kind,'hit','An early swing after a miss remains allowed');
[a,b]=pair();attack(a,b);advance(a,{...emptyInput(),slot:1},1);assert.equal(cooldownSeconds(a),1);assert.equal(attack(a,b).kind,'immune','Early axe swings obey target damage immunity');advance(a,emptyInput(),1);assert.equal(cooldownSeconds(a),.625,'Switching back resets sword recharge');
[a,b]=pair();a.charge=3;a.ground=false;a.vy=-.1;a.fall=.2;assert.equal(attack(a,b).kind,'hit','Weak falling hits cannot crit');
[a,b]=pair();b.shieldTicks=5;a.slot=1;a.charge=3;assert.equal(attack(a,b).kind,'block');assert.equal(b.shieldDisabled,0,'Weak axe hits cannot disable shields');
p=player();p.charge=6;assert.equal(charge(p,.25),.5,'Render interpolation fills the crosshair bar smoothly');
[a,b]=pair();a.ground=false;a.y=.3;a.vy=-.1;a.fall=.1;a.pitch=-.15;hit=attack(a,b);assert.equal(hit.kind,'crit');assert(hit.damage>2.7,'Falling crit increases armored damage');
[a,b]=pair();b.shieldTicks=5;assert.equal(attack(a,b).kind,'block');assert.equal(b.health,20);a.slot=1;a.charge=30;assert.equal(attack(a,b).kind,'disable');assert.equal(b.shieldDisabled,100);
[a,b]=pair();b.shieldTicks=5;b.yaw=0;assert.equal(attack(a,b).kind,'hit','Shield cannot block from behind');
[a,b]=pair();a.shieldTicks=1;assert.equal(attack(a,b),null,'Cannot attack while raising a shield');
[a,b]=pair();a.z=4;assert.equal(attack(a,b).kind,'miss','Enforce reach');
[a,b]=pair();assert.equal(attack(a,b,[[-1,0,-1.5,1,3,-1]]).kind,'miss','Solid blocks obstruct attacks');
p=player();p.health=10;i=emptyInput();i.slot=2;i.shield=true;advance(p,i,32);assert.equal(p.apples,1);assert.equal(p.absorption,4);i.shield=false;advance(p,i,100);assert.equal(p.health,14,'Apple regenerates four health');
p=player();p.x=13.5;i=emptyInput();i.strafe=1;advance(p,i,40);assert(p.x<=13.7+1e-6,'Cannot walk through boundary');
assert.equal(sanitizeInput({forward:Infinity,slot:999,attack:'true'}).forward,0);assert.equal(sanitizeInput({slot:999}).slot,2);assert(Math.abs(armorDamage(7)-1.89)<1e-9);
const source=fs.readFileSync('dist/arena/game.mjs','utf8');const copy=vm.runInNewContext(source.slice(source.indexOf('const COPY='),source.indexOf('let lang='))+';COPY;');
for(const l of ['uz','ru'])for(const key of Object.keys(copy.en))assert(copy[l][key],l+':'+key);
const html=fs.readFileSync('dist/arena/index.html','utf8');for(const [,key] of html.matchAll(/data-i="([^"]+)"/g))assert(copy.en[key],'Missing UI translation: '+key);
console.log('PASS: collision, jump arc, sprint momentum, reach and occlusion, cooldown, damage immunity, critical hits, shield direction, axe disable, apple healing, peer input bounds, three-language arena UI.');
