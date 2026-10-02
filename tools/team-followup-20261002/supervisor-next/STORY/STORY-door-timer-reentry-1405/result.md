# STORY-door-timer-reentry-1405 — door-phase 미추적 타이머(prompt-hide/진동)의 재진입 잔존 patch + 검증

담당 STORY(Claude, UUID `3ed6e74d-5552-4d7b-a04b-dc5945e0f3d7`, provider Claude Code) · 한국어.
credit: epoch `rolling-after-ca261460-1404`(STORY 2 credit) → `checks.mjs`+`result.md` 2파일. production·공유docs·Git·실게임/세이브/UI/서버/빌드·삭제/이동/타인WIP/새세션/권한 0. `productionApplied=false`, native/시각/청취 미인수.

## 0. 메타·SHA·시각

| 항목 | 값 |
|---|---|
| root checkpoint | `ca261460`(raw 보존), epoch `rolling-after-ca261460-1404`, Changes 열림 63 |
| index.html whole SHA256 | `38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8` |
| `_clearVidTimers`(2227-2230) SHA256 | `7fcdfc418328699546b2ee2535f200ea40ddb0c4e25c3e6ddb2a844b3cf93940` |
| prompt-hide line(2374) SHA256 | `d0738cc945064f6b3fe0e91a79866a3617e4aaffbaa5e238de7bdf9ce244a86b` |
| 진동 블록(2380-2383) SHA256 | `b58029a8ed65163c4aff26759f51edf4f75ec6dde1e158cbfaee1fca5007719c` |
| checks.mjs SHA256(최종) | `6354781bda9366a9cb554448eb63e70821136e32bcf433ef97951a1c76306597` |
| checks 실행 2차 UTC | 2026-10-02T14:09:12Z → **exit 0, 8 PASS / 0 FAIL** |

## 1. 결함 (door-phase 미추적 타이머가 새 scene DOM/입력 덮음)

`onVidClick`(index.html)은 문 열림 시 아래를 등록하나 **추적하지 않음**:
- **prompt-hide**: `setTimeout(()=>{prompt.style.display='none'},1200)` (2374) — ENTER 안내 숨김, 미저장.
- **진동 8스텝**: `_steps.forEach(s=>{setTimeout(()=>{..._v.playEffect('dual-rumble',...)},s[0])})` (2381-2382, delay 0~3200ms), 미저장.
- (대조) `_vidStartTimer=setInterval(...)` (2391)은 **추적**되어 `_clearVidTimers`가 clear.

공유 door-timer 정리 `_clearVidTimers`(2227-2230)는 **`_vidFadeTimer`/`_vidStartTimer`만** clear → prompt-hide·진동 setTimeout은 종료 경로(`finishCin`·`skipToGate`·`_goCinematic` 모두 `_clearVidTimers` 호출)에서도 **정리되지 않음**. 따라서 door-phase에서 빠른 skip/재진입 시:
- **run1 prompt-hide(+1200ms)가 run2 재진입 이후 발화** → `_goCinematic`이 복원한 ENTER prompt(`prompt.style.display=''`, 2724)를 **다시 `'none'`으로 덮음**(새 scene의 ENTER 안내 사라짐). "종료된 door overlay timer가 새 scene DOM 덮음".
- **run1 진동 8스텝이 teardown 후 새 scene/로비에서 발화** → stale gamepad rumble. "종료된 door 진동 timer가 새 scene 입력(햅틱) 덮음".

## 2. 검증 (checks.mjs, 8 PASS / 0 FAIL) — 실제 `_clearVidTimers` 호출로 정리

원문 `_clearVidTimers`·prompt-hide·진동 블록을 **verbatim 추출**, 가짜 timer/prompt/진동 카운터로 현재식 vs 후보 대조. 정리는 **실제 `_clearVidTimers()` 호출**로 발생(fixture 직접 clear 아님).

| 시나리오 | 현재식 | 후보 |
|---|---|---|
| **S1 재진입**(run1 door → `_clearVidTimers` → prompt.display='' 복원 → advance 3500) | prompt.display **`'none'`(stale가 재진입 ENTER 덮음)** · 진동 **8 발화(teardown 후)** | — |
| **S2 재진입 후보**(추적+clear) | — | prompt.display **`''` 유지** · 진동 **0** |
| **S3 control 정상 1회**(종료 없음, advance 3500) | prompt 정상 숨김(none) · 진동 8 정상 | 동일(정상 동작 보존) |

## 3. 최소 patch 후보 (productionApplied=false — root 적용)

door-phase 타이머를 모듈 추적하고 공유 `_clearVidTimers`에 정리 추가(종료 경로가 이미 호출):
```js
// 모듈 스코프(기존 _vidFadeTimer/_vidStartTimer 인근)
let _vidPromptTimer=null; const _vidVibTimers=[];
// onVidClick 2374:
_vidPromptTimer=setTimeout(()=>{prompt.style.display='none'},1200);
// onVidClick 2382:
_steps.forEach(s=>{_vidVibTimers.push(setTimeout(()=>{try{_v.playEffect('dual-rumble',{startDelay:0,duration:s[1],weakMagnitude:s[2],strongMagnitude:s[3]}).catch(()=>{})}catch(e){}},s[0]))});
// _clearVidTimers(2227-2230) 끝에 추가:
if(_vidPromptTimer){clearTimeout(_vidPromptTimer);_vidPromptTimer=null;}
_vidVibTimers.forEach(id=>clearTimeout(id));_vidVibTimers.length=0;
```
- `finishCin`(2342)·`skipToGate`(2584)·`_goCinematic`(2711)이 이미 `_clearVidTimers`를 호출 → 재진입 전 door 타이머 일괄 정리. `_goCinematic`은 `_clearVidTimers`(2711)를 `playCinematic`(2735) 이전 호출 → stale 미발화.
- **불변:** 1200ms·진동 8스텝 수치/지속·`_vidStartTimer` 로직·대사·leaf DOM 무관. 보호2_3·Q-only magic·attack ticket 무관.

## 4. 하니스 수정(숨기지 않음)
1차 exit 1 — 후보 `_clearVidTimers` 생성 transform(`.replace('}\n','')`)이 함수 body를 손상(SyntaxError). **test transform 버그**(후보 로직 아님). 최종 brace 앞 삽입(`/\n\}$/`)으로 정정 → 8 PASS.

## 5. docs 인계·Gate
- docs rg(백업 제외): `_clearVidTimers`/`_vidStartTimer` → SUPERVISOR_STATE(operational). `onVidClick`/`cinClickPrompt` → `cinematic/ENTER_ENGRAVED_20260907.md`·`PROLOGUE_STORYBOARD_v1.md`(ENTER 연출 계약). `vibrationActuator` → 0. → **door-phase 타이머 수명(prompt-hide/진동 정리)은 canonical 미기재**. root가 `ENTER_ENGRAVED_20260907.md`(또는 `WORLD_INTRO_INGAME_20260907.md`)에 "door skip/재진입 시 `_clearVidTimers`가 prompt-hide·진동 타이머까지 정리" 불변식 신규 기록(rg 동기화). 공용 `index.html`·Git은 원총괄/root.
- **Gate:** 가짜 timer/prompt/진동 카운터만 — 실제 native 진동·ENTER 화면·청취 **미검수(UNKNOWN)**. source/fixture와 native6/시각/청취 분리. 실제 Ask/승인은 사용자 몫.

## 6. 처리·다음
- 2 credit 저장 소진. 보존: 1134/1212/1300/1326/1405 각 불변. 자막/oldAudio/fade/hold/5caller 검사 반복 0.
- 승인 대기 없이 다음 독립 승인 소스 접점을 **메모리로 계속**(credit 소진 시 메모리, 새 credit 때 저장). Changes 80 checkpoint/100 전 신규 중단 준수. production/docs/Git/game/save/새세션/권한 0.
