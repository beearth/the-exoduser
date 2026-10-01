import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createD13DeferredReview as current} from '../ITEM/d13-deferred-contract-candidate.mjs';
const beforeBytes=fs.readFileSync('outputs/team-review-20261002/four-candidate-acceptance/d13-deferred-contract-candidate.mjs.before');
const {createD13DeferredReview:before}=await import('data:text/javascript;base64,'+beforeBytes.toString('base64'));
const rows=[];
for(const [name,factory,expected] of [['before',before,2],['current',current,1]])for(const transition of ['clear','replace']){
 let zones=[{type:'spikeTrap'},{type:'spikeTrap'}],callbacks=0;
 const review=factory({enabled:true,reviewOnly:true,onOriginalTrapKill(){callbacks++;if(callbacks===1){if(transition==='clear')review.clear();else zones=[];}}});
 for(const zone of zones)assert(review.recordOriginal(zone,{}));
 const loop=review.wrapZonePass(()=>{for(const zone of zones){const enemy={alive:true,hp:1};review.invokeDot(zone,e=>{e.alive=false;e.hp=0;},null,[enemy,0,0,0,{dot:true,_lessonAttack:'spikeTrap'}]);}},()=>zones);
 loop();assert.equal(callbacks,expected);rows.push({name,transition,callbacks,expected});
}
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const evidence={at:new Date().toISOString(),rows,beforeSha256:hash(beforeBytes),currentSha256:hash(fs.readFileSync('tools/team-followup-20261001/ITEM/d13-deferred-contract-candidate.mjs')),scope:'Independent synthetic callback boundary, actual candidate import; production0'};
fs.writeFileSync('outputs/team-review-20261002/four-candidate-acceptance/item-root-independent.json',JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify(rows));
