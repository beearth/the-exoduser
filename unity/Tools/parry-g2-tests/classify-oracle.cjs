const fs=require('node:fs'),path=require('node:path');
const root='I:/EXODUSER-Storage/codex-takeover/parry-g2';
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const base=read('baseline-current/oracle-result.json'),current=read('enemy-hurt-oracle/oracle-result.json'),before=read('classification-before-fix.json'),provenance=read('baseline-current/provenance.json');
const key=x=>x.kind+'|'+x.name,remaining=new Map();
for(const row of base.failureDetails)remaining.set(key(row),(remaining.get(key(row))||0)+1);
let matched=0;const introduced=[];for(const row of current.failureDetails){let k=key(row),n=remaining.get(k)||0;if(n){matched++;remaining.set(k,n-1);}else introduced.push(row);}
const missing=[...remaining.values()].reduce((a,b)=>a+b,0);
const h3=base.failureDetails.filter(x=>x.kind==='H3'),text=base.failureDetails.filter(x=>x.kind!=='H3');
const overlay=current.expectationOverrides||[];
const result={scope:'baseline delta audit; not a full oracle PASS or Unity gameplay verdict',base:provenance.base,implementationBefore:before.implementation,oracleBlob:provenance.oracleBlob,baselineExecutions:1,checks:current.total,baselineFailures:base.failures,originalFailures:before.implementationFailures,existingBossDialogue:h3.length,existingMaliceText:text.length,intendedAPlan:before.intended,correctedNonTargetDefects:before.defects,expectationOverrides:overlay.length,matchedExisting:matched,missingExisting:missing,newUnexpected:introduced.length,remainingByKind:current.failuresByKind,passed:base.total===current.total&&matched===base.failures&&missing===0&&introduced.length===0&&overlay.length===372&&current.expectationMode==='웹과 다름(A안)'&&text.every(x=>x.name.includes('악의오브'))};
fs.writeFileSync(path.join(root,'oracle-audit.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));if(!result.passed)process.exitCode=1;
