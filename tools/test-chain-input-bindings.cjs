const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
for(const file of ['game.html','game-easy-test.html']){
  const src=fs.readFileSync(file,'utf8');
  const config=src.slice(src.indexOf('let BINDS={'),src.indexOf('const BIND_NAMES='));
  const boot=src.slice(src.indexOf('// 게임 시작 시 자동 불러오기'),src.indexOf('// 첫 진입이나 손상된 설정에서도'));
  function load(binds={},binds2={}){
    const c={localStorage:{getItem:()=>JSON.stringify({binds,binds2,opt:{sfxVol:37}})},OPT:{},BGM:{setVol(){}},saveSettings(){},applyUIScale(){},showPH(){},_L:ko=>ko,window:{},K:{},MB:{},MBjust:{},KH:{}};
    vm.createContext(c);vm.runInContext(config+boot+';globalThis.binds=BINDS;globalThis.alt=BINDS2;',c);
    for(const name of ['_chkAct','_chkJust','_chkHeld','isAct','isJust','isHeld']){
      const line=src.split('\n').find(s=>s.startsWith('function '+name+'('));
      assert.ok(line,name);vm.runInContext(line,c);
    }
    return c;
  }
  for(const key of ['mouse0','KeyE'])for(const secondary of [false,true]){
    const c=load(secondary?{}:{charge:key},secondary?{charge:key}:{});
    assert.equal(c.binds.charge,'ShiftLeft',file+' repairs conflicting primary '+key);
    assert.equal(c.alt.charge,null,file+' clears conflicting alternate '+key);
    if(key==='mouse0'){c.MB[0]=true;c.MBjust[0]=true}else{c.K.KeyE=true;c.KH.KeyE=true}
    assert.equal(c.isAct('charge'),false);assert.equal(c.isHeld('charge'),false);assert.equal(c.isJust('charge'),false);
    assert.equal(c.isAct(key==='mouse0'?'weapon':'shield'),true,'original attack remains available');
    c.K.ShiftLeft=true;c.KH.ShiftLeft=true;assert.equal(c.isAct('charge'),true);assert.equal(c.isHeld('charge'),true);assert.equal(c.isJust('charge'),true);
    assert.equal(c.OPT.sfxVol,37,'unrelated settings retained');
  }
  const custom=load({charge:'KeyZ'},{charge:'KeyX'});
  assert.equal(custom.binds.charge,'KeyZ');assert.equal(custom.alt.charge,'KeyX');
  const alternateAttack=load({charge:'KeyV'},{weapon:'KeyV'});
  assert.equal(alternateAttack.binds.charge,'ShiftLeft');assert.equal(alternateAttack.alt.weapon,'KeyV');
  const blockedFallback=load({charge:'mouse0'},{shield:'ShiftLeft'});
  assert.equal(blockedFallback.binds.charge,null,'repair must not introduce another collision');
  for(const [action,key,alt] of [['charge','mouse0',false],['charge','KeyE',true],['weapon','KeyZ',false],['shield','KeyX',true]]){
    assert.equal(custom._setInputBinding(action,key,alt),false,'reject collision in either direction');
  }
  assert.equal(custom._setInputBinding('charge','KeyC',true),true);assert.equal(custom.alt.charge,'KeyC');
  // Execute the real preset loader too: old presets must not restore the collision.
  custom.localStorage.getItem=()=>JSON.stringify({binds:{charge:'KeyE'},binds2:{charge:'mouse0'}});
  custom.$=()=>({style:{},textContent:''});custom.setTimeout=()=>{};custom.syncSettingsUI=()=>{};custom.renderSettings=()=>{};custom._T=x=>x;
  vm.runInContext(src.slice(src.indexOf('function _loadPreset(slot){'),src.indexOf("$('saveP1').onclick="))+';_loadPreset(1);',custom);
  assert.equal(custom.binds.charge,'ShiftLeft');assert.equal(custom.alt.charge,null,'preset repair');
  // Both actual settings listeners must route through conflict validation.
  assert.ok(src.includes('_setInputBinding(listeningBind,e.code,_listenAlt);'));
  assert.ok(src.includes("_setInputBinding(listeningBind,'mouse'+e.button,_listenAlt);"));
  console.log('PASS '+file+': old settings, E/LMB, Shift, alternate keys, custom keys, rebind collision');
}
