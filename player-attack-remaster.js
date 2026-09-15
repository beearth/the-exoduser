// Attack-only atlas extension. Idle/walk sheets remain owned by the body remaster.
var SilvertailAttackRemaster=(()=>{
 const dirs=['s','se','e','ne','n','nw','w','sw'];
 function apply(base,frameMap,done){
  const image=new Image();
  image.onerror=()=>done(base,frameMap);
  image.onload=()=>{
   if(image.naturalWidth!==240||image.naturalHeight!==240){done(base,frameMap);return;}
   const atlas=document.createElement('canvas');
   atlas.width=Math.max(base.width,240);atlas.height=base.height+240;
   const ctx=atlas.getContext('2d');ctx.drawImage(base,0,0);ctx.drawImage(image,0,base.height);
   const fm=Object.assign({},frameMap);
   dirs.forEach((dir,row)=>{
    // Source headings: S, SW, W, NW, N, NE, E, SE, settled S.
    // Shift the upright turn for each aim direction; end on the starting heading.
    const start=(8-row)%8;
    const frames=Array.from({length:9},(_,f)=>{
     const i=row===0&&f===8?8:(start+f)%8;
     return {x:(i%3)*80,y:base.height+Math.floor(i/3)*80,w:80,h:80};
    });
    for(const anim of ['atk1','atk2','atk3','bash'])fm[anim+'_'+dir]=frames;
   });
   done(atlas,fm);
  };
  image.src='img/exoduser_silvertail/attack-spin-v2.png?v=20260915-spin2';
 }
 function progress(state,left,recoveryTicks){
  if(state==='wWindup')return 0;
  const recovery=Math.max(1,recoveryTicks);
  const elapsed=state==='wSwing'?5-left:5+recovery-left;
  return Math.max(0,Math.min(1,elapsed/(5+recovery)));
 }
 return {apply,progress};
})();
