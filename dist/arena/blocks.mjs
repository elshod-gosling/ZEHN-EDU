import * as THREE from './vendor/three.module.js';

// Build only the outer skin of the voxel world. Adjacent cubes used to submit
// coincident internal faces, and tree trunks overlapped their leaf blocks.
export function buildBlockMeshes(blocks) {
  const cells = new Map(), key = (x,y,z) => [x,y,z].join(',');
  for (const { mat, coords } of blocks.values()) for (const [x,y,z] of coords) {
    const id = key(x,y,z);
    if (!cells.has(id)) cells.set(id,{mat,x,y,z});
  }
  const template = new THREE.BoxGeometry(1,1,1), positions = template.attributes.position, normals = template.attributes.normal, uv = template.attributes.uv;
  const directions = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]], batches = new Map();
  for (const cell of cells.values()) for (let face=0;face<6;face++) {
    const [dx,dy,dz] = directions[face];
    if (cells.has(key(cell.x+dx,cell.y+dy,cell.z+dz))) continue;
    const mat = Array.isArray(cell.mat) ? cell.mat[face] : cell.mat;
    if (!batches.has(mat)) batches.set(mat,{position:[],normal:[],uv:[],index:[]});
    const batch = batches.get(mat), base = batch.position.length/3;
    for (let vertex=0;vertex<4;vertex++) {
      const i=face*4+vertex;
      batch.position.push(positions.getX(i)+cell.x,positions.getY(i)+cell.y,positions.getZ(i)+cell.z);
      batch.normal.push(normals.getX(i),normals.getY(i),normals.getZ(i));
      batch.uv.push(uv.getX(i),uv.getY(i));
    }
    for (let i=0;i<6;i++) batch.index.push(base+template.index.getX(face*6+i)-face*4);
  }
  template.dispose();
  return [...batches].map(([material,batch]) => {
    const geometry = new THREE.BufferGeometry();
    for (const [name,size] of [['position',3],['normal',3],['uv',2]]) geometry.setAttribute(name,new THREE.Float32BufferAttribute(batch[name],size));
    geometry.setIndex(batch.index); geometry.computeBoundingSphere();
    return new THREE.Mesh(geometry,material);
  });
}
