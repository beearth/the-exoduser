// Druid-only authored solid geometry. THREE is the caller's local r160 runtime.
// No image, source sheet, gameplay state, animation clock or renderer is owned here.
const TAU=Math.PI*2;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=v=>v*v*(3-2*v);
const PITCH=.24;

export function createDruidBossVolume({THREE,height=1}={}){
  if(!THREE||String(THREE.REVISION)!=='160')throw new Error('Druid volume requires local Three r160.');
  if(!Number.isFinite(height)||height<=0||height>20)throw new RangeError('Invalid Druid volume height.');
  const geometries=new Set(),materials=new Set(),lights=new Set(),released=new Set();
  const solids=[],shadows=[],rest=[],cloth=[],eyes=[];
  let object3d=null,disposed=false,cleanupFailures=0,updates=0,last=null;
  function retire(resource){
    if(!resource||released.has(resource))return;
    released.add(resource);
    try{if(typeof resource.dispose==='function')resource.dispose();}catch(_){cleanupFailures++;}
  }
  function releaseOwned(){
    for(const resource of geometries)retire(resource);
    for(const resource of materials)retire(resource);
    for(const resource of lights)retire(resource);
  }
  function ownGeometry(geometry){geometries.add(geometry);return geometry;}
  function ownMaterial(options){const material=new THREE.MeshStandardMaterial(options);materials.add(material);return material;}
  function group(parent,name,x=0,y=0,z=0){
    const result=new THREE.Group();result.name=`druid-volume-${name}`;result.position.set(x,y,z);parent.add(result);return result;
  }
  function mesh(parent,name,geometry,material,x=0,y=0,z=0){
    const result=new THREE.Mesh(geometry,material);result.name=`druid-volume-${name}`;
    result.position.set(x,y,z);result.userData.druidVolumePart=true;result.frustumCulled=false;
    parent.add(result);solids.push(result);return result;
  }
  function remember(joint){rest.push({joint,position:joint.position.clone(),rotation:joint.rotation.clone(),scale:joint.scale.clone()});return joint;}
  // Closed tapered branches with real radial cross sections, not camera-facing strips.
  function branch(parent,name,points,radii,material,segments=14,radial=9){
    const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'centripetal');
    const frames=curve.computeFrenetFrames(segments,false),positions=[],indices=[];
    for(let i=0;i<=segments;i++){
      const t=i/segments,p=curve.getPointAt(t),k=t*(radii.length-1),a=Math.min(radii.length-2,Math.floor(k)),r=radii[a]+(radii[a+1]-radii[a])*(k-a);
      for(let j=0;j<radial;j++){
        const angle=j/radial*TAU,flute=1+.10*Math.sin(j*3+i*.72);
        const point=p.clone().addScaledVector(frames.normals[i],Math.cos(angle)*r*flute).addScaledVector(frames.binormals[i],Math.sin(angle)*r*flute);
        positions.push(point.x,point.y,point.z);
        if(i<segments){const n=i*radial+j,q=i*radial+(j+1)%radial;indices.push(n,q,n+radial,q,q+radial,n+radial);}
      }
    }
    const start=positions.length/3,p0=curve.getPointAt(0),p1=curve.getPointAt(1);
    positions.push(p0.x,p0.y,p0.z,p1.x,p1.y,p1.z);
    for(let j=0;j<radial;j++){const q=(j+1)%radial;indices.push(start,q,j,start+1,segments*radial+j,segments*radial+q);}
    const geometry=ownGeometry(new THREE.BufferGeometry());
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();
    return mesh(parent,name,geometry,material);
  }
  // Each cloak panel is a closed, slightly curved shell with an uneven torn hem.
  function cloakGeometry(index,count){
    const radial=5,rows=7,angles=TAU-1.20,center=.60+angles*(index+.5)/count,half=angles/count*.48;
    const positions=[],indices=[],sideSize=(radial+1)*(rows+1),thickness=.004;
    for(let side=0;side<2;side++)for(let row=0;row<=rows;row++)for(let col=0;col<=radial;col++){
      const t=row/rows,u=col/radial,angle=center+(u*2-1)*half;
      const radius=.135+.105*t+.010*Math.sin(u*Math.PI*4+index)*t+(side===0?thickness:-thickness);
      const tear=t*t*t*(.012+.021*(.5+.5*Math.sin(index*4.9+col*2.7)));
      positions.push(Math.sin(angle)*radius,.025-.43*t+tear,Math.cos(angle)*radius*.76-.018);
      if(row<rows&&col<radial){const a=side*sideSize+row*(radial+1)+col,b=a+radial+1;
        if(side===0)indices.push(a,b,a+1,a+1,b,b+1);else indices.push(a,a+1,b,a+1,b+1,b);
      }
    }
    const edge=(a,b)=>indices.push(a,b,a+sideSize,b,b+sideSize,a+sideSize);
    for(let col=0;col<radial;col++){edge(col+1,col);const base=rows*(radial+1);edge(base+col,base+col+1);}
    for(let row=0;row<rows;row++){const a=row*(radial+1),b=a+radial+1;edge(a,b);edge(b+radial,a+radial);}
    const geometry=ownGeometry(new THREE.BufferGeometry());geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
  }
  try{
    object3d=new THREE.Group();object3d.name='dark-druid-volumetric-boss';object3d.scale.setScalar(height);
    object3d.userData.representation='volumetric-boss';
    const facing=group(object3d,'facing'),body=group(facing,'pitched-body');body.rotation.x=PITCH;
    const lightRoot=group(object3d,'fixed-light-rig'),shadowRoot=group(object3d,'ground-contact');
    const bark=ownMaterial({color:0x493929,roughness:.93,metalness:.02});
    const ridge=ownMaterial({color:0x796145,roughness:.87,metalness:.02});
    const heartwood=ownMaterial({color:0x261f19,roughness:1});
    const bone=ownMaterial({color:0xd0cbb0,roughness:.72,metalness:.02});
    const horn=ownMaterial({color:0x9c8c69,roughness:.79});
    const rag=ownMaterial({color:0x30372b,roughness:.99,side:THREE.DoubleSide});
    const ragEdge=ownMaterial({color:0x706044,roughness:.98});
    const green=ownMaterial({color:0x82ee52,emissive:0x42ce24,emissiveIntensity:1.55,roughness:.35});
    const orbMaterial=ownMaterial({color:0xafff79,emissive:0x62ff27,emissiveIntensity:2.1,roughness:.22,metalness:.12});
    const socket=ownMaterial({color:0x101a0e,roughness:1});
    const band=ownMaterial({color:0x6d7752,roughness:.61,metalness:.34});
    const sphere=ownGeometry(new THREE.SphereGeometry(1,24,16));
    const smallSphere=ownGeometry(new THREE.SphereGeometry(1,12,9));
    const organic=ownGeometry(new THREE.SphereGeometry(1,26,18));
    const attribute=organic.getAttribute('position');
    for(let i=0;i<attribute.count;i++){
      const x=attribute.getX(i),y=attribute.getY(i),z=attribute.getZ(i),angle=Math.atan2(z,x);
      const ripple=1+.045*Math.sin(angle*9+y*6)+.022*Math.cos(y*19+angle*4);
      attribute.setXYZ(i,x*ripple,y,z*ripple);
    }
    organic.computeVertexNormals();
    function ellipsoid(parent,name,position,scale,material,detail=organic){const item=mesh(parent,name,detail,material,...position);item.scale.set(...scale);return item;}
    const waist=remember(group(body,'waist',0,.305,0));
    ellipsoid(waist,'root-pelvis',[0,.012,0],[.112,.079,.078],heartwood);
    const torso=remember(group(waist,'thorax',0,.045,0));
    ellipsoid(torso,'bark-thorax',[0,.122,0],[.132,.178,.085],bark);
    ellipsoid(torso,'hunched-back',[0,.19,-.055],[.147,.133,.075],heartwood);
    ellipsoid(torso,'collar-root',[0,.278,.003],[.102,.075,.072],ridge);
    // Layered rib roots, a split sternum, and winding bark seams integrate the trunk.
    for(let side of [-1,1])for(let i=0;i<5;i++){
      const y=.055+i*.038;
      branch(torso,`rib-${side}-${i}`,[[side*.012,y-.012,.081],[side*.07,y+.014,.092],[side*(.112-i*.005),y+.034,.046]],[.010,.007,.003],i%2?ridge:bark,10,7);
    }
    for(let i=0;i<7;i++){
      const angle=(i/6-.5)*2.6;
      branch(torso,`long-bark-seam-${i}`,[[Math.sin(angle)*.09,-.025,Math.cos(angle)*.062],[Math.sin(angle+.12)*.118,.12,Math.cos(angle+.12)*.082],[Math.sin(angle-.06)*.078,.255,Math.cos(angle-.06)*.055]],[.004,.007,.002],ridge,14,6);
    }
    branch(torso,'split-sternum',[[0,.04,.09],[-.008,.125,.105],[.009,.225,.083]],[.009,.006,.002],heartwood,15,7);
    for(let i=0;i<3;i++){
      const rune=mesh(torso,`chest-rune-${i}`,ownGeometry(new THREE.TorusGeometry(.014,.0028,5,12)),green,0,.095+i*.042,.091);
      rune.scale.set(1,.70,1);rune.rotation.z=i*.7;
    }
    const neck=remember(group(torso,'neck',0,.303,.012));
    branch(neck,'twisted-neck',[[0,-.028,0],[-.012,.012,.008],[0,.055,.014]],[.044,.034,.028],bark,12,10);
    const head=remember(group(neck,'head',0,.052,.012));
    ellipsoid(head,'wooden-skull',[0,.041,-.003],[.076,.096,.064],heartwood);
    ellipsoid(head,'pale-elongated-mask',[0,.035,.050],[.062,.087,.029],bone,sphere);
    ellipsoid(head,'lower-mask-jaw',[0,-.027,.051],[.045,.038,.026],bone,sphere);
    branch(head,'long-mask-nose',[[0,.062,.073],[0,.024,.094],[0,.006,.085]],[.011,.009,.003],bone,9,7);
    for(let side of [-1,1]){
      const eyeSocket=ellipsoid(head,`sunken-eye-${side}`,[side*.027,.051,.075],[.023,.012,.009],socket,smallSphere);eyeSocket.rotation.z=side*.17;
      const eye=ellipsoid(head,`green-eye-${side}`,[side*.027,.051,.083],[.014,.0058,.005],green,smallSphere);eye.rotation.z=side*.17;eyes.push(eye);
      branch(head,`mask-brow-${side}`,[[side*.006,.069,.079],[side*.033,.071,.082],[side*.057,.055,.067]],[.006,.008,.0025],bone,9,6);
      branch(head,`mask-cheek-${side}`,[[side*.054,.034,.069],[side*.039,-.010,.079],[side*.017,-.054,.065]],[.005,.004,.0015],horn,10,6);
      branch(head,`antler-main-${side}`,[[side*.056,.099,-.008],[side*.100,.164,-.012],[side*.132,.223,.016],[side*.116,.291,.041]],[.024,.021,.012,.0008],horn,22,10);
      branch(head,`antler-outer-fork-${side}`,[[side*.091,.156,-.012],[side*.162,.187,-.008],[side*.184,.239,.015]],[.014,.008,.0006],ridge,14,8);
      branch(head,`antler-inner-fork-${side}`,[[side*.128,.219,.015],[side*.083,.249,.026],[side*.073,.287,.054]],[.010,.007,.0005],horn,13,8);
      branch(head,`antler-back-tine-${side}`,[[side*.068,.115,-.016],[side*.098,.159,-.070],[side*.090,.194,-.082]],[.013,.008,.0005],bark,12,8);
      branch(head,`root-beard-${side}`,[[side*.024,-.041,.052],[side*.037,-.080,.032],[side*.015,-.103,.065]],[.008,.005,.0007],ridge,11,7);
    }
    const arms=[];
    for(let side of [-1,1]){
      const upper=remember(group(torso,`upper-arm-${side}`,side*.151,.237,.005));
      ellipsoid(upper,`gnarled-shoulder-${side}`,[0,-.012,0],[.057,.059,.054],ridge);
      branch(upper,`upper-arm-bough-${side}`,[[0,0,0],[side*.016,-.076,.012],[0,-.151,.012]],[.041,.032,.023],bark,16,10);
      for(let j=0;j<3;j++)branch(upper,`arm-bark-ridge-${side}-${j}`,[[Math.sin(j*2)*.028,-.02,Math.cos(j*2)*.029],[Math.sin(j*2+.25)*.028,-.095,Math.cos(j*2+.25)*.027],[0,-.151,.022]],[.003,.005,.0015],ridge,12,6);
      const lower=remember(group(upper,`forearm-${side}`,0,-.151,.012));
      ellipsoid(lower,`elbow-knot-${side}`,[0,0,0],[.029,.033,.029],heartwood);
      branch(lower,`forearm-bough-${side}`,[[0,0,0],[-side*.010,-.060,.006],[0,-.137,.004]],[.028,.023,.014],bark,15,9);
      const hand=remember(group(lower,`hand-${side}`,0,-.137,.004));
      ellipsoid(hand,`hand-palm-${side}`,[0,-.019,.009],[.024,.033,.020],ridge);
      for(let j=0;j<4;j++){
        const dx=(j-1.5)*.011;
        branch(hand,`wood-claw-${side}-${j}`,[[dx,-.026,.013],[dx*1.25,-.059,.030],[dx*1.2,-.063,.055]],[.006,.004,.0008],j===0?bone:ridge,10,6);
      }
      branch(hand,`thumb-${side}`,[[side*.018,-.008,.008],[side*.037,-.031,.026],[side*.025,-.042,.046]],[.009,.006,.001],ridge,9,7);
      arms.push({side,upper,lower,hand});
    }
    const staff=remember(group(arms[1].hand,'staff',.004,-.006,.041));
    branch(staff,'crooked-staff-shaft',[[0,-.255,0],[-.012,-.08,.003],[.010,.17,0],[.016,.40,.008],[0,.53,.010]],[.011,.014,.012,.015,.010],bark,34,10);
    for(let side of [-1,1]){
      branch(staff,`staff-crown-fork-${side}`,[[0,.395,0],[side*.060,.462,.010],[side*.052,.549,.025],[side*.015,.580,.018]],[.017,.015,.009,.0015],ridge,22,9);
      branch(staff,`staff-thorn-${side}`,[[0,.30,0],[side*.041,.325,-.018],[side*.048,.355,-.014]],[.010,.006,.0005],bark,11,7);
    }
    const orb=ellipsoid(staff,'staff-green-orb',[0,.506,.022],[.043,.046,.043],orbMaterial,sphere);
    for(let i=0;i<3;i++){
      const binding=mesh(staff,`orb-root-cage-${i}`,ownGeometry(new THREE.TorusGeometry(.048,.004,7,26)),band,0,.506,.022);
      binding.rotation.set(i===0?Math.PI/2:.22,i*TAU/3,.26);
    }
    for(let i=0;i<5;i++){
      const knot=mesh(staff,`staff-rune-collar-${i}`,ownGeometry(new THREE.TorusGeometry(.015,.003,6,14)),i%2?green:band,0,.04+i*.055,0);
      knot.rotation.x=Math.PI/2;
    }
    const legs=[];
    for(let side of [-1,1]){
      const hip=remember(group(body,`hip-${side}`,side*.073,.300,0));
      branch(hip,`upper-root-leg-${side}`,[[0,0,0],[side*.009,-.071,-.010],[side*.006,-.145,.005]],[.047,.035,.024],bark,15,10);
      const knee=remember(group(hip,`knee-${side}`,side*.006,-.145,.005));
      ellipsoid(knee,`knee-root-knot-${side}`,[0,0,0],[.028,.031,.028],ridge);
      branch(knee,`shin-root-${side}`,[[0,0,0],[-side*.009,-.065,.005],[0,-.129,.006]],[.026,.022,.018],bark,14,9);
      const foot=remember(group(knee,`root-foot-${side}`,0,-.129,.006));
      ellipsoid(foot,`root-foot-core-${side}`,[0,.002,.021],[.037,.027,.050],heartwood);
      for(let j=0;j<4;j++){
        const dx=(j-1.5)*.021;
        branch(foot,`root-toe-${side}-${j}`,[[dx*.35,.013,.012],[dx,-.003,.051],[dx*1.4,-.006,.098-j*.009]],[.014,.010,.0013],j%2?bark:ridge,13,7);
      }
      branch(foot,`heel-root-${side}`,[[0,.014,0],[side*.032,.003,-.035],[side*.044,-.002,-.063]],[.015,.009,.001],bark,12,7);
      legs.push({side,hip,knee,foot});
    }
    for(let i=0;i<8;i++){
      const panel=remember(group(torso,`cloak-panel-${i}`,0,.236,0));
      mesh(panel,`solid-tattered-cloak-${i}`,cloakGeometry(i,8),rag);cloth.push(panel);
      const angle=.60+(TAU-1.20)*(i+.5)/8;
      branch(panel,`cloak-raised-seam-${i}`,[[Math.sin(angle)*.138,.021,Math.cos(angle)*.138*.76-.018],[Math.sin(angle)*.175,-.18,Math.cos(angle)*.175*.76-.018],[Math.sin(angle)*.237,-.375,Math.cos(angle)*.237*.76-.018]],[.0025,.0035,.001],ragEdge,14,5);
    }
    // Collar roots and shoulder spikes join the cape to the solid torso.
    for(let side of [-1,1])for(let j=0;j<3;j++){
      branch(torso,`shoulder-spur-${side}-${j}`,[[side*.10,.245,-.022-j*.018],[side*(.15+j*.013),.29+j*.013,-.025-j*.025],[side*(.18+j*.011),.31+j*.012,-.045-j*.027]],[.016,.011,.0008],j%2?ridge:horn,12,8);
    }
    // Soft layered ellipses; these are excluded from solid-body fitting/bounds.
    const disc=ownGeometry(new THREE.CircleGeometry(1,48));
    for(let i=0;i<9;i++){
      const material=new THREE.MeshBasicMaterial({color:0x07100a,transparent:true,opacity:.012+i*.002,depthWrite:false,side:THREE.DoubleSide,toneMapped:false});materials.add(material);
      const discMesh=new THREE.Mesh(disc,material);discMesh.name=`druid-volume-contact-shadow-${i}`;discMesh.rotation.x=-Math.PI/2+PITCH;
      const size=1-i*.066;discMesh.scale.set(.255*size,.155*size,1);discMesh.position.set(0,.0005+i*.00007,.025);
      discMesh.renderOrder=-10+i;discMesh.userData.druidVolumeShadow=true;discMesh.userData.excludeBounds=true;shadowRoot.add(discMesh);shadows.push(discMesh);
    }
    function addLight(light,name,position){light.name=`druid-volume-${name}`;if(position)light.position.set(...position);lights.add(light);lightRoot.add(light);return light;}
    addLight(new THREE.AmbientLight(0x738372,.45),'ambient');
    addLight(new THREE.HemisphereLight(0xdce9cf,0x161b14,1.15),'hemisphere');
    const key=addLight(new THREE.DirectionalLight(0xffe6c8,2.5),'warm-key',[-2,3,4]);
    const rim=addLight(new THREE.DirectionalLight(0x82dca4,2.0),'green-rim',[2,1.5,-3]);
    const fill=addLight(new THREE.DirectionalLight(0xaac2ee,.75),'cool-fill',[1,.8,3]);
    for(const light of [key,rim,fill]){light.target.position.set(0,.5,0);lightRoot.add(light.target);}
    body.updateMatrixWorld(true);
    const initialBox=new THREE.Box3().setFromObject(body),authoredHeight=initialBox.max.y-initialBox.min.y;
    if(!Number.isFinite(authoredHeight)||authoredHeight<=0)throw new Error('Druid authored solid bounds unavailable.');
    body.position.y=-initialBox.min.y;facing.scale.setScalar(1/authoredHeight);
    const vertexCount=solids.reduce((n,item)=>n+item.geometry.getAttribute('position').count,0);
    const triangleCount=solids.reduce((n,item)=>n+(item.geometry.index?item.geometry.index.count:item.geometry.getAttribute('position').count)/3,0);
    const upAxis=new THREE.Vector3(0,1,0),gripPalm=new THREE.Vector3(0,-.027,.029);
    const rightGrip=new THREE.Vector3(-.004,.055,.002),leftGrip=new THREE.Vector3(-.010,-.055,.003);
    const opposingGrip=new THREE.Quaternion().setFromAxisAngle(upAxis,Math.PI);
    const waistRest=waist.position.clone(),torsoRest=torso.position.clone();
    const ikDirection=new THREE.Vector3(),ikBend=new THREE.Vector3(),ikElbow=new THREE.Vector3(),ikEnd=new THREE.Vector3(),ikVector=new THREE.Vector3();
    const ikQuaternion=new THREE.Quaternion(),weaponLocal=new THREE.Quaternion(),handFrame=new THREE.Quaternion();
    const gripTarget=new THREE.Vector3(),gripOffset=new THREE.Vector3(),footTarget=new THREE.Vector3(),footRotation=new THREE.Quaternion();
    const reachA=new THREE.Vector3(),reachB=new THREE.Vector3(),reachMid=new THREE.Vector3(),reachAxis=new THREE.Vector3(),reachTangent=new THREE.Vector3();
    let lastAction='';
    function limb(root,middle,end){
      const upper=middle.position.clone(),lower=end.position.clone();
      return {root,middle,end,upper,lower,upperAxis:upper.clone().normalize(),lowerAxis:lower.clone().normalize(),a:upper.length(),b:lower.length(),endPoint:new THREE.Vector3()};
    }
    for(const arm of arms){arm.ik=limb(arm.upper,arm.lower,arm.hand);arm.gripOffset=new THREE.Vector3();arm.gripRotation=new THREE.Quaternion();}
    for(const leg of legs){
      leg.ik=limb(leg.hip,leg.knee,leg.foot);
      leg.pelvisOffset=leg.hip.position.clone().sub(waistRest);
      leg.planted=leg.hip.position.clone().add(leg.knee.position).add(leg.foot.position);
    }
    // The joints retain their authored segment lengths. Both palms are solved onto
    // the same staff frame, rather than rotating a weapon independently of a hand.
    function solveLimb(chain,target,pole,endRotation){
      const {root,middle,end,a,b}=chain;
      ikDirection.copy(target).sub(root.position);
      const rawDistance=ikDirection.length(),distance=clamp(rawDistance,Math.abs(a-b)+.000001,a+b-.000001);
      if(rawDistance>.000001)ikDirection.multiplyScalar(1/rawDistance);else ikDirection.set(0,-1,0);
      ikBend.copy(pole).sub(root.position).addScaledVector(ikDirection,-ikBend.dot(ikDirection));
      if(ikBend.lengthSq()<.000001){ikBend.set(0,0,1).addScaledVector(ikDirection,-ikDirection.z);}
      ikBend.normalize();
      const along=(a*a-b*b+distance*distance)/(2*distance),bend=Math.sqrt(Math.max(0,a*a-along*along));
      ikElbow.copy(root.position).addScaledVector(ikDirection,along).addScaledVector(ikBend,bend);
      ikEnd.copy(root.position).addScaledVector(ikDirection,distance);
      ikVector.copy(ikElbow).sub(root.position).normalize();root.quaternion.setFromUnitVectors(chain.upperAxis,ikVector);
      ikQuaternion.copy(root.quaternion).invert();
      ikVector.copy(ikEnd).sub(ikElbow).normalize().applyQuaternion(ikQuaternion);
      middle.quaternion.setFromUnitVectors(chain.lowerAxis,ikVector);
      ikQuaternion.copy(root.quaternion).multiply(middle.quaternion);
      end.quaternion.copy(ikQuaternion).invert().multiply(endRotation);
      chain.endPoint.copy(chain.upper).applyQuaternion(root.quaternion).add(root.position);
      ikVector.copy(chain.lower).applyQuaternion(ikQuaternion);chain.endPoint.add(ikVector);
    }
    const poseFields=['pelvisX','pelvisY','pelvisZ','pelvisYaw','pelvisRoll','pitch','yaw','roll','headPitch','headYaw','chestLift','spread','stagger','pressure','clothPitch','clothTwist'];
    function idlePose(time,walking){
      const breath=Math.sin(time*2.1),wave=Math.sin(time*(walking?7:2.1));
      return {pelvisX:0,pelvisY:walking?-.025+Math.abs(wave)*.009:-.008+breath*.002,pelvisZ:0,pelvisYaw:walking?wave*.045:0,pelvisRoll:walking?wave*.025:0,
        pitch:.035+breath*.018,yaw:0,roll:walking?wave*.025:Math.sin(time*1.6)*.012,headPitch:-.045+Math.sin(time*1.8)*.025,headYaw:Math.sin(time*.8)*.045,
        chestLift:breath*.003,spread:0,stagger:0,pressure:0,clothPitch:0,clothTwist:0,
        staffCenter:new THREE.Vector3(.035,.18,.135),staffRotation:new THREE.Quaternion().setFromEuler(new THREE.Euler(.18,.10,0,'YXZ'))};
    }
    function blendPose(a,b,t){
      if(t<=0)return a;if(t>=1)return b;
      const result={};for(const key of poseFields)result[key]=a[key]+(b[key]-a[key])*t;
      result.staffCenter=a.staffCenter.clone().lerp(b.staffCenter,t);result.staffRotation=a.staffRotation.clone().slerp(b.staffRotation,t);return result;
    }
    function actionPose(action,phase,side,time){
      const result=idlePose(time,false),e=smooth(phase);
      result.spread=1;result.chestLift=0;result.headYaw=0;
      if(action==='bossSweep'){
        // Load the rear leg and coil the pelvis/chest before carrying both grips
        // across the front. The staff, hands and shoulders share this one pose.
        result.pelvisX=side*(-.035+.025*e);result.pelvisY=-.045-.018*Math.sin(Math.PI*e);result.pelvisZ=-.015+.045*e;
        result.pelvisYaw=side*(-.32+.62*e);result.pelvisRoll=side*(-.045+.08*e);
        result.pitch=.09+.09*Math.sin(Math.PI*e);result.yaw=side*(-.48+.99*e);result.roll=side*(-.04+.08*e);
        result.headPitch=-.035;result.headYaw=-result.yaw*.38;result.stagger=-side*.065;result.pressure=side*(-.08+.16*e);
        result.clothPitch=-.025+.07*Math.sin(Math.PI*e);result.clothTwist=side*(-.07+.16*e);
        result.staffCenter.set(side*(.05-.07*e),.18+.012*Math.sin(Math.PI*e),.135+.018*Math.sin(Math.PI*e));
        const front=Math.sin(Math.PI*e),axis=new THREE.Vector3(side*Math.cos(Math.PI*e)*.94,.28+front*.24,front*.94).normalize();
        result.staffRotation.setFromUnitVectors(upAxis,axis);
      }else{
        // Hands lift together; a short load precedes the accelerating forward
        // drop. The impact pose is at phase one, with the pelvis low behind it.
        const load=smooth(clamp(phase/.18,0,1)),swing=clamp((phase-.18)/.82,0,1),strike=swing*swing*(2-swing);
        result.pelvisX=.006;result.pelvisY=-.035+.015*load-.055*strike;result.pelvisZ=-.025-.015*load+.095*strike;
        result.pelvisYaw=-.10+.16*strike;result.pelvisRoll=0;
        result.pitch=-.18-.07*load+.80*strike;result.yaw=-.08+.12*strike;result.roll=0;
        result.headPitch=.10-.26*strike;result.stagger=.035;result.pressure=.13*strike;
        result.clothPitch=-.055-.035*load+.18*strike;result.clothTwist=.025-.05*strike;
        result.staffCenter.set(.015,.305+.020*load-.20*strike,.09-.020*load+.055*strike);
        result.staffRotation.setFromEuler(new THREE.Euler(-.16-.18*load+2.16*strike,-.035+.07*strike,0,'YXZ'));
      }
      return result;
    }
    function update(options={}){
      if(disposed)return null;
      const {mode='idle',direction=0,phase=.5,time=0,state='',delta=0,sweepDirection=1,anticipation=1,recoveryFrom=''}=options;
      if(!['idle','walk','run','attack'].includes(mode)||!Number.isInteger(direction)||direction<0||direction>7||!Number.isFinite(phase)||phase<0||phase>1||!Number.isFinite(time)||typeof state!=='string'||!Number.isFinite(delta)||delta<0||![-1,1].includes(sweepDirection)||!Number.isFinite(anticipation)||anticipation<0||anticipation>1||!['','bossSlam','bossSweep'].includes(recoveryFrom))throw new TypeError('Invalid Druid volume pose input.');
      for(const item of rest){item.joint.position.copy(item.position);item.joint.rotation.copy(item.rotation);item.joint.scale.copy(item.scale);}
      const p=clamp(phase,0,1),walking=mode==='walk'||mode==='run',cycle=mode==='run'?10:7,wave=Math.sin(time*(walking?cycle:2.1));
      facing.rotation.y=direction*Math.PI/4;body.rotation.x=PITCH;
      const wind=mode==='attack'&&(state.includes('Wind')||state.includes('windup'));
      let pose=idlePose(time,walking);
      if(mode==='attack'&&(state==='bossSweepWind'||state==='bossSweep'||state==='bossSlamWind'||state==='bossSlam')){
        const action=state.startsWith('bossSweep')?'bossSweep':'bossSlam';
        pose=wind?blendPose(pose,actionPose(action,0,sweepDirection,time),smooth(anticipation)):actionPose(action,p,sweepDirection,time);
        lastAction=action;
      }else if(mode==='idle'&&state==='recover'){
        const action=recoveryFrom||lastAction;
        if(action)pose=blendPose(actionPose(action,1,sweepDirection,time),pose,smooth(p));
      }else if(wind){
        pose=blendPose(pose,actionPose('bossSlam',0,sweepDirection,time),smooth(anticipation));
      }else if(mode==='attack'){
        const reach=Math.sin(Math.PI*p);pose.pitch+=.13*reach;pose.pelvisY-=.02*reach;
        pose.staffCenter.y+=.11*reach;pose.staffCenter.z+=.035*reach;pose.spread=.45*reach;
      }else lastAction='';
      waist.position.copy(waistRest).add(new THREE.Vector3(pose.pelvisX,pose.pelvisY,pose.pelvisZ));
      waist.rotation.set(0,pose.pelvisYaw,pose.pelvisRoll);
      torso.position.copy(torsoRest);torso.position.y+=pose.chestLift;
      torso.rotation.set(pose.pitch,pose.yaw,pose.roll);head.rotation.set(pose.headPitch,pose.headYaw,0);
      for(const leg of legs){
        leg.hip.position.copy(leg.pelvisOffset).applyQuaternion(waist.quaternion).add(waist.position);
        footTarget.copy(leg.planted);footTarget.x+=leg.side*.040*pose.spread;footTarget.z+=leg.side*pose.stagger;
        if(walking){footTarget.z+=wave*leg.side*.065;footTarget.y+=Math.max(0,-wave*leg.side)*.035;}
        footRotation.setFromEuler(new THREE.Euler(pose.pressure*leg.side,leg.side*.12*pose.spread,0));
        solveLimb(leg.ik,footTarget,new THREE.Vector3(leg.side*.15,.12,.32),footRotation);
      }
      // Desired staff orientation is body-local. Counter-rotation through the
      // pelvis/chest lets a large torso coil drive arms without reversing the tip.
      weaponLocal.copy(waist.quaternion).multiply(torso.quaternion).invert().multiply(pose.staffRotation);
      for(const arm of arms){
        arm.gripRotation.copy(weaponLocal);if(arm.side<0)arm.gripRotation.multiply(opposingGrip);
        arm.gripOffset.copy(arm.side>0?rightGrip:leftGrip).applyQuaternion(weaponLocal);
        gripOffset.copy(gripPalm).applyQuaternion(arm.gripRotation);arm.gripOffset.sub(gripOffset);
      }
      // Keep both grip targets inside the intersection of the authored arm
      // reaches. If necessary the whole staff frame moves, never just one hand.
      reachA.copy(arms[0].upper.position).sub(arms[0].gripOffset);reachB.copy(arms[1].upper.position).sub(arms[1].gripOffset);
      const reachRadius=Math.min(arms[0].ik.a+arms[0].ik.b,arms[1].ik.a+arms[1].ik.b)-.000004;
      if(pose.staffCenter.distanceToSquared(reachA)>reachRadius*reachRadius||pose.staffCenter.distanceToSquared(reachB)>reachRadius*reachRadius){
        reachAxis.copy(reachB).sub(reachA);const separation=reachAxis.length();reachAxis.multiplyScalar(1/separation);
        reachMid.copy(reachA).add(reachB).multiplyScalar(.5);
        reachTangent.copy(pose.staffCenter).sub(reachMid).addScaledVector(reachAxis,-reachTangent.dot(reachAxis));
        const radius=Math.sqrt(Math.max(0,reachRadius*reachRadius-separation*separation*.25)),length=reachTangent.length();
        if(length>radius&&length>0)reachTangent.multiplyScalar(radius/length);
        pose.staffCenter.copy(reachMid).add(reachTangent);
      }
      for(const arm of arms){
        gripTarget.copy(pose.staffCenter).add(arm.gripOffset);
        solveLimb(arm.ik,gripTarget,new THREE.Vector3(arm.side*.34,.10,.30),arm.gripRotation);
      }
      const right=arms[1];
      handFrame.copy(right.upper.quaternion).multiply(right.lower.quaternion).multiply(right.hand.quaternion).invert();
      staff.position.copy(pose.staffCenter).sub(right.ik.endPoint).applyQuaternion(handFrame);
      staff.quaternion.copy(handFrame).multiply(weaponLocal);
      for(let i=0;i<cloth.length;i++){
        const flutter=Math.sin(time*(walking?5:2)+i*.81);
        cloth[i].rotation.x=flutter*(walking?.065:.023)+pose.clothPitch;
        cloth[i].rotation.z=Math.cos(time*2.2+i)*.023+pose.clothTwist*Math.sin(i*.81);
      }
      orb.scale.set(.043,.046,.043).multiplyScalar(1+.045*Math.sin(time*4));
      green.emissiveIntensity=1.45+.20*Math.sin(time*3.7);
      object3d.updateMatrixWorld(true);
      updates++;last=Object.freeze({mode,direction,phase:p,time,state,delta:Math.min(.05,delta),sweepDirection});return object3d;
    }
    function snapshot(){
      return Object.freeze({representation:'volumetric-boss',depthMode:'solid-separated-parts',height,front:'+Z',pitch:PITCH,
        parts:solids.length,meshCount:solids.length+shadows.length,solidMeshCount:solids.length,shadowMeshes:shadows.length,
        vertices:vertexCount,triangles:triangleCount,geometryCount:geometries.size,materialCount:materials.size,lightCount:lights.size,
        authoredHeight,modelScale:1/authoredHeight,groundOffset:body.position.y,disposed,cleanupFailures,updates,
        mode:last?.mode??'idle',direction:last?.direction??0,phase:last?.phase??.5,time:last?.time??0,state:last?.state??'',
        joints:rest.length,assetsUsed:0,sourceImages:0,clockOwned:false,
        limits:'Authored solid Druid interpretation; no source-image parts or anatomical registration; no combat/physics/save changes; native visual acceptance pending.'});
    }
    function dispose(){
      if(disposed)return false;disposed=true;object3d.visible=false;
      try{object3d.removeFromParent();}catch(_){cleanupFailures++;}
      releaseOwned();return true;
    }
    update();return Object.freeze({object3d,update,snapshot,dispose});
  }catch(cause){
    disposed=true;if(object3d){object3d.visible=false;try{object3d.removeFromParent();}catch(_){cleanupFailures++;}}
    releaseOwned();throw cause;
  }
}
