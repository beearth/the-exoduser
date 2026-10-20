# DEMO11-45 — 1-1 상호작용 오브젝트 사전 연결 확인

**BLOCKED — 첫 종 보물상자의 실제 MAP11/보스 완료 접점 대기. 구현 완료가 아니다.** 봉화·제단·상인으로 우회 구현하지 않았다. 임의 배치·가짜 처치·독립 보상/저장 writer를 만들지 않았다.

| 후보·우선순위 | 최신 main 원본 근거와 판정 |
|---|---|
| 데모 진입 | `game.html:16646` `_DEMO_MODE` 기본 demo. `62126` 신규 demo stage=0. 원본은 기존 NPC_WORLD 추적 §2.1/§2.4와도 교차 확인 |
| **1. 보물상자** | `41819–41838`: 아레나에서 30 source frame 단위 검사, findBoss 없음 **및 부활 대기 boss 없음**·bossRoom 존재 후 bossAlive=false latch→bossRoom 중심 상자 1회 생성. `32854–32878`: R 상호작용, type=chest·!picked·!opened·거리 **<60**, 첫 상자를 opened=true로 먼저 표시하고 보상. 보스 처치 latch/부활 최종 판정은 기존 NPC_WORLD 추적에서도 보스 담당 경계라고 명시. 원본 데모 stage0에 막는 조건 없음. 따라서 이번 첫 구현 대상으로 선정하되 실제 완료 writer 연결은 아래 접점까지 BLOCKED |
| 봉화 제외 | `25795–25811` 생성 코드 전체 주석(세이브포인트 없는 게임). 사용 분기 `32830–32833`가 남아 있다는 이유로 활성 배치하지 않음. `G._bonfire` 시작 보호 영역과 MAP_OBJS의 상호작용 bonfire도 구분 |
| 제단 제외 | `25870–25879` 생성은 `G.stage>=5`, stage0 아님. MAP11 recipe의 `heart_altar` collision solid를 이 버프 제단으로 간주하지 않음 |
| 상인 보류 | `RARE_ETYPE[93]` `30959`; room/별도 TileRLE spawn 함수의 rare 교체 `31424–31430/31471–31476`는 존재하지만 `31573–31576` TileRLE 기본 경로는 room spawn을 건너뜀. CH1 상인 실제 도달은 기존 NPC_WORLD §2.1도 **미확인**. 일반 fieldNpcRoster의 merchant도 게임 caller 미확인. 따라서 데모 stage0 상인을 있다고 확정하거나 고정 anchor에 새로 스폰하지 않음. `40283–40312`의 F 거래는 창 없는 1회 거래이며 별도 상점 카탈로그 UI를 발명하지 않음 |
| 상자 보상 원문 | `32864–32874` 장비 count=`3+~~(U*3)` →3~5. 각 슬롯은 기존 SLOT_NAMES, 원소 P/F/I/D/L/H, mkItem tier0. stage0 leg=.15, hero=.25 → rarity4/3/2/1의 구간 .15/.40/.70/1, 장비 분산±25px. **mkItem 내부 RNG도 같은 기존 World RNG 순서로 재사용**. `32875` 악의+5, `32876` addPotion('hp',2)는 **`28250–28257` 즉시 악의+2 전환**이므로 총 악의+7·지속 HP물약 추가0. 문구만 보고 물약 2개를 저장하면 원본과 불일치 |
| 저장 원문 | `62131–62160` demo 저장 literal은 inv/game.mats 등 저장, worldItems/MAP_OBJS/opened/merchant used는 없음. `31553` initStage가 worldItems/MAP_OBJS 비움. 따라서 열림 상태는 해당 stage/runtime 수명에서만 유지하며 새 영속 개봉 플래그를 추가하지 않음. 보상 중 수거된 INV와 악의의 기존 collector/restore 왕복을 검증해야 함. 미수거 world drop을 새 저장 필드로 지속시키지 않음. 개인 슬롯과 공유 악의의 최종 IO 프로필은 기존 저장 owner 계약을 따름 |

| 연결 접점·검증 | 현재 상태·재개에 필요한 범위 |
|---|---|
| 기준·의존 | fetch main `0138c5bb9188d27cee10cb1a901d075092ddb88f`, 정상 `git merge --no-commit 263498f6`가 fast-forward되어 `263498f6c58d05a278b32a7e2641af072138a3fa`. rebase0. MAP11 의존의 기존 맵/에셋/코드는 인수분이며 이 단위 신규 제작분0 |
| 실제 provider | `MAP11_FIELD_PROVIDER_20261021.md:5–8`는 제품 Main 자동 설치·실제 통합 미확인을 명시. 현재 `main.gd`에 field_runtime 설치/active provider 참조 없음. 독립 `field_runtime.gd:76–83`의 `anchors("*")`에서 **`map11.arena.boss` / boss_center**를 받을 수 있음(`stage_provider.gd:5`). 필드14개는 별도 상자/상인 역할 없음. source bossRoom 중심을 대체할 후보는 arena boss anchor이며 임의 field landmark/좌표 fallback은 금지. 재개 시 실제 Main/World에 설치된 동일 runtime 참조·revision/instance identity를 받아, runtime_ready와 실제 Marker 생존을 검증해야 함. geometry를 새로 instantiate하여 제품 맵을 바꾸는 것은 이 단위 범위 밖 |
| PC 보스 완료 권위 | `native_demo11_boss_actor.gd:24,38–77,114–124`는 dormant 시작·외부 spawn·source_tick/prefix 등 owner 대기. `main.gd:126–139` snapshot/spawn/bind_owner는 있으나 생산 Main의 실제 arena 완료/부활 대기 최종 receipt caller는 없음. `demo11-34_REPORT.md`도 자연 arena/PC 피해 readback의 미연결을 명시. **HP<=0 복사본이나 actor 없음만으로 완료를 판정하면 원본 부활 대기 보호를 깨므로 사용하지 않음**. 필요한 것은 기존 PC/arena owner의 실제 보스 전투 epoch/instance와 최종 사망·부활 대기 해소 통지. 기존 receipt 필드를 그대로 인수하며 이 문서의 임의 필드명을 새 권위로 만들지 않음 |
| 재개할 Main/State 위치 | Main `_ready`의 demo boss 설치 `340–341` 인근에 상자 소비자 설치·동일 provider/완료 owner 바인딩을 추가할 후보. State drop append `721–739` 및 원본 `_wiPush` `16721`의 cap20 sink 재사용, 필요하면 상자 unopened 보호 정책을 별도 검토. State `_feel_owner_current:317–321`의 actual Main/World·pause guard 보존. 피해/부활·bossAlive writer를 여기서 변경하지 않음. 실제 접점이 없으므로 이번 공용 변경 **0줄** |
| 첫 단위 구현 지시 | 위 두 실제 접점이 들어오면 상자 1종만 진행: 완료 receipt 1회 latch→anchor 기반 생성→실제 R 엣지·<60 첫 개봉→기존 mkItem 및 DEMO11-21 journal→수거 시 기존 INV/cache/UI→원본 악의+7→기존 collector/IO/restore. 상자를 clear의 새 필수 조건으로 만들지 않음. stage 전환/revision 교체 때 이전 노드/receipt 폐기. 프리뷰용 상자를 제품 상태로 섞지 않음 |
| 검증 계획 | 재개 시 관련 신규 격리 `EXODUSER-demo11-45-Isolated-20261021`. 경계59.999/60, 반복R 중복0, PC부활대기0생성, provider퇴역/오류0변경, 3~5개 원문 RNG oracle·mats+7·INV 수거·stage 재진입/저장 왕복을 직접 관련 suite로 각1회. 핵심 결함 주입3~5종만. 가짜 boss/저장 성공 receipt로 제품 PASS를 만들지 않음 |
| 이번 실행·산출 | 제품 코드·테스트·Main/State·보호·맵·저장·번역 신규 변경0. 새 UI/텍스트0 → 캡처/번역 등록 해당 없음. Godot/사용자 저장 접근0, 테스트 **미실행(N/A)**. PASS/0실패로 세지 않음. 원문은 `source-excerpts.txt`, 입력 hash/실제 Main 접점은 `_out/demo11-45/{read-only-inputs.json,main-interfaces.txt,boss-interfaces.txt,map11-provenance.json}` |

관련 SSOT: [NPC_WORLD 원본 추적](../../FDG_SOURCE_TRACE_NPC_WORLD_20261020.md), [MAP11 field provider](../../../4.1맵디자인+설정/MAP11_FIELD_PROVIDER_20261021.md). 원로그 `/Users/fordeargamers/exoduser-wt/_out/demo11-45/`. 다음 종은 첫 상자의 실제 접점이 해결된 뒤 원본 도달 근거를 다시 확인한다. 최종 SHA·원격 일치·worktree 제거는 DONE.txt에 남긴다.
