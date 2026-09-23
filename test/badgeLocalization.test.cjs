const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
class Node{constructor(){this.children=[];this.attrs={};this.style={setProperty(){}};}append(...n){this.children.push(...n);}setAttribute(k,v){this.attrs[k]=v;}addEventListener(){}focus(){}}
function text(node){return [node.textContent||'',...Object.values(node.attrs),...node.children.map(text)].join('\n');}
test('medals translate at startup and on locale changes without re-awarding or resetting toast',()=>{
 const stored=new Map();let timeouts=0;
 const c=vm.createContext({window:{},OPT:{lang:'en'},location:{search:'?slot=translation-test'},URLSearchParams,Date,setTimeout:()=>++timeouts,clearTimeout(){},document:{readyState:'complete',body:new Node(),createElement:()=>new Node(),createElementNS:()=>new Node()},localStorage:{getItem:k=>stored.get(k)||null,setItem:(k,v)=>stored.set(k,v)}});
 c._L=(ko,en,values={})=>(c.OPT.lang==='ko'?ko:en).replace(/\{(\w+)\}/g,(m,k)=>values[k]??m);
 vm.runInContext(fs.readFileSync('tutorial-badges.js','utf8'),c);const b=c.window._tutorialBadges;
 assert.doesNotMatch(text(c.document.body),/[가-힣]/);
 b.complete('combat',Array(12).fill(true));const saved=JSON.stringify([...stored]),timer=b.toastTimer;
 c.OPT.lang='ko';b.refreshLanguage();assert.match(b.toastLabel.textContent,/[가-힣]/);
 c.OPT.lang='en';b.refreshLanguage();assert.doesNotMatch(text(c.document.body),/[가-힣]/);
 assert.equal(b.toastTimer,timer);assert.equal(timeouts,1);assert.equal(JSON.stringify([...stored]),saved);assert.equal(b.button.textContent,'Badges 1/3');
});
