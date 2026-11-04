# CTO 인수인계 — 11-04 밤 (PC CTO → 새 계정 세션)

- 작성: 11-04 20:00경, 이전 PC CTO 세션(Opus 5.5).
- 사유: 이 계정의 주간 사용량이 99%라 곧 멈춘다(리셋 11-08 23:00 UTC). 같은 계정의 로컬 총괄 세션들도 함께 멈춘다. 코덱스 레인은 별도 한도라 계속 돈다.
- 먼저 읽을 것: `CLAUDE.md`(main·unity/main 동일), 메모리 대신 이 문서, `docs/0마스터플랜/worklog/CTO_WORKLOG_20261104.md`(오늘 한 일), `docs/0마스터플랜/worklog/MAC_SESSION_BRIEF_20261104.md`(Mac 판정 목록).

## 0. 어디서 실행되느냐에 따라 할 수 있는 일

| 실행 위치 | 닿는 곳 | 맡을 일 |
|---|---|---|
| 클라우드 세션(claude.ai/code, Default 환경) | GitHub 저장소만. PC의 I:·G: 드라이브, 코덱스, Unity 공용 실행기, 로컬 총괄 세션에는 닿지 않는다 | 아래 3절 브랜치 검토, 판정 끝난 브랜치의 unity/main 병합, docs 동기화. 병합 절차는 6절 |
| PC 데스크톱 앱(이 계정으로 로그인한 로컬 세션) | 전부 | 이 문서 전체. 코덱스 레인 관리, 공용 실행기 순번, 총괄 세션 지시 |

클라우드 세션은 다른 세션에 메시지를 보낼 수 없다. PC 일이 필요하면 사용자에게 데스크톱 앱 로그인을 요청한다.

## 1. 지금 상태 (11-04 19:45 기준)

- unity/main = `b55fc008d`. main = `b94c8fbff`.
- 바탕화면 실행본 = `db26d55f6`(02:29 교체). BuildLoop 19:55 회차가 b55fc008d로 교체 중이다(3D 관문 시험 포함). 확인 파일: `I:\EXODUSER-Storage\unity-latest\build-commit.json`의 sha.
- PC 재부팅 19:33, HALT 해제 19:34. 좀비 0.
- 공용 실행기 `2026.11.04-exclloop`(devtools 780550326).
  - 새 좀비는 HALT를 만들지 않고 `_zombie_alert.json`에 적는다. 그 Player만 exit 3으로 거부한다.
  - 단독 Player가 Editor를 막는 것은 BuildLoop 검사(loop=true)일 때뿐이다.
- Editor 순번: quit-fix hard exit 빌드(rank 0) → vfx-druid(2) → ulead-combo4(3) → 6차 preview(4) → 코덱스 맵·번역 레인.
- Player 순번: quit-fix 18회(rank 0) → BuildLoop → 대검 재촬영(2, 실행 중) → combo4(3) → 6차(4).
- 우선 순번 부여: `exo-unity.ps1 grant -Owner <owner> -Kind editor|player -GrantRank N -GrantCount N -TtlMin N -Note "..."`. 부여 목록: `I:\EXODUSER-Storage\unity-jobs\_player_priority_grants.json`.

## 2. 코덱스 레인 (8개 실행 중, 상한 8)

- 19:36에 `I:/EXODUSER-Storage/codex-takeover/resume-pr-<레인>.sh`로 재개했다(codex exec resume, 위험 전체 접근).
- 결과는 각 레인 폴더 `REPORT.md` 맨 위 절과 `result-*.md`에 남는다. 기록은 `LANES.md`, 대기열은 `QUEUE.md`.

| 레인 | 이어서 하는 일 | 다음 판정 |
|---|---|---|
| map-scale-c1 | 14b6a1be5 ×2 keep·linear 실측 → 추천 | 사용자 결정 "1-1 맵 ×2"(11-04). 바닥 원화는 1x 밀도 유지 |
| map-keyshot | d387e3b49 빌드 → S1~S3 촬영·선별 | Steam 키샷(데모 v0 ①) |
| i18n-merge-fill | 3c38e368a unity/main 병합 → Editor 컴파일·확인 | 번역 No.4600~4646 |
| map-fieldbuild | 3301ec25c 동일성 → 굽기 → Player ms·3840 쌍 | 로딩 단축 |
| map-webcards | e18205436 후보 빌드 → 1.5초 이하 실측 | 로딩 단축 |
| map-loadprof | f44208cee 지면 192장 5.9s → 1.0s 이하 | 로딩 단축 |
| map-d5 | 87efe9151 남은 3항목 + 큰 카드 0.45H 이하·3D 덤불 + 흰 사각형 | 디자인 RETOUCH 대응 |
| map-swamp | 9f3667537 물가 전이 1H 이상, unity/main 비교 | 디자인 RETOUCH 대응 |

- 슬롯이 비면 띄울 대기 순서(`QUEUE.md`): debug-t2-harness(BRIEF 있음, Unity 0) → vfx-capture(앵글러·소환진) → map-b5-main 6beb20c9f 검증 → fullrun-3d 2회차.
- 새 레인 실행: `codex exec --skip-git-repo-check -s danger-full-access -c 'notify=[]' -o <result> "<지시>" </dev/null >> <log> 2>&1`. 브리프는 파일로 쓰고 금지사항을 넣는다: Core 수치·판정 수정, `git add -A`, 창·소리, 공용 실행기 밖 Unity 실행, python(node 사용), `I:/EXODUSER-Storage` 전체 재귀 검색, `taskkill /IM`, reset·rebase·force. 같은 검사 2회 실패면 멈춘다.
- 사용자 지시: "코덱스 내일까지 다 써라" → 8슬롯을 비우지 않는다.

## 3. 병합 대기 브랜치

| 브랜치 | SHA | 상태 | 병합 조건 |
|---|---|---|---|
| claude/unity-pc-demo-flavor-fix-20261104 | ac4e187ae | 코드 검증 끝, FF 가능 | combo4 촬영 디자인 PASS |
| claude/unity-pc-field-prepare-merge-20261104 | 79d4d14f1 | 코드 검증 끝(5회차 + CTO diff), FF 가능 | 같음 |
| claude/unity-pc-options-wave2-20261104 | 2cd42d3ab | 설정 2차 + BGM P1. 커서 PASS | 같음 |
| claude/unity-pc-first-impression-tone-20261104 | 479634337 | 첫인상 톤 | 같음 |
| claude/unity-pc-ui-minor6-20261104 | 19216c411 | UI 경미 6건 | 같음 |
| claude/unity-pc-candidate-combo4-20261104 | a8618d9bf | 위 5개를 합친 판정 빌드 | **병합하지 않음.** 판정용이다 |
| claude/unity-pc-quit-hardexit-20261104 | 850615ca1 | Unity 안 꺼짐 대응(하드 종료) | 깨끗한 부팅 종료 경로 18회 통과 |
| claude/unity-integration-preview6-20261104 | 6229288c0 | 보스 아레나 1fa74ff82 + VFX + 맵 통합 | 보스전 총괄 rigpixel 촬영 → 디자인 PASS |
| codex/unity-boss-arena-20261103 | 1fa74ff82 | 컴파일 0 오류 | 위와 같음 |
| codex/unity-char-modular-20261104 | a801204b7 | 대검 1920 modular PASS | 남은 촬영(shoot4.ps1) → 디자인 PASS. `--hero-rig=modular` 기본값은 rigpixel과 같이 판정 |
| claude/unity-pc-vfx-angler-water-impl-20261104 → codex/unity-vfx-audit-fix-20261104 | 0409212b9 → 6c66c7672 | 화면 판정 전 | 임펙트 총괄이 합친 SHA를 준다(FieldBullets 앵글러 분기를 Friendly 앞에) |
| codex/unity-druid-vfx5-20261104 | 874218da0 | 재빌드 중(재부팅 직전 BuildProgram 시작 실패, 코드 오류 0) | 탄막 겹친 장면 촬영 → 판정 |
| claude/unity-pc-a2r-route-20261104 | 2308e2111 | 맵 A2R. 디자인 RETOUCH(카드 덤불 2.5~3H, 늪 칼날 가장자리) | map-d5·map-swamp 보정 → 디자인 PASS |
| codex/unity-map-b5-main-20261104 | 6beb20c9f | 검증 필요 | 코덱스 검증 레인 |
| codex/unity-i18n-first-impression-20261104 | ed7a85655 | 번역 | i18n-merge-fill 결과와 함께 |
| claude/mac-transfer-20261104 | 4d3d3b15f | Mac 전달 묶음 5개(`transfer/20261104/`) | Mac 세션이 받음. 병합 대상 아님 |

- 디자인 화면이 바뀌는 병합은 디자인총괄 PASS 뒤에만 한다(디자인 퇴보 병합 금지).
- 순서: combo4 PASS → demo-flavor·field-prepare(FF) → options-wave2 → first-impression·minor6 → A2R 맵.
- 위험한 병합(Core·세이브·삭제)은 독립 검증 1~3개를 먼저 돌린다.

## 4. 제품 결정 (이미 확정, 다시 묻지 않음)

- 데모 기본은 3D(`--remodel3d`). rigpixel 기본값: 보스·적은 preview 6 판정 뒤, 영웅은 modular 대검 촬영과 디자인 PASS 뒤.
- demo-flavor: 세이브 루트는 옛 폴더에 고정한다. 릴리스 빌드는 CLI flavor 인자를 무시하므로 데모는 `-flavor demo`로 빌드한다. Steam 체험판 실행 옵션 `--unity-build-flavor demo`는 새 `-flavor demo` 빌드를 올리기 전까지 그대로 둔다.
- P39 "처음부터" = 지역 재시작(진행 유지).
- 1-1 맵 ×2(사용자 11-04). 최적화 레인과 map-scale3d 뒤에 적용하고, 바닥 원화는 1x 픽셀 밀도를 유지한다.
- 드루이드 치마 v9.1(데모 v0).
- Suno는 유료 플랜이다(사용자 확인).

## 5. Unity 안 꺼짐 버그 (사용자가 가장 자주 묻는 것)

- 판정: PC를 오래 켜 둔 오염 상태에서는 입력을 초기화한 창 모드 Player가 6/6 커널 좀비가 된다(종료 방식·WGI·XInput과 무관). 원인은 이 PC의 HID 입력 드라이버 경로다.
- 의심 드라이버: 은행 보안(nosku, noskp, np_ck64s, TKCtrl, Mkd2Nadr, JRSUKD25, asc_kbc), Razer, WUDFRd, xboxgip, AMDXE.
- 제품 대응: 하드 종료(850615ca1)를 유지한다. 깨끗한 부팅에서 종료 경로 18회를 검사하고, 통과하면 병합한다. XInput 전환은 효과가 없어 넣지 않는다.
- 남은 일:
  - 스택 캡처(Process Explorer) 위치를 모른다. 좀비가 다시 생기면 사용자에게 한 번만 요청한다.
  - 좀비 첫 발생 시각(부팅 경과)은 `_zombie_alert.json` firstBootAgeHours에 남는다.
  - 드라이버를 끄거나 지우는 일은 사용자 승인 뒤에 한다.
- 담당 세션: "Unity 종료 멈춤 버그 해결" local_8933ae74.

## 6. 병합 절차 (CTO 작업본)

- 작업본: `G:/exoduser-wt/cto-unity-rules`(detached HEAD). 클라우드에서는 새 clone.
- 순서:
  1. `merge --ff-only origin/unity/main`
  2. `merge --no-ff --no-commit <브랜치>`
  3. CHANGELOG_SYNC 충돌은 양쪽 줄을 다 남긴다.
  4. `add --sparse -- <경로>`
- 줄 끝 검사는 파일마다 줄 단위 CR 개수로 한다. numstat 비교는 새 줄의 줄 끝 차이를 놓친다.
- sparse 밖 파일은 `hash-object -w --no-filters` + `update-index --cacheinfo`로 넣는다.
- 커밋 끝에 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`를 단다.
- 마무리: `push origin HEAD:refs/heads/unity/main`(비강제) → `ls-remote` 대조.
- 금지: `git add -A`, force, reset, rebase, stash, gc·repack·prune, `--no-verify`. push가 거부되면 merge로 받는다(rebase 금지).

## 7. 로컬 총괄 세션 (같은 계정이라 함께 멈춤)

| 총괄 | 세션 id | 지금 하는 일 |
|---|---|---|
| 개발툴 | local_55f5cfd6 | 실행기, BuildLoop 19:55 감시 |
| 종료 멈춤 | local_8933ae74 | 하드 종료 18회 |
| 유니티 | local_59ad835c | combo4 빌드·촬영 |
| 캐릭터 | local_7de36273 | modular 대검 재촬영(실행 중) |
| 보스전 | local_a98acebe | preview 6 rigpixel 촬영 |
| 임펙트 | local_da9cd0e7 | 드루이드 VFX 재빌드·촬영. 새 효과 제작은 멈춤(아래 8절 결정 대기) |
| 디자인 | local_eb8a8577 | combo4·대검·preview 6·A2R 판정 |
| 사운드 | local_cf0cb8d7 | R5~R10 청음 카드 |
| 맵 | local_9d17d95b | 코덱스 맵 레인 판정 |
| 스토리·디버깅·스팀·최신버전 테스트 | local_0b7b50a3·local_ee4a62b4·local_2ba105fa·local_fa43bff5 | 대기 |

- 새 계정에서 총괄을 다시 열면 각 총괄의 SSOT 보드부터 읽게 한다(CLAUDE.md 6절 표).

## 8. 사용자 결정 대기 (MORNING_1104.md에 모음, 같은 질문 반복 금지)

1. 임펙트 방향: 사용자가 "임펙트가 다 엉망, 팬텀블레이드 참고"라고 했다. 임펙트 총괄이 직접 만든 효과 대신 전문 VFX 에셋 기반 전환을 제안했다. 유료면 지출 승인이 필요하다.
2. 청음: R5~R10 카드(`http://127.0.0.1:3399/pick_r*.html`).
3. Mac 세션 판정(MAC_SESSION_BRIEF): `--remodel3d` 1-1 한 판, combo4/3, preview 6.
4. 웹 v0.7.11 Set Live: 미승인 유지.
5. 정리(사용자만 가능): C: scratchpad·Temp, 드라이브 루트 bin/obj, C:\t1 2.3GB.
6. PC 안정: `chkdsk I: /f`, 빌드·로그 E: 이전.
7. 근경 소품 Tripo 7건: 맵 총괄 창에서 사용자 승인 필요.

## 9. 보고 형식

- 한국어로, 결과만 2~6줄로 쓴다.
- 매시 보고: 코덱스 레인 현황, 사용자 실행본 SHA(3333 refresh.log, unity-latest build-commit.json), Kling.
- CTO 순회: 끝난·멈춘 레인 재개 → 판정 끝난 브랜치 병합 → 쉬는 총괄 배정 → 실행본 확인 → MORNING에 결정 모음.
