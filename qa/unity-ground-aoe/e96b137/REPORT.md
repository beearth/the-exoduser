PASS — 대상·정식 빌드 — HEAD/원격=e96b137bb915ead36ed799bc02331ebb0901fa94, 전체 checkout·기존 Library 재사용. Unity 6000.6.7f1 ARM64, PortVerification.Build -remodel-scenes 1, Succeeded/errors=0. 빌드 1회 — 캡처 없음; build-receipt.json·build.log.

PASS — 실제 필드 시험 데칼(한정) — Metal/M5 Pro, 1920×1080 실제 창. 시작 지면·뿌리 경계·목교에 청록 시험 데칼이 표면을 따라 표시됨. GPU 영수증 passed=true. 이는 QA DBuffer 사각형이며 이번 스킬의 수신깊이 투영과 별개 — pick/01-map-fixture-full.png 상단 3패널·pick/02-map-fixture-x3.png 상단 3패널; ground-map-receipt.json.

FAIL — 평지·경사·다리·늪 가장자리 스킬 장판 전체 — 네 지형 각각의 실제 장판 증거를 확보하지 못함. ground-map 경로는 위 3지점 시험 데칼만 생성하며 수면 검사를 하지 않음. 보충 impact 경로의 가시덫·성역은 동일 목교 입구 한 곳만 촬영. 보이는 링은 지면/상판/수면을 따라가지만 경사·상판·수면 연결 틈0/공중 카드0 전체 보증은 미검증 — pick/01-map-fixture-full.png·pick/02-map-fixture-x3.png 하단 2패널.

PASS — 대지치기 연속컷·본체 관측(한정) — 1920×1080 처음·중간·끝과 4셀 확보. 소스에서 추론한 T=1/5/15/29/43 및 제거45틱 표본을 직접 눈검수. 지면·목교 위 투영을 관측했고 직립 카드 복귀는 관측되지 않음. 43틱 잔상이 남고45틱에 사라짐; 2틱 간격 촬영이라 정확한0/44틱은 없음. 틱/셀은 런타임 영수증 값이 아닌 촬영 루프·TickSkills로 계산한 값 — pick/03-slam-t01-1920.png·pick/04-slam-t15-1920.png·pick/05-slam-t43-1920.png·pick/06-slam-cells-x3.png; crop-receipt.json.

FAIL — 대지치기 각 셀·중앙 섬광 반쪽 잘림0 확정 — 중심부가 배우·피해 숫자·목교 기둥에 겹쳐 섬광 전체 윤곽을 판독할 수 없음. 29틱 외곽에는 직선 경계가 보여 원시트 경계와 투영 잘림을 분리하지 못함. 본체가 보인다는 이유로 모든 셀/섬광의 잘림0을 PASS하지 않음 — pick/06-slam-cells-x3.png.

PASS — Player 로그·영수증 — map 및 보완 impact 실행에서 Shader/RenderGraph/Exception 오류 기록0, impact passed=true·480프레임·giantSlam 시전 포함. 자동 영수증 PASS와 위 시각 미검증을 구분 — 캡처 위 6장; map-Player.log·impact-Player.log·impact-review.json.

FAIL — 세이브 격리 로그 바인딩 — 모든 실행에 이 작업 폴더 sandbox 하위 절대경로를 명시했고 해당 폴더가 생성됨. 그러나 이 경로의 NativeQaSandbox는 성공 바인딩 로그를 출력하지 않아 요청된 로그 확인은 미검증. sandbox 내 저장파일0 — 캡처 없음; map-launch.json·impact-first-launch.json·impact-launch.json 및 Player 로그.

PASS — 실행 조건·실패 처리 — open -g -n -W, 창 모드 -screen-fullscreen 0 -popupwindow, -nosound/--unity-mute 사용. Player batchmode0. map 1회·impact 2회. 첫 impact는 비동기 ShowLobby 전환이 필드를 덮어 실패(영수증 false); 기존 --unity-skill-smoke를 추가해 LegacyFrontendFixture 즉시 전환을 사용한 보완 1회는 실제 필드 촬영 성공. impact 분기가 우선하므로 SkillSmoke 검사는 실행되지 않음. 무수정·동일인자 실패 재실행0 — impact-first-review.json·impact-first-Player.log·각 launch.json.

PASS — 증거·정리 — pick PNG 정확히6장, 원본 픽셀 합성 및 최근접3배 크롭을 직접 확인. 빌드·PlayerDataCache·sandbox·전체 중간 캡처·임시 Pillow 환경 삭제: 논리13.625GiB, df 실증가7.510GiB(첫 실패 캡처480장도 보완 전 삭제). Editor/Player 잔여0. Unity 생성 tracked857개 복원·새 meta56개 삭제; 착수 전 미추적2개와 Library 보존. 프로젝트 코드 수정·커밋·push0, UNITY-MAC-20261024 접근/변경0 — pick/·cleanup-receipt.json·generated-cleanup.log·final-state.log.

판정: 기능 빌드는 통과했지만 네 지형별 스킬 장판과 대지치기 중앙 섬광의 시각 증거가 부족해 게이트 FAIL. 제품 결함 원인을 확정하거나 수정하지 않았다. 다음 검수에는 기존 시험 사각형 대신 실제 스킬을 네 지형에서 표시하는 촬영 경로와 중심부가 가리지 않는 연속컷이 필요하다.

SHA e96b137bb915ead36ed799bc02331ebb0901fa94 | 소요 465초(체크아웃 준비~검수·정리·보고) | df 남은 용량 684Gi | AOE-GATE: FAIL e96b137bb
