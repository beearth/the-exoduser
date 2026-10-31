(function(global){
  'use strict';
  const files=[1,2,3,4].map(n=>'img/ui/currency/malice-orb-stage-'+n+'.png');
  const stage=amount=>amount>=100000?3:amount>=15000?2:amount>=1000?1:0;
  const images=[];
  if(typeof Image!=='undefined')for(const file of files){const img=new Image();img.src=file;images.push(img);}
  function icon(amount,size=24){
    return `<img class="currency-orb" data-currency-orb src="${files[stage(amount)]}" width="${size}" height="${size}" alt="" aria-hidden="true">`;
  }
  function update(amount,label){
    const index=stage(amount);
    for(const img of document.querySelectorAll('[data-currency-orb]')){
      if(img.getAttribute('src')!==files[index]){img.src=files[index];img.style.visibility='';}
      if(label)img.title=label;
    }
  }
  function pulse(target){
    if(!target?.animate)return;
    target.animate([{transform:'scale(1)'},{transform:'scale(1.14)'},{transform:'scale(1)'}],{duration:220});
  }
  let active=0;
  function pickup(x,y,amount){
    const target=document.getElementById('hudCurrencyOrb');
    if(!target||!target.getClientRects().length)return;
    const rect=target.getBoundingClientRect();
    if(global.matchMedia?.('(prefers-reduced-motion: reduce)').matches){pulse(target);return;}
    if(active>=16)return;
    const img=document.createElement('img');
    img.src=files[0];img.alt='';img.className='currency-orb-flight';
    img.style.left=(x-10)+'px';img.style.top=(y-10)+'px';
    document.body.appendChild(img);active++;
    const dx=rect.left+rect.width/2-x,dy=rect.top+rect.height/2-y;
    const animation=img.animate([
      {transform:'translate(0,0) scale(1)',opacity:1},
      {transform:`translate(${dx*.32}px,${dy*.24-30}px) scale(.9)`,opacity:1,offset:.4},
      {transform:`translate(${dx}px,${dy}px) scale(.2)`,opacity:.8}
    ],{duration:620,easing:'cubic-bezier(.3,.05,.5,1)',fill:'forwards'});
    let removed=false;
    const finish=()=>{if(removed)return;removed=true;img.remove();active--;};
    animation.onfinish=()=>{finish();pulse(target);};
    animation.oncancel=finish;
  }
  function draw(ctx,x,y,size,amount){
    const image=images[stage(amount)];
    if(!image?.complete||!image.naturalWidth)return false;
    ctx.drawImage(image,x-size/2,y-size/2,size,size);return true;
  }
  if(typeof document!=='undefined')document.addEventListener('error',event=>{
    if(event.target.matches?.('[data-currency-orb],.currency-orb-flight'))event.target.style.visibility='hidden';
  },true);
  global.ExoduserCurrencyOrb={stage,icon,update,pickup,draw};
})(window);
