const fs=require('fs'),vm=require('vm'),crypto=require('crypto');const root=process.argv[2];if(!root||!process.argv[3])throw Error('Pass source-root and oracle-output');
const source=fs.readFileSync(root+'/godot/source_snapshot/game.html','utf8'),m=JSON.parse(fs.readFileSync(root+'/godot/data/map.json'));
const start=source.indexOf('const _CH1_HILL='),end=source.indexOf('\n',source.indexOf('function canMv(',start));
if(start<0||end<0)throw Error('Original collision source range missing');
const G={stage:0,mw:m.width,mh:m.height,map:Array.from({length:m.height},(_,y)=>m.tiles.slice(y*m.width,(y+1)*m.width))};
const col=m.prop_colliders.map((c,i)=>({type:'prop'+i,x:c.position[0],y:c.position[1],_colW:c.radii[0],_colH:c.radii[1]}));
const ctx={G,T:m.tile_size,_FDG_RUINED_FOREST_FIRST:false,_ensureColObjs:()=>{},_colObjs:col,_OBJ_META:Object.fromEntries(col.map(c=>[c.type,{collision:1}]))};
vm.createContext(ctx);vm.runInContext(source.slice(start,end),ctx);
let seed=0x23aa10;function random(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
const samples=[];for(let i=0;i<2500;i++){const x=Math.fround(random()*8000),y=Math.fround(random()*8000),r=[0,10,15,22][i%4];samples.push([x,y,r,ctx.canMv(x,y,r)]);}
for(const [x,y,r] of [[4020,7420,15],[0,0,15],[5200,3920,15],[5880,3560,15],...m.prop_colliders.map(c=>[c.position[0],c.position[1],15])])samples.push([x,y,r,ctx.canMv(x,y,r)]);
fs.writeFileSync(process.argv[3],JSON.stringify({sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),scope:'original isW/canMv against exported static map; dynamic bone walls excluded',samples}));console.log(JSON.stringify({samples:samples.length}));
