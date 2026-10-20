import fs from 'node:fs';
import readline from 'node:readline';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=process.argv.find(x=>x.startsWith('--source-game='))?.slice(14);
assert(source,'explicit --source-game');
const names=['_clearParTime','_clearParScore','_clearScoreCalc','_clearRankCalc','_clearRecordMerge'];
let capture='',depth=0,code='',line=0;const anchors={};
for await(const text of readline.createInterface({input:fs.createReadStream(source),crlfDelay:Infinity})){
 line++;
 if(text.startsWith('const _RANK_ORD='))code+=text+'\n';
 if(!capture){const name=names.find(n=>text.startsWith(`function ${n}(`));if(name){capture=name;anchors[name]=line;depth=0;}}
 if(capture){code+=text+'\n';depth+=(text.match(/{/g)||[]).length-(text.match(/}/g)||[]).length;if(depth===0)capture='';}
}
assert.equal(Object.keys(anchors).length,5);
const ctx=vm.createContext({});vm.runInContext(code,ctx);
const cases=[];
for(const total of [0,1,16,100])for(const sec of [0,90,130,200,400])for(const deaths of [0,1,3])for(const previous of [null,{t:150,s:5000,r:'A'}]){
 const g={stage:0,_bossClearT:sec,_totalSpawned:total,_stageKills:Math.floor(total*.9),_sStats:{deaths,dmgTaken:deaths?7:0},comboMax:13,_clearRecords:previous?{'0':previous}:{}};
 const regions=4,par=ctx._clearParTime(total),parScore=ctx._clearParScore(total);
 const score=ctx._clearScoreCalc({kills:g._stageKills,regions,bossKilled:true,clearSec:sec,parSec:par,deaths,dmgTaken:g._sStats.dmgTaken,comboMax:g.comboMax}).total;
 const rank=ctx._clearRankCalc(sec,par,score,parScore,deaths);
 const cur={t:sec,s:score,r:rank},merged=ctx._clearRecordMerge(previous,cur);
 cases.push({g,regions,result:{current:cur,record:merged.rec,first:merged.first,newTime:merged.newTime,newScore:merged.newScore,parSec:par,parScore}});
}
console.log(JSON.stringify({anchors,cases}));
