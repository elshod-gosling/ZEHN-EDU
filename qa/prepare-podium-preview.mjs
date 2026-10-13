// Local visual QA: actual arena code, deterministic results, no account/network calls.
import fs from 'node:fs/promises';
const folder='qa/.podium-preview';await fs.mkdir(folder,{recursive:true});
let html=await fs.readFile('dist/arena/index.html','utf8');
html=html.replace('<head>','<head><base href="/dist/arena/">').replace(/src="game\.mjs[^\"]*"/,'src="/qa/.podium-preview/game.mjs"');
await fs.writeFile(folder+'/index.html',html);
await fs.writeFile(folder+'/account.mjs',`export const configured=true;const account={role:'developer',credits:0,earned:0};export const accountState=()=>({user:{uid:'visual-qa'},account,loading:false,error:null});export const subscribe=fn=>fn(accountState());export const initializeAccount=async()=>{};export const syncClock=async()=>{};export const remaining=()=>Infinity;export const serverNow=()=>Date.now();`);
let game=await fs.readFile('dist/arena/game.mjs','utf8');
game=game.replace(/from '\.\//g,"from '/dist/arena/").replace("import('./high-graphics.mjs')","import('/dist/arena/high-graphics.mjs')").replace(/from '\.\.\/supabase-account\.mjs[^']*'/,"from '/qa/.podium-preview/account.mjs'").replace(/from '\.\.\/credits-ui\.mjs[^']*'/,"from '/dist/credits-ui.mjs?v=zehn-rooms-1'");
game+=`\nconst previewParams=new URLSearchParams(location.search);unlocked=true;creditClockReady=true;localId=previewParams.get('local')==='1'?1:0;const previewWinner=previewParams.get('winner')==='draw'?-1:Number(previewParams.get('winner')||0);mode=localId===1?'peer':'bot';network={send(){},close(){}};peerReady=true;started=true;round=previewParams.has('match')?5:1;players[0].health=previewWinner===1?0:20;players[1].health=previewWinner===0?0:20;if(previewParams.has('match')&&previewWinner>=0)scores[previewWinner]=1;if(localId===1){scores=previewWinner<0?[0,0]:previewWinner===0?[1,0]:[0,1];peerMessage({type:'end',players,scores,round,matchEnded:previewParams.has('match'),winner:previewWinner});}else roundEnd();void setQuality(previewParams.get('quality')||'balanced');\n`;
await fs.writeFile(folder+'/game.mjs',game);console.log('Prepared /qa/.podium-preview/index.html?lang=en&winner=0&quality=high');
