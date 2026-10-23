import fs from 'node:fs';
const root='G:/exoduser/',dir=root+'output/new_heroes_refinement_20261022/';
const review=JSON.parse(fs.readFileSync(dir+'detail-visual-review.json','utf8'));
const f=dir+'submission-receipt.json',r=JSON.parse(fs.readFileSync(f,'utf8')),job=r.jobs.find(j=>j.candidate===review.candidate);
const row=JSON.parse(fs.readFileSync(dir+'download-receipt.json','utf8')).rows.find(x=>x.candidate===review.candidate);
if(!job||job.status!=='completed-downloaded'||!row)throw Error('Completed downloaded candidate required');
job.visualVerdict=review.verdict;job.visualReview=review.checks;job.remaining=review.remaining;job.finalApproval=false;
Object.assign(r.latestFuturisticDetailDirection,{status:'Completed image inspected; review candidate only',selectedReviewCandidate:review.candidate,savedPath:row.destination,detailCandidate:'H45',visualVerdict:review.verdict,checks:review.checks,remaining:review.remaining,finalApproval:false,runtimeAdoption:false,reviewedAt:new Date().toISOString()});
Object.assign(r.latestSingleShotGiantGunDirection,{status:'H38 framework retained through further art refinement; latest review is in latestFuturisticDetailDirection',selectedReviewCandidate:review.candidate,savedPath:row.destination,finalApproval:false,runtimeAdoption:false});
r.updatedAt=new Date().toISOString();fs.writeFileSync(f,JSON.stringify(r,null,2)+'\n');
const df=root+'docs/17게임아트팀/HELLGUNNER_SINGLE_SHOT_GIANT_GUN_20261023.md';let d=fs.readFileSync(df,'utf8');
const marker='## 현재 검토본 — '+review.candidate;
d=d.replace(/^## 현재 검토본 — (H\d+)$/gm,(line,candidate)=>candidate===review.candidate?line:'## 이전 검토본 — '+candidate);
if(!d.includes(marker)){d+='\n'+marker+'\n\n최종 승인 전 검토 원화. 게임 코드/3D/사격 애니메이션/음원 반영은 별도다.\n\n- 파일: `'+row.destination+'`, '+row.width+'×'+row.height+' PNG, SHA256 `'+row.sha256+'`.\n- 공급자/모델/실제 입력·프롬프트: submission-receipt.json의 '+review.candidate+' 행.\n\n| 검수 항목 | 실제 확인 |\n|---|---|\n'+review.checks.map(x=>'| '+x.item+' | '+x.note+' |').join('\n')+'\n\n판정: **'+review.verdict+'**. 남은 범위: '+review.remaining.join('; ')+'.\n\nH45 얼굴/단안/의상 디테일 샷 및 이전 원본/미채택 후보는 보존한다. 사용자가 정리한 바탕화면의 옛 검토 사본을 일괄 복구하지 않는다. 프로젝트 원본의 byte/PNG 규격과 실제 눈 검수는 별개로 기록한다.\n';}
const intro='**2026-10-23 최신 검토 후보: '+review.candidate+'** — 팔/견착 교정·미래 총기 디테일·짧은 가죽 핫팬츠·단안 고글 후속 원화. 상세 실제 검수와 남은 범위는 문서 마지막 현재 검토본 절을 따른다. 사용자 최종 승인/게임 반영은 별도.';
d=d.replace(/^\*\*2026-10-23 최신 검토 후보:.*\n?/gm,'');const introEnd=d.indexOf('\n')+1;d=d.slice(0,introEnd)+'\n'+intro+'\n'+d.slice(introEnd);fs.writeFileSync(df,d);
const nf=dir+'shared-notes.json',notes=JSON.parse(fs.readFileSync(nf,'utf8'));
const captured=new Map(notes.map(entry=>{const current=fs.readFileSync(root+entry.path,'utf8');if(!current.includes(entry.note))throw Error('Own shared note changed: '+entry.path);return [entry.path,current];}));
for(const entry of notes){const current=captured.get(entry.path);const old=entry.note;const cuts=[' **2026-10-23 재정정:**',' **2026-10-23 견착/디테일 후속:**'].map(tag=>old.indexOf(tag)).filter(i=>i>=0);const prefix=cuts.length?old.slice(0,Math.min(...cuts)):old;const link=entry.path.startsWith('docs/17게임아트팀/')?'HELLGUNNER_SINGLE_SHOT_GIANT_GUN_20261023.md':'../17게임아트팀/HELLGUNNER_SINGLE_SHOT_GIANT_GUN_20261023.md';entry.note=prefix+' **2026-10-23 견착/디테일 후속:** 팔을 앞쪽으로 길게 받치는 견착 교정, 미래 총기 디테일, 가죽 핫팬츠, 단안 고글 지시를 반영한 '+review.candidate+' 검토 후보를 보존했다. 실제 검수/남은 범위/참조는 [최신 거대총기 대장]('+link+')을 따른다. 최종 승인·게임 연결은 별도.';fs.writeFileSync(root+entry.path,current.replace(old,entry.note));}
fs.writeFileSync(nf,JSON.stringify(notes,null,2)+'\n');let c=fs.readFileSync(dir+'checkpoint.mjs','utf8');for(const p of ['finalize-detail-review.mjs','detail-visual-review.json'].map(n=>'output/new_heroes_refinement_20261022/'+n))if(!c.includes(p))c=c.replace('const fixed=[','const fixed=[\n '+JSON.stringify(p)+',');fs.writeFileSync(dir+'checkpoint.mjs',c);
console.log(JSON.stringify({candidate:review.candidate,path:row.destination,verdict:review.verdict,remaining:review.remaining,finalApproval:false}));
