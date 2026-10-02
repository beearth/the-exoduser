'use strict';
// Actual AST functions/registrations; memory-only candidate or --live verification.
// All state and localStorage in this test are private synthetic VM objects.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const args=process.argv.slice(2),option=n=>{const i=args.indexOf(n);return i<0?args.find(a=>a.startsWith(n+'='))?.slice(n.length+1):args[i+1];};
const root=path.resolve(option('--root')||path.resolve(__dirname,'..')),memory=args.includes('--memory');
const {parse}=require(require.resolve('acorn',{paths:[root]}));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex'),plain=x=>JSON.parse(JSON.stringify(x));
const files=['game.html','game-easy-test.html'],pins={'game.html':'4e528f8ccd65f222b6c0d108e89c1281022eb27e3c8de152c72fb7e659d7d614','game-easy-test.html':'fe3bca4e299b5aea9e08fdbd37cf3798d8085d923c013fc21d0ac74f81288a4e'};
const helper=`function _refreshEquipmentStats(){
  const _eqHP=P.hp,_eqMP=P.mp,_eqST=P.st,_eqShield=P.shield;
  _eqAffixCache=null;_eqStatCache=null;
  applyStats();
  P.hp=Math.min(P.mhp,_eqHP);P.mp=Math.min(P.mmp,_eqMP);P.st=Math.min(P.mst,_eqST);P.shield=Math.min(P.mshield,_eqShield);
}
`;
function changes(file){
  const common=[
    {id:'successful-equipment-resource-helper',old:'function equipItem(item){',next:helper+'function equipItem(item){'},
    {id:'equip-final-resources-before-effects-and-save',old:'  recalcSt();playEquipSfx(item);notify(_T(item.name)+_T(\' 장착!\'));',next:'  _refreshEquipmentStats();playEquipSfx(item);notify(_T(item.name)+_T(\' 장착!\'));'},
    {id:'unequip-final-resources-before-effects-and-save',old:'  INV.equipped[slot]=null;\n  recalcSt();\n  notify(_T(item.name)+_T(\' 해제\'));',next:'  INV.equipped[slot]=null;\n  _refreshEquipmentStats();\n  notify(_T(item.name)+_T(\' 해제\'));'},
    {id:'bag-right-click-no-second-apply',old:'  equipItem(item);applyStats();renderInv();',next:'  equipItem(item);renderInv();'},
    {id:'detail-equip-no-second-apply',old:'onclick="equipItem(INV.bag[${idx}]);applyStats();renderInv()"',next:'onclick="equipItem(INV.bag[${idx}]);renderInv()"'},
    {id:'detail-unequip-no-second-apply',old:'onclick="if(unequipItem(\'${idx}\')){applyStats();renderInv()}"',next:'onclick="if(unequipItem(\'${idx}\')){renderInv()}"'},
    {id:'slot-context-no-second-apply',old:'if(item){if(unequipItem(slot)){applyStats();renderInv()}return}',next:'if(item){if(unequipItem(slot)){renderInv()}return}'},
    {id:'urn-context-no-second-apply',old:"if(!unequipItem('ossuary'))return;applyStats();INV.selected=null;renderInv();_invClearHover();",next:"if(!unequipItem('ossuary'))return;INV.selected=null;renderInv();_invClearHover();"},
    {id:'first-ossuary-grant-final-stats-before-effects',provenance:'separate-normal-first-bone-grant; unchanged eligibility and fixed-item contract',old:'  INV.equipped.ossuary=oss;\n  notify(',next:'  INV.equipped.ossuary=oss;\n  _refreshEquipmentStats();\n  notify('},
    {id:'first-ossuary-grant-remove-stale-recalc',provenance:'separate-normal-first-bone-grant',old:'  try{recalcSt()}catch(e){}\n}\n// 철갑 전대 고유식:',next:'}\n// 철갑 전대 고유식:'}
  ];
  if(file==='game.html')common.push({id:'earring-adapter-no-second-apply',old:"  applyStats();INV.selected=INV.equipped[slot]===item?'eq:'+slot:INV.bag.indexOf(item);renderInv();",next:"  INV.selected=INV.equipped[slot]===item?'eq:'+slot:INV.bag.indexOf(item);renderInv();"});
  else common.push(
    {id:'easy-auto-pick-final-stats-before-effects',old:'    INV.equipped[_autoSlot]=item;item.slot=_autoSlot;\n    playItemPickupSfx(item);',next:'    INV.equipped[_autoSlot]=item;item.slot=_autoSlot;\n    _refreshEquipmentStats();\n    playItemPickupSfx(item);'},
    {id:'easy-auto-pick-no-second-apply',old:'    recalcSt();applyStats();window._systemLesson?.pickedUp(item);dbSaveForce();return true;\n  }\n  const[w,h]=_itemSz(item);',next:'    window._systemLesson?.pickedUp(item);dbSaveForce();return true;\n  }\n  const[w,h]=_itemSz(item);'});
  return common;
}
function walk(n,visit){if(!n||typeof n!=='object')return;if(n.type)visit(n);for(const v of Object.values(n)){if(Array.isArray(v))v.forEach(c=>walk(c,visit));else if(v&&typeof v==='object')walk(v,visit);}}
function parseHTML(html){const out=[];for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)){if(/\bsrc\s*=/i.test(m[1]))continue;const type=m[1].match(/\btype\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase()||'';if(type.includes('json')||type==='importmap'){JSON.parse(m[2]);out.push({type:'json'});continue;}if(type&&!['module','text/javascript','application/javascript'].includes(type))continue;out.push({type:'js',text:m[2],offset:m.index+m[0].indexOf(m[2]),ast:parse(m[2],{ecmaVersion:'latest',sourceType:type==='module'?'module':'script'})});}return out;}
const stats=['_itemSz','_invRows','_invCategoryKey','_invGrid','_invFindSpace','applyStats','recalcSt','_lvB','_gritTotal','_gritHpFlat','_gritMpFlat','_gritStFlat','_eqStatRebuild','_eqStat','_eqAffixRebuild','_eqAffix','_eqImplicit','pPredSpd','xferCost','_malCost','_itemEconomyRarity','enhColor'];
const decls=['BAG_MAX','INV_COLS','ITEM_SIZE','WTYPE_SIZE','BTYPE_SIZE','SLOT_NAMES','STATS','PASSIVE_DEF','PASSIVES','_grit','_eqStatCache','_eqAffixCache','_diffSigned','CR_ATK_SLOTS','CR_ARMOR_SLOTS','CR_ACC_SLOTS','CRYSTAL_DEFS','CRYSTAL_STAR','CRYSTAL_BAG_MAX','_MALICE_COST_MUL','EL','IMPLICIT_TABLE'];
function extract(html,file){
  const parsed=parseHTML(html),scripts=parsed.filter(s=>s.type==='js'&&s.text.includes('function equipItem('));assert.equal(scripts.length,1);const script=scripts[0],nodes=[];walk(script.ast,n=>nodes.push(n));
  const text=n=>script.text.slice(n.start,n.end),line=n=>html.slice(0,script.offset+n.start).split('\n').length;
  const select=(name,p)=>{const a=nodes.filter(p);assert.equal(a.length,1,file+' '+name);return a[0];};
  const top=name=>{const a=script.ast.body.filter(n=>n.type==='FunctionDeclaration'&&n.id?.name===name||n.type==='VariableDeclaration'&&n.declarations.some(d=>d.id.name===name));assert.equal(a.length,1,file+' top '+name);return a[0];};
  const fnNames=[...stats,file==='game.html'?'crystalEffects':'crystalVal'];
  const shared=[...new Set([...decls,...fnNames].map(top))];shared.push(select('actual passive initialization',n=>n.type==='ExpressionStatement'&&text(n)==='PASSIVE_DEF.forEach(p=>PASSIVES[p.key]=0);'));shared.sort((a,b)=>a.start-b.start);
  const producerNames=['equipItem','unequipItem','pickupItem','_invBagRightClick','_grantOssuaryIfNeeded'];
  if(file==='game.html')producerNames.push('_equipEarringTo','_earringSlot','_equipSlot','_earringEquipTarget');
  if(html.includes('function _refreshEquipmentStats('))producerNames.push('_refreshEquipmentStats');
  const producerNodes=producerNames.map(top).sort((a,b)=>a.start-b.start);
  const reg={
    detailEquip:select('actual equip detail template',n=>n.type==='AssignmentExpression'&&n.left?.object?.name==='_actB'&&n.left.property?.name==='innerHTML'&&n.right.type==='TemplateLiteral'&&text(n).includes('equipItem(INV.bag[')),
    detailUnequip:select('actual unequip detail template',n=>n.type==='AssignmentExpression'&&n.left?.object?.name==='_actB'&&n.left.property?.name==='innerHTML'&&n.right.type==='TemplateLiteral'&&text(n).includes('unequipItem(')),
    context:select('actual equipment context registration',n=>n.type==='AssignmentExpression'&&n.left?.object?.name==='div'&&n.left.property?.name==='oncontextmenu'&&text(n.right).includes('unequipItem(slot)')),
    urn:select('actual urn context registration',n=>n.type==='AssignmentExpression'&&n.left?.object?.name==='urn'&&n.left.property?.name==='oncontextmenu'),
    demoSave:select('actual normal demo dbSave assignment',n=>n.type==='AssignmentExpression'&&n.left?.name==='dbSave'&&n.right.type==='FunctionExpression'&&text(n.right).includes('localStorage.setItem(_DEMO_LS_KEY,'))
  };
  if(file==='game.html')reg.earring=select('actual explicit earring button RHS',n=>n.type==='AssignmentExpression'&&n.left?.object?.name==='btn'&&n.left.property?.name==='onclick'&&text(n.right).includes('_equipEarringTo(it,slot)'));
  const ossFactory=select('actual fixed ossuary mkItem branch',n=>n.type==='IfStatement'&&text(n.test)==="slot==='ossuary'"&&text(n).includes('item.bonusMp=150;'));
  const metadata=n=>({line:line(n),bytes:Buffer.byteLength(text(n)),sha256:sha(text(n))});
  return {parsed,shared:shared.map(text).join('\n'),producers:producerNodes.map(text).join('\n'),registrations:Object.fromEntries(Object.entries(reg).map(([k,n])=>[k,text(n)])),ossFactory:text(ossFactory),metadata:{functions:Object.fromEntries([...fnNames,...producerNames].map(name=>[name,metadata(top(name))])),declarations:Object.fromEntries(decls.map(name=>[name,metadata(top(name))])),registrations:Object.fromEntries(Object.entries(reg).map(([k,n])=>[k,metadata(n)])),fixedOssuaryFactoryBranch:metadata(ossFactory)}};
}
function oneReplace(text,old,next,label){assert.equal(text.split(old).length-1,1,label);return text.replace(old,next);}
function readSource(file){
  const buffer=fs.readFileSync(path.join(root,file)),html=buffer.toString('utf8'),patches=changes(file);let oldHTML=html,finalHTML=html;
  if(memory){assert.equal(sha(buffer),pins[file],'source15 exact pin '+file);for(const p of patches)finalHTML=oneReplace(finalHTML,p.old,p.next,file+' '+p.id+' old unique');}
  else{const expected=option(file==='game.html'?'--expect-main-sha':'--expect-easy-sha');if(expected)assert.equal(sha(buffer),expected,'live exact pin');for(const p of patches.slice().reverse())oldHTML=oneReplace(oldHTML,p.next,p.old,file+' '+p.id+' inverse unique');assert.equal(sha(oldHTML),pins[file],'live inverse exact source15 pin');}
  let inverse=finalHTML;for(const p of patches.slice().reverse())inverse=oneReplace(inverse,p.next,p.old,file+' inverse '+p.id);assert.equal(inverse,oldHTML,'whole inverse byte exact');
  const original=extract(oldHTML,file),final=extract(finalHTML,file);assert.equal(original.shared,final.shared,'all global stats/grid/crystal/data dependencies byte exact');assert.equal(original.ossFactory,final.ossFactory,'fixed ossuary item branch unchanged');assert.equal(original.registrations.demoSave,final.registrations.demoSave,'actual demo writer unchanged');
  return {file,input:{bytes:buffer.length,sha256:sha(buffer)},originalWhole:{bytes:Buffer.byteLength(oldHTML),sha256:sha(oldHTML)},finalWhole:{bytes:Buffer.byteLength(finalHTML),sha256:sha(finalHTML)},changeBytes:Buffer.byteLength(finalHTML)-Buffer.byteLength(oldHTML),inverseExact:true,original,final,patches:patches.map(p=>({id:p.id,provenance:p.provenance||'successful-equip/unequip-and-existing-callers',OLD:p.old,NEW:p.next,oldUnique:true,inverseUnique:true}))};
}
const nativeCrystal=(file,kind)=>({id:file==='game.html'?({hp:'cr_iron_vow',mp:'cr_deep_well',st:'cr_last_breath'}[kind]):({hp:'cr_hp',mp:'cr_mp',st:'cr_st'}[kind]),star:4,enh:10});
function gear(slot,id,extras={}){return {slot,id,name:id,rarity:3,enh:0,affixes:[],crystals:[],socketCount:0,_gx:null,_gy:null,...extras};}
function fullBag(slot,fragment=false){const b=[];for(let y=0;y<120;y+=2)for(let x=0;x<10;x+=2)b.push(gear(slot==='ossuary'?'ossuary':'armor','filler-'+b.length,{_gx:x,_gy:y}));if(fragment){const f=b.filter(x=>!(x._gx===8&&(x._gy===0||x._gy===2)));f.push(gear(slot==='ossuary'?'ossuary':'armor','fragment',{_gx:8,_gy:1}));return f;}return b;}
function buildFixture(src,variant,c){
  const code=src[variant],events=[],calls={apply:0,recalc:0,save:0,render:0,sound:0,notify:0,hover:0,equip:[],unequip:[],lesson:[]},records=[],storage=new Map();
  const slot=c.slot||'boots',old=gear(slot,'old-'+slot,{bonusHp:70,bonusMp:25,bonusSt:14,bonusShield:35,bStr:2,bDex:3,bInt:4,bGrit:5,enh:7,affixes:[{id:'maxHPFlat',value:17},{id:'maxSTFlat',value:9}],socketCount:1,crystals:[{id:src.file==='game.html'?'cr_iron_vow':'cr_hp',star:2,enh:1}]}),next=gear(slot,'new-'+slot,{bonusHp:120,bonusMp:55,bonusSt:30,bonusShield:60,bStr:4,bDex:6,bInt:8,bGrit:10,affixes:[{id:'maxHPFlat',value:30},{id:'maxSTFlat',value:15}],socketCount:1,crystals:[null],_gx:0,_gy:0});
  const INV={bag:[],equipped:{},selected:'eq:'+slot,ossCollect:{}},P={lv:5,x:10,y:20,hp:0,mp:0,st:0,shield:0,skills:{}},G={on:true,stage:0,kills:3,mats:c.noMats?0:20000};
  if(c.action==='unequip'){if(!c.empty)INV.equipped[slot]=old;INV.bag=c.full?fullBag(slot,c.fragment):[];}
  else if(c.action==='equip'){if(!c.emptySlot)INV.equipped[slot]=old;INV.bag=[next];if(c.dropMax)Object.assign(next,{bonusHp:0,bonusMp:0,bonusSt:0,bonusShield:0,bStr:0,bDex:0,bInt:0,bGrit:0,affixes:[],socketCount:0,crystals:[]});if(c.reqLv)next.reqLv=99;}
  else if(c.action==='pickup'){if(!c.emptySlot)INV.equipped[slot]=old;}
  if(c.stCrystal){Object.assign(old,{enh:0,bonusHp:0,bonusMp:0,bonusSt:40,bonusShield:0,bStr:0,bDex:0,bInt:0,bGrit:0,affixes:[],socketCount:0,crystals:[]});Object.assign(next,{bonusHp:0,bonusMp:0,bonusSt:0,bonusShield:0,bStr:0,bDex:0,bInt:0,bGrit:0,affixes:[],enh:0,socketCount:1,crystals:[nativeCrystal(src.file,'st')]});}
  if(c.crystalOverflow){old.socketCount=3;old.crystals=[nativeCrystal(src.file,'hp'),nativeCrystal(src.file,'mp'),nativeCrystal(src.file,'st')];next.socketCount=1;next.crystals=[null];}
  if(c.action==='firstBone'){if(c.existingOss)INV.equipped.ossuary=gear('ossuary','existing-oss',{bonusMp:150});if(c.bagOss)INV.bag.push(gear('ossuary','bag-oss',{bonusMp:150}));}
  if(c.earring){delete INV.equipped[slot];if(c.earring==='explicitFirst'){INV.equipped.headband=old;old.slot='headband';}if(c.earring==='explicitSecond'){INV.equipped.headband=gear('headband','first-keep',{bonusMp:11});INV.equipped.headband2=old;old.slot='headband2';}next.slot='headband';INV.bag=[next];}
  if(c.ringSecond){INV.equipped.ring1=old;old.slot='ring1';next.slot='ring1';}
  const fixedDate=class extends Date{static now(){return 1791000000000;}};
  const ctx=vm.createContext({P,INV,G,OPT:{diff:5},window:{_systemLesson:{equipped:it=>{calls.lesson.push('equipped');events.push('lesson-equipped');},pickedUp:it=>{calls.lesson.push('pickedUp');events.push('lesson-pickedUp');}}},Date:fixedDate,console,
    CRYSTAL_BAG:[],CRYSTAL_DUST:0,QSLOTS:[],UPGRADES:{},POT_LV:{},SKILL_SLOTS:[],ULT_SLOT:null,_charIdx:0,_DEMO_LS_KEY:'isolated_test_demo',_passiveQueueItems:()=>[],
    localStorage:{setItem:(key,value)=>{storage.set(key,value);records.push(JSON.parse(value));}},
    slot:c.earring==='explicitSecond'?'headband2':c.earring==='explicitFirst'?'headband':slot,idx:c.action==='equip'?0:slot,item:c.empty?old:c.action==='unequip'?old:next,oss:c.empty?old:old,it:next,
    _invHover:37,_actB:{innerHTML:''},div:{},urn:{},btn:{},_reqFail:false,_lbl:'Equip',_salV:1,
    $:()=>({dataset:{inventoryPage:'gear'}}),_T:x=>x,_L:(a,b)=>a,_rarName:()=> 'rarity',_crDefN:d=>d.ko,_r:x=>x,
    notify:()=>{calls.notify++;events.push('notify');},playEquipSfx:()=>{calls.sound++;events.push('equip-sound');},playItemPickupSfx:()=>{calls.sound++;events.push('pickup-sound');},playFM:()=>{calls.sound++;events.push('FM');},playNoise:()=>{calls.sound++;events.push('noise');},
    addTxt:()=>events.push('FX'),_petSayCD:()=>events.push('pet'),_petOnFirstLegend:()=>events.push('legend'),_invClearHover:()=>{calls.hover++;events.push('hover');},renderInv:()=>{calls.render++;events.push('render');},
    registerBonePart:()=>{throw Error('unexpected bag bone registration');},_boneRegister:it=>{INV.ossCollect[it.anc+'_'+it.part]={r:it.rarity,t:it.tier};events.push('bone-register');return true;}});
  vm.runInContext(code.shared+'\n'+code.producers,ctx,{timeout:2500});
  // The item factory prefix/RNG is a leaf boundary. Its final fixed ossuary branch
  // and IMPLICIT_TABLE are actual AST source, not a copied contract fixture.
  vm.runInContext("globalThis.mkItem=function(slot,tier,el,rarity){const item={id:'fixed-oss-item',slot,tier,el,rarity};"+code.ossFactory+";return item;};",ctx);
  vm.runInContext(code.registrations.demoSave+';',ctx);
  ctx.dbSaveForce=()=>{calls.save++;events.push('save');ctx.dbSave();};
  vm.runInContext('PASSIVES.pFortify=2;PASSIVES.pVital=2;PASSIVES.pStamina=1;',ctx);
  const actualApply=ctx.applyStats,actualRecalc=ctx.recalcSt,actualEquip=ctx.equipItem,actualUnequip=ctx.unequipItem;
  ctx.applyStats=()=>{calls.apply++;events.push('apply');return actualApply();};ctx.recalcSt=()=>{calls.recalc++;events.push('recalc');return actualRecalc();};
  ctx.equipItem=it=>{const v=actualEquip(it);calls.equip.push(v===undefined?'undefined':v);return v;};ctx.unequipItem=s=>{const v=actualUnequip(s);calls.unequip.push(v);return v;};
  ctx.applyStats();const resources=()=>[P.hp,P.mp,P.st,P.shield],maxima=()=>[P.mhp,P.mmp,P.mst,P.mshield];[P.hp,P.mp,P.st,P.shield]=c.low?[12,3,5,7]:maxima();calls.apply=calls.recalc=0;events.length=0;
  if(c.caller==='detailEquip'||c.caller==='detailUnequip'){vm.runInContext(code.registrations[c.caller]+';',ctx);const attr=ctx._actB.innerHTML.match(/\bonclick="([^"]+)"/);assert(attr,'actual inline emitted handler');parse(attr[1],{ecmaVersion:'latest'});vm.runInContext('globalThis.__handler=function(event){'+attr[1]+'};',ctx);}
  else if(c.caller==='context'){vm.runInContext(code.registrations.context+';',ctx);ctx.__handler=ctx.div.oncontextmenu;}
  else if(c.caller==='urn'){vm.runInContext(code.registrations.urn+';',ctx);ctx.__handler=ctx.urn.oncontextmenu;}
  else if(c.caller==='earring'){vm.runInContext(code.registrations.earring+';',ctx);ctx.__handler=ctx.btn.onclick;}
  const state=()=>plain({P,INV,G,crystalBag:ctx.CRYSTAL_BAG}),cacheRefs=()=>vm.runInContext('({_eqAffixCache,_eqStatCache})',ctx);
  const before={resources:resources(),maxima:maxima(),state:state(),cacheRefs:cacheRefs(),pEff:P._effStats,pCr:P._crystalStats,bagRef:INV.bag,eqRef:INV.equipped,bagRefs:INV.bag.slice(),oldRef:old,newRef:next,oldState:plain(old),newState:plain(next)};
  return {src,variant,c,ctx,P,INV,G,old,next,before,calls,events,records,storage,resources,maxima,state,cacheRefs,
    run(){if(c.action==='firstBone')return ctx.pickupItem(gear('bonePart','first-bone',{anc:'iron_warlord',part:'skull',rarity:1,tier:0}));if(c.action==='pickup')return ctx.pickupItem(next);if(c.caller==='direct')return c.action==='equip'?ctx.equipItem(next):ctx.unequipItem(slot);if(c.caller==='bag')return ctx._invBagRightClick(0);return ctx.__handler({preventDefault(){events.push('prevent-default');}});},
    observe(){return {beforeCurrent:before.resources,beforeMax:before.maxima,current:resources(),max:maxima(),calls:plain(calls),events:events.slice(),saved:records.map(x=>({player:x.player,inv:x.inv})),equipped:Object.fromEntries(Object.entries(INV.equipped).map(([k,v])=>[k,v?.id||null])),bagIds:INV.bag.map(it=>it.id),mats:G.mats,selected:INV.selected,old:plain(old),next:plain(next),crystalBag:plain(ctx.CRYSTAL_BAG)};}};
}
function oracleFinal(f){
  // Independent shared actual-source stat computation after the actual mutation.
  // No candidate helper/producer/caller is used here. It also detects missing
  // final recalculation in direct producers, first grant and stale crystal-ST.
  const ctx=vm.createContext({P:{...plain(f.P),hp:0,mp:0,st:0,shield:0},INV:plain(f.INV),G:plain(f.G),OPT:{diff:5},window:{}});
  vm.runInContext(f.src.original.shared,ctx,{timeout:2500});vm.runInContext('PASSIVES.pFortify=2;PASSIVES.pVital=2;PASSIVES.pStamina=1;_eqAffixCache=null;_eqStatCache=null;applyStats();',ctx);
  return {max:[ctx.P.mhp,ctx.P.mmp,ctx.P.mst,ctx.P.mshield],crystals:plain(ctx.P._crystalStats),eff:plain(ctx.P._effStats)};
}
const commonCases=[
  {id:'equip-direct-empty-slot-high-before-save',action:'equip',caller:'direct',emptySlot:true},
  {id:'equip-detail-success-transfer-high-before-save',action:'equip',caller:'detailEquip'},
  {id:'equip-bag-success-low-no-free-heal',action:'equip',caller:'bag',low:true},
  {id:'equip-detail-final-maximum-decrease',action:'equip',caller:'detailEquip',dropMax:true},
  {id:'equip-new-crystal-ST-pre-recalc-capture',action:'equip',caller:'detailEquip',slot:'belt',stCrystal:true},
  {id:'equip-crystal-transfer-and-overflow-business-preserved',action:'equip',caller:'bag',crystalOverflow:true},
  {id:'equip-level-rejection-keeps-state-and-no-recalc',action:'equip',caller:'bag',reqLv:true,reject:true},
  {id:'equip-transfer-cost-rejection-keeps-state',action:'equip',caller:'detailEquip',noMats:true,reject:true},
  {id:'unequip-direct-final-resources-before-save',action:'unequip',caller:'direct'},
  {id:'unequip-detail-final-max-clamp-known-golden',action:'unequip',caller:'detailUnequip',golden:true},
  {id:'unequip-context-final-max-clamp',action:'unequip',caller:'context'},
  {id:'unequip-urn-final-max-and-hover-order',action:'unequip',caller:'urn',slot:'ossuary'},
  {id:'unequip-detail-low-no-free-heal',action:'unequip',caller:'detailUnequip',low:true},
  {id:'unequip-context-repeat-converges-without-extra-effects',action:'unequip',caller:'context',repeat:true},
  {id:'source15-full-grid-failure-still-zero-effects',action:'unequip',caller:'detailUnequip',full:true,reject:true},
  {id:'source15-empty-stale-context-still-zero-effects',action:'unequip',caller:'context',empty:true,reject:true},
  {id:'source15-fragmented-urn-failure-still-zero-effects',action:'unequip',caller:'urn',slot:'ossuary',full:true,fragment:true,reject:true},
  {id:'first-bone-grant-final-MP-and-one-save-no-free-heal',action:'firstBone',caller:'pickup',grant:true},
  {id:'first-bone-existing-ossuary-eligibility-no-new-apply',action:'firstBone',caller:'pickup',existingOss:true,noGearMutation:true},
  {id:'first-bone-bag-ossuary-eligibility-no-new-apply',action:'firstBone',caller:'pickup',bagOss:true,noGearMutation:true}
];
function casesFor(file){return [...commonCases,...(file==='game.html'?[
  {id:'main-ordinary-pickup-remains-bag-first-no-stats',action:'pickup',caller:'pickup',emptySlot:true,noGearMutation:true},
  {id:'main-earring-empty-default-headband',action:'equip',caller:'detailEquip',slot:'headband',earring:'default'},
  {id:'main-earring-explicit-first-transfer',action:'equip',caller:'earring',slot:'headband',earring:'explicitFirst'},
  {id:'main-earring-explicit-second-transfer-and-selection',action:'equip',caller:'earring',slot:'headband2',earring:'explicitSecond'}
]:[
  {id:'easy-empty-slot-auto-pick-final-stats-before-effects-save',action:'pickup',caller:'pickup',emptySlot:true},
  {id:'easy-empty-slot-auto-pick-low-no-heal',action:'pickup',caller:'pickup',emptySlot:true,low:true},
  {id:'easy-auto-ring1-occupied-selects-ring2',action:'pickup',caller:'pickup',emptySlot:true,slot:'ring1',ringSecond:true}
])];}
function rejection(f){
  assert.deepEqual(f.state(),f.before.state,'rejected operation preserves all state/resources');assert.equal(f.INV.bag,f.before.bagRef);assert.equal(f.INV.equipped,f.before.eqRef);assert.equal(f.P._effStats,f.before.pEff);assert.equal(f.P._crystalStats,f.before.pCr);
  const cr=f.cacheRefs();assert.equal(cr._eqAffixCache,f.before.cacheRefs._eqAffixCache);assert.equal(cr._eqStatCache,f.before.cacheRefs._eqStatCache);
  for(const k of ['apply','recalc','save','sound','hover'])assert.equal(f.calls[k],0,k+' on rejection');assert.equal(f.calls.notify,f.c.empty?0:1);assert.equal(f.calls.render,f.c.action==='equip'?1:0);
  if(f.c.action==='unequip')assert.equal(f.calls.unequip.at(-1),false,'source15 false remains');
}
function successful(f,expected){
  assert.deepEqual(f.maxima(),expected.max,'all final maximum values match independent original-source stat dependencies');
  assert.deepEqual(f.resources(),f.before.resources.map((v,i)=>Math.min(v,expected.max[i])),'old current constrained only by final maximum; no free heal');
  assert.deepEqual(plain(f.P._crystalStats),expected.crystals,'new crystal cache');assert.deepEqual(plain(f.P._effStats),expected.eff,'new effective stats cache');
  assert.equal(f.calls.apply,f.c.noGearMutation?0:1,'one final apply on committed gear transition');assert.equal(f.calls.recalc,f.c.noGearMutation?0:1,'one final recalc, no stale precursor');assert.equal(f.calls.save,1,'one original save');assert.equal(f.records.length,1,'actual demo writer produced exactly one private-memory save');
  const saved=f.records[0];assert.deepEqual([saved.player.hp,saved.player.mp,saved.player.st,saved.player.shield],f.resources(),'save captures final current');assert.deepEqual([saved.player.mhp,saved.player.mmp,saved.player.mst,saved.player.mshield],expected.max,'save captures final maxima');assert.deepEqual(saved.inv,plain({bag:f.INV.bag,equipped:f.INV.equipped,ossCollect:f.INV.ossCollect}),'same committed INV save');
  if(!f.c.noGearMutation){assert(f.events.indexOf('apply')<f.events.indexOf('save'),'atomic stats before save');const committed=f.c.action==='equip'?['equip-sound','lesson-equipped']:['notify','pickup-sound','FM','FX','lesson-pickedUp'];const effect=f.events.findIndex(e=>committed.includes(e));assert(effect<0||f.events.indexOf('apply')<effect,'final stats before committed equipment effects/lesson; preliminary transfer messages unchanged');}
  if(f.c.action==='equip'){const target=f.c.earring==='explicitSecond'?'headband2':f.next.slot;assert.equal(f.INV.equipped[target],f.next);assert.equal(f.INV.bag.includes(f.next),false);assert.equal(f.calls.equip[0],'undefined','equip return contract unchanged');if(!f.c.emptySlot&&f.c.earring!=='default'){assert.equal(f.INV.bag.filter(it=>it===f.old).length,1);assert.equal(f.old.enh,0);assert.equal(f.next.enh,f.before.oldState.enh);assert.equal(f.G.mats,20000-f.ctx.xferCost(f.before.oldState.enh));}else assert.equal(f.G.mats,20000);assert.equal(f.calls.sound,1);assert.equal(f.calls.lesson.filter(x=>x==='equipped').length,1);assert.equal(f.calls.render,f.c.caller==='direct'?0:1);}
  if(f.c.action==='unequip'){assert.equal(f.INV.equipped[f.c.slot||'boots'],null);assert.equal(f.INV.bag.at(-1),f.old);assert.equal(f.calls.unequip[0],true,'source15 true remains');assert.equal(f.old.enh,f.before.oldState.enh);assert.deepEqual(f.old.crystals,f.before.oldState.crystals);assert.equal(f.G.mats,20000);assert.equal(f.calls.sound,2);assert.equal(f.calls.render,f.c.caller==='direct'?0:1);if(f.c.golden)assert.deepEqual(expected.max,[912,206,152,110],'source15 independently recorded successful boundary');if(f.c.caller==='urn'){assert.equal(f.INV.selected,null);assert.equal(f.calls.hover,1);assert(f.events.indexOf('render')<f.events.indexOf('hover'));}}
  if(f.c.action==='firstBone'){assert.equal(f.INV.ossCollect.iron_warlord_skull.r,1);if(f.c.grant){assert.equal(f.INV.equipped.ossuary.bonusMp,150);assert.equal(expected.max[1],f.before.maxima[1]+150,'fixed grant maximum MP increases exactly150');assert.equal(f.calls.sound,0);assert(f.events.indexOf('apply')<f.events.indexOf('bone-register'));}if(f.c.bagOss)assert.equal(f.INV.equipped.ossuary,undefined);}
  if(f.c.action==='pickup'){if(f.src.file==='game.html'){assert.equal(f.INV.bag.at(-1),f.next);assert.equal(f.INV.equipped[f.next.slot],undefined);assert.equal(f.calls.sound,1);}else{const slot=f.c.ringSecond?'ring2':f.next.slot;assert.equal(f.INV.equipped[slot],f.next);assert.equal(f.calls.sound,2);assert.equal(f.INV.bag.length,0);}assert.equal(f.calls.lesson.filter(x=>x==='pickedUp').length,1);}
  if(f.c.stCrystal){assert(expected.max[2]>f.before.maxima[2],'new ST crystal overcomes reduced ordinary item bonus');assert.equal(f.resources()[2],f.before.resources[2],'stale first recalc did not consume ST');}
  if(f.c.low)assert.deepEqual(f.resources(),[12,3,5,7],'low current no free heal');
  if(f.c.earring==='explicitSecond'||f.c.earring==='explicitFirst')assert.equal(f.INV.selected,'eq:'+f.ctx.slot);
  if(f.c.repeat){const stable=f.state(),counts=plain(f.calls),saved=f.records.length;f.run();assert.deepEqual(f.state(),stable,'repeated actual registered context is stable');for(const k of ['apply','recalc','save','render','sound','notify','hover'])assert.equal(f.calls[k],counts[k],'repeat '+k);assert.equal(f.records.length,saved);assert.equal(f.calls.unequip.at(-1),false);}
}
function business(f){return plain({INV:f.INV,G:f.G,old:f.old,next:f.next,crystalBag:f.ctx.CRYSTAL_BAG,sounds:f.calls.sound,notifications:f.calls.notify,render:f.calls.render,hover:f.calls.hover,lesson:f.calls.lesson});}
async function main(){
  const sources=files.map(readSource),results=[],baseline=new Map();
  for(const src of sources)for(const variant of memory?['original','final']:['final'])for(const c of casesFor(src.file)){
    let f,error=null,expected=null,operationValue,fixtureError=false;
    try{f=buildFixture(src,variant,c);}catch(e){fixtureError=true;error=e.stack;}
    if(f)try{operationValue=f.run();expected=c.reject?null:oracleFinal(f);if(c.reject)rejection(f);else successful(f,expected);
      if(c.crystalOverflow){assert.equal(f.ctx.CRYSTAL_BAG.length,2);assert.equal(f.next.crystals[0].id,nativeCrystal(src.file,'hp').id);assert(f.old.crystals.every(x=>x===null));}
    }catch(e){error=String(e.message);}
    const observed=f?f.observe():null;
    if(f){const key=src.file+' '+c.id,b=business(f);if(variant==='original')baseline.set(key,b);else if(memory){try{assert.deepEqual(b,baseline.get(key),'non-resource equipment/inventory/economy/FX/selection behavior unchanged');}catch(e){error=(error?error+'; ':'')+e.message;}}}
    results.push({file:src.file,variant,id:c.id,pass:!error,error,fixtureError,operationReturn:operationValue===undefined?'undefined':operationValue,expectedFinal:expected,observed});
  }
  const summary={};for(const variant of memory?['original','final']:['final']){const rows=results.filter(r=>r.variant===variant);summary[variant]={groups:rows.length,pass:rows.filter(r=>r.pass).length,fail:rows.filter(r=>!r.pass).length,fixtureErrors:rows.filter(r=>r.fixtureError).length};}
  const after=Object.fromEntries(files.map(f=>[f,sha(fs.readFileSync(path.join(root,f)))])),unchanged=sources.every(s=>after[s.file]===s.input.sha256);
  const parsed=sources.reduce((a,s)=>({js:a.js+s.final.parsed.filter(x=>x.type==='js').length,json:a.json+s.final.parsed.filter(x=>x.type==='json').length}),{js:0,json:0});assert.deepEqual(parsed,{js:12,json:2});
  const genuineRows=results.filter(r=>r.variant==='original'&&r.id==='unequip-detail-final-max-clamp-known-golden');const genuineRed=!memory||genuineRows.length===2&&genuineRows.every(r=>r.observed.current[0]===312&&r.observed.current[1]===106&&r.observed.max[0]===912&&r.observed.max[1]===206);
  const overallPass=unchanged&&summary.final.fail===0&&summary.final.fixtureErrors===0&&genuineRed;
  const plan={schemaVersion:1,purpose:'source16 successful gear atomic resource boundary; private memory candidate only',productionWritten:false,firstGrantSeparateProvenance:{included:true,eligibility:'equipped/bag ossuary guards unchanged; only actual successful new fixed grant recalculates',old:'direct equip ossuary -> notify/FX -> recalcSt only; next actual pickup saves',next:'direct equip ossuary -> same atomic final-resource helper -> notify/FX; next actual pickup saves',policyChange:false,docs:['docs/2_7 인벤토리+장비시스템/2_7 인벤토리+장비시스템.md','docs/14밸런스+수치테이블/14밸런스+수치테이블.md','docs/15 세이브+데이터구조/15 세이브+데이터구조.md']},files:sources.map(s=>({file:s.file,source:s.originalWhole,final:s.finalWhole,changeBytes:s.changeBytes,inverseExact:true,patches:s.patches}))};
  if(option('--plan')){assert(memory,'patch plan only in memory mode');const p=path.resolve(option('--plan'));assert(p.startsWith(path.join(root,'tmp/mac-migration-runtime/continued-review-20261003/root-equipment-atomic-source16')+path.sep),'owned plan only');fs.writeFileSync(p,JSON.stringify(plan,null,2)+'\n');}
  const report={schemaVersion:1,at:new Date().toISOString(),mode:memory?'memory-original-red-candidate-green':'live-final-green-only',overallPass,summary,genuineExistingSuccessHPMPRed:memory?genuineRed:null,sourceUnchanged:unchanged,fullHTMLParse:{...parsed,pass:true},sourceReceipts:sources.map(s=>({file:s.file,input:s.input,afterSHA256:after[s.file],originalWhole:s.originalWhole,finalWhole:s.finalWhole,changeBytes:s.changeBytes,inverseExact:true,statGridCrystalAndDeclarationsByteExact:true,actualDemoWriterByteExact:true,actualFixedOssuaryFactoryBranchByteExact:true,originalMetadata:s.original.metadata,finalMetadata:s.final.metadata})),results,
    actualExtraction:'Actual equipItem/unequipItem/pickupItem/first-grant/earring/bag helper; all actual detail generated inline handlers and slot/urn/earring registration RHS; original stats/grid/crystal/economy/passive dependencies; actual normal demo dbSave RHS; first-grant fixed mkItem ossuary branch.',
    fixtureBoundary:'Private synthetic VM only. Real render/hover, notify/SFX/FX/pet/lesson, bone registration and forced-save scheduling are recording leaves. First-grant factory prefix/RNG is a leaf seed, with exact actual fixed ossuary AST branch and IMPLICIT_TABLE applied. Actual normal demo JSON serialization writes to a private in-memory localStorage recorder. No real DOM/audio/user data/save/server/native operation.',
    firstGrantSeparateProvenance:plan.firstGrantSeparateProvenance,legacySource15SuccessEvidenceReused:'Known existing final912/206/152/110 and old current312/106 boundary is a golden assertion; old48-case rejection suite not rerun.',globalApplyStatsModified:false,productionWritten:false,nativeAccepted:false,patchPlanPath:option('--plan')||null};
  process.stdout.write(JSON.stringify(report,null,2)+'\n');process.exitCode=overallPass?0:1;
}
main().catch(e=>{process.stderr.write(e.stack+'\n');process.exitCode=1;});
