# P2-006a PC — 장비 표시·R 줍기 부분 구현 / 전체 미완료

## 재개 결과 — 2026-10-20 현행

**장비 경로 회귀 통과 / 유골 습득 미이식 / VISUAL VERDICT: RETOUCH.** 아래 이전 인수 기록은 과거 관측이며 이 절이 우선한다.

### 원본 대조 정정

| 항목 | 이 worktree game.html 행 | 현행 |
|---|---|---|
| 자동 줍기 | 41430–41432 | 원본에서 제거됨. 새 자동 수거를 만들지 않음 |
| 유물·소켓석 | 32046–32074 | 원본도 즉시 bag 지급. 기존 apply_native_drop_bags 보존. **이전 ‘바닥 연결을 위한 공용 파일 조율’ 추정 철회** |
| 장비 R | 32932–32979 | 화면 반폭+40px 최고 rarity·동급 근접, 홀드 9틱, release 리셋. 60px 반경 아님 |
| 크기·분류 | 15830–15834, 16180–16208 | 10열×120행, 장비2×2·unknown1×1, equipment/ossuary 별도 격자 수정 |
| 유골 스킨·uniqueArt | 27795, 27857–27881 | bone_{part}.png 접미사 없음 수정. 고유 _cut.png 우선 적용 |
| 빔 | 27817–27855, 52582–52588 | 별도 CanvasItemMaterial ADD 레이어. 이전 normal 근사 제거 |
| 오디오 | 16266–16271, 12372–12385, 12272 | 원본9샘플·OPT.sfxVol 적용, 드랍1200~2000px 제곱 감쇠·pan clamp(dx/600,−.7,.7), 획득 비공간. vol .5·pitch .04/.05 및 후단 .92~1.08 |
| 유골 습득 | 16400–16409, 45827–45888 | 도감·첫 유골함·applyStats 미이식. 거부·바닥 잔존, 가짜 가방 반입 금지 |

### 변경 파일·검수

- `native_world_drops.gd` 및 uid: 인수 신규 어댑터 보완. `main.gd`는 인수 +6줄만, `native_source_new_run_state.gd`는 인수 포함 +79줄. 입력·리젠·공용 피해 집행자·Q/E·세이브 형식 수정 없음.
- `godot/assets/`의 드랍 빔2·컷아웃14·스킨137·고유 누끼27·SFX9: **189/189 SHA-256 동일, 28,164,464 bytes**. 개별 원경로·복사경로·bytes·해시: [P2-006a_ASSETS.json](P2-006a_ASSETS.json). 원본 이미지 수정/AI 생성 없음. import 1회 exit0·ERROR0.
- 테스트3종 `test_p2006a_world_drops.gd`, `test_p2006a_pickup_contract.gd`, `test_p2006a_visual.gd`; 시스템 docs2종과 `docs/CHANGELOG_SYNC.md` 동기화. docs 전체 키워드 검색 원로그: `G:/exoduser-wt/_out/P2-006a-pc/docs-keyword-audit.log`.
- 추가 계약 RED 12검사/5실패(`red-contract`), 오디오 RED 13/1(`red-audio`)로 먼저 재현 후 최소 수정. 기존 기준선·중간 실패 로그는 유지.

공통 헬퍼 명령은 아래 인수 기록과 같고, 최종 실행 spec/로그는 다음과 같다. 로그 루트는 `G:/exoduser-wt/_out/P2-006a-pc/`; 각 폴더에 `<test>.out.log`, `<test>.err.log`가 있다.

| spec | 로그폴더 | 결과 |
|---|---|---|
| test_p2006a_pickup_contract:EXODUSER-P2006A-Isolated-20261020 | hold-final | **17 assertions/0 failures·exit0·ERROR0**. 8틱 미수거/9틱 반복·분류/크기·스킨·ADD·공간음 |
| test_p2006a_world_drops:EXODUSER-P2006A-Isolated-20261020 | lifecycle-final | **18/0·exit0·ERROR0**. 가득 참·300개 배치·유골 거부 |
| test_p2001c_kill_rewards:EXODUSER-P2001C-Isolated-20261020 | final-tests | **39/0·exit0·ERROR0**. 실제 근접 처치·RNG·유물 bag 기존 계약 |

합계 **74 assertions/0 failures**. 기존 Camera2D physics interpolation 경고 잔존. 중간 `final-tests` P2-006a 2종의 자원 누수 ERROR는 활성 음성 stop/stream=null teardown으로 해소했고 `lifecycle.out.log/err.log` verbose 진단 및 위 최종2종에서 ERROR0을 확인했다. 전체 게임 동등성 PASS가 아니다. override.cfg는 실행 후 비웠다.

### 실제 창·좌표 크롭

- 명령: 지정 엔진 `--path G:/exoduser-wt/p2-002a-hud/godot --resolution 1920x1080 --position 0,0 --script res://tests/test_p2006a_visual.gd`, userdir `EXODUSER-P2006A-Visual-Isolated-20261020`.
- 실제 GPU 창(AMD Radeon RX 9070 XT)에서 Player.request_attack **13회→1처치→자연 일반 전기 망토 1개**. 강제 피해/드랍 RNG 없음. 공격 선택·위치/방향 개입 **27회**의 테스트 하니스이며 정상 무개입 플레이 아님.
- 월드 `(3677.6886458979,6646.13843466248)` → 화면 앵커 `(1025.147,541.5825)`. `visual/drop-viewport-1920x1080.png`는 실제 창 렌더러의 viewport readback이며 OS 창 캡처가 아니다.
- `visual/drop-actual-1025-542-crop-1x.png`: 위 이미지 `(929,350)`의 **192×256 원배율 크롭**, 리사이즈 없음. **RETOUCH:** 처치 숫자/붉은 사망 효과가 일반 무빔 아이템과 겹쳐 판독이 약함. 원본에 없는 라벨/강제 빔으로 숨기지 않음.
- `visual/runtime.out.log/err.log`에 처치·레코드·좌표 보존. 최초 하니스 enemy_id Variant 추론 parse 오류는 명시 int로 수정; 재실행 시 같은 runtime 로그를 사용했으므로 첫 오류는 이 문장에 기록한다.
- Native Computer Use가 `Computer Use was not approved to use 2-stable_win64`로 거부됨. **OS 창 캡처·수동 R 검수 미확인**, 우회하지 않음. 자기 검수 PID40368/자식55176만 종료했다. 사용자의 기존 게임/서버는 건드리지 않았다.

### 인수·남은 게이트

- 같은 브랜치 `claude/p2-006a-drop-pickup-20261020`에만 반영. 선행 보고서 SHA `957e07eb1498c085545f72a839da02e021ca5064`, 새 코드 SHA는 커밋 후 최종 메시지에서 전달(자기 SHA 자기참조 금지).
- fetch 관측 origin/main `d3b672fea`를 merge하지 않았다. PC/Mac/main 동기화 완료 아님. `tools/guard.baseline.json` 타인 WIP는 제외.
- 유골 도감/첫 유골함/applyStats, 인벤 창/원본 자동정렬/영구저장, 다른 worldItem 타입, 그림자 blur/이모지 폴백 동등성, 효과 종료 후 가독성/고등급 빔/실제 수동 키 검수는 남아 있다. 목록은 `read_current_inventory().bag` 데이터 관측뿐이며 인벤 창으로 주장하지 않는다.
- 본 폴더 수정 금지로 작업판은 직접 갱신하지 않는다. 총괄에 이 보고서와 브랜치를 전달하여 P2-006a 부분 구현·미검수 경계를 유지한 채 인수/후속 배정을 요청한다.

---

## 이전 인수 기록 — 위 재개 결과로 갱신됨

## 1. 원본 근거

| 계약 | 이 worktree game.html 행 | 관측 |
|---|---|---|
| 일반 장비 반입 | 16398–16424 | 빈 장착 슬롯과 무관하게 INV.bag, 공간 부족 시 거부 |
| 유골 | 16400–16409 | 유골함 지급·도감 등록 선행. 현 포트 정직 정지 |
| 드랍 상한 | 16721 | 20개, 미개봉 상자 보호 |
| R 프레스·홀드 | 32932–32979 | 화면 ±40, 최고 등급·동급 근접, 홀드 9틱 |
| 장비 표시 | 52579–52594 | 34px 스킨·60×160 빔·바운스. 이 분기에는 라벨/TTL 없음 |
| 악의 수명 | 41632–41642 | mat만 _matLife 감소, 만료 시 슬라임 생성. 장비 TTL로 적용 금지 |

## 2. 변경 파일·소유권

- 브랜치 `claude/p2-006a-drop-pickup-20261020`, 인수 HEAD `ad7f15777a2b37069f4f493cb2379907774e587f`.
- 기존 tracked WIP: main.gd +6줄, native_source_new_run_state.gd +68줄. tools/guard.baseline.json은 별도 변경으로 보존.
- 기존 untracked: native_world_drops.gd 및 uid, test_p2006a_world_drops.gd, 드랍 빔·스킨·컷아웃·SFX. 원본 바이트 대조 전이므로 반영 후보 확정 아님.
- 이번 추가는 이 보고서뿐. 기존 코드 수정 없음. 백업: G:/exoduser-wt/_out/P2-006a-pc/handoff-backup/.
- 로컬 WORK_BOARD.md 없음. G:/exoduser의 작업판을 읽기 전용 확인: P2-006a 중단·인계 대기. 본 폴더 수정 없음.
- 로컬 MAC_ORDERS_20261020.md에 P2-006a 절 없음. 사용자 직접 배정 범위로 조사.

## 3. 기존 테스트 기준선

명령: `bash C:/Users/심도진/AppData/Local/Temp/claude/G--exoduser/01df6303-6873-40fb-a2e6-1c93fb00612e/scratchpad/run_godot_tests.sh G:/exoduser-wt/p2-002a-hud/godot G:/exoduser-wt/_out/P2-006a-pc/baseline test_p2006a_world_drops:EXODUSER-P2006A-Isolated-20261020`

| 항목 | 관측 |
|---|---|
| 엔진 | 4.7.2.stable.official.ed1daf0bf |
| 검사 | 3그룹, 18 assertions, 0 assertion failures, 0 skipped |
| 반입 | gx [0,2,4], 배치 300개, bonePart 미이식 거부 |
| stderr | Camera2D 경고, ObjectDB 2개 누수 경고, resources still in use ERROR 1개 |
| 로그 | G:/exoduser-wt/_out/P2-006a-pc/baseline/test_p2006a_world_drops.out.log 및 .err.log |

18/18은 전체 PASS가 아니다. 직접 레코드 주입·픽업 함수 호출 테스트이며 실제 처치·키 입력·오디오·실창·세이브 호환을 입증하지 않는다.

## 4. 커밋

구현 인수 커밋·push 미완료. 보고서 커밋 SHA는 최종 전달에서 별도 보고한다. 보고서 자체의 SHA를 본문에 자기참조하지 않는다.

## 5. 남은 것·의존성

| 항목 | 상태 |
|---|---|
| 결정·소켓석 | native_normal_enemy_hurte.gd:723에서 apply_native_drop_bags로 직접 반입. 바닥에서 재지급하면 중복. 해당 공용 피해 집행자는 수정 금지이므로 담당 조율 필요 |
| 유골 | 도감·유골함 지급 미이식. 가짜 가방행 폴백 금지 |
| 렌더 | uniqueArt 미복사 폴백, 가산 합성/블러 근사, 누락 에셋 원형 표시 등 원본 불일치 |
| 자동 줍기·필터·수명 | 각 분기 추적·검증 필요. 장비에 mat TTL 적용 금지 |
| 종료 오류 | 기존 테스트의 자원 누수 원인 진단·해소 필요 |
| 실창 | 1920×1080 실제 처치 후 장면·대상 실제 좌표 1× 크롭 미수행 |
| 에셋 | 인수 파일 원본 SHA-256 대조·누락 확인 필요 |

완료 판정: **미완료 / 시각 미검수**. 기존 진행분·사용자 서버·실제 저장 폴더는 보존한다.
