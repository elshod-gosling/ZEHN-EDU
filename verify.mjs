import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

// Unit checks for the local progress rules, translation coverage, and game maps.
// Actual clicks, rendering, iframe loading, and gameplay are verified in a browser.
const nodes=new Map();
function element(key){if(!nodes.has(key))nodes.set(key,{style:{},classList:{add(){},remove(){},toggle(){}},addEventListener(){},querySelectorAll(){return []},focus(){},open:false,innerHTML:'',textContent:''});return nodes.get(key)}
const values=new Map();
const context=vm.createContext({console,Intl,Date,Math,Set,Array,JSON,Number,String,document:{querySelector:element,querySelectorAll(){return []},addEventListener(){},documentElement:{}},navigator:{languages:['en']},localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)},setTimeout,clearTimeout,setInterval,clearInterval});
vm.runInContext(fs.readFileSync('dist/app.js','utf8').replace(/render\(\);\s*$/,''),context);
const result=vm.runInContext(`(()=>{const keys=Object.keys(copy.en);return {missing:['uz','ru'].flatMap(l=>keys.filter(k=>!copy[l][k]).map(k=>l+':'+k)),first:award('coding-python'),duplicate:award('coding-python'),count:state.completed.length,unlocked:unlocked('coding'),locked:unlocked('math'),normalized:normalizeWord('O‘YIN'),date:localDay(new Date(2026,9,11))}})()`,context);
assert.deepEqual(Array.from(result.missing),[],'All translation keys exist');
assert.equal(result.first,true);assert.equal(result.duplicate,false);assert.equal(result.count,1);
assert.equal(result.unlocked,true);assert.equal(result.locked,false);assert.equal(result.normalized,"o'yin");assert.equal(result.date,'2026-10-11');
assert.equal(JSON.parse(values.get('levelup-progress')).completed.length,1,'Persist one award per quest');
function reachable(width,height,wallIndices){const walls=new Set(wallIndices),seen=new Set([0]),queue=[0];while(queue.length){const p=queue.shift();for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const x=p%width+dx,y=Math.floor(p/width)+dy,n=y*width+x;if(x>=0&&x<width&&y>=0&&y<height&&!walls.has(n)&&!seen.has(n)){seen.add(n);queue.push(n)}}}return seen}
const maze=reachable(6,6,[2,8,10,12,14,16,20,22,25,26,28]);assert(maze.has(35),'Robot can reach flag');
console.log('PASS: translation coverage, XP deduplication, persistence, reward locks, Uzbek input normalization, local dates, maze route.');
