# MAP11 — 1-1 새 맵 제작 로직 설계안

> map11-plan · 2026-10-21 보스룸 우선 보충 · **문서 전용 / REVIEW_PENDING**. 기준 main `0105159934d0c2a8b167bd51518dca1e0fafe50a`. **2026-10-21 보충 방침: 보스전/보스룸 디자인부터, 데모를 먼저 완벽하게 완성하며 Godot 이식은 병행한다.** 웹 맵 이식은 종료하고 **보스룸 → 1-1 필드 → 데모 전체 인수** 순서로 제작 로직·분위기·테마·전체 디자인을 완성한 다음, 승인된 같은 로직으로 1-2 → 1-3을 순서대로 만든다. 이번 작업은 코드·에셋 생성·Godot 실행·화면 캡처 0. 현재 main이나 새 맵의 시각 완성·성능 PASS를 선언하지 않는다.

## 1. 최우선 — 1-1 보스룸과 데모 종착점 (MAP11-01)

**먼저 만들 화면은 1-1 일반 다크드루이드(si0)의 보스룸이다.** 필드 전체 아트, 범용 provider 완성, 다음 맵을 기다리지 않고 보스룸의 master/독립 blockout·스타일키부터 확정한다. 현재 main에 인수된 BC01~10을 재작성하지 않고 Godot 자연 전투 연결과 함께 발전시킨다. 보스 디자인 완료와 데모 제품 완료는 별도 gate이며 최종 목표는 **입장→등장→자연 보스전→실제 죽음/보상→stageClear→demoEnd→로비**가 한 흐름으로 완성되는 것이다.

### 1.1 아레나 디자인·공간·카메라

| 항목 | 보스룸 우선 설계 / 완료 기준 |
|---|---|
| 분위기·주인공 | 썩은 숲의 심장부: 중앙은 넓고 낮은 젖은 피부/회자주 바닥, 바깥은 죽은 고목·굵은 뿌리·갈라진 조직이 벽처럼 연속. **D02 확정: 노출 조직·동맥·눈·고치를 강하게 드러내되 적·탄·Q/E 경고색과 대비 충돌이 없도록 한다.** 보스 실루엣과 전조가 주인공. 필드의 심장제단/큰 시체나무는 아레나 **바깥 프레임**으로만 사용, 중앙 장식섬/기둥/미로0. Hell Gothic·잔점 금지·MagicLight 우선은 아래 공통 기준 그대로 |
| 형태·크기 초안 | **유효 전투 반경 R=2200 world unit, 지름4400**의 원형에 가까운 무기둥 공간을 blockout 시작값으로 권장(신규 제안/미실측). 안쪽에 돌출되는 프롭 충돌0, 시각 외곽만 비대칭. 원본 G30697–30707은128×108/T40·원형/기둥없음; 이 타일 배치/좌표를 복제할 의무는 없고 아래 기술 공간을 수용하는지가 기준 |
| 여백·소켓 | 남6시 `arena_entry`/재시도 안전지점, 중앙 `boss_center`, 북12시 `clear_exit`, 필드쪽 `arena_return`을 별도 안정ID로 제공. entry는 실제 boss/player bounds와 첫 조작 가시성으로 확정. 파티클/원화 alpha를 collider로 쓰지 않음. 넓은 외곽 회피 고리·중앙 횡단/대각선 돌진·잡기 후 throw의 합법 착지 여백을 모든 방향으로 검수 |
| 크기의 검증식 | si0 phase4 slam R1320이 중앙에서 닿아도 둘레에880의 기하 여유가 남는 시작값(2200−1320). 이는 보스가 이동한 뒤에도 안전을 보장한다는 뜻이 아님. off-center slam/charge·tide max1750·탄막·점프 목표·잡기/넉백까지 **실제 actor 반경·패턴·벽 응답**으로 검수 후 조정. arena에 맞추려고 피해/사거리/속도/CD/기술을 축소0 |
| 광원·분위기 | NW의 약한 냉광과 밑동/뿌리 접지, 보스 뒤 균열의 둔한 적색 림, 남쪽 gate의 따뜻한 잔광. player/보스/장판을 분리해 읽을 중간 명도 바닥을 유지. 독탄/위험 신호색과 같은 밝은 장식광 금지. 큰 그림자는 바깥으로, 플레이 공간의 텔레그래프를 덮지 않음. 기존 MAP-LOOK shadow/부분광을 PC 담당과 재사용 |
| 카메라 | 전투 camera는 **combat_bounds와 render_bounds를 구분**. 원본 G35722–35738의 P/B 중점 .5/.5+lookahead .3, zoom target .80을 비교 출발점으로 사용. 실제 보스 sprite의 발밑/상반신 bbox와 player·위협 전조가 함께 읽히는 framing을 blockout에서 조정. 발 위치 중점만으로 거대한 상반신이 보인다고 가정0. zoom/offset 변경은 기존 camera·pointer 역변환 담당 승인 범위, Q/E aim 좌표 일치 필수 |
| 외곽·HUD | render mass는 combat rim 밖으로 최소 해당 줌 반화면+최대 camera shake 범위까지 연장해 빈 void 노출0. 보스 이름/HP/poise·가이드·결과 UI가 몸체/전조를 가리지 않는1x 검수. 아레나 전체를 한 화면에 넣는 고정 zoom이나 보스 근접 시 과도한 자동확대 금지. 화면 밖 탄/파도 원점은 경고/진행방향이 읽혀야 함 |

### 1.2 BC01~10과 탄막·지형 수용표

근거는 [1장 보스 추적](../engine/FDG_SOURCE_TRACE_BOSS_CH1_20261020.md) §1/2/BC단위표와 최신 main의 동일 `game.html`이다. 보충 시 main `aa1eaea5a1fa70b31eae6fd907662ee13471c08d`을 읽기 대조했고 원본 game blob은 기존 설계 기준과 동일(`e755a2d98211ac2a6b4a53d8a1e3e7abe4714400`). WORK_BOARD의 BC08/09 병합 표기와 달리 해당 두 파일은 이 main tree에 없어, DEMO11-02의 승인 체인 인수 확인을 선행한다. 문서 표기를 실제 live 연결로 간주하지 않는다.

| 재사용 단위·원본 | 기술/서비스 범위 | 아레나가 수용·검수할 공간 |
|---|---|---|
| BC01 catalog + BC02 spawn / G9965–9967·31119 이후 | si0 일반 드루이드 최종23무브, 본체r44 등 기존 생성값. si3 피날레/다른 보스/새무브 추가0 | 원형 무기둥 전투면·실제 body bbox/발밑·spawn 합법반경. 최종 si0에는 burrowStrike 포함, cageTrap/teleStrike/tailSwipe 제외. 옛 최초 Set이나BC06에 case가 있다는 이유로 활성화0 |
| BC03 utility + BC04 selector + BC05 phase / G37650–37699·38373–38441·38236–38314 | 거리·선택/콤보/반복·공유RNG·phase0..4 전이 재사용, 자연선택거리20..500 및 원 tick 의미 보존 | 근접으로 접근할 길·멀어졌다 재진입할 여백과 phase4 최악범위 검증. 맵이 선택가중치/phase/회복시간을 바꾸어 손쉽게 만들지 않음 |
| BC06 start + BC07 melee / G37702–37736·41074–41183 | slashCombo `r+Pr+300`/sweep `r+Pr+400`의 각도·구간, slam `1000+si30+phase80`(si0최대1320). 전조/후속 순서 보호 | 중앙 장애물0, 근접 측후면 회피/연타 재진입·넉백 여백. 원/부채 tell과 실제 범위가 바닥/그림자/보스 몸에 묻히지 않음 |
| BC08 이동 / G40664–40708·40942–40977 | charge50tick·35sp·마지막18 방향잠금·canMv XY/X/Y/막힘shock, jump40tick/착지R300·shock, multiDash9sp·phase4최대10회 | 긴 직선/대각선·벽 접촉/미끄러짐·점프착지와 연속방향전환 검수. charge1750은50×35의 직선 요청거리 상한 참고이며 실제이동성공 보장 아님. 장식기둥으로 돌진을 반복 차단0; 일반 eCharge 커널로 대체0 |
| BC09 탄 / G40562–40569·40646–40662·41185–41205·37769–37791·38212–38230 | burst/fan/beanStorm/elemBall/rapidMissile + 독립 rhythm/ORB. si0 fan phase별요청10/12/13/14/16, life400. rhythm interval90−6phase/count5+phase/life240; ORB110f에3발·speed6.8/t>460소멸 | 방사/부채/파도 사이 lateral 회피선·멀리서의 반사/탄 진행·긴 수명 탄의경계처리. 벽으로 탄을 임의흡수하거나 탄수/속도/후처리를 줄이지 않음. Q/E/black-red 분류와 실제 registry/expiry는 기존 보호 owner |
| BC10 잡기/잠행 / G40837–40867·41047–41072 | grab 포획 `r+Pr+200`,60tick/주기10·throw; 잠행45→분출40/8f후폭발R=r+120 | 플레이어 강제이동/throw 착지의합법위치·카메라 추적·잠행 marker/분출warning 가시성. 일시적몸숨김을 boss death로 처리0, iframe필드만으로무적성공을주장0 |
| **BC01~10만으로 데모 전투를 닫지 않음** / G37723–37732·37931–38019·38085–38117·37015–37126 | 최종23종에는 summon/mine/chaseAoe/groundFissure/tideWave/seekerMines/poisonTrail/lavaPools도 포함. 실행은BC11/12 등 기존단위와 DEMO11 범위 판정/owner에 의존 | tide maxR1750/gap .8, fissure maxLen=`~~(max(mw,mh)*T*.45)`/폭140/explosion≤750, chase R450, poison R175·3점poolR150, 소환/지뢰자리를 검수. 원본128×108·T40에서 attack extent=(5120,4320), fissure maxLen2304/explR691.2다. 새 provider는 이 **게임플레이 effect metric**을 geometry/render bounds와 분리해 기존식 consumer에 명시 매핑하는 안을 코드owner와 인수한다. 새 R2200이나카메라외곽을mw/mh에대입해공격길이를암묵변경0; 원본맵/좌표를복제하라는뜻은아님. 미연결기술을삭제/대체해완벽한데모로보고0 |

### 1.3 입장·등장·클리어·데모 종료 연결

| 단계 / 코드 owner | 공간·연출 제공 / 실제 진행 gate |
|---|---|
| 필드→입장 gate / DEMO11-03·31·37 | 필드의 지역/앵글러 `_fbDone`·문지기 등 원조건이 성립한 뒤 gate trigger 유효. 보스룸을 먼저 개발하는 독립 entry는 **개발용 preview**로 명시, 정상 데모의필드조건 우회로 배포0. 필드 전체아트 완성은 보스룸 디자인 착수의 선결조건이 아님 |
| 전환/안전 / DEMO11-37 | entry/return/context descriptor·arena geometry·boss/render 자산 준비 확인 후에만 전환 commit. 준비실패는 기존 field context 유지. 잔여 필드몹·탄·굴·상호작용·사망/재시도 backup/reset·clear 분모 처리는 기존owner, 맵씬이 임의로 삭제/처치기록0 (G30749–30814) |
| 등장 / DEMO11-34·37 + 기존 UI/SND | G41784–41814 원시계: fade out50→name130→fade in50→입장100, 첫 보스stun90/reviveIframes110·포효·빛/입자. 단순7초고정 영상으로 치환0. 맵은 남쪽입구/보스anchor·림/접지·카메라 key를 제공, 시간/입력gate/HP·poise HUD는 기존owner. storyboard는 gate앞실루엣→fade/name→얼굴·뿌리림/접지→전투camera/첫조작의4장면으로그리되시계는원값을사용한다. 이 구간서UI가player와보스를누르지않고첫조작전보스실루엣이읽혀야함 |
| 실제 전투 / DEMO11-34·35·36 | BC01~10 및 남은자연23기술의 실행 consumer·projectile·피격/패링·이동 writer 병행 통합. 빈 ack/강제pattern fixture를 자연boss전 PASS로 세지 않음. 별도 강제패턴으로 공간 경계를 검증한 결과와 자연전투 결과를 구분 |
| 죽음→보상/clear / **DEMO11-37** | G41816–41926: 죽음처럼 보여도 revive timer>0 유예, 최종살아있는boss 없음 판정 후 한 번만 clear/reward/clearTime·랭크 인계. 열린 exit·reward/chest 자리 제공. 보스sprite소멸이나fade끝이clear조건아님. 재시도·부활로중복보상0 |
| stageClear→종료 / **DEMO11-38** | G43896·63663–63681: 다음버튼→demoEnd·wishlist/로비복귀, **stage1/1-2 생성0·중복clear0**. 결과 화면에 보스룸 빛/FX/입력 잔류0. 실제 wishlist URL은 원본TODO와구별해 UI/사용자소유결정, 임의등록0. 로비/저장인계는기존owner |

### 1.4 보스룸 우선과 Godot 이식 병행

| 작업 흐름 | 바로 진행할 것 / 합류점 |
|---|---|
| A — 맵·아트 | **MAP11-01 보스룸** master/무기둥 blockout/입구·보스·출구anchor/광원 key/카메라 board. 보스앞·근접·가장자리·장판/탄막·클리어 화면을 먼저 승인. 이후 필드 master/아트로 확장 |
| B — Godot 코드 | 기존 DEMO11-02/03·34~38 owner가 BC 의존 인수·실제 actor/탄/피해/지역/결과/로비를 **동시에** 연결. A의임시authoring revision에명시bind, prefab/정책/State 복제0. 범용schema·전체필드완성을기다리며중단하지않음 |
| 합류 gate | MAP11-02/03의 arena provider/camera/충돌 계약에서 A/B 합류, 정상입장/전투/종료는05/06에서검수. API변경은변경된interface와한consumer씩작게인수. 보호공용파일은기존담당명시오더만, 이문서작업에서코드수정0 |
| 필드로 이동할 때 | MAP11-01의보스룸디자인/공간master 승인후 필드07부터가능; B의전투/종료이식은계속병행. **보스룸디자인우선**을보스코드완성까지필드설계를모두멈추는직렬대기로해석하지않음. 1-1필드·보스·종료의제품합류가최종데모인수 |

이번 보충은 기존 제출 `6df1201eda63557910da32229b2053edaff07355`의 문서만 수정한다. 최신 main `aa1eaea5a1fa70b31eae6fd907662ee13471c08d`은 원본/BC 파일 존재를 읽기 대조했으며, 미인수 브랜치/코드 merge는 하지 않았다. 아래 필드 설계는 후순위이며 최신 보스룸 우선 방침이 앞선다.

## 2. 근거와 방침 우선순위

| 확인 자료 | 이번 설계에 적용할 부분 / 충돌 처리 |
|---|---|
| 최신 사용자 방침 | 최상위. 웹 좌표·200×200/T40·tileRLE·베이크64청크·원본 exporter·provenance 재현은 새 맵의 요구사항에서 제외. 기존 웹 파일과 세이브를 삭제한다는 뜻은 아님 |
| [CLAUDE.md](../../CLAUDE.md) 148–163, [UI FOUNDATION](<../3.1 ui hud 디자인/UI_FOUNDATION_20260924.md>) 1–26 | Hell Gothic: 흑철·악마 실루엣·붉은 지옥불·뼈색. 눈 검수/1x 크롭 필수. AI 잔점·점묘·디더링·반짝이 점 금지. MagicLight 우선. 게임 HUD·폰트·Q/E 색은 기존 담당 계약 보존 |
| [1장 MAP BIBLE](<EXODUSER_MAP_BIBLE_v3 (1).md>) 24–48, [맵구성 1장](맵구성_1장.md) 31–58·146–185 | 숲 입구→뒤틀린 숲길→눈달린 버섯 군락의 테마만 계승. 옛 vert/grid·좌표·지형 강제 없음. BIBLE의 기생수 보스 서술은 현재 si0 다크드루이드를 대체하지 않음 |
| [맵디테일](맵디테일.md) 238–264, [SSOT 진입점](_MAP_SSOT_INDEX.md) | 넓은 전투면·피부막·동맥·부패 고목·억제된 국소광. 과거 웹98차/원화 PASS·RETOUCH는 이 새 Godot 맵의 승인 근거가 아님. 옛 START/EXIT 좌표 LOCK은 이식하지 않되 **6시 진입→12시 출구** 방향은 유지 |
| [제작 가이드](EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md) §0–4/7/9–10/13–17/20–23 | MASTER→LARGE OUTER MASS→MEDIUM→GROUND→PLAYABLE→LANDMARK→SMALL→CAMERA→TECH. 4층 외곽·8카메라·전투 가독성·시각/기술 별도 판정. 가이드의 6–10 시각 REGION은 아래 8장면이며 게임 처치 지역4개와 구분 |
| [맵 오브젝트 목록](맵오브젝트_에셋목록.md), [Seedream 경로](MAP_OBJECT_SEEDREAM_PIPELINE_20260930.md) §절차/주의, [폐기 목록](LOW_QUALITY_ASSET_RETIREMENT_20260927.md) | 개별 원화는 품질/폐기 상태 확인 후 재사용 후보. 기존 완성 맵 청크·placements를 재사용하지 않음. 목록에 있다는 이유만으로 승인 에셋으로 취급하지 않음 |
| [그래픽 MASTER](<../1전체그래픽세팅/1전체그래픽세팅_MASTER.md>) 비전/현행 접지 절, [화면효과 조사](<../1전체그래픽세팅/맵_화면효과_전수조사.md>) §1–3/7–9 | 서정적 어둠·실루엣 대비·부분 조명·접지의 목적을 계승. 예전 Ori 방향/그로테스크 금지 문구보다 이후 생체지옥 콘셉트와 **사용자 D02의 강한 노출 조직·동맥·눈·고치 표현 확정**이 우선한다. 서정적 어둠/실루엣 대비는 계승하되 표현을 임의로 약화하지 않음. 웹 효과 수치·FPS를 native 실측으로 복사하지 않음 |
| [DEMO11 GAP](https://github.com/beearth/the-exoduser/blob/2299caa53585d937d7d0b025bd5ccc3ec539b0de/docs/engine/DEMO11_COMPLETION_GAP_20261021.md) §1 인터페이스/DEMO11-03/§5 | 원격 `codex/demo11-gap-20261021` `2299caa53585d937d7d0b025bd5ccc3ec539b0de`를 읽기만 함/merge0. anchor·충돌/벽/시야/flow·지역/분모·arena·출구를 제공. 맵 이식은 요구하지 않음. 앵글러 `_fbDone`은 지역 없는 폴백에서도 생략 불가 |

## 3. main에서 재사용할 것과 실제로 빠진 접점

| main의 실재 위치 | 현재 사실 | 새 맵 접점 / 소유 |
|---|---|---|
| `godot/scripts/main.gd:207–218,233–238`, `godot/scenes/main.tscn` | Node2D + Camera2D, 카메라 경계8000 고정. NativeScreenLighting 후 NativeMapLook 설치 | **2D 기반 2.5D 깊이** 유지. 3D 엔진 전환 없음. 카메라 경계는 새 provider bounds에서 받도록 DEMO11-03 통합 요청; 이번 수정0 |
| `native_map_look.gd:62–129,168–200,234–269` | 일반 boot auto 설치/하니스 auto 제외. CanvasModulate·PointLight2D·sway·그림자·근경·빛줄기 있음. `world.map_data.props`, texture 경로, world 직속 Sprite2D/`_chunks`에 결합 | 기존 효과/셰이더를 재사용하되 명시 render handles·semantic anchors·stage look profile adapter 필요. 중첩 씬을 현재 코드가 자동 스타일링한다고 가정하지 않음. **MAP-LOOK 기존 PC Claude 소유**, MAP11에서 중복 커널 제작0 |
| `godot/data/map_look_ch1.json` | ambient [.26,.28,.36], player radius560/energy1.05, camp640/1.55, sway5 world px, fx_light_limit18. 그림자 NW→SE·foreground parallax·지역 환경광·번개·빛줄기 설정 | 이 숫자는 **현 main 관측값**. 시작 룩 비교 기준으로 보존하되 반경·위치는 새 scene scale/anchor로 재조정하는 별도 시각 작업. 기존 props ID/nth/고정 shaft 좌표를 새 맵으로 복사하지 않음 |
| `native_map_look.gd:20–21,547–559` / `scripts/maplook/` | spawn_hole_fx만 main 실재. toxic_surface/actor_contact_shadows/ground_mist는 이름만 있고 없으면 skip | WORK_BOARD MAPLOOK-TOXIC/SHADOW/MIST는 PC Codex 큐 대기. 완성으로 집계0. 기존 담당 제출 회수·인수 후 새 anchor 계약에 연결; 별도 Mac 중복 구현0 |
| `world.gd:954–982,3194–3231,3269,3306` | map.json·start/exit, 8000 경계·200 stride·T40·hill/prop ellipse·16 간격 LOS·4점 can_move·player flow 고정 | 기존 호출부의 **의미**를 보존하는 provider facade가 필요. 새 geometry를 옛 map.json처럼 위장하거나 검사를 삭제하지 않음. 실제 반경/샘플·LOS·sweep 의미는 전투 코드 담당과 확정 |
| `enemy_factory.gd:40–66,168–176`; `native_spawn_hole_system.gd:30 이후`; `native_regions.gd:82–105` | factory는 frozen record/특정 source guard, 굴은 기존 배치 상수, 지역은 T40·맵180 이상·중점 분할/고정 사이트 결합 | DEMO11-03의 spawn/지역/분모 계약으로 분리할 **공용 통합 요청**. source guard 단순 삭제·가짜 record/actor 대체 금지. 기존 전투/RNG/굴·처치 owner 재사용 |

## 4. 1-1의 완성할 화면

**한 문장:** 죽은 숲의 거대한 몸속을 걷는 느낌. 넓고 낮은 피부빛 전투면을 부패한 목질 덩어리가 둘러싸고, 노출 조직·동맥·눈·고치가 강하게 살아 있음을 드러낸다. 국소광으로 깊이를 만들되 적·탄·Q/E 경고색과 대비를 분리한다. PoE2·No Rest for the Wicked는 깊이·재질·국소광·생동감의 목표이며 타 작품의 레이아웃/자산 복제나 동급 품질 달성 선언이 아니다.

| 키 | 아트 디렉션 — D01/D02 사용자 확정 반영, 개별 색값/실제 화면은 눈 검수 전 |
|---|---|
| 기저색 | 피부/지면 `#353032`·`#3d3535` 저채도 회갈색/회자주, 목질 `#17171d`, 뒤 안개 `#20252f`. 완전 검정으로 외곽 접합 결함을 숨기지 않음 |
| 강조색 | 조직 검붉은 `#6b252d`, 심장 균열 `#a33c36`, 독액 탁한 황록 `#7b8146`, 캠프 불빛 `#e28b48`. 초록 네온/주황 용암 숲 금지. HUD 뼈색 `#dfd6c2`·Q/E/적 경고색보다 배경 대비를 낮춤 |
| 키/보조광 | NW 위쪽에서 SE로 약한 차가운 방향감, 밑동 접지+국소 투사 그림자. 플레이어 따뜻한 소범위, 캠프 주황·제단 둔한 적색·독액 낮은 황록. 광원은 주변 재질에 닿는 범위가 읽혀야 하며 화면 전체 glow 금지 |
| 깊이 | BACK(안개 속 암부 mass)→MID(굵기/기울기가 다른 고목)→FRONT(불규칙 뿌리턱)→GROUND(젖은 번짐·접지). 외곽 높은 수관/근경과 낮은 중앙의 대비. 밑동 기준 y정렬, 필요한 수관만 앞뒤 분할/가림 페이드 |
| 생동감 | 밑동 고정 가지, **강하게 드러나는 노출 조직·동맥 맥동·눈·고치의 호흡**, 독액 수면/증기, 드문 불씨. 모든 식생이 한 주기로 흔들리거나 바닥 전체가 출렁이지 않음. 장식 RNG는 전투 RNG와 별도이며 판정·충돌·처치 수를 바꾸지 않음 |
| 중심/고딕 | **D01 확정: 북중부의 갈라진 시체나무 + 낮은 심장 제단 한 묶음**이 주 랜드마크다. 골재/흑철/악마 문양은 관문·제단에 집중. 중앙에 거대 뿌리 섬을 세우지 않음. 시체나무와 싸움 공간의 폭을 실제 화면으로 먼저 승인 |

### 4.1 레이아웃: 남쪽 기상 → 두 갈래 순환 → 북쪽 보스문

전체 연결 그래프는 `기상터→초기 학습 공터→넓은 중심 전투면↔서측/동측 고리→북중부 랜드마크 앞마당→북쪽 접근/보스문`이다. 좌우 고리는 서로 다시 연결되어 지역 순회/복귀가 가능하다. 남북 방향은 빛·목질 결·랜드마크로 알려주고, 국소 진행은 NW/E/NE/W로 변화한다. 작은 방/좁은 목 반복·단일 S자·완전 좌우대칭을 만들지 않는다.

| 카메라 장면 / 역할 | 공간·외곽·차별 요소 | 게임 지역과의 관계 |
|---|---|---|
| 01 START / 기상터 | 6시, 뒤쪽도 나무 mass와 바닥이 이어짐. 시야 앞은 낮고 넓게, 첫 적/학습 표식 가림0. 캠프 따뜻한 광원 | 남측 지역 내부 안전 anchor. 학습 중 스폰 제한은 코드 owner 정책 |
| 02 EARLY / 부러진 줄기 옆 | 한쪽 큰 누운 고목, 반대쪽은 낮은 피부 지면. 열린 전투면으로 확장 | 남서/남동 간 이동 방향을 자연스럽게 노출 |
| 03 MAIN ARENA / 중앙 전투면 | 가장 넓고 낮은 면. 얕은 동맥·얼룩만, 큰 세로 구조물0. 2방향 이상 회피·재진입 | 4지역 경계가 만나도 카운팅을 중복시키지 않음 |
| 04 SIDE LEFT / 마른 심재 고리 | 높은 갈라진 고목 단면과 건조한 접합, 비스듬한 시선/폭 변화 | 서쪽 2지역을 잇는 고리·필드보스/굴 anchor 후보 |
| 05 SIDE RIGHT / 독액 고리 | 낮은 수면/둔한 황록 반사·앞턱, 서측과 최소 두 요소(높이/색/폭)가 다름 | 동쪽 2지역 고리. 장식 독액과 실제 hazard를 다른 ID로 명시 |
| 06 LANDMARK / 심장 제단 앞 | 주 시체나무 한 덩어리가 중심을 잡되 앞 전투면은 넓음. 재질/빛의 초점 하나 | 북측 지역 landmark, 보스 출현/클리어 수식은 코드 소유 |
| 07 LATE / 북쪽 그늘 | 길 폭·빛 대비를 낮춰 압박 후 다시 확장. 전경 실루엣이 플레이어를 계속 가리지 않음 | 북서↔북동 연결, 막힌 일방향 통로 없음 |
| 08 EXIT / 보스문 | 12시, 재질/문틀·수관으로 프레이밍. 진입·복귀 위치와 보스 아레나 로딩 경계가 명확 | gate와 arena는 별도 역할, 1-1 demo 종료 뒤 1-2 자동 진입0 |

**스케일 제안:** 1920×1080 내부 viewport와 저작 기준 줌에서 보이는 월드 폭/높이를 W/H로 정의한다(창1280×720은 내부 viewport와 구별). W/H는 저작 시 world 단위로 확정·컴파일하며, 창 크기/기기/실행 중 줌 변경으로 geometry·anchor·처치 지역을 다시 생성하지 않는다. 첫 blockout 경계는 약 `4W × 6H`를 상한 가이드로 그리되 고정 직사각 지형으로 채우지 않는다. 일반 전투면의 장애물 없는 단축은 ≥0.9W, 주 전투면 ≥1.2W, 이동 연결의 유효 폭은 ≥0.35W를 시작 목표로 한다. 반드시 실제 가장 큰 적 반경·이동/돌진·회피 궤적의 swept clearance로 재검수하며 기존 플레이어 수치를 공간에 맞춰 바꾸지 않는다. 필드 치수/총 이동시간은 MAP11-07의 플레이 blockout에서 확정(현재 미실측), 8000px나200타일을 맞추기 위해 늘리지 않는다.

## 5. 제작 로직·도구·Godot 구조

**권장 방식은 손설계 그래프 + 모듈 조립 + 바닥 페인팅의 혼합**이다. Godot 2D 에디터에서 전체 silhouette/공간·anchor를 손으로 저작하고, StageRecipe Resource로 검증/컴파일한다. 반복 바닥만 내부 TileMapLayer/mesh를 선택적으로 사용하며, 타일이 디자인을 지배하지 않는다. 매 run 랜덤 방 생성·웹 map exporter 수리는 제외한다. 국소 장식 seed는 기록하고 gameplay anchor/geometry에 무작위 이동을 적용하지 않는다.

| 순서 | 입력→처리→산출 / 저장할 제작 데이터 |
|---|---|
| 저작 | StageRecipe(장면 그래프·폴리곤·모듈transform·명명 anchor·지역4개·look profile·asset IDs) + AssetCatalog(pivot/실크기/콜리전 별도/조명·motion socket/폐기 상태). 월드 좌표는 Godot 2D local→단일 world transform; Y아래+, 각도 rad. 이미지 px/타일/월드 단위 암묵 변환0 |
| geometry 컴파일 | 동일 저작 폴리곤에서 walkable/solid/LOS blocker/trigger 영역과 파생 spatial index·flow grid를 생성. 장식 sprite 알파에서 자동 충돌을 추론하지 않음. 그림과 collider의 밑동을 editor overlay로 비교. grid는 내부 캐시이며 provider에 타일 배치를 요구하지 않음 |
| 환경 조립 | LARGE silhouettes→MEDIUM 연결→GROUND 접합을 한 전체 마스터 좌표계로 편집. Krita 등 레이어 편집기는 권장 도구이며 설치 여부 미확인. 정적인 큰 외곽/오염은 **새 제작물**로 오프라인 합성, Godot는 가시+인접 청크만 로드. 기존 웹 production_finish 청크 반입0 |
| 청크/실시간 분리 | 신규 제안 core1024 + 각 변8px bleed(1040²), 동일 master에서 crop/월드 UV 정렬/경계 seam 확인. 움직이는 가지·독액·수관·trigger·상호작용·문·아레나는 runtime 씬. 불변 그림에 들어간 요소를 runtime에서 중복으로 덧그리지 않음 |
| 검증/배포 | duplicate ID·참조 누락·밖 anchor·끊긴 route·지역 중복/누락·콜리전 침범·예산 초과를 build 오류로 보고. content 검증과 실제 consumer 바인딩 검증을 분리. 실패한 provider를 READY/원점 fallback/가짜 actor로 대체0. 완료한 recipe/asset manifest/파생물 hash를 묶어 stage revision 발행 |

제안 씬 경로는 새 소유 `godot/scenes/maps/map11/`, Resource/컴파일러는 `godot/scripts/maps/`, 데이터는 `godot/data/maps/map11/`, 새 자산은 `godot/assets/maps/map11/`이다. 기존 프로젝트 디렉터리 규칙과 충돌하면 MAP11-02에서 경로만 확정한다. 아래는 설계 구조이며 이미 존재하는 씬이 아니다.

```text
Map11Root (Node2D, scene_id/revision)
  Geometry      (저작 polygons → collider/LOS/nav 파생 캐시)
  Ground        (바닥·접합·가시 정적 청크)
  Environment   (BACK / MID / FRONT / 밑동 기준 Y-sort)
  Anchors       (Marker2D + 안정 ID/역할; physics trigger는 별도)
  Look          (기존 MAP-LOOK adapter / 광원·occluder·motion)
  ArenaRoot     (별도 geometry/anchor context, 필요시 load)
  DebugOverlay  (editor/dev 전용, 제품 기본 OFF)
```

실제 적·플레이어·탄·굴 registry와 처치 writer는 기존 게임 owner가 관리한다. 이 씬은 그 actor를 새로 소유하거나 별도 G/State/세이브를 만들지 않는다. 현재 `_style_props`는 world 직속/texture prefix 검사이므로 이 씬을 추가하는 것만으로 룩이 적용되지 않는다. MAP11-03/12에서 명시 handles 바인딩을 인수해야 한다.

## 6. 에셋 목록·제작 경로

| 세트 / 첫 필요량(견적용 제안) | 재사용 후보·신규 제작 | 산출/눈 검수 |
|---|---|---|
| 바닥 재질3 + 접합4 | 회자주 피부/젖은 피부/괴사 목질, 뿌리 번짐·독액 얼룩. 기존 native 재질을 먼저 1x 재검수; 부족분만 MagicLight→레이어 편집 | 저대비 타일/패치 RGBA, world scale, 반복/밝기 차/직선 seam0. 옛 master 전체 복사0 |
| 대형 외곽3실루엣 + 중형 연결6 | 굵은 빈 고목·갈라진 경사 줄기·누운 고목, root shoulder/수피 접합. 기존 `godot/assets/map/props/rotforest_tree_01..04.png`는 후보 | 잘린 가장자리/동일 나무 연속 반복/구름 모양 mass 금지. BACK/MID/FRONT 분리, 밑동 pivot·가림·접지/occluder socket |
| 주 랜드마크1묶음 | 실재 `props/prop_corpsetree.png`·`prop_altar.png` 후보, 새 조립 실루엣이 약하면 MagicLight proof 후 교체 | 나무/저단 제단/접합·심장빛을 분리. 해부학적 연결과 목질 섬유가 읽힘. 첫 카메라 승인 전 전체 세트 양산0 |
| 보조 오브젝트3역할 | 실재 `props/prop_camp.png`·`prop_pool.png`·`prop_cocoon.png` 및 관문 후보 확인 | camp/독액/고치 역할·정확한밑동·motion mask. 원화 바닥/구운 그림자 제거, runtime 접지와 이중그림자0 |
| 움직임 mask3종 + 얇은 안개/국소 빛 | 기존 sway/shadow/shaft·spawn_hole_fx 재사용. 독액/캐릭터 그림자/안개는 기존 PC 큐 인수 후 socket 연결 | 가지 밑동 고정, 호흡 국소, 광원과 장식 분리. 잔점으로 생동감 위장0. 입자는 나중 별도 밀도/전투 가독성 검수 |
| gate/arena 연결 자산1세트 | 기존 관문/보스 자산 재사용 후보, 새 gate frame/ground transition만 필요 시 제작 | 통과 가능 폭·trigger/막힘 상태와 시각 일치. 보스 외형·패턴·Q/E 제작으로 범위 확대0 |

**제작 경로:** 확정 스타일 원화 1장→동일 세트 레퍼런스→MagicLight Toolbox Image의 Seedream 우선 proof→무배경/무그림자 단일 오브젝트→배경색 제거/알파·pivot·mask 정리→어두운 실제 바닥+HUD 1x 합성→같은 카메라에서 검수→등록. `MAP_OBJECT_SEEDREAM_PIPELINE`의 모델/해상도/포인트는 2026-09-30 이력이며 실행 시 실제 서비스 표시·비용을 재확인한다. 잔액 부족이 실제 확인된 때만 승인된 Higgsfield 경로로 전환한다. 이번 생성/지출0. 순회색 키잉이 목질을 뚫으면 피사체에 없는 배경색으로 재생성/마스크 보정하고 원본을 보존한다. 점·스펙클·디더·광택 점·회색 halo는 1x와 검정/피부색 배경 모두에서 탈락 기준이다. 원화/정리RGBA/마스크/manifest/프롬프트·도구·시각 판정·hash를 함께 남긴다. 폐기 id tombstone/m_tomb/m_root 계열과 후속 폐기 문서 항목은 새 catalog에서 거부한다.

## 7. 코드에 제공할 StageProvider 계약안

이 표의 API 이름/형식은 **신규 제안**, 현 main에 이미 바인딩된 API가 아니다. DEMO11-03 및 현재 World/factory/P3-002/003·MAP-LOOK 소유자가 소비자와 함께 서명해야 한다. 맵은 장소·질의 서비스를, 게임 코드는 전투·스폰 정책/순서·진행/처치를 소유한다.

| 서비스 | 입력 → 출력/규약 | 실패·소유 경계 |
|---|---|---|
| `describe()` / `bind_context(...)` | stage_id/map_instance_id/revision/world transform/bounds/capabilities/정적 저작 hash. `content_valid`와 실제 owner 참조 연결 후 `runtime_ready`를 별도 반환 | geometry·필수anchor·필수callback·consumer revision 불일치면 NOT_READY + reason. node 해제/arena 교체 후 stale handle 거부. 실제 서비스 없이 READY 금지 |
| `anchor(id, role)` / `anchors(role)` | player_start/recovery/checkpoint/enemy_spawn/hole/interaction/field_boss/gate/arena_entry/arena_return/boss_center 등 안정 ID→world position+facing+region_id+유효영역/태그 | 위치를 enemy 종류로 추정0. 누락은 NOT_FOUND, null/원점/최근접 임의 대체0. 보행 가능한 반경까지 검증. art asset ID와 gameplay ID 분리 |
| `spawn_sites(kind, request)` | 소유 코드가 고른 etype/반경/요청 개수/기존 RNG 또는 명시 샘플을 주면 합법 위치 후보와 provenance/site ID 반환. 굴은 hole_id/size/room/site binding을 제공 | etype/속성/정예 확률·AI·보상·시드 draw 순서/스폰 cap은 기존 owner. 초기16개·원본고정14굴/168을 새 배치 요구로 복사0. 가짜 crawler 대체0. 실제 spawn은 factory가 한 번만 등록 |
| `is_blocked(point, mask)` / `can_move(center,r,mask)` / `sweep_circle(from,to,r,mask)` | solid/이동·벽·hazard 의미를 구분, 동일 저작 geometry revision 사용. 경계밖 blocked. sweep은 hit/정규화시점/법선·최종허용위치 | 현재 4점 canMv 의미·연속 sweep·공격별 path predicate를 전투 owner와 명시 매핑. 자동 물리 sweep으로 기존 공격 수치/판정을 암묵 변경0. 장식 흔들림으로 collider 이동0 |
| `line_of_sight(from,to,mask)` / `flow_direction(pos,target,agent)` | LOS 전용 blocker, agent 반경/geometry+target revision별 파생 flow 캐시. 도달 불가→reachable=false/이유, 방향 없음을 목표 직선 추적으로 위장0 | 기존 World의 LOS/flow 호출과 소비 순서 유지. 이전 맵/이전 target 캐시 재사용0. geometry 변경 commit은 tick 사이 한 번, tick 중 질의는 같은 revision |
| `region_at(point)` / `region_sites()` | **게임 지역4개 ID0..3 유지 권장**. 저작 폴리곤·경계 tie-break(작은ID 우선)·반열림 외곽 규칙으로 유일 귀속. 8시각장면 ID는 별도. NW/NE/SW/SE 명칭과 field_boss/gate 소유 매핑 제공 | 장식 cell 수를 처치 분모로 쓰지 않음. scene 위치/T40/맵180 임계에 지역 enable을 의존시키지 않는 통합 필요. 네 지역 모두 도달 가능, 분모0 처리도 기존 코드 정책 |
| `spawn_budget_manifest()` | owner가 승인한 각 hole/site의 **예정 총량·region_id·spawn_group_id·revision**을 1회 제공. 동적 추가/취소는 owner 이벤트 receipt로 변경. actor→origin spawn_group의 귀속 ID를 유지 | `_totalSpawned`/지역 total/kills·kill ID중복 방지는 P3 owner 단일 writer. 지역 사이 이동해도 카운팅 재귀속0. MAP 쪽에서 G.kills/cleared/_fbDone 쓰기0. 80%/문지기 보너스/앵글러 필수 조건 변경0 |
| `arena_descriptor(id)` / `transition_sites(id)` | 별도 arena bounds/geometry revision/player_entry/boss_center/safe_return/gate_trigger 영역/현재map↔arena context. boss/player 유효반경 포함 | 맵은 좌표와 기하만 제공. gate-open·앵글러 `_fbDone`·보스 죽음/입장/복귀·demo 종료는 게임 owner. 정상1-1은 si0 일반 다크드루이드, si3 피날레/다음stage 자동 생성0. 전환 준비 실패 시 기존 context 유지 |
| `look_bindings()` | 명시 sprite/render handles·foot pivot·motion/occluder sockets·semantic light IDs·환경 profile·camera bounds/안전가림영역 | 기존 `m_c1camp`/nth/고정shafts와직속children 탐색을 consumer adapter에서 치환. 룩이 gameplay bounds/regions/충돌을 쓰거나 변경0. 환경광마스크+CanvasModulate 이중 암전0 |

**필수 인수 사례:** spawn/hole/fieldboss/interaction/출구가 모두 실제 위치에 있고 적 반경으로 합법; 한 stage instance의 region 총량과 spawn 예정/실제/처치 ledger 정합; 동일 kill 이벤트 중복 반영0; 네 지역 순회→기존 앵글러/문지기 조건 충족→gate→arena→결과/복귀가 자연 경로로 성립; arena 실패/재시도 시 원맵 anchor 보존. 원본의 곰치·화마귀 등 정상 데모 도달 전투도 이름이 맵 소품처럼 보인다는 이유로 삭제하지 않는다. room/레어 별도 분기 채택은 DEMO11 정책 결정 뒤 별도 범위로 두며 이 설계에서 활성화0. 전투 수치/원본 정책 검사는 유지하고 옛 **맵 provenance** 기대값만 새 stage 계약 검사로 명시 교체한다(검사 단순 삭제0).

## 8. 재사용과 stage별 차이

| 1-1에서 확정 후 공통으로 동결 | 1-2 / 1-3에서 교체할 StageRecipe 내용 |
|---|---|
| 좌표/scene revision/provider ABI·asset pivot/socket·compiler/검증기·청크 스트리밍·geometry/LOS/flow 캐시·스폰/region ledger adapter·camera/가림·기존 MAP-LOOK 바인딩·성능/눈검수 gate | geometry/공간 그래프·전투 여백·landmark silhouette·모듈transform·light/색/안개 profile·anchor 위치와 합법영역·정책이 승인한 굴/site 구성 |
| 4지역/게임 정책과 시각장면 분리, 한 owner writer, 실패 시 NOT_READY, 같은 gameplay 값과 RNG 순서 | 1-2 권장: 뒤틀린 빈 고목·기울기/깊이 강화, 전투 고리 보존. 1-3 권장: 눈달린 큰 버섯 군락·갓 아래 광원·3개의 구별되는 시각 mass, 사이 전투면 보존. 테마는 BIBLE 참고, 옛 좌표/비스타/분지/배치는 복제0 |

1-1은 테스트용 임시 맵에서 멈추지 않는다. 아래 MAP11-18의 디자인+자연 플레이+양 플랫폼 성능 인수까지 끝나야 MAP12-01(1-2 recipe/장면 master)을 착수하고, 1-2를 같은 gate로 인수한 뒤 MAP13-01(1-3)을 착수한다. 공통 로직 버그는 공통 단일 소유 파일에서 고치고 stage별 복제 패치로 갈라지지 않는다. 게임 콘텐츠/보스 확장은 맵 재사용의 자동 승인 범위가 아니다.

## 9. 성능 예산과 측정 — D04 목표 확정, 실측 아님

| 항목 | 제안 예산 / 측정 조건 |
|---|---|
| 제품 목표 | **D04 확정: 고사양 기준 1920×1080·120 FPS 목표(8.33ms/frame), 60 FPS(16.67ms)는 하한**. 맵 연출 예산은120fps 기준으로 산정한다. 창 크기와 render 해상도·기준 줌, Mac/Windows GPU·OS·Godot 버전·renderer·전원 상태를 기록해 따로 측정. 구체 고사양 시험기/최소지원기기는 아직 미지정이며 FPS 목표 자체는 결정대기가 아님 |
| 프레임 시간 | warm 후 60초 이동 + 60초 실제 밀집 전투의 고사양 각 p95≤8.33ms·p99≤12.5ms, warm 구간1초 이동창 FPS 최저≥60을 측정 기준안으로 둔다. **120fps 기준 배분안: new-map 추가 CPU≤1.25ms/frame, 환경 GPU≤3ms**(새 예산/미실측, 사용자 확정 FPS에서 파생한 검증안); CPU/GPU 파이프라인 수치를 합산해 가짜 frame time으로 보고하지 않음. cold 첫 로딩/첫광원 업로드 hitch 별도 기록 |
| 광원/그림자 | 카메라+여유영역 기준 환경 PointLight 활성≤8, 그중 shadow≤2(플레이어+주요광원). VFX는 기존 limit18을 상한으로 재사용하되 동시 총량≤24 목표로 우선순위/cull. 수량 상한도8.33ms/120fps 예산 안에서만 허용하며 초과 시 cull/LOD로 조정한다. 모든 나무 eye를 shadow light로 만들지 않음. Low는 환경4/shadow0에서 전투/길찾기 가독성 유지 |
| 텍스처/청크 | 새 맵 환경 resident texture≤256MiB 목표(원본PNG 압축 파일 크기와 구별). core1024/bleed8 청크는 가시+이동방향 선행분을 우선하여≤16상주를 시작 예산으로, 현재 camera/zoom에서 부족하면 zoom아웃·최대가시수부터 재측정. 큰맵 전체 한 장 상주0, runtime 픽셀 readback/매frame 재bake0 |
| motion/투명층 | 카메라 내 활성 motion module≤24, 장식 입자≤96, full-screen 안개 합성≤1층 목표. 보이지 않는 motion/라이트/안개 pause/cull, per-frame 대량 node 생성0. 동일 텍스처/material 공유, 비용 높은 알파 겹침을 profiler에서 측정 |
| 전투 부하 | 기존 정상 소환/밀집 경로를 쓰고 actor/탄/드롭 개수·캐릭터/스킬·seed·위치 기록. 임의100적 fixture를 자연 플레이 성능으로 바꾸어 부르지 않음. 맵low/full A/B 비교는 같은 전투와 동일카메라로 1회씩, 실패/변경 때만 재측정 |
| 초과 시 순서 | 비가시 FX→shadow 수→광원 범위→투명 안개/근경 overdraw→texture LOD/청크; 그 다음 저작 mass 조정. 적/탄/정예/피해/스폰/게임 속도·Q/E를 줄여 예산을 맞추지 않음 |

## 10. 눈 검수와 gate

| Gate | 반드시 제출할 증거 / 탈락 조건 |
|---|---|
| G1 전체 master | 전체 silhouette·주/보조 landmark·주동선/두고리·8카메라·4게임지역/anchor overlay. 인접 장면은 폭/방향/밀도/재질 등 최소2개 차이. 고정 직사각·S길·똑같은방 반복이면 FAIL |
| G2 LARGE→G3 MEDIUM→G4 GROUND | 각 단계 같은8시점 전후. 좌/우/북/남 외곽mass 연속·빈검정hole0·중형 연결·뿌리턱/바닥 오염·접지. 에셋 섬/스티커·같은실루엣 도배·사각 seam이면 RETOUCH/FAIL. 작은 소품으로 가리기 금지 |
| G5 PLAYABLE | 실제 player/다수적/탄/Q/E/VFX/loot/숫자와 최소8시점. 선행조건이 된 실제 공격/기술로 자연 전투; 소비자가 미연결이면 해당 검수 BLOCKED이지 fixture PASS 아님. 전경 가림 시 player/적 윤곽/텔레그래프 복원, 큰 공격 판정과 시각 경계 일치 |
| G6 LANDMARK→G7 DETAIL | primary/secondary/tertiary 차이, 주인공 재질·심장빛 집중, 나머지 화면 호흡. **D02 재질 검수 강화:** 노출 조직·동맥·눈·고치가1x 정지/동작에서 강하게 읽히고 피부/목질 접합·젖은 하이라이트·눈/고치 형태가 구분되어야 한다. 실제 적·탄·Q/E 전조를 겹쳐 경고색/명도/실루엣 대비 충돌이 없는지 별도 크롭으로 판정한다. AI 점·halo·임의 scale변형·발광 원판·화면 전체 맥동0. 1x에서 분위기/형태가 읽히지 않으면 원화 생성 수와 무관하게 RETOUCH |
| G8 FINAL CAMERA + TECH | 1600×900 또는1920×1080 실제 게임 전체8장+접합/캐릭터 가림1x 크롭. 짧은 이동·motion 영상, full-map 한장, 실제 gate→arena, p95/p99/메모리/광원수. 정지 원화 합성을 runtime으로 보고0. 경로·충돌·진행/ledger·성능 검사와 시각 판정 모두 필요 |

**최종 인수 질문:** HUD 옆에서 같은 Hell Gothic 게임인가? 살아 있는 썩은 숲이 3초 안에 읽히는가? 피부/죽은 목질/동맥이 연결되는가? 전투 여백과 부분 빛·깊이가 느껴지는가? 캐릭터·적·탄·Q/E·드롭이 각각 읽히는가? 8카메라 중 한 곳이라도 반복/검정공동/접합 실패면 수정한다. 사용자 눈 승인을 받아야 1-1 전체 디자인 완료로 닫는다. 기술 PASS와 VISUAL PASS를 합치지 않는다.

## 11. MAP11 구현 단위 — 배정안이며 자동 착수 지시 아님

크기 S=계약/작은 독립 산출, M=하나의 실제 흐름/한 제작 gate, L=여러 gate/owner를 포함하여 착수 전 M으로 분할해야 하는 작업. 기본 설계는 L 한 덩어리 대신 아래 S/M으로 쪼갠다. Mac/PC는 **기존 담당을 재사용할 제안**, 새 팀 생성·메시지 발송0. 공용 변경은 명시 통합 오더에서만 실행한다.

| ID / 크기 | 담당·소유 / 앞 의존 | 구현 지시·인수할 실제 산출 |
|---|---|---|
| MAP11-01 / M | **Mac 맵·아트 + 사용자 D05**, 보스 담당과 병행 / 최신 보충 방침 | **1-1 보스룸 디자인이 첫 단위.** 새 `scenes/maps/map11/arena_preview.tscn` 독립 blockout와 보스룸 master/조명·재질key/입장→등장→전투→clear storyboard. R2200 시작값·무기둥 중앙·회피고리·entry/boss/exit/return Marker·실제보스bbox/전조 overlay·카메라4시점 이상(등장/근접/벽가/클리어) 제출. 기존 자산 우선, 신규생성은D03범위. BC범위·탄막공간 체크리스트로 아레나 크기/디자인 인수. 공용/State/save0·보스전live완료주장0 |
| MAP11-02 / M | Mac 맵 코드 + DEMO11-03 기존 담당 / 01의명명anchor | **arena 우선** StageRecipe/provider 최소 schema·실geometry/반경/LOS/query·content_valid/NOT_READY·revision adapter. duplicate/outside/sweep/불가도달 검증. boss extent→기존 기술식(mw/mh/T) 매핑 합의. 전체필드·범용툴완성대기0, 이후필드에서동일ABI재사용 |
| MAP11-03 / M | **PC Claude MAP-LOOK/camera 기존 담당** + Mac / 01·02 | 보스룸 render handles·림/접지/부분광·시점/줌·HUD여백·역포인터·arena combat/render bounds 분리. 실제몸체·탄막/장판의1x카메라 board, 이중암전/void/전경가림0. Main/camera 공용은명시scope만. 등장시간/AI/피격수정0 |
| MAP11-04 / M별 기존단위 | **DEMO11-02·34/35/36 기존 보스·탄·보호 owner** / 02와병행 | 새 보스커널 작업이 아님. 승인BC08/09체인인수·BC01~10 실제assembler/actor·탄registry/expiry·보호피해/패링연결을각기존ID로진행. 남은정상23기술도owner범위판정. 실제readback/자연전투와공간경계fixture구분. 이작업전체를한M으로묶거나중복WIP반입0 |
| MAP11-05 / M | **DEMO11-37 기존 보스/지역 담당** + Mac 맵 / 02·04 | 실제지역/앵글러/gate→전환준비→등장→boss death/revive유예→reward/clearTime/랭크. field preview와정상경로구분, 기존pending provider면BLOCKED. 초반필드는현재가용서비스로연결해보스룸진행, 최종검수는새필드14/15와합류. 필드backup/return·실패rollback확인 |
| MAP11-06 / S | **DEMO11-38 기존 UI 담당** + Mac / 05 | stageClear 다음버튼→demoEnd→wishlist/로비 실제caller 인수. stage1생성0·중복clear/보상0·입력/FX/BGM잔류0·저장기존owner인계. 보스룸디자인과별개로최종제품완료까지담당유지 |
| MAP11-07 / M | Mac 맵 담당 + 사용자 D01/D02 / **01 보스룸 master 시각승인 후**, 코드04~06과병행가능 | 그다음 1-1 **필드** 전체mass 윤곽·4지역·8시점·두고리·명명anchor 저작. 실제기본이동으로치수/폭검수, G1 field master/스케일/주랜드마크승인. 보스room 먼저정한gate/approach/return을받아제작 |
| MAP11-08 / M | 기존 아트 담당(Mac) + 사용자 D03 / 07 | 필드 스타일key/대표외곽1·바닥접합1 proof. 기존RGBA audit→필요MagicLight만. 먼저승인한보스룸재질/광원과연속성1x비교, 전체맵생성/양산0 |
| MAP11-09 / M | Mac 맵 담당 / 07·08 | LEFT/RIGHT/TOP/START BACK/MID/FRONT 대형외곽조립. 연속숲mass/반복숨김, G2 8시점. 중앙소품먼저0 |
| MAP11-10 / M | Mac 맵·아트 / 09 | 중형root shoulder/수피→피부접합·그림자/오염·새master crop/bleed streaming. G3/G4 seam/바닥가독성 인수, 웹청크반입0 |
| MAP11-11 / M | Mac 맵 코드·DEMO11-03 / 02·07확정geometry | arena에서쓰던compiler/provider를필드로재사용. static collider/LOS/flow·4지역/모든anchor합법·굴/스폰예정분모/kill귀속. World/factory/P3 공용은기존owner명시scope, 원본수식/보호검사단순삭제0 |
| MAP11-12 / M | PC Claude MAP-LOOK 기존 담당 / 03·10·11 | 보스룸에서인수한명시handles/anchor adapter로필드light/sway/shadow/shaft·camera bounds·예산cull/가림 연결. 기존루틴복제0, G5/G6 부분광/깊이실창 |
| MAP11-13 / M | PC Codex MAPLOOK-TOXIC/SHADOW/MIST 기존 담당 / 12·해당큐인수 | 기존3모듈완료분만회수·arena/field context에연결. 미제출은미구현, Mac중복구현0. motion/pause/cull실창증거 |
| MAP11-14 / M | Mac 맵·기존gate/boss 담당 / 05·07·10~13 | 필드랜드마크/관문/arena접합완성. 새필드자연앵글러·문지기→gate→기승인아레나→결과/재시도/복귀. 보스room확정디자인을필드편의를위해다시미루지않음. 새State/피해writer0 |
| MAP11-15 / M | Mac / 04~06·14 | 새필드~보스~종료 전체정상flow의전투가독성/처치분모/arena·pause/restart통합. 직접관련suite각1회·출력파일/실패줄·수치. 미연결기술/전투는BLOCKED, 강제pattern으로자연완료대체0 |
| MAP11-16 / M | Mac / 15 | 보스룸등장/근접/벽가/phase4탄막/클리어 + 필드8camera/1x크롭·영상·전체맵, 실제GPU성능/메모리/로드·§23. 실패화면만수정, 통과항목반복검사0 |
| MAP11-17 / M | 기존 PC 검수 담당 / 16 | 같은commit/recipe/profile/장면/부하로Windows시각·고사양1080p120fps목표/60fps하한·메모리·입력/해상도·데모종료교차확인. Mac실측으로PC PASS대체0 |
| MAP11-18 / S | **사용자 최종 화면 인수 + Mac 인수** / 16·17·D01~05 | 보스룸을포함한1-1분위기/테마/전체디자인·자연전투·DEMO11-37/38종료·양플랫폼성능인수. 공통revision동결, 승인후MAP12-01→그완료후MAP13-01. 미검수“완벽한데모”/“로직완성”선언0 |

## 12. 사용자 디자인 결정 — D01~D04 확정(2026-10-21), D05는 보스룸 검수 제안

| 결정 ID / 적용 시점 | 확정값 / D05 제안 | 적용·검수 경계 |
|---|---|---|
| D05 **보스룸 우선 시각키·공간** / MAP11-01 | 무기둥 원형근사 R2200 시작값·외곽생체숲/약한냉광+균열적색림·남입구/북clear exit | 형태는원본공격범위를수용한상태에서조정. 입장/근접/벽가/클리어4시점과body/탄막overlay로먼저선택. 최종크기는실제자연phase0~4검수후확정, 공격약화로조정0 |
| D01 **확정** / MAP11-07 G1 | **갈라진 시체나무 + 낮은 심장 제단 한 묶음, 북중부**(권장안 채택) | 랜드마크 대안 선택은 종료. 보스룸 최우선 뒤 필드에 반영하며 전투 여백·실제 화면은 별도 검수 |
| D02 **확정** / MAP11-01·08 | **강하게 드러냄** — 노출 조직·동맥·눈·고치를 더 강하게(이전 권장안 대신 사용자 선택) | 적·탄·Q/E 경고색과 대비 충돌0. 재질/접합·명도·색·실루엣의1x 정지/동작·전투 중첩 검수 강화. 표현 강도를 낮춰 권장안으로 되돌리지 않음 |
| D03 **확정** / MAP11-01·08 | **기존 RGBA 먼저 재검수 → 대표 바닥·외곽 proof만 생성 → 승인 후 부족분 MagicLight 생성**(권장안 채택) | proof 승인 전 전체 세트 양산0. 실제 잔액/표시비용·구체 제작량은 실행 시 확인. 이번 문서 갱신은 생성/지출0 |
| D04 **확정** / MAP11-16·17 | **고사양 기준1080p·120fps 목표, 60fps 하한 유지. 맵 연출 예산은120fps 기준** | 전체8.33ms/frame에서 배분·실측. 구체 시험기/최소지원 사양은 미지정, 120fps를 여유 목표로 내리지 않음. 실제 성능 달성은 미검수 |

## 13. MAP PRODUCTION REPORT — 이번 문서 작업

| 필드 | 상태 |
|---|---|
| STAGE / MASTER | CH1-1 **보스룸 우선→필드** 설계. 보스R2200초안·BC01~10/남은23기술공간·입장/등장/클리어/데모종료, 필드8장면/4게임지역. 새geometry/씬미구현 |
| OUTER MASS / LARGE / MEDIUM | 좌·우·북·남 4층 연속mass/3큰실루엣/접합 세트 계획. 제작·원화·비어있는hole 실측0 |
| GROUND / PLAYABLE | 피부/목질/동맥 전이·접지·전투여백과 provider 규약 제안. 실제충돌/동선/전투 검증 미실시 |
| LANDMARK | 보스실루엣/외곽생체숲 우선(D05); 필드시체나무+심장제단은그다음(D01/D02) |
| CAMERA QA | 보스등장/근접/벽가/탄막/클리어 우선, 그다음필드START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 모두향후인수조건. 현재 main 캡처0·새맵눈검수 미실시 |
| TECH QA | 문서링크/경로/수치출처·main실재모듈/변경경계 점검만. Godot/성능/자연플레이/에셋생성 실행0; runtime PASS 주장이아님 |
| FILES / GIT | 이 설계서 + CHANGELOG_SYNC 절만 지정staging/정상훅/자기branch push. main/코드/에셋/공용/저장0. 원격SHA/DONE확인뒤 자기worktree제거, deploy0 |
| VISUAL VERDICT / NEXT PASS | **RETOUCH — 설계 단계/실맵 미구현·눈검수 미실시, 현재main을눈으로판정한결과가아님.** 다음은명시배정시MAP11-01 **보스룸디자인**. Godot이식/DEMO11-34~38은기존owner병행, 그다음필드. 1-2/1-3 선착수0 |

원로그·근거 발췌·문서 감사·최종 SHA는 `~/exoduser-wt/_out/map11-plan/`와 `DONE.txt`에 보존한다. D01~D04는 2026-10-21 사용자 지시로 확정되었다. 구현 착수·proof 승인·D05 공간/화면 인수·실측 성능 달성은 이 문서의 갱신·push만으로 성립하지 않는다.


## 14. MAP11-17 — 조명 룩 패스 (2026-10-21)

이번 사용자 지시가 기존 §11의 같은 작업번호 배정보다 우선한다. **조명만 변경**, 기준 `codex/map11-15-20261021` / `1f797a8b71e5a1bd814e79be1a289b5e897a7aee`; 보류된 MAP11-16/16b의 바닥/나무/생성 에셋 반입0. 기준 tree에 이 설계서가 없어 `codex/map11-plan-20261021`의 원문을 복원하고 이 절을 추가했다(다른 branch 코드 병합0). 콘셉트는 죽은 숲의 거대한 몸속 / D02 강한 생체 + 가독성 / D04 120fps 유지. 원문 REVIEW_PENDING·미구현 표기는 당시 설계 이력이다.

### 14.1 실제 표시 계약

| id / 적용 위치 | 현행값 / 공식 | 경계 |
|---|---|---|
| MAP11Ambient / product_lighting | field RGB(.38,.43,.52); boss RGB(.49,.34,.36); `approach=1`(arena) 또는 `smoothstep(-2600,-4100,player.y)`; 실제 ambient=`field.lerp(boss,approach*.75)` | 전용 CanvasModulate 1개. 일반 NativeMapLook boot은 `world.map11_provider` 존재 시 설치 생략, ambient/player 중복0. 별도 Main/World/전투 writer0 |
| NativeMapLook 재사용 | `_make_light`, `_make_radial_texture`, `_silhouette_material` 상속. PointLight2D ADD, height=radius×.8, full z range, shadow_enabled=false | 새 아트/노멀맵/텍스처 교체0. 법선·흔들림 시스템 재작성0; 기존 field forest material 유지 |
| player key | color(.78,.85,1), r420, energy.48, position=player+(0,-36) | 항상1등; 약한 냉광으로 실루엣 분리, 시뮬레이션 불변 |
| 광원 예산/cull | authored8 + player1; 활성 local 최대4 + player1=5. camera center±viewport/zoom/2, margin100과 radius AABB 교차, active_space 일치 | 고정8행 scalar 루프; 틱 목록 API/get_method_list/ResourceLoader0. pulse=`energy×(1+amplitude×sin(time×2.1+phase))`, phase=x×.0137+y×.0091 |
| 방사 감쇠 | 공유256² GradientTexture2D / offset[0,.35,.7,1], alpha[1,.62,.2,0]; texture_scale=radius×2/256 | NativeMapLook 기존 helper. 빛 사이 ambient 어둠 유지 |
| 전면 wash 제거 | MAP11에서 NativeLightmap·NativeFog2D·NativeEnvLight·NativeVignette 숨김; 기존 color filter contrast1.05/brightness.97 유지 | NativeScreenLighting 소스 변경0; 제품수명 동안만. fog_pass가 종료 시 원 material 복원 |
| 외곽 안개 | 기존2048² FBM cache1lookup. p=view_origin+UV×view_size; field side=smoothstep(1800,3000,abs(x)), north=smoothstep(3900,4700,-y)×(1−smoothstep(500,1000,abs(x))); depth=max(side,north). arena depth=smoothstep(1650,2450,length(p−arena_origin)) | alpha=depth×(.045+.065×FBM), RGB(.12,.17,.23), FBM uv=p/11000+(TIME×.0015,0). 중앙/내부depth0, 외곽으로만 최대.11; 화면UV 고정 안개 아님 |
| 나무 깊이 | BACK fog.48 / MID.13 / FRONT0 유지; fog target RGB(.065,.083,.105), luminance mix.38(이전 회색 .145/.153/.15·.58 대체) | field_forest_depth만 색보정. 원래 west/east reflection·instance tint·alpha·geometry 유지 |
| 약한 vignette | arena_vignette edge=`smoothstep(.25,.76,length((SCREEN_UV−.5)×(1.15,1)))`, RGB(.012,.008,.017), alpha=edge×.16 | 제품 HUD 아래 layer4 1장. 같은 shader를 쓰는 독립 arena preview도 .68→.16; 프리뷰 시각 검수는 별도 |
| 접지 AO | 공유128² radial offsets[0,.28,.65,1]/alpha[1,.85,.30,0]. field 폭=clamp(sprite_width×.52,80,500), 높이=clamp(width×.095,24,100), alpha.78, z−2990. arena rim 폭clamp(width×.48,90,480)/높이clamp(width×.085,24,96), alpha.8/z−440 | field 기존 각 root의 z−1 그림자 숨김, 새 AO는 ground plane에 두어 tree fade와 독립. 추가색0/unshaded 검정. 원 나무 높이 기반 거대 타원 대체 |
| 제단/관문/플레이어 접지 | arena altar/entry/clear arch240×60/alpha.82/z−440; player62×20/alpha.75/z−1; 모든 AO foot+(0,8) | 기존 field D01/ GateBoneFrame 및 arena3개 projected silhouette: y scale−.24, skew−32°, foot+(15,8), tint(.005,.008,.014,.42), blur4px. 기존 silhouette material 재사용 |

### 14.2 광원 표 (world px; color RGB/energy는 선형 Godot 입력)

| id / space | position | RGB | radius | energy | pulse amplitude |
|---|---|---|---:|---:|---:|
| Heart / field | (−250,−2440) | (1,.24,.085) | 680 | .95 | .035 |
| GateLeft / field | (−150,−4050) | (1,.37,.12) | 410 | .80 | .035 |
| GateRight / field | (180,−4090) | (1,.27,.09) | 390 | .72 | .035 |
| WestTissue / field | (−4161.385,−1831.912) | (.85,.18,.10) | 440 | .58 | .05 |
| EastTissue / field | (2445.740,−3399.036) | (.85,.20,.09) | 380 | .50 | .05 |
| ArenaEntry / arena | (0,−6880) | (1,.32,.10) | 620 | .72 | .035 |
| ArenaHeart / arena | (0,−9740) | (1,.17,.085) | 730 | .88 | .045 |
| ArenaTissue / arena | (1550,−8450) | (.90,.19,.08) | 500 | .56 | .045 |

Tissue 2등은 setup에서 FRONT row의 가장 가까운 foot를 선택(목표 West−3450/−1250, East1850/−2000), foot.y−sprite_height×.28에 고정한다. arena offset(0,−8000), 필드 D01 실제 제단/관문 텍스처의 기존 횃불 그림 위치 사용. PointLight가 바닥·오브젝트에 함께 닿아 번짐을 만든다. 별도 불꽃 애니메이션/에셋은 추가하지 않았다.

### 14.3 검수·성능·한계

| 항목 | 결과 |
|---|---|
| 기준 before | 실제 `1f797a8b`의5개 영향 소스를 복원한 동일 Main/3camera 캡처. before 생성 후 후보 소스 복구. MAP11-16 문제 캡처는 참고만, 비교 before에 보류 텍스처 사용0 |
| 렌더/전환 QA | 최초 after-preview 19checks/0fail(3뷰 저장·actual gate entry·wall fade 등). 눈 검수 후 광원 위치만 보정. 최종 캡처/추가 광원 경계/실제 입력 검증17checks/0fail. 벤치는 아래 공간별1회, 반복 측정0 |
| field / 1080p | p95 **7.857ms**, p99 9.931ms, 평균172.27fps, draw125/objects240, 실제 Player 입력 4방향150틱씩600틱 |
| arena / 1080p | p95 **7.580ms**, p99 8.391ms, 평균173.90fps, draw129/objects247, 실제 Player 입력 4방향150틱씩600틱 |
| 측정 조건 | Apple M5 Pro/macOS/Godot4.7.2/GL Compatibility, 1920×1080/240cap/기존60Hz 보존. 필드·아레나 p95≤8.33ms PASS. 측정 직전 pgrep Godot0, 해당 벤치1개만 실행. 5actor 관측; 밀집전투/Windows/GPU timestamp/전체프레임120fps 보장 아님 |
| 저장 격리 | `EXODUSER-map11-17-Isolated-20261021`만 실행, project 설정은 검수 종료 후 원본 byte 복원. 실제 EXODUSER-Godot-Native-First 실행0 |
| captures | `~/exoduser-wt/_out/MAP11-17/captures/`의 01_field / 02_outer_forest / 03_boss_entrance. before·after 각1600×900, `*_before_after.png`3200×900(좌before/우after), `*_before_after_1x.png`1280×600(각640×600, 무배율 crop x480/y150). 비교 보드는 색보정·리사이즈 없이 합침 |
| VISUAL VERDICT | **RETOUCH**. 회색 막 제거/냉암부·제단·입구 온광 분리 확인. 외곽 어두운 나무 디테일·넓은 바닥의 균일재질·gate뒤 직선 cutoff 잔여. PoE2/No Rest for the Wicked와 같은 계열의 명암 방향은 확보했으나 나란히 놓아도 동급 공간/재질이라는 PASS는 아님. 전투탄/Q/E 밀집 중첩은 미검수 |

### 14.4 MAP PRODUCTION REPORT

- STAGE: Godot CH1-1 MAP11-17 lighting-only.
- MASTER: silhouette/regions/main route/side spaces 전부1f797a8b 보존. GATE1~3 재제작0; GATE4 접지→GATE6 랜드마크광→GATE8 CAMERA/TECH 순서.
- OUTER MASS: LEFT/RIGHT/TOP/SOUTH 배치 불변. 어두운 깊이만 분리; major holes 형상 수정0.
- LARGE: source assets/composites/overlap/repeated silhouette 불변, 신규 생성/이미지 교체0.
- MEDIUM: connections/remaining holes 형상 불변; 접지광/그림자만 변경.
- GROUND: 원본 텍스처/contamination 불변; ground plane AO·제단/게이트 silhouette로 structure integration 보강.
- PLAYABLE: main arenas/travel/breathing/threat spaces/충돌·진행 불변. 3뷰 player silhouette 확인, 밀집전투 가독성 미검수.
- LANDMARK: primary 심장제단, secondary gate/tissue, tertiary arena rim 발광. 권위 anchor/스폰 불변.
- CAMERA QA: LANDMARK/ARENA(field landmark)·SIDE L·EXIT 3뷰 실제1600×900/1x. START/EARLY/SIDE R/LATE·실제 arena 최종 이미지 눈 검수는 이번 요청밖, 별도 PASS0.
- TECH QA: actual gate entry·wall occlusion PASS(초기 렌더QA); provider/route/collision 소스 불변. Godot ERROR0; pageerror/404 N/A. seam/void 기존직선cutoff 잔여. 로딩fallback 원본보존, 성능 위 표.
- FILES: MAP11 전용 lighting adapter/scene boot/field light/forest tint/vignette, generic native_map_look의MAP11중복설치guard3줄, 요청 하니스와 관련docs. concurrent/unrelated 수정0.
- GIT: 자기 branch `codex/map11-17-20261021`만 정상 hook commit/push. 복구 기준1f797a8b·원격expected 보존. 최종 SHA/push readback은 `_out/MAP11-17/DONE.txt`. main push/deploy/Steam0; R의게임/인덱스/WORK 수정0.
- VISUAL VERDICT: **RETOUCH**.
- NEXT PASS: 사용자 눈 검수 후 외곽명도·관문뒤 직선경계·밀집전투 가독성의 별도 승인 범위. 보류 텍스처 자동 인수0.
