# S-03-49851BD-REVIEW — 독립 SOUND 후보 통합 검토 (읽기 전용)

검토자: 기존 SOUND 세션 aa3ac0ed. 기준 HEAD(지시) 30a204a7. Read/Glob/Grep만 사용.
game.html·game-easy-test.html 미편집, Git 조작 없음, 병합·삭제·인코딩·청취 없음.

## 1. 재사용한 기존 감사 (재검 안 함)
- 71삭제/76참조 감사·압축 후보 9개: BUILD-SOUND 인수검토 및 sound-result.json으로 확인됨(재실행 안 함).
- 후보 9/9 네이티브 프리픽스 decode PASS·컨테이너 6/6 PASS·blob 13/13 일치: 기존 결과 재사용.

## 2. S-03 (레거시 SFX_MAP/BGM_MAP/bgmPlay 제거) — 현 Mac 미반영, 제거 안전
- 현재 소스에 잔존: game.html SFX_MAP:9920 / BGM_MAP:9942 / bgmPlay:9955
  (game-easy-test.html 9474 / 9496 / 9509).
- 사용처 조사: `bgmPlay(` 호출 0건, `SFX_MAP[`/외부참조 0건, `BGM_MAP[`는 bgmPlay 내부(9958/9960)에서만.
  → 세 심볼 모두 **데드코드**. 런타임은 SFX.*/playSample/BGM.play 사용. 제거해도 참조 끊김 없음(정적 판정).
- 변경 필요 hunk(후보, 총괄 소유 파일이라 본인 폴더 보관 권고):
  - game.html: 9919–9977 범위의 SFX_MAP/BGM_MAP/bgmPlay 블록 삭제.
  - game-easy-test.html: 9473–대응 범위 동일 삭제.
- 게이트: 바이트단위는 git show 49851bd로 재대조 필요(이 세션 미실행). 삭제 전 `playSample`/`BGM` 경로가
  동일 트랙키를 쓰는지 총괄 1회 확인.

## 3. S-11 (아레나 진입 포효 중복) — 현 Mac 미반영 확정
- 포효 재생 3지점:
  1) game.html:29415 (easy 28391) — 봉인 연출: `SFX.groggy();…playSample(_bsf.howl,.6,…); addTxt(…'봉인됨!'…)` — **가드 없음**.
  2) game.html:36801–36803 (easy 35749) — setTimeout 120ms howl (직행/보조 경로).
  3) game.html:40248–40250 (easy 39193) — 보스로드 phase4 입장 연출 howl.
- _enterBossArena 호출 경로: 보스문 정상=phase1→`_bossLoadFade>=1`에서 `_bossLoadPhase=2`+_enterBossArena(40230);
  재도전=16133; 직행=30146.
- 결함: 보스문 정상 경로는 _enterBossArena 실행 시점이 phase===2라 (1)의 봉인 포효 + (3) phase4 포효 = **2회**.
- 핸드오프 명시 수정: (1) 봉인 포효를 `if(G._bossLoadPhase!==2){…}`로 감싸 phase 진행 중엔 억제
  → 보스문/재도전/직행 각각 **1회**. (재도전·직행은 phase가 2가 아니므로 (1) 1회 유지.)
- 변경 필요 hunk(후보):
  - game.html:29415 / game-easy-test.html:28391 — 봉인 포효 playSample 호출을 `_bossLoadPhase!==2` 가드로.
- 게이트: 바이트단위 diff는 49851bd git show 재확인 필요(미실행). **실제 포효 횟수는 게임 실행 검증 필요(QA 단독, 미실시)**.

## 4. 전체 파일 교체 금지 근거
- 핸드오프: 현 HEAD↔SOUND game.html +34/−390, easy +26/−153 = 타팀 이후 변경 포함.
  → S-03/S-11 좁은 hunk만 독립 후보. 브랜치 파일 통째 교체 금지.

## 5. A/B 페이지 정적 검증 — 기존본 사용, 결함 없음(독립 사본 수정 불필요)
- 대상: tools/qa/r-input-followup/sound-loop-review.html (기존 산출).
- 확인: 자동재생 없음(버튼 클릭 play), 파일입력 기반(fetch/업로드/변환 없음, NFD/경로 문제 회피),
  공통 볼륨 고정(재생 중 pre/post/volume 비활성), 끝→시작 loop+wrap 감지 후 post초 정지,
  serial 티켓으로 스테일 tick 취소, visibilitychange/pagehide 정지·revokeObjectURL 정리,
  "실제 청취 미검수" 배지 + §3 자동 음질판정 없음 명시.
- 주의(결함 아님): OGG/Opus는 Safari 등 일부 브라우저 디코드 실패 가능 → onerror로 표면화(정직). Chrome 권장.
  A/B는 각 파일 자기 끝→시작 비교(루프 접점 목적에 적합, 곡중 동일위치 비교는 아님). 피크 정규화 없음(의도·명시).
- 판정: 수정 요할 기능 결함 없음 → 독립 수정본 생성 안 함.

## 6. 미실시 / 남은 게이트
- git show 49851bd 바이트단위 재대조(이 세션 Bash/git 미제공).
- HEAD 30a204a7 기준 신규 diff 생성(미실행).
- 실제 청취(네메시아 루프 접점 A/B)·포효 1회 게임 재현(QA 단독, 미실시).
- 원본 BGM/세이브/공유 마스터 무변경 유지. main 병합·삭제·인코딩 없음.

---
Root recovery: saved existing SOUND final response verbatim. This preserves team findings, not root acceptance. No permission changes.
