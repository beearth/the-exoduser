# integ-fix 보충 — PC Dummy 판정 분리 / perf·etype9 확인

2026-10-21 PC 총괄 회신 반영. 기반 `3183eeeba5ba05b649a4fc2eea3297b8ee811b19`를 원격 ls-remote로 확인하고, 동일 통합 ref `codex/demo11-integ-20261021`에 이어서 일반 push한다. R tracked INDEX/WORK는 읽기만, 작업 위치는 다시 생성한 `~/exoduser-wt/integ-fix`, 임시 로컬 branch `codex/integ-fix-audio-20261021`은 지정 통합 ref를 추적한다. 최종 SHA는 외부 DONE/submitted_report에 기록한다.

## 드라이버별 판정

PC Windows headless/Dummy에서 보고된 5종(초기 lobby/intro/field, death, victory, 누락 파일 error/reject, 실패 handle release)의 실패는 실제 오디오 관측/비동기 media 시간 진행을 전제로 했다. Mac CoreAudio 실제 창과 같은 판정으로 합산하지 않는다. 앞선 Mac 조사에서 확인한 `main.gd:757–765`의 hidden 관측→`native_music_lifecycle.gd:61–63`의 정상 suspend→`native_music_media.gd:43–54`의 Audio/Timer 정지는 유지한다. PC 드라이버 자체와 headless visibility의 기여도를 Mac 결과만으로 따로 확정하지 않으며, PC 보고는 플랫폼별 관측 근거로 인수한다. 제품의 visibility/타이머/음원 코드를 우회하거나 고치지 않았다.

`test_demo11_41_music_lifecycle.gd`의 `check_media`는 AudioServer 실제 driver가 정확히 Dummy일 때만 skip하고 label·구체적 이유를 `DEMO11_41_SKIP`와 결과 JSON.skipped에 모두 출력한다. 그 외 모든 driver는 기존 재생/콜백 단언을 실행한다. 위8개 개별 단언 외에도 같은 실제 재생 전제인 resume/voice/queued-voice/boss5개를 같은 기준으로 분리해 총13개다. 'death has no automatic next track'도 headless에서 terminal Timer가 정지하면 아직 death handle이 없으므로 해당 관측군에 포함한다.

동시에 모든 driver에서 실행하는 검사를9개 추가했다: 3scene의 선택된 handle·요청 상태, voice bus, boss 선택, death terminal Timer 요청, victory 요청 상태, 실제 없는 파일/handle 등록, close 후 해당 handle의 driver=null·registry 제거. 기존 duplicate/cache/owner exit/guide·field/stop·종료 Timer/listener/bus 정리와 부정 재생 검사는 유지했다. state_evidence에는 scene/key/suspended/timers를 남긴다. 따라서 Dummy 결과는 '실제 소리가 났다'가 아닌 **관측 가능한51계약 통과+13관측 불가 항목 명시**다. CoreAudio에는 기존55+추가9=64검사를 모두 적용한다. 원본 SND06 모듈/오디오 어댑터/제품 guard 변경0.

| 관련 검증 (각 조건1회) | 결과·판정 |
|---|---|
| Mac headless / Dummy | **51통과/0실패/13 skip**, ERROR0·exit0. PASS_WITH_SKIPS. 실제 재생·deferred callback 관측을 통과로 계산하지 않음 |
| Mac 실제 창 / CoreAudio | **64통과/0실패/skip0**, ERROR0·exit0. 실제 재생 상태·missing error/reject·즉시 실패 handle 해제까지 엄격 검증 |
| etype-B 기존 runtime suite | **42통과/0실패/skip0**, ERROR0·exit0. 당시 PC lifecycle 통합 전 type9 deadPool owner 누락 거절을 검사한 과거 결과. 2026-10-21 ZOOM-01 이후 현행 기대는 PC lifecycle 빈 풀 SOURCE_RETURN / next_timer=60이며 B8도 자동 bind 후 비치명 hurtE 성공 |

재사용 runner `run_integ_fix.py --suite 41 --audio-mode headless|window`는 mode를 명시하고 실제 driver는 테스트가 읽는다. skip 결과가 하나라도 있으면 runner도 PASS_WITH_SKIPS를 출력하고 JSON.skipped를 보존한다. 전체 editor import·격리 USERDIR·명시 source-root/Node·pgrep count≥2시30초 대기·override finally0byte는 유지한다. 이번 실행은 커밋할 runner를 직접 사용했으며 import는 준비로 분리했다. Windows 실행·사용자 실제 청음·PCM 동등성은 실행하지 않았고 사용자 실창 검수 항목으로 남긴다. Camera2D physics interpolation 기존 WARNING 유지.

## perf 포함 여부와 성능 경계

`aaf52dc0cb4439e828c9fe1a6560b0dd3e8ab1e7`은 현재 통합 HEAD의 ancestor다(`merge-base --is-ancestor` exit0). 따라서 추가 merge0. 원래 perf merge는 `9415b968`로 보존되어 있다. 현행 world.gd:3241–3245의 hill 거리 재사용/보수적 broad-phase, :3276의 AI 질의별 Array 할당 제거도 확인했다. 이번 생산 코드 변경0, 새 벤치0. **포함 확인은 PC etype-a 약22ms/tick 경고 해소 증명이 아니다.** PC의 동일 다수 actor 조건/동일 하드웨어에서 후속 실측이 필요하며, 이전 hitch/지속120fps 미달 경계는 그대로다.

## etype9 NOT_READY 유지

PC P2-008b 확인 전까지 etype9의 최종 상태는 **NOT_READY**다. 기존 B의 몸체 등록/비치명 hurtE fixture와 full combat readiness를 구분한다. `native_demo11_etype_b_spawn.gd`는 기존에도 full_combat_ready=false이고 `native_demo11_etype_b_actor.gd:67–73`은 실제 deadPool 부활 owner가 없으면 b_fault로 정지한다. 기존 `native_demo11_etype_b_preflight.gd:30–38`의 NOT_READY 판정도 유지한다. 42검사 통과를 type9 부활/자연 전투/최종 인수 READY로 승격하지 않는다. P2-008b 코드 임의 이식·가짜 시체풀·항상 성공 callback·대체 스폰0.

원로그: `~/exoduser-wt/_out/integ-fix/audio-supplement/{dummy,coreaudio,b9}/`의 JSON/argv/gate/원로그. 이전 작업의 최초 실패/6310검사·SHA는 [최초 보고서](integ-fix_REPORT.md)의 당시 이력으로 유지한다. 번역 목록 CRLF9495/loneLF0·game.html/제품 scripts blob 불변, 새 생성/빌드/배포/PC 실행0. 동일 통합 ref 일반 push·원격 SHA 일치→DONE→자기 worktree 제거 순서로 마감한다.
