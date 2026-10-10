# Druid 뿌리 분출48 — 2026-10-10

보스 잠행 뒤 지면 분출의 `druid_roots` 임팩트만 실제 main의 공통 atlas resource 소비로 연결한다. 보스 자세·경고·타격·전투 수치·맵·저장은 변경하지 않는다. 이전10셀 PNG는 로딩 실패 폴백으로 보존한다.

| 항목 | 현재 계약 |
|---|---|
| actual caller | bossDruidErupt → playVFXAng(druid_roots,x,y,(e.r+120)*2/256,7,0,false) |
| 호출 gate | !_eruptHit && st2<=_eruptMax-8, 한 번 |
| 기존 lifetime | maxFrames10/frameTime7, 명목70 렌더 진행 단위 |
| 진행 원천 | advancement 이후 frame+fraction; bornGameTime!==undefined는 기존 _vfMix, 이외는 t/frameTime |
| 새 clip | name=druid_roots/8열6행/48실변화/fps288/7/loop=false |
| 리소스 duration | 7/6, 기존 normalized phase×durationSeconds로 샘플; 새 timer/RAF 없음 |
| draw | 기존 dw/dh=256*scale, 중앙 x/y와 angle/alpha 그대로; inset1 crop 한 셀 |
| GL | 기존 additive queue 성공은 Canvas0, 실패는 원래 lighter Canvas1/save-finally-restore |
| 수명·cull·budget | 기존 advancement/종료 뒤 cull 및 budget5 통과 시 표시; 성공 뒤 _vw 압축·보존 |
| fallback | resource/http/image/규격 실패·pending이면 원본10셀 또는 원래 timed 분기 |
| sourcePath | assets/vfx/boss/druid_roots_48_20261010.png |
| loader cache | JSON/PNG ?v=20261010-v1, runtime ?v=20261009-v1 |
| JSON schema | exoduser-atlas-clip/version1, 기본 필드 검증; 보조 anchor 메타데이터는 editor roundtrip 보존 주장0 |

48은 원화 장수이며48FPS라는 뜻이 아니다. non-born 경로는 기존 render-owned _dtSp 진행을 사용하고 frameTime 도달 시 t=0으로 기존 remainder를 버린다. 안정된 wall/game 초를 새로 보장하지 않는다. 첫 렌더 advancement, cull·budget 때문에 모든48셀이 자연 노출된다고 주장하지 않는다.

## 원화와 검토

원본 assets/vfx/druid_roots.png의 검증된 GitHub HTTPS 참조를 사용해 Higgsfield gpt_image_2_5/sunburst/max/4k/transparent/4:3 단1job 제작. 황록색 접지 핵과 뿌리 형태를 유지한다. 모든 source 셀에 같은 crop/투명padding을 적용하며 scale1/RGBA수정0/원PNG 덮어쓰기0. 원본 실제 alpha의 접지 기준과 새packing을 비교하고 검정/회색 합성으로 판단한다. 자세/3D/별도캐릭터 제작으로 세지 않는다.

원화 세부 크기·SHA·anchor와 시각 판정은 외부 `engine-druid-roots48-20261010/animation/published.json` 및 최종 completion을 따른다.

## 검수 범위

첫 실제whole-inline 구문·wholeloader/realruntime 통제검사에서1012조건 통과 뒤 whole-render fixture 종료괄호 추출 준비실패가 발생했다. 제품구문 실패/코드 수정이 아니며, 미도달 render/fallback/GL만 외부 fixture를 정정한 별도 Node1 delta3그룹34조건 PASS로 확인했다. 이전통과검사 재실행·합산0. sourcepeer actionable/blocking0.

새 PNG와 actual whole draw helper의 독립 Canvas 축소·48sourcephase는 별도 최초 검수한다. full main 정상 줌·보스전·GPU·동시효과 성능·청취·실save·AAA급은 미인수다. VISUAL VERDICT: RETOUCH, 전투 배경에서 접지/가림/조화 검수가 남아 있다. proof는 실제 인게임 녹화가 아니다.

다른 보스·일반 전투 임팩트도 필요 장수로 늘리되 동시 표시 성능이 확인되는 단위부터 적용한다. 프레임 복제수 채우기나 숫자만 늘린 완료 선언은 하지 않는다.

| 원본 보존·제품 | bytes | SHA256 |
|---|---:|---|
| druid_roots_48_20261010.png | 9287001 | 9b92efeeef1c5cc8684c7e0d6b6617c1a49f95dd29a44b746aa05f2668ff288d |
| druid_roots_48_20261010.clip.json | 325 | f6fa0a4af3483818fa9111dd119a42bd68a210e0af5c2b200637acc2606b3b4c |

## 실제 신규 파일과 검수 델타

| 항목 | 실제 관측 |
|---|---|
| 생성 job | 11b07e44-8fa7-4e7a-82e2-7f1b1fd3cb96/단1job/견적15credits/실debit조회0 |
| raw | 3312×2480, 8열6행의 행 높이413/414 혼합 |
| packed | 3584×2688/448셀/동일 sourcecrop[-190,-346,205,42]/scale1/alpha색수정0 |
| 접지 | cell224,400/.5,.892857; 원본중앙base.891889 대비256표시0.248px 차이 |
| 경계 | source ownalpha>16 보존/외곽생략maxalpha4/edges0/이웃body혼입0 |
| 시각 약점 | 40→41 잔가지 재증가와 최후 원점 추정; RETOUCH/추가job0 |
| 실제 PNG 최초 helper 검사 | Node1/98조건PASS/48서로다른 축소 가시raster |
| 비교 proof 한정 정정 | deliberate fetch(false) fixture가 비동기 ready를 지워 새비교row가 공백인 시각FAIL; fixture실패 대기 뒤 realimage bind만 정정, 제품수정0 |
| comparison/playback delta | 별도 Node1/148조건PASS, 이전48phase 검사 재실행0 |
| WebP 미리보기 | 제품loopfalse와 별개로 반복하는 독립helper proof. 70nominal단계+400ms빈구간, 합1567ms |

JSON frameWidth/frameHeight448/pivot(.5,.5)는 보조정보이며 실제표시는 기존256×scale geometry를 사용한다. editor normalization에서 이 보조정보가 버려져도 기본 clip 계약은 유지된다. Native/GPU/전체전투 성능·실청취/save 인수는 여전히0이다.

## 2026-10-10 후속 — 별도 FDG 표시 소비

기존 roots48 제품/본편 consumer는 위 계약대로 동결한다. 신규 FDG DruidRootsNode는 같은7인자 요청과 외부frame/fraction을 표시하는 별도 장면 adapter다. 원게임 clock/전투/원PNG·JSON 변경0. 독립 Scene Studio의60tick reference preview를 본편70render진행 시간과 혼동하지 않는다. [새 consumer 계약·검수/RETOUCH](FDG_DRUID_ROOTS_CONSUMER_20261010.md).
