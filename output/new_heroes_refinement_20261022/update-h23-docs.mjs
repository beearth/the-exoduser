import fs from 'node:fs';const root='G:/exoduser/',base=root+'docs/17게임아트팀/',folder=root+'output/new_heroes_refinement_20261022/';
const receipt=folder+'submission-receipt.json',r=JSON.parse(fs.readFileSync(receipt,'utf8'));r.userWearDirection={quote:'의상들이 좀 낡아야겠지 지금 너무 깔끔하니까',receivedAfterH23Submission:true,interpretation:'Localized leather edge abrasion/pressure folds, worn jacket hem, armor edge chips and seam grime. Keep face/hair appeal. No random dot weathering.',implementationStatus:'H23 submitted prompt already says worn black leather/iron; detailed clothing wear adequacy pending original review. Retouch if insufficient.'};fs.writeFileSync(receipt,JSON.stringify(r,null,2)+'\n');
const f=base+'HELLGUNNER_CYBERPUNK_DESIGN_20261022.md';let d=fs.readFileSync(f,'utf8');const old='## 현행 인물 정정 — H22 금발 단발 + 나미 게임 모델 참고 (2026-10-23)';
const latest=`## 현행 방향 — H22 매력 보존 + 실버테일 계열 전사 장비/사용감 (2026-10-23)

사용자 H22 평가 “많이 좋아졌네”. 다음 지시 “조금 전사느낌 나게 해볼까 다크판타지에 맞게”, “실버테일은 그런 느낌도 났는데”. H23 접수 후 “의상들이 좀 낡아야겠지 지금 너무 깔끔하니까” 추가. H22는 긍정 방향의 보존 기준이며 최종 오케이와 구분한다.

| 항목 | 제작 계약 | 검수/경계 |
|---|---|---|
| 인물 보존 | H22 금발 단발·큰 눈/표정·비례·맑은 보라 바이저 | 실버테일의 은발 포니테일/얼굴로 회귀하지 않음 |
| 전사 요소 | 실버테일 흑철/가죽/갑주 실루엣을 절제해 적용: 왼어깨 견갑, 짧은 골반 보호판, 작은 암적색 허리 천, 병기/부츠 단조 금속 테두리 | 전사 느낌 소량은 사용자 지시. 부위/색/크기 세부는 제작 해석. 전신 판금·긴 치마·장식 과밀 금지 |
| 헬거너 보존 | 하이컷 원피스+가죽 반바지·크롭 재킷·오른팔 의수·대형 각진 슬롯 병기 | 전투방식/능력/게임 수치 변경 아님. H15 강화척추 설계 보존 |
| 사용감 | 가죽 가장자리 마모·팔꿈치/골반 압축 주름·재킷 밑단 해짐·갑주 모서리 도장 벗겨짐/틈새 때 | 사용자 추가 지시. 물리적으로 닳는 부위에 집중, 얼굴/금발 매력 유지·무작위 점 얼룩 금지. H23 프롬프트의 worn black leather/iron 반영 수준을 먼저 확인하고 부족 시 별도 재질 편집 |
| 실제 접수 | 1 H22 편집 대상,2 실버테일 보존본. 두 원본 직접 시각 대조 후 업로드 | task7519081980998623232. Sunburst·4:3·1장·200pt·491자, 접수 전 표시 잔액35,090. 상세 사용감 지시는 접수 후 수신, 추가 수정 완료로 미리 세지 않음 |

## H22 인물 제작 계약 — 최신 긍정 외형 보존 기준`;
if(d.includes(old))d=d.replace(old,latest);d=d.replace('**인물 매력 수정 후보 / 사용자 평가 대기**.','**사용자 긍정 방향 / 최종 오케이 미수신**.');
if(!d.includes('| H23 |'))d=d.replace('\nH22 SHA256:','\n| H23 | task7519081980998623232. H22 외형 보존, 실버테일 흑철/가죽 전사 요소 소량 추가 | Sunburst·4:3·1장·200pt 접수·생성 중. 추가 의상 사용감은 결과 검수 예정 |\n\nH22 SHA256:');fs.writeFileSync(f,d);
const f2=base+'NEW_HEROES_CONTINUOUS_REFINEMENT_20261022.md';let p=fs.readFileSync(f2,'utf8');p=p.replace('**최신 H22 인물 정정:**','**H22 인물 정정 이력:**');
if(!p.includes('**최신 H23 전사/사용감 방향:**'))p=p.replace('**H22 인물 정정 이력:**','**최신 H23 전사/사용감 방향:** H22에 사용자 “많이 좋아졌네” 긍정. 얼굴/금발/비례 보존하고 실버테일의 흑철/가죽/갑주를 소량 추가. H22/실버테일2참조·Sunburst·4:3·1장·200pt, task7519081980998623232 접수. 접수 후 의상을 더 낡게 하라는 지시 수신: 가장자리 마모/봉제 주름/재킷 해짐/갑주 칩·틈새 때를 검수하고 부족 시 재질 편집. 무작위 점 얼룩 금지.\n\n**H22 인물 정정 이력:**');p=p.replace('의상/장비 유지, 사용자 평가 대기. 실제 메시 작업 아님','의상/장비 유지, 사용자 긍정 방향. 최종 오케이 미수신. 실제 메시 작업 아님');
if(!p.includes('| H23 |'))p=p.replace(/(\| H22 \|[^\n]*\n)/,'$1| H23 | H22 매력 보존+실버테일 전사 요소/사용감 | 7519081980998623232 | 2참조·Sunburst·4:3·1장·200pt 접수·생성 중. 사용감 추가 지시는 결과 검수 예정 |\n');fs.writeFileSync(f2,p);
