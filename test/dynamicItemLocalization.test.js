import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
for(const file of ['game.html','game-easy-test.html'])test(file+' localizes dynamic equipment labels without changing saved names',()=>{
 const source=fs.readFileSync(file,'utf8'),curEq={name:'검',el:0,rarity:0,atk:7,def:2},it={wtype:'sword',btype:'crossbow'};
 const dictionary={'검':'Sword','물리':'Physical','석궁':'Crossbow','HP 물약':'HP Potion','현재 장착':'Currently Equipped','무기 타입':'Weapon Type','활 타입':'Bow Type'};
 const context=vm.createContext({_T:s=>dictionary[s]||s,_L:(ko,en)=>en,curEq,it,ELN:['물리'],ELC:['white'],RARITY_C:['white'],_itemIco:()=>'',WTYPES:{sword:{name:'검',emoji:''}},BOWTYPES:{crossbow:{name:'석궁',emoji:''}},WTYPE_KEYS:['sword'],BTYPE_KEYS:['crossbow'],curDiv:{},wtDiv:{},bwDiv:{},stats:'',wp:()=>curEq,_sLn:''});
 for(const needle of ['if(it.wtype)stats+=','if(it.btype)stats+=','curDiv.innerHTML=`','wtDiv.innerHTML=','bwDiv.innerHTML=']){
  const line=source.split('\n').find(s=>s.includes(needle));assert.ok(line,needle);vm.runInContext(line,context);
 }
 const all=context.stats+context.curDiv.innerHTML+context.wtDiv.innerHTML+context.bwDiv.innerHTML;
 assert.doesNotMatch(all,/[가-힣]/);assert.match(all,/Sword/);assert.match(all,/Crossbow/);assert.match(all,/Physical/);assert.equal(curEq.name,'검');
 const potion=source.match(/\[\{type:'hp',n:(.*?),col:'#cc2200'\}\]/);assert.ok(potion);assert.equal(vm.runInContext(potion[1],context),'❤️‍🔥 HP Potion');
 const summary=source.split('\n').find(s=>s.includes("_L('무기속성'"));assert.ok(summary);assert.doesNotMatch(vm.runInContext(summary.trim().replace(/\+$/,''),context),/[가-힣]/);
});
