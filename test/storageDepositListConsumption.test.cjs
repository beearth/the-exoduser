// Actual whole dbRestore -> renderInvStorage -> live depositStorage -> rerender.
// DOM transport, icons/translation, persistence/sound and unrelated restore leaves
// are doubled. No full renderInv, browser pixels, localStorage or native game.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),acorn=require('acorn');
const root=process.cwd(),dir=process.env.EXODUSER_TEST_SOURCE_DIR||root,baseline=process.env.EXODUSER_TEST_BASELINE_DIR;assert(baseline,'explicit original baseline required');
const helper=fs.readFileSync(path.join(root,'test/ancestorPowerConsumption.test.cjs'),'utf8'),end=helper.indexOf("for(const file of ['game.html'");assert(end>0);const h={require,__dirname:path.join(root,'test'),process,console};vm.createContext(h);vm.runInContext(helper.slice(0,end),h);
const plain=x=>JSON.parse(JSON.stringify(x));
class NodeDouble{
 constructor(tag='div'){this.tag=tag;this.children=[];this.style={};this.className='';this._html='';this._text='';}
 set innerHTML(v){this._html=v;this.children=[]}get innerHTML(){return this._html}
 set textContent(v){this._text=String(v);this.children=[]}get textContent(){return this._text}
 appendChild(n){this.children.push(n);return n}append(...ns){ns.forEach(n=>this.appendChild(n))}
 insertAdjacentHTML(_,s){this._html+=s}
}
function snap(n){return {tag:n.tag,html:n.innerHTML,text:n.textContent,class:n.className,style:n.style,title:n.title||'',children:n.children.map(snap)}}
function code(file,base){const html=fs.readFileSync(path.join(base,file),'utf8');const extra=['renderInvStorage','depositStorage'].map(name=>{const m='function '+name+'(';assert.equal(html.split(m).length,2);const a=html.indexOf(m),n=acorn.parseExpressionAt(html,a,{ecmaVersion:'latest'});return html.slice(n.start,n.end)}).join('\n');return {restore:h.extract(file,base),extra}}
const item=id=>({id,name:id,slot:'boots',rarity:0,el:0,socketCount:0,crystals:[]});
function fixture(src,bag,storeSize=1,selected=null){
 const c=h.fixture(src.restore),store=Array.from({length:storeSize},(_,i)=>item('S'+i)),nodes=Object.fromEntries(['invStFloorNav','invStHeader','invStGrid','invStBagSection'].map(id=>[id,new NodeDouble()]));
 Object.assign(c,{$:id=>nodes[id],document:{createElement:t=>new NodeDouble(t)},_getStore:()=>store,ELC:['#aaa'],RARITY_C:['#fff'],_itemSkin:()=>'',_itemIco:it=>'<i>'+it.id+'</i>',_L:(a,b,p)=>p?a.replace('{p0}',p.p0):a,dbSaveNow:()=>c.calls.push(['saveNow'])});c.SFX.pickup=()=>c.calls.push(['pickup']);c._persistSharedStorage=()=>c.calls.push(['persist',store.map(it=>it.id)]);
 const data={player:{lv:1,hp:200,mp:60,st:60,shield:10,exp:0,maxExp:100000,sp:0,ap:0},bagMax:300,gritCostModeV2:true,inv:{bag,equipped:{}}};assert.equal(c.dbRestore(data),true);vm.runInContext(src.extra,c);c.renderInv=()=>c.renderInvStorage();c.INV.selected=selected;c.calls.length=0;return {c,store,nodes,data};
}
const rows=f=>f.nodes.invStBagSection.children[1].children;
for(const file of ['game.html','game-easy-test.html']){
 const actual=code(file,dir),original=code(file,baseline);
 for(const [i,bag,storeSize,selected] of [[0,[],0,null],[1,[item('A')],1,'st:0'],[2,[item('A'),item('B')],2,null]])test(`${file}: normal whole restore/storage DOM transport and live deposit ${i}`,()=>{
  const a=fixture(actual,plain(bag),storeSize,selected),b=fixture(original,plain(bag),storeSize,selected);a.c.renderInvStorage();b.c.renderInvStorage();assert.deepEqual(Object.fromEntries(Object.entries(a.nodes).map(([k,n])=>[k,snap(n)])),Object.fromEntries(Object.entries(b.nodes).map(([k,n])=>[k,snap(n)])));assert.deepEqual(plain(a.c.INV),plain(b.c.INV));
  if(bag.length){rows(a)[0].onclick();rows(b)[0].onclick();assert.deepEqual(plain({inv:a.c.INV,store:a.store,calls:a.c.calls}),plain({inv:b.c.INV,store:b.store,calls:b.c.calls}));assert.deepEqual(snap(a.nodes.invStBagSection),snap(b.nodes.invStBagSection));}
 });
 for(const raw of [null,0,false,''])test(`${file}: restored falsy ${JSON.stringify(raw)} skips display and retains original live indices`,()=>{
  const f=fixture(actual,[raw,item('A'),raw,item('B')]);assert.equal(f.c.INV.bag[0],raw);const before=plain(f.c.INV);f.c.renderInvStorage();assert.deepEqual(plain(f.c.INV),before);assert.equal(rows(f).length,2);assert.match(rows(f)[0].innerHTML,/>A</);assert.match(rows(f)[1].innerHTML,/>B</);
  const A=f.c.INV.bag[1],B=f.c.INV.bag[3];rows(f)[0].onclick();assert.equal(f.store[1],A);assert.equal(f.c.INV.bag.length,3);assert.equal(f.c.INV.bag[2],B);assert.equal(rows(f).length,1);let prevented=false;rows(f)[0].oncontextmenu({preventDefault(){prevented=true}});assert(prevented);assert.equal(f.store[2],B);assert.deepEqual(plain(f.c.INV.bag),[raw,raw]);assert.equal(rows(f).length,0);assert.equal(f.c.INV.bag.filter(x=>x===A||x===B).length+f.store.filter(x=>x===A||x===B).length,2);assert.equal(f.c.calls.filter(x=>x[0]==='persist').length,2);assert.equal(f.c.calls.filter(x=>x[0]==='saveNow').length,2);
 });
 test(`${file}: restored null with full storage rejects without changing bag/store or row binding`,()=>{
  const f=fixture(actual,[null,item('A')],200);f.c.renderInvStorage();const before=plain({inv:f.c.INV,store:f.store,dom:snap(f.nodes.invStBagSection)});assert.equal(rows(f).length,1);rows(f)[0].onclick();assert.deepEqual(plain({inv:f.c.INV,store:f.store,dom:snap(f.nodes.invStBagSection)}),before);assert.deepEqual(plain(f.c.calls),[['notify','창고가 가득 찼습니다!']]);
 });
}
