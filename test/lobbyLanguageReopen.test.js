import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../index.html',import.meta.url),'utf8');
function setup(mode){
 const nodes={};
 const element=()=>({style:{},dataset:{},children:[],setAttribute(){},addEventListener(){},focus(){},replaceChildren(){this.children=[]},appendChild(el){this.children.push(el)}});
 const select={...element(),options:[{text:'A'},{text:'B'},{text:'C'}],selectedIndex:1};
 nodes.loginLangSelect=select;nodes.lobbyLangSelect=select;nodes.loginSection={style:{display:'flex'}};nodes.lobby={style:{display:'flex'}};
 const ctx=vm.createContext({$:id=>nodes[id],document:{createElement:element,body:{appendChild(el){nodes[el.id]=el}}},performance:{now:()=>100},ExoduserCharacterStory:{active:false},_GP:{axes:[0,0],prev:{},on(id,fn){ctx.navigate=fn}},_positionLangPop(){},_hlLangPop(){},_langPopKeydown(){}});
 vm.runInContext(source.slice(source.indexOf('let _langPopOpen ='),source.indexOf('function _positionLangPop')),ctx);
 const start=source.indexOf("_GP.on('"+mode+"Nav'");
 const end=source.indexOf(mode==='login'?'  const btns =':'  // 삭제 확인 모달',start);
 vm.runInContext(source.slice(start,end)+'});',ctx);
 return {ctx,select,nodes,index:()=>vm.runInContext('_langPopIdx',ctx)};
}
for(const mode of ['login','lobby'])for(const direction of [-1,1])test(mode+' language menu accepts first stick move after reopening '+direction,()=>{
 const {ctx,select,index}=setup(mode);
 ctx._openLangPop(select);ctx._GP.axes[1]=direction;ctx.navigate({buttons:[]},[]);
 assert.equal(index(),1+direction);
 // The popup closes while the stick is held; release happens outside the menu.
 vm.runInContext('_langPopOpen=false',ctx);ctx._GP.axes[1]=0;
 ctx._openLangPop(select);ctx._GP.axes[1]=direction;ctx.navigate({buttons:[]},[]);
 assert.equal(index(),1+direction);
 assert.equal(select.selectedIndex,1,'navigation must not commit a language');
});
test('reopening accepts the first pointer movement even at the previous coordinates',()=>{
 const {ctx,select,nodes,index}=setup('login');
 ctx._openLangPop(select);nodes._langPop.children[2].onmousemove({clientX:20,clientY:40});assert.equal(index(),2);
 ctx._openLangPop(select);nodes._langPop.children[2].onmousemove({clientX:20,clientY:40});assert.equal(index(),2);
});

function transitionSetup(){
 const nodes={};let focusCalls=0,changes=0;const element=()=>({style:{},dataset:{},attributes:{},children:[],classList:{add(){},remove(){},toggle(){}},setAttribute(k,v){this.attributes[k]=v},addEventListener(){},focus(){},replaceChildren(...children){this.children=children},appendChild(child){this.children.push(child)},querySelector:()=>null});
 const select={...element(),isConnected:true,options:[{text:'A'},{text:'B'},{text:'C'}],selectedIndex:1,focus(){focusCalls++},dispatchEvent(){changes++}};nodes.lobbyLangSelect=select;
 const ctx=vm.createContext({$:id=>nodes[id]||(id==='_langPop'?null:(nodes[id]=element())),document:{createElement:element,body:{appendChild(el){nodes[el.id]=el}},querySelector:element},window:{},_GP:{prev:{}},_positionLangPop(p){p.style.display='block'},_hlLangPop(){},_langPopKeydown(){},_LOBBY_BUILD:'full',_LOBBY_VER_LABEL:{},_LOBBY_VER_LIMITS:{},_LOBBY_VER:'test',_testMode:true,_characterLoadSeq:0,_cinPreview:false,_emberIv:null,currentUser:{id:'owner',email:'test'},_TL:s=>s});
 for(const name of ['clearInterval','stopWorldIntro','stopCinBgm','stopMediaVideo','startBGM','hideLoading','showLoading','_clearVidTimers','stopLobbyBgm','playCinematic','_updateCharDisplay','_preloadLoadingImgs'])ctx[name]=()=>{};
 ctx.loadCharacters=ctx.loadLocalCharacters=async()=>{ctx._characterLoadSeq++};
 const transition=source.slice(source.indexOf('function _goLogin('),source.indexOf('// ═══ 오프라인 모드 진입'))+source.slice(source.indexOf('async function showLobby('),source.indexOf('async function loadCharacters(){'));
 const language=source.slice(source.indexOf('let _langPopOpen ='),source.indexOf('function _positionLangPop'))+'\n'+source.match(/function _closeLangPop[^\n]+/)[0];
 return{ctx,nodes,select,transition,language,focusCalls:()=>focusCalls,changes:()=>changes};
}
for(const route of ['_goLogin','_goCinematic','_goLobby','showLobby'])test(route+' closes the old language popup without changing language or restoring hidden focus',async()=>{
 const s=transitionSetup();vm.runInContext(s.language+s.transition,s.ctx);s.ctx._openLangPop(s.select);vm.runInContext('_langPopIdx=2',s.ctx);await s.ctx[route]();
 assert.equal(s.nodes._langPop.style.display,'none');assert.equal(vm.runInContext('_langPopOpen',s.ctx),false);assert.equal(s.select.attributes['aria-expanded'],'false');assert.equal(s.select.selectedIndex,1);assert.equal(s.changes(),0);assert.equal(s.focusCalls(),0);
 s.ctx._openLangPop(s.select);assert.equal(s.nodes._langPop.style.display,'block');assert.equal(vm.runInContext('_langPopIdx',s.ctx),1);
});
for(const route of ['_goLogin','_goCinematic','_goLobby','showLobby'])test(route+' is safe before popup state initialization',async()=>{
 const s=transitionSetup();vm.runInContext(s.transition+source.match(/function _closeLangPop[^\n]+/)[0]+';globalThis.start='+route+'();'+s.language,s.ctx);await s.ctx.start;assert.equal(s.nodes._langPop,undefined);
});
