# 사운드 총괄 인계 — 2026-10-28 오후 KST
- 세션 id `local_e30a26aa` 계열(이 문서 작성 세션) / Opus 5.5 / 사운드 전 영역(SFX·BGM·보이스·믹스·Unity) 총괄. 명세·판단·검수·커밋 담당
- SSOT: `docs/6사운드디자인/SOUND_LEAD_MASTER_20261026.md`, 상세 `6사운드디자인.md`, 드루이드 `DRUID_BOSS_SOUND_REMAKE_20261028.md`, UI `SND10_UI_NEW_SOUNDS_20261028.md`

## 10-28 바뀐 운영 규칙 (전부 사용자 지시, CTO 전달)
- **보고는 CTO(`local_7072229c`)에게만** SendMessage로 보낸다. 작업 단위 끝에 1건(끝난 것·증거·결함·사용자 결정). 내 채팅에는 한두 줄 상태만 쓰고, 사소한 진행 알림은 보내지 않는다. 메모리 `reports-route-to-cto-only.md`
- **승인을 기다리며 멈추지 않는다**("일은 진행하고 나중에 총 컨펌을 내가하는거지"). 효과음은 추천안으로 먼저 반영하되 **키 교체 단독 커밋**으로 되돌리기 쉽게 두고, 비교 페이지는 CTO 컨펌 목록에 올린다. 예외는 유료·외부 배포·영구 삭제뿐이다
- 총괄 추천은 귀 판정이 아니다(장면·출처·중복 사용·불량 수치 기준). 3차에서 추천과 사용자 선택이 일치한 것은 1/3이었다
- **단순 작업은 `codex exec`**로 한다(메모리 `implementation-via-codex-exec.md`). Sonnet 단순 세션(sound-simple·RM-0)은 10-28 정리·보관했다. ElevenLabs 생성은 총괄이 직접 한다
- 자동 실행은 창 0·소리 0(메모리 `capture-headless-muted.md`). 내장 브라우저로 페이지를 여는 것도 하지 않는다
- Unity 완료 = 6단계(병합 전 빌드 → 병합 → 통합 빌드 → GPU 스모크 → unity-latest → 총괄 실제 플레이 판정). 문서 `docs/engine/UNITY_DONE_BUILD_PLAYTEST_RULE_20261028.md`

## 고르기 서버·자동 보고
- 서버: `G:/exoduser-wt/_out/sfx_forge/_tools/serve.cjs`(127.0.0.1:3399). PowerShell `Start-Process node serve.cjs -WorkingDirectory ..._tools -WindowStyle Hidden`으로 띄운다(Git bash 백그라운드는 exit 4). **재부팅하면 꺼지니 다시 띄울 것**
- PICKSETS: rm1·druid·ui·druid2·r3·r4. 새 페이지를 추가하면 서버를 재시작해야 저장된다(그 전에는 400)
- 제출(`_submitted` 포함 POST) → `_submitted/<set>__<시각>.json` 원자적 쓰기. 총괄 세션은 `until ls _submitted/*.json; do sleep 5; done` 백그라운드로 감시하고, 깨어나면 결과를 CTO에 보고 → `_submitted/done/`으로 이동 → 감시를 다시 건다. **세션이 재시작되면 감시를 다시 걸 것**
- 페이지에는 제출 버튼("n / N 골라짐")·localStorage 백업·"제출됨 — 보고가 전달됩니다"가 있다. 선택 백업은 `_picks_backup/`

## 진행 상태
| 단위 | 상태 | 남은 일 |
|---|---|---|
| SND-09 드루이드 v2 | 사용자 채택: 1차 11키(6c8c61c3b §6)·2차 hit/hit_heavy/whip(c2499457a §6.1)·3차 spore=r3a(웹 pickup_rummage2), slam=r3d+메모 "볼륨을 키우고 에코" → 가공본 e2 선반영 | **컨펌 대기 pick_r4**(d·e1·e2·e3). 다르게 고르면 sound 브랜치 `3e56f5a60`의 파일만 교체한다 |
| Unity sound 브랜치 | **사운드 총괄이 빌드 담당(유니티 총괄 지정 10-28)**. 팁 `acf2fb948` = unity/main b0f9a0c52 merge(충돌 0·Core 변경 0이라 oracle 생략, push 완료) | **빌드 진행 중(22시대 시작)**: `exo-unity.ps1 build`, 출력 `I:/EXODUSER-Storage/sound-build/20261028_acf2fb948/`(run.log·receipt.json·build/). 결과를 확인해 오류 0이면 유니티 총괄(`local_59ad835c`)에 merge SHA·영수증·USER_SAVE 0을 보낸다. 실패하면 run.log 원인 분석 후 1회만 수정·재빌드. 작업트리에 RM-0이 남긴 .meta/URP 재직렬화 잔여 441개(미커밋)가 있으니 커밋하지 않는다. 그 뒤 ⑥ unity-latest 드루이드전 직접 판정(Receipt 4항목). RM-0 인계 `unity-rm0.md` |
| SND-10 웹 UI | 석궁 발사 264cffe06 · UI 5키 c0913f138 · ui_tab d40568974 | 게임 안 청음은 미확인. 분해 버튼 3곳·장착 실패 2곳·결정 서브탭·스킬 대분류 탭은 코드만 확인. pageerror createRadialGradient r0<0은 대조하지 않음 |
| HPF | 새 후보 가공 기본값 35Hz HPF→−1dBTP. 기존 채택 27개는 재가공하지 않음(7a6d18ce4) | Unity Ambience 그룹 HPF 여부는 ⑥ 청음 때 판단 |
| SND-05 | 89d904786(sound-simple 보고 기준) | 총괄이 내용을 검토하지 않음 |
| 미완 10건 | `sound-simple.md` "10-28 정리" 절(82510089e) | Codex 브리프로 넘긴다 |
| SND-08 3차 5키 | pick_rm1(`tell_parry`·`roll_body`·`druid_burrow`·`druid_staff_tap`·`druid_root_pierce`) | picks_rm1.json에 none이 4개 있다. 컨펌 목록에 넣을지 확인 필요 |

## 정리할 파일 (사용자 확인 필요, 대리 삭제하지 않음)
- 147MB 로그 `C:/Users/심도진/AppData/Local/Temp/claude/G--exoduser/e9dc4b1a-16bf-456a-ac78-5831de1a290f/tasks/b76otkwpb.output`, G:/exoduser/tmp/pick_*_check.mjs, I:/EXODUSER-Storage/tmp_pick_*.png (CTO에 전달함)

## push 방법
origin/main 기준 sparse worktree(`MSYS_NO_PATHCONV=1`, 자기 경로 + `/tools/guard.js` `/tools/guard.baseline.json` `/game.html`) → `git commit -- <경로>` → `git push origin HEAD:main`(거부되면 fetch 후 새 브랜치에 cherry-pick) → guard가 바꾼 baseline은 `git checkout --`로 되돌림 → reparse 0 확인 → worktree·브랜치 삭제. 문서는 LF. `git add -A`·force·rebase·reset 금지

## 재개 후 첫 행동
0. 10-28 밤 CTO: 주간 사용량 94%(리셋 11-01). 구현·캡처는 Codex, Claude 턴은 판정·검수·커밋만. 진행 알림 금지, 200K 넘으면 즉시 재생성, 대기만 하는 턴 금지
1. 이 문서와 MEMORY.md 읽기 → 3399 서버 응답 확인(꺼져 있으면 띄움) → `_submitted/` 감시 다시 걸기
2. `_submitted/`에 남은 파일이 있으면 결과를 CTO에 보고하고 반영
3. sound 브랜치 빌드 담당·결과 확인 → ⑥ 판정 준비
