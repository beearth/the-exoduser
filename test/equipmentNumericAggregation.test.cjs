// Actual equipment aggregators and attack reference functions; controlled gear/stat leaves.
// HP/MP/speed use exact applyStats statements, not the whole applyStats or native saves.
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),acorn=require('acorn');
const root=path.resolve(__dirname,'..'),dir=process.env.EXODUSER_TEST_SOURCE_DIR||root;
const baselineDir=process.env.EXODUSER_TEST_BASELINE_DIR;
const plain=x=>JSON.parse(JSON.stringify(x));
function extract(text){
  const node=name=>{const start=text.indexOf('function '+name+'(');assert(start>=0,name);
    return {start,n:acorn.parseExpressionAt(text,start,{ecmaVersion:'latest'})};};
  const fn=name=>{const {start,n}=node(name);return text.slice(start,n.end);};
  const {n:stats}=node('applyStats');
  const statement=predicate=>{const matches=stats.body.body.filter(predicate);assert.equal(matches.length,1);
    return text.slice(matches[0].start,matches[0].end);};
  const set=key=>statement(n=>n.type==='ExpressionStatement'&&n.expression.type==='AssignmentExpression'&&
    n.expression.operator==='='&&n.expression.left.object?.name==='P'&&n.expression.left.property?.name===key&&
    text.slice(n.expression.right.start,n.expression.right.end).includes({mhp:'_stgHp',speed:'s.dex',mmp:'s.int'}[key]));
  const hpTerms=statement(n=>n.type==='VariableDeclaration'&&n.declarations.some(d=>d.id?.name==='_afHpF'));
  const defs=['_eqAffixRebuild','_eqAffix','_eqImplicit','_slotFlatAtk','_eqStatRebuild','_eqStat','meleeRef','bowRef','magicRef'].map(fn).join('\n');
  return defs+'\nfunction statTerms(){const s={str:20,dex:20,int:20,vit:0};const _stgHp=300;const _totalBonusHp=0,_enhHp=0,_totalBonusMp=0,_enhMp=0;'+hpTerms+set('mhp')+set('speed')+set('mmp')+';return {mhp:P.mhp,speed:P.speed,mmp:P.mmp}}';
}
function fixture(code,equipped={}){
  const c={SLOT_NAMES:['weapon','bow','helmet','boots'],INV:{equipped},P:{baseAtk:15,hp:100,_weaponSeal:0},
    STATS:{str:20,dex:20,int:20},PASSIVES:{pMelee:0},
    wp:()=>equipped.weapon||{},bw:()=>equipped.bow||{},hm:()=>equipped.helmet||{},
    enhMulAtk:x=>x*3,_lvB:()=>2,pPredSpd:()=>0};
  vm.createContext(c);vm.runInContext('let _eqAffixCache=null,_eqStatCache=null;\n'+code,c);return c;
}
function slots(values,id='maxHPFlat'){return Object.fromEntries(values.map((value,i)=>[
  ['weapon','bow','helmet'][i],{affixes:[{id,value}]}]));}
const attacks=values=>{const affixes=values.map((value,i)=>({id:['sharpAtk','brutalAtk','ruinAtk'][i],value}));
  return {weapon:{atk:60,enh:2,bStr:5,affixes},bow:{atk:60,enh:2,bDex:5,affixes},helmet:{atk:60,enh:2,bInt:5,affixes}};};
for(const file of ['game.html','game-easy-test.html']){
  const code=extract(fs.readFileSync(path.join(dir,file),'utf8'));
  const old=baselineDir?extract(fs.readFileSync(path.join(baselineDir,file),'utf8')):code;
  for(const [name,values,expected] of [
    ['normal',[5,3,2],10],['numeric string',[5,'9',3],17],['bad string',[5,'ab',3],8],
    ['missing value',[5,undefined,3],8],['signed decimals',[5,-2,.25],3.25]]){
    test(file+' affix cache '+name+' sums numbers across slots and preserves HP',()=>{
      const c=fixture(code,slots(values));assert.equal(c._eqAffix('maxHPFlat'),expected);
      assert.equal(c.statTerms().mhp,~~(400+expected));assert.equal(c._eqAffix('absent'),0);
      if(name==='normal'||name==='signed decimals'){
        const b=fixture(old,slots(values));assert.deepEqual(plain(c.statTerms()),plain(b.statTerms()));
      }
    });
  }
  test(file+' affix rebuild replaces prior cache and preserves independent IDs',()=>{
    const c=fixture(code,{weapon:{affixes:[{id:'maxHPFlat',value:5},{id:'maxMPFlat',value:3}]}});
    assert.equal(c.statTerms().mhp,405);assert.equal(c.statTerms().mmp,143);
    c.INV.equipped.weapon.affixes=[{id:'maxHPFlat',value:'9'}];c._eqAffixRebuild();
    assert.equal(c._eqAffix('maxHPFlat'),9);assert.equal(c._eqAffix('maxMPFlat'),0);
  });
  for(const [name,values,sum] of [['normal',[10,5,3],18],['numeric string',[10,'9',3],22],['bad string',[10,'ab',3],13]]){
    test(file+' direct weapon affix '+name+' reaches all three complete references',()=>{
      const c=fixture(code,attacks(values));assert.equal(c._slotFlatAtk(c.wp()),sum);
      for(const ref of ['meleeRef','bowRef','magicRef'])assert.equal(c[ref](),108+sum);
      c.P._weaponSeal=1;for(const ref of ['meleeRef','bowRef','magicRef'])assert.equal(c[ref](),(108+sum)*.3);
      if(name==='normal'){const b=fixture(old,attacks(values));b.P._weaponSeal=1;
        for(const ref of ['meleeRef','bowRef','magicRef'])assert.equal(c[ref](),b[ref]());}
    });
  }
  test(file+' direct weapon aggregation excludes unrelated IDs and absent equipment',()=>{
    const c=fixture(code);assert.equal(c._slotFlatAtk(null),0);assert.equal(c._slotFlatAtk({}),0);
    assert.equal(c._slotFlatAtk({affixes:[{id:'defFlat',value:'bad'},{id:'sharpAtk',value:-2.5}]}),-2.5);
  });
  for(const [name,values,sum] of [['normal',[5,3,2],10],['numeric string',[5,'9',3],17],['bad string',[5,'ab',3],8]]){
    test(file+' implicit '+name+' preserves flat HP and exact speed consumer',()=>{
      const equipment=Object.fromEntries(values.map((value,i)=>[['weapon','bow','helmet'][i],{_implicitStat:'_iMaxHP',_implicitVal:value}]));
      equipment.boots={_implicitStat:'_iMovSpd',_implicitVal:name==='normal'?10:name==='numeric string'?'10':'ab'};
      const c=fixture(code,equipment);assert.equal(c._eqImplicit('_iMaxHP'),sum);
      const result=c.statTerms();assert.equal(result.mhp,400+sum);
      assert.equal(result.speed,(2.6+20*.005)*(name==='bad string'?1:1.1));assert.equal(result.mmp,140);
      if(name==='normal'){const b=fixture(old,equipment);assert.deepEqual(plain(result),plain(b.statTerms()));}
    });
  }
  test(file+' implicit absent/null/signed value retains existing meanings without mutation',()=>{
    const equipment={weapon:{_implicitStat:'_iMaxHP',_implicitVal:null},bow:{_implicitStat:'_iMaxHP',_implicitVal:-2.5}};
    const before=JSON.stringify(equipment),c=fixture(code,equipment);
    assert.equal(c._eqImplicit('_iMaxHP'),-2.5);assert.equal(c._eqImplicit('absent'),0);
    assert.equal(JSON.stringify(equipment),before);
  });
  test(file+' serialized string inputs are handled without rewriting equipment or save schema',()=>{
    const serialized=JSON.stringify({weapon:{affixes:[{id:'maxHPFlat',value:'9'}],_implicitStat:'_iMaxHP',_implicitVal:'10'}});
    const gear=JSON.parse(serialized),c=fixture(code,gear);assert.equal(c.statTerms().mhp,419);
    assert.equal(JSON.stringify(gear),serialized);
  });
}
