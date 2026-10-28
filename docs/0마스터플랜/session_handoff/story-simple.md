# 단순작업(Sonnet): 스토리총괄 인계 — 2026-10-28 09:55 KST (재생성: 컨텍스트 253K)

- 세션: `local_a128282e` / Sonnet 5.5 / 스토리 총괄(`local_0b7b50a3`) 소속 단순작업. 명세는 총괄, 구현·검증·커밋만.
- 판정 문서(SSOT): `docs/11내러티브·로어디자인/DIALOGUE_CANON_AUDIT_20261028.md` §3(묶음 B)·§4(보류)
- 스토리 총괄 SSOT: `docs/11내러티브·로어디자인/STORY_LEAD_MASTER_20261026.md`
- 재생성 기준: 작업 단위마다 `get_usage(self)`(deferred 도구 → ToolSearch `select:mcp__ccd_session_mgmt__get_usage`), 100K 넘으면 이 문서 갱신 후 총괄에 보고, 200K 넘으면 즉시 멈춤. **이번에 253K라 B1 착수 전에 멈췄다.**

## 완료한 것 (원격 반영됨)
- 묶음 A(STY-14, 대사 13건): 원격 `2acde58ac`(총괄이 cherry-pick). 번역 No.3473~3482 + 옛 6건, 27언어. 로컬 G:\exoduser에도 `--no-docs`로 적용했고 캡처 `G:/exoduser/tmp/design-review/20261028_dialogue_A/`. 데모 종료 화면 디자인(노랑·네온 버튼)은 디자인총괄 이관.
- 묶음 C(STY-15, 2장 보스 대사): 코드 `14de6fda3` + SHA 기록 docs `77125bc6f`. 번역 No.3588~3598, 27언어. 총괄 검수 PASS.
- 스크립트·메시지 보관: `I:\EXODUSER-Storage\_handoff\story-simple-dlgA\`(A), `...\story-simple-dlgC\`(C). 번역표 `dlg*_tr.py`는 키 순서대로 27언어(ar bg cs da de el es fi fr hu id it ja ms nl no pl ptbr ro ru sv th tr uk vi zh zht), 적용 `dlg*_apply.py <루트>`, 검증 `chk*.cjs <루트>`, 문법 `syn.cjs <game.html>`(A 폴더).

## 지금 받은 일 — 묶음 B1 (아직 시작 안 함, 코드 변경 없음)
총괄 지시(2026-10-28 09:5x): 번역 없는 대사 126건의 **전수 목록 작성**만. 번역목록 정식 No.는 받지 않는다(총괄이 문장 확정 뒤 B2에서 번호).
1. 읽기 전용 워크트리 `E:/exoduser-wt/dialogue-b`(origin/main). 만들어 둠 → 새 세션은 `git fetch origin && git checkout --detach origin/main`으로 최신화. 이 인계 문서 커밋도 이 워크트리에서 함.
2. `game.html`·`index.html`에서 명세 §3 범위 전수 추출(묶음 A·C로 바뀐 문장은 **현행 문장** 기준): `_tips`(로딩·펫 팁 18쌍), 펫끼리 잡담 5쌍, `_envDlg`(장 환경 7쌍), `_bi`(보스 등장 7쌍), `_cc`(장 클리어 7쌍), 번역 없는 고양이 대사, 피날레 배너(비활성), 데모 종료 문구, **_EN만 있고 번역목록에 없는 펫 대사 3곳**, 로비 카드 문구(`localization/resume`), 스테이지 전환 기본 문구("지옥으로 내려가는 중..."), 구 프롤로그 행(§4 마지막 행 요구).
3. 항목마다: 임시 번호 B-001~, 위치(파일:줄·변수명), 화자(까마귀/고양이/시스템), 현행 한국어 원문, `_EN` 유무, 번역목록 등록 여부(있으면 No.), 27언어 유무(`lang_*.js`에 키 존재). **126건과 다르면 차이 이유 기재.** 로딩 팁은 말투(해요체/반말/합니다체)를 별도 열로.
4. 결과 파일 `docs/11내러티브·로어디자인/DIALOGUE_B_INVENTORY_20261028.md`(표) **1개만** 경로 지정 커밋·push(거절 시 fetch 후 1회, 총괄이 승인한 방식 = 가드 통과 커밋을 최신 origin/main에 `git checkout --detach origin/main && git cherry-pick <SHA>` 후 즉시 push). 끝나면 junction 0 확인 후 `git worktree remove --force E:/exoduser-wt/dialogue-b`.
5. 주의: STY-D19(펫 성격) 판정 전이라 **문장 수정 제안 금지, 사실만**. `python -` 금지(스크립트는 파일로, 반드시 파일 경로로 실행). `rm`은 권한 거부될 수 있으니 필요 없으면 남기고 보고. 타 세션 WIP 불간섭.
6. 보고(스토리 총괄에게): push SHA, 총 건수(분류별), 126건과의 차이.

### 추출 팁 (이번 세션에서 확인한 위치, 줄 번호는 이동하니 문자열로 grep)
- 펫 대사: `game.html` `[S03e] PET_DIALOGUE`, 보스 등장 `const _bi=[[`, 보스 킬 `_petSay('boss_kill'`, 장 클리어 `const _cc=[[`, 장 환경 `const _envDlg=[[`, 챕터 트로피 `trophy_act1_clear`. 펫 함수 `_petSay`·`_petSayCD`·`_petBidCD`.
- `_EN`은 `Object.assign(_EN,{…})` 여러 블록 + 큰 `const _EN={…}`. 번역 유무 판정은 (a) game.html `_EN` 키, (b) `lang_*.js` 27개의 같은 한글 키 존재. 키 비교는 정확한 문자열 일치.
- 번역목록 = `docs/16번역·로컬라이제이션/번역대상_전체목록.md`(표 행 `| No. | KO | EN | …|`). 최대 번호 확인용: 이번엔 3598(묶음 C)까지, i18n-fill 3500~3587 선점.
- 로비 카드: `index.html`·`localization/` 폴더·`resume` 관련 문구(명세 §3 "로비 카드 문구(localization/resume)").

## 이후 대기 작업 (총괄 지시 받고 착수)
- 묶음 B2: 총괄이 문장 확정 뒤 번호 매기고 game.html `_T` 배선·번역·27언어 전파(묶음 A 방식)
- 순간이동 마감(`_emCell`) 커밋은 계속 **보류**

## 금지·주의
- `git add -A`·`--no-verify`·force push·history rewrite(rebase 포함) 금지. 커밋은 경로 지정만(`git commit -F msg -- <경로>`). 로컬 G:\exoduser main 커밋·push 금지(로컬 main 번들 8bf094fe6).
- 워크트리는 push 확인 후 junction 0 확인 → `git worktree remove --force`. 커밋 메모리 20GB 이상일 때만 커밋(`Get-CimInstance Win32_OperatingSystem` FreeVirtualMemory).
- 테스트는 수정 후 1회, 2번 실패면 멈추고 보고. 백그라운드 `python -` 절대 금지(10-28 한 번 위반함, 즉시 EOF로 끝남).
- 공유 작업트리 G:\exoduser에 타 세션 WIP(game.html 사운드 hunk 등) 상존 — 건드리지 않는다.
