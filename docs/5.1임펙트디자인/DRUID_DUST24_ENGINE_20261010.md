# Druid 땅굴 진입·이탈 링24 — 2026-10-10

이름은 `druid_dust`지만 실제 원화는 중앙이 비어 있는 황록색 유기적 링이다. 실제 stage0 moveset의 `burrowStrike`가 땅굴에 들어가거나 나오면서 표시하는 효과이며 자체 피해 판정은 없다. 새24장 링의 표시 소비만 연결하고 보스 동작·경고·전투·피해·패링·맵·RNG·SFX·save를 바꾸지 않는다.

| 항목 | 현행 계약 |
|---|---|
| 원본 | assets/vfx/druid_dust.png / 2048×256 / 256²셀 / 8열1행 / 8장 / RGBA |
| 새 sourcePath | assets/vfx/boss/druid_dust_24_20261010.png |
| 리소스 | exoduser-atlas-clip/version1/name=druid_dust/6열4행/frameCount24/fps180/7/loopfalse |
| durationSeconds | 14/15 리소스 표현값이며 안정game초 아님 |
| 진입 caller | bossDruidDive→Under, scale=e.r*2/256, frameTime7, ang0, isSkillfalse |
| 이탈 caller | bossDruidUnder→Erupt, scale=e.r*2.6/256, frameTime7, ang0, isSkillfalse |
| 기본 geometry | caller의 dw=dh=256*scale: 진입2e.r, 이탈2.6e.r. 원8셀 폴백은 이 크기 그대로 |
| 신규 ready draw | dw/dh×1.2: 진입2.4e.r, 이탈3.12e.r. 더 작게 그려진 새 band 반경을 원본 수준으로 회복하며 worldcenter·angle·alpha/전투판정은 유지 |
| 수명·phase | 원 maxFrames8/frameTime7: 명목56render진행. 기존advancement후 (frame+fraction)/maxFrames에24셀 매핑 |
| fraction | bornGameTime!==undefined이면 _vfMix, 아니면 t/frameTime. 기존 t=0/remainder폐기 유지 |
| 새셀 등록 | 실제image 용량검증·24immutable rect 생성뒤 ready, inset1 |
| draw | 한효과한셀 / GLadditive 성공Canvas0 / GL실패Canvaslighter1 / try-finally restore |
| budget·종료 | 기존종료/cull/budget5뒤 새분기, 성공시 _vw 압축·continue |
| fallback | import/http/schema/image/grid실패·pending은 원8셀 또는 기존timed path |
| cache | 새JSON/PNG?v=20261010-v1, 공통runtime?v=20261009-v1 |
| 보존 | producer2·factory·전투/RNG/패링/SFX/save·원PNG·기존 hit24/roots48 소비·경고e.r×5.5/7뿌리/9토양파편 |

새 resource fps=180/7는 24그림장을 기존56명목표시진행에 맞추는 표현값이다. 새 wallclock/RAFtimer/게임시간을 만들지 않으며 24FPS·화면60FPS·자연재생시24전부노출 보장과 다르다. 앞서 완료한 다른 보스 효과의 source/PNG/suite는 재검사하지 않는다.

## 원화·인수 경계

Higgsfield gpt_image_2_5/sunburst/max/4k/transparent/3:2를 실제 지원·참조·견적 확인 후 사용한다. 원본HTTPS byteexact를 참조하며 중앙을 비우고 얇은 황록 유기적 링의 출현→유동→분해·소멸을 새24실변화로 제작한다. 복제수채우기·갈색덩굴/해골/불꽃 추가·중앙판 채우기0. 원본을 덮어쓰지 않고 모든셀 공통crop/scale1/padding만 사용하며 실제 검정/회색 alpha합성으로 판단한다. 생성응답·제품규격·SHA·최초source/PNG/editor결과·visual판정은 아래 제작영수증에 기록한다.

mandatory productionMD keyword scan은 engine_editor 단1회/1path1shortline이며 giant0이다. 원등록 프레임수/격자 미기재였으므로 이 정본에 actualsource 계약을 추가했고 관련 current row를 새24+원8fallback으로 동기화한다. 현재 editor 기본필드 roundtrip만 보장하며 frameWidth/Height·pivot 보조메타 재출력은 기존 한계다.

도구/CPU/원화/독립Canvas proof를 실제 normal main/정상줌/전체보스전/GPU/동시효과 성능/청취/실save/AAA 인수로 대신하지 않는다. 확정 visual verdict와 세부 미인수는 영수증절을 따른다.

## 최초 제작·검수 결과

| 항목 | 실제 결과 |
|---|---|
| 생성 | gpt_image_2_5/sunburst/max/4k/transparent/3:2 단1job ddbb349b-f1b2-48e5-b0e1-c158945862ee / 견적15credits / 추가job·잔액·실debit조회0 |
| actual source | 3504×2336 / 584² nominal 셀 / 8,778,901B / SHA256 7a8dbeb402021678d137c9b3a4f52a69d3aeba7007d47d4d17f77b9e32e616ba |
| 제품 PNG | 3264×2176 / 544² 셀 / 7,251,570B / SHA256 2ad66acc19c763720a04233417d5cc0a683bebdebf46eedca9b53370caf1c694 |
| 제품 JSON | 323B / SHA256 17763e8c8f32aa8587a36479fb5c39f88b2dbf93c4842fdb2bc4b399fd598274 |
| packing | 공통origin crop[-237,-261,241,243] / 원RGBA crop내 exact / scale1/resample0/padding만 / crop외부maxalpha3 |
| 정렬 | targetorigin[272,272]=[.5,.5], frame0..17 원맞춤정수이동·frame18..23 후기origin추정 |
| 셀 안전 | 고알파 body loss0 / 이웃body0 / edgealpha0 / actual RGBA·black·gray24 unique |
| 여백 약점 | origin pixel alpha0..1이고 >16은0. 마지막24장 입자395개의alpha>16pixel이 earlier central radius87.6px 안에 들어가 엄격한 큰중앙여백은 미충족 |
| 최초 source | actual whole loader/helper/render+공통runtime / 9그룹119조건 PASS / 준비오류0 / 완료suite 재실행0 |
| source 한정geometry delta | ready draw×1.2만 실제wholehelper/GL/Canvas 28조건 PASS, 첫119 suite·PNG검사 재실행/합산0 |
| 최초 actualPNG | 외부후보+wholehelper / e.r22 통제:44·57.2px / 25조건 PASS / 24가시unique. 게시뒤candidate byteexact 확인만/동일검사재실행0 |
| 실제시각 finding1 | 새active band normalizedradius .323835..340420, oldmedian .378967..416707로 첫검토에서 작아짐. 새ready draw만×1.2로 회복 |
| 실제PNG한정delta | phase2·4만 새helper로 확인 / input44·57.2 → draw52.8·68.64 / 2조건PASS. 첫24phase suite 재실행/epoch합산0 |
| final 동작 proof | geometry 보정뒤 source57snapshot → encoded25장/966ms. actual main helper 독립Canvas 재생이며 인게임 녹화아님 |
| 제품보정 이력 | 최초source 실행뒤 실제visualfinding1을 위한 ready draw×1.2 두 문장만 보정. working/owned/HEAD 외부fullbytes 추가백업·inverseexact·foreign185보존 |

ROOT는 두 배경의 actualRGBA·44/57.2px 원본/첫후보·한정band-size delta를 직접 판독했다. 굵은 블록 링을 얇은 유기적 유동·소산으로 바꾸고, 작게 보인 band는 그리는 크기만 회복했다. caller·fallback·경고/타격/패링 수치·수명·RNG·save·SFX는 바꾸지 않았다. alpha0의 숨은녹색RGB는 실제backplate로 오인하지 않았다.

**VISUAL VERDICT: RETOUCH.** 초기·후기 작은 단계의 실제전투 가독성, 후기origin추정/반경수축, 마지막입자의큰중앙여백진입이 남는다. 실제normal main/정상줌/전체전투/GPU/동시효과성능/청취/실save/AAA 인수는0이다. 첫source119·sourcegeometry delta28·첫PNG25·PNG한정delta2·editor기본assertion1은 별도epoch이며 합산하지 않는다. 최종source/doc peer와 owned보존은 외부 engine-druid-dust24-20261010/completion.json을 따른다.
