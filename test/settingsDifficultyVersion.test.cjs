const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

function productionSettings(file){
  const source=fs.readFileSync(path.join(__dirname,'..',file),'utf8');
  const defaults=source.match(/let OPT=\{[^\n]+/)[0];
  const save=source.match(/function saveSettings\(\)\{[^\n]+/)[0];
  const begin=source.indexOf('// 게임 시작 시 자동 불러오기');
  const end=source.indexOf('rz(); // Apply saved render scale after settings restoration',begin);
  assert.ok(begin>=0&&end>begin,'Production startup settings block must exist');
  return {defaults,save,load:source.slice(begin,end)};
}
function session(code,store,{load=true,getFails=false,setFails=false}={}){
  const ctx=vm.createContext({
    IS_ELECTRON:false,BINDS:{weapon:'mouse0',shield:'KeyE',beam:'mouse2',charge:'ShiftLeft',forge:'KeyG',parry:'KeyQ',stats:'KeyJ',storage:'KeyN'},BINDS2:{},
    _xbowEquipped:false,localStorage:{getItem(k){if(getFails)throw Error('blocked');return store.get(k)||null;},setItem(k,v){if(setFails)throw Error('quota');store.set(k,String(v));}},
    BGM:{setVol(){}},_repairChainAttackBinds(){},applyUIScale(){},ExoduserI18n:{resolveLanguage(v){return ['ko','en','es','ptbr'].includes(v)?v:null;}}
  });
  vm.runInContext(code.defaults+'\n'+code.save+(load?'\n'+code.load:'')+'\nglobalThis.opt=OPT;globalThis.save=saveSettings;',ctx);
  return ctx;
}
for(const file of ['game.html','game-easy-test.html']){
  const code=productionSettings(file);
  test(file+': fresh save and reboot keeps ordinary difficulty 5',()=>{
    const store=new Map();const fresh=session(code,store);assert.equal(fresh.opt.diff,5);
    fresh.save();const reopened=session(code,store);
    assert.equal(reopened.opt.diff,5,'New settings must not be mistaken for legacy difficulty and shifted to +5');
    assert.equal(JSON.parse(store.get('hellcave_settings')).opt.diffV2,1);
  });
  test(file+': every direct fresh settings writer includes the version marker',()=>{
    const store=new Map();const fresh=session(code,store,{load:false});
    delete fresh.opt.diffV2;fresh.opt.lang='ptbr';fresh.opt.sfxVol=37;fresh.BINDS.charge='KeyX';fresh.save();
    const data=JSON.parse(store.get('hellcave_settings'));
    assert.equal(data.opt.diffV2,1);assert.equal(data.opt.diff,5);assert.equal(data.opt.sfxVol,37);assert.equal(data.opt.lang,'ptbr');assert.equal(data.binds.charge,'KeyX');
    assert.equal(session(code,store).opt.diff,5);
  });
  test(file+': markerless legacy difficulty 0 through 5 migrates exactly once',()=>{
    for(let old=0;old<=5;old++){
      const store=new Map([['hellcave_settings',JSON.stringify({opt:{diff:old,lang:'es',sfxVol:37}})]]);
      const first=session(code,store);assert.equal(first.opt.diff,old+5);assert.equal(first.opt.diffV2,1);
      const second=session(code,store);assert.equal(second.opt.diff,old+5);assert.equal(second.opt.lang,'es');assert.equal(second.opt.sfxVol,37);
    }
  });
  test(file+': modern difficulty 0 through 10 is preserved on both boots',()=>{
    for(let diff=0;diff<=10;diff++){
      const store=new Map([['hellcave_settings',JSON.stringify({opt:{diff,diffV2:1,lang:'ptbr',resScale:85},binds:{charge:'KeyX'}})]]);
      for(let boot=0;boot<2;boot++){const live=session(code,store);assert.equal(live.opt.diff,diff);assert.equal(live.opt.resScale,85);assert.equal(live.opt.lang,'ptbr');assert.equal(live.BINDS.charge,'KeyX');}
    }
  });
  test(file+': settings without a stored difficulty retain fresh default',()=>{
    for(const data of [{opt:{lang:'es'}},{binds:{charge:'KeyX'}},{opt:{diff:null,lang:'es'}}]){
      const store=new Map([['hellcave_settings',JSON.stringify(data)]]);
      const live=session(code,store);assert.equal(live.opt.diff,5);live.save();assert.equal(session(code,store).opt.diff,5);
    }
  });
  test(file+': malformed or unavailable storage retains defaults without throwing',()=>{
    for(const options of [{},{getFails:true},{setFails:true}]){
      const store=new Map([['hellcave_settings','{broken']]);
      const live=session(code,store,options);assert.equal(live.opt.diff,5);assert.doesNotThrow(()=>live.save());assert.equal(live.opt.diffV2,1);
    }
  });
  test(file+': failed persistence keeps the in-memory version marker and difficulty',()=>{
    const store=new Map();const live=session(code,store,{setFails:true});delete live.opt.diffV2;
    assert.doesNotThrow(()=>live.save());assert.equal(live.opt.diffV2,1);assert.equal(live.opt.diff,5);assert.equal(store.has('hellcave_settings'),false);
  });
}
