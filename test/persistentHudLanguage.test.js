import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
for(const file of ['game.html','game-easy-test.html'])test(file+' refreshes paused HUD labels without removing counts',()=>{
 const source=fs.readFileSync(file,'utf8'),start=source.indexOf('function _refreshPersistentHudLanguage(){');
 assert.ok(start>=0,'persistent HUD language refresh exists');
 const code=source.slice(start,source.indexOf('function _applyLang()',start));
 let lang='en',badgeRefresh=0;
 const nodes=Object.fromEntries(['hudLevelLabel','hudExpLabel','hudKillLabel','hudMaliceLabel','mmLvl'].map(id=>[id,{children:[],textContent:'KO',attrs:{},setAttribute(k,v){this.attrs[k]=v;}}]));
 nodes.mmLvl.children.push({textContent:'123 / 456'});
 const context={document:{getElementById:id=>nodes[id]},_L:(ko,en)=>lang==='ko'?ko:en,window:{_tutorialBadges:{refreshLanguage(){badgeRefresh++;}}}};
 vm.runInNewContext(code+';_refreshPersistentHudLanguage();',context);
 assert.equal(nodes.hudKillLabel.textContent,'Area kills');assert.equal(nodes.hudMaliceLabel.textContent,'Malice');
 assert.equal(nodes.mmLvl.children[0].textContent,'123 / 456');assert.equal(nodes.mmLvl.attrs['aria-label'],'Player status');assert.equal(badgeRefresh,1);
 lang='ko';context._refreshPersistentHudLanguage();assert.equal(nodes.hudKillLabel.textContent,'지역 처치');
 assert.match(source.slice(source.indexOf('function _applyLang()'),source.indexOf('function _applyLang()')+300),/_refreshPersistentHudLanguage\(\)/);
});
