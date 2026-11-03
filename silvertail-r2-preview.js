// Local development opt-in. The unflagged legacy loader is not wrapped.
var SilvertailR2Preview=(()=>{
 'use strict';
 const active=typeof location!=='undefined'&&new URLSearchParams(location.search).get('spr')==='silver_r2';
 const dirs=['s','se','e','ne','n','nw','w','sw'];
 const specs=[['01_idle',192,768,96],['02_walk',384,768,96],['03_basic_attack',640,1280,160],['04_spin',480,480,160],['05_shift',768,1024,128],['06_hurt',288,768,96]];
 let imagesPromise=null;
 function images(){
  if(!imagesPromise)imagesPromise=Promise.all(specs.map(([key,w,h])=>new Promise((resolve,reject)=>{
   const image=new Image();
   image.onerror=()=>reject(new Error(key+' unavailable'));
   image.onload=()=>image.naturalWidth===w&&image.naturalHeight===h?resolve(image):reject(new Error(key+' dimensions'));
   image.src='assets/characters/silvertail_r2/'+key+'/atlas.png?v=20261103-r3';
  }))).catch(error=>{imagesPromise=null;throw error;});
  return imagesPromise;
 }
 function apply(base,frameMap,done){
  if(!active){done(base,frameMap);return;}
  images().then(loaded=>{
   const atlas=document.createElement('canvas');atlas.width=Math.max(base.width,...specs.map(s=>s[1]));atlas.height=base.height+specs.reduce((sum,s)=>sum+s[2],0);
   const ctx=atlas.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.drawImage(base,0,0);
   const offsets={};let y=base.height;
   specs.forEach(([key,w,h,cell],i)=>{offsets[key]={y,cell};ctx.drawImage(loaded[i],0,y);y+=h;});
   const fm=Object.assign({},frameMap);
   function rowFrames(key,row,count){const {y,cell}=offsets[key];return Array.from({length:count},(_,f)=>({x:f*cell,y:y+row*cell,w:cell,h:cell,renderScale:.5}));}
   dirs.forEach((dir,row)=>{
    const idle=rowFrames('01_idle',row,2),basic=rowFrames('03_basic_attack',row,4),dash=rowFrames('05_shift',row,6);
    const spin=Array.from({length:9},(_,f)=>{const i=row===0&&f===8?8:((8-row)%8+f)%8;return{x:i%3*160,y:offsets['04_spin'].y+Math.floor(i/3)*160,w:160,h:160,renderScale:.5};});
    for(const anim of ['idle','die','stun','block','ghost','dodge','gSlamRecover'])fm[anim+'_'+dir]=idle;
    fm['run_'+dir]=rowFrames('02_walk',row,4);fm['hurt_'+dir]=rowFrames('06_hurt',row,3);
    for(const anim of ['atk1','atk2','atk3','bash'])fm[anim+'_'+dir]=spin;
    for(const anim of ['gSlam1','gSlam2','whirlwind','chain','charge_start','charge_hold','charge_land','crossbow'])fm[anim+'_'+dir]=basic;
    fm['dash_'+dir]=dash;fm['dash_start_'+dir]=dash.slice(0,2);fm['dash_fly_'+dir]=dash.slice(2,4);fm['dash_land_'+dir]=dash.slice(4,6);
   });
   Object.keys(fm).filter(key=>key.endsWith('_s')).forEach(key=>{fm[key.slice(0,-2)]=fm[key];});
   atlas._silverR2=true;done(atlas,fm);
  }).catch(()=>done(base,frameMap));
 }
 if(active&&typeof WarriorDashFlight!=='undefined'){
  const legacyApply=WarriorDashFlight.apply;
  WarriorDashFlight.apply=function(base,frameMap,done,character='warrior'){
   legacyApply(base,frameMap,(legacy,legacyFrames)=>character==='silvertail'?apply(legacy,legacyFrames,done):done(legacy,legacyFrames),character);
  };
 }
 return {active,apply};
})();
