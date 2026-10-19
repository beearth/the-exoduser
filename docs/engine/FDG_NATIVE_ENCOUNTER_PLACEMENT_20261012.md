# FDG · 저작 몬스터 배치의 native 소비 · 2026-10-12

`EDITOR_ENCOUNTER_PLACEMENT_NATIVE_FIRST`는 기존 맵팩의 소품 저작을 **기존 4마리의 초기 위치 저작**까지 확장한다. 공개 편집→JSON 내보내기→기본 복원→재가져오기→플레이 시작 전 compile→실제 `mkEn` 생성→공개 NORMAL 이동/교전을 확인했다. v1의 초기 적 exact 계약은 유지하며, 명시적 v2 및 새 query에만 적용한다. **연결 기능 완료 / 국소 교전 배치 VISUAL PASS / 전체 모델·씬 RETOUCH**다. 새 최종 원본3장의 좌표 가독성·정상 생성 페이드 뒤 본체/발·국소 교전 모두 PASS다.

## 진입과 실제 저작 한 건

| 항목 | 현행 값·소비 |
|---|---|
| 편집기 | `http://127.0.0.1:3333/tools/fdg-studio/map-pack.html?v=encounter-placement-first-20261012` |
| 명시 저작 선택 | `#pack-kind` 값 `prop`/`enemy`. `몬스터 시작 위치` 선택 시 유효한 현재 pack을 v2로 독립 복사하며 소품 draft 보존. 처음 선택 `enemy-001` |
| UI | 기존 `#pack-object`/`#pack-x`/`#pack-y`/`#pack-placement`, 특정 leaf `#pack-selection-title`·`#pack-source`·`#pack-coordinate-help`·`#pack-status`만 갱신. 부모 textContent/innerHTML 교체 0 |
| 시작 위치 표시 | 몬스터 표식은 `(x+.5,y+.5)`, 소품 표식은 `(x,y)` 타일. 몬스터는 붉은 번호, 선택은 금색. 바닥 RLE·S/E·카메라·소품 geometry 변경 0 |
| 저작 입력 | 기존 소품 배치를 가진 v1 입력5768 UTF8B. prop035=44/53, 나머지37개 및 source/scale/noCol/upright/23 dependencies 유지 |
| 새 저작값 | `enemy-001 / rot_knight / etype0`: 타일31/55→34/62. 새 JSON v2 **5868 UTF8B**. 소품은 입력 v1과 exact 동일이며 다른 적3마리의 좌표/type/skin도 유지 |
| 공개 roundtrip | JSON export→기본 복원(v1/적31/55/기본prop03543/53, textarea export 유지)→JSON import→선택 적34/62. 재가져온 플레이 href가 내보낸 href와 exact 동일 |
| native query | 기존 `test=1&testchar=1&bosstest=0&fdgDruidQa=r4&fdgPerspective=first&fdgScene=ruined-forest-first&fdgMapPack=first` + v2에만 `fdgEncounter=placement-first` + `#fdg-pack=` compact JSON URI 인코딩 |
| gate | `_FDG_NATIVE_ENCOUNTER_PLACEMENT_FIRST = _FDG_NATIVE_MAP_PACK_FIRST && search.get('fdgEncounter')==='placement-first'`. 기존 exact r4 저장격리/원근/씬 gate도 필수 |
| pre-world 거부 | v2 fragment를 새 query 없이 실행하면 bundle 할당·P/월드 생성 전에 오류. invalid 입력도 동일. 조용한 baseline fallback 0. v1/기본 main/기존 static forest 분기는 유지 |

## v1 / v2 schema와 좌표 단위

| 필드·상수 | v1 | v2 |
|---|---|---|
| root `version` | 정확1, `createNativeMapPack` 기본 | 정확2, 명시 `createNativeEncounterMapPack`/몬스터 선택/가져오기 |
| enemy shape | `{x,y,etype,skin}` baseline exact | `{x,y,etype,skin,instanceId}`, X/Y만 편집 |
| enemy count/order | baseline4 exact | `ENCOUNTER_ENEMY_COUNT=4`, authored order exact |
| `instanceId` | enemy 공개 ID 없음 | `enemy-001..enemy-004` 고정. 다른 ID·중복·순서 변경 거부 |
| type/skin | baseline exact | baseline 각 순서와 exact. 외부 URL·임의 source·추가 type 거부 |
| X/Y | 초기 값 고정 | finite number, `coordinate*4` 정수, 0.25타일. `0≤x<72`, `0≤y<84`; UI 최대71.75/83.75 |
| native enemy 변환 | `(tile+.5)*T` | 같은 공식, T40. 월드 생성 전 compile 값만 factory가 읽음 |
| 바닥 검사 | 기존 초기 값 | 발 중심 및 world±10px 네 모서리 모두 authored RLE value1. `NATIVE_FACTORY_CLEARANCE=10`은 실제 `mkEn→canMv(x,y,10)` 기존 범위. `floor(world/T)`를 검사하여 factory의 `safePt` 보정을 피함 |
| 새 제한 제외 | 기존 규칙 | 임의 actor radius·몬스터 간격·방 경계 규칙 추가 0. geometry/nav/collider 변경 0 |
| objects / map / camera | 기존38·72×84/RLE6048/T40·START35/68·EXIT41/16·원근 설정 | 동일 v1 계약. objects X/Y가 source 입력과 유지되는지는 실제 저작본 증거로 별도 비교 |
| dependencies | 환경19+skin4=23, 첫 사용 순서 exact | 동일, 임의 asset URL/source/hook 추가 0 |
| byte / JSON 한계 | MAX_MAP_PACK_BYTES32768, node32768/depth64 | 동일. getter/toJSON/비열거·심볼·custom prototype/희소 배열/undefined/function/NaN/Infinity/cycle 및 금지 key 거부 |
| JSON 원문 | native fragment raw 제어문자 금지 | editor parser는 문법상 LF/CR/TAB 공백 허용. 문자열 안 제어문자는 snapshot 검사로 거부. editor/fragment 모두 duplicate JSON key 및 UTF8 byte 한도 검사 |

| authored instance | 이름 / skin / etype | 기본 타일 | 이번 타일 | 실제 초기 world |
|---|---|---|---|---|
| enemy-001 | 부패 기사 / rot_knight / 0 | 31/55 | **34/62** | **1380/2500** |
| enemy-002 | 해골 야수 / skull_brute / 0 | 39/51 | 39/51 | 1580/2060 |
| enemy-003 | 뼈 궁수 / bone_archer / 1 | 30/43 | 30/43 | 1220/1740 |
| enemy-004 | 가시 사도 / etype1_archer / 1 | 43/39 | 43/39 | 1740/1580 |

기존 소품 world는 `tile*T`이며 적의 `+.5`를 적용하지 않는다. 기본 source 대비 receipt.changedObjects는 prop03543→44 때문에1이지만, **이번 입력 v1→출력 v2의 소품 변화는0**다. 이전 완료 v1 proof를 새 저작 증거로 사용하지 않았다.

## API · 실제 consumer · 관측

| API / 필드 | 현재 계약 |
|---|---|
| `createNativeEncounterMapPack(baseline,sourcePack?)` | 유효 v1/v2 pack 독립 복사, v2 및 고정 enemy ID 추가. source 생략은 v1 baseline 기반. 원본/draft 변경 0 |
| `validateNativeMapPack` / `compileNativeMapPack` | 명시1/2만 허용. v1 scene/enemy/receipt shape 유지. v2 scene.enemies는 public instanceId 제거, `_fdgInstanceId`만 native consumer 전달 |
| `parseNativeMapPackJson(text,baseline)` | bounded UTF8 JSON 원문→duplicate key/schema 검사→`{pack,scene,template,receipt}`. `readMapPackJson`은 `.pack` 반환. 실패 시 현 편집 pack/href 보존 |
| `applyMapPackEnemyPlacement(pack,baseline,{instanceId,x,y,name})` | 독립 v2 draft→좌표 입력→순수 compile. live ens/P/projs 참조 없음 |
| `createMapPackPlayUrl` | 검증된 fragment 생성 후 v2에만 새 query 추가. v1 URL 형태 유지 |
| v2 receipt | 기존 receipt + `{version:2,enemies:4,changedEnemies}`. 변경 행 `{instanceId,etype,skin,from:{x,y},to:{x,y},world:{x,y}}` |
| `_prepareNativeMapPack` | 공유1회 Promise, decode/새 gate 검증 후 bundle 할당. module cache query `encounter-placement-first-20261012` |
| `_initRuinedForestNativeScene` | compiled template→기존 genFromTemplate; compiled 적→**기존 mkEn**. 인자 `(worldX,worldY,0,etype,false,EL.P,-1)` 및 기존 skin/meta 지정 유지 |
| 초기 metadata | v2에서만 반환 actor에 `_fdgInstanceId` 부착. `_fdgNativeEncounterSpawns`에 실제 factory 반환 e.x/e.y 1회 기록. spawn 후 좌표/HP/clock 보정 0 |
| `snapshot().spawnedEnemies` | v2만. `{instanceId,etype,skin,authored:{x,y},world:{x:e.x,y:e.y}}` 최초 factory 결과의 독립 사본. 이후 AI 이동값과 구분 |
| `snapshot().appliedEnemies` | v2만. 실제 ens의 `_fdgInstanceId`가 있는 초기 actor `{instanceId,etype,skin,x,y,hp,mhp,alive,state,isGhoul}` 새 사본 |
| 자연 GH 한계 | 기존 revive 경로가 만드는 새 etype100 객체에는 저작 ID가 없다. spawn registry는 초기 적만, appliedEnemies는 그 새 GH를 포함하지 않음. scene/readonly raw ens에서 GH 관측 가능. ID 보존을 위해 revive 코드 수정 0 |
| UI 적용 표시 | v1 기존 `편집 배치 n개 적용` 유지. v2 `몬스터 위치 n개 · 소품 위치 m개 적용`. 전투 숫자·코드 hook·asset URL은 편집 UI/schema에 없음 |

## 필요한 검사와 실제 새 원본

증거 E: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/engine-encounter-placement-native-first/`.

| 검사·증거 | 실제 결과와 한계 |
|---|---|
| `test/fdgNativeEncounterPlacement.test.mjs` | 새 고유8 최초 PASS/FAIL0/수리·재실행0. v1 보호, v2 ID/type/order/count·quarter 좌표·native 바닥/모서리, source/dependency 보호, 독립 compile, 안전 JSON/fragment |
| `test/fdgNativeEncounterPlacementIntegration.test.mjs` | 새 고유4 최초 PASS/FAIL0/재실행0. actual loader gate/invalid pre-world0, 실제 factory 인자·같은 반환 actor/native 수치 보존, v1/basic/main 분기, 공개 UI draft/export/reset/import/play 및 오류 보존 |
| 완료 검사 동결 | old18/40/55/main9/동측latest2/birth/출구 완주 재실행0 |
| `proof/01-authored.png` | 동일5868 저작본의 부패 기사 ID·X34/Y62·선택 바닥 표식. 공개 import/선택/접기/top scroll만으로 좌표 가독성 보완 |
| `native-prestart.json` | 시작 전 frame0/runningfalse, native4마리 HP/mhp/실드875 및 위 world 좌표, NORMAL index5/multiplier1/Lv1, sourcefragment5868B |
| `proof/02-native-spawn.png` / `native-spawn-visible.json` | 같은 저작본의 공개 재시작→시작→정상20tick생성fade→일시정지. 최초 factory1380/2500과 구분한 실제AI위치1391.4761274720465/2602.196986086408·_spawnT0에서 본체/발 PASS. 첫 화면의 청색호는 기존 _spawnT20/alpha0 상태이며 초기 정확좌표는 prestart/최초registry로 확인. clock 보정0 |
| `public-roundtrip.json` | source5768/output5868, reset v1/기본적·소품, export textarea 유지, reimport href exact |
| `public-movement-final.json` | 공개 live W/W 후 P1420/2740→1420/2490.000000000001. 기존 6tick/250px 이동, walked249.9999999999991. 입력 키 상태/world 좌표 주입0 |
| `native-combat.json` / `proof/03-native-combat.png` | 짧은 공개 LMB6/RMB1, 29 읽기. dmg1123, dmgTaken.7999999999999687, deaths0, 자연 etype100/isGhoul/hp1750·shield1264 관측. 독립 탄 삭제·forced revive·HP/AI/시간 조작0 |
| 준비 이력 | canvas press는 dispatch 실패, 정상 AI 진행 중 자연 사망1 후 공개 처음부터다시. 성공 이동/교전으로 바꾸지 않음. 마지막에는 공개 재시작·시작으로 기존20tick 생성페이드를 자연 종료한 뒤 표시 원본을 보완 |
| P 수치 | 기존 starter loadout 경로가 공개 재시작 때 재생성됨. 관측 mhp570→524→598. 저작 데이터/consumer가 HP·피해·난이도/무적 값을 설정하지 않음. NORMAL/Lv1 계약 유지 |
| 저장/현재 상태 | 자기 r4 저장격리 writes=[]/successfulWrites0. 자기 게임31 정상페이드 이후 일시정지(P1420/2740, HP598), 편집32에 같은 저작본 유지. 사용자 탭 및 기존 자기28/29/30 보존. 이번 출구/완주 재검사0 |

## §23 MAP PRODUCTION REPORT

| 항목 | 이번 단위의 제작·인수 범위 |
|---|---|
| STAGE / MASTER PLAN | EDITOR_ENCOUNTER_PLACEMENT_NATIVE_FIRST. PoE2 제작 데이터→실게임 engine 연결의 초기 몬스터 좌표 단위 |
| LARGE OUTER MASS | 기존 outer38 source/scale/noCol/upright·저작 v1 소품 배치 유지 |
| MEDIUM / GROUND | 기존 RLE72×84/T40/nav/START6시·EXIT12시/상단통로 유지. 새 geometry/랜덤/roomgraph0 |
| PLAYABLE / COMBAT | v2저작 enemy00134/62→pure compile→actual factory1380/2500→공개NORMAL 이동250px/교전/자연GH 관측 |
| LANDMARK / CENTER / SMALL DETAIL | source PNG·소품38·dependency23·랜드마크·간격 변경0 |
| CAMERA QA | 기존 설정 그대로. 새 편집 좌표·초기 준비·국소 교전 원본3장만. 기존 동측/birth/route proof 재검토0 |
| TECH QA | 새필수12 최초 PASS, invalid boot0/current draft보존/native 값 owner 유지. 전체 GPU/지속60FPS/backend/residency 보장0 |
| FILES / GIT | 코드4+새검사2+현행docs7을 같은 정상 owned checkpoint로 저장. 정확 SHA/parent는 외부 최종 receipt. working+HEAD fullbyte backup/realparentc2da9251. foreign25 보존. push/deploy0 |
| VISUAL VERDICT | 새 최종3원본의 editor 좌표/정상fade뒤몸발/국소교전 PASS. 전체씬·모델·24장/24FPS·VFX RETOUCH |
| NEXT / 미완료 | 신규 모델·리그/24장·전체VFX/GI/backend·맵 generation·모든 적 배치의 실제플레이 QA는 별도 미인수 |

Q/E·poise·2_3·blackBean Q-only blue 반사·부활·독립 탄·native clock·피해·AI 계약은 변경하지 않았다. 새로운 editor 저작 값은 월드 생성 전에만 소비하며 live teleport/observer/callback 쓰기0다.
