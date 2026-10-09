# Druid 뿌리 충격링24 — 2026-10-10

원본은 중앙이 열린 황록색 뿌리·뿔 모양의 세워진 분출 링이다. 광역 충격파의 전투 반경 자체가 아니라 기존 공통 `druid_shockring`의 표시 에셋을 새24장으로 연결한다. 원본512²×8열8장, 새resource6열4행24장/fps180/7/loopfalse. 기존 normalized phase를 따라 caller별 수명과 크기를 보존한다.

| 항목 | 현행 계약 |
|---|---|
| 원등록 | assets/vfx/druid_shockring.png / 4096×512 / 512² / 8열1행 / maxFrames8 |
| 신규 sourcePath | assets/vfx/boss/druid_shockring_24_20261010.png |
| 리소스 | exoduser-atlas-clip/version1/name=druid_shockring/6열4행/frameCount24/fps180/7/loopfalse |
| resource durationSeconds | 14/15 표현값; 실제 모든 caller가 같은 시간이라는 뜻 아님 |
| phase | (frame+fraction)/maxFrames를 clip.durationSeconds에 매핑. fraction=bornGameTime!==undefined ? _vfMix : t/frameTime |
| 표시간격 | 원 maxFrames8 및 caller별 frameTime5/6/7 → 40/48/56 명목render진행. 안정game초/화면FPS/24FPS 아님 |
| draw | 기존512*scale 크기·worldcenter·angle·alpha 유지. 한효과한셀; GLadditive 성공Canvas0/실패Canvaslighter1/try-finally restore |
| budget·종료 | 기존 종료/cull/budget5 뒤 신규selector, 성공 시 _vw 압축·continue |
| ready | 실제image용량 검증·24immutable inset1 rect 생성 뒤 준비 |
| fallback | import/http/schema/image/grid 실패 또는pending은 원8셀/기존timed path |
| cache | PNG/JSON?v=20261010-v1, 공통runtime?v=20261009-v1 |
| 보존 | 모든producer·상태전환·충격파 반경/확장속도·피해·패링·RNG·SFX·save·원PNG·기존완료helper |


## 실제 source 확인 caller4

| context | scale | frameTime | 표시 | 명목진행 |
|---|---|---|---|---|
| _reviveDruidFinale(e) / Finale revive helper | e.r*3/256 | 5 | 512*(e.r*3/256)=6*e.r | 40 |
| _finishDruidFinale(e) / Finale victory helper, _isDruidFinale/dead/reviveTimer guard | Math.max(.5,e.r*4/256) | 6 | 512*Math.max(.5,e.r*4/256)=Math.max(256,8*e.r) | 48 |
| _bossPhaseCheck(e,sp) / Finale act transition: _isDruidFinale(e), act!==oldAct | e.r*3/256 | 5 | 512*(e.r*3/256)=6*e.r | 40 |
| updateE(e,sp) / case'bossShockWind': e.st2<=0, G.stage===0 /  / G.stage===3 | e.r*2.5/256 | 7 | 512*(e.r*2.5/256)=5*e.r | 56 |

네 caller는 기존 guard·factory·scale·frameTime·angle0/isSkillfalse를 보존한다. Finale helper의 실제 접근조건과 DEMO/LAST_STAGE/stage3 조건은 그대로이며 이 경로의 화면 인수를 주장하지 않는다. resource fps180/7를 모든caller의56진행으로 혼동하지 않는다.

최초 actualwhole loader/helper/render+공통runtime: 9그룹134조건 PASS, sourceactionable/blocking0/검수기준비오류0. ROOT의 case 문법 추출가정2건은 실행전 준비실패이며 제품수정·검수기134조건과 합산하지 않는다. 실제PNG·editor 기본 roundtrip은 별도 최초epoch로 기록한다. 도구/CPU/독립Canvas를 actualnormalmain/정상줌/전체보스전/GPU/동시효과성능/청취/실save/AAA 인수로 대신하지 않는다. 실제24장의 노출은 기존 caller 수명·renderer진행에 따라 달라지며 새clock/RAFtimer를 만들지 않는다.

## 최초 원화·검수 영수증

| 항목 | 실제 결과 |
|---|---|
| 생성 | Higgsfield gpt_image_2_5/sunburst/max/4k/transparent/3:2 단1job086aeed0-c2b8-4261-a0ae-04378498bc9e / 견적15credits / 추가job·잔액·실debit조회0 |
| reference | Original HTTPS bytes exact / 727750B / d022dfc8a0ee665ebc68f10d5d3ea4e28f96044804d7d6718511803926a8a467 |
| actual source | 3504×2336/584² nominal 셀 / 8921561B / abd9bdd2987e2825095780925eca0da1e21f9d6cf5abff39855a2f40fbeae575 |
| 제품 PNG | 4608×3072/768²셀 / 7920159B / c7e3e8811b2175b3d2db245ee11c7d3ba32f927b5a8554fac6212a53efa9d4df |
| 제품 JSON | 333B / 55392dcf5247f83ffeffd7048cd9d3d611ade1787c83238477c604ae52361f8a |
| packing | 공통crop[-283,-446,285,5]·own-cell intersection/padding만 / scale1/resample0 / 원RGBA 보존 |
| 등록 | worldcenter[384,384]=[.5,.5], 원512 주요몸체 foot 중앙값314/512=.61328125 →471/768 같은비율 |
| 정렬 한계 | 첫22 몸체foot variation0, 후기2 anchor추정·끝Y457/440. 그림에서 추정한 접지이며 물리접지 검수아님 |
| 알파·셀 안전 | 몸체손실0·이웃0·edgealpha0·crop외부maxalpha3·actualRGBA/black/gray24unique / centerpixelalpha0..1 |
| 최초 source | Node1/actualwhole loader/helper/render+공통runtime / 9그룹134조건 PASS / sourceactionableblocking0 / 검수기준비오류0 |
| 최초 actualPNG | Node1/wholehelper 외부후보 actualPNG+originalPNG 독립Canvas / 25조건 PASS / 24visibleunique / bossShock fixture110px·승리 fixture256px |
| actual editor | 신규resource 기본 makeResource/resourceJSON roundtrip 한정assertion1 / 보조frameWidth/Height/pivot 재출력제외. 최종peer 영수증에서 실제결과확인 |
| 재생proof | 실제main helper 독립Canvas source57snapshots→encoded25장/966ms/81258B, 인게임녹화아님. 56개표시+종료1장 presentation반복·resource loopfalse 유지 |
| 제품source 후수정 | 최초제품source 실행뒤 code재수정0 / source·PNG·editor는별도epoch이며 합산·완료suite재실행0 |
| docs | mandatory keyword scan 단1회/8path10shortline/giant0; 새24primary+원8fallback와 네caller별계약·정본링크동기화 |

ROOT는 원PNG·새source/packed actualRGBA 검정/회색·실제wholehelper 110/256px old/new·24phase를 직접 판독했다. 상향 두갈래 뿌리 실루엣과 열린 중앙을 남기고 출현→확장→가지 분해/소산을 새24변화로 소비한다. source alpha0 숨은녹색RGB는 실제판으로 오인하지 않았으며 지우거나 재생성하지 않았다. 인접 caller의 충격파 반경·확장·피해와 시각resource 크기를 혼동하지 않는다.

**VISUAL VERDICT: RETOUCH.** 1-based18→19/20→21의 후기파편변화, 작은 초기/후기 표시의 전투가독성, 후기anchor 추정이 남는다. 중심pixel의alpha1/저알파원noise가 남아 엄격한 zeroalpha중앙을 인증하지 않는다. actualnormalmain/정상줌/전체보스전/GPU/동시효과성능/청취/실save/AAA 인수0이며 렉없음·전체효과교체 완료를 주장하지 않는다. 기존감사 slam 행의 경로는 역사이고, 이번 실제source 확인은 위 네caller로 한정한다. 이전전투·검수이력 수치와 완료effects는 재검사하지 않는다. 최종 source/doc peer·ownedbyte보존은 외부 engine-druid-shockring24-20261010/completion.json을 따른다.
