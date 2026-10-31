import * as THREE from '../assets/vendor/three-r160/build/three.module.js';
export function addWoodDeck(parent,height){
 const material=new THREE.MeshStandardMaterial({color:'#7a7465',roughness:.93,metalness:0});
 material.customProgramCacheKey=()=> 'web3d-weathered-deck-v1';
 material.onBeforeCompile=shader=>{
  shader.vertexShader='varying vec3 vDeckWorld;\n'+shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   vec4 deckPosition=vec4(transformed,1.);
   #ifdef USE_INSTANCING
    deckPosition=instanceMatrix*deckPosition;
   #endif
   vDeckWorld=(modelMatrix*deckPosition).xyz;`);
  shader.fragmentShader=`varying vec3 vDeckWorld;
   float woodHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
   float woodNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(woodHash(i),woodHash(i+vec2(1.,0.)),f.x),mix(woodHash(i+vec2(0.,1.)),woodHash(i+1.),f.x),f.y);}
   \n`+shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
    vec2 p=vDeckWorld.xz;
    float grain=woodNoise(vec2(p.x*.8,p.y*14.)+woodNoise(p*3.1)*.5);
    float split=smoothstep(.78,.94,woodNoise(vec2(p.x*1.8,p.y*23.)))*woodNoise(p*5.);
    float stain=woodNoise(p*1.7)*.5+woodNoise(p*7.)*.15;
    diffuseColor.rgb*=mix(vec3(.35,.28,.21),vec3(.80,.73,.61),grain*.55+stain*.45);
    diffuseColor.rgb*=1.-split*.48;
    float moss=smoothstep(1.1,1.6,abs(p.x-40.))*smoothstep(.3,.75,woodNoise(p*8.));
    diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.055,.072,.033),moss*.65);`);
 };
 const meshes=[],dummy=new THREE.Object3D(),count=36;
 for(let variant=0;variant<3;variant++){
  const shape=new THREE.Shape(),w=1.63-variant*.025;
  shape.moveTo(-w,-.17);shape.lineTo(-w+.07,.04);shape.lineTo(-w+.025,.17);shape.lineTo(w-.06,.185);shape.lineTo(w,.07);shape.lineTo(w-.03,-.175);shape.lineTo(.4,-.185);shape.closePath();
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:.115,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.012,bevelThickness:.012});geometry.rotateX(Math.PI/2);
  const mesh=new THREE.InstancedMesh(geometry,material,count/3);
  for(let j=0;j<count/3;j++){const i=j*3+variant,z=53.52+i*.37;dummy.position.set(40+Math.sin(i*3.7)*.018,height(4000,z*100)+.035,z);dummy.rotation.set(0,Math.sin(i*2.3)*.008,0);dummy.scale.set(1+Math.sin(i*6.7)*.025,1,1);dummy.updateMatrix();mesh.setMatrixAt(j,dummy.matrix);mesh.setColorAt(j,new THREE.Color().setRGB(.88+.12*Math.sin(i*8.2),.88+.1*Math.sin(i*4.7),.85+.1*Math.sin(i*5.1)));}
  mesh.instanceMatrix.needsUpdate=true;mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.module='WEB3D_Weathered_Deck';parent.add(mesh);mesh.updateMatrixWorld();meshes.push(mesh);
 }
 const nails=new THREE.InstancedMesh(new THREE.CylinderGeometry(.023,.023,.012,7),new THREE.MeshStandardMaterial({color:'#272623',roughness:.65,metalness:.6}),count*2);
 for(let i=0;i<count;i++)for(let side=0;side<2;side++){const z=53.52+i*.37;dummy.position.set(40+(side?1.36:-1.36),height(4000,z*100)+.051,z+.035);dummy.rotation.set(0,0,0);dummy.updateMatrix();nails.setMatrixAt(i*2+side,dummy.matrix);}
 nails.instanceMatrix.needsUpdate=true;nails.userData.module='WEB3D_Deck_Nails';parent.add(nails);return meshes;
}
