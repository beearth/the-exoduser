# UIUX-PM009-REVIEW-CONSUMER

기존 UIUX의 다음 PM009 실제 소비 연결 구현. AGENTS/팀MD/게임 적용 계약/현재 정의·review를 읽고 중복 확인한다.

소유: unique-item-project/review.html, test/uniqueItemReview.test.js, tools/team-followup-20261001/UIUX/review-* 증거, docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/UIUX-review-result.md/receipt.json. Git쓰기/새세션/하위에이전트/게임실행 금지. 타팀스테이징/변경보존. definitions.mjs/audit모듈/이미지/game/index편집금지. BALANCE는 roll-values.mjs만 별도로 개발하므로 의존하지 않는다.

22개 이름·ID·이미지 경로 하드코딩을 definitions.mjs import 실제소비로 바꾼다. 기존44개 원본/Seedream 64/160px 비교·lazyload·native button/키보드 동작 유지. 각카드 이름·한글 장착부위/무기종류·효과제안ID·미채택 상태를 정의에서 표시. 한글명은SSOT 현재명칭(helmet 투구, shield 견갑, headband귀걸이 등)을 직접 확인. 데이터 전종비활성/미채택을 채택표시로 바꾸지 않는다. 부모DOM전체 innerHTML/textContent 대체금지; 개별새리프에만텍스트. 모듈로딩 실패시 빈화면 대신 실패안내를 고려한다. 개발검토화면이며 게임 사용자 UI가 아니다.

22행/44이미지 정확경로·이름·슬롯대응,64/160버튼 ARIA/크기/키보드 보존, 모듈 실제 소비를 테스트한다. 브라우저가없으면 DOM fixture와 실제시각PASS를구분한다. root는 test/uniqueDefinitions.test.js의 옛 review문자열 직접검색 assertion을 본 소비검수로 이관하므로 그공유파일은건드리지않는다. 수신/실제Read/Edit·테스트·docs검색·한계를전용결과에기록.
