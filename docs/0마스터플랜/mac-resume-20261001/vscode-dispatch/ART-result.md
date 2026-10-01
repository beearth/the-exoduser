# ART-WA24-PROBE-FIX 결과 — 컷신 타임라인 관측 후보 결함 수정

- 담당: ART / 터미널 2 (vscode-dispatch)
- 기준 HEAD: `30a204a7aa348a88b90bdc922862c610a7da938f` (작업 중 Git 변경·커밋 없음)
- 입력: `candidates/ART.js`(SHA256 `14666be45c998b9662b74a717c5cad4540bf6355449937f8afb90193ebab9c9f`) + `검증결과.md`
- 산출(소유 폴더 `tools/team-followup-20261001/ART/`):
  - `wa24-observer.cjs` — 수정 관측기, SHA256 `a7134b053786c0c976ecb65832c20ab7380d4addd6e1341445e3d80567f0b7b3`
  - `wa24-observer.test.mjs` — Node mock 검증, SHA256 `17aba27f029995856ee0dc23651cb46b063ad5b51018477f0f79a3ffdf2664bd`
  - `README.md` — 사용·결함표·SSOT 대조

## 1. 수행 결과 (완료)

후보 `candidates/ART.js`의 관측기를 **읽기 전용 성격은 유지**하면서 검증결과.md/매니페스트가 지적한 결함 4종을 고친 독립 관측기를 본인 폴더에 구현하고, mock 환경에서 정적 검증을 완료했다. 게임 원화·로더·게임 데이터는 불변이며, 실제 컷신 인수(브라우저 PRO 재생)는 수행하지 않았다(게이트 보류).

### 고친 결함

| ID | 원 후보 위치 | 문제 | 수정 | 테스트 증거 |
|---|---|---|---|---|
| D1 | `ART.js:70` | wa24 **표본 0에서도 `within_pm2`가 true** — 초기값 `xmin=9,xmax=-9`가 `xmin>=-2 && xmax<=2`를 그대로 통과. "검사 안 함"이 "통과"로 보고됨 | `n>0`일 때만 `within_pm2` 판정. `verdict`를 `PASS/FAIL/INCOMPLETE`로 분리하고 **표본0 → `INCOMPLETE`**(절대 PASS 아님). Infinity 잔재는 `null`로 정리 | 케이스[2]: `within_pm2=false`, `verdict=INCOMPLETE`, `reasons=['wa24_표본0']`. 원 공식 재현값 true도 함께 대비 출력 |
| D2 | `ART.js:75,79` | `cleanup`이 rAF만 취소 → **safety setTimeout(120s)·`window.__wa24obs` 잔존**(누수) | `finish()`가 rAF+timeout+namespace 전부 정리. **멱등**(2회 호출 시 캐시 결과 반환), 자기 소유일 때만 namespace 삭제 | 케이스[4]: 정리 후 `liveFrames=0,liveTimers=0`, `__wa24obs===undefined`, 2차 cleanup 동일 결과 반환 |
| D3 | `ART.js:6` | 중복 설치 시 `cleanup`만 호출하고 이전 rAF/timeout 핸들을 **실제로 잃을 수 있음** | 생성 시 기존 인스턴스 `cleanup` 선행 + `installSeq`로 추적, 재설치 누수 0 | 케이스[3]: A 자동 `stopped`, namespace가 B, `installSeq 1→2`, 타이머 1개만 잔존 |
| D4 | 전반 | 구문/플래그만으로 PASS 오인 | `verdict=PASS`는 **모델 대조 OK + wa24 경계 포착 + 표본>0 + shake ±2** 전부 충족해야 함. 그 외 model_drift/shake초과 → FAIL, 경계미포착/표본0 → INCOMPLETE | 케이스[1] PASS, 보조 케이스 shake초과·드리프트 → FAIL |

## 2. 실행 명령과 종료 코드

```
node --check tools/team-followup-20261001/ART/wa24-observer.cjs      # OK
node --check tools/team-followup-20261001/ART/wa24-observer.test.mjs # OK
node tools/team-followup-20261001/ART/wa24-observer.test.mjs         # exit=0
```

결과: **35 PASS / 0 FAIL** (요구 4케이스 정상표본·0표본·재설치·취소 + 보조 shake초과·모델드리프트).

- 환경: Node v24.15.0 / macOS Darwin 25.6.0. 저장소 `package.json`이 `"type":"module"`이라 `.js`는 ESM으로 로드돼 UMD가 깨짐 → 도구를 `.cjs`로 둠(브라우저 콘솔 붙여넣기에는 확장자 무관).
- mock env는 시계·프레임·타이머·전역읽기·host를 주입해 결정론적으로 PRO 시퀀스(wa23→wa24→wa25)를 재생한다. 실제 게임/브라우저는 실행하지 않음.

## 3. 원자료·근거

- 결함 지적 근거: `.../r-input-20261001/검증결과.md` 실행 전 게이트 표(ART.js) 및 §ART 주석(`:70`,`:75`,`:79`).
- EXPECT 수치의 docs SSOT 일치 확인(코드 변경 아님, 대조만):
  - wa24 `t:73600 dur:2400` ↔ `docs/cinematic/WARINTRO_REMASTER_20260909.md:44`(73.6/2.4), `docs/0마스터플랜/mac-resume-20261001/MAP-ART-인수검토.md:108`(73600ms)
  - wa24 cam zs1.08→ze1.04 ease out, vfx shake:1, 자막색 기본 #d8d4cc ↔ `ART_TEAM_MASTER.md §204`, `.../ui03-evidence/ART-팀검토.md`
- 기존 `wa24-observer` 도구는 저장소에 없었음(신규 산출). `find -name '*wa24*'`는 컷신 프레임 이미지(`output/cinematic/...`)만 반환.

## 4. 실행하지 않은 항목 / 남은 게이트

- **실제 컷신 브라우저 인수 미수행**: `?test=1&cutscene=1` PRO 재생에서 wa24 실표본·경계·shake·transition·크롭/자막 실측은 하지 않음. 게임/브라우저/서버 추가 실행은 QA 단독 소유이며 MAP/ART/UIUX/ANIMVFX는 **QA 종료 인계 전 보류** 규정에 따름. 인계 후 `window.__wa24obs.cleanup()`의 `verdict` 실측 필요(미완료).
- Git add/commit/push 없음(총괄이 통합·검수·원격 체크포인트). 다른 팀 소유 파일 미수정.

## 5. docs 정정 후보 (총괄 통합용 — 본 세션은 공유 문서 미편집)

> vscode-dispatch 쓰기 소유권 규정상 공유/타팀 문서는 직접 수정하지 않고 diff 후보만 여기 보관.

1. `docs/0마스터플랜/MAC_AGENT_DASHBOARD.md:29` — ART 행 비고 "타이머 정리·표본 판정 수정 선행"은 본 산출로 **구현 완료**(관측기 `wa24-observer.cjs`, 35 PASS). 상태 반영 제안.
2. `docs/17게임아트팀/ART_TEAM_MASTER.md §240` — wa24 관측 코드의 후속으로 "타이머·namespace 정리 + 표본0 verdict 교정 관측기(`tools/team-followup-20261001/ART/`)" 한 줄 추가 제안. 실제 컷신 렌더 인수는 여전히 미검수로 유지.

두 정정 모두 **수치 변경이 아니라 구현 상태 기록**이며, 통합 담당이 반영 범위를 확인 후 커밋에 포함하면 된다.

## 6. 인계

- 다음 작업(소유권 밖, 미실행): QA 성능 측정 종료 인계 후 실제 브라우저에서 수정 관측기로 wa24 `verdict` 실측 → ART_TEAM_MASTER 컷신 인수 행 갱신. 본 세션은 여기서 종료, 소유권 밖 작업은 실행하지 않고 인계한다.
