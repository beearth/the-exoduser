const fs=require('fs'),path=require('path'),crypto=require('crypto');
const arg=k=>{const i=process.argv.indexOf(k);if(i<0)throw Error(k);return path.resolve(process.argv[i+1]);};
const root=arg('--root'),project=arg('--project'),live=arg('--live-root'),res=project+'/Assets/Exoduser/Resources';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),assets=[];
function copy(src,dest){const b=fs.readFileSync(root+'/'+src),current=fs.readFileSync(live+'/'+src);if(hash(b)!==hash(current))throw Error('Live source drift: '+src);const out=res+'/'+dest;fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,b);if(hash(fs.readFileSync(out))!==hash(b))throw Error(out);assets.push({source:src,destination:dest,sha256:hash(b),bytes:b.length});}
copy('img/ui/inventory_knight_cutout_20260928.png','Art/ui/inventory/knight.png');
copy('img/ui/ossuary_socket_hf_v2.png','Art/ui/inventory/socket.png');
copy('img/ui/hell_gothic/iron.png','Art/ui/inventory/iron.png');
const seed=fs.readFileSync(project+'/Tools/inventory-oracle/inventory-seed.json','utf8'),data=JSON.parse(seed);
const vm=require('vm'),acorn=require(require.resolve('acorn',{paths:[live]}));
const source=fs.readFileSync(root+'/godot/source_snapshot/game.html','utf8'),liveSource=fs.readFileSync(live+'/game.html','utf8');
function expression(name,s){const m=new RegExp('const\\s+'+name+'\\s*=').exec(s);if(!m)throw Error(name);const n=acorn.parseExpressionAt(s,m.index+m[0].length,{ecmaVersion:'latest'});return s.slice(n.start,n.end);}
function original(name){const expr=expression(name,source);if(expr!==expression(name,liveSource))throw Error('Live UI label drift '+name);return vm.runInNewContext('('+expr+')',{}, {timeout:5000});}
const descriptions=original('_AFFIX_DESC'),affixNames=original('AFFIX_NAMES_KO'),pool=original('AFFIX_POOL');
const ids=[...new Set(data.bag.flatMap(it=>it.affixes.map(a=>a.id)))];
const labels=ids.map(id=>{const row=pool.find(a=>a.id===id),name=descriptions[id]||affixNames[id];if(!row||!name)throw Error('Missing original label '+id);return{id,name,unit:row.unit};});
const cutouts=new Set(['armor','axe','belt','boots','bracelet','cape','crossbow','earring','gloves','helmet','necklace','pants','shield','sword']);
const els=['phys','fire','ice','dark','light','holy','earth'],copied=new Set(),icons=[];
for(const it of [...data.equipped,...data.bag].filter(Boolean)){
 let base=it.wtype||it.btype||it.slot;if(base==='ring1'||base==='ring2')base='ring';if(base==='headband'||base==='headband2')base='earring';
 const el=it.el===1?'phys':els[it.el]||'phys';
 const src=cutouts.has(base)?'img/ui/item-cutouts/'+base+'_phys_cutout.png':'output/imagegen/item-skins/'+base+'_'+el+'.png';
 const key=base+'_'+(cutouts.has(base)?'cutout':el),resource='Art/ui/inventory/items/'+key;
 if(!copied.has(src)){copy(src,resource+'.png');copied.add(src);}icons.push({slot:it.slot,wtype:it.wtype||'',btype:it.btype||'',el:it.el,resource});
}
fs.mkdirSync(res+'/Data',{recursive:true});fs.writeFileSync(res+'/Data/inventory_seed.json',seed);fs.writeFileSync(res+'/Data/inventory_icons.json',JSON.stringify({icons}));fs.writeFileSync(res+'/Data/inventory_labels.json',JSON.stringify({labels}));
fs.writeFileSync(res+'/Data/inventory_empty_slots.json',JSON.stringify({slots:data.equipped.map((it,i)=>it==null?i:-1).filter(i=>i>=0)}));
const receipt={schema:'exoduser.unity.inventory-assets.v1',seedSha256:hash(Buffer.from(seed)),assets};
fs.writeFileSync(project+'/Tools/Fixtures/inventory-assets.json',JSON.stringify(receipt,null,2));console.log(JSON.stringify({count:assets.length,bytes:assets.reduce((s,a)=>s+a.bytes,0),seed:receipt.seedSha256}));
