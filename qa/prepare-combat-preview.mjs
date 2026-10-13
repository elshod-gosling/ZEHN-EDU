// Ignored local fixture: full combat UI with a fake developer pass, no account calls.
import './prepare-podium-preview.mjs';
import fs from 'node:fs/promises';
const folder='qa/.podium-preview';
const html=(await fs.readFile(folder+'/index.html','utf8')).replace('game.mjs','combat.mjs');
await fs.writeFile(folder+'/combat.html',html);
let game=await fs.readFile('dist/arena/game.mjs','utf8');
game=game.replace(/from '\.\//g,"from '/dist/arena/").replace("import('./high-graphics.mjs')","import('/dist/arena/high-graphics.mjs')").replace(/from '\.\.\/supabase-account\.mjs[^']*'/,"from '/qa/.podium-preview/account.mjs'").replace(/from '\.\.\/credits-ui\.mjs[^']*'/,"from '/dist/credits-ui.mjs'");
game+=`\nunlocked=true;creditClockReady=true;mode='dummy';dragControls=true;resetRound(true);players[0].z=6;players[0].yaw=0;players[0].health=10;players[1].z=-5;yaw=0;slot=Number(new URLSearchParams(location.search).get('slot')||0);setPlaying(true);canvas.focus();void setQuality('low');\n`;
await fs.writeFile(folder+'/combat.mjs',game);
console.log('Prepared /qa/.podium-preview/combat.html?lang=en&slot=3');
