# Godot 이식 현황 — 현재 단계와 다음 작업

기준일: 2026-10-19 KST · [총 목표와 단계별 실행 기준](FDG_GAME_DEVELOPMENT_PLAN.md)이 유일한 단계·작업 배정 기준이다. **현재 P1-002 진행 중(하위 C/D/E), P0-001 계획 기준 인수 완료(전체 P0 완료 아님)**. 2026-10-19부터 총괄은 PC Claude 세션(사용자 지시 "너가 총괄작업 할수있겠네").

목표는 원본 EXODUSER의 확정 기능·조작·전투 체감을 Godot로 이식해 지정 PC·Mac 실행판에서 직접 인수하는 것이다. 전체 기능 분모가 아직 없어 전체 진행률·ETA를 표시하지 않는다.

| 지금 판단할 항목 | 현재 상태 | 작업 ID / 다음 행동 |
|---|---|---|
| P1-001 게임 코드/소스 기준 | P1-001에서 인수한 기준은 fb118c77da2dbc43042c4a8539971338cc3b3c76 / tree e4b6f28f8b775d115fedad77049cb5245eade889. 당시43경로(code3/docs40) 정렬·통합 정적8/8 인수. 현재 문서-only 체크포인트와 실행판 갱신은 별개 | P1-001 완료 — 소스 정렬 범위만 ROOT 최종 인수. [P1-001 소스 통합 영수증](</Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/sync-git-main-20261016/NORMAL-HURTE-PLAY-TIME-MAIN-SOURCE-SYNC-20261017/receipt.json>) |
| 단계별 계획 | P0~P6 목적·보이는 산출물·완료 조건·증거·선행 조건·담당·상태를 개발 계획에 기록 | P0-001 계획 기준 인수 완료 |
| 기존 오더의 카드 작업 | ROOT가 2026-10-17 14:57:28.989800Z에 v2 실제 작성/end 회수. 원v1/v2 보존·v3 없음. cursor 이후 apply/resume·provider1로 목표 축소는 불채택 | P0-002 카드 실회수·ROOT 교정 조건부 계획 인수 완료. 실제 적용 owner·순서·이미 발생한 효과를 확인해 각효과 정확1회 적용, 소비prefix 후 재실행/refund/rollback 금지. 제품·실게임 인수 아님 |
| 다음 실제 구현 | 첫 전투 실제 World→normal hurtE 소비 경로를 현재 clock owner에 연결할 차례. 가장 가까운 차단은 정확 caller/clock owner·원본 계약 근거 미확정 | P1-002는 계획·카드 교정 인수 기준 아래 실제 caller·자연clock/currentState 권위·실제효과 owner를 확인한 뒤 정확 경로·최소 구현을 선택한다. 실제필수 미13 선행은 같은 P1-002 하위 작업으로 포함하며 연결 구현→새 영향 확인→허용 자연 호출 인수까지 미완 상태로 유지 |
| 시간 owner / 등록 | owner 첫 격리34case477 인수, actual callback12/25·미13. 특정 provider 집합 수이며 전체 이식률 아님 | P1-REF01 / P1-REF02. [owner 첫 격리 결과](</Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/sync-git-main-20261016/NORMAL-HURTE-PLAY-TIME-TYPED-OWNER-IMPLEMENTATION-20261017/results/play-time-owner-first.result.json>) · [등록12 영수증](</Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/sync-git-main-20261016/NORMAL-HURTE-PLAY-TIME-TWELFTH-PROVIDER-REGISTRATION-20261017/receipt.json>) |
| V12 후보 | 소스·첫parse 인수. 첫11case43행동true지만 setup signed-zero1false·exit1 전체FAIL. 별도4case19행동+setup4 true는 첫actual+0와 둘째3경계에 한정. 제품 copy 없음 | P1-REF03. 서로 다른 실행을 합산PASS로 바꾸지 않음. 정확 원후보 증거·반영 경로는 기존 ENEMY 오더 경유 |
| 첫 전투 실게임·플랫폼 | 실제 clock·자연 Main/State/World 호출, 사용자 열린 앱·compiled export·PC 실행·첫 전투 화면/입력/타격 인수 미확인 | P2-001 / P5-001. 기존 대상·권한·HOLD 유지 |

## 2026-10-19 총괄 인계와 P1-002 하위 작업 현황

| 하위 작업 | 무엇 | 담당 / 위치 | 단계(기획 확정 / 소스 구현 / 격리 검수 / 실플레이 인수) |
|---|---|---|---|
| P1-002.C HP owner | 일반 적 HP 실제 쓰기 owner | Mac Codex 작성 → 2026-10-19 PC 총괄 검증 후 main 통합 | 소스 구현 ○ / 격리 검수 ○(Mac V1 + PC 회귀 9종 동일·실Main HP 적용 확인) / 실플레이 미 |
| P1-002.D clock 생산자 | update clock prefix 실구동 + `G.playTime/stageTime += sp`(원본 32742) | PC Claude 총괄(heavy 담당 구현) → main 통합 | 기획 확정 ○ / 소스 구현 ○ / 격리 검수 ○(PC Godot 4.7.2: 17/0·8/0·5/0, 회귀 없음) / 실플레이 미. **배선은 됐지만 매 프레임 system_lesson 단계에서 멈춰 playTime은 아직 증가하지 않음** |
| P1-002.E caller 연결 | 기본 근접 1타 → 원본 hurtE 순서(쉴드 선흡수·크리·처치 파이프라인) | PC Claude 총괄(heavy 담당 구현, 총괄 화면 검수) → main 통합 | 기획 확정 ○ / 소스 구현 ○ / 격리 검수 ○(102/0, 회귀 없음) / 실플레이 미. 일반 적(눈알 육괴)은 이제 원본처럼 쉴드부터 깎여 8타에 처치. 전용 적 4종·스킬·투사체 피해와 드랍·경험치·부활 등 14항목은 아직 미이식 |
| P1-002.F 전용 적 4종 | 첫 스테이지 전용 적 4종도 기본 근접 원본 hurtE 경로 | PC Claude 총괄(heavy 담당 구현, 총괄 독립 검수) → main 통합 | 기획 확정 ○ / 소스 구현 ○ / 격리 검수 ○(담당 5회+총괄 2회 0실패) / 실플레이 미. 첫 스테이지 일반 적 6마리 모두 쉴드 선흡수→체력→처치 |
| P1-002.G 검기 | 검기 피해도 원본 hurtE 경로(쉴드 흡수 후 잔여로 포이즈·그로기) | PC Claude 총괄(heavy 담당 구현, 총괄 독립 검수) → main 통합 | 기획 확정 ○ / 소스 구현 ○ / 격리 검수 ○(담당 5회+총괄 2회 0실패) / 실플레이 미. 기본 공격과 검기는 원본 경로, Q/E·투사체는 아직 아님 |
| P1-002.H 자연 입력 인수 | 실제 키보드·마우스 입력만으로 첫 적 무리 처치 | PC Claude 총괄(heavy 담당 실행, 총괄 화면 확인) | 실플레이 인수(봇 입력) ○ — 스폰 인접 눈알 육괴 2마리 7.5초에 첫 처치, 원본 경로 호출 4/4 정상. 사람 플레이·Mac 미. **보이는 결함**: 체력 피해 숫자가 안 뜸, 적 바가 몸통 위로 떠 있음, 타격감(히트스톱·흔들림·파티클)·사망 연출 부재 → P2-001에서 처리 |
| P2-001a 타격 피드백 1차 | 체력 피해 숫자, 원본 위치의 적 바, 화면 흔들림 | PC Claude 총괄(heavy 담당 구현, 총괄 화면 확인) → main 통합 | 소스 구현 ○ / 격리 검수 ○ / 실플레이 미. 히트스톱은 원본도 꺼 둔 기능이라 그대로 둠. 사망 연출·피 파티클·화면 플래시는 다음 |
| P2-001b 사망·피격 연출 | 피 튀김·임팩트·화면 번쩍임, 처치 시 피 폭발·시체·핏자국·고어 | PC Claude 총괄(heavy 담당 구현, 총괄 화면 확인) → main 통합 | 소스 구현 ○ / 격리 검수 ○ / 실플레이 미. 화면 흔들림이 실제로 적용되지 않던 1차 결함도 함께 수정. 사망 사운드·원소 히트 파티클은 다음 |
| P2-001c 처치 보상 | 경험치·레벨업, 물약(악의 추출), 아이템 드랍 생성, 사망 사운드 | PC Claude 총괄(heavy 담당 구현, 총괄 독립 검수) → main 통합 | 소스 구현 ○ / 격리 검수 ○ / 실플레이 미. 드랍 아이템은 데이터로만 생성되고 바닥에 보이거나 주울 수는 아직 없음 |
| P2-001d 웹판 나란히 대조 | 같은 조건에서 원본 웹판과 Godot 첫 전투 비교 | PC Claude 총괄(heavy 담당 실행, 총괄 화면 확인) | 대조 완료. **원본과 다른 점**: 좌클릭 1회에 검기+평타가 동시에 맞음, 검기 피해량이 웹보다 큼, 처치 피 폭발이 크고 밝음, 적이 멀리 배치됨, 시작 체력·악의 미충전. **아직 없는 것**: 시작 마법진·펫·미니맵·우상 패널·스킬 아이콘·맵 어둠 조명 → P2-001e 이후 순서대로 수정 |
| P2-001e 전투 정확성 | 새 게임 시작 시 체력·MP·쉴드 풀충전과 악의구슬 1,000 | PC Claude 총괄(heavy 담당 구현, 총괄 독립 검수) → main 통합 | 소스 구현 ○ / 격리 검수 ○ / 실플레이 미. 좌클릭 이중 히트·검기 피해량 차이는 원본과 같은 동작으로 판명돼 고치지 않음 |
| P2-001f 피 폭발 정합 | 처치 피 폭발이 원본처럼 빠르게 사라지고 크기도 원본 수준 | PC Claude 총괄(신규 heavy 담당, 총괄 화면 판단) → main 통합 | 소스 구현 ○ / 격리 검수 ○ / 실플레이 미. 크기·재생 속도는 원본과 맞춤. **중심이 원본보다 밝고 주황빛인 차이는 남음** → 후속 |
| P2-001g 처치 중심·시작 배치 | 처치 순간 노란 빛 제거(원본 임팩트 시트 사용), 시작 적 배치 원본 규칙 확인 | PC Claude 총괄(heavy 담당, 총괄 화면 판단) → main 통합 | 처치 연출은 원본과 거의 같아짐. 시작 적 배치는 원본이 인트로 때 플레이어 주변 580px에 5마리를 무작위 소환하는 방식이라 런타임 소환으로 다음에 이식. Godot 바닥이 원본보다 밝은 차이는 맵 쪽 과제 |
| P2-001h 인트로 커튼 | 커튼이 열리면 금빛 결계와 적 5마리가 플레이어 주변에 나타나고 게임 시작 신호가 켜짐 | PC Claude 총괄(heavy 담당 구현, 총괄 화면 확인) → main 통합 | 소스 구현 ○ / 격리 검수 ○ / 실플레이 미. **아직 게임을 켜면 자동으로 시작되지 않음**(다음 작업에서 연결) |
| P2-001i 부팅 자동 인트로 | 게임을 켜면 원본처럼 인트로 → 키 안내 → 커튼 오픈, 커튼 전엔 HUD 숨김 | PC Claude 총괄(heavy 담당 구현, 총괄 화면 확인) → main 통합 | 소스 구현 ○ / 격리 검수 ○ / 실플레이 미. 시작 적 구성이 원본과 같아짐. 키 안내 패널 그림·음성, 커튼 직후 패링 연습, 타이머 진행은 아직 |
| P2-001j 레슨·타이머 | 커튼이 열리면 원본처럼 패링 연습이 끼어들고, 건너뛰면 적이 돌아오고 타이머가 흐름 | PC Claude 총괄(heavy 담당 구현, 총괄 원본 확인) → main 통합 | 소스 구현 ○ / 격리 검수 ○ / 실플레이 미. **연습 패널은 임시 모양(디자인 마감 전)**, 연습 본문 8단계는 아직 |
| P2-001k 연습 패널 | 패링 연습 패널이 원본 모양(프레임·문장·체크리스트·키 표시)으로, 연습 앞 3단계(이동·좌클릭 10처치·우클릭 5처치) 진행 | PC Claude 총괄(heavy 담당 구현, 총괄 화면 검수 2회 반려 후 합격) → main 통합 | 소스 구현 ○ / 격리 검수 ○ / 실플레이 미. 원본 글꼴이 없어 대체 글꼴 사용. 나머지 연습 단계(가시덫·패링·대시·분노 등)는 아직 |
| P2-002a HUD | 스킬 슬롯 아이콘, 우측 상단 레벨·경험치·처치·악의 패널, 타이머, 개발용 표시 숨김 | PC Claude 총괄(heavy 담당 구현, 총괄 화면 확인) → main 통합 | 소스 구현 ○ / 격리 검수 ○ / 실플레이 미. 처치하면 경험치·처치 수·악의가 화면에서 올라감. 타이머는 게임 시작 신호가 아직 없어 00:00에 멈춰 있음. 미니맵·펫·시작 마법진은 아직 없음 |
| P2-002b 미니맵·화폐 | 좌측 상단 미니맵(맵·플레이어·적 점)과 화폐 패널 | PC Claude 총괄(heavy 담당 구현, 총괄 화면 검수 1회 반려 후 합격) → main 통합 | 소스 구현 ○ / 격리 검수 ○ / 실플레이 미. 웹판 미니맵의 소환굴·필드보스 표시는 해당 시스템이 아직 없어 안 보임. 숫자 글꼴이 웹보다 가늘게 보임(원본 글꼴 미보유) |
| P2-003a 맵 조명 | 원본처럼 어둡고 푸른 지옥 톤, 플레이어 주변만 밝음, 안개·가장자리 어둠 | PC Claude 총괄(heavy 담당 구현, 총괄 화면 확인) → main 통합 | 소스 구현 ○ / 격리 검수 ○ / 실플레이 미. 바닥 밝기가 웹판과 비슷해짐(가장자리 25 대 30). 펫 광원·보스 조명은 해당 시스템 이식 후 |
| P2-004a 펫 | 까마귀 HECTOR·고양이 DIROI·유령쇠뇌·이리스가 따라다니고, 시작 대사("일어나. 여신이…")가 원본 자막창으로 뜸, 이리스 불빛 | PC Claude 총괄(heavy 담당 구현, 총괄 화면 확인) → main 통합 | 소스 구현 ○ / 격리 검수 ○ / 실플레이 미. 원본에서도 펫은 공격하지 않음(문서 정정). 나머지 대사 대부분·펫 음성은 아직 |
| P2-005a 시작 스킬 | 새 캐릭터 스킬 슬롯이 원본처럼 채워짐(1 가시덫·F 신성 돔·Ctrl 얼음 구슬·Space 거인 강타) | PC Claude 총괄(heavy 담당 구현, 총괄 화면 확인) → main 통합 | 지급·표시 ○ / 격리 검수 ○ / 실플레이 미. **이 4개 스킬은 아직 눌러도 발동하지 않음**(발동 로직은 다음 작업) |
| P2-005b 지옥강타 | Space로 지옥강타가 원본처럼 발동(스태미나 50·악의구슬 10·쿨 30초, 주변 적 피해·기절, 용암 분출 연출), 슬롯에 쿨다운 표시 | PC Claude 총괄(heavy 담당 구현, 총괄 확인) → main 통합 | 소스 구현 ○ / 격리 검수 ○ / 실플레이 미. 가시덫·신성 돔·얼음 구슬은 아직 발동 안 함 |
| P2-005c 가시덫·회복의 영역 | 1번 가시덫(바닥 가시 지속 피해·감속), F 회복의 영역(영역 안 강타 쿨 2배) 발동 | PC Claude 총괄(heavy 담당 구현, 총괄 독립 검수) → main 통합 | 소스 구현 ○ / 격리 검수 ○ / 실플레이 미. 회복의 영역 안 체력 회복은 아직 동작 안 함(자연 회복 단계 미연결). 얼음 구슬(Ctrl)은 아직 |
| P2-005d 자연 회복·얼음 구슬 | 체력·스태미나·MP 자연 회복이 원본 식대로 작동(회복의 영역 안 회복 포함), Ctrl 얼음 구슬(무적 보주 → 파쇄 칼날 8발·적 빙결) | PC Claude 총괄(heavy 담당 구현, 총괄 독립 검수) → main 통합 | 소스 구현 ○ / 격리 검수 ○ / 실플레이 미. 이제 시작 스킬 4종이 모두 발동함 |
| P3-003 지역 시스템 | 맵이 4개 지역으로 나뉘고, 처치가 지역별로 세어지며, 미니맵에 필드보스 위치가 표시됨 | Mac Codex ENGINE 구현 + PC 총괄 처치 연결·검수 → main 통합 | 소스 구현 ○ / 격리 검수 ○ / 실플레이 미. 지역 총량은 P3-002 소환굴 배치 후 계산(원본 31655 순서) |
| QA-001·P3-001 | 원래 실패하던 테스트 정리, 독 웅덩이 충돌을 원본처럼 타원으로 | PC Codex → 총괄 검수 → main 통합 | 완료(독 웅덩이는 실제 화면 미확인) |
| MAC-VERIFY | **Mac에서도 같은 결과** — 오늘 PC에서 통과한 테스트 17종을 Mac Godot 4.7.2 헤드리스로 돌려 모두 실패 0 | Mac Codex(맥북총괄 관측) → 총괄 인수 | Mac 헤드리스 인수 ○ / Mac 실제 창·실플레이는 미(화면 기록 권한 켠 뒤 재시도 중). [보고서](orders/reports/mac-verify_REPORT.md) |
| P3-002 소환굴 | 1-1 맵의 소환굴 14개(원본 좌표)가 미니맵 붉은 점·바닥 검은 구멍으로 보이고, 2000px 안에 들어가면 1.5초 뒤 15초에 걸쳐 적을 순차 소환·끝나면 사라짐. 처치 분모 168 | 클라우드 Claude(브랜치 `claude/p3-002-spawn-holes`) → PC 총괄 독립 검수 → main 통합(지역 초기화 순서를 원본 31655대로 소환굴 뒤로 정정) | 소스 구현 ○ / 격리 검수 ○(신규 296/0) / 화면 1차(클라우드·웹 나란히) ○ — 모양·크기·위치 같고 전체 톤만 어두움(기존 기록 원인) / 실플레이 미. **소환되는 적 중 눈알 육괴(etype0)만 실제로 나타남**(약 5%) — 나머지 28종은 전용 적 스크립트가 없어 숫자만 원본대로 셈. 커튼 5마리 난수 소비 2회 누락도 함께 정정 |

핵심3(실제 caller·clock 권위·효과 owner)은 PC 소스에서 확인 완료이며 [계획 문서의 답 표](FDG_GAME_DEVELOPMENT_PLAN.md#p1-002의-가장-가까운-차단과-실행-순서)를 따른다. 같은 질문을 다시 조사하지 않는다.

**환경별 상태(2026-10-19)**: Git origin/main = dd49171c5. PC `G:\exoduser` main = dd49171c5(추적 파일 일치 확인). Mac R 체크아웃 = dd49171c5(2026-10-19 Mac 기록, 이 세션에서 직접 재확인 아님). 열린 Godot 실행판이 이 소스를 소비하는지는 **미확인**. PC에 Godot 4.7.2 설치(2026-10-19, G:\godot-engine\4.7.2, 공식 SHA512 대조, 에디터 데이터 `_sc_` 격리) → PC에서 headless 격리 검증 가능. 이번 총괄 세션은 Codex 담당(ROOT/ENGINE)에게 직접 지시할 수 없으며 인계는 이 두 문서와 Git 브랜치로만 한다.

소스·정적·fixture·실게임·플랫폼 인수는 서로 다르다. **P1-001 소스 정렬을 최신 플레이 게임 완료로 표시하지 않는다.** 자산별 기존 확정 규격·SSOT를 따른다. 이 대화의 사용자 확정 ‘장수와 재생 속도 모두 24’는 해당 캐릭터 clip 장수24·clip 재생24fps 규격이며 실게임 화면 FPS와 별개다. 잘림 없는 모델·연결 동작·원근감·타격 접점은 기존 품질 요구 범위에서 실제 카메라·전투로 인수한다.

P3 콘텐츠, P4 게임 흐름·저장·설정 등 독립 작업은 자기 선행 조건과 소유 범위가 확정된 경우에 기존 담당 경유로 병행할 수 있다. 새 작업은 [실행 작업표](FDG_GAME_DEVELOPMENT_PLAN.md)의 ID·완료 조건을 먼저 고정한다. 이번 문서 정리는 코드·새 QA·GUI/build/reload/import/PC 전달·release 승인이 아니다.

[이번 계획 문서 영수증](</Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/sync-git-main-20261016/HUMAN-GODOT-MASTER-GOAL-AND-STAGED-EXECUTION-20261017/receipt.json>) · [소스 통합 정본](FDG_NATIVE_NORMAL_ENEMY_PLAY_TIME_MAIN_SYNC_20261017.md)



## P1-002 실제 진행 — 접점·코드·검수·자연 인수 분리

| 범위 | 실제 상태 | 근거 / 다음 행동 |
|---|---|---|
| 첫3 접점 | 기본 native 근접 caller는 player._melee_contact→generic enemy.receive_damage. 현재 Main/State/World frame 경로는 source-frame prefix이며 gap callbacks에 actual owner 미연결. 일반 적 HP/status/display 실제 owner는 enemy.gd | source만 확인. 원weapon 인수는 기존 Claude 오더 입력을 사용하며 같은 조사를 반복하지 않음 |
| 실제 코드 / P1-002.C | generic enemy.apply_native_normal_enemy_hp_write(write:Dictionary) arity1와 현재 receive_damage의 단일 HP write 위임 부분 구현. V1 첫 격리17case77check true, V2 추가 Script 수명 검수는 setup 실패로 중단; ROOT 부분 인수 완료. 같은 actor/world/main 역할·Script 객체·Tree/parent 수명 확인 후 hp 실제 쓰기 뒤 APPLIED. 원write same-ref, finite int/float raw값 유지 | HP 부분만 연결. 원 alert→HP→stun/kb/death/presentation 순서와 값/type 유지. 거절 시 legacy는 HP 이후 진행을 중단하며 이미 일어난 alert/contact는 보존 |
| 새 영향 확인 | V1 첫 격리17case77check true·exit0. V2 추가 Script 수명 검수는1case6check 중5true·setup/weak_world_script_expired 1false·exit1. World.set_script(null)은 성공했으나 WeakRef 즉시 만료 준비조건 실패로 이후 HP 거절 호출과 Main Script-loss는 미실행. GC 원인은 미상; 제품 HP 거절 실패로 해석하지 않음. 자동 수리·재실행 및 기존 검수 재연 없음 | [P1-002.C 실제 HP owner 작업 영수증](</Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/sync-git-main-20261016/P1-002-FIRST-COMBAT-ACTUAL-CONSUMER-20261017/IMPLEMENTATION-HP-EFFECT-OWNER-20261018/receipt.json>) |
| ROOT 부분 인수 | HP 실제 쓰기 경로와 일부 거절 경계는 격리 검수 인수, 첫 전투 전체 연결은 진행 중. V1 17case77check와 각 후속 실행을 ROOT가 범위별 인수. 제품 V2 15750B SHA256 b507455cf66b830502cbf1aeaf433cded413002c1988ba2fd50690e512bf58b4 유지 | 전체 hurtE·clock·자연 첫피격·실행판 완료 아님 |
| current Script 제거 첫 실행 | World/Main 독립2case34check true·exit0, 각각 실제 HP 요청1회와 원HP875 TYPE_INT 유지. stderr624B의 Probe._draw animation 누락 SCRIPT ERROR2회로 clean 실행 아님. WeakRef는 둘 다 TYPE_OBJECT24·isScript true·isNull false 관측 | [current Script 제거 원실행](/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/sync-git-main-20261016/P1-002-FIRST-COMBAT-ACTUAL-CONSUMER-20261017/IMPLEMENTATION-HP-EFFECT-OWNER-20261018/qa/hp_effect_current_script_removal_manifest.json) |
| draw 격리 후속 | Probe._draw pass3행·결과path·scope만 바꾼 허용 후속1회. 독립2case34 unique(case,name) true·exit0·stdout140B/stderr0B·양로그 SCRIPT ERROR/기타ERROR/경고/누수진단0 | [draw 격리 후속 실행](/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/sync-git-main-20261016/P1-002-FIRST-COMBAT-ACTUAL-CONSUMER-20261017/IMPLEMENTATION-HP-EFFECT-OWNER-20261018/qa/hp_effect_script_removal_draw_isolation_manifest.json). 실제 게임 draw·expiredweak·자연GC 증거 아님; 원실패와 합산PASS하지 않음 |
| 자연 첫피격 인수 | 미완. source clock/currentG 실제 생산·lifecycle, enemy s/st2/el 권위, real13 owner와 typed events 실제1회 적용 연결이 남음 | callback 12/25·미13은 그대로. 후보 copy·false→true·임의clock·cursor-only resume·후반fallback 없음. 실제 게임/PC 인수 미완 |

HP 실제 쓰기 경로와 일부 거절 경계는 격리 검수 인수, 첫 전투 전체 연결은 진행 중입니다. clock/currentview/real13/typed effects/자연 첫피격 연결은 남아 있습니다.

이 HP writer는 실제 native 필드 적용 owner의 한 부분이며 전체 source hurtE·prefix apply dispatcher·clock·P1-002 완료가 아니다. 새 idempotency token/epoch/counter/cache나 재호출 dedup을 만들지 않는다. APPLIED는 이번 실제 HP 쓰기1회의 영수증이며 다른 효과나 전체 prefix 완료를 뜻하지 않는다.


## P0-001 공통 문서 체크포인트

인수된 계획 기준과 현재 작업행 **두 문서만** 공통 Git 문서로 보존한다. P1-001의 게임 코드/소스 기준 fb118과 이번 문서-only commit을 구분한다. 이번 local/API/main/R의 실제 SHA·tree·부모·문서 공유 결과는 [문서 체크포인트 영수증](</Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/sync-git-main-20261016/P0-001-STAGED-PORT-PLAN-SHARED-CHECKPOINT-20261017/receipt.json>)에서 확인한다. 이 문서에 자기 commit SHA를 선행 기입하지 않는다. 코드·실행판·새 QA·V12 제품 copy·World hook 승인은 추가되지 않는다. ROOT 첫인수 전 문서 공유 완료로 승격하지 않는다.

---

## 이전 현황 기록 — 아래는 작성 당시의 이력

아래 원문은 과거 수치·검수 실패·보호 조건까지 보존한다. 당시의 ‘현재’·소유 브랜치·문서 수는 그 시점 이력이며 위 단계·작업 ID의 상태를 덮어쓰지 않는다.

# Godot 이식 현황과 남은 일

기준: 2026-10-17 · ENGINE 현황 취합. 현재 단계는 **핵심 전투 연결·검수 중**이며 전체 게임 완료 상태가 아니다.

## 목표와 완료 기준

원본 R/game.html·R/index.html의 게임 내용을 Godot로 이식해 Mac과 PC에서 검증한다. 첫 전투의 화면·조작·타격이 원본보다 떨어지면 완료로 판정하지 않는다. 캐릭터 잘림, 움직임, 원근감과 입체감도 실제 플레이 화면에서 확인해야 한다.

기획 확정 → 소스 구현 → 격리 검수 → 실제 플레이 인수는 서로 다른 단계다. 소스 구현은 코드가 있다는 뜻이고, 격리 검수는 정해진 입력·소유 조건에서의 동작 확인이다. 실제 플레이 인수는 지정한 실행판에서 화면·입력·전투를 비교해 받아들이는 단계다.

## 지금 확인된 범위

| 대상 | 마지막 확인 | 현재 한계 |
|---|---|---|
| 직전 공통 소스 기준 | 직전 인수 D9(d9b886c). 이번 main/I/R 현재 소스 정렬은 통합 정본·receipt의 실제 HEAD·tree 기준 | 열린 게임·빌드·PC 실행 인수와 구분 |
| 이번 소스 통합 체크포인트 | play_time owner 코드3·관련 문서32를 검증 WIP 소유 브랜치 codex/native-play-time-owner-20261017로 관리 | main/I/R 현재 소스 정렬은 통합 정본·receipt 기준이며 실행판은 별도. 실제 local/remote SHA는 단위 receipt를 확인하며 play_time 등록을 포함해 callback 12/25·미13 |
| 열린 게임 / 별도 compiled export | 최신 소스와 동일한 실행판인지 미확인 | 실제 실행 대상 URL·앱 경로와 검수 대상을 먼저 확정해야 함 |
| PC 소스·실행판 | 전달 대상·실행 경로·실플레이 인수 미확인 | Git 소스 정렬만으로 PC 전달·실행 완료를 선언하지 않음 |

아래의 ‘미확인’은 현재 취합한 인수 근거가 부족하다는 뜻이다. 기존 개별 구현이나 작업 이력을 모두 미구현으로 취급하지 않는다.

## 큰 범위별 상태

| 범위 | 소스 구현 | 격리 검수 | 실제 게임 인수 | 다음 할 일 | 담당·보류 근거 |
|---|---|---|---|---|---|
| 전투 피해·필수 데이터 연결 | 일반 적 피해 consumer의 callback 12/25 등록, 미13. 시간 읽기 owner는 검증 WIP이며 동일 Services self·arity0로 등록 | 시간 owner의 첫 공개 API 격리검수 ROOT 인수 완료. consumer 전체 검수와 구분 | 현재 최신 실행판의 자연 실행 인수 미확인 | 같은 consumer 연결·자연 실행 확인 | ENGINE 연결 / ROOT 합본 인수 |
| 게임 실행·첫 전투 | 기존 실행 경로와 개별 연결 작업 이력 보유 | 첫 전투 합본의 최신 검수 근거는 미확인 | 원본과 동일 조건 비교 미인수 | 실행 대상 확정 후 첫 화면·입력·타격 비교 | ROOT / 실행 대상 미확정 |
| 화면·조작·HUD | 걷기 방향·접지·기본 공격/SFX 등 개별 구현 이력 보유. 최신 합본 반영 범위 미확인 | 개별 단위 이력과 통합 검수를 구분 | HUD·입력·가독성 인수 미확인 | 원본과 같은 전투에서 화면·조작 비교 | 기존 담당 유지 / HUD·DCP 범위·권한 근거 미확정 |
| 맵·적·보스 | 개별 제작·배치·연결 자료 보유. 전체 합본 범위 미확정 | 단위 결과를 전장 전체 인수로 확대하지 않음 | 최신 전장 합본 인수 미확인 | 첫 전투 연결 뒤 전장·적·보스 검증 | 기존 맵·적·보스 담당 / ROOT 취합 |
| 그래픽·애니메이션 | 개별 그래픽·방향·모션 작업 이력 보유. 캐릭터 24장·24fps 요구 유지 | 모델 잘림·원근감·부드러운 동작의 최신 품질 검수 미확인 | 출시 품질 인수 미확인 | 실제 카메라와 전투 속도에서 비교 | 기존 그래픽 담당 / 자산 import 범위 미확정 |
| 저장·진행 UI | 원본 설계와 개별 구현 자료 보유. Godot 합본 반영 범위 미확정 | 실제 세이브·복원·진행 화면 검수 근거 미확인 | 최신 실행판 인수 미확인 | 허용된 대상에서 저장·진행 동선 검증 | 기존 담당 / 사용자 데이터 보호·개별 보류 유지 |
| 성능 | 최적화 설계·개별 작업 이력 보유 | 실제 전장 동일 조건 성능 자료 취합 필요 | Mac/PC 목표 환경 성능 인수 미확인 | 전투 합본에서 프레임·메모리·부하 측정 | ENGINE·기존 담당 / 합본·대상 환경 미확정 |
| Mac·PC 실행·배포 | 직전 인수 D9. 이번 main/I/R 소스 통합의 실제 정렬은 통합 정본·receipt 기준 | 최신 실행판과 대상 PC의 검수 미확인 | 배포·PC 실플레이 인수 미확인 | 대상·버전·전달 경로 확정 후 검증 | ROOT / PC source 전달 근거 미확정 |

## 현재 진행 중인 단위

- 12/25·미13은 **일반 적 피해 consumer의 필수 데이터 callback 연결 수**다. 전체 게임 이식률이나 전체 기능 분모가 아니다.
- play_time 읽기 owner의 새 메서드 4개와 Main Script 증명용 메타데이터 필드 1개는 검증 WIP 소유 체크포인트이며 play_time Callable을 el_mul 직후에 등록했다. 첫 격리 공개 API 검수의 계획된 사례는 모두 통과했고 ROOT가 단위 결과를 인수했다. 확인 범위는 격리 객체의 부분지원·실패·참조 보존이며 실제 Main/State clock 값의 존재·증가·자연수명은 미확인이다.
- 원정적 검사는 17개 중15통과2실패이며, 별도2확인의 통과 기록은 독립된 증거로 보존한다. V11 consumer의 원57개 확인 중5개 실패와 별도 보완25개 확인도 전체 PASS로 합산하지 않는다.
- V12 consumer 후보 소스3와 첫 parse2는 ROOT가 2026-10-17 14:13:20.295296Z에 인수했다. 단일 Ring 0/1/2의 typed 독립 읽기와 둘째 값 write를 다루며, 공통 typed/classifier 및 기존 계약 값은 유지한다. 제품 반영은 하지 않았다.
- V12 첫 행동 QA는 ROOT가 14:19:02.553603Z에 인수했다. 행동 11 case/43 확인은 true지만 setup 5개 중 signed zero 1개가 false여서 exit 1, 전체 FAIL이다. +0를 의도한 B2 실제 값은 -0였다. 이 첫 실행에서는 둘째 NR/SOURCE_THROW/UNSUPPORTED 3개 경계가 미검수였고 setup false 뒤에도 case가 계속 실행된 runner 제어 한계가 있었다. 후보 오류로 단정하지 않는다.
- V12 별도 보완은 ROOT가 14:27:58.276095Z에 인수했다. 4 case/19 행동과 setup4가 모두 true, exit0이며 첫 actual +0와 둘째 NRnestedREADY/SOURCE_THROW/UNSUPPORTED→UNKNOWN_STATUS 경계에만 한정한다. 원11case43행동true·setup1false·exit1 전체FAIL은 별도로 보존하며 합산 PASS로 바꾸지 않는다. 네 준비식을 평가한 뒤 public 호출 전에 검사하므로 fail-fast 실제 고장주입 검증은 아니다. 실제 clock·자연 Main/State·JS·전체 게임은 미확인이고 V12 제품 반영도 하지 않았다. owner의 별도34case/477확인과도 구분한다.
- 자세한 수치·raw 기록은 [시간 owner 기술 계약](FDG_NATIVE_NORMAL_ENEMY_PLAY_TIME_OWNER_20261017.md)과 [첫 격리 검수 결과](</Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/sync-git-main-20261016/NORMAL-HURTE-PLAY-TIME-TYPED-OWNER-IMPLEMENTATION-20261017/results/play-time-owner-first.result.json>)에서 확인한다. 작업 로그·실패 이력은 당시 단계의 증거이며 현재 전체 게임 인수 상태와 구분한다.

## 남은 일의 순서

1. 현재 owner의 격리검수 인수는 완료됐다. 실제 clock·자연 실행 검증은 후속에 남아 있다.
2. 배정된 V12 후보 산출물을 검토하고, 같은 실제 consumer 연결·자연 실행을 확인한다.
3. 원본과 첫 전투의 화면·입력·타격을 같은 조건에서 비교한다.
4. 전장·적·보스, 저장·진행 UI, 성능, Mac/PC 실행·배포를 순서대로 확인한다.

이 순서는 상위 남은 범위다. 미확정 전체 기능 목록을 완료율로 계산하지 않으며 기한을 약속하지 않는다. 다른 producer·전체 catalog 조사나 보호 기능 해제를 지시하는 목록도 아니다.

## 승인·보류와 미확정 항목

| 항목 | 현재 처리 |
|---|---|
| 실제 실행 대상 URL·앱 경로 | 결정·권한 근거 미확정. 보호된 창과 직접 플레이 흐름 유지 |
| PC source·실행판 전달 | 대상·버전·경로와 전달 근거 미확정 |
| 자산 import / HUD / DCP | 각 항목의 결정·허용 범위·권한 근거 미확정. 기존 개별 HOLD 유지 |
| 세이브·사용자 데이터와 기존 미응답 범위 | 기존 보호와 보류 유지. 같은 질문을 중복 발송하지 않음 |

개별 보류는 전체 작업 HOLD가 아니다. 승인된 연결·검수·문서 작업은 계속한다. 이번 현황 정리 지시를 build, reload, import 또는 PC 전달 승인으로 확대하지 않는다.

## 문서 읽는 순서

1. **이 현황 문서** — 확인된 완료 범위, 검수 단계, 남은 순서.
2. [기존 게임 설계 docs](../)와 [개발 계획](FDG_GAME_DEVELOPMENT_PLAN.md) — 기획 SSOT와 제작 방향.
3. [연결 계약](FDG_INTEGRATION_INTERFACE.md) — 실제 연결 인터페이스와 계약.
4. 각 owner 기술 문서·테스트 receipt — 해당 단위의 근거와 한계.

[PC·Mac 소스 동기화 기록](FDG_PC_MAC_GIT_SYNC_20261016.md)은 소스 전달·정렬의 이력이다. 소스 동기화, 격리 검수, 실제 플레이 인수, 배포 완료를 각각 확인한다.

## 현재 owner 소유 체크포인트

시간 owner의 소스 경계와 첫 격리 검수는 인수된 검증 WIP로 관리한다. 소유 브랜치는 codex/native-play-time-owner-20261017이며, play_time callback 등록은 I에서 12/25·미13으로 반영했으며 이번 main/I/R 소스 정렬은 통합 정본·receipt를 따르며 실행판 동기화·실게임 인수는 별도다. 실제 local/remote SHA·tree·보존 결과는 [단위 receipt](</Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/sync-git-main-20261016/NORMAL-HURTE-PLAY-TIME-OWNER-VALIDATED-WIP-20261017/receipt.json>)에서 확인한다.


## 이번 provider 등록 범위

| 항목 | 현재 상태 |
|---|---|
| 반영 | I 소유 브랜치에서 play_time을 el_mul 직후 동일 Services self의 arity0 Callable로 등록. callback 12/25·미13이며 전체 게임 이식률이 아님 |
| 남은 검증 | 실제 clock·자연 전투·최신 실행판·Mac/PC 인수 미확인. V12는 후보 검수 단계이며 제품 copy·World hook 없음 |
| 기록 | [등록 단위 receipt](</Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/sync-git-main-20261016/NORMAL-HURTE-PLAY-TIME-TWELFTH-PROVIDER-REGISTRATION-20261017/receipt.json>) |


## 2026-10-17 play_time main/I/R 소스 통합 체크포인트 — 현행

| 항목 | 현재 범위와 인수 한계 |
|---|---|
| 직전 인수 / 이번 소스 | 직전 공통 인수 D9(d9b886c). owner 실제 NUL diff42(code3/docs39)에 통합 정본1을 추가한 최종 범위는 실제 union NUL·tree 목록과 아래 receipt를 기준으로 확인. main/I/R의 실제 현재 HEAD·tree·branch·upstream 및 정렬 결과도 receipt 기준 |
| 코드·provider | 인수된 Main/Services/State 코드3 그대로, callback 12/25·미13. play_time은 el_mul 직후 동일 Services self·arity0, 새entry 생성의 값 query0만 확인. 기존 getter/준비 guard 전체 순수성은 인증하지 않음 |
| 값·실패·참조 | finite native int/float 부분지원·safe int ±9007199254740991·raw-0·원 type/ref/prefix·postloss read_result·NOT_READY 계약 그대로. dummy13/25 gate 우회·clock writer/default0 추가 없음 |
| 검수 분리 | 기존 owner34case477(설정163·행동314) 인수, 원17 중15통과2실패와 별도2true는 보존. V12 후보 원11case43행동true/setup signedzero1false·exit1 전체FAIL과 별도4case19행동+setup4 true의 한정 보완은 각각 유지. 원성공 검수·parse 재실행 없음 |
| 실제 실행·보류 | 이번은 소스 정렬이다. 사용자 열린 앱·compiled export·PC 실행·실제 Main/State clock·자연 전투·JS·최신 게임 인수는 미확인. V12 제품 copy·World hook·build/reload/import/PC 전달 없음 |
| 정본 / 증거 | [FDG_NATIVE_NORMAL_ENEMY_PLAY_TIME_MAIN_SYNC_20261017.md](FDG_NATIVE_NORMAL_ENEMY_PLAY_TIME_MAIN_SYNC_20261017.md) · [소스 통합 final receipt](</Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/sync-git-main-20261016/NORMAL-HURTE-PLAY-TIME-MAIN-SOURCE-SYNC-20261017/receipt.json>) |
