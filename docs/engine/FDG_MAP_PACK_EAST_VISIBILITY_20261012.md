# FDG 맵팩 동측 actor 가림 — 2026-10-12

`game.html`의 기존 exact r4 + `fdgPerspective=first` + `fdgScene=ruined-forest-first` + `fdgMapPack=first`에서만 적용하는 표시 수정이다. 구울의 early `continue`가 body/HP를 deferred billboard 밖에 남기던 caller를 연결하고, 가까운 upright 구조물의 actor 주변만 부분 투명하게 소비한다. PoE2 study의 지면 접점·actor/ground 공간 분리를 학습 기준으로 사용한다. 새 모델·원화·24장/24FPS·전체 엔진 출시 인수는 별도 미완료다.

## 진입과 보존 범위

| id / 항목 | 값·적용 위치·현행 계약 |
|---|---|
| native gate | 앞 문장의 exact 저장격리 조건이 모두 참인 `_FDG_NATIVE_MAP_PACK_FIRST`. 새 `fdgRendererQa` 문자열은 관측 URL 라벨이며 소비 gate가 아님 |
| baseline 진입 | `http://127.0.0.1:3333/game.html?test=1&testchar=1&bosstest=0&fdgDruidQa=r4&fdgPerspective=first&fdgScene=ruined-forest-first&fdgMapPack=first` |
| 실제 저작 진입 | 외부 증거 `new-entry-url.txt`의 동일 query + `#fdg-pack=…`. 이전 저작 데이터 5,768 UTF-8 bytes 그대로 소비 |
| 저작 prop | `prop-035 / m_c1sbone`: X44/Y53 → native1760/2120, scale.85/noCol1/uprightfalse. source·다른37개·dependencies23 유지 |
| geometry | 72×84/T40/RLE/nav/collision/START35,68/EXIT41,16/초기 적4개 모두 이전 pack과 동일. 이번 출구 재실행0 |
| camera | perspective/yaw0/pitch.92/distance2600/zoom.82/near32, 실제1280×720/SSAA logical scale1 관측 |
| 기본 게임 | 옵션 기본false·기존 scene without mapPack·기본 main·저장/API·물리·AI·damage·HP·공격 시간·Q/E/blackBean·어택 티켓 변경0 |
| source 자원 | 기존 PNG/텍스처/UV/장비만 소비. 신규 이미지·모델·PixelLab·held Druid/Vinebound/Meshy/BOSS 자원 생성·연결0 |

## caller 및 renderer 계약

| API / 소비 지점 | 정확한 결과 |
|---|---|
| controller 옵션 | `installNativePerspectiveQa({actorOcclusionCutaway:false})` 기본. native loader는 맵팩 gate에서만 true를 전달하고 begin에 전달 |
| adapter begin | `begin(raw,{…,deferBillboards:false,actorOcclusionCutaway:false})`. cutaway는 두 옵션이 정확히 true일 때만 활성 |
| `pushBillboard(x,y,{kind}={})` | `kind:'actor'` 또는 `'occluder'`; 미지정은 기존 depth queue. 월드 anchor·depth 및 stable sequence 유지 |
| 구울 `_isGhoul` | 기존 그림자는 ground. ready/fallback body·HP·shield·stunbar를 같은 e.x/y actor batch로 감싸고 `try/finally` pop 후 기존 continue. 표시 방향만 screenFacing 소비; 기존 fallback facing 갱신 외 새 world 쓰기0 |
| P / 일반 actor | 원래 body batch에 kindactor metadata만 추가. P/e 위치·pose·장비·physics·AI timer 유지 |
| upright prop | 원래 sprite batch에 kindoccluder metadata. ground patch·원source·배율·alpha·noCol·upright 값 유지 |
| 기존 windup | `_atkWindup>0`의 기존 빨간 `❗`, alpha.9/font bold16px NotoSansKR/center, e.x/e.y−e.r−8. 맵팩에서 actor와 같은 anchor batch로 소비. 새 windup/시간 생성0 |
| actor 보호 영역 | 같은 world anchor의 projected image/shape/text 제출 bbox를 합치고 투영된 발점을 포함. 원 unpadded bbox를 bodyBounds로 별도 보존 |
| 타원 | 중심=bbox 중심, 각 반경=bbox halfsize×√2. 16개 convex 정점, 각도 2π×index/16. bbox 네 모서리를 보호하며 source alpha silhouette 마스크는 아님 |
| feather 수치 | 축 padding2/4/6/8 logical px, alpha cap.2/.4/.6/.8. 핵심 영역 cap.2, 바깥은 제출 원alpha. padding은 두 축 증가이며 analytic constant-normal-distance offset이 아님 |
| 실제 대상 | actor보다 depth가 큰 가까운 kindoccluder의 texture triangle 중 바깥 타원 AABB와 겹치는 영역만. farther/untagged/non-texture는 원래 paint 유지 |
| 중첩 / 반투명 | 여러 actor의 cap 중 최솟값. 제출 원alpha를 올리지 않으며 겹친 영역 면적을 중복 집계하지 않음 |
| UV / W | 화면 교차점은 (u/w,v/w,1/w)를 보간해 UV/W 복원. W없는 Canvas는 기존 affine 보간. 원source객체·GCO·filter·style 유지; alpha만 해당 fragment에 cap |
| pure helper | `partitionProjectedTextureTriangle(vertices,rectangle)` 기존 rectangle 계약 유지. `partitionProjectedTextureContour(vertices,convexContour)`는 `{outside:[triangle],inside:[triangle]}` 새 사본 반환 |
| 분할 비용 | actor band contour를 flush마다1회 생성. 바깥8→6→4→2px 순서로 convex polygon을 유지하고 band/다음actor가 끝난 실제 replay 직전에만 triangle fan 분해. 같은CPU fixture opaque1966→360 triangles, sourcealpha.5에서378→180; 실제FPS 개선비율로 환산하지 않음 |
| 스타일 비용 | `applyStyles`는 현재 raw getter와 다른 값만 setter에 전달. lineDash는 현재 배열 길이/원소를 비교. injected sink가 상태를 바꾸면 다음 fragment에서 다시 복원하며 throw/flush finally의 원상복원도 유지. transform 초기화·replay순서·API·geometry 변경0. 같은 fake raw10style 조건의364fragment에서 이전무조건호출식3670회→실측72setter, 동일dash setter0; nativeGPU시간비율 아님 |
| 작은 triangle | 면적≤1e−8 logical px² 제외. 원caller·style 복원과 queue command count는 그대로 |
| cache query | main→controller→adapter import의 `v=map-pack-east-visibility-cost-final-20261012`는 이 단위 재로드용 source query이며 별도 gameplay gate 아님 |

## snapshot 및 검사 이력

| 필드 / 기록 | 의미 |
|---|---|
| 기존 queue metrics | deferred/flushed/pending BillboardBatches/Commands는 원래 command를 집계. 추가 triangle fragment와 구분 |
| actor 필드 | `actorOcclusionCutaway`, `actorCutawayMargin:8`, `actorCutawayAlpha:.2`, `actorCutawaySegments:16`, `actorCutawayBands` 4개. `actorOcclusionBounds`는 outer AABB·world anchor/depth·bodyBounds·ellipse의 clone |
| cutaway metrics | ActorBounds/affected OccluderBatches/SourceTriangles/ReducedTriangles/ExtraTriangles. ReducedArea는 alpha가 실제 감소한 union logical px² |
| feather metrics | `cutawayFeatherTriangles/Area`: 감소 fragment 중 alpha>.2인 feather 부분, core와 구분 |
| 최종 style revision | 새 `style-replay-cost:`2 첫PASS/0FAIL, sink상태변경·throw복원·setter횟수·dash·transform/reset/savebalance 검증. module26f28c068f8a4c2614e5588422c95fd94eb6b2c0aa5bf99f5f8fa9b63428cc21/test02c414787c53667c291bbe183f696e0ec3133b7b98eab4b8ac898a102d1a1eb6 동결. 이전prefix 재실행0 |
| 첫 caller revision | 새 renderer oracle3 첫PASS + actual GHcaller integration2 첫PASS. 가까운 구조물이 여전히 가리는 실제 화면을 보고 후속 partial cutaway 구현 |
| rectangle revision | 새 cutaway4 첫PASS + integration gate/caller2 첫PASS. 원본 화면 검수 RETOUCH: 딱딱한 사각 경계. 최종 시각 근거로 사용하지 않음 |
| convex fragmentation revision | 새fragmentation2 첫PASS/0FAIL, alpha별면적·225sample points/alpha·sourcecoverage·UVW·style/SSAA·rawsavebalance 동등성 검증. oldrect assertion2개는 ellipse/bodyBounds/전체reduced metrics에 맞게 유지보수하되 재실행0, 최초PASS는oldrevision이력 |
| ellipse feather revision | 새 feather3 첫PASS/0FAIL. 이전3/4·integration4·old18/40/55/main9 검사 재실행0. source별 test ledger를 합산해 최신 전체suite PASS라고 주장하지 않음 |
| 기록 루프 실패 | 별도 CDP 및 이전 primitive closure 수집0frame 이력 보존. 같은 cell의 공유 control 객체를 사용하는 원본 PNG sampler로 수리; frame 생성·보간·padding0 |

## 실제 시각·성능 근거

증거 폴더 E: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/engine-map-pack-east-visibility/`.

| 원본 / 관측 | 결과와 한계 |
|---|---|
| ellipse 새 재생 | `feather-png/` 원본34PNG / 10,610ms, metadata의 actor sample12개. sampling cadence≈3FPS는 native 게임FPS·애니메이션FPS가 아님 |
| 자연부활 구울 | `0013.png`: etype100/isGhoultrue/x1826.0793299703187/y1977.798583636769/HP1750. P1854.6805528845555/1943.4373947355577. body/foot·같은 deferred projection 소비 |
| 근접 중첩 | `0016.png`: P와 GH 거의 같은 위치, 원거리 charge36. body 가림 실패 없음; 두 actor 실루엣 분리 및 구형 번개VFX는 한계 |
| 기존 충전 표시 | `0031.png`: GH charge43 / caster20. 기존 native charge 표시를 실제 위치 부근에서 관측. observer로 charge/패턴/탄 생성0 |
| 국소 시각 판정 | 위 새3화면 **VISUAL PASS**, 둥근 투명 경계와 몸/발 가시성 범위. 정확한 projectile birth 순간·전체route·모델·24장/24FPS·전체VFX PASS는 아님 |
| 성능 수리 근거 | 중첩 sample에서 ExtraTriangles604·ReducedTriangles504·FeatherTriangles325 및 조회 FPS44/39/33 관측. screenshot/여러 background native tabs가 포함되며 CPU/GPU 원인을 단정하지 않음. fragmentation 축소는 동일 contour/alpha 계약 유지의 좁은 후속 수정 |
| fragmentation 최종 실제 재생 | module78fbc258… 재로드. optimized-png66PNG/11409ms/22samples, optimized-ranged-png65PNG/12145ms/22samples, optimized-tail-png31PNG/8291ms/11samples. 별도시간구간이며 연속route 영상이 아님 |
| 최종 일반/P 시각 | optimized0058 및ranged0028/0034의 새3화면 국소PASS: P몸발·둥근경계·charge16/56·movingmagic탄. 정확birth 순간 미관측 |
| 최종 자연GH 시각 | 공개 NORMAL 새재시작의 optimized-ghoul-png30PNG/9675ms/15samples 중GH8samples. 0019/0025추가 국소PASS: GH몸하단·P몸발·stagger부근에도 구조물가림 없음. 0019구형번개VFX 중첩으로 세부실루엣제한 |
| 최종 GH 위치 | 0025 GHetype100/isGhoultrue/x1881.9964409037639/y2239.6498736499284/HP1099, P1930.2338700584894/2239.111452877601. 마지막HP510.3031250000003/530·damage4918/damageTaken20.10000000000079/alive2/completedfalse/deadfalse. observer부활·AI패턴·좌표쓰기0 |
| 최종 성능 한계 | 첫최적화source 새GH samples nativeFPS14..32/prof.d30.543065296218195..63.93999765569589ms,0025 HUD15FPS. ExtraTriangles114..318. screenshot/조회·배경tabs 영향 포함; 성능PASS/지속60FPS/원인단정0. 동일style setter 생략 전 source의실측 이력. 최종수리 후실측은아래 별도행으로기록하며 개선율계산0 |
| 마지막 source 재생 | cost-final-png31원본PNG/8348ms/actor샘플16/GH샘플10, public시작→WASD→실제attack/Q→pause. module26f28c… finalsource, sampling시간이nativeFPS는아님 |
| 마지막 source 국소 시각 | 새0023/0027추가 **VISUAL PASS**: P/GH몸발·같은anchor charge38/24·roundedfeather, 외곽mass절단없음. 새0027GH1896.170269187116/2236.192220754806/HP1210, P1925.582847858553/2240.113493918051. 서로붙은실루엣과기존VFX세부품질은범위밖 |
| 마지막 source 성능 | 전체16samples snapshotFPS105..120/prof.d1.938871593913015..7.790187557597315ms/ExtraTriangles126..318. 0023/0027HUD118/120FPS. 이전GH source의14..32FPS와동일frame/gear/run 비교가아니므로향상률·보장60FPS·GPU완료시간·타backend PASS 주장0 |
| 마지막 source gameplay/save | HP581→531.1218749999999, alive3/completedfalse/deadfalse/damage3684/damageTaken50.200000000000685/potions0/parries0/deaths0. writes[]/successfulWrites0/ownQAkey read. natural GH 및 원래 형태 부활도 실제 native rules이며 강제부활0. exit재실행0 |
| 저장 / 실제 전투 | ellipse 재생 끝 native HP363.67500000001087/512, alive2/completedfalse/deadfalse, damage4792/damageTaken351.29999999999995/potions2/deaths0. final storage writes[]/successfulWrites0. 무적·승리·P/time·독립탄/적 삭제0 |

## MAP PRODUCTION REPORT · §23

| 항목 | 현재 단위 보고 |
|---|---|
| STAGE | `MAP_PACK_EAST_VISIBILITY` |
| MASTER | silhouette/regions/mainroute/sidespaces: 기존 pack 유지, 입구6시→교전장→출구12시. 이번은 동측 actor 가림 표시만 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH/majorholes: source·좌표·겹침 유지. actor 주변만 부분 투명, outershape 전체 alpha 감소0 |
| LARGE | sourceassets/composites/overlap/repeatedsilhouette: 기존 자원 보존·새 art0. 대형환경 재저작0 |
| MEDIUM | connections/remainingholes: 기존 연결 보존, 새 구조·geometry0 |
| GROUND | shadow/contamination/structureintegration: 기존 shadow 지면 투영. GH body/HP와 ground를 같은 role로 섞지 않음 |
| PLAYABLE | arenas/travel/breathing/threat: 기존 NORMAL/Lv1/AI. 동측 실제 actor·자연부활 GH·충전·탄·근접 입력 관측, 전체route 재검수0 |
| LANDMARK | primary/secondary/tertiary: 기존 배치 유지, 새 랜드마크 인수0 |
| CAMERA QA | START 준비 및 새 동측 EARLY/ARENA/SIDE RIGHT 실제 play. SIDE LEFT/LANDMARK/LATE/EXIT 이번 재실행0, 이전 동결 proof 재포장0 |
| TECH QA | route/collision 이전 RLE/nav/source exact보존, 새 collider0. 새 로딩·deferred context balance·필요한prefix 검사. 전체pageerror/404/seam sweep0; 지속60FPS/GPU 완료시간 인수0 |
| FILES | owned code3/tests2/docs8. concurrent tracked WIP25 보존, unrelated 수정0 |
| GIT | 코드+docs 정상 로컬 checkpoint, push/deploy0·기본게임 이관0 |
| VISUAL VERDICT | 현재기록 source의 동측가림 **PASS** / 전체씬 **RETOUCH**. 최종source GH/P2와앞선각revision의새관측범위를구분해기록, 지속성능·전체모델·정확birth/route인수0 |
| NEXT | 승인 모델·실제24장/24FPS·기존VFX·튜토리얼 초상·전체renderer/backend/성능 인수 별도 미완료 |

## 동기화 / 백업

작업 전 working+HEAD 외부 backup 및 foreign tracked25 hash는 E/baseline.json·backup/에 보존했다. rectangle→feather→fragmentation 수정 전 worker backup도 별도 보존한다. docs 전체 `rg`와 literal `grep -r` 검색은 `docs-rg-east-visibility.txt`, `docs-grep-east-visibility.txt`, `docs-rg-feather.txt`, `docs-grep-feather.txt`에 기록한다. 최종검색 docs-rg-final.txt/docs-grep-final.txt는 style/feather/구울/caller 키워드의전체검색을포함한다. 기존 맵팩18·원근40·공통55·main9 증거/검사/Git는 동결하며 이번 결과로 재사용하지 않는다. 보호된 2_3 문서 수정0.
