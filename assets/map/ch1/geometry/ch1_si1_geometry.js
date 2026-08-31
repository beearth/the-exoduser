(function(root){
  'use strict';

  const W=200,H=200;
  const regions=Object.freeze([
    {id:'start',label:'START THRESHOLD',center:[100,185]},
    {id:'south',label:'SOUTH WIDE ARENA',center:[115,158]},
    {id:'toxic',label:'TOXIC SIDE POCKET',center:[49,151]},
    {id:'cocoon',label:'COCOON BEND',center:[151,136]},
    {id:'central',label:'CENTRAL COMPRESSION',center:[86,110]},
    {id:'tree',label:'CORPSE TREE BASIN',center:[98,80]},
    {id:'north',label:'NORTH / BOSS APPROACH',center:[110,38]}
  ]);
  const landmarks=Object.freeze({
    start:[100,185],toxic:[49,151],cocoon:[151,136],camp:[49,122],
    altar:[151,91],tree:[83,80],gate:[100,33],bossCenter:[100,18]
  });
  const spine=Object.freeze([
    [100,190],[100,181],[108,171],[118,162],[130,149],[151,136],
    [139,128],[116,121],[88,111],[91,100],[98,94],[103,58],
    [119,45],[110,34],[100,18]
  ]);
  const widthSamples=Object.freeze([
    {id:'start',x:100,y:185,min:25,max:35},
    {id:'south',x:115,y:160,min:65,max:90},
    {id:'central',x:83,y:104,min:30,max:45},
    {id:'tree',x:100,y:78,min:55,max:90},
    {id:'north',x:113,y:39,min:25,max:40}
  ]);
  const bypassPaths=Object.freeze({
    left:Object.freeze([[93,99],[75,96],[67,85],[68,69],[90,57],[103,56]]),
    right:Object.freeze([[94,99],[119,96],[133,84],[128,68],[105,56]])
  });

  function ellipse(mask,cx,cy,rx,ry,value=1){
    const x0=Math.max(2,Math.floor(cx-rx)),x1=Math.min(W-3,Math.ceil(cx+rx));
    const y0=Math.max(2,Math.floor(cy-ry)),y1=Math.min(H-3,Math.ceil(cy+ry));
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
      const dx=(x-cx)/rx,dy=(y-cy)/ry;
      if(dx*dx+dy*dy<=1)mask[y*W+x]=value;
    }
  }
  function disk(mask,cx,cy,r,value=1){ellipse(mask,cx,cy,r,r,value)}
  function tube(mask,x0,y0,r0,x1,y1,r1){
    const dx=x1-x0,dy=y1-y0,n=Math.max(1,Math.ceil(Math.hypot(dx,dy)*1.5));
    for(let i=0;i<=n;i++){
      const t=i/n,e=t*t*(3-2*t);
      disk(mask,x0+dx*t,y0+dy*t,r0+(r1-r0)*e,1);
    }
  }
  function sealOuterBorder(mask){
    for(let x=0;x<W;x++){mask[x]=0;mask[(H-1)*W+x]=0}
    for(let y=0;y<H;y++){mask[y*W]=0;mask[y*W+W-1]=0}
  }
  function buildMask(){
    const m=new Uint8Array(W*H);

    // 1 START: 좁은 6시 threshold가 북쪽으로 점차 열린다.
    ellipse(m,100,188,15,9);tube(m,100,190,13,104,176,18);

    // 2 SOUTH: 중심을 동쪽으로 민 비대칭 bowl. 진입축과 진출축은 다르다.
    ellipse(m,115,158,40,22);ellipse(m,102,151,28,18);

    // 3 TOXIC: 서쪽으로 실제 바닥이 확장되는 한-neck side pocket.
    tube(m,79,154,9,62,151,8);ellipse(m,50,151,19,10);ellipse(m,38,156,10,7);

    // 4 COCOON: arena의 북동 출구가 hook을 만들고 다시 서쪽으로 꺾인다.
    tube(m,130,149,18,151,136,16);tube(m,151,136,16,139,128,15);
    tube(m,139,128,15,116,121,14);tube(m,116,121,14,88,111,14);

    // 5 CENTRAL: 전투 가능한 30~45t 폭의 압축부. camp pocket은 별도 서쪽 확장이다.
    tube(m,88,111,14,82,105,13);tube(m,82,105,13,91,99,14);
    tube(m,96,120,8,68,122,7);tube(m,68,122,7,58,119,6);
    ellipse(m,49,122,14,10);ellipse(m,40,116,9,7);

    // 6 TREE: 비대칭 basin. tree는 좌측에 치우치고 오른쪽 bypass가 더 넓고 길다.
    ellipse(m,98,80,43,25);ellipse(m,122,81,23,19);tube(m,91,99,16,98,94,18);
    // altar는 basin 우측의 별도 pocket이며 짧은 neck으로만 연결한다.
    tube(m,128,88,8,141,91,6);ellipse(m,151,91,11,15);ellipse(m,158,83,8,8);

    // 7 NORTH: basin 북동에서 빠져나와 두 번 offset한 뒤 gate로 수렴한다.
    tube(m,103,58,18,119,45,16);tube(m,119,45,16,110,34,14);
    tube(m,110,34,14,100,21,16);ellipse(m,100,18,20,13);

    sealOuterBorder(m);
    return m;
  }
  function buildRLE(){
    const mask=buildMask(),out=[];let v=mask[0]?1:2,count=1;
    for(let i=1;i<mask.length;i++){
      const nv=mask[i]?1:2;
      if(nv===v)count++;else{out.push(v,count);v=nv;count=1}
    }
    out.push(v,count);return out;
  }

  root.CH1_SI1_GEOMETRY=Object.freeze({
    stage:1,size:Object.freeze([W,H]),regions,landmarks,spine,widthSamples,bypassPaths,
    routeAnchors:Object.freeze({south:[115,158],central:[86,110],treeSouth:[93,101],treeNorth:[105,56]}),
    treeBlockRadius:9,
    treeBypasses:Object.freeze({left:{width:14,length:34},right:{width:31,length:57}}),
    buildMask,buildRLE
  });
})(typeof globalThis!=='undefined'?globalThis:this);
