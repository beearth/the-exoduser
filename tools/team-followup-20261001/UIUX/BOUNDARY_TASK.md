# UIUX-HOTPATH-BOUNDARY-FIX

기존 UIUX 완료 세션의 다음 한 건. 동일 과제/대기 여부를 확인하고 중복 실행하지 마세요. root가 제출 v2를 독립 검수하여 실제 후보 결함을 재현했습니다. 현행 생산 게임이 멈춘다는 주장은 아닙니다. 원 v2 산출15파일은 원격 `codex/backup-uiux-v2-review-20261001-213938` / `b3ab5be7f0c7a57ec1892cca1d65825549f54d72`로 보존했습니다.

재현: 기본1280×800·camera0·shake0·zoom2·ssaa1·backing/CSS1280×800·left/top0·dpr1, readings=[{id:'overflow',kind:'charge',box:{x:0,y:1e308,w:10,h:1e308}}]. v1 planReadings는 TypeError('invalid reading')로 거절, v2는 변환 뒤 Infinity 좌표를 insert의 band 반복문에 넣어 vm timeout25ms. 직접 무제한 실행하지 말고 VM/child timeout으로 본인 검사만 제한하세요.

좌표 변환 후 유한성/geometry/중복ID 등 v1 오류 계약을 보존하고, 유한하지만 거대한 y/h/gap의 band 등록·탐색 반복량도 제한하세요. 임의 라벨 삭제·좌표 clamp 금지. 큰 범위는 기존 선형 충돌 경로로 fallback하는 등 출력/오류 의미 동등성을 유지하세요. 오류 상태 후 같은 workspace 재사용도 검사하세요.

overflow·아주큰유한값·NaN/Infinity·negative/zero geometry·중복ID의 재현 fixture → 최소 수정 → 기존15그룹+6 VM 및 새 boundary 회귀·정상120개 계수 비교를 수행하세요. frame 유효값 자체의 나눗셈/곱셈 overflow와 유한 좌표 band++ 정밀도 정체도 고려하세요. 정상 프레임 최적화 계수만 지키려고 오류를 숨기지 마세요.

소유 UIUX 폴더와 `UIUX-boundary-result.md`/`UIUX-boundary-receipt.json`만. 기존 v1/생산/타팀·공용 test/마스터/Git 쓰기/게임/브라우저/서버/대형빌드/새세션 금지. 원 v2 입력·증거 해시와 수정 이후를 구분해 보존하고 가능하면 별도 bounded 후보를 만드세요. 직접 수정하는 v2 파일은 원격 원본 위치를 명시하고 과거 검사 결과를 새 검사로 위장하지 마세요. 한국어로 수신·실제 Read/명령·완료·실패 이력·시각/FPS UNKNOWN을 기록하세요.
