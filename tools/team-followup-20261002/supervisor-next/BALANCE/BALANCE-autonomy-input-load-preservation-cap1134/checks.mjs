// Preservation recipe authored AFTER the recorded stdin runs. Syntax checked only;
// do not count this file as executed or replay completed checks without a new reason.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {tokenizer,parse} from 'acorn';
const root='/Users/fordeargamers/Projects/exoduser-migration-20261001';
assert.equal(process.cwd(),root);
const sha=s=>createHash('sha256').update(s).digest('hex');
function extract(s,name){const start=s.indexOf('function '+name+'(');assert(start>=0,name);const t=tokenizer(s.slice(start),{ecmaVersion:'latest'});let depth=0,open=false;for(;;){const k=t.getToken(),l=k.type.label;if(l==='{'||l==='${'){depth++;open=true;}if(l==='}')depth--;if(open&&depth===0){const text=s.slice(start,start+k.end);parse(text,{ecmaVersion:'latest'});return text;}assert(l!=='eof');}}
const renderPins={'game.html':'6407a724ea6d9f1d9ba3f36dfc12d5b7f8a712ff2ada17320b7fac8f6066c2eb','game-easy-test.html':'44c24b9c9130b66b3cce2e50ff923ae06a4d35834fd2c9b01c46797a5ff0dcf1'};
const restorePins={'game.html':'63385633575b51647ab02b9e27f6d840e036dc35f9cd595b1cc65063e1133c35','game-easy-test.html':'2785fd6138a7325f64bbf2c27cde281e270caa85f517b7a7c52801ad9726d274'};
const callerPin='29bdd418f6a59a84cbaac3ad31ee739fe436a9a1070420382a59ba1b2d6cf963';
const names=['openPanel','renderForge','enhRate','enhCostRaw','enhCost','_malCost','_itemEconomyRarity','enhColor','enhRateColor','enhMul','enhMulAtk'];
const results=[];
for(const file of Object.keys(renderPins)){
 const s=fs.readFileSync(file,'utf8'),f=Object.fromEntries(names.map(n=>[n,extract(s,n)])),restore=extract(s,'dbRestore');
 assert.equal(sha(f.renderForge),renderPins[file],'render anchor drift: use original receipts, do not silently rebase');assert.equal(sha(f.openPanel),callerPin);assert.equal(sha(restore),restorePins[file]);
 const old='if(G._aiTarget===undefined||G._aiTarget<=_curEnh)G._aiTarget=_curEnh+100;',fixed='if(!Number.isFinite(G._aiTarget)||G._aiTarget<=_curEnh)G._aiTarget=_curEnh+100;';
 assert(f.renderForge.includes(old));const candidate=f.renderForge.replace(old,fixed);
 for(const value of ['', '8']){
  const pair=[];
  for(const [policy,render] of [['current',f.renderForge],['accepted memory fallback',candidate]]){
   const nodes=new Map();
   class Element{constructor(){this.children=[];this.parent=null;this._html='';this.style={setProperty:(k,v)=>this.style[k]=v};this.classList={add:()=>{}};}set textContent(v){assert.equal(this.children.length,0);this._text=String(v);}set innerHTML(v){this._html=String(v);this.children=[];}get innerHTML(){return this._html;}appendChild(c){c.parent=this;this.children.push(c);return c;}replaceChildren(...c){this.children=[];c.forEach(x=>this.appendChild(x));}insertBefore(c,r){c.parent=this;const i=r?this.children.indexOf(r):-1;if(i<0)this.children.push(c);else this.children.splice(i,0,c);}get nextSibling(){return this.parent?.children[this.parent.children.indexOf(this)+1]||null;}}
   const $=id=>{if(!nodes.has(id))nodes.set(id,new Element());return nodes.get(id);};
   const item={id:94,slot:'weapon',name:'기존 무기',enh:5,rarity:2},before=structuredClone(item),G={forgeTab:'upgrade',_aiEnhSlot:'weapon',_aiTarget:7,mats:100000};
   const c={G,INV:{equipped:{weapon:item}},$,document:{createElement:()=>new Element()},_forgeSel:null,_salSel:new Set(),_rerollSel:null,_crForgeSel:-1,_T:x=>x,_L:ko=>ko,_earringSlot:()=>false,_slotName:()=>'',SLOT_NAMES:[],RARITY_C:['c0','c1','c2','c3','c4'],_ensureForgeAtlasLoad:()=>{},BGM:{play:()=>{}},closeAllPanels:()=>{},_injectPanelNav:()=>{}};
   const ctx=vm.createContext(c);vm.runInContext('const _MALICE_COST_MUL=0.5;'+names.map(n=>n==='renderForge'?render:f[n]).join('\n'),ctx);
   vm.runInContext("openPanel('forge')",ctx,{timeout:80});const panel=()=>$('fgGrid').children.find(n=>n.innerHTML.includes('id="aiTargetInp"')).innerHTML;
   const tag=panel().match(/<input id="aiTargetInp"[^>]*>/)[0],attr=n=>tag.match(new RegExp(n+'="([^"]*)"'))[1];ctx.input={value};
   const trace=[];for(const event of ['input','change']){const handler=attr('on'+event);trace.push({event,value,handler});vm.runInContext('(function(){'+handler+'}).call(input)',ctx,{timeout:80});}
   const target=value===''?6:8,cost=value===''?29874:99034;assert.equal(G._aiTarget,target);assert(panel().includes(cost.toLocaleString()));assert(panel().includes('value="'+target+'"'));assert.deepEqual(item,before);assert.equal(G.mats,100000);
   pair.push({file,value,policy,target,cost,htmlSha256:sha(panel()),trace});
  }
  assert.equal(pair[0].htmlSha256,pair[1].htmlSha256);assert.deepEqual(pair[0].trace,pair[1].trace);results.push(...pair);
 }
 const assignment=restore.split('\n').find(l=>l.includes('INV.equipped=d.inv.equipped')),start=f.renderForge.indexOf('      const _curEnh='),end=f.renderForge.indexOf('      let _autoExpCost=',start),prefix=f.renderForge.slice(start,end);
 for(const malformed of [true,false]){
  const raw=malformed?'{"inv":{"equipped":{"weapon":{"id":95,"enh":1e309,"rarity":2}}}}':'{"inv":{"equipped":{"weapon":{"id":95,"enh":5,"rarity":2}}}}',d=JSON.parse(raw),INV={},G={_aiTarget:7},c=vm.createContext({d,INV,G});
  vm.runInContext(assignment,c);c._aiItem=INV.equipped.weapon;const before=c._aiItem.enh;vm.runInContext(prefix,c);const accepts=vm.runInContext('Number.isFinite(_aiItem.enh??0)',c);
  assert.equal(accepts,!malformed);assert.equal(c._aiItem.enh,before);assert.equal(c._aiItem,d.inv.equipped.weapon);assert.equal(G._aiTarget,malformed?Infinity:7);
  results.push({file,malformed,loadedEnh:Number.isFinite(before)?before:String(before),target:Number.isFinite(G._aiTarget)?G._aiTarget:String(G._aiTarget),validatorAccepts:accepts,inputSha256:sha(raw)});
 }
}
console.log(JSON.stringify({recipeExecutedAtUTC:new Date().toISOString(),results,productionApplied:false,runtimeAccepted:false,newFiles:0},null,2));
