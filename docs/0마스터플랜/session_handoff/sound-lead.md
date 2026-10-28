# 사운드 총괄 인계 — 2026-10-28 KST
- 세션 id `local_9c9b2f79-f02e-404e-ba44-282d087fa454` / Opus 5.5 / 사운드 전 영역(SFX·BGM·보이스·믹스·Unity) 총괄. 조사·판단·명세·검수·배정만, 실행은 단순 세션
- SSOT: `docs/6사운드디자인/SOUND_LEAD_MASTER_20261026.md`, 상세 `6사운드디자인.md`
- 규칙: CLAUDE.md §총괄 자율 결정. **효과음 선택은 사용자 귀로**(메모리 sfx-picks-need-user-ear: 수치는 불량 "주의"만, 추천 표시 금지, 장면 카드+장면에서 듣기). 재생성 기준 100K(`docs/0마스터플랜/SESSION_REGEN_PROTOCOL_20261026.md`)

## 진행 중 작업 단위
| 단위 | 단계 | 남은 일 | 산출물 |
|---|---|---|---|
| **SND-09 드루이드 보스전 사운드 리메이크(최우선)** | 사용자 지시 "드루이드 보스전 다시 만들어야 할 것 같다 지금 전체적으로 구려서". 명세 `docs/6사운드디자인/DRUID_BOSS_SOUND_REMAKE_20261028.md`(main cd317f54e·8bf55de12). 후보 60개(15키×4)+BGM 3곡(ElevenLabs `/v1/music` 동작) 생성·고르기 페이지 완료(sound-simple 2dd2db74b) | ①**사용자가 "다 골랐어"라고 했으나 서버(3399)가 꺼져 있어 `picks_druid.json` 미저장**. 서버를 독립 프로세스로 재기동(10-28)했고, 사용자에게 탭 새로고침 금지·메모 칸 한 글자 입력으로 전체 재저장 요청 → 사용자 "저장했어"/"닫혔어" 대기. 닫혔으면 다시 고르기 ②채택 → RM-0에 키 연결 지시(`druid_hit` 변형 순환·연타 감쇠 §4.1, BGM은 원본 피크 0.989 넘음 → 게인 낮춤) → 녹음 v4 → 사용자 청음 | 페이지 `http://127.0.0.1:3399/pick_druid.html`, 생성물 `G:/exoduser-wt/_out/sfx_forge/_druid`·`_preview_druid` |
| SND-08 RM-1 트랙 A(Unity) | RM-0 최종 `0b7576ec1`(submit5) 수치 PASS: BGM 되감김(오프라인 녹음×스트리밍 임포트→BGM CompressedInMemory) 해결, 피크 −3.9dBFS, 덕킹 Ambience·EnemyHit −4dB대. 기록 슬라이스 문서 §6.7(main 5d910bad6) | 사용자 v3 청음 결과 → 사용자는 "드루이드전 전체적으로 구리다"로 SND-09 전환. 일반 전투(R2) 판정은 아직 없음 | 청음 `http://127.0.0.1:3399/listen_trackA.html`, 녹음 `E:/exoduser-wt/_out/rm1-sound/submit5/` |
| SND-08 패링 성공 소리(Unity) | 웹 `doParry`대로 연결 지시(q_parry / sword_parry+sword_back*, 50% voice_parry1~4·male_grunt) | RM-0 결과·Receipt 확인 | 명세 §4.1 |
| SND-08 3차 5키 | `tell_parry`·`roll_body`·`druid_burrow`·`druid_staff_tap`·`druid_root_pierce` s3 a~d | 사용자 고르기 대기 `http://127.0.0.1:3399/pick_rm1.html` | `picks_rm1.json` |
| AD2 웹 UI 소리 전수조사 | sound-simple 보고 올라옴(내용 미검토) | 총괄 검토 → 새 소리 후보 결정 | `docs/6사운드디자인/AD2_UI_SOUND_INVENTORY_20261028.md`(확인 필요) |
| SND-05 보이스 키·포맷 문서 | sound-simple 착수만 하고 미룸 | AD2·SND-09 뒤 | — |

## 고르기 서버
- `G:/exoduser-wt/_out/sfx_forge/_tools/serve.cjs`(127.0.0.1:3399, `/api/picks?set=rm1|druid`). Git bash 백그라운드로 띄우면 exit 4로 죽음 → **PowerShell `Start-Process node serve.cjs -WorkingDirectory ..._tools -WindowStyle Hidden`**으로 띄운다. 페이지는 localStorage가 없어 서버가 꺼지면 선택이 탭 메모리에만 남는다(후속: localStorage 백업 추가를 sound-simple에 지시할 것)

## 소속·연결 세션
- sound-simple `local_26395865-a52c-421c-885e-ce7b45e1f7fa`(Sonnet, 재생성 기준 100K 적용 요청 필요)
- RM-0 `local_7bb6eaac-7593-488d-8f88-087252e37e33`(유니티 총괄 소속 Sonnet, 사운드 트랙 A 구현·녹음, 브랜치 `claude/unity-pc-sound-rm1-20261027`)
- 유니티 총괄 `local_59ad835c-2e92-44a5-bebf-0f0223217ae0` / CTO `local_7072229c-70cf-4fdf-ab35-c3c59e683d53`

## 확정 결정·주의
- PC 메모리 한계(CTO 10-28): Unity batch는 PC 전체 1개·커밋 여유 20GB 이상, 새 세션 증설 금지. git fetch가 OOM으로 실패한 적 있음
- 백그라운드 `python -` 금지(stdin 대기로 멈춤 1회 발생). 스크립트는 파일로
- push: origin/main 기준 sparse worktree(`/docs/6사운드디자인/`·`/tools/guard.js`·`/tools/guard.baseline.json`·`/game.html` 필수) → `git commit -- <경로>` → `git push origin HEAD:main` → worktree·브랜치 삭제. 문서는 LF
- `git add -A`·force·rebase·reset 금지, 타세션 파일 불간섭, 창 자동 열기 금지, 보고는 ASCII 경계 블록

## 재개 후 첫 행동
1. 이 문서와 MEMORY.md 읽기, `curl http://127.0.0.1:3399/api/picks?set=druid`로 저장 여부 확인(꺼져 있으면 위 방식으로 재기동)
2. 저장됐으면 `picks_druid.json` 읽고 채택표를 명세 §에 기록 → RM-0에 연결 지시, "전부 안 맞음" 키는 재생성 배정
3. sound-simple에 100K 재생성 기준 전달·pick 페이지 localStorage 백업 지시, AD2 보고 검토
