# ART-WA24-PROBE-FIX — wa24 타임라인 인수 관측기 (결함 수정판)

- `wa24-observer.cjs` — 수정된 독립 관측기(읽기 전용). 브라우저 콘솔 붙여넣기 자동 설치 + Node 테스트용 팩토리 export(UMD).
- `wa24-observer.test.mjs` — Node mock 정적 검증(4케이스 + 보조 2케이스).

## 실행

```bash
node tools/team-followup-20261001/ART/wa24-observer.test.mjs   # 35 PASS / 0 FAIL
```

## 고친 결함 (원 후보 `candidates/ART.js` 대비)

| ID | 원 후보 위치 | 문제 | 수정 |
|---|---|---|---|
| D1 | ART.js:70 | wa24 표본 0에서도 `within_pm2`가 true (`xmin=9,xmax=-9` 초기값이 ±2 조건 통과) | `n>0`일 때만 판정. `verdict`를 `PASS/FAIL/INCOMPLETE`로 분리, 표본0 → `INCOMPLETE`(절대 PASS 아님). Infinity 잔재는 null로 정리 |
| D2 | ART.js:75,79 | `cleanup`이 rAF만 취소, safety timeout·`window.__wa24obs` 잔존 | `finish()`가 rAF·timeout·namespace 전부 정리. 멱등(재호출 시 캐시 반환, 자기 소유일 때만 namespace 삭제) |
| D3 | ART.js:6 | 중복 설치 시 기존 핸들 분실 가능 | 생성 시 기존 인스턴스 `cleanup` 후 재설치, `installSeq`로 추적 |
| D4 | ART.js 전반 | 구문 PASS를 기능 PASS로 오인 가능 | `verdict` PASS 조건에 모델 대조 OK + wa24 경계 포착 + 표본>0 + shake ±2를 모두 요구 |

## 브라우저 사용 (실제 컷신 인수 — QA 종료 인계 후 별도)

`?test=1&cutscene=1` 로 PRO 시퀀스 진입 후 `wa24-observer.cjs` 전체를 DevTools 콘솔에 붙여넣으면 자동 설치·수집.
종료: `window.__wa24obs.cleanup()` → 요약 JSON 반환(`verdict` 포함).

- 게임 상태·렌더 경로·원화·로더 불변. 순수 전역 읽기 + 순수 함수(`_ease.out`,`_cutShake`) 샘플만.
- 실제 브라우저/게임 실행은 이 세션에서 수행하지 않음(게이트: MAP/ART/UIUX/ANIMVFX는 QA 종료 인계 전 보류).

## 소스 대조 기대값(EXPECT) 근거 — docs SSOT 일치 확인

| id | t(ms) | dur | img | fadeIn | docs 근거 |
|---|---|---|---|---|---|
| wa23 | 68200 | 5400 | cin_remember.jpg | 1 | — |
| wa24 | 73600 | 2400 | cin_fallhell_custom.jpg | 400 | `docs/cinematic/WARINTRO_REMASTER_20260909.md:44`(73.6/2.4), `MAP-ART-인수검토.md:108`(73600ms) |
| wa25 | 76000 | 2900 | null | 400 | — |

wa24 카메라 zs1.08→ze1.04 ease out, vfx shake:1 은 `docs/.../ui03-evidence/ART-팀검토.md` 및 `ART_TEAM_MASTER.md §204`와 일치.
