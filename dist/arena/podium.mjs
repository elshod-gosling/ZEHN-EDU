import * as THREE from './vendor/three.module.js';

function block(parent,material,size,position){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),material);mesh.position.set(...position);parent.add(mesh);return mesh;
}
function character(materials){
  const root=new THREE.Group(),torso=new THREE.Group();torso.position.y=.75;root.add(torso);
  block(torso,materials.armor,[.5,.75,.25],[0,.375,0]);
  const head=block(torso,[materials.armor,materials.armor,materials.armor,materials.armor,materials.armor,materials.face],[.51,.5,.51],[0,.8,0]);
  const arms=[];
  for(const x of [-.375,.375]){const arm=new THREE.Group();arm.position.set(x,.7,0);block(arm,materials.armor,[.25,.75,.25],[0,-.375,0]);torso.add(arm);arms.push(arm);}
  for(const x of [-.125,.125])block(root,materials.darkArmor,[.25,.75,.25],[x,.375,0]);
  return {root,torso,head,arms};
}
function numberMaterial(number){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const ctx=canvas.getContext('2d');
  ctx.fillStyle='#4b3b1a';ctx.fillRect(0,0,64,64);ctx.fillStyle='#fff1ad';ctx.font='bold 46px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(number),32,34);
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.magFilter=THREE.NearestFilter;
  return new THREE.MeshBasicMaterial({map,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
}
export function celebrationPose(seconds,reducedMotion=false){
  // The winner gives a relaxed wave; both fighters remain upright.
  return {wave:reducedMotion?0:Math.sin(seconds*2.2)*.12};
}
export function celebrationWinner(roundWinner,scores,matchEnded){
  if(matchEnded)return scores[0]===scores[1]?-1:scores[0]>scores[1]?0:1;
  return [0,1].includes(roundWinner)?roundWinner:-1;
}
export function createPodium({scene,camera,materials,hiddenDuringResult=[],makeNumberMaterial=numberMaterial,reducedMotion=false}){
  const group=new THREE.Group();group.name='victory-podium';group.visible=false;scene.add(group);
  block(group,materials.stone,[5.1,.18,2.2],[0,.09,0]);
  const first=block(group,materials.gold,[1.9,1.1,1.65],[-1,.73,0]);
  const drawFirst=block(group,materials.stone,[1.9,.38,1.65],[-1,.37,0]);drawFirst.visible=false;
  const second=block(group,materials.stone,[1.65,.38,1.65],[1.1,.37,0]);
  const labels=[1,2].map((n,index)=>{
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(.43,.43),makeNumberMaterial(n));mesh.position.set(index?1.1:-1,index?.38:.75,.94);group.add(mesh);return mesh;
  });
  const winner=character(materials),loser=character(materials);group.add(winner.root,loser.root);
  const crown=new THREE.Group();winner.head.add(crown);
  block(crown,materials.gold,[.57,.09,.57],[0,.25,0]);
  for(const x of [-.22,0,.22])block(crown,materials.gold,[.08,.16,.08],[x,.34,-.24]);
  const trophy=new THREE.Group();winner.arms[1].add(trophy);trophy.position.set(0,-.81,0);
  block(trophy,materials.gold,[.22,.08,.22],[0,0,0]);block(trophy,materials.gold,[.07,.2,.07],[0,-.14,0]);block(trophy,materials.gold,[.3,.2,.22],[0,-.31,0]);
  const confetti=new THREE.InstancedMesh(new THREE.BoxGeometry(.065,.065,.025),new THREE.MeshBasicMaterial({color:0xffdb70}),28);
  confetti.frustumCulled=false;group.add(confetti);const transform=new THREE.Object3D();
  let active=false,startedAt=0,winningId=-1,savedCamera,savedVisibility;
  function draw(now){
    if(!active)return;
    const elapsed=Math.max(0,(now-startedAt)/1000),pose=celebrationPose(elapsed,reducedMotion),drawn=winningId===-1;
    winner.torso.rotation.x=0;winner.head.rotation.x=0;winner.arms[0].rotation.set(-2.45,0,-.15+pose.wave);winner.arms[1].rotation.set(-2.8,0,.12);
    loser.torso.rotation.x=0;loser.head.rotation.x=0;
    loser.arms[0].rotation.set(drawn?-1.1:.12,0,drawn?pose.wave:0);loser.arms[1].rotation.set(drawn?-1.1:.12,0,0);
    if(drawn){winner.arms[0].rotation.x=winner.arms[1].rotation.x=-1.1;}
    confetti.visible=!drawn&&!reducedMotion;
    if(confetti.visible){for(let i=0;i<confetti.count;i++){
      const fall=(elapsed*.7+i*.139)%3.8;
      transform.position.set(Math.sin(i*2.4)*2.3,4.4-fall,Math.cos(i*3.1)*.9);
      transform.rotation.set(elapsed+i,i*.4,elapsed*.7+i);transform.updateMatrix();confetti.setMatrixAt(i,transform.matrix);
    }confetti.instanceMatrix.needsUpdate=true;}
    const distance=Math.max(7.6,5.5/(2*Math.tan(25*Math.PI/180)*camera.aspect));
    const angle=.22+(reducedMotion?0:Math.sin(elapsed*.22)*.035);
    camera.fov=50;camera.position.set(Math.sin(angle)*distance,3.5,Math.cos(angle)*distance);camera.lookAt(.05,1.25,0);camera.updateProjectionMatrix();
    hiddenDuringResult.forEach(object=>object.visible=false);
  }
  function show(winnerId,now){
    if(!active){savedCamera={fov:camera.fov,position:camera.position.clone(),quaternion:camera.quaternion.clone()};savedVisibility=hiddenDuringResult.map(object=>object.visible);}
    active=true;group.visible=true;startedAt=now;winningId=[0,1].includes(winnerId)?winnerId:-1;
    const drawn=winningId===-1;first.visible=!drawn;drawFirst.visible=drawn;
    labels[0].position.y=drawn?.38:.75;labels.forEach(label=>label.visible=!drawn);
    winner.root.position.set(-1,drawn?.56:1.28,0);winner.root.rotation.y=Math.PI+.22;
    loser.root.position.set(1.1,.56,0);loser.root.rotation.y=Math.PI+.22;
    crown.visible=trophy.visible=!drawn;draw(now);
  }
  function hide(){
    if(!active)return;active=false;group.visible=false;
    camera.fov=savedCamera.fov;camera.position.copy(savedCamera.position);camera.quaternion.copy(savedCamera.quaternion);camera.updateProjectionMatrix();
    hiddenDuringResult.forEach((object,index)=>object.visible=savedVisibility[index]);
  }
  return {show,hide,draw,group,winner,loser,get active(){return active;},get winnerId(){return winningId;}};
}
