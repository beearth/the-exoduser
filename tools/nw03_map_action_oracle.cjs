'use strict';
// NW-03: unchanged source loop, explicit dependency fixtures, ordered event trace.
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const SHA='dee094fd165e9b2fb3fbf0eb9cacc3bc3eddeb2c8eeea9c4772ba6cbc1f05209';
const LOOP_SHA='9eea8397b33211a9a7b4ba18372d4fb60a5ab6cffa497687254d47b66d6c265f';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function main(){
 if((process.argv.length!==3 && process.argv.length!==4))throw Error('usage: node nw03_map_action_oracle.cjs <game.html> [utf8-output.json]');
 const bytes=fs.readFileSync(process.argv[2]),html=bytes.toString('utf8'),lines=html.split('\n');
 if(hash(bytes)!==SHA)throw Error('source hash differs; review latest main');
 const unique=m=>{const at=html.indexOf(m);if(at<0||html.indexOf(m,at+m.length)>=0)throw Error('missing/duplicate marker '+m);return at;};
 const loop=html.slice(unique('    // MAP_OBJS 상호작용 (우선)'),unique('    // 보물상자 체크 (우선)'));
 if(hash(loop)!==LOOP_SHA)throw Error('loop hash differs');
 const distance=lines[31722],gate=lines[32826];
 if(distance!=='function dst(a,b,c,d){return Math.sqrt((c-a)**2+(d-b)**2)}'||gate!=='  if(_interactPressed&&!_usePlayerPortal()){')throw Error('distance/gate differs');
 const p=()=>({x:10.25,y:20.5,hp:1,mhp:100,st:2,mst:60,mp:3,mmp:40,shield:0,mshield:12,keep:{v:1}});
 const mo=type=>({type,x:11.5,y:21.25,read:false,used:false,alive:true,hp:3,loot:'none',keep:{v:2}});
 const cases=[];
 const add=(name,objects,player=p(),dependencies={mats:10,random_sample:0,add_potion_return:true},pressed=true,portal=false)=>cases.push({name,objects,player,dependencies,pressed,portal});
 add('lore', [mo('lore')]);add('lore-read',[{...mo('lore'),read:true}]);
 add('lore-textIdx-is-not-body',[{...mo('lore'),textIdx:999}]);
 for(const loot of ['mat','potion','none','unknown',null])for(const hp of [3,2,1,0,-3,.5]){
  add('break-'+loot+'-'+hp,[{...mo('breakable'),hp,loot}]);
 }
 for(const sample of [0,1/3-1e-10,1/3,2/3-1e-10,2/3,1-Number.EPSILON]){
  for(const mats of [0,10.5,-4,9007199254740992])add('mat-'+sample+'-'+mats,[{...mo('breakable'),hp:1,loot:'mat'}],p(),{random_sample:sample,mats});
  for(const prev of ['missing',null,false,0,-.3,.4]){
   const player=p();if(prev!=='missing')for(const stat of ['_altAtk','_altDef','_altSpd'])player[stat]=prev;
   add('altar-'+sample+'-'+prev,[mo('altar')],player,{random_sample:sample});
  }
 }
 for(const loot of [true,false,0,1,{},[]])add('broken-non-string-loot-'+JSON.stringify(loot),[{...mo('breakable'),hp:1,loot}],p(),null);
 add('potion-false-contract-only',[{...mo('breakable'),hp:1,loot:'potion'}],p(),{add_potion_return:false});
 add('alive-false',[{...mo('breakable'),alive:false,hp:'ignored'}]);
 add('used-altar',[{...mo('altar'),used:true}],p(),null);
 for(const lit of [false,true])add('bonfire-'+lit,[{...mo('bonfire'),lit}],p(),null);
 add('bonfire-maxima-negative',[mo('bonfire')],{...p(),mhp:-1,mst:0,mmp:.25,mshield:0},null);
 add('unselected-invalid-buff',[mo('altar')],{...p(),_altDef:'unread',_altSpd:{}},{random_sample:0});
 for(const first of ['lore','breakable','altar','bonfire'])for(const second of ['lore','breakable','altar','bonfire'])add('first-'+first+'-'+second,[mo(first),mo(second)]);
 for(const kind of ['lore','breakable','altar','bonfire']){
  const radius=kind==='breakable'?50:60;
  for(const d of [radius-.001,radius,radius+.001])add('distance-'+kind+'-'+d,[{...mo(kind),x:10.25+d,y:20.5}]);
 }
 add('empty',[]);add('unknown',[{type:'trap',x:'unread'}]);
 for(const pressed of [false,true])for(const portal of [false,true])add('gate-'+pressed+'-'+portal,[mo('lore')],p(),null,pressed,portal);
 add('first-hit-ignores-later-malformed',[mo('lore'),null]);
 const results=cases.map(c=>{
  const player=structuredClone(c.player),objects=structuredClone(c.objects),commands=[];let selected=null,rng=0;
  const set=path=>(obj,key,value)=>{commands.push({op:'set',path:path+'.'+key,value});obj[key]=value;return true;};
  const P=new Proxy(player,{set:set('P')}),G=new Proxy({mats:c.dependencies?.mats},{set:set('G')});
  const MAP_OBJS=objects.map((o,i)=>o&&typeof o==='object'?new Proxy(o,{set(obj,key,value){if(selected===null)selected=i;return set('mo')(obj,key,value);}}):o);
  const math=Object.create(Math);math.random=()=>{rng++;const sample=c.dependencies?.random_sample;if(typeof sample!=='number')throw Error('unprovided random sample');commands.push({op:'random',sample});return sample;};
  const ctx=vm.createContext({P,G,MAP_OBJS,Math:math,_interactPressed:c.pressed,_usePlayerPortal:()=>c.portal,_T:key=>({key}),
   addParts:(...args)=>commands.push({op:'addParts',args}),addTxt:(...args)=>commands.push({op:'addTxt',args}),SFX:{pickup:()=>commands.push({op:'SFX.pickup',args:[]})},
   addPotion:(...args)=>{const result=c.dependencies?.add_potion_return;if(typeof result!=='boolean')throw Error('unprovided addPotion result');commands.push({op:'addPotion',args,expected_return:result});return result;}});
  Object.defineProperty(ctx,'_mmDirty',{set(value){commands.push({op:'set',path:'_mmDirty',value});},get(){return 0;},configurable:true});
  vm.runInContext(distance+'\n'+gate+'\n'+loop+'\n}',ctx,{timeout:1000});
  return {...c,expected:{ready:true,matched:selected!==null,source_index:selected,type:selected===null?null:c.objects[selected].type,reason:null,commands,rng_consumed:rng,source:'game.html:32829–32853',break_scope:selected===null?null:'map_objs'},after:{player,objects,mats:G.mats??null}};
 });
 // Separate source evidence: current HP addPotion does NOT create a potion inventory item.
 const hpBody=lines.slice(28250,28258).join('\n');
 if(!hpBody.includes("if(type==='hp')")||!hpBody.includes('G.mats+=count'))throw Error('HP dependency excerpt differs');
 const hpCtx=vm.createContext({G:{mats:10},P:{x:0,y:0},SFX:{pickup(){}},addTxt(){}});
 const hpReturn=vm.runInContext('(function(type,count){\n'+hpBody+'\n})("hp",1)',hpCtx);
 if(hpReturn!==true||hpCtx.G.mats!==11)throw Error('HP actual source observation differs');
 require('./oracle_json_output.cjs')({source_sha256:SHA,fragment_sha256:LOOP_SHA,fragments:{loop,distance,gate,hpBody},cases:results,hp_actual_source:{return_value:hpReturn,mats_after:hpCtx.G.mats,mats_before:10},real_game_booted:false,real_storage_io:false,dependency_body_in_proposal:false});
}
try{main();}catch(e){console.error(e.stack);process.exitCode=1;}
