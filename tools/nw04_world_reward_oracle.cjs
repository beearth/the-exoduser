'use strict';
// Execute unchanged latest-main source bodies. Only external dependency fixtures
// are stubbed; this is not a browser, live factory, audio or storage integration.
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const SHA='4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4';
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const clone=x=>JSON.parse(JSON.stringify(x));
const html=fs.readFileSync(process.argv[2],'utf8'),lines=html.split('\n');
if(hash(html)!==SHA)throw Error('latest-main source SHA differs; review source');
const unique=m=>{const i=html.indexOf(m);if(i<0||html.indexOf(m,i+m.length)>=0)throw Error('marker '+m);return i;};
const loop=html.slice(unique('    let chestOpened=false;'),unique('    // HP 드롭 수동 줍기 (가장 가까운 것)'));
const push=lines[16720],distance=lines[31722],slots=lines[15175],gate=lines[32826];
if(!push.startsWith('function _wiPush(wi){worldItems.push(wi);')||!slots.startsWith('const SLOT_NAMES=')||gate!=='  if(_interactPressed&&!_usePlayerPortal()){')throw Error('source references differ');
const SOURCE='game.html:32855-32911;16721';
const p={x:10.25,y:20.5};
const item=(rarity,id='old')=>({type:'item',x:0,y:0,item:{rarity,id},picked:false});
const wi=(type,extra={})=>({type,x:11.5,y:21.25,...extra});
const cases=[];
function add(name,inputObjects,options={}){
 const c={name,player:p,objects:inputObjects,pressed:true,portal:false,...options};
 const commands=[],tape=[];let selected=null,outer=0,cursor=0;
 const objects=clone(c.objects),pet=clone(c.pet_tut||{}),g={stage:c.stage??0,mats:c.mats??10};
 const call=(name,args=[])=>commands.push({op:'call',name,args:clone(args)});
 const raw=()=>{const v=(c.samples&&cursor<c.samples.length)?c.samples[cursor]:(c.sample??.5);cursor++;return v;};
 const dependency=(name,args,value,internal_rng=[])=>{const receipt={name,args:clone(args),value:clone(value),internal_rng};tape.push(receipt);commands.push({op:'dependency',receipt:clone(receipt)});return value;};
 const records=objects.map((o,i)=>new Proxy(o,{set(t,k,v){if(selected===null)selected=i;commands.push({op:'set',path:'it.'+k,value:v});t[k]=v;return true;}}));
 const math=Object.create(Math);math.random=()=>{outer++;return dependency('Math.random',[],raw());};
 const ctx=vm.createContext({Math:math,P:clone(c.player),
  G:new Proxy(g,{set(t,k,v){commands.push({op:'set',path:'G.'+k,value:v});t[k]=v;return true;}}),
  OPT:{shake:c.shake??100},worldItems:records,EL:{P:0,F:1,I:2,D:3,L:4,H:5},
  _petTut:new Proxy(pet,{set(t,k,v){commands.push({op:'set',path:'_petTut.'+k,value:v});t[k]=v;return true;}}),
  window:c.chest3d?{_chest3d:{open:()=>call('_chest3d.open')}}:{},
  SFX:{victory:()=>call('SFX.victory'),pickup:()=>call('SFX.pickup')},
  _T:x=>x,_L:(ko,en)=>ko,addTxt:(...a)=>call('addTxt',a),addParts:(...a)=>call('addParts',a),_petSayCD:(...a)=>call('_petSayCD',a),
  mkItem:(...a)=>{const internal=[raw(),raw()];return dependency('mkItem',a,{slot:a[0],tier:a[1],el:a[2],rarity:a[3],fixture_nonce:internal},internal);},
  playItemDropSfx:(...a)=>dependency('playItemDropSfx',a,null,c.sound_limited?[]:[raw()]),
  addPotion:(...a)=>dependency('addPotion',a,c.potion_return??true),
  _interactPressed:c.pressed,_usePlayerPortal:()=>c.portal
 });
 vm.runInContext(push+'\nconst _rawPush=_wiPush;_wiPush=wi=>{recordAdmission(wi);_rawPush(wi)};',ctx,{timeout:1000});
 ctx.recordAdmission=record=>commands.push({op:'admit',record:clone(record)});
 vm.runInContext(slots+'\n'+distance+'\n'+gate+'\n'+loop+'\n}',ctx,{timeout:1000});
 const matched=selected!==null;
 cases.push({name:c.name,player:c.player,objects:c.objects,pressed:c.pressed,portal:c.portal,
  dependencies:{stage:c.stage??0,mats:c.mats??10,shake:c.shake??100,chest3d:!!c.chest3d,pet_tut:c.pet_tut||{},tape},
  expected:{ready:true,matched,source_index:selected,type:matched?c.objects[selected].type:null,reason:null,commands,
   rng_consumed:outer,receipts_consumed:tape.length,world_items_after:matched?clone(records):null,
   mats_after:matched?g.mats:null,pet_tut_after:matched?pet:null,source:SOURCE}});
}
add('large-native-integer-mats',[wi('chest')],{mats:9007199254740992});
add('empty',[]);add('unknown',[{type:'trap'}]);
for(const pressed of [true,false])for(const portal of [true,false])add('gate-'+pressed+portal,[wi('chest')],{pressed,portal});
for(const type of ['chest','debris'])for(const delta of [-1e-7,0,1e-7]){
 const radius=type==='chest'?60:50;
 add(type+'-strict-'+delta,[wi(type,{x:p.x+radius+delta,y:p.y})]);
 add(type+'-negative-strict-'+delta,[wi(type,{x:p.x-radius-delta,y:p.y})]);
}
for(const type of ['chest','debris']){
 add(type+'-first-array-not-nearest',[wi(type,{x:p.x+40}),wi(type)]);
 add(type+'-picked',[wi(type,{picked:true,x:null}),wi(type)]);
 add(type+'-nullflags',[wi(type,{picked:null,opened:null})]);
 add(type+'-repeat',[wi(type,{picked:type==='debris',opened:type==='chest'})]);
}
add('chest-before-earlier-debris',[wi('debris'),wi('chest')]);
add('opened-chest-then-debris',[wi('chest',{opened:true,x:null}),wi('debris',{debTier:2})]);
for(const stage of [-20,-.75,0,1,10,20,40,2147483648.75,4294967297.75]){
 for(const sample of [0,.15-1e-9,.15,.2-1e-9,.2,.4-1e-9,.4,.5-1e-9,.5,.7-1e-9,.7,1-Number.EPSILON]){
  add('chest-stage-'+stage+'-sample-'+sample,[wi('chest')],{stage,sample,chest3d:true});
 }
}
for(const tier of [0,1,2])for(const stage of [-3.75,0,7.25,4294967297.75])for(const sample of [0,.1-1e-9,.1,.2-1e-9,.2,.4-1e-9,.4,.5-1e-9,.5,1-Number.EPSILON]){
 add('debris-'+tier+'-'+stage+'-'+sample,[wi('debris',{debTier:tier})],{stage,sample});
}
for(const stage of [0,10,20,100]){
 const stgB=Math.min(stage*.015,.30),leg=Math.min(.15+stgB*.5,.4),hero=Math.min(.25+stgB*.4,.35);
 for(const threshold of [leg,leg+hero,leg+hero+.3])for(const offset of [-1e-9,0,1e-9]){
  add('chest-rarity-threshold-'+stage+'-'+threshold+'-'+offset,[wi('chest')],{stage,sample:threshold+offset});
 }
}
for(const type of ['chest','debris'])for(const potion_return of [true,false])for(const sound_limited of [true,false]){
 add('receipt-'+type+potion_return+sound_limited,[wi(type,{debTier:2})],{sample:.2,potion_return,sound_limited,pet_tut:{firstChest:true,firstDebris:true}});
 add('interleaved-'+type+potion_return+sound_limited,[wi(type,{debTier:2})],{samples:[.99,.12,.99,.2,.32,.77,.15,.8,.9,.01,.67,.04,.3,.1,.2,.7,.1,.2,.3,.4,.5],sample:.2,potion_return,sound_limited});
}
for(const count of [19,20,21,24]){
 add('opened-chest-cap-alias-'+count,[wi('chest'),...Array.from({length:count-1},(_,i)=>item(i%5,'old'+i))],{sample:.2});
 add('debris-cap-alias-'+count,[wi('debris',{debTier:2}),...Array.from({length:count-1},(_,i)=>item(i%5,'old'+i))],{sample:.2});
}
const admissions=[];
function admission(name,records,incoming){
 const commands=[],items=clone(records),record=clone(incoming);
 const proxied=new Proxy(items,{set(t,k,v){
  if(k==='length'){if(v<t.length)commands.push({op:'resize',length:v});}
  else if(/^\d+$/.test(k)){commands.push(Number(k)===t.length?{op:'append',record:clone(v)}:{op:'swap_tail',index:Number(k),tail_index:t.length-1});}
  t[k]=v;return true;
 }});
 const ctx=vm.createContext({worldItems:proxied,playItemDropSfx:(...args)=>commands.push({op:'call',name:'playItemDropSfx',args})});
 vm.runInContext(push,ctx);ctx.incoming=record;vm.runInContext('_wiPush(incoming)',ctx,{timeout:1000});
 admissions.push({name,records,incoming,expected:{ready:true,reason:null,world_items_after:items,commands}});
}
for(const n of [0,19,20,21,25])for(const rarity of [-1,0,1,4]){
 for(const preview of [false,true])admission('cap-'+n+'-'+rarity+'-'+preview,Array.from({length:n},(_,i)=>item(i%5,'i'+i)),{...item(rarity,'new'),_dropPreview:preview});
}
for(const flag of [{},{picked:false,opened:false},{opened:true},{picked:true},{picked:true,opened:'unread'}]){
 admission('chest-special-'+JSON.stringify(flag),[wi('chest',{id:'first',...flag}),...Array.from({length:19},(_,i)=>item(4,'i'+i))],item(2,'new'));
}
admission('all-infinity-default-index0',Array.from({length:20},(_,i)=>wi('chest',{id:i})),wi('chest',{id:'new'}));
admission('strict-tie-swap-tail',[...Array.from({length:20},(_,i)=>item(2,'i'+i))],item(3,'new'));
admission('nonitem-minus1',[wi('hp'),wi('debris'),...Array.from({length:18},(_,i)=>item(0,i))],wi('trap'));
admission('nullitem-rank0',[wi('item',{item:null}),...Array.from({length:19},(_,i)=>item(1,i))],item(4,'new'));
admission('missing-rarity-rank0',[wi('item',{item:{}}),...Array.from({length:19},(_,i)=>item(1,i))],item(4,'new'));
admission('preview-suppresses-only-sound',Array.from({length:20},(_,i)=>item(4,i)),{...item(0,'new'),_dropPreview:true});
const hpBody=lines.slice(28250,28258).join('\n'),hp=[];
for(const count of [1,2]){
 const ctx=vm.createContext({G:{mats:10},P:{x:0,y:0},SFX:{pickup(){}},addTxt(){}});
 const value=vm.runInContext('(function(type,count){\n'+hpBody+'\n})("hp",'+count+')',ctx);
 if(value!==true||ctx.G.mats!==10+count)throw Error('actual HP source dependency differs');
 hp.push({count,value,mats_delta:ctx.G.mats-10});
}
// Godot JSON decimal conversion is not an IEEE-754 identity transport.
// Encode every finite number as its exact little-endian binary64 hex.
function wire(value){
 if(typeof value==='number'){const b=Buffer.alloc(8);b.writeDoubleLE(value);return {_f64:b.toString('hex')};}
 if(Array.isArray(value))return value.map(wire);
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,wire(v)]));
 return value;
}
process.stdout.write(JSON.stringify(wire({source_sha256:SHA,fragments:{loop,push,slots,distance,gate,hpBody},
 fragment_hashes:{loop:hash(loop),push:hash(push),slots:hash(slots),hpBody:hash(hpBody)},cases,admissions,hp,
 real_game_booted:false,real_factory_called:false,real_storage_io:false})));
