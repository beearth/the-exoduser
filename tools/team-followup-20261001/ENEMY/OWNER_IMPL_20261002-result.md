# ENEMY-20261002-F06-SOURCE-CANDIDATE 결과

승인된 **ENEMY-F06(배열 꼬리 AI 영구 기아)**의 실제 update 루프용 **최소 source 후보(라운드로빈 시작 인덱스 회전)**와 source-anchored 실행 fixture를 작성했다. 관측기(et3-probe) 통합은 반복하지 않았다.

- 수신 2026-10-02T00:30 / 첫 Read 00:31 / 첫 Edit 00:38 / 검수 00:42 / 완료 00:43 (KST).
- HEAD `727b095b`. 중복 확인: `ENEMY/f06-source-*` 신규, `G._eLoopStart` 식별자 game/easy 사용 0건 → 진행 중 후보 없음.
- **현행 실측밴드에서는 break=0**이었고 **합성 부하에서만 재현**된다는 §3-C 사실을 유지(아래 참조).

## 읽은 입력 (읽기 전용)
- `ENEMY_AI_TEAM_MASTER.md §3-C`(ENEMY-F06 + QA 인계란) / `test/enemyTimeBudgetStarvation.test.js`(기존 합성 하니스).
- `game.html` 메인 적 루프(33114~33189, break 33118, 타이머 33143~, LOD 33172~), `game-easy-test.html`(동일 루프 31932~). 두 파일 루프 헤더는 **바이트 동일**.

## source 후보 (미적용 patch)
| 파일 | sha256 | 대상 | 적용 | dry-run |
|---|---|---|---|---|
| `f06-source-roundrobin.game.patch` | `7a00fa39…` | `game.html` | **미적용** | 깨끗이 적용됨 |
| `f06-source-roundrobin.game-easy-test.patch` | `27adbf99…` | `game-easy-test.html` | **미적용** | 깨끗이 적용됨 |
| `f06-source-roundrobin.fixture.mjs` | `71d236ad…` | — | — | 실행본 |

대조 소스 SHA: `game.html` `21235538…`, `game-easy-test.html` `4c408f1e…`(미수정, dry-run 전후 불변 확인).

### 변경 내용(루프 헤더만, 바디 불변)
```
- for(let _ei=0;_ei<ens.length;_ei++){const e=ens[_ei];
-   if(_ei%(IS_MOBILE?8:32)===0&&_ei>0&&!e.ib&&...>(IS_MOBILE?8:12))break;
+ const _elen=ens.length;
+ const _eStart=_elen>0?((G._eLoopStart|0)%_elen):0;
+ G._eLoopStart=_elen>0?(((G._eLoopStart|0)+1)%_elen):0;   // 다음 tick 1칸 회전
+ for(let _k=0;_k<_elen;_k++){const _ei=(_eStart+_k)%_elen;const e=ens[_ei];if(!e)continue;
+   if(_k%(IS_MOBILE?8:32)===0&&_k>0&&!e.ib&&...>(IS_MOBILE?8:12))break;
```
- **round-robin**: 매 physics tick 시작 인덱스를 1칸 회전 → 모든 배열 인덱스가 `_elen` tick 내 1회 선두가 되어 **고정 꼬리의 '영구' 기아를 제거**. 방문 순서만 바뀐다.
- **LOD parity 원 index 유지**: 엔티티 접근·티어 게이트는 **원 배열 인덱스 `_ei`**(`(G._eTierFrame&1|3|7)===(_ei&1|3|7)`) 그대로 → 티어 분산·바디 전부 불변.
- **타임버짓 카운터만 `_ei→_k`**: 예산식 `performance.now()-_eUpdateStart>(IS_MOBILE?8:12)`, 간격 `(IS_MOBILE?8:32)`, `>0` 모두 보존(검사 주기 동일).
- `_elen` 1회 캡처 + `if(!e)continue` + `_elen>0` 가드로 **빈배열/splice/스폰/죽음/reset/stale start/NaN** 경계 안전.

## 보호계약·금지 준수
- 예산 **12ms/8ms 불변**, **공격티켓/동시공격 제한 미도입**, **soft-cap 무조건 활성화 0**(코드 기준 — 문서 주석에만 soft-cap 언급). Q/E 패링·돌진/방패 설계 불변. updateE·탄/스폰/전투 수치 불변.

## 검수 (source-anchored fixture, 9 PASS / 0 FAIL)
가상시계·소형(N=40·소수 tick, 비용은 가상 µs — 실 CPU 측정/긴 스트레스/대형 시뮬 없음):
- **원 게이트 추출·대조**: 원 헤더 블록이 game/easy 양쪽에 그대로 존재, LOD parity `_ei` 기준 확인.
- **원본 재현(결함)**: 고정 start·hot tail → 꼬리 보스 **0/60 tick 처리(영구 기아)**.
- **후보**: 회전 → 꼬리 보스 **46/60 처리·14 스킵·maxGap 8 tick(≤N)**. 영구 기아 해소, **단 per-tick 처리 보장 아님**(스킵 tick 존재).
- **LOD parity**: 처리 엔티티 티어 스케줄은 원 인덱스 `_ei` 기준으로 원본·후보 동일.
- **경계**: 빈배열/stale start(99999%N)/reset/`NaN|0`/hole 전부 크래시·범위이탈 없음.
- **보호계약**: soft-cap 강제 경로 없음·티켓 미도입(코드)·예산식 보존.

명령: `node --check` exit0, `node fixture.mjs` 9/0, `patch --dry-run -p1` 두 파일 clean(쓰기 0).

## 적용 여부 구분 (중요)
- `game.html`/`game-easy-test.html` **직접 미수정**(읽기 전용, root/QA 소유). patch는 dry-run으로 **적용성만 확인**(파일 쓰기 0, 전후 sha 불변).
- 실제 반영은 root/QA 통합 단계에서 `patch -p1 < f06-source-roundrobin.game.patch`(+ easy).

## 남은 라이브 게이트 / 한계
- **성능 개선 주장 없음.** round-robin은 '영구 기아'만 분산하고 **매 tick 처리를 보장하지 않는다**. 지속 과부하 잔여 gap(최대 ~`_elen` tick)의 참 해소는 **QA 소유 soft-cap 과제**(여기서 무조건 활성화하지 않음).
- 실게임 고밀도 전투 육안 "근접/보스 동결" 재확인과 실측 µs(온셋 N·tick당 tick 수)는 **QA 실측 구간(M1 종료/M2 빌드 후)에서 수행**. 현행 실측밴드(적 48~124)에선 break=0(잠재 결함)이라는 §3-C 결론 유지.
- 안전한 source 후보가 성립하므로 정책을 임의 확정하지 않고 QA 결정(soft-cap 병행 여부·stride)으로 넘긴다.

## docs 반영안 (직접 미편집 — 총괄 통합용)
`ENEMY_AI_TEAM_MASTER.md §3-C QA 인계란`의 "후보 A (round-robin)" 행에 다음 한 줄 보강 권고:
> source 후보·fixture 확보: `tools/team-followup-20261001/ENEMY/f06-source-roundrobin.{game,game-easy-test}.patch` + `f06-source-roundrobin.fixture.mjs`. 시작 인덱스 1칸/tick 회전(LOD parity=원 `_ei` 유지, 예산 12/8ms·티켓 미도입 불변). 영구 기아 제거하나 per-tick 비보장(잔여 gap ≤ `_elen` tick) → soft-cap은 QA 결정. 미적용(dry-run clean).

## 인계
root/QA: 위 두 patch 적용 시 원루프가 꼬리 영구 기아를 분산한다(바디·LOD 불변). 실측·육안·soft-cap 결정은 QA. 이 한 건 종료, 다음 잔여 게이트 인계.
