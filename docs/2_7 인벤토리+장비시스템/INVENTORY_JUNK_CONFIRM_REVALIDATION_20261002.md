# 쓰레기 일괄 분해 — 확인 후 잠금 보호

분해 확인창 대기 중 실제 전역 F로 아이템을 중요잠금해도 이전 콜백이 잠근 객체를 삭제하고 이전 보상을 지급하는 문제를 수정했다. 확인 직전과 확인 후 원래 집합의 현재 상태를 재검사한다.

| 경계/변수 | 정확 계약 |
|---|---|
| 확인 후 재검사 변경 당시 source | `game.html`, `game-easy-test.html`의 `_jkBtn.onclick` 각각1개. callback682→1244B, 각+562B. 다른 callback/global helper 변경0 |
| 원래 `_jkItems` | 렌더 당시 filtered에서 캡처한 원래 junk 객체 집합. 확인 후 새로 생긴 junk 객체를 자동 추가하지 않는다 |
| `_canJunk(it)` / `_value` | 현재 bag의 같은 객체·junk=true·fav=false·equipped에 같은 객체 없음. `salvageVal(it)` 값이 유한하고0이상인 객체만 허용. 콜백 내부 predicate |
| `_pendingJunk` / `_pendingTotal` | 원래집합에서 확인 직전 적격 객체를 필터하고 현재 분해액을 합산. 빈집합이면 확인창 열기0 |
| `_currentJunk` / `_currentTotal` | 확인 성공 뒤 pending집합을 같은 조건으로 다시 필터하고 현재 분해액을 합산. 빈집합이면 추가 상태 변경0 |
| 지급/제거 | bag에서 current집합의 객체 identity만 제거하고 `G.mats+=_currentTotal`. 현재 적격 일부만 남아도 그 일부의 현재 보상만 지급 |
| 성공 후 | `_invSalSel.clear()`→`INV.selected=null`→`SFX.pickup()`→`dbSaveNow()`→`renderInv()` 기존 순서 |
| 취소/적격0 | 원래 modal/key handler의 부작용과 await 후 제거·보상·선택·SFX/save/render 부작용을 구분. await 후 적격0은 latter0 |
| 실제 재현 | main/easy 모두 실제 전체 등록 keyboard KeyF→actual gameConfirm/gcOk→await bulk를 연결. A잠금/B일반, 초기악의500에서 old A+B3000지급→3500, final A보존/B2000만지급→2500 |
| baseline | 신규28그룹=양판14씩, 8PASS/20상태·보상FAIL; fixtureErrors0. 이전 검사 반복0 |
| final | 신규28/28 PASS + 별도 정상 역소스대조8/8 동일(정상·취소·새junk 제외·KeyF후취소×양판). final source 실행contexts44=28+대조8×old/final2; 44를44독립PASS로 세지 않는다 |
| 정상 대조 | 확인내용·state·SFX/save/render·RNG 동일. main/easy 기존차이 유지 |
| 구문/보존 | inline JS12/importmapJSON2 1회PASS. callback2 외 전체 bytes/EOL 동일 및 역치환 exact. index·single/drop·GP·장비경제공식·기존test 원문보존 |
| 당시 source4 main | 4028906B/SHA e462f2345682856d24bb416a17aec763281a8dceb02f21af565db189992353ea |
| 당시 source4 easy | 3906353B/SHA 68fa8e17d379fdf7e9da20b153d874e2ac74544d790397b4d36edbcc1207f390 |
| index | 342119B/SHA1dd28cab162a4384ad84a356eb2c719940782005d20da1312d2857bc649615a7 보존 |
| 검사 | `test/inventoryJunkConfirmRevalidationAcceptance.test.cjs` |
| 근거 | ignored `tmp/mac-migration-runtime/continued-review-20261002/inventory-junk-confirm-revalidation-acceptance/` source백업/baseline/final/receipt, docs검색은 같은상위 `inventory-junk-confirm-revalidation-docs/` |

현재 DOM/통계·부분renderer·오디오·저장 등은 대역이다. 실제 OS 키보드/마우스·native modal·패드·픽셀·청취·서버저장·전체게임 인수와 구분한다. aggregate 합계의 비정상 overflow·객체getter/분해액계산 예외·다른 single/선택분해/옛 callback 수명은 이번 범위의 추가 인수가 아니다. 이 보고 작성 당시 b3 앱은 이전7ccb72c0 세수정 snapshot이었다. 이후 source4 앱과 source5 후속은 아래 현행 관측을 따른다.

[인벤토리 SSOT](2_7%20인벤토리+장비시스템.md), [UI 정본](../3.1%20ui%20hud%20디자인/UI_COMPOSITION_20260925.md).


## 2026-10-03 source5 — 첫 확인 요청 보존

같은 일괄분해 버튼이 확인 대기 중 다시 활성화되면 기존 gameConfirm은 첫 resolver를 덮어쓰고 첫 await를 pending으로 남겼다. 실제 패드 처리의 RT와 A가 같은 poll에서 같은 선택 버튼을 활성화할 수 있는 등록 경로도 소스로 확인했다. 물리패드 실행이나 게임 전체의 영구 정지는 입증하지 않았다.



### 2026-10-03 공용 확인창 재진입 — source5

| 항목 | 현행 계약 |
|---|---|
| `gameConfirm(msg,okTxt,cancelTxt,html)` | 첫 줄 `if(_gcResolve)return Promise.resolve(false);`. 활성 요청이 있으면 새 요청은 즉시 false로 끝나며 기존 메시지·버튼 문구·handler·resolver를 보존한다 |
| 첫 요청 | 원래 확인/취소로 resolve하고 modal on 제거·`_gcResolve=null`; 이후 새 요청은 정상 수락 |
| 재진입하는 일괄 분해 | 둘째 await는 false로 종료되어 제거·악의 지급·SFX/save/render0. 첫 승인만 기존 확인 후 identity/잠금 재검사에 따라1회 처리 |
| 변경 범위 | 양판 공용 함수 각+47B/1줄, 함수472→519B. 현행 함수SHA `c058a9e17835372bbb9fad878f670bf814b4fef9eb945d9f11bfafb233ddbbd2`. 분해액·경제·저장 구조·키/패드 handler 변경0 |
| 검수 | actual live 함수·등록 junk onclick 신규재진입12/12PASS+정상순차 역소스대조4/4동일, 총20source contexts. 기존28그룹 재실행0. OS키/물리패드/전체게임·native·청취는 별도 |

| 실제 source/근거 | 정확 값 |
|---|---|
| source5 인수 당시 main | 4028953B / `fd4e55dfefad0985870dc3f6dc1633793dad22e48ddb336dda881cdd4edbfe17` |
| source5 인수 당시 easy | 3906400B / `db6019a1027464695fcc20b509db05f301eaf23ccc517a70ff8aedeadb61529c` |
| index | 342119B / `1dd28cab162a4384ad84a356eb2c719940782005d20da1312d2857bc649615a7` 불변 |
| 이전 함수 | 472B / `bcb5363530521e8bea78406450ddda4d09aaf302278654a3ce120a910abb1439` |
| 현재 함수 | 양판519B / `c058a9e17835372bbb9fad878f670bf814b4fef9eb945d9f11bfafb233ddbbd2`, 공식 UIUX 후보와 exact |
| 재진입축 | direct/direct, bulk/bulk, direct/bulk × 첫 승인/취소 × 양판 =12. 원소스12FAIL(첫 Promise 유실), 후보12PASS |
| 정상 대조 | 양판 순차 bulk2회 및 direct3회, 총4그룹의 state·인수·요청/효과 순서 동일 |
| 최종 실행 | `test/gameConfirmReentryAcceptance.test.cjs` 12341B/SHA `9062e04cd26c3d351dfd23aa0c2b8bd4b1f8e0dbf5c6619de1e718b2461b3a3a`. source5 인수 당시 source를 읽어1회 실행, guard 재삽입0/쓰기0, 12PASS+4정상대조·fixtureErrors0 |
| 구문 | 변경된 양판 executable inlineJS12/importmapJSON2 1회PASS |
| 보존 | 각47B 역치환시 source4 백업 전체bytes/EOL exact. 분해 caller·GP·키·index·보호2_3·경제·앱 실물 core 불변 |
| prototype 영수증 | ignored `continued-review-20261003/confirm-reentry-review/receipt.json`, 38753B/SHA `7384a2205309bcc45c16fda6885aff634e7743edbc704b4277cf18370f79c1af` |
| 최종 영수증 | ignored `continued-review-20261003/root-confirm-native-checkpoint/final-test.stdout.json`, 24819B/SHA `5a5031db464f0ab6a6cd857070a027fd6938999b978ef8d38e1f27b26e69b1cf` |

기초 하니스의 정상 bulk2개에 VM 배열/host 배열 prototype 비교 오류2가 있었으며 원출력을 보존했다. host 배열 비교로 교정해 해당 bulk2대조만 다시 확인했다. 생산 실패로 계산하거나 신규재진입12·기존28을 반복하지 않았다. 이후 source 변경에 따른 위 최종 live1회는 현재소스 인수다.

DOM/setter 등록 전 동기 재진입, 외부 resolver 변경·옛 handler 수명·DOM 예외·다른 caller 전수·물리 패드·native focus는 검수 밖이다. 공용 Promise 수명 수정이며 전체게임 복구 불가 정지의 재현/수정으로 보고하지 않는다. 실행 중97bb 앱은 고정 source4이며 이47B source5는 포함하지 않는다. [그 앱의 실제 부분 플레이](../13출시·마케팅/MAC_CH1_SOURCE4_NATIVE_PARTIAL_20261003.md).


## 2026-10-03 source6 — 사망 혈흔 준비 목록

| 경계 | 정확 현재 값 / 근거 |
|---|---|
| production main | 4028973B / `1e4591caea739887ce749492db4ea72547292f583fba1f8e4fcafe88071f8bb8` |
| production easy | 3906420B / `17f490d5d5e38b0fac39085578115acd4b35e48263e84dd542b9a2f298e3ccf5` |
| index | 342119B / `1dd28cab162a4384ad84a356eb2c719940782005d20da1312d2857bc649615a7` 불변 |
| 실제 반영 | ANIM 완료 후보 중 실제 소비 `death_blood`만 양판 기존 준비 selector에 각20B 추가. `death_smoke` 소비0/미채택. source5 gameConfirm519B/함수SHA c058a9e17835372bbb9fad878f670bf814b4fef9eb945d9f11bfafb233ddbbd2 유지 |
| 검수 | 기존 combatTextureWarmup4/4PASS·양판 executableJS12/importmapJSON2 구문1회PASS·source5 전체 역치환exact. 준비 큐80/버퍼120/180f/유휴1장 및 혈흔 frame·blend·전투 수치 불변 |
| 실물 / 미검수 | 기존97bb/PID48587/3386 source4앱은 그대로이며 source5·6 포함0. native CH1-1 연결6단계·보스사망/부활 보존·재도전·청취·첫 처치 성능 개선 미검수. source 변경 건수와 playable 완료를 구분 |
| 최신 GUI 근거 | 본 회차 Code AX 요청에서 도구가 Mac 잠금을 명시적으로 확인. 이전 noWindowsAvailable 원인UNKNOWN 이력은 보존하되 현재 잠금 상태는 확인됨. 기존 잠금해제 질문은 대기 중이며 중복 질문0 |
| Claude 운영 | 담당 실제17:39 관측: QA/STORY 새 source 기록, BOSS 기존 CH1 후보 인계 수신. ART 직접 입력 대기·MAP 기존 큐 미소비. SKILL/ENEMY 감독STATE 읽기와 ANIM `_b3r` 생성/load/resize 소스 읽기 자동검토 거절은 보류. 전체8동시active로 계산0 |
| 보존 범위 | source2+관련docs10=12경로. root 예약13 이내, 새 전문팀 credit0. 감독STATE/LOG·타인WIP·사용자게임/세이브·보호2_3·고정앱 실물 변경0. 커밋/원격 성공은 별도 receipt의 exact SHA로만 판정 |

상세 준비 계약은 `docs/12퍼포먼스·최적화/COMBAT_TEXTURE_WARMUP_20260929.md`의 source6 보충을 따른다. 자동검토 거절 목적은 다른 도구·세션·대리 읽기로 수행하지 않는다.
