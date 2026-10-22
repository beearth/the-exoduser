'use strict';
// NW-01: execute only the unchanged MAP_OBJS loop and distance/gate excerpts.
// All state/effects below are isolated memory fixtures. No game boot or user storage.
const fs = require('node:fs');
const vm = require('node:vm');
const crypto = require('node:crypto');
const SOURCE_SHA = 'dee094fd165e9b2fb3fbf0eb9cacc3bc3eddeb2c8eeea9c4772ba6cbc1f05209';
const FRAGMENT_SHA = '9eea8397b33211a9a7b4ba18372d4fb60a5ab6cffa497687254d47b66d6c265f';
const sha = data => crypto.createHash('sha256').update(data).digest('hex');
function main() {
  if ((process.argv.length !== 3 && process.argv.length !== 4)) throw Error('usage: node nw01_world_interaction_oracle.cjs <game.html> [utf8-output.json]');
  const bytes = fs.readFileSync(process.argv[2]), html = bytes.toString('utf8');
  if (sha(bytes) !== SOURCE_SHA) throw Error('current game.html source hash differs: review source before changing expectations');
  const unique = marker => {
    const at = html.indexOf(marker);
    if (at < 0 || html.indexOf(marker, at + marker.length) !== -1) throw Error('missing/duplicate source marker: ' + marker);
    return at;
  };
  const start = unique('    // MAP_OBJS 상호작용 (우선)'), end = unique('    // 보물상자 체크 (우선)');
  const loop = html.slice(start, end);
  if (end <= start || sha(loop) !== FRAGMENT_SHA) throw Error('MAP loop hash differs');
  const dst = html.split('\n')[31722];
  const gate = html.split('\n')[32826];
  if (dst !== 'function dst(a,b,c,d){return Math.sqrt((c-a)**2+(d-b)**2)}' || gate !== '  if(_interactPressed&&!_usePlayerPortal()){') throw Error('distance/gate excerpt differs');
  const cases = [];
  const add = (name, objects, player = {x: 0, y: 0}, pressed = true, portal = false) => cases.push({name, player, objects, pressed, portal});
  for (const type of ['bonfire','lore','breakable','altar']) {
    const radius = type === 'breakable' ? 50 : 60;
    for (const distance of [0, radius-.001, radius, radius+.001, 100, -radius+.001]) {
      add(type+'-distance-'+distance, [{type,x:distance,y:0,read:false,used:false,alive:true,hp:3}]);
    }
    const diagonal = type === 'breakable' ? [30,40] : [36,48];
    add(type+'-diagonal-boundary', [{type,x:diagonal[0],y:diagonal[1],alive:true,hp:3}]);
    add(type+'-negative-fractional', [{type,x:-10.25,y:-20.5,alive:true,hp:3}], {x:-10.5,y:-20.75});
    add(type+'-huge-finite', [{type,x:1e200,y:0,alive:true,hp:3}]);
    add(type+'-number-precision', [{type,x:9007199254740992,y:0,alive:true,hp:3}], {x:9007199254740992,y:0});
    if(type!=='bonfire') {
      const key = type==='lore'?'read':type==='altar'?'used':'alive';
      for (const flag of [false,true,null,'missing']) {
        const entry={type,x:0,y:0,hp:3}; if(flag!=='missing')entry[key]=flag;
        add(type+'-flag-'+String(flag), [entry]);
      }
    }
  }
  add('bonfire-lit-repeats',[{type:'bonfire',x:0,y:0,lit:true}]);
  add('bonfire-unused-flags-ignored',[{type:'bonfire',x:0,y:0,read:'bad',used:1,alive:{}}]);
  for(const type of ['trap','m_c1altar','unknown','']) add('ignore-'+type,[{type,x:'not-read',y:null,read:'not-read'}]);
  add('empty',[]);
  for (const first of ['bonfire','lore','breakable','altar']) for (const second of ['bonfire','lore','breakable','altar']) {
    add('ordered-'+first+'-'+second,[{type:first,x:49,y:0,alive:true,hp:3},{type:second,x:0,y:0,alive:true,hp:3}]);
    add('tie-'+first+'-'+second,[{type:first,x:0,y:0,alive:true,hp:3},{type:second,x:0,y:0,alive:true,hp:3}]);
  }
  for (const first of [{type:'lore',read:true},{type:'altar',used:true},{type:'breakable',alive:false},{type:'breakable',alive:null},{type:'breakable'}]) {
    add('skip-inactive-'+JSON.stringify(first),[{...first,x:'not-read',y:null},{type:'lore',x:0,y:0}]);
  }
  for(const pressed of [false,true])for(const portal of [false,true]) add('gate-'+pressed+'-'+portal,[{type:'lore',x:0,y:0}],{x:0,y:0},pressed,portal);
  // The following inputs deliberately exercise short-circuit boundaries only.
  add('matched-before-null',[{type:'lore',x:0,y:0},null]);
  add('matched-before-bad-type',[{type:'lore',x:0,y:0},{type:4}]);
  add('inactive-gate-malformed',null,null,false,false);
  add('portal-used-malformed',null,null,true,true);
  const results = cases.map(c => {
    let selected=null, randomCalls=0, portalCalls=0;
    const clone = c.objects === null ? null : structuredClone(c.objects);
    const objects = clone?.map((entry,i) => entry && typeof entry==='object' ? new Proxy(entry, {
      set(target,key,value) { if(selected===null)selected=i;target[key]=value;return true; },
    }) : entry);
    const math=Object.create(Math);math.random=()=>{randomCalls++;return .25;};
    const ctx=vm.createContext({_interactPressed:c.pressed,_usePlayerPortal:()=>{portalCalls++;return c.portal;},MAP_OBJS:objects,
      P:{hp:1,mhp:10,st:1,mst:10,mp:1,mmp:10,shield:0,mshield:10,...c.player},G:{mats:0},Math:math,_mmDirty:0,
      addTxt(){},addParts(){},_T:x=>x,SFX:{pickup(){}},addPotion:()=>true});
    vm.runInContext(dst+'\n'+gate+'\n'+loop+'\n}',ctx,{timeout:1000});
    return {...c,expected:{ready:true,matched:selected!==null,source_index:selected,type:selected===null?null:c.objects[selected].type,reason:null,source:'game.html:32829–32853'},oracle_random_calls:randomCalls,oracle_portal_calls:portalCalls};
  });
  require('./oracle_json_output.cjs')({source:{file:'game.html',source_sha256:SOURCE_SHA,start_line:32828,end_line:32853,fragment_sha256:FRAGMENT_SHA,connected:false},
    fragments:{loop,distance:dst,gate},cases:results,real_storage_io:false,real_game_booted:false});
}
try { main(); } catch(error) { console.error(error.stack); process.exitCode=1; }
