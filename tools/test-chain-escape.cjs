const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
for(const file of ['game.html','game-easy-test.html']){
  const src=fs.readFileSync(file,'utf8');
  const body=src.slice(src.indexOf("  case 'stagger':{"),src.indexOf('// ═══ 보스 몸통 충돌'));
  const cases=body.slice(0,body.lastIndexOf('  }'));
  for(const state of ['stagger','pStun'])for(const binding of ['ShiftLeft','mouse0']){
    const c={P:{s:state,st2:480,poise:0,poiseR:9,_bdTrigger:null},K:{ShiftLeft:true},_dashHold:true,_harpActive:false,_dashActive:false,_gameFrame:0,
      isJust:a=>a==='charge'&&binding==='ShiftLeft',_canBladeDash:()=>false,addTxt(){},_T:x=>x};
    vm.runInNewContext('switch(P.s){'+cases+'}',c);
    assert.equal(c.P.s,'idle',file+' '+state+' '+binding);
    if(state==='pStun'){assert.equal(c.P.poise,4);assert.equal(c.P.poiseR,0)}
  }
  const blocked={P:{s:'pStun',st2:480,poise:0,poiseR:0,_bdTrigger:null},K:{ShiftLeft:true},_dashHold:false,_harpActive:false,_dashActive:false,_gameFrame:0,isJust:()=>false,_canBladeDash:()=>false};
  vm.runInNewContext('switch(P.s){'+cases+'}',blocked);assert.equal(blocked.P.s,'pStun','no armed chain cannot escape for free');
}
console.log('PASS actual stagger/pStun state handlers: default/remapped Shift and unavailable chain.');
