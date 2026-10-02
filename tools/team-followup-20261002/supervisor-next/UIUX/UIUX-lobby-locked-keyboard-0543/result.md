# UIUX — UI-05 로비 잠금 카드 키보드 활성화

**NO-FIX**. 현재 source에서 잠금 카드의 키보드 미리보기는 의도된 동작이며 생성 잠금/안내를 유지한다. 잠금 실버테일 Enter1건과 전사 Enter대조1건 **source2PASS**, 후보0·이전 검사 재실행/합산0. **productionApplied=false**. source PASS는 native keyboard/gamepad/runtime/HTTP/GPU/visual/audio/storage/product PASS가 아니다.

| 인수/소유/시각 | 실제 확인 |
|---|---|
| taskId / 제공자 | UIUX-lobby-locked-keyboard-0543 / Codex |
| chat / 감독 | 01a0faaf-8fd2-7083-b174-69c604bd58b0 (PROVIDER-HALVES UIUX 행) / 01a0fb1e-4ec3-7dd3-bba2-f87518e881fa (실제 위임 출처) |
| 실제 cwd/realpath | `/Users/fordeargamers/Projects/exoduser-migration-20261001`, 끝20261001, 동일 |
| TASK realpath | `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/UIUX/UIUX-lobby-locked-keyboard-0543/TASK.md`, 소유 경계 동일 |
| 실제 Read / 입력 SHA 관측 | 2026-10-02T05:45:37.345Z / 2026-10-02 14:45:37 KST. TASK·COMMON·AGENTS·담당표·UI05·캐릭터 선택/전대 SSOT·index source 및 기존 fixture를 읽음 |
| 후속 SSOT Read | 캐릭터선택_리모델링_기획서.md §2026-09-28 키보드 계약: 잠금 카드 미리보기 허용, Enter/Space는 네이티브 click, 아이콘 입력으로 이름창/저장 요청 시작 없음 |
| 제공 commit | f2e70ef7c9c663fdd69e925bc379b6d6f8bcaa9c — 감독 TASK의 총괄 제공·조회시점 근거(05:42 전후). 독립 Git/HEAD 관측 아님 |
| 실제 핵심 SHA | index `38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8`. game/easy/node는 preflight의 실제 측정값이 TASK 제공값과 동일. 과거7e694950/6c77/c40e는 역사 입력 |
| HEAD / Changes | UNKNOWN / 감독 추적. Git 재조회0. 80 root checkpoint/100 전 중단 기준 인수 |
| 이전 minus | root 통합 source2GREEN/음성2RED는 TASK 피드백 인수만. 실행0 |
| 새 검사 실행 | 2026-10-02T05:47:57.637Z → 2026-10-02T05:47:57.696Z (2026-10-02 14:47:57 KST), 지정 Node exit0·JSON stdout, 실행1회·허용2입력 |
| 소유 | 이 새 폴더 checks.mjs/result.md/evidence.json만3산출. TASK/기존 산출 보존 |

| 실제 데이터/경로 | 계약 |
|---|---|
| CHAR_VISUALS | 5종:0 전사 unlocked;1 실버테일/2 헬거너/3 변성술사/4 창법사 comingSoon=true. 이번 입력은0과1만 |
| 카드 생성 | openVisualSelect: button/type=button, .cs-ico, data-vi. 잠금 카드도 미리보기 enabled. locked 클래스·출시 준비 중 배지/title 표시. ico.onclick=()=>selectVisual(ci) |
| pointer/keyboard 연결 | click이 selectVisual만 호출. _visualSelectKeydown는 Escape/방향/Home/End/Tab/IME 처리 외 Enter/Space를 preventDefault/stopPropagation 하지 않음. Enter 기본 click은 이번 host 대역으로 모델링 |
| 선택 ID | _pendingVisualIdx는 미리보기 인덱스. 이번 활성화가 슬롯 선택/이름창/생성/저장을 확정한다는 뜻이 아님 |
| 잠금 안내 | selectVisual: release-locked 토글, visualCreateBtn.disabled=!!comingSoon, 버튼 문구/csReleaseLabel/카드 배지 출시 준비 중 |
| 선택 확정 | _visualConfirm 첫 guard는 comingSoon이면 return. warrior는 그 뒤 이름창 경로. 정적 Read만, 실행0 |
| 최종 생성 | doCreateChar는 disabled 및 comingSoon을 저장 요청보다 먼저 확인; offline handler에도 comingSoon guard 있음. 정적 Read만, endpoint/저장 종단 실행0 |
| 기존 focus | 열기 전에 _visualReturnFocus 보존, 선택 아이콘 초기 focus. 입력 준비 때 목표 버튼에 focus 후 실제 keydown/click/selectVisual은 focus 변경0 |

| 허용 새 입력 | target index/id | pending index | 생성 disabled / 문구 | 잠금 안내 | focus index / 대역 노드 수 | 저장 sink | 판정 |
|---|---|---|---|---|---|---|---|
| locked | 1 / exoduser_silvertail | 0→1 | true / 출시 준비 중 | 출시 준비 중 | 1 / 42 | 0 | PASS |
| warrior-control | 0 / exoduser_warrior | 1→0 | false / 생성 | 빈값 | 0 / 42 | 0 | PASS |

실행 순서는 두 경우 동일하다: **목표 버튼 초점 → 실제 등록된 _visualSelectKeydown(Enter) → prevented=false/stopped=false → host의 native button 기본 click → 실제 ico.onclick → 실제 selectVisual**. 키다운 직후에는 기존 preview가 유지되고 기본 click 뒤에만 새 미리보기 인덱스/aria-pressed/잠금 상태가 갱신됐다. 초점은 활성화한 카드에 그대로 있고 _visualReturnFocus도 보존됐다. 두 경우 이름창 미표시, 실제 확정·생성 호출0, fetch/localStorage/slotInsert sink0이다.

| source와 대역 구분 | 확인/한계 |
|---|---|
| 실제 source 실행 | CHAR_VISUALS 전체, openVisualSelect/selectVisual/_visualSelectKeydown/_resetVisualInfoScroll 전체 및 실제 keydown/생성 버튼 binding을 현재 index에서 AST로 추출해 VM 실행. fake selection/lock handler0 |
| Enter 기본 동작 | 브라우저/OS 네이티브 입력이 아닌 **명시적 host double**. 실물 키보드 도달성을 PASS로 계산하지 않음 |
| Space | source가 가로채지 않는 branch와 SSOT 네이티브 버튼 계약을 읽기 인수만. 새 Space 실행0; Enter2건에 합산하지 않음 |
| DOM | 기존 inventory-dom/node-dom.mjs 읽기 전용 import; compound class/getAttribute/listener/click/focus 기록만 보충. production DOM 전체가 아님 |
| 노드 보존 | 합성 host42노드의 identity/개수와 카드 자식 참조를 입력 전후 동일 확인. 기존 리프5개 children.length=0. 기존 실제 페이지 노드수42라는 뜻이 아님 |
| 부모 내용 교체 | 미디어/traits DOM은 null 대역으로 생략해 selectVisual의 csTraits.innerHTML 경로 실행0. 텍스트 갱신은 확인한 리프뿐. 광범위 div 선택/새 후보 부모 교체0 |
| 렌더·의존 대역 | KO _TL identity, timer queue만(180ms/기타 callback 실행0), 엠버 no-op. 영상/scene/traits/thumbnail/aura·실제 미디어/전체 page 부트0 |
| 기존 슬롯 상태 | trace selectedSlot은 fixture의 없는 값에 null을 정규화한 표시. 기존 슬롯 선택 종단 동등성 검증이 아님. 실제 저장/새 슬롯 sink 호출0과 구분 |
| 정적 guard | _visualConfirm/doCreateChar/offline comingSoon guard는 읽기·SHA 기록만; 강제 호출/생성 fixture 추가0 |
| 이전 근거 | 2026-09-28 Enter/Space 실화면과2종 합성 로비 검사는 당시 이력. 이번 현재5종 데이터 기반2입력에 재실행·합산0. UI04/plus/minus/HUD0 |
| NO-FIX 영향 | 새 우회·안내누락 반례 없음. comingSoon/unlock/저장/수치/handler를 변경할 근거 없음. 메모리 guard/focus 후보 생성0 |
| 남은 Gate | native keyboard/Space/gamepad, 실제 앱·빌드 비교, 시각·미디어·전체 UI05, 실제 확정/저장/HTTP/청취/제품 QA |

| 실제 source fragment | 현재 index.html 행 | UTF-8 SHA256 |
|---|---|---|
| 실제 캐릭터5종 데이터 | 3076–3114 | `b37783b99abdbc25f87cc00c0524d60fe2f063eedffdb939a19481334b61d9a1` |
| 카드 생성/onclick/초기 focus | 3227–3246 | `42150f7f2c86ee2f792079a9b1540230856c2bedfe3c203f212d42e957813e53` |
| 실제 미리보기/comingSoon/UI 갱신 | 3155–3216 | `3db46074afc04296d7d42e136a1153485e4f1748cf7930029b948ac0814d2b8b` |
| 실제 키다운 전체 | 3247–3267 | `a94f16bcbd7e13b17cef7549ed71f72bc87545bfd6c8a1206fb02f45c513a06e` |
| 원래 정보 스크롤 초기화 | 3144–3147 | `6d103cd9dc1a570fb86ddb4f24619c44c57b5100b37bdf125f79b6514389fc47` |
| 확정 guard — 읽기만 | 3270–3275 | `a3ac40e591d152dd25bb2528e4c4f5c75491836c1035a85da370fc305258c996` |
| 최종 생성 guard — 읽기만 | 3304–3346 | `484be813916042c26657ccf68d50c8348393be6a2112acb27941fae86b0b89f9` |
| 실제 keydown 연결 | 3268 | `772e0ccafc4649818296f0bb4782e9a20a61da2a6e6bf3306c5b8bf77170a46e` |
| 실제 생성 버튼 연결 | 3276 | `56c8321d96d5e767ddb47ee42d9a51c390a7d4b94c137f76cbf77d59d072ad3f` |
| offline comingSoon guard — 읽기만 | 2784 | `c91e1072c1c4b7ebe1f7c5169df7f669fc9702d61c541a11a87b592230299761` |

코드 산출 뒤 docs 전체 관련키워드 rg(제한 glob 없음): `UI-05|CHAR_VISUALS|comingSoon|_visualSelectKeydown|openVisualSelect|selectVisual|_visualConfirm|doCreateChar|출시 준비 중|잠금.*(카드|캐릭터)|Enter·Space`, exit0, **341행 / 54파일**, 원문 출력 SHA256 **`ab0ded1c940a693dc95e931a7bcf394156ae080ed4575835fc5f6e73e58fac05`**. 목록/행/파일SHA/명령·시각을 evidence.docsSearch에 남겼고 원문 전체 출력은 복사하지 않았다.

| 정확한 canonical 인계 | 내용 |
|---|---|
| 캐릭터선택_리모델링_기획서 | 기존 키보드 절 뒤에 아래 2026-10-02 NO-FIX 표/문안·행·SHA·미검수 추가 |
| UI_UX_IMPROVEMENT_PROJECT | UI-05 전체 대기/미검수는 유지하고 이 source 경계만 부분 검수 기록. UI05 완료나 실물 키보드 PASS로 변경하지 않음 |
| UI_COMPOSITION | 동일 키보드 절에 링크. 현재2종/controls6·5 표는 2026-09-28 당시 검증 이력으로 명시. 이번5종은 source 데이터 확인이며 Tab 재검사0 |
| LOBBY_ANCESTOR_ART | comingSoon/생성 제한 유지에 링크만. 미디어 규격/unlock/저장 수치 변경0 |
| 다른 매칭·잠금 | 검색 근거 인계, unrelated 설계/수치 변경안0. 보호2_3 수정0 |

총괄에게 인계할 정확한 문안:

> 2026-10-02 UI-05 잠금 캐릭터 키보드 미리보기 source 검수: 현재 index.html의 CHAR_VISUALS는5종이며 index0 exoduser_warrior는 comingSoon=false(원문 flag 없음), index1 exoduser_silvertail 및2~4는 comingSoon=true다. openVisualSelect는 잠금 캐릭터도 활성 네이티브 button/type=button으로 생성해 미리보기 접근을 허용한다. _visualSelectKeydown는 Enter/Space를 취소하지 않고 버튼 기본 click에 맡긴다. 이번 검수는 Enter 한 번의 실제 keydown→대역의 네이티브 기본 click→원래 ico.onclick/selectVisual 순서로 잠금1건·전사 대조1건만 실행했다. 실버테일 미리보기 선택(_pendingVisualIdx=1)은 release-locked=true, visualCreateBtn.disabled=true, 버튼/배지/csReleaseLabel의 출시 준비 중 안내 유지, 기존 초점/노드와 저장 sink0이다. 전사 대조(_pendingVisualIdx=0)는 잠금 표시 해제, 생성 버튼 enabled/생성 문구, 안내 빈값, 초점/노드 및 저장 sink0이다. 이름창/선택 확정/캐릭터 생성 입력은 실행하지 않았다. _visualConfirm와 doCreateChar 및 offline 생성의 comingSoon guard는 정적 Read 인수만 했다. source2PASS/NO-FIX, 후보0, productionApplied=false. Enter 기본 동작은 host double이며 이번 실물 키보드/Space/gamepad/runtime/HTTP/GPU/시각/청취/저장/제품 Gate는 미검수다. 이전 로비·UI04·plus/minus·HUD 검사 재실행·합산0.

| # | docs 전체 검색 매칭 파일 | 행 수 |
|---|---|---|
| 1 | `docs/0마스터플랜/DEMO/HELL_DEMO_BUILD_NOTES.md` | 1 |
| 2 | `docs/0마스터플랜/EA/HELL_EA_BUILD_CHECKLIST.md` | 2 |
| 3 | `docs/0마스터플랜/PROJECT_MANAGEMENT_MASTER.md` | 2 |
| 4 | `docs/0마스터플랜/mac-resume-20261001/BUILD-SOUND-잔여팀-인수검토.md` | 1 |
| 5 | `docs/0마스터플랜/mac-resume-20261001/map020-zoomfix-evidence/SKILL-팀검토.md` | 1 |
| 6 | `docs/0마스터플랜/mac-resume-20261001/map020-zoomfix-evidence/team-receipts.json` | 1 |
| 7 | `docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/ITEM-definition-result.md` | 1 |
| 8 | `docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/PERSISTENCE-MAC-PACKAGE-20261002.md` | 1 |
| 9 | `docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/PRODUCTION-INTEGRATION-20261002.md` | 1 |
| 10 | `docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/UIUX-review-result.md` | 1 |
| 11 | `docs/11내러티브·로어디자인/11내러티브·로어디자인.md` | 1 |
| 12 | `docs/13출시·마케팅/INDIE_LIVE_EXPO_20261201_SUBMISSION_20260928.md` | 2 |
| 13 | `docs/13출시·마케팅/PUBLISHER_REDELIVERY_20260930.md` | 1 |
| 14 | `docs/13출시·마케팅/STEAM_INSTALL_REVIEW_20260916.md` | 1 |
| 15 | `docs/14밸런스+수치테이블/BALANCE_ECONOMY_TEAM_MASTER.md` | 1 |
| 16 | `docs/15 세이브+데이터구조/15 세이브+데이터구조.md` | 29 |
| 17 | `docs/16번역·로컬라이제이션/FINISH_TRANSLATIONS_20260923.md` | 1 |
| 18 | `docs/16번역·로컬라이제이션/LOCALIZATION_RUNTIME_20260909.md` | 7 |
| 19 | `docs/16번역·로컬라이제이션/STEAM_LANGUAGE_RESUME_20260921.md` | 1 |
| 20 | `docs/16번역·로컬라이제이션/번역_가이드.md` | 3 |
| 21 | `docs/16번역·로컬라이제이션/번역대상_전체목록.md` | 4 |
| 22 | `docs/1전체그래픽세팅/CHARSELECT_VIDEO_QUALITY_20260913.md` | 8 |
| 23 | `docs/1전체그래픽세팅/LOBBY_IMAGE_REVIEW_20260913.md` | 1 |
| 24 | `docs/1전체그래픽세팅/LOBBY_WARRIOR_REDESIGN_20260913.md` | 1 |
| 25 | `docs/2_1 스킬관리+합체시스템+자원/SKILL03_설치확정_자원검수_20261001.md` | 1 |
| 26 | `docs/2_1 스킬관리+합체시스템+자원/SKILL_자원게이트_감사_20261001.md` | 1 |
| 27 | `docs/2_1 스킬관리+합체시스템+자원/신규캐릭_스킬프로젝트_20260930.md` | 5 |
| 28 | `docs/2_1 스킬관리+합체시스템+자원/헬거너_H2_이식의존성_20261001.md` | 3 |
| 29 | `docs/2게임디자인레벨디자인/PARRY_TUTORIAL_20260912.md` | 1 |
| 30 | `docs/3.1 ui hud 디자인/LOBBY_ANCESTOR_ART_20260928.md` | 8 |
| 31 | `docs/3.1 ui hud 디자인/SETTINGS_HUD_DETAIL_20260930.md` | 1 |
| 32 | `docs/3.1 ui hud 디자인/SETTINGS_UI_WORKSPACE_20260929.md` | 1 |
| 33 | `docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md` | 37 |
| 34 | `docs/3.1 ui hud 디자인/UI_FOUNDATION_20260924.md` | 1 |
| 35 | `docs/3.1 ui hud 디자인/UI_UX_IMPROVEMENT_PROJECT_20260930.md` | 1 |
| 36 | `docs/3.1 ui hud 디자인/lobby_full_patch.md` | 33 |
| 37 | `docs/3.1 ui hud 디자인/남전사_로비_아이들_모션_20260908.md` | 9 |
| 38 | `docs/3.1 ui hud 디자인/캐릭터선택_리모델링_기획서.md` | 52 |
| 39 | `docs/3.3 키바인딩+설정/3.3 키바인딩+설정.md` | 1 |
| 40 | `docs/3.3 키바인딩+설정/게임패드_호버_상호작용.md` | 21 |
| 41 | `docs/4.0케릭터스프라이트 디자인/캐릭터_몬스터_보스_최적화디자인_v1.md` | 10 |
| 42 | `docs/5.0애니메이션파이프라인/ANCESTOR_GROK2_SPRITE_TRIAL_20260928.md` | 1 |
| 43 | `docs/5.0애니메이션파이프라인/LOBBY_VARKAN_SPRITE_VIDEO_20260928.md` | 2 |
| 44 | `docs/7아이템디자인/ITEM_TEAM_MASTER.md` | 1 |
| 45 | `docs/7아이템디자인/UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md` | 2 |
| 46 | `docs/7아이템디자인/UNIQUE_TOP8_HOOK_REVIEW_20261001.md` | 1 |
| 47 | `docs/7아이템디자인/고유아이템_모델_어픽스_밸런싱_프로젝트_20260930.md` | 1 |
| 48 | `docs/7아이템디자인/보라색_고유아이템_카탈로그_20260930.md` | 2 |
| 49 | `docs/7아이템디자인/유니크_어픽스_리스트.md` | 1 |
| 50 | `docs/CHANGELOG_DAILY_20260520.md` | 10 |
| 51 | `docs/CHANGELOG_SYNC.md` | 47 |
| 52 | `docs/archetypes/silvertail/SILVERTAIL_KEYART_CANON_20260927.md` | 10 |
| 53 | `docs/cinematic/WARINTRO_CREATION_RUNTIME_20260910.md` | 2 |
| 54 | `docs/미구현+구현예정.md` | 2 |

| 최종 보존/도구 | 결과 |
|---|---|
| 보호 입력 | index/game/easy/node·AGENTS·COMMON/TASK·기존3산출·기존test/DOM helper는 preflight→완료 SHA 동일 |
| 공유 진행 변동 | 전체 선행 읽기 파일의 변화: 없음. 이번 쓰기와 구분하여 evidence.finalAudit 전후 SHA 기록 |
| 실제 도구 | exec_command / 지정 Node VM / 로컬 Acorn 원문 추출 / rg / apply_patch만. skill/API/MCP/추가 설치 호출0 |
| 오류/반복 | 새2입력 PASS, 하니스 오류0, source RED0, 후보0. 실행1회, 이전 반복0 |
| 금지 행동 | 생산/공유docs/기존 산출/Git 조회·index·commit·push/실게임·저장/서버·HTTP/UI·앱·빌드/설치·계정·권한/게시·외부메시지/새session·하위팀/삭제·이동·cleanup/소유밖 write 전부0 |
| 완료 범위 | 이번 단일 잠금 활성화 경계와 전사 대조 완료. 공유docs 통합/제품 Gate는 원총괄 인수 범위. 새 업무 자체 생성0 |
