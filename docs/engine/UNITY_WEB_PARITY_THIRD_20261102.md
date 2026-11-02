# 11-02 3차 CTO 판정 후속

작업본 G:/exoduser-wt/codex-unity-parity-1102, 시작 공통95935cbd7·웹origin/main 9c50bf964. 사용자 지시로 origin/unity/main에 비강제 반영한다. 바탕화면은 개발툴 자동빌드 소유이며 직접 교체하지 않는다.

| 항목 | 현행 코드 계약 | 검수/남은 차이 |
|---|---|---|
| 버전 | 루트 release-version.json을 웹 정본과 같은 byte로 인수. PortVerification.Build가 매 빌드 ReleaseMetadataSync.Copy로 Data/release_web.json 생성·강제 임포트. 누락/잘못된 version/date/channel이면 빌드 거부. 숫자 하드코딩 없음 | 순수 실제 파일 IO 7검사 RED→GREEN. 최종53412e1f→UI6699ddaa 실제0.7.11 확인 |
| 직업 잠김 | 웹 coming_soon_chains_v2 원본1254PNG를 슬롯 전체에 덮어쓴다. 작은 자물쇠 제거. 이름 Hahmlet400/13px·선택 밝기, 출시준비10px/Cinzel fallback·#6f7272 | 1920/2560/3840 실물·1x 비교 완료, 글꼴 획 등 세부 차이 RETOUCH |
| 대장간 | 웹 실측980×1056/중앙. 제목(700,101,520,64) 복수의 대장간, 화폐(500,174.5,32,32)+(538,165,182,41), lore y240, tab y468+46i, grid outer(732,286.4,688,673.6), inner(738,292.4,676,661.6). 닫기(885,1000,150,40) | Hahmlet400 기반, 6탭·클립·휠 같은 좌표. 장비실제강화 등 기존 미지원 executor 범위는 이번 변경0 |
| 능력치 | 실제SP/AP/투자계획·적용·환불·FIFO예약/취소·저장/복원·기사배경 | UNITY_STAT_PLAN_PARITY_20261102.md의 지원/미지원 소비 경계 참조 |
| 스킬 | 실제지원6종의 습득·강화/하향·장착/해제·리셋확인과 SP저장. E/RMB 후보 순서 정합 | 나머지42종·합체·전체추천 실행기는 미지원, 사실과 다른 버튼은 활성화하지 않음. U05 문서 참조 |
| 난이도 | 클리어→5카드(−100/−50/0/+50/+100)→확정/취소/재무장·결정두둥. Config.StageDiffOffset·적factory4경계·저장연결 | 다음1-2 자체는 기존미이식, 확정 뒤 기존 저장→로비 동선 유지. UNITY_NEXT_DIFFICULTY_20261102.md 참조 |

검수는 I:/EXODUSER-Storage/codex-takeover/unity-parity-1102/third/에 보존한다. 독립 Core/Runtime compile0은 실제 Player 검수와 별도다. 최종 빌드/M1·해상도·1x 판정은 아래 후속 영수증에 기록한다.

새 격리 Player 검수 host는 1920/2560/3840에서 버전 정합·지원스킬 학습/강화/리셋 취소·환불·STR계획/적용·AP0 예약/취소·난이도 취소/확정, 3840 실제 클리어 버튼 재무장·데모 종료 우회까지 검사한다. fixture 주입이며 자연플레이 증거로 올리지 않는다.

대장간 강화 카드106.97px/간격8px와 스크롤 content-height의114.97px stride를 일치시켜 최하단 불필요한 빈 여백을 없앴다.

실제Player 스킬 fixture는 기본지급 가시덫을 먼저 격리리셋한 뒤 다시습득하여 SP10·악의오브40(raw80) 차감을 확인한다. 이미습득한 기본스킬을 학습검증으로 잘못 세지 않는다.

첫 실제Player 시각수정: 웹후처리와같이 대장간장식emoji/색glyph를숨기고 chip폭을텍스트만으로다시계산, bone #d3d0ca·성공률무채색·AI제목진홍·Hahmlet반굵기정합. fgGrid의단색6px테를웹정본iron_covenant frame(1024,4% slice→6px)로교체했다. 원본webp→PNG decoded RGBA동일 영수증은 third/forge-frame-import.json.

최신웹 실물에서 강화미선택 안내는(x746,y492.390625,w650,h20)이다. Native 가상좌표 y588.4→실화면492.4로수정해 카드520.4에가려지던문구를복원했다. 근거 third/web-final-panels/forge-hint.json.

첫 Player d80a4898는 실제76PNG/3해상도·지원기능14검사 PASS, 버전0.7.11확인. 시각결함을수정해 최종별도패키지를검수한다. 웹 최종패널 browser65107b31은제품API경로로9PNG/3해상도,ok=true/창0/잔여0/USER_SAVE0. 제공소스a4d48922, UI독립6파일은시작9c50와동일이고 game.html의renderForge함수범위는동일(정확길이56654; third/forge-source-section-proof.json). 최초연결거부ac78c17e는실패로보존하고 자기격리서버HTTP200확인뒤1회재실행했다.

최종 후보90a72eb4의 M1 9f9dccf7은23/23, UI67c9a925는76PNG/기능14 PASS다. 난이도 linear8bit 캐시의 검은 블록·잔점을 실제 화면에서 발견하여 VISUAL FAIL·미반영으로 유지했다. GPU512폭 캐시는09/07 파노라마를 높이144로 축소해300px 카드에 확대하는 해상도 손실도 있었다. 원본 규격의 CSS sRGB8bit 무손실PNG10개로 방법을 변경하고 미사용 DifficultyCard.shader를 제거했다. build-filtered-art.cjs가 grayscale/brightness/contrast를 배정밀도로 계산하며 noise/resize0이다. 근거 third/difficulty/lossless-filtered-art.json. 새 최종 패키지의 결과는 아래 영수증과 같다.

## 최종 같은 패키지 검수 — af70a6a2c5

| 게이트 | 실제 결과 |
|---|---|
| Win64 | 53412e1f /6000.6.7f1/D3D11/remodel-scenes1, Succeeded·오류0·6,585,335,906B·USER_SAVE0. 비컴파일 licensing 등errorLogs2 원문 보존 |
| 패키지/소스 | Core e794d98c…/Runtime06a013b8… 모두 실제Player compiler DLL과바이트동일. PDB338문서 현재소스일치0불일치 |
| M1 | 653caf5c 23/23·firstBlocked빈값·32PNG·OnGUI, 공식ok/창0/잔여0/USER_SAVE0. 제품API/Simulation입력으로 자연플레이·OS입력과구분 |
| UI | 6699ddaa 1920/2560/3840×한국어76PNG·지원기능14 PASS·격리/정지각76·같은Runtime SHA. 공식ok/창0/잔여0/USER_SAVE0 |
| 직접시각 | 3해상도15개웹/Native1x비교판·본문실제1x·제단/카드암부3x·인물/바위/하늘3x 직접검수. 최종카드비선택4장평균red 22.636/10.923/10.622/28.417, 웹정적CSS22.818/11.224/10.940/28.280(근사ROI, 픽셀동일판정아님) |
| 소유/배포 | 자기예약반환, 사용자앱/다른owner예약·프로세스변경0. 자동임포트855파일 SHA/base64보관·HEAD바이트복원, guard WIP/기존57미추적보존. Desktop직접교체0, 개발툴자동빌드소유 |

전문담당3명의읽기전용같은후보재검수와총괄검수를마쳤다. 난이도정지화면수정범위는PASS, 능력치/스킬/캐릭터는본문획·구슬크기/광택·리셋비활성표시등잔여차이로RETOUCH다. 전체UI의42스킬·합체/전체추천·일부패시브소비·요약drawer·다음1-2는미이식이므로완전동일화완료로쓰지않는다. 전체판정VISUAL VERDICT: RETOUCH.

증거는 I:/EXODUSER-Storage/codex-takeover/unity-parity-1102/third/{lossless-build,lossless-ui,lossless-m1,review,source-proof}다. review의웹왼쪽/Native오른쪽은원래1x다. 캐릭터영상위상·광폭능력치선택노드가다른표본은픽셀동일판정에쓰지않는다. 새웹skill1920의전환검정덮임은제외하고같은JS/CSS의이전정상웹실물을사용했다. 공통반영SHA는외부REPORT맨위에서원격읽기값으로기록한다.
