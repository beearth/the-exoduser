# 단순작업(Sonnet): 스토리총괄 인계 — 2026-10-28 10:15 KST (재생성: 컨텍스트 251K)

- 세션: Sonnet 5.5 / 스토리 총괄(`local_0b7b50a3`) 소속 단순작업. 명세는 총괄, 구현·검증·커밋만.
- 판정 문서(SSOT): `docs/11내러티브·로어디자인/DIALOGUE_CANON_AUDIT_20261028.md` §3.1(B2 명세·문장 확정 6줄·처리 규칙 6개)·§4(보류)
- 재생성 기준: 작업 단위마다 `get_usage(self)`(deferred → ToolSearch `select:mcp__ccd_session_mgmt__get_usage`), 100K 넘으면 이 문서 갱신 후 총괄에 보고, 200K 넘으면 즉시 멈춤. **이번에 251K라 B2 착수 전에 멈췄다(코드 변경 없음).**

## 완료한 것 (원격 반영됨)
- 묶음 A(STY-14, 13건): 원격 `2acde58ac`. 묶음 C(STY-15): `14de6fda3`+`77125bc6f`. 스크립트 `I:\EXODUSER-Storage\_handoff\story-simple-dlgA\`·`...dlgC\`.
- **묶음 B1(전수 목록)**: `docs/11내러티브·로어디자인/DIALOGUE_B_INVENTORY_20261028.md`, 원격 `5539a1c46`, 총괄 검수 PASS. 246행(12분류) 중 번역 없음 128행·고유 126문장이 B2의 분모. 추출 도구 `I:\EXODUSER-Storage\_handoff\story-simple-dlgB1\`(`inv.cjs` 토큰화·번역 대조 → `inv.json`·`inv.lookup.json`, `gen.cjs` 행 생성, `doc.cjs` 문서 생성, `j.cjs` resume 대조). 실행 예: `node inv.cjs <루트> <scratch>/inv.json` → `node gen.cjs` 계열은 `doc.cjs`가 require. 현행 game.html에서 다시 추출할 때 그대로 쓸 수 있다(줄 번호는 이동하므로 문자열로 찾을 것).

## 지금 받은 일 — 묶음 B2 (아직 시작 안 함)
총괄 지시(2026-10-28 10:1x), 명세 = 원격 `504c4250a`의 AUDIT §3.1.
1. **바꾸는 문장 6줄**(나머지는 현행 문장 그대로 번역): B-175 「💡 스킬을 합체하면 더 강한 공격이 된다」, B-177 「💡 보스의 패턴을 읽으면 패링 타이밍이 보인다」, B-179 「💡 대장간에서 장비 강화·분해」, B-180 「💡 R키로 아이템 수거」(`💡 ` 접두는 키에 그대로, `_LOAD_TIPS_KO` 63968~), B-188 `#stLoadTip` 「위층으로 오르는 중...」(HTML 3243), B-243 「"지옥을 탈출하라. 죄의 무게를 짊어진 자여."」(번역은 `localization/warrior-story/*.json`의 wa33a+wa33b 이어 붙이기; 미리보기 전용 `PROLOGUE_LINES` wa33, game.html 62903).
2. **처리 규칙 6개**: ①중복 문장 키 하나(B-128=B-159, B-129=B-158, B-120=B-121=B-127) ②분노 조립 문장(B-161+B-162, game.html 38738 「분노 」+수치+「%! 패링으로 분노 더 쌓아!」)은 형식 문자열 키 하나 — `ExoduserI18n.format` 자리표시 관례, 화면 결과 동일 ③EN만 있는 4행(B-120·121·125·127)은 27언어 보충, `_EN` 없는 6행(B-122·123·133~136, 목록 EN 열 값을 `_EN`에 추가), 목록 미등록 11행(상자·잔해·지옥문·창고·J키)과 resume 17키는 **번역목록 등록만** ④No.2914·2915 이중 부여는 git blame으로 나중 쪽에 새 No., 옛 번호는 비고, 옛 문장 행(CAT-31 등)은 현행 문장으로 ⑤바뀐 4줄의 옛 키는 lang에 남김 ⑥새 No.는 **3599부터**. 28언어(ko+EN+27) 전파.
3. 그대로 번역: 펫 대사 전부(STY-D19 전이라 가벼운 말투도 그대로), 클리어 패널 `_L` 3줄(B-189~191: 27언어 키와 목록만, EN은 인라인 인자 그대로), 엔딩 `doWin()` 3줄(B-244~246). **피날레 배너는 제외**(위치를 디자인총괄에게 묻는 중).
4. 검증: 문법 검사(`syn.cjs`)와 키 대조(`chkB.cjs` 새로 작성) 각 1회. 영어·일본어로 펫 말풍선·로딩 팁·클리어 패널을 1개씩 1x 캡처해 `G:/exoduser/tmp/design-review/20261028_dialogue_B/`(headless·음소거, 끝나면 dev 서버·Playwright 프로필 정리). 로컬 G:\exoduser에는 `--no-docs`로만 적용(로컬 커밋 금지).
5. 반영: 가드 통과 커밋을 최신 origin/main에 cherry-pick 뒤 push(A·C 방식). 커밋 전 메모리 20GB 이상. 보고: push SHA, No. 범위, 실제 처리 건수, 캡처 경로.

### 알아 둔 사실 (B2에서 바로 쓸 것)
- `_T(s)`는 `_LANG_TBL[OPT.lang][s]` **정확 일치**. 영어 = `_EN`(game.html `const _EN={…}` 6353~ + `Object.assign(_EN,{…})` 블록 10947·10949·10951·10953·10954·42221·60950 부근, 줄 번호는 이동). 27언어 = 각 `lang_<code>.js`(`const _JA={…}` + `Object.assign(_JA,{"키":"값",…})` JSON 블록; 묶음 A·C 적용 방식은 `dlgA_apply.py`·`dlgC_apply.py` 참고). 코드 순서 `ar bg cs da de el es fi fr hu id it ja ms nl no pl ptbr ro ru sv th tr uk vi zh zht`.
- 호출부 배열: `_tips` 9672, `_nags` 9669, `_pt` 9680, `_chDlg` 9686~9693, `_envDlg` 9700, `_bi` 9730, 난이도 9762~9766, `_cc` 9832, 이벤트 반응 고양이 9794~9823. 이 배열 문자열들은 이미 `_petBidCD`/`_petSayCD`가 내부에서 `_T`를 거치는지(배선 여부)를 **먼저 확인**할 것 — 번역이 없어서 키만 추가하면 되는 줄과 호출부에 `_T()`가 빠진 줄을 구분해야 한다(`_petBubble` 표시 경로 확인).
- `_L(ko,en)` 인라인(42195~42198 클리어 패널)은 `_EN`·lang 키가 없다. 27언어를 보이게 하려면 `_L(` → `_T(` 교체 또는 `_L`이 `_T`를 거치게 해야 한다(코드 변경 1~2줄, 확인 필요).
- 목록 번호: 최대 3598(묶음 C), i18n-fill 3500~3587 선점. 번역 점검 세션(`local_2a4889ed`)과 범위 겹침 주의(그쪽은 3500~대).
- B1 문서의 말투 열은 기계 분류라 B-007·B-035가 틀렸다(판정에 영향 없음).

## 금지·주의
- `git add -A`·`--no-verify`·force push·history rewrite(rebase 포함) 금지. 커밋은 경로 지정만. untracked 새 파일은 `git add -- <그 파일>` 후 `git commit -F msg -- <경로>`. 로컬 G:\exoduser main 커밋·push 금지(로컬 main 번들 8bf094fe6).
- push 거절 시 `git fetch origin && git checkout --detach origin/main && git cherry-pick <SHA>` 후 즉시 push(1회).
- 워크트리(`E:/exoduser-wt/dialogue-b2`)는 push 확인 후 junction 0 확인 → `git worktree remove --force`. 커밋 메모리 20GB 이상일 때만(`Get-CimInstance Win32_OperatingSystem` FreeVirtualMemory, 직전 24.5GB).
- 테스트는 수정 후 1회, 2번 실패면 멈추고 보고. 백그라운드 `python -`(stdin 대기) 절대 금지. Node는 `C:/nvm4w/nodejs/node.exe` 전체 경로.
- 공유 작업트리 G:\exoduser에 타 세션 WIP 상존 — 건드리지 않는다. 순간이동 마감(`_emCell`) 커밋은 계속 보류.
