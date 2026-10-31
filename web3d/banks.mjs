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
export function islandGeometry(source,matrix){
 const position=source.attributes.position,index=source.index,points=[],uv=[],v=new THREE.Vector3(),triangle=[];
 for(let i=0;i<(index?.count||position.count);i+=3){
  triangle.length=0;
  for(let k=0;k<3;k++){v.fromBufferAttribute(position,index?index.getX(i+k):i+k).applyMatrix4(matrix);triangle.push(v.clone());}
  const x=triangle.reduce((n,p)=>n+p.x,0)/3,z=triangle.reduce((n,p)=>n+p.z,0)/3;
  if(z<shoreline(x,false)-.25||z>shoreline(x,true)+.25||Math.abs(x-40)<2.4)continue;
  for(const p of triangle){points.push(p.x,p.y,p.z);uv.push(p.x*.28,p.z*.28);}
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(points,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.computeVertexNormals();return geometry;
}
