# ENEMY-20261002-ROUNDROBIN-BOUNDARY 결과

root가 지적한 f06 라운드로빈 후보의 **시작 인덱스 경계 결함**을 실제 후보 헤더 실행으로 검증하고, **최소 보강 후보**를 작성했다. 원 `f06-source-*` 는 읽기전용 보존, 보강은 별도 `roundrobin-boundary-*` 로 제출(미적용).

- UTC 수신 16:10 / Read 16:11 / Edit 16:14 / 검수 16:17 / 완료 16:18 (2026-10-01).
- 중복 확인: `roundrobin-boundary-*` 신규, `G._eLoopStart` production 사용 0건.

## 결함 — 실행으로 검증(root 지적 사실)
원 f06 후보 헤더식 `const _eStart=_elen>0?((G._eLoopStart|0)%_elen):0;` 를 **그대로 실행**:

| `G._eLoopStart` | `(v|0)` | 원 `_eStart` | 꼬리(39) 방문 | coverage/40 |
|---|---|---|---|---|
| `-1` | -1 | **-1** | ✗ | 39 |
| `2147483648` (2^31) | -2147483648 | **-8** | ✗ | 32 |
| `1e21` | -559939584 | **-24** | ✗ | 16 |

- `|0` 은 ToInt32 이라 **2^31·큰값을 음수로 wrap**, `-1` 도 그대로 음수. JS `%` 는 피제수 부호를 유지 → `_eStart<0`.
- 이어 `_ei=(_eStart+_k)%_elen` 가 음수가 되고 `const e=ens[_ei]`=undefined → **`if(!e)continue` 가 조용히 스킵**. 결과: **유효 꼬리 인덱스가 매 tick 누락**(= F06가 고치려던 '꼬리 기아'의 재발). 음수 `_ei` 는 hole 가드에 가려져 에러도 안 난다.
- `2^32`(→`|0`=0)·`-(2^31+1)`(→`|0`=+2147483647) 은 음수는 아니지만 **회전 위치를 상실/점프**(비일관). `undefined`/`NaN`/`Infinity`/정상 정수는 안전.
- ⇒ "원 후보가 음수/stale 을 안전 정규화한다"는 주장은 **반증됨**(미검증이 맞았음).

## 최소 보강
`before.txt`(원 루프 '함수' 원문) 대비 **헤더 정규화만** 교체:
```
- const _eStart=_elen>0?((G._eLoopStart|0)%_elen):0;
- G._eLoopStart=_elen>0?(((G._eLoopStart|0)+1)%_elen):0;
+ const _rr0=G._eLoopStart;
+ const _eStart=(_elen>0&&typeof _rr0==='number'&&Number.isFinite(_rr0))?(((Math.floor(_rr0)%_elen)+_elen)%_elen):0;
+ G._eLoopStart=_elen>0?((_eStart+1)%_elen):0;
```
- `|0` 제거 → 32비트 wrap 없음. `typeof+Number.isFinite` 가드로 `NaN/Infinity/undefined/비수치→0`. `(((Math.floor(x)%_elen)+_elen)%_elen)` 로 **음수·큰값 모두 `[0,_elen)` 로 fold**.
- `_eStart∈[0,_elen)` 보장 → `_ei=(_eStart+_k)%_elen∈[0,_elen)` **항상 유효** → 꼬리 누락 없음. 다음 tick `G._eLoopStart` 가 작은 비음수로 재기록되어 **self-heal**.
- **불변 유지**: LOD parity(`_ei` 기준), 예산 `(IS_MOBILE?8:12)`·간격 `(IS_MOBILE?8:32)`, `_k` 카운터, `if(!e)continue` hole 가드, `updateE`·바디 전부.

## 산출물 (ENEMY 소유, roundrobin-boundary-*)
| 파일 | sha256 | 비고 |
|---|---|---|
| `roundrobin-boundary.fixture.mjs` | `6382c056…` | 실제 후보 헤더 추출·실행 반례 + 보강 검수(8 PASS) |
| `roundrobin-boundary.before.txt` | `f379376e…` | 원 루프 '함수' 원문(before 보존) |
| `roundrobin-boundary.game.patch` | `3f27b650…` | 하드닝 대체본 → `game.html` (**미적용**, dry-run clean) |
| `roundrobin-boundary.game-easy-test.patch` | `70f82e96…` | 하드닝 대체본 → `game-easy-test.html` (**미적용**, dry-run clean) |

대조 소스: `game.html` `7631f5a0…`, `game-easy-test.html` `7d68b80a…`(미수정). game.html 은 공유 체크아웃에서 드리프트했으나 루프 헤더 동일, 보강 patch 는 현 파일 기준 재생성·dry-run 통과.

## 검수 (fixture 8 PASS / 0 FAIL, 가상·소형)
1. **반례(원후보)**: `-1/2^31/1e21` 에서 실제 `_eStart<0` + 꼬리 미방문 + coverage<40.
2. **정상 start(원후보)**: `0/39/undefined/NaN/Infinity` 음수 아님.
3. **보강 전체 start**(음수/2^31/큰값/stale/safe): **전 인덱스 1회 커버 + 꼬리 포함 + 음수 _ei 0 + nextStart 정규화**.
4. **보강 self-heal**: bad start(2^31)라도 N tick 내 모든 인덱스가 1회 선두(영구 기아 없음).
5. **경계**: splice(축소)·spawn(증가)·hole(undefined 슬롯) — 크래시·범위밖 없음(`if(!e)continue`·`_elen` 캡처).
6. **LOD parity**: 보강 후 `_ei∈[0,_elen)` 실제 인덱스 → `(tierFrame&m)===(_ei&m)` 원본 동일.
7. **보호계약**: soft-cap 코드 없음·공격티켓 미도입·예산식 보존.

fixture↔patch 정합: fixture 의 보강 `_eStart` 식 == patch 추가 `_eStart` 식(byte 동일).

명령: `node --check` exit0, `node fixture` 8/0, `patch --dry-run -p1` 두 파일 clean(쓰기 0).

## 적용 여부 구분
- `game.html`/`game-easy-test.html` **직접 미수정**(읽기전용). patch 는 dry-run 으로 **적용성만 확인**. 실제 반영은 root/QA 가 `patch -p1` 로(이 하드닝본이 f06 후보를 대체).
- 원 `f06-source-*` 미수정 보존(플래그된 버전 그대로).

## 한계 / 남은 라이브 게이트
- **성능 개선 주장 없음.** 본 보강은 **시작 인덱스 정규화(커버리지 정확성)**만 — round-robin 은 여전히 '영구 기아'만 분산하고 매 tick 처리는 보장하지 않는다. 지속 과부하 잔여 gap 해소는 **QA 소유 soft-cap 결정**(무조건 활성화 0).
- 실게임 실행/계측/육안은 QA 실측 구간. 사용자 게임 입력/리로드/닫기 없음.

## docs 반영안 (직접 미편집 — 총괄 통합용)
`ENEMY_AI_TEAM_MASTER.md §3-C QA 인계란 "후보 A (round-robin)"` 행에 보강:
> 경계 하드닝 완료: 시작 인덱스 `|0` 금지, `(((Math.floor(x)%_elen)+_elen)%_elen)` 비음수 fold + `Number.isFinite` 가드(음수/2^31 넘침/큰값/stale self-heal). 반례·보강 검수 `tools/team-followup-20261001/ENEMY/roundrobin-boundary.*`(8 PASS). 대체 patch = `roundrobin-boundary.{game,game-easy-test}.patch`(미적용, dry-run clean). per-tick 비보장·soft-cap 은 QA 결정 유지.

## 인계
root/QA: 하드닝 대체 patch 적용 시 음수/오버플로/stale start 안전(꼬리 누락 제거), LOD·예산·바디 불변. 라이브 실측·soft-cap 결정은 QA. 이 한 건 종료, 다음 잔여 게이트 인계.
