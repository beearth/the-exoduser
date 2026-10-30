const fs=require('fs'),r=__dirname,wt='G:/exoduser-wt/codex-blender-env-r3',j=JSON.parse(fs.readFileSync(r+'/직접-시각판정.json')),t=JSON.parse(fs.readFileSync(r+'/납품-기술검사.json')),mod=JSON.parse(fs.readFileSync(r+'/source/모듈명세_납품.json'));const doc=wt+'/docs/engine/BLENDER_WOODBRIDGE_R3_20261030.md';let body=fs.readFileSync(r+'/REPORT.md','utf8');body=body.replace('## MAP PRODUCTION REPORT','## MAP PRODUCTION REPORT 요약');fs.writeFileSync(doc,body+ '\n\n'+fs.readFileSync(r+'/MAP_PRODUCTION_REPORT.md','utf8'));let hook=wt+'/docs/engine/UNITY_RM_INT_RUNTIME_HOOK_20261028.md',old=fs.readFileSync(hook,'utf8'),mark='## 2026-10-30 실제 스캔·연속 UV·실물 낙엽 재작업 — woodbridge-r3';if(old.includes(mark))old=old.slice(0,old.indexOf(mark)).trimEnd()+'\n';const table=mod.map(x=>`| ${x.id} | ${x.저밀도삼각형} | ${x.텍스처규격.join('×')} | ${x.BumpScale.toFixed(2)} |`).join('\n');fs.writeFileSync(hook,old+`\n${mark}

최신 승인 APPROVED_1-1_keyframe_A2_woodbridge.png 기준의 독립 Blender 키트다. [전체 계약/실패·검수·표준 보고](BLENDER_WOODBRIDGE_R3_20261030.md), 산출 I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3/REPORT.md·delivery/Assets/Exoduser/Art/Environment/CH1_1_WoodbridgeR3를 따른다. 이전 r1/r2 수치는 후보 이력으로 보존하며 아래18종이 현재 R3다. 현재 공유 r2/delivery는 별도 담당의 추가 재작업 HOLD이므로 이 R3와 섞지 않는다. 인수 당시24맵 중22개 SHA 동일·2개 BaseColor의 이번 대체를 출처-r2-현재납품대조.json에 기록했고 현재 다른 담당 WIP는 자동 인수0이다.

| ID | 삼각형 | PNG 규격 | BumpScale |
|---|---:|---|---:|
${table}

FBX${t.FBX}/PNG${t.PNG}/재질${t.재질}/메타 포함${t.파일}파일·${t.삼각형합계}tri·GUID${t.GUID}. BaseColor sRGB·데이터 linear, R=metallic/A=1−roughness 전픽셀/UV/현재FBX SHA 재수입/실제 원본Alpha/packed현재PNG 대조를 통과했다. 8종 실제 high→low normal/AO/곡률/PBR, 거목2종4K·암반3종과 실제 전체 그루터기2K, 원래 스캔UV의 실제6맵 재베이크. 식생4종은 CC0 원본 사진 UV/노멀/Alpha이며 AO1·곡률.5·roughness.9(낙엽235/255)는 상수다. 전경/말뚝은 실제 Fallen_Log atlas 공유, 다리 BaseColor는 moss_wood 부패 얼룩 재베이크. 상수를 실제 베이크로 과장하지 않는다. 강둑은 현재 UV 삼각형의 실제 보간 높이로 wet=smoothstep(clamp((.48−z)/.50,0,1)), linearRGB(.021,.017,.010)·원본 밝기배율.55~1.5·최대혼합.94·수위주변roughness하한.76의 부패흙 전이를 마감했다.

처진 이끼560개 실물 잎/20다발, 낙엽 모듈48잎·정적 접지1028군락/49344잎. 실제 게임 배치·GPU 예산 PASS가 아니다. 식생cutoff.32·양면2450, 먼 숲 카드만 투명3000/ShadowCaster 비활성. URP/Lit GUID933532a4fcc9baf4fa0491de14d08ed7. 독액대리면 linear RGB(.062,.070,.014)→(.082,.086,.021), 중앙근사sRGB#4C4F24, roughness.16/IOR1.36/SpecularIORLevel.30/발광0. 물/불/체적안개는 Blender 검수 대리물이다.

**VISUAL VERDICT: ${j.판정}.** ${j.완료설명} 실제1920×1080·1x와 모듈18종 동일52도/같은조명·노레위 비교가 근거다. Unity/Player/빌드/충돌·실이동·탄막/8게임카메라/M1 미실행. 코드/docs는 전용 codex/pc-blender-env-r3-20261030에 보존하며 원격SHA는 최종-인계영수증.json과 대조한다. 바이너리 원격 업로드/공통 merge/PC·Mac 동기화 완료가 아니다.

다음 담당: ${j.다음작업} 이 브랜치 전체를 런타임에 merge하지 않는다. 상속 Runtime은 이번 자산 작업의 변경이 아니며, 기존 키샷 담당이 정확한 자산 폴더와 영수증만 별도 인수한다.
`);console.log('관련 docs2개 동기화',t.파일,j.판정);
