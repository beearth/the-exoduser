'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
// Actual source functions run in isolated VM fixtures; native rendering, audio and save I/O are not executed.
const {test}=require('node:test');
const root=process.env.EXODUSER_CP_SOURCE_ROOT||path.resolve(__dirname,'..'),{parse}=require(require.resolve('acorn',{paths:[path.resolve(__dirname,'..')]}));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
function walk(n,fn){if(!n||typeof n!=='object')return;if(n.type)fn(n);for(const v of Object.values(n)){if(Array.isArray(v))v.forEach(x=>walk(x,fn));else if(v&&typeof v==='object')walk(v,fn);}}
const functions=['applyStats','recalcSt','calcCP','equipItem','_refreshEquipmentStats','_earringSlot','_equipSlot','_eqAffix','_eqAffixRebuild','_eqStat','_eqStatRebuild','_eqImplicit','_gritTotal','_gritHpFlat','_gritMpFlat','_gritStFlat','_lvB','pPredSpd','statStr','pDefAdd','xferCost','_malCost','crystalEffects','crystalVal','_crDefN','_invBuildCompare','sortInvBag','_invAutoPlace'];
functions.push('_invCategoryKey','_invRows');
const declarations=['SLOT_NAMES','CR_ATK_SLOTS','CR_ARMOR_SLOTS','CR_ACC_SLOTS','CR_DEF_SLOTS','CRYSTAL_DEFS','CRYSTAL_STAR','RARITY_C','INV_COLS','BAG_MAX','_MALICE_COST_MUL','_diffSigned'];
function extract(file,variant){
 const raw=fs.readFileSync(path.join(root,file)),html=raw.toString();
 const script=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)].find(m=>m[2].includes('function applyStats('));
 const code=script[2],ast=parse(code,{ecmaVersion:'latest'}),nodes=[];walk(ast,n=>nodes.push(n));
 const text=n=>code.slice(n.start,n.end),getFn=name=>{const n=nodes.filter(n=>n.type==='FunctionDeclaration'&&n.id.name===name);assert.equal(n.length,1,name);return text(n[0]);};
 const getDecl=name=>{const n=ast.body.filter(n=>n.type==='VariableDeclaration'&&n.declarations.some(d=>d.id.name===name));assert.equal(n.length,1,name);return text(n[0]);};
 const optional=new Set(['_earringSlot','_equipSlot','crystalEffects','crystalVal']);
 const funcCodes=Object.fromEntries(functions.filter(name=>!optional.has(name)||nodes.some(n=>n.type==='FunctionDeclaration'&&n.id.name===name)).map(name=>[name,getFn(name)]));
 return {file,variant,pin:sha(raw),funcCodes,runtime:declarations.map(getDecl).join('\n')+'\n'+Object.values(funcCodes).join('\n')+(nodes.some(n=>n.type==='FunctionDeclaration'&&n.id.name==='_inventoryEquipCP')?'\n'+getFn('_inventoryEquipCP'):'')+'\nglobalThis.__slots=SLOT_NAMES;globalThis.__defs=CRYSTAL_DEFS;'};
}
function clone(x){return JSON.parse(JSON.stringify(x));}
function freeze(x){if(x&&typeof x==='object'&&!Object.isFrozen(x)){Object.freeze(x);Object.values(x).forEach(freeze);}return x;}
function fixture(source,options={}){
 const effects=[];const sink=name=>(...args)=>effects.push({name,args});
 const ctx={console,Math,window:{},P:{lv:2,x:0,y:0,hp:400,mp:150,st:200,shield:80,poise:3,poiseR:0,_altDef:0,_altSpd:0,skills:{fireball:1},_fused:{nested:{value:4}},_effStats:{old:1},_crystalStats:{hp:1,mp:1,st:1}},
   G:{on:true,stage:1,mats:1000000,cam:{x:0,y:0},rooms:[{nested:{value:7}}]},INV:{equipped:{},bag:[],selected:0},STATS:{str:0,dex:0,int:0,lck:0},PASSIVES:{pHuman:1},OPT:{diff:5},
   _grit:0,_eqStatCache:null,_eqAffixCache:null,_eqAffixVer:7,_earringEquipTarget:null,_invSalSel:new Set(['existing']),
   _T:x=>x,_L:(ko,en)=>ko,AFFIX_NAMES_KO:{},ELC:Array(7).fill('#fff'),ELN:Array(7).fill('element'),ELE:Array(7).fill('element'),WTYPES:{},BOWTYPES:{},
   _itemSz:()=>[1,1],_invFindSpace:()=>({x:0,y:0}),_invCardFields:()=>'',_itemEconomyRarity:x=>x,enhColor:()=>'',CRYSTAL_BAG:[],CRYSTAL_BAG_MAX:9999,
   notify:sink('notify'),addTxt:sink('addTxt'),playEquipSfx:sink('equipSfx'),dbSaveForce:sink('save'),renderInv:sink('renderInv'),
 };
 vm.createContext(ctx);vm.runInContext(source.runtime,ctx,{timeout:2500});
 for(const slot of ctx.__slots)ctx.INV.equipped[slot]=null;
 ctx.INV.equipped.armor={id:'armor',slot:'armor',rarity:0,def:18,bonusHp:120,bonusSt:57,enh:0,_gx:0,_gy:0};
 ctx.INV.equipped.weapon={id:'weapon',slot:'weapon',rarity:0,wRange:2,enh:0,_gx:0,_gy:0};
 ctx.INV.equipped.cape={id:'old',slot:'cape',rarity:0,def:21,bonusHp:17,bonusSt:44,enh:0,_gx:0,_gy:0};
 const item={id:'new',name:'new cape',slot:'cape',rarity:0,def:20,bonusHp:44,bonusSt:33,bStr:1,enh:0,socketCount:0,_gx:0,_gy:0};
 if(options.setup)options.setup(ctx,item);
 ctx.INV.bag.push(item);ctx._refreshEquipmentStats();effects.length=0;
 const snapshot=()=>clone({P:ctx.P,G:ctx.G,INV:ctx.INV,STATS:ctx.STATS,PASSIVES:ctx.PASSIVES,OPT:ctx.OPT,crystals:ctx.CRYSTAL_BAG,cacheAffix:ctx._eqAffixCache,cacheStat:ctx._eqStatCache,cacheVer:ctx._eqAffixVer,effects});
 const refs=()=>({P:ctx.P,INV:ctx.INV,equipped:ctx.INV.equipped,bag:ctx.INV.bag,G:ctx.G,stats:ctx.STATS,passives:ctx.PASSIVES,affix:ctx._eqAffixCache,stat:ctx._eqStatCache,crystals:ctx.CRYSTAL_BAG,effStats:ctx.P._effStats,crystalStats:ctx.P._crystalStats});
 const compare=()=>{const slot=typeof ctx._equipSlot==='function'?ctx._equipSlot(item):item.slot;const data=ctx._invBuildCompare(item,ctx.INV.equipped[slot]||{});const str=JSON.stringify(data);const m=str.match(/CP: ([+-]?\d+)/);return m?Number(m[1]):0;};
 const actual=()=>{const base=ctx.calcCP().total;ctx.equipItem(item);return ctx.calcCP().total-base;};
 return {ctx,item,effects,snapshot,refs,compare,actual};
}
function record(source,id,fn){test(source.file+' '+id,()=>fn());}
for(const file of ['game.html','game-easy-test.html']){
 const source=extract(file,'live');
  record(source,'caps-and-cloak-preview-match-real-equip',()=>{const a=fixture(source),base=a.ctx.calcCP().total,preview=a.compare(),before={hp:a.ctx.P.mhp,st:a.ctx.P.mst},actual=a.actual();assert.equal(before.hp,543);assert.equal(before.st,302);assert.equal(a.ctx.P.mhp,575);assert.equal(a.ctx.P.mst,291);assert.equal(preview,actual);return {base,preview,actual,before,after:{hp:a.ctx.P.mhp,st:a.ctx.P.mst}};});
  record(source,'mixed-affix-crystal-passive-enhancement-and-refusal',()=>{
   const cases=[];
   for(const kind of ['affix','implicit','crystal','transfer','full-crystals','overflow-crystals','cost-refusal','level-refusal','fractional','all-slots','passive','offline','empty-slot','earring-slot']){
    const f=fixture(source,{setup:(c,it)=>{
      const old=c.INV.equipped.cape;
      if(kind==='affix'){it.affixes=[{id:'maxHPFlat',value:15.5},{id:'maxHPPct',value:.15},{id:'maxMPFlat',value:17},{id:'maxSTFlat',value:13.9},{id:'strFlat',value:2.9},{id:'gritFlatN',value:3.5},{id:'defFlat',value:4}];}
      if(kind==='implicit'){it._implicitStat='_iMaxHPPct';it._implicitVal=15.5;}
      if(['crystal','transfer','full-crystals','overflow-crystals'].includes(kind)){
        const ids=Object.keys(c.__defs);const id=ids[0];old.crystals=[{id,star:2,enh:4}];it.socketCount=2;
        if(kind==='crystal')it.crystals=[{id:ids[1],star:3,enh:1},null];
        if(kind==='full-crystals')it.crystals=[{id:ids[1],star:3,enh:1},{id:ids[2],star:1,enh:2}];
        if(kind==='overflow-crystals'){it.crystals=[];c.CRYSTAL_BAG=Array(c.CRYSTAL_BAG_MAX).fill({id,star:0,enh:0});}
      }
      if(['transfer','cost-refusal'].includes(kind)){old.enh=15;it.enh=1;if(kind==='cost-refusal')c.G.mats=1;}
      if(kind==='level-refusal')it.reqLv=50;
      if(kind==='fractional'){it.bonusHp=19.99;it.bonusMp=2.91;it.bonusSt=18.72;it.affixes=[{id:'gritFlatR',value:.95}];}
      if(kind==='all-slots'){for(const s of c.__slots)if(!c.INV.equipped[s])c.INV.equipped[s]={slot:s,rarity:0,bonusHp:2,bonusMp:3,bonusSt:4,bonusShield:5,bStr:1,bInt:2,bGrit:3,enh:11};}
      if(kind==='passive')Object.assign(c.PASSIVES,{pMelee:3,pVital:2,pStamina:3,pFortify:2,pArmor:2,pPred:1});
      if(kind==='offline'){c.G.on=false;c.G.stage=5;c.OPT.diff=10;}
      if(kind==='empty-slot')c.INV.equipped.cape=null;
      if(kind==='earring-slot'&&source.file==='game.html'){it.slot='headband';c.INV.equipped.headband={slot:'headband',bonusMp:60,enh:10};c.INV.equipped.headband2=null;}
    }});
    const state=f.snapshot(),preview=f.compare();assert.deepEqual(f.snapshot(),state,'preview must retain all observed state '+kind);const actual=f.actual();assert.equal(preview,actual,kind);cases.push({kind,preview,actual});
   }return cases;
  });
  record(source,'deep-frozen-originals-and-cache-references-retained',()=>{
    const setup=(c,it)=>{const id=Object.keys(c.__defs)[0];c.INV.equipped.cape.crystals=[{id,star:2,enh:3}];it.socketCount=2;it.crystals=[null,null];it.affixes=[{id:'maxHPFlat',value:11}];};
    const expected=fixture(source,{setup}).actual(),f=fixture(source,{setup});
    const before=f.snapshot(),refs=f.refs();freeze(f.ctx.P);freeze(f.ctx.INV.equipped);freeze(f.ctx.INV.bag);freeze(f.ctx.G);freeze(f.ctx.STATS);freeze(f.ctx.PASSIVES);freeze(f.ctx.OPT);freeze(f.ctx.CRYSTAL_BAG);freeze(f.ctx._eqAffixCache);freeze(f.ctx._eqStatCache);
    assert.equal(f.compare(),expected);assert.deepEqual(f.snapshot(),before);for(const [key,value] of Object.entries(refs))assert.equal(f.refs()[key],value,key);assert.equal(f.effects.length,0);return {unchangedState:true,identicalRefs:Object.keys(refs).length,sideEffectSinks:0};
  });
  record(source,'calc-exception-restores-equipment-and-cache-identity',()=>{
    const f=fixture(source),refs=f.refs(),before=f.snapshot(),original=f.ctx.calcCP;let calls=0;
    f.ctx.calcCP=function(){if(++calls===2)throw Error('injected CP failure');return original();};f.compare();
    assert.deepEqual(f.snapshot(),before);for(const [key,value] of Object.entries(refs))assert.equal(f.refs()[key],value,key);return {exceptionCaught:true,identicalRefs:Object.keys(refs).length};
  });
  record(source,'both-sort-callers-follow-real-equip-benefit-and-retain-state',()=>{
   const cases=[];
   for(const caller of ['sortInvBag','_invAutoPlace']){
    const f=fixture(source),a={...f.item,id:'hp',def:0,bonusHp:1000,bonusSt:0,bStr:0},b={...f.item,id:'def',def:100,bonusHp:0,bonusSt:0,bStr:0};
    const fav={...b,id:'fav',fav:true},junk={...a,id:'junk',junk:true},blocked={...a,id:'blocked',reqLv:999};f.ctx.INV.bag.splice(0,1,b,a,junk,blocked,fav);
    const before=f.snapshot(),refs=f.refs();f.ctx[caller]();
    assert.deepEqual(f.ctx.INV.bag.map(it=>it.id),['fav','hp','def','blocked','junk']);
    const after=f.snapshot();delete before.INV.bag;delete after.INV.bag;delete before.INV.selected;delete after.INV.selected;assert.deepEqual(after,before);
    for(const [key,value] of Object.entries(refs))assert.equal(f.refs()[key],value,key);assert.equal(f.effects.length,0);
    assert.equal(f.ctx.INV.bag.find(it=>it.id==='hp').bonusHp,1000);cases.push({caller,order:Array.from(f.ctx.INV.bag,it=>it.id),originalStatsRetained:true});
   }return cases;
  });
  record(source,'each-slot-preview-matches-enhancement-crystal-equipped-result',()=>{
   const first=fixture(source),cases=[];
   for(const slot of first.ctx.__slots){
    const f=fixture(source,{setup:(c,it)=>{it.slot=slot;it.enh=1;it.socketCount=2;it.crystals=[null,null];const id=Object.keys(c.__defs).find(k=>c.__defs[k].stat==='hp'||c.__defs[k].opts?.some(o=>o[0]==='hp'));c.INV.equipped[slot]={slot,enh:11,bonusHp:31,bonusMp:47,bonusSt:29,crystals:[{id,star:2,enh:3}],_gx:0,_gy:0};
      if(source.file==='game.html'&&['headband','headband2'].includes(slot)){const other=slot==='headband'?'headband2':'headband';c.INV.equipped[other]={slot:other,enh:0};}
    }}),before=f.snapshot(),preview=f.compare();assert.deepEqual(f.snapshot(),before);const actual=f.actual();assert.equal(preview,actual,slot);cases.push({slot,preview,actual});
   }return cases;
  });
  record(source,'stats-exception-restores-shadow-player-and-original-caches',()=>{
   const f=fixture(source),before=f.snapshot(),refs=f.refs();let injected=0;f.ctx.recalcSt=()=>{injected++;throw Error('injected capacity failure');};f.compare();assert.equal(injected,1,'actual capacity exception must be reached');assert.deepEqual(f.snapshot(),before);for(const [key,value] of Object.entries(refs))assert.equal(f.refs()[key],value,key);return {exceptionCaught:true,identicalRefs:Object.keys(refs).length};
  });
}