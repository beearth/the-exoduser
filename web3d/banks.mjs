import * as THREE from '../assets/vendor/three-r160/build/three.module.js';
export function shoreline(x,south){
 const edge=south?66.4:53.6,variation=Math.sin((x-40)*.26)*.42+Math.sin((x-40)*.71)*.18;
 return edge+variation;
}
// Visual top surface closes tree sockets in the source R3 mesh. Native tiles,
// collision and authored bridge geometry remain untouched.
export function bankGeometry(south,sampleHeight){
 const cols=120,rows=64,positions=[],uv=[],indices=[];
 for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){
  const x=i/cols*80,edge=shoreline(x,south),z=south?edge+(84-edge)*j/rows:2+(edge-2)*j/rows;
  const sampled=sampleHeight(x*100,z*100),y=Math.max(.45,sampled);
  positions.push(x,y,z);uv.push(x*.28,z*.28);
 }
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=j*(cols+1)+i,b=a+1,c=a+cols+1,d=c+1;indices.push(a,c,b,b,c,d);}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}
