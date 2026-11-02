# 11-02 3차 CTO 판정 후속

작업본 G:/exoduser-wt/codex-unity-parity-1102, 시작 공통95935cbd7·웹origin/main 9c50bf964. 사용자 지시로 origin/unity/main에 비강제 반영한다. 바탕화면은 개발툴 자동빌드 소유이며 직접 교체하지 않는다.

| 항목 | 현행 코드 계약 | 검수/남은 차이 |
|---|---|---|
| 버전 | 루트 release-version.json을 웹 정본과 같은 byte로 인수. PortVerification.Build가 매 빌드 ReleaseMetadataSync.Copy로 Data/release_web.json 생성·강제 임포트. 누락/잘못된 version/date/channel이면 빌드 거부. 숫자 하드코딩 없음 | 순수 실제 파일 IO 7검사 RED→GREEN. 정식 Player 검수 예정 |
| 직업 잠김 | 웹 coming_soon_chains_v2 원본1254PNG를 슬롯 전체에 덮어쓴다. 작은 자물쇠 제거. 이름 Hahmlet400/13px·선택 밝기, 출시준비10px/Cinzel fallback·#6f7272 | 16/21/32:9 실제 비교 예정 |
| 대장간 | 웹 실측980×1056/중앙. 제목(700,101,520,64) 복수의 대장간, 화폐(500,174.5,32,32)+(538,165,182,41), lore y240, tab y468+46i, grid outer(732,286.4,688,673.6), inner(738,292.4,676,661.6). 닫기(885,1000,150,40) | Hahmlet400 기반, 6탭·클립·휠 같은 좌표. 장비실제강화 등 기존 미지원 executor 범위는 이번 변경0 |
| 능력치 | 실제SP/AP/투자계획·적용·환불·FIFO예약/취소·저장/복원·기사배경 | UNITY_STAT_PLAN_PARITY_20261102.md의 지원/미지원 소비 경계 참조 |
| 스킬 | 실제지원6종의 습득·강화/하향·장착/해제·리셋확인과 SP저장. E/RMB 후보 순서 정합 | 나머지42종·합체·전체추천 실행기는 미지원, 사실과 다른 버튼은 활성화하지 않음. U05 문서 참조 |
| 난이도 | 클리어→5카드(−100/−50/0/+50/+100)→확정/취소/재무장·결정두둥. Config.StageDiffOffset·적factory4경계·저장연결 | 다음1-2 자체는 기존미이식, 확정 뒤 기존 저장→로비 동선 유지. UNITY_NEXT_DIFFICULTY_20261102.md 참조 |

검수는 I:/EXODUSER-Storage/codex-takeover/unity-parity-1102/third/에 보존한다. 독립 Core/Runtime compile0은 실제 Player 검수와 별도다. 최종 빌드/M1·해상도·1x 판정은 아래 후속 영수증에 기록한다.

새 격리 Player 검수 host는 1920/2560/3840에서 버전 정합·지원스킬 학습/강화/리셋 취소·환불·STR계획/적용·AP0 예약/취소·난이도 취소/확정, 3840 실제 클리어 버튼 재무장·데모 종료 우회까지 검사한다. fixture 주입이며 자연플레이 증거로 올리지 않는다.
