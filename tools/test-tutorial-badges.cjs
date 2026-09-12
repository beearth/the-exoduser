const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
class Node{constructor(){this.children=[];this.attrs={};this.style={setProperty(){}};}append(...nodes){this.children.push(...nodes);}setAttribute(k,v){this.attrs[k]=v;}addEventListener(){}focus(){}}
const storage=new Map();
function setup(search='?slot=test',broken=false){
  const c=vm.createContext({window:{},location:{search},URLSearchParams,Date,setTimeout:()=>1,clearTimeout(){},document:{readyState:'complete',body:new Node(),createElement:()=>new Node(),createElementNS:()=>new Node()},localStorage:{getItem:k=>{if(broken)throw Error();return storage.get(k)||null;},setItem:(k,v)=>{if(broken)throw Error();storage.set(k,v);}}});
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../tutorial-badges.js'),'utf8'),c);return c.window._tutorialBadges;
}
let b=setup();assert.equal(b.complete('combat',Array(8).fill(true)),false);assert.equal(b.complete('combat',Array(7).fill(true)),false);assert.equal(b.complete('combat',[...Array(7).fill(true),false]),false);
assert.equal(b.complete('combat',Array(11).fill(true)),true);assert.equal(b.complete('combat',Array(11).fill(true)),false);
assert.equal(b.complete('resources',Array(10).fill(true)),true);assert.equal(b.complete('systems',Array(7).fill(true)),true);assert.equal(b.button.textContent,'배지 3/3');
b=setup();assert.equal(Object.keys(b.earned).length,3);assert.equal(b.complete('combat',Array(11).fill(true)),false);
assert.equal(Object.keys(setup('?slot=other').earned).length,0);
const fallback=setup('?slot=blocked',true);assert.equal(fallback.complete('combat',Array(11).fill(true)),true);assert.equal(fallback.button.textContent,'배지 1/3');
for(const p of ['game.html','game-easy-test.html']){const s=fs.readFileSync(path.join(__dirname,'..',p),'utf8');assert.ok(s.includes('tutorial-badges.js'));assert.ok(s.includes('tutorial-badges.css'));}
console.log('PASS: three medal requirements, no partial/duplicate awards, persisted collection, slot isolation, unavailable-storage fallback, both game integrations.');
