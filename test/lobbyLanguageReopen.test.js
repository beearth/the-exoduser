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
