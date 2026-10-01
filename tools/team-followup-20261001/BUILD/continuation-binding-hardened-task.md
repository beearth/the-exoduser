# binding 보강 독립 인수

root가 BUILD 원 반례를 읽고 ITEM binding-d10.mjs/binding-ports.mjs에 plain JSON 데이터 생성·직렬화 훅/접근자 거부·필수 own enumerable data 필드 검증을 추가했다. 원본은 root-review/binding-before에 보존했다. root 경계7개 포함 통합60PASS. 현재 원담당 ITEM은 enemy-support, UIUX는 art-support, BALANCE는 skill-support를 실제 Read/Edit 중이므로 binding 코드 쓰기는 root만 소유한다.

기존 continuation-binding-audit-* 원자료는 보존하고 continuation-binding-hardened-*에 C2~C7의 실제 수정 여부를 독립 검수하라. 원래 C1은 명시 신규 생성 API의 호출자 계약이며 JSON으로 생성 이력을 증명할 수 없다. 실제 read/restore가 이를 부르는지 확인하고 누락 binding을 자동 보충하지 않는지 검수한다. C8은 기존 소켓 마이그레이션 RNG라 D10 재롤과 구분한다. 새 반례가 있으면 정확한 입력/결과로 보고하고 root 소스는 수정하지 않는다.

소유 BUILD/continuation-binding-hardened-*만. 보고서만 쓰지 말고 실제 후보를 import해 원 반례의 변경된 결과를 실행·기록한다. 공유파일/원반례로그/타팀/Git/게임/브라우저/서버/queue/권한/새세션/하위에이전트 쓰기0. `.mjs`는 Node 검수 후보이며 실제 브라우저 연결이나 게임 활성은 이번 인수가 아니다. 한국어 수신·Read·검수·완료와 실제 소스 SHA를 기록한다.
