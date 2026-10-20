import {readFileSync,writeFileSync} from 'node:fs';
import vm from 'node:vm';
const arg=k=>process.argv.find(x=>x.startsWith(k+'='))?.slice(k.length+1);
const source=readFileSync(arg('--source-game'),'utf8');
const start=source.indexOf('function _checkPetDialogue(){');
const end=source.indexOf('_petFireBid();_petInFrame=false;',start);
if(start<0||end<start)throw Error('original urgent slice not found');
const urgent=source.slice(start,end)+'}';
const cases=[];
for(const s of ['idle','bossGrabWind','bossBurstWind','bossShockWind','bossMeteorWind','bossVortexWind','bossFanWind'])
for(const alive of [false,true])for(const stunned of [0,1]) {
 const p={hp:100,mhp:100,mp:100,mmp:100,st:100,mst:100,lv:1,s:'idle',skills:{execution:0}};
 const boss={s,alive,stunned};const calls=[];
 const context={G:{on:true,pets:{},stage:0,frame:1,_bossRef:boss},P:p,STATS:{},SI_TO_HELL:[0],_PB:{},_petInFrame:false,_petEnemyAvgAtk:0,
 _updatePetBubble(){},_petSayUrgent(id){calls.push(id)},_petBidCD(){}};
 vm.runInNewContext(urgent+';_checkPetDialogue()',context,{timeout:100});
 cases.push({boss,p,expected:calls.filter(id=>id.startsWith('boss_'))});
}
writeFileSync(arg('--output'),JSON.stringify({cases,source_lines:[9539,9553]}),'utf8');
