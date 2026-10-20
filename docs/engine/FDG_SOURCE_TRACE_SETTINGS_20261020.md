# 설정 원본 추적·작은 이식 단위 설계 — trace-settings

## 0. 판정·범위·소스 고정

**추적 문서 작성 완료·검수 대기. 설정 전체 이식은 미완료다.** 원본 설정 UI와 BINDS/BINDS2 재지정·설정 복원·Tier 자동 감지는 Godot 제품에서 완성되지 않았다. 실제 OPT35 owner·부분 소비자·FPS 캡 prefix는 이미 있으므로 재구현 대상으로 중복 배정하지 않는다. 아래 순서안은 후속 배정을 위한 제안이며 구현 착수·보호 범위 변경 승인이 아니다.

- [고정 원본 game.html](https://github.com/beearth/the-exoduser/blob/788ba758f9f5c92564abacb2f2fce88a42af2c1a/game.html#L6188) · [고정 원본 index.html](https://github.com/beearth/the-exoduser/blob/788ba758f9f5c92564abacb2f2fce88a42af2c1a/index.html#L2157).
- 작업ID `trace-settings`, 브랜치 `codex/trace-settings-20261020`, 전용 worktree `/Users/fordeargamers/exoduser-wt/trace-settings`.
- `git fetch origin` 성공 후 읽은 기준 `origin/main=788ba758f9f5c92564abacb2f2fce88a42af2c1a`. 문서의 모든 행 번호는 이 commit의 파일 기준(빈 줄 포함, 1-based)이다. 이후 main 변경은 자동 포함하지 않는다.
- 기준 체크아웃 R의 당시 branch=`codex/mac-live-play-time-main-20261017`, HEAD=`dd49171c5b88e211575a41f185395d6c0a14b184`; tracked INDEX/WORK 변경 없음. R은 branch 전환·수정·commit하지 않았다. worktree 추가만 수행했다.
- **원본 구분:** 이 보고서의 원본 정본은 요청대로 최신 origin/main에서 만든 WT의 `game.html`·`index.html`이다. R/game.html은 아래 hash가 달라 최신 원본과 같은 파일로 간주하지 않는다. index.html은 동일하다. 실행창·PC 실행 소스 일치 여부는 **미확인**이며 게임 실행·서버 재시작·빌드·배포 없음.
- 먼저 `docs/engine/orders/WORK_BOARD.md` 전체와 `FDG_GAME_DEVELOPMENT_PLAN.md`의 단계표/P4·실행 작업표를 읽었다. P4-001은 미배정·개별 HOLD 유지. P2-001l은 PC 레슨·입력 제한, P2-007a는 UI 마감, P3-002는 소환굴, QA-002는 테스트 소유다. 이들과 제품/테스트/설계 문서 소유가 겹치지 않는다.
- 작업판의 일반 갱신·별도 보고서 규칙보다 이번 사용자 지정 **새 문서 1개만**을 우선했다. WORK_BOARD·계획표·설계 docs·코드·테스트는 수정하지 않는다. 이 문서와 DONE으로 총괄에 인계한다.
- **보호:** `docs/2_3`·Q/E 의미/판정·세이브 형식. 관련 행은 추적만 하며 변경·새 형식·마이그레이션 수정·Q/E 리매핑 동작 변경을 제안하지 않는다. 프리셋/설정 영속화도 현행 포맷을 보호하며 구현 단위에서 제외한다.

| 파일 | WT SHA-256 | R SHA-256 |
| --- | --- | --- |
| game.html | 4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4 | ba930ad54520047fc260307c77c0dd14843fcf37dea2e117631f7a26e7aadeb8 |
| index.html | 36008f72723dbcbf1ae7b6af6b08dfe6299962e2445261139b6237082a24cf12 | 36008f72723dbcbf1ae7b6af6b08dfe6299962e2445261139b6237082a24cf12 |

## 1. 원본 데이터·상수·함수·UI·저장 전수 추적

### 1.1 BINDS/BINDS2 구조와 소비

BINDS 초기 고유 액션은 20개다. BINDS2는 같은 20개를 null로 시작하나 `skill` 선언이 두 번 있다(6202·6204, JS 최종 고유 키는 20개). 48752–48753의 reset은 18개여서 `irisToggle`·`bladeToggle`가 사라진다. 초기값·리셋·저장 복원은 별도 경로다. 아래 Q/E는 **보호**다.

| id | 표시명 | 주 키 | 보조 기본 | 선언 game.html | 명시 소비/접근 행(전체) | 경계 |
| --- | --- | --- | --- | --- | --- | --- |
| up | 위로 이동 | KeyW | null | 6189 | 13233–13234, 33003, 33135, 33298, 33349, 33523, 33540, 33571, 33677, 33692, 33702, 33764, 33848, 33857, 33949, 34020, 34054, 34070, 34102, 34134, 45425, 58479 | 현행 추적 |
| down | 아래로 이동 | KeyS | null | 6189 | 13233–13234, 33003, 33135, 33298, 33349, 33523, 33540, 33571, 33677, 33692, 33702, 33764, 33848, 33857, 33949, 34020, 34054, 34070, 34102, 34134, 45425, 58479 | 현행 추적 |
| left | 왼쪽 이동 | KeyA | null | 6189 | 13233, 13235, 33003, 33135, 33298, 33349, 33523, 33540, 33571, 33677, 33692, 33702, 33764, 33848, 33857, 33949, 34020, 34054, 34070, 34102, 34134, 45424, 58479 | 현행 추적 |
| right | 오른쪽 이동 | KeyD | null | 6189 | 13233, 13235, 33003, 33135, 33298, 33349, 33523, 33540, 33571, 33677, 33692, 33702, 33764, 33848, 33857, 33949, 34020, 34054, 34070, 34102, 34134, 45424, 58479 | 현행 추적 |
| weapon | 무기 공격 | mouse0 | null | 6190 | 16850, 32562, 33052–33053, 33283, 33562, 34061, 34076, 45409 | 현행 추적 |
| shield | 칼등 처내기 (탭=처내기, 홀드=연사) | KeyE | null | 6190 | 13217, 28559, 32562, 33047, 33058, 33555, 33582, 33671, 33730, 49425 | 보호 |
| bow | Space 분노 폭발 | Space | null | 6191 | 32555 | 현행 추적 |
| charge | 사슬 이동 | ShiftLeft | null | 6191 | 6242–6243, 32571, 33047, 33518, 33535, 33566, 33688, 34333, 34341, 36696 | 현행 추적 |
| parry | 데빌포스 흡수 | KeyQ | null | 6192 | 14299, 33048–33050, 33276, 33365, 33548–33550, 33579–33581, 33650–33652, 33755, 33779, 34062, 34334, 45410, 49420 | 보호 |
| beam | 마법 (탭=투사체, 홀드=빔) | mouse2 | null | 6193 | 13334, 13412, 28559, 32555, 33044, 33061, 33067, 33336, 33583, 33655, 34063, 34111, 36048, 45411, 49425 | 현행 추적 |
| forge | 대장간 | KeyG | null | 6193 | 28530, 32120, 49418, 52486 | 현행 추적 |
| inventory | 인벤토리 | Tab | null | 6194 | 28532, 32116 | 현행 추적 |
| settings | 설정 | Escape | null | 6194 | 13187, 28534, 32115 | 현행 추적 |
| interact | 아이템 줍기 | KeyR | null | 6195 | 6224–6225, 6233, 13214, 51969, 52317, 52327, 52337, 52365, 52488, 52599, 52611 | 현행 추적 |
| storage | 보관함 | KeyN | null | 6195 | 32117, 49423 | 현행 추적 |
| stats | 능력치 (스탯/패시브) | KeyJ | null | 6195 | 32118, 49422 | 현행 추적 |
| skill | 전투 스킬 | KeyK | null | 6195 | 28528, 32119 | 현행 추적 |
| skillCycle | 스킬 슬롯 배정 | KeyL | null | 6196 | 32121 | 현행 추적 |
| irisToggle | 유령불꽃 켜기/끄기 | KeyY | null | 6196 | 32122 | 현행 추적 |
| bladeToggle | 기동칼날개 자동 켜기/끄기 | KeyU | null | 6196 | 32127 | 현행 추적 |

공통 동적 접근은 `BINDS[action]`·`BINDS2[action]`(14290–14293), 주/보조 선택 writer(6250), `Object.keys(BINDS)` UI(48720–48745), 허용 키만 복원하는 반복(49305–49306·49400–49401)이다. 스킬 숫자1~4/Z/F/Ctrl/X, T/H, F4/F5/F10/F11, 포탈 P 및 실제 Shift 홀드는 모두 BINDS 항목이라고 추정하지 않는다. 원본 고정키가 남아 있다(13176–13418·32113·33069·스킬 소비 전체는 부록 함수/명시 참조와 분리).

| 구간/함수 | game.html 행 | 현재 계약 |
| --- | --- | --- |
| 입력 저장소·리스닝 | 12901–12902·13176–13418 | K/KH, MB/MBjust, listeningBind/_listenAlt/_bindTab. keydown→K/KH; keyup 해제; 마우스 별도 |
| _resetInteractInput / consume / held | 6208–6233 | Map fresh 1회 소비; repeat 새 edge 없음; mouse는 기존 edge; 레슨 allows 게이트 |
| _chainAttackBindingConflict/_repairChainAttackBinds/_setInputBinding | 6236–6253 | charge↔weapon/shield 주·보조만 비교. 정상 지정만 반영, 충돌이면 거부; interact 지정 시 reset. 보호된 공격 의미 변경 제안 없음 |
| _bindName/keyName | 6254–6308 | KO/번역/EN 이름; forceKbm; 고정 패드 glyph와 실제 _GP_KEY는 별개 |
| keydown 우선순위 | 13176–13215 | 컷신→Escape back/대기취소/설정→Ctrl/Meta guard→리스닝→F키→레슨→사망/포커스 UI→K/KH. Escape는 BINDS.settings=Escape로 강제 |
| keyup/blur/hidden | 13329–13382 | keyup K/KH/fresh 해제; _clearHeldInput은 키·마우스·조준/충전 flag 해제. Q/E 보호 |
| 마우스 캡처 | 13393–13418·48854–48869 | 입력 대기는 overlay; 모든 mouse 버튼, contextmenu 방지; 120ms 뒤 overlay pointer 활성 |
| isAct/isJust/isHeld | 14288–14293 | 주→보조 OR short circuit. Just는 K/MBjust 1회 소비; Held는 KH/MB; 레슨 allows 먼저 |
| 패널 토글·퍼즈 | 32108–32132·44049–44079 | systemLesson/G.on/parryLesson 순; 패널 단축키 처리 후 paused return, draw 유지 |
| HUD 현재키 | 28528–28566·44879–44931·63308–63310 | 패널 키·shield/beam 키캡·스킬 슬롯/인트로 키 문구 소비. HTML id RMB/E는 실제 의미와 다를 수 있음 |
| renderSettings | 48635–48872 | cursor/character 선택·keyBindList 재생성, kbm/pad 탭·main/alt/delete·키 reset/F5·초점 복원·대기 overlay |
| 패드 편집 UI | 48763–48841 | _GP_KEY 실제 보유 인덱스 순회. fixed={0,1,2,3,12,13,14,15}; 실제 기본맵에는12~15가 없음. 편집 키는4/5/9/10/11 |
| close / tutorial | 48873–48874 | setClose→closePanel; showTutorialBtn→close 후 기존 튜토리얼 |

### 1.2 OPT 전체 초기 필드와 추가/삭제 필드

선언은 game.html:6311, **38개 초기 필드**다. 아래 참조 행은 `OPT.<field>`의 주석을 포함한 명시 일치 전부이며, 대입/읽기 의미는 해당 행을 확인한다. 선언행 6311에는 bare object key여서 참조 목록에 중복 넣지 않았다. 전체 객체 저장·복원은 48876·49295·49308·49402이므로 아래 모든 현존 필드 및 추가 필드를 함께 포함한다. 동적 `OPT[k]`는 49308·49402다. 누락 필드에 임의 기본값을 새로 정하지 않는다.

| 필드 | 초기값 / 상태 | 명시 OPT.field 참조 game.html 전체 행 |
| --- | --- | --- |
| shake | 80 | 19924, 30811, 32297, 32804, 32860, 33877, 33964, 34008, 34088, 34685, 34700, 34720, 35106, 35127, 37628, 38475–38476, 40320, 40433, 40568, 40679, 40702, 40718, 40751, 40832, 40849, 40865, 40889, 40938, 40973, 40975, 41107–41108, 41135, 41182, 41201, 41231, 41834, 41988, 43328, 43389, 43594, 43855, 46491, 46702, 48907, 49327, 56251 |
| textScale | 100 | 127, 48892–48893, 48908, 49325 |
| panelFit | true | 48899–48900, 48909, 49326 |
| hitStop | 0 | 8666, 25425, 29008, 32297, 33229, 33964, 34008, 34088, 34236, 34285, 34327, 34982, 35106, 35473, 37000, 37628, 37631, 38303, 38476, 40616, 41040, 41135, 42712, 42822, 42854, 42876, 42902, 42909, 42934, 42941, 42966, 43041, 43064, 43328, 43585, 46845 |
| parts | IS_ELECTRON?100:80 | 9233–9236, 32436, 34814, 35214, 35216, 35475, 37634, 42395, 42399, 42402, 43594, 46331, 46559, 48911, 49088, 49095, 49329, 56767 |
| sfxVol | 60 | 10044, 48912, 49330 |
| bgmVol | 60 | 10058, 48913, 49331, 49428 |
| diff | 5 | 9278, 31125–31126, 31396, 31460, 41678, 49038, 49335–49336, 49406–49407, 62244, 62315, 63359 |
| diffV2 | 1 | 48876, 49408 |
| minPickRar | 0 | 32026, 41449, 49043–49044, 49340–49342 |
| minPickLvTier | 0 | 31999, 32001, 49047–49048, 49345 |
| fpsCap | 0 | 49063, 49363, 49365, 60509, 61805–61806 |
| petAuto | true | 49068, 49372 |
| bossDebug | false | 38425, 49075, 49379, 60421 |
| bloom | true | 4482, 9221, 9233–9236, 49088, 49094, 49117, 49380, 55201 |
| trail | true | 9233–9236, 34670, 49088, 49094, 49118, 49381, 54052, 56738, 58442, 59097, 59099 |
| slash | true | 9233–9236, 49088, 49094, 49119, 49382 |
| postfx | true | 9233–9236, 27438, 49088, 49094, 49120, 49383, 54706, 55233, 55409 |
| deathFx | true | 9233–9236, 24868, 24904, 24965, 25071, 25134, 25188, 25237, 25286, 25306, 25363, 25397, 34747, 35274, 49088, 49094, 49121, 49384 |
| lighting | true | 4694, 9233–9236, 49088, 49095, 49122, 49385, 51942 |
| torch | true | 9233–9236, 35753, 49088, 49095, 49123, 49386, 55233 |
| ambPart | false | 9233–9236, 35769, 49088, 49095, 49125, 49388, 52056 |
| fog | true | 9233–9236, 13209, 35789, 49088, 49095, 49126, 49389, 55335, 55353, 55373 |
| bossFog | true | 13209 |
| grain | true | 9233–9236, 49088, 49095, 49127, 49391, 55410 |
| autoPotThr | 0.99 | 49039, 49338 |
| cursor | 0 | 48643, 48664, 49200, 49203, 49410 |
| cursorSize | 50 | 48669–48670, 49146, 49187 |
| quality | 'high' | 4482, 4694, 4715, 54485, 54490, 55199, 55201, 55233, 55335, 55409 |
| resScale | 100 | 4398, 49064, 49368–49369, 65185, 65325 |
| ssaa | 1 | 49065, 49371 |
| outline | true | 49128, 49392, 58718 |
| bgmTrack | 'auto' | 4109, 4113, 4149–4150, 4154, 4158, 48914, 49332 |
| lang | 'ko' | 6278, 8655, 8657–8658, 8662–8663, 48876, 48915, 48926, 49333, 49433–49434, 52119, 62959, 63020, 63111, 63128 |
| crAutoFuse | -1 | 15351, 49059, 49351 |
| crAutoEnh | -1 | 15351, 49060, 49357 |
| showFps | false | 49129, 49390, 60403 |
| atmos | 2 | 9233–9236, 49124, 49309, 49387, 49403, 52653, 55207, 55276, 61842–61843 |
| blPullMode | 초기 리터럴 없음 / P 우선, OPT bool fallback | 28976, 33069, 49073, 49377 |
| bladeAuto | 초기 리터럴 없음 / checkbox 및 U 토글 | 32128–32129, 49074, 49378 |
| brightness | 초기 리터럴 없음 / UI·렌더 fallback 100 | 49070, 49374, 55411 |
| irisGlow | 초기 리터럴 없음 / fallback 250 | 4688, 49071, 49375, 55263, 55296 |
| uiScale | 레거시 삭제 대상 / 보호 | 49413 |
| uiScaleAuto | 레거시 삭제 대상 / 보호 | 49414 |
| vibration | 초기 리터럴 없음 / false일 때 진동 차단 | 19928 |
| xbowAuto | 초기 리터럴 없음 / boolean 저장값이면 _xbowEquipped 복원 | 13222, 49072, 49416 |

`optIrisSz`는 OPT 필드가 아니다. 49069는 `G._irisSz`·`G.pets.iris.sz`를 쓰고 saveSettings를 호출하지만, 48876의 저장 payload에는 G가 없다. `irisToggle`도 `G._irisOff`(32122–32125)다. 이들을 OPT 저장 필드로 오인하지 않는다. `fdgDruidQaControls`는 별도 모듈이 붙일 수 있는 opt-in 확장(3.3 문서:103); 두 HTML의 명시 OPT.field 검색에는 나타나지 않으며 본편 기본 계약에 넣지 않는다.

### 1.3 설정 UI 전수 목록(원본 마크업)

아래는 game.html에서 설정 관련 `input/select` 및 버튼의 실제 선언행·range/선택값이다. HTML 초기값과 OPT/동기화 후 값은 다를 수 있다. 실제 4탭/레이아웃은 외부 `ui-panels.js` 및 `ui-refinement.css`가 재구성하므로 HTML inline 스타일만 최종 UI로 간주하지 않는다. `optLang`은 2709에 실제 select가 있다. `optSsaa`·`optPetAuto`는 guarded handler/동기화 참조가 있으나 실제 input/select 선언이 없어, UI가 존재한다고 보고하지 않는다.

| id | 종류 | game.html 선언행 | HTML 규격 | id 문자열/동명 토큰 참조 전체 행 |
| --- | --- | --- | --- | --- |
| optLang | select | 2709 | ; options=ko,en,zh,zht,ja,es,ru,de,ptbr,fr,pl,it,uk,tr,vi,th,id,ms,ar,sv,da,no,fi,cs,hu,ro,nl,el,bg | 2709, 48915, 49333 |
| optShake | input | 2727 | type=range; min=0; max=100; value=80 | 2727, 48907, 49327 |
| optTextScale | input | 2728 | type=range; min=80; max=160; step=10; value=100 | 2728, 48908, 49325 |
| optPanelFit | input | 2729 | type=checkbox; checked | 2729, 48909, 49326 |
| optParts | input | 2731 | type=range; min=5; max=100; step=5; value=80 | 2731, 48911, 49329 |
| optSfx | input | 2732 | type=range; min=0; max=100; value=60 | 2732, 48912, 49330 |
| optBgm | input | 2733 | type=range; min=0; max=100; value=30 | 2733, 48913, 49331 |
| optBgmTrack | select | 2735 | ; options=auto,allRandom,lobby,hell1,hell2,hell3,hell4,hell5,hell6,hell7,gameplay,t:bgm/공통/Just One More Hill V4.mp3,t:bgm/공통/Just One More Hill V5.mp3,t:bgm/공통/네메시아 강림V5.mp3,t:bgm/공통/네메시아의 강림 V3.mp3,t:bgm/공통/네메시아의 강림.mp3,t:bgm/공통/Coronam Ferro.mp3,t:bgm/공통/Coronam Ferro V2.mp3,t:bgm/1장_썩은숲/Ashes of the Fallen Gate.mp3,t:bgm/1장_썩은숲/hell1_ice.mp3,t:bgm/1장_썩은숲/Bloodsteel Ascension.mp3,t:bgm/1장_썩은숲/Bloodsteel Ascension 2.mp3,t:bgm/1장_썩은숲/Exoduser.mp3,t:bgm/1장_썩은숲/Exoduser2.mp3,t:bgm/1장_썩은숲/Exoduser3.mp3,t:bgm/1장_썩은숲/Exoduser2.1.mp3,t:bgm/1장_썩은숲/Blood Moon Siege.mp3,t:bgm/1장_썩은숲/Blood Moon Siege2.mp3,t:bgm/1장_썩은숲/Wrath of the Golden Age.mp3,t:bgm/1장_썩은숲/Iron Oath Under Ash.mp3,t:bgm/1장_썩은숲/Neon Hellfire Protocol.mp3,t:bgm/1장_썩은숲/Neon Hellfire Protocol (1).mp3,t:bgm/1장_썩은숲/Ashes Under the Banner.mp3,t:bgm/1장_썩은숲/Blade Choir of the Black Citadel.mp3,t:bgm/1장_썩은숲/Cathedral of Steel.mp3,t:bgm/1장_썩은숲/Cathedral of Steel (1).mp3,t:bgm/2장_벌레굴/Carapace Cathedral.mp3,t:bgm/3장_얼음굴/Abyssal Drift.mp3,t:bgm/4장_화염지대/Ignis et Sanguis.mp3,t:bgm/4장_화염지대/Inferno Liturgia.mp3,t:bgm/5장_지옥군단/Abyss Below.mp3,t:bgm/6장_사도마굴/Kiln of Broken Crowns.mp3,t:bgm/7장_지옥성/Midnight Cathedral of Ash.mp3,t:bgm/7장_지옥성/Teeth in the Choir.mp3,t:bgm/공통/네메시아의 강림3(Remastered).wav,t:bgm/공통/네메시아의 강림2 (Remastered).wav,t:bgm/공통/네메시아 강림 (Remastered).wav,t:bgm/공통/Coronam Ferro2(Remastered).wav,t:bgm/공통/Coronam Ferro (Remastered).wav,t:bgm/공통/Just One More Hill (Remastered) 2.wav,t:bgm/공통/Just One More Hill (Remastered).wav,t:bgm/공통/고개 하나만 (Remastered) 2.wav,t:bgm/공통/고개 하나만 (Remastered).wav,t:bgm/3장_얼음굴/흰눈의 맹세2 (Remastered).wav,t:bgm/3장_얼음굴/흰눈의 맹세 (Remastered).wav,t:bgm/1장_썩은숲/Ashes Under the Banner (Remastered).wav,t:bgm/1장_썩은숲/Cathedral of Steel (Remastered).wav,t:bgm/1장_썩은숲/Neon Hellfire Protocol2(Remastered).wav,t:bgm/1장_썩은숲/Neon Hellfire Protocol (Remastered).wav,t:bgm/1장_썩은숲/Iron Oath Under Ash (Remastered).wav,t:bgm/1장_썩은숲/Wrath of the Golden Age (Remastered).wav,boss,finalboss,forge,t:bgm/공통/forge.mp3,t:bgm/공통/복수의 대장간.mp3,t:bgm/공통/Anvil Ashes.mp3,death,t:bgm/공통/death.mp3,t:bgm/공통/지옥 추락 사망 징글.mp3,victory,t:bgm/공통/victory.mp3,t:bgm/공통/탈출 성공.mp3 | 2735, 48914, 48942, 49332 |
| optDiff | input | 2817 | type=range; min=0; max=10; value=5 | 2817, 49038, 49334, 49335 |
| optAutoPot | input | 2818 | type=range; min=30; max=99; step=1; value=99 | 2818, 49039, 49338 |
| optMinRar | input | 2819 | type=range; min=0; max=4; value=0 | 2819, 49043, 49339, 49340 |
| optMinLv | input | 2820 | type=range; min=0; max=7; value=0 | 2820, 32000, 49046, 49344, 49347 |
| optCrAutoFuse | input | 2821 | type=range; min=-1; max=3; step=1; value=-1 | 2821, 49059, 49350, 49352 |
| optCrAutoEnh | input | 2822 | type=range; min=-1; max=4; step=1; value=-1 | 2822, 49060, 49356, 49358 |
| optFps | input | 2823 | type=range; min=0; max=5; step=1; value=5 | 2823, 49063, 49362, 49364 |
| optResScale | input | 2824 | type=range; min=50; max=100; step=10; value=100 | 2824, 49064, 49367, 49368 |
| optIrisSz | input | 2826 | type=range; min=1; max=100; value=20 | 2826, 49069, 49373 |
| optBrightness | input | 2827 | type=range; min=70; max=130; value=100 | 2827, 49070, 49374 |
| optIrisGlow | input | 2828 | type=range; min=100; max=400; value=250 | 2828, 49071, 49375 |
| optXbowAuto | input | 2829 | type=checkbox; checked | 2829, 13223, 49072, 49376 |
| optBlPullMode | input | 2830 | type=checkbox | 2830, 33069, 49073, 49377 |
| optBladeAuto | input | 2831 | type=checkbox | 2831, 49074, 49378 |
| optBossDbg | input | 2832 | type=checkbox | 2832, 49075, 49379 |
| optDispMode | select | 2838 | ; options=windowed,borderless,fullscreen | 2838, 48947, 49221, 49231, 49232, 49233, 49235, 49244 |
| optRes | select | 2843 | ; options= | 2843, 49212, 49238, 49240 |
| optCursorSize | input | 2856 | type=range; min=30; max=200; step=5 | 2856, 48669 |
| optBloom | input | 2862 | type=checkbox; checked | 2862, 49117, 49380 |
| optTrail | input | 2863 | type=checkbox; checked | 2863, 49118, 49381 |
| optSlash | input | 2864 | type=checkbox; checked | 2864, 49119, 49382 |
| optPostfx | input | 2865 | type=checkbox; checked | 2865, 49120, 49383 |
| optDeathFx | input | 2866 | type=checkbox; checked | 2866, 49121, 49384 |
| optLighting | input | 2867 | type=checkbox; checked | 2867, 49122, 49385 |
| optTorch | input | 2868 | type=checkbox; checked | 2868, 49123, 49386 |
| optAtmos | select | 2869 | ; options=0,1,2 | 2869, 48950, 49124, 49387 |
| optAmbPart | input | 2870 | type=checkbox; checked | 2870, 49125, 49388 |
| optFog | input | 2871 | type=checkbox; checked | 2871, 49126, 49389 |
| optGrain | input | 2872 | type=checkbox; checked | 2872, 49127, 49391 |
| optOutline | input | 2873 | type=checkbox; checked | 2873, 49128, 49392 |
| optShowFps | input | 2874 | type=checkbox | 2874, 49129, 49390 |
| btnRedetect | button | 2885 |  | 2885, 48952, 49258 |
| saveP1 | button | 2892 |  | 2892, 48952, 49318 |
| loadP1 | button | 2893 |  | 2893, 48952, 49319 |
| saveP2 | button | 2896 |  | 2896, 48952, 49320 |
| loadP2 | button | 2897 |  | 2897, 48952, 49321 |
| toLobbyBtn2 | button | 2904 |  | 2904, 48952, 63684 |
| resetBtn | button | 2908 |  | 2908, 48748, 48749, 48750, 48758, 48759, 48952, 49440 |
| resetYes | button | 2911 |  | 2911, 48952, 49449 |
| resetNo | button | 2912 |  | 2912, 48952, 49441 |
| quitBtn | button | 2916 |  | 2916, 48952, 49444 |
| setClose | button | 2921 |  | 2921, 48873, 48952 |

표시 그리드/값 노드: `#keyBindList`2718, `#charSelectGrid`2850, `#cursorGrid`2855, `#gfxPresetRow`2861, 진단 노드2880–2883, `#saveMsg`2899. 키·카드는 실제 button 및 `aria-label/aria-pressed/aria-describedby/data-bind-control/data-settings-choice` 를 사용한다. 한국어/영어 표시는 `_bindName`·`_L`·`_T` 경유다. 위 표의 ID와 규격은 원본 값 그대로다.

### 1.4 설정 함수·상수 선언 목록

이 표는 설정 핵심 구간의 named function·const/let 선언을 빠짐없이 추출한 것이다. 함숫값인 oninput/onchange/onclick은 §1.3의 id 참조와 §1.2의 필드 참조에서 추적한다. 함수 행은 선언행이며 범위 끝을 추정한 값이 아니다. 번역 카탈로그 본문과 전투 수식은 재설계하지 않는다.

| 이름 | 종류/인자 | game.html 선언행 | 참조 전체 행 |
| --- | --- | --- | --- |
| BINDS | 상수/상태 | 6188 | 6188, 6224, 6233, 6239, 6242, 6250, 13187, 13214, 13217, 13233, 13334, 13412, 14290–14291, 14293, 28528, 28530, 28532, 28534, 28559, 28566, 48719, 48726, 48752, 48876, 49295, 49305–49306, 49400–49401, 49418, 49420, 49422–49423, 49425, 51969, 52317, 52327, 52337, 52365, 52486, 52488, 52599, 52611, 63309, 65661 |
| BINDS2 | 상수/상태 | 6198 | 6198, 6225, 6233, 6239, 6243, 6250, 13214, 13217, 13234–13235, 13334, 13412, 14290–14291, 14293, 48734–48736, 48740, 48742, 48753, 48876, 49295, 49306, 49401, 65661 |
| _interactKeyFresh | 상수/상태 | 6208 | 6208, 6211, 6218–6219, 6229, 13214, 13331 |
| _interactResetPending | 상수/상태 | 6209 | 6209, 6212, 32825 |
| _resetInteractInput | 함수() | 6210 | 6210, 6251, 13372, 31534, 43869, 48742, 48754, 48794, 48798, 48811, 49307, 63472 |
| _consumeInteractCode | 함수(code) | 6214 | 6214, 6224–6225 |
| _consumeInteractPressed | 함수() | 6222 | 6222, 32826 |
| _interactCodeHeld | 함수(code) | 6228 | 6228, 6233 |
| _interactHeld | 함수() | 6231 | 6231, 32955 |
| _chainAttackBindingConflict | 함수(action,key) | 6236 | 6236, 6242–6243, 6246 |
| _repairChainAttackBinds | 함수() | 6241 | 6241, 49310, 49426 |
| _setInputBinding | 함수(action,key,alternate) | 6245 | 6245, 13200, 48863 |
| BIND_NAMES | 상수/상태 | 6254 | 6254, 6278, 8012 |
| BIND_NAMES_EN | 상수/상태 | 6266 | 6266, 6278 |
| _bindName | 함수(key) | 6278 | 6278, 48721, 48727, 48736, 48741 |
| keyName | 함수(code,forceKbm) | 6279 | 6279, 28528, 28530, 28532, 28534, 28567, 48726, 48735, 48782, 51969, 52317, 52327, 52337, 52365, 52486, 52488, 52599, 52611, 63309 |
| OPT | 상수/상태 | 6311 | 127, 4109, 4113, 4149–4150, 4154, 4158, 4398, 4482, 4688, 4694, 4715, 6278, 6311–6312, 8655, 8657–8658, 8662–8663, 8666, 9221, 9233–9236, 9278, 10044, 10058, 13209, 13222, 15351, 19924, 19928, 24868, 24904, 24965, 25071, 25134, 25188, 25237, 25286, 25306, 25363, 25397, 25425, 27438, 28976, 29008, 30811, 31125–31126, 31396, 31460, 31682, 31999, 32001, 32026, 32128–32129, 32297, 32436, 32804, 32860, 33069, 33229, 33877, 33964, 34008, 34088, 34236, 34285, 34327, 34670, 34685, 34700, 34720, 34747, 34814, 34982, 35106, 35127, 35214, 35216, 35274, 35473, 35475, 35753, 35769, 35789, 37000, 37628, 37631, 37634, 38303, 38425, 38475–38476, 40320, 40433, 40568, 40616, 40679, 40702, 40718, 40751, 40832, 40849, 40865, 40889, 40938, 40973, 40975, 41040, 41107–41108, 41135, 41182, 41201, 41231, 41449, 41678, 41834, 41988, 42395, 42399, 42402, 42712, 42822, 42854, 42876, 42902, 42909, 42934, 42941, 42966, 43041, 43064, 43328, 43389, 43585, 43594, 43855, 46331, 46491, 46559, 46702, 46845, 48643, 48664, 48669–48670, 48876, 48892–48893, 48899–48900, 48904, 48907–48909, 48911–48915, 48926, 49038–49039, 49043–49044, 49047–49048, 49059–49060, 49063–49065, 49068, 49070–49075, 49088, 49094–49095, 49117–49129, 49146, 49187, 49200, 49203, 49295, 49308–49309, 49325–49327, 49329–49333, 49335–49336, 49338, 49340–49342, 49345, 49351, 49357, 49363, 49365, 49368–49369, 49371–49372, 49374–49375, 49377–49392, 49402–49403, 49406–49408, 49410, 49413–49414, 49416, 49428, 49433–49434, 51942, 52056, 52119, 52653, 54052, 54485, 54490, 54706, 55199, 55201, 55207, 55233, 55263, 55276, 55296, 55335, 55353, 55373, 55409–55411, 56251, 56738, 56767, 58442, 58718, 59097, 59099, 60403, 60421, 60509, 61805–61806, 61842–61843, 62244, 62315, 62959, 63020, 63111, 63128, 63359, 65185, 65325, 65661 |
| detectTier | 함수() | 9167 | 9167, 9241, 49259 |
| _benchTick | 함수() | 9195 | 9195, 61847 |
| _gpuScoreCache | 상수/상태 | 9231 | 9217, 9231, 9241, 49259 |
| _applyTierPreset | 함수(tier) | 9232 | 9183, 9222, 9232 |
| _drawSettingsCharacterPreview | 함수(cv,img,ch) | 48613 | 48613, 48686 |
| renderSettings | 함수() | 48635 | 13185, 13198, 13201, 13749, 44049–44050, 48635, 48664, 48698, 48714, 48728, 48737, 48742, 48755, 48793–48794, 48798, 48811, 48864, 48915, 49313 |
| saveSettings | 함수() | 48876 | 9237, 13201, 13209, 13222, 33069, 48664, 48670, 48742, 48755, 48864, 48876, 48907–48909, 48911–48915, 49038–49039, 49044, 49053, 49059–49060, 49063–49065, 49068–49075, 49096, 49117–49129, 49313, 49436, 63359, 65664 |
| applyUIScale | 함수() | 48880 | 48880, 48889, 48903, 48905, 49429 |
| applyTextScale | 함수() | 48891 | 48891, 48896, 48908, 49325 |
| applyPanelFit | 함수() | 48898 | 48898, 48902, 48909, 49326 |
| _localizedControlKey | 함수(key) | 48916 | 48916, 48970, 49030 |
| _refreshPersistentHudLanguage | 함수() | 48919 | 48919, 48927 |
| _applyLang | 함수() | 48925 | 2916, 48915, 48925, 49037, 49333 |
| RAR_LABEL | 상수/상태 | 49040 | 49040, 49042 |
| RAR_LABEL_EN | 상수/상태 | 49041 | 49041–49042 |
| _rarLabel | 함수(i) | 49042 | 49042–49043, 49341 |
| _crAutoFuseLabel | 상수/상태 | 49057 | 49057, 49059, 49353 |
| _crAutoEnhLabel | 상수/상태 | 49058 | 49058, 49060, 49359 |
| _FPS_STEPS | 상수/상태 | 49062 | 49062–49063, 49363 |
| _GFX_PRESETS | 상수/상태 | 49077 | 49077, 49086–49087, 49093, 49102–49103 |
| _gfxPresetSel | 상수/상태 | 49084 | 49084, 49096, 49100, 49103, 49109–49110 |
| _detectPreset | 함수() | 49085 | 49085, 49100 |
| _applyPreset | 함수(idx) | 49092 | 49092, 49111 |
| _renderPresetBtns | 함수() | 49098 | 48911, 49034, 49096, 49098, 49115, 49117–49123, 49125–49127 |
| _CURSORS | 상수/상태 | 49131 | 48642, 49131, 49135–49138, 49140, 49149, 49189 |
| _cursorCache | 상수/상태 | 49144 | 48664, 48670, 49141–49142, 49144, 49148, 49150, 49159–49160, 49183–49184, 49188, 49195–49196 |
| _buildCursor | 함수(idx) | 49145 | 49145, 49190, 49200 |
| _buildHoverCursor | 함수(idx) | 49186 | 49186, 49203 |
| _hoverStyleEl | 상수/상태 | 49198 | 49198, 49204–49205 |
| _applyCursor | 함수() | 49199 | 13475, 13477–13478, 48664, 48670, 49141, 49199, 49439 |
| _updateDiagUI | 함수() | 49266 | 49266, 49290 |
| _savePreset | 함수(slot) | 49293 | 49293, 49318, 49320 |
| _loadPreset | 함수(slot) | 49299 | 49299, 49319, 49321 |
| syncSettingsUI | 함수() | 49324 | 9237, 49096, 49312, 49324, 49438 |
| _settingsMigrated | 상수/상태 | 49396 | 49396, 49427, 49436 |
| _fpsFrames | 상수/상태 | 60372 | 60372, 60378, 60388–60389 |
| _gcSpikes | 상수/상태 | 60374 | 60374, 60383, 60386 |
| _frameTimes | 상수/상태 | 60375 | 60375, 60382, 60384 |
| _prevFt | 상수/상태 | 60376 | 60376, 60381 |
| _fpsUpdate | 함수() | 60377 | 60377, 61847 |
| _fpsDraw | 함수() | 60400 | 60400, 61907 |
| _bossDbgDraw | 함수() | 60420 | 60417, 60420 |
| PHYS_STEP | 상수/상태 | 60467 | 54580, 60467, 61832, 61836, 61876–61877, 61880, 61895 |
| _acc | 상수/상태 | 60468 | 60468, 61832–61834, 61837, 61876, 61880, 61885, 61895 |
| _startLoop | 함수() | 60469 | 12549, 60469, 63865, 64166 |
| _serializeMap | 함수() | 60471 | 60471, 60492, 60500 |
| _fitEditorView | 함수() | 60476 | 60476, 60491, 63873 |
| _loopRunning | 상수/상태 | 60508 | 60508, 61812 |
| _fpsCapInterval | 상수/상태 | 60509 | 60509, 61806, 61808 |
| _lastLoopTs | 상수/상태 | 60510 | 60510, 61807, 61810 |

### 1.5 FPS·Tier·프리셋의 서로 다른 계약

| 항목 | 원본 행 | 정확 계약 |
| --- | --- | --- |
| _FPS_STEPS | 49062–49063·2823·49362–49365 | [30,60,120,144,244,0], UI index0..5, 0=무제한. 244는 오타로 고치지 않는다 |
| loop cap | 60509·61803–61810 | cap truthy면 interval=1000/cap; elapsed<interval−1 이면 rAF 예약 후 return. _lastLoopTs는 통과 뒤 갱신; cap 건너뛰기는 _pollGamepad보다 앞 |
| frame/physics | 60467·61819–61847·61875 이후 | PHYS_STEP=1000/60, raw frame 0..50ms clamp, catch-up 모바일2/업데이트≤8ms면5/그 외3틱. render FPS와 60Hz를 구분 |
| detectTier | 9168–9195 | GPU renderer 점수4/3/2/1; Electron A 확정·preset 즉시적용 없음; mobile C 즉시 _applyTierPreset(C), return1. regex 원본 보존 |
| _benchTick | 9196–9229 | 120 표본(0 포함→119 delta 평균), hidden 또는 gap>250ms 리셋; FPS≥120/80/45의 점수4/3/2/그 외1; GPU/FPS min |
| 자동 preset 적용 조건 | 9220–9228 | 설정 raw 없음 또는 typeof OPT.bloom===undefined면 적용. 그 외 diagnostic만. 실제 코드 조건이 일반 설명보다 구체적 |
| _applyTierPreset | 9232–9240 | S/A/B/C 네 가지. saveSettings→syncSettingsUI→진단. quality/fpsCap/resScale/ssaa/bossFog는 여기서 쓰지 않음 |
| 수동 graphics preset | 49077–49115 | 5단계·11개 필드; _detectPreset 역순 완전 비교, 불일치 −1; _applyPreset은 atmos/quality/fpsCap를 안 씀 |
| ATMOS 자동 강등 | 61838–61843·49124 | hiFPS >80 on/<55 off. atmos2에서 <55 180f 후1; atmos1·!_atmUserSet에서 >70 300f 후2; 수동선택은 user flag=1 |
| diagnostics / showFps | 49257–49290·60372–60420 | 재진단·1초 UI timer; 빈 bench는 미실시. _fpsDraw는 OPT.showFps guard. 실제 측정 FPS와 cap 구별 |
| resScale/SSAA | 4396–4435·49064–49067 | _dpr=1, logical 짝수 픽셀. ssaa 호환 handler/캐시 무효화는 있어도 rz는 _ssaa=1 고정. UI scale과 별도 |

자동 Tier 값은 다음과 같다. `effects`는 bloom/trail/slash/postfx/deathFx/lighting/torch/ambPart/fog/grain 순서다.

| Tier | effects | parts | atmos |
| --- | --- | --- | --- |
| S | T T T T T T T T T T | 100 | 2 |
| A | T T T T T T T T T T | 80 | 2 |
| B | F T T F T F T T F F | 60 | 1 |
| C | F F F F F F F F F F | 40 | 0 |

수동5단계는 같은 effects 순서로 최저=F F F F F F F F F F/parts5, 낮음=F T T T T F T F F F/10, 중간=F T T T T T T F T F/20, 높음=T T T T T T T F T T/30, 울트라=모두T/50이다. 자동 S/A와 수동 울트라는 particles가 다르다. 두 종류를 하나의 enum으로 합치지 않는 순서안을 제시한다.

### 1.6 저장 필드·복원 순서 — 보호(변경 제안 없음)

| 저장 영역 | 실제 payload / 수명 | 원본 행 | 경계 |
| --- | --- | --- | --- |
| hellcave_settings | {binds:{...BINDS},binds2:{...BINDS2},opt:{...OPT}}; saveSettings 진입 diffV2=1 | 48876·49395–49438 | 보호: 형식 및 이관 변경 제안 없음 |
| hellLang | OPT.lang 문자열 별도 저장; 로비 독립 최신 선택이 settings보다 나중에 복원 | 48876·49433–49436 / index2159–2164·2242 | 보호 |
| hellcave_preset_1 / _2 | 동일 {binds,binds2,opt}; _savePreset/_loadPreset. 로드→interact reset→OPT merge→atmos fallback→repair→rz→sync→render/save | 49293–49321 | 보호: 자동 load와 달리 legacy diff/UI scale/cursor/xbow 이관 전부를 수행하지 않음 |
| gpKeyMap | _GP_KEY의 buttonIndex→keyCode JSON. 기본9개 0,1,2,3,4,5,9,10,11; 12~15 load 무시 | 13494–13509 | 보호: settings payload와 별개 |
| hellcave_screen | {mode,res}; mode=windowed/borderless/fullscreen, res=WxH. electronAPI 조건 | 49208–49255 | 보호: 옵션 OPT에는 없음 |
| inputMode | kbm/pad. index 전환 저장, 게임 초기 mode와 실제 _gpActive 전환은 별도 | index1151·1242·4728–4738 / game13446·13876 | 보호: 장치연결 vs active 구별 |
| _charIdx | 설정 캐릭터 카드 _loadCharAtlas(ci)→_charIdx 문자열 저장. 로비 슬롯의 charIdx와 저장 key가 다름 | 48698·10453·10470 | 보호: 캐릭터/슬롯 세이브 미변경 |
| _FDGDruidQaStorage | 정확 opt-in일 때 settings/preset/gp/screen/hellLang는 RAM 경유. 일반 localStorage와 별개 | 48876·49295·49302·49398 / 외부 QA 모듈 | 보호: QA active를 본편 기본값으로 간주하지 않음 |
| G._irisSz / G._irisOff | G/runtime 소유. saveSettings payload에는 G 없음 | 49069·32123 | 지속성은 미확인; OPT 저장으로 보고하지 않음 |

자동 로드: 허용된 BINDS 키 merge→OPT 모든 key merge→atmos fallback→구 diffV2 판정→cursor0→uiScale/uiScaleAuto 삭제→xbow boolean 복원→구 키 정리/QE swap→사슬 충돌 repair→BGM gain→UI 자동배율→별도 hellLang→마이그레이션 저장→rz→syncSettingsUI→cursor 적용. 모든 포맷·Q/E 이관은 **보호**다. `_loadPreset`과 같은 경로라고 주장하지 않는다.

### 1.7 index.html 관련 시스템(게임 설정 본체와 구분)

index.html에는 `BINDS`·`BINDS2`·`OPT`·`fpsCap` 선언/접근이 없다(정적 전수 검색). 게임 설정창·Tier preset도 없다. 다음은 로비에서 게임으로 넘기는 관련 의존이다.

| 데이터/상수/함수/UI | index.html 행 | 계약 |
| --- | --- | --- |
| _GP | 1122–1136 | connected/active/prev/axes4/DEAD=.25/vibRef/_handlers; on/off/vib/vibLoop/vibLoopStop |
| 연결/입력모드 전환 | 1137–1250 | _clearGamepadFeedback/_leaveGamepadInput/_resetDisconnectedPadState/_handoffConnectedPadState 및 rAF _gpGlobalPoll. inputMode 저장 |
| language select 4곳 | 684·702·713·801 | cinLang/langSelect/loginLangSelect/lobbyLangSelect; _syncAllLangSelects(2232) 및 onchange2237–2242 |
| 언어 우선순위 | 2157–2164 | _I18N_SUPPORTED 외부 ExoduserI18n.languages; URL lang→저장 hellLang→Steam→browser→en. setUserLanguage 검증/저장/URLoverride 제거 |
| _lobbyLang/_TL/_applyLobbyLang | 2165–2203 | 문서 언어/방향·번역 리프·동적 카드/상태 갱신. 게임 OPT.lang와 독립 reader |
| 언어 popup | 4066–4132 | _langPopOpen/Idx/Sel/Pointer·open/position/close/keydown/highlight. Escape/Tab·IME/repeat·resize·outside pointer |
| 로비 audio | 2244–2270·2499·2535–2545 | lobbyBGM .65, introVoice .7, cinematic .6; WorldIntro player volume controls. 게임 sfxVol/bgmVol 직접 공유 아님 |
| _inputMode/_showInputModeScreen/_applyInputMode | 4728–4738 | 저장 inputMode fallback kbm, chosen=true(선택화면 스킵), _preferredInputMode만 설정 |

### 1.8 게임패드 설정 경계

| 구조/함수 | game.html 행 | 원본 계약 |
| --- | --- | --- |
| GP_BINDS | 13421–13442 | 미사용 레거시. GP_DEAD=.25. 실제 입력은 _GP_KEY 주입; 이것을 native 기본 액션권위로 사용하지 않음 |
| _GP_KEY_DEFAULT/_GP_KEY/_GP_KEYIDX | 13494–13509 | button9개 defaults, inverse map 재구성. 장치상태/저장맵/표시 glyph 분리 |
| _gpInjectKey/_gpClearAll | 13511–13531 | mouse=MB/MBjust, keyboard=합성 _fromGp 이벤트. release-sync와 disconnect cleanup |
| UI navigation/virtual cursor | 13534–13835·14115–14286 | repeat delay380ms/interval110ms, cursor speed6, 패널/인벤/결정피커 별도 route; 조작 설정에서 원 입력 의미 추정 금지 |
| _pollGamepad | 13836–14112 | 실연결 폴링→active 전환→cutscene/UI 차단→Dpad 직접 패널→LT combo→버튼 주입→RS 마법→좌스틱 WASD |
| LT/RT | 13960–14007 | LT held>.7; combo A1/B2/Y3/X4; 단독 release KeyF tap100ms. GP_BINDS와 다름. RT 전용 처리도 원본 caller 그대로 보호 |
| Dpad | 13896–13909 | 12 skillPanel/13 forge/14 statPanel/15 inv storage, 직접 처리. 일반 BINDS 주입 아님 |
| 스틱 | 13856–13865·14082–14110 | 축별 .25 deadzone, RS magnitude>.2→mouse2; 좌스틱 실제 주입은 고정WASD. 커스텀 BINDS 따라간다는 주장은 안 함 |
| _gpVibrate | 19927 이후 | OPT.vibration===false면 차단. 초기 literal 필드는 없음; physical pad 미검증 |
| glyph/HUD/pet hints | 6282–6293·28559–28578·9340 이후 | keyName 고정맵과 _SK_SLOTS 및 _petPadMappedHint의 실제 맵 reader는 분리 |

### 1.9 외부 연결과 입력/로비 선언 보충

두 HTML의 해당 시스템은 아래 외부 파일을 로드한다. UI 재배치·번역·격리저장처럼 실제 동작을 결정하는 의존을 HTML 본문만으로 대체하지 않는다.

| 의존 파일 | 실제 근거 | 추적 경계 |
| --- | --- | --- |
| ui-panels.js | game2558 / ui-panels.js:71–158 | 4탭 game/display/audio/controls, moveRow로 기존 ID/listener 유지. 111행 display9개,112행 audio3개,114행 sections route |
| ui-refinement.css | game2552 / ui-refinement.css:1389–1403 | guide-scale zoom, fit/non-fit 크기; CSS 최종 cascade. UI 실화면 이번 미검증 |
| localization-runtime.js / localization-data.js / lobby_i18n.js | index8–9·1112 / game99–100 / ExoduserI18n 호출 | languages/resolveLanguage/applyDocumentLanguage 전역 제공 경계; 게임 lang selector에는29개 option(2709). catalog 전체 번역 인수 아님 |
| world-intro-player.js / world-intro-subtitles*.js | index1115–1117 / world-intro-subtitles.js:6–15 | 로비 언어 resolve 및 시네마틱 volume/subtitle. 원본 OPT 설정 본체와 분리 |
| engine/fdg/druid-qa-storage.js | game15 / 해당 파일1–18·38–48 | opt-in active·memory storage 경계. 내부 persistence schema를 재설계하지 않음 |
| parry-lesson.js | game 외부 script와 isAct/isJust/isHeld의 window._parryLesson 호출 | 레슨 allows/allowKey/releaseKey 및 reset 의존. P2-001l 진행 중; Q/E·2_3 보호 |
| electronAPI | game49208–49255 | OS 화면모드/해상도 bridge 존재 조건; Mac/native Godot의 동일 OS 연결은 미확인 |

입력/패드 및 index 로비의 named 선언을 아래에 보충한다. 인라인 event/callback은 §1.1·§1.7·§1.8의 범위표에 포함한다. 숫자는 선언행이며 동작 전체의 검증 완료 표시는 아니다.

| 파일 | 행 | 선언 | 종류 |
| --- | --- | --- | --- |
| game.html | 12901 | listeningBind | 상수/상태 |
| game.html | 12902 | _bindTab | 상수/상태 |
| game.html | 13371 | _clearHeldInput | 함수 |
| game.html | 13421 | GP_BINDS | 상수/상태 |
| game.html | 13442 | GP_DEAD | 상수/상태 |
| game.html | 13443 | _gpad | 상수/상태 |
| game.html | 13444 | _gpVibRef | 상수/상태 |
| game.html | 13445 | _gpConnected | 상수/상태 |
| game.html | 13446 | _gpActive | 상수/상태 |
| game.html | 13447 | _gpHasRStick | 상수/상태 |
| game.html | 13448 | _gpSynced | 상수/상태 |
| game.html | 13460 | _gpBootDetect | 함수 |
| game.html | 13461 | gps | 상수/상태 |
| game.html | 13481 | _gpAutoAim | 함수 |
| game.html | 13483 | best | 상수/상태 |
| game.html | 13485 | e | 상수/상태 |
| game.html | 13487 | d | 상수/상태 |
| game.html | 13494 | _GP_KEY_DEFAULT | 상수/상태 |
| game.html | 13500 | _GP_KEY | 상수/상태 |
| game.html | 13501 | _GP_KEYIDX | 상수/상태 |
| game.html | 13502 | _rebuildGpKeyIdx | 함수 |
| game.html | 13508 | _saveGpKeyMap | 함수 |
| game.html | 13509 | _resetGpKeyMap | 함수 |
| game.html | 13510 | _gpInjHeld | 상수/상태 |
| game.html | 13511 | _gpInjectKey | 함수 |
| game.html | 13516 | _gpClearAll | 함수 |
| game.html | 13534 | _gpUIIdx | 상수/상태 |
| game.html | 13535 | _gpUIPrev | 상수/상태 |
| game.html | 13536 | _gpUIRepeatDir | 상수/상태 |
| game.html | 13537 | _GP_UI_DELAY | 상수/상태 |
| game.html | 13539 | _gpVC | 상수/상태 |
| game.html | 13540 | _gpVCInit | 함수 |
| game.html | 13542 | d | 상수/상태 |
| game.html | 13547 | _gpVCUpdate | 함수 |
| game.html | 13549 | ax | 상수/상태 |
| game.html | 13550 | dead | 상수/상태 |
| game.html | 13552 | mag | 상수/상태 |
| game.html | 13553 | s | 상수/상태 |
| game.html | 13563 | _gpVCHide | 함수 |
| game.html | 13565 | _gpScEl | 상수/상태 |
| game.html | 13566 | _gpFindScroll | 상수/상태 |
| game.html | 13567 | _gpDoScroll | 상수/상태 |
| game.html | 13570 | _gpFindScrollDown | 상수/상태 |
| game.html | 13572 | _gpSectType | 상수/상태 |
| game.html | 13591 | _sec | 상수/상태 |
| game.html | 13596 | _gpUIStep | 함수 |
| game.html | 13597 | cur | 상수/상태 |
| game.html | 13602 | stp | 상수/상태 |
| game.html | 13609 | opts | 상수/상태 |
| game.html | 13616 | ct | 상수/상태 |
| game.html | 13620 | ni | 상수/상태 |
| game.html | 13626 | _gpUINav | 함수 |
| game.html | 13629 | _spop | 상수/상태 |
| game.html | 13632 | SEL | 상수/상태 |
| game.html | 13633 | items | 상수/상태 |
| game.html | 13634 | all | 상수/상태 |
| game.html | 13636 | el | 상수/상태 |
| game.html | 13646 | _dU | 상수/상태 |
| game.html | 13647 | _dD | 상수/상태 |
| game.html | 13648 | _dL | 상수/상태 |
| game.html | 13649 | _dR | 상수/상태 |
| game.html | 13650 | u | 상수/상태 |
| game.html | 13653 | _vcHover | 상수/상태 |
| game.html | 13654 | _vcRng | 상수/상태 |
| game.html | 13656 | _nowTs2 | 상수/상태 |
| game.html | 13658 | _s2 | 상수/상태 |
| game.html | 13660 | _s2 | 상수/상태 |
| game.html | 13667 | rsYVal | 상수/상태 |
| game.html | 13668 | rsXVal | 상수/상태 |
| game.html | 13669 | a | 상수/상태 |
| game.html | 13670 | b | 상수/상태 |
| game.html | 13671 | lb | 상수/상태 |
| game.html | 13672 | rb | 상수/상태 |
| game.html | 13675 | _nowDir | 상수/상태 |
| game.html | 13676 | _nowTs | 상수/상태 |
| game.html | 13677 | _didMove | 상수/상태 |
| game.html | 13691 | cur | 상수/상태 |
| game.html | 13697 | _ci | 상수/상태 |
| game.html | 13703 | tabs | 상수/상태 |
| game.html | 13706 | ti | 상수/상태 |
| game.html | 13713 | _lc | 상수/상태 |
| game.html | 13714 | _lt | 상수/상태 |
| game.html | 13716 | ni | 상수/상태 |
| game.html | 13721 | ni | 상수/상태 |
| game.html | 13733 | _rsNow | 상수/상태 |
| game.html | 13756 | _vcEl | 상수/상태 |
| game.html | 13759 | _vcRange | 상수/상태 |
| game.html | 13760 | _vcSel | 상수/상태 |
| game.html | 13761 | _vcFocus | 상수/상태 |
| game.html | 13771 | _plusBtn | 상수/상태 |
| game.html | 13782 | x | 상수/상태 |
| game.html | 13784 | _minBtn | 상수/상태 |
| game.html | 13788 | _start | 상수/상태 |
| game.html | 13794 | y | 상수/상태 |
| game.html | 13798 | skId | 상수/상태 |
| game.html | 13801 | si | 상수/상태 |
| game.html | 13818 | _sc | 상수/상태 |
| game.html | 13829 | b8 | 상수/상태 |
| game.html | 13830 | b9 | 상수/상태 |
| game.html | 13836 | _pollGamepad | 함수 |
| game.html | 13838 | gps | 상수/상태 |
| game.html | 13839 | _found | 상수/상태 |
| game.html | 13850 | _anyInput | 상수/상태 |
| game.html | 13852 | pressed | 상수/상태 |
| game.html | 13873 | _gpDeliberate | 상수/상태 |
| game.html | 13885 | _cA | 상수/상태 |
| game.html | 13898 | _anyPanelOpen | 상수/상태 |
| game.html | 13900 | _on | 상수/상태 |
| game.html | 13918 | _gpOpenPanel | 상수/상태 |
| game.html | 13919 | _gpOverlay | 상수/상태 |
| game.html | 13921 | el | 상수/상태 |
| game.html | 13931 | _backNow | 상수/상태 |
| game.html | 13934 | _gc | 상수/상태 |
| game.html | 13943 | _crPop | 상수/상태 |
| game.html | 13958 | _isAimMode | 상수/상태 |
| game.html | 13961 | _ltVal | 상수/상태 |
| game.html | 13962 | _ltHeld | 상수/상태 |
| game.html | 13963 | _ltWasHeld | 상수/상태 |
| game.html | 13964 | _LT_COMBO | 상수/상태 |
| game.html | 13968 | _ltUsedAsModifier | 상수/상태 |
| game.html | 13972 | idx | 상수/상태 |
| game.html | 13973 | comboKey | 상수/상태 |
| game.html | 13974 | pressed | 상수/상태 |
| game.html | 13975 | prevKey | 상수/상태 |
| game.html | 13992 | prevKey | 상수/상태 |
| game.html | 14007 | _gpModFirst | 상수/상태 |
| game.html | 14009 | idx | 상수/상태 |
| game.html | 14010 | kc | 상수/상태 |
| game.html | 14018 | pressed | 상수/상태 |
| game.html | 14019 | wasPrev | 상수/상태 |
| game.html | 14034 | _bi | 상수/상태 |
| game.html | 14040 | rt | 상수/상태 |
| game.html | 14041 | ltrt | 상수/상태 |
| game.html | 14057 | ax | 상수/상태 |
| game.html | 14058 | rx | 상수/상태 |
| game.html | 14059 | lMag | 상수/상태 |
| game.html | 14060 | rMag | 상수/상태 |
| game.html | 14061 | useR | 상수/상태 |
| game.html | 14062 | sx2 | 상수/상태 |
| game.html | 14064 | _ang | 상수/상태 |
| game.html | 14065 | _snap | 상수/상태 |
| game.html | 14074 | _anyAimBtn | 상수/상태 |
| game.html | 14077 | scx | 상수/상태 |
| game.html | 14083 | rx | 상수/상태 |
| game.html | 14089 | rMag | 상수/상태 |
| game.html | 14090 | _rsWas | 상수/상태 |
| game.html | 14103 | su | 상수/상태 |
| game.html | 14104 | _stickMap | 상수/상태 |
| game.html | 14107 | was | 상수/상태 |
| game.html | 14115 | _gpCrIdx | 상수/상태 |
| game.html | 14116 | _gpCrBagNav | 함수 |
| game.html | 14118 | pop | 상수/상태 |
| game.html | 14119 | listEl | 상수/상태 |
| game.html | 14120 | rows | 상수/상태 |
| game.html | 14121 | len | 상수/상태 |
| game.html | 14123 | u | 상수/상태 |
| game.html | 14124 | d | 상수/상태 |
| game.html | 14125 | a | 상수/상태 |
| game.html | 14126 | rsY | 상수/상태 |
| game.html | 14141 | _gpInvIdx | 상수/상태 |
| game.html | 14142 | _gpInvNav | 함수 |
| game.html | 14145 | _idU | 상수/상태 |
| game.html | 14146 | _idD | 상수/상태 |
| game.html | 14147 | _idL | 상수/상태 |
| game.html | 14148 | _idR | 상수/상태 |
| game.html | 14149 | u | 상수/상태 |
| game.html | 14151 | a | 상수/상태 |
| game.html | 14152 | b | 상수/상태 |
| game.html | 14153 | x | 상수/상태 |
| game.html | 14154 | y | 상수/상태 |
| game.html | 14155 | lb | 상수/상태 |
| game.html | 14156 | rb | 상수/상태 |
| game.html | 14157 | l3 | 상수/상태 |
| game.html | 14158 | lt | 상수/상태 |
| game.html | 14159 | rt | 상수/상태 |
| game.html | 14160 | rsY | 상수/상태 |
| game.html | 14170 | modes | 상수/상태 |
| game.html | 14180 | _rsYFull | 상수/상태 |
| game.html | 14181 | _rsXFull | 상수/상태 |
| game.html | 14183 | _sc | 상수/상태 |
| game.html | 14199 | _clr | 상수/상태 |
| game.html | 14202 | bagLen | 상수/상태 |
| game.html | 14204 | moved | 상수/상태 |
| game.html | 14210 | grid | 상수/상태 |
| game.html | 14212 | items | 상수/상태 |
| game.html | 14232 | eqSlots | 상수/상태 |
| game.html | 14234 | moved | 상수/상태 |
| game.html | 14246 | _botIds | 상수/상태 |
| game.html | 14247 | _bots | 상수/상태 |
| game.html | 14253 | p | 상수/상태 |
| game.html | 14259 | stItems | 상수/상태 |
| game.html | 14261 | C | 상수/상태 |
| game.html | 14273 | _vcEl | 상수/상태 |
| game.html | 14288 | _chkAct | 함수 |
| game.html | 14289 | _chkJust | 함수 |
| game.html | 14290 | isAct | 함수 |
| game.html | 14291 | isJust | 함수 |
| game.html | 14292 | _chkHeld | 함수 |
| game.html | 14293 | isHeld | 함수 |
| game.html | 19924 | shake | 함수 |
| game.html | 19926 | _gpVibLastT | 상수/상태 |
| game.html | 19927 | _gpVibrate | 함수 |
| game.html | 19930 | now | 상수/상태 |
| game.html | 19933 | t | 상수/상태 |
| game.html | 19934 | dur | 상수/상태 |
| game.html | 19935 | weak | 상수/상태 |
| game.html | 19936 | strong | 상수/상태 |
| game.html | 19939 | vg | 상수/상태 |
| game.html | 19952 | _hitFlash | 상수/상태 |
| game.html | 19953 | doHitFlash | 함수 |
| game.html | 19955 | bigImpact | 함수 |
| game.html | 19956 | ec | 상수/상태 |
| index.html | 1122 | _GP | 상수/상태 |
| index.html | 1142 | _clearGamepadFeedback | 함수 |
| index.html | 1145 | previous | 상수/상태 |
| index.html | 1149 | _leaveGamepadInput | 함수 |
| index.html | 1153 | _resetDisconnectedPadState | 함수 |
| index.html | 1158 | _handoffConnectedPadState | 함수 |
| index.html | 1164 | pads | 상수/상태 |
| index.html | 1165 | remaining | 상수/상태 |
| index.html | 1167 | candidate | 상수/상태 |
| index.html | 1168 | isLost | 상수/상태 |
| index.html | 1172 | lostCurrent | 상수/상태 |
| index.html | 1201 | _gpDotOn | 상수/상태 |
| index.html | 1202 | _gpDot | 함수 |
| index.html | 1204 | d | 상수/상태 |
| index.html | 1206 | lobby | 상수/상태 |
| index.html | 1207 | host | 상수/상태 |
| index.html | 1213 | _gpGlobalPoll | 함수 |
| index.html | 1215 | gps | 상수/상태 |
| index.html | 1216 | gp | 상수/상태 |
| index.html | 1227 | just | 상수/상태 |
| index.html | 1228 | anyInput | 상수/상태 |
| index.html | 1230 | p | 상수/상태 |
| index.html | 1247 | h | 상수/상태 |
| index.html | 2157 | _I18N_SUPPORTED | 상수/상태 |
| index.html | 2158 | _STEAM_LANG_MAP | 상수/상태 |
| index.html | 2159 | getUserSelectedLanguage | 함수 |
| index.html | 2160 | detectSteamLanguage | 함수 |
| index.html | 2161 | detectBrowserLanguage | 함수 |
| index.html | 2162 | _i18nLogged | 상수/상태 |
| index.html | 2163 | getCurrentLanguage | 함수 |
| index.html | 2164 | setUserLanguage | 함수 |
| index.html | 2165 | _lobbyLang | 함수 |
| index.html | 2166 | _TL | 함수 |
| index.html | 2167 | _HTML_LANG_MAP | 상수/상태 |
| index.html | 2168 | _applyLobbyLang | 함수 |
| index.html | 2169 | lang | 상수/상태 |
| index.html | 2172 | tbl | 상수/상태 |
| index.html | 2174 | m | 상수/상태 |
| index.html | 2195 | el | 상수/상태 |
| index.html | 2202 | quitBtn | 상수/상태 |
| index.html | 2205 | title | 상수/상태 |
| index.html | 2208 | detail | 상수/상태 |
| index.html | 2210 | entry | 상수/상태 |
| index.html | 2211 | wishlist | 상수/상태 |
| index.html | 2214 | gb | 상수/상태 |
| index.html | 2217 | nameLabel | 상수/상태 |
| index.html | 2220 | ob | 상수/상태 |
| index.html | 2221 | db | 상수/상태 |
| index.html | 2222 | np | 상수/상태 |
| index.html | 2223 | cmh | 상수/상태 |
| index.html | 2224 | ccb | 상수/상태 |
| index.html | 2226 | mainTxt | 상수/상태 |
| index.html | 2228 | subTxt | 상수/상태 |
| index.html | 2232 | _syncAllLangSelects | 함수 |
| index.html | 2234 | el | 상수/상태 |
| index.html | 2238 | el | 상수/상태 |
| index.html | 4066 | _langPopOpen | 상수/상태 |
| index.html | 4067 | _openLangPop | 함수 |
| index.html | 4068 | pop | 상수/상태 |
| index.html | 4069 | sel | 상수/상태 |
| index.html | 4080 | opts | 상수/상태 |
| index.html | 4082 | row | 상수/상태 |
| index.html | 4096 | _positionLangPop | 함수 |
| index.html | 4097 | r | 상수/상태 |
| index.html | 4098 | below | 상수/상태 |
| index.html | 4099 | down | 상수/상태 |
| index.html | 4107 | _closeLangPop | 함수 |
| index.html | 4108 | _langPopKeydown | 함수 |
| index.html | 4118 | _hlLangPop | 함수 |
| index.html | 4119 | p | 상수/상태 |
| index.html | 4120 | rows | 상수/상태 |
| index.html | 4130 | s | 상수/상태 |
| index.html | 4728 | _inputMode | 상수/상태 |
| index.html | 4729 | _inputModeChosen | 상수/상태 |
| index.html | 4731 | _showInputModeScreen | 함수 |
| index.html | 4736 | _applyInputMode | 함수 |

## 2. 설계 docs와 원본의 불일치·누락 표(수정 없음)

3.3 폴더의 7개 Markdown을 읽었다. 과거 이력/외부 게임 연구/실물 검증 미완은 현행 결함과 분리한다. 아래는 수치·함수·범위의 정적 불일치와 별도 일치 확인이다. D03은 알려진 코드 내부 불일치의 유지, D16–D17은 문서와 일치하는 범위 확인이다. 코드를 고쳐 어느 쪽에 맞출지 결정하지 않는다.

| ID | 설계 문서·행 | 원본 근거 | 불일치/판정 |
| --- | --- | --- | --- |
| D01 | 3.3 키바인딩+설정.md:57 (양쪽 HTML OPT) | index 전체, game6311 | index에는 OPT 없음. 문맥상 game/easy 양쪽을 뜻하는지 미확인; game/index에 모두 OPT가 있다는 해석은 불일치 |
| D02 | 같은 문서:185 (전부 기본값 복원) | game6196·6205 vs48752–48753 | 초기20개 vs reset18개. irisToggle/bladeToggle 누락. 전부 복원과 불일치 |
| D03 | 같은 문서:178–179 (KeyQ→RT 예시) | game6283–6291 | 현재 keyName은 KeyQ→RT, KeyZ→LT+RT, Digit3→LT+X/Digit4→LT+Y(6286·6290–6291); 실제 주입은 Q=Y, Z=RT, combo Y=3/X=4. 문서의 알려진 불일치가 여전히 존재(기록과 일치, 코드 내부 경로 불일치) |
| D04 | 같은 문서:340 (lang ko/en) | index2157–2164·game49433–49434 | 현재 외부 ExoduserI18n.languages/resolveLanguage에 기반한 다국어. ko/en만의 시스템이라는 설명은 불완전; 지원 전체 목록은 외부 i18n SSOT |
| D05 | 같은 문서:461 (12 카테고리+27곡) | game2735–2814 | UI 실제 options 수는 아래 계산표. 카테고리/직접트랙 개수가 문서와 다름 |
| D06 | 같은 문서:497 (LT threshold .3) | game13961–13962 | 실제 modifier 판정 >.7. Q/E·스킬 의미는 보호, 값 변경 제안 없음 |
| D07 | 같은 문서:505·510–511 (D← skillCycle/L 슬롯) | game13896–13909 | 실제 D←는 statPanel 직접 토글. 코드 내부 안내48767/48827의 능력치와도 확인 필요. 기존 문서 내 충돌 |
| D08 | 같은 문서:525–532 (GP_BINDS와 _gpAct/_gpJust 통합) | game13421·14288–14293 | GP_BINDS는 미사용 명시; _gpAct/_gpJust 선언 없음. 실제는 _gpInjectKey→K/KH/MB 공유. 153행 현행 설명과도 충돌 |
| D09 | 게임패드_매핑표.md:53 (우스틱 마법 E) | game14094·13497 | 실제 mouse2 주입. 구 E 표현 잔존. 보호: 동작 의미 변경 제안 없음 |
| D10 | 게임패드_매핑표.md:64 (D← C) | game13897·6195 | 실제 statPanel 직접 토글; KB stats=KeyJ. C 키 주입이라는 해석 불일치 |
| D11 | 게임패드_매핑표.md:88 (B 뒤로/닫기) | game13930–13939·14283 | 현재 패널 Back8 뒤로 및 B 패널닫기 제거. 문서의 보편 B 닫기와 불일치; 모든 하위 UI가 같은지 미확인 |
| D12 | 게임패드_벤치마킹_엘든링_디아블로4.md:3·13 | game13930–13939 | 2026-05 연구자료의 B항상뒤로는 비교 레퍼런스. 현행 EXODUSER 구현 계약으로 적용하면 충돌; 외부 게임 사실은 이번 미검증 |
| D13 | 3.3 키바인딩+설정.md:323–340 OPT 표 | game6311 및 §1.2 | 초기38개 중 일부만 기재. diffV2/textScale/panelFit/filters/audio 등은 다른 절에 흩어짐; 추가필드8개와 G 소유 크기 분리표 부재(누락) |
| D14 | 같은 문서:43–49 native 입력·Space 미연결 표 | godot/scripts/native_skill_slots.gd:120–124, 현행 P2-005a/b tests | 과거 native 부분 상태 이력. 현행 스킬슬롯 구현을 무시하면 낡은 판정; read_native_input_bindings unsupported의 Space 문구도 잔존. 전체 saved binds 지원은 여전히 없음 |
| D15 | 같은 문서:63·464·665–666 기존 PASS 기록 | §6 이번 현재 원본 테스트 | 과거 PASS는 현재 fixture 통과 증거가 아님. 현재 테스트 실패/의존성 누락을 원본 제품 버그로 단정하지 않음 |
| D16 | GAMEPAD_HUD_LABEL_FIX_20260910.md:7–11 | game28559–28578 | y121/18px, map13, KBM2, fragment/replacement는 정적 일치. 새 실물 검증 아님 |
| D17 | MONICA_UNTRUSTED_EVENT_20260910.md:14·25 | game13511–13514 | 합성 KeyboardEvent/_fromGp=true 정적 일치. 확장 예외의 현재 실제 재현 여부 미확인; 게임/확장 설정 변경 제안 없음 |
| D18 | 게임패드_트러블슈팅.md:74 | game의 inputMode setItem 명시 검색 | 게임 connected/boot 감지(13457·13467)·disconnect/KBM(13475·13477–13478)는 inputMode를 저장하지만 polling의 active 전환(13876)은 저장하지 않음. 모드 전환 전부 동일 저장이라는 일반화는 불완전 |

| BGM select 검산 | 개수 | game.html 범위 |
| --- | --- | --- |
| 직접 트랙(t:) | 57 | 2735–2814 |
| 나머지 option(auto/allRandom 포함) | 16 | 2735–2814 |
| 전체 | 73 | 2735–2814 |

## 3. Godot 실제 의존 모듈·테스트 확인

**정적 소스/테스트 내용 확인과 이번 실행은 다르다.** godot/의 tracked 파일을 직접 읽고 검색했다. `rg` 기본 ignore가 테스트 일부를 숨기는 것을 확인하여 `git ls-files godot/tests` 및 `rg --no-ignore`로 재확인했다. 이번 Godot 실행/import/export는 수행하지 않았으며 아래 기존 테스트의 PASS를 새로 주장하지 않는다.

| 의존 | 실제 파일·행 | 이미 있는 부분 | 없는 부분/한계·기존 테스트 |
| --- | --- | --- | --- |
| OPT 실제 owner | godot/port_modules/npc_interaction/source_options_state.gd:8–17·24–86 | 35개 defaults, source_boot/current_pre_restore/current_live phase, current dict identity/raw extras 보존, boolean Electron parts | textScale/panelFit/diffV2가 현재 원본38개 대비 없음. settings load/save/UI side effect 없음. test_native_main_source_player_initialization.gd:196–213는 OPT35/동일ref/pre_restore/loss 검사 |
| Services wiring | godot/scripts/native_source_player_initialization_services.gd:155–162·489–495 | 실제 _options initialize_source_boot(false), CURRENT_PRE_RESTORE; read_current_options 공개 | 브라우저 설정 복원·Tier producer·설정 UI는 없음. phase 이름을 복원 완료로 간주하지 않음 |
| FPS cap prefix | godot/port_modules/source_frame_entry/producer.gd:190–212; 위 services:269–300 | 실제 current OPT로 phase_fps_cap 호출. 1000/cap·−1 비교, last timestamp 없으면 NOT_READY. cap0의 초기 통과는 존재 | Engine cap/UI 연결과 전체 loop 제어 동등성 없음. 프레임prefix 뒤 update prefix는 별도로 호출(252–265), gap_frame_callbacks(null)에서 부분 종료. cap을 Engine.max_fps와 같다고 주장 불가. godot/tests에서 phase_fps_cap 전용 테스트 명시참조 없음 |
| 엔진 cap/physics | godot/scripts/main.gd:109; godot/project.godot:10·21·24 | max_fps240, VSync0, physics60Hz | OPT.fpsCap0 무제한과 다름. test_native_main_source_player_initialization.gd:193은 60/240 고정기대; 원본 cap 준수 테스트 아님 |
| 기본 입력 | godot/scripts/main.gd:1652–1684; player.gd:400–483 | InputMap 고정 기본10개, held/event·echo 무시·focus cleanup; source_saved_bindings_restored=false | 20개 전체 BINDS/보조 remap/설정 capture UI/저장맵 없음. player native_magic는 mousebutton만 허용(425–431), 키 리바인딩 동등성 미확인. Q/E 동작 보호 |
| Space/일반 스킬 | godot/scripts/native_skill_slots.gd:120–124 | P2-005 스킬 InputMap 별도 등록 존재 | main/player의 older unsupported 문구와 구분. 스킬별 원본/입력제한 소유는 기존 담당, 이번 변경 제안 없음. test_p2005a_start_skills/b_giant_slam 등 기존 |
| HUD/pause | godot/scripts/hud.gd:107–111·312–315; main.gd:1601–1616 | 고정 Esc pause button·Tree pause·캐릭터 패널 | 원본 게임/화면/사운드/조작 4탭 및 키바인딩 폼 없음. test_p2002a_hud.gd는 HUD, 설정 통합 테스트 아님 |
| 언어 | godot/scripts/main.gd:514–538 | 실제 OPT.lang reader, ko/en startup subset | _T catalog·format/full language/hellLang 로비 연결 없음. TranslationServer locale를 원본 lang 권위로 대체한 증거 없음 |
| SFX option consumer | godot/scripts/main.gd:2007–2014·2074–2096 | 실제 sfxVol reader→gain/100, bus mute/voice gain | saved_settings_restored=false; BGM/voice/기타스킬 audio 미포팅 명시. sfxVol slider/0음량 UI 검사 없음 |
| hit/death FX option consumer | godot/scripts/main.gd:1033–1045·1150–1156; native_normal_enemy_hurte.gd:431–445 | parts/deathFx/shake의 actual owner reader 및 어댑터 | test_p2001a_hit_feedback.gd:143–156·240–253은 기본80 셰이크/감쇠, test_p2001b_death_fx.gd는 death/blood. 사용자 옵션 변경 sweep 아님 |
| 조명·안개·색보정 | godot/scripts/native_screen_lighting.gd:145–215 | P2-003a 레이어/조명/안개/filter 구현 | 현재 OPT flags/brightness 변동 getter 연결 없음. test_p2003a_lighting.gd:71–110은 고정 기본효과/노드 순서 검사, 설정 토글 검사 없음 |
| 펫·크기/글로우 | godot/scripts/native_pets.gd:42; native_screen_lighting.gd:218 이후 | IRIS_GLOW_R250 및 실제 광원 전달 | OPT.irisGlow/G._irisSz 설정 UI·복원 미연결. test_p2004a_pets.gd는 펫 구현이며 설정 슬라이더 인수 아님 |
| World visual context | godot/scripts/world.gd:2753–2768 | 명시 native projectile fx policy/particle budget | shake_percent100/vibrationfalse; 주석상 original OPT/Tier 아님. 자동Tier/ATMOS/그래픽5단계 동등성 없음 |
| G/P owner | godot/scripts/native_source_new_run_state.gd:361–375·436 이후 | 현재 G/P·feel 상태/시작 스킬 제공 | apply_native_skill_shake는100 상수 소비; 실제 OPT.shake 변경 연계 없음. G/P/세이브 형식 보호 |
| 아직 없는 독립 설정 모듈 | godot/scripts·port_modules·tests 전체 검색 | options owner와 frame prefix는 위에 있음 | _applyTierPreset/detectTier/_GFX_PRESETS/BINDS2 remap/gpKeyMap/hellcave_settings UI 동일 구현은 없음. native_perspective_view._settings는 별도 실험 view 설정이며 원본 OPT 아님 |

## 4. 작은 이식 단위 순서안 — 후속 구현 지시서(2026-10-20 보강)

이번 보강은 **이 절만 변경**한다. 다음 차례의 첫 구현은 **S01**이다. 이 문서 보강 커밋에 코드·테스트 구현을 섞지 않는다. S02 이후는 순서대로 각 선행 조건과 소유 범위를 확인한다. 여기서 정한 파일명·API·테스트 이름은 후속 구현 계약이며 현재 존재/실행/PASS를 뜻하지 않는다.

보강 전 조회: `git fetch origin` 및 명시 `git fetch origin refs/heads/main:refs/remotes/origin/main` 성공. 재조회 main=`b933b2da55e9bc7a29a41cd7d7093d437ce334cf`, 문서 branch HEAD=`d7132ac22fe5889a764ad6725f375c99291f3997`. 원본 두 HTML·OPT owner·Services·기존 초기화 테스트는 이 두 ref 사이 diff0이다. 따라서 아래 원본/연결 행은 기존 고정본 기준을 유지한다. 후속 구현 시 다시 fetch·해당 파일 diff·작업판 소유권을 확인한다. 이번 보강 때문에 기존 WT를 main에 merge/rebase하거나 R을 수정하지 않는다.

최신 작업판의 충돌 경계: P2-001l은 main/player 입력 함수, P2-007a는 글꼴/가이드 패널, P3-002는 world 동적 등록, QA-002·STARTER-REGIONS는 지정 기존 테스트, TRACE-SAVE는 저장 추적 문서, DOC-SYNC는 지정 설계 docs다. **S01은 아래 신규 2파일만 소유**하므로 이들과 코드 소유가 겹치지 않는다. 기존 owner 파일에 새 필드를 추가해야 시작할 수 있는 단위로 만들지 않는다.

### 4.0 공통 실행·판정 규칙

- 각 단위의 `신규`·`수정` 목록 밖 제품 파일은 변경하지 않는다. 기존 공용 파일의 줄 수는 **후속 배선의 예상 diff 상한**이며 이미 편집한 줄 수가 아니다. 현재 고정본의 함수/문장 anchor로 위치를 식별하고, 행이 밀렸으면 함수 기준으로 다시 확인한다.
- 신규 테스트는 `extends SceneTree`, `_check` 누적·구간별 결과·최종 `quit(0/1/2)`를 갖는다. `0`은 실행한 필수 단정 전부 통과, `1`은 단정 실패, `2`는 격리/필수 환경 불충족이다. guard skip을 PASS로 기록하지 않는다. stdout/stderr·실행 ref·검사 수를 `_out/trace-settings/Sxx/`에 보존한다.
- 프로젝트 격리는 **자기 소유 staging 복사본** `_out/trace-settings/Sxx/project/`에서 한다. 제품 scripts는 같은 byte를 복사하고, 그 사본의 `project.godot`에서만 `config/use_custom_user_dir=true`, 아래의 `config/custom_user_dir_name`을 지정한다. 실제 `OS.get_user_data_dir()` 끝 경로도 확인한다. R/공용 WT/다른 담당 project.godot·override.cfg·전역 editor_settings·사용자 세이브는 수정하지 않는다. staging에 필요한 resource/import가 없거나 접근 승인이 없으면 그 실행을 **BLOCKED**로 보고한다. 새 기본값·dummy owner·타 WT 캐시로 우회하지 않는다.
- 명령 틀: `"$GODOT_SETTINGS_BIN" --headless --path "$TRACE_SETTINGS_S01_PROJECT" --script res://tests/test_native_settings_read_view.gd -- --only=unit`. 두 변수에는 확인된 Godot 바이너리와 위 자기 staging의 절대경로를 지정한다. S01의 `--only=actual_main`은 동일 파일의 별도 실행이다. S02 이후는 해당 테스트 파일/프로젝트 경로로 치환한다. 프로젝트 격리설정과 테스트 내 `USERDIR` 일치가 실행 전제다.
- unit은 명시 입력/명시 시험용 provider 범위, actual_main은 실제 Main/Services 경로, GUI는 1x 시각/입력 인수다. 서로 다른 증거를 하나의 전체 PASS로 합치지 않는다. GUI/실물패드가 필요한 단위는 테스트 통과 후에도 해당 검증 미완을 남긴다.
- 세이브 형식·Q/E 의미/판정·`docs/2_3`는 **보호**다. 저장 writer/새 저장키/이관·QE 행동 변경은 아래 단위에 넣지 않는다. 설계 docs의 D01–D18 불일치는 이 문서 표로만 보존한다. 제품 코드 변경 시 필요한 관련 docs 기록은 이 추적 문서의 구현 기록 절/자기 보고서에 남기며, 타 담당 설계 문서를 임의로 고치지 않는다.

### 4.1 S01 — 원본 기본값 비교 및 실제 OPT 읽기 어댑터(다음 구현)

**결과:** 기존 `source_options_state.gd`가 소유한 실제 OPT를 매번 읽고 원본 대비 누락을 노출하는 재사용 가능한 `RefCounted` 어댑터를 만든다. 원본 기본값은 **비교용 상수**다. 누락 필드를 보충하거나 실제 OPT 대신 반환하지 않는다. UI·저장·입력·Tier·Engine cap·게임 상태를 바꾸지 않는 첫 단위다.

#### ① 소유 파일·수정 지점

| 구분 | 정확 경로 | 작업 |
| --- | --- | --- |
| 신규 제품 | `godot/scripts/native_settings_read_view.gd` | `extends RefCounted`; 아래 API·비교 상수·weak owner reader 구현 |
| 신규 테스트 | `godot/tests/test_native_settings_read_view.gd` | unit/actual_main 두 실행군, 아래 필수 단정 및 격리 guard 구현 |
| 수정 제품 | 없음 | `source_options_state.gd`·Services·Main·HUD·World·Player·hurtE·G/P owner 모두 **0줄** |
| 수정 기존 테스트 | 없음 | 기존 `test_native_main_source_player_initialization.gd`의 OPT35 기대/60Hz·240cap를 바꾸지 않음 |
| 문서 | 이 문서의 S01 아래 구현 기록 | 실제 source SHA·새2파일·실행별 결과/한계만 추가. 기존 설계 docs 불일치표는 정정하지 않음 |

`source_options_state.gd:8–17`은 현재 35개 literal이고, `native_source_player_initialization_services.gd:489–495`는 `read_current_options()`/`get_source_options_state()`를 제공한다. 이 API를 **읽어 재사용**한다. protected `diffV2`를 포함해 기존 OPT에 3필드를 덧붙이는 방식은 S01이 아니다. 실제 Main에 어댑터를 상시 장착하는 배선도 다음 UI 소비 단위로 남긴다. S01의 실제 연결 검증은 테스트가 실제 `main.source_initialization_services`에 어댑터를 연결해 수행한다.

#### ② 원본·상수·API 계약

원본 `game.html:6311`의 초기값 38개와 `IS_ELECTRON?100:80` 분기를 옮긴다. 기본 reference는 다음 literal과 일치해야 한다. 객체 key의 의미/값을 별도 수식으로 재해석하지 않는다.

```gdscript
const SOURCE_DEFAULT_REFERENCE := {
    "shake":80, "textScale":100, "panelFit":true, "hitStop":0,
    "parts":80, "sfxVol":60, "bgmVol":60, "diff":5, "diffV2":1,
    "minPickRar":0, "minPickLvTier":0, "fpsCap":0, "petAuto":true,
    "bossDebug":false, "bloom":true, "trail":true, "slash":true,
    "postfx":true, "deathFx":true, "lighting":true, "torch":true,
    "ambPart":false, "fog":true, "bossFog":true, "grain":true,
    "autoPotThr":0.99, "cursor":0, "cursorSize":50, "quality":"high",
    "resScale":100, "ssaa":1, "outline":true, "bgmTrack":"auto",
    "lang":"ko", "crAutoFuse":-1, "crAutoEnh":-1, "showFps":false,
    "atmos":2
}
```

| API | 정확 동작·반환 |
| --- | --- |
| `get_source_default_reference(is_electron: bool = false) -> Dictionary` | 비교용 deep duplicate 1개 반환; `parts=100 if is_electron else 80`. 이 값은 실제 owner나 UI 현재값으로 쓰지 않는다. 반환 사본을 고쳐도 다음 반환/상수에 영향0 |
| `configure(source_owner: Object) -> bool` | 유효한 owner·`read_current_options` method 확인 후 WeakRef로 1회 bind. 실제 reader 호출0, 초기화/phase 변경0. 같은/다른 owner로 재configure는 false, 원 binding 유지. 시험용 provider는 테스트 안에서만 정의 |
| `read_current_options_view() -> Dictionary` | 매 호출마다 weak owner 생존·method 존재 확인, `read_current_options()` **1회**. 반환이 Dictionary면 그 **동일 ref**를 `options`에 보존. comparison constant 순서로 present/missing key를 계산; 값 coercion·clamp·copy·보충0 |
| READY packet | `{status:"READY",options:<actual ref>,expected_count:38,current_count:<actual size>,missing_keys:[],extra_keys:[...]}`. 38개 expected key 존재만 뜻하며 개별 값의 정규화·저장복원 완료/전제품 준비를 뜻하지 않음 |
| READY_PARTIAL packet | Dictionary는 있으나 expected key 누락 시 `{status:"READY_PARTIAL",options:<same actual ref>,expected_count:38,current_count:<actual size>,missing_keys:[...],extra_keys:[...]}`. 현재 native OPT35의 예상 missing set은 `textScale,panelFit,diffV2`(원본 선언 순서) |
| NOT_READY packet | 미configure/owner해제/reader없음/reader가 null 또는 비Dictionary 반환이면 `{status:"NOT_READY",reason:<구체 원인>}`. `options`/임의 default payload 없음. reader 결과가 비Dictionary였음을 진단하되 자동 재시도/새 owner 생성0 |

`extra_keys`는 actual dict key 중 reference에 없는 key를 **원 key type 그대로** 나열한다. 실제 current 값/컨테이너 identity·순서를 변경하지 않는다. 비교용 reference는 진단이며 `source_options_state.gd`의 실제 owner authority와 중복 singleton을 만들지 않는다. Q/E/BINDS 표·이름 `6254–6308`은 S01의 구현 범위에서 제외한다(후속 S03). `diffV2=1`은 비교 reference 관측만이며 보호된 실제 OPT·저장 마커에 쓰지 않는다.

#### ③ 새 테스트·단정·격리

`USERDIR="EXODUSER-TraceSettings-S01-Isolated-20261020"`. 실제 userdir 및 project 설정이 다르면 exit2. 테스트의 `_initialize()`에서 `--only=unit`/`--only=actual_main`만 허용하고 각 실행 결과를 분리한다.

| 군 | 필수 단정·근거 값 |
| --- | --- |
| U1 reference | key set 정확38 및 모든 값이 위 literal/6311과 일치. false→parts80, true→100. 두 reference의 identity 다름; 반환 사본 수정 뒤 재조회해 원본값 유지 |
| U2 bind/호출수 | 테스트 파일 내부 `CountingOptionsOwner`(RefCounted, `read_current_options`, dict holder, read_count) 사용. configure 호출수0, view 1회마다 reader1회. 2회 configure=false 및 기존 owner 유지 |
| U3 live raw values | 명시38키 dict를 provider로 전달→READY; `is_same(packet.options,provider.options)` true. provider가 이후 `shake=0`·`sfxVol=0`으로 바뀌면 다음 read에서 정확0 관측. nested extra dict/array·null·false를 보충/강제변환하지 않고 동일ref/raw type 보존 |
| U4 누락·추가 | copy fixture에서 `textScale,panelFit,diffV2` 제거→READY_PARTIAL/current_count35/missing 정확3. 추가 `fixture_extra` 넣으면 extra_keys에만 보고·원값 보존. field 누락을100/true/1로 채우지 않음 |
| U5 상실·실패 | 미configure·해제된 RefCounted owner·null·Array 반환→NOT_READY/options key 없음; reader 추가 재시도0. invalid owner bind 거부. dict 제공 객체가 살아있는 것과 그 내부 dict가 유효한 것을 구별 |
| U6 부작용 경계 | 어댑터에 Node/OS/audio/storage/InputMap/Engine writer 없음 정적 검사. 테스트 전후 Engine.max_fps·physics Hz·InputMap action/events 목록 동일; 어댑터가 signal/timer 생성하지 않음 |
| M1 실제Main | 기존 main.tscn을 격리 사본에서 인스턴스화하고 실제 `source_initialization_services`가 준비되면 configure. owner의 실제 `read_current_options()` 결과와 packet.options `is_same` true. 현 baseline OPT35/누락 3개/READY_PARTIAL; `diff5`, `sfxVol60`, `fpsCap0`, `parts80` 원본6311/기존 owner 대조. 기존 count를38로 고치지 않음 |
| M2 실제불변 | 서비스를 통해 읽은 before/after OPT deep value와 identity 동일, `get_source_options_state().get_last_status().phase`는 기존 `current_pre_restore` 유지. Engine240·physics60을 어댑터가 바꾸지 않음(기존 초기화 테스트193). 새 어댑터 때문에 Main 새생성·actor setter·save 호출0 |

unit에서는 dependency owner를 명시 test double로 쓰지만 이를 actual Main 증거로 올리지 않는다. M1/M2에서는 `_g/_p` 직접 주입·private options 주입·readiness guard 해제·fallback owner 설치를 금지한다. 시작 레슨/스테이지의 기존 비결정성에 영향을 주는 actor 필드를 비교 대상으로 억지 고정하지 않는다. resource/import가 없어 actual_main이 못 뜨면 unit 결과만 남기고 actual_main **BLOCKED**로 보고한다.

완료 조건: 신규 2파일만 구현, unit 필수군 통과, actual_main의 동일 owner/ref/누락 3개/부작용0 확인 및 로그. 실제 Main 실행이 BLOCKED면 S01은 `부분 구현·실제 연결 인수 대기`이며 전체 완료로 표시하지 않는다. UI·세이브 복원·게임 전체 설정 이식 완료 주장은 하지 않는다.

#### ④ 선행 조건·충돌·바로 시작 순서

1. fetch 후 WORK_BOARD의 TRACE-SETTINGS/S01 및 위 신규 2경로 소유 중복을 확인한다. 동일 파일을 다른 담당이 소유하면 **BLOCKED**로 보고하며 다른 경로로 몰래 옮기지 않는다.
2. 현재 source owner/Services의 공개 reader와 누락 3개이 그대로인지 확인한다. 이미 타 담당이 최신38개를 이식했다면 owner 수정 없이 actual 기대를 새 source 근거로 재확정하고 문서에 기록한다. 오래된35를 맞추려고 제품을 되돌리지 않는다.
3. 신규 어댑터→신규 테스트 순으로 구현하고 unit→별도 actual_main 순으로 실행한다. P2-001l의 main/player·QA-002 기존 테스트는 열람만 한다.
4. 새2파일+자기 구현 기록만 경로 지정 stage/commit/push, remote SHA 대조, DONE 갱신. S02가 요구하는 공용입력 소유 해제가 안 됐다면 S01만 정상 인계하고 S02의 해당 배선은 BLOCKED로 남긴다. 무단 후속 충돌 편집은 하지 않는다.

### 4.2 S02 — 설정 패널 기본 구조·개폐(읽기 화면)

| 항목 | 구현 지시 |
| --- | --- |
| 만들 파일 | `godot/scripts/native_settings_panel.gd`, `godot/scenes/ui/native_settings_panel.tscn`, `godot/tests/test_native_settings_panel.gd` |
| 수정 파일/공용 최소 지점 | 통합 시 `main.gd`만 **예상20–26줄**: preload/field2줄, `_ready()`의 `hud.bind_native_source_state(source_state)` 뒤 패널 생성·add_child·Services configure·닫기 signal 연결5–7줄, `_unhandled_input` pause branch1178의 호출1줄을 새 helper로 변경, 개폐 helper12–16줄. HUD/world/player/hurtE/G/P owner0줄. P2-001l의 input ownership 해제 전 이 배선은 BLOCKED |
| 원본/옮길 내용 | game2700–2921 UI/close,44049–44079 panel pause/close; `ui-panels.js:76–118`의 game/display/audio/controls4탭. 기존 자산·폰트 재사용. S01의 현재35/누락 3개은 화면에서 미연결로 표시하며 현재값을 reference로 채우지 않음 |
| 개폐 구체 순서 | helper는 기존 `_toggle_pause()`를 재사용한다. 패널 열림→hide/close→기존 pause 해제; 패널 닫힘+게임 진행중→기존 pause→기존 캐릭터 선택 패널 hide→설정 open; 패널 닫힘+다른 원인 pause→기존 resume만. `_toggle_pause()`가 캐릭터 미선택 guard 등으로 거부하면 패널 열림도 거부. 닫기 signal/Escape는 같은 helper, 한번의 입력에 두 toggle 금지. 기존 HUD debug pause signal은 유지 |
| 새 테스트/원본 값 | `test_native_settings_panel.gd`: tab4개, 시작 hidden, close signal1회, Enter/Space/Tab focus, Escape open/close 1회, pause 동안 visible 유지, 현재값 미연결 표시. main+panel 동시 actor 진행 정지·닫기 후 재개, 입력 echo로 2회 토글0. source44049–44079 대비 개폐 확인 |
| 격리 사용자 폴더 | `EXODUSER-TraceSettings-S02-Isolated-20261020` |
| 선행·충돌/검수 | S01 완료, P2-001l input 배선 해제/조정 및 P2-007a UI 자산 소유 확인. 먼저 scene unit 제작은 가능하나 main 배선 미인수 상태를 제품 연결 완료로 보고하지 않음. 1280×720·1920×1080·2560×1440 실제 1x에서4탭/닫기/스크롤 확인 필요 |

### 4.3 S03 — 비보호 키바인딩 표시·리스닝 상태 모델

| 항목 | 구현 지시 |
| --- | --- |
| 만들 파일 | `godot/scripts/native_settings_input_model.gd`, `godot/tests/test_native_settings_input_model.gd` |
| 수정 파일/공용 최소 지점 | S02의 `native_settings_panel.gd` controls 탭에 model 생성·행 생성/대기/취소/삭제 signal 연결. `main.gd`·`player.gd` 등 공용0줄. InputMap/현재 전투 BINDS writer 설치0 |
| 원본/옮길 내용 | game6188–6206의 20개 초기 주/보조 구조,6254–6308 표시명,48720–48760 main/alt/delete/reset,48847–48872 F5·대기 overlay. 실제 의미가 Q/E인 행과 charge↔공격 충돌 경로는 보호 표시·편집 disabled. 원본 reset18/초기20 불일치는 그대로 보고하고 reset제품 연결은 HOLD |
| 모델 API | `configure(primary,secondary)`는 편집용 사본만 소유; `begin_capture(action,alternate)`, `cancel_capture()`, `accept_code(code,is_repeat)`, `remove_secondary(action)`, `read_view()`. 모델이 사용하는 코드 문자열은 원본 `KeyW`/`mouse0` 형태. normal 이동/패널 등 비보호 행의 임시 편집 결과만 UI에 표시; persistent save 및 실제 combat rebind 아님을 인수 범위에 명시 |
| 새 테스트/원본 값 | `test_native_settings_input_model.gd`: 초기 20개/보조 null 20개, up=KeyW/settings=Escape/interact=KeyR, begin 뒤 저장/주값 변경0, repeat=true 무시, Escape 취소, 보조삭제 시 주키 보존, 허용 비보호 임시코드 설정 후 source dict 불변. Q/E/보호행 편집0. 원본48752 reset18은 별도 mismatch 단정이며20복원으로 임의 수리하지 않음 |
| 격리 사용자 폴더 | `EXODUSER-TraceSettings-S03-Isolated-20261020` |
| 선행·충돌/검수 | S02 controls 탭, P2-001l 입력 제한과 분리된 모델만. 실제 리바인딩 소비자는 별도 승인 범위/소유 확정 전 BLOCKED. 주/보조키 표시·대기·취소 접근성 실제 1x 확인 |

### 4.4 S04 — FPS 단계·진단 읽기 화면

| 항목 | 구현 지시 |
| --- | --- |
| 만들 파일 | `godot/scripts/native_settings_performance_view.gd`, `godot/tests/test_native_settings_performance_view.gd` |
| 수정 파일/공용 최소 지점 | `native_settings_panel.gd` display 탭에 읽기 값/단계 label 연결. 공용 6파일 0줄. Engine.max_fps writer0 |
| 원본/옮길 상수·공식 | game2823·49062–49063·49362–49365: `_FPS_STEPS=[30,60,120,144,244,0]`, index0..5/기본5/0라벨무제한. 49266–49286 bench 상태·미실시 문구,60387–60390의500ms 관측창·FPS=trunc(frames×1000/elapsed). 60391–60397의동적 몹수/particle cap조절은 이 단위에 넣지 않음 |
| API/범위 | `read_cap_steps()`/`describe_current(options_view,measured_metrics)`; source cap와 measured FPS·Engine cap240을 별도 필드로 표시. 측정치는 명시 제공 metrics만 사용, 값이 없으면 미측정. 아직 작동하지 않는 cap slider를 활성 UI로 오인시키지 않음 |
| 새 테스트/원본 값 | `test_native_settings_performance_view.gd`: 6단계 및244 보존, cap0→무제한, 실제fps≠cap 허용(예:cap144/관측90), 빈 benchmark→벤치미실시,1000ms/60frames→60·500ms/61frames→122 계산. 위 계산은 명시 관측 fixture이며 실제 장치 FPS 인수 아님 |
| 격리 사용자 폴더 | `EXODUSER-TraceSettings-S04-Isolated-20261020` |
| 선행·충돌/검수 | S01/S02, 기존 `performance_capture.gd` metrics 읽기만. P5/MAC-LIVE 실측과 섞지 않음; GPU 벤치 새 측정0 |

### 4.5 S05 — 기존 FPS prefix의 실제 제어 경계 인수

| 항목 | 구현 지시 |
| --- | --- |
| 만들 파일 | `godot/tests/test_native_settings_fps_contract.gd`. 기존 producer를 중복 구현하는 신규 제품 파일 없음 |
| 수정 파일/공용 최소 지점 | 첫 구현은 제품 0줄: 기존 `source_frame_entry/producer.gd:190–212`, Services252–300의 actual callback을 검증. 이후 runtime cap 수정이 필요하면 **이 단위의 진단 결과를 먼저 인계**하고 배선 재확정. `main.gd:109`의240 제거/OPT0직결은 현 단계 계획0줄이며 전체 loop owner 인수 전 BLOCKED |
| 원본/옮길 상수·공식 | game60509·61803–61810: interval=1000/cap, elapsed<interval−1이면rAF return; cap0은 비교 생략, 통과 뒤lastTs갱신.60467/61876–61881의PHYS_STEP=1000/60과별개. 기존 producer 식을 그대로 이용 |
| 새 테스트/원본 값 | `test_native_settings_fps_contract.gd`: actual producer에 source update clock prefix를 configure/declare한 뒤 `begin_frame→phase_timestamp→phase_fps_cap`; cap0으로 lastTs를 관측하고 end_frame 후 다음 callback을 시작한다.  cap0 첫timestamp 통과/lastTs 설정, cap60·lastTs1000에서timestamp1015(15<15.6667) RETURN·lastTs1000 유지,1016 CONTINUE·lastTs1016.144/244 경계는1000/cap−1의 양쪽ε로 비교. 처음부터cap60·lastTs미확정이면기존 NOT_READY. Services 실제 callback의 cap RETURN 뒤 update prefix 호출 여부를 관측·기록 |
| 격리 사용자 폴더 | `EXODUSER-TraceSettings-S05-Isolated-20261020` |
| 선행·충돌/완료 경계 | S04, Services/clock 담당 인수. 검증의 scope는prefix 계약 및 제어흐름 결손. cap RETURN 뒤 update가 멈추지 않으면 해당 자연연결 FAIL 유지, 240→0 같은 치환으로 PASS 처리 금지. 기존 전체 scheduler `_acc` owner 미구현을 이 설정 task가 대신 만들지 않음 |

### 4.6 S06 — Tier 점수·표본 정책 순수 모델

| 항목 | 구현 지시 |
| --- | --- |
| 만들 파일 | `godot/scripts/native_settings_tier_policy.gd`, `godot/tests/test_native_settings_tier_policy.gd` |
| 수정 파일/공용 최소 지점 | S04 `native_settings_performance_view.gd` 진단 view에 policy snapshot 연결. 공용 6파일 0줄, RenderingServer/OS에 임의 벤치 설치0 |
| 원본/옮길 상수·공식 | game9168–9195 GPU명 regex 4/3/2/1 그대로, Electron A·mobile C 분기;9196–9229:120samples(첫0/119delta),hidden 또는gap>250ms discard,avgFPS=1000/mean(delta),≥120→4/≥80→3/≥45→2/그외1,combined=min(gpuScore,fpsScore). saved raw가없거나bloom undefined일때만autoapply 후보(9220–9222) |
| API | `score_gpu_name(renderer,is_electron,is_mobile)`, `push_observation(now_ms,hidden)`, `read_benchmark()`, `should_apply_auto_preset(saved_settings_present,bloom_present)` 순수 입력. OS GPU값 실측 adapter는 미확인으로 남기고 저장/OPT write 0 |
| 새 테스트/원본 값 | `test_native_settings_tier_policy.gd`:44.999/45/79.999/80/119.999/120 FPS 경계;GPU2+FPS4→B,GPU4+FPS1→C;119개gap8ms→125FPS/S(총120samples);250ms연속→C,250ms초과·hidden이면partial sample discard; Electron A/mobile C와 빈 bench 미실시. GPU명 Apple M3→4/M1→3/미지명→기본2. saved 존재+bloom 존재는 자동적용 false |
| 격리 사용자 폴더 | `EXODUSER-TraceSettings-S06-Isolated-20261020` |
| 선행·충돌/검수 | S04 표시 준비. S05가 runtime BLOCKED여도 정책 모델만 개발 가능하며 실제 FPS/Tier 자동검출 인수와 분리한다. P5 실측 작업에 새 GPU 부하를 겹치지 않는다 |

### 4.7 S07 — 자동 4·수동 5 그래픽 프리셋 모델

| 항목 | 구현 지시 |
| --- | --- |
| 만들 파일 | `godot/scripts/native_settings_graphics_presets.gd`, `godot/tests/test_native_settings_graphics_presets.gd` |
| 수정 파일/공용 최소 지점 | `native_settings_panel.gd` display 탭5버튼/현재선택표시, S06view 후보연결. 공용 6파일 0줄. 버튼은proposal packet 생성만; 실제OPT/저장은S08권한전write0 |
| 원본/옮길 상수·공식 | game9232–9240 automatic S/A/B/C fields;49077–49115 manual Lowest/Low/Medium/High/Ultra·_detectPreset역순 완전비교·_applyPreset의11개 효과 값. §1.5표값 그대로;manual은atmos/quality/fpsCap를쓰지않음 |
| API | `describe_tier(tier)`/`describe_manual(index)`는별개table copy; `detect_manual(actual_options)`는4→0 역순 11필드 비교 후 미일치−1; `propose_manual(index)`는원본 write key만 반환. source OPT에 병합·save 호출하지 않음 |
| 새 테스트/원본 값 | `test_native_settings_graphics_presets.gd`: 자동parts100/80/60/40·atmos2/2/1/0,수동parts5/10/20/30/50;autoB postfx=false/lighting=false/ambPart=true와manual중간postfx=true/lighting=true/ambPart=false구별;manual울트라50≠autoS100;11필드1개불일치→−1,manual packet에atmos/fpsCap/quality/bossFog없음 |
| 격리 사용자 폴더 | `EXODUSER-TraceSettings-S07-Isolated-20261020` |
| 선행·충돌/검수 | S01/S02/S06. gfx 모델은 독립 파일이며 월드/VFX 수치 또는 에셋 재작성 없음. readonly/proposal 단계와 실제 효과 적용을 분리하여 인계 |

### 4.8 S08 — 비보호 메모리 설정과 기존 소비자 연결

| 항목 | 구현 지시 |
| --- | --- |
| 만들 파일 | `godot/scripts/native_settings_options_actions.gd`, `godot/tests/test_native_settings_option_consumers.gd` |
| 수정 파일/공용 최소 지점 | 자기 `native_settings_panel.gd` signal 연결. 기존 `native_screen_lighting.gd` configure/`_process`에OPT reader추가. `main.gd` 조명configure호출235행에reader인자 **1줄변경**,field/helper추가0; 기존 parts/deathFx/shake/SFX getter1033–1045/1150–1156/2007–2014는그대로 사용. HUD/player/world/hurtE/G/Powner0줄로시작 |
| 원본/옮길 상수·공식 | game48907·48911–48913,49117–49129의bool/percent핸들러와실제소비자19924 shake=n×OPT.shake/100,10044 SFX/100,4482 bloom/4694 lighting/55335–55373 fog/55409–55419 grain·brightness. 옵션은기존actualdict의동일key만명시write,save0. diff/diffV2/QE/보호필드writer없음 |
| 실행범위 | actions는허용비보호키(shake/sfxVol/parts/deathFx 및연결한visual flags)에한해현행UI입력값을반영한다. 허용목록밖은거부·dict불변. reader없는효과는비활성화된설정항목으로표시. shader파라미터/visibility를실제OPT에서갱신; 원본렌더합성동등성이없는항목은미연결을명시 |
| 새 테스트/원본 값 | `test_native_settings_option_consumers.gd`: shake80+n8→6.4/0→0/100→8, sfx60→.6/0→0·busmute; parts/deathFx실제adaptergate;fogfalse시해당fog레이어숨김·lightingfalse시lightmap미적용;기존actual OPTidentity유지. 보호키diff/diffV2및없는keywrite거부,세이브호출0. fixture값만갱신한것과실제Main효과관측을별도군으로분리 |
| 격리 사용자 폴더 | `EXODUSER-TraceSettings-S08-Isolated-20261020` |
| 선행·충돌/제한 | S07 및 각 visual/audio owner의 반영 인수. P2-007a/P3-002와 해당 배선 1줄 소유 확정. world의 별도 particle policy 100과 G/P skill shake 상수 100이 남으면 불일치 보고만 하고 공용 피해/저장 파일로 확장하지 않는다. resScale은 카메라/맵 담당 인수 전 BLOCKED, physics 값 변경 0 |

### 4.9 S09 — 안내 크기·panel fit·커서(표시 전용)

| 항목 | 구현 지시 |
| --- | --- |
| 만들 파일 | `godot/scripts/native_settings_display_view.gd`, `godot/tests/test_native_settings_display_view.gd` |
| 수정 파일/공용 최소 지점 | 자기 `native_settings_panel.gd` 및scene만우선수정. 공용 6파일 0줄. 현owner에textScale/panelFit가없으므로실제메모리설정반영은owner담당확정전BLOCKED;누락을source OPT에임의추가/저장하지않음 |
| 원본/옮길 상수·공식 | game48880–48900: autoScale=min(sw/1920,sh/1080),finite>0만·4자리; textScale=clamp(Math.round((+value&#124;&#124;100)/10)×10,80,160),textScale/100·2자리; panelFit!==false.48669–48670 cursorSize30..200/5;49130–49205기존cursor2종·build/hover. §1.9CSS fit폭min1920/viewport−24와zoom관계 |
| API/경계 | `compute_layout(viewport,raw_text_scale,panel_fit)`는명시입력계산만·UIview값반환. missingactualfield는미연결표시유지. pointerimage경로는기존img/cursors만재사용,새아트/전역OScursor설정0 |
| 새 테스트/원본 값 | `test_native_settings_display_view.gd`: 1920×1080→1,2560×1440→1.3333,640×360→.3333,7680×4320→4;잘못된viewport면직전유효scale유지;raw 85→90 / 0→100 / 70→80 / 170→160 (JS round/falsy 근거),panelFitfalse만off. guidescale=max(1,auto)×text/100,HUD자동scale는text에영향0. 1280/1920/울트라와이드에서panel경계확인 |
| 격리 사용자 폴더 | `EXODUSER-TraceSettings-S09-Isolated-20261020` |
| 선행·충돌/검수 | S02/S08,UI담당과guide/font소유합의. source_options_state기본 필드 추가와기존 OPT35 테스트 수정은다른소유변경이므로별도범위확정필요. 이 단위계산·표시PASS로설정복원완료주장금지 |

### 4.10 S10 — 로비 언어·장치 읽기 인계

| 항목 | 구현 지시 |
| --- | --- |
| 만들 파일 | `godot/scripts/native_settings_lobby_bridge.gd`, `godot/tests/test_native_settings_lobby_bridge.gd` |
| 수정 파일/공용 최소 지점 | 현재Godot로비소유파일미확정이므로수정 0줄,공용 6파일 0줄. bridge는 명시 reader 입력·snapshot/우선순위 모델만. 실제로비장착은담당/scene확정전BLOCKED |
| 원본/옮길 상수·공식 | index2157–2164:URLlang→저장hellLang→Steam→browser→en,resolve지원검증;2232–2242네select동기화;1122–1250 _GP.connected/active분리·DEAD.25;4728–4738inputMode hint. 문자열언어목록은localization-runtime의actualsupportedreader를주입받고ko/en으로축소하지않음 |
| API | `resolve_language(observations,supported_codes)`/`read_device_view(observations)`;관측dict는외부reader가제공. 직접localStorage/SteamAPI/OS설정write0. gameplayframe/주입키/BINDS writer없음 |
| 새 테스트/원본 값 | `test_native_settings_lobby_bridge.gd`: URLko+저장en→ko,무효URL+저장ko→ko,저장없음+Steamen→en,모두없음→en;지원밖언어는다음후보. connected=true/active=false를동일시하지않음,장치교체때prev/axes표시초기화,DEAD.25경계. 이시험은native로비실장착/실물pad인수아님 |
| 격리 사용자 폴더 | `EXODUSER-TraceSettings-S10-Isolated-20261020` |
| 선행·충돌/검수 | 로비 담당 소유 확정·i18n reader 제공 필요. TRACE-SAVE의 형식 보호 유지; hellLang/inputMode 영속화는 아래 HOLD. S10 모델과 실제 4 select/focus/IME 검증은 구분 |

### 4.11 HOLD — 보호된 영속화·Q/E·실제 게임패드 주입

- 원본 근거: game48876·49293–49438(설정/프리셋 저장·복원),13494–14112(패드맵/주입),index2159–2164·4728(언어/모드 저장).
- 만들/수정할 제품·테스트 파일: **없음(보호)**. 공용 파일 수정 0줄. 새로운 세이브 키·JSON 형식·migration·Q/E 반사/판정·실전 입력 변경을 제안하지 않는다.
- 검증: 기존 형식·원본 행을 읽어 총괄/TRACE-SAVE 담당에게 인계하는 것만. 실행/격리 사용자 폴더 추가 없음. 이 HOLD를 S01 완료 조건이나 임의 fallback으로 흡수하지 않는다.

## 5. 공용 파일 연결 지점(목록만, 수정 없음)

“필요”는 후속 단위를 적용할 때 담당자 조정이 필요한 접점이며 이번 코드 수정 허가가 아니다. 현재 파일의 Q/E branch와 G/P 저장 구조는 **보호**다.

| 공용 파일 | 현재 정확 지점 | 필요한 연결 검토/인수 대상 | 선행·경계 |
| --- | --- | --- | --- |
| godot/scripts/main.gd | 109 _ready cap240; 1652–1684 inputs/read manifest; 1177 pause; 1601–1616 _toggle_pause | S02 settings panel open/close owner; S03 현재 binding 표시·비보호 입력 seam; S05 cap/reader 범위 | P2-001l main input 함수 진행 중. 동시 편집 금지, 총괄 최소 연결. Q/E branches 보호 |
| 같은 main.gd | 514–538 startup lang;1033–1045 FX;1110–1116 filters;1150–1156 shake;2007–2014 SFX | S01 read-only settings view의 actual options 사용, S08 기존 소비자에게 원본 field 전달 | 중복 OPT singleton 생성 금지. 기존 owner lifecycle 유지. save/restore 권위는 보호 |
| godot/scripts/hud.gd | 107–111 pause text;312–315 pause button; 슬롯 키캡 생성/갱신 본문 | 패널 진입/닫기·paused 표시, 현재 비보호 key label 및 안내배율을 UI 담당이 연결할 지점 | P2-007a 글꼴/가이드 마감과 조율. 임의 HUD 전체 재작성 없음 |
| godot/scripts/world.gd | 2753–2768 get_native_projectile_fx_context;조명/펫/FX 등록 consumer | 고정 visual policy와 원본 OPT 소비를 구별하여 필요한 flag reader seam 목록 검토 | world 동적등록 P3-002 진행 중. 성능/Tier 적용이 combat/nav/clock를 바꾸지 않는지 인수 필요 |
| godot/scripts/player.gd | 400–453 handle_native_input_event;455–483 clear/snapshot/focus | 비보호 action의 current bindings와 main 등록 동기, held/fresh/keyup/blur 해제 seam | P2-001l allows 진행 중. 425–431 native_magic 입력종류 제한은 관측만; Q/E 의미·FSM 변경 제안 없음 |
| godot/scripts/native_normal_enemy_hurte.gd | 431–445 hit feel/blood를 Main reader 경유 호출 | 이미 OPT의 간접 소비자. S08 정상 설정을 main seam으로 공급하면 직접 수정 필요성 현재 없음 | 공용 피해 집행자 직접 편집 불필요로 우선 판단. 후속 테스트가 누락을 입증할 때 총괄 재판정; Q/E·피해 계산 보호 |
| godot/scripts/native_source_new_run_state.gd | 361–367 apply_native_skill_shake 상수100;370 이후 crescent opt_shake 인자 | 일반 skill shake와 crescent의 OPT.shake 소비 차이를 현 소유자에게 인계; settings state 저장소로 사용하지 않음 | G/P 소유·세이브 형식 보호. 상수 변경/새 save field는 제안하지 않음; 별도 설정 consumer 연결 적합성 미확인 |

## 6. 이번 검증 결과·한계·인계

- 실행 명령(Node v24.15.0): `node --test test/hardwareTierBench.test.cjs test/settingsBindingControls.test.js test/settingsDifficultyVersion.test.cjs test/renderSettingsRestore.test.js test/settingsControlLabels.test.js test/settingsChoiceControls.test.js test/settingsCharacterLanguage.test.js`.
- **exit1, 52 test entries / 37 pass / 15 fail / 0 skip.** 테스트 코드는 수정하지 않았다. 실패를 우회하기 위한 fixture 주입·패키지 설치·별도 테스트 작성/테스트 수정 없음. 이 수치는 easy-test도 포함한 runner 집계이며 원본 game.html만의 통과율이 아니다.
- `hardwareTierBench` game.html 3실패: VM `window` 없음, 원본의 QA storage 참조에서 ReferenceError. skipped-bench 표시는 통과. easy 쪽4건 통과.
- `settingsBindingControls` game.html pad capture1실패: 테스트 VM에 `_resetInteractInput` 없음. 나머지9건 통과.
- `renderSettingsRestore` game.html 3실패: startup60%가100%, preset/explicit 해상도 기대불일치. 테스트 VM에 `window` 없음, 실제 loader가 내부 catch로 이 오류를 삼킬 수 있는 구조. **실브라우저 제품 결함 여부 미확인**; 실패 로그를 테스트 수정으로 감추지 않는다.
- `settingsDifficultyVersion` game.html 7실패: window 없는 VM의 직접 writer ReferenceError 및 startup merge 실패에 따른 언어/diff 기대불일치. easy7건 통과. 보호된 저장 형식/이관 변경 제안 없음.
- `settingsCharacterLanguage` 파일1개는 `acorn` 패키지 미설치 `ERR_MODULE_NOT_FOUND`로 test entry 실패. 실제 내부 case 실행 미완료. `settingsControlLabels`3·`settingsChoiceControls`8 통과.
- 원로그: `/Users/fordeargamers/exoduser-wt/_out/trace-settings/web-tests.log`. 광범위 docs 키워드 검색 경로목록: 같은 출력 폴더의 `docs-keyword-paths.txt`. 저장소에는 추가하지 않는다. 관련 docs 내용은 수정하지 않았다.
- Godot 의존 모듈/기존 테스트는 §3의 실제 파일·행을 정적으로 확인했다. Godot 실행·GUI/실물패드·FPS 실측·화면 검수·플랫폼 동등성은 **미확인**이다. 원본 테스트의 실패가 추적문서 작성을 막지는 않지만, 해당 시스템 PASS 인수는 막는다.
- 제출 전 `git diff --check` 및 변경 경로가 새 문서1개뿐인지 검증한다. main push/merge/force/reset 없음. 자기 브랜치 비강제 push 후 원격 SHA를 대조하고 DONE에 실제 SHA 기록. 새 문서의 자체 SHA는 commit 후 DONE/최종보고로 전달한다.

### 6.1 읽은 3.3 docs 목록(내용 byte 변경 없음)

| 파일(모두 docs/3.3 키바인딩+설정/) | 행 수 | SHA-256 |
| --- | --- | --- |
| 3.3 키바인딩+설정.md | 806 | d5e9768459839e55e030d578c87d241d55b013657c2e9d6150c7a1d0c58eb555 |
| GAMEPAD_HUD_LABEL_FIX_20260910.md | 17 | 11cd5c42ce6cb85e6d155e07993e78134f9e85fe0e5436e7eda40f7a44e05060 |
| MONICA_UNTRUSTED_EVENT_20260910.md | 32 | 7efbfa95919979f42516ae1571baea9ff14fcd2ab242c36003769e9996d1bc41 |
| 게임패드_매핑표.md | 258 | e52e23dcadd90be41ac05b21acf19bbc5958c93a9bcc5c3576ef0103fb359792 |
| 게임패드_벤치마킹_엘든링_디아블로4.md | 203 | c6d80f6310609617124be7742b1a32f34991f2bd8ba3ba4b51bbd30e1ff3787b |
| 게임패드_트러블슈팅.md | 227 | acf5f2a8b036e088d1c394c5bc624d06649e23ce2c0463704381844515df8fef |
| 게임패드_호버_상호작용.md | 748 | da9e0930be4e55b796f9db7e157a532afd6c435ad05f54248d9403a3f7488bd9 |

### 6.2 명시 저장 키의 전체 참조 행

아래는 두 HTML 전체에서 각 저장 키 문자열을 검색한 모든 행이다. 설정 wrapper/별도 JS 모듈 내부의 추가 caller를 이 두 HTML만으로 전수 입증하지는 않는다. 외부 모듈 의존은 §1.9 보충표에 별도 표시한다.

| 문자열 | game.html 전체 참조 행 | index.html 전체 참조 행 |
| --- | --- | --- |
| hellcave_settings | 9220, 48876, 49398 | 없음 |
| hellcave_preset_ | 49294, 49300 | 없음 |
| hellLang | 48876, 49433 | 2159, 2164, 2242 |
| hellcave_screen | 49219, 49238, 49254 | 없음 |
| gpKeyMap | 13504, 13508 | 없음 |
| inputMode | 13450, 13457, 13467, 13475, 13477–13478 | 1151, 1242, 4728–4729, 4733 |
| charIdx | 3574, 3605–3607, 3952, 3955, 3964, 10452–10453, 10470, 10475, 10481, 10484, 10491, 10494, 10500, 10648, 10671, 11996, 12028, 12030, 12060, 12127, 12341, 16806, 33368, 35179, 38465, 43609, 48676, 48678–48679, 58598, 58600, 58622, 58645, 58657, 58663, 58671, 58706, 58711, 58963, 59022, 59103, 59153, 60141, 62016, 62158, 63215, 63930, 64087 | 2921, 2936, 3145, 3153, 3194, 3436, 3450, 3461, 3500, 3505, 3545, 3586, 3590, 3667–3668 |
| _FDGDruidQaStorage | 3534, 3942, 4746, 4898, 9220, 10453, 10470, 13450, 13457, 13467, 13475, 13477–13478, 13504, 13508, 16939, 16964, 17119, 35743, 35745, 35750, 41773, 48523–48524, 48527, 48529, 48533, 48536, 48876, 49219, 49238, 49254, 49295, 49302, 49398, 49406, 49433, 49450, 51728, 55465, 57071, 61593, 62248, 62318, 62346, 62350, 63473, 63674, 63900, 64057, 64186, 64196, 64213, 64296, 64736, 65617, 65629, 65634, 65676 | 없음 |
