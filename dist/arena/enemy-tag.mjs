import {Vector3} from './vendor/three.module.js';
import {rayBox,SOLIDS} from './physics.mjs';

const anchor=new Vector3(),eye=new Vector3(),offset=new Vector3();
// Project the fighter's head anchor; hide the label behind the camera or cover.
export function enemyTagPosition(camera,position,width,height,solids=SOLIDS){
 camera.updateMatrixWorld();
 eye.set(position.x,position.y+1.65,position.z);
 offset.copy(eye).sub(camera.position);
 const origin=camera.position.toArray(),direction=offset.toArray();
 if(solids.some(s=>rayBox(origin,direction,s)<1))return null;
 anchor.set(position.x,position.y+2.15,position.z).applyMatrix4(camera.matrixWorldInverse);
 if(anchor.z>=-camera.near)return null;
 anchor.applyMatrix4(camera.projectionMatrix);
 if(anchor.z< -1||anchor.z>1||Math.abs(anchor.x)>1||Math.abs(anchor.y)>1)return null;
 return {x:(anchor.x+1)*width/2,y:(1-anchor.y)*height/2};
}
