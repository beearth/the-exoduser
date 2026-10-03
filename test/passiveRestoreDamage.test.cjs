// Actual restore statements and passive consumers with controlled combat leaves.
// No user saves, storage APIs, whole dbRestore, or native gameplay are executed.
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),acorn=require('acorn');
const root=path.resolve(__dirname,'..'),dir=process.env.EXODUSER_TEST_SOURCE_DIR||root;
const baselineDir=process.env.EXODUSER_TEST_BASELINE_DIR;
function extract(text){
  const expr=at=>{const n=acorn.parseExpressionAt(text,at,{ecmaVersion:'latest'});return text.slice(at,n.end)};
  const fn=name=>expr(text.indexOf('function '+name+'('));
  const restore=marker=>{const at=text.indexOf(marker);assert(at>=0,marker);
    const end=marker.includes('_d5')?text.indexOf('if(_d5.stats)',at):text.indexOf(';',at)+1;
    assert(end>at);const source=text.slice(at,end).trim();
    const ast=acorn.parse(source,{ecmaVersion:'latest'});assert.equal(ast.body.length,1);
    return source};
  const hit=acorn.parseExpressionAt(text,text.indexOf('function hitArc('),{ecmaVersion:'latest'});
  const weapon=hit.body.body.find(n=>n.type==='IfStatement'&&text.slice(n.test.start,n.test.end)==="type==='weapon'");
  assert(weapon);const weaponCode=text.slice(weapon.start,weapon.end);
  const magicAt=text.indexOf("~~(magicRef()*statInt()*pMagicMul()*_skMul('energyShot')");assert(magicAt>=0);
  return {normal:restore('if(d.passives)for('),demo:restore('if(_d5.passives){'),
    functions:['_passDmgSum','pAtkMul','pBowMul','pMagicMul','pXbowMul','pMeleeMul','pAtkCost','pBowCost','pMagicCost','pBowSpd','fireBow'].map(fn).join('\n'),
    weapon:'function weaponDamage(baseDmg){const type="weapon";'+weaponCode+';return baseDmg}',
    magic:'function magicDamage(){return '+expr(magicAt)+'}'};
}
function fixture(code,loader,passives){
  const noop=()=>{},c={PASSIVES:{pAtk:0,pHuman:0,pMelee:0,pMagic:0,pBow:0,pXbow:0,pDot:0,pDrop:0},
    d:{passives},_d5:{passives},P:{x:0,y:0,facing:0,_atkBon:0,_bowBon:0},G:{mats:2},pProjs:[],
    _eqAffix:()=>0,_eqImplicit:()=>0,_uEq:()=>0,magicRef:()=>100,statInt:()=>1,_skMul:()=>1,_fuseMul:()=>1,
    bowRef:()=>100,bw:()=>({btype:'crossbow'}),BOWTYPES:{crossbow:{range:1000}},
    pBowRange:()=>1,_autoBowSpec:()=>({range:1000,spd:13}),_getPProj:()=>({}),_gxFiring:0,
    playSample:noop,playSampleAt:noop,poolPart:noop,_r:()=>1,SFX:{bow:noop}};
  vm.createContext(c);vm.runInContext(code.functions+'\n'+code.weapon+'\n'+code.magic,c);
  vm.runInContext(code[loader],c);return c;
}
for(const file of ['game.html','game-easy-test.html']){
  const code=extract(fs.readFileSync(path.join(dir,file),'utf8'));
  const old=baselineDir?extract(fs.readFileSync(path.join(baselineDir,file),'utf8')):code;
  for(const loader of ['normal','demo']){
    for(const [label,value,rank] of [['number',9,9],['numeric string','9',9],['bad string','ab',0],
      ['missing',undefined,0],['null',null,0],['NaN',NaN,0],['signed decimal',-1.25,-1.25]]){
      test(file+' '+loader+' '+label+' reaches melee/bow/magic damage without NaN',()=>{
        const values={pAtk:value},before=JSON.stringify(values),c=fixture(code,loader,values);
        assert.equal(c.PASSIVES.pAtk,rank);assert.equal(JSON.stringify(values),before);
        const mul=(1+rank*.1)*.7;
        assert.equal(c.pAtkMul(),mul);assert.equal(c.pBowMul(),mul);assert.equal(c.pMagicMul(),mul*2);
        c.P._atkBon=7;assert.equal(c.weaponDamage(420),~~(420*mul)+7);assert.equal(c.P._atkBon,0);
        assert.equal(c.magicDamage(),~~(100*mul*2));
        assert.equal(c.fireBow(),true);assert.equal(c.pProjs[0].dmg,~~(100*mul*10)*3);
        assert.equal(c.G.mats,1);assert.equal(c.P._bowBon,0);
        if(label!=='bad string'){
          const b=fixture(old,loader,values);b.P._atkBon=7;
          assert.equal(c.weaponDamage(420)+7,b.weaponDamage(420));assert.equal(c.magicDamage(),b.magicDamage());
          b.fireBow();assert.equal(c.pProjs[0].dmg,b.pProjs[0].dmg);
        }
      });
    }
    test(file+' '+loader+' independent type ranks and resource discount floors stay numeric',()=>{
      const c=fixture(code,loader,{pMelee:'2',pMagic:'3',pBow:'4',pXbow:'5',pHuman:'6',pAtk:'100'});
      assert.equal(c.pAtkMul(),(1+10+.3+.3)*.7);assert.equal(c.pBowMul(),(1+10+.3+.6)*.7);
      assert.equal(c.pMagicMul(false),(1+10+.3+.3)*.7);assert.equal(c.pMagicMul(),c.pMagicMul(false)*2);
      assert.equal(c.pXbowMul(),(1+10+.3+.25)*.7);assert.equal(c.pAtkCost(),.6);
      assert.equal(c.pBowCost(),.84);assert.equal(c.pMagicCost(),.88);
    });
    test(file+' '+loader+' existing unknown-key policy remains unchanged',()=>{
      const c=fixture(code,loader,{unknownPassive:'9',pAtk:0});
      assert.equal(Object.hasOwn(c.PASSIVES,'unknownPassive'),loader==='demo');
      if(loader==='demo')assert.equal(c.PASSIVES.unknownPassive,9);
      assert.equal(c.pAtkMul(),.7);
    });
  }
}
