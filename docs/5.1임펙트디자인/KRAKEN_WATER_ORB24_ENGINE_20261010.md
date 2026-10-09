# 크라켄 비행 물구체24 — 2026-10-10

`ROOT-ENGINE-KRAKEN-WATER-ORB24-20261010`. 실제 `fbEnergy` 비행을 새24 물구체로 연결한다. 원본16 폴백·물 속성·Q 회수·접촉·수명·전투·save는 유지한다.

| 항목 | 현재 실제 계약 |
|---|---|
| 적용 | `_fbDrawFly`의 원 `_fbFlyImg.complete/naturalWidth` guard 뒤 `_drawKrakenWaterOrbClip` 새ready 우선. 원이미지미준비는 기존false/하위 원소탄 경로 |
| counter 소유 | helper 증분0. 실제 pass2 공통루프의 가시탄 `_sprFr+=.12`·null일때만 `Math.random()*8` 초기화를 그대로 사용. 비가시 인덱스는 진행0 |
| phase | `(_sprFr||0)/16×clip.durationSeconds`를 공통 sampleAtlasClip으로24에매핑. 원16/.12≈133⅓ 가시render호출 주기. 60호출/s 가정 resource10.8장/s·참고2.222222초; 안정game초·24FPS·실화면FPS 보장0 |
| 리소스 | flat9 exoduser-atlas-clip/version1/namekraken_water_orb/columns6/rows4/frameCount24/fps10.8/looptrue. 실제640²셀/3840×2560, assets/vfx/fieldboss/kraken_water_orb_24_20261010.png + data/vfx/kraken_water_orb24_20261010.json |
| loader | `_krakenWaterOrbClip` 공유상태/`_loadKrakenWaterOrbClip` lazy promise1/Image1·캐시inset1 rect24. 등록startup fetch/Image0. 발사guard통과 뒤prefetch·기존원이미지ready draw에서도ensure. 실패자동retry0 |
| validation | flat9 키/name/경로/grid24/fps10.8/loop 잠금, runtime3API. 실제newImage.complete 및 squarecell512 또는640만허용; 이번제품은640. JSON에cell/pivot부가기재0 |
| 새ready 표시 | 240²·월드p.x/p.y·중심(.5,.5)/방향회전0/Canvaslighter·**alpha1 명시**/save-finallyrestore. 부모alpha·transform은복원하며 helpercounter증가0 |
| fallback | 새pending/invalid/loadfailure/drawfailure는 원1254²/4×4/16 전체fractional313.5²셀. 원Image 준비guard·`((p._sprFr||0)|0)%16`·240²/alpha1/lighter 보존; 새와원중복겹침0 |
| 제외 | 화마귀fdEnergy·waterBean·titanEye·Q `_parryMagicShot`5발·접촉 `_fbEnergyBoom`을 새물비행24로 바꾸지 않음 |
| 생성 | CH1 stage0 기존4크라켄/충전180 끝개체당1발·에스카좌표·EL.I 물속성·raw속도10→18/r20→26/sz48→96/atk×2.8×공통배율·magic/shake16 유지. 자체동시상한추가0 |
| 수명/pause | life/ml320 초기값·update sp×.667감소·화면인근 life<=0이면1 재설정 유지. 고정320종료아님. updatepause는기존가드, 가시rendercounter는호출시진행/helperpause변경0 |
| 판정/반사 | 상대스윕 P.r+96·벽중심+원주8점·Q P.r+sz+90·Q원탄회수→동일물속성기본magic5발(r8/spd7.5/range900/총피해5등분/자원회수×10)·E금지 유지. 240²는새판정반경이아님 |
| 접촉/저장 | 원wall/player/peaceShield흡수 `_fbEnergyBoom`r220·물bigImpact·입자42/색플래시.32/흔들림32·slide100·iframe/charge·RNG·SFX·save·원PNG불변. 공격제한0 |

| 제작·검수 | 기록과 한계 |
|---|---|
| 제작 | Higgsfield gpt_image_2_5/sunburst/max/4k/transparent/3:2/reference1/count1 단1job c3629800-f8e6-4279-9f07-c4a82fc1ee73. 견적15credit/잔액·실debit조회0/추가job0 |
| 참조 | 원1254²/4×4/16 HTTPSfullbyteexact/3002810B/SHA6d8140e897b0c5fd479f9a570f03473e6221a7731039bb461bbb20f2520faea1. 원PNG보존 |
| 제품PNG | assets/vfx/fieldboss/kraken_water_orb_24_20261010.png/14733227B/SHA9bc15c964036f8b838b8b854a2f8ce58b5f51d682b637dda4f0b763c68ec1faf |
| 제품JSON | data/vfx/kraken_water_orb24_20261010.json/200B/SHA9eb2a394c1115a2f034852dff4f3a3025fa4a816748cc0312a41a5a1af59f0a8 |
| packing | raw3504×2336; common relative crop[-273,-280,273,272]/546×552; scale1/resample0/paddingonly; measured18 horizontal+5 vertical alpha>4 clear ownership separators; integercircle centers→320,320; ownalpha>4/16loss0/neighbor0/edgealpha0/24distinct. 색/alpha/mask수정0. 최초명목584경계742개고알파침범을 실제소유분리로해결, 후속exclusive경계준비assertion1은첫후보쓰기전정정 |
| source | 최초 actualwhole new loader/helper/producer + before/after whole pass2/sharedruntime Node1/epoch1/6그룹45조건PASS; 준비·실행FAIL0/제품실행후code수정0. 原clock/RNG/producer 보존. 새PNGdecode/hash0인 source scope와 별도PNG검수를분리 |
| actualPNG | 최초 publishedPNG actualwhole helper/pass2 독립Canvas Node1/epoch1/4그룹29조건PASS; productdecode1/sharedimage1/161helper(24phase+134controlled visiblepass2+3parenttransform),24realunique/literalgridpixeloracleexact. alpha1과backendgetter/parenttransform·contextrestore/cacheidentity·witnessassert전저장. 재decode·suite재실행0 |
| editor | 새flat9 실제makeResource/resourceJSON 기본왕복 최초assertion1PASS/보조frameWidth/Height/pivot 재출력인수0/PNG접근0. assets/정본경로를처음부터사용 |
| 시각 | ROOT 원rawactualRGBA·240px black/gray·실제wholehelper24strip·seam21/22/23→0/1/2 직접판독. 짙은bluecore/흰회전포말/기포와24변화가읽힘. 일부포말인접점프/반경약6.10%변동·추정회전축/첫끝자연연결·전체전투lighter조화 RETOUCH. wrapRMSE48.83/일반median50.61은seamless인수근거아님 |
| 메모리 | 신규RGBA8단순배열37.5MiB+원1254²약6MiB. 실제CPU/GPUcopy·scratch·peak·동시성능미측정/렉없음주장0 |
| 인수 | actualnormalmain/정상줌/전체보스전/GPU·동시성능/청취/실save/AAA미인수. actualhelper APNG24/10.8reference는독립proof/인게임녹화아님. source45·PNG29·editor1은별도epoch/합산0 |

**VISUAL VERDICT: RETOUCH.** 한 비행 consumer의 원화 장수와 물 흐름을 늘린 결과이며 전체효과·캐릭터24/Godot전체이식/새3D/AAA완료가 아니다.
