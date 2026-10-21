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


## 15. MAP11-18 — 바닥 장식·캐릭터 림 (2026-10-21)

사용자 이번 지시의 MAP11-18 범위가 §11의 과거 배정보다 우선한다. 채택 `ff59c3c71d3aa20d5ce8cd67c648e159d77217cd` 직계 변경. MAP11-16/16b/17b 코드·텍스처 반입0, 신규 생성0. 기존 조명 8+player1/활성 최대5와 게임 geometry·전투·저장 계약 보존.

### 15.1 장식 계약

| id / 사용 위치 | 기존 에셋 / 현행 규칙 |
|---|---|
| root / field 군락·나무 발치 | `godot/assets/map/props/prop_g_root.png`; 폭380~650, 발치280~460worldpx. 공유 ground_story 머티리얼: UV radial feather=1−smoothstep(.28,.96,length(UV×2−1)); 원 RGB luminance×(.88,.76,.69)×instance tint, alpha×feather×.48. 원형 외곽을 노출하지 않고 바닥에 혼합 |
| blood / 군락 아래·발치 | `godot/assets/gore/blood_splat_1.png`; 폭150~340, 발치230~390; alpha.27. 새로운 위험 장판/피해/빛 아님 |
| bones / 소형 군락 | `godot/assets/map/ch1/floor_objects/bones.png`; alpha.65, 폭24~85 |
| flesh / 소형 군락 | `godot/assets/gore/flesh_chunk_3.png`; alpha.65, 폭24~85 |
| bone / 소형 군락 | `godot/assets/gore/bone_2.png`; alpha.65, 폭24~85 |
| 공통 변형 | setup에서 기존 PNG의 get_used_rect→AtlasTexture(투명 여백만 제외, 픽셀 수정0). seed11182026, 각 sprite angle[−PI,PI], flip_h 확률.5, height/width .42~.72, tone .48~.78, RGB=(tone,tone×.88,tone×.82). z−2985. 물리·충돌·전투 writer0, 틱 파라미터/로드/목록 API0 |
| 군락 중심 / field | (−1450,−2150),(850,−2750),(−2650,−850),(−3450,−1450),(1250,2100),(−1500,1850),(2250,100),(−850,−3520),(820,−3820). 9개 큰 군락×12개: root1/blood3/작은뼈·육편8. offset x±260/y±170; 규칙격자 배치0 |
| 발치 / field | forest_rows의 매4번째 중 FRONT만 blood+root2개. 실제 총130sprite(군락108+발치22). 원본 외곽4층·배치·AO·광원 유지 |
| 금지/보호 | y<−3250 & abs(x)<540인 관문 접근 중앙은 배치 제외. 아레나에는 새 장식0: R1700 내부와 전체 보스공간 그대로. 필드 주요 동선의 넓은 빈 면을 유지. 폐기 moss_patch/ash_pile/mud_stain/ground_crack/acid_pool/poison_puddle/flesh_pile/meat_stake 재사용0 |

### 15.2 캐릭터·숲 표시 계약

| id | 현행 수치 / 경계 |
|---|---|
| 공유 외곽선 | `actor_rim.gdshader` ShaderMaterial **1개**를 player._sprite / enemy._body에 부착. player.gd·enemy.gd 수정0. `px=fwidth(UV)×1.35`로 화면 약1.35px 안쪽 림; 좌우상하 alpha 최소 n, edge=smoothstep(.06,.65,src.a−n)×step(.35,src.a). 원 alpha·원 sprite tint/피격표시 보존. quad 확장·후광·새 광원0 |
| player / enemy | instance rim_color player RGB(.78,.72,.59)/mix.38, enemy RGB(.62,.20,.16)/mix.30. setup/child_entered_tree deferred1회 부착; 공유 material 중복부착 제외. 새 spawn은 동일 signal로 인수. **22d 제품 player는 arena에서 (.92,.82,.70,.62), field에서 기존값으로 lighting process가 instance rim_color 1회/프레임 갱신**. shared shader·enemy 값 보존 |
| 숲 하한 | field_forest_depth에서 기존 fog·west/east 보정 후 **조명 적용 전** RGB 하한(.075,.069,.072). 기존 BACK fog.48/MID.13/FRONT0, ambient·지역광·AO·vignette 유지. 최종 화면 모든 픽셀에 동일 하한을 강제하는 screen wash 아님 |
| 격리 | 실행 project user dir `EXODUSER-map11-18-Isolated-20261021`; 검수 후 project.godot 원 byte 복원. 실제 EXODUSER-Godot-Native-First 실행0 |

### 15.3 검수·판정

최종 수치와 §23 MAP PRODUCTION REPORT는 아래 완료 표 및 `_out/MAP11-18/DONE.txt`에 기록한다. before는 채택 ff59c3c7의 MAP11-17 after 원본 3뷰를 byte 복사(1600×900), after는 동일 Main/camera 좌표/줌/하니스. UI HP/SP 등 실행상태·실시간 조명 위상 차이는 존재한다. 비교는 색보정/리사이즈 없이 3200×900 나란히, 원배율 crop x480/y150/640×600 각각을1280×600으로 연결한다. 초기 눈 검수에서 원형 root 스티커가 보여 feather/무채색 보정 후 최종 캡처. 초기·최종 렌더 확인은 각각17checks/0fail; perf는 최종본 단독1회만 시행한다. 밀집 전투/Windows/전체8뷰 검수로 확대 주장하지 않는다.

### 15.4 MAP PRODUCTION REPORT

| 필드 | 실제 결과 |
|---|---|
| STAGE / MASTER | Godot CH1-1 MAP11-18. ff59c3c7 silhouette/regions/main route/side spaces 보존. GATE4 ground 연결→GATE7 low detail→GATE8 camera/tech |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH 위치·major holes 형상 불변. 기존 발치 AO와 광원 위에 낮은 root/blood 연계. 숲 prelight RGB하한 적용 |
| LARGE | source assets/composites/overlap/repeated silhouette 불변, 생성0. root decal만 기존자산 재사용 |
| MEDIUM | 기존 연결 구조/남은 hole 불변, 바닥에 낮은 군락을 더함 |
| GROUND | shadow/AO 불변. contamination9군락+발치11쌍/130sprite. 구조물 접지 연결/원형 root 경계 feather. 실제 위험표시 아님 |
| PLAYABLE | main arenas/travel/breathing/threat spaces·collision·provider 불변. 관문 중앙/아레나 보호. actor inner rim으로 silhouette 분리; 밀집 projectile/Q/E/loot 중첩 미검수 |
| LANDMARK | primary심장제단/secondary관문·숲/tertiary지면 story 군락. 앵커 불변 |
| CAMERA QA | LANDMARK/field, SIDE L/outer forest, EXIT/boss entrance 동일3뷰1600×900+각640×600 1x. START/EARLY/SIDE R/LATE/arena 최종이미지 이번 범위 미검수. 나란히 비교·crop 직접 눈검수 |
| TECH QA | 최종 캡처17/0. 최종 perf 하니스 관련검사 11/0. 자동관문 진입/field·arena 실제Player4방향150틱×4각600틱. shader/스크립트 ERROR0. pageerror/404 N/A, 신규 asset missing0. seam/관문뒤 직선cutoff 기존잔여. route/collision 변경0/새 전경로 종주 미실시 |
| PERFORMANCE | field p95 7.698ms (p99 9.423, draw141.0, objects256.0) / arena p95 7.711ms (p99 10.289, draw129.0, objects248.0). 두 공간 모두≤8.33ms 여부: True. 최종1회/1920×1080/60Hz/240cap/Apple M5 Pro/Godot4.7.2 GL. 직전pgrep0, 측정전체0.5초간격 다른Godot관측0. 5적 fixture; Windows/밀집전투/GPU timestamp 미검수 |
| FILES | stage-owned product_detail/actor_rim/ground_story/product_scene/field_forest_depth/하니스/관련docs. concurrent touched0/unrelated touched0. player.gd·전투코어·Main·State·save0 |
| GIT | 자기branch codex/map11-18-20261021 경로지정 stage/정상hook commit/push. main·기존반려branch merge0. remote readback/SHA는 DONE. R게임/INDEX/WORK수정0. deploy0 |
| VISUAL VERDICT | **RETOUCH** — 단일 바닥의 국소변화/낮은 뿌리·혈흔·뼈 군락/얇은 actor윤곽을 확인. 외곽암부·저밀도 바닥의 큰 균일면·일부 소품 접합·관문뒤 직선경계 잔여. PoE2/No Rest for the Wicked 동급 완성 PASS 아님 |
| NEXT PASS | 사용자 눈 인수 후 남은 암부/낮은 소품의 접합·밀집전투 가독성. 후광·새생성·반려 텍스처로 대체0 |


## 16. MAP11-19 — 큰 바닥 패치 (2026-10-21, MAP11-20 이전 이력)

이번 명시 지시가 과거 같은 번호 배정보다 우선한다. 기준 `2e735e1d34e9dfe9f70dedc6671cb38eb911b22b` (MAP11-18, 채택 MAP11-17 ff59c3c7 조명). MAP11-16/16b/17b·REJECT 반입 없음. §15의 130개/9군락/발치 표는 이전 이력이며 아래 계약으로 대체한다. actor rim/숲/조명/geometry/전투 코어는 유지한다.

### 16.1 출처·가공

3장 모두 MagicLight Seedream 5.0 Pro, 2026-10-21, 1920² 사용자 제공·맥북총괄 원화 PASS. 입력 `R/outputs/map11-art-proof-20261021/`, 런타임 `godot/assets/map/map11/patches/`. 신규 생성 없음. 순녹색 배경에 텍스처 편차가 있어 색거리와 green chroma를 결합한다. 정규화 RGB에서 c=G−max(R,B), d=distance(RGB,(0,1,0)), alpha=clamp((.095−c)/.065)×clamp((d−.35)/.25). alpha>.5 최대 연결 island만 3px 팽창하여 보존하므로 섬 밖 왼쪽 아래 턱뼈는 bbox 이전에 제외된다. 주 island 내부 distance/70의 smoothstep으로 반투명 feather; G=min(G,max(R,B)×.98)로 spill 제거, 전체 RGB=clamp(RGB^.76×1.3), 이후 뼈 RGB×.72. alpha<.002 RGB/alpha=0, bbox+4px crop 후 최대변1024 Lanczos. RGBA·mipmap import=true, linear mipmap 필터. 새 shader/틱 로드 없음.

| 파일 | 원본 crop x0,y0,x1,y1 | RGBA 해상도 | 사용 |
|---|---|---|---|
| patch_bloodpool_roots.png | [159, 151, 1766, 1803] | [996, 1024] | 정적 바닥 패치 |
| patch_bone_pile.png | [188, 250, 1733, 1693] | [1024, 956] | 정적 바닥 패치 |
| patch_cracked_flesh_slab.png | [245, 233, 1699, 1706] | [1011, 1024] | 정적 바닥 패치 |

### 16.2 배치·소형 군락 현행값

setup-only Sprite2D 12개, z−2986(기존 소형−2985·캐릭터/적 아래), 충돌 없음. 원 종횡비 보존, 폭310~375worldpx(현재 주인공 body48×scale1.3=62.4px 키의 약5~6배), 회전·홀수 index 수평반전·명도 변주. RGB=(tone,tone×.94,tone×.92), alpha.72. 모두 field 자식; arena R1700 내부 0개. 주동선 한가운데의 연속 패턴을 피하고 side/approach shoulder를 사용한다. Heart(−250,−2440)와 GateLeft/Right 빛 웅덩이에 각각 index9/10을 걸쳐 배치한다. 고정 seed11182026 소형6개씩을 같은 12개 중심 ±210x/±150y로 모음, root1/blood3/bone·flesh2; y<−3250 & abs(x)<540 제외. 기존 별도 발치22개 제거. 소형 tone/폭/높이비/alpha/공유 root shader는 §15 그대로다. 같은 종류가 인접한 중심을 피하고 서로 다른 실루엣/각도로 덩어리를 나눈다.

| index / 종류 | center world x,y | 폭 | 회전 rad | tone |
|---|---|---:|---:|---:|
| 0 혈흔뿌리 | −1320,−2350 | 350 | −.28 | .88 |
| 1 뼈 | 700,−2750 | 320 | .42 | .82 |
| 2 갈라진살 | −2730,−900 | 375 | −.45 | .90 |
| 3 혈흔뿌리 | −3410,−1400 | 335 | .68 | .84 |
| 4 뼈 | 1300,2100 | 310 | −.62 | .80 |
| 5 갈라진살 | −1450,1780 | 360 | .25 | .90 |
| 6 혈흔뿌리 | 2160,150 | 345 | −.80 | .88 |
| 7 뼈 | −920,−3600 | 325 | .18 | .78 |
| 8 갈라진살 | 780,−3840 | 370 | −.38 | .88 |
| 9 혈흔뿌리 | −370,−2640 | 330 | .55 | .86 |
| 10 갈라진살 | 330,−4010 | 315 | .15 | .85 |
| 11 뼈 | 1880,−1720 | 340 | −.20 | .80 |


### 16.3 MAP PRODUCTION REPORT

| 필드 | 실제 결과 |
|---|---|
| STAGE / MASTER | CH1-1 MAP11-19. silhouette/regions/main route/side spaces 기준2e735e1d 보존. GATE4 ground→7 detail→8 camera/tech |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH·major holes 불변. 기존 외곽4층·AO·조명 보존 |
| LARGE / MEDIUM | source3장·12 low floor patches. 세로 composite/overlap/외곽 연결 구조 불변. 기존 hole 수정0 |
| GROUND | feather70px·mipmap3장·패치12개, 소형130→실제66개. 바닥 오염의 큰 형태 추가. 투명 경계 녹색/회색 선은 보이지 않음. 일부 암부 혈흔의 원형 실루엣은 잔여 |
| PLAYABLE | main arena/travel/breathing/threat 공간 geometry/충돌 불변. actor rim 유지, 전체 arena R1700 새 패치0. field/arena 각600틱 실제입력 이동·관문전환 PASS. 밀집전투/Q/E/loot 중첩 미검수 |
| LANDMARK | primary심장제단/secondary관문·숲 유지, tertiary바닥 덩어리. field Heart/gate 광원 받는2개 배치 |
| CAMERA QA | 동일3뷰 START대신 field landmark / SIDE L / EXIT. before는2e735e1d의 MAP11-18 after PNG byte복사(DONE의SHA 확인); after 같은 카메라좌표1600×900. 나란히3200×900, 1x x480/y150/640×600 각2장을1280×600로 연결. 색보정/리사이즈0. START/EARLY/SIDE R/LATE/arena 최종시각은 미검수 |
| TECH QA | 초기 캡처17checks/0fail 뒤 검은 섬/과대 스케일 보정. 최종 캡처+직접 관련 검사+벤치1회33checks/0fail. 로딩·shader ERROR0. pageerror/404 N/A. seam/관문뒤 직선cutoff 기존 잔여. route/collision 소스 불변 |
| PERFORMANCE | field p95 7.004ms / arena p95 6.780ms, 양쪽≤8.33ms PASS. 기준7.698/7.711ms. 최종단독1회/1920×1080/240cap/60Hz/Apple M5 Pro/Godot4.7.2 GL. 직전pgrep0·벤치중자기Godot1개만 관측. 5적 fixture; Windows/밀집전투/GPU timestamp 미검수 |
| FILES | product_detail, 새RGBA3장/import3개, 전용하니스/uid, 설계·아트현황·CHANGELOG. concurrent/unrelated 수정0. PC전투코어/Main/State/save0 |
| GIT | codex/map11-19-20261021 지정path stage·정상hook commit/push, remote SHA readback 후 자기worktree 제거. main push/merge/force/reset/rebase/배포0. R HEAD/INDEX/WORK 읽기만. 실제 저장폴더 실행0; EXODUSER-map11-19-Isolated-20261021만 사용·project원byte복원 |
| VISUAL VERDICT | **RETOUCH** — 큰 형태는 이전 소형 데칼보다 읽히지만 전체 퀄리티가 확실히 올라갔다고 PASS하기에는 암부 재질·둥근 혈흔 실루엣·관문 측 갈라진 판의 반복감·기존 직선cutoff가 남음. 원화3장 PASS를 런타임 전체PASS로 대체하지 않음 |
| NEXT PASS | 사용자 검토 대상으로 제출. 암부 중간톤/관문측 유사형 인접을 더 풀 필요. 이번단위 뒤 새 작업 자동착수0 |

증거: `~/exoduser-wt/_out/MAP11-19/captures/`, 최종 verification.json·final-verification.log. 성능 개선율/전플랫폼120fps를 주장하지 않는다.


## 17. MAP11-20 — 지옥 세로 소품·바닥 중간톤 복원 (2026-10-21, 접지 수정 전 이력)

기준 `319d16862de3454c6e88830b084a22ec2b779472` / `codex/map11-19-20261021`, 그 아래 MAP11-18 `2e735e1d`와 MAP11-17 `ff59c3c7` 조명만 계승한다. MAP11-16/16b/17b 및 `*_REJECT.png` 반입0. 사용자 방향은 **화면에서 형태가 바로 읽히는 뼈무더기 등 지옥 소품**이다. 비교 작품 자산 복제0. §15/16은 이전 수치 이력이며 아래 변경분이 우선한다. **VISUAL VERDICT: RETOUCH / 성능 gate FAIL — 인수 완료 아님.**

### 17.1 출처·키잉·명도 계약

입력은 사용자 제공 `R/outputs/map11-art-proof-20261021/`의 승인6장(기존 패치3+신규소품3). MagicLight **Seedream 5.0 Pro / 2026-10-21 / 1920² / 순녹색 배경 / 맥북총괄 원화 PASS**. 이번 추가 생성·결제0. 원본은 읽기만 한다. 재현 도구 `godot/tools/map11_20_key_assets.py`(Pillow/NumPy/SciPy)는 저장소 루트에서 source 디렉터리와 `--report` 경로를 받아 실행한다. 가공/원본SHA256·bbox는 `godot/assets/map/map11/props/source_manifest.json`.

| id | 현행 처리 / 적용 |
|---|---|
| KEY | 정규화RGB, c=G−max(R,B), d=distance(RGB,(0,1,0)), alpha=clamp((.095−c)/.065,0,1)×clamp((d−.35)/.25,0,1). alpha>.5 최대 연결 island만 보존(소품 dilation2px / 패치3px). 원화 그림자·녹색 잔여를 광범위 불투명 rectangle로 남기지 않음 |
| SPILL / BBOX | G=min(G,max(R,B)×.98), alpha<.002의RGBA=0; 유효alpha bbox+4px, 최대변1024 Lanczos. RGBA·fix_alpha_border=true·mipmap=true, linear mipmap 필터. 리사이즈 후 알파 수렴픽셀은 정상 경계이며 독립 피 방울 island는 제거 |
| PROP_RGB | 공통 C=clamp(RGB^.64×1.22,0,.94). 피라미드 C×(1,.95,.85). 꼬챙이는 공통C를 clamp(C^.74×1.18,0,.96)로 한 번 더 복원. 피구덩이는 공통C. 소품 sprite white/alpha1로 실제 map11-17 광원·ambient를 받음; 새 unshaded 본체/새 광원 없음 |
| SKULL_HOLE | 피라미드 1024×1003 출력의 x[505,582), y[23,94) 안 maxRGB<125인 꼭대기 구멍/균열 픽셀의 RGBA=0. 녹색 부분뿐 아니라 어두운 구멍 내부까지 투명. 눈·코/다른 두개골 암부는 보존 |
| PATCH_BONE | 기존RGB×.72 폐기. clamp(RGB^.48×1.42,0,.94)×(1,.90,.68): 탁한 뼈색 중간톤, 암부 틈 보존 |
| PATCH_BLOOD | clamp(RGB^.57×1.5,0,.94)×(1,.76,.62). 푸른 가장자리 억제·혈흔의 검붉은 큰 면 복원 |
| PATCH_FLESH | clamp(RGB^.64×1.4,0,.94)×(1,.84,.72). 회청색 테두리 억제 |
| PATCH_MASK | 기존 §16의 distance/70 smoothstep feather·bbox·해상도 그대로. 전역alpha .72→.96; instance RGB=(tone,tone×.98,tone×.96). tone은 아래2개 외 §16 유지. 패치12개/소형66개, z−2986/−2985, 새 충돌0 |
| PATCH_MOVE | index0 혈흔 (−1420,−2600),tone1.05; index1 뼈 (−1250,−2450),tone1.0. 두 패치를 서로 비켜 놓고 뼈가 HUD 뒤로 숨지 않게 북쪽 이동. 폭350/320·회전−.28/.42는 유지. 다른10개 중심/폭/회전/tone은 §16 |

| 소품 id | bbox 원본[x0,y0,x1,y1] | 런타임 RGBA | 수량 / 용도 |
|---|---|---|---|
| hell_skull_pyramid | [162,201,1751,1758] | 1024×1003 | 3 / 갈림길·서측 고리·동측 길목 표식 |
| hell_impaled_corpse | [548,132,1417,1753] | 549×1024 | 4 / 서·동 외곽 경계2개씩. 작은 분리 피 방울·잔점 제거 |
| hell_spike_pit | [189,279,1710,1603] | 1024×891 | 1 / 북쪽 보스문 접근로 왼쪽, 중앙 통과공간 비움 |

### 17.2 세로 배치·접지·정렬

새 본체8개 모두 field의 static Node2D 자식. 캐릭터 body48×scale1.3=62.4worldpx 기준 높이158~185(약2.53~2.96배). 전체 텍스처 종횡비 유지, 수평반전만 변형, 눕히는 random 회전0. `centered=false`, offset=(−width×.5,−height×.94), scale=저작높이/texture.height. 발치의 고정 `z_as_relative=false`, **z=clamp(int(foot.y/4),−2000,4000)** 로 Main/player·enemy의 Y/4 계약과 일치한다. 기존 나무 .35 정렬식을 새 소품에 복사하지 않는다. 불필요한 충돌 원은 추가하지 않음(경계/길목 옆 시각 전용), provider/geometry/LOS/스폰·동선0변경. 아레나 R1700 내부0, 주 전투면 중앙0.

| index / 소품 | foot world x,y | 높이 | body48 대비 | flip_h |
|---|---|---:|---:|---|
| 0 피라미드 | −680,−2570 | 185 | 2.96 | false |
| 1 피라미드 | −3010,−1030 | 166 | 2.66 | true |
| 2 피라미드 | 1570,−1750 | 175 | 2.80 | false |
| 3 꼬챙이 | −3540,−1250 | 182 | 2.92 | false |
| 4 꼬챙이 | −3350,−1390 | 158 | 2.53 | true |
| 5 꼬챙이 | 2420,80 | 172 | 2.76 | true |
| 6 꼬챙이 | 2520,−60 | 164 | 2.63 | false |
| 7 창울타리 피구덩이 | −480,−3770 | 184 | 2.95 | true |

접지 AO8개는 기존128² radial texture 공유, foot+(0,3), size=(높이×.64,높이×.13), black alpha.64, z−2987, 기존 unlit material만 공유한다. 그림자는 ground plane에 남아 배우 위로 올라오지 않는다. 피라미드0은 Heart(−250,−2440)/R680 범위, 피구덩이는 GateLeft(−150,−4050)/R410 가장자리에 닿는다. 새 광원0·활성 최대5 그대로. 명시 HELL_ROWS/texture preload를 setup 한 번만 소비하며 새 tick 처리/목록API/ResourceLoader 호출0.

### 17.3 비교·기술·성능 증거

동일3뷰 before는 **MAP11-19 319d1686의 저장된 after 원본** byte복사. `_out/MAP11-20/capture-manifest.json`에 원본/복사SHA256 대조(3개 동일). after는 같은 Main·zoom.70·camera offset(0,−180), 카메라 (−850,−2400)/(−3150,−1050)/(0,−3500). 캡처1600×900·before_after3200×900, 원배율 crop640×600→1280×600 및 소품에 맞춘 추가 detail crop도 저장. 색보정·리사이즈0. UI HP/SP·실시간 조명/애니메이션 위상 차이는 비교 한계이며 배경 기하 변경 아님.

최종 실행 `godot/tests/capture_map11_hell_props.gd`: **68checks 중67PASS/1FAIL**. 소품8개/깊이/크기/mip·패치12·공유rim·광원 제한·실제 관문 진입·field/arena 각각 실제 Player4방향150틱×4=600틱 이동 PASS. 피라미드 앞/뒤 추가2뷰에서 캐릭터 가림과 발치 접지 눈검수, depth assertions PASS. Godot SCRIPT/Parse/ERROR0. 최초 시각 preview63/0 이후 혈흔의 찬색·꼬챙이 명도·뼈 위치를 보정했고 **최종 관련 하니스/벤치는1회**. 전체 suite 반복0.

| 성능 | MAP11-19 기준 | MAP11-20 단독1회 | 8.33ms gate |
|---|---:|---:|---|
| field p95 | 7.004ms | **10.598ms** | **FAIL** |
| arena p95 | 6.780ms | **7.168ms** | PASS |
| field p99 / 평균FPS / draw / objects | — | 11.903ms / 159.025 / 148 / 263 | 평균FPS로p95 실패 대체0 |
| arena p99 / 평균FPS / draw / objects | — | 8.252ms / 177.493 / 129 / 247 | — |

Apple M5 Pro/Godot4.7.2 GL/1920×1080/240cap/60Hz/5적 fixture. 직전 `pgrep -x Godot`0, 전체실행중0.5초간격69관측·다른Godot0(자기1개). 필드 프레임 예산 미충족 원인 미확정. 요청한 벤치1회 제한을 유지하며 재측정/통과값 선별0. **실패한 제품 후보를 성능 PASS나 인수완료로 보고하지 않는다.** Windows/밀집전투/GPU timestamp 미검수.

### 17.4 MAP PRODUCTION REPORT (§23)

| 필드 | 실제 결과 |
|---|---|
| STAGE / MASTER | Godot CH1-1 MAP11-20. 319d1686 silhouette/regions/main route/side spaces 유지. 공통가이드·맵디테일 선행. GATE4 ground→6 landmark→7 story→8 camera/tech |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH·major holes·4층 숲 형상 보존. 외곽경계에2쌍의 꼬챙이 시체 연결. 원래 직선 관문뒤 cutoff 잔여 |
| LARGE | 승인된 새source3장/8정적소품. 피라미드3 높이/반전 변형. 기존 외곽composites/overlap 불변. 복제작품자산/반려이미지0 |
| MEDIUM | 기존 connections/remaining holes 불변. 소품의 낮은 발치뼈/혈흔과 AO로 접합 |
| GROUND | 기존패치12의 중간톤/색 복원·2중심이동/소형66유지. 접지shadow8·contamination유지. 피라미드와 뼈 형태는 읽힘; 일부 혈흔의 둥근 실루엣/부드러운 경계 잔여 |
| PLAYABLE | main arenas/travel/breathing/threat 공간 보호, 새 solid0/통과동선 유지. Player600틱×2공간/관문 PASS. 새전경로종주·밀집전투 projectile/Q/E/loot 가독성 미검수 |
| LANDMARK | primary 심장제단/secondary 관문 유지. tertiary skull3·corpse4·pit1. 북접근 중앙과 보스룸R1700 신규0 |
| CAMERA QA | LANDMARK/field, SIDE L/outer, EXIT 3뷰 전후1600×900+1x 직접눈검수. 앞뒤가림2뷰 추가. START/EARLY/SIDE R/LATE/arena 최종시각은 이번범위 미검수. 관문·숲 기존암부/접합 완성PASS로 확대0 |
| TECH QA | 68중67PASS/1FAIL(field p95). route/collision본체 불변·실제이동/진입 PASS. pageerror/404 N/A. seam기존cutoff잔여; loading에러0·원alpha/mip사용. 성능 field10.598/arena7.168ms |
| FILES | stage-owned product_detail/새RGBA3+import3/보정patch3/재현pipeline+manifest/전용하니스+uid/관련docs. concurrent touched0/unrelated touched0 |
| GIT | codex/map11-20-20261021만 경로지정stage·정상hook commit/push. hook dependency tools는 기준동일byte로 sparse에 포함. R source/INDEX/WORK읽기만, main push/force/reset/rebase/반려branch merge/배포0. SHA/원격readback/자기worktree제거 결과는 DONE.txt |
| USER DATA | 실행/import는 EXODUSER-map11-20-Isolated-20261021만 사용. 실제저장폴더 실행0. project.godot 원byte복원·diff0 |
| VISUAL VERDICT | **RETOUCH**. 1x에서 두개골·창울타리·꼬챙이 형태와 바닥뼈 가독성 개선은 확인. 혈흔의 둥근 모양·외곽암부·기존cutoff가 남으며 필드성능gate도 실패. 전체품질 완료/PASS 주장0 |
| NEXT PASS | 필드p95 초과의 별도원인분리·예산복구, 혈흔 가장자리/꼬챙이와숲 접합 눈검수. 이번1회제한 안에서 추가벤치/새작업 자동착수0 |

증거: `~/exoduser-wt/_out/MAP11-20/captures/`, `captures/verification.json`, `final-verification.log`, `godot-process-monitor.json`, `DONE.txt`.


## 18. MAP11-20 최우선 추가 지시 — 떠 보이는 소품 접지 수정 (2026-10-21)

> 당시 접지 수정 이력. 후속 성능 측정·공용 아틀라스는 §19 MAP11-PERF를 따른다.

사용자 지적 **“에셋들이 왜 붕붕 떠다니냐”**를 같은 `codex/map11-20-20261021`에 반영한다. 부모 `f7bddb46ea407ce412f61d194ee5653d8e48db3e`이며 §17의 배치/원화/중간톤은 유지하되 **pivot .94·offset 그림자·정렬·접지에 관한 현행값은 본 절이 우선**한다. MAP11-16/16b/17b·REJECT·PC 전투 코어 반입/수정0.

### 18.1 원인과 실제 수정

| id | 변경 전 | 현행 |
|---|---|---|
| FOOT | 텍스처 높이×.94를 접지로 가정. alpha 여백·거울반전·기울기 미반영 | 오프라인 **alpha≥32/255의 픽셀 사각형 convex hull** 18개(16 PNG+철문 region2개). 최종 scale/rotation/flip_h를 적용한 불투명 윤곽 bbox의 bottom center를 저작 foot에 정렬 |
| DEPTH | field 나무/랜드마크 y×.35, arena 80+y/10 및 부모z. 새hell만 y/4 | field·arena·새hell·관문 leaf 모두 **z_as_relative=false, clamp(int(global_foot.y/4),−4096,4095)**. 실제 캐릭터 Main Y/4와 같은 foot. 254개 적용, 플레이어/적 코드 수정0 |
| AO_OFFSET | 공용foot+(0,8), hell foot+(0,3), 하위preview shadow +(0,15)/(20,12) 등 | 실제 제품 접촉 AO는 **position=foot**, 추가xy 이동0. preview 나무 하위AO는 기존대로 숨김. 별도 떨어진 원형 소품AO를 아래 lower-alpha 접촉마스크로 대체. 플레이어 본체/전투는 불변; 공용helper의player AO도 호출foot(0,4)에+8을더하지않아 기존localy12→4 |
| CAST | source를뒤집어(+15,+8)에투사, 밑동~그림자 사이 틈/분리된 검정 형상 | **제품 세로소품 투사 그림자8개 제거, 현행0**. 원점만 맞춘 첫수정에서도 제단 bulk와 분리돼 보이는 것을 실제1x크롭에서 확인해 제거 |
| CONTACT | 하나의 타원으로 가는뿌리 끝과 큰제단 몸통을 함께 받침 | **원화 하단 alpha를 따르는 마스크16종**으로 각 실제 lower silhouette 아래에 짙은 접촉부+바깥 Gaussian 감쇠. 제단의 가는뿌리/시체나무/뼈무더기/창울타리 접지에 같은 변환. 필드·arena AO252개, material unlit/alpha.85 공유. 새 본체/광원0 |
| FLOOR_ROOT | prop_g_root 3개가 세로_rgba+별도AO | LowWetRootMass/EarlyFallenLog/GateRootApron은 **바닥_stamp**. width=기존높이×원종횡비, height=기존높이×.40, 회전0/기존flip·ground material, 별도AO/투사0. inherited _surface의 shoulder AO도 제품에서 제거 |
| FLOOR_BLOOD | 기존혈흔 PNG의 베이지색/밝은 relief가 바닥에서 따로 읽힘 | 공유 ground_blood shader1개. red=R−max(G,B), mask=smoothstep(.09,.20,red)×[1−smoothstep(.75,1,length(UV×2−1))]; RGB=(.24,.032,.023)×instanceTint, alpha=sourceAlpha×mask×instanceAlpha. source highlight/베이지 spill 제거, 새그림자0 |
| FLOOR_DEBRIS | 작은 bone/flesh 높이비 .42~.72 | kind≥2의 scale.y만 ×.48 → 실제 높이/폭 **.2016~.3456**, 낮은 바닥 파편22개. root/blood는 기존 높이비 유지. 큰패치12·소형총66 유지. 모든 데칼은 ground z−2986/−2985, 그림자/세로pivot0 |
| SWAY | 제품 MAP11은 generic NativeMapLook 중복설치guard로 일반 sway 미사용 | 새 whole-prop translation/회전 애니메이션0. 기존 forest 최종 저작rotation은 setup에서만 적용. 실제시간 경과 전후 모든 field standing node.position/sprite.transform 동일 확인. **발치 고정, 새 가지 애니메이션 구현 주장0** |

### 18.2 불투명 발치·접촉 마스크 재현 계약

`ground_contact_data.gd`/`ground_contact.gd`는 setup-only. 원본 PNG는 변경하지 않는다. alpha≥32/255 외곽 edge의 convex hull에 각 픽셀의 네 모서리를 포함한다. flip_h이면 x=W−x, sprite의 최종 회전·비균일 scale basis로 hull을 변환한다. B=bbox(변환 hull), shift=(−B.center.x,−B.end.y), `sprite.offset=basisInverse×shift`. source 크기 기준 scale·저작foot·provider좌표는 유지하고 **불투명 bbox bottom y=0**이 된다. 캐시 cull rect도 이 최종 bbox+55(field)/65(arena)로 갱신한다. 픽셀/목록/ResourceLoader의 tick 호출0; 오프라인 shape 수18, runtime GPU image readback0.

접촉 마스크는 raw alpha를 사용해 foot 근처의 가는 뿌리까지 이어 준다. source H/W에 대해 pad=max(4,round(H×.025)), max-filter size=max(3,round(H×.012))를 홀수로 만들고 Gaussian sigma=max(1,H×.007), lower fade=smoothstep((y−.68H)/(.14H)). y0=round(.72H)부터 하단+pad만 crop, 최대512×256 Lanczos. source coordinate offset=(−pad,y0−pad), source size=(W+2pad,H+2pad−y0). RGB=0/alpha=가공mask, mipmap=true/linear mipmap. Sprite의 scale/offset에 crop 및 thumbnail ratio를 역으로 적용하여 source 하단 윤곽과 **동일 world transform**을 유지한다. flip_h/회전도 동일하고 노드 position은 foot 그대로다. 타원 그림자를 아래로 이동시켜 틈을 숨기는 방식0.

| 파일 / 경로 | 역할 |
|---|---|
| godot/scripts/maps/map11/ground_contact.gd + ground_contact_data.gd | setup pivot/absolute Y정렬·원본불투명hull |
| godot/scripts/maps/map11/ground_contact_masks.gd | 16개 접촉 PNG preload 및 source crop 변환 |
| godot/assets/map/map11/contact_masks/*.png(.import) | 기존 alpha에서 파생한 접촉마스크16장, 신규 AI 생성0 |
| godot/tools/map11_20_build_contact_data.py --report <bounds.json> | root에서 원본 alpha→hull/data 생성, Pillow/NumPy/SciPy |
| godot/tools/map11_20_bake_contact_masks.py --bounds <bounds.json> --report <masks.json> | 동일 root에서 lower alpha contact PNG/data 재현 |
| product_field_view / product_arena_view / product_detail / product_lighting | 제품 소비자 적용. preview본편 외 source/PC 전투 writer 수정0 |

### 18.3 검수·판정

최종 관련 하니스 `capture_map11_grounding.gd` **1557 checks/0 fail**, 세워진254개 opaque bbox foot 오차 최대 **0.0003662109375 world px**, AO252개 모두 같은foot/원본좌표변환 일치, 분리된 projection0. 실제 gate→arena 진입 PASS. field 세로소품 위치·sprite.transform 시간 경과 전후 동일, 낮은 파편 높이비 PASS. SCRIPT/Parse/ERROR0. 초기 import의 packed-shape 선언 오류는 최종 전 수정했고 초기 로그는 보존. 수치가 통과한 초기preview에도 제단그림자 분리가 보여 actual foot crop으로 추가보정했다. 최종검수결과만 위 통과 수치이며 범용 suite/벤치 반복0.

증거: **`~/exoduser-wt/_out/MAP11-20/captures/grounding/`** (원본 작업증거는 `grounding/captures/`에도 동일). f7bddb46의 3뷰 after를 before 원본 byte복사·SHA256 동일 확인, 새 after 같은 저작카메라3뷰1600×900/3200×900 비교. HUD·광원위상·카메라 settling 약수px 차이가 있어 픽셀동일 diff 검사는 아님. **제단·큰시체나무·새피라미드·꼬챙이·피구덩이·관문 발치 원배율440×230**, 같은좌표 전후880×230을 별도저장. arena 제단은 after440×230 추가(동일before는없음). crop별좌표/원본뷰는 grounding-verification.json. 1x리사이즈/색보정0.

| 판정 | 실제 범위 |
|---|---|
| CONTACT VISUAL | **PASS(검수한 1x 발치7개·3뷰)**. 제단 아래로 떨어진 검정 투사형상/타원 제거, 실제 뿌리끝·시체나무 밑동·새소품 lower edge 바로아래에 접촉암부 연결 확인. 나머지254개는 기하검사이며 개별눈검수254개PASS로 확대0 |
| 전체 VISUAL VERDICT | **RETOUCH 유지**. 큰바닥패치의둥근 실루엣·기존암부/관문뒤cutoff·전체아트/밀집전투 가독성 잔여 |
| PERFORMANCE | **이번수정본 미측정**. 요청 벤치1회 제한 유지. 앞 f7bddb46의 field p95 10.598ms FAIL / arena7.168ms PASS는 이력이며 새코드 측정값으로 복사0. 예산충족/성능회복 주장0 |
| USER DATA | EXODUSER-map11-20-Grounding-Isolated-20261021만 실행. 실제저장폴더0·project.godot 원byte복원. 동시Godot 최대1 |

### 18.4 MAP PRODUCTION REPORT (§23)

| 필드 | 결과 |
|---|---|
| STAGE / MASTER | CH1-1 MAP11-20 추가접지. silhouette/regions/main route/side spaces 보존. GATE4 structure-ground integration→8 camera/tech |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH·major holes 보존. 같은root foot에서 불투명bbox 위치/정렬 수정. 접지부만 더함 |
| LARGE / MEDIUM | 기존 source/composites/overlap·connection 보존. 새AI원화0, 반복silhouette/남은hole 해결범위아님 |
| GROUND | detached cast0, attached alpha-contact16종/252instance. flat root3·혈흔material·낮은bone/flesh22. 바닥데칼 자체shadow0 |
| PLAYABLE | main arena/travel/breathing/threat geometry·충돌/LOS/스폰 불변. realgate→arena PASS. Player/Q/E/저장/PC core 수정0; 밀집전투 미검수 |
| LANDMARK | primary심장제단/secondary관문·시체나무·hell props의foot 고정. 권위anchor/배치height/point light변경0 |
| CAMERA QA | LANDMARK·SIDE L·EXIT 3뷰 전후·필드발치6쌍1x/arena제단1x 추가. START/EARLY/SIDE R/LATE·전체arena전투 미검수 |
| TECH QA | 최종1557/0, opaquefoot254/AO252/projection0/actualgatePASS. pageerror404 N/A. 기존cutoff잔여, loading·shader ERROR0. performance미측정/이전fail미해결 |
| FILES | 제품4adapter+ground_contact helper/data/mask-data+ground_blood shader+maskPNG/import16+재현도구2+하니스+관련docs. concurrent/unrelated0 |
| GIT | 같은branch f7bddb46의정상자식 commit/push·원격expected SHA보존. R HEAD/INDEX/WORK읽기만, main push/force/reset/rebase/반려merge/배포0. SHA/제거는DONE |
| VISUAL VERDICT | **RETOUCH(전체) / CONTACT VISUAL PASS(직접검수발치)** |
| NEXT PASS | 전체성능 예산·기존암부/지면패치 접합·밀집전투 별도과제. 이번지시 뒤 신규작업/추가벤치 자동착수0 |


## 19. MAP11-25D — GLB → 조명 반응 2D 소품 (2026-10-21)

기준 `372a9c5a69884b76a568e6f94504a9b089aabb91`의 정상 자식 브랜치 `codex/map11-25d-20261021`. §17/18의 2D 피라미드 **3개만** 아래 렌더로 대체한다. 다른 소품·충돌·이동·스폰·PC 전투·저장 코드는 변경0. 전체 시각 판정 **RETOUCH**: 노멀 조명은 동작하지만 Meshy 하단 복원 형상과 재질에 추가 제작이 필요하다.

### 19.1 투영 측정과 오프라인 렌더

| 항목 | 규약 / 근거 |
|---|---|
| 기존 소품 측정 | `hell_spike_pit.png` 지면 rim 수동 기준점 좌(220,590)/우(824,590)/뒤(522,410)/앞(522,772). 장축604px·단축362px → .59933775, 원형 지면 가정 고도36.82248°. 창과 뼈의 가림·원화 자체 변형 때문에 약 ±4° 추정이며 물리 카메라의 유일한 복원값은 아님. 표시 앵커 `projection-pit-anchors.png`, 수치 `projection-measurement.json` |
| 기존 캐릭터 측정 | `assets/player/south.png` 첫48×48 프레임의 alpha≥32 bbox=(11,14)~(33,44), 22×30px. 투구/어깨 상면이 보이는 세워진 3/4 형상. 원화만으로 물리 각도는 유일하게 계산할 수 없음. 수직 몸체 비율을 유지해 추가 Y압축을 하지 않는 교차 기준. `character-projection-review.png`는 검토용 nearest10배 |
| 선택 카메라 | Camera3D orthographic, 위치(0,6,8)에서 원점 관측. 수평 azimuth0°, 지면 위 elevation36.86989765°(내려다보는 pitch −36.86989765°), 지면 깊이 투영sin(elevation)=.6. 렌더 후 추가 세로압축1.0. 모델 yaw −20°/+20°/+65°로3변형 |
| 렌더 공간 | SubViewport1024×1024, transparent RGBA8, own_world_3d. 외부 GLB를 GLTFDocument로 **오프라인에서만** 생성. mesh world AABB 중심 정렬, orthographic size=AABB.size.length×1.08, near .01/far100. runtime GLB/3D로드0 |
| diffuse | 원본 PBR base-color×albedo_color를 unshaded 균일 출력. 새 방향광·투사그림자 베이크0. RGB=min(source×1.6,.85). Meshy base-color 자체에 남은 원화 명암은 제거했다고 주장하지 않음 |
| 하단 잔여물 | 모델 중심 기준 world_y<−.40×modelHeight AND source luma(.299R+.587G+.114B)<.18만 discard. diffuse/normal 동일 조건. 검은 받침을 줄였으나 하단 뼈/재질의 어두운 윤곽 잔여로 RETOUCH |
| normal | view-space N과 원본 tangent normal(texture×2−1, xy×original.normal_scale×.35)을 T/B/N으로 합성·정규화. RGB=.5×N+.5, 카메라 오른쪽 +X/위 +Y/관측자 쪽 +Z. **green invert=false**. 동일 프레임·crop·alpha. Lanczos 축소 뒤 픽셀 벡터 재정규화 |
| Godot 규약 확인 | CanvasTexture OpenGL식 X+/Y+/Z+. 엔진이 green을 화면 아래 좌표로 변환하므로 이중 반전하지 않음. 공식 [CanvasTexture](https://docs.godotengine.org/en/stable/classes/class_canvastexture.html), [Canvas shader source](https://github.com/godotengine/godot/blob/master/drivers/gles3/shaders/canvas.glsl). 실제 +Y 노멀(.5,.9,.8)의 위 광원 중심값1.0/아래0.0 → `normal-y-verification.json` PASS |
| 해상도 / mip | alpha crop 뒤 최종 표시높이185/166/175의 정확히2배370/332/350px. diffuse/normal/contact PNG 모두 mipmaps=true·linear mipmap. sprite uniform scale .5, flat 데칼용 Y압축 적용0 |
| headless 제한 | stock Godot4.7.2 macOS `--headless`는 dummy renderer라 PNG frame_post_draw가 오지 않음(직접 확인). `--headless --rendering-driver metal --rendering-method mobile`도 실제 렌더 불가. 도구는 headless에서 render_error.json+exit4로 즉시 종료. import/alpha/AO는 headless/CLI 가능. PNG는 GPU CLI로 검증, 순수headless 렌더 완료 주장0. Linux Xvfb는 미검증 |

`godot/tools/map11_25d_render.gd` 실행: `Godot --path godot --script res://tools/map11_25d_render.gd -- --source=<외부GLB절대경로> --output=<PNG출력폴더>`. `godot/tools/map11_25d_contacts.py`는 Pillow/NumPy/SciPy로 새 hull/contact만 재생성한다. export 도구 포함0(`export_presets.cfg`의 tools/*,tests/* 제외 유지).

### 19.2 적용·발치 계약

| id / 위치 | yaw | diffuse / normal 각각 | alpha≥32 bbox 바닥중앙 | 표시높이 / 크기 |
|---|---|---|---|---|
| HellProp00 (−680,−2570) | −20° | skull_0_*.png 375×370 | (187.5,370) | 185px /187.5×185 |
| HellProp01 (−3010,−1030) | +20° | skull_1_*.png 352×332 | (176,332) | 166px /176×166 |
| HellProp02 (1570,−1750) | +65° | skull_2_*.png 381×350 | (190.5,350) | 175px /190.5×175 |

출력은 `godot/assets/map/map11/props/skull_25d/`. Sprite2D의 CanvasTexture에 diffuse+normal 연결, specular_color=(.12,.10,.08), shininess=.16. 노멀 반전 대신3개 모두flip_h=false(기존 두번째 반전은 별도yaw로 대체). 기존 PlayerKey/Heart/WestTissue/EastTissue 등의 PointLight2D를 사용하며 새 게임 광원0.

발치는 §18과 같은 alpha≥32 hull의 pixel-square bbox bottom center, 절대z=clamp(int(worldFoot.y/4),−4096,4095). CanvasTexture.resource_path가 비므로 **diffuse PNG의 명시key**를 GroundContact.align에 전달. 공용 hull/mask registry에3건 추가, 다른18hull/16mask 불변. AO는 §18.2와 같은 lower-alpha max-filter/Gaussian/pad/crop, position=foot/추가이동0, alpha.85/unlit/z−2987. 새cast shadow0. `feet.json`은opaque bbox, `render.json`은카메라/프레임crop, `source_manifest.json`은3D출처.

### 19.3 검수·성능·판정

| 검사 | 결과 / 한계 |
|---|---|
| before/after | before는372a9c5a의 실제Main. field(−850,−2400)/west(−3150,−1050)/east(1570,−1680),1600×900. compare_*.png는3200×900 좌우, compare_*_1x.png는640×270(원배율320×270×2). resize/색보정0. HUD/실시간위상 미세차이 잔여 |
| 광원 증명 | 같은카메라/Player/prop에서 기존PlayerKey만 foot+(−85,−120)→foot+(−700,100) 이동. near/far 각1600×900·1x, normal-off near/far 대조도 보존. near normal-vs-flat 고정100×103px ROI 평균RGB차7.79874/255, 차>3은7286px. near평균luma67.30587→far41.55141. near/far 같은crop assert |
| 접지·Y | CanvasTexture/normal존재, prop00 불투명bounds=(−93.75,−185) size(187.5,185),bottom0·절대Y/4 확인. 3종alpha≥32 bbox/foot은feet.json. 기존 다른prop 변경0 |
| 성능1회 | 1920×1080 실제Main, field/arena 각600physics ticks/실입력4방향. field p95=7.243ms,p99=8.299ms,평균178.514fps,draw148. arena p95=7.041ms,p99=8.699ms,평균177.586fps,draw136. checks3/fail0. 이전field10.598ms보다악화미관측. fresh동일조건before0/별도MAP11-PERF미통합/밀집전투미측정. **마지막오프라인재렌더전 측정**(최종yaw1폭353→352px,노드/광원수동일),최종PNG재측정0·개선율/최종엄밀성능보증0 |
| 동시실행 | perf시작전pgrep1(기존Godot81277),bench포함최대2. 기존프로세스중단/변경0. 2개이상이면대기하는시작감시와perf-processes.json. 벤치재실행0 |
| 저장·runtime | EXODUSER-map11-25D-Isolated-20261021만실행. 실제저장폴더0,project.godot은commit전원byte복원. GLB는원outputs만,게임에는PNG9장+metadata. Main/Player/PC전투core수정0. 틱목록API/ResourceLoader추가0 |
| VISUAL VERDICT | **RETOUCH**. 실제면방향의수광이바뀌는2.5D파이프라인성립. Meshy하부형상/암부윤곽/원texture명암·작은표시detail은추가art pass필요. 사진붙임느낌완전해소·AAA완성은미달 |

### 19.4 MAP PRODUCTION REPORT (§23)

| 필드 | 결과 |
|---|---|
| STAGE / MASTER | CH1-1 MAP11-25D. 기존silhouette/regions/main route/side spaces유지. 승인GATE6소랜드마크소재교체→GATE4접지→8camera/tech |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH·major holes변경0 |
| LARGE / MEDIUM | Meshy skull1모델3yaw/기존3배치만. 다른composite/overlap/connections유지. 새scatter0,source하단잔여RETOUCH |
| GROUND | opaque foot+기존lower-alpha AO,source발치접지. cast0.floor/stain변경0 |
| PLAYABLE | main arenas/travel/breathing/threat spaces·collision/LOS불변. 벤치실보행/arena gate PASS. 밀집전투·탄/패링가독성미검수 |
| LANDMARK | primary제단/secondary문유지,tertiary skull3만2.5D |
| CAMERA QA | ARENA주변field/SIDE L/SIDE R의3뷰. START/EARLY/LATE/EXIT/arena최종아트검수는범위밖 |
| TECH QA | normalY교정PASS,normal on/off조명차PASS,loading/최종script parse ERROR0. 실제gate확인,collision변경0,web pageerror/404 N/A.seam외형/발치RETOUCH |
| FILES | product_detail/contact registry추가3건/PNG9·import9·metadata3/offline tools2/QA harness3/설계·ART·CHANGELOG. concurrent/unrelated변경0 |
| GIT | 전용branch/path지정add/hook유효. main push/force/reset/rebase/타작업merge/배포0. SHA/remote대조·worktree제거는_out/MAP11-25D/DONE.txt |
| VISUAL VERDICT / NEXT | **RETOUCH**. 모델하단·재질재제작이후보. 이번뒤새생성/별도backlog자동착수0 |

증거: `~/exoduser-wt/_out/MAP11-25D/captures/`, `normal-y-verification.json`, `light-response.json`, `projection-measurement.json`, `perf.json`, `perf-processes.json`, `DONE.txt`.


### 19.5 MAP11-25Db — 룩 보정 후보 / RETOUCH (2026-10-21)

§19.1–19.4의 MAP11-25D 수치·unshaded 균일 출력·캡처는 **1ca4603f 당시 이력**이다. 현 브랜치는 아래 계약으로 대체한 검토 후보이며 main 통합/배포하지 않는다. 새 에셋 생성0, 기존 GLB 오프라인 렌더만, 런타임 PNG만 사용한다.

| 항목 | 현 수치 / 적용 |
|---|---|
| 카메라 | orthographic (0,6,8), elevation36.86989765°, yaw−20/+20/+65°. 추가Y압축1.0 유지 |
| 키 / 림 베이크 | view-space key normalize(−.55,.72,.8), 좌상단 NW. diffuse=source×(.48+.78×max(N·key,0)). rim=pow(1−max(N.z,0),3)×max(N·normalize(.6,.45,−.2),0), RGB(.10,.075,.045). unshaded shader가 수식을 직접 굽는다. 새 runtime 광원0, specular(.12,.10,.08)/shininess.16 유지 |
| AO | 별도 view-depth PNG를 오프라인에서만 계산. depth=clamp((viewZ+10)/AABB.length+.5,0,1), PNG8bit. 출력픽셀 반경2/5/10×8방향. delta=neighborDepth−depth, bias.008, ramp.06, range.22; 24표본 평균×.55, Gaussian sigma.65. 자기 표면 recess 근사이며 raytraced AO/완전 self-shadow map 아님. 지면 plane/cast shadow0. depth PNG runtime 반입0 |
| 그레이딩 | AO→노출1.85→RGB gain(1.10,1.025,.86)→luma(.2126,.7152,.0722) 기준 채도.92→pivot.25 대비1.12→RGB clamp0..94→Unsharp radius1.1/85%/threshold3. alpha 원본 보존 |
| 하단 | 이전 worldY<−.40H & luma<.18 discard 제거. 모델의 어두운 받침을 살림. 별도 접촉AO 확장0: 기존 pad round(H×.025), max-filter round(H×.012) odd, Gaussian max(1,H×.007), lower fade .68H→.82H, crop .72H. 검은 평판처럼 드러나는 모델 하단은 잔여 결함 |
| normal | 이전 tangent detail originalScale×.35 유지. 출력 view N의 XY×1.65 후 normalize. OpenGL green invert=false. PNG 축소후 정규화, 무광 specular 계약 유지 |
| PNG / foot | variant0 374×370 foot(187,370), variant1 352×332 foot(176,332), variant2 382×350 foot(191,350). 표시 .5배, 높이185/166/175. hull/contact registry는 해당3건만 재산출 |
| 수광 실측 | 같은 100×103px ROI: near normal-vs-flat RGB차10.87783/255(이전7.79874); near luma64.32631/far40.57792. 캡처·수치 _out/MAP11-25Db/light-response.json. 면 수광은 더 분명하나 일부 냉색 수광 잔여 |
| perf 1회 | 1920×1080 field/arena 각600ticks, checks3/fail0. field p95 7.312ms/p99 7.623ms/176.794fps/draw148, arena p95 7.158ms/p99 7.593ms/175.778fps/draw136. 기존7.243/7.041 대비+.069/+.117ms. 약1~1.7% 차이, 단회·비동시 baseline이라 회귀 확정/개선 보증불가. 큰 악화는 미관측. 밀집전투 미측정 |
| 격리 / 동시 | 실제 게임 캡처·perf는 EXODUSER-map11-25Db-Isolated-20261021, project.godot 원byte 복원. 기존Godot81277 보존, 자체실행1개씩 총최대2. 초기 cwd 누락으로 R headless editor import가 착수되어 즉시 중단(exit130); R tracked INDEX/WORK 변화0 확인. R .godot 캐시 변경가능성은 남으며 완전 읽기전용 준수로 주장하지 않음. 실제 저장폴더 실행0 |
| 증거 | ~/exoduser-wt/_out/MAP11-25Db/captures/ABC_{field,west,east}.png 및 _1x.png. A=기존372a9c5a 실제Main 캡처, B=1ca4603f 실제Main 캡처(이전산출물 재사용), C=이번 실제Main. 각 원본1600×900/크롭320×270, 라벨24px만 외부 추가. resize/캡처색보정0. 실시간 위상/HUD 차이 잔여 |
| 판정 | **VISUAL VERDICT: RETOUCH**. B의 회분홍/낮은 대비 개선, 면 음영·노멀 반응 증가. 그러나 A보다 치열·눈구멍 표현이 거칠고, 특히 +20/+65°는 빈 뒷면/검은 받침 면적이 커짐. C가 A보다 확실히 좋다는 기준 미달. 승인품/완성품으로 승격하지 않음 |

MAP PRODUCTION REPORT (§23)

| 필드 | 결과 |
|---|---|
| STAGE / MASTER | CH1-1 MAP11-25Db, 기존 silhouette/regions/main route/side spaces 불변. GATE6 소재→4접지→8카메라→TECH |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH/major holes 변경0 |
| LARGE / MEDIUM | 기존 skull3만. 다른 source/composites/overlap/repetition/connections 유지 |
| GROUND | 모델 흙받침 보존 + 기존 접촉AO. 검은 평판/뒷면 결함 RETOUCH. contamination/floor 불변 |
| PLAYABLE | arenas/travel/breathing/threat/collision/route 불변. 벤치 실보행PASS. 밀집전투 가독성 미검수 |
| LANDMARK | primary/secondary 불변,tertiary skull3만 |
| CAMERA QA | field/SIDE L/SIDE R A/B/C와1x검수. START/EARLY/LATE/EXIT 미검수 |
| TECH QA | GPU render/import/capture/perf script오류0,normal반응 실측. web pageerror/404 N/A,새seam/route 변경0,loading PASS,performance 위 제한 |
| FILES | skull_25d PNG9+metadata,해당 hull/mask3건,offline render/finish,격리 QA harness,설계/ART/CHANGELOG. concurrent/unrelated tracked 변경0 |
| GIT | base1ca4603f 자식,경로지정add/hook유효. SHA/remote/worktree제거 DONE.txt. main/강제/reset/rebase/배포0 |
| VISUAL VERDICT / NEXT PASS | RETOUCH. 모델 backside/하단 형상·치열은 룩만으로 복원 한계. 새 생성/후속백로그 착수0 |


## 20. MAP11-21 — 1-1 지옥 관광 코스 (2026-10-21)

사용자 지정 기준 `46768e84e59f753baf2185f2bf45927349324d3a`(codex/map11-25db-20261021)에서 분기한 후보. **VISUAL VERDICT: RETOUCH**. §16~19.5의 패치12/평면 scatter/소품8/해골3배치·85%샤프닝은 이전 후보의 이력이다. 이번 후보의 현행은 아래15소품·6장면·21yaw다. 원본 웹 본편/PC 전투·보호설계는 변경하지 않았다.

### 20.1 장면과 광원

진행 순서는 START→서측 숲→서측 처형장→상단 갈림길→심장→관문이다. 주 전투면/기존 분기 동선과 외곽 mass는 보존하며, 모든 새 소품은 field에만 존재한다. arena 원점(0,-8000)의 R1700 내부에는 추가0. 원래8광원+아래6광원=14등록, 기존 화면 밖/space 컬링·최대4 pool+player1 cap 유지. 광원은 field에서만 켜지며 radius 사각형과 카메라의 교집합을 사용한다.

| 순서·장면 | 소품 | 카메라(Player 위치) | 광원 위치 | 반경 | RGB / 에너지 / 맥동 | 실물 광원·근거 |
|---|---|---|---|---|---|---|
| 1 숲 입구 | 꼬챙이 시체4 | (-200,3290) | (-410,3270) | 930 | (1,.46,.20) / .85 / .025 | 기존 횃불 PNG 재사용 |
| 2 매달린 숲 | 고치 나무3 | (-3070,1250) | (-3220,1230) | 1000 | (.92,.36,.19) / .88 / .025 | 고치 조직 생체 발광 연출; 고치 움직임 신규0 |
| 3 처형장 공터 | 고문 바퀴2+사슬 석주2 | (-3450,-800) | (-3510,-1050) | 900 | (1,.42,.16) / 1 / .025 | 기존 횃불 PNG 재사용 |
| 4 해골 길목 | 두개골 피라미드2 | (-1350,-1870) | (-1270,-2310) | 740 | (1,.43,.20) / .90 / .025 | 뼈 제단의 빛 웅덩이; 해골 자체 애니메이션0 |
| 5 심장 제단 | 피 대야1 | (-440,-2190) | (-600,-2460) | 610 | (1,.25,.13) / .95 / .025 | 기존 심장 제단 빛과 연계 |
| 6 보스룸 입구 | 창 울타리 피 구덩이1 | (-160,-3570) | (-540,-3880) | 650 | (1,.38,.15) / .86 / .025 | 관문 횃불+기존 관문 조명 |

`tour_layout.gd`가 좌표·variant·크기·충돌의 공통 SSOT. `field_recipe.gd`가 동일 ROWS를 `blocks_move=true/blocks_los=false` 원형 solid로 provider에 등록하므로 물리·이동 쿼리가 같은 발치를 쓴다. 기존 route clearance96와 anchor를 유지한다. 초기 배치의 3경로 침범은 수정; 최종 provider 검수 결과는 아래 기술 기록. field revision1 계약은 유지, content hash에는 새 solids가 포함된다.

| id | GLB/PNG 이름 | yaw | 발치 | 표시 높이 | 충돌 반경 | 장면 |
|---|---|---|---|---|---|---|
| 00 | hell_impaled_corpse | -20° | (-610,3460) | 245.0 | 27.0 | 1 |
| 01 | hell_impaled_corpse | 0° | (460,3200) | 230.0 | 27.0 | 1 |
| 02 | hell_impaled_corpse | 20° | (-850,3060) | 250.0 | 27.0 | 1 |
| 03 | hell_impaled_corpse | -20° | (200,2910) | 220.0 | 25.0 | 1 |
| 04 | tour_cocoon_tree | -20° | (-3200,1580) | 340.0 | 62.0 | 2 |
| 05 | tour_cocoon_tree | 0° | (-3400,1080) | 315.0 | 58.0 | 2 |
| 06 | tour_cocoon_tree | 20° | (-3300,650) | 325.0 | 60.0 | 2 |
| 07 | tour_torture_wheel | -20° | (-3870,-670) | 270.0 | 65.0 | 3 |
| 08 | tour_torture_wheel | 20° | (-2750,-1070) | 245.0 | 58.0 | 3 |
| 09 | tour_chained_pillar | -20° | (-3810,-1170) | 300.0 | 48.0 | 3 |
| 10 | tour_chained_pillar | 0° | (-3100,-700) | 275.0 | 45.0 | 3 |
| 11 | skull_pyramid | -20° | (-1500,-2370) | 200.0 | 72.0 | 4 |
| 12 | skull_pyramid | 20° | (-1730,-1810) | 190.0 | 68.0 | 4 |
| 13 | tour_blood_basin | 0° | (-600,-2390) | 170.0 | 75.0 | 5 |
| 14 | hell_spike_pit | 0° | (-530,-3770) | 200.0 | 105.0 | 6 |

### 20.2 렌더·팔레트·접지 계약

| 항목 | 현행 |
|---|---|
| 출처 | 사용자 제공 MagicLight Seedream 원화 → Meshy image-to-3D GLB → Godot offline 2.5D. 신규 AI 생성/과금0. source_manifest.json에 원본·GLB·PNG hash/규격 |
| 입력 | R/outputs/map11-art-proof-20261021/3d/의 지정7GLB. 파일은 읽기만, GLB/preview/depth는 runtime 리소스에 넣지 않음 |
| 렌더 | `godot/tools/map11_21_render.gd`: 1024² SubViewport, ortho(0,6,8), 고도36.86989765°,지면 압축.6, yaw -20/0/+20 각각3개. diffuse/normal/depth 동일 bbox crop. 7×3=21 diffuse+21 normal; AO용 depth는 _out/raw만 |
| 높이 | skull400 / cocoon680 / wheel540 / pillar600 / basin340 / corpse490 / pit400 raster px. 표의 표시 높이 대비2배를 기본으로 함; 실제 파일별 가로폭은 render.json/source_manifest.json |
| 키라이트 | view normalize(-.55,.72,.8), ambient.48+key.78×NdotL; rim RGB(.10,.075,.045), detail-normal strength=source*.35 |
| AO | depth 2/5/10px×8방향, bias.008/ramp.06/range.22/sigma.65 유지, strength.55→.35 |
| 그레이딩 | exposure1.85, 원 콘셉트의 녹색 key/명도≤.12 제외 median chroma gain clip .78~1.18. 파일별 RGB gain은 각look.json. saturation.90/contrast1.04/pivot.25/ceiling.94 |
| 발치 명도 | 하단65~100%에 dark-luma threshold.15, 최대lift.11×RGB(1,.87,.78). 검은 texel discard0·원래 alpha 보존 |
| 표면 | unsharp(.7,25%,threshold4), median3+Gaussian.28px로 고주파 잔점 완화. 전 후보85%보다 감소. 원GLB의 topology/UV 빈 면을 복구한 것은 아님 |
| 노멀 | view XY1.35×후 normalize, green반전0. CanvasTexture diffuse+normal, specular(.10,.08,.06)/shininess.12, linear+mip |
| 발치 | alpha≥32/255 convex hull bbox의 하단중앙을 foot에 정확히 맞춤. GroundContact.align; offset의 .94 보정 사용0, Y/4 절대 z정렬 유지 |
| 접촉AO | lower78% mask, pad2%height, maxfilter.8%height/gaussian.5%height, fade77~90%. 최대512×256. sprite와 같은 crop/scale/rotation, 바닥z-2987/alpha.58. 틈0, 다른 actor 위에 그리는 shadow0 |
| 바닥 | patch_bone_pile / patch_bloodpool_roots / patch_cracked_flesh_slab 배치 전부0, FloorPatch와 GroundStory scatter 생성0. 파일은 복구용으로 보존. 기존 생체 바닥/동맥 불변. 뼈는 GLB 발치 조각만 |
| 횃불 | 기존 diablo_field_torch_base_v1.png·flame_v1.png 재사용, 3실물. base alpha bbox/표시높이125/foot=light+(0,90). flame4×2/셀418×472/8프레임9fps/native AnimatedSprite2D, offset(18,-87)/scale.12. 작은 시각 fixture이며 신규 이동장애물0 |
| 실행 | 모든 import/render/capture/perf cwd는 ~/exoduser-wt/MAP11-21. 실제 저장폴더 사용0, EXODUSER-map11-21-Isolated-20261021(기준before만 기존25Db 격리명)으로 실행 후 project.godot 원byte복원. 기존81277 보존, 자체1개씩 동시최대2 |
| 런타임 경계 | PNG preload만; GLB runtime0, 틱의 목록API/ResourceLoader 추가0. tools/tests export제외 유지. PC/Main/Player 코드수정0, 게임UI 개발문구 추가0 |

### 20.3 시각·기술 검수와 인수 경계

실제 Main 1600×900 6장면+각1x crop, 기준46768e84와 동일 field/west/east 카메라3뷰 before/after, 별도 발치2뷰+320×270 원배율 crop. 비교는 스케일/색보정 없이 side-by-side. camera zoom.70/offset(0,-180), 실시간 조명 위상·HUD/RNG 시작 상태 차이는 남는다. 기준3뷰는 이번 worktree에서 변경 전 직접 캡처했다. 저장 경로 `~/exoduser-wt/_out/MAP11-21/captures/`.

**RETOUCH 근거:** 장소별 스토리 소재는 구분되고 평면 뼈장판이 사라졌으나, skull pedestal의 평평한 검은 면·blood basin의 과포화 붉은 면·일부 pillar/wheel GLB의 거친 세부/빈 면·매달린 숲의 반복 실루엣이 남는다. PNG 룩 조정만으로 원GLB 형상 한계를 해결했다고 주장하지 않는다. 최종 인수 PASS/AAA 완성/Steam 배포가 아니다.

벤치와 최종 assertion 수치는 _out/MAP11-21/perf.json 및 DONE.txt를 따른다. 기존 PID81277 공존 조건의 macOS GL 1920×1080/240cap/60Hz, field/arena 각각 실제 Player 입력4방향×150=600틱을 단회 측정. Windows/밀집전투/GPU timestamp/실행중인 다른창 자동갱신은 미검수.

### 20.4 MAP PRODUCTION REPORT

| 구역 | 보고 |
|---|---|
| STAGE / MASTER | CH1-1 관광 코스. 기존 silhouette·주동선·side pocket·arena/breathing/travel void 유지. DETAIL GATE6→4접지→8카메라→TECH |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH와 기존 major hole 변경0. 이번 대형외곽 제작 PASS 주장이 아님 |
| LARGE / MEDIUM | 기존 연결/composite/overlap 불변. 신규는 장면별7종15개,3yaw씩 렌더. 반복 고치나무 실루엣 잔여 |
| GROUND | 평면 패치·scatter 제거, 발치bbox/AO 고정. GLB pedestal 잔여 RETOUCH |
| PLAYABLE | 기존 route/anchor clearance96 보존, 새 발치 원만 추가. field/arena 실보행·관문은 최종perf 검수, 밀집전투 미검수 |
| LANDMARK | 기존primary heart 유지, secondary6장면 소품과 주변광으로 연결. 중앙 combat void 신규 배치0 |
| CAMERA QA | START/EARLY=입구·매달린숲; SIDE L=처형장; LANDMARK=해골·심장; EXIT=구덩이. 기존field/west/east3뷰 전후. arena 신규캡처0 |
| TECH QA | route/collision/normal/depth/ground gap 및 성능 최종 단회 검수. pageerror/404=N/A native. 바닥 청크/seam 원본변경0 |
| FILES | tour_25d PNG/metadata, tour_layout/textures, product_detail, field_recipe, contact data/masks, offline tools/capture/benchmark, 본설계·ART·CHANGELOG. 타인 WIP 수정0 |
| GIT | 전용branch만 정상hook commit/push 후 원격SHA 읽기대조, worktree 제거. merge/main push/force/reset/rebase/deploy0 |
| VISUAL VERDICT | **RETOUCH** |
| NEXT PASS | 원 GLB의 빈 면/검은 pedestal/대야 재질 복구가 필요. 새 생성·다음백로그 자동착수0 |


최종 단회 검수: **84 checks / 0 failures**, field p95 **7.594ms** / arena **7.146ms**, 각각≤8.33ms PASS. field p99 10.878ms / arena p99 8.196ms; 실보행·provider route·15원형충돌·노멀·bbox 틈0·Y/4·관문 PASS. 재측정0. 기존81277 공존 총최대2. 최종 캡처·벤치 SCRIPT/Parse/ERROR0(기존camera physics 경고만). 초기 배치진단/빈crop 오류는 수정 이력 로그에 보존했으며 최종PASS와 구분. torch 실물은 벽부착형 원화여서 단독 지지대 설득력도 RETOUCH 항목이다.


### 20.5 MAP11-21b — 관광 무리·받침 제거 보정 (2026-10-21)

기준 `129281f1dad07bc4a92fbdf306054cc488c192af`, 전용 `codex/map11-21b-20261021`. §20.1~20.4의 15배치/받침보존/sat.90/contrast1.04/이전 좌표는 기준 후보 이력이며 이 절이 현행이다. R은 소스 읽기만, Godot 실행·import는 MAP11-21b worktree/격리 user dir만 사용한다.

| 항목 | 현행 계약 |
|---|---|
| 무리 | 입구 시체4 / 고치3 / 바퀴2+사슬2 / 해골2 / 피대야+해골2 / 구덩이+사슬2 = 17소품. 대표 고치·바퀴·해골·대야 기존 높이×1.3. 추가 해골145/사슬255 |
| 바닥판 제거 | offline shader world_height < -bounds.size.y×.5 + bounds.size.y×cut_ratio 에서 diffuse/normal/depth 모두 discard. GLB 원본 byte 보존. cocoon.065/skull.12/wheel.045/pillar.04/basin.035/corpse.03/pit.02. 원판을 제거하고 높이 위 뿌리·뼈만 잔존. 재crop·foot/hull·contactAO21 재생성 |
| 톤 | saturation1.06/contrast1.10/pivot.25/ceiling.94. exposure1.85/normalXY1.35/AO.35/detailnormal source×.35/median3+blur.28/unsharp(.7,25,4) 유지 |
| 피대야 | RGB red>green×1.8 및 red>blue×1.6 픽셀만 RGB×(.42,.75,.85)+(.025,.008,.008), 순색 빨강 감쇠. source topology/UV 빈면 복구 주장은 아님 |
| 발치·충돌 | 기존 원형 발치 반경 유지, 추가2개44/45. 모든 ROWS는 시각·provider 공통, Y/4 정렬·opaque bbox 하단 중앙·접촉AO alpha.58 유지. route/anchor clearance96/arena R1700 보존 |
| 빛 | 장면별6 pool의 대표 무리 인접 좌표 조정. 기존8+6=14등록/활성pool4+player1 cap 유지. 아래 SCENES 원문이 좌표·색·반경·에너지 SSOT, 각pulse.025 |
| 런타임 | PNG diffuse/normal/contact만. 3D runtime0·tick 목록API/ResourceLoader 추가0·PC전투/Main/Player/UI 개발상태문구 변경0 |
| 실행 | EXODUSER-map11-21b-Isolated-20261021, project.godot 실행용 변경은 원byte 복원 후 commit 제외. PID81277 조작0 |
| 캡처 | _out/MAP11-21b/captures/. 기준129281f1의 기존 after_01~06을 before로 복사, 동일6카메라 after1600×900. compare는 양측 원배율3200×900, 1x320×270 각쌍은640×270. review_1600x900은 50% 축소 개요임을 표시. 발치 after_foot_04/11_1x 2장. 실시간광원/HUD/RNG 차이 잔존 |

| id | asset | yaw variant | foot | height | radius | scene |
|---|---|---|---|---|---|---|
| 0 | hell_impaled_corpse | 0 | -650,3450 | 245.0 | 27.0 | 0 |
| 1 | hell_impaled_corpse | 1 | -400,3300 | 230.0 | 27.0 | 0 |
| 2 | hell_impaled_corpse | 2 | -820,3200 | 250.0 | 27.0 | 0 |
| 3 | hell_impaled_corpse | 0 | -510,3060 | 220.0 | 25.0 | 0 |
| 4 | tour_cocoon_tree | 0 | -3210,1450 | 442.0 | 62.0 | 1 |
| 5 | tour_cocoon_tree | 1 | -3440,1240 | 409.5 | 58.0 | 1 |
| 6 | tour_cocoon_tree | 2 | -3220,1010 | 422.5 | 60.0 | 1 |
| 7 | tour_torture_wheel | 0 | -3850,-800 | 351.0 | 65.0 | 2 |
| 8 | tour_torture_wheel | 2 | -3680,-1130 | 318.5 | 58.0 | 2 |
| 9 | tour_chained_pillar | 0 | -3930,-1260 | 300.0 | 48.0 | 2 |
| 10 | tour_chained_pillar | 1 | -3700,-650 | 275.0 | 45.0 | 2 |
| 11 | skull_pyramid | 0 | -1500,-2370 | 260.0 | 72.0 | 3 |
| 12 | skull_pyramid | 2 | -1740,-2250 | 247.0 | 68.0 | 3 |
| 13 | tour_blood_basin | 1 | -600,-2390 | 221.0 | 75.0 | 4 |
| 14 | hell_spike_pit | 1 | -530,-3770 | 200.0 | 105.0 | 5 |
| 15 | skull_pyramid | 1 | -810,-2520 | 145.0 | 44.0 | 4 |
| 16 | tour_chained_pillar | 2 | -760,-3920 | 255.0 | 45.0 | 5 |

장면별 SCENES (GDScript 원문; 값 단일 계약):
```gdscript
[
 {"id":"01_entrance","name":"숲 입구","camera":Vector2(-200,3290),"light":Vector2(-560,3240),"radius":930.0,"color":Color(1.0,.46,.20),"energy":.85,"source":"횃불"},
 {"id":"02_hanging_forest","name":"매달린 숲","camera":Vector2(-3070,1250),"light":Vector2(-3290,1250),"radius":1000.0,"color":Color(.92,.36,.19),"energy":.88,"source":"생체 발광"},
 {"id":"03_execution","name":"처형장 공터","camera":Vector2(-3450,-800),"light":Vector2(-3770,-990),"radius":900.0,"color":Color(1.0,.42,.16),"energy":1.0,"source":"횃불"},
 {"id":"04_skull_fork","name":"해골 길목","camera":Vector2(-1350,-1870),"light":Vector2(-1570,-2400),"radius":740.0,"color":Color(1.0,.43,.20),"energy":.90,"source":"뼈 제단"},
 {"id":"05_heart_altar","name":"심장 제단","camera":Vector2(-440,-2190),"light":Vector2(-660,-2490),"radius":610.0,"color":Color(1.0,.25,.13),"energy":.95,"source":"심장 제단"},
 {"id":"06_boss_entrance","name":"보스룸 입구","camera":Vector2(-160,-3570),"light":Vector2(-650,-3830),"radius":650.0,"color":Color(1.0,.38,.15),"energy":.86,"source":"관문 횃불"}]
```


#### 최종 검수 / MAP PRODUCTION REPORT

| 구역 | 보고 |
|---|---|
| STAGE / MASTER | CH1-1 관광코스 보정. 기존 silhouette/regions/main route/side spaces 보존. GATE6 무리→4 접지→8 실카메라→TECH |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH/major holes 변경0 |
| LARGE / MEDIUM | 기존 외곽 composite/overlap/connections 보존. 소품17개를 4/3/4/2/2/2 무리로 연결. 고치 가지 중첩·깊이 차이 확보, 같은 source 반복은 잔존 |
| GROUND | 고치·해골의 둥근 털뭉치 바닥판 제거 확인. 실제 발치04/11 1x에서 뿌리/뼈·접촉AO로 바닥 접합. flat patches/scatter0 유지. 구덩이의 넓은 평면 가장자리·원GLB 빈면 잔존 |
| PLAYABLE | 기존 arenas/travel/breathing/threat 유지. provider route/anchor clearance96 및17 발치/관문/실제 보행 검수 통과. 밀집전투 미검수 |
| LANDMARK | 기존 primary heart 유지; 6 secondary 장면 대표소품1.3배/주변 동반소품·국소광 |
| CAMERA QA | START/입구4(외곽 가림 일부), EARLY/고치3, SIDE L/바퀴+사슬4(1개 외곽 가림), LANDMARK/해골2·심장대야+해골2, EXIT/구덩이+사슬2. 6곳 before/after 및1x 확보. arena 신규 캡처 없음 |
| TECH QA | 단회96 checks/0 failures. field p95 7.344ms/p99 7.861ms/draw133, arena p95 7.003ms/p99 7.495ms/draw136. 각 p95≤8.33ms PASS, 전 sample frame focus_lost0. 1920×1080/macOS GL/60Hz/240cap. 4방향×150틱 입력; focus settle30 render frames가 wall/tick 집계에 포함돼610/609 ticks, p95는 sampler 연결 후 프레임 간격만. field/arena 각1회, 재측정0 |
| 오류·환경 | 최종 import/render/capture/perf SCRIPT/Parse/ERROR 로그 검사. 기존 Camera2D physics warning 유지. PID81277 조작0. 성능 측정 시 기존81277+자체bench만. 자체 capture 종료 경계에서 benchmark를 시작했으므로 전체 실행의 최대 동시 수를 연속감시로 입증하지 않음. web pageerror/404=N/A native, floor seam원본변경0, loading/normal/foot/Y-depth PASS |
| FILES | tour_25d PNG/metadata/hulls/masks, tour_layout, offline render/grade, capture/benchmark/focus evidence, 설계·ART·CHANGELOG. 타인WIP/PC core변경0 |
| GIT | 기준129281f1 자식의 전용branch. 경로지정add·정상hook commit/push·remoteSHA 대조 후 worktree 제거, SHA는 _out/MAP11-21b/DONE.txt. main push/force/reset/rebase/배포0 |
| VISUAL VERDICT | **RETOUCH**. 무리 구성과 고치·해골 바닥판 제거는 개선 확인. 구덩이의 평평한 림·대야/해골 일부 빈면·원GLB 거친 세부와 가림은 잔여, 완성품 PASS 아님 |
| NEXT PASS | 남은 GLB UV/빈면·구덩이 접합과 외곽 가림 개선 필요. 이번 요청 외 신규생성/후속백로그 착수0 |


### 20.6 MAP11-21c — 관광 코스 2차 보정 (2026-10-21)

기준 `06bae2f2f4b172481313fe865df572412fd3c7ba`, 전용 `codex/map11-21c-20261021`. 이 절이 현행이며 §20.5 수치는 당시 이력이다. 합격 기준은 6장면 모두 02 매달린 숲 수준인지 눈으로 판단한다.

| 항목 | 현행 / 검수 |
|---|---|
| 해골 톤 | 기존 concept/AO/exposure/sat1.06/contrast1.10 후 luminance(.2126,.7152,.0722) 기준 chroma×.20, RGB tint(1.02,1,.93). 탁한 아이보리·회갈색. 3yaw PNG diffuse/normal/contact 재생성 |
| 해골 절단 | cut ratio .12→.055, cut_y=-bounds.size.y×.5+bounds.size.y×.055. 바닥판 감소는 유지하나 낮은 피라미드 내부의 평면/빈 면 인상은 남음. 원GLB 바이트 보존, 완전 복구 주장0 |
| 피대야 | 기존 red gain(.42,.75,.85)+bias(.025,.008,.008) 후 chroma×.72. normal·contact 규격 보존 |
| 광원 | 04 Color(.86,.80,.68)/energy.58 (이전1,.43,.20/.90), 05 Color(.90,.46,.36)/energy.72 (이전1,.25,.13/.95). radius740/610 불변. 기존8+6 pool/활성4+player1 유지. 아래 SCENES가 전체 수치 |
| 무리 | 총17/6무리 유지. 입구4 높이×1.3 및 간격 축소. 처형장4 x+100~150으로 외곽가림 감소, 사슬1 일부가림 잔존. 06 사슬255→331.5 및 발치(-700,-3890), 구덩이와 무리 연결. 02 무변 |
| runtime | PNG만, GLB는 offline render 도구에서만. 틱 목록API·ResourceLoader 추가0/PC전투코어·UI변경0 |
| 실행 | 격리 EXODUSER-map11-21c-Isolated-20261021. project.godot은 실행 후 원byte 복원·commit제외. R 읽기만. 자체 Godot는 각 subprocess 완료 후 다음 시작; 각 실행 전 기존PID81277 1개 확인(processes.log). 초기 headless import는 --quit 누락으로 import 완료 뒤 종료신호 후 정상 --quit 재실행, 런타임/벤치 중복0 |
| 캡처 | _out/MAP11-21c/captures/. before는 기준06bae2f2의 MAP11-21b after PNG를 동일byte 복사. after 6곳1600×900. compare 각3200×900/무축소, before/after_1x320×270 및 compare_1x640×270. foot04/11 추가. manifest hash/크기. 실시간HUD/RNG/광원 위상차이 잔존 |
| 단회 검수 | 96checks/0fail. field p95 7.581ms/p99 8.742ms/focus_lost 0/draw 133.0; arena p95 7.286ms/p99 7.752ms/focus_lost 0/draw 136.0. 1920×1080/macOS GL/240cap/60Hz, 실제Player 4방향×150틱/field+arena 각1회. p95≤8.33ms 및 전표본 focus유지 PASS. 밀집전투/Windows/GPU timestamp 미검수 |

| id | asset | yaw variant | foot | height | radius | scene |
|---|---|---|---|---|---|---|
| 0 | hell_impaled_corpse | 0 | -580,3400 | 318.5 | 27.0 | 0 |
| 1 | hell_impaled_corpse | 1 | -400,3260 | 299.0 | 27.0 | 0 |
| 2 | hell_impaled_corpse | 2 | -690,3190 | 325.0 | 27.0 | 0 |
| 3 | hell_impaled_corpse | 0 | -490,3080 | 286.0 | 25.0 | 0 |
| 4 | tour_cocoon_tree | 0 | -3210,1450 | 442.0 | 62.0 | 1 |
| 5 | tour_cocoon_tree | 1 | -3440,1240 | 409.5 | 58.0 | 1 |
| 6 | tour_cocoon_tree | 2 | -3220,1010 | 422.5 | 60.0 | 1 |
| 7 | tour_torture_wheel | 0 | -3750,-820 | 351.0 | 65.0 | 2 |
| 8 | tour_torture_wheel | 2 | -3600,-1090 | 318.5 | 58.0 | 2 |
| 9 | tour_chained_pillar | 0 | -3780,-1190 | 300.0 | 48.0 | 2 |
| 10 | tour_chained_pillar | 1 | -3550,-700 | 275.0 | 45.0 | 2 |
| 11 | skull_pyramid | 0 | -1500,-2370 | 260.0 | 72.0 | 3 |
| 12 | skull_pyramid | 2 | -1740,-2250 | 247.0 | 68.0 | 3 |
| 13 | tour_blood_basin | 1 | -600,-2390 | 221.0 | 75.0 | 4 |
| 14 | hell_spike_pit | 1 | -530,-3770 | 200.0 | 105.0 | 5 |
| 15 | skull_pyramid | 1 | -810,-2520 | 145.0 | 44.0 | 4 |
| 16 | tour_chained_pillar | 2 | -700,-3890 | 331.5 | 45.0 | 5 |

SCENES 현행 원문:
```gdscript
[
 {"id":"01_entrance","name":"숲 입구","camera":Vector2(-200,3290),"light":Vector2(-560,3240),"radius":930.0,"color":Color(1.0,.46,.20),"energy":.85,"source":"횃불"},
 {"id":"02_hanging_forest","name":"매달린 숲","camera":Vector2(-3070,1250),"light":Vector2(-3290,1250),"radius":1000.0,"color":Color(.92,.36,.19),"energy":.88,"source":"생체 발광"},
 {"id":"03_execution","name":"처형장 공터","camera":Vector2(-3450,-800),"light":Vector2(-3770,-990),"radius":900.0,"color":Color(1.0,.42,.16),"energy":1.0,"source":"횃불"},
 {"id":"04_skull_fork","name":"해골 길목","camera":Vector2(-1350,-1870),"light":Vector2(-1570,-2400),"radius":740.0,"color":Color(.86,.80,.68),"energy":.58,"source":"뼈 제단"},
 {"id":"05_heart_altar","name":"심장 제단","camera":Vector2(-440,-2190),"light":Vector2(-660,-2490),"radius":610.0,"color":Color(.90,.46,.36),"energy":.72,"source":"심장 제단"},
 {"id":"06_boss_entrance","name":"보스룸 입구","camera":Vector2(-160,-3570),"light":Vector2(-650,-3830),"radius":650.0,"color":Color(1.0,.38,.15),"energy":.86,"source":"관문 횃불"}]
```

MAP PRODUCTION REPORT

| 구역 | 보고 |
|---|---|
| STAGE / MASTER | CH1-1 지옥 관광. 기존 silhouette/regions/main route/side spaces 보존. GATE6 무리→4 접지→8 camera→TECH |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH/major holes 변경0 |
| LARGE | 원본7GLB·기존PNG 사용. 입구크기/처형장간격/관문사슬 보정. 02 source반복·가지 composite 유지 |
| MEDIUM | 기존연결 유지. 처형장 가림 감소, 해골 내부 평면 잔여 |
| GROUND | alpha접촉AO/hull 재생성. 바닥오염/그림자 원본 유지. 해골절단낮춤; 구덩이 평면림 잔여 |
| PLAYABLE | arenas/travel/breathing/threat 기존. route/발치충돌/실제보행/관문이행 PASS. 밀집전투 가독성 미검수 |
| LANDMARK | primary heart 유지, secondary6무리, tertiary 기존외곽 |
| CAMERA QA | START01 크기개선/얇은 반복소재 잔여. EARLY02 승인수준 보존. SIDE L03 외곽가림 감소/상단사슬부분가림. LANDMARK04 뼈색개선/내부평면 잔여,05 저채도 개선/거친 source 잔여. EXIT06 사슬스케일 개선/구덩이 평면림 잔여. MAIN ARENA/LATE 신규시각판정 없음 |
| TECH QA | route/collision/loading/normal/foot/Ydepth/p95 PASS. native pageerror/404 N/A. floorseam 원본불변. 로그 SCRIPT/Parse/ERROR0, 기존Camera2D physics warning. import/capture/bench순차 실행 |
| FILES | tour PNG/meta/hulls/masks/layout/offline tools/격리 capture·benchmark/설계서·SSOT·ART. 타인WIP변경0 |
| GIT | 전용branch 경로지정add/정상hook/비강제push 및 remoteSHA대조 후 worktree제거. 최종SHA _out/MAP11-21c/DONE.txt. main push/merge/reset/rebase/배포0 |
| VISUAL VERDICT | **RETOUCH**. 6장면 모두 02 수준에는 미달. 특히04 내부평면과06 구덩이 평면림,01 얇은 반복소재,03 일부가림 |
| NEXT PASS | 04 내부면 보강·06 림접합·01 덩어리연결 필요. 이번작업에서 신규생성/후속백로그 착수0 |


### 20.7 MAP11-21d — 지옥 관광 코스 3차 보정 마감 (2026-10-21)

기준 `2ab6eaea2da9b16699113be883b226d2800eeece`, 전용 `codex/map11-21d-20261021`. **이 절이 현행이며 §20.6 이하 수치는 이력**이다. 새 생성 없이 기존 GLB의 offline PNG 및 기존 뿌리 PNG를 사용했다. 6장면 모두 02 수준이라는 최종 합격은 **미달(RETOUCH)**이다.

| 대상 / id | 현행 변경 | 보존 / 적용 위치 |
|---|---|---|
| 04 왼쪽 피라미드 / row12 | yaw variant2(+20°) → variant0(-20°), 속 빈 내부면 변형 제외 | foot(-1740,-2250), height247, radius68; 정상 variant0 PNG 재사용. 뼈 chroma.20·cut.055 유지. 두 더미의 실루엣 유사성은 남음 |
| 06 죄수 석주 / row16 | variant2 yaw +20° → 0°. offline shader에서 ALPHA=1 출력을 없애 불투명 geometry depth 기록; 잘못 겹치던 면 정렬 해결 | foot(-700,-3890), height331.5/radius45 유지. diffuse/normal 3번째만 교체, variant0/1 PNG 동일byte 보존하여 03 무변. metadata/hull/contact/manifest 동기화 |
| 06 창 울타리 피 구덩이 / row14 | height200 → 300(1.5배), radius105 → 157.5(1.5배), foot(-530,-3770) → (-590,-3770) | 서측으로60 이동, 중앙 접근로 확보. authoritative route sweep/발치 충돌 검증 통과. source의 평면림·순적색 인상은 잔존 |
| 게이트 뒤 직선 경계 | `gate_organic_recess.png` 3072×640 RGBA 정적 합성, world4800×900/center(0,-4250), z=-2986 | 기존 prop_g_root 9겹과 어둠의 불규칙 smoothstep 전이. 직선 바닥 경계를 덮고 기존 큰 나무/게이트 유지. collision0·tick 작업0·추가 PNG1/최대1 draw. RGBA 원시7.5MiB, GPU 실측아님 |
| recess bake 공식 | y,x grid640×3072; edge=610+15sin(x/143)+8sin(x/49), a=clamp((edge-y)/230,0,1), alpha=255a²(3-2a), RGB(22,12,14) | root crop→thumbnail660×330×9, x=370i-220/y=260+23(i%3), 홀수mirror. root feather smoothstep(clamp((1-max(abs(2u-1),abs(2v-1)))/.45,0,1))×.55. RGB=(23,12,14)+L×(.18,.10,.10), L=.299R+.587G+.114B. `map11_21d_recess.py` 재현 |
| 01/02/03/05 | 배치/PNG/광원 변경0 | 01·02 기존 사용자 합격 유지. 03·05는 실제 화면 비교 확인만 수행 |
| 실행 계약 | 격리 `EXODUSER-map11-21d-Isolated-20261021`, R 파일변경0. project.godot 실행 후 원byte 복원/commit제외 | Godot 기존1+자체1 이하, offline/import/capture/bench 순차. 최초 headless import SIGSEGV(폰트) 후 GUI import 성공, 이후 증분 import 성공. 기존 Godot 강제종료0 |
| 런타임 계약 | PNG만 사용; GLB 로딩은 offline tool에만 존재 | tick 목록API/ResourceLoader 추가0, UI 개발문구0, PC전투코어0, 실제 저장 폴더 접근0 |
| 캡처 | `~/exoduser-wt/_out/MAP11-21d/captures/` | before는 기준2ab6eaea의 21c after 동일byte 복사. after6장1600×900+각1x320×270. compare3200×900/compare_1x640×270, 무축소. manifest SHA256/크기. HUD/RNG/광원위상은 비결정적 |
| 단회 관련검수 | 96checks/3fail(93pass) | route/17props/foot/normal/Ydepth/collision/실제관문이행 통과. field p95 예산1건 및 field/arena 포커스2건 실패. 관련 테스트·벤치 재시도0 |
| 성능 / field | p95 **9.530ms**, p99 11.474ms, draw132, focus_lost_frames1648 | 목표8.33ms 초과. 612physics ticks/1678render frames. foreground 요청에도 창 포커스 미유지, 포커스 유지 조건 성능판정 불가 |
| 성능 / arena | p95 **7.212ms**, p99 7.640ms, draw136, focus_lost_frames1749 | 610physics ticks/1779render frames. 수치 예산내이나 포커스 조건 실패이므로 성능검수 PASS 선언하지 않음 |
| 측정 한계 | macOS GL /1920×1080/240cap/60Hz, 기존 Godot1 공존, 실제 Player4방향×150틱 | 단회 실행만. Windows/밀집전투/GPU timestamp 미검수. 코드 변경에 따른 성능 회귀라고 단정하지 않음 |

MAP PRODUCTION REPORT

| 구역 | 보고 |
|---|---|
| STAGE / MASTER | CH1-1. 기존 silhouette/6regions/main route/side spaces 유지. GATE6 랜드마크→4 ground→8 camera→TECH |
| OUTER MASS | LEFT/RIGHT/SOUTH 유지, TOP의 직선 경계는 뿌리+암부 전이 PNG로 가림. 새 major hole 없음 |
| LARGE | 기존7GLB/PNG 보존, 06 variant2만 정면 재렌더. 04 정상 형태 재사용, 동일 실루엣 반복은 잔여 |
| MEDIUM | 게이트 뒤 기존 나무 mass와 root/dark recess 연결. 무작위 scatter0 |
| GROUND | 기존 alpha-contact/오염 유지. 06 신규 PNG 하단 feather로 연결, 초기 검은 덩어리 캡처는 폐기하고 최종본으로 교체 |
| PLAYABLE | 주요 arena/travel/breathing/threat 보존. 서측 pit 1.5배/60좌측 이동, route/collision/실제보행/관문 PASS. 밀집전투 가독성 미검수 |
| LANDMARK | primary heart 유지, secondary6무리/17소품, tertiary 외곽 유지 |
| CAMERA QA | START01 기존승인 유지. EARLY02 비교기준 유지. SIDE L03 일부외곽가림·재질거침으로 RETOUCH. LANDMARK04 내부빈면 해결/반복형태잔여,05 저채도 조화는 유지하나 대야·작은더미 source 질감차로 RETOUCH. EXIT06 죄수정면/크기/직선경계 해결, pit 평면림·진한 적색과 죄수암부 가독성은 RETOUCH. MAIN ARENA/LATE 새 시각검수 없음 |
| TECH QA | route/collision/foot/normal/Ydepth/loading PASS. native pageerror/404 N/A. 06 기존 직선 seam 은폐. runtime SCRIPT/Parse/ERROR0, 기존 Camera2D interpolation warning. perf/포커스 FAIL |
| FILES | 본인 layout/product_field_view/offline tools/variant2 PNG+metadata/contact+격리검수스크립트/설계서·SSOT·ART·CHANGELOG. 타인 변경0 |
| GIT | 지정branch 정상hook/경로add/비강제push, remoteSHA 확인 후 worktree제거. SHA는 _out/MAP11-21d/DONE.txt. main반영/배포0 |
| VISUAL VERDICT | **RETOUCH** — 6장면 모두02수준에는 미달. 사용자 승인01/02를 취소하는 판정 아님. 이번 지시 보정 마감본을 제출하되 전체 아트/성능 합격으로 표시하지 않음 |
| NEXT PASS | 총괄 인수검토. 03가림/05재질/06림·암부 및 포커스 유지 성능검수는 잔여. 이번세션 후속백로그 착수0 |
## 19. MAP11-PERF — 성능 원인 분리·접촉 마스크 아틀라스 (2026-10-21)
기준은 `codex/map11-20-20261021`의 **372a9c5a69884b76a568e6f94504a9b089aabb91**(접지 수정 포함), 반영 branch는 `codex/map11-20p-20261021`이다. §17~18의 수치는 당시 이력이다. 이번 변경은 접촉 그림자의 텍스처 바인딩만 공용 아틀라스로 바꾼다. 소품 원화·패치·접지 위치·alpha·정렬·광원·충돌·PC 전투 코어는 그대로다.

### 19.1 원인 분리와 측정 조건

- 최초 단독 1회: 수정 기준본 field **9.681ms FAIL**, arena **7.159ms PASS**. 당시 포커스 이벤트는 미기록이다. 최초 import가 불완전하여 측정 진입 전에 실패한 실행은 별도 `baseline/run.log`에 보존했고, 유효 측정은 `baseline/measured.log`이다.
- 이후 사용자 추가 지시로 **PID 81277 공존**을 고정 배경 조건으로 바꿨다. 해당 Godot(인자 없음, 08:11:48 시작)은 종료/변경하지 않았다. 우리 Godot는 항상 1개만 추가했다. 각 실행의 `process-monitor.json`에 두 PID를 기록했다.
- Apple M5 Pro / macOS 26.6.2(25G83) / AC / Godot 4.7.2 GL Compatibility / render 1920×1080 / 240 cap / physics 60Hz. 실제 Main·intro 완료·5적 fixture, 실제 Player 네 방향 각 150틱, 공간별 600틱. 모든 절대치는 해당 기기·현재 실행 조건의 프레임 간격 p95이며 GPU timestamp가 아니다.
- 원본 `capture_map11_hell_props.gd`의 **정착 35틱**과 측정 본문은 유지했다. 새 `benchmark_map11_perf.gd`는 이를 상속하여 A/B를 측정 전에 1회 적용하고, 측정 밖에서 노드/AABB를 조사한다. 포커스 이벤트는 Window 신호로 기록하므로 틱 목록 API·ResourceLoader 추가가 없다. 기본 비교는 공간별 시작 전에 창을 foreground로 요청하며, `--keep-focus`는 요청을 생략한다.
- 탐색 `fixed-*` 8회에는 원본보다 정착 35틱이 더 있었음(총 70틱)을 발견했다. 해당 값은 별도 탐색으로 분리하고 최종 35틱 비교에 섞지 않았다. 모든 실패·이전 값도 `all-measurements.json`에 남겼다. 새 native 캐릭터의 스탯/속도와 실제 경로 좌표는 실행 JSON에 보존했다. 작은 ms 차이의 통계적 우열을 주장하지 않는다.

| 조사 축 | 관측·근거 | 판정 / 조치 |
|---|---|---|
| 신규 세로소품 3종 | skull 1024×1003 / impaled 549×1024 / pit 1024×891. 원본 mipmaps=true, LINEAR_WITH_MIPMAPS. alpha=0 영역 각각 47.0% / 69.1% / 40.7% | 원본 크기·filter 유지. 절반 해상도 탐색 10.968/7.446ms는 포커스 미기록·초기 조건 혼재라 개선 근거로 채택하지 않음 |
| 소품·PointLight2D | 조명 제외 탐색 7.367/7.123ms, 동일색 셰이더 7.611/7.537ms(둘 다 70틱). 35틱 alpha=0 discard는 before 7.304/7.274 → 7.520/7.467ms | 조명/색상 변경 및 discard 셰이더 채택 안 함. 8개 pool·최대 4개 pool+player 설정 유지. 큰 텍스처 조명 비용을 단일 원인으로 확정 못함 |
| 반투명 패치 12개 | 35틱 patch OFF에서 draw139/136으로 줄었지만 9.531/8.437ms, 종료 시 두 공간 모두 unfocused | 패치 제거는 복구책이 아님. 패치 모양·원본·alpha·조명 유지 |
| 접촉 mask 252 instance / 16종 | contact OFF 탐색(70틱)은 field draw148→137, p95 7.421ms. mask는 기존에도 unshaded | 텍스처 전환 감소가 가능한 확정 비용. 픽셀/치수 보존 공용 atlas를 채택, instance/레이어/접지 계약 유지 |
| 정렬·노드 | field 657 sprite / arena 217 sprite(설정 조사), 세로 254. 정적 absolute z=y/4. runtime update는 기존 cached row 사용 | 정렬 노드 수·기하 변경 없음. 새 per-tick 열거/정렬/리소스 로딩 없음 |
| 포커스/외부 상태 | patch OFF 실패 및 제품 첫 검수 arena 실패에 focus loss 기록. 첫 제품검수 field7.345 / arena9.534ms, arena focus_exited 기록 보존 | 정상 포커스 대조에서 before도 이미 예산 PASS. 과거 10.598/초기9.681ms의 단일 GPU 원인을 확정한 것이 아님. focus/외부 실행 상태가 혼입된 회귀 값과 정상 포커스 값을 분리 |
| 최종 atlas 효과 | draw field148→142 / arena136→127, objects254/249 그대로 | draw 감소는 확정. p95의 유의한 단축이나 원인 100% 제거를 주장하지 않음. 아래 최종본 양 공간 예산 PASS 확인 |

**아래 모든 행은 PID 81277 공존, 공간별 600틱·35틱 정착이다.** draw는 측정 종료 프레임의 field/arena snapshot이다. `exact-*`는 foreground 강제 없이 현재 포커스 유지; `atlas-*`, `confirm-*`, `final-product`는 시작 시 foreground 요청 및 이벤트 기록. 손실 실행을 숨기거나 통과 값으로 덮어쓰지 않았다.

| 순서/조건 | field p95 ms | arena p95 ms | draw field/arena | 포커스 |
|---|---:|---:|---:|---|
| before / `exact-before1` | 7.304 | 7.274 | 148/136 | 유지 |
| A/B: alpha0 discard / `exact-cutout` | 7.520 | 7.467 | 148/136 | 유지 |
| before / `exact-before2` | 7.709 | 7.498 | 148/136 | 유지 |
| A/B: patch OFF / FAIL / `exact-patches` | 9.531 | 8.437 | 139/136 | 손실 있음 |
| before / `atlas-before1` | 7.292 | 7.242 | 148/136 | 유지 |
| A/B: 공용 atlas / `atlas-ab` | 7.452 | 7.341 | 142/127 | 유지 |
| before / `atlas-before2` | 7.549 | 7.474 | 148/136 | 유지 |
| 제품 첫 검수 / arena FAIL / `final-product` | 7.345 | 9.534 | 142/140 | 손실 있음 |
| 최종 대조 before / `confirm-before` | 7.268 | 7.410 | 148/136 | 유지 |
| 최종 제품 after / `confirm-after` | 7.342 | 7.421 | 142/127 | 유지 |

최종 `confirm-after`: **52checks/0fail**, field **7.342ms**, arena **7.421ms**, 양쪽 ≤8.33ms PASS. 포커스 시작/종료 true·전환 이벤트 0. 바로 앞 `confirm-before`도 PASS였으므로 atlas가 과거 FAIL을 단독으로 고쳤다고 해석하지 않는다. Windows·밀집전투·GPU timestamp·일반 백그라운드 부하에서의 보장/배포 검수는 아니다.

### 19.2 채택한 리소스 계약

| 항목 | 값 / 적용 위치 |
|---|---|
| runtime 변경 | `ground_contact_masks.gd` 16개 texture 참조를 원본 PNG→`contact_masks/atlas/*.tres`로 변경. offset/size 숫자 및 `ground_contact.gd` 불변 |
| atlas | `assets/map/map11/contact_masks/atlas/contact_atlas.png`, RGBA **2048×1024**, grid **512×256**, 16 region. 원본 16 PNG 유지·RGBA 영역별 동일 픽셀·다운스케일/새 원화 생성 0 |
| region | 각 `AtlasTexture`는 원본 마스크의 논리 width/height를 유지, `filter_clip=true`. 아래 좌표 및 `atlas/manifest.json`에 source SHA256 기록 |
| sampling | 원본과 동일 lossless import/compress mode0·mipmaps=true·size_limit0·fix_alpha_border=true. Sprite의 LINEAR_WITH_MIPMAPS 및 black alpha .85·unshaded 유지 |
| 메모리 tradeoff | RGBA base 원본 합계 5,171,524 bytes → atlas 8,388,608 bytes. mip 포함 근사치는 각각 ×4/3. 바인딩 절감을 위해 base 약3.07MiB 증가; 실제 VRAM 절감 주장 없음 |
| 재현 | `godot/tools/map11_perf_atlas.py`(Pillow). 원본 PNG·manifest에서 재생성, 16 region RGBA 및 source SHA가 HEAD와 일치 검증. `ground_contact_atlas.gd`는 A/B용 static region table |

| mask id | atlas region x,y,w,h (px) | 원본 논리 size / offset |
|---|---|---|
| prop_altar | 0,0,512,149 | 858,249 / -19,523 |
| prop_corpsetree | 512,0,512,195 | 1213,462 / -35,973 |
| prop_cocoon | 1024,0,512,141 | 876,242 / -18,512 |
| bone_arch | 1536,0,299,115 | 299,115 / -9,241 |
| prop_g_root | 0,256,512,160 | 1050,329 / -25,694 |
| rotforest_tree_01 | 512,256,512,161 | 1076,339 / -26,711 |
| rotforest_tree_02 | 1024,256,512,161 | 1076,339 / -26,711 |
| rotforest_tree_03 | 1536,256,512,161 | 1076,339 / -26,711 |
| rotforest_tree_04 | 0,512,512,161 | 1076,339 / -26,711 |
| rotforest_tree_05 | 512,512,512,161 | 1076,339 / -26,711 |
| rotforest_tree_06 | 1024,512,512,161 | 1076,339 / -26,711 |
| rotforest_tree_07 | 1536,512,512,161 | 1076,339 / -26,711 |
| rotforest_tree_11 | 0,768,512,161 | 1076,339 / -26,711 |
| hell_skull_pyramid | 512,768,512,158 | 1074,331 / -25,697 |
| hell_spike_pit | 1024,768,512,140 | 1068,293 / -22,620 |
| hell_impaled_corpse | 1536,768,454,256 | 601,339 / -26,711 |

### 19.3 시각·접지 검수와 증거

- 동일 3뷰 START/FIELD(-850,-2400), OUTER FOREST(-3150,-1050), BOSS ENTRANCE(0,-3500), 1600×900·zoom .70. before는 이번 실행의 **372a9c5a 실제 Main**이고 after는 최종 atlas 제품이다. 원래 372 캡처의 byte 사본도 `captures/before-archived-372a9c5a/`에 보존했다.
- `captures/{before,after}/01_field.png`, `02_outer_forest.png`, `03_boss_entrance.png`; `captures/*_before_after.png`는 **3200×900·좌 before / 우 after**, 색보정·리사이즈 0. light pool phase는 리뷰 하니스에서 2.0으로 고정. fog/TIME·캐릭터 애니메이션·HP/SP/화폐 등 native 실행 상태 차이는 남으므로 전체 화면 pixel-identical 주장 없음.
- 직접 3쌍+7발치(altar/corpse_tree/skull/impaled/spike_pit/gate/arena_altar) 원배율 검수: 소품·패치 실루엣·접지 모양의 눈에 띄는 변화 없음. **성능 작업의 시각 동등성 PASS**. 기존 둥근 패치/암부/관문 뒤 직선 cutoff 등 전체 맵 RETOUCH는 유지.
- before grounding **1557/0**, after **2062/0**. 세로254·contact252·projection0·최대 foot 오차0.0003662109375worldpx·실제 gate→arena PASS. 추가 505checks는 252 contact의 AtlasTexture·2048×1024 크기 및 모든 contact가 단일 GPU texture RID를 공유하는지 확인한다. `capture_map11_perf.gd --require-atlas`로 검증.
- `~/exoduser-wt/_out/MAP11-PERF/`: `all-measurements.json`, 각 실행 `verification.json`/`run.log`/`process-monitor.json`, `capture-manifest.json`, `atlas-verification.json`, 캡처/발치 비교·Git 증거. 최종 SHA·원격 readback·정리 결과는 `DONE.txt`.

### 19.4 MAP PRODUCTION REPORT

| 구분 | 이번 검수 |
|---|---|
| STAGE / MASTER | CH1-1 MAP11-PERF, 372a9c5a silhouette·regions·main route·side spaces 보존. GATE8 camera→TECH 성능 작업 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH 질량·기존 hole/cutoff 불변 |
| LARGE | 기존 소품/합성/겹침/반복 실루엣 불변, 신규 AI 원화 0 |
| MEDIUM | 기존 연결 및 남은 hole 불변 |
| GROUND | contact 252개를 동일 픽셀 atlas region으로, 원본 크기/offset/foot/alpha 유지. 패치/오염 불변 |
| PLAYABLE | arena/travel/breathing/threat 공간 불변, 실제 Player 보행/관문 검수. 밀집전투 미검수 |
| LANDMARK | 제단/관문/원화 소품 배치 불변 |
| CAMERA QA | FIELD/OUTER/BOSS 3뷰 + 발치7 PASS(동등성). EARLY/SIDE R/LATE/전체8뷰 신규 검수 없음 |
| TECH QA | 52/0 최종벤치, 2062/0 접지·RID. route/collision 소스 불변, 실제 gate PASS. runtime SCRIPT/Parse/ERROR0. pageerror/404 N/A. 기존 seam/cutoff 잔여. source PNG0변경·mip/로딩 확인 |
| FILES | contact atlas/table·재현 도구·벤치/시각 하니스·본 docs/CHANGELOG만. PC core/player.gd/docs2_3·R source 수정0 |
| GIT / USER DATA | codex/map11-20p-20261021 정상 부모372a9c5a, 경로지정 stage·정상hook·비강제 branch push/readback. main push/merge/배포0. 격리 user dir만 실행, project 원byte 복원 후 자기 worktree 제거 |
| VISUAL VERDICT | **PASS(이번 성능 작업의 화면 동등성만) / 전체 맵 RETOUCH 유지** |
| NEXT / 한계 | 과거 FAIL의 단일 GPU 원인은 미확정. 창 포커스/외부 실행 상태를 계속 기록해 재현성을 유지. Windows/밀집전투 검수는 별도 배정 |


## INTEG-3b 통합 재검수 (2026-10-21)

[상세 재검수](../engine/INTEG3B_DEMO11_20261021.md). 68a6939e 재import ERROR0, chest26/0·anglers1402/0·auto_potion2569/0. product4실패+_bossArena 오류는85415a66에서 동일 재현해 선재 기록만. E2E12PASS/6NOT_READY·blocked_by 유지. benchmark_map11_21은 focus 손실시600틱 전체 제외·최대3회 자동 재측정·실제 공간/인수 기록을 추가했다. 유효 Safe foreground field9.265ms, App Nap 인수 조건9.596ms로 모두8.33ms 초과 FAIL. arena는 실제 gate PC 대기로 명목 표본뿐이다. separate render thread는crash로 미채택. 맵 시각·충돌·제품 Godot 설정·PC core 수정0, 기존 RETOUCH 유지.


> **2026-10-21 MAP11-22b 현행 보정은 §23 우선.** 아래 §22의 바닥·접지·숲·카메라·제단 cull 잔여는 해당 차수 이력이다.

## 22. MAP11-22 — 1-1 보스룸 관광 종착지 (2026-10-21)

현행 D05는 **원형 R1700**이다. 문서 앞부분 R2200은 최초 제안 이력이다. 기준 `1ba728fad6038a3417b61924cb7023caa5134a44`, 전용 `codex/map11-22-20261021`. R 체크아웃은 읽기만, MAP11-22 sparse worktree에서 제작. 실제 PC gate/보스전 완료·배포·PC/Mac/main 동기화 주장은 하지 않는다.

### 변경 전 1600×900 세 화면 진단

| 화면 | 관측 문제 | 대응 |
|---|---|---|
| 입장 직후 (0,1100) | 남쪽 거대 나무가 플레이어 주변과 HUD 뒤를 뒤덮음. 전투면과 장식 경계 불분명 | 남쪽 foreground를 바깥으로 옮기고 줄여 입장 전투면 확보 |
| 중앙 (0,0) | 전투용 빈 면은 충분하지만 관광 종착지의 서사가 없음. 바닥 균열 대비가 큼 | 중앙 세로소품 추가0, 바닥만 낮은 대비로 정리. 북쪽 대표 무대는 접근 카메라에서 확인 |
| 서측 가장자리 (−1450,−300) | 시체나무/고치 실루엣 반복과 거대 나무 겹침. 뼈·처형 소품 부재 | 내부 시체나무/고치 시각 은퇴, 앞나무 외측 이동, 해골 피라미드+꼬챙이+사슬 군집 |

최초 before 촬영 후 동일 기준본에서 중앙 좌표를 실제(0,0)로 바로잡아 before 3컷 재보존. 마지막 after도 같은 카메라 3점/zoom .70/offset(0,−180). 게임 시간·광원 위상·무작위 초기 스탯은 다르므로 픽셀 동일성 비교가 아니다. 추가 대표무대 after는 플레이어(0,−1650), before 보충컷은(0,−1540)으로 **추가4번은 동일시점 쌍으로 주장하지 않는다**.

### 현행 구현 계약

| 항목 | 값 / 적용 위치 |
|---|---|
| 외곽·중앙 | R1700·provider·anchors·effect metric128×108/T40 불변. 새 소품19개 발치 충돌 원 전체가 원 바깥. 중앙 세로소품0 |
| 배치 소유 | `arena_finale.gd` ROWS를 Sprite와 StaticBody2D 자식 CollisionShape2D가 공통 소비. arena 원점(0,−8000), 아래 좌표는 원점 기준. 외측 원은 이동 가능한 원 내부/LOS 계약에 영향을 주지 않아 provider 수정0 |
| PNG/2.5D | 통합본 `tour_25d/` diffuse+normal PNG만 재사용. `CanvasTexture`, LINEAR_WITH_MIPMAPS, specular(.10,.08,.06)/shininess.12. GLB 런타임 로딩0·새 에셋 생성0 |
| 접지·깊이 | opaque bbox 하단 중앙=저작foot, GroundContact.align/depth/shadow. absolute world foot Y/4 clamp(−4096,4095). 새 AO alpha.35/z−440(local ground plane). 기존 arena rim AO .85→.40, field AO 불변 |
| 가림·컬링 | 기존 cached `_rim_sprites`에 새 bounds+65 등록. 기존 화면rect 컬링+플레이어 overlap fade .22 유지. 틱 목록 API/ResourceLoader/새 tick 열거0 |
| 기존 외곽 | LivingCorpse12+Cocoon12는 finale_retired meta로 시각 은퇴; 외측 forest 유지. OuterTree 중 y<−1250 또는 x<−1450 또는 x>1450 & y<700은 위치×1.22. 이후 y>800인 OuterTree/BackForest는 위치×1.30·scale×.70 및 opaque 재정렬. row rect/depth 재계산 |
| 기존 포털 | EntryArch (0,1880), ClearArch(0,−2110), NorthHeartAltar(0,−2220). 모두 외곽. 이동 후 depth 갱신, 기존 노드명 보존. 기존 NorthHeartAltar의 cached cull rect는 이전 좌표 기준으로 남아 있어 경계 pop 가능성이 RETOUCH 잔여; Entry/Clear는 기존 개별 cull 대상 아님 |
| 바닥 | 기존 shader가 COLOR를 덮어 부모 modulate alpha가 적용되지 않음 확인. `field_decal.gdshader`·`organic_decal.gdshader`에 opacity default1 추가. 아레나 RGBAFloorDecals만 .16, IrregularFissureDecals만 .12. 기본값1로 필드/preview 소비자 원래 픽셀 유지 |
| 환경광 | arena 접근 혼합 목표(.49,.34,.36)→(.48,.43,.46), 기존 approach×.75. 중앙 밝기·냉색 player key·actor rim 유지. 기존 field 북쪽 approach 혼합도 같은 목표색을 공유하므로 북접근 색조 역시 영향; 이번 field 최종 카메라 미검수 |
| 광원 | 기존 ArenaHeart1 제거+새4=기존14→17등록. 화면교차/space 필터·최대4 pool+player1 cap 유지. ArenaEntry/ArenaTissue 순서 뒤에 새4가 등록되므로 북쪽2개가 모두 켜짐은 북쪽 뷰에서 확인; 전체4가 항상 동시 점등되는 것은 아님 |
| 새 생성 필요 목록 | **독립된 창 울타리 PNG/normal**: 제공7종/현행 승인 PNG에 없어 생성하지 않음. 이번에는 hell_spike_pit의 가시 가장자리와 꼬챙이 군집으로 처형 테두리 구성. 요청한 독립 울타리 완료로 보고하지 않음 |

| id | 기존 PNG asset | view | local foot | height | circle R |
|---|---|---:|---|---:|---:|
| Finale00 | tour_blood_basin | 1 | (-130,-1820) | 400.0 | 90.0 |
| Finale01 | tour_torture_wheel | 0 | (180,-1910) | 640.0 | 85.0 |
| Finale02 | tour_chained_pillar | 1 | (-490,-1810) | 540.0 | 60.0 |
| Finale03 | tour_chained_pillar | 2 | (590,-1740) | 475.0 | 55.0 |
| Finale04 | skull_pyramid | 0 | (-1490,-1060) | 520.0 | 95.0 |
| Finale05 | skull_pyramid | 2 | (-1770,-600) | 390.0 | 80.0 |
| Finale06 | hell_impaled_corpse | 1 | (-1650,-920) | 480.0 | 32.0 |
| Finale07 | tour_chained_pillar | 0 | (-1880,50) | 560.0 | 60.0 |
| Finale08 | hell_impaled_corpse | 2 | (-1770,480) | 430.0 | 32.0 |
| Finale09 | hell_spike_pit | 0 | (-1540,1080) | 310.0 | 130.0 |
| Finale10 | hell_impaled_corpse | 0 | (-1050,1500) | 370.0 | 30.0 |
| Finale11 | skull_pyramid | 1 | (850,1630) | 300.0 | 70.0 |
| Finale12 | hell_impaled_corpse | 0 | (1490,1110) | 510.0 | 32.0 |
| Finale13 | hell_impaled_corpse | 2 | (1650,790) | 450.0 | 32.0 |
| Finale14 | tour_chained_pillar | 2 | (1840,360) | 600.0 | 65.0 |
| Finale15 | hell_spike_pit | 1 | (1910,-220) | 350.0 | 145.0 |
| Finale16 | hell_impaled_corpse | 1 | (1810,-590) | 490.0 | 32.0 |
| Finale17 | tour_torture_wheel | 2 | (1500,-1110) | 440.0 | 70.0 |
| Finale18 | skull_pyramid | 1 | (1110,-1490) | 350.0 | 75.0 |

| light | local position | radius | color | energy | pulse |
|---|---|---:|---|---:|---:|
| FinaleBasin | (−280,−1900) | 870 | (1,.31,.17) | 1.15 | .018 |
| FinaleWheel | (350,−2020) | 790 | (1,.47,.25) | 1.05 | .020 |
| FinaleSkulls | (−1640,−1040) | 760 | (.95,.31,.19) | .94 | .025 |
| FinaleEast | (1750,160) | 750 | (1,.26,.13) | .85 | .020 |

보스 문서 `BOSS_00_FOREST_NORMAL_OBSIDIAN_FLAME_DESTROYER.md` 상단의 현행 si0 다크드루이드 배정 및 `BOSS_BATTLE_SETTINGS.md`/본 설계 BC표를 우선 확인했다. 새 prop 원 전체가 R1700 바깥이므로 centered slam1320 전투면과 비충돌. **tide1750·fissure2304/explosion691.2는 원을 넘을 수 있어 범위를 축소하지 않는다.** 보스 이동 후 패턴·패링·탄막/전조의 실제 중첩은 PC gate 대기이며 정적 범위 확인을 실전 PASS로 확대하지 않는다.

### MAP PRODUCTION REPORT

| 항목 | 결과 |
|---|---|
| STAGE / MASTER | CH1-1 arena 종착지. 원형silhouette 보존, 남입장→중앙combat void→북무대. 서측 뼈/동측 처형/북측 혈조 3지역; 별도 side route 추가0 |
| OUTER MASS | LEFT 해골·사슬 앞면 / RIGHT 처형·가시 구덩이 / TOP 혈조·바퀴·기존 부패숲 / SOUTH 입구 시야 개방. back mass 보존, 검정 recess는 잔여검수 |
| LARGE | 통합본 offline GLB bake PNG 재사용19; northern stage를 basin/wheel/pillars로 합성, 실제 variant0/1/2 비대칭. 과거 나무 반복은 완전 해소 아님 |
| MEDIUM | 기존 roots/forest를 접합층으로 유지. 별도 filler/신규 에셋0. 북무대 일부 실루엣·재질 거침 잔여 |
| GROUND | opaque foot AO/노멀·광원 반응; 중앙 균열·조직은 shader opacity .12/.16. 새 광범위 patch0 |
| PLAYABLE | arena R1700·중앙 combat/breathing void와 남북 travel 축 유지. 외곽 threat tableau. 새 발치원 원밖. 실전 boss/projectile/parry/loot readability 미검수 |
| LANDMARK | primary 북 혈조+고문바퀴+광원2; secondary 서해골·동처형; tertiary rim 시체/사슬. 북출구는 기존 marker 불변 |
| CAMERA QA | START=입장 / ARENA=중앙 / SIDE L=서가장자리 before/after1600×900+1x. LANDMARK=북무대 after 추가. EARLY/SIDE R/LATE/EXIT 개별 최종 카메라 검수0 |
| TECH QA | 최종 관련 테스트·arena 단회 측정은 아래 실측. pageerror/404 N/A(native). PNG preload/기존shader기본값 유지. PC gate·실전전투·전체route 종주 미검수 |
| FILES | stage-owned arena_finale/product_arena_view/product_detail/product_lighting, shared field_decal/organic_decal(default1), capture/benchmark_map11_22, 본 절/CHANGELOG. concurrent/unrelated touched0; project.godot 격리설정은 실행후 원복해 커밋0 |
| GIT | 기준1ba728fa→전용branch 정상commit/push. main push/merge/deploy0. 실제SHA·원격대조·worktree정리는 외부 DONE.txt에 기록 |
| VISUAL VERDICT | **RETOUCH**. 종착지 대표무대와 열린 전투면은 개선. 독립 창울타리 미제공, 기존 아트 대비 새 bake의 거친 재질·광택, 남측/서측 접지암부(시각 은퇴한 기존 prop AO 포함) 및 잔여 반복, 실제 보스 전조·탄막 중첩 미검수로 압도적 최종완성 PASS 선언0 |
| NEXT PASS | 제공 에셋 범위에서 독립 울타리는 생산하지 않음. PC gate 이후 다크드루이드 phase0~4 전조·패링/VFX·가장자리 회피 실전 QA 필요. 새 에셋은 별도 공급 목록만 남김 |

증거 경로: `~/exoduser-wt/_out/MAP11-22/captures/`. 01_entry·02_center·03_edge의 `before_*.png/after_*.png`, 동일rect(480,150,640,600) 1x. 나란히 이미지는 `compare_*.png` 및 `compare_*_1x.png`, 원배율 리사이즈/색보정0. 북무대 after 추가컷은 동일쌍3컷에 포함하지 않음. 격리 user dir `EXODUSER-map11-22-Isolated-20261021`. PID81277 보존, 자체 Godot 순차 실행(총≤2), 자동재시작/실제세이브/신규생성0.

### MAP11-22 final single-run verification

| Item | Result |
|---|---|
| Related checks | 106 checks / 0 failures. 19 exterior foot circles, opaque bbox, normals, world Y/4, provider routes/anchors, floor opacity and source pattern extents verified |
| Nominal arena p95 / p99 | **7.934ms / 8.365ms**; p95 budget <=8.33ms PASS |
| Focus | focus_lost_frames **0**, valid=true, attempt1, retries0 |
| Conditions | 1920x1080, 240cap, vsync0, 60Hz, Apple M5 Pro, Godot4.7.2 GL, PID81277 coexists. Mean 161.59fps; draw121 / objects251 |
| Input | 4 directions x150 ticks; settling included in 611ticks/1646frames wall count. p95 uses sampler-connected intervals only. Walk1611.50px |
| Scope | Nominal arena presentation explicitly activated. Native snapshot product_space=field; actual PC gate pending. No live boss/dense combat/Windows/GPU timestamp claim |
| Logs | perf.json/perf.log; final capture+benchmark SCRIPT/Parse/ERROR0, existing camera interpolation warning only |

Extra stage literal1x: after_finale_stage_1x.png = after_04_finale.png rect(340,0,970,540). Three exact-camera pairs: compare_01_entry/02_center/03_edge.png and each _1x.png; no resize/color correction.


> **MAP11-22c 바닥 현행은 §24 우선.** §23의 바닥 무맥동 설명은 이전 이력이며 외곽·입장 구도는 유지한다.

## 23. MAP11-22b — 보스룸 혈색·의식 테두리·입장 구도 2차 보정

기준 `ce5bec02a38ac54c74f6c5bc3467bf60f3799bb1` (`integ3 1ba728fa` 계열), 전용 `codex/map11-22b-20261021`. R 읽기 전용, MAP11-22b sparse worktree에서만 제작. §22의 19개 PNG/normal 무대·발치 원·광원·R1700/anchors/provider·PC core는 그대로다. 신규 이미지/3D 로딩/공용 전투·저장 수정0.

| 대상 / 적용 파일 | 현행 수치·동작 | 의도 / 검수 범위 |
|---|---|---|
| 전투면 / arena_shoulder.gdshader | 기존 5tap relief 유지. rim=smoothstep(980,1640,r). 중앙 RGB=(.29,.205,.20)+relief×.30 → 외곽(.16,.055,.065)+relief×.22; 기존 vein에 (.25,.075,.085) 혼합. R2480 mesh와 불규칙2090±95/65/35 shoulder fade 유지 | 기존 회분홍(.41,.35,.33)+relief×.56보다 어두운 피·살; 밝은 전조/탄과 구분. 별도 발광·움직임0 |
| 의식 뿌리 링 / product_arena_view.gd | 기존 RootShoulder32장만 재배치. angle=TAU×i/32; radius1530+(i%3)×45; size=(850+(i%4)×70,650+(i%3)×55); rotation=angle+PI/2+(i%3−1)×.13; 짝수 flip. organic_decal tissue=false/opacity .92; z−430 | 원둘레의 혈색 뿌리·혈관 relief. 중앙 세로장애물0, 뿌리 충돌0, 같은 PNG 재사용. 중앙을 무늬로 덮지 않음 |
| legacy 숲 / product_arena_view.gd | 기존24 corpse/cocoon 은퇴에 OuterTree 번호%3==1인8개 추가(총32). BACK32 phase에 sin(i×2.4)×.18, height880+((i×7)%5)×92. 기존 남측×1.30/scale×.70 및 외측×1.22 규칙 보존 | 전경 반복을 줄이고 후경 연속질량 유지. 숲 반복 완전 제거 주장은 하지 않음 |
| legacy 접지 / product_lighting.gd | finale_retired 소스는 AO 생성하지 않음. 남은 legacy arena AO .40→.26. field AO .85/새19개 finale AO .35 유지 | 은퇴 소품 위치의 유령 그림자 제거. 새 tick 열거0 |
| 제단 cull / product_arena_view.gd | 이동한 Entry/Clear/NorthHeartAltar 각 현재 position+opaque_ground_bounds를 grow65하여 기존 row.rect 갱신. NorthHeartAltar(0,−2220) | 이전(0,−1850) 사각형으로 잘리던 제단 정정. 이동후 depth 계약 유지 |
| finale PNG 재질 / finale_surface.gdshader | 기존 diffuse 샘플에 LOD bias −.6. LINEAR_WITH_MIPMAPS와 CanvasTexture normal/specular(.10,.08,.06)/shininess.12 유지 | 1x의 밉 선택 완화. 원본1024² PNG 내부의 거친 저작 재질·고주파 뭉침은 복원되지 않음. 재렌더·신규 에셋0 |
| 입장 카메라 / product_scene.gd | arena 전환때 전용 ArenaArrivalCamera를 실제 actor 자식으로 생성. local(0,−1400)/zoom .20로1초 → .9초 SINE으로 local0/zoom .70 → 기존 Main camera 복귀. 재전환시 tween 정리·복귀. 입력/AI 시간 정지0 | 남입구에서 전투 원 너머 북무대가 걸리는 첫 구도. 짧은 전체조망 동안 캐릭터는 작게 보임. 공유 shake writer를 수정/덮어쓰지 않음. 이전 카메라 offset tween은 shake 단일작성자와 충돌해 폐기; 최종은 독립 camera만 사용 |
| 조명 카메라 / product_lighting.gd | 매 render frame 현재 viewport camera 참조를 읽어 기존 light/fog cull에 사용 | 입장/복귀시 실제 view와 조명 영역 일치. 목록 API/ResourceLoader0 |

### 전투 가독성 대체 검사

`docs/8.1보스디자인바이블/BOSS_00_FOREST_NORMAL_OBSIDIAN_FLAME_DESTROYER.md`의 현행 si0 다크드루이드 배정과 `BOSS_BATTLE_SETTINGS.md`를 확인했다. 기존 arena_preview의 source extents인 slam1320/tide1750/fissure2304+blast691.2를 축소하지 않고 테스트 전용 overlay로 중앙·서가장자리를 촬영했다. 실제 actor와 같은 화면에 황색/청색 range, 빨강·보라·청록·황색·녹색 반경5.2 색표본(검정7.2 외곽), 반경26 청색 패링 링 표본을 표시. **표본은 실제 보스 탄/패링 VFX가 아니며 피해·판정·AI가 없다.** 실제 PC gate 전투는 대기. high-z 테스트 범위는 기하/바닥 색 대비 확인용이며 실제 VFX 소품 occlusion/z-order PASS 근거가 아니다.

### 캡처·기술 검수

산출물 `~/exoduser-wt/_out/MAP11-22b/captures/`. before는 ce5bec02에서 실제 재촬영한 4컷; after는 동일 player 위치 (0,1100)/(0,0)/(−1450,−300)/(0,−1650). 1600×900 무보정 원본 및 rect(480,150,640,600) literal1x. `compare_01_entry`는 **의도적으로 입장 카메라 변경 비교**, 02/03/04는 같은 zoom .70 카메라. 추가 `compare_01_entry_combat`는 기존 배율의 입구 비교. 시간/광원위상/초기스탯은 달라 픽셀동일성 검사는 아니다. after_receipt·preview_05_center_ranges/06_edge_ranges와 각각1x 보존.

격리 user dir `EXODUSER-map11-22b-Isolated-20261021`, project.godot 실행설정은 원복 후 commit 제외. PID81277 보존, 자체 Godot 순차실행으로 총≤2. 관련 테스트+arena 명목 측정은 최종 소스에서 단1회, 상세 perf.json/perf.log. 실제 전투·PC·dense combat·GPU timestamp 완료 주장은 하지 않는다.

### MAP PRODUCTION REPORT

| 항목 | 결과 |
|---|---|
| STAGE / MASTER | CH1-1 R1700 원·남입장→combat void→북혈조 무대 보존. 입구 establishing과 통상 전투 뷰 분리 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH 기존 부패숲. 전경8개 은퇴/후경 변주로 반복 감소. 남쪽 큰 검정 영역은 바깥 recess, 완성 질량 최종승인 아님 |
| LARGE | §22 기존19개 PNG 무대 배치·높이·발치원 그대로. PNG/normal만 사용; 신규 source/composite0 |
| MEDIUM | 기존32개 뿌리를 원둘레 접합으로 이동. 새 filler0 |
| GROUND | 중앙 dark flesh→외곽 blood 색 전이·뿌리 링. 은퇴32개 AO0; 남은 legacy .26. 구조물 공중뜸 제거는 opaque foot 계약 유지 |
| PLAYABLE | 중앙 세로장애물0/R1700·남북여백·회피/탄 경로 불변. 전조 범위 및 색상표본 판독 가능; 실전 VFX 중첩은 미검수 |
| LANDMARK | primary 북혈조·바퀴/secondary 서해골·동처형/tertiary 사슬·꼬챙이 유지 |
| CAMERA QA | START/ARENA/SIDE L/LANDMARK 4쌍+1x; 입장 복귀후 추가컷. EARLY/SIDE R/LATE/EXIT 별도 종주0 |
| TECH QA | 관련 검사·focused nominal arena 단회 성능은 아래 결과. native pageerror/404 N/A. 신규 tick list API/ResourceLoader0; provider·collision·save 변경0 |
| FILES | stage-owned arena_shoulder/product_arena_view/arena_finale/finale_surface/product_scene/product_lighting + capture/benchmark22b, 본 절·CHANGELOG. concurrent/unrelated0 |
| GIT | 전용 branch 정상 commit/push·원격SHA대조 후 worktree 제거. 실제 SHA/제거근거는 외부 DONE.txt. main push/merge/deploy0 |
| VISUAL VERDICT | **RETOUCH** — blood tone·링·입장 북무대·legacy AO/cull 개선. 입장/중앙의 압도감이 근접 finale와 동급이라는 최종승인0. 원본 bake의 거친 재질/일부 반복·어두운 recess, 작은 establishing actor, 실제 전투 VFX 가림 검수 잔여 |
| NEXT PASS | PC gate 이후 자연보스의 실제 전조·탄/패링·가장자리 회피. 제공 PNG 자체의 거친 재질은 별도 원본/렌더 품질 개선 필요 |


### MAP11-22b 최종 단회 실측

| 항목 | 결과 |
|---|---|
| 관련 검사 | **308/308, failures0**. §22 106검사에 현재 cull/retired AO/root ring 경계 검사 추가 |
| arena nominal p95 / p99 | **8.015ms / 9.527ms**, p95≤8.33ms PASS. 이전22 p95 7.934ms 대비 +.081ms; 별도 시점 표본이므로 확정 성능회귀율 주장0 |
| 포커스 / 횟수 | focus_lost_frames **0**, valid=true, attempt1/retries0 |
| 조건 | 1920×1080, 240cap/vsync0, 60Hz, Godot4.7.2 GL/Apple M5 Pro. PID81277 공존. 1642 renderframes/611ticks(정착 포함), 평균161.26FPS, draw120/objects248 |
| 입력 | 4방향×150ticks 실제 Player input, 이동1604.18px. source product_space=field인 nominal arena 명시 활성화; 실제 PC gate 대기 |
| 캡처 | 최종after21검사/0실패(4컷+통상입구+범위2컷, 각1600×900/1x). before4컷12검사/0실패. 원본+4쌍 나란히/1x·동배율입구·무대확대 보존 |
| 로그 | before.log/after-reviewed.log/perf.log에 SCRIPT/Parse/ERROR0. 기존 Camera2D physics interpolation warning은 유지. perf.json과 captures receipt 보존 |
| 범위 | 벽시계 frame interval이며 GPU timestamp/실전 전투/dense combat/Windows 검증 아님. 재측정0 |


> **현행 MAP11-22d는 §25 우선.** 아래 §24의 .62·추가 draw/texture0·multiply만 사용·광원 유지 설명은 22c 이력이다.

## 24. MAP11-22c — 전투 바닥 의식의 원 3차

기준 a31e73deafe48fb92b1ffdc2f1d22a88bd555fc9, 전용 codex/map11-22c-20261021. 신규 이미지 생성 없이 기존 SkinFloor의 arena_shoulder 셰이더 안에서 곱셈 합성한다. 기존 5tap relief·R2480 시각 mesh·R1700 충돌·외곽 뿌리32·북 finale·카메라·광원은 유지한다. 별도 draw/texture/노드/프레임 할당 추가0. TIME만 맥동에 사용한다.

| id / 파라미터 | 현행 수치·공식 | 적용·의도 |
|---|---|---|
| ritual_radius / ritual_strength | 1470 / .62 | r=length(point), a=atan(y,x), warp=26sin(7a+.4)+14sin(13a−1.2). width=38+14sin(5a+.7)+8sin(11a), 16~60. ring=1−smoothstep(.45width,width+18,abs(r−1470−warp)) |
| 접지 / vessel | contact=1−smoothstep(width,width+65,d). RGB×[1−(.36,.64,.59)×max(ring,.82branch)×.62]×(1−.09contact) | 기존 relief와 곱해 조직이 바닥에 붙음. 높이/충돌/스티커 quad0 |
| 안쪽 가지 | axis=abs(sin(3.5a+.30sin(.008r))); branch=(1−smoothstep(.018,.080,axis))×smoothstep(1040,1290,r)×(1−smoothstep(1460,1550,r)) | 7방향 가는 혈관. 중앙1040 안쪽 branch0 |
| groove_strength / 얕은 홈2 | .26; 반경960/590, warp 각각 .65/.40. d=min(abs(r−960−.65warp),abs(r−590−.40warp)); groove=(1−smoothstep(3,16,d))×breaks | breaks=.55+.45smoothstep(−.6,.6,sin(9a+.003r)). RGB×[1−(.23,.60,.53)×groove×.26]. 가늘고 저대비인 붉은 살 갈라짐 |
| 홈 가장자리 | lip=(1−smoothstep(2,7,abs(d−13)))×breaks; RGB×(1+.035lip) | 발광 없이 얕은 입술 relief |
| 큰 얼룩 | p=point/470; m=sin(px+.37py)sin(.83py−.29px); RGB×[1+(.065m−.025)×smoothstep(280,1050,r)] | 중심R280 무늬 추가0, 바깥쪽 저주파 명암−9~+4%. 마른 피·조직 명암 |
| pulse_strength | .035; pulse=(.5+.5sin(.75TIME))×smoothstep(.55,.90,sin(3a+.8)); red×(1+vessel×pulse×.035) | 주기 약8.38초, 일부 링 red 최대3.5%, 중앙 맥동0. GDScript update/할당0 |

### 캡처 및 가독성

`~/exoduser-wt/_out/MAP11-22c/captures/`: before는 **a31e73de 최종22b after 원본을 byte 동일 복사**, 재촬영이 아니다. after는22c 실제 Main 렌더. entry/center/edge/finale 4쌍 1600×900 및 rect(480,150,640,600) literal1x, compare는 무보정 좌우 결합. 시간·광원·랜덤 초기스탯 차이가 있어 픽셀 회귀 판정은 아니다. ritual_overview는 검수 전용 zoom.20 조망. 게임 UI에 개발 상태 문구 추가0.

silhouette_source_idle_no_ai는 기존 boss atlas의414×620 idle 셀, source 높이620.4, foot(220,−80), 기존 enemy rim(.62,.20,.16,.30)을 테스트에서만 표시한다. 실제 player는 제품 그대로. 보스/플레이어 경계는 읽히지만 보스 검은 깃털·플레이어 검은 의상 전체가 바닥보다 밝다는 판정은 불충족. 보스 AI·실제 telegraph/dense combat 검수가 아니다. preview 색상/범위 표본도 실제 전투가 아니다.

### MAP PRODUCTION REPORT

| 항목 | 결과 |
|---|---|
| STAGE / MASTER | CH1-1 boss R1700, 남입장→중앙 combat void→북무대; side spaces·silhouette·route 보존 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH 기존 부패숲 보존, major holes 이번 수정0 |
| LARGE | 기존 PNG19·32 roots 재사용, 신규 assets/composites/overlap 변경0; 기존 반복 잔여 |
| MEDIUM | 기존 외곽 연결 유지, 새 filler0·hole 수정0 |
| GROUND | 기존 접지/그림자 유지, 저대비 마른피·혈관1470·홈960/590를 동일 바닥 재질에 곱합성 |
| PLAYABLE | R1700·회피·이동·탄 공간·여백 불변, 중앙280 무늬/펄스0. 실루엣 경계 확인, 확실한 밝기 우위는 미달 |
| LANDMARK | primary 북혈조/secondary 서해골·동처형/tertiary 사슬 보존 |
| CAMERA QA | START entry/ARENA center/SIDE L edge/LANDMARK finale 및1x 확인. EARLY/SIDE R/LATE/EXIT 별도 종주0. overview에서 동심원 확인 |
| TECH QA | 아래 단회 arena 결과 참조. route/collision은 기존 관련 검사, pageerror/404 native N/A. 새 texture seam/loading0, runtime3D0. tick 목록 API·ResourceLoader0 |
| FILES | stage-owned arena_shoulder.gdshader + capture/benchmark22c·본 절·성능문서·CHANGELOG. concurrent/unrelated0 |
| GIT | 전용 branch 정상 hook commit/push·원격 SHA 확인 후 worktree 제거, 실제 SHA는 외부 DONE. main merge/push/deploy0 |
| VISUAL VERDICT | **RETOUCH** — 원의 구조와 중앙 저대비 가독성은 확인. 외곽 굵은 혈관은 기존 뿌리에 일부 묻힘. 검은 캐릭터/보스 전체의 확실한 밝기 우위 미달, 실제 보스 전투는 PC gate 대기 |
| NEXT PASS | actor 승인 범위에서 검은 의상·깃털의 밝기 분리와 실제 보스 전조/탄/패링 중첩 검수. 외곽 혈관 접합 국소 리터치 |

실행은 격리 user dir EXODUSER-map11-22c-Isolated-20261021. project.godot은 원래 byte로 복구하고 commit 제외. PID81277 보존, Godot 순차실행/동시≤2. 검사 준비부에서 기본 uniform get_shader_parameter가 Nil을 반환해 중단된 로그는 perf-setup-error.log에 보존; **측정 시작 전 오류로 표본0**. 해당 구현값 복제 검사를 제거한 뒤 관련 검사·명목 arena 표본을 1회 실행하며 재측정하지 않는다.


### MAP11-22c 단회 결과 — 유효 성능 미검증

| 항목 | 결과 |
|---|---|
| 관련 검사 | 308검사 / 1실패: 포커스 조건 실패. floor shader·기존 arena 계약 검사는 통과 |
| 명목 표본 | attempt1 / 추가 표본0. **valid=false, focus_lost_frames=1547** |
| p95 / p99 관측 | 8.105ms / 8.531ms. **무효 표본이므로 ≤8.33ms PASS 근거로 사용할 수 없음** |
| 조건 | 1920×1080, 240cap/vsync0/60Hz, Godot4.7.2 GL Apple M5 Pro, PID81277 보존. draw120/objects248; 벽시계 frame interval, GPU timestamp 아님 |
| 입력 | 4방향×150ticks 실제 Player input, 이동1638.80px. nominal arena 명시 활성화, product_space=field, PC gate 대기 |
| 제한 | 사용자 단회 제한에 따라 포커스 실패 재측정0. **성능 완료 조건 미달**, 별도 배정에서 focus0 표본 필요 |
| 캡처 | after 21검사/0실패, 추가 idle/overview 4장. 전후4쌍·literal1x·PNG 비교 파일 보존. after/silhouette/perf 최종 로그 SCRIPT/Parse/ERROR0; 준비부 오류 별도 보존 |


> 현행 MAP11-22e는 §26 우선. 아래 §25는 22d 제작 이력.

## 25. MAP11-22d — 입장에서 읽히는 붉은 의식의 원 4차

기준 **660a9dc2**, branch `codex/map11-22d-20261021`. 신규 이미지 생성 없이 필드의 붉은 뿌리 균열 원본 `assets/map/ch3/floor_objects/prop_ice_gcrack.png`를 재조합한다. 22c multiply 링은 아래 보조층으로 약화했다. PC 전투 코어·저장·공통 rim shader·적·카메라·충돌 변경0.

| id / 적용 | 수치·공식·계약 |
|---|---|
| bake source / output | `godot/tools/bake_map11_22d_ritual.py`(Pillow), 기존 RGBA 크랙 1종 → `godot/assets/maps/map11/ritual_root_cracks.png`, 2048² RGBA / world3600². 비압축 RGBA 환산16MiB, runtime 1 texture / 1 Sprite2D / 1 draw 추가. AI 생성0 |
| 원 둘레36 stamp | a=TAU×i/36, R=1470+18sin(7a); world width620+45(i%3), height340+18(i%4); 회전a±.10, 홀수 mirror. 겹침으로 이음매 숨김. 배치 중심R1452~1488 |
| inward branches7 | a=TAU(i+.24)/7, 중심R1140, world760×310, 회전a, 홀수 mirror. 원본 가지 모양 보존; 중앙에 새 decal 없음 |
| bake alpha | 원본 alpha×clamp((r−650)/100)×clamp((1730−r)/100), 두 clamp는0~1. 중앙R650 완전 투명, 특히 요구된R280 새 균열0. 별도 높이/충돌0 |
| RitualRootCracks | scale3600/2048, z−419; 기존 SkinFloor와 roots 위·배우 아래. 정적 composition, 틱 bake/load0 |
| ritual_cracks.gdshader | unshaded 알파 합성. relief=.299r+.587g+.114b; tissue=mix((.22,.037,.031),(.43,.105,.075),smoothstep(.25,.70,relief)); RGB+= (.10,.012,.008)×(.75+.25pulse), pulse=.5+.5sin(.75TIME); alpha=source.a×.88. glow_strength은 setup에서 **명시 .10** 설정·Nil 방지. 주기8.38초, 원래 alpha/relief 유지, PointLight 추가0 |
| 22c 보조층 | ritual_strength .62→**.14**; R1470·warp·가지7·홈960/590·groove .26·pulse .035·얼룩·R2480 mesh·fade 그대로. 위 링의 암부 접지 보조 |
| arena 노출 | inner=1−smoothstep(1350,1850,player의 arena중심 거리), arena 밖0. 기존 ambient=(.38,.43,.52).lerp((.48,.43,.46),approach×.75)를 (.70,.60,.61)로 inner만큼 lerp. 중심/입장 전투면을 어두운 살빛으로; 북finale r≥1850 기존 대비 유지. 전역 CanvasModulate이므로 플레이어 위치에 따른 노출 전환이며 국소 라이트가 아님 |
| player rim | MAP11-18 공유 material/shader 그대로. instance `rim_color` arena (.92,.82,.70,.62), field (.78,.72,.59,.38). enemy (.62,.20,.16,.30) 유지. 기존 lighting process에서 player sprite 파라미터1회/프레임, 새 목록 API/ResourceLoader/노드 검색0 |
| 실행 격리 | `EXODUSER-map11-22d-Isolated-20261021`, project 설정은 원래 byte 복원·commit 제외. 실제 Native-First 저장 경로 사용0. 초기 capture guard는 별도 Demo 설정 때문에 scene instantiate 전 exit2; 수정 후 격리 실행 |

### 캡처·단회 관련 검사·성능 제한

`~/exoduser-wt/_out/MAP11-22d/captures/`: before entry/center는 **660a9dc2의22c after 원본을 byte 동일 복사**(재촬영 아님). after는 제품 Main 1600×900·동일 입장(0,1100)/중앙(0,0) fixture. 각 원본과 literal1x crop(480,150,640,600), 무보정 좌우 compare 보존. entry 전용 기존 줌 전환 때문에 entry는 넓은 조망이며 center receipt zoom(.7,.7). 시간/스탯 차이로 pixel 회귀 증거가 아니다. entry에서 붉은 원 한눈에 확인, center는 새 균열 없이 깨끗, 1x player 외곽이 바닥과 분리됨. 기존 홈2·중앙 피부결은 유지. 검은 의상 내부가 발광하는 연출은 아님. 실제 보스 AI·탄막·dense combat 검수 아님.

관련 자동 검사는 **1회 308 checks / 0 failures**, 명시 glow uniform float/.10 확인 포함. 캡처9checks/0fail. 최종 로그 Parse/SCRIPT/ERROR0(기존 Camera2D physics interpolation warning만). **성능 표본0, p95=N/A, 유효=false(미측정)**: 보호 대상 PID81277 Godot이 존재하여 사용자 조건 “다른 Godot 없을 때” 불충족. 이를 닫거나 포커스를 빼앗지 않았고, 잘못된 공존 측정도 하지 않았다. 테스트의 `--verify-only`로 관련 검사만 수행. benchmark는 다른 Godot 확인 시 표본 전 exit4, 조건 해소 시 1회만 측정하며 focus_lost_frames0일 때만 p95≤8.33ms 판정 가능. 22c 무효 p95를 이번 결과로 사용하지 않는다. 동시 Godot≤2/순차 실행.

### MAP PRODUCTION REPORT

| 항목 | 결과 |
|---|---|
| STAGE / MASTER | CH1-1 boss, silhouette·regions·남입장→중앙combat void→북finale·side spaces 그대로 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH 보존, major holes 신규 수정0 |
| LARGE | 기존 PNG/32roots·composites·overlap 보존, 기존 외곽 반복 잔여 |
| MEDIUM | 기존 연결 보존, filler0·새 hole0 |
| GROUND | 기존 field crack 재사용36+7stamp→단일 bake, 접지 보조 .14 multiply·약한 진홍 unshaded층 |
| PLAYABLE | R1700·route·collision·회피/탄 공간 불변, R280 새 패턴0, player1x 실루엣 분리 확인 |
| LANDMARK | primary 북무대, secondary 서해골/동처형 보존; 중심 전투면 노출만 올림 |
| CAMERA QA | START entry/ARENA center·literal1x PASS(요청한 가독성 범위). EARLY/SIDE L/SIDE R/LANDMARK/LATE/EXIT 추가 종주 미실시 |
| TECH QA | 관련308/0, capture9/0. route/collision 기존 계약검사 PASS, pageerror/404 native N/A; texture 로딩 오류0·runtime3D0. 성능은 PID81277 보존으로 미측정 |
| FILES | stage-owned arena_shoulder/product_arena_view/product_lighting/ritual shader+bake+PNG·import·capture/benchmark22d·관련 docs, concurrent/unrelated0 |
| GIT | 전용 branch 정상 hook commit/push 후 원격SHA 대조·worktree 제거. SHA는 외부 DONE.txt. main merge/push/deploy0 |
| VISUAL VERDICT | **RETOUCH** — 요청한 입장 붉은 원·깨끗한 중앙·player1x 가독성은 시각 PASS. 최종 TECH 성능 gate는 미검증이므로 전체 PASS 아님 |
| NEXT PASS | PID81277이 사용자 작업으로 종료된 환경에서 arena 명목 표본1회·focus_lost0·p95≤8.33ms 확인. 실제 보스 전투는 기존 PC gate 대기 |


## 26. MAP11-22e — 보스룸 진홍 링·죄수 석주 마감

기준 `cba6bbf50b9142ebd5a1080fd1f60b40827076f3`, 전용 branch `codex/map11-22e-20261021`. R 읽기 전용, 전용 worktree에서 작업. 신규 AI 에셋 생성0, 기존 GLB의 오프라인 PNG 재렌더만 수행.

| id / 적용 | 현행 수치·계약 |
|---|---|
| 링 밝기·채도 | 기존 tissue+glow 계산 후 L=.299r+.587g+.114b; `mix(vec3(L),tissue,.82)*.82`. RGB 명도18%·휘도기준 채도18% 감소. 기존 glow_strength 명시 .10 / alpha .88 / pulse .75TIME / PNG·R·36+7stamp 불변. 심장 제단 계열의 낮은 붉은 조직색, 새 광원0 |
| 보스룸 석주 | `arena_finale.gd` setup 전용 PILLARS preload 배열. Finale02/03/07/14 기존 view1/2/0/2를 각각 yaw0°/+45°/−45°/+45°로 표시. field 공유 tour_textures는 보존 |
| 재렌더 원본·도구 | R의 `outputs/map11-art-proof-20261021/3d/tour_chained_pillar.glb` 읽기만. 기존 `map11_21_render.gd` 파생 `map11_22e_render.gd`: yaw [−45,0,45], elevation36.8699°, orthographic, camera size=bounds diagonal×1.08, base cut .04, 각 높이1200px, alpha bbox 동일 crop diffuse/normal, 3방향×2 PNG. runtime GLB0 |
| runtime PNG | `godot/assets/maps/map11/finale_pillar/`. diffuse·normal 6장 + 파생 AO3장(총9 PNG), offline alpha≥32/255 convex hull·foot metadata3항목·AO maximum filter/gaussian blur를 기존 도구와 동일하게 계산. `map11_22e_contacts.py`는 새 경로3개만 기존 contact data/masks에 추가. CanvasTexture/mipmap·발 기준 opaque bbox 정렬·y/4 깊이·접촉 그림자 유지. 기존 석주 foot 위치·높이·충돌 반경·R1700·PC 전투 코어 불변. depth PNG는 검수 출력에만 보관 |
| 링 리소스 비용 | 기존 단일 texture/draw 유지. 추가 tick 목록 API·ResourceLoader0, 런타임3D0, 개발 상태 UI 문구0 |
| 실행 격리 | `EXODUSER-map11-22e-Isolated-20261021`. project.godot 원본 byte 복원 후 commit 제외. 실제 EXODUSER-Godot-Native-First 저장 폴더 접근0 |
| 캡처 | 외부 `_out/MAP11-22e/captures/`, before/after 새 촬영 각 entry(0,1100)·center(0,0)·finale(0,−1650), 1600×900; literal1x crop(480,150,640,600). nominal arena presentation이며 자연 보스전 완료 아님 |
| 성능 조건 | PID81277 공존·보존, 우리 Godot 순차1개. 같은 코드 fixture/1920×1080/600틱/240FPS 상한·vsync off, before 다음 after. field와 nominal arena 각1회+포커스 실패 시1회 재시도. focus_lost0만 유효. 반복 재측정으로 수치를 골라 통과시키지 않음 |

검수 수치·판정은 아래 최종 기록을 따른다. 각 실행 원문 JSON/log는 외부 출력에 보존하며 무효 표본으로 성능 통과를 주장하지 않는다.


### 26.1 최종 검수와 성능 판정

| 조건 / 표본 | field p95 | arena(명목) p95 | 유효성 |
|---|---|---|---|
| before cba6bbf5 / PID81277 공존 | N/A | N/A | 두 구간 모두 최초+1회 재시도 focus_lost>0, 실제 보행0; 무효. 각 rejected raw 수치는 before.json에만 보존 |
| after / PID81277 공존 | 12.709ms | 12.808ms | 각 최초1회 focus_lost0, 실제 보행1621.081/1621.154px. 유효한 느린 표본은 재시도0 |
| 상대 비교 | 산출 불가 | 산출 불가 | before 유효 표본 부재. 변경이 성능을 개선/악화했다고 결론내리지 않음 |
| 120Hz 목표8.33ms | FAIL | FAIL | 공존 조건 실측; 단독·PC·dense combat·GPU timestamp 측정 아님 |

관련 최종 검사1회 **312 checks / 0 failures**(구조·PNG/normal·foot·route/충돌 계약+보행/포커스). **이 숫자는 8.33ms 목표 PASS가 아니다**: 새 benchmark22e는 성능 목표를 assert하지 않고 raw JSON에 기록하며 위 표에서 별도 FAIL 판정. 최초 after 연결 검수에서 사전 opaque hull 부재를 발견해 중단했고, 새 경로3개 hull/AO를 추가한 뒤 최종 검수했다. 초기 오류 로그도 보존. before의 310checks/2fail은 포커스 실패2건이며 최종 제품 통과 숫자로 사용하지 않음. 최종 runtime SCRIPT/ERROR 없음(기존 Camera2D interpolation warning만).

benchmark는 arena presentation을 명시 활성화하지만 native product_space는 field로 남는다. 따라서 **명목 arena**이며 자연 gate/보스전 진입·실전 성능으로 보고하지 않는다. field/arena는 동일 실행 fixture에서 각각 실제 입력으로 이동했으며 PID81277은 종료/재시작하지 않았다. before 무효를 숨기거나 추가 재시도로 표본을 골라내지 않았다.


### 26.2 MAP PRODUCTION REPORT

| 항목 | 결과 |
|---|---|
| STAGE / MASTER | CH1-1 boss. silhouette·regions·남입장→중앙combat void→북finale·side spaces 보존 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH 기존mass·holes 유지 |
| LARGE / MEDIUM | 기존 GLB offline 재렌더. composites/overlap·반복수·연결 보존, filler0·새hole0 |
| GROUND | 링 밝기·채도 .82/.82, 기존alpha/형상 보존. 새3방향 opaque hull/AO로 foot 정합 |
| PLAYABLE | R1700·travel/breathing/threat·route/collision 불변. center1x player 실루엣 분리. 자연 보스/밀집 전투 미검수 |
| LANDMARK | primary 북finale·secondary 서해골/동처형 유지. 석주 머리·상체·묶인 손/인체 옆선이 실제 finale에서 드러남. 어두운 의복 대비 잔여 |
| CAMERA QA | START entry PASS(감쇠 뒤 원 가시성), ARENA center PASS(1x 림·중앙 보호), LANDMARK/EXIT finale 각도 개선 확인·어두운 죄수 의복 대비 잔여. EARLY/SIDE L/SIDE R/LATE 추가 종주 미실시. before/after 새촬영9/0·12/0, 원본+literal1x+무보정 compare각3쌍 |
| TECH QA | 최종 관련312/0, route/collision/PNG로딩 PASS, SCRIPT/ERROR0·기존Camera2D warning만, native pageerror/404 N/A, seam 신규변경0. 공존 성능8.33ms FAIL·before 무효·상대비교불가 |
| FILES | stage-owned ritual shader·arena finale·새 PNG/normal/AO/metadata·contact data/masks3행·offline render/contact·capture/benchmark22e·docs. concurrent/unrelated0. project byte복원 |
| GIT | 전용branch 정상hook commit/push·원격SHA대조·push후 worktree제거. SHA는 외부DONE.txt. main merge/push·deploy0 |
| VISUAL VERDICT | **RETOUCH**. 링 감쇠·원 가시성·죄수 각도 개선. 의복 대비/기존 외곽 반복 잔여·성능 목표 미달. 전체AAA·실보스전·PC 인수완료 주장0 |
| NEXT PASS | 별도 승인단위에서 before/after 유효 비교·공존 비용 진단. 이번 focus 재시도 한도를 넘겨 추가 표본을 만들지 않음 |
