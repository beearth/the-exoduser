/* Humanity/demon level-up presentation. Static transparent atlases; no save state. */
(function (root) {
  'use strict';
  const DURATION=1.45, TAU=Math.PI*2;
  const CELLS={beam:[0,0,128,256],glow:[128,0,128,128],ring:[0,256,256,128],spark:[256,0,32,32],flare:[256,64,128,128]};
  let atlas=null,purpleAtlas=null;
  function prepareGold(){
    if(atlas||typeof document==='undefined')return atlas;
    const c=document.createElement('canvas');c.width=c.height=512;
    const x=c.getContext('2d');
    if(!x)return null;
    // A feathered column, baked once so the GPU never uploads a changing canvas.
    const beam=x.createLinearGradient(0,0,128,0);
    beam.addColorStop(0,'rgba(255,166,35,0)');beam.addColorStop(.27,'rgba(255,188,65,.04)');
    beam.addColorStop(.43,'rgba(255,211,123,.32)');beam.addColorStop(.49,'rgba(255,246,211,.88)');
    beam.addColorStop(.5,'rgba(255,255,245,.97)');beam.addColorStop(.51,'rgba(255,246,211,.88)');
    beam.addColorStop(.57,'rgba(255,211,123,.32)');beam.addColorStop(.73,'rgba(255,188,65,.04)');beam.addColorStop(1,'rgba(255,166,35,0)');
    x.fillStyle=beam;x.fillRect(0,0,128,256);
    x.globalCompositeOperation='destination-in';
    const taper=x.createLinearGradient(0,0,0,256);taper.addColorStop(0,'rgba(0,0,0,0)');
    taper.addColorStop(.22,'rgba(0,0,0,.4)');taper.addColorStop(.7,'rgba(0,0,0,1)');taper.addColorStop(.96,'rgba(0,0,0,1)');taper.addColorStop(1,'rgba(0,0,0,0)');
    x.fillStyle=taper;x.fillRect(0,0,128,256);x.globalCompositeOperation='source-over';
    const glow=x.createRadialGradient(192,64,0,192,64,62);
    glow.addColorStop(0,'rgba(255,245,200,.65)');glow.addColorStop(.22,'rgba(255,217,122,.28)');
    glow.addColorStop(.6,'rgba(246,167,38,.08)');glow.addColorStop(1,'rgba(246,167,38,0)');
    x.fillStyle=glow;x.fillRect(128,0,128,128);
    // Thin elliptical shockwave with a warm soft edge, never an opaque ground disk.
    x.save();x.translate(128,320);x.scale(1,.43);
    for(const [width,alpha] of [[12,.04],[7,.1],[3,.48],[1.2,.9]]){
      x.beginPath();x.arc(0,0,112,0,TAU);x.lineWidth=width;x.strokeStyle=`rgba(255,218,128,${alpha})`;x.stroke();
    }
    x.restore();
    const star=x.createRadialGradient(272,16,0,272,16,15);
    star.addColorStop(0,'rgba(255,255,236,1)');star.addColorStop(.18,'rgba(255,238,166,.9)');
    star.addColorStop(.5,'rgba(255,197,71,.16)');star.addColorStop(1,'rgba(255,183,48,0)');
    x.fillStyle=star;x.fillRect(256,0,32,32);
    x.fillStyle='rgba(255,248,218,.9)';x.beginPath();x.moveTo(272,8);x.lineTo(273.1,15);
    x.lineTo(278,16);x.lineTo(273.1,17);x.lineTo(272,24);x.lineTo(270.9,17);x.lineTo(266,16);x.lineTo(270.9,15);x.closePath();x.fill();
    x.save();x.translate(320,128);
    for(let i=0;i<8;i++){
      x.save();x.rotate(i*Math.PI/4);const g=x.createLinearGradient(0,0,0,-61);
      g.addColorStop(0,'rgba(255,253,231,.85)');g.addColorStop(.2,'rgba(255,226,151,.45)');g.addColorStop(1,'rgba(255,199,90,0)');
      x.fillStyle=g;x.beginPath();x.moveTo(-3,0);x.lineTo(0,-61);x.lineTo(3,0);x.closePath();x.fill();x.restore();
    }
    x.restore();atlas=c;return atlas;
  }
  function prepare(demonic){
    const gold=prepareGold();
    if(!demonic||!gold)return gold;
    if(!purpleAtlas){
      const c=document.createElement('canvas');c.width=c.height=512;
      const x=c.getContext('2d');if(!x)return gold;
      x.drawImage(gold,0,0);const image=x.getImageData(0,0,512,512),data=image.data;
      for(let i=0;i<data.length;i+=4){const r=data[i];data[i]=data[i+1];data[i+1]=data[i+2];data[i+2]=r;}
      x.putImageData(image,0,0);purpleAtlas=c;
    }
    return purpleAtlas;
  }
  function stamp(ctx,texture,cell,cx,cy,w,h,alpha){
    if(alpha<=.002||w<=0||h<=0)return;
    ctx.globalAlpha=Math.min(1,alpha);
    ctx.drawImage(texture,cell[0],cell[1],cell[2],cell[3],cx-w/2,cy-h/2,w,h);
  }
  function create(){
    prepare();
    let active=false,age=0,owner=null,stage=-1,strength=1,label='',demonic=false;
    return {
      get active(){return active;},get age(){return age;},
      trigger(player,currentStage,levels,isDemonic=false){
        if(!player||player.hp<=0)return;
        const merge=active&&owner===player&&stage===currentStage&&age<.24;
        owner=player;stage=currentStage;strength=Math.min(1.12,1+Math.max(0,(levels||1)-1)*.03);
        label='Lv. '+Math.floor(player.lv||1);
        demonic=!!isDemonic;prepare(demonic);
        if(!merge)age=0;
        active=true;
      },
      update(seconds,player,currentStage){
        if(!active)return;
        if(owner!==player||stage!==currentStage||!player||player.hp<=0||player.s==='fallen'){active=false;owner=null;return;}
        if(Number.isFinite(seconds)&&seconds>0)age+=seconds;
        if(age>=DURATION){active=false;owner=null;}
      },
      drawLabel(ctx,player,currentStage){
        if(!active||owner!==player||stage!==currentStage||player.hp<=0||player.s==='fallen')return;
        const y=player.y-70-18*Math.min(1,age/DURATION);
        ctx.save();ctx.globalCompositeOperation='source-over';
        ctx.globalAlpha=Math.min(1,age/.08)*Math.min(1,Math.max(0,(DURATION-age)/.4));
        // The game text atlas reads the leading number as font size.
        ctx.font='24px "Cinzel", Georgia, serif';ctx.textAlign='center';ctx.textBaseline='middle';
        ctx.fillStyle=demonic?'#1d092b':'#241707';
        ctx.fillText(label,player.x-1,y-1);ctx.fillText(label,player.x+1,y-1);
        ctx.fillText(label,player.x-1,y+1);ctx.fillText(label,player.x+1,y+1);
        ctx.fillStyle=demonic?'#e5b4ff':'#ffe6a3';ctx.fillText(label,player.x,y);
        ctx.restore();
      },
      draw(ctx,player,currentStage,front,reduced){
        if(!active||owner!==player||stage!==currentStage||player.hp<=0||player.s==='fallen')return;
        const texture=prepare(demonic);if(!texture)return;
        const t=age,px=player.x,foot=player.y+18;
        const rise=Math.min(1,t/.065),tail=Math.max(0,1-t/DURATION);
        ctx.save();ctx.globalCompositeOperation='lighter';
        if(!front){
          const p=Math.min(1,t/.65),r=65+170*(1-Math.pow(1-p,3));
          stamp(ctx,texture,CELLS.ring,px,foot,r*strength,r*.5*strength,rise*Math.pow(1-p,1.15)*.95);
          const p2=Math.max(0,Math.min(1,(t-.1)/.7));
          if(t>.1&&!reduced)stamp(ctx,texture,CELLS.ring,px,foot,60+145*p2,(60+145*p2)*.5,(1-p2)*.38*Math.min(1,(t-.1)/.06));
          stamp(ctx,texture,CELLS.glow,px,player.y-12,150,210,rise*Math.exp(-t*3.8)*.7);
          const beam=rise*Math.exp(-Math.max(0,t-.09)*5);
          stamp(ctx,texture,CELLS.beam,px,foot-128,118*strength,280,beam*.9);
          if(!reduced){
            stamp(ctx,texture,CELLS.beam,px-26,foot-82,29,192,beam*.5);
            stamp(ctx,texture,CELLS.beam,px+26,foot-82,29,192,beam*.5);
          }
        }else{
          const flash=rise*Math.exp(-Math.max(0,t-.065)*13);
          stamp(ctx,texture,CELLS.flare,px,player.y-15,108,108,flash*.65);
          stamp(ctx,texture,CELLS.glow,px,player.y-14,66,98,flash*.34);
          const count=reduced?10:18;
          for(let i=0;i<count;i++){
            const delay=(i%5)*.025,pt=t-delay;if(pt<=0||pt>1.18)continue;
            const seed=(i*.61803398875)%1,ang=i*2.39996323;
            const spread=(24+seed*36)*(1-Math.exp(-pt*8));
            const sx=px+Math.cos(ang)*spread*(1-pt*.3);
            const sy=foot-10-Math.sin(seed*Math.PI)*10-pt*(48+seed*60);
            const a=Math.min(1,pt/.08)*Math.pow(Math.max(0,1-pt/1.18),1.2)*.88;
            const size=8+seed*7;
            stamp(ctx,texture,CELLS.spark,sx,sy,size,size*(1.1+seed*.7),a);
          }
          stamp(ctx,texture,CELLS.glow,px,foot,110,36,rise*tail*tail*.25);
        }
        ctx.globalCompositeOperation='source-over';ctx.restore();
      }
    };
  }
  root.LevelUpVfx=Object.freeze({create});
})(window);
