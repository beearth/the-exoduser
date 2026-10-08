'use strict';
// Focused first gate for all-layer queries and the existing editor list/select handlers.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),{pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),output=process.argv[2];
let checks=0,fixtures=0;const groups=[];
const check=(name,test)=>{assert.ok(test,name);checks++};
const group=(name,test)=>{const before=checks;test();groups.push({name,checks:checks-before,status:'PASS'})};
const object=(id,name=id,y=0)=>({id,name,assetId:'material-'+id,x:10,y,width:80,height:100});
const layer=(id,objects,extra={})=>({id,name:'층 '+id,visible:true,locked:false,sort:'flat',parallax:1,objects,...extra});
const scene=()=>({format:'exoduser-map-scene',version:1,world:{cols:200,rows:200,tileSize:40},layers:[layer('back',[object('a','뿌리'),object('b','ROOT',5)]),layer('front',[object('c','시체'),object('d','ROOT',15)])]});
const editor=fs.readFileSync(path.join(root,'tools/map-scene-editor.js'),'utf8'),html=fs.readFileSync(path.join(root,'editor.html'),'utf8');
function fn(name){const start=editor.indexOf('  function '+name+'('),end=editor.indexOf('\n  function ',start+1);assert.ok(start>=0&&end>start&&end-start<8000,name);return editor.slice(start,end)}
function ports(project,api){
 fixtures++;
 class Element{
  constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.dataset={};this.attrs={};this.disabled=false;this.value='';this._text='';this.classList={toggle(){},add(){}}}
  set textContent(v){assert.equal(this.children.length,0,'only leaf text replaced');this._text=String(v)}get textContent(){return this._text}
  append(...children){this.children.push(...children)}replaceChildren(...children){this.children=children}setAttribute(k,v){this.attrs[k]=v}focus(){this.focused=true}
 }
 const nodes=new Map();const $=id=>{if(!nodes.has(id))nodes.set(id,new Element('div'));return nodes.get(id)};
 $('object-scope').value='layer';$('object-search').value='';
 const c=vm.createContext({project,$,document:{createElement:t=>new Element(t)},objectListFactory:api.inspectLayerObjects,objectSceneListFactory:api.inspectSceneObjects,objectFocusFactory:api.focusObjectFoot,console});
 vm.runInContext(`var busy=false,playing=false,dialogueOpen=false,layerId='back',selected=null,paletteId='old',tool='walk',keys=new Set(['w']),space=true,objectPage=0,objectLayer=null,batchIds=new Set(['a']),batchLayer='back',viewport={x:0,y:0,zoom:1},size={w:900,h:600},endCalls=0,pending=false,commits=0,refreshes=0,toggles=[];
 var current=()=>project,revealAssetUI=()=>{},batchUI=()=>{},pointText=o=>o.x+','+o.y,endDrag=()=>{endCalls++;if(pending){commits++;pending=false}},clearBatch=()=>{batchIds.clear();batchLayer=null},palette=()=>{},refresh=()=>{refreshes++},clampCamera=()=>{},matchMedia=()=>({matches:false}),canvas={focus(){}},toast=()=>{},toggleBatch=(id,v)=>toggles.push([id,v]);
 `+fn('objectListUI')+'\n'+fn('selectListedObject'),c);
 return {c,nodes,$,run:s=>vm.runInContext(s,c),rows:()=>$('object-list').children};
}
(async()=>{
 try{
  const api=await import(pathToFileURL(path.join(root,'tools/map-scene-object-list.mjs')).href);
  group('current layer contract preserved',()=>{
   const p=scene(),r=api.inspectLayerObjects(p,'back');check('current flat order',r.rows.map(o=>o.objectId).join(',')==='b,a');check('same row shape',Object.keys(r.rows[0]).join(',')==='objectId,assetId,name,x,y,width,height');check('current search trimming',api.inspectLayerObjects(p,'back',' root ').matched===1);
  });
  group('all layers ordering and fresh row metadata',()=>{
   const p=scene();p.layers[1].sort='foot';p.layers[1].objects.push(object('e','ROOT',15));const before=JSON.stringify(p),r=api.inspectSceneObjects(p,' root ');
   check('later layer and stable tie front first',r.rows.map(o=>o.objectId).join(',')==='e,d,b');check('layer metadata identifies row',r.rows[0].layerId==='front'&&r.rows[0].layerName==='층 front'&&r.total===5&&r.matched===3);r.rows[0].name='changed';check('result mutation does not change source',JSON.stringify(p)===before);
   Object.defineProperty(p,'assets',{get(){throw Error('must not read assets')}});Object.defineProperty(p,'nav',{get(){throw Error('must not read nav')}});check('no source asset or nav access',api.inspectSceneObjects(p,'material-a').matched===1);
  });
  group('global pagination and empty query results',()=>{
   const p=scene();p.layers[1].objects=Array.from({length:53},(_,i)=>object('p'+i));const r=api.inspectSceneObjects(p,'',1);
   check('single global fifty row pages',r.total===55&&r.pages===2&&r.page===1&&r.rows.length===5);check('last page clamped',api.inspectSceneObjects(p,'',100).page===1);const no=api.inspectSceneObjects(p,'absent');check('empty results',no.page===0&&no.pages===0&&no.rows.length===0);
  });
  group('invalid input rejects and hidden locked rows remain descriptive',()=>{
   const p=scene();for(const args of [[p,'x'.repeat(161),0],[p,'',.5],[p,'',-1]])assert.throws(()=>api.inspectSceneObjects(...args));checks++;
   p.layers[1].locked=true;p.layers[0].visible=false;const r=api.inspectSceneObjects(p);check('hidden locked metadata retained',r.rows[0].locked&&r.rows.at(-1).visible===false);p.layers[1].objects[0].width=0;assert.throws(()=>api.inspectSceneObjects(p));checks++;
  });
  group('real list UI routes cross layer and keeps batch local',()=>{
   const p=scene(),t=ports(p,api);t.$('object-scope').value='all';t.run('objectListUI()');const front=t.rows()[0];check('row names its layer',front.dataset.layerId==='front'&&front.children[1].textContent.includes('층 front'));check('foreign batch disabled',front.children[3].children[0].disabled);front.children[0].onclick();check('real choose selects target and clears old batch',t.run("layerId==='front'&&selected==='d'&&batchIds.size===0&&paletteId===null&&tool==='select'&&keys.size===0&&!space"));check('selection alone commits no edit',t.run('commits===0'));t.run('objectListUI()');check('new active layer batch available',!t.rows()[0].children[3].children[0].disabled);
  });
  group('real row and click guards use each fresh layer',()=>{
   for(const kind of ['hidden','locked','p0']){const p=scene();p.layers[1][kind==='hidden'?'visible':kind==='locked'?'locked':'parallax']=kind==='hidden'?false:kind==='locked'?true:0;const t=ports(p,api);t.$('object-scope').value='all';t.run('objectListUI()');const row=t.rows()[0];check(kind+' row controls',kind==='p0'?!row.children[0].disabled&&row.children[2].disabled:row.children[0].disabled&&row.children[2].disabled)}
   const p=scene(),t=ports(p,api);t.$('object-scope').value='all';t.run('objectListUI()');const choose=t.rows()[0].children[0];p.layers[1].locked=true;choose.onclick();check('stale clickable row rechecks lock',t.run("layerId==='back'&&selected===null"));p.layers[1].locked=false;p.layers[1].objects=[];choose.onclick();check('deleted object is not selected',t.run('selected===null'));
  });
  group('scope busy guards and existing edit completion policy',()=>{
   const t=ports(scene(),api);t.run("selectListedObject('front','d',false)");check('current scope rejects cross layer',t.run('selected===null&&endCalls===0'));
   for(const flag of ['busy','playing','dialogueOpen']){t.$('object-scope').value='all';t.run(flag+'=true;objectListUI();selectListedObject("front","d",false)');check(flag+' guarded',t.$('object-search').disabled&&t.$('object-scope').disabled&&t.run('selected===null'));t.run(flag+'=false')}
   t.run('pending=true;selectListedObject("front","d",false)');check('existing endDrag may commit pending edit',t.run('selected==="d"&&commits===1'));
  });
  group('all scope pagination survives active layer switch',()=>{
   const p=scene();p.layers[1].objects=Array.from({length:53},(_,i)=>object('p'+i));const t=ports(p,api);t.$('object-scope').value='all';t.run('objectListUI();objectPage=1;objectListUI()');check('all page second exists',t.run('objectPage===1'));t.run("layerId='front';objectListUI()");check('active layer does not reset all page',t.run('objectPage===1'));t.$('object-scope').value='layer';t.run('objectListUI()');check('scope switch resets page',t.run('objectPage===0'));
  });
  group('canonical wiring and JavaScript parse',()=>{
   new vm.Script(editor);check('editor whole JS parses',true);check('scope selector unique default local',html.split('id="scene-object-scope"').length===2&&html.includes('<option value="layer">현재 층</option><option value="all">전체 층</option>'));check('new factory imported and scope handler guarded',editor.includes('objectSceneListFactory=objects.inspectSceneObjects;')&&editor.includes("$('object-scope').onchange=()=>{if(busy||playing||dialogueOpen)return;objectPage=0;objectListUI();};"));
  });
  const result={status:'PASS',nodeExecutions:1,fixtures,checks,groups,native:'NOT_RUN',storage:'controlled ports only; existing pending endDrag commit demonstrated',limitations:['DOM ports do not prove browser layout or native interaction','scene/cache/GPU/audio/usersave are not exercised','up to24 layers/2000 objects per layer; interactive cost not benchmarked']};if(output)fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({status:'PASS',groups:groups.length,checks,fixtures}));
 }catch(error){if(output)fs.writeFileSync(output,JSON.stringify({status:'FAIL',checks,fixtures,completedGroups:groups,error:String(error.stack)},null,2)+'\n');console.error(error);process.exitCode=1}
})();
