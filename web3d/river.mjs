import * as THREE from '../assets/vendor/three-r160/build/three.module.js';
import { shoreline } from './banks.mjs?v=20261031-main2';

// The shoreline field follows the visual banks; Core collision stays separate.
// It is visual data; it never writes a collision tile or changes a water hit test.
export function riverMaterial(map,reflection){
  const w=map.template.mw,h=map.template.mh,data=new Uint8Array(w*h*4),land=new Uint8Array(w*h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const wx=(x+.5)*.4,wz=(y+.5)*.4;
    land[y*w+x]=(wz<shoreline(wx,false)||wz>shoreline(wx,true))?1:0;
  }
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    let d=8;
    for(let j=-7;j<=7;j++)for(let i=-7;i<=7;i++)if(x+i>=0&&y+j>=0&&x+i<w&&y+j<h&&land[(y+j)*w+x+i])d=Math.min(d,Math.hypot(i,j));
    const k=(y*w+x)*4;data[k]=Math.round(Math.min(1,d/8)*255);data[k+1]=land[y*w+x]*255;data[k+3]=255;
  }
  const shore=new THREE.DataTexture(data,w,h);shore.flipY=false;shore.magFilter=shore.minFilter=THREE.LinearFilter;shore.needsUpdate=true;
  return new THREE.ShaderMaterial({fog:true,
    uniforms:{...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),...reflection,uTime:{value:0},uShore:{value:shore}},
    vertexShader:`#include <fog_pars_vertex>
      uniform mat4 uReflectMatrix;varying vec3 vWater;varying vec4 vReflect;
      void main(){vec4 world=modelMatrix*vec4(position,1.);vWater=world.xyz;vReflect=uReflectMatrix*world;
        vec4 mvPosition=viewMatrix*world;gl_Position=projectionMatrix*mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader:`#include <fog_pars_fragment>
      uniform float uTime;uniform sampler2D uReflect,uShore;varying vec3 vWater;varying vec4 vReflect;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}
      float fbm(vec2 p){return noise(p)*.58+noise(p*2.03)*.28+noise(p*4.01)*.14;}
      void main(){vec2 p=vWater.xz;float t=uTime;
        vec2 drift=vec2(t*.035,-t*.018),q=p*.48+drift;
        float current=fbm(q+vec2(fbm(q*.7),fbm(q*.7+23.))*1.6);
        vec3 col=mix(vec3(.008,.019,.018),vec3(.032,.045,.023),smoothstep(.15,.88,current));
        float film=fbm(p*1.3-drift*.4);col+=vec3(.006,.008,.003)*smoothstep(.48,.85,film);
        vec2 wave=vec2(fbm(q*5.+vec2(.07,0.))-fbm(q*5.-vec2(.07,0.)),fbm(q*5.+vec2(0.,.07))-fbm(q*5.-vec2(0.,.07)));
        vec2 uv=vReflect.xy/vReflect.w*.5+.5+wave*.022;
        vec3 reflected=texture2D(uReflect,clamp(uv,vec2(.002),vec2(.998))).rgb;
        col=mix(col,reflected*vec3(.43,.57,.46),.24);
        float shore=texture2D(uShore,p/vec2(80.,88.)).r*3.2;
        float scum=(1.-smoothstep(.12,1.5,shore))*smoothstep(.23,.62,fbm(p*3.-drift));
        float foam=exp(-pow((shore-.24-wave.x*.2)*8.,2.))*smoothstep(.32,.66,noise(p*8.+drift));
        col=mix(col,vec3(.12,.131,.077),scum*.42);col+=foam*vec3(.083,.092,.067);
        vec2 cell=floor(p*.9),local=fract(p*.9)-.5;float seed=hash(cell);
        float age=fract(t*.11+seed*9.);float bubble=length(local-vec2(hash(cell+2.),hash(cell+7.))*.35+.175);
        float ring=exp(-pow((bubble-age*.26)*95.,2.))*smoothstep(.88,.98,seed)*sin(age*3.14159)*.025;
        col+=ring*vec3(.55,.67,.45);
        float post=0.;
        for(int i=0;i<7;i++){float z=54.5+float(i)*1.8;
          for(int j=0;j<2;j++){vec2 c=vec2(j==0?38.4:41.6,z);float d=length((p-c)*vec2(1.,.8));
            post+=exp(-d*2.7)*pow(.5+.5*sin(d*26.-t*.95),13.)*.019;}}
        col+=post*vec3(.5,.65,.46);
        float glint=pow(max(0.,wave.x*.6+wave.y*.8),2.)*.12;col+=glint*vec3(.55,.65,.66);
        gl_FragColor=vec4(col,1.);
        #include <fog_fragment>
      }`});
}

export function addForestDepth(scene,prototypes){
  const group=new THREE.Group();group.name='north-forest-depth';
  const proto=prototypes.get('RF3_Forest_Vista_Card');
  if(proto){
    const layers=[{z:16,count:3,scale:.8,color:'#d0d9da',alpha:.25},{z:0,count:3,scale:1.3,color:'#d4dfe0',alpha:.18},{z:-18,count:3,scale:1.5,color:'#dbe5e5',alpha:.12}];
    for(const [li,l]of layers.entries()){
      const material=new THREE.MeshBasicMaterial({map:proto.material.map,color:l.color,transparent:true,opacity:l.alpha,alphaTest:.02,depthWrite:false,side:THREE.DoubleSide,fog:true});
      material.color.multiplyScalar(2.5);
      const mesh=new THREE.InstancedMesh(proto.geometry,material,l.count),dummy=new THREE.Object3D();
      // Source prototype includes its Blender-to-world orientation, stripped of translation.
      const pos=new THREE.Vector3(),rot=new THREE.Quaternion(),scale=new THREE.Vector3();proto.matrix.decompose(pos,rot,scale);
      for(let i=0;i<l.count;i++){dummy.position.set(19+i*23+li*2,-.8,l.z+Math.sin(i*2.7+li)*2);dummy.quaternion.copy(rot);dummy.scale.copy(scale).multiplyScalar(l.scale*(.94+.1*Math.sin(i*4.3)));dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);}
      mesh.instanceMatrix.needsUpdate=true;mesh.receiveShadow=true;group.add(mesh);
    }
  }
  // Sparse real trunks form the middle distance; silhouette cards belong beyond
  // them, where their flat shapes lose contrast in fog instead of walling the bank.
  for(const [index,id]of ['RF3_Ancient_Tree_A','RF3_Ancient_Tree_B'].entries()){
    const tree=prototypes.get(id);if(!tree)continue;
    const material=new THREE.MeshStandardMaterial({map:tree.material.map,normalMap:tree.material.normalMap,aoMap:tree.material.aoMap,
      aoMapIntensity:.3,normalScale:new THREE.Vector2(.4,.4),color:'#d1c8b7',roughness:.94,metalness:0});
    const positions=index?[[33,44,.38],[53,41,.34],[52,28,.30]]:[[27,46,.42],[47,44,.40],[34,31,.32]];
    const mesh=new THREE.InstancedMesh(tree.geometry,material,positions.length),dummy=new THREE.Object3D(),pos=new THREE.Vector3(),rotation=new THREE.Quaternion(),scale=new THREE.Vector3();
    tree.matrix.decompose(pos,rotation,scale);
    positions.forEach(([x,z,s],i)=>{dummy.position.set(x,.35,z);dummy.quaternion.copy(rotation);dummy.rotateY((i+index)*.7);dummy.scale.copy(scale).multiplyScalar(s);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});
    mesh.instanceMatrix.needsUpdate=true;mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);
  }
  const shafts=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,
    uniforms:{time:{value:0}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`varying vec2 vUv;uniform float time;void main(){float beam=pow(sin(vUv.x*3.14159),2.)*pow(sin(vUv.y*3.14159),.8);float broken=.72+.18*sin(vUv.y*19.+vUv.x*9.+time*.08);gl_FragColor=vec4(.32,.43,.48,beam*broken*.14);}`});
  for(const [x,z,w,h]of [[31,46,2.4,18],[36,39,1.3,21],[48,35,3.3,24]]){
    const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),shafts);m.position.set(x,8,z);m.rotation.set(-.22,-.15,-.24);group.add(m);
  }
  scene.add(group);return {group,update:t=>{shafts.uniforms.time.value=t;}};
}
