import fs from 'node:fs';
import crypto from 'node:crypto';
const root='G:/exoduser/',dir=root+'output/new_heroes_refinement_20261022/';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const row=JSON.parse(fs.readFileSync(dir+'download-receipt.json','utf8')).rows.find(r=>r.candidate==='H50');
if(!row||sha(fs.readFileSync(root+row.destination))!==row.sha256)throw Error('Missing/mismatched H50');
const review={candidate:'H50',reviewedAt:new Date().toISOString(),path:row.destination,sha256:row.sha256,verdict:'크롬 장식 변형 / 사용자 검토 시안',checks:[
{item:'크롬 장식',note:'양 쇄골 아래의 은색 인레이, 목 옆 작은 연결부, 드러난 옆구리와 골반을 따르는 곡선/분절 금속 띠를 실제 이미지에서 확인'},
{item:'재질',note:'금속 띠에 흰 반사광과 검은 분할 틈이 보임. 피부가 주로 남고 사슬/발광 점도트로 바뀌지 않음. 잔기스는 작아 선명하게 판독하기 어려움'},
{item:'인물/무기',note:'H49 금발 단발/성인 여성 얼굴/보라 단안 렌즈/기계 오른팔/가죽 핫팬츠/거대 단일총열 리볼버 및 네 탄약 식별색이 남아 있음'},
{item:'의상 변형 경계',note:'원본의 검은 목밴드/가슴 시스루와 허리 검은 바디수트 패널 일부가 제거되거나 크롬으로 치환되어 노출이 확대됨. 의상 완전 동일 보존으로 보고하지 않음'},
{item:'구도',note:'기존 근접 전면 구도 유지. 강화척추 뒷면을 확인할 수 있는 후면 그림 아님'}
],remaining:['사용자 크롬 변형 최종 채택 전','목/가슴/허리 의상 변형이 발생한 별도 시안','게임 연결/탄종 선택 로직/3D 구현은 수행하지 않음'],runtimeImplemented:false,finalApproval:false};
const nf=dir+'shared-notes.json',notes=JSON.parse(fs.readFileSync(nf,'utf8'));
const addition=' **2026-10-23 크롬 변형 H50:** H49를 바탕으로 쇄골·목 옆·허리/골반에 은색 크롬 인레이를 넣은 실제 수신 시안. 목/가슴·허리 의상 패널이 줄어 노출이 늘어난 변형이며 완전 동일 의상 보존으로 보고하지 않는다. 기존 H49 보존, 최종 채택 전. 원본·검수·프롬프트는 위 최신 거대총기 대장과 H50 기록 참조.';
const plans=notes.map(n=>{const text=fs.readFileSync(root+n.path,'utf8');if(!text.includes(n.note))throw Error('Own shared note changed: '+n.path);const newNote=n.note.includes('크롬 변형 H50')?n.note:n.note+addition;return {n,text,newNote};});
fs.writeFileSync(dir+'h50-visual-review.json',JSON.stringify(review,null,2)+'\n');
const rf=dir+'submission-receipt.json',r=JSON.parse(fs.readFileSync(rf,'utf8')),job=r.jobs.find(j=>j.candidate==='H50');job.status='completed-downloaded-visually-inspected';job.visualReview=review;Object.assign(r.latestChromeDirection,{status:job.status,savedPath:row.destination,sha256:row.sha256,visualReviewPath:'output/new_heroes_refinement_20261022/h50-visual-review.json',costumeDrift:review.checks[3].note});r.updatedAt=review.reviewedAt;fs.writeFileSync(rf,JSON.stringify(r,null,2)+'\n');
const df=root+'docs/17게임아트팀/HELLGUNNER_SINGLE_SHOT_GIANT_GUN_20261023.md';let d=fs.readFileSync(df,'utf8');
if(!d.includes('## 크롬 변형 H50 실제 수신·검수'))d+='\n## 크롬 변형 H50 실제 수신·검수\n\n- 파일: `'+row.destination+'`, '+row.width+'×'+row.height+' PNG, SHA256 `'+row.sha256+'`. 바탕화면 검토 폴더에도 동일 byte로 신규 저장. H49 원본은 보존.\n- 판정: **크롬 장식 변형 / 사용자 검토 시안**. 생성 완료와 사용자 채택은 별도다.\n\n| 검수 항목 | 실제 관측 |\n|---|---|\n'+review.checks.map(c=>'| '+c.item+' | '+c.note+' |').join('\n')+'\n\n원본의 가슴 시스루·목밴드와 허리 검은 패널 일부가 줄어든 의상 변형을 명시한다. 무기/얼굴/탄약색은 보존됐지만 의상 전체가 동일하게 유지된 국소 편집이라고 주장하지 않는다. 색별 탄종 효과나 실제 게임 기능은 이번에도 미구현이다.\n';
fs.writeFileSync(df,d);
for(const p of plans){fs.writeFileSync(root+p.n.path,p.text.replace(p.n.note,p.newNote));p.n.note=p.newNote;p.n.afterSha256=sha(fs.readFileSync(root+p.n.path));}fs.writeFileSync(nf,JSON.stringify(notes,null,2)+'\n');
let c=fs.readFileSync(dir+'checkpoint.mjs','utf8');for(const n of ['finish-h50.mjs','h50-visual-review.json']){const p='output/new_heroes_refinement_20261022/'+n;if(!c.includes(p))c=c.replace('const fixed=[','const fixed=[\n '+JSON.stringify(p)+',');}fs.writeFileSync(dir+'checkpoint.mjs',c);
console.log(JSON.stringify({candidate:'H50',path:row.destination,verdict:review.verdict,costumeDrift:true}));
