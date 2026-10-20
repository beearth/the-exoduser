import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
const args=Object.fromEntries(process.argv.slice(2).map(x=>{const i=x.indexOf('=');return [x.slice(2,i),x.slice(i+1)];}));
if(!args['source-game']||!args.output)throw Error('explicit source-game/output required');
const raw=fs.readFileSync(args['source-game']),lines=raw.toString('utf8').split('\n');
const helpers=lines.slice(28076,28104).join('\n')+'\n'+lines[28185];
if(!helpers.includes('function enhRate')||!helpers.includes('function _itemEconomyRarity'))throw Error('source anchors changed');
const attempt=lines.slice(50622,50627).join('\n')+'\n}';
const transfer=lines.slice(16302,16319).join('\n');
const sandbox={notify(){},_T:x=>x,_L:x=>x,addTxt(){},enhColor:()=>'',P:{x:0,y:0}};
vm.createContext(sandbox);vm.runInContext(helpers,sandbox);
vm.runInContext('function originalAttempt(it,G){'+attempt+'}\nfunction originalTransfer(old,item,G){'+transfer+'}',sandbox);
const attempts=[],transfers=[];
for(const enh of [0,1,2,100,526,527,831])for(const rarity of [0,1,2,3,4,5])for(const roll of [0,.5,.99,.999])for(const enough of [false,true]){
 const q=sandbox.enhCost(enh,rarity),item={enh,rarity},wallet={mats:q.cost-(enough?0:1)};let calls=0;
 sandbox.Math=Object.create(Math);sandbox.Math.random=()=>{calls++;return roll;};
 sandbox.originalAttempt(item,wallet);
 attempts.push({input:{enh,rarity,roll,mats:q.cost-(enough?0:1)},expected:{enh:item.enh,mats:wallet.mats,rng_calls:calls,cost:q.cost,rate:q.rate}});
}
for(const enh of [0,1,3,100])for(const rarity of [0,2,5])for(const next of [0,200])for(const enough of [false,true]){
 const cost=sandbox.xferCost(enh),old={enh,rarity},item={enh:next},wallet={mats:Math.max(0,cost-(enough?0:1))};
 sandbox.originalTransfer(old,item,wallet);
 transfers.push({input:{enh,rarity,next,mats:Math.max(0,cost-(enough?0:1))},expected:{old,item,mats:wallet.mats}});
}
fs.writeFileSync(args.output,JSON.stringify({source_sha256:crypto.createHash('sha256').update(raw).digest('hex'),attempts,transfers}),'utf8');
console.log('DEMO11_27_ORACLE attempts='+attempts.length+' transfers='+transfers.length);
