# 드루이드 독탄 접촉24 — 공통 엔진 one-shot

`ROOT-ENGINE-DRUID-POISON-HIT24-20261009`. 기존 별 모양8셀 splash를 작은 독액 접촉·점성 방울 소산의 새24원화로 교체한다. 일반 무지개탄·블루콩·독립ORB·장판과 구분한다. 현재 실제 main 코드 연결과 통제 원PNG Canvas 검토이며 정상 보스전 인수는 미완료다.

| 항목 | 현재 계약 |
|---|---|
| 생성·소비 | 기존 적대 Druid blackBean 비패링 플레이어 접촉 `p._druidPoison&&!p.friendly`의 `_addBoom(...,120,72,'druid_poison_hit')`; shared boom case→`_drawDruidPoisonImpact` |
| 리소스 | `assets/vfx/boss/druid_poison_hit_24_20261009.clip.json`, format exoduser-atlas-clip/version1/name druid_poison_hit; columns6/rows4/frameCount24/fps60/loopfalse |
| packing 보조 필드 | 최종JSON의 frameWidth/frameHeight640·pivot(.5,.5)는 보존한 제작 메타데이터이며 현재runtime 미소비. 실제editor makeResource/resourceJSON 정규화·재출력은 이3개 보조필드를 무시·탈락하고 공통 기본필드는 보존 |
| 실제 원PNG | `assets/vfx/boss/druid_poison_hit_24_20261009.png`, 3840×2560, cell 640², 6614708B / SHA256 `d77c116273d2b792ac7fd5dafa08214c0fa8ecab87c6e207a2e62234f1526f07` |
| 생성 | Higgsfield gpt_image_2_5/sunburst/max/4k/transparent/3:2/count1; jobb5d023e3-db3d-422b-9eac-b40b0ec3e659 completed, estimate15 credits/실debit조회0. 원본3504×2336 RGBA를 동일sourcecrop/scale1 packing; 새job1/추가job0 |
| 경로·캐시 | 공통 `atlas-clip-runtime.mjs?v=20261009-v1`, JSON 및image `?v=20261009-v1`. fetch/Image 실패 폴백, 추가RAF/timer/RNG 없음 |
| 준비 검증 | format/version/name/sourcePath/24/fps60/loopfalse 검사; 실제 image의 grid분할/cell>2 검증·`getAtlasFrameRect(...,1)`24개 등록 후 ready |
| 게임 시간 | age=max(0,b.t), `sampleAtlasClip(clip,age/60)`. 첫24틱=.4게임초, frame=floor(age)에서 0..23; update t+=sp/slow·pause 계약 불변. 실제벽시간 .4초 보장은 아님 |
| 첫 프레임 경계 | producer 뒤 같은 update에서 age1이 될 수 있다. 24원화·통제age0 셀 검수는 실제 정상 첫 셀0 표시를 보장하지 않음 |
| splash 종료 | burst=max(0,1-age/24); burst>0일 때만 새셀1회. loopfalse의 마지막hold를24틱 뒤까지 표시하지 않음 |
| 크기·alpha | grow=1-(1-min(1,age/10))³; size=r×(.72+.32×grow), r120 폭86.4→124.8. squarecrop 높이=size. alpha=.9×burst², lighter/filter none 유지 |
| 폴백 | new 미준비·실패 시 기존 Poison_MediumImpact 첫8셀·4×4/512². frame=min(7,age/24×7), lo=floor(frame), mix=frame-lo, lo/lo+1 가중1-mix/mix·셀7clamp·최대2draw·inset1. 두image실패는 splash만생략 |
| 잔향 | r120/mt72/pool12; p=min(1,age/mt), fade=(1-p)². 작은핵 fade×.16, 최대6파편 fade×.48, 첫5틱섬광, 원래arms12·RNG48회/전투/피해/중독/Q전용blackBean/E불가/SFX/save 보존 |
| 상태 | 입력b/t/mt/r/x/y finite 및 mt/r>0, p>=1출력0. save/try/finally/restore; 렌더 입력 변경·난수·wallclock0 |
| 기존 자산 | 원Poison_MediumImpact 및 다른보스/탄/외형/원PNG/scene/nav/LOCK 불변. 기존8셀59조건/native 결과는 이전 unit 이력 |

| 새 검수 epoch | 실제 결과 / 한계 |
|---|---|
| 최초 source | Node1: 실제whole inline7 구문 및 첫5조건PASS 후 separately allocated gradient function identity oracleFAIL1; 뒤 그룹 미도달. 제품변경0, 실패이력 보존 |
| 미도달 delta | fixture의 semantic gradient 기록만보정, 이전통과검사 재실행0. 별도Node1/5그룹98조건PASS/FAIL0; 실제whole loader/helper·공통runtime·image/fetch/Canvas 통제 |
| source peer | engine_runtime blocking0. 실제 main/native/GPU 검수가 아님 |
| 최초 실PNG | 별도 Node1/조건55PASS/FAIL0; 실제whole helper·old/newPNG·r120/mt72/arms12 detachedCanvas,24 distinct raster phases·24틱이후 잔향pixel exact·72종료 |
| 실제 editor 한정 delta | 별도Node1/assertion1PASS, name/6×4/24/fps60/loopfalse/sourcePath 기본값 정규화·재출력 일치. 보조frameWidth/frameHeight/pivot는 미소비·재출력탈락; 기존65suite 재실행0 |
| 보존 | working/HEAD 선 fullbytes백업, 같은own2replacement·inverseexact·game foreign185B. 관련productionMD 검색1회/13path31line 및 unchangedsound3 구분 |
| 미인수 | 실제main 정상줌·전체보스전·GPU·성능·청취·실save·Godot 실행·A급. 프로그램/통제그림을 실제 인게임 녹화로 표시하지 않음 |

**VISUAL VERDICT: RETOUCH.** 통제 이미지에서 원화의 별 모양과 긴 가시는 줄고 접촉핵·유기적 독액으로 정리됐다. 짧은24틱 창의 실제 게임 가독성, alpha소산과 전체 탄막/음향 조화는 정상보스전 검수가 남는다. proof재생은 실제helper의 독립 Canvas이며 인게임녹화가 아니다.

최종 정본은 외부 `engine-druid-poison-hit24-20261009/completion.json`. 에셋후보/코드연결·검수·정상commit/push/remoteexact를 구분한다.
