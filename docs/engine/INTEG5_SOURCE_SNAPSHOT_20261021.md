# INTEG-5 고정 원본 스냅샷

웹 Steam 업데이트가 네이티브 원본 대조를 깨뜨리지 않도록 live 루트 game.html과 고정 oracle 입력을 분리한다. 웹 game.html은 수정하지 않는다. 과거 문서의 `latest main` 고정 SHA 표현은 당시 관측 이력이며 이후 웹 최신판과의 동등성을 뜻하지 않는다.

| 계약 | 값/역할 |
|---|---|
| 고정 입력 | `godot/source_snapshot/game.html` (원본 Git blob byte 그대로) |
| 원 커밋 | `91e2774b769869e59f80953e148a5c95203b0fea` (2026-10-22 갱신, 이전 `e556b617190c325ca39f5add04357f5dea5ca87e` — [갱신 이력](#갱신-이력)) |
| SHA-256 | `dee094fd165e9b2fb3fbf0eb9cacc3bc3eddeb2c8eeea9c4772ba6cbc1f05209` (이전 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`) |
| 이력 | `source_snapshot/SNAPSHOT.json`: sha256, original_commit, original_commit_date, snapshot_date, path, purpose |
| GDScript 공통 API | `source_snapshot/snapshot.gd`: const SHA256, PATH. JSON manifest의 SHA를 상수로 투영 (const receipt 호환). 동기화 검증 필수 |
| Node 공통 API | `source_snapshot/snapshot.cjs`: manifest 기반 sha256/originalCommit/sourcePath/readBytes. readBytes는 실제 바이트 SHA를 검사 |
| 제품 12개/port_modules 7개 | 기존 SHA 문자열을 동일 값의 공통 상수로 교체. 수치·분기·피해·타이머·런타임 입력/출력 변화 없음. 스냅샷 로딩/해싱은 런타임 tick에 추가하지 않음 |
| 테스트/도구 | 기존 source CLI 인수 형식은 보존하되 이 SHA에 묶인 oracle는 snapshot 경로 사용. 다른 원본 SHA의 테스트는 변경하지 않음. CH1/CH2 exporter는 live game.html 및 origin/main game blob 대조를 제거하고 고정 snapshot 대조 사용 |
| fixture 7개 | 기존 SHA/원 커밋/케이스 전부 유지. source_snapshot 출처 경로만 추가. 역사적 `file: game.html`/행 번호는 스냅샷 내부 원 파일명으로 유지 |
| 범위 경계 | PC player.gd·docs/2_3·맵 비주얼/geometry·번역 목록 CRLF 수정 없음. 필드 BGM 변경은 별도 승인 merge에 한정 |

## 갱신 절차

1. 웹 main 갱신만으로 스냅샷을 갱신하지 않는다. 새로운 원본 이식 승인과 원 커밋 전체 SHA를 먼저 정한다.
2. 격리 worktree에서 `git show <commit>:game.html`의 raw bytes를 고정 입력에 저장하고 SHA-256을 계산한다. 줄바꿈/인코딩 정규화 금지.
3. SNAPSHOT.json의 SHA/원 커밋/원 커밋 날짜/스냅샷 날짜를 갱신하고 snapshot.gd SHA256 투영값을 동일하게 갱신한다. Node는 manifest를 직접 읽는다.
4. 기존 fragment hash·행 번호·fixture·제품 계약을 새 원본과 하나씩 비교한다. SHA만 바꿔 테스트를 통과시키지 않는다. 독립 oracle 재생성은 새 변경 근거가 있을 때만 한다.
5. docs 전체 관련 키워드를 검색하고 원본 계약·구현 범위 문서를 동기화한다. import/해당 suite 및 격리 E2E에서 실제 실패·blocked_by를 기록한다.
6. 웹 game.html과 보호 파일 불변, 제품 런타임 동일성, manifest/GD 상수/바이트 SHA 일치 확인 후 경로 지정 commit·비강제 push하고 원격 SHA 대조한다.

병합 및 검증 결과는 `INTEG5_VALIDATION_20261021.md`와 외부 `_out/INTEG-5/DONE.txt`에 기록한다. PC 대기 단계는 테스트 신호 주입으로 해제하지 않는다.

## 갱신 이력

| 날짜 | 원 커밋 / SHA-256 | 변경 이유 | 행 영향 |
|---|---|---|---|
| 2026-10-21 | `e556b617` / `4d911cdd…85e5d4` | INTEG-5 최초 고정 | — |
| 2026-10-22 | `91e2774b7` / `dee094fd…1f05209` | 사용자 결정 “유골함은 특수효과 없는 게 설계”(PC-HUD-STATS 결함 1). 웹 mkItem 유골함 분기 첫머리에 전설/유니크 롤이 남긴 원시 효과 키 `item[stat]` 삭제 2줄 추가. 포트 `drop_item_source.gd`가 같은 위치·순서로 따른다 | 새 G16156–16157 삽입. **G16155 이하 동일, G16156 이상 +2**. 그 밖의 바이트 차이 없음 |

2026-10-22 갱신의 실행 기록(브랜치 `claude/pc-hud-stats-20261022`, PC Claude):
- 절차 2·3: `git show origin/main:game.html` raw bytes(blob `27897d40…`), SNAPSHOT.json 4필드(sha256·original_commit·original_commit_date `2026-10-22T12:21:55+09:00`·snapshot_date) + snapshot.gd 상수. snapshot.cjs `readBytes()` 통과.
- 절차 4(행 번호·fragment): 포트 영수증·oracle 라벨·고정 데이터의 G행은 **이전 좌표(e556b617)를 유지**한다. PC 행 고정 oracle 3종은 읽을 때만 `n>=16156 → n+2`. 계약 문서는 “행 +2 이동” 주석만 단다.
- sha만 바꾸지 않은 것: 추출 출처를 기록한 데이터·fixture(CH1/CH2 맵 출처, demo11_*.json, sound fixture)는 새 바이트로 재추출·대조 없이는 바꾸지 않았다.
- 결과: PC 필수 회귀 전부 0실패. 스냅샷을 읽는 그 밖의 Mac 테스트 57종 중 **19종이 이전 스냅샷 통과 → 새 스냅샷 실패**(행 고정 oracle 9종: bc10·bc2_02~07·bc3_01·demo11_16 / 출처 SHA 고정 10종: 맵 출처 ch2_01·p3004a·p3004c 3종 + sound fixture provenance 7종). Mac 조치 전 main 병합 금지. 상세 표·선택지: [pc-hud-stats_REPORT §9-5](orders/reports/pc-hud-stats_REPORT.md#9-5-스냅샷-갱신이-깨뜨리는-mac-소유-테스트-main-병합-전-조치-필요).
