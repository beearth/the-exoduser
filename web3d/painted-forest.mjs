import * as THREE from '../assets/vendor/three-r160/build/three.module.js';
export function forestOpacity(layer,playerX,playerZ){
 const dx=Math.max(0,Math.abs(playerX-layer.x)-layer.width/2),dz=playerZ-layer.z;
 return layer.opacity*Math.max(0,Math.min(1,(Math.hypot(dx,dz)-2)/5));
}
export function paintedForest(group,textures){
 const layers=[];
 for(let depth=0;depth<3;depth++)for(let side=0;side<2;side++){
  const width=30+depth*4,height=width*1152/2048,x=side?60:20,z=51-depth*12,opacity=[.55,.38,.24][depth];
  const material=new THREE.MeshBasicMaterial({map:textures[(side+depth)%textures.length],transparent:true,opacity,alphaTest:.02,depthWrite:false,side:THREE.DoubleSide,fog:true});
  material.color.setRGB(1.4,1.55,1.65);material.customProgramCacheKey=()=> 'web3d-painted-forest-v1';
  material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
    float forestLuma=dot(diffuseColor.rgb,vec3(.2126,.7152,.0722));diffuseColor.rgb=mix(vec3(forestLuma),diffuseColor.rgb,.25);`);};
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,height),material);mesh.position.set(x,height/2-.35,z);mesh.name='painted-forest-'+depth+'-'+side;group.add(mesh);
  layers.push({x,z,width,opacity,mesh});
 }
 return (playerX,playerZ)=>{for(const layer of layers){layer.mesh.material.opacity=forestOpacity(layer,playerX,playerZ);layer.mesh.visible=layer.mesh.material.opacity>.02;}};
}
