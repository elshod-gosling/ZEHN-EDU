import assert from 'node:assert/strict';
import { buildBlockMeshes } from './dist/arena/blocks.mjs';
import * as THREE from './dist/arena/vendor/three.module.js';
const material = new THREE.MeshBasicMaterial();
const build = coords => buildBlockMeshes(new Map([['stone',{mat:material,coords}]]));
const faces = meshes => meshes.reduce((n,m)=>n+m.geometry.index.count/6,0);
assert.equal(faces(build([[0,0,0]])),6);
assert.equal(faces(build([[0,0,0],[1,0,0]])),10,'Adjacent cubes must omit both internal faces');
assert.equal(faces(build([[0,0,0],[0,0,0]])),6,'Overlapping cubes must not double their faces');
assert.equal(faces(build([[0,0,0],[0,1,0],[0,0,1]])),14);
const cube=build([[0,0,0]])[0].geometry, p=cube.attributes.position, n=cube.attributes.normal;
for(let i=0;i<cube.index.count;i+=3){
  const a=new THREE.Vector3().fromBufferAttribute(p,cube.index.getX(i));
  const b=new THREE.Vector3().fromBufferAttribute(p,cube.index.getX(i+1));
  const c=new THREE.Vector3().fromBufferAttribute(p,cube.index.getX(i+2));
  const normal=new THREE.Vector3().fromBufferAttribute(n,cube.index.getX(i));
  assert(b.sub(a).cross(c.sub(a)).dot(normal)>0,'Faces must wind outward');
}
console.log('PASS: exposed voxel faces, duplicate removal and outward triangle winding.');
