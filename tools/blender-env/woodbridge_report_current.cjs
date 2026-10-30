// 실제 최신 영수증과 직접 판정만 한국어 문서에 반영한다. 다른 담당의 뒤쪽 절을 자르지 않는다.
const fs=require('fs'),crypto=require('crypto');const R='I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2',D='G:/exoduser-wt/codex-blender-env/docs/engine/UNITY_RM_INT_RUNTIME_HOOK_20261028.md';
const read=p=>JSON.parse(fs.readFileSync(R+'/'+p,'utf8')),sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const rows=read('source/모듈명세.json'),tech=read('납품-기술검사.json'),judgment=read('직접-최신판정.json');
const table=['| ID | 실제 용도 | 삼각형 | 맵 규격 |','|---|---|---:|---|',...rows.map(r=>`| ${r.id} | ${r.역할} | ${r.삼각형} | ${r.텍스처해상도}×${r.텍스처높이||r.텍스처해상도} |`)].join('\n');
const gate=['| 브리프의 수정 항목 | 현재 구현과 직접 판정 | 남은 사항 |','|---|---|---|',...judgment.항목.map(r=>`| ${r.항목} | ${r.근거} | ${r.잔여} |`)].join('\n');
const text=`# 승인 나무다리 환경 키트 — 최신 스캔 재작업 검수

**VISUAL VERDICT: ${judgment.판정}. ${judgment.결론}** 기술 PASS와 디자인/실게임 PASS는 별개다. 제작자 자체 판정이며 총괄의 독립 검수는 아직 없다.

## 현재 산출과 같은 후보의 근거

- 자산: ${R}/delivery/Assets/Exoduser/Art/Environment/CH1_1_RottenForest. FBX${tech.FBX}·URP 재질${tech.재질}·PNG${tech.PNG}·메타 포함${tech.파일수}파일, ${tech.삼각형합계}삼각형. unitypackage 없음.
- [최종1920×1080](승인구도_최종.png), [승인 원화와 나란히](compare/승인원화_나란히.png), [모듈 전체](모듈보드.png), compare/1x_*.png 및 개별 원화/노레위 비교.
- 승인 기준: G:/exoduser/tmp/design-review/20261030_keyframe/APPROVED_1-1_keyframe_A2_woodbridge.png. 참고 이미지는 비교에만 사용하며 자산/Git에 넣지 않았다.
- 원본: source/숲_베이크.blend 및 source/승인구도_조립.blend. 소스 SHA는 renders/조립_입력.json에 있다. 각 모듈의 입력 FBX/7PNG/정면·측면 SHA는 renders/입력_*.json이며 기술검사가 현재 바이트와 대조한다.
- 소스 제어는 자기 레시피와 관련 SSOT만 전용 브랜치에 보존한다. 바이너리/후보/렌더/원본/로그의 실체는 I:다. 상속 Runtime 병합 요청, Unity/Player/빌드/Steam 업로드/배포는 모두0.

## 브리프 마지막 다섯 항목

${gate}

${judgment.총평}

## 현재 모듈

${table}

Blender m/Z-up → FBX -Z forward/Y-up. 피벗과 실제 범위는 source/모듈명세.json의 최소/최대 XYZ 전체 값이다. 개별 검수52도는 동일3광원·세계광·원본1600×1000으로 정면/측면34장이다. 물체별 카메라 거리만 화면 점유율에 맞추며 FBX 크기를 바꾸지 않는다.

## 실제 제작법과 상수

| 범위 | 현행 구현 |
|---|---|
| 거목2종 | Poly Haven island_tree_01 목질 스캔. 생잎/잎가지 카드 제거. 높이 기준24m, XY .9, 변주 X반전·Y .88·Z .9 후 면 방향 수정. 주 거목은 중심 높이2.05m, 반경(.72,1.7,2.2)의 실제 Boolean 부패 공간. 오브젝트 음수 배율0 |
| 그루터기/전경 뿌리 | 동일 실제 목질 밑동을 각각2.5/1.05m에서 잘라 XY1.18/1.6, 파단 높이 .15sin+ .07cos. 사진 바닥이 딸려 나오던 후보는 FAIL |
| 최종 뿌리/두께 | 실제 파단 목질7갈래를 비대칭으로 굽혀 실제 밑동(XY.35/Z.70)과 접합. 이전 바닥링 후보는 FAIL. 거목2종/그루터기에는 실제 .20m 목질 두께와 CC0 FineGrainedWood 내벽(scale .35/.35/.55, tint .28/.20/.12, bump .18/.035)을 만들고 전체6맵 재베이크 |
| 촬영판 제거 | 거목2종·그루터기·전경 뿌리의 최하단 .35m를 실제 절단. 기존 상부 베이크 UV 보존. 하부 단면은 매립용 열린 환경 메시이며 Collider가 아님. 목질 융기를 흙으로 덮어 숨기지 않음 |
| 고목 | 기존 CC0 dead_tree_trunk_02 실제 파단만 유지. 하이의 원본 재질/보존 정점로 식별해 관형 덧붙임998tri 제거. UV seam을 실제 끊긴 목질로 오인한 연결성 분리는 폐기 |
| 강가 암반 | rock_moss_set_01 실제 최대 메시, 가로 최장3.7m·하부−.14m. 실제 PBR/노멀과 거친 침식 형태 유지 |
| 다리 |29상판·10말뚝·목재 난간·매듭·처진 밧줄. 상판5장(id3/8/14/19/24)의 끝을 .45~.80m 비대칭 파손·최대 .16m 처짐. 기존 UV 보존, 재베이크라 표시하지 않음 |
| 이끼 | moss_01 실제 사진 알파/노멀. 긴 줄기2셀만 선택한 굽은96면군락, 각8구간·1536tri. 기부 위/끝 아래, 회갈색 색층. 신선한 녹색 이끼로 대체하지 않음 |
| 시든 덤불 | shrub_03 실제 UV·알파·노멀. 단일 줄기를 비대칭5개체 군락으로 구성. 마른 적갈색 톤, 실제 단일 줄기2385tri→군락11925tri |
| 버섯 | 닫힌 반원 갓15개·얇은 옅은테·성장고리·균사. 큰 빈 고리와 두꺼운 옅은 판 후보 폐기 |
| 베이크 | 불투명14종은 실제 Normal/AO/Pointiness Curvature/BaseColor/Roughness/Metallic 베이크 이력. 최신 목질5종/암반은 실제 스캔 high→low. 이전 일부 보조물의 high는 SIMPLE 세분화/CC0 범프. 모두 수작업 스컬프 high라고 주장하지 않음 |
| 알파/카드 상수 | 이끼·덤불은 CC0 UV/알파/노멀 유지, AO1·곡률.5·rough235/255·metal0 기준 상수. 후경22×11m 카드2048×1024는 실루엣 실제 렌더, 하단24% 감쇠, 나머지6맵 상수. 이21개 상수맵을 3D 베이크라 부르지 않음 |
| 톤 | 원 베이크 보존 후 블러 .55, AO블러1·곡률블러2의 넓은 명암. 새 유기물 roughness 하한205/255. 점 노이즈·그레인 생성0 |
| URP | Lit GUID933532a4fcc9baf4fa0491de14d08ed7, Bump .7/Occlusion .6, BaseColor만sRGB, normal importer1/linear, mipmap/Trilinear/aniso8. R=metallic/A=1−roughness. 이끼/덤불 알파컷.35·양면·2450·ZWrite1, 후경만 transparent3000·ZWrite0·ShadowCaster 비활성 |

Blender 검수 노멀 강도는 대부분 .5, 식생 .45이므로 Unity와 동일 노출/법선 강도라고 주장하지 않는다. Alpha는 별도 공식 흑백 마스크를 RGBA에 넣었으며 JPEG의 상수 Alpha를 사용하지 않는다.

## 강·지면·빛의 범위

| 값/표현 | 현재 Blender 대리물 |
|---|---|
| 독액 기준 | 중심 linear(.075,.080,.023), 근사sRGB#4D502A, 저주파 범위(.052,.058,.012)~(.084,.087,.024), 거칠기.34·IOR1.36·specular레벨.28·coat.05·발광0 |
| 강 표면 | 낮은 파동 bump scale1.7/strength.12/distance.035, 실제 정적 반영·거품·부유목·강가 말뚝. Unity 표면 셰이더/흐름/기포 구현은0 |
| 토양 | 공식 CC0 mud_forest+brown_mud_leaves_01, 채도.45/밝기1.2/블러2.2 후 저주파 위치 혼합, 월드 배율.12. 원본 사진은 불변. 깊이 변화를 가진 연속 강둑양쪽 각321×129정점/면당4점, .25m 간격 |
| 오른쪽 수로 | 북쪽 강둑 오른쪽을 지류로 개방, 그루터기 섬 반경2.5×3.0m·거목 접지2.4×2.8m, 1.2m 완화 경사. 수면 대리면은 y58m까지, 강바닥 모듈3개를 지류에 추가 |
| 접지 | 촬영판 제거 후 최하부 .18m만 접합 보정. 식생 기부를 최종 토양 BVH 표면에 투사. 수면 위에 뜬 흙판/흙으로 목질을 덮는 보정 후보는 FAIL |
| 분위기 | 후경 체적 안개.026·전중경 습기.006·실제 spot2개+카메라용 부드러운 체적 광선2개. 연출 체적 밀도.008·발광.14의 방사 감쇠이며 물리 햇빛/Unity 구현으로 확대하지 않음 |
| 카메라 | 조립(16,−25,26)→(0,4,1),40mm, 하향약37도. 원화에서 눈으로 추정했으며 정확한 카메라 보정은 아님. 비교 보드의 원화/후보 크기를 명시 |

토양·수면·불꽃·광원·안개는 이번 Assets 인수 목록에 없는 정적 Blender 검수 대리물이다. 실제 게임 담당이 같은 결과를 재현했는지 별도로 확인해야 한다.

## 기술검사와 보존

현재17FBX SHA 재수입·삼각형/축/크기오차<.003m·퇴화면/고립정점/UV0범위 오류0. 강바닥 장축 끝13쌍<.00001m. GUID${tech.GUID수} 중복/유실0, PNG119 규격·색공간·R금속/A평활 전픽셀 검사 PASS. packed 원본2개가 실제 연결된 납품 PNG 바이트와 일치하는지 packed-검사.json으로 별도 확인한다.

Unity/Player/GPU/임포터/현재게임8카메라/군집전투/탄막/충돌/동선/성능/M1은 전부 미검증이다. UI 실행 순번을 사용하지 않았다. 원본 r1 202파일·시작 입력3개·guard WIP SHA를 최종 영수증에서 대조한다. 다른 담당의 woodbridge-r3·실제 게임 코드·세이브·공용 INDEX 변경0.

## 출처와 실패

[Poly Haven 공식 CC0](https://polyhaven.com/license). 실제 채택은 island_tree_01, rock_moss_set_01, moss_01, shrub_03, mud_forest, brown_mud_leaves_01 및 이전 bark_brown_02/fine_grained_wood/dead_tree_trunk_02 등의 인수 원본이다. 파일별 공식 URL·MD5·SHA·비용0은 pbr-source/*/출처-다운로드.json, 이전 원본은 출처-현행대조.json/출처.json. API는 Powered by Poly Haven. 구매/유료생성0. root_cluster_01은 원본 무결성 대조 후 시험했지만 흙판/분리 잔해 때문에 최종 자산에서 제외했다.

반복 관형 주간·표면 목질 덧붙임·넓은 흙판·찢긴 뿌리 분리·너무 작은 아틀라스 전체 사용·몸통 안쪽 이끼·목질까지 덮은 토양은 실패로 기록하고 제작법을 바꿨다. 이미지 packed와 파일 경로 캐시 불일치는 보존 packed 바이트에서 새 이미지를 읽어 고쳤다. Boolean의 n-gon은 BVH의 삼각형 전용 가정을 제거하고 최종 FBX는 실제 삼각화했다. 같은 원인 에러를 반복 성공으로 포장하지 않는다.

## MAP PRODUCTION REPORT

| 항목 | 실제 범위 |
|---|---|
| STAGE/MASTER | CH1-1 승인 썩은 숲·독액·나무다리의 독립 환경 키트/정적 키샷. 기존 맵·Core·저장·남→북 진행 변경0 |
| OUTER MASS/LARGE | LEFT 속빈 실물 거목·RIGHT 분기 거목/낮은 실물 밑동·TOP 먼 숲/체적 안개·SOUTH 실물 파단 목질/가지. 실게임 외곽 구멍 검수는0 |
| MEDIUM/GROUND | 실제 노출 뿌리·저층 식생·이끼·부후균·강가 말뚝, 연속 토양/낙엽/젖은흙 접합. 실제 맵 배치 미반영 |
| PLAYABLE/LANDMARK | 다리/접근 축을 비운 정적 구도, 다리1곳·횃불받침2곳. 실제 이동·다수적·회피·탄막/전투 가독성은 미검증 |
| CAMERA QA | 동일52도 정면/측면34장·승인구도1920×1080·1x. 실제 START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT8뷰는0 |
| TECH QA | 위 파일/채널/재수입 검사. route/collision/pageerror/404/seam/loading/GPU performance/M1 미검증 |
| FILES/GIT | source/후보/렌더/납품 I:, 자기 레시피와 이 SSOT만 별도 브랜치 정상 복구. 상속 Runtime 통합·배포0 |
| VISUAL VERDICT | ${judgment.판정} — ${judgment.결론} |
| NEXT PASS | ${judgment.다음작업} |

## 재현과 인수

현재 파일에 앞단 생성 단계를 재실행하지 않는다. 새로운 I: 후보에서 원본 r1 및 목질전환 전97039f5a4 입력을 SHA 대조해 준비한다. 현재 완성 단계의 접지/군락 마커를 새 재생성에 섞지 않는다. 모든 source 저장 작업은 이전 프로세스 종료 후 순차 실행한다.

원래 woodbridge_make/roughness/fungal/profiles/shrub/moss/attach_branches/finish → bridge_weather → fetch_tree/island_tree_01 → scan_trunks → cavity_trial → bake_scan_trunks → finish(거목2ID) → fetch_moss/moss_cards.cjs/moss_cards.py → fetch_shrub/shrub_maps/shrub_scan/shrub_cluster → fetch_tree rock_moss_set_01/scan_feet → finish(그루터기/뿌리/암반3ID) → clip_scan_bases → log_uv_isolate → volume_roots → root_anchor_inner → card/card_fade → fetch_ground/ground_maps → finalize/package/verify → render(조립, --modules) → review/validate/verify_packed/receipt → 본 보고서. root_cluster 계열은 실패 이력이며 최종 재현에 넣지 않는다.

자산 인수 때는 현재 delivery/Assets 및 동일 후보 영수증만 사용한다. 이 브랜치 전체를 merge하지 않는다. UI 공통 반영 뒤 기존 키샷 담당의 실제 Unity 검수가 별도다. ${judgment.다음작업}
`;
fs.writeFileSync(R+'/REPORT.md',text);const marker='## 2026-10-30 사용자 승인 나무다리 기준 — Blender woodbridge-r2';const section=`${marker}\n\n현재 ${R}/REPORT.md가 최신 판정이다. **${judgment.판정}: ${judgment.결론}** FBX17/재질17/PNG119/${tech.파일수}파일/${tech.삼각형합계}tri. 실제 스캔 전체 목질·속빈 부패 기하·파단 밑동/노출뿌리·실물암반, CC0 알파 이끼96면/시든5개체 군락, 실제 파손 상판5장을 제작했다. 촬영판.35m 기하 절단·UV 보존, 최하부.18m만 토양 접합, 식생 기부 투사.\n\n${table}\n\n14불투명 모듈의 실제 베이크 이력, 식생2종은 원본 알파/노멀과 AO1/곡률.5/rough235/255/metal0 상수, 카드6맵 상수. URP/Lit Bump.7/Occlusion.6·sRGB/linear·R금속/A평활 계약 유지. 식생 AlphaClip.35/양면/2450/ZWrite1, 후경만3000/ZWrite0. 현재 FBX17 SHA 재수입·bounds<.003m·오류0/강바닥13쌍<.00001m·GUID${tech.GUID수}·PNG119·전픽셀 패킹·현재 렌더 입력 SHA를 검사한다.\n\n독액 중심linear(.075,.080,.023)/#4D502A/roughness.34/IOR1.36/emission0, 저주파 범위(.052,.058,.012)~(.084,.087,.024). 실제 static 반영/거품/부유목·체적 안개/연출 광선은 Blender 대리물, Unity 표면 셰이더/토양/광원 인수목록이 아니다. 조립 추정약37도/40mm·1920×1080, 모듈동일52도/1600×1000 정면·측면34장.\n\n${gate}\n\n다음: ${judgment.다음작업} Unity/Player/게임 소스/세이브/상속 Runtime 병합0. r1/guard WIP·다른 woodbridge-r3 보존. 소스/원본/실패/실제 경계와 최신 SHA는 REPORT/최종-인계영수증.json.\n`;
const old=fs.readFileSync(D,'utf8'),at=old.indexOf(marker);if(at<0)fs.writeFileSync(D,old.trimEnd()+'\n\n'+section);else{const tail=old.slice(at+marker.length),next=tail.search(/\n## /);fs.writeFileSync(D,old.slice(0,at)+section+(next<0?'':tail.slice(next)));}console.log('현재 영수증·한국어 REPORT/기존 SSOT 갱신',tech.삼각형합계,judgment.판정,sha(R+'/REPORT.md'));
