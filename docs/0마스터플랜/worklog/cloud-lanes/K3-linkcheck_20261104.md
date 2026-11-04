# K3 docs 링크 점검 결과 (보고 전용)

- 검사 시각: 2026-11-05 02:15:08 KST
- 검사 기준: origin/unity/main을 fetch한 뒤 고정한 `9196a515d7782ca457fe56078203b2b950f34ad2`. 이후 줄기 변경은 포함하지 않는다.
- 작업 브랜치: `codex/unity-docs-linkcheck-20261104`. 문서 원문 수정·Unity 실행·줄기 병합 없음.
- 산출물: 이 결과표와 `tools/linkcheck.mjs` 두 파일. 기존 CHANGELOG_SYNC.md는 소유 범위 밖이므로 수정하지 않음.

| 검사 | 결과 |
|---|---|
| 문서 소스 | 1587개 (CLAUDE.md + docs 아래 Markdown/HTML, 보관 문서 포함) |
| 링크 발생 수 | 7293 |
| 존재 확인 PASS | 5933 |
| 누락/형식 FAIL | 625 |
| 수동 확인 REVIEW | 0 |
| 범위 밖 SKIP | 735 (외부 URL·절대 로컬 경로) |
| CLAUDE 6절 | 직접 경로 19개, 누락 0개, 간접 참조 1개 |

## 방법과 한계

- 파일/디렉터리 존재는 고정 커밋의 `git ls-tree -rz`, 내용은 `git cat-file --batch`로 검사한다. sparse checkout 밖 파일을 누락으로 세지 않는다. 대소문자는 Git 경로 그대로 비교한다. /Users·/Volumes·/home 등 호스트 절대 경로는 제외하고, 그 밖의 /로 시작하는 링크는 저장소 루트 기준으로 해석한다.
- Markdown 인라인·이미지·정의된 참조/축약 링크와 HTML href/src를 검사한다. 괄호 중첩, <공백 경로>, 백슬래시 escape, percent encoding, query를 처리한다. 코드 블록·인라인 코드·HTML 주석은 링크 집계에서 제외한다.
- 제목은 ATX·Setext와 중복 suffix를 처리하고, 소문자·한글 유지·공백→하이픈·문장부호 제거 규칙으로 앵커를 계산한다. HTML id/name도 인정한다. 원문 줄 번호는 CRLF/LF 모두 보존한다.
- CommonMark/GFM 전체 파서는 아니다. 복잡한 다중행 참조 정의·목록/인용 내부 코드·수식·HTML 블록의 Markdown·특수 기호 제목은 렌더러와 차이가 날 수 있으므로 앵커 FAIL은 아래 원문 위치를 대조해야 한다. GitHub/에디터 브라우저 렌더링, 외부 HTTP, 비텍스트 파일 내부 앵커는 미확인이다.
- 일반 백틱 경로·평문 파일명은 링크가 아니므로 전체 링크 검사에 넣지 않는다. 요청된 CLAUDE 6절의 “착수 전에 읽기” 백틱 경로는 별도로 전부 확인한다. “해당 DESIGN LOCK”·“실버 헬 먼저” 등의 자연어 지시는 특정 파일 검증으로 확대하지 않는다.
- 자체 테스트 PASS: `--self-test` (실제 링크와 코드 예제 구분, 중복/한글/명시 앵커, 경로 인코딩, 저장소 이탈, CRLF 줄 번호), `--test-host-paths` (호스트 절대 경로 제외). 각각 결함/미구현 재현 후 수정한 도구로 통과를 확인했다. 본 보고의 링크 FAIL은 저장소 감사 결과이며 도구 실행 실패와 구분한다.

## 재현

```powershell
& 'C:/nvm4w/nodejs/node.exe' 'docs/0마스터플랜/worklog/cloud-lanes/tools/linkcheck.mjs' --self-test
& 'C:/nvm4w/nodejs/node.exe' 'docs/0마스터플랜/worklog/cloud-lanes/tools/linkcheck.mjs' --test-host-paths
& 'C:/nvm4w/nodejs/node.exe' 'docs/0마스터플랜/worklog/cloud-lanes/tools/linkcheck.mjs' --ref 9196a515d7782ca457fe56078203b2b950f34ad2
```

기본은 표준 출력만 한다. 결과표를 갱신하려면 `--output`을 붙이며, 지정된 K3 결과표 한 파일만 쓴다.

## 원인별 집계

| 상태:원인 | 발생 수 |
|---|---|
| `FAIL:missing-anchor` | 11 |
| `FAIL:missing-path` | 614 |
| `PASS:anchor-exists` | 433 |
| `PASS:path-exists` | 5500 |
| `SKIP:absolute-local` | 196 |
| `SKIP:external` | 539 |

## 폴더별 결과

| 폴더 | 문서 | 링크 | PASS | FAIL | REVIEW | SKIP |
|---|---:|---:|---:|---:|---:|---:|
| `0마스터플랜` | 47 | 198 | 172 | 4 | 0 | 22 |
| `10ai에셋프롬프트모음` | 12 | 18 | 16 | 0 | 0 | 2 |
| `11내러티브·로어디자인` | 28 | 32 | 32 | 0 | 0 | 0 |
| `12퍼포먼스·최적화` | 30 | 117 | 101 | 0 | 0 | 16 |
| `13출시·마케팅` | 61 | 234 | 115 | 9 | 0 | 110 |
| `14밸런스+수치테이블` | 23 | 47 | 47 | 0 | 0 | 0 |
| `15 세이브+데이터구조` | 2 | 35 | 30 | 0 | 0 | 5 |
| `16번역·로컬라이제이션` | 31 | 66 | 64 | 1 | 0 | 1 |
| `17게임아트팀` | 3 | 16 | 15 | 1 | 0 | 0 |
| `1전체그래픽세팅` | 11 | 79 | 77 | 2 | 0 | 0 |
| `2_1 스킬관리+합체시스템+자원` | 10 | 50 | 50 | 0 | 0 | 0 |
| `2_2 무기+활+속성시스템` | 1 | 9 | 7 | 0 | 0 | 2 |
| `2_3 돌진+패링+방패시스템` | 5 | 15 | 8 | 0 | 0 | 7 |
| `2_4 펫시스템` | 3 | 17 | 17 | 0 | 0 | 0 |
| `2_5 부활+에너지쉴드시스템` | 3 | 11 | 9 | 2 | 0 | 0 |
| `2_6 소환굴+리프트시스템` | 1 | 2 | 2 | 0 | 0 | 0 |
| `2_7 인벤토리+장비시스템` | 3 | 29 | 26 | 0 | 0 | 3 |
| `2_8 퀵슬롯+물약시스템` | 1 | 3 | 3 | 0 | 0 | 0 |
| `2_9 결정슬롯시스템` | 1 | 3 | 3 | 0 | 0 | 0 |
| `2게임디자인레벨디자인` | 17 | 34 | 34 | 0 | 0 | 0 |
| `3.1 ui hud 디자인` | 45 | 181 | 165 | 5 | 0 | 11 |
| `3.2메타·진행시스템` | 2 | 10 | 9 | 0 | 0 | 1 |
| `3.3 키바인딩+설정` | 7 | 36 | 35 | 0 | 0 | 1 |
| `4.0케릭터스프라이트 디자인` | 12 | 65 | 65 | 0 | 0 | 0 |
| `4.1맵디자인+설정` | 101 | 879 | 777 | 91 | 0 | 11 |
| `5.0애니메이션파이프라인` | 8 | 77 | 74 | 3 | 0 | 0 |
| `5.1임펙트디자인` | 54 | 164 | 140 | 1 | 0 | 23 |
| `6사운드디자인` | 26 | 83 | 81 | 1 | 0 | 1 |
| `7아이템디자인` | 15 | 50 | 47 | 0 | 0 | 3 |
| `8.0몬스터디자인` | 21 | 115 | 115 | 0 | 0 | 0 |
| `8.1보스디자인바이블` | 9 | 33 | 24 | 0 | 0 | 9 |
| `8.2레어몹디자인` | 1 | 2 | 2 | 0 | 0 | 0 |
| `9적ai패턴디자인` | 4 | 26 | 26 | 0 | 0 | 0 |
| `API연결_가이드.md` | 1 | 2 | 1 | 0 | 0 | 1 |
| `CHANGELOG_DAILY_20260520.md` | 1 | 8 | 5 | 0 | 0 | 3 |
| `CHANGELOG_SYNC.md` | 1 | 734 | 722 | 5 | 0 | 7 |
| `CLAUDE.md` | 1 | 17 | 17 | 0 | 0 | 0 |
| `DOCS_INDEX.md` | 1 | 2 | 2 | 0 | 0 | 0 |
| `GIT_PROVENANCE_NOTES.md` | 1 | 0 | 0 | 0 | 0 | 0 |
| `HELL_EXODUSER_WORLDVIEW_v2.md` | 1 | 0 | 0 | 0 | 0 | 0 |
| `MAC_SWIZZLE_AUDIT.md` | 1 | 1 | 1 | 0 | 0 | 0 |
| `MAIN_DOCS_MIGRATION_20261104.md` | 1 | 0 | 0 | 0 | 0 | 0 |
| `PERF_MAC_CHROME_AUDIT.md` | 1 | 2 | 2 | 0 | 0 | 0 |
| `_archive` | 584 | 1981 | 1264 | 491 | 0 | 226 |
| `archetypes` | 10 | 19 | 19 | 0 | 0 | 0 |
| `cinematic` | 64 | 251 | 145 | 0 | 0 | 106 |
| `engine` | 317 | 1534 | 1361 | 9 | 0 | 164 |
| `모바일패키징_Android_해결리포트.md` | 1 | 0 | 0 | 0 | 0 | 0 |
| `미구현+구현예정.md` | 1 | 0 | 0 | 0 | 0 | 0 |
| `종합_버그리포트.md` | 1 | 2 | 2 | 0 | 0 | 0 |
| `최종기획서` | 1 | 4 | 4 | 0 | 0 | 0 |

## CLAUDE.md 6절 “착수 전에 읽기”

| 작업 | 원문 줄 | docs 기준 경로 | 판정 |
|---|---:|---|---|
| 스킬 | 148 | `docs/2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md` | PASS |
| 합체 | 149 | `같은 문서의 절(직접 경로 없음)` | 간접 참조 |
| 추천빌드 | 150 | `docs/2_1 스킬관리+합체시스템+자원/추천빌드_SKILL_REC_PATH.md` | PASS |
| 밸런스·수치 | 151 | `docs/14밸런스+수치테이블/` | PASS |
| 몬스터 | 152 | `docs/8.0몬스터디자인/` | PASS |
| 보스 | 153 | `docs/engine/UNITY_BOSS_BATTLE_BOARD_20261026.md` | PASS |
| 보스 | 153 | `docs/8.1보스디자인바이블/` | PASS |
| 영웅 캐릭터 | 154 | `docs/engine/UNITY_CHARACTER_BOARD_20261027.md` | PASS |
| 맵·레벨 | 155 | `docs/4.1맵디자인+설정/UNITY_MAP_BOARD_20261026.md` | PASS |
| 맵·레벨 | 155 | `docs/4.1맵디자인+설정/_MAP_SSOT_INDEX.md` | PASS |
| 아이템·어픽스 | 156 | `docs/7아이템디자인/` | PASS |
| UI·HUD | 157 | `docs/3.1 ui hud 디자인/` | PASS |
| VFX | 158 | `docs/5.1임펙트디자인/` | PASS |
| 사운드 | 159 | `docs/6사운드디자인/` | PASS |
| 무기·활·속성 | 160 | `docs/2_2 무기+활+속성시스템/` | PASS |
| 돌진·패링·방패 | 161 | `docs/2_3 돌진+패링+방패시스템/` | PASS |
| 인벤토리·장비 | 162 | `docs/2_7 인벤토리+장비시스템/` | PASS |
| 세이브·데이터 | 163 | `docs/15 세이브+데이터구조/` | PASS |
| 이미지·3D 생성 | 164 | `docs/17게임아트팀/ART_TEAM_MASTER.md` | PASS |
| 번역 | 165 | `docs/16번역·로컬라이제이션/번역_가이드.md` | PASS |

## 누락 및 수동 확인 전체 목록

| 상태 | 원인 | 원문 파일:줄 | 링크 원문 | 해석한 대상 |
|---|---|---|---|---|
| FAIL | missing-anchor | `docs/0마스터플랜/EXODUSER_MASTER_BIBLE_v2_2 (2).md:109` | `#12-사운드-시스템` | `docs/0마스터플랜/EXODUSER_MASTER_BIBLE_v2_2 (2).md#12-사운드-시스템` |
| FAIL | missing-anchor | `docs/0마스터플랜/EXODUSER_MASTER_BIBLE_v2_2 (2).md:113` | `#16-출시-로드맵` | `docs/0마스터플랜/EXODUSER_MASTER_BIBLE_v2_2 (2).md#16-출시-로드맵` |
| FAIL | missing-anchor | `docs/0마스터플랜/PROJECT_MANAGEMENT_MASTER.md:5` | `WORK_MANUAL_20261029.md#4-heartbeat--실제-전달과-시간별-작업보고` | `docs/0마스터플랜/WORK_MANUAL_20261029.md#4-heartbeat--실제-전달과-시간별-작업보고` |
| FAIL | missing-anchor | `docs/0마스터플랜/TEAM_CONTINUATION_POLICY_20261001.md:7` | `WORK_MANUAL_20261029.md#4-heartbeat--실제-전달과-시간별-작업보고` | `docs/0마스터플랜/WORK_MANUAL_20261029.md#4-heartbeat--실제-전달과-시간별-작업보고` |
| FAIL | missing-path | `docs/13출시·마케팅/FDG_COMPANY_DOCUMENTS.md:9` | `private-business/FDG_사업자_연락처.md` | `docs/13출시·마케팅/private-business/FDG_사업자_연락처.md` |
| FAIL | missing-path | `docs/13출시·마케팅/FDG_COMPANY_DOCUMENTS.md:10` | `private-business/사업자등록증.pdf` | `docs/13출시·마케팅/private-business/사업자등록증.pdf` |
| FAIL | missing-path | `docs/13출시·마케팅/FDG_COMPANY_DOCUMENTS.md:11` | `private-business/FDG_명함_20260809.png` | `docs/13출시·마케팅/private-business/FDG_명함_20260809.png` |
| FAIL | missing-path | `docs/13출시·마케팅/FDG_COMPANY_DOCUMENTS.md:12` | `private-business/manifest.json` | `docs/13출시·마케팅/private-business/manifest.json` |
| FAIL | missing-path | `docs/13출시·마케팅/GUARD_BASELINE_PERSISTENCE_20260929.md:17` | `../../captures/ch1_outer85/git-checkpoint.json` | `captures/ch1_outer85/git-checkpoint.json` |
| FAIL | missing-path | `docs/13출시·마케팅/GUARD_BASELINE_PERSISTENCE_20260929.md:19` | `../../captures/ch1_outer85/guard-io-diagnostic.json` | `captures/ch1_outer85/guard-io-diagnostic.json` |
| FAIL | missing-path | `docs/13출시·마케팅/GUARD_BASELINE_PERSISTENCE_20260929.md:19` | `../../captures/ch1_outer85/guard-tests-red.log` | `captures/ch1_outer85/guard-tests-red.log` |
| FAIL | missing-path | `docs/13출시·마케팅/GUARD_BASELINE_PERSISTENCE_20260929.md:19` | `../../captures/ch1_outer85/guard-tests-green.log` | `captures/ch1_outer85/guard-tests-green.log` |
| FAIL | missing-path | `docs/13출시·마케팅/TRAILER_ART_REFRESH_20261009.md:17` | `NEW_VERSION_TRAILER_PRODUCTION_20261009.md` | `docs/13출시·마케팅/NEW_VERSION_TRAILER_PRODUCTION_20261009.md` |
| FAIL | missing-path | `docs/16번역·로컬라이제이션/번역대상_전체목록.md:4633` | `실버 헬 UI 패키지` | `docs/16번역·로컬라이제이션/실버 헬 UI 패키지` |
| FAIL | missing-path | `docs/17게임아트팀/IVAN_T8_KEYART_V35_20261026.md:43` | `../11내러티브·로어디자인/NEW_HEROES_DESIGN_LOCK.md` | `docs/11내러티브·로어디자인/NEW_HEROES_DESIGN_LOCK.md` |
| FAIL | missing-anchor | `docs/1전체그래픽세팅/1전체그래픽세팅_MASTER.md:45` | `#step-7-횃불-조명-시스템` | `docs/1전체그래픽세팅/1전체그래픽세팅_MASTER.md#step-7-횃불-조명-시스템` |
| FAIL | missing-anchor | `docs/1전체그래픽세팅/1전체그래픽세팅_MASTER.md:67` | `#26-성능-예산` | `docs/1전체그래픽세팅/1전체그래픽세팅_MASTER.md#26-성능-예산` |
| FAIL | missing-path | `docs/2_5 부활+에너지쉴드시스템/2_5 부활+에너지쉴드시스템.md:326` | `../engine/orders/reports/pc-player-shield_REPORT.md` | `docs/engine/orders/reports/pc-player-shield_REPORT.md` |
| FAIL | missing-path | `docs/2_5 부활+에너지쉴드시스템/RESPAWN_RESOURCE_RESET.md:28` | `45` | `docs/2_5 부활+에너지쉴드시스템/45` |
| FAIL | missing-anchor | `docs/3.1 ui hud 디자인/FULLSCREEN_ART_ULTRAWIDE_20261031.md:87` | `스플래시_인트로_시퀀스.md#2026-11-02-현행--c2-큰-화면-kling-반복-영상` | `docs/3.1 ui hud 디자인/스플래시_인트로_시퀀스.md#2026-11-02-현행--c2-큰-화면-kling-반복-영상` |
| FAIL | missing-path | `docs/3.1 ui hud 디자인/GEM_ATELIER_20260927.md:33` | `../6사운드디자인/유물_장착음_20260927.md` | `docs/6사운드디자인/유물_장착음_20260927.md` |
| FAIL | missing-anchor | `docs/3.1 ui hud 디자인/LOBBY_AAA_REFERENCE_STUDY_20261028.md:3` | `스플래시_인트로_시퀀스.md#2026-11-02-현행--c2-큰-화면-kling-반복-영상` | `docs/3.1 ui hud 디자인/스플래시_인트로_시퀀스.md#2026-11-02-현행--c2-큰-화면-kling-반복-영상` |
| FAIL | missing-anchor | `docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md:6` | `스플래시_인트로_시퀀스.md#2026-11-02-현행--c2-큰-화면-kling-반복-영상` | `docs/3.1 ui hud 디자인/스플래시_인트로_시퀀스.md#2026-11-02-현행--c2-큰-화면-kling-반복-영상` |
| FAIL | missing-anchor | `docs/3.1 ui hud 디자인/UNITY_DEMO_TEXT_20261104.md:61` | `../11내러티브·로어디자인/DEMO_V0_1_1_TEXT_AUDIT_20261104.md#6-11-04-0150-r1r2-반영` | `docs/11내러티브·로어디자인/DEMO_V0_1_1_TEXT_AUDIT_20261104.md#6-11-04-0150-r1r2-반영` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_1_BLOCKOUT_MASTER.md:65` | `../../captures/ch1_outer81/REPORT.md` | `captures/ch1_outer81/REPORT.md` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_1_BLOCKOUT_MASTER.md:65` | `../../captures/ch1_outer81/index.html` | `captures/ch1_outer81/index.html` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_1_BLOCKOUT_MASTER.md:83` | `../../captures/ch1_outer80/REPORT.md` | `captures/ch1_outer80/REPORT.md` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_1_BLOCKOUT_MASTER.md:83` | `../../captures/ch1_outer80/index.html` | `captures/ch1_outer80/index.html` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_1_BLOCKOUT_MASTER.md:128` | `../../captures/ch1_ground_skin65/REPORT.md` | `captures/ch1_ground_skin65/REPORT.md` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_1_BLOCKOUT_MASTER.md:128` | `../../captures/ch1_ground_skin65/index.html` | `captures/ch1_ground_skin65/index.html` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_1_DEPTH_RETOUCH_20260917.md:65` | `../../captures/ch1_outer81/REPORT.md` | `captures/ch1_outer81/REPORT.md` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_1_DEPTH_RETOUCH_20260917.md:65` | `../../captures/ch1_outer81/index.html` | `captures/ch1_outer81/index.html` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_1_DEPTH_RETOUCH_20260917.md:83` | `../../captures/ch1_outer80/REPORT.md` | `captures/ch1_outer80/REPORT.md` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_1_DEPTH_RETOUCH_20260917.md:83` | `../../captures/ch1_outer80/index.html` | `captures/ch1_outer80/index.html` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_1_DEPTH_RETOUCH_20260917.md:128` | `../../captures/ch1_ground_skin65/REPORT.md` | `captures/ch1_ground_skin65/REPORT.md` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_1_DEPTH_RETOUCH_20260917.md:128` | `../../captures/ch1_ground_skin65/index.html` | `captures/ch1_ground_skin65/index.html` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_1_DEPTH_RETOUCH_20260917.md:136` | `../../captures/ch1_depth_20260917/index.html` | `captures/ch1_depth_20260917/index.html` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_1_DEPTH_RETOUCH_20260917.md:138` | `../../captures/ch1_depth_20260917/input-walk.webm` | `captures/ch1_depth_20260917/input-walk.webm` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_1_DEPTH_RETOUCH_20260917.md:139` | `../../captures/ch1_depth_20260917/normal-attempt.webm` | `captures/ch1_depth_20260917/normal-attempt.webm` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_1_DEPTH_RETOUCH_20260917.md:140` | `../../captures/ch1_depth_20260917/runtime-full-layout.jpg` | `captures/ch1_depth_20260917/runtime-full-layout.jpg` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_1_PRODUCTION_FINISH_20260916.md:105` | `../../captures/ch1_outer83/index.html` | `captures/ch1_outer83/index.html` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_1_PRODUCTION_FINISH_20260916.md:105` | `../../captures/ch1_outer83/visible-refined/runtime.json` | `captures/ch1_outer83/visible-refined/runtime.json` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_1_PRODUCTION_FINISH_20260916.md:105` | `../../captures/ch1_outer83/live/runtime.json` | `captures/ch1_outer83/live/runtime.json` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_1_PRODUCTION_FINISH_20260916.md:105` | `../../captures/ch1_outer83/chrome-first-run.json` | `captures/ch1_outer83/chrome-first-run.json` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_1_PRODUCTION_FINISH_20260916.md:105` | `../../captures/ch1_outer83/chrome-reload.json` | `captures/ch1_outer83/chrome-reload.json` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_1_PRODUCTION_FINISH_20260916.md:105` | `../../captures/ch1_outer83/final-state.json` | `captures/ch1_outer83/final-state.json` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_1_PRODUCTION_FINISH_20260916.md:107` | `../../captures/ch1_outer82/live/runtime.json` | `captures/ch1_outer82/live/runtime.json` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_1_PRODUCTION_FINISH_20260916.md:107` | `../../captures/ch1_stability82/runtime.json` | `captures/ch1_stability82/runtime.json` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_1_PRODUCTION_FINISH_20260916.md:161` | `../../captures/ch1_outer81/REPORT.md` | `captures/ch1_outer81/REPORT.md` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_1_PRODUCTION_FINISH_20260916.md:161` | `../../captures/ch1_outer81/index.html` | `captures/ch1_outer81/index.html` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_1_PRODUCTION_FINISH_20260916.md:225` | `../../captures/ch1_outer80/REPORT.md` | `captures/ch1_outer80/REPORT.md` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_1_PRODUCTION_FINISH_20260916.md:225` | `../../captures/ch1_outer80/index.html` | `captures/ch1_outer80/index.html` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_1_PRODUCTION_FINISH_20260916.md:1240` | `../../captures/ch1_ground_skin64/REPORT.md` | `captures/ch1_ground_skin64/REPORT.md` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_1_PRODUCTION_FINISH_20260916.md:1240` | `../../captures/ch1_ground_skin64/index.html` | `captures/ch1_ground_skin64/index.html` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_1_PRODUCTION_FINISH_20260916.md:1242` | `../../captures/ch1_ground_skin63/REPORT.md` | `captures/ch1_ground_skin63/REPORT.md` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_FLOOR_UNIFICATION_PASS87_20260929.md:5` | `../../captures/ch1_floor87/user-approved-reference.png` | `captures/ch1_floor87/user-approved-reference.png` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_FLOOR_UNIFICATION_PASS87_20260929.md:170` | `../../captures/ch1_floor87/index.html` | `captures/ch1_floor87/index.html` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_FLOOR_UNIFICATION_PASS87_20260929.md:170` | `../../captures/ch1_floor87/verification.json` | `captures/ch1_floor87/verification.json` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_FLOOR_UNIFICATION_PASS87_20260929.md:170` | `../../captures/ch1_floor87/technical-verification.json` | `captures/ch1_floor87/technical-verification.json` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_FLOOR_UNIFICATION_PASS87_20260929.md:170` | `../../captures/ch1_floor87/tests.log` | `captures/ch1_floor87/tests.log` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_FLOOR_UNIFICATION_PASS87_20260929.md:170` | `../../captures/ch1_floor87/edge-live-performance.json` | `captures/ch1_floor87/edge-live-performance.json` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_FLOOR_UNIFICATION_PASS87_20260929.md:170` | `../../captures/ch1_floor87/background-performance-invalid.json` | `captures/ch1_floor87/background-performance-invalid.json` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_HIDDEN_UNDERLAY_20260929.md:71` | `../../captures/ch1_outer83/underlay-live/runtime.json` | `captures/ch1_outer83/underlay-live/runtime.json` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_HIDDEN_UNDERLAY_20260929.md:71` | `../../captures/ch1_outer83/underlay-tests-green.log` | `captures/ch1_outer83/underlay-tests-green.log` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_HIDDEN_UNDERLAY_20260929.md:71` | `../../captures/ch1_outer83/underlay-related-tests.log` | `captures/ch1_outer83/underlay-related-tests.log` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_HIDDEN_UNDERLAY_20260929.md:73` | `../../captures/ch1_outer83/underlay-gpu.json` | `captures/ch1_outer83/underlay-gpu.json` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_HIDDEN_UNDERLAY_20260929.md:73` | `../../captures/ch1_outer83/underlay-final.json` | `captures/ch1_outer83/underlay-final.json` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_ORGANIC_CACHE_BUDGET_PASS86_20260929.md:66` | `../../captures/ch1_map_fps86/runtime.json` | `captures/ch1_map_fps86/runtime.json` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_ORGANIC_CACHE_BUDGET_PASS86_20260929.md:66` | `../../captures/ch1_map_fps86/before.json` | `captures/ch1_map_fps86/before.json` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_ORGANIC_CACHE_BUDGET_PASS86_20260929.md:66` | `../../captures/ch1_map_fps86/before-repeat.json` | `captures/ch1_map_fps86/before-repeat.json` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_ORGANIC_CACHE_BUDGET_PASS86_20260929.md:66` | `../../captures/ch1_map_fps86/browser-pixels.json` | `captures/ch1_map_fps86/browser-pixels.json` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_ORGANIC_CACHE_BUDGET_PASS86_20260929.md:66` | `../../captures/ch1_map_fps86/tests.log` | `captures/ch1_map_fps86/tests.log` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_ORGANIC_CACHE_BUDGET_PASS86_20260929.md:66` | `../../captures/ch1_map_fps86/browser-logs.json` | `captures/ch1_map_fps86/browser-logs.json` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_OUTER_CONNECTION_PASS85_20260929.md:83` | `../../captures/ch1_outer85/live/runtime.json` | `captures/ch1_outer85/live/runtime.json` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_OUTER_CONNECTION_PASS85_20260929.md:83` | `../../captures/ch1_outer85/tests.log` | `captures/ch1_outer85/tests.log` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_OUTER_CONNECTION_PASS85_20260929.md:83` | `../../captures/ch1_outer85/layer-verification-current.log` | `captures/ch1_outer85/layer-verification-current.log` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_OUTER_CONNECTION_PASS85_20260929.md:83` | `../../captures/ch1_outer85/production-verification.json` | `captures/ch1_outer85/production-verification.json` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_OUTER_CONNECTION_PASS85_20260929.md:83` | `../../captures/ch1_outer85/detail.jpg` | `captures/ch1_outer85/detail.jpg` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_OUTER_CONNECTION_PASS85_20260929.md:83` | `../../captures/ch1_outer85/live/JOIN85.png` | `captures/ch1_outer85/live/JOIN85.png` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_OUTER_CONNECTION_PASS85_20260929.md:83` | `../../captures/ch1_outer85/live/COMBAT85.png` | `captures/ch1_outer85/live/COMBAT85.png` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_OUTER_CONNECTION_PASS85_20260929.md:104` | `../../captures/ch1_outer85/git-checkpoint.json` | `captures/ch1_outer85/git-checkpoint.json` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_POISON_ROTTEN_FOREST_ART_20260924.md:65` | `../../captures/ch1_outer81/REPORT.md` | `captures/ch1_outer81/REPORT.md` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_POISON_ROTTEN_FOREST_ART_20260924.md:65` | `../../captures/ch1_outer81/index.html` | `captures/ch1_outer81/index.html` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_POISON_ROTTEN_FOREST_ART_20260924.md:83` | `../../captures/ch1_outer80/REPORT.md` | `captures/ch1_outer80/REPORT.md` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_POISON_ROTTEN_FOREST_ART_20260924.md:83` | `../../captures/ch1_outer80/index.html` | `captures/ch1_outer80/index.html` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_POISON_ROTTEN_FOREST_ART_20260924.md:128` | `../../captures/ch1_ground_skin65/REPORT.md` | `captures/ch1_ground_skin65/REPORT.md` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_POISON_ROTTEN_FOREST_ART_20260924.md:128` | `../../captures/ch1_ground_skin65/index.html` | `captures/ch1_ground_skin65/index.html` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_POISON_ROTTEN_FOREST_ART_20260924.md:143` | `../../captures/ch1_ground_skin64/REPORT.md` | `captures/ch1_ground_skin64/REPORT.md` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_POISON_ROTTEN_FOREST_ART_20260924.md:143` | `../../captures/ch1_ground_skin64/index.html` | `captures/ch1_ground_skin64/index.html` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_POISON_ROTTEN_FOREST_ART_20260924.md:145` | `../../captures/ch1_ground_skin63/generation.json` | `captures/ch1_ground_skin63/generation.json` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/CH1_POISON_ROTTEN_FOREST_ART_20260924.md:145` | `../../captures/ch1_ground_skin63/REPORT.md` | `captures/ch1_ground_skin63/REPORT.md` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/MAP_ART_BIBLE_v2_20261026.md:291` | `2026-10-27 사용자 확정` | `docs/4.1맵디자인+설정/2026-10-27 사용자 확정` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/_MAP_SSOT_INDEX.md:170` | `../../captures/ch1_outer81/REPORT.md` | `captures/ch1_outer81/REPORT.md` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/_MAP_SSOT_INDEX.md:170` | `../../captures/ch1_outer81/index.html` | `captures/ch1_outer81/index.html` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/_MAP_SSOT_INDEX.md:188` | `../../captures/ch1_outer80/REPORT.md` | `captures/ch1_outer80/REPORT.md` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/_MAP_SSOT_INDEX.md:188` | `../../captures/ch1_outer80/index.html` | `captures/ch1_outer80/index.html` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/_MAP_SSOT_INDEX.md:233` | `../../captures/ch1_ground_skin65/REPORT.md` | `captures/ch1_ground_skin65/REPORT.md` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/_MAP_SSOT_INDEX.md:233` | `../../captures/ch1_ground_skin65/index.html` | `captures/ch1_ground_skin65/index.html` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/맵디테일.md:91` | `../../captures/ch1_outer81/REPORT.md` | `captures/ch1_outer81/REPORT.md` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/맵디테일.md:91` | `../../captures/ch1_outer81/index.html` | `captures/ch1_outer81/index.html` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/맵디테일.md:109` | `../../captures/ch1_outer80/REPORT.md` | `captures/ch1_outer80/REPORT.md` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/맵디테일.md:109` | `../../captures/ch1_outer80/index.html` | `captures/ch1_outer80/index.html` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/맵디테일.md:154` | `../../captures/ch1_ground_skin65/REPORT.md` | `captures/ch1_ground_skin65/REPORT.md` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/맵디테일.md:154` | `../../captures/ch1_ground_skin65/index.html` | `captures/ch1_ground_skin65/index.html` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/맵디테일.md:169` | `../../captures/ch1_ground_skin64/REPORT.md` | `captures/ch1_ground_skin64/REPORT.md` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/맵디테일.md:169` | `../../captures/ch1_ground_skin64/index.html` | `captures/ch1_ground_skin64/index.html` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/맵디테일.md:171` | `../../captures/ch1_ground_skin63/REPORT.md` | `captures/ch1_ground_skin63/REPORT.md` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/맵디테일.md:173` | `../../captures/ch1_ground_skin_candidate62/REPORT.md` | `captures/ch1_ground_skin_candidate62/REPORT.md` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/맵디테일.md:315` | `../../captures/ch1_ground_skin63/REPORT.md#파일-수신-경로` | `captures/ch1_ground_skin63/REPORT.md#파일-수신-경로` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/맵오브젝트_에셋목록.md:85` | `../../captures/ch1_outer81/REPORT.md` | `captures/ch1_outer81/REPORT.md` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/맵오브젝트_에셋목록.md:85` | `../../captures/ch1_outer81/index.html` | `captures/ch1_outer81/index.html` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/맵오브젝트_에셋목록.md:103` | `../../captures/ch1_outer80/REPORT.md` | `captures/ch1_outer80/REPORT.md` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/맵오브젝트_에셋목록.md:103` | `../../captures/ch1_outer80/index.html` | `captures/ch1_outer80/index.html` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/맵오브젝트_에셋목록.md:148` | `../../captures/ch1_ground_skin65/REPORT.md` | `captures/ch1_ground_skin65/REPORT.md` |
| FAIL | missing-path | `docs/4.1맵디자인+설정/맵오브젝트_에셋목록.md:148` | `../../captures/ch1_ground_skin65/index.html` | `captures/ch1_ground_skin65/index.html` |
| FAIL | missing-path | `docs/5.0애니메이션파이프라인/ENGINE_ATLAS_CLIP_RUNTIME_20261009.md:121` | `../5.1임펙트디자인/BOSS_LAVA_ERUPT24_ENGINE_20261010.md` | `docs/5.1임펙트디자인/BOSS_LAVA_ERUPT24_ENGINE_20261010.md` |
| FAIL | missing-path | `docs/5.0애니메이션파이프라인/ENGINE_SPRITE_CLIP_RESOURCE_20261009.md:7` | `EXODUSER_ENGINE_ANIMATION_20261009.md#2026-10-09--원본-스프라이트-모션-편집기` | `docs/5.0애니메이션파이프라인/EXODUSER_ENGINE_ANIMATION_20261009.md#2026-10-09--원본-스프라이트-모션-편집기` |
| FAIL | missing-path | `docs/5.0애니메이션파이프라인/ENGINE_SPRITE_CLIP_RESOURCE_20261009.md:142` | `../5.1임펙트디자인/BOSS_LAVA_ERUPT24_ENGINE_20261010.md` | `docs/5.1임펙트디자인/BOSS_LAVA_ERUPT24_ENGINE_20261010.md` |
| FAIL | missing-path | `docs/5.1임펙트디자인/DRUID_ROOTS48_ENGINE_20261010.md:63` | `FDG_DRUID_ROOTS_CONSUMER_20261010.md` | `docs/5.1임펙트디자인/FDG_DRUID_ROOTS_CONSUMER_20261010.md` |
| FAIL | missing-path | `docs/6사운드디자인/AD2_UI_SOUND_INVENTORY_20261028.md:238` | `분해 버튼` | `docs/6사운드디자인/분해 버튼` |
| FAIL | missing-path | `docs/CHANGELOG_SYNC.md:2680` | `4.1맵디자인+설정/DEPTH_SLICE2_20261001.md §0` | `docs/4.1맵디자인+설정/DEPTH_SLICE2_20261001.md §0` |
| FAIL | missing-path | `docs/CHANGELOG_SYNC.md:2934` | `../captures/ch1_outer81/REPORT.md` | `captures/ch1_outer81/REPORT.md` |
| FAIL | missing-path | `docs/CHANGELOG_SYNC.md:2934` | `../captures/ch1_outer81/index.html` | `captures/ch1_outer81/index.html` |
| FAIL | missing-path | `docs/CHANGELOG_SYNC.md:2952` | `../captures/ch1_outer80/REPORT.md` | `captures/ch1_outer80/REPORT.md` |
| FAIL | missing-path | `docs/CHANGELOG_SYNC.md:2952` | `../captures/ch1_outer80/index.html` | `captures/ch1_outer80/index.html` |
| FAIL | missing-path | `docs/_archive/0마스터플랜/session_handoff/transitions.md:3` | `../../3.1%20ui%20hud%20디자인/SCREEN_TRANSITIONS_20261102.md` | `docs/_archive/3.1 ui hud 디자인/SCREEN_TRANSITIONS_20261102.md` |
| FAIL | missing-path | `docs/_archive/0마스터플랜/session_handoff/web3d.md:3` | `../../4.1맵디자인+설정/WEB3D_TRIAL_20261031.md` | `docs/_archive/4.1맵디자인+설정/WEB3D_TRIAL_20261031.md` |
| FAIL | missing-path | `docs/_archive/0마스터플랜/session_handoff/web3d.md:19` | `../../4.1맵디자인+설정/WEB3D_TRIAL_20261031.md` | `docs/_archive/4.1맵디자인+설정/WEB3D_TRIAL_20261031.md` |
| FAIL | missing-path | `docs/_archive/10ai에셋프롬프트모음/GROK2_INDIVIDUAL_TEST_20260928.md:3` | `VIDEO_CHARACTER_BASES_20260928.md` | `docs/_archive/10ai에셋프롬프트모음/VIDEO_CHARACTER_BASES_20260928.md` |
| FAIL | missing-path | `docs/_archive/10ai에셋프롬프트모음/GROK2_INDIVIDUAL_TEST_20260928.md:5` | `VIDEO_CHARACTER_BASES_20260928.md` | `docs/_archive/10ai에셋프롬프트모음/VIDEO_CHARACTER_BASES_20260928.md` |
| FAIL | missing-path | `docs/_archive/12퍼포먼스·최적화/MAC_RENDERER_OPTIN_TEST_20260910.md:1` | `MAC_DEFAULT_WEBGPU_FPS_20260910.md` | `docs/_archive/12퍼포먼스·최적화/MAC_DEFAULT_WEBGPU_FPS_20260910.md` |
| FAIL | missing-path | `docs/_archive/12퍼포먼스·최적화/MAC_RENDERER_OPTIN_TEST_20260910.md:5` | `../13출시·마케팅/PRODUCTION_TARGET_CORRECTION_20260910.md` | `docs/_archive/13출시·마케팅/PRODUCTION_TARGET_CORRECTION_20260910.md` |
| FAIL | missing-path | `docs/_archive/12퍼포먼스·최적화/MAC_RENDERER_OPTIN_TEST_20260910.md:7` | `MAC_FIXED_RAY_ISOLATION_20260910.md` | `docs/_archive/12퍼포먼스·최적화/MAC_FIXED_RAY_ISOLATION_20260910.md` |
| FAIL | missing-path | `docs/_archive/12퍼포먼스·최적화/WebGL2_인스턴싱_전환계획.md:10` | `../engine/FDG_ENGINE.md` | `docs/_archive/engine/FDG_ENGINE.md` |
| FAIL | missing-path | `docs/_archive/13출시·마케팅/DESKTOP_LATEST_BUILD_20260929.md:65` | `../12퍼포먼스·최적화/PANEL_HIDDEN_DOM_LAG_20260929.md` | `docs/_archive/12퍼포먼스·최적화/PANEL_HIDDEN_DOM_LAG_20260929.md` |
| FAIL | missing-path | `docs/_archive/13출시·마케팅/FRESH_CAPTURE_MANIFEST_20261008.md:3` | `HERO_TRAILER_PRODUCTION_20261008.md` | `docs/_archive/13출시·마케팅/HERO_TRAILER_PRODUCTION_20261008.md` |
| FAIL | missing-path | `docs/_archive/13출시·마케팅/FRESH_CAPTURE_MANIFEST_20261008.md:107` | `INGAME_CAPTURE_STUDIO_20261008.md` | `docs/_archive/13출시·마케팅/INGAME_CAPTURE_STUDIO_20261008.md` |
| FAIL | missing-path | `docs/_archive/13출시·마케팅/GAMEPLAY_TRAILER_20260908_PLAN.md:3` | `../8.1보스디자인바이블/DARK_DRUID_FINALE_PACING_v04.md` | `docs/_archive/8.1보스디자인바이블/DARK_DRUID_FINALE_PACING_v04.md` |
| FAIL | missing-path | `docs/_archive/13출시·마케팅/GAMEPLAY_TRAILER_20260909_PRODUCTION.md:1` | `GAMEPLAY_TRAILER_V2_20260909.md` | `docs/_archive/13출시·마케팅/GAMEPLAY_TRAILER_V2_20260909.md` |
| FAIL | missing-path | `docs/_archive/13출시·마케팅/GAMEPLAY_TRAILER_20260909_PRODUCTION.md:5` | `../8.1보스디자인바이블/DARK_DRUID_FINALE_PACING_v04.md` | `docs/_archive/8.1보스디자인바이블/DARK_DRUID_FINALE_PACING_v04.md` |
| FAIL | missing-path | `docs/_archive/13출시·마케팅/LATEST_WEB_RELEASE_20260910.md:5` | `PRODUCTION_TARGET_CORRECTION_20260910.md` | `docs/_archive/13출시·마케팅/PRODUCTION_TARGET_CORRECTION_20260910.md` |
| FAIL | missing-path | `docs/_archive/13출시·마케팅/LATEST_WEB_RELEASE_20260910.md:11` | `../12퍼포먼스·최적화/MAC_FIXED_RAY_ISOLATION_20260910.md` | `docs/_archive/12퍼포먼스·최적화/MAC_FIXED_RAY_ISOLATION_20260910.md` |
| FAIL | missing-path | `docs/_archive/13출시·마케팅/LATEST_WINDOWS_BUILD_20260929.md:8` | `../5.1임펙트디자인/CHAIN_SLAM_FORWARD_CLEAVE_20260929.md` | `docs/_archive/5.1임펙트디자인/CHAIN_SLAM_FORWARD_CLEAVE_20260929.md` |
| FAIL | missing-path | `docs/_archive/13출시·마케팅/MAC_ENVIRONMENT_HANDOFF_20261001.md:12` | `../0마스터플랜/PROJECT_MANAGEMENT_MASTER.md#173-mac-설치자료-인수-완료-2026-10-01-0640-kst` | `docs/_archive/0마스터플랜/PROJECT_MANAGEMENT_MASTER.md#173-mac-설치자료-인수-완료-2026-10-01-0640-kst` |
| FAIL | missing-path | `docs/_archive/13출시·마케팅/MAC_ENVIRONMENT_HANDOFF_20261001.md:92` | `BUILD_BACKUP_POLICY_20261001.md` | `docs/_archive/13출시·마케팅/BUILD_BACKUP_POLICY_20261001.md` |
| FAIL | missing-path | `docs/_archive/13출시·마케팅/MAC_ENVIRONMENT_HANDOFF_20261001.md:92` | `../0마스터플랜/PROJECT_MANAGEMENT_MASTER.md` | `docs/_archive/0마스터플랜/PROJECT_MANAGEMENT_MASTER.md` |
| FAIL | missing-path | `docs/_archive/13출시·마케팅/MAP_INTRO_20260909.md:10` | `../engine/FDG_ENGINE.md` | `docs/_archive/engine/FDG_ENGINE.md` |
| FAIL | missing-path | `docs/_archive/13출시·마케팅/PC_TRANSFER_READY_20261001.md:3` | `../0마스터플랜/PROJECT_MANAGEMENT_MASTER.md#17-mac-이전-마감과-환경-인수-2026-10-01` | `docs/_archive/0마스터플랜/PROJECT_MANAGEMENT_MASTER.md#17-mac-이전-마감과-환경-인수-2026-10-01` |
| FAIL | missing-path | `docs/_archive/13출시·마케팅/PUBLISHER_DELIVERY_20261001.md:64` | `PUBLISHER_UPDATE_20261003.md` | `docs/_archive/13출시·마케팅/PUBLISHER_UPDATE_20261003.md` |
| FAIL | missing-path | `docs/_archive/13출시·마케팅/PUBLISHER_DELIVERY_RESUME_20260929.md:45` | `../12퍼포먼스·최적화/COMBAT_TEXTURE_WARMUP_20260929.md` | `docs/_archive/12퍼포먼스·최적화/COMBAT_TEXTURE_WARMUP_20260929.md` |
| FAIL | missing-path | `docs/_archive/13출시·마케팅/SKILL_TRAILER_V23_20260909.md:3` | `SKILL_TRAILER_V25_DAMAGE_TEXT_20260910.md` | `docs/_archive/13출시·마케팅/SKILL_TRAILER_V25_DAMAGE_TEXT_20260910.md` |
| FAIL | missing-path | `docs/_archive/13출시·마케팅/STEAM_DASHBOARD_AUDIT_20260909.md:21` | `STEAM_REVIEW_REMEDIATION_20260916.md` | `docs/_archive/13출시·마케팅/STEAM_REVIEW_REMEDIATION_20260916.md` |
| FAIL | missing-path | `docs/_archive/13출시·마케팅/STEAM_DASHBOARD_AUDIT_20260909.md:24` | `STEAM_EARLYACCESS_LOCALIZATION_20260910.md` | `docs/_archive/13출시·마케팅/STEAM_EARLYACCESS_LOCALIZATION_20260910.md` |
| FAIL | missing-path | `docs/_archive/13출시·마케팅/STEAM_INSTALL_REVIEW_20260916.md:161` | `../16번역·로컬라이제이션/STEAM_LANGUAGE_RESUME_20260921.md` | `docs/_archive/16번역·로컬라이제이션/STEAM_LANGUAGE_RESUME_20260921.md` |
| FAIL | missing-path | `docs/_archive/13출시·마케팅/STEAM_INSTALL_REVIEW_20260916.md:166` | `../16번역·로컬라이제이션/TUTORIAL_ENGLISH_20260921.md` | `docs/_archive/16번역·로컬라이제이션/TUTORIAL_ENGLISH_20260921.md` |
| FAIL | missing-path | `docs/_archive/13출시·마케팅/STEAM_LANGUAGE_UPLOAD_20260923.md:63` | `../16번역·로컬라이제이션/STEAM_LANGUAGE_FINISH_20260923.md` | `docs/_archive/16번역·로컬라이제이션/STEAM_LANGUAGE_FINISH_20260923.md` |
| FAIL | missing-path | `docs/_archive/13출시·마케팅/STEAM_LANGUAGE_UPLOAD_20260923.md:63` | `../16번역·로컬라이제이션/FINISH_TRANSLATIONS_20260923.md` | `docs/_archive/16번역·로컬라이제이션/FINISH_TRANSLATIONS_20260923.md` |
| FAIL | missing-path | `docs/_archive/13출시·마케팅/TERMINAL_POPUP_WORKAROUND_20260927.md:26` | `../12퍼포먼스·최적화/EDGE_TERMINAL_FRAME_DIAG_20260929.md` | `docs/_archive/12퍼포먼스·최적화/EDGE_TERMINAL_FRAME_DIAG_20260929.md` |
| FAIL | missing-path | `docs/_archive/13출시·마케팅/VIDEO_EDIT_PLAN_20261008.md:3` | `HERO_TRAILER_PRODUCTION_20261008.md` | `docs/_archive/13출시·마케팅/HERO_TRAILER_PRODUCTION_20261008.md` |
| FAIL | missing-path | `docs/_archive/13출시·마케팅/VIDEO_EDIT_PLAN_20261008.md:5` | `../../tools/marketing_edit_20261008.jsx` | `docs/tools/marketing_edit_20261008.jsx` |
| FAIL | missing-path | `docs/_archive/13출시·마케팅/VIDEO_EDIT_PLAN_20261008.md:5` | `INGAME_CAPTURE_STUDIO_20261008.md` | `docs/_archive/13출시·마케팅/INGAME_CAPTURE_STUDIO_20261008.md` |
| FAIL | missing-path | `docs/_archive/13출시·마케팅/VIDEO_EDIT_PLAN_20261008.md:5` | `EXPOSURE_CHANNELS_20261008.md` | `docs/_archive/13출시·마케팅/EXPOSURE_CHANNELS_20261008.md` |
| FAIL | missing-path | `docs/_archive/13출시·마케팅/VIDEO_EDIT_PLAN_20261008.md:5` | `SOCIAL_VIDEO_COPY_20261008.md` | `docs/_archive/13출시·마케팅/SOCIAL_VIDEO_COPY_20261008.md` |
| FAIL | missing-path | `docs/_archive/13출시·마케팅/VIDEO_EDIT_PLAN_20261008.md:104` | `EXPOSURE_CHANNELS_20261008.md` | `docs/_archive/13출시·마케팅/EXPOSURE_CHANNELS_20261008.md` |
| FAIL | missing-path | `docs/_archive/13출시·마케팅/WEB_RENDERER_REDEPLOY_20260910.md:3` | `PRODUCTION_TARGET_CORRECTION_20260910.md` | `docs/_archive/13출시·마케팅/PRODUCTION_TARGET_CORRECTION_20260910.md` |
| FAIL | missing-path | `docs/_archive/13출시·마케팅/WEB_RENDERER_REDEPLOY_20260910.md:5` | `WEB_DEPLOYMENT_REPAIR_20261002.md` | `docs/_archive/13출시·마케팅/WEB_DEPLOYMENT_REPAIR_20261002.md` |
| FAIL | missing-path | `docs/_archive/13출시·마케팅/WEB_RENDERER_REDEPLOY_20260910.md:16` | `../12퍼포먼스·최적화/PROJECT_TOOLING_20261004.md` | `docs/_archive/12퍼포먼스·최적화/PROJECT_TOOLING_20261004.md` |
| FAIL | missing-path | `docs/_archive/13출시·마케팅/WEB_RENDERER_REDEPLOY_20260910.md:67` | `VERCEL_UPLOAD_FAILURE_20260913.md` | `docs/_archive/13출시·마케팅/VERCEL_UPLOAD_FAILURE_20260913.md` |
| FAIL | missing-path | `docs/_archive/16영문화(i18n)/영문화_진행현황.md:5` | `../13출시·마케팅/STEAM_REVIEW_REMEDIATION_20260916.md` | `docs/_archive/13출시·마케팅/STEAM_REVIEW_REMEDIATION_20260916.md` |
| FAIL | missing-path | `docs/_archive/16영문화(i18n)/영문화_진행현황.md:7` | `../16번역·로컬라이제이션/STEAM_LANGUAGE_SCOPE_20260909.md` | `docs/_archive/16번역·로컬라이제이션/STEAM_LANGUAGE_SCOPE_20260909.md` |
| FAIL | missing-path | `docs/_archive/2_1 스킬관리+합체시스템+자원/자원리젠+소모공식__NFD_0628_2305_백업.md:12` | `../14밸런스+수치테이블/MAGIC_ATTACK_DAMAGE_20260910.md` | `docs/_archive/14밸런스+수치테이블/MAGIC_ATTACK_DAMAGE_20260910.md` |
| FAIL | missing-path | `docs/_archive/2_1 스킬관리+합체시스템+자원/자원리젠+소모공식__NFD_0628_2305_백업.md:332` | `전격이동_사슬기동_공용기동게이지_개편.md` | `docs/_archive/2_1 스킬관리+합체시스템+자원/전격이동_사슬기동_공용기동게이지_개편.md` |
| FAIL | missing-path | `docs/_archive/3.1 ui hud 디자인/SKILL_WINDOW_REDESIGN_PLAN_20261008.md:3` | `SKILL_FORGE_20261010.md` | `docs/_archive/3.1 ui hud 디자인/SKILL_FORGE_20261010.md` |
| FAIL | missing-path | `docs/_archive/3.1 ui hud 디자인/SKILL_WINDOW_REDESIGN_PLAN_20261008.md:7` | `UI_FOUNDATION_20260924.md` | `docs/_archive/3.1 ui hud 디자인/UI_FOUNDATION_20260924.md` |
| FAIL | missing-path | `docs/_archive/3.1 ui hud 디자인/SKILL_WINDOW_REDESIGN_PLAN_20261008.md:7` | `UI_COMPOSITION_20260925.md` | `docs/_archive/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md` |
| FAIL | missing-path | `docs/_archive/3.1 ui hud 디자인/SKILL_WINDOW_REDESIGN_PLAN_20261008.md:8` | `../2_1%20스킬관리+합체시스템+자원/2_1%20스킬관리+합체시스템.md` | `docs/_archive/2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md` |
| FAIL | missing-path | `docs/_archive/4.0케릭터스프라이트 디자인/DRUID_SPRITE_IDLE_CANDIDATE_20261103.md:3` | `DRUID_LOCK_RETOUCH_20261103.md` | `docs/_archive/4.0케릭터스프라이트 디자인/DRUID_LOCK_RETOUCH_20261103.md` |
| FAIL | missing-path | `docs/_archive/4.0케릭터스프라이트 디자인/DRUID_SPRITE_IDLE_CANDIDATE_20261103.md:5` | `DRUID_SPRITES_FULL_CANDIDATE_20261103.md` | `docs/_archive/4.0케릭터스프라이트 디자인/DRUID_SPRITES_FULL_CANDIDATE_20261103.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_1_FINAL_REVIEW_20260916.md:5` | `CH1_FLOOR_UNIFICATION_PASS87_20260929.md` | `docs/_archive/4.1맵디자인+설정/CH1_FLOOR_UNIFICATION_PASS87_20260929.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_1_FINAL_REVIEW_20260916.md:11` | `CH1_OUTER_CONNECTION_PASS85_20260929.md` | `docs/_archive/4.1맵디자인+설정/CH1_OUTER_CONNECTION_PASS85_20260929.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_1_FINAL_REVIEW_20260916.md:17` | `CH1_1_PRODUCTION_FINISH_20260916.md#ch1-1-outer84` | `docs/_archive/4.1맵디자인+설정/CH1_1_PRODUCTION_FINISH_20260916.md#ch1-1-outer84` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_1_FINAL_REVIEW_20260916.md:21` | `CH1_1_PRODUCTION_FINISH_20260916.md#ch1-1-outer83` | `docs/_archive/4.1맵디자인+설정/CH1_1_PRODUCTION_FINISH_20260916.md#ch1-1-outer83` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_1_FINAL_REVIEW_20260916.md:36` | `CH1_1_PRODUCTION_FINISH_20260916.md#ch1-1-outer82` | `docs/_archive/4.1맵디자인+설정/CH1_1_PRODUCTION_FINISH_20260916.md#ch1-1-outer82` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_1_FINAL_REVIEW_20260916.md:65` | `../../captures/ch1_outer81/REPORT.md` | `docs/captures/ch1_outer81/REPORT.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_1_FINAL_REVIEW_20260916.md:65` | `../../captures/ch1_outer81/index.html` | `docs/captures/ch1_outer81/index.html` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_1_FINAL_REVIEW_20260916.md:83` | `../../captures/ch1_outer80/REPORT.md` | `docs/captures/ch1_outer80/REPORT.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_1_FINAL_REVIEW_20260916.md:83` | `../../captures/ch1_outer80/index.html` | `docs/captures/ch1_outer80/index.html` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_1_FINAL_REVIEW_20260916.md:128` | `../../captures/ch1_ground_skin65/REPORT.md` | `docs/captures/ch1_ground_skin65/REPORT.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_1_FINAL_REVIEW_20260916.md:128` | `../../captures/ch1_ground_skin65/index.html` | `docs/captures/ch1_ground_skin65/index.html` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_1_FINAL_REVIEW_20260916.md:128` | `CH1_1_PRODUCTION_FINISH_20260916.md#skin65` | `docs/_archive/4.1맵디자인+설정/CH1_1_PRODUCTION_FINISH_20260916.md#skin65` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_1_FINAL_REVIEW_20260916.md:130` | `CH1_1_DEPTH_RETOUCH_20260917.md` | `docs/_archive/4.1맵디자인+설정/CH1_1_DEPTH_RETOUCH_20260917.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_1_FINAL_REVIEW_20260916.md:142` | `../../captures/ch1_1_production_finish_20260916/FINAL_MAP_INPUT_WALK.mp4` | `docs/captures/ch1_1_production_finish_20260916/FINAL_MAP_INPUT_WALK.mp4` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_1_FINAL_REVIEW_20260916.md:143` | `../../captures/ch1_1_final_review_20260916/NORMAL_PLAY_ATTEMPT.mp4` | `docs/captures/ch1_1_final_review_20260916/NORMAL_PLAY_ATTEMPT.mp4` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_1_FINAL_REVIEW_20260916.md:143` | `../../captures/ch1_1_final_review_20260916/NORMAL_PLAY_SECOND.mp4` | `docs/captures/ch1_1_final_review_20260916/NORMAL_PLAY_SECOND.mp4` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_1_FINAL_REVIEW_20260916.md:144` | `../../captures/ch1_1_final_review_20260916/normal-early-combat.jpg` | `docs/captures/ch1_1_final_review_20260916/normal-early-combat.jpg` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_1_FINAL_REVIEW_20260916.md:144` | `../../captures/ch1_1_final_review_20260916/normal-first-death.jpg` | `docs/captures/ch1_1_final_review_20260916/normal-first-death.jpg` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_1_FINAL_REVIEW_20260916.md:144` | `../../captures/ch1_1_final_review_20260916/normal-second-death.jpg` | `docs/captures/ch1_1_final_review_20260916/normal-second-death.jpg` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_1_FINAL_REVIEW_20260916.md:245` | `CH1_HIDDEN_UNDERLAY_20260929.md` | `docs/_archive/4.1맵디자인+설정/CH1_HIDDEN_UNDERLAY_20260929.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_1_GROUND_STRUCTURE_20260916.md:5` | `CH1_FLOOR_UNIFICATION_PASS87_20260929.md` | `docs/_archive/4.1맵디자인+설정/CH1_FLOOR_UNIFICATION_PASS87_20260929.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_1_GROUND_STRUCTURE_20260916.md:11` | `CH1_OUTER_CONNECTION_PASS85_20260929.md` | `docs/_archive/4.1맵디자인+설정/CH1_OUTER_CONNECTION_PASS85_20260929.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_1_GROUND_STRUCTURE_20260916.md:17` | `CH1_1_PRODUCTION_FINISH_20260916.md#ch1-1-outer84` | `docs/_archive/4.1맵디자인+설정/CH1_1_PRODUCTION_FINISH_20260916.md#ch1-1-outer84` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_1_GROUND_STRUCTURE_20260916.md:21` | `CH1_1_PRODUCTION_FINISH_20260916.md#ch1-1-outer83` | `docs/_archive/4.1맵디자인+설정/CH1_1_PRODUCTION_FINISH_20260916.md#ch1-1-outer83` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_1_GROUND_STRUCTURE_20260916.md:36` | `CH1_1_PRODUCTION_FINISH_20260916.md#ch1-1-outer82` | `docs/_archive/4.1맵디자인+설정/CH1_1_PRODUCTION_FINISH_20260916.md#ch1-1-outer82` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_1_GROUND_STRUCTURE_20260916.md:65` | `../../captures/ch1_outer81/REPORT.md` | `docs/captures/ch1_outer81/REPORT.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_1_GROUND_STRUCTURE_20260916.md:65` | `../../captures/ch1_outer81/index.html` | `docs/captures/ch1_outer81/index.html` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_1_GROUND_STRUCTURE_20260916.md:83` | `../../captures/ch1_outer80/REPORT.md` | `docs/captures/ch1_outer80/REPORT.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_1_GROUND_STRUCTURE_20260916.md:83` | `../../captures/ch1_outer80/index.html` | `docs/captures/ch1_outer80/index.html` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_1_GROUND_STRUCTURE_20260916.md:128` | `../../captures/ch1_ground_skin65/REPORT.md` | `docs/captures/ch1_ground_skin65/REPORT.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_1_GROUND_STRUCTURE_20260916.md:128` | `../../captures/ch1_ground_skin65/index.html` | `docs/captures/ch1_ground_skin65/index.html` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_1_GROUND_STRUCTURE_20260916.md:128` | `CH1_1_PRODUCTION_FINISH_20260916.md#skin65` | `docs/_archive/4.1맵디자인+설정/CH1_1_PRODUCTION_FINISH_20260916.md#skin65` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_1_GROUND_STRUCTURE_20260916.md:130` | `CH1_1_DEPTH_RETOUCH_20260917.md` | `docs/_archive/4.1맵디자인+설정/CH1_1_DEPTH_RETOUCH_20260917.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_1_GROUND_STRUCTURE_20260916.md:295` | `CH1_HIDDEN_UNDERLAY_20260929.md` | `docs/_archive/4.1맵디자인+설정/CH1_HIDDEN_UNDERLAY_20260929.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_LIVING_HELL_V4_20260925.md:3` | `맵디테일.md` | `docs/_archive/4.1맵디자인+설정/맵디테일.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_PAINTED_PHASE1_START_SPIKE.md:3` | `CH1_HILL_DEPTH_PASS48.md` | `docs/_archive/4.1맵디자인+설정/CH1_HILL_DEPTH_PASS48.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_PAINTED_PHASE1_START_SPIKE.md:6` | `CH1_HILL_MATERIAL_PASS47.md` | `docs/_archive/4.1맵디자인+설정/CH1_HILL_MATERIAL_PASS47.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_PAINTED_PHASE1_START_SPIKE.md:9` | `CH1_HILL_CONTOUR_PASS46.md` | `docs/_archive/4.1맵디자인+설정/CH1_HILL_CONTOUR_PASS46.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_PAINTED_PHASE1_START_SPIKE.md:12` | `CH1_HILL_SHADING_PASS45.md` | `docs/_archive/4.1맵디자인+설정/CH1_HILL_SHADING_PASS45.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_PAINTED_PHASE1_START_SPIKE.md:15` | `CH1_HILL_EDGE_BLEND_PASS44.md` | `docs/_archive/4.1맵디자인+설정/CH1_HILL_EDGE_BLEND_PASS44.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_PAINTED_PHASE2_SOUTH_CANARY.md:5` | `CH1_FLOOR_UNIFICATION_PASS87_20260929.md` | `docs/_archive/4.1맵디자인+설정/CH1_FLOOR_UNIFICATION_PASS87_20260929.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_PAINTED_PHASE2_SOUTH_CANARY.md:7` | `CH1_SWAMP_SEEP_PASS60.md#61차-밝은-돌-가장자리-완화` | `docs/_archive/4.1맵디자인+설정/CH1_SWAMP_SEEP_PASS60.md#61차-밝은-돌-가장자리-완화` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_PAINTED_PHASE2_SOUTH_CANARY.md:9` | `CH1_SWAMP_SEEP_PASS60.md` | `docs/_archive/4.1맵디자인+설정/CH1_SWAMP_SEEP_PASS60.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_PAINTED_PHASE2_SOUTH_CANARY.md:11` | `CH1_EAST_TISSUE_PASS59.md` | `docs/_archive/4.1맵디자인+설정/CH1_EAST_TISSUE_PASS59.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_PAINTED_PHASE2_SOUTH_CANARY.md:15` | `CH1_ARCH_CONTACT_PASS53.md` | `docs/_archive/4.1맵디자인+설정/CH1_ARCH_CONTACT_PASS53.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_PAINTED_PHASE2_SOUTH_CANARY.md:18` | `CH1_POOL_APPROACH_PASS52.md` | `docs/_archive/4.1맵디자인+설정/CH1_POOL_APPROACH_PASS52.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_PAINTED_PHASE2_SOUTH_CANARY.md:21` | `CH1_POOL_SEEP_PASS51.md` | `docs/_archive/4.1맵디자인+설정/CH1_POOL_SEEP_PASS51.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_PAINTED_PHASE2_SOUTH_CANARY.md:24` | `CH1_POOL_BURST_PASS50.md` | `docs/_archive/4.1맵디자인+설정/CH1_POOL_BURST_PASS50.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_PAINTED_PHASE2_SOUTH_CANARY.md:27` | `CH1_POOL_CONTACT_PASS49.md` | `docs/_archive/4.1맵디자인+설정/CH1_POOL_CONTACT_PASS49.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_PAINTED_PHASE2_SOUTH_CANARY.md:30` | `CH1_LOW_QUALITY_AUDIT_20260927_PASS38.md` | `docs/_archive/4.1맵디자인+설정/CH1_LOW_QUALITY_AUDIT_20260927_PASS38.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_PAINTED_PHASE2_SOUTH_CANARY.md:32` | `LOW_QUALITY_ASSET_RETIREMENT_20260927.md` | `docs/_archive/4.1맵디자인+설정/LOW_QUALITY_ASSET_RETIREMENT_20260927.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_PAINTED_PHASE2_SOUTH_CANARY.md:199` | `CH1_LIVING_DETAIL_RUNTIME_20260925.md` | `docs/_archive/4.1맵디자인+설정/CH1_LIVING_DETAIL_RUNTIME_20260925.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_PAINTED_PHASE2_SOUTH_CANARY.md:206` | `CH1_LIVING_DETAIL_RUNTIME_20260925.md` | `docs/_archive/4.1맵디자인+설정/CH1_LIVING_DETAIL_RUNTIME_20260925.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_PAINTED_PHASE2_SOUTH_CANARY.md:213` | `CH1_LIVING_DETAIL_RUNTIME_20260925.md` | `docs/_archive/4.1맵디자인+설정/CH1_LIVING_DETAIL_RUNTIME_20260925.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_PAINTED_PHASE2_SOUTH_CANARY.md:220` | `CH1_LIVING_DETAIL_RUNTIME_20260925.md` | `docs/_archive/4.1맵디자인+설정/CH1_LIVING_DETAIL_RUNTIME_20260925.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_PAINTED_PHASE2_SOUTH_CANARY.md:227` | `CH1_LIVING_DETAIL_RUNTIME_20260925.md` | `docs/_archive/4.1맵디자인+설정/CH1_LIVING_DETAIL_RUNTIME_20260925.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_PAINTED_PHASE2_SOUTH_CANARY.md:234` | `CH1_LIVING_DETAIL_RUNTIME_20260925.md` | `docs/_archive/4.1맵디자인+설정/CH1_LIVING_DETAIL_RUNTIME_20260925.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_PAINTED_PHASE2_SOUTH_CANARY.md:243` | `CH1_LIVING_DETAIL_RUNTIME_20260925.md` | `docs/_archive/4.1맵디자인+설정/CH1_LIVING_DETAIL_RUNTIME_20260925.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_PAINTED_PHASE2_SOUTH_CANARY.md:250` | `CH1_LIVING_DETAIL_RUNTIME_20260925.md` | `docs/_archive/4.1맵디자인+설정/CH1_LIVING_DETAIL_RUNTIME_20260925.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_PAINTED_PHASE2_SOUTH_CANARY.md:257` | `CH1_LIVING_DETAIL_RUNTIME_20260925.md` | `docs/_archive/4.1맵디자인+설정/CH1_LIVING_DETAIL_RUNTIME_20260925.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_PAINTED_PHASE2_SOUTH_CANARY.md:264` | `CH1_LIVING_DETAIL_RUNTIME_20260925.md` | `docs/_archive/4.1맵디자인+설정/CH1_LIVING_DETAIL_RUNTIME_20260925.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_PAINTED_PHASE2_SOUTH_CANARY.md:271` | `CH1_LIVING_DETAIL_RUNTIME_20260925.md` | `docs/_archive/4.1맵디자인+설정/CH1_LIVING_DETAIL_RUNTIME_20260925.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_PAINTED_PHASE2_SOUTH_CANARY.md:278` | `CH1_LIVING_DETAIL_RUNTIME_20260925.md` | `docs/_archive/4.1맵디자인+설정/CH1_LIVING_DETAIL_RUNTIME_20260925.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/CH1_PAINTED_PHASE2_SOUTH_CANARY.md:285` | `CH1_LIVING_DETAIL_RUNTIME_20260925.md` | `docs/_archive/4.1맵디자인+설정/CH1_LIVING_DETAIL_RUNTIME_20260925.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/MAP11_NEW_MAP_LOGIC_PLAN_20261021.md:29` | `../engine/FDG_SOURCE_TRACE_BOSS_CH1_20261020.md` | `docs/_archive/engine/FDG_SOURCE_TRACE_BOSS_CH1_20261020.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/MAP11_NEW_MAP_LOGIC_PLAN_20261021.md:68` | `../../CLAUDE.md` | `docs/CLAUDE.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/MAP11_NEW_MAP_LOGIC_PLAN_20261021.md:68` | `../3.1 ui hud 디자인/UI_FOUNDATION_20260924.md` | `docs/_archive/3.1 ui hud 디자인/UI_FOUNDATION_20260924.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/MAP11_NEW_MAP_LOGIC_PLAN_20261021.md:69` | `EXODUSER_MAP_BIBLE_v3 (1).md` | `docs/_archive/4.1맵디자인+설정/EXODUSER_MAP_BIBLE_v3 (1).md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/MAP11_NEW_MAP_LOGIC_PLAN_20261021.md:69` | `맵구성_1장.md` | `docs/_archive/4.1맵디자인+설정/맵구성_1장.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/MAP11_NEW_MAP_LOGIC_PLAN_20261021.md:70` | `맵디테일.md` | `docs/_archive/4.1맵디자인+설정/맵디테일.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/MAP11_NEW_MAP_LOGIC_PLAN_20261021.md:70` | `_MAP_SSOT_INDEX.md` | `docs/_archive/4.1맵디자인+설정/_MAP_SSOT_INDEX.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/MAP11_NEW_MAP_LOGIC_PLAN_20261021.md:71` | `EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md` | `docs/_archive/4.1맵디자인+설정/EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/MAP11_NEW_MAP_LOGIC_PLAN_20261021.md:72` | `맵오브젝트_에셋목록.md` | `docs/_archive/4.1맵디자인+설정/맵오브젝트_에셋목록.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/MAP11_NEW_MAP_LOGIC_PLAN_20261021.md:72` | `MAP_OBJECT_SEEDREAM_PIPELINE_20260930.md` | `docs/_archive/4.1맵디자인+설정/MAP_OBJECT_SEEDREAM_PIPELINE_20260930.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/MAP11_NEW_MAP_LOGIC_PLAN_20261021.md:72` | `LOW_QUALITY_ASSET_RETIREMENT_20260927.md` | `docs/_archive/4.1맵디자인+설정/LOW_QUALITY_ASSET_RETIREMENT_20260927.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/MAP11_NEW_MAP_LOGIC_PLAN_20261021.md:73` | `../1전체그래픽세팅/1전체그래픽세팅_MASTER.md` | `docs/_archive/1전체그래픽세팅/1전체그래픽세팅_MASTER.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/MAP11_NEW_MAP_LOGIC_PLAN_20261021.md:73` | `../1전체그래픽세팅/맵_화면효과_전수조사.md` | `docs/_archive/1전체그래픽세팅/맵_화면효과_전수조사.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/MAP11_TARGET_FRAMES_20261021.md:4` | `MAP_IMPROVEMENT_PROJECT.md` | `docs/_archive/4.1맵디자인+설정/MAP_IMPROVEMENT_PROJECT.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/MAP11_TARGET_FRAMES_20261021.md:10` | `target_frames/ch1_field_corridor_target.webp` | `docs/_archive/4.1맵디자인+설정/target_frames/ch1_field_corridor_target.webp` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/MAP11_TARGET_FRAMES_20261021.md:11` | `target_frames/ch1_boss_arena_target.webp` | `docs/_archive/4.1맵디자인+설정/target_frames/ch1_boss_arena_target.webp` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/MAP_LOOK_GODOT_PASS1_20261020.md:5` | `MAP_IMPROVEMENT_PROJECT.md` | `docs/_archive/4.1맵디자인+설정/MAP_IMPROVEMENT_PROJECT.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/MAP_LOOK_GODOT_PASS1_20261020.md:5` | `../engine/FDG_GODOT_CUSTOM_STRATEGY_20261020.md` | `docs/_archive/engine/FDG_GODOT_CUSTOM_STRATEGY_20261020.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/MAP_LOOK_GODOT_PASS1_20261020.md:31` | `maplook_pass1_before_after.jpg` | `docs/_archive/4.1맵디자인+설정/maplook_pass1_before_after.jpg` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/ROOTWORLD_MASTER_REVIEW_20260924.md:3` | `ROOTWORLD_BLOCKOUT_20260924.md` | `docs/_archive/4.1맵디자인+설정/ROOTWORLD_BLOCKOUT_20260924.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/ROOTWORLD_REFERENCE_FIDELITY_20260924.md:3` | `맵디테일.md` | `docs/_archive/4.1맵디자인+설정/맵디테일.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/ROOTWORLD_REFERENCE_FIDELITY_20260924.md:5` | `CH1_POISON_ROTTEN_FOREST_ART_20260924.md` | `docs/_archive/4.1맵디자인+설정/CH1_POISON_ROTTEN_FOREST_ART_20260924.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/ROOTWORLD_REFERENCE_FIDELITY_20260924.md:7` | `CH1_POISON_ROTTEN_FOREST_ART_20260924.md` | `docs/_archive/4.1맵디자인+설정/CH1_POISON_ROTTEN_FOREST_ART_20260924.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/ROOTWORLD_REFERENCE_FIDELITY_20260924.md:9` | `CH1_POISON_ROTTEN_FOREST_ART_20260924.md` | `docs/_archive/4.1맵디자인+설정/CH1_POISON_ROTTEN_FOREST_ART_20260924.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/SMILEGATE_CH1_SUBMISSION_GOAL_20260924.md:3` | `맵디테일.md` | `docs/_archive/4.1맵디자인+설정/맵디테일.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/SMILEGATE_CH1_SUBMISSION_GOAL_20260924.md:5` | `CH1_POISON_ROTTEN_FOREST_ART_20260924.md` | `docs/_archive/4.1맵디자인+설정/CH1_POISON_ROTTEN_FOREST_ART_20260924.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/SMILEGATE_CH1_SUBMISSION_GOAL_20260924.md:55` | `ROOTWORLD_BLOCKOUT_20260924.md` | `docs/_archive/4.1맵디자인+설정/ROOTWORLD_BLOCKOUT_20260924.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/UNITY_ART_BIBLE_V1_20261026.md:3` | `MAP_ART_BIBLE_v2_20261026.md` | `docs/_archive/4.1맵디자인+설정/MAP_ART_BIBLE_v2_20261026.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/UNITY_ART_BIBLE_V1_20261026.md:5` | `UNITY_MAP_HQ_PRODUCTION_PLAN_20261026.md` | `docs/_archive/4.1맵디자인+설정/UNITY_MAP_HQ_PRODUCTION_PLAN_20261026.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/UNITY_ART_BIBLE_V1_20261026.md:5` | `MAP_IMPROVEMENT_PROJECT.md` | `docs/_archive/4.1맵디자인+설정/MAP_IMPROVEMENT_PROJECT.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/UNITY_ART_BIBLE_V1_20261026.md:5` | `UNITY_MAP_BOARD_20261026.md` | `docs/_archive/4.1맵디자인+설정/UNITY_MAP_BOARD_20261026.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/UNITY_ART_BIBLE_V1_20261026.md:7` | `art_bible_v1/` | `docs/_archive/4.1맵디자인+설정/art_bible_v1` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/map-objects-placeholder-prompt (2).md:10` | `../engine/FDG_ENGINE.md` | `docs/_archive/engine/FDG_ENGINE.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/qa_ch1_master_16x9/QA_REPORT_INGAME.md:168` | `../../12퍼포먼스·최적화/WORLD_ULTRAWIDE_20261031.md` | `docs/_archive/12퍼포먼스·최적화/WORLD_ULTRAWIDE_20261031.md` |
| FAIL | missing-path | `docs/_archive/4.1맵디자인+설정/qa_ch1_master_16x9/작업보고서_CH1_16x9_2026-08-18.md:127` | `../../12퍼포먼스·최적화/WORLD_ULTRAWIDE_20261031.md` | `docs/_archive/12퍼포먼스·최적화/WORLD_ULTRAWIDE_20261031.md` |
| FAIL | missing-path | `docs/_archive/5.0애니메이션파이프라인/ANCESTOR_GROK2_SPRITE_TRIAL_20260928.md:3` | `../3.1 ui hud 디자인/LOBBY_ANCESTOR_ART_20260928.md` | `docs/_archive/3.1 ui hud 디자인/LOBBY_ANCESTOR_ART_20260928.md` |
| FAIL | missing-path | `docs/_archive/5.1임펙트디자인/BOSS_VFX_REPLACEMENT_AUDIT_2026-09-06.md:5` | `CH1_1_BOSS_IMPACT_AUDIT_20260927.md` | `docs/_archive/5.1임펙트디자인/CH1_1_BOSS_IMPACT_AUDIT_20260927.md` |
| FAIL | missing-path | `docs/_archive/5.1임펙트디자인/BOSS_VFX_REPLACEMENT_AUDIT_2026-09-06.md:29` | `../engine/FDG_DARK_DRUID_THORN_VOLLEY_FIRST.md` | `docs/_archive/engine/FDG_DARK_DRUID_THORN_VOLLEY_FIRST.md` |
| FAIL | missing-path | `docs/_archive/5.1임펙트디자인/BOSS_VFX_REPLACEMENT_AUDIT_2026-09-06.md:67` | `../8.0몬스터디자인/PHYSICAL_PROJECTILE_VISIBILITY_20260914.md` | `docs/_archive/8.0몬스터디자인/PHYSICAL_PROJECTILE_VISIBILITY_20260914.md` |
| FAIL | missing-path | `docs/_archive/5.1임펙트디자인/BOSS_VFX_REPLACEMENT_AUDIT_2026-09-06.md:103` | `../8.0몬스터디자인/PHYSICAL_PROJECTILE_VISIBILITY_20260914.md` | `docs/_archive/8.0몬스터디자인/PHYSICAL_PROJECTILE_VISIBILITY_20260914.md` |
| FAIL | missing-path | `docs/_archive/6사운드디자인/PROJECTILE_HIT_CANDIDATES_20260910.md:41` | `MAGIC_HIT_ELEVENLABS_20260910.md` | `docs/_archive/6사운드디자인/MAGIC_HIT_ELEVENLABS_20260910.md` |
| FAIL | missing-path | `docs/_archive/6사운드디자인/PROJECTILE_HIT_CANDIDATES_20260910.md:46` | `BISQO_MAGIC_HIT_20260910.md` | `docs/_archive/6사운드디자인/BISQO_MAGIC_HIT_20260910.md` |
| FAIL | missing-path | `docs/_archive/cinematic/A09_HIGGSFIELD_VIDEO_REVIEW.md:3` | `WORLD_INTRO_INGAME_20260907.md` | `docs/_archive/cinematic/WORLD_INTRO_INGAME_20260907.md` |
| FAIL | missing-path | `docs/_archive/cinematic/A09_HIGGSFIELD_VIDEO_REVIEW.md:3` | `WORLD_INTRO_V13_EXODUS_20260907.md` | `docs/_archive/cinematic/WORLD_INTRO_V13_EXODUS_20260907.md` |
| FAIL | missing-path | `docs/_archive/cinematic/A09_HIGGSFIELD_VIDEO_REVIEW.md:5` | `A09_V3_HIGGSFIELD_VIDEO_REVIEW.md` | `docs/_archive/cinematic/A09_V3_HIGGSFIELD_VIDEO_REVIEW.md` |
| FAIL | missing-path | `docs/_archive/cinematic/A09_V2_HIGGSFIELD_VIDEO_REVIEW.md:3` | `WORLD_INTRO_INGAME_20260907.md` | `docs/_archive/cinematic/WORLD_INTRO_INGAME_20260907.md` |
| FAIL | missing-path | `docs/_archive/cinematic/A09_V2_HIGGSFIELD_VIDEO_REVIEW.md:3` | `WORLD_INTRO_V13_EXODUS_20260907.md` | `docs/_archive/cinematic/WORLD_INTRO_V13_EXODUS_20260907.md` |
| FAIL | missing-path | `docs/_archive/cinematic/AUTO_FINAL_20260907.md:3` | `WORLD_INTRO_INGAME_20260907.md` | `docs/_archive/cinematic/WORLD_INTRO_INGAME_20260907.md` |
| FAIL | missing-path | `docs/_archive/cinematic/AUTO_FINAL_20260907.md:3` | `WORLD_INTRO_V13_EXODUS_20260907.md` | `docs/_archive/cinematic/WORLD_INTRO_V13_EXODUS_20260907.md` |
| FAIL | missing-path | `docs/_archive/cinematic/AUTO_FINAL_20260907.md:7` | `WORLD_INTRO_V2_BRIDGE_20260907.md` | `docs/_archive/cinematic/WORLD_INTRO_V2_BRIDGE_20260907.md` |
| FAIL | missing-path | `docs/_archive/cinematic/B01_HIGGSFIELD_VIDEO_REVIEW.md:3` | `WORLD_INTRO_INGAME_20260907.md` | `docs/_archive/cinematic/WORLD_INTRO_INGAME_20260907.md` |
| FAIL | missing-path | `docs/_archive/cinematic/B01_HIGGSFIELD_VIDEO_REVIEW.md:3` | `WORLD_INTRO_V13_EXODUS_20260907.md` | `docs/_archive/cinematic/WORLD_INTRO_V13_EXODUS_20260907.md` |
| FAIL | missing-path | `docs/_archive/cinematic/B01_HIGGSFIELD_VIDEO_REVIEW.md:5` | `B01_V2_HIGGSFIELD_VIDEO_REVIEW.md` | `docs/_archive/cinematic/B01_V2_HIGGSFIELD_VIDEO_REVIEW.md` |
| FAIL | missing-path | `docs/_archive/cinematic/B03_HIGGSFIELD_VIDEO_REVIEW.md:3` | `WORLD_INTRO_INGAME_20260907.md` | `docs/_archive/cinematic/WORLD_INTRO_INGAME_20260907.md` |
| FAIL | missing-path | `docs/_archive/cinematic/B03_HIGGSFIELD_VIDEO_REVIEW.md:3` | `WORLD_INTRO_V13_EXODUS_20260907.md` | `docs/_archive/cinematic/WORLD_INTRO_V13_EXODUS_20260907.md` |
| FAIL | missing-path | `docs/_archive/cinematic/B03_HIGGSFIELD_VIDEO_REVIEW.md:5` | `B03_V2_HIGGSFIELD_VIDEO_REVIEW.md` | `docs/_archive/cinematic/B03_V2_HIGGSFIELD_VIDEO_REVIEW.md` |
| FAIL | missing-path | `docs/_archive/cinematic/B04_HIGGSFIELD_VIDEO_REVIEW.md:3` | `WORLD_INTRO_INGAME_20260907.md` | `docs/_archive/cinematic/WORLD_INTRO_INGAME_20260907.md` |
| FAIL | missing-path | `docs/_archive/cinematic/B04_HIGGSFIELD_VIDEO_REVIEW.md:3` | `WORLD_INTRO_V13_EXODUS_20260907.md` | `docs/_archive/cinematic/WORLD_INTRO_V13_EXODUS_20260907.md` |
| FAIL | missing-path | `docs/_archive/cinematic/B04_HIGGSFIELD_VIDEO_REVIEW.md:5` | `ENDING_EXODUSER_BATTLE_REVISION_20260907.md` | `docs/_archive/cinematic/ENDING_EXODUSER_BATTLE_REVISION_20260907.md` |
| FAIL | missing-path | `docs/_archive/cinematic/B04_V2_HIGGSFIELD_VIDEO_REVIEW.md:3` | `WORLD_INTRO_INGAME_20260907.md` | `docs/_archive/cinematic/WORLD_INTRO_INGAME_20260907.md` |
| FAIL | missing-path | `docs/_archive/cinematic/B04_V2_HIGGSFIELD_VIDEO_REVIEW.md:3` | `WORLD_INTRO_V13_EXODUS_20260907.md` | `docs/_archive/cinematic/WORLD_INTRO_V13_EXODUS_20260907.md` |
| FAIL | missing-path | `docs/_archive/cinematic/B04_V2_HIGGSFIELD_VIDEO_REVIEW.md:5` | `ENDING_EXODUSER_BATTLE_REVISION_20260907.md` | `docs/_archive/cinematic/ENDING_EXODUSER_BATTLE_REVISION_20260907.md` |
| FAIL | missing-path | `docs/_archive/cinematic/ENDING_DEFIANCE_HIGGSFIELD_REVIEW.md:3` | `WORLD_INTRO_INGAME_20260907.md` | `docs/_archive/cinematic/WORLD_INTRO_INGAME_20260907.md` |
| FAIL | missing-path | `docs/_archive/cinematic/ENDING_DEFIANCE_HIGGSFIELD_REVIEW.md:3` | `WORLD_INTRO_V13_EXODUS_20260907.md` | `docs/_archive/cinematic/WORLD_INTRO_V13_EXODUS_20260907.md` |
| FAIL | missing-path | `docs/_archive/cinematic/ENTER_FORGED_20260906.md:3` | `ENTER_ENGRAVED_20260907.md` | `docs/_archive/cinematic/ENTER_ENGRAVED_20260907.md` |
| FAIL | missing-path | `docs/_archive/cinematic/WARINTRO_BATCH_W09_W11_20260909.md:3` | `WARINTRO_HELL_DRAG_V21_20260910.md` | `docs/_archive/cinematic/WARINTRO_HELL_DRAG_V21_20260910.md` |
| FAIL | missing-path | `docs/_archive/cinematic/WARINTRO_BATCH_W12_W13_W16_20260909.md:3` | `WARINTRO_HELL_DRAG_V21_20260910.md` | `docs/_archive/cinematic/WARINTRO_HELL_DRAG_V21_20260910.md` |
| FAIL | missing-path | `docs/_archive/cinematic/WARINTRO_BATCH_W16_V2_20260909.md:3` | `WARINTRO_HELL_DRAG_V21_20260910.md` | `docs/_archive/cinematic/WARINTRO_HELL_DRAG_V21_20260910.md` |
| FAIL | missing-path | `docs/_archive/cinematic/WARINTRO_EMOTION_REVIEW_V15_20260910.md:3` | `WARINTRO_HELL_DRAG_V21_20260910.md` | `docs/_archive/cinematic/WARINTRO_HELL_DRAG_V21_20260910.md` |
| FAIL | missing-path | `docs/_archive/cinematic/WARINTRO_ENDING_PAUSE_V2_20260909.md:3` | `WARINTRO_HELL_DRAG_V21_20260910.md` | `docs/_archive/cinematic/WARINTRO_HELL_DRAG_V21_20260910.md` |
| FAIL | missing-path | `docs/_archive/cinematic/WARINTRO_ENDING_TIMING_V20_20260910.md:3` | `WARINTRO_HELL_DRAG_V21_20260910.md` | `docs/_archive/cinematic/WARINTRO_HELL_DRAG_V21_20260910.md` |
| FAIL | missing-path | `docs/_archive/cinematic/WARINTRO_ENDING_V6_20260909.md:3` | `WARINTRO_HELL_DRAG_V21_20260910.md` | `docs/_archive/cinematic/WARINTRO_HELL_DRAG_V21_20260910.md` |
| FAIL | missing-path | `docs/_archive/cinematic/WARINTRO_FINAL_CUT_V4_20260909.md:3` | `WARINTRO_HELL_DRAG_V21_20260910.md` | `docs/_archive/cinematic/WARINTRO_HELL_DRAG_V21_20260910.md` |
| FAIL | missing-path | `docs/_archive/cinematic/WARINTRO_FULL_REVIEW_20260909.md:3` | `WARINTRO_HELL_DRAG_V21_20260910.md` | `docs/_archive/cinematic/WARINTRO_HELL_DRAG_V21_20260910.md` |
| FAIL | missing-path | `docs/_archive/cinematic/WARINTRO_FULL_REVIEW_20260909.md:25` | `WARINTRO_BATCH_W06_W14_W15_20260909.md` | `docs/_archive/cinematic/WARINTRO_BATCH_W06_W14_W15_20260909.md` |
| FAIL | missing-path | `docs/_archive/cinematic/WARINTRO_FULL_REVIEW_20260909.md:25` | `WARINTRO_BATCH_W07_W08_20260909.md` | `docs/_archive/cinematic/WARINTRO_BATCH_W07_W08_20260909.md` |
| FAIL | missing-path | `docs/_archive/cinematic/WARINTRO_LAST_SHOT_V9_20260909.md:3` | `WARINTRO_HELL_DRAG_V21_20260910.md` | `docs/_archive/cinematic/WARINTRO_HELL_DRAG_V21_20260910.md` |
| FAIL | missing-path | `docs/_archive/cinematic/WARINTRO_LAST_SHOT_V9_20260909.md:5` | `WARINTRO_CONSEQUENCE_V10_20260909.md` | `docs/_archive/cinematic/WARINTRO_CONSEQUENCE_V10_20260909.md` |
| FAIL | missing-path | `docs/_archive/cinematic/WARINTRO_MEMORY_V13_20260910.md:3` | `WARINTRO_HELL_DRAG_V21_20260910.md` | `docs/_archive/cinematic/WARINTRO_HELL_DRAG_V21_20260910.md` |
| FAIL | missing-path | `docs/_archive/cinematic/WARINTRO_RECUT_V3_20260909.md:3` | `WARINTRO_HELL_DRAG_V21_20260910.md` | `docs/_archive/cinematic/WARINTRO_HELL_DRAG_V21_20260910.md` |
| FAIL | missing-path | `docs/_archive/cinematic/WARINTRO_SHADOW_ONE_V18_20260910.md:3` | `WARINTRO_HELL_DRAG_V21_20260910.md` | `docs/_archive/cinematic/WARINTRO_HELL_DRAG_V21_20260910.md` |
| FAIL | missing-path | `docs/_archive/cinematic/WARINTRO_W02_REMASTER_20260909.md:3` | `WARINTRO_W02_V2_EMPTY_HANDS_20260909.md` | `docs/_archive/cinematic/WARINTRO_W02_V2_EMPTY_HANDS_20260909.md` |
| FAIL | missing-path | `docs/_archive/cinematic/WARINTRO_W02_REMASTER_20260909.md:5` | `WARINTRO_REMASTER_20260909.md` | `docs/_archive/cinematic/WARINTRO_REMASTER_20260909.md` |
| FAIL | missing-path | `docs/_archive/cinematic/WARINTRO_W04_REMASTER_20260909.md:3` | `WARINTRO_W04_V3_DESPAIR_20260909.md` | `docs/_archive/cinematic/WARINTRO_W04_V3_DESPAIR_20260909.md` |
| FAIL | missing-path | `docs/_archive/cinematic/WARINTRO_W04_REMASTER_20260909.md:5` | `WARINTRO_REMASTER_20260909.md` | `docs/_archive/cinematic/WARINTRO_REMASTER_20260909.md` |
| FAIL | missing-path | `docs/_archive/cinematic/WARINTRO_W04_V2_CORRIDOR_20260909.md:3` | `WARINTRO_W04_V3_DESPAIR_20260909.md` | `docs/_archive/cinematic/WARINTRO_W04_V3_DESPAIR_20260909.md` |
| FAIL | missing-path | `docs/_archive/cinematic/WARINTRO_W04_V2_CORRIDOR_20260909.md:5` | `WARINTRO_FAMILY_INSERT_REVIEW_20260909.md` | `docs/_archive/cinematic/WARINTRO_FAMILY_INSERT_REVIEW_20260909.md` |
| FAIL | missing-path | `docs/_archive/cinematic/WORLD_INTRO_FULL_REVIEW_20260906.md:3` | `WORLD_INTRO_INGAME_20260907.md` | `docs/_archive/cinematic/WORLD_INTRO_INGAME_20260907.md` |
| FAIL | missing-path | `docs/_archive/cinematic/WORLD_INTRO_FULL_REVIEW_20260906.md:3` | `WORLD_INTRO_V13_EXODUS_20260907.md` | `docs/_archive/cinematic/WORLD_INTRO_V13_EXODUS_20260907.md` |
| FAIL | missing-path | `docs/_archive/cinematic/WORLD_INTRO_FULL_REVIEW_20260906.md:7` | `WORLD_INTRO_V2_BRIDGE_20260907.md` | `docs/_archive/cinematic/WORLD_INTRO_V2_BRIDGE_20260907.md` |
| FAIL | missing-path | `docs/_archive/cinematic/WORLD_INTRO_FULL_REVIEW_20260906.md:11` | `ENDING_EXODUSER_BATTLE_REVISION_20260907.md` | `docs/_archive/cinematic/ENDING_EXODUSER_BATTLE_REVISION_20260907.md` |
| FAIL | missing-path | `docs/_archive/cinematic/WORLD_INTRO_FULL_REVIEW_20260906.md:34` | `B01_V2_HIGGSFIELD_VIDEO_REVIEW.md` | `docs/_archive/cinematic/B01_V2_HIGGSFIELD_VIDEO_REVIEW.md` |
| FAIL | missing-path | `docs/_archive/cinematic/WORLD_INTRO_FULL_REVIEW_20260906.md:35` | `B02_HIGGSFIELD_VIDEO_REVIEW.md` | `docs/_archive/cinematic/B02_HIGGSFIELD_VIDEO_REVIEW.md` |
| FAIL | missing-path | `docs/_archive/cinematic/WORLD_INTRO_FULL_REVIEW_20260906.md:36` | `B03_V2_HIGGSFIELD_VIDEO_REVIEW.md` | `docs/_archive/cinematic/B03_V2_HIGGSFIELD_VIDEO_REVIEW.md` |
| FAIL | missing-path | `docs/_archive/cinematic/WORLD_INTRO_FULL_REVIEW_20260906.md:93` | `A09_V3_HIGGSFIELD_VIDEO_REVIEW.md` | `docs/_archive/cinematic/A09_V3_HIGGSFIELD_VIDEO_REVIEW.md` |
| FAIL | missing-path | `docs/_archive/cinematic/WORLD_INTRO_V11_LOGO_CALL_20260907.md:3` | `WORLD_INTRO_V13_EXODUS_20260907.md` | `docs/_archive/cinematic/WORLD_INTRO_V13_EXODUS_20260907.md` |
| FAIL | missing-path | `docs/_archive/cinematic/WORLD_INTRO_V3_TITLE_20260907.md:24` | `WORLD_INTRO_INGAME_20260907.md` | `docs/_archive/cinematic/WORLD_INTRO_INGAME_20260907.md` |
| FAIL | missing-path | `docs/_archive/cinematic/WORLD_INTRO_V5_TITLE_20260907.md:3` | `WORLD_INTRO_INGAME_20260907.md` | `docs/_archive/cinematic/WORLD_INTRO_INGAME_20260907.md` |
| FAIL | missing-path | `docs/_archive/cinematic/WORLD_INTRO_V5_TITLE_20260907.md:3` | `WORLD_INTRO_V13_EXODUS_20260907.md` | `docs/_archive/cinematic/WORLD_INTRO_V13_EXODUS_20260907.md` |
| FAIL | missing-path | `docs/_archive/engine/DEMO11_COMPLETION_GAP_20261021.md:5` | `../2_8%20퀵슬롯+물약시스템/2_8%20퀵슬롯+물약시스템.md` | `docs/_archive/2_8 퀵슬롯+물약시스템/2_8 퀵슬롯+물약시스템.md` |
| FAIL | missing-path | `docs/_archive/engine/DEMO11_COMPLETION_GAP_20261021.md:104` | `FDG_SOURCE_TRACE_LOBBY_20261020.md` | `docs/_archive/engine/FDG_SOURCE_TRACE_LOBBY_20261020.md` |
| FAIL | missing-path | `docs/_archive/engine/DEMO11_COMPLETION_GAP_20261021.md:104` | `FDG_SOURCE_TRACE_CH1_ENEMIES_20261020.md` | `docs/_archive/engine/FDG_SOURCE_TRACE_CH1_ENEMIES_20261020.md` |
| FAIL | missing-path | `docs/_archive/engine/DEMO11_COMPLETION_GAP_20261021.md:104` | `FDG_SOURCE_TRACE_ELITES_20261020.md` | `docs/_archive/engine/FDG_SOURCE_TRACE_ELITES_20261020.md` |
| FAIL | missing-path | `docs/_archive/engine/DEMO11_COMPLETION_GAP_20261021.md:104` | `FDG_SOURCE_TRACE_FIELDBOSS_20261020.md` | `docs/_archive/engine/FDG_SOURCE_TRACE_FIELDBOSS_20261020.md` |
| FAIL | missing-path | `docs/_archive/engine/DEMO11_COMPLETION_GAP_20261021.md:104` | `FDG_SOURCE_TRACE_BOSS_CH1_20261020.md` | `docs/_archive/engine/FDG_SOURCE_TRACE_BOSS_CH1_20261020.md` |
| FAIL | missing-path | `docs/_archive/engine/DEMO11_COMPLETION_GAP_20261021.md:104` | `FDG_SOURCE_TRACE_SKILLS_20261020.md` | `docs/_archive/engine/FDG_SOURCE_TRACE_SKILLS_20261020.md` |
| FAIL | missing-path | `docs/_archive/engine/DEMO11_COMPLETION_GAP_20261021.md:104` | `FDG_SOURCE_TRACE_WEAPONS_20261020.md` | `docs/_archive/engine/FDG_SOURCE_TRACE_WEAPONS_20261020.md` |
| FAIL | missing-path | `docs/_archive/engine/DEMO11_COMPLETION_GAP_20261021.md:104` | `FDG_SOURCE_TRACE_ITEMS_20261020.md` | `docs/_archive/engine/FDG_SOURCE_TRACE_ITEMS_20261020.md` |
| FAIL | missing-path | `docs/_archive/engine/DEMO11_COMPLETION_GAP_20261021.md:104` | `FDG_SOURCE_TRACE_INVENTORY_20261020.md` | `docs/_archive/engine/FDG_SOURCE_TRACE_INVENTORY_20261020.md` |
| FAIL | missing-path | `docs/_archive/engine/DEMO11_COMPLETION_GAP_20261021.md:104` | `FDG_SOURCE_TRACE_QUICKSLOT_20261020.md` | `docs/_archive/engine/FDG_SOURCE_TRACE_QUICKSLOT_20261020.md` |
| FAIL | missing-path | `docs/_archive/engine/DEMO11_COMPLETION_GAP_20261021.md:104` | `FDG_SOURCE_TRACE_SAVE_20261020.md` | `docs/_archive/engine/FDG_SOURCE_TRACE_SAVE_20261020.md` |
| FAIL | missing-path | `docs/_archive/engine/DEMO11_COMPLETION_GAP_20261021.md:104` | `FDG_SOURCE_TRACE_META_20261020.md` | `docs/_archive/engine/FDG_SOURCE_TRACE_META_20261020.md` |
| FAIL | missing-path | `docs/_archive/engine/DEMO11_COMPLETION_GAP_20261021.md:104` | `FDG_SOURCE_TRACE_REVIVE_SHIELD_20261020.md` | `docs/_archive/engine/FDG_SOURCE_TRACE_REVIVE_SHIELD_20261020.md` |
| FAIL | missing-path | `docs/_archive/engine/DEMO11_COMPLETION_GAP_20261021.md:104` | `FDG_SOURCE_TRACE_SETTINGS_20261020.md` | `docs/_archive/engine/FDG_SOURCE_TRACE_SETTINGS_20261020.md` |
| FAIL | missing-path | `docs/_archive/engine/DEMO11_COMPLETION_GAP_20261021.md:104` | `FDG_SOURCE_TRACE_SOUND_20261020.md` | `docs/_archive/engine/FDG_SOURCE_TRACE_SOUND_20261020.md` |
| FAIL | missing-path | `docs/_archive/engine/DEMO11_COMPLETION_GAP_20261021.md:104` | `FDG_SOURCE_TRACE_NPC_WORLD_20261020.md` | `docs/_archive/engine/FDG_SOURCE_TRACE_NPC_WORLD_20261020.md` |
| FAIL | missing-path | `docs/_archive/engine/DEMO11_COMPLETION_GAP_20261021.md:285` | `../12퍼포먼스·최적화/CLAUDE_CODE_인수인계_전체작업보고서_2026-08-10.md` | `docs/_archive/12퍼포먼스·최적화/CLAUDE_CODE_인수인계_전체작업보고서_2026-08-10.md` |
| FAIL | missing-path | `docs/_archive/engine/DEMO11_COMPLETION_GAP_20261021.md:285` | `../12퍼포먼스·최적화/COMBAT_TEXTURE_WARMUP_20260929.md` | `docs/_archive/12퍼포먼스·최적화/COMBAT_TEXTURE_WARMUP_20260929.md` |
| FAIL | missing-path | `docs/_archive/engine/DEMO11_SKILL_DISPATCH_20261021.md:29` | `../2_1%20스킬관리+합체시스템+자원/2_1%20스킬관리+합체시스템.md` | `docs/_archive/2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md` |
| FAIL | missing-path | `docs/_archive/engine/DEMO11_STATUS_20261021.md:25` | `../2_8%20퀵슬롯+물약시스템/2_8%20퀵슬롯+물약시스템.md` | `docs/_archive/2_8 퀵슬롯+물약시스템/2_8 퀵슬롯+물약시스템.md` |
| FAIL | missing-path | `docs/_archive/engine/DEMO11_STATUS_20261021.md:26` | `PC_INTERFACE_REQUESTS_DEMO11_20261021.md` | `docs/_archive/engine/PC_INTERFACE_REQUESTS_DEMO11_20261021.md` |
| FAIL | missing-path | `docs/_archive/engine/DEMO11_STATUS_20261021.md:43` | `PC_MOVE_SKILLS_CONTRACT_20261022.md` | `docs/_archive/engine/PC_MOVE_SKILLS_CONTRACT_20261022.md` |
| FAIL | missing-path | `docs/_archive/engine/DEMO11_STATUS_20261021.md:44` | `PC_MOVE_SKILLS_CONTRACT_20261022.md` | `docs/_archive/engine/PC_MOVE_SKILLS_CONTRACT_20261022.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:60` | `FDG_P1_002E_MELEE_HURTE_TRACE_20261019.md` | `docs/_archive/engine/FDG_P1_002E_MELEE_HURTE_TRACE_20261019.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:61` | `FDG_P1_002E_MELEE_HURTE_TRACE_20261019.md` | `docs/_archive/engine/FDG_P1_002E_MELEE_HURTE_TRACE_20261019.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:62` | `FDG_P1_002E_MELEE_HURTE_TRACE_20261019.md` | `docs/_archive/engine/FDG_P1_002E_MELEE_HURTE_TRACE_20261019.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:110` | `../4.1맵디자인+설정/CH1_LIVING_DETAIL_RUNTIME_20260925.md` | `docs/_archive/4.1맵디자인+설정/CH1_LIVING_DETAIL_RUNTIME_20260925.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:145` | `FDG_INTEGRATION_INTERFACE.md` | `docs/_archive/engine/FDG_INTEGRATION_INTERFACE.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:145` | `FDG_PC_MAC_GIT_SYNC_20261016.md` | `docs/_archive/engine/FDG_PC_MAC_GIT_SYNC_20261016.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:177` | `FDG_PC_MAC_GIT_SYNC_20261016.md` | `docs/_archive/engine/FDG_PC_MAC_GIT_SYNC_20261016.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:188` | `FDG_GODOT_NATIVE_FIRST_20261013.md` | `docs/_archive/engine/FDG_GODOT_NATIVE_FIRST_20261013.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:199` | `FDG_GODOT_NATIVE_FIRST_20261013.md` | `docs/_archive/engine/FDG_GODOT_NATIVE_FIRST_20261013.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:211` | `FDG_GODOT_NATIVE_FIRST_20261013.md` | `docs/_archive/engine/FDG_GODOT_NATIVE_FIRST_20261013.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:222` | `FDG_GODOT_NATIVE_FIRST_20261013.md` | `docs/_archive/engine/FDG_GODOT_NATIVE_FIRST_20261013.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:252` | `FDG_GODOT_NATIVE_FIRST_20261013.md#perspective-ground-coverage-20261015` | `docs/_archive/engine/FDG_GODOT_NATIVE_FIRST_20261013.md#perspective-ground-coverage-20261015` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:256` | `FDG_GODOT_NATIVE_FIRST_20261013.md#e-control-partial-20261015` | `docs/_archive/engine/FDG_GODOT_NATIVE_FIRST_20261013.md#e-control-partial-20261015` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:260` | `FDG_GODOT_NATIVE_FIRST_20261013.md#q-dark-reflection-20261015` | `docs/_archive/engine/FDG_GODOT_NATIVE_FIRST_20261013.md#q-dark-reflection-20261015` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:266` | `FDG_GODOT_NATIVE_FIRST_20261013.md#실제-q-홀드해제-제어와-검토본-범위--2026-10-15` | `docs/_archive/engine/FDG_GODOT_NATIVE_FIRST_20261013.md#실제-q-홀드해제-제어와-검토본-범위--2026-10-15` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:268` | `FDG_GODOT_NATIVE_FIRST_20261013.md#native-명시-기본-입력과-새-검토-실행본--2026-10-15` | `docs/_archive/engine/FDG_GODOT_NATIVE_FIRST_20261013.md#native-명시-기본-입력과-새-검토-실행본--2026-10-15` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:276` | `FDG_GODOT_NATIVE_FIRST_20261013.md#실제-현재-공격-parameter-소비--2026-10-15` | `docs/_archive/engine/FDG_GODOT_NATIVE_FIRST_20261013.md#실제-현재-공격-parameter-소비--2026-10-15` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:284` | `FDG_GODOT_NATIVE_FIRST_20261013.md#native-명시-캐릭터-선택--2026-10-15-현행-계약` | `docs/_archive/engine/FDG_GODOT_NATIVE_FIRST_20261013.md#native-명시-캐릭터-선택--2026-10-15-현행-계약` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:444` | `FDG_ENGINE.md` | `docs/_archive/engine/FDG_ENGINE.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:455` | `FDG_ENGINE.md` | `docs/_archive/engine/FDG_ENGINE.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:468` | `FDG_ENGINE.md` | `docs/_archive/engine/FDG_ENGINE.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:718` | `FDG_GODOT_TYPE7_TELEPORT_20261013.md` | `docs/_archive/engine/FDG_GODOT_TYPE7_TELEPORT_20261013.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:734` | `FDG_GODOT_M30_EPICENTER_20261013.md` | `docs/_archive/engine/FDG_GODOT_M30_EPICENTER_20261013.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:742` | `FDG_GODOT_ETYPE7_PHYSICAL_FLESH_CRAWLER_20261013.md` | `docs/_archive/engine/FDG_GODOT_ETYPE7_PHYSICAL_FLESH_CRAWLER_20261013.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:771` | `FDG_GODOT_ETYPE1_LIGHTNING_HIVE_BLOATER_20261013.md` | `docs/_archive/engine/FDG_GODOT_ETYPE1_LIGHTNING_HIVE_BLOATER_20261013.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:794` | `FDG_GODOT_WEB_PLAYABLE_FIRST_20261013.md` | `docs/_archive/engine/FDG_GODOT_WEB_PLAYABLE_FIRST_20261013.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:810` | `FDG_GODOT_WINDOWS_NATIVE_PREVIEW_20261013.md` | `docs/_archive/engine/FDG_GODOT_WINDOWS_NATIVE_PREVIEW_20261013.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:826` | `FDG_GODOT_ETYPE4_ICE_SOUL_FLAME_20261013.md` | `docs/_archive/engine/FDG_GODOT_ETYPE4_ICE_SOUL_FLAME_20261013.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:847` | `FDG_GODOT_ETYPE4_PHYSICAL_SPINE_BEAST_20261013.md` | `docs/_archive/engine/FDG_GODOT_ETYPE4_PHYSICAL_SPINE_BEAST_20261013.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:856` | `FDG_GODOT_ETYPE0_PHYSICAL_FLESH_CRAWLER_20261013.md` | `docs/_archive/engine/FDG_GODOT_ETYPE0_PHYSICAL_FLESH_CRAWLER_20261013.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:856` | `FDG_GODOT_ETYPE0_PHYSICAL_BURN_20261013.md` | `docs/_archive/engine/FDG_GODOT_ETYPE0_PHYSICAL_BURN_20261013.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:868` | `FDG_GODOT_ETYPE0_PHYSICAL_BURN_20261013.md` | `docs/_archive/engine/FDG_GODOT_ETYPE0_PHYSICAL_BURN_20261013.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:886` | `FDG_GODOT_ETYPE0_PHYSICAL_FLESH_CRAWLER_20261013.md` | `docs/_archive/engine/FDG_GODOT_ETYPE0_PHYSICAL_FLESH_CRAWLER_20261013.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:901` | `FDG_GODOT_ENCOUNTER_FACTORY_20261013.md` | `docs/_archive/engine/FDG_GODOT_ENCOUNTER_FACTORY_20261013.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:913` | `FDG_GODOT_NATIVE_FIRST_20261013.md` | `docs/_archive/engine/FDG_GODOT_NATIVE_FIRST_20261013.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:926` | `FDG_NATIVE_ENCOUNTER_PLACEMENT_20261012.md` | `docs/_archive/engine/FDG_NATIVE_ENCOUNTER_PLACEMENT_20261012.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:939` | `FDG_MAP_PACK_EAST_VISIBILITY_20261012.md` | `docs/_archive/engine/FDG_MAP_PACK_EAST_VISIBILITY_20261012.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:951` | `FDG_NATIVE_PERSPECTIVE_20261012.md` | `docs/_archive/engine/FDG_NATIVE_PERSPECTIVE_20261012.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:951` | `FDG_RUINED_FOREST_PLAYABLE_20261012.md` | `docs/_archive/engine/FDG_RUINED_FOREST_PLAYABLE_20261012.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:954` | `FDG_WORLD_CAMERA_20261012.md` | `docs/_archive/engine/FDG_WORLD_CAMERA_20261012.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:966` | `FDG_CHARACTER_ASSETS.md#dark-druid-source-correction-20261012` | `docs/_archive/engine/FDG_CHARACTER_ASSETS.md#dark-druid-source-correction-20261012` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:968` | `FDG_SPRITE_PREVIEW_20261011.md` | `docs/_archive/engine/FDG_SPRITE_PREVIEW_20261011.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:970` | `FDG_PRODUCTION_WORKSPACE_20261011.md` | `docs/_archive/engine/FDG_PRODUCTION_WORKSPACE_20261011.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:988` | `FDG_OPTIMIZATION_STUDIO_20261010.md` | `docs/_archive/engine/FDG_OPTIMIZATION_STUDIO_20261010.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:990` | `FDG_SOURCE_VISUAL_PREVIEW.md` | `docs/_archive/engine/FDG_SOURCE_VISUAL_PREVIEW.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:990` | `FDG_SOURCE_SCENE_EXECUTION.md` | `docs/_archive/engine/FDG_SOURCE_SCENE_EXECUTION.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:997` | `FDG_SOURCE_VISUAL_PREVIEW.md` | `docs/_archive/engine/FDG_SOURCE_VISUAL_PREVIEW.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:1010` | `FDG_SOURCE_VISUAL_PREVIEW.md` | `docs/_archive/engine/FDG_SOURCE_VISUAL_PREVIEW.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:1041` | `FDG_SOURCE_VISUAL_PREVIEW.md` | `docs/_archive/engine/FDG_SOURCE_VISUAL_PREVIEW.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:1100` | `FDG_SOURCE_VISUAL_PREVIEW.md` | `docs/_archive/engine/FDG_SOURCE_VISUAL_PREVIEW.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:1123` | `FDG_HELL_ABERRANT_MOTION_20261011.md` | `docs/_archive/engine/FDG_HELL_ABERRANT_MOTION_20261011.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:1123` | `FDG_RIG_TEXTURE_RUNTIME_20261011.md` | `docs/_archive/engine/FDG_RIG_TEXTURE_RUNTIME_20261011.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:1138` | `FDG_TAIL_CONTINUITY_20261011.md` | `docs/_archive/engine/FDG_TAIL_CONTINUITY_20261011.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:1150` | `FDG_TAIL_SEQUENCE_20261011.md` | `docs/_archive/engine/FDG_TAIL_SEQUENCE_20261011.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:1166` | `FDG_TAIL_READABILITY_20261011.md` | `docs/_archive/engine/FDG_TAIL_READABILITY_20261011.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:1188` | `FDG_TAIL_IDLE_TRANSITION_20261011.md` | `docs/_archive/engine/FDG_TAIL_IDLE_TRANSITION_20261011.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:1207` | `FDG_TORSO_DEPTH_20261011.md` | `docs/_archive/engine/FDG_TORSO_DEPTH_20261011.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:1232` | `FDG_RIG_PROJECT.md` | `docs/_archive/engine/FDG_RIG_PROJECT.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:1256` | `FDG_TORSO_SIDE_FINISH_20261011.md` | `docs/_archive/engine/FDG_TORSO_SIDE_FINISH_20261011.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:1274` | `FDG_RIG_PROJECT.md` | `docs/_archive/engine/FDG_RIG_PROJECT.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:1290` | `FDG_DARK_DRUID_BODY_20261011.md` | `docs/_archive/engine/FDG_DARK_DRUID_BODY_20261011.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:1290` | `FDG_RIG_PROJECT.md` | `docs/_archive/engine/FDG_RIG_PROJECT.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:1304` | `FDG_DARK_DRUID_STAFF_READABILITY_20261011.md` | `docs/_archive/engine/FDG_DARK_DRUID_STAFF_READABILITY_20261011.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:1304` | `FDG_RIG_PROJECT.md` | `docs/_archive/engine/FDG_RIG_PROJECT.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:1320` | `FDG_DARK_DRUID_SCREEN_QUALITY_20261012.md` | `docs/_archive/engine/FDG_DARK_DRUID_SCREEN_QUALITY_20261012.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:1341` | `FDG_DARK_DRUID_SMOOTH_MOTION_20261012.md` | `docs/_archive/engine/FDG_DARK_DRUID_SMOOTH_MOTION_20261012.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:1347` | `../5.1임펙트디자인/POE2_REFERENCE_STUDY.md` | `docs/_archive/5.1임펙트디자인/POE2_REFERENCE_STUDY.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:1347` | `FDG_NATIVE_MAP_PACK_20261012.md` | `docs/_archive/engine/FDG_NATIVE_MAP_PACK_20261012.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:1372` | `FDG_NATIVE_MAP_PACK_20261012.md` | `docs/_archive/engine/FDG_NATIVE_MAP_PACK_20261012.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GAME_DEVELOPMENT_PLAN.md:1381` | `FDG_MAP_PACK_EAST_VISIBILITY_20261012.md` | `docs/_archive/engine/FDG_MAP_PACK_EAST_VISIBILITY_20261012.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GODOT_NATIVE_MAIN_INTRO_CURTAIN_TEST_20261014.md:51` | `FDG_GODOT_PORT_CHARACTER_CLIP_FIRST_20261013.md` | `docs/_archive/engine/FDG_GODOT_PORT_CHARACTER_CLIP_FIRST_20261013.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GODOT_NATIVE_MAIN_SPRITE_READINESS_FIRST_20261014.md:1` | `FDG_GODOT_NATIVE_FIRST_20261013.md#native-명시-캐릭터-선택--2026-10-15-현행-계약` | `docs/_archive/engine/FDG_GODOT_NATIVE_FIRST_20261013.md#native-명시-캐릭터-선택--2026-10-15-현행-계약` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GODOT_NATIVE_MAIN_SPRITE_STARTUP_LOSS_TEST_20261014.md:49` | `FDG_GODOT_PORT_NATIVE_SPRITE_RESOURCE_READINESS_FIRST_20261014.md` | `docs/_archive/engine/FDG_GODOT_PORT_NATIVE_SPRITE_RESOURCE_READINESS_FIRST_20261014.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GODOT_NATIVE_PLAYER_SPRITE_EXPECTATION_20261014.md:1` | `FDG_GODOT_NATIVE_FIRST_20261013.md#native-명시-캐릭터-선택--2026-10-15-현행-계약` | `docs/_archive/engine/FDG_GODOT_NATIVE_FIRST_20261013.md#native-명시-캐릭터-선택--2026-10-15-현행-계약` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GODOT_NATIVE_PLAYER_SPRITE_EXPECTATION_20261014.md:63` | `FDG_GODOT_PORT_NATIVE_SPRITE_RESOURCE_READINESS_FIRST_20261014.md` | `docs/_archive/engine/FDG_GODOT_PORT_NATIVE_SPRITE_RESOURCE_READINESS_FIRST_20261014.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GODOT_NATIVE_PLAYER_SPRITE_EXPECTATION_20261014.md:63` | `FDG_CHARACTER_QUALITY.md` | `docs/_archive/engine/FDG_CHARACTER_QUALITY.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GODOT_PORT_COMBAT_QE_FIRST_20261013.md:4` | `FDG_PC_MAC_GIT_SYNC_20261016.md` | `docs/_archive/engine/FDG_PC_MAC_GIT_SYNC_20261016.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GODOT_PORT_COMBAT_QE_FIRST_20261013.md:34` | `FDG_GODOT_NATIVE_FIRST_20261013.md#e-control-partial-20261015` | `docs/_archive/engine/FDG_GODOT_NATIVE_FIRST_20261013.md#e-control-partial-20261015` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GODOT_PORT_COMBAT_QE_FIRST_20261013.md:38` | `FDG_GODOT_NATIVE_FIRST_20261013.md#q-dark-reflection-20261015` | `docs/_archive/engine/FDG_GODOT_NATIVE_FIRST_20261013.md#q-dark-reflection-20261015` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GODOT_PORT_COMBAT_REFERENCE_SOURCE_FIRST_20261013.md:1` | `FDG_GODOT_NATIVE_FIRST_20261013.md#실제-현재-공격-parameter-소비--2026-10-15` | `docs/_archive/engine/FDG_GODOT_NATIVE_FIRST_20261013.md#실제-현재-공격-parameter-소비--2026-10-15` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GODOT_PORT_COMBAT_STAT_FORMULA_FIRST_20261013.md:9` | `FDG_GODOT_NATIVE_FIRST_20261013.md#실제-현재-공격-parameter-소비--2026-10-15` | `docs/_archive/engine/FDG_GODOT_NATIVE_FIRST_20261013.md#실제-현재-공격-parameter-소비--2026-10-15` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GODOT_PORT_HOLY_DOME_PRESENCE_SOURCE_FIRST_20261013.md:30` | `../2_1%20스킬관리+합체시스템+자원/자원리젠+소모공식.md` | `docs/_archive/2_1 스킬관리+합체시스템+자원/자원리젠+소모공식.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GODOT_PORT_MAP_RESOURCE_FIRST_20261013.md:4` | `FDG_PC_MAC_GIT_SYNC_20261016.md` | `docs/_archive/engine/FDG_PC_MAC_GIT_SYNC_20261016.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GODOT_PORT_MAP_RESOURCE_FIRST_20261013.md:15` | `FDG_GODOT_NATIVE_FIRST_20261013.md` | `docs/_archive/engine/FDG_GODOT_NATIVE_FIRST_20261013.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GODOT_PORT_MAP_RESOURCE_FIRST_20261013.md:91` | `FDG_ENGINE.md` | `docs/_archive/engine/FDG_ENGINE.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GODOT_PORT_REGENERATION_STAT_SOURCE_FIRST_20261013.md:28` | `../2_1%20스킬관리+합체시스템+자원/자원리젠+소모공식.md` | `docs/_archive/2_1 스킬관리+합체시스템+자원/자원리젠+소모공식.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GODOT_PORT_RESOURCE_REGENERATION_SOURCE_FIRST_20261013.md:28` | `../2_1%20스킬관리+합체시스템+자원/자원리젠+소모공식.md` | `docs/_archive/2_1 스킬관리+합체시스템+자원/자원리젠+소모공식.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GODOT_PORT_SOURCE_OBJECT_SPRITE_WAIT_OWNER_FIRST_20261014.md:30` | `FDG_ENGINE.md` | `docs/_archive/engine/FDG_ENGINE.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GODOT_PORT_SOURCE_OBJECT_SPRITE_WAIT_OWNER_FIRST_20261014.md:41` | `FDG_ENGINE.md` | `docs/_archive/engine/FDG_ENGINE.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GODOT_PORT_SOURCE_OBJECT_SPRITE_WAIT_OWNER_FIRST_20261014.md:54` | `FDG_ENGINE.md` | `docs/_archive/engine/FDG_ENGINE.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GODOT_PORT_SOURCE_OBJECT_SPRITE_WAIT_OWNER_FIRST_20261014.md:62` | `FDG_ENGINE.md` | `docs/_archive/engine/FDG_ENGINE.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GODOT_PORT_SOURCE_OBJECT_SPRITE_WAIT_OWNER_FIRST_20261014.md:70` | `FDG_ENGINE.md` | `docs/_archive/engine/FDG_ENGINE.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GODOT_PORT_SOURCE_POST_STAGE_OWNER_FIRST_20261014.md:26` | `FDG_ENGINE.md` | `docs/_archive/engine/FDG_ENGINE.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GODOT_PORT_SOURCE_POST_STAGE_OWNER_FIRST_20261014.md:36` | `FDG_ENGINE.md` | `docs/_archive/engine/FDG_ENGINE.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GODOT_PORT_SOURCE_POST_STAGE_OWNER_FIRST_20261014.md:44` | `FDG_ENGINE.md` | `docs/_archive/engine/FDG_ENGINE.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GODOT_PORT_SOURCE_PREPARE_START_MAP_VIEW_OWNER_FIRST_20261014.md:7` | `FDG_ENGINE.md` | `docs/_archive/engine/FDG_ENGINE.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GODOT_PORT_SOURCE_PREPARE_START_MAP_VIEW_OWNER_FIRST_20261014.md:15` | `FDG_ENGINE.md` | `docs/_archive/engine/FDG_ENGINE.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GODOT_PORT_STATUS.md:3` | `UNITY_PORT_20261024.md` | `docs/_archive/engine/UNITY_PORT_20261024.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GODOT_PORT_STATUS.md:5` | `UNITY_PORT_20261024.md#저장-정책` | `docs/_archive/engine/UNITY_PORT_20261024.md#저장-정책` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GODOT_PORT_STATUS.md:7` | `UNITY_PORT_20261024.md` | `docs/_archive/engine/UNITY_PORT_20261024.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GODOT_PORT_STATUS.md:176` | `FDG_INTEGRATION_INTERFACE.md` | `docs/_archive/engine/FDG_INTEGRATION_INTERFACE.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GODOT_PORT_STATUS.md:179` | `FDG_PC_MAC_GIT_SYNC_20261016.md` | `docs/_archive/engine/FDG_PC_MAC_GIT_SYNC_20261016.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GODOT_QE_BINDING_20261014.md:13` | `FDG_GODOT_NATIVE_FIRST_20261013.md#e-control-partial-20261015` | `docs/_archive/engine/FDG_GODOT_NATIVE_FIRST_20261013.md#e-control-partial-20261015` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GODOT_QE_BINDING_20261014.md:17` | `FDG_GODOT_NATIVE_FIRST_20261013.md#q-dark-reflection-20261015` | `docs/_archive/engine/FDG_GODOT_NATIVE_FIRST_20261013.md#q-dark-reflection-20261015` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GODOT_QE_BINDING_20261014.md:23` | `FDG_GODOT_NATIVE_FIRST_20261013.md#실제-q-홀드해제-제어와-검토본-범위--2026-10-15` | `docs/_archive/engine/FDG_GODOT_NATIVE_FIRST_20261013.md#실제-q-홀드해제-제어와-검토본-범위--2026-10-15` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GODOT_QE_BINDING_20261014.md:25` | `FDG_GODOT_NATIVE_FIRST_20261013.md#native-명시-기본-입력과-새-검토-실행본--2026-10-15` | `docs/_archive/engine/FDG_GODOT_NATIVE_FIRST_20261013.md#native-명시-기본-입력과-새-검토-실행본--2026-10-15` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GODOT_SOURCE_NEW_RUN_STATE_20261014.md:26` | `FDG_GODOT_NATIVE_FIRST_20261013.md#e-control-partial-20261015` | `docs/_archive/engine/FDG_GODOT_NATIVE_FIRST_20261013.md#e-control-partial-20261015` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GODOT_SOURCE_NEW_RUN_STATE_20261014.md:30` | `FDG_GODOT_NATIVE_FIRST_20261013.md#q-dark-reflection-20261015` | `docs/_archive/engine/FDG_GODOT_NATIVE_FIRST_20261013.md#q-dark-reflection-20261015` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GODOT_SOURCE_NEW_RUN_STATE_20261014.md:36` | `FDG_GODOT_NATIVE_FIRST_20261013.md#실제-q-홀드해제-제어와-검토본-범위--2026-10-15` | `docs/_archive/engine/FDG_GODOT_NATIVE_FIRST_20261013.md#실제-q-홀드해제-제어와-검토본-범위--2026-10-15` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GODOT_SOURCE_PLAYER_REGEN_PHASE_20261014.md:13` | `FDG_GODOT_NATIVE_FIRST_20261013.md#e-control-partial-20261015` | `docs/_archive/engine/FDG_GODOT_NATIVE_FIRST_20261013.md#e-control-partial-20261015` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GODOT_SOURCE_PLAYER_REGEN_PHASE_20261014.md:17` | `FDG_GODOT_NATIVE_FIRST_20261013.md#q-dark-reflection-20261015` | `docs/_archive/engine/FDG_GODOT_NATIVE_FIRST_20261013.md#q-dark-reflection-20261015` |
| FAIL | missing-path | `docs/_archive/engine/FDG_GODOT_SOURCE_PLAYER_REGEN_PHASE_20261014.md:23` | `FDG_GODOT_NATIVE_FIRST_20261013.md#실제-q-홀드해제-제어와-검토본-범위--2026-10-15` | `docs/_archive/engine/FDG_GODOT_NATIVE_FIRST_20261013.md#실제-q-홀드해제-제어와-검토본-범위--2026-10-15` |
| FAIL | missing-path | `docs/_archive/engine/FDG_NATIVE_NORMAL_ENEMY_PLAY_TIME_MAIN_SYNC_20261017.md:18` | `FDG_PC_MAC_GIT_SYNC_20261016.md` | `docs/_archive/engine/FDG_PC_MAC_GIT_SYNC_20261016.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_P2_001C_KILL_REWARDS_20261020.md:28` | `32013` | `docs/_archive/engine/32013` |
| FAIL | missing-path | `docs/_archive/engine/FDG_P2_004B_PET_DIALOGUE_20261020.md:5` | `orders/reports/P2-004B_CANDIDATE.patch` | `docs/_archive/engine/orders/reports/P2-004B_CANDIDATE.patch` |
| FAIL | missing-path | `docs/_archive/engine/FDG_P2_008A_CH1_ENEMIES_20261020.md:57` | `orders/reports/P2-008a_ASSETS.json` | `docs/_archive/engine/orders/reports/P2-008a_ASSETS.json` |
| FAIL | missing-path | `docs/_archive/engine/FDG_P3_002_SPAWN_HOLES_20261020.md:4` | `../2_6%20소환굴+리프트시스템/2_6%20소환굴+리프트시스템.md` | `docs/_archive/2_6 소환굴+리프트시스템/2_6 소환굴+리프트시스템.md` |
| FAIL | missing-path | `docs/_archive/engine/FDG_P3_002_SPAWN_HOLES_20261020.md:5` | `evidence/p3-002/` | `docs/_archive/engine/evidence/p3-002` |
| FAIL | missing-path | `docs/_archive/engine/FDG_P3_002_SPAWN_HOLES_20261020.md:83` | `evidence/p3-002/web_mken_rng_summary.json` | `docs/_archive/engine/evidence/p3-002/web_mken_rng_summary.json` |
| FAIL | missing-path | `docs/_archive/engine/FDG_P3_002_SPAWN_HOLES_20261020.md:146` | `evidence/p3-002/cmp_hole_web_left_godot_right_2x.png` | `docs/_archive/engine/evidence/p3-002/cmp_hole_web_left_godot_right_2x.png` |
| FAIL | missing-path | `docs/_archive/engine/FDG_P3_002_SPAWN_HOLES_20261020.md:146` | `evidence/p3-002/godot_minimap_holes_3x.png` | `docs/_archive/engine/evidence/p3-002/godot_minimap_holes_3x.png` |
| FAIL | missing-path | `docs/_archive/engine/INTEG5_SOURCE_SNAPSHOT_20261021.md:40` | `orders/reports/pc-hud-stats_REPORT.md#9-5-스냅샷-갱신이-깨뜨리는-mac-소유-테스트-main-병합-전-조치-필요` | `docs/_archive/engine/orders/reports/pc-hud-stats_REPORT.md#9-5-스냅샷-갱신이-깨뜨리는-mac-소유-테스트-main-병합-전-조치-필요` |
| FAIL | missing-path | `docs/_archive/engine/PARITY_BOSS_01_20261022.md:17` | `100,160,255,.06` | `docs/_archive/engine/100,160,255,.06` |
| FAIL | missing-path | `docs/_archive/engine/PARITY_MAP_04_20261022.md:39` | `parity_refs/map04/north_gate_hud_1x.png` | `docs/_archive/engine/parity_refs/map04/north_gate_hud_1x.png` |
| FAIL | missing-path | `docs/_archive/engine/PARITY_MAP_04_20261022.md:39` | `parity_refs/map04/hell_gate_hud_1x.png` | `docs/_archive/engine/parity_refs/map04/hell_gate_hud_1x.png` |
| FAIL | missing-path | `docs/_archive/engine/PARITY_MAP_04_20261022.md:39` | `parity_refs/map04/minimap_1x.png` | `docs/_archive/engine/parity_refs/map04/minimap_1x.png` |
| FAIL | missing-path | `docs/_archive/engine/PARITY_MAP_04_20261022.md:39` | `parity_refs/map04/corpse_tree_ghost_1x.png` | `docs/_archive/engine/parity_refs/map04/corpse_tree_ghost_1x.png` |
| FAIL | missing-path | `docs/_archive/engine/PARITY_MAP_04_20261022.md:39` | `parity_refs/map04/boss_slam_body_1x.png` | `docs/_archive/engine/parity_refs/map04/boss_slam_body_1x.png` |
| FAIL | missing-path | `docs/_archive/engine/PC_INPUT_PARITY_20261022.md:50` | `BOOT01_MULTI_FRAME_STARTUP_20261022.md` | `docs/_archive/engine/BOOT01_MULTI_FRAME_STARTUP_20261022.md` |
| FAIL | missing-path | `docs/_archive/engine/PC_INPUT_PARITY_20261022.md:69` | `BOOT01_MULTI_FRAME_STARTUP_20261022.md` | `docs/_archive/engine/BOOT01_MULTI_FRAME_STARTUP_20261022.md` |
| FAIL | missing-path | `docs/_archive/engine/SRCMAP_01_SOURCE_MAP_20261022.md:222` | `EVIDENCE.md` | `docs/_archive/engine/EVIDENCE.md` |
| FAIL | missing-path | `docs/_archive/engine/UNITY_HUD_DOCK_20261024.md:3` | `UNITY_UI_ULTRAWIDE_20261031.md` | `docs/_archive/engine/UNITY_UI_ULTRAWIDE_20261031.md` |
| FAIL | missing-path | `docs/_archive/engine/UNITY_HUD_DOCK_20261024.md:5` | `UNITY_UI_COMPOSITION_20261024.md` | `docs/_archive/engine/UNITY_UI_COMPOSITION_20261024.md` |
| FAIL | missing-path | `docs/_archive/engine/UNITY_HUD_DOCK_20261024.md:70` | `UNITY_MAC_SKILL_UI_20261025.md` | `docs/_archive/engine/UNITY_MAC_SKILL_UI_20261025.md` |
| FAIL | missing-path | `docs/_archive/engine/UNITY_HUD_DOCK_20261024.md:75` | `UNITY_UI_ULTRAWIDE_20261031.md` | `docs/_archive/engine/UNITY_UI_ULTRAWIDE_20261031.md` |
| FAIL | missing-path | `docs/_archive/engine/UNITY_INVENTORY_DOCK_20261024.md:3` | `UNITY_UI_ULTRAWIDE_20261031.md` | `docs/_archive/engine/UNITY_UI_ULTRAWIDE_20261031.md` |
| FAIL | missing-path | `docs/_archive/engine/UNITY_INVENTORY_DOCK_20261024.md:5` | `UNITY_UI_COMPOSITION_20261024.md` | `docs/_archive/engine/UNITY_UI_COMPOSITION_20261024.md` |
| FAIL | missing-path | `docs/_archive/engine/UNITY_INVENTORY_DOCK_20261024.md:79` | `UNITY_MAC_INVENTORY_SETTINGS_20261025.md` | `docs/_archive/engine/UNITY_MAC_INVENTORY_SETTINGS_20261025.md` |
| FAIL | missing-path | `docs/_archive/engine/UNITY_INVENTORY_DOCK_20261024.md:84` | `UNITY_UI_ULTRAWIDE_20261031.md` | `docs/_archive/engine/UNITY_UI_ULTRAWIDE_20261031.md` |
| FAIL | missing-path | `docs/_archive/engine/UNITY_INVENTORY_DOCK_20261024.md:87` | `UNITY_UI_ULTRAWIDE_20261031.md` | `docs/_archive/engine/UNITY_UI_ULTRAWIDE_20261031.md` |
| FAIL | missing-path | `docs/_archive/engine/UNITY_LOBBY_MEDIA_RECOVERY_20261024.md:3` | `UNITY_WORLD_INTRO_CANONICAL_20261025.md` | `docs/_archive/engine/UNITY_WORLD_INTRO_CANONICAL_20261025.md` |
| FAIL | missing-path | `docs/_archive/engine/UNITY_LOBBY_MEDIA_RECOVERY_20261024.md:6` | `UNITY_SOURCE_BASELINE_20261024.md` | `docs/_archive/engine/UNITY_SOURCE_BASELINE_20261024.md` |
| FAIL | missing-path | `docs/_archive/engine/UNITY_MAC_A04_FIVE_SLOTS_OS_QA_20261029.md:3` | `UNITY_MAC_CHARACTER_CAPACITY_QA_20261101.md` | `docs/_archive/engine/UNITY_MAC_CHARACTER_CAPACITY_QA_20261101.md` |
| FAIL | missing-path | `docs/_archive/engine/UNITY_MAC_A15_LABEL_PREFLIGHT_20261027.md:19` | `UNITY_MAC_A15_4TAB_20261027.md` | `docs/_archive/engine/UNITY_MAC_A15_4TAB_20261027.md` |
| FAIL | missing-path | `docs/_archive/engine/UNITY_MAC_A15_LABEL_PREFLIGHT_20261027.md:21` | `UNITY_MAC_A15_LABEL_ADAPTER_20261027.md` | `docs/_archive/engine/UNITY_MAC_A15_LABEL_ADAPTER_20261027.md` |
| FAIL | missing-path | `docs/_archive/engine/UNITY_MAC_A15_LABEL_PREFLIGHT_20261027.md:23` | `UNITY_MAC_A15_LABEL_ADAPTER_20261027.md#2026-10-27-pc-seam-인수allowlist-보강-후속` | `docs/_archive/engine/UNITY_MAC_A15_LABEL_ADAPTER_20261027.md#2026-10-27-pc-seam-인수allowlist-보강-후속` |
| FAIL | missing-path | `docs/_archive/engine/UNITY_MAC_A15_LABEL_PREFLIGHT_20261027.md:25` | `UNITY_MAC_A15_FONT_COVERAGE_20261027.md` | `docs/_archive/engine/UNITY_MAC_A15_FONT_COVERAGE_20261027.md` |
| FAIL | missing-path | `docs/_archive/engine/UNITY_MAC_CINEMATIC_LANGUAGE_20261025.md:3` | `UNITY_MAC_LANGUAGE_MENU_PARITY_20261025.md` | `docs/_archive/engine/UNITY_MAC_LANGUAGE_MENU_PARITY_20261025.md` |
| FAIL | missing-path | `docs/_archive/engine/UNITY_MAC_INVENTORY_HINT_20261026.md:7` | `UNITY_MAC_INVENTORY_HINT_ACCEPTANCE_20261026.json` | `docs/_archive/engine/UNITY_MAC_INVENTORY_HINT_ACCEPTANCE_20261026.json` |
| FAIL | missing-path | `docs/_archive/engine/UNITY_MAC_LANGUAGE_DIAGNOSTICS_20261025.md:15` | `UNITY_MAC_SETTINGS_PERSISTENCE_20261026.md` | `docs/_archive/engine/UNITY_MAC_SETTINGS_PERSISTENCE_20261026.md` |
| FAIL | missing-path | `docs/_archive/engine/UNITY_MAC_LANGUAGE_DIAGNOSTICS_20261025.md:19` | `UNITY_SUBTITLE_FONT_COVERAGE_20261025.md#2026-10-26-우크라이나어-자막-전용-글꼴-인수` | `docs/_archive/engine/UNITY_SUBTITLE_FONT_COVERAGE_20261025.md#2026-10-26-우크라이나어-자막-전용-글꼴-인수` |
| FAIL | missing-path | `docs/_archive/engine/UNITY_MAC_LANGUAGE_DIAGNOSTICS_20261025.md:21` | `UNITY_MAC_HEAD_PLAYER_20261026.md` | `docs/_archive/engine/UNITY_MAC_HEAD_PLAYER_20261026.md` |
| FAIL | missing-path | `docs/_archive/engine/UNITY_MAC_LANGUAGE_DIAGNOSTICS_20261025.md:23` | `UNITY_MAC_HEAD_PLAYER_20261026.md#후속-os-입력진입-순서-검수--같은-빌드` | `docs/_archive/engine/UNITY_MAC_HEAD_PLAYER_20261026.md#후속-os-입력진입-순서-검수--같은-빌드` |
| FAIL | missing-path | `docs/_archive/engine/UNITY_MAC_LOBBY_POPUP_20261025.md:3` | `UNITY_MAC_LANGUAGE_MENU_PARITY_20261025.md` | `docs/_archive/engine/UNITY_MAC_LANGUAGE_MENU_PARITY_20261025.md` |
| FAIL | missing-path | `docs/_archive/engine/UNITY_MAC_LOBBY_POPUP_20261025.md:27` | `UNITY_MAC_LANGUAGE_NAMES_20261025.md` | `docs/_archive/engine/UNITY_MAC_LANGUAGE_NAMES_20261025.md` |
| FAIL | missing-path | `docs/_archive/engine/UNITY_MAC_NATURAL_WORLD_INTRO_20261027.md:7` | `UNITY_WORLD_INTRO_CANONICAL_20261025.md` | `docs/_archive/engine/UNITY_WORLD_INTRO_CANONICAL_20261025.md` |
| FAIL | missing-path | `docs/_archive/engine/UNITY_MAC_NATURAL_WORLD_INTRO_20261027.md:22` | `UNITY_MAC_INTRO_SILENCE_20261026.md` | `docs/_archive/engine/UNITY_MAC_INTRO_SILENCE_20261026.md` |
| FAIL | missing-path | `docs/_archive/engine/UNITY_MAC_PC_UI_PREFLIGHT_20261026.md:120` | `UNITY_B11_AUTOPOTION_20261026.md` | `docs/_archive/engine/UNITY_B11_AUTOPOTION_20261026.md` |
| FAIL | missing-path | `docs/_archive/engine/UNITY_MAC_PC_UI_PREFLIGHT_20261026.md:156` | `UNITY_PC_TABBAR_U08_20261026.md` | `docs/_archive/engine/UNITY_PC_TABBAR_U08_20261026.md` |
| FAIL | missing-path | `docs/_archive/engine/UNITY_MAC_PC_UI_PREFLIGHT_20261026.md:160` | `UNITY_PC_SKILL_WINDOW_U05_20261026.md` | `docs/_archive/engine/UNITY_PC_SKILL_WINDOW_U05_20261026.md` |
| FAIL | missing-path | `docs/_archive/engine/UNITY_MAC_PC_UI_PREFLIGHT_20261026.md:160` | `UNITY_MAC_SKILL_UI_20261025.md` | `docs/_archive/engine/UNITY_MAC_SKILL_UI_20261025.md` |
| FAIL | missing-path | `docs/_archive/engine/UNITY_MAC_PC_UI_PREFLIGHT_20261026.md:173` | `UNITY_A14_FORGE_20261026.md` | `docs/_archive/engine/UNITY_A14_FORGE_20261026.md` |
| FAIL | missing-path | `docs/_archive/engine/UNITY_MAC_PC_UI_PREFLIGHT_20261026.md:185` | `UNITY_PC_STAT_PANEL_A13_20261026.md` | `docs/_archive/engine/UNITY_PC_STAT_PANEL_A13_20261026.md` |
| FAIL | missing-path | `docs/_archive/engine/UNITY_MAC_START_TO_FIELD_QA_20261027.md:3` | `UNITY_MAC_PRACTICE_MOUSE_BRIDGE_20261029.md` | `docs/_archive/engine/UNITY_MAC_PRACTICE_MOUSE_BRIDGE_20261029.md` |
| FAIL | missing-path | `docs/_archive/engine/UNITY_MAC_START_TO_FIELD_QA_20261027.md:11` | `UNITY_SOURCE_BASELINE_20261024.md` | `docs/_archive/engine/UNITY_SOURCE_BASELINE_20261024.md` |
| FAIL | missing-path | `docs/_archive/engine/UNITY_MAC_START_TO_FIELD_QA_20261027.md:11` | `UNITY_MAC_INTRO_SILENCE_20261026.md` | `docs/_archive/engine/UNITY_MAC_INTRO_SILENCE_20261026.md` |
| FAIL | missing-path | `docs/_archive/engine/UNITY_UI_DOCK_20261024.md:3` | `UNITY_UI_ULTRAWIDE_20261031.md` | `docs/_archive/engine/UNITY_UI_ULTRAWIDE_20261031.md` |
| FAIL | missing-path | `docs/_archive/engine/UNITY_UI_DOCK_20261024.md:5` | `UNITY_UI_COMPOSITION_20261024.md` | `docs/_archive/engine/UNITY_UI_COMPOSITION_20261024.md` |
| FAIL | missing-path | `docs/_archive/engine/UNITY_UI_DOCK_20261024.md:29` | `UNITY_MAC_STATUS_BLEND_20261026.md` | `docs/_archive/engine/UNITY_MAC_STATUS_BLEND_20261026.md` |
| FAIL | missing-path | `docs/_archive/engine/UNITY_UI_DOCK_20261024.md:56` | `UNITY_UI_ULTRAWIDE_20261031.md` | `docs/_archive/engine/UNITY_UI_ULTRAWIDE_20261031.md` |
| FAIL | missing-path | `docs/_archive/engine/WEB_UNITY_PARITY_20261101.md:12` | `../1전체그래픽세팅/LOADING_ULTRAWIDE_20261031.md` | `docs/_archive/1전체그래픽세팅/LOADING_ULTRAWIDE_20261031.md` |
| FAIL | missing-path | `docs/_archive/engine/WEB_UNITY_PARITY_20261101.md:25` | `UNITY_PORT_MASTER_20261026.md` | `docs/_archive/engine/UNITY_PORT_MASTER_20261026.md` |
| FAIL | missing-path | `docs/_archive/engine/WEB_UNITY_PARITY_20261101.md:34` | `../../tools/check-vercel-output.mjs` | `docs/tools/check-vercel-output.mjs` |
| FAIL | missing-path | `docs/_archive/engine/WEB_UNITY_PARITY_20261101.md:36` | `../13출시·마케팅/WEB_DEPLOYMENT_REPAIR_20261002.md` | `docs/_archive/13출시·마케팅/WEB_DEPLOYMENT_REPAIR_20261002.md` |
| FAIL | missing-path | `docs/_archive/engine/WEB_UNITY_PARITY_20261101.md:42` | `../13출시·마케팅/WEB_DEPLOYMENT_REPAIR_20261002.md` | `docs/_archive/13출시·마케팅/WEB_DEPLOYMENT_REPAIR_20261002.md` |
| FAIL | missing-path | `docs/_archive/engine/orders/MAC_ORDERS_20261020.md:3` | `WORK_BOARD.md` | `docs/_archive/engine/orders/WORK_BOARD.md` |
| FAIL | missing-path | `docs/_archive/engine/orders/reports/P2-004B_REPORT.md:162` | `P2-004B_CANDIDATE.patch` | `docs/_archive/engine/orders/reports/P2-004B_CANDIDATE.patch` |
| FAIL | missing-path | `docs/_archive/engine/orders/reports/P2-004B_REPORT.md:217` | `P2-004B_EVIDENCE.json` | `docs/_archive/engine/orders/reports/P2-004B_EVIDENCE.json` |
| FAIL | missing-path | `docs/_archive/engine/orders/reports/P2-006a_REPORT.md:23` | `P2-006a_ASSETS.json` | `docs/_archive/engine/orders/reports/P2-006a_ASSETS.json` |
| FAIL | missing-path | `docs/_archive/engine/orders/reports/demo11-17_REPORT.md:41` | `../../../2_1%20스킬관리+합체시스템+자원/2_1%20스킬관리+합체시스템.md` | `docs/_archive/2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md` |
| FAIL | missing-path | `docs/_archive/engine/orders/reports/demo11-18_REPORT.md:27` | `../../../2_1%20스킬관리+합체시스템+자원/2_1%20스킬관리+합체시스템.md` | `docs/_archive/2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md` |
| FAIL | missing-path | `docs/_archive/engine/orders/reports/demo11-22r_REPORT.md:3` | `../../PC_RUNTIME_STAT_REFRESH_CONTRACT_20261021.md` | `docs/_archive/engine/PC_RUNTIME_STAT_REFRESH_CONTRACT_20261021.md` |
| FAIL | missing-path | `docs/_archive/engine/orders/reports/demo11-i18n_REPORT.md:5` | `demo11-i18n_STRINGS.csv` | `docs/_archive/engine/orders/reports/demo11-i18n_STRINGS.csv` |
| FAIL | missing-path | `docs/_archive/engine/orders/reports/demo11-i18n_REPORT.md:5` | `demo11-i18n_MANIFEST.json` | `docs/_archive/engine/orders/reports/demo11-i18n_MANIFEST.json` |
| FAIL | missing-path | `docs/_archive/engine/orders/reports/ec4-02_REPORT.md:7` | `../../FDG_SOURCE_TRACE_ENEMIES_CH4_20261020.md` | `docs/_archive/engine/FDG_SOURCE_TRACE_ENEMIES_CH4_20261020.md` |
| FAIL | missing-path | `docs/_archive/engine/orders/reports/ec4-02_REPORT.md:98` | `../../FDG_SOURCE_TRACE_ENEMIES_CH4_20261020.md` | `docs/_archive/engine/FDG_SOURCE_TRACE_ENEMIES_CH4_20261020.md` |
| FAIL | missing-path | `docs/_archive/engine/orders/reports/pc-boot01_REPORT.md:4` | `../../BOOT01_MULTI_FRAME_STARTUP_20261022.md` | `docs/_archive/engine/BOOT01_MULTI_FRAME_STARTUP_20261022.md` |
| FAIL | missing-path | `docs/_archive/engine/orders/reports/pc-boss-core_REPORT.md:3` | `../../PC_BOSS_CORE_CONTRACT_20261022.md` | `docs/_archive/engine/PC_BOSS_CORE_CONTRACT_20261022.md` |
| FAIL | missing-path | `docs/_archive/engine/orders/reports/pc-boss-parity_REPORT.md:7` | `../../PARITY_DIFF_LIST_20261022.md` | `docs/_archive/engine/PARITY_DIFF_LIST_20261022.md` |
| FAIL | missing-path | `docs/_archive/engine/orders/reports/pc-boss-parity_REPORT.md:7` | `../../PC_BOSS_CORE_CONTRACT_20261022.md` | `docs/_archive/engine/PC_BOSS_CORE_CONTRACT_20261022.md` |
| FAIL | missing-path | `docs/_archive/engine/orders/reports/pc-combat-pack-b_REPORT.md:3` | `../../PC_COMBAT_PACK_B_CONTRACT_20261021.md` | `docs/_archive/engine/PC_COMBAT_PACK_B_CONTRACT_20261021.md` |
| FAIL | missing-path | `docs/_archive/engine/orders/reports/pc-followups_REPORT.md:5` | `../../PC_COMBAT_PACK_B_CONTRACT_20261021.md` | `docs/_archive/engine/PC_COMBAT_PACK_B_CONTRACT_20261021.md` |
| FAIL | missing-path | `docs/_archive/engine/orders/reports/pc-followups_REPORT.md:5` | `../../PC_LIFECYCLE_CONTRACT_20261021.md` | `docs/_archive/engine/PC_LIFECYCLE_CONTRACT_20261021.md` |
| FAIL | missing-path | `docs/_archive/engine/orders/reports/pc-life-pack_REPORT.md:3` | `../../PC_LIFECYCLE_CONTRACT_20261021.md` | `docs/_archive/engine/PC_LIFECYCLE_CONTRACT_20261021.md` |
| FAIL | missing-path | `docs/_archive/engine/orders/reports/pc-move-skills_REPORT.md:4` | `../../PC_MOVE_SKILLS_CONTRACT_20261022.md` | `docs/_archive/engine/PC_MOVE_SKILLS_CONTRACT_20261022.md` |
| FAIL | missing-path | `docs/_archive/engine/orders/reports/pc-runtime-stats_REPORT.md:3` | `../../PC_RUNTIME_STAT_REFRESH_CONTRACT_20261021.md` | `docs/_archive/engine/PC_RUNTIME_STAT_REFRESH_CONTRACT_20261021.md` |
| FAIL | missing-path | `docs/_archive/engine/orders/reports/pc-skill-writers_REPORT.md:4` | `../../PC_SKILL_WRITERS_CONTRACT_20261022.md` | `docs/_archive/engine/PC_SKILL_WRITERS_CONTRACT_20261022.md` |
| FAIL | missing-path | `docs/_archive/engine/orders/reports/snd-02_REPORT.md:14` | `../../FDG_SOURCE_TRACE_SOUND_20261020.md` | `docs/_archive/engine/FDG_SOURCE_TRACE_SOUND_20261020.md` |
| FAIL | missing-path | `docs/_archive/engine/orders/reports/snd-03_REPORT.md:14` | `../../FDG_SOURCE_TRACE_SOUND_20261020.md` | `docs/_archive/engine/FDG_SOURCE_TRACE_SOUND_20261020.md` |
| FAIL | missing-path | `docs/_archive/engine/orders/reports/snd-04_REPORT.md:15` | `../../FDG_SOURCE_TRACE_SOUND_20261020.md` | `docs/_archive/engine/FDG_SOURCE_TRACE_SOUND_20261020.md` |
| FAIL | missing-path | `docs/_archive/engine/orders/reports/snd-05_REPORT.md:14` | `../../FDG_SOURCE_TRACE_SOUND_20261020.md` | `docs/_archive/engine/FDG_SOURCE_TRACE_SOUND_20261020.md` |
| FAIL | missing-path | `docs/_archive/engine/orders/reports/snd-06_REPORT.md:13` | `../../FDG_SOURCE_TRACE_SOUND_20261020.md` | `docs/_archive/engine/FDG_SOURCE_TRACE_SOUND_20261020.md` |
| FAIL | missing-path | `docs/_archive/engine/orders/reports/snd-07_REPORT.md:14` | `../../FDG_SOURCE_TRACE_SOUND_20261020.md` | `docs/_archive/engine/FDG_SOURCE_TRACE_SOUND_20261020.md` |
| FAIL | missing-path | `docs/_archive/engine/orders/reports/snd-08_REPORT.md:16` | `../../FDG_SOURCE_TRACE_SOUND_20261020.md` | `docs/_archive/engine/FDG_SOURCE_TRACE_SOUND_20261020.md` |
| FAIL | missing-path | `docs/_archive/engine/parity_refs/boss_mac/README.md:11` | `09a_angler_teleport_compare_1x.jpg` | `docs/_archive/engine/parity_refs/boss_mac/09a_angler_teleport_compare_1x.jpg` |
| FAIL | missing-path | `docs/_archive/engine/parity_refs/boss_mac/README.md:12` | `09a_fieldboss_compare_1x.jpg` | `docs/_archive/engine/parity_refs/boss_mac/09a_fieldboss_compare_1x.jpg` |
| FAIL | missing-path | `docs/_archive/engine/parity_refs/boss_mac/README.md:13` | `09b_angler_teleport_compare_1x.jpg` | `docs/_archive/engine/parity_refs/boss_mac/09b_angler_teleport_compare_1x.jpg` |
| FAIL | missing-path | `docs/_archive/engine/parity_refs/boss_mac/README.md:14` | `10_gate_compare_1x.jpg` | `docs/_archive/engine/parity_refs/boss_mac/10_gate_compare_1x.jpg` |
| FAIL | missing-path | `docs/_archive/engine/parity_refs/boss_mac/README.md:15` | `10a_entry_intro_compare_1x.jpg` | `docs/_archive/engine/parity_refs/boss_mac/10a_entry_intro_compare_1x.jpg` |
| FAIL | missing-path | `docs/_archive/engine/parity_refs/boss_mac/README.md:16` | `10a_entry_namecard_compare_1x.jpg` | `docs/_archive/engine/parity_refs/boss_mac/10a_entry_namecard_compare_1x.jpg` |
| FAIL | missing-path | `docs/_archive/engine/parity_refs/boss_mac/README.md:17` | `10b_arena_compare_1x.jpg` | `docs/_archive/engine/parity_refs/boss_mac/10b_arena_compare_1x.jpg` |
| FAIL | missing-path | `docs/_archive/engine/parity_refs/boss_mac/README.md:18` | `10d_boss_close_compare_1x.jpg` | `docs/_archive/engine/parity_refs/boss_mac/10d_boss_close_compare_1x.jpg` |
| FAIL | missing-path | `docs/_archive/engine/parity_refs/boss_mac/README.md:19` | `10d_immune02_compare_1x.jpg` | `docs/_archive/engine/parity_refs/boss_mac/10d_immune02_compare_1x.jpg` |
| FAIL | missing-path | `docs/_archive/engine/parity_refs/boss_mac/README.md:20` | `10e_charge_compare_1x.jpg` | `docs/_archive/engine/parity_refs/boss_mac/10e_charge_compare_1x.jpg` |
| FAIL | missing-path | `docs/_archive/engine/parity_refs/boss_mac/README.md:21` | `10e_grab_compare_1x.jpg` | `docs/_archive/engine/parity_refs/boss_mac/10e_grab_compare_1x.jpg` |
| FAIL | missing-path | `docs/_archive/engine/parity_refs/boss_mac/README.md:22` | `10e_shock_compare_1x.jpg` | `docs/_archive/engine/parity_refs/boss_mac/10e_shock_compare_1x.jpg` |
| FAIL | missing-path | `docs/_archive/engine/parity_refs/boss_mac/README.md:23` | `10e_slam_compare_1x.jpg` | `docs/_archive/engine/parity_refs/boss_mac/10e_slam_compare_1x.jpg` |
| FAIL | missing-path | `docs/_archive/engine/parity_refs/boss_mac/README.md:24` | `10e_spin_compare_1x.jpg` | `docs/_archive/engine/parity_refs/boss_mac/10e_spin_compare_1x.jpg` |
| FAIL | missing-path | `docs/_archive/engine/parity_refs/boss_mac/README.md:25` | `10f_boss_hit_compare_1x.jpg` | `docs/_archive/engine/parity_refs/boss_mac/10f_boss_hit_compare_1x.jpg` |
| FAIL | missing-path | `docs/_archive/engine/parity_refs/boss_mac/README.md:26` | `10g_revive_0_compare_1x.jpg` | `docs/_archive/engine/parity_refs/boss_mac/10g_revive_0_compare_1x.jpg` |
| FAIL | missing-path | `docs/_archive/engine/parity_refs/boss_mac/README.md:27` | `10g_revive_1_compare_1x.jpg` | `docs/_archive/engine/parity_refs/boss_mac/10g_revive_1_compare_1x.jpg` |
| FAIL | missing-path | `docs/_archive/engine/parity_refs/boss_mac/README.md:28` | `11c_exit_view_compare_1x.jpg` | `docs/_archive/engine/parity_refs/boss_mac/11c_exit_view_compare_1x.jpg` |
| FAIL | missing-path | `docs/_archive/engine/parity_refs/boss_mac/README.md:29` | `11c_killed_compare_1x.jpg` | `docs/_archive/engine/parity_refs/boss_mac/11c_killed_compare_1x.jpg` |
| FAIL | missing-path | `docs/_archive/engine/parity_refs/boss_mac/README.md:30` | `11d_clear_compare_1x.jpg` | `docs/_archive/engine/parity_refs/boss_mac/11d_clear_compare_1x.jpg` |
| FAIL | missing-path | `docs/_archive/engine/parity_refs/boss_mac/README.md:31` | `10a_entry_namecard_namecard_crop_1x.jpg` | `docs/_archive/engine/parity_refs/boss_mac/10a_entry_namecard_namecard_crop_1x.jpg` |
| FAIL | missing-path | `docs/_archive/engine/parity_refs/boss_mac/README.md:32` | `10d_immune02_bossbar_crop_1x.jpg` | `docs/_archive/engine/parity_refs/boss_mac/10d_immune02_bossbar_crop_1x.jpg` |
| FAIL | missing-path | `docs/_archive/engine/parity_refs/boss_mac/README.md:33` | `10g_revive_0_bossbar_crop_1x.jpg` | `docs/_archive/engine/parity_refs/boss_mac/10g_revive_0_bossbar_crop_1x.jpg` |
| FAIL | missing-path | `docs/_archive/engine/parity_refs/boss_mac/README.md:34` | `09a_fieldboss_angler_crop_1x.jpg` | `docs/_archive/engine/parity_refs/boss_mac/09a_fieldboss_angler_crop_1x.jpg` |
| FAIL | missing-path | `docs/_archive/rules-20261103/main_AGENTS.md:3` | `docs/0마스터플랜/AGENT_OPERATIONS_MANUAL.md` | `docs/_archive/rules-20261103/docs/0마스터플랜/AGENT_OPERATIONS_MANUAL.md` |
| FAIL | missing-path | `docs/_archive/rules-20261103/main_AGENTS.md:16` | `docs/API연결_가이드.md` | `docs/_archive/rules-20261103/docs/API연결_가이드.md` |
| FAIL | missing-path | `docs/_archive/rules-20261103/main_AGENTS.md:25` | `docs/13출시·마케팅/BUILD_BACKUP_POLICY_20261001.md#2026-10-29-pc-저장-위치--i-기본값` | `docs/_archive/rules-20261103/docs/13출시·마케팅/BUILD_BACKUP_POLICY_20261001.md#2026-10-29-pc-저장-위치--i-기본값` |
| FAIL | missing-path | `docs/_archive/rules-20261103/main_AGENTS.md:29` | `docs/0마스터플랜/WORK_QUALITY_STANDARD_20261029.md#11-제작-전-기획--목표-품질과-제작-방법부터-검증-2026-10-30-사용자-지시` | `docs/_archive/rules-20261103/docs/0마스터플랜/WORK_QUALITY_STANDARD_20261029.md#11-제작-전-기획--목표-품질과-제작-방법부터-검증-2026-10-30-사용자-지시` |
| FAIL | missing-path | `docs/_archive/rules-20261103/main_AGENTS.md:30` | `docs/0마스터플랜/AAA_QUALITY_STANDARD_20260927.md#2026-10-29-실행-규칙--시각-완성도와-재작업-책임` | `docs/_archive/rules-20261103/docs/0마스터플랜/AAA_QUALITY_STANDARD_20260927.md#2026-10-29-실행-규칙--시각-완성도와-재작업-책임` |
| FAIL | missing-path | `docs/_archive/rules-20261103/main_AGENTS.md:76` | `docs/0마스터플랜/WORK_MANUAL_20261029.md#4-heartbeat--실제-전달과-시간별-작업보고` | `docs/_archive/rules-20261103/docs/0마스터플랜/WORK_MANUAL_20261029.md#4-heartbeat--실제-전달과-시간별-작업보고` |
| FAIL | missing-path | `docs/_archive/rules-20261103/main_AGENTS.md:78` | `docs/0마스터플랜/PROJECT_MANAGEMENT_MASTER.md` | `docs/_archive/rules-20261103/docs/0마스터플랜/PROJECT_MANAGEMENT_MASTER.md` |
| FAIL | missing-path | `docs/_archive/rules-20261103/main_AGENTS.md:81` | `docs/0마스터플랜/TEAM_CONTINUATION_POLICY_20261001.md` | `docs/_archive/rules-20261103/docs/0마스터플랜/TEAM_CONTINUATION_POLICY_20261001.md` |
| FAIL | missing-path | `docs/_archive/rules-20261103/main_AGENTS.md:88` | `docs/0마스터플랜/PROJECT_MANAGEMENT_MASTER.md#13-투자-검토용-빌드-품질-목표와-아침-회의` | `docs/_archive/rules-20261103/docs/0마스터플랜/PROJECT_MANAGEMENT_MASTER.md#13-투자-검토용-빌드-품질-목표와-아침-회의` |
| FAIL | missing-path | `docs/_archive/rules-20261103/main_AGENTS.md:93` | `docs/13출시·마케팅/BUILD_BACKUP_POLICY_20261001.md` | `docs/_archive/rules-20261103/docs/13출시·마케팅/BUILD_BACKUP_POLICY_20261001.md` |
| FAIL | missing-path | `docs/_archive/rules-20261103/main_AGENTS.md:178` | `docs/13출시·마케팅/TERMINAL_FAILURE_FALLBACK_20260927.md` | `docs/_archive/rules-20261103/docs/13출시·마케팅/TERMINAL_FAILURE_FALLBACK_20260927.md` |
| FAIL | missing-path | `docs/_archive/rules-20261103/main_CLAUDE.md:3` | `docs/0마스터플랜/AGENT_OPERATIONS_MANUAL.md` | `docs/_archive/rules-20261103/docs/0마스터플랜/AGENT_OPERATIONS_MANUAL.md` |
| FAIL | missing-path | `docs/_archive/rules-20261103/main_CLAUDE.md:17` | `docs/API연결_가이드.md` | `docs/_archive/rules-20261103/docs/API연결_가이드.md` |
| FAIL | missing-path | `docs/_archive/rules-20261103/main_CLAUDE.md:26` | `docs/13출시·마케팅/BUILD_BACKUP_POLICY_20261001.md#2026-10-29-pc-저장-위치--i-기본값` | `docs/_archive/rules-20261103/docs/13출시·마케팅/BUILD_BACKUP_POLICY_20261001.md#2026-10-29-pc-저장-위치--i-기본값` |
| FAIL | missing-path | `docs/_archive/rules-20261103/main_CLAUDE.md:30` | `docs/0마스터플랜/WORK_QUALITY_STANDARD_20261029.md#11-제작-전-기획--목표-품질과-제작-방법부터-검증-2026-10-30-사용자-지시` | `docs/_archive/rules-20261103/docs/0마스터플랜/WORK_QUALITY_STANDARD_20261029.md#11-제작-전-기획--목표-품질과-제작-방법부터-검증-2026-10-30-사용자-지시` |
| FAIL | missing-path | `docs/_archive/rules-20261103/main_CLAUDE.md:31` | `docs/0마스터플랜/AAA_QUALITY_STANDARD_20260927.md#2026-10-29-실행-규칙--시각-완성도와-재작업-책임` | `docs/_archive/rules-20261103/docs/0마스터플랜/AAA_QUALITY_STANDARD_20260927.md#2026-10-29-실행-규칙--시각-완성도와-재작업-책임` |
| FAIL | missing-path | `docs/_archive/rules-20261103/unity_AGENTS.md:23` | `docs/0마스터플랜/AAA_QUALITY_STANDARD_20260927.md#2026-10-29-실행-규칙--시각-완성도와-재작업-책임` | `docs/_archive/rules-20261103/docs/0마스터플랜/AAA_QUALITY_STANDARD_20260927.md#2026-10-29-실행-규칙--시각-완성도와-재작업-책임` |
| FAIL | missing-path | `docs/_archive/rules-20261103/unity_AGENTS.md:74` | `docs/0마스터플랜/PROJECT_MANAGEMENT_MASTER.md` | `docs/_archive/rules-20261103/docs/0마스터플랜/PROJECT_MANAGEMENT_MASTER.md` |
| FAIL | missing-path | `docs/_archive/rules-20261103/unity_AGENTS.md:77` | `docs/0마스터플랜/TEAM_CONTINUATION_POLICY_20261001.md` | `docs/_archive/rules-20261103/docs/0마스터플랜/TEAM_CONTINUATION_POLICY_20261001.md` |
| FAIL | missing-path | `docs/_archive/rules-20261103/unity_AGENTS.md:84` | `docs/0마스터플랜/PROJECT_MANAGEMENT_MASTER.md#13-투자-검토용-빌드-품질-목표와-아침-회의` | `docs/_archive/rules-20261103/docs/0마스터플랜/PROJECT_MANAGEMENT_MASTER.md#13-투자-검토용-빌드-품질-목표와-아침-회의` |
| FAIL | missing-path | `docs/_archive/rules-20261103/unity_AGENTS.md:89` | `docs/13출시·마케팅/BUILD_BACKUP_POLICY_20261001.md` | `docs/_archive/rules-20261103/docs/13출시·마케팅/BUILD_BACKUP_POLICY_20261001.md` |
| FAIL | missing-path | `docs/_archive/rules-20261103/unity_AGENTS.md:174` | `docs/13출시·마케팅/TERMINAL_FAILURE_FALLBACK_20260927.md` | `docs/_archive/rules-20261103/docs/13출시·마케팅/TERMINAL_FAILURE_FALLBACK_20260927.md` |
| FAIL | missing-path | `docs/_archive/rules-20261103/unity_CLAUDE.md:13` | `docs/0마스터플랜/AAA_QUALITY_STANDARD_20260927.md#2026-10-29-실행-규칙--시각-완성도와-재작업-책임` | `docs/_archive/rules-20261103/docs/0마스터플랜/AAA_QUALITY_STANDARD_20260927.md#2026-10-29-실행-규칙--시각-완성도와-재작업-책임` |
| FAIL | missing-path | `docs/engine/FDG_SOURCE_TRACE_MAPS_CH4_20261020.md:126` | `부록 B` | `docs/engine/부록 B` |
| FAIL | missing-path | `docs/engine/PC_COMBAT_PACK_B_CONTRACT_20261021.md:3` | `PC_INTERFACE_REQUESTS_DEMO11_20261021.md` | `docs/engine/PC_INTERFACE_REQUESTS_DEMO11_20261021.md` |
| FAIL | missing-path | `docs/engine/UNITY_BOSS_BATTLE_BOARD_20261026.md:225` | `local_2bc577ae` | `docs/engine/local_2bc577ae` |
| FAIL | missing-path | `docs/engine/UNITY_BOSS_BATTLE_BOARD_20261026.md:225` | `local_58a4b093` | `docs/engine/local_58a4b093` |
| FAIL | missing-path | `docs/engine/UNITY_BOSS_BATTLE_BOARD_20261026.md:225` | `§8.5.1` | `docs/engine/§8.5.1` |
| FAIL | missing-anchor | `docs/engine/UNITY_PAUSE_SILVER_BRIEF_20261103.md:6` | `../3.1%20ui%20hud%20디자인/WEB_UIUX_GAME_20261031.md#2026-11-03-인벤토리-제목-띠-제거` | `docs/3.1 ui hud 디자인/WEB_UIUX_GAME_20261031.md#2026-11-03-인벤토리-제목-띠-제거` |
| FAIL | missing-path | `docs/engine/orders/WORK_BOARD.md:331` | `reports/demo11-32_REPORT.md` | `docs/engine/orders/reports/demo11-32_REPORT.md` |
| FAIL | missing-path | `docs/engine/orders/WORK_BOARD.md:332` | `reports/demo11-21fix_REPORT.md` | `docs/engine/orders/reports/demo11-21fix_REPORT.md` |
| FAIL | missing-path | `docs/engine/orders/WORK_BOARD.md:333` | `reports/demo11-21_REPORT.md` | `docs/engine/orders/reports/demo11-21_REPORT.md` |

## 제출 전 검증

- 자체 테스트 및 호스트 절대 경로 회귀 테스트 PASS. 원문 대조: 구 제목을 가리키는 앵커 11건 중 마스터바이블·그래픽 마스터·스플래시·작업 매뉴얼·UI 문서의 변경된 제목을 표본 확인했다. 실제 렌더러 대조는 미확인이다.
- 검사 전후 원문 문서 1,587개 바이트 변경 0개. 그중 CRLF 포함 68개이며 줄 단위 CR 수 변경 0개.
- `git diff --exit-code -- CLAUDE.md docs`에서 기존 추적 문서 변경 없음. 신규 산출물은 배정된 결과표와 검사 도구 두 파일뿐이다.
- G: 여유 69.62GiB(시작 확인). 이번 배정의 G: 경로 지시에 따라 docs sparse worktree로 제한했다. 20GB 이상 산출물·빌드·캡처·백업을 만들지 않았다. 정리 대상인 이전 자기 산출물은 없었으며 타 레인 파일은 삭제하지 않았다.

## 인계

- 완료 기준: 고정 unity/main 스냅샷 링크 및 앵커 검사, CLAUDE 6절 경로 확인, 누락 전체 결과표 작성. 링크 수정은 배정하지 않았으므로 수행하지 않는다.
- 미확인: CTO 병합 이후 최신 줄기 재검사, 실제 Markdown 렌더러 앵커 대조, 외부 링크 접속, 자연어 선행 문서 특정.
- 규칙 충돌: 11-05 Codex 새 배정 금지 문구보다 이번 K3 명시 배정을 우선했다. CHANGELOG 의무보다 이번 “두 산출물만/문서 수정 금지” 소유 범위를 우선했다.
- CHANGELOG_SYNC 인계 초안: “K3: unity/main docs/·CLAUDE 상대 링크/앵커·6절 선행 경로 감사와 재현 도구 추가. 원문 수정 없음. 기준 SHA와 누락은 K3 결과표 참조.”
- 원본 보존·줄 단위 CR 검증, 커밋·원격 SHA 일치 및 worktree 정리는 제출 시 Git/파일 검증으로 확인한다. 본 표에 자기 커밋 SHA를 삽입하지 않는다.

END
