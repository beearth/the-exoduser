# 화마귀 비행 용암구24 — 2026-10-10

`ROOT-ENGINE-FIREDEVIL-ORB24-20261010`. 화마귀 실제 `fdEnergy` 비행 표시를 새24 원화로 연결한다. 원16 이미지와 Druid의 원16 파생 재료·전투·Q 반사는 유지한다.

| 항목 | 현재 실제 계약 |
|---|---|
| 적용 | `_fdDrawFly`의 원 `_fdFlyImg.complete/naturalWidth` guard 뒤 성공 render호출마다 `_sprFr+=.22`를 단1회 유지하고 새ready helper 우선. 원이미지미준비는 false/counter증가0·기존 EL.F 원소구 fallback |
| 시간 | 기존16주기 phase=`_sprFr/16`, 새24 sample에 `phase×clip.durationSeconds`. 게임 age·update·새wallclock0. 원 guard통과 호출16÷.22≈72.7273회마다 반복. 60render/s 가정 ref 약1.212121s/19.8장/s이며 실제 stable게임초·24FPS·화면FPS 보장0 |
| 리소스 | name=firedevil_orb/columns6/rows4/frameCount24/fps19.8/looptrue, flat9 exoduser-atlas-clip version1. 640²셀/3840×2560. 제품 assets/vfx/fieldboss/firedevil_orb_24_20261010.png 및 data/vfx/firedevil_orb24_20261010.json |
| 새loader | `_firedevilOrb24` 공유상태, `_loadFiredevilOrb24` lazy promise1/Image1/immutable inset1 rect24. 등록시 fetch/Image0. `_fdFireEnergy` shoot guard통과 뒤 prefetch, 기존탄 첫draw에서도 ensure. 실패 자동retry0 |
| 새ready | `_drawFiredevilOrb24`가 기존counter phase의 한셀만240²/중심(.5,.5)·방향회전0·Canvaslighter·상속alpha·save/finallyrestore. 원transform+월드(p.x,p.y) 사용 |
| fallback | 새pending/invalid/drawerror는 원4×4/16 전체313.5² fractionalcell·240²·lighter. 원Image/시계 불변이며 새image와 원image를 중복겹치지 않음 |
| 공유 제외 | `_fdFlyImg`를 Druid `_druidPoisonFly` grayscale/multiply/alpha 베이크 및 seeker reference에서 계속 사용. Kraken fbEnergy16·Q반사5혜성·기타원소구·충돌폭발을 새24로 변경하지 않음 |
| 생성/이동 | 원4화마귀·충전180 끝1발·원속도6×1.8=10.8·r18→23.4/sz48→96·damagefloor(atk×2.8)×2·magic/SFX/shake 유지. 자체동시상한 추가0 |
| 수명 | life/ml320 초기값/update sp×.667 감소. 원life<=0·화면근처 life=1 연장 유지. 고정320 종료 아님; wall/player/Q/카메라2500+adaptivesoftcleanup으로 종료. renderhelper pauseguard 추가0 |
| 판정/반사 | 플레이어 상대스윕 P.r+96·벽중심+원주8점/Q P.r+sz+90 보존. Q만 원탄회수→동일속성 `_parryMagicShot`5발·자원회수×10. E비Q반사 제외·blackBean 보호불변 |
| 접촉/저장 | 원slide100/폭발r220/입자42·shake32·iframe/charge·RNG순서·save schema/원PNG 보존. 새표시240²는피해범위표시가아님 |

| 제작·검수 | 기록과 한계 |
|---|---|
| 제작 | Higgsfield gpt_image_2_5/sunburst/max/4k/transparent/3:2/reference1/count1 단1job cbbe44ee-3806-49cb-9baf-75538147b3f2. 견적15credit/잔액·실debit조회0/추가job0 |
| 참조 | 원1254²/4×4/16 정상HTTPS fullbytesexact/SHA80fa5f5edc876f9d3cb2228ebc800b2479480f3b90ae4d86ef6e5e8d653d1e10. 원RGBA 그대로보존 |
| 제품PNG | 11348701B/SHA b755bf10635eb94bd457e393d3e8966f7b37b3d4e731fac2c8c448456dd09b17 |
| 제품JSON | 231B/SHA 95f5d1e027928db28edbf56f620db785770eda8553dd3129c7331afac6025549 |
| packing | 공통relativecrop[-260,-266,246,252]/506×518/scale1/resample0/source-owncell intersection/padding. circle-fit 정수center→320,320; 몸체α>4/16손실0·이웃0·각edgeα0·24가시unique. 수기xmin누락1을firstmetric자동bbox로정정한뒤첫제품생성/원화mask·색·α변경0. 회전축·개별4.36%크기차 미인수 |
| source | 실제whole loader/helper/_fdFireEnergy/_fdDrawFly 최초epoch1/6그룹60조건PASS, fixture중복변수 SyntaxError 준비1·제품실행FAIL0/통과재실행0·최초실행후 editor assets-root 실제finding으로 경로정정1. render35/fire5/context36. 옛완료suite와합산0 별도pathdelta epoch2/16조건PASS/준비·실행FAIL0, actualloader 새assets URI1·원img URI거절·promise/Image1/no-retry. 원source60·PNG29/actualhelper/샘플링 재실행0; helperbyteexact/PNG byteexact OWN rename. |
| actualPNG | 별도최초epoch1/실제whole helper+fdDrawFly detachedCanvas 4그룹29조건PASS/FAIL0. 제품PNG 단1decode/cacheImage1/100helper호출, 24actualraster별개·독립literalgrid pixeloracleexact/73연속통제render에서counter+.22/loop24노출. alpha0/.35/.85/1·부모변환·finally복원/한셀상속alpha를독립backend getter로대조, witness를assert전보존. 원PNGextra decode0/source조건과합산0 에디터경로정정 뒤에도 helper·PNG·시계·geometry byteexact이며 새asset로rename만 했으므로 재decode/raster0. |
| 시각 | ROOT actualhelper240px의24strip과seam21..23→0..2 직접판독. 원형흑적지각/밝은중앙핵·표면열리본의실변화가읽힘. 반경4.36%변동/추정circle축·마지막→처음광원/열리본변화는RETOUCH·seamless인수0. black/gray는transparent helper출력을source-over진단합성한독립proof이며본편lighter배경조화미인수. APNG24/19.8참고는인게임녹화·실시간프레임페이싱인수아님 |
| 에디터 | 최초 actual makeResource→resourceJSON 기본assertion1 FAIL(assets/경로 정책), OWN PNG rename/JSON·strictloaderliteral·현재docs2만교정 후 별도delta1 PASS. sharedvalidator0변경/재생·PNG·원source통과suite 재실행0 |
| 메모리 | 새RGBA8의 단순decoded배열 37.5MiB, 원1254² 약6MiB. 실제CPU/GPU복사·scratch·peak·동시성능 미측정/렉없음주장0 |
| 인수 | actualnormalmain/정상줌/전체보스전/GPU·동시성능/청취/실save/AAA 미인수. 독립helper proof는인게임녹화아님 |

**VISUAL VERDICT: RETOUCH.** 장수와 실제 형상 흐름을 늘린 한 효과의 source 연결이며 전체캐릭터·효과/Godot이식·새3D 완료로 세지 않는다.
