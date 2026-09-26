const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {createCanvas,loadImage}=require('canvas');

for(const file of ['game.html','game-easy-test.html']){
  const html=fs.readFileSync(path.join(__dirname,'..',file),'utf8');
  test(`${file}: fire-rain impact starts one rising flame animation`,()=>{
    const a=html.indexOf('  // ═══ 화염비 업데이트 ═══');
    const b=html.indexOf('  // ═══ 전격 격자 업데이트 ═══',a);
    assert.ok(a>=0&&b>a);
    const calls=[];
    const G={_fireRains:[{x:100,y:100,r:90,t:4,delay:5,dmg:10,el:1,hit:false}]};
    const scope={G,sp:1,P:{x:2000,y:2000,r:12,iframes:0,s:'idle'},dst:()=>1000,SFX:{detonate(){}},shake(){},poolPart(){},playVFXAng:(...args)=>calls.push(args),Math};
    vm.runInNewContext(html.slice(a,b),scope);
    assert.equal(calls.length,1,'impact must create exactly one flame animation');
    assert.equal(calls[0][0],'lava_erupt');
    assert.equal(calls[0][1],100);
    vm.runInNewContext(html.slice(a,b),scope);
    assert.equal(calls.length,1,'later damage frames must not restart the animation');
  });
  test(`${file}: fire-rain warning draws a red magic circle before impact`,async()=>{
    const a=html.indexOf('  // ══ 화염비 렌더 ══');
    const b=html.indexOf('  // ══ 전격 격자 렌더 ══',a);
    assert.ok(a>=0&&b>a);
    const image=await loadImage(path.join(__dirname,'..','img','vfx_pentagram_red.png'));
    const X=createCanvas(300,300).getContext('2d'),draw=X.drawImage.bind(X),drawn=[];
    X.drawImage=(...args)=>{drawn.push(args);draw(...args)};
    const G={_fireRains:[{x:150,y:150,r:70,t:30,delay:60,hit:false}]};
    vm.runInNewContext(html.slice(a,b),{X,G,_pentaRed:image,_now:170,Math});
    assert.ok(drawn.some(args=>args[0]===image),'warning must show the red magic circle');
    assert.equal(X.globalAlpha,1);
  });
}

test('elite ground warning draws the existing red magic circle inside its damage radius',async()=>{
  const html=fs.readFileSync(path.join(__dirname,'..','game.html'),'utf8');
  const a=html.indexOf('function _drawEliteZoneTelegraph('),b=html.indexOf('function _drawEliteBoltTelegraph(',a);
  assert.ok(a>=0&&b>a);
  const image=await loadImage(path.join(__dirname,'..','img','vfx_pentagram_red.png'));
  const X=createCanvas(300,300).getContext('2d'),draw=X.drawImage.bind(X),drawn=[];
  X.drawImage=(...args)=>{drawn.push(args);draw(...args)};
  const z={x:150,y:150,r:70,t:30,dur:60,kind:'burst',col:'#ff2438'};
  vm.runInNewContext(html.slice(a,b)+';_drawEliteZoneTelegraph(X,z,170)',{X,z,Math,_pentaRed:image});
  assert.ok(drawn.some(args=>args[0]===image),'warning must include the red magic circle asset');
  assert.equal(X.globalAlpha,1);
});

test('elite impact starts a rising flame only for the red ground attacks',()=>{
  const html=fs.readFileSync(path.join(__dirname,'..','game.html'),'utf8');
  const a=html.indexOf('    if(e._eliteZones&&e._eliteZones.length){for(let zi=');
  const b=html.indexOf('    // M23 영혼포식:',a);
  assert.ok(a>=0&&b>a);
  const calls=[];
  const e={atk:10,_eliteZones:[{x:100,y:100,r:125,t:1,dur:54,kind:'burst',col:'#ff2438'}]};
  vm.runInNewContext(html.slice(a,b),{e,P:{x:2000,y:2000,r:12,iframes:0,s:'idle'},sp:1,dst:()=>1000,addParts(){},playVFXAng:(...args)=>calls.push(args),Math});
  assert.equal(calls.length,1);
  assert.equal(calls[0][0],'lava_erupt');
  assert.equal(e._eliteZones.length,0);
});
