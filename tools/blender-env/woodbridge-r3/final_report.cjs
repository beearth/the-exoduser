const fs=require('fs'),crypto=require('crypto'),r=__dirname,j=JSON.parse(fs.readFileSync(r+'/직접-시각판정.json')),t=JSON.parse(fs.readFileSync(r+'/납품-기술검사.json')),rows=JSON.parse(fs.readFileSync(r+'/source/모듈명세_납품.json')),pose=JSON.parse(fs.readFileSync(r+'/source/조립-납품모듈배치.json'));const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const mods=rows.map(x=>`| ${x.id} | ${x.저밀도삼각형} | ${x.텍스처규격.join('×')} | ${x.alpha?'알파':'불투명'} | ${x.BumpScale.toFixed(2)} | ${x.역할} |`).join('\n'),five=j.수정항목.map(x=>`| ${x.항목} | ${x.변경} | ${x.판정} | ${x.잔여} |`).join('\n');
fs.writeFileSync(r+'/REPORT.md',`# 썩은 숲·나무다리 환경 R3 검수

**VISUAL VERDICT: ${j.판정}.** ${j.완료설명}

${j.총평}

## 산출과 동일 후보 근거

| 항목 | 정확한 경로/범위 |
|---|---|
| 납품 | delivery/Assets/Exoduser/Art/Environment/CH1_1_WoodbridgeR3 |
| Blender 원본 | source/승인구도_납품동일.blend |
| 조립 원본 PNG | renders/승인구도_납품동일_1920x1080.png |
| 원화와 같은 크기 비교 | compare/승인원화_납품동일_같은크기.png |
| 원본 1x | compare/고목_이끼_1x.png, 다리_접지_1x.png, 독액_강가_1x.png |
| 모듈 비교 | 모듈_전체검수보드.png, compare/RF3_*_노레위비교.png 18장 |
| 같은 조명/각도 | 모든 모듈52도·1600×1000, 정면18장+핵심3종 측면3장. 보기 크기만 정규화, FBX 단위/피벗 보존 |
| 조립 카메라 | Blender XYZ ${pose.카메라XYZ.map(x=>x.toFixed(2)).join(', ')}, ${pose.초점mm}mm. 승인 구도를 추정해 맞춘 단일 정적 카메라 |
| 범위 | Blender 정적 모듈/조립. Unity/Player/빌드 실행0, 실제 게임·Steam PASS 아님 |

승인 원본은1664×936이며 나란히 비교 보드에서1920×1080으로 표시했다. 후보는1920×1080 원본이다. 1x 크롭은 각각 원본 픽셀을 유지했고 서로 다른 구도임을 라벨에 표시했다. 직접 판정과 파일 SHA는 직접-시각판정.json·렌더-동일후보영수증.json·최종-인계영수증.json을 따른다.

## 마지막 브리프의 다섯 항목

| 항목 | 실제 변경 | 직접 판정 | 남은 사항 |
|---|---|---|---|
${five}

## 모듈과 기술검사

| 검사 | 현재 결과 |
|---|---|
| 모듈/FBX/URP 재질 | ${t.모듈}/${t.FBX}/${t.재질} |
| PNG/전체 파일/GUID | ${t.PNG}/${t.파일}/${t.GUID} |
| 독립 모듈 삼각형 합계 | ${t.삼각형합계} (장면 인스턴스 합계/실게임 GPU 비용과 다름) |
| 현재 FBX SHA 재수입 | ${t.PASS?'PASS':'FAIL'}: 18종·삼각형/축/bounds<.002·UV0·유한 좌표·퇴화면/고립정점 검사 |
| 채널·GUID | BaseColor만sRGB, 데이터 선형/Normal 타입. R=metallic/A=1−roughness 전 픽셀. GUID 중복/미해결0 |
| 실제 알파 | 별도 CC0 Alpha와 납품 RGBA 비교. 이끼2종·낙엽 최대차0, 덤불은 UNorm8 경계 최대1/255. 선언만으로 통과하지 않음 |
| 식생 | cutoff.32·양면·2450. 후경 실루엣 카드만 투명3000·ShadowCaster 비활성 |
| 셰이더 경계 | URP/Lit GUID933532a4fcc9baf4fa0491de14d08ed7. Unity 임포터 수용·실제 GPU·전투·M1 미검증 |

| ID | 삼각형 | PNG 규격 | 표면 | BumpScale | 용도 |
|---|---:|---|---|---:|---|
${mods}

8종은 실제 스캔/조형 high→low normal/AO/곡률/PBR 베이크다. 이 중 거목2종은 자동 UV 조각화의 세부 손실을 확인해 원래 스캔 UV를 보존하고6맵4K를 실제 재베이크했다. 암반3종은 원래 UV와6맵2K를 재베이크했고, 그루터기는 실제 전체 tree_stump_01 스캔/원본 UV/6맵2K로 제작법을 전환했다. 실제 균열 수피 bark_brown_02를 큰 규모로 투사해 점무늬로 보이던 이전 후보를 대체했다. 변하지 않은 Fallen_Log/지형의 실제 베이크는 기하/UV가 같은 현재 후보에서 재사용했다. 전경 프레임과 말뚝 군락은 실제 Fallen_Log 스캔을 조합해 같은 베이크 atlas를 공유한다.

식생4종은 실제 CC0 식물 UV/노멀/별도 Alpha와 톤 atlas다. 초기 tree_stump_02와 속빈 나무 절단 그루터기는 현재 채택하지 않았다. AO1·곡률.5·roughness.9는 기준 상수이며 이 채널을 실제 AO/곡률 베이크라고 부르지 않는다. 처진 이끼는 넓고 갈라진 실물 잎560개를20개 곡선 다발로 엮었다. 별도 낙엽 모듈은 실제 잎48개의 얕은 곡면과1024² atlas이며, 정적 접지 조립1028군락/49344잎을 기록했다. 원본의 흰 스캔 마커만 제외하고 탈색 갈색으로 맞췄다. 해당 낙엽 roughness는235/255, 나머지 식생3종은.9다. 불투명 천막/매끈한 섬유 코어는 채택하지 않았다. 기존4종(다리·균류·횃불받침·먼 숲 카드)은 r2의 기하/베이크를 인수했으며 다리는 판자 뒤틀림·파손과 CC0 moss_wood 부패 얼룩의 실제 BaseColor 재베이크를 반영했다. 먼 숲 카드 BaseColor는 현재 CC0 거목17개의 실루엣을 직접 렌더하고 하단25%/가로끝 Alpha를 페이드한 새 그림이다. 카드의 나머지 상수 데이터 맵도3D 베이크로 과장하지 않는다.

추가 정적 조립에서 같은 납품 스캔을 사용해 북쪽 강둑 전면·나무 앞면·침수 뿌리·다리 외측의 목질/이끼를 연결했다. 이끼가 아래로 벌어지는 줄기 안에 묻히는 결함을 확인해 실제 접점은 유지하고 바깥으로 늘어지는 각도로 수정했다. 정확한 새 인스턴스 수와 접점은 source/중경연결-실제배치.json, 수면 기준은 source/독액-대리면마감.json이다. FBX/UV/PNG는 이 조립 마감에서 변경0이다.

다리 판자 끝은 기존 UV를 유지하며 최대19cm의 비대칭 결손과 뒤틀림을 실제 메시로 추가했다. 이는 기존 베이크의 기하 마감이며 새 high 베이크라고 보고하지 않는다. UV/재질/Seam/Sharp 경계를 유지한 거의 평면 분할 정리로 다리를55524→16938tri로 줄였다. 병렬 가는 수면 윤곽은 직접 검수에서 탈락시켰고, 불규칙 폭/부분 Alpha의 끊기는 막으로 바꿨다.

최종1080p에서 밝은 회색 강둑 단면을 확인해, 현재 지형 UV 삼각형의 실제 보간 높이로 젖은 흙 전이를 다시 만들었다. 기존 사진의 밝기 세부를 유지하고 수위 근처를 부패흙으로 연결했으며, 과도한 흰 반영을 줄였다.

| 실제 높이 기반 강둑 재질 | 값 |
|---|---|
| 젖은 영역 | smoothstep(clamp((.48−z)/.50,0,1)) |
| linear RGB 기준 | (.021,.017,.010), 원본 사진 밝기 배율.55~1.5 |
| 최대 컬러 혼합 | .94 |
| 수위 주변 roughness 하한 | .76 |
| 근거 | source/강둑-실제높이-재질마감.json·현재 모듈명세 |

## 원본·라이선스

[Poly Haven CC0](https://polyhaven.com/license)를 이번 실행에서 확인했다. 실제 원본은 island_tree_01(생잎/잎가지 카드 제외), dead_tree_trunk_02, tree_stump_01, rock_moss_set_01, dry_branches_medium_01, shrub_03, moss_01이다. 지면은 mud_forest/brown_mud_leaves_01/forest_leaves_02, 추가 균열 수피는 [bark_brown_02](https://polyhaven.com/a/bark_brown_02)다. 각 URL·API MD5·수신 SHA와 실제 파일은 출처-원본영수증.json에 있다. 기존 r2 베이크와 출처는 출처-r2-인수.json을 따른다. 출처-r2-현재납품대조.json에서24개 인수 맵 중22개는 당시 원본 SHA와 현재 납품이 동일하고, 다리/카드 BaseColor2개만 이번 재베이크/실루엣으로 대체한 것을 확인했다. 현재 공유 r2/delivery는 별도 담당의 추가 재작업 HOLD이며 자동 인수하지 않았다. 이 R3의 정확한 독립 폴더만 검수 대상으로 삼는다. moss_wood는 채택한 다리 부패 얼룩의 BaseColor 재베이크에 사용했다. 실패 이끼 코어는 채택0. 원화/노레위 이미지는 검수용이며 Git·납품 Assets에 넣지 않았다. 유료 생성/구매0.

## 실패와 교정

| 실제 실패 | 수정/현재 상태 |
|---|---|
| 매끈한 절차적 관형 주간 두 후보 | 같은 방식 중단, 실제 비대칭 전체 나무 스캔으로 전환 |
| 스캔에 붙은 수평 바닥/분리된 흙·가지 조각 | 바닥 받침과 작은 저층 분리 성분 제거. 남은 실제 UV/베이크 유지 |
| 식물 glTF의 컬러 JPEG에 Alpha 누락 | 공식 별도 Alpha2K 연결, 현재 납품 픽셀 회귀검사 추가 |
| 지면 Normal tangent 기저 반전 | 실제 재현16798면 하향 → 위방향 메시로 Normal/AO 재베이크, Blue 음수 비율 검사 |
| 회색 별 모양의 독립 흙섬 | 지형을 숨겨 원인을 분리한 뒤 해당 섬을 수면 아래로 낮춤. 목질 접합은 별도 실제 스캔 |
| 거목/암반 자동 UV의 과도한 조각화 | 원래 연속 UV·높은 기하 보존률·거목4K/암반2K 실제 재베이크로 수정 |
| 잘린 나무의 밑동/매립 후보의 종잇장 같은 림 | 실제 전체 tree_stump_01 스캔으로 제작 단계 전환. 외곽 흙 받침을 지표 아래에 매립 |
| Quaternion 모드에서 Euler 회전 무시 | 실제 행렬로 재현. 기존 검수 배치는 world matrix 보존/XYZ 변환, 새 말뚝5개는 장축Z>.95·높이>1.5m 검사 |
| 사다리 같은 균사 |20정점짜리 반복 성분14개 제외, 닫힌 버섯15개와 같은 UV/베이크 보존 |
| 천막형 이끼/매끈한 뿌리 같은 섬유 | 두 방식 폐기. 넓고 갈라진 실물 잎 다발을 채택 |
| 불투명 atlas 바탕이 알파를 덮은 회귀 | 실제 채널 대조로 검출·교정. 현재 atlas는 원본 마스크와 픽셀 대조 |
| 판자 분할 중 BMesh 핸들 무효화2회 | 연속 성분 분할을 중단하고 전체 판자 모서리를 한 번에 처리/좌표 재식별로 제작법 변경. 실패 실행은 저장/수출 전 중단 |
| 베이크 후 첫 포장 중 오래된 AO 지연 로딩 | 완료된 베이크를 보존하고 출력 단계만 복구. 이후 실제 변경 대상만 재베이크 |

실패 그림과 시험 원본은 source/·renders/FAIL_*에 남겼다. 채택 참조0인 구형 atlas는 복사→SHA 대조 후 납품 폴더에서만 제외했으며 영수증에 정확한 파일 목록을 남겼다. r2·타인 WIP·사용자 세이브 변경0.

## 독액 기준값 — Blender 대리면

| 값 | 현재 |
|---|---|
| 저주파 linear RGB | (.062,.070,.014) → (.082,.086,.021) |
| 중앙 linear RGB / 근사 sRGB | (.072,.078,.0175) / #4C4F24 |
| roughness / IOR / 발광 | .16 / 1.36 / 0 (Specular IOR Level.30) |
| 표면 | 길게 늘어난 낮은 파동 노멀, 비정형 거품막12개와 연결된 얇은 부유막12개, 부유 목질·낙엽, 실제 물가 반영 |
| 경계 | 수면·불꽃·조명·안개/빛기둥은 Blender 검수 대리물. 게임용 수면 셰이더와 시간 변화는 키샷 담당 후속 |

## MAP PRODUCTION REPORT

| 항목 | 이번 범위/실제 상태 |
|---|---|
| STAGE / MASTER | CH1-1 승인 썩은 숲·독액 강·남북 나무다리용 독립 모듈 키트. 게임 Core/충돌/세이브 변경0 |
| OUTER MASS | LEFT 실제 거목·파단 목질, RIGHT 부패 고목/그루터기, TOP 먼 숲과 체적 안개, SOUTH 실제 가지 전경. 전체 실맵 외곽은 미검증 |
| LARGE | 비대칭 스캔 거목2방향·큰 파단 목질·스캔 암반3종. 큰 형태 실패 뒤 제작법 전환 |
| MEDIUM | 실제 파단 뿌리/고목 접합·처진 실물 이끼 다발·균류·마른 덤불 |
| GROUND | 연속 강둑 경사/강바닥·젖은 흙/낙엽/이끼4K. 독립 별 모양 흙섬 제거·침수 목질 뿌리로 접합 |
| PLAYABLE / COMBAT | Blender 접근 중심축 비움. 실이동/dodge/적/탄막/전투 가독성·route/collision 미검증 |
| LANDMARK / CENTER | 나무다리1개와 끝의 횃불받침2곳. 검수 불·광원은 납품 게임 자산 아님 |
| SMALL | 판자 뒤틀림·부분 파손·처진 밧줄·목질 말뚝·비정형 거품·낙엽/잔뿌리 |
| CAMERA QA | 승인 구도 추정 정적1뷰·모듈52도·원본1x. START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 실제8뷰 미실행 |
| TECH QA | 현재FBX/UV/GUID/패킹/알파/packed 검증은 영수증. pageerror/404/seam/loading/GPU/performance/M1 미실행 |
| FILES / STORAGE | 산출·원본·실패·검수·레시피 실체는I:. G:에는 소유 분리한 sparse 작업 폴더와 정확한 코드/docs 경로만 사용 |
| OWNERSHIP | 원래 작업 폴더 HEAD가 작업 중 갱신되고 별도 woodbridge_* WIP가 확인되어 별도 codex-blender-env-r3에서 진행. 원래 INDEX/WIP 미조작 |
| GIT | codex/pc-blender-env-r3-20261030의 자기 레시피+관련 docs만 복구. 정확한 최종 원격SHA는 최종-인계영수증.json. 바이너리 원격 업로드/공통 merge/PC·Mac 동기화 아님 |
| VISUAL VERDICT | ${j.판정} — Blender 정적 범위. 실제 게임 미검증 |
| NEXT PASS | ${j.다음작업} |

이 브랜치 전체를 런타임에 merge하지 않는다. 상속된 키샷 Runtime은 이번 자산 작업의 변경이 아니다. 승인된 정확한 Assets 폴더와 현재 영수증만 기존 키샷 담당이 인수하고 UI 순번 이후 Unity 임포트·게임 카메라·전투 가독성·성능을 별도로 검수한다.

원본 .blend SHA256: ${sha(r+'/source/승인구도_납품동일.blend')}
`);console.log('한국어 실제 후보 보고서',j.판정,rows.length);
