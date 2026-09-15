// Two-handed horizontal cut: load, contact, opposite-shoulder follow-through.
var WarriorBatSwing=(()=>{
 const dirs=['s','se','e','ne','n','nw','w','sw'];
 const speed=.85;
 function frame(state,left,windupTicks,recoveryTicks){
  if(state==='wWindup')return baseFrame(state,windupTicks-(windupTicks-left)*speed,windupTicks,recoveryTicks);
  const bash=state==='sBash'||state==='sRecover',duration=bash?20:5;
  if(state==='wSwing'||state==='sBash')return baseFrame(state,duration-(duration-left)*speed,windupTicks,recoveryTicks);
  if(left<=0)return 8;
  // Let the slower cut finish during recovery, then lower the sword before idle.
  const recovery=Math.max(1,recoveryTicks),elapsed=recovery-left;
  const delay=duration*(1/speed-1);
  if(elapsed<delay)return baseFrame(bash?'sBash':'wSwing',duration-(duration+elapsed)*speed,windupTicks,recoveryTicks);
  return baseFrame(state,left,windupTicks,Math.max(.001,recovery-delay));
 }
 function baseFrame(state,left,windupTicks,recoveryTicks){
  const clamp=v=>Math.max(0,Math.min(1,v));
  if(state==='wWindup')return Math.min(2,Math.floor(clamp(1-left/Math.max(1,windupTicks))*3));
  if(state==='wSwing')return Math.min(6,2+Math.floor(Math.max(0,5-left)));
  if(state==='sBash'){
   const t=20-left;
   return t<2?0:t<4?1:t<7?2:t<8?3:t<11?4:t<14?5:6;
  }
  const t=clamp(1-left/Math.max(1,recoveryTicks));
  return t<.45?6:t<.8?7:8;
 }
 function apply(base,frameMap,done){
  const image=new Image();
  image.onerror=()=>done(base,frameMap);
  image.onload=()=>{
   if(image.naturalWidth!==720||image.naturalHeight!==640){done(base,frameMap);return;}
   const atlas=document.createElement('canvas');
   atlas.width=Math.max(base.width,720);atlas.height=base.height+640;
   const ctx=atlas.getContext('2d');ctx.drawImage(base,0,0);ctx.drawImage(image,0,base.height);
   const fm=Object.assign({},frameMap);
   dirs.forEach((dir,row)=>{
    const frames=Array.from({length:9},(_,f)=>({x:f*80,y:base.height+row*80,w:80,h:80}));
    for(const anim of ['atk1','atk2','atk3','bash'])fm[anim+'_'+dir]=frames;
   });
   done(atlas,fm);
  };
  image.src='img/exoduser_warrior/attack-bat-v1.png?v=20260915-bat2';
 }
 return {apply,frame,speed};
})();
