// Shift grappling leap: anticipation, airborne flight, impact and recovery.
var WarriorDashFlight=(()=>{
 const dirs=['s','se','e','ne','n','nw','w','sw'];
 function apply(base,frameMap,done,character='warrior'){
  const image=new Image();
  image.onerror=()=>done(base,frameMap);
  image.onload=()=>{
   if(image.naturalWidth!==384||image.naturalHeight!==512){done(base,frameMap);return;}
   const atlas=document.createElement('canvas');
   atlas.width=Math.max(base.width,384);atlas.height=base.height+512;
   const ctx=atlas.getContext('2d');ctx.drawImage(base,0,0);ctx.drawImage(image,0,base.height);
   const fm=Object.assign({},frameMap);
   dirs.forEach((dir,row)=>{
    const frames=Array.from({length:6},(_,f)=>({x:f*64,y:base.height+row*64,w:64,h:64}));
    fm['dash_'+dir]=frames;
    fm['dash_start_'+dir]=frames.slice(0,2);
    fm['dash_fly_'+dir]=frames.slice(2,4);
    fm['dash_land_'+dir]=frames.slice(4,6);
   });
   done(atlas,fm);
  };
  image.src=character==='silvertail'
   ?'img/exoduser_silvertail/dash-flight-v1.png?v=20260924-flight1'
   :'img/exoduser_warrior/dash-flight-v1.png?v=20260924-flight1';
 }
 function direction(dashing,harpoon,landLeft,vx,vy,hvx,hvy,fallback){
  if((dashing||landLeft>0)&&(vx!==0||vy!==0))return Math.atan2(vy,vx);
  if(harpoon&&(hvx!==0||hvy!==0))return Math.atan2(hvy,hvx);
  return fallback;
 }
 function landing(active,state,moving){return !!active&&state==='idle'&&!moving;}
 return {apply,direction,landing};
})();
