// Exact original slices, detached in-memory fixtures only. No game/server/IO.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=process.argv[2],file=path.join(root,'game.html'),source=fs.readFileSync(file,'utf8');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex'),provenance=[];
function extract(begin,end){const a=source.indexOf(begin),b=source.indexOf(end,a+begin.length);if(a<0||b<0)throw Error('source anchor missing '+begin);const code=source.slice(a,b);provenance.push({file:'game.html',start_line:source.slice(0,a).split('\n').length,end_line:source.slice(0,b).split('\n').length,sha256:sha(code)});return code;}
const keys=['SLOT_NAMES','SLOT_EMOJI','RARITY_MUL','WTYPES','BOWTYPES','_WP_MOD','_CR_LEGACY_IDS','POT'];
const declarations=keys.map(k=>{const a=source.indexOf('const '+k+'=');if(a<0)throw Error(k);const b=source.indexOf(';',a)+1;const code=source.slice(a,b);provenance.push({file:'game.html',constant:k,start_line:source.slice(0,a).split('\n').length,sha256:sha(code)});return code;}).join('\n');
const weaponName=extract('function _weaponName(wt,el,tier){','// ═══ BOW TYPES');
const inventory=extract('  if(d.inv){','  // Stats');
const bagMax=extract('  BAG_MAX=Number.isNaN(+d.bagMax)?300:d.bagMax||300;','  // Hell cleared');
const crystals=extract('  CRYSTAL_BAG=d.crystalBag||[];','  // Skills');
const sourceTables=vm.runInNewContext(declarations+';({'+keys.join(',')+'})');
const data=JSON.parse(fs.readFileSync(path.join(root,'godot/data/item_generation_tables.json'),'utf8'));
for(const key of keys.filter(k=>!['_CR_LEGACY_IDS','POT'].includes(k)))if(JSON.stringify(data[key])!==JSON.stringify(sourceTables[key]))throw Error('readonly table differs '+key);
function identities(value){const seen=new Map(),aliases=[];function visit(v,p){if(!v||typeof v!=='object')return;if(seen.has(v)){aliases.push([p,seen.get(v)]);return;}seen.set(v,p);if(Array.isArray(v))v.forEach((x,i)=>visit(x,p+'/'+i));else for(const k of Object.keys(v).sort())visit(v[k],p+'/'+k);}visit(value,'');return aliases;}
function evaluate(payload,current){const g=structuredClone({payload,current}),d=g.payload,c=g.current;
 const ctx=vm.createContext({d,INV:c.inventory,STORAGE:c.storage_before,CRYSTAL_BAG:[],CRYSTAL_DUST:99,STONE_BAG:[],BAG_MAX:99,UPGRADES:c.upgrades,POT_LV:c.pot_levels});
 vm.runInContext(declarations+'\n'+weaponName+'\n'+inventory+bagMax,ctx,{timeout:2000});
 ctx.STORAGE=c.storage_after;vm.runInContext(crystals,ctx,{timeout:2000});
 const plan={inventory:ctx.INV,storage_before:c.storage_before,storage_after:ctx.STORAGE,bag_max:ctx.BAG_MAX,crystal_bag:ctx.CRYSTAL_BAG,crystal_dust:ctx.CRYSTAL_DUST,stone_bag:ctx.STONE_BAG,upgrades:ctx.UPGRADES,pot_levels:ctx.POT_LV};
 return {plan,identities:identities(plan)};
}
const equipped=Object.fromEntries(data.SLOT_NAMES.map(s=>[s,null]));
const base={inventory:{bag:[{id:'current',slot:'weapon',wtype:'sword',name:'current unrenamed',socketCount:1,crystals:[{id:'cr_atk',q:0}],socketQ:[100]}],equipped,ossCollect:{old:1},selected:9},storage_before:{items:[{slot:'bracelet',name:'???',tier:0}]},storage_after:{'0':[{slot:'bracelet',name:'???',tier:0,crystals:[{id:'cr_atk',q:0}]}],_synced:false},upgrades:{hp:3,mp:1,custom:{opaque:1}},pot_levels:{hp:2,retained:7}};
const fixtures=[];
function add(id,fields={},current=base,links=[]){fixtures.push({id,payload:{player:{},...fields},current:structuredClone(current),links});}
function item(it){return {id:71,opaque:{nested:[false,0,'0'],roll:1.25},...it};}
add('no-inv-current-only');
for(const inv of [null,false,0,'',{}, {bag:[],equipped:{}}, {bag:false,equipped:false}, {bag:[],equipped:{},ossCollect:[]}, {bag:[],equipped:{},ossCollect:'bad'}])add('inventory-'+fixtures.length,{inv});
for(const slot of data.SLOT_NAMES)add('slot-'+slot,{inv:{bag:[item({slot,name:'???',tier:2,btype:slot==='bow'?'siege':null,wtype:slot==='weapon'?'sword':null})],equipped:{}}});
add('all-slots',{inv:{bag:[],equipped:Object.fromEntries(data.SLOT_NAMES.map(slot=>[slot,item({slot,name:slot==='shield'?'방패 방패':'???',tier:4,wtype:slot==='weapon'?'axe':null,btype:slot==='bow'?'heavyCrossbow':null})])),ossCollect:{opaque:{x:1}}}});
add('headband-position-difference',{inv:{bag:[],equipped:{headband:item({slot:'headband',name:'???'}),headband2:item({slot:'headband',name:'???'})}}});
for(const slot of ['bracelet','headband'])for(const tier of [0,1,2,3,4,5,'0','3','5',[],true])add('repair-'+fixtures.length,{inv:{bag:[item({slot,name:'???',tier,def:0,eDef:0})]}});
add('repair-truthy-zero',{inv:{bag:[{slot:'bracelet',name:'???',tier:2,def:'0',eDef:0},{slot:'headband',name:'???',tier:2,eDef:'0'}]}});
for(const btype of ['crossbow','repeater','arcane','siege','heavy',0,false,''])add('bow-'+fixtures.length,{inv:{bag:[item({slot:'bow',name:'old',btype})]}});
for(const rarity of [0,1,2,3,4,5,99,'0','2','01','length',false])for(const marker of [0,2,3,'2','3','bad'])add('speed-'+fixtures.length,{inv:{bag:[item({slot:'weapon',wtype:'sword',name:'old',rarity,_spdMig:marker,_nameMig:1,spd:17})]}});
for(const wtype of [...Object.keys(data.WTYPES),'unknown'])for(const tier of [-1,0,1.5,4,7,'2'])add('weapon-name-'+fixtures.length,{inv:{bag:[item({slot:'weapon',wtype,name:'old',el:2,tier,_spdMig:3})]}});
for(const uniqueArt of [null,0,'keep-art',{},[]])add('unique-'+fixtures.length,{inv:{bag:[item({slot:'weapon',wtype:'hammer',name:'unique name',uniqueArt,_nameMig:0}),item({slot:'shield',name:'고유 방패',uniqueArt})]}});
for(const value of [0,null,false,'0',7,{opaque:[1]},[]])add('legacy-affix-'+fixtures.length,{inv:{bag:[item({slot:'ring1',prefix:{name:'old prefix',val:value},suffix:{name:'old suffix',val:value}})]}});
add('affix-find-first',{inv:{bag:[item({affixes:[{id:'legacySuf',value:99},null],suffix:{name:'old',val:8}}),item({affixes:[{id:'new',value:1}],prefix:{name:'ignored',val:9},suffix:{name:'old',val:8}})]}});
for(const q of [null,false,true,0,1,1.5,50,100,101,-1,'50','0','bad',[50]])add('crystal-q-'+fixtures.length,{crystalBag:[{id:'cr_atk',q,opaque:{q:'keep'}}],crystalDust:'0'});
add('all-legacy-ids',{crystalBag:Object.keys(sourceTables._CR_LEGACY_IDS).map(id=>({id,q:50,enh:3,star:2,opaque:id}))});
add('mixed-stones',{stoneBag:[null,false,0,'stone',[],{}, {q:'50'},{q:true},{q:0},{q:1},{q:2.5},{q:100},{q:101},{q:50,custom:{id:1}}]});
for(const count of ['absent',null,0,2,'2'])for(const socketQ of [null,0,'wrong',[],[0],[100,'50',true],[101,-1,50,100]]){
 const it=item({slot:'ring1',crystals:[{id:'cr_atk',q:0},{id:'cr_hp',q:'50'},{id:'new',q:true}],socketQ});if(count!=='absent')it.socketCount=count;
 add('socket-'+fixtures.length,{inv:{bag:[it]}});
}
for(const crystals of [null,false,'opaque',{}])add('non-array-crystals-'+fixtures.length,{inv:{bag:[item({socketCount:2,crystals,socketQ:[100,50]})]}});
for(const bagMax of [null,false,0,'','0','300','bad',[],[3],1.5])add('bag-max-'+fixtures.length,{bagMax});
add('no-storage-transfer',{storage:{'0':[{slot:'weapon',name:'never loaded'}]},crystalDust:{opaque:99}});
for(const upgrades of [null,false,0,'',[],{}, {hp:8,custom:{opaque:9}},'raw-upgrade',5])add('upgrades-'+fixtures.length,{upgrades,potLv:{hp:'0',mp:99,alien:{q:1}}});
add('potion-truthy-value',{potLv:{hp:{opaque:3},unknown:99}});
add('alias-item-and-distinct-duplicate',{inv:{bag:[item({slot:'weapon',wtype:'sword',name:'old',prefix:{name:'p',val:1},suffix:{name:'s',val:2}}),null,item({slot:'weapon',wtype:'sword',name:'old'})],equipped:{}}},base,[{target:['payload','inv','bag',1],source:['payload','inv','bag',0]},{target:['payload','inv','equipped','weapon'],source:['payload','inv','bag',0]}]);
add('alias-crystal-and-stone',{inv:{bag:[item({socketCount:1,crystals:[{id:'cr_mp',q:50}],socketQ:[1]})]},crystalBag:[null],stoneBag:[null]},base,[{target:['payload','crystalBag',0],source:['payload','inv','bag',0,'crystals',0]},{target:['payload','stoneBag',0],source:['payload','inv','bag',0,'crystals',0]}]);
add('before-after-alias',{inv:{bag:[item({slot:'bracelet',name:'???'})]}},base,[{target:['current','storage_before','items',0],source:['payload','inv','bag',0]},{target:['current','storage_after','0',0],source:['payload','inv','bag',0]}]);
function at(g,p){return p.reduce((v,k)=>v[k],g);}function link(g,l){const p=at(g,l.target.slice(0,-1));p[l.target.at(-1)]=at(g,l.source);}
const rows=[];
for(const fixture of fixtures){const g=structuredClone({payload:fixture.payload,current:fixture.current});fixture.links.forEach(l=>link(g,l));const first=evaluate(g.payload,g.current);const secondCurrent={inventory:first.plan.inventory,storage_before:first.plan.storage_after,storage_after:first.plan.storage_after,upgrades:first.plan.upgrades,pot_levels:first.plan.pot_levels};const second=evaluate(g.payload,secondCurrent);rows.push({...fixture,expected:first.plan,identities:first.identities,expected_second:second.plan,second_identities:second.identities,input_identities:identities(g)});}
// QA-only binary64 transport, removed before calling production calculations.
function wire(v){if(typeof v==='number'&&(!Number.isFinite(v)))return {'@number':String(v)};if(typeof v==='number'&&(!Number.isInteger(v)||Math.abs(v)>=1e12)){const b=Buffer.alloc(8);b.writeDoubleLE(v);return {'@f64':b.toString('hex')};}if(Array.isArray(v))return v.map(wire);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,wire(x)]));return v;}
if(sha(fs.readFileSync(file,'utf8'))!==sha(source))throw Error('source changed');
console.log(JSON.stringify(wire({rows,source_tables:sourceTables,provenance,source_hash:sha(source),data_hash:sha(fs.readFileSync(path.join(root,'godot/data/item_generation_tables.json'),'utf8')),source_unchanged:true,actual_storage_reads:0,actual_save_writes:0,actual_server_calls:0,live_restore_calls:0})));
