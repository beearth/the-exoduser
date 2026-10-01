import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {parseExpressionAt} from 'acorn';
import {createD10Consumer,candidateSlamSource} from './d10-consumer.mjs';
import {toStoredValue,lookupRoll} from '../../../unique-item-project/roll-values.js';

const root=new URL('../../../',import.meta.url),owned=new URL('./',import.meta.url);
const sources=[],evidence=[];
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
function extract(html){const start=html.indexOf('function activateGiantSlam(');assert.ok(start>=0);return html.slice(start,parseExpressionAt(html,start,{ecmaVersion:'latest'}).end);}
function harness(source,{rage=100,raw=20,item={uniqueId:'UI-10',slot:'armor'},enabled=true,mats=100,fused=[],failHit=false,lesson=false,recursive=false}={}){
  const log=[],values={calls:0,reads:0,randoms:0,lessonCalls:0};
  const math=Object.create(Math);math.random=()=>{values.randoms++;return .5;};
  const P={rage,x:0,y:0,facing:0,skills:{giantSlam:1,giantSlam2:2,detonate:1,darkPillar:1,fireAura:1},_rageFullLatch:true};
  const INV={equipped:{armor:item}},consumer=createD10Consumer({enabled,readStoredRoll:(saved,definition,roll)=>{values.reads++;assert.equal(saved,item);assert.equal(definition.effectId,'U-D10');assert.equal(roll.unit,'percent');return raw===null?null:toStoredValue('UI-10',raw);}});
  const context=vm.createContext({P,INV,Math:math,_d10Candidate:consumer,G:{mats,hitStop:0,slowMo:0},PASSIVES:{pRage:2},OPT:{shake:100},EL:{F:1},
    window:lesson?{_parryLesson:{active:true,rageCast:consumed=>{values.lessonCalls++;log.push(['lesson',consumed]);}}}:{},
    _addSkProf:id=>log.push(['prof',id]),_malCost:value=>value,_T:value=>value,showPH:(...args)=>log.push(['fail',...args]),
    useStPct:id=>log.push(['st',id]),_isFused:id=>fused.includes(id),_cdRed:()=>0,SFX:{slam:()=>log.push(['sound'])},playSample:()=>{},_r:()=>1,
    _eqAffix:()=>0,meleeRef:()=>10,statStr:()=>2,_skMul:()=>3,addTxt:(...args)=>log.push(['txt',...args]),_addLavaErupt:(...args)=>log.push(['lava',...args]),
    wp:()=>({el:0}),_gSlamHit:(...args)=>{
      values.calls++;log.push(['hit',...args]);
      if(failHit)throw Error('controlled hit failure');
      if(recursive&&values.calls===1)context.activateGiantSlam();
    },poolPart:(...args)=>log.push(['part',...args]),_detonateAssaultFlames:()=>log.push(['flames']),_slamStormBlast:()=>log.push(['storm']),
    activateDarkPillar:()=>log.push(['pillar']),magicRef:()=>5,statInt:()=>2,pMagicMul:()=>1
  });
  vm.runInContext(source,context);
  return {context,P,INV,log,values,consumer,run:srcId=>context.activateGiantSlam(srcId)};
}
for(const file of ['game.html','game-easy-test.html']){
  const html=fs.readFileSync(new URL(file,root),'utf8'),source=extract(html),candidate=candidateSlamSource(source);
  assert.equal(hash(source),file==='game.html'?'2c2cb60f5af6a4759aa24efeea620673b621e7a0dad3658f0a480780f12c58fb':'9aa22aa9a97d75c9ee9908894f7cecad392c608350de3ef676ac13b029438fe7','source drift; reacquire before integration');
  sources.push({file,sourceSha256:hash(source),candidateSha256:hash(candidate),htmlSha256:hash(html),line:html.slice(0,html.indexOf(source)).split('\n').length});
  fs.writeFileSync(new URL(`d10-${file.replace('.html','')}-function.js`,owned),candidate+'\n');
  const lines=source.split('\n'),offset=html.slice(0,html.indexOf(source)).split('\n').length;
  const consumption=lines.indexOf('    P.rage=0;');
  const patch=`--- a/${file}\n+++ b/${file}\n@@ -${offset},4 +${offset},7 @@\n`+
    ' '+lines[0]+'\n+  const _d10Cast=_d10Candidate.begin(P,INV.equipped,srcId);\n+  let _d10Succeeded=false;\n+  try{\n'+lines.slice(1,4).map(line=>' '+line).join('\n')+'\n'+
    `@@ -${offset+consumption-2},5 +${offset+consumption+1},6 @@\n`+lines.slice(consumption-2,consumption+3).map(line=>' '+line+(line==='    P.rage=0;'?'\n+    _d10Candidate.consume(_d10Cast,_rageP);':'')).join('\n')+'\n'+
    `@@ -${offset+lines.length-3},3 +${offset+lines.length+1},5 @@\n`+lines.slice(-3,-1).map(line=>' '+line).join('\n')+'\n+  _d10Succeeded=true;\n+  }finally{_d10Candidate.finish(_d10Cast,_d10Succeeded);}\n '+lines.at(-1)+'\n';
  fs.writeFileSync(new URL(`d10-${file.replace('.html','')}.patch`,owned),patch);
  test(`${file} context patch reconstructs exact candidate without touching production`,()=>{
    const output=html.split('\n'),patchLines=patch.trimEnd().split('\n');let shift=0;
    for(let index=2;index<patchLines.length;){
      const header=patchLines[index++].match(/^@@ -(\d+),(\d+) \+(\d+),(\d+) @@$/);assert.ok(header);
      const oldLines=[],newLines=[];
      while(index<patchLines.length&&!patchLines[index].startsWith('@@')){
        const line=patchLines[index++];if(line[0]!=='+' )oldLines.push(line.slice(1));if(line[0]!=='-')newLines.push(line.slice(1));
      }
      assert.equal(oldLines.length,Number(header[2]));assert.equal(newLines.length,Number(header[4]));
      const position=Number(header[1])-1+shift;assert.equal(Number(header[3])-1,position);
      assert.deepEqual(output.slice(position,position+oldLines.length),oldLines);output.splice(position,oldLines.length,...newLines);shift+=newLines.length-oldLines.length;
    }
    assert.equal(output.join('\n'),html.replace(source,candidate));
  });
  for(const rage of [0,99,99.999,100,150,200,1000])for(const raw of [10,15,20])test(`${file} same source rage=${rage} roll=${raw}`,()=>{
    const original=harness(source,{rage,raw}),proposal=harness(candidate,{rage,raw});original.run();proposal.run();
    assert.deepEqual(proposal.log,original.log);assert.equal(proposal.values.randoms,original.values.randoms);
    assert.equal(proposal.P.rage,rage>=100?Math.min(30,rage*toStoredValue('UI-10',raw)):0);
    const expected={...original.P,rage:proposal.P.rage};assert.deepEqual(proposal.P,expected);
    assert.deepEqual(JSON.parse(JSON.stringify(proposal.context.G)),JSON.parse(JSON.stringify(original.context.G)));
    assert.equal(proposal.P._rageFullLatch,true);
    evidence.push({file,rage,raw,resultRage:proposal.P.rage,damageAndEffectsSame:true});
  });
  for(const config of [{item:null},{item:{uniqueId:'UNKNOWN',slot:'armor'}},{item:{slot:'armor',rarity:5,_uSlamEmberRage:20}},{item:{uniqueId:'UI-10',slot:'weapon'}},{enabled:false},{raw:null},{raw:21}])test(`${file} fallback ${JSON.stringify(config)}`,()=>{
    const original=harness(source,config),proposal=harness(candidate,config);original.run();proposal.run();assert.deepEqual(proposal.P,original.P);assert.deepEqual(proposal.log,original.log);
  });
  for(const fused of [['pillarSlam'],['infernoSlam'],['slamStorm']])test(`${file} fusion ${fused}`,()=>{
    const original=harness(source,{fused,rage:200}),proposal=harness(candidate,{fused,rage:200});original.run('giantSlam2');proposal.run('giantSlam2');
    assert.deepEqual(proposal.log,original.log);assert.equal(proposal.P._gslCd,original.P._gslCd);assert.equal(proposal.P.rage,30);
    if(fused[0]!=='slamStorm')assert.equal(proposal.P._gslCd,420);
  });
  test(`${file} failed mats and failed hit never refund`,()=>{
    for(const config of [{mats:0},{failHit:true}]){
      const original=harness(source,config),proposal=harness(candidate,config);
      if(config.failHit){assert.throws(()=>original.run(),/controlled/);assert.throws(()=>proposal.run(),/controlled/);}else{original.run();proposal.run();}
      assert.deepEqual(proposal.P,original.P);assert.deepEqual(proposal.log,original.log);
    }
  });
  test(`${file} nested call cannot receive or stack D10 refund`,()=>{
    const proposal=harness(candidate,{recursive:true});proposal.run();assert.equal(proposal.P.rage,20);assert.equal(proposal.values.reads,1);assert.equal(proposal.values.calls,2);
    proposal.run();assert.equal(proposal.P.rage,0);
  });
  test(`${file} lesson event and rage-full latch unchanged`,()=>{
    const original=harness(source,{lesson:true}),proposal=harness(candidate,{lesson:true});original.run();proposal.run();
    assert.deepEqual(proposal.log,original.log);assert.equal(proposal.values.lessonCalls,1);assert.equal(proposal.P._rageFullLatch,true);
  });
}
test('consumer tokens reject duplicate, forged, incomplete and nonzero-postconsume refund',()=>{
  const player={rage:0},item={uniqueId:'UI-10',slot:'armor'},equipped={armor:item};
  const consumer=createD10Consumer({enabled:true,readStoredRoll:()=>.2});
  const token=consumer.begin(player,equipped);assert.equal(consumer.begin(player,equipped),null);
  assert.equal(consumer.consume(token,99),false);assert.equal(consumer.consume(token,100),true);assert.equal(consumer.consume(token,200),false);
  assert.equal(consumer.finish(token,true),20);assert.equal(consumer.finish(token,true),0);assert.equal(consumer.finish({},true),0);
  const next=consumer.begin(player,equipped);consumer.consume(next,100);assert.equal(consumer.finish(next,true),0);
  player.rage=0;const failed=consumer.begin(player,equipped);consumer.consume(failed,100);assert.equal(consumer.finish(failed,false),0);
});
test('no implicit saved-roll field, stacking, RNG or global activation',()=>{
  assert.equal(lookupRoll('UI-10').runtimeReady,false);
  const item={uniqueId:'UI-10',slot:'armor',_uSlamEmberRage:20};
  assert.equal(createD10Consumer({enabled:true}).begin({rage:100},{armor:item}),null);
  assert.equal(createD10Consumer({readStoredRoll:()=>.2}).begin({rage:100},{armor:item}),null);
  assert.throws(()=>candidateSlamSource('function other(){}'),/unexpected/);
});
test('explicit stored values reject guessed legacy percent and noncanonical fractions',()=>{
  const item={uniqueId:'UI-10',slot:'armor'};
  for(const stored of [10,20,'0.2',NaN,Infinity,.09,.21,.155,null,undefined])assert.equal(createD10Consumer({enabled:true,readStoredRoll:()=>stored}).begin({rage:100},{armor:item}),null);
});
test('changed equipment, no consume and invalid amount never create rage',()=>{
  const player={rage:0},item={uniqueId:'UI-10',slot:'armor'},equipped={armor:item},consumer=createD10Consumer({enabled:true,readStoredRoll:()=>.2});
  let token=consumer.begin(player,equipped);assert.equal(consumer.finish(token,true),0);
  token=consumer.begin(player,equipped);for(const value of [NaN,Infinity,-100,99])assert.equal(consumer.consume(token,value),false);
  assert.equal(consumer.consume(token,100),true);equipped.armor=null;assert.equal(consumer.finish(token,true),0);assert.equal(player.rage,0);
});
test('write handoff source hashes and deterministic comparison evidence',()=>{
  fs.writeFileSync(new URL('d10-evidence.json',owned),JSON.stringify({sources,comparisons:evidence,sharedModules:['unique-item-project/definitions.js','unique-item-project/roll-values.js'].map(path=>({path,sha256:hash(fs.readFileSync(new URL(path,root)))})),productionModified:false,rollField:'unconfirmed: explicit readStoredRoll injection only',activation:'fixture opt-in, default disabled'},null,2)+'\n');
});
