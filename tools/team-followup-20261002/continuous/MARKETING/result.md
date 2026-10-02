# 공개 Steam 주장 대조 — 2026-10-02

taskId: continuous-MARKETING-steam-claims. **문서 대조 Gate 완료 / 출하·실게임·멀티·언어 QA 승인 UNKNOWN.** 생산 코드·shared docs·Git·스토어·외부 계정·채널·영상 작업 0. 쓰기는 이 폴더 result.md/evidence.json만 수행했다.

실제 checkout: `/Users/fordeargamers/Projects/exoduser-migration-20261001`. 시작 기록 2026-10-02 05:25:01 UTC / 14:25:01 KST. 총괄 제공 production 기준은 `7e69495046323b3120578f67635c20feb48b2a4f`, TASK 전달 checkpoint는 `cd675f24`이다. 출처는 COMMON/TASK와 총괄 전달이며 정확한 commit 생성·전달 시각은 UNKNOWN, 첫 읽기 시각만 기록했다. Git 조회 금지에 따라 독립 현재 HEAD·Changes는 UNKNOWN, Git 호출 0. 작업 중 총괄이 TASK의 HEAD 기록 문구를 이 해석으로 정정했으며 TASK SHA만 변경됐다. 이 담당은 TASK를 쓰지 않았다.

## 현재 공개 관찰

[공식 Steam App 4749590](https://store.steampowered.com/app/4749590/)를 05:25:26–05:25:28 UTC / 14:25:26–14:25:28 KST에 실제 읽었다. 응답 URL은 요청 URL과 동일, 페이지 언어 English, 게임명 EXODUSER: HELL LORD, 개발/배급 FDG. 공개 표시는 출시 예정이며 현재 구매 가능 제품이라는 뜻으로 해석하지 않았다. 다섯 주장 묶음은 모두 남아 있다. 이전 보고 대비 요청 대상 주장에서 제거·변경된 내용은 관찰하지 못했다. 한국어 공개 설명은 이번에 읽지 않았다. 과거 demo App 5337590의 심사/연결 기록으로 현재 공개 출시 상태를 확정하지 않았다.

아래 모든 공개 관찰의 URL·시각은 위 공통 관찰이다. S1=game.html SHA `6c77ec6f571f4de9cb199a2ac425eb3f0450205bcf6f1d883ac8d13135ac4b43`; S2=index.html SHA `38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8`. 나머지 절대 경로/SHA는 evidence.json에 있다. **각 행 출하의 U는 현재 Steam BuildID·depot manifest·그 파일 SHA와 승인 연결이 모두 UNKNOWN이라는 뜻**이다.

| 묶음·현재 공개 근거 | 현재 source symbol·SHA·정의/접근 범위 | 출하·기존 QA 범위 | 판정 | KO / EN 대체문안 제안 |
|---|---|---|---|---|
| ① 7장, stage·boss 각각 35개 초과 취지, Steam 응답 L142 | S1 CHAPTER_STAGES L15813: 7장, TOTAL_STAGES=35. HELL_BOSSES L15868: 35배정 슬롯, 이름 반복 있음. BOSS_CANONICAL_MAPPING §0의 design 명명19/runtime slot35는 서로 다른 계약이다. _DEMO_MODE=true, cap100, lastStage0; nextStage L42415에서 1-1 후 종료. | U. 과거9/29 Windows 로컬 사본은 Lv100/CH1-1, Steam 업로드와 별개. Mac BUILD report는 예전 source 기반이며 runtime/visual 승인 false. 35구역 완주·35개 초과 고유 보스 검수 근거 없음. | 7/35 정의 확인, fullgame 제공 UNKNOWN. 데모 제공 범위로 읽으면 명확한 범위 충돌. 35슬롯을 35개 초과 고유 보스 증거로 쓸 수 없음. 19vs35 충돌로 보고하지 않음. | KO: 지옥을 배경으로 전투와 장비 수집을 펼치는 다크 판타지 액션 RPG. / EN: A dark fantasy action RPG built around combat and loot in Hell. 데모 설명 후보: 대검전사로 첫 구역을 체험하세요. / Experience the opening area as the Greatsword Warrior. 적용 전 출하 연결 필요. |
| ②a “Six archetypes” L144 | S1 CHAR_LIST L10125는 외형2종; S2 CHAR_VISUALS L3076는5카드,4개 comingSoon. 생성/확정 L2784/3271/3306에서 잠금 검사, 정상 로비 전사1종. 최종기획서 build_document.py §11의 A1–A6는 **보스 유형6**이며 플레이어 직업6의 근거가 아님. 이번 읽은 범위에서 플레이어6종 정규 선택 계약 미확인. | U. 과거 로비/descriptor 검수는6직업 플레이 QA가 아님. 외형·빌드 유형·보스 아키타입 수를 합치지 않음. | 의미 미정/계획 표현, 출하 UNKNOWN. 현재 로비6종 선택으로 해석하면 소스와 명확한 충돌. | KO: 스킬과 장비를 조합해 자신만의 전투 구성을 만드세요. / EN: Shape your combat build through skills and equipment. |
| ②b 희귀도5 단계 취지, L144 | S1 RARITY는5문자열이나 RARITY_N/N_EN/C/MUL L13851–56는 유니크 포함6항목(0–5). mkItem L15177는 전달 rarity의 배율 사용. 아이템 docs §3도0–5 계약. 오래된5문자열 선언만으로 활성 시스템5라고 판정 불가. | U. 등급별 실제 출하 드롭/표시/세이브 QA 없음. | 코드·docs의 전체 희귀도 계약과 공개5등급의 명확한 불일치. 현재 배포본 등급은 UNKNOWN. | KO: 다양한 희귀도의 장비를 수집하고 조합하세요. / EN: Collect and combine equipment of varying rarities. |
| ②c 합체21개 초과 취지, L144 | S1 _FUSE_PAIRS L42972:32키. 초기 _DEMO_FUSE_ALLOWED L15829:22키. _canFuse L43127은 허용·습득·이미 합체 검사. _startTestChar의 테스트 경로 L60042–45는 허용 Set를 확대하므로 초기22와 실행 후 Set를 구분. easy-test는 초기21키, demo cap100/500·lastStage3으로 별도 계약. | U. 수동 목록 개수는 발동·밸런스·저장 QA와 다름. package 진입은 main game이며 easy-test 포함만으로 일반 플레이 범위를 늘릴 수 없음. | 정의32/초기 main 허용22 확인, 21개 초과를 정의 숫자로는 뒷받침하나 실제 출하 사용 가능·검수 수 UNKNOWN. | KO: 스킬 합체로 새로운 전투 조합을 실험하세요. / EN: Experiment with new combat combinations through skill fusion. |
| ③ “Live service” L146 | 마케팅 포지셔닝의 업데이트 계획은 별도 확정 필요. worldview L227 및 최종기획서 §13 온라인/협동은 로드맵. S2 demo 로컬 저장 경로; S1 _saveSharedMatsToServer/_loadSharedMatsFromServer는 로컬 서버 API. node-main의 slots/mats는 저장 기능 근거이며 서비스 운영 일정 증거가 아님. | U. 지속 운영·업데이트 주기·피드백 운영 담당/채널·서비스 정책 검수 없음. | 계획 표현 / 운영 상태 UNKNOWN. 기능 일부 존재로 라이브 서비스 계약 확정 불가. | KO: 스킬 합체와 장비 수집을 중심으로 전투 구성을 실험하세요. / EN: Experiment with combat builds centered on skill fusion and loot. 운영 약속 문장은 근거 확보 전 보류. |
| ④ “Remote Play Together” L59, “In-game chat”·“Online interactivity” L102 | Steam checkbox 표시 확인. docs 대시보드 감사는 NPC 대사와 이용자 채팅 구분을 요구; worldview는 협동 미래안. S1/S2/server/node-main의 관련 이름·API 검색은 저장 호출을 찾았으며 협동/이용자 채팅 출하 callsite 미확인. 검색 부재만으로 미구현 확정하지 않음. | U. 실제 Steam 두 사용자 초대·동시 입력·공유 화면·사용자 채팅 송수신·온라인 기능 QA 없음. 과거 QA6건은 host descriptor/Node VM 범위. | 공개 checkbox 확인 / 제품 기능 UNKNOWN. 단일 플레이 표기와 RPT 병존만으로 허위라고 단정하지 않음. | KO: 혼자 지옥을 탐험하며 스킬과 장비로 전투 구성을 만드세요. / EN: Explore Hell solo and shape your combat build through skills and equipment. 관리자 필드: 담당이 실제 기능 범위를 확인한 뒤 RPT/사용자 채팅/온라인 표시를 개별 결정. 대체 문안은 승인 없는 필드 변경 지시가 아님. |
| ⑤ 언어표29, Interface·Subtitles 표시, Full Audio 표시 없음 L65–97 | localization-runtime.js languages29·resolveLanguage; S1 _LANG_TBL/_T L8404–17는 KO+EN+27 테이블과 원문 fallback, 스토리 L60905는 EN/KO fallback. localization-data.js 읽은 데이터 선언은 번역 연결 근거일 뿐 전 문장 검수 아님. 지역 alias를 새 언어로 세지 않음. | U. 과거9/23 Windows273건/29언어 검수는 지정 키·화면·자막 트랙 범위. 현재 source/native 전 화면·유창성·잔여 원문 QA 없음. 과거 저장 설명30언어, 과거 지원표31지역 항목과 현재29표는 다른 단위. | 현재 공개 지원표29 확인, resolver29 확인. 완전 번역·현재 출하 언어 PASS UNKNOWN. Full Audio 체크 없음은 음성이 전혀 없다는 뜻이 아님. | KO: 지원 언어와 인터페이스·자막 범위는 이 페이지의 언어표를 참고하세요. / EN: Refer to this page’s language table for interface and subtitle support. “완전 번역/29언어 전체 음성” 문구는 사용하지 않음. 표 자체 정확성은 출하 QA 후 확정. |

Remote Play Together는 친구가 같은 컴퓨터에서 함께 플레이하는 방식으로 참여하도록 하는 스트리밍 기능이다. 일반 원격 개인 플레이와 구분하여 실제 제품 적합성을 확인해야 한다. [공식 Steamworks Remote Play 문서 §Remote Play Together](https://partner.steamgames.com/doc/features/remoteplay). 정책 문서 확인은 기능 QA를 대신하지 않는다.

## 출하 연결과 검수 한계

| 근거 | 실제 확인 범위 | 이번 판정 |
|---|---|---|
| package.json / build-nwjs.mjs | main localhost3333/index.html?demo=1, node-main; FILES에 main/easy/로비/언어 런타임·데이터, DIRS 복사 정책. integration 필수 누락 실패, 기본 빌드는 누락 경고 후 건너뜀. | 포함 **정책** 확인. 실제 새 산출의 포함 목록·Steam 출하는 UNKNOWN. 빌더 실행0. |
| STEAM_REVIEW_20260926 | 과거 demo Build25550483 / depot5337591 / manifest5366201260107331431 제출, parent4749590와 demo5337590 연결 기록 | 과거 식별자. 현재 default/review branch·설치 파일·출시 상태 UNKNOWN. |
| codex-half/BUILD | 기존 Mac 사본 원 기준6be3a06b…; 과거 source game SHA30ae8544…; runtimeAccepted/visualAccepted/rebuildCompleted false | 현재 S1 6c77ec6f…와 다름. current node-main541ff8e6…도 과거01b0…와 다름. 기존 package/index 동일만으로 전체 사본 최신 판단 불가. manifest/fixture 준비는 출하 승인 아님. |
| claude-native-6/QA | 6개 Node VM/descriptor 검수, 기존 API/UI/host 파일 범위 | 실제 게임·CSP 원인·협동·전 언어·새 source 출하 QA 대체 불가. 이번 테스트 실행0. |
| 9/29 Windows 두 기록 | 로컬 latest 사본 및 publisher ZIP 식별·해시 기록, 각각 네이티브 플레이 검수 경계와 외부 교체 미완료 기록 | historical read only. 현재 파일 확인/압축 해제/수신·공개 배포 재확인 없음. |
| 기존 소재8종 | TASK에서 지정한8경로 메타데이터 조회: 이 checkout에서 모두 부재 | 현재 위치 UNKNOWN. 디스크 전체 소실·권리 승인·소재 최신성 판정 없음. evidence에 경로별 기록. |
| 채널 | 현재 주소·소유권 UNKNOWN | 이번 주장 대조의 의존성 아님. 접근/생성/게시0. |

## 총괄이 반영할 canonical 보충안

shared docs는 직접 쓰지 않았다. 아래 **신설 절 제목과 본문**을 각 문서에 인계한다. 원본 과거 저장·QA·제출 기록은 이력으로 보존하고 최신 단정만 새 절로 구분한다. docs 전체 관련 키워드 rg를 실행했으며 큰 결과는 출력 잘림이 있었다. 전 문서를 전수 정독/동기화했다고 주장하지 않는다.

| canonical 경로(모두 checkout 기준)·정확한 절 | 추가할 문안 |
|---|---|
| docs/13출시·마케팅/13출시·마케팅.md — 기존 「시장 포지셔닝」 및 「예정 항목」 아래 신설 「2026-10-02 공개 Steam 주장과 출하 증거」 | 공개 Steam의7장/35초과 stage·boss/6아키타입/라이브 서비스 및 기능표는 현재 배포 승인 사실로 취급하지 않는다. main source는 데모1-1/Lv100, 정의는7장35stage·35boss slot, 디자인 명명19는 별도 계약이다. 출하 BuildID·manifest·파일 SHA·QA가 연결될 때만 제품 수치를 확정한다. |
| docs/13출시·마케팅/STEAM_STORE_LOCALIZATION_20260909.md — 신설 「2026-10-02 공개 영어 설명 정정 후보」 | 현재 영어 설명에 남은 플레이어 아키타입6의 의미와 출하 근거는 미확정이며 보스6유형과 혼용 금지. 로비5카드/4잠금/전사1종은 선택 경로 사실이다. 희귀도 전체 계약은0–5, 합체 정의32/초기 main demo 허용22와 실사용 QA를 구분한다. 본 보고 대체문안은 미적용 후보다. |
| docs/13출시·마케팅/STEAM_DASHBOARD_AUDIT_20260909.md — 신설 「2026-10-02 공개 기능표 재관찰」 | RPT·이용자 채팅·온라인 상호작용 표시를 관찰했으나 실제 출하 기능 승인 UNKNOWN. NPC 대사·펫 말풍선·로컬 저장 API는 이용자 채팅/협동 증거로 사용하지 않는다. RPT는 두 사용자 참여·입력 및 기능 적합성 근거를 별도 확보한다. |
| docs/13출시·마케팅/STEAM_LANGUAGE_UPLOAD_20260923.md — 신설 「2026-10-02 지원표와 QA 단위」 | 공개29항목의 Interface/Subtitles 표시와 Full Audio 무표시를 기록한다. resolver29, 저장 설명30언어, 과거 지역 지원31항목, 지정 화면273검수는 별도 단위다. 원문/EN/KO fallback과 현재 배포의 전 화면·번역 품질을 연결할 때까지 완전 번역 PASS는 UNKNOWN이다. |
| docs/13출시·마케팅/STEAM_REVIEW_20260926.md — 신설 「2026-10-02 현재 공개 관찰의 경계」 | parent App4749590 공개 영어 관찰은 출시 예정 표시까지 확인. demo App5337590의 현재 공개/설치/출시 상태와 최신 default/review branch는 UNKNOWN. 과거 심사·제출 BuildID는 현재 출하 식별자로 재사용하지 않는다. |
| docs/13출시·마케팅/PC_PACKAGING_20260910.md — 신설 「2026-10-02 source→shipping 주장 연결」 | entry/FILES/DIRS 정의는 포함 정책이며 실제 포함 manifest와 다르다. 최신 source SHA와 기존 Mac 사본·Steam manifest를 연결하고 native 승인 범위를 명시해야 마케팅 수치에 출하 근거를 붙일 수 있다. |
| docs/4.1맵디자인+설정/BOSS_CANONICAL_MAPPING.md — §0 설명 보충 후보 | 마케팅 boss 수치는 named design19/runtime 배정 slot35/stage35/실제 출하 고유 보스 수를 분리한다. 공개35초과 문구를35slot만으로 검증하지 않는다. existing dual mapping 보존; 맵 제작·수치 변경 없음. |

## 다음 증거 담당 및 완료 Gate

| 담당 | 필요한 증거 |
|---|---|
| 총괄/디자인 | public archetype의 의미·승인 범위, fullgame 콘텐츠 수의 기준(고유명/slot/구역), 서비스 운영 여부/확정 범위. |
| BUILD/배포 | 실제 현재 Steam branch·BuildID·depot manifest와 source/파일 SHA 연결, 포함 파일 목록, 현재 Mac/Windows 사본의 별도 식별. |
| QA/플레이·아이템 | 정상 로비→전사 생성→데모 종료, 정상 합체 접근·rarity0–5 드롭/표시/저장, fullgame 콘텐츠 범위의 해당 build 검수. |
| 온라인/QA | RPT 두 사용자 입력·초대, 이용자 채팅·온라인 상호작용 실제 callsite와 실행 근거. 저장 API와 분리. |
| 로컬라이제이션/QA | 해당 build의29언어별 인터페이스·자막 범위, fallback/누락·품질·레이아웃, 음성 scope. |
| 마케팅/스토어 담당 | 위 증거 후 본 KO/EN 후보 및 기능표 개별 결정. 소재 현재 경로·최신성·사용 권한은 별도 확인. |

다섯 묶음 현재 공식 관찰 완료, source/기획/데모/출하/QA 분리 완료, 부족한 증거 UNKNOWN 기록, KO/EN 후보 및 canonical 인계 완료. **이 Gate는 주장 검토 산출 완료이며 제품/출하/visual/언어/멀티 PASS가 아니다.** 추가 검사·실행·빌드·스토어 반영 없이 다음 지시를 기다린다.

