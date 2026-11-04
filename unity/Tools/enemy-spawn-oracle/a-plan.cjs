'use strict';
// 정책 정본: PARRY_G2_20261103.md / PARRY_G2_ORACLE_AUDIT_20261103.md.
// Core는 읽기 전용이다. 웹 mkEn의 세 결정식만 바꾸고 RNG/분열 후처리는 원문에 맡긴다.
const OTHER_POOL_INTERVAL=480;
const policy={targets:[0,4,6,19,29],noProj:[0,4,5,6,9,11,19,20,24,29,50,51,52,53,54,55,56,57,58,59],ranged:[1,7,8,9,13,16,17,25,26],otherPoolInterval:OTHER_POOL_INTERVAL};
function create(mode='a-plan') {
 if(!['a-plan','web'].includes(mode))throw Error('unknown expectation mode: '+mode);
 const interval=et=>policy.noProj.includes(et)?9999:policy.ranged.includes(et)?240:policy.otherPoolInterval;
 const metadata={mode,basis:'PARRY_G2_20261103.md; PARRY_G2_ORACLE_AUDIT_20261103.md §6',policy:mode==='a-plan'?policy:null,injections:[]};
 const prelude=mode==='web'?'':'var __aPlanPolicy='+JSON.stringify(policy)+';function __aPlanTarget(et){return __aPlanPolicy.targets.includes(et);}function __aPlanInterval(et){return __aPlanPolicy.noProj.includes(et)?9999:__aPlanPolicy.ranged.includes(et)?240:__aPlanPolicy.otherPoolInterval;}';
 function inject(body,sourceLines) {
  if(mode==='web')return body;
  const changes=[
   ['Interval',/:\s*_noProjEtypes\[etype\]\?9999\s*:240/g,':__aPlanInterval(etype)'],
   ['Target',/projCd:_projCd/g,'projCd:!ib&&__aPlanTarget(etype)?9999:_projCd'],
   ['InitialDelay',/projT:ib\?70\+Math\.random\(\)\*50:180\+Math\.random\(\)\*120/g,'projT:ib?70+Math.random()*50:(180+Math.random()*120)*(__aPlanInterval(etype)===480?2:1)']
  ];
  for(const [name,re,after] of changes) {
   const hits=[...body.matchAll(re)];if(hits.length!==1)throw Error('A-plan mkEn anchor '+name+' matched '+hits.length);
   const before=hits[0][0],offset=sourceLines.join('\n').indexOf(before);
   if(offset<0)throw Error('A-plan source anchor missing: '+name);
   metadata.injections.push({function:'mkEn',name,line:sourceLines.join('\n').slice(0,offset).split('\n').length,before,after});
   body=body.replace(re,after);
  }
  return body;
 }
 return {interval,metadata,prelude,inject};
}
module.exports={create};
