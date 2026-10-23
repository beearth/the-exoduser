import fs from 'node:fs';import {versions} from './pose-versions.mjs';
const root='G:/exoduser/',folder=root+'output/new_heroes_refinement_20261022/',base=root+'docs/17게임아트팀/';
const r=JSON.parse(fs.readFileSync(folder+'submission-receipt.json','utf8'));
const scopeJobs=r.jobs.filter(j=>Object.hasOwn(versions,j.candidate));
const rows=Object.entries(versions).map(([id,v])=>{const j=r.jobs.find(x=>x.candidate===id);return `| ${id} | ${v.label} | ${j?.references?.[1]?.path||v.pose||v.extra||'원본 한 장 교정'} | ${j?.task||'미접수 계획'} | ${j?.status||'planned'} | ${j?.savedPath||'산출 없음'} |`;}).join('\n');
const reviews=Object.keys(versions).map(id=>{const j=r.jobs.find(x=>x.candidate===id);return j?.visualVerdict?`- ${id}: ${j.visualVerdict}`:j?.failureMessage?`- ${id}: 실패·환불 표시. ${j.failureMessage}`:'';}).filter(Boolean).join('\n')||'아직 결과 원본 검수 전. 접수와 생성 완료를 구분한다.';
const prompts=Object.entries(versions).map(([id,v])=>{const p=r.jobs.find(x=>x.candidate===id)?.prompt||v.prompt;return `### ${id} (${p.length}자)\n\n${p}`;}).join('\n\n');
const finalIds={A:'H31',B:'H29',C:r.jobs.find(j=>j.candidate==='H32')?.savedPath?'H32':'H27'};
const gallery=Object.entries(finalIds).map(([label,id])=>{const j=r.jobs.find(x=>x.candidate===id);return j?.savedPath?`### ${label} (${id})\n\n![${label} ${id}](../../${j.savedPath})`: `### ${label} (${id})\n\n생성/검수 전`;}).join('\n\n');
const text=`# 헬거너 — 포즈·의상 버전 비교 (2026-10-23)

사용자 지시: “포즈 다양화랑 버전다양화좀 해봐”, “저게 뭐지 어정쩡한 포즈”, “장식도 이상해 바지”, “레퍼런스도 포즈 다양하게 줬는데”. 이어 “총도 좀 멋대가리가 없는데”, “사펑에서 저런총 안나와”, “총기는 그 맛이있어서 사펑에서도 전자총같은거 잘 안쓰는거야”. H24 자세/골반 장식/전자 발광 판상 병기를 수정한다. H22 긍정 얼굴/금발 단발·바디수트/가죽 반바지·오른팔 의수와 낡은 다크판타지 재질은 보존한다. 총기 질감은 사용자 선호를 따르는 디자인 기준이며 특정 게임의 실제 총기 전체에 대한 사실 주장이 아니다.

## 공통 수정 계약

| 항목 | 기준 | 검수 |
|---|---|---|
| 하의 | 겹골반 갑주·암적색 늘어진 천·체인/각인 제거. 한 개의 평평한 벨트와 간결한 가죽 반바지 | 바디수트 높은 골반선과 허리 컷아웃을 가리지 않음. 실제 출력의 제거 수준 확인 |
| 포즈 | 각기 다른 사용자 참조를 ref2로 직접 업로드. ref1 H24는 외형/재질만 유지하고 기존 자세는 해제 | 팔꿈치/손/그립·다리 무게중심·지지 방식이 세 안에서 실제로 달라야 함 |
| 매력/세계관 | H22 얼굴/금발 단발·눈 바이저 유지, 낡은 가죽/흑철과 소량의 견갑 | 실버테일 장식으로 다시 과밀해지지 않음. 전신/양발/무기 전체, 무작위 점도트 검사 |
| 총기 | 판상 레일건/전자 발광 폐기, 물리 총열/리시버/급탄·탄창/장전부/소염기·제퇴기와 손잡이를 구분 | A H31 실탄 소총 휴식, B H29 탄띠식 기관총, C H27 탄창식 대물소총. C 앞손 교정 H30/H32는 실패·환불하여 미해결. H28 드럼식 중화기도 실패·환불. 실물 제작/기능 검증 아닌 게임 원화 |
| 비용/절차 | MagicLight Sunburst·4:3·각1장·표시200pt. 최초3안 계획600pt 후 사용자 총기 정정/실패/파지 수정 반영 | 현재 접수${scopeJobs.length}건·표시비용 합계${scopeJobs.reduce((s,j)=>s+(j.displayedCost||0),0)}pt, 화면상 환불${scopeJobs.filter(j=>j.refundObserved).length}건. 계정 최종 잔액/다른 세션 사용과 구분. 실제 상태는 receipt |

## 실제 입력과 상태

입력1은 H25/H26/H27/H29에서 H24, H28/H31에서 H25 중간본, H30/H32에서 H27이다. H31 입력2는 성공한 H27 실탄 소총 원본이고 H30/H32는 H27 한 장으로 앞손만 교정한다. 사용자 사진/원화는 assets/character-concepts/references/20261022/hellgunner_h16/에 보존했다. H26에서만 입력3 user_06.jpg 총기 사진을 썼다. 입력 바이트/역할/프롬프트는 submission-receipt.json에 기록한다.

| 후보 | 버전 | 입력2 | 작업ID | 상태 | 원본 경로 |
|---|---|---|---|---|---|
${rows}

A는 images (5).jpg 피규어의 편안한 체중 이동을 수직 접지로 재해석한 H25에서 시작했다. H28 총기 교체는 처리 불가·환불로 끝나 H31에서 이미 성공한 H27 물리 소총 구조를 참고했다. B는 사용자 징크스 원화의 넓은 지지/앞으로 기울인 몸통/양손 파지를 참고하며 H26 실패 후 H29로 한 번 수정했다. C는 images (2).jpg의 대각선 총기를 보행/양손 운반으로 재해석했다. H27 앞손이 스코프 위에 있어 H30에서 아래쪽 지지로 교정했으나 서비스 일시 오류·환불. Re-edit로 동일 프롬프트/원본 한 장을 복원해 H32를 한 번 재접수했다. 실패 원인이나 안전 필터 여부는 서비스가 명시하지 않아 단정하지 않는다. 참조 그대로 복제나 기능 검증을 주장하지 않는다.

## 원본 검수

${reviews}

## 비교 후보 원본

${gallery}

최종 사용자 오케이 미수신. **C H27의 자연 왼손은 스코프 위에 있어 전완 지지가 미완료**이며 H30/H32 교정은 두 번 실패·환불했다. B H29도 발사 그립이 아닌 상부 운반 손잡이로 무게를 지지한다. A/B/C 세 버전은 비교 후보이며 완성된 사격/인체공학 정본으로 세지 않는다. 게임 런타임 교체·3D 메시/리깅 제작·스팀 배포 없음. 복장에 일치하는 강화척추 후면은 별도 미완료다.

## 실제 프롬프트

${prompts}
`;
fs.writeFileSync(base+'HELLGUNNER_POSE_VERSIONS_20261023.md',text);
for(const name of ['HELLGUNNER_CYBERPUNK_DESIGN_20261022.md','NEW_HEROES_CONTINUOUS_REFINEMENT_20261022.md']){const f=base+name;let d=fs.readFileSync(f,'utf8');const note='**최신 포즈/하의/총기 정정:** 사용자 H24의 어정쩡한 자세·반바지 장식·전자총 형태 거절. 골반 겹갑주/늘어진 천을 제거하고 사용자 포즈 참조로 A 접지 휴식·B 양손 전투·C 보행 운반을 비교한다. 총기는 실탄 소총·탄띠식 기관총·탄창식 대물소총으로 재설계하고 전자 발광을 제거한다. 실패/환불·교정본을 구분한 실제 입력/접수/검수는 [포즈 버전 대장](HELLGUNNER_POSE_VERSIONS_20261023.md)이 최신 기준이다.';d=d.replace(/^\*\*최신 포즈\/하의(?:\/총기)? 정정:\*\*[^\n]*\n/m,'');if(!d.includes(note)){const i=d.indexOf('\n')+1;d=d.slice(0,i)+'\n'+note+'\n'+d.slice(i);}fs.writeFileSync(f,d);}
