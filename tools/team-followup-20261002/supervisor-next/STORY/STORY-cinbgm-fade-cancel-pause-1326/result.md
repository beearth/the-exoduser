# STORY-cinbgm-fade-cancel-pause-1326 — `_cinBgm` 페이드 취소 시 구 Audio pause 보장 (1312 후보 정정)

담당 STORY(Claude, UUID `3ed6e74d-5552-4d7b-a04b-dc5945e0f3d7`, provider Claude Code) · 한국어.
credit: epoch `rolling-after-0d918990-1326`, STORY **newOwnedFileCredits=2** → `checks.mjs`+`result.md` 2파일. production·공유docs·Git·실게임/세이브/서버/빌드·audio장치·이미지·삭제/이동/타인WIP/새세션/권한 0. `productionApplied=false`, 실제 청취 Gate 미인수.

## 0. 메타·SHA·시각

| 항목 | 값 |
|---|---|
| root checkpoint | `0d918990`(raw23 보존), epoch `rolling-after-0d918990-1326`, Changes 열림 64 |
| index.html whole SHA256 | `38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8` |
| `startCinBgm`(2130) SHA256 | `08d2a6ec4cf87f702de709fa8b390583a8e6742189c578e92e94450a1cff5e44` |
| `stopCinBgm`(2135) SHA256 | `85684235fc4cb13907ba37a168bce9feb97fddfb50fe09c0bd5f1dd9c398901e` |
| checks.mjs SHA256(최종) | `599f89704a9325ff41d739ea2e015b64b7b73ed12dee04a32013b00d1046f508` |
| checks 실행 2차 UTC | 2026-10-02T13:30:21Z → **exit 0, 18 PASS / 0 FAIL** |

## 1. 1312 후보의 실제 결함 (감독 HOLD 수용)

1312(`STORY-review...` 메모리 보고)의 `_cinBgmFade` 후보는 **`clearInterval(_cinBgmFade)`만 하고 구 Audio `_a`를 `pause`하지 않았다**. 페이드 진행 중(vol 예: 0.3) 취소되면 self-clear(→pause) 경로까지 끊겨 **구 source가 pause되지 않고 영구 재생**된다. 그런데 설명은 "pause한다"고 주장 → 사실과 불일치. 또 `_cinBgmFade`를 단일 모듈 변수로 쓰면 **이전 fade의 self-clear 콜백이 새 fade의 interval을 clear하거나 소유자를 null로 만들 수 있다**(aliasing).

## 2. 정정 patch 후보 (productionApplied=false — root 적용)

취소 경로가 **구 Audio를 명시적으로 pause** + **fade별 소유자(`{a,id}`) 캡처**로 이전 콜백이 새 fade/Audio를 건드리지 못하게:
```js
let _cinBgmFade=null; // {a, id}
function _cancelCinBgmFade(){
  if(_cinBgmFade){ clearInterval(_cinBgmFade.id); try{_cinBgmFade.a.pause()}catch(e){} _cinBgmFade=null; }
}
function startCinBgm(){ try{
  _cancelCinBgmFade();                      // 진행 중 페이드 취소 + 구 Audio pause
  if(_cinBgm)return;
  _cinBgm=new Audio(_CIN_BGM_TRACKS[~~(Math.random()*_CIN_BGM_TRACKS.length)]);
  _cinBgm.volume=0.6; _cinBgm.play().catch(()=>{});
}catch(e){} }
function stopCinBgm(){
  _cancelCinBgmFade();                      // 중첩 페이드 방지(구 Audio pause 포함)
  if(!_cinBgm)return;
  const _a=_cinBgm; _cinBgm=null;
  const _fade={a:_a,id:null};
  _fade.id=setInterval(()=>{
    if(_a.volume>0.06){ _a.volume=Math.max(0,_a.volume-0.06); }
    else { clearInterval(_fade.id); if(_cinBgmFade===_fade)_cinBgmFade=null; try{_a.pause()}catch(e){} }
  },50);
  _cinBgmFade=_fade;
}
```
- **취소 시 구 Audio pause**(1312 결함 해소 — 영구 재생 없음).
- **fade별 `_fade={a,id}` 소유자 캡처** + self-clear는 `_fade.id`/`_a`(로컬) 참조, `if(_cinBgmFade===_fade)`일 때만 모듈 null → 이전 콜백이 새 interval clear/새 Audio pause 불가.
- **불변:** 볼륨 0.6/0.06, 50ms, 트랙 풀(랜덤 선택 verbatim), 대사/수치/트랙·leaf DOM 무관. 보이스/네이티브/asset 교체 0.

## 3. Audio·timer 원장 검증 (checks.mjs, 18 PASS / 0 FAIL)

실제 `startCinBgm`/`stopCinBgm`(2130/2135) **verbatim 추출**을 baseline(original)으로, 1312(flawed)·정정(corrected)을 가짜 Audio(volume/play/pause)·가상 timer로 대조. (생성순 식별자 기반 단언 — 트랙 src 무관.)

| 시나리오 | original(원문) | flawed(1312) | corrected |
|---|---|---|---|
| **정상 1회 페이드**(start→stop→advance) | a 0개 재생/timer 0 | a 0개/timer 0 | a 0개/timer 0 (세 변형 모두 정상) |
| **빠른 재진입 취소**(start a1→stop(페이드)→페이드 중 start a2→advance) | a1 pause·a2 재생·재생1·orphan 0 (self-clear로 a1 종단 pause; 단 **취소 전 전환 구간 overlap 존재**) | **a1 pause 안 됨(영구 재생)·재생 2개 overlap** (1312 버그 재현) | **a1 즉시 pause·a2 재생·재생1·orphan 0** |
| **2회 연속 재진입**(corrected) | — | — | 재생 0·orphan 0 (이전 콜백이 새 fade 미간섭) |

→ 정정 후보는 (a) 1312의 영구 재생 제거, (b) 재진입 즉시 구 트랙 pause로 overlap 제거, (c) 정상 단일 페이드 보존, (d) 소유자 비교로 콜백 간섭 차단. original은 결국 self-clear되나 취소 전 전환 overlap이 남음(정정이 이를 즉시 해소).

### 원 stdout (2026-10-02T13:30:21Z)
```
startCinBgm SHA 08d2a6ec4cf87f702de709fa8b390583a8e6742189c578e92e94450a1cff5e44
stopCinBgm SHA 85684235fc4cb13907ba37a168bce9feb97fddfb50fe09c0bd5f1dd9c398901e
정상 1회 페이드: original/flawed/corrected 각 재생0·timer0 (6 PASS)
빠른 재진입: original a1 pause/a2 재생/재생1/orphan0 · flawed a1 영구재생/재생2 · corrected a1 pause/a2 재생/재생1/orphan0
corrected 2회 재진입: 재생0·orphan0
== 18 PASS / 0 FAIL ==  exit=0
```
(1차 실행 exit1은 내 test 단언 버그 — 재작성 rewrite가 트랙을 `[0]`로 하드코딩했는데 src='t1'을 기대. 식별자 기반 단언으로 정정 후 18 PASS. 후보 결함 아님, 숨기지 않음.)

## 4. docs rg·인계

docs rg(백업 제외): `startCinBgm`/`stopCinBgm` → SUPERVISOR_STATE(operational, 감독 소유)만. `_cinBgm` → 0. `prologue_theme`/`_CIN_BGM_TRACKS` → `6사운드디자인/주제가_SUNO_프롬프트.md`, `cinematic/WORLD_INTRO_INGAME_20260907.md`·`PROLOGUE_STORYBOARD_v1.md`·`WARINTRO_BGM_V22_20260910.md`·`STEAM_TRAILER_02`. → **BGM 트랙 풀/수명 계약은 있으나 `stopCinBgm` 페이드-취소 시 구 Audio pause 수명은 미기재**. root가 `WORLD_INTRO_INGAME_20260907.md` BGM 수명 절에 "stopCinBgm 페이드 취소 시 구 Audio pause + fade 소유자 캡처" 계약 신규 기록(전체 rg 동기화). 공용 `index.html` 반영·Git은 원총괄/root. 트랙 풀/볼륨 수치 변경은 총괄 소유.

## 5. Gate·대역·다음

- **대역/Gate:** 가짜 Audio/가상 timer 원장만. 실제 WebAudio 디코드·동시 재생 **청취·native 6단계·화면 미검수(UNKNOWN)** — source/fixture와 청취 인수 분리. (SUPERVISOR_STATE의 원문 `startCinBgm`/`stopCinBgm` 라인은 operational 참조이며 canonical 아님.)
- **보존:** 1134(showImg latent gen)·1212(키보드 const 바인딩)·1300(게임패드 `_GP.off` 3id)·1326(본건 BGM 페이드 취소) 각 불변. 이전 검사 재실행 0.
- **다음(자율):** credit 소진. 승인 대기 없이 다음 독립 승인 소스 접점(예: `_worldIntroSubtitles` 재진입 track 재사용/`cinLang` onchange 입력 수명)을 **메모리로 계속**; 새 credit 때 저장. Changes 80 checkpoint/100 전 신규 중단 준수. 보호2_3·Q-only magic·attack ticket·타인WIP·사용자 game/save 보존. 마일스톤 문서 SHA 불일치는 역사값 기록.
