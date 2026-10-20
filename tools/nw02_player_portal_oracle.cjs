'use strict';
// Execute unchanged source functions/reset prefixes against isolated memory fixtures.
const fs=require('node:fs'), vm=require('node:vm'), crypto=require('node:crypto');
const SHA='4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4';
const HASHES={portal:'4eae4f08342dd95a93c73982f266bec0cf7eb4a54237d4574190aa9d9a1ddfef',zone:'f40e474853944e22a8b061012e87de7f5e6f8203648049c5bfcb2bef50f5e709',stage:'93b474eb82a9f95adf990e43797693ad53291847f6e3e598b460e5d5ad165353',distance:'424ecda76b94d6843cbf78ff261ed8431fb7e3c5c08d15d1b7d30cf457adf062',tile:'51b0c122d4b59b86d79dd16f19b5dfd139a78b8739bfd0e4bb84015c286a6eeb'};
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
function main(){
 if((process.argv.length!==3 && process.argv.length!==4))throw Error('usage: node nw02_player_portal_oracle.cjs <game.html> [utf8-output.json]');
 const bytes=fs.readFileSync(process.argv[2]),text=bytes.toString('utf8'),lines=text.split('\n');
 if(sha(bytes)!==SHA)throw Error('current game.html hash differs; review source');
 for(const marker of ['function _placePlayerPortal(){','function _usePlayerPortal(){','function _loadZone(zid,sx,sy){','function initStage(si){']){
  const at=text.indexOf(marker);if(at<0||text.indexOf(marker,at+marker.length)>=0)throw Error('missing/duplicate marker '+marker);
 }
 const fragments={portal:lines.slice(18308,18322).join('\n')+'\n',zone:lines.slice(30159,30161).join('\n')+'\n',stage:lines.slice(31533,31535).join('\n')+'\n',distance:lines[31722],tile:lines[16630]};
 for(const key of Object.keys(HASHES))if(sha(fragments[key])!==HASHES[key])throw Error('source fragment differs '+key);
 const p=(x=0,y=0)=>({x,y,vx:7,vy:-9,s:'idle',extra:{keep:1}}),a=(x,y)=>({x,y});
 const base=()=>({on:true,map_present:true,player:p(),pair:null,cam:{x:9,y:8,extra:'keep'}});
 const cases=[];
 const add=(name,action,patch={})=>cases.push({name,action,snapshot:{...base(),...patch}});
 for(const on of [false,true])for(const map_present of [false,true])for(const state of ['idle','dead','fallen']){
  const player=p(10,20);player.s=state;add(`place-gates-${on}-${map_present}-${state}`,'place',{on,map_present,player});
 }
 add('place-no-player','place',{player:null,pair:42});
 add('place-gate-skips-malformed','place',{on:false,map_present:null,player:42,pair:42});
 add('place-map-skips-malformed','place',{map_present:false,player:42,pair:42});
 for(const pair of [null,[a(1,2),a(3,4)],[null,null],[{},null,42]])add('place-restart-'+JSON.stringify(pair),'place',{pair,player:p(-12.5,27.25)});
 for(const [x,y] of [[0,0],[199.999,0],[200,0],[200.001,0],[-199.999,0],[-200,0],[120,160],[120,159.999],[1e200,0],[9007199254740992,0]]){
  add('place-separation-'+x+'-'+y,'place',{pair:[a(0,0)],player:p(x,y)});
 }
 add('place-offset','place',{pair:[a(-123.25,80.5)],player:p(76.75,80.5)});
 for(const pair of [null,[],[a(0,0)],[null,null,null]])add('use-inactive-'+JSON.stringify(pair),'use',{pair,player:null,cam:42});
 for(const [x,y] of [[0,0],[87.999,0],[88,0],[88.001,0],[-87.999,0],[-88,0],[52.8,70.4],[52.8,70.399],[1e200,0]]){
  add('use-radius-'+x+'-'+y,'use',{pair:[a(0,0),a(400,20)],player:p(x,y)});
 }
 for(const cam of [null,false,{}, {x:'overwritten',y:null,keep:8}])for(const [x,y]of[[0,0],[400,20]]){
  add('use-cam-'+JSON.stringify(cam)+'-'+x,'use',{pair:[a(0,0),a(400,20)],player:p(x,y),cam});
 }
 add('use-first-not-nearest','use',{pair:[a(80,0),a(1,0)]});
 add('use-first-tie','use',{pair:[a(0,0),a(0,0)]});
 add('use-no-near-skips-cam','use',{pair:[a(200,0),a(400,20)],cam:42});
 add('use-ignores-place-gates','use',{pair:[a(0,0),a(400,20)],on:false,map_present:false,player:{...p(),s:'dead'}});
 add('use-offset-fractional','use',{pair:[a(-12.25,-4.5),a(-400.75,127.125)],player:p(-12.25,-4.5)});
 for(const pair of [null,[],[a(1,2)],[a(1,2),a(3,4)]]){
  for(const zone_available of [false,true])cases.push({name:'zone-reset-'+JSON.stringify(pair)+'-'+zone_available,action:'load_zone',zone_available,snapshot:{...base(),pair}});
  cases.push({name:'stage-reset-'+JSON.stringify(pair),action:'init_stage',snapshot:{...base(),pair}});
 }
 const results=cases.map(c=>{
  const snapshot=structuredClone(c.snapshot),commands=[];
  const recordSet=path=>(obj,key,value)=>{commands.push({op:'set',path:path+'.'+key,value:structuredClone(value)});obj[key]=value;return true;};
  const pair=Array.isArray(snapshot.pair)?new Proxy(snapshot.pair,{get(obj,key,receiver){
   if(key==='push')return point=>{commands.push({op:'append',path:'G._playerPortalPair',value:structuredClone(point)});return obj.push(point);};
   return Reflect.get(obj,key,receiver);
  }}):snapshot.pair;
  const rawG={on:snapshot.on,map:snapshot.map_present?{}:null,_playerPortalPair:pair,
   _zones:c.zone_available?{target:{}}:null,cam:snapshot.cam&&typeof snapshot.cam==='object'?new Proxy(snapshot.cam,{set:recordSet('G.cam')}):snapshot.cam};
  const G=new Proxy(rawG,{set:recordSet('G')}),P=snapshot.player&&typeof snapshot.player==='object'?new Proxy(snapshot.player,{set:recordSet('P')}):snapshot.player;
  const ctx=vm.createContext({G,P,_L:(ko,en)=>({ko,en}),_T:key=>({key}),
   showPH:(...args)=>commands.push({op:'showPH',args}),addParts:(...args)=>commands.push({op:'addParts',args}),addTxt:(...args)=>commands.push({op:'addTxt',args}),_resetInteractInput:()=>commands.push({op:'_resetInteractInput',args:[]})});
  const src=fragments.tile+'\n'+fragments.distance+'\n'+fragments.portal+
   '\nfunction resetZone(zid){\n'+fragments.zone+'}\nfunction resetStage(){\n'+fragments.stage+'}\n';
  vm.runInContext(src,ctx,{timeout:1000});
  const result=vm.runInContext(c.action==='place'?'_placePlayerPortal()':c.action==='use'?'_usePlayerPortal()':c.action==='load_zone'?'resetZone("target")':'resetStage()',ctx,{timeout:1000});
  const source={place:'game.html:18309–18315',use:'game.html:18316–18322',load_zone:'game.html:30160–30161',init_stage:'game.html:31534–31535'}[c.action];
  return {...c,expected:{ready:true,reason:null,source,source_return:result===undefined?'undefined':result,commands},
   after:{pair:structuredClone(rawG._playerPortalPair===pair?snapshot.pair:rawG._playerPortalPair),player:snapshot.player,cam:snapshot.cam}};
 });
 require('./oracle_json_output.cjs')({source_sha256:SHA,hashes:HASHES,fragments,cases:results,real_game_booted:false,real_storage_io:false});
}
try{main();}catch(e){console.error(e.stack);process.exitCode=1;}
