# 악의폭풍 포커스 취소 소스 인수 — 2026-10-02

등록 blur 또는 hidden 이후 악의폭풍의 조준·충전 상태가 남아 다음 프레임에서 유령 릴리스되는 source 결함을 양판에서 정리했다. 수정은 기존 `_clearHeldInput` P 가드에 `P._msAiming=false;P._msCharging=false`를 추가하는 각 1접점뿐이다. 일반 악의폭풍과 boneStorm·elecRepent 합체의 정상 릴리스 비용·CD·생성 순서·효과 trace는 그대로다.

| 인수 항목 | 값 / 경계 |
|---|---|
| 실제 checkout | `/Users/fordeargamers/Projects/exoduser-migration-20261001` |
| root 제공 시작 HEAD | `5420819d7b406590578b1bae57eabad071e754e1` |
| 생산 적용 / 인수 | true / true, **악의폭풍 focus guard 소스 계약만** |
| 실제 게임 / native 입력 / visual / audio 인수 | 모두 false |
| 코드 변경 | HTML별 1접점, 86→124바이트(+38); 변경 접점 밖 원문 바이트 동일 |
| 소스 영수증 | `tmp/mac-migration-runtime/continued-review-20261002/storm-focus-backup/receipt.json` |
| 영수증 SHA-256 | `a600eb07bd3d9c87c22d8362a73688270ab52f6329b2678368e3cea4a40f1227` |
| 새 actual-source 검사 | `test/maliceStormFocusCancellation.test.cjs` |
| 검사 SHA-256 | `d340c1133fdd07c621c47d7f51afb4af4f9abe7ad55df0044668b710de000b18` |
| 문서 담당 실행 | source/test·기존 검사 재실행 0; 최종 원문·영수증·소스 SHA 대조 및 docs 검색/동기화만 |

## 소스 접점과 원문 보존

| 파일 | helper 선언 / 변경 줄 | 등록 blur / hidden | 슬롯 라우터 / 악의폭풍 aim·release | GP LT 경계 |
|---|---|---|---|---|
| `game.html` | 12877 / 12883 | 12886 / 12887 | 12435 / 35071 | 13463 |
| `game-easy-test.html` | 12273 / 12279 | 12282 / 12283 | 11832 / 33878 | 12860 |

줄 번호는 최종 source SHA 기준이다.

| 파일 | 최종 SHA-256 |
|---|---|
| `game.html` | `275929250b83c0c131b0183edd58fc69d364b06b63f478be79c58320a70e071e` |
| `game-easy-test.html` | `12343b045b5b66c42559c74b2db3ff3f1c403853d9bfb316d98f4fe4950352b3` |

기존 가드:
```js
if(typeof P!=='undefined'&&P){P._beamHold=false;P._mmAiming=false;P._mmCharging=false}
```

현재 가드:
```js
if(typeof P!=='undefined'&&P){P._beamHold=false;P._mmAiming=false;P._mmCharging=false;P._msAiming=false;P._msCharging=false}
```

소스 담당 영수증은 역치환 시 원본 HTML과 바이트가 일치하고 변경 접점 밖 전체 바이트가 보존됨을 기록한다. 기존 mortar guard·보스 필드 복귀·SOUND start catch·다른 게임/렌더/자원 경로는 이 변경에 포함하지 않았다. `_msRel`, 스킬 슬롯, 피해·DPS·사거리·지속·틱·비용·CD·합체 설계를 새로 변경하지 않았다.

## 취소와 상태 보존 계약

| 입력 / 상태 | 현재 소스의 결과 | 실제 검수 경계 |
|---|---|---|
| 등록 `blur` | 기존 held 입력 정리 + storm aim/charge false | 선택한 실제 리스너 → helper → 다음 추출 storm block |
| 등록 hidden `visibilitychange` | `document.hidden` true일 때 helper 호출, 같은 취소 | synthetic hidden property·등록 콜백 |
| visible `visibilitychange` | helper 호출 안 함, 기존 held 상태 유지 | synthetic visible 콜백 |
| 취소 후 다음 추출 프레임 | 추가 zone/wall·MP/악의 차감·CD·RNG·SFX/텍스트/숙련도 기록 0 | 진입 후 취소 직전 효과를 기준으로 비교 |
| 반복 취소 | 위 상태에서 멱등 | 실제 helper의 반복 호출 |
| aim/charge 4조합 | 두 flags false; `_msAimKey`·`_msDist` 보존 | key `Digit1`, dist731 fixture |
| 기존 상태 | 스킬·MP·악의·CD·이미 생성된 zone을 초기화하지 않음 | 해당 정규화 상태 비교 |
| fresh input | 취소 뒤 새로운 입력으로 정상 재조준 | 같은 선택 입력 fixture |
| 기존 비storm 정리 | beam/mortar·held/dash/cutscene cleanup 유지 | 기존 helper의 추출 경계 |

“추가 효과 0”은 진입 전에 발생한 숙련·조준 기록을 삭제한다는 뜻이 아니다. 취소 직전 baseline 이후 새 release 효과가 생기지 않는다는 뜻이다. 이 helper 검수만으로 pause/death/revive/stage 또는 전체 스킬 수명주기를 완료 처리하지 않는다.

## 정상 릴리스 자원·합체 순서

아래는 이번 패치로 도입한 새 밸런스가 아니라, 변경 전후 동일한 실제 릴리스 구현이다.

| id / 모드 | MP 게이트·차감 | 악의 게이트·차감 | CD | 생성 |
|---|---|---|---|---|
| `maliceStorm` / 악의폭풍 | 라우터·일반 release에 없음 / 0 | 없음 / 0 | `P._msCd=1200f` | storm1; `maxT=600`, `r=200+(Lv-1)*22` |
| `boneStorm` / 뼈폭풍 | MP50 미만 거절 / 고정50 직접 차감 | 충분량 게이트 없음 / raw12 clamp | `P._bnsCd=1500f` | boneWall1 + boneStorm1 |
| `elecRepent` / 해골번개·참회 귀환 | 위 합체 호스트와 동일 | 위 합체 호스트와 동일 | `P._bnsCd=1500f` | boneWall1 + boneStorm1 + 조건부 hellRay1 |

`_msBF=_isFused('boneStorm')||_isFused('elecRepent')` 분기의 순서는 다음과 같다.

1. `if(P.mp<50)`이면 부족 메시지를 남기고 생성·차감·CD·RNG 없이 거절한다.
2. `P.mp=Math.max(0,P.mp-50)`로 MP50을 직접 차감한다.
3. boneWall과 boneStorm zone을 생성한다.
4. `playSample('skull_summon',.6,_r(.9,.15))`를 호출한다.
5. `G.mats=Math.max(0,G.mats-12)`로 raw 악의12를 차감한다.
6. `_erF&&P.skills.hellRay>=1`이면 추가 hellRay 생성/오디오 호출을 한다.
7. voice RNG, `P._bnsCd=1500`, 숙련도, aim 해제가 이어진다.

MP50은 `pMagicCost`·최대MP 비율 비용이 아니다. raw 악의12는 `_malCost(12)`로 할인한 값이 아니며, 해당 분기에 악의 충분량 게이트가 없다. 악의가12 미만일 때의 clamp는 소스 정적 사실이고, 이번 정상 fixture는 mats30을 사용했으므로 낮은 악의의 동적 실행 PASS로 기재하지 않는다. 추가 hellRay에는 이 합체 분기의 별도 단독 hellRay MP100 차감이 없다.

MP49에서 두 합체를 정상 릴리스한 keyboard fixture는 추가 zone/wall·MP/악의 차감·CD·RNG 0과 원본 동일 trace를 확인했다. 이 실패는 **aim 유지 / charging false / 부족 메시지 유지**이며, focus 취소가 만드는 aim false와 구분한다.

### 양판 × keyboard/GP LT 정상 trace 12개

조건은 Lv1·MP100·mats30·seed `0x5EED`와 하니스의 장비/피해/입력 대역이다. 각 행은 양판과 두 입력 경계에서 4개의 정상 trace를 구성하며, 전체 12개를 메모리 guard 제거 원문 및 생산 전 baseline과 정규화 상태/효과 trace로 대조했다.

| 모드 | MP 전→후 | 악의 전→후 | `_msCd` / `_bnsCd` | wall / zone | 이 seed fixture RNG 호출 |
|---|---:|---:|---:|---|---:|
| plain | 100→100 | 30→30 | 1200 / 0 | 0 / storm1 | 5 |
| boneStorm | 100→50 | 30→18 | 0 / 1500 | 1 / boneStorm1 | 2 |
| elecRepent | 100→50 | 30→18 | 0 / 1500 | 1 / boneStorm1 + hellRay1 | 5 |

RNG5/2/5는 이 seed·fixture의 호출 관측값이며 실제 게임의 고정 횟수·분포·voice/SFX 보장이 아니다. 기록용 SFX/샘플 대역의 trace 동등도 실제 backend·native 청취 인수를 뜻하지 않는다.

## 실제 소스 검사와 대역

새 검사는 디스크에서 선택 gameplay keydown/keyup·등록 blur/hidden 콜백·`_dispatchSkillSlot`·`_clearHeldInput`·`_isFused`·`_r`·`EL`·`_gpInjectKey`·GP LT modifier/ABXY 경계·전체 storm aim/release if를 추출한다. update if를 `frame(sp)`, LT 경계문을 `padBoundary()`로 감싼다. 음성대조는 같은 원문 메모리에서 추가된 storm 2문장만 제거한다.

keyboard는 실제 keyup/KH release 경로와 KBM mouse의1000 clamp를 실행한다. GP LT+조합 release는 실제 `MBjust[0]` 분기를 실행하며 KH release를 강제한 대체 모형이 아니다. 다만 전체 `_pollGamepad`나 하드웨어 입력 실행은 아니다.

| 대역 / 추출 경계 | 포함 | 포함하지 않은 것 |
|---|---|---|
| event/document | 등록 리스너, synthetic bubbling KeyboardEvent, hidden, 닫힌 UI target | native 이벤트 전달·전체 DOM |
| player/game/input/slot | P/G/container fixture, slot eligibility true, absorbed false | 전체 게임 상태·실제 장비 계산 |
| GP | 실제 LT modifier와 ABXY 경계, 주입 key helper | navigator·전체 poll·실기기 연결/전환 |
| 조준/피해 | autoAim recorder, 고정 damage/equipment multiplier, `Math.hypot` 거리 | 실제 전투 대상·피해/DOT |
| 효과/RNG | SFX/playSample/addTxt/shake/숙련/message recorder, seeded RNG | 실제 오디오 dispatcher/backend·live RNG·렌더 |
| 상태 비교 | JSON 정규화 state/effect trace | wall hitSet의 실제 충돌 처리; VM Set이 `{}`로 직렬화되는 한계 |

전문팀 원자료 `tools/team-followup-20261002/supervisor-next/SKILL/SKILL-storm-blur-0548/`는 복사 함수·부분 라우터 모형의 메모리 후보 보고다. 원자료의 `productionApplied=false`는 당시 제출 시점이며 그대로 보존한다. 이번 생산 인수는 새 실제 디스크 추출 검사와 최종 영수증에만 연결한다. 전문팀 보고의 “runtime”을 실게임·native PASS로 바꾸지 않는다.

## 검수 수치와 이력

| 새 actual-source 검수 그룹 | HTML별 테스트 | 양판 합계 | 최종 |
|---|---:|---:|---|
| blur/hidden × 3모드 × 2입력 | 12 | 24 | PASS |
| 정상 release × 3모드 × 2입력 | 6 | 12 | PASS; 정상 trace12 동등 |
| storm 가드 제거 음성대조 | 1 | 2 | PASS; 내부12 ghost-release 관측 |
| aim/charge 4조합 | 1 | 2 | PASS |
| P null/undefined | 1 | 2 | PASS; 선언된 P에 null/undefined 대입 범위 |
| visible / fresh rearm | 1 | 2 | PASS |
| 기존 nonstorm cleanup | 1 | 2 | PASS |
| MP49 두 합체 실패 | 1 | 2 | PASS |
| **합계** | **24** | **48** | **48 PASS / 0 FAIL**, exit0 |

음성대조 내부12관측·정상 trace12는 위 테스트에 포함된 증거로, 추가 테스트 수에 합산하지 않는다.

| 이력 / 정적 검사 | 수치 | 해석 |
|---|---|---|
| 생산 전 같은 새 하니스 | 48 중20 PASS /28 FAIL | 역사 baseline; charged 취소24 + lifecycle4 실패 |
| 최종 생산 소스 | 48/48 PASS | 이번 source 인수 |
| 구문 1회 | 양판 각 inline JS6 + importmap JSON1 = JS12/JSON2 PASS | HTML/game/module 실행 없이 구문만 확인 |
| 하니스 setup 이력 | 추출 anchor 및 GP cold-state setup 보정 | 로그로 별도 보존; 생산 결함/최종 실패 수와 합산하지 않음 |
| 기존 전문팀/총괄 검사 | 재실행0 | 이전 PASS 반복 없이 새 목적의 실제 소스 검사만 |

원 영수증의 final TAP 경로는 `storm-focus-backup/final.tap`이고 SHA는 `a9a733d2fa5904cbdf1d77290a2547ea6fd3e155ece1e6201ae4dc2c71bf4637`이다.

## docs 전체 검색과 정본 동기화

관련 키워드를 docs 전체에서 head/출력 생략 없이 rg로 저장했다. 초기 broad/targeted 검색, 최종 source 이후 broad 검색, 소스 담당의 after-code 대상 검색은 각각 아래와 같다.

| 검색 | 패턴 / 시점 | 행 / 바이트 | 보존 |
|---|---|---|---|
| docs 담당1 | storm·악의폭풍·_ms·조준·blur·hidden·focus·cancel | 1939 / 850233 | raw 전문 + SHA |
| docs 담당2 | maliceStorm·boneStorm·elecRepent·held helper·visibilitychange 등 | 169 / 49910 | raw 전문 + SHA |
| docs 담당3 | 최종 source 뒤 broad + boneStorm/elecRepent | 1946 / 851949, 340파일 | raw 전문 + SHA; 초기 union 대비 새 파일0 |
| source 담당 after-code | 정확 ID/flags/helper/visibility 등 | 183 / 52281, 64파일 | 원 receipt·행별 classification 보존 |

문서 담당의 초기 두 검색 union341파일을 경로별로 분류하고 최종 검색과 대조했다. 시스템별 숫자·공식·상태 영향은 아래처럼 처리한다.

| 분류 | 동기화 / 보존 판단 |
|---|---|
| 스킬 정본4 + 키바인딩 정본1 | 이전 mortar-only 범위의 storm UNKNOWN을 이번 source/선택 입력 경계로 보강, 기존 원문 prefix 보존 append |
| 4월 자원/DPS/피해 표3 | 날짜·추정 근거를 보존하고 현재 비용/순서를 append; 기존 damage/DPS·역사 비용 행 치환0 |
| root CHANGELOG / CONTINUOUS-INTEGRATION | root 소유, 문서 담당 수정0 |
| 성능 | blur/hidden 프레임·시간축과 타이머 성능 계약 변경 없음; 검색분류 보존, 별도 성능 측정/PASS 추가0 |
| gamepad 상세 매핑 | LT/ABXY 매핑 자체 변경 없음; 키바인딩 정본에 실제 LT 경계와 전체 poll 미검수 기록 |
| 사운드/VFX/장판/아이템 | 기존 매핑·생성·피해·렌더·자원 hook 변경 없음; native 청취·visual·피해/DPS 인수0 |
| 보호2_3·백업·과거 운영/검수·다른 시스템 | 원문 및 역사 판정 보존; 검색 매칭만으로 완료 상태 덮어쓰기0 |

### 역사 비용표3의 정확한 분리

| 기존 정본 | 원문 기준 / 해당 행 | 이번 처리 |
|---|---|---|
| `스킬별_DPS_자원소비표.md` | 2026-04-18 코드 분석, maliceStorm MP `90 추정` | 당시 추정/DPS 기준 보존; 현재 일반0/합체50·raw12와 구분 |
| `자원소비량표.md` | 2026-04-14, 궁극기 boneStorm `mmp×30%` | 역사 행 보존; 현재 고정50 직접 차감 명시 |
| `스킬데미지공식표.md` | 2026-04-11, 궁극기 boneStorm `mmp 30%` | 역사 damage/range/formula 보존; 현재 자원과 피해 검수 범위 구분 |

이 3표의 기준일은 본문 헤더에 있으므로 현재 구현 행을 임의 변경하는 예외를 사용하지 않는다. 총8기존 정본 모두 원문 prefix bytes100% 및 CRLF/혼합개행을 보존한 append다. 신규 보고서는 EOF 개행1개다.

정본 경로:
- `docs/2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md`
- `docs/2_1 스킬관리+합체시스템+자원/SKILL03_설치확정_자원검수_20261001.md`
- `docs/2_1 스킬관리+합체시스템+자원/SKILL_자원게이트_감사_20261001.md`
- `docs/2_1 스킬관리+합체시스템+자원/자원리젠+소모공식.md`
- `docs/3.3 키바인딩+설정/3.3 키바인딩+설정.md`
- `docs/14밸런스+수치테이블/스킬별_DPS_자원소비표.md`
- `docs/14밸런스+수치테이블/자원소비량표.md`
- `docs/14밸런스+수치테이블/스킬데미지공식표.md`

백업·검색·원문 prefix/SHA·현재 source pin·문서 최종 해시의 완료 영수증은 `tmp/mac-migration-runtime/continued-review-20261002/storm-focus-docs-backup/2026-10-02T07:26:54.470Z-511ea41a-1438-476c-a2de-25aa71eba227/completion.json`에 기록한다.

## 남은 Gate

| 범위 | 이번 판정 |
|---|---|
| OS/브라우저 실제 이벤트 전달, alt-tab/focus, hidden rAF | 미검수 |
| 실제 gamepad·navigator·전체 poll/update·연결 전환 | 미검수 |
| pause/death/revive/stage·전체 스킬 수명주기 | 미검수 |
| 실제 장비/피해·DOT tick·wall 충돌·live RNG | 미검수 |
| GPU/VFX/렌더·native playback·청취 | 미검수 |
| game/save/storage/server·build/package/sign/deploy | 실행0 / 미인수 |

소스 회귀 PASS는 실게임·native 입력·visual/audio PASS를 대체하지 않는다. 이번 인수 범위 밖의 다른 스킬 취소·전체 자원 감사·기획 비용 조정은 별도 근거가 필요하다.
