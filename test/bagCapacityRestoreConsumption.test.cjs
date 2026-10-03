// Actual whole dbRestore, withdrawStorage, inventory grid and space search.
// Synthetic items/coordinates; _getStore, persistence, UI, sound and unrelated
// stat/migration dependencies are doubled. No native/localStorage/DOM/pickup loop.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),acorn=require('acorn');
const root=process.cwd(),dir=process.env.EXODUSER_TEST_SOURCE_DIR||root,baseline=process.env.EXODUSER_TEST_BASELINE_DIR;assert(baseline,'explicit original baseline required');
const helper=fs.readFileSync(path.join(root,'test/ancestorPowerConsumption.test.cjs'),'utf8'),end=helper.indexOf("for(const file of ['game.html'");assert(end>0);
const h={require,__dirname:path.join(root,'test'),process,console};vm.createContext(h);vm.runInContext(helper.slice(0,end),h);
function code(file,base){
 const html=fs.readFileSync(path.join(base,file),'utf8'),restore=h.extract(file,base);
 const extra=['_invRows','_invCategoryKey','_invGrid','_invFindSpace','withdrawStorage'].map(name=>{const marker='function '+name+'(';assert.equal(html.split(marker).length,2,name);const at=html.indexOf(marker),n=acorn.parseExpressionAt(html,at,{ecmaVersion:'latest'});return html.slice(n.start,n.end)}).join('\n');return {restore,extra};
}
const plain=x=>JSON.parse(JSON.stringify(x));
function fixture(src,value,count=300){
 const c=h.fixture(src.restore),store=[{name:'stored',slot:'boots',socketCount:0,crystals:[],_gx:2,_gy:3}];
 const data={player:{lv:1,hp:200,mp:60,st:60,shield:10,exp:0,maxExp:100000,sp:0,ap:0},bagMax:value,gritCostModeV2:true,inv:{bag:Array.from({length:count},(_,i)=>({name:'bag'+i,slot:'boots',socketCount:0,crystals:[],_gx:i%10,_gy:Math.floor(i/10)})),equipped:{}}};
 Object.assign(c,{INV_COLS:10,_getStore:()=>store,renderInv:()=>c.calls.push(['render']),dbSaveNow:()=>c.calls.push(['saveNow'])});c.SFX.pickup=()=>c.calls.push(['pickup']);c._persistSharedStorage=()=>c.calls.push(['persist']);
 assert.equal(c.dbRestore(data),true);vm.runInContext(src.extra,c);c.calls.length=0;return {c,store,data,item:store[0]};
}
function outcome(src,value){
 const {c,store,item,data}=fixture(src,value),rows=c._invRows(),finite=Number.isFinite(rows);const grid=finite?plain(c._invGrid()):null,space=finite?plain(c._invFindSpace(1,1,-1)):null;
 c.withdrawStorage(0);return {cap:c.BAG_MAX,rows,grid,space,bag:plain(c.INV.bag),store:plain(store),calls:plain(c.calls),ownership:c.INV.bag.filter(x=>x===item).length+store.filter(x=>x===item).length,payload:data.bagMax};
}
for(const file of ['game.html','game-easy-test.html']){
 const actual=code(file,dir),original=code(file,baseline);
 const values=[300,'300',50,'50',0,'0','-0',-5,.5,1000,'',null,undefined,true,false,[],Infinity,-Infinity,'Infinity'];
 values.forEach((raw,i)=>test(`${file}: normal/coercible legacy capacity ${i} preserves actual restore/grid/transfer`,()=>{
  const got=outcome(actual,raw),was=outcome(original,raw);assert.deepEqual(got,was);assert.equal(got.ownership,1);
 }));
 for(const raw of ['ab','1.2.3',{}])for(const count of [299,300])test(`${file}: nonnumeric ${JSON.stringify(raw)} restores default300 and transfers at ${count}`,()=>{
  const {c,store,item,data}=fixture(actual,raw,count);assert.equal(c.BAG_MAX,300);assert.equal(c._invRows(),120);assert.equal(c._invGrid().length,120);
  assert.deepEqual(plain(c._invFindSpace(1,1,-1)),count===299?{x:9,y:29}:{x:0,y:30});const before=plain({bag:c.INV.bag,store});c.withdrawStorage(0);
  assert.equal(c.INV.bag.filter(x=>x===item).length+store.filter(x=>x===item).length,1);assert.deepEqual(data.bagMax,raw);
  if(count===300){assert.deepEqual(plain({bag:c.INV.bag,store}),before);assert.equal(item._gx,2);assert.equal(item._gy,3);assert.deepEqual(plain(c.calls),[['notify','가방이 가득 찼습니다!']]);}
  else{assert.equal(store.length,0);assert.equal(c.INV.bag.length,300);assert.equal(c.INV.bag[299],item);assert.equal(item._gx,null);assert.equal(item._gy,null);assert.deepEqual(plain(c.calls),[['pickup'],['persist'],['render'],['saveNow']]);}
 });
}
