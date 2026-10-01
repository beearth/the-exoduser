# BALANCE-PM009-ROLL-UNITS

기존 BALANCE 다음 승인 PM009 구현이다. AGENTS/팀 최신 MD/정의 적용 계약과 docs/7아이템디자인/유니크_어픽스_리스트.md D22 수치·저장 계약/22행을 직접 읽고 중복 확인한다.

소유: unique-item-project/roll-values.mjs, test/uniqueRollValues.test.js, tools/team-followup-20261001/BALANCE/roll-* 증거, docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/BALANCE-roll-result.md 및 BALANCE-roll-receipt.json. 이 범위만 직접 편집한다. definitions.mjs는 import/read만 하며 audit-definitions.mjs 소비 연결은 root가 한다. 같은 체크아웃 타팀/staging을 보존하고 Git쓰기/새세션/하위에이전트 금지.

22종 실제 제안 정수 균등 롤 범위와 명시 하/중/상 구간을 정의하고 ID조회·롤 선택·저장값 변환/역변환·표시 순수 모듈 구현. RNG는 명시주입(0<=x<1 유한수), 잘못된ID/RNG/범위밖/비정수 raw 및 잘못된 저장값은 명시거부. RNG 호출은 의도한1회이며 문서 없는 재롤/정책/가중치 금지. %는raw/100 저장, frame은 정수저장·60fps 초 표시, count/rage정수. D03/04/11/12 frame, D16/17 count, D21 rage, D18 1~3%. D10 명시구간10~13/14~16/17~20 보존. 표시 소수 반올림 규칙은 손실없는 원값도 제공해 검수가능하게 한다. 모든ID의 값·단위 왕복과 균등 선택 경계(경계 직전/정확히/직후 포함)검증, 고정 범위 단순 등분으로 대체 금지.

새 드롭·효과 활성·게임2개·기존A~C·사용자저장·원화 불변. 모듈 proposal/runtimeReady=false. 실제 문서 일치와22ID·경계·부정입력 테스트/출력근거 제공. UIUX는 review.html을 독립수정하니 그 파일이나 해당 테스트는 만지지 않는다. 한국어보고/수신·실제Read/Edit/완료구분 및 docs전체검색. 소비 연결 가능한 API와 한계를 결과에 정확히 남긴다.
