import re

with open('game.html', 'r', encoding='utf-8') as f:
    content = f.read()

old = """    // \u2500\u2500 \uad6c\uc6b8 \uc804\uc6a9 \ub80c\ub354 \u2500\u2500
    if(e._isGhoul){
      const gt=GHOUL_DEFS[e.etype]||GHOUL_DEFS[101];
      const _gT=_now/1000;
      e._ghoulT=(e._ghoulT||0)+_dtSp;
      const _gBob=Math.sin(_gT*2.5+e.x*.03)*2; // \ubbf8\uc138 \ud754\ub4e4\ub9bc
      const _gLean=Math.sin(_gT*1.8)*.15; // \ube44\ud2c0\uac70\ub9bc
      // \uadf8\ub9bc\uc790
      X.globalAlpha=.2;X.fillStyle='#000';X.beginPath();
      X.ellipse(e.x,e.y+e.r*.6,e.r*1.1,e.r*.25,0,0,Math.PI*2);X.fill();
      // \ubcf8\uccb4 \u2014 \uc5b4\ub450\uc6b4 \uc778\uccb4\ud615
      X.save();X.translate(e.x,e.y+_gBob);X.rotate(_gLean);
      // \ubab8\ud1b5
      X.globalAlpha=.85;X.fillStyle=gt.col;
      X.beginPath();X.ellipse(0,-e.r*.1,e.r*.7,e.r*.9,0,0,Math.PI*2);X.fill();
      // \uba38\ub9ac
      const _hR=e.r*.45;
      X.fillStyle=gt.col;X.beginPath();X.arc(0,-e.r*.9,_hR,0,Math.PI*2);X.fill();
      // \ub208 \u2014 \ubd89\uc740 \ube5b
      X.globalAlpha=.9;X.fillStyle='#ff2200';
      X.beginPath();X.arc(-_hR*.35,-e.r*.95,_hR*.2,0,Math.PI*2);X.fill();
      X.beginPath();X.arc(_hR*.35,-e.r*.95,_hR*.2,0,Math.PI*2);X.fill();
      X.fillStyle='#ffaa00';
      X.beginPath();X.arc(-_hR*.35,-e.r*.95,_hR*.1,0,Math.PI*2);X.fill();
      X.beginPath();X.arc(_hR*.35,-e.r*.95,_hR*.1,0,Math.PI*2);X.fill();
      // \uc785 \u2014 \ucc22\uc5b4\uc9c4 \uc785
      X.globalAlpha=.7;X.strokeStyle='#331100';X.lineWidth=1.5;
      X.beginPath();X.moveTo(-_hR*.4,-e.r*.75);
      X.quadraticCurveTo(0,-e.r*.65+Math.sin(_gT*4)*2,_hR*.4,-e.r*.75);X.stroke();
      // \ud314 \u2014 \ub298\uc5b4\uc9c4 \uc591\ud314
      X.globalAlpha=.6;X.strokeStyle=gt.col;X.lineWidth=e.r*.2;X.lineCap='round';
      const _armAng=Math.sin(_gT*3)*.3;
      X.beginPath();X.moveTo(-e.r*.5,0);X.lineTo(-e.r*1.1,e.r*.4+Math.sin(_gT*2.2)*4);X.stroke();
      X.beginPath();X.moveTo(e.r*.5,0);X.lineTo(e.r*1.1,e.r*.4+Math.sin(_gT*2.2+1)*4);X.stroke();
      // \ubd80\ud328 \uc5bc\ub8e9
      X.globalAlpha=.3;X.fillStyle='#332211';
      X.beginPath();X.arc(e.r*.2,e.r*.1,e.r*.15,0,Math.PI*2);X.fill();
      X.beginPath();X.arc(-e.r*.15,-e.r*.3,e.r*.1,0,Math.PI*2);X.fill();
      X.restore();
      // \uc548\uac1c \ud30c\ud2f0\ud074 (\uac04\ud5d0\uc801)
      if(Math.random()<.03*_dtSp){const pa=Math.random()*Math.PI*2;poolPart(e.x+Math.cos(pa)*e.r,e.y+Math.sin(pa)*e.r,Math.cos(pa)*.5,-.5,'#445533',2,15)}
      X.globalAlpha=1;
      // HP\ubc14
      {const bw=e.r*2+6,bx=e.x-bw/2;let by=e.y-e.r-14;
      if(e.hp<e.mhp){X.fillStyle='rgba(0,0,0,.6)';X.fillRect(bx,by,bw,4);X.fillStyle='#667744';X.fillRect(bx,by,bw*(e.hp/e.mhp),4);by-=5}
      if(e.eShield>0&&e.eShieldMax>0){X.fillStyle='rgba(0,0,0,.5)';X.fillRect(bx,by,bw,3);X.fillStyle='#44aaff';X.fillRect(bx,by,bw*(e.eShield/e.eShieldMax),3);by-=4}
      if(e.stunned>0){const _grMax=90;X.fillStyle='rgba(0,0,0,.5)';X.fillRect(bx,by,bw,3);X.fillStyle='#ff8800';X.fillRect(bx,by,bw*Math.min(1,e.stunned/_grMax),3);by-=4}
      if(e.maxPoise<Infinity&&e.maxPoise>0){X.fillStyle='rgba(0,0,0,.5)';X.fillRect(bx,by,bw,3);X.fillStyle='#ffdd44';X.fillRect(bx,by,bw*(e.poise/e.maxPoise),3)}}
      continue;
    }"""

new = """    // \u2500\u2500 \uad6c\uc6b8 \uc804\uc6a9 \ub80c\ub354 (3\uc885 \ucc28\ubcc4\ud654) \u2500\u2500
    if(e._isGhoul){
      const gt=GHOUL_DEFS[e.etype]||GHOUL_DEFS[101];
      const _gT=_now/1000;
      e._ghoulT=(e._ghoulT||0)+_dtSp;
      // \uadf8\ub9bc\uc790 (\uacf5\ud1b5)
      X.globalAlpha=.2;X.fillStyle='#000';X.beginPath();
      X.ellipse(e.x,e.y+e.r*.6,e.r*(e.etype===100?1.4:1.1),e.r*.25,0,0,Math.PI*2);X.fill();

      if(e.etype===100){
        // \u2550\u2550\u2550 \uc18c\ud615 \uad6c\uc6b8: \ub124 \ubc1c \uc57c\uc218\ud615, \ube60\ub974\uace0 \ub0a0\ub825 \u2550\u2550\u2550
        const _gBob=Math.sin(_gT*4+e.x*.05)*1.5;
        const _gScurry=Math.sin(_gT*6)*.12;
        X.save();X.translate(e.x,e.y+_gBob);X.rotate(_gScurry);
        X.globalAlpha=.85;X.fillStyle='#778844';
        X.beginPath();X.ellipse(0,e.r*.05,e.r*1.0,e.r*.5,0,0,Math.PI*2);X.fill();
        X.globalAlpha=.5;X.strokeStyle='#aabb88';X.lineWidth=1;
        for(let _sp2=-.6;_sp2<=.6;_sp2+=.3){X.beginPath();X.moveTo(e.r*_sp2,-e.r*.3);X.lineTo(e.r*_sp2,-e.r*.55);X.stroke()}
        X.globalAlpha=.85;X.fillStyle='#889944';
        X.beginPath();X.ellipse(e.r*.7,-e.r*.15,e.r*.4,e.r*.35,-.2,0,Math.PI*2);X.fill();
        X.globalAlpha=.95;X.fillStyle='#ffcc00';
        X.beginPath();X.arc(e.r*.85,-e.r*.25,e.r*.1,0,Math.PI*2);X.fill();
        X.beginPath();X.arc(e.r*.85,-e.r*.05,e.r*.1,0,Math.PI*2);X.fill();
        X.fillStyle='#220000';
        X.beginPath();X.arc(e.r*.87,-e.r*.25,e.r*.04,0,Math.PI*2);X.fill();
        X.beginPath();X.arc(e.r*.87,-e.r*.05,e.r*.04,0,Math.PI*2);X.fill();
        X.globalAlpha=.8;X.strokeStyle='#443300';X.lineWidth=1;
        X.beginPath();X.moveTo(e.r*.95,-e.r*.2);X.lineTo(e.r*1.15,-e.r*.15);X.stroke();
        X.fillStyle='#ffffcc';
        for(let t=0;t<3;t++){X.beginPath();X.arc(e.r*(1.0+t*.05),-e.r*(.2-t*.03),e.r*.04,0,Math.PI*2);X.fill()}
        X.globalAlpha=.7;X.strokeStyle='#667733';X.lineWidth=e.r*.18;X.lineCap='round';
        const _legSpd=_gT*8;
        X.beginPath();X.moveTo(-e.r*.6,e.r*.3);X.lineTo(-e.r*.8,e.r*.7+Math.sin(_legSpd)*3);X.stroke();
        X.beginPath();X.moveTo(-e.r*.2,e.r*.3);X.lineTo(-e.r*.35,e.r*.7+Math.sin(_legSpd+Math.PI)*3);X.stroke();
        X.beginPath();X.moveTo(e.r*.2,e.r*.3);X.lineTo(e.r*.35,e.r*.7+Math.sin(_legSpd+Math.PI*.5)*3);X.stroke();
        X.beginPath();X.moveTo(e.r*.6,e.r*.3);X.lineTo(e.r*.8,e.r*.7+Math.sin(_legSpd+Math.PI*1.5)*3);X.stroke();
        X.globalAlpha=.5;X.strokeStyle='#556622';X.lineWidth=e.r*.12;
        X.beginPath();X.moveTo(-e.r*.9,0);X.quadraticCurveTo(-e.r*1.3,Math.sin(_gT*3)*4,-e.r*1.1,-e.r*.2);X.stroke();
        X.restore();
        if(Math.random()<.05*_dtSp){poolPart(e.x+Math.cos(e.facing)*e.r,e.y+Math.sin(e.facing)*e.r,Math.random()*2-1,-.3,'#887744',1.5,8)}

      }else if(e.etype===102){
        // \u2550\u2550\u2550 \ub300\ud615 \uad6c\uc6b8: \uac70\ub300 \uc721\uc911 \uad34\ubb3c, \ubf08 \ub3cc\uae30+\ub450\uaebc\uc6b4 \ud314 \u2550\u2550\u2550
        const _gBob=Math.sin(_gT*1.5+e.x*.02)*3;
        const _gLean=Math.sin(_gT*1.0)*.08;
        X.save();X.translate(e.x,e.y+_gBob);X.rotate(_gLean);
        X.globalAlpha=.9;
        const _bgrd=X.createRadialGradient(-e.r*.2,-e.r*.2,0,0,0,e.r*1.1);
        _bgrd.addColorStop(0,'#556633');_bgrd.addColorStop(.5,'#445522');_bgrd.addColorStop(1,'#2a3311');
        X.fillStyle=_bgrd;
        X.beginPath();
        for(let a=0;a<Math.PI*2;a+=.2){
          const _br=e.r*(.85+Math.sin(a*3+e.x*.1)*.12+Math.sin(a*5)*.06);
          const px=Math.cos(a)*_br*.75,py=Math.sin(a)*_br*1.05-e.r*.05;
          a<.01?X.moveTo(px,py):X.lineTo(px,py);
        }X.closePath();X.fill();
        X.globalAlpha=.7;X.fillStyle='#ccbb88';
        X.beginPath();X.moveTo(-e.r*.6,-e.r*.6);X.lineTo(-e.r*.75,-e.r*1.15);X.lineTo(-e.r*.45,-e.r*.7);X.fill();
        X.beginPath();X.moveTo(e.r*.6,-e.r*.6);X.lineTo(e.r*.75,-e.r*1.15);X.lineTo(e.r*.45,-e.r*.7);X.fill();
        X.fillStyle='#aa9966';
        for(let _sp3=0;_sp3<3;_sp3++){const sx=e.r*(-.2+_sp3*.2);X.beginPath();X.moveTo(sx,-e.r*.8);X.lineTo(sx-e.r*.06,-e.r*1.05);X.lineTo(sx+e.r*.06,-e.r*1.05);X.fill()}
        const _hR2=e.r*.32;
        X.globalAlpha=.85;X.fillStyle='#4a5520';X.beginPath();X.arc(0,-e.r*1.0,_hR2,0,Math.PI*2);X.fill();
        X.globalAlpha=.5;X.fillStyle='#bbaa77';
        X.beginPath();X.ellipse(_hR2*.3,-e.r*1.05,_hR2*.35,_hR2*.25,.3,0,Math.PI*2);X.fill();
        X.globalAlpha=.95;X.fillStyle='#ff1100';
        X.beginPath();X.arc(-_hR2*.4,-e.r*1.05,_hR2*.25,0,Math.PI*2);X.fill();
        X.fillStyle='#ffdd00';
        X.beginPath();X.arc(-_hR2*.4,-e.r*1.05,_hR2*.12,0,Math.PI*2);X.fill();
        X.globalAlpha=.8;X.fillStyle='#1a0800';
        X.beginPath();X.ellipse(0,-e.r*.82,_hR2*.5,_hR2*.25+Math.sin(_gT*2)*.06*_hR2,0,0,Math.PI*2);X.fill();
        X.fillStyle='#ffffcc';
        for(let t=-2;t<=2;t++){X.beginPath();X.arc(_hR2*.15*t,-e.r*.82-_hR2*.2,_hR2*.08,0,Math.PI*2);X.fill()}
        X.globalAlpha=.7;X.strokeStyle='#3d4a1a';X.lineWidth=e.r*.35;X.lineCap='round';
        X.beginPath();X.moveTo(-e.r*.65,-e.r*.1);
        X.quadraticCurveTo(-e.r*1.2,e.r*.3,-e.r*1.0,e.r*.9+Math.sin(_gT*1.5)*3);X.stroke();
        X.beginPath();X.moveTo(e.r*.65,-e.r*.1);
        X.quadraticCurveTo(e.r*1.2,e.r*.3,e.r*1.0,e.r*.9+Math.sin(_gT*1.5+1.5)*3);X.stroke();
        X.globalAlpha=.75;X.fillStyle='#3d4a1a';
        X.beginPath();X.arc(-e.r*1.0,e.r*.9,e.r*.22,0,Math.PI*2);X.fill();
        X.beginPath();X.arc(e.r*1.0,e.r*.9,e.r*.22,0,Math.PI*2);X.fill();
        X.fillStyle='#ccbb88';
        for(let c=0;c<3;c++){const ca=-.3+c*.3;
          X.beginPath();X.moveTo(-e.r*1.0+Math.cos(ca)*e.r*.2,e.r*.9+Math.sin(ca)*e.r*.2);X.lineTo(-e.r*1.0+Math.cos(ca)*e.r*.35,e.r*.9+Math.sin(ca)*e.r*.35);X.lineTo(-e.r*1.0+Math.cos(ca+.15)*e.r*.2,e.r*.9+Math.sin(ca+.15)*e.r*.2);X.fill();
          X.beginPath();X.moveTo(e.r*1.0+Math.cos(Math.PI-ca)*e.r*.2,e.r*.9+Math.sin(Math.PI-ca)*e.r*.2);X.lineTo(e.r*1.0+Math.cos(Math.PI-ca)*e.r*.35,e.r*.9+Math.sin(Math.PI-ca)*e.r*.35);X.lineTo(e.r*1.0+Math.cos(Math.PI-ca-.15)*e.r*.2,e.r*.9+Math.sin(Math.PI-ca-.15)*e.r*.2);X.fill()}
        X.globalAlpha=.25;X.fillStyle='#221100';
        X.beginPath();X.arc(e.r*.3,e.r*.2,e.r*.2,0,Math.PI*2);X.fill();
        X.beginPath();X.arc(-e.r*.25,-e.r*.35,e.r*.18,0,Math.PI*2);X.fill();
        X.beginPath();X.arc(e.r*.1,e.r*.5,e.r*.15,0,Math.PI*2);X.fill();
        X.restore();
        if(Math.random()<.04*_dtSp){const pa=Math.random()*Math.PI*2;poolPart(e.x+Math.cos(pa)*e.r*1.2,e.y+Math.sin(pa)*e.r,Math.cos(pa)*.3,-1,'#334422',3+Math.random()*2,20)}

      }else{
        // \u2550\u2550\u2550 \uad6c\uc6b8 \uc911\ud615 (101): \ud45c\uc900 \ube44\ud2c0\uac70\ub9ac\ub294 \uc5b8\ub370\ub4dc \u2550\u2550\u2550
        const _gBob=Math.sin(_gT*2.5+e.x*.03)*2;
        const _gLean=Math.sin(_gT*1.8)*.15;
        X.save();X.translate(e.x,e.y+_gBob);X.rotate(_gLean);
        X.globalAlpha=.85;X.fillStyle=gt.col;
        X.beginPath();X.ellipse(0,-e.r*.1,e.r*.7,e.r*.9,0,0,Math.PI*2);X.fill();
        X.globalAlpha=.3;X.strokeStyle='#aabb88';X.lineWidth=1;
        for(let rb=-2;rb<=2;rb++){X.beginPath();X.ellipse(0,-e.r*.1+rb*e.r*.15,e.r*.55,e.r*.08,rb*.1,0,Math.PI);X.stroke()}
        const _hR=e.r*.45;
        X.globalAlpha=.85;X.fillStyle=gt.col;X.beginPath();X.arc(0,-e.r*.9,_hR,0,Math.PI*2);X.fill();
        X.globalAlpha=.9;X.fillStyle='#ff2200';
        X.beginPath();X.arc(-_hR*.35,-e.r*.95,_hR*.2,0,Math.PI*2);X.fill();
        X.beginPath();X.arc(_hR*.35,-e.r*.95,_hR*.2,0,Math.PI*2);X.fill();
        X.fillStyle='#ffaa00';
        X.beginPath();X.arc(-_hR*.35,-e.r*.95,_hR*.1,0,Math.PI*2);X.fill();
        X.beginPath();X.arc(_hR*.35,-e.r*.95,_hR*.1,0,Math.PI*2);X.fill();
        X.globalAlpha=.7;X.strokeStyle='#331100';X.lineWidth=1.5;
        X.beginPath();X.moveTo(-_hR*.4,-e.r*.75);
        X.quadraticCurveTo(0,-e.r*.65+Math.sin(_gT*4)*2,_hR*.4,-e.r*.75);X.stroke();
        X.globalAlpha=.6;X.strokeStyle=gt.col;X.lineWidth=e.r*.2;X.lineCap='round';
        X.beginPath();X.moveTo(-e.r*.5,0);X.lineTo(-e.r*1.1,e.r*.4+Math.sin(_gT*2.2)*4);X.stroke();
        X.beginPath();X.moveTo(e.r*.5,0);X.lineTo(e.r*1.1,e.r*.4+Math.sin(_gT*2.2+1)*4);X.stroke();
        X.globalAlpha=.3;X.fillStyle='#332211';
        X.beginPath();X.arc(e.r*.2,e.r*.1,e.r*.15,0,Math.PI*2);X.fill();
        X.beginPath();X.arc(-e.r*.15,-e.r*.3,e.r*.1,0,Math.PI*2);X.fill();
        X.restore();
        if(Math.random()<.03*_dtSp){const pa=Math.random()*Math.PI*2;poolPart(e.x+Math.cos(pa)*e.r,e.y+Math.sin(pa)*e.r,Math.cos(pa)*.5,-.5,'#445533',2,15)}
      }

      X.globalAlpha=1;
      // HP\ubc14 (\uacf5\ud1b5)
      {const bw=e.r*2+6,bx=e.x-bw/2;let by=e.y-e.r-14;
      if(e.hp<e.mhp){X.fillStyle='rgba(0,0,0,.6)';X.fillRect(bx,by,bw,4);X.fillStyle=gt.col;X.fillRect(bx,by,bw*(e.hp/e.mhp),4);by-=5}
      if(e.eShield>0&&e.eShieldMax>0){X.fillStyle='rgba(0,0,0,.5)';X.fillRect(bx,by,bw,3);X.fillStyle='#44aaff';X.fillRect(bx,by,bw*(e.eShield/e.eShieldMax),3);by-=4}
      if(e.stunned>0){const _grMax=90;X.fillStyle='rgba(0,0,0,.5)';X.fillRect(bx,by,bw,3);X.fillStyle='#ff8800';X.fillRect(bx,by,bw*Math.min(1,e.stunned/_grMax),3);by-=4}
      if(e.maxPoise<Infinity&&e.maxPoise>0){X.fillStyle='rgba(0,0,0,.5)';X.fillRect(bx,by,bw,3);X.fillStyle='#ffdd44';X.fillRect(bx,by,bw*(e.poise/e.maxPoise),3)}}
      continue;
    }"""

if old in content:
    content = content.replace(old, new, 1)
    with open('game.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print('OK: replaced successfully')
else:
    print('ERROR: old string not found')
