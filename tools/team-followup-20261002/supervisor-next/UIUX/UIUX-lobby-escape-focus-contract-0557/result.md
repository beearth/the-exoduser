# UIUX — Escape 닫기와 초점 복귀 정적 source 계약

**NO-FIX / source 계약 인계**. 현재 취소·복귀 연결은 SSOT와 일치한다. 분리된 복귀 대상에 fallback 초점을 지정하지 않는 것도 현재 source 사실로 기록하며 새 UX를 결정하지 않았다. **productionApplied=false**. 이번 함수 실행·VM·테스트·fixture·checks·후보0, 이전 검사 반복/합산0. UI05 전체 완료 또는 실제 접근성 PASS가 아니다.

| 인수/실제 Read 근거 | 값 |
|---|---|
| taskId / 제공자 | UIUX-lobby-escape-focus-contract-0557 / Codex |
| chat / 감독 출처 | 01a0faaf-8fd2-7083-b174-69c604bd58b0 (담당표 UIUX 행) / 01a0fb1e-4ec3-7dd3-bba2-f87518e881fa (위임 메시지) |
| 실제 cwd/realpath | `/Users/fordeargamers/Projects/exoduser-migration-20261001` — 끝20261001, 동일 |
| TASK realpath | `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/UIUX/UIUX-lobby-escape-focus-contract-0557/TASK.md`, 감독 read-only |
| 전체/fragment Read UTC/KST | 2026-10-02T05:59:17.682Z / 2026-10-02 14:59:17 KST |
| 선행 읽기 | TASK 먼저 Read, COMMON/AGENTS/담당표, UI05 작업대장, 캐릭터선택_리모델링_기획서 키보드 절, UI_COMPOSITION 팝업 수명 절. 기존 Enter 산출은 SHA/피드백 인수만 |
| 전체 index.html SHA256 | `38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8` — 현재 디스크 재측정, 과거 pin 추측 아님 |
| 제공 checkpoint | 6c2dadab0b3a81a600e8358f485518cfcb122199, TASK 제공 이력. 현재 HEAD 독립 관측 아님; Git0/HEAD UNKNOWN |
| 과거 pin | f2e70ef7/7e694950/6c77/c40e는 과거 제공·검수 이력. 이번 현재 HEAD로 대체하지 않음 |
| Changes | 감독 추적, 담당 UNKNOWN/Git 재조회0. 80 root checkpoint/100 전 신규 산출 중단 인수 |
| 직전 Enter | NO-FIX/source2PASS 인수만. Enter 기본 click 대역이며 실제 Space/패드/확정·저장 미검수 상태 유지. 재실행0 |
| 산출 소유 | result.md/evidence.json2파일만. 새 checks/fixture/후보 코드0 |

현재 정적 경로표다. 아래 ‘호출/대입’은 **source에 놓인 문장과 조건**을 뜻하며 실행 관측값이 아니다.

| 경계 ID | 조건 | source가 연결/요청하는 순서 | 보장 범위·미검수 |
|---|---|---|---|
| escape-normal | pop 존재/display flex, isComposing=false/keyCode!=229, key Escape/repeat=false | preventDefault/stopPropagation → visualCancelBtn.click() → cancel onclick _closeVisualSelect({restoreFocus:true}) | 소스 연결 계약; 실제 click/blur/focus 실행0 |
| escape-repeat | 같은 열린 non-IME Escape, repeat=true | preventDefault/stopPropagation 이후 click 생략하고 return | 닫기/복귀 요청 경로 미진입; 브라우저 실측 아님 |
| ime | isComposing=true 또는 keyCode===229 | Escape 분기 전 early return, preventDefault/stopPropagation/cancel click 문장 미진입 | OS IME 동등성 미검수 |
| closed-or-missing-popup | !pop 또는 style.display!='flex' | keydown 및 _closeVisualSelect 각각 첫 guard로 return; close에서는 seq/returnFocus/blur/media/focus 문장도 미진입 | style 문자열 조건, 실제 CSS 가시성/레이아웃 판정 아님 |
| open-capture | openVisualSelect 호출 | 첫 문장 document.activeElement를 _visualReturnFocus에 캡처; 선택 카드 또는 cancel focus({preventScroll:true}) 요청 | 실제 캡처 대상/가시성/성공 위치는 미검수 |
| connected-return | 열린 close, restoreFocus=true, target truthy & target.isConnected | target=_visualReturnFocus; _visualReturnFocus=null; 내부active면 blur; popup display none; media 정리 호출들; target.focus({preventScroll:true}) | focus 요청만. disabled/hidden/focusable 검사 없음; 성공 보장 아님 |
| detached-or-null-return | 열린 close, restoreFocus=true이나 !target 또는 !target.isConnected | close 내부 정리 이후 target.focus 문장 생략. 별도 fallback 대상 배정·focus 없음 | 다른 UX 결정/후보 추가0; 실제 activeElement 이후 위치 UNKNOWN |
| confirm-default-false | _visualConfirm, selected comingSoon=false | _closeVisualSelect()의 restoreFocus 기본false, 이전 target 복귀요청 없음; 이름 modal show/charName clear/setStatus; 50ms 후 modal show 유지 조건에서 charName.focus 요청 등록 | 타이머 실행/실제 focus/생성·저장 미검수; comingSoon true면 confirm 첫 guard에서 종료 |
| creation-overlay-default-false | _closeCreationOverlays 호출 | _closeVisualSelect() 기본false; 열린 이름modal 내부blur/show제거/_vkbHide, 숨겨도 vkbWrap block이면 _vkbHide, 활성 story skip 호출 | 화면전환 미디어/키보드/스토리 완료 동등성 미검수 |
| media-static-cleanup | 열린 close, csIdleVid/csSceneVid 노드 존재 | clearTimeout(_csT); _csT/onerror/oncanplay=null; stopMediaVideo; on제거; src/poster제거; load 호출 | 소스 호출/등록 해제 대입 근거만. pause/stop 실제상태·비동기 완료·디코더/GPU·재생동등성 PASS 아님 |

정상 Escape 경로는 **등록된 _visualSelectKeydown → visualCancelBtn.click() → 취소 onclick → _closeVisualSelect({restoreFocus:true})**다. 반복 Escape는 기본동작·버블링 차단 문장을 거친 뒤 click만 생략한다. IME/keyCode229 또는 inline display가 flex가 아닌 팝업은 그보다 앞에서 반환하므로 차단/취소 문장도 진입하지 않는다.

복귀는 열린 close 안에서 저장 대상 참조를 읽고 _visualReturnFocus=null로 해제한 뒤, 내부 초점 blur 요청·display none 대입·미디어 정리 호출을 거쳐 수행한다. **restoreFocus && target && target.isConnected**가 만족되면 focus({preventScroll:true})를 호출한다. 연결만 검사하며 disabled/hidden/focusable은 확인하지 않으므로 실제 focus 성공·위치를 정적으로 보장하지 않는다. 분리되거나 없는 대상에는 focus 호출도 별도 fallback 지정도 없다. 실제 blur 이후 activeElement가 body인지 다른 노드인지 이번에는 관측하지 않았다.

숨김/없는 팝업의 _closeVisualSelect는 첫 guard에서 반환한다. 따라서 이 경로에는 seq 증가·복귀 참조 null·blur·미디어 정리·focus 문장이 없다. 모든 close 호출이 언제나 참조를 해제한다고 확대해서 적지 않는다.

_visualConfirm은 기존 comingSoon이면 즉시 반환한다. 그 다음 _closeVisualSelect()는 **restoreFocus 기본false**이므로 이전 로비 대상 복귀를 요청하지 않는다. 이름창 show/이름·안내 초기화 및 **50ms** 뒤 show 유지 조건의 charName.focus callback을 등록한다. callback 실행·focus 성공·캐릭터 생성/저장은 검수하지 않았다.

_closeCreationOverlays 역시 기본false close를 호출한다. 열린 이름창 내부 blur/show 제거/_vkbHide, 또는 숨겨진 이름창이라도 vkbWrap block이면 _vkbHide, 활성 스토리 skip 호출이 정적으로 연결돼 있다. 전환4경로는 아래 조건부 공용 호출을 인수했다. 전환의 나머지 동작·완료·저장·미디어 결과는 읽기 범위를 넓혀 검증하지 않았다.

| caller | 현재 선언 행 | _closeCreationOverlays 호출 행 | 호출 행 SHA256 |
|---|---|---|---|
| _goLogin | 2675 | 2676 | `1b3aeaa7a37a8aa6a404c2cd8e021ef68052b576372a3a409fc833e3a7cde5e2` |
| _goCinematic | 2703 | 2704 | `1b3aeaa7a37a8aa6a404c2cd8e021ef68052b576372a3a409fc833e3a7cde5e2` |
| _goLobby | 2737 | 2738 | `1b3aeaa7a37a8aa6a404c2cd8e021ef68052b576372a3a409fc833e3a7cde5e2` |
| showLobby | 2883 | 2884 | `1b3aeaa7a37a8aa6a404c2cd8e021ef68052b576372a3a409fc833e3a7cde5e2` |

모두 `if(typeof _closeCreationOverlays==='function')_closeCreationOverlays();`이며 source 존재·함수형 조건에서 연결된다.

| 미디어 정리 정적 근거 | 한계 |
|---|---|
| 대상 | csIdleVid/csSceneVid 두 ID, 존재 노드에만 코드 진입 |
| 타이머/프로퍼티 | clearTimeout(v._csT), _csT=null, onerror/oncanplay=null 대입. error/canplay 프로퍼티 연결 해제이며 모든 종류 listener 해제로 확대하지 않음 |
| 호출/표시 속성 | stopMediaVideo(v), on class 제거, src/poster removeAttribute, load() 호출 |
| 번호 | 열린 close에서 _visualPreviewSeq 증가. 기존 지연 처리 수명과의 실행 동등성은 이번에 검수0 |
| 실제 Gate | stop/pause 실제 상태, 재생/디코더/GPU, load 완료, 늦은 callback/Promise 완료 순서·실제 청취·미디어 동등성은 UNKNOWN. source 호출 존재를 media PASS로 계산하지 않음 |

| 현재 index source fragment | 행 | UTF-8 SHA256 |
|---|---|---|
| Escape/IME/반복/닫힌 popup 분기 | 3247–3267 | `a94f16bcbd7e13b17cef7549ed71f72bc87545bfd6c8a1206fb02f45c513a06e` |
| document.activeElement 캡처·초기 focus | 3227–3246 | `42150f7f2c86ee2f792079a9b1540230856c2bedfe3c203f212d42e957813e53` |
| 공용 닫기/복귀/미디어 호출 | 3119–3131 | `0dff217111acbd4442ce30841915a5cf8c10683d93e193edd9ed6d14de235c38` |
| 전환 시 overlay caller | 3132–3141 | `cee18604ef56d6c1c8c6c7fe7bc320f8ffede78dc2296793174699423a4ae1bc` |
| 잠금 guard/기본false/50ms 이름 focus 등록 | 3270–3275 | `a3ac40e591d152dd25bb2528e4c4f5c75491836c1035a85da370fc305258c996` |
| 취소 → restoreFocus:true | 3277 | `ef1e9e19a48c238664496ef137d02f685d78ed174e4df5faa02f8a50ca9b86af` |
| popup keydown 실제 연결 | 3268 | `772e0ccafc4649818296f0bb4782e9a20a61da2a6e6bf3306c5b8bf77170a46e` |
| 복귀 참조 초기null | 3117 | `f48a7554bcefe533815da80707858d5d4a4d716964a0f1c865087524904d3ac8` |

전체 원문·행/SHA와 caller 선언/호출 fragment를 evidence.staticReferences/callerReferences에 기록했다. Acorn은 설치된 로컬 패키지로 위치를 추출하는 데만 사용했고 source를 실행하거나 새 검사 코드를 작성하지 않았다. 함수의 connected target focus 호출은 조건문 사실이며 DOM/브라우저 대역조차 이번에는 만들지 않았다.

| source ↔ SSOT 판정 | 결론 |
|---|---|
| Escape 비반복 취소/IME early return | 캐릭터선택 SSOT Escape·IME 절과 일치 |
| 기존 activeElement 캡처/connected 복귀 | 캐릭터선택 SSOT 초기초점·공용취소 및 UI_COMPOSITION _visualReturnFocus 절과 일치 |
| restoreFocus 기본false | UI_COMPOSITION 닫기·이름 확정·전환4경로 설명과 일치 |
| 추가 명확화 | repeat도 prevent/stop 요청, detached/null fallback 없음, connected는 focus 시도, 숨김 close는 참조 해제 전 반환을 표로 보충할 근거 |
| 충돌/생산 변경 | source/SSOT 충돌 발견0. fallback UX·guard·미디어·언어·잠금·저장 정책 수정안0, NO-FIX |
| UI05 상태 | 정적 한 경계 인계만. 전체 로비 접근성·실화면·native keyboard/gamepad/제품 검수 미완료 유지 |

관련 docs 전체 rg: `_closeVisualSelect|_closeCreationOverlays|_visualReturnFocus|_visualSelectKeydown|restoreFocus|Escape·IME|UI-05`, exit0, **71행/18파일**, 출력 SHA256 **`2f6915f14a17034c638987598a086f7233f543ef0f1d513e40392e6e6221204f`**. 제한 glob 없이 docs/ 전체에서 검색했고 정확한 목록/매칭 행/파일 SHA/명령·시각은 evidence.docsSearch에 기록했다. 원문 출력 전체는 복사하지 않았다.

| canonical 인계 위치 | 정확한 문안/범위 |
|---|---|
| 캐릭터선택_리모델링_기획서 | 키보드·팝업 정리 절 뒤에 이번 정적 경로표, 현행 행/SHA, 추가 명확화와 미검수 기록 |
| UI_COMPOSITION | Escape·IME/_visualReturnFocus/_closeVisualSelect 설명에 동일 감사 링크. 이전17·187·228·native 검수는 역사 근거로 보존, 이번 합산0 |
| UI_UX_IMPROVEMENT_PROJECT | UI05 정적 계약 인수만 기록. 전체 Gate/대기 상태를 접근성 PASS/전체 완료로 바꾸지 않음 |
| root 판단 Gate | 분리된 target에 fallback이 없다는 사실과 연결 target 실제 focus 가능 여부의 native Gate 인계. 이번 담당이 새 UX를 정하지 않음 |
| 보호/다른 문제 | 보호2_3 및 잠금/언어/미디어 정책 유지. 보스 사망 후 맵 리셋 조사/수정0, root 단독 소유 |

그대로 인계할 문안:

> 2026-10-02 UI-05 캐릭터 선택 Escape·초점 복귀 정적 source 계약(NO-FIX): _visualSelectKeydown는 charVisualPop이 없거나 inline display가 flex가 아니거나 isComposing/keyCode229이면 Escape 분기 전 반환한다. 열린 non-IME Escape는 preventDefault/stopPropagation 후 repeat=false일 때만 visualCancelBtn.click()을 호출한다. cancel onclick은 _closeVisualSelect({restoreFocus:true})다. openVisualSelect의 첫 문장이 document.activeElement를 _visualReturnFocus에 캡처한다. 열린 close는 _visualPreviewSeq 증가, target 캡처/저장 참조 null, 내부 activeElement blur 요청, display none 대입 및 csIdleVid/csSceneVid의 타이머 clear/null·onerror/oncanplay null·stopMediaVideo·on제거·src/poster제거·load 호출을 순서대로 둔다. restoreFocus&&target&&target.isConnected일 때만 target.focus({preventScroll:true})를 요청한다. 분리되거나 없는 target에 별도 fallback 초점을 지정하지 않으며 disabled/hidden/focusable 검사는 추가로 하지 않는다. restoreFocus 기본false이므로 _visualConfirm의 잠금 guard 이후 close 및 _closeCreationOverlays caller는 이전 target 복귀를 요청하지 않는다. confirm은 이름창 show 이후 50ms 조건부 charName.focus 타이머를 등록한다. _goLogin/_goCinematic/_goLobby/showLobby는 함수형 _closeCreationOverlays가 있으면 호출한다. source/SSOT 연결은 일치하나 실제 focus 성공·blur 뒤 activeElement·native Escape·IME·표시·gamepad·media stop/재생/비동기 완료 동등성은 미검수다. 이번 함수 실행/테스트/fixture/후보0, productionApplied=false, UI05 전체 완료/실제 접근성 PASS가 아니다.

| # | docs 전체 매칭 파일 | 매칭 행 수 |
|---|---|---|
| 1 | `docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/ITEM-definition-result.md` | 1 |
| 2 | `docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/UIUX-review-result.md` | 1 |
| 3 | `docs/15 세이브+데이터구조/15 세이브+데이터구조.md` | 9 |
| 4 | `docs/16번역·로컬라이제이션/LOCALIZATION_RUNTIME_20260909.md` | 1 |
| 5 | `docs/1전체그래픽세팅/CHARSELECT_VIDEO_QUALITY_20260913.md` | 1 |
| 6 | `docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md` | 10 |
| 7 | `docs/3.1 ui hud 디자인/UI_UX_IMPROVEMENT_PROJECT_20260930.md` | 1 |
| 8 | `docs/3.1 ui hud 디자인/lobby_full_patch.md` | 10 |
| 9 | `docs/3.1 ui hud 디자인/남전사_로비_아이들_모션_20260908.md` | 1 |
| 10 | `docs/3.1 ui hud 디자인/캐릭터선택_리모델링_기획서.md` | 10 |
| 11 | `docs/3.3 키바인딩+설정/게임패드_호버_상호작용.md` | 9 |
| 12 | `docs/7아이템디자인/UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md` | 1 |
| 13 | `docs/7아이템디자인/고유아이템_모델_어픽스_밸런싱_프로젝트_20260930.md` | 1 |
| 14 | `docs/7아이템디자인/보라색_고유아이템_카탈로그_20260930.md` | 2 |
| 15 | `docs/CHANGELOG_DAILY_20260520.md` | 1 |
| 16 | `docs/CHANGELOG_SYNC.md` | 10 |
| 17 | `docs/archetypes/silvertail/SILVERTAIL_KEYART_CANON_20260927.md` | 1 |
| 18 | `docs/cinematic/WARINTRO_CREATION_RUNTIME_20260910.md` | 1 |

| 최종 소유/검증 범위 | 결과 |
|---|---|
| 파일 | result.md/evidence.json2산출, TASK 보존. checks/fixture/후보 파일0 |
| 입력 보존 | index·AGENTS·COMMON·TASK·직전3산출 SHA 동일. 전체 선행 읽기 변동: 없음; evidence.finalAudit에 전후값 기록 |
| 실행/합산 | 함수/VM/테스트/DOM 대역/native/미디어/비동기 실행0, 이전 Enter2/plus/minus/filter/ossuary/설정/HUD/native 반복·합산0 |
| 실제 도구 | exec_command·지정 Node 정적 파일 읽기/로컬Acorn 위치 추출·rg·apply_patch. skill/API/MCP/설치0 |
| 금지 행동 | production/공유docs/기존 산출/test/Git조회·쓰기/게임·세이브·서버·HTTP·UI·앱·빌드/계정·권한·게시/외부메시지·새session·하위팀/삭제·이동·cleanup0 |
| 완료 | 이번 한 source 계약 인계 완료. 원총괄의 docs 통합·실제품/native/media Gate가 남으며 자체 다음 업무0 |
