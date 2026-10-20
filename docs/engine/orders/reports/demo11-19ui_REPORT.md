# DEMO11-19ui — 성장 화면

상태: 기능 구현·화면 비교 자료 준비. **사용자 눈 검수 대기**. 실창 수동 플레이 검수와 구분한다.

| 항목 | 결과·근거 |
|---|---|
| 기준·의존 | 최신 fetch main `0138c5bb9188d27cee10cb1a901d075092ddb88f` + 19r `0c136318` 정상 merge (`fd25c9fe`). WORK_BOARD 충돌은 두 작업 기록을 모두 보존. rebase/force 없음 |
| 원본 | `game.html:6195` J, `27690–27727` 정의, `27730–27785/27883–27885` 원본 SVG 문양/매핑, `51235–51276` 계획/예약 adapter. `stat-panel-ui.js:25–62` 6경로·31중심·260단계 좌표/연결, `79–87` 인체 선화, `204–254` 효과 표시, `256–274` 계획 검증, `421–436` 상세·예약. docs/3.2·14 및 능력치/별자리 UI 계약 참조 |
| 구현 | J/ESC·검색·경로/상태 필터·31중심/260단계·100–250% 확대·현재/계획 효과·변경 목록·투자/환불·전체 환불 확인·기존 FIFO 개별 예약/취소. 숫자 포함 hell 명조, 흑철/뼈/금선/지옥불. 원본의 이모지는 제거. 개발 상태 문구 없음 |
| 쓰기·재계산 | UI는 POINT의 독립 draft만 편집. 적용 이벤트→19r `request_native_growth(plan)`→기존 PC `apply_stats` 1회. 리셋도 전체0 draft 후 적용. 예약/취소는 기존 19r writer. State/보호 경로 신규 수정0, 틱/목록 API0, 별도 저장 writer0·저장 성공 표시0 |
| 공용 파일 | 이 단위 Main `319–323` 설치 +5/−0만. 19r 의존분은 Main `3062–3073`; State `6–8,657,660,662–663,699–703,1599–1617`. 이 부분은 merge 의존 변경이며 새로 재작성하지 않음. `shared-ranges.json` 참조. Player/World/자원/PC producer main SHA256 동일 |
| 격리 | editor import부터 매 실행 project.godot custom_user_dir_name을 해당 테스트 상수로 임시 변경, finally 원본 bytes 복원·override 0byte. 신규 OS 실제 경로 `~/Library/Application Support/EXODUSER-demo11-19ui-Isolated-20261021`. 실제 사용자 First 폴더 사용0. 실행마다 pgrep 검사·>=2이면30초 대기 원문 `godot-gate.log` |
| 번역·범위 | 번역목록 기존 main 행 삭제/수정0, 신규 문구/원본 재사용 이름·설명·효과·경로 등록. 19r merge로 유입된 bare LF6줄만 CRLF로 정규화, 최종 bare LF0. 런타임은 기존 native UI 방식 KO/EN, 29언어 보장은 미확인 |

| 검사·화면 | 결과·원로그 |
|---|---|
| 신규 관련 기능 | 36/0, 오래된 계획·SP 부족·실제 PC 자원 거부3종 포함. `growth-ui.stdout.log` |
| 19r 직접 회귀 | 383/0, 원본24사례·PC거부2종. `growth-owner.stdout.log` |
| PC refresh 직접 회귀 | 290/0, 원본10사례·200필드. `pc-refresh.stdout.log`. 기능/관련 회귀 합709/0, 모두 각1회(실패 재실행0) |
| 원본 재추출 | 정의31·중심31·단계260·JSON/SVG 불일치0. `source-parity.log` |
| 렌더 자료 | 최종 `captures-review.stdout.log` 12/0(기능709 합계와 별도: OS/fixture/legacy표시/경계/PNG·크롭 검사). 전체2장+1x크롭4장. L/captures/01_growth_plan.png·02_growth_refund.png 및 *_1x.png. 실제 코드 SHA는 captures-review.inputs.json |

원로그 L=`~/exoduser-wt/_out/demo11-19ui/`. 화면은 실제 Main/19r/PC에 SP20/AP30을 부여한 **렌더 하니스 fixture**로 캡처하며 실창 수동 플레이 검수가 아니다. 자동 검사 통과를 사용자 눈 검수 PASS로 바꾸지 않는다. 예약 UI는 한 번에 한 단계씩 기존 FIFO로 넣고 개별 취소한다. 웹의 휠/빈 배경 드래그·hover 미리보기·전체 언어·모바일 재현은 이번 검증에 포함하지 않는다. UI 포인트 거래의 저장 요청은 19r receipt 수준이고 저장 IO 완료는 주장하지 않는다.

세 실행의 stderr는 기존 Main Camera2D physics interpolation 경고 각1개이며 SCRIPT ERROR/ERROR는0이다. PC suite의 Performance/refresh_ms는 성능 개선 근거로 사용하지 않는다. 새 벽시계 벤치는 이번 UI의 범위상 실행하지 않았다.

첫 캡처는 자동 PNG 검사11/0이었지만 이름/단계 겹침·빈 인장·화면 밖 확인창을 눈으로 발견하여 RETOUCH했다. 원본 문양 SVG atlas, 원본 major/선택/hover/focus 이름 노출, 정수 숫자 표기, 확인창 앵커·z순서를 수정했다. 처음 자료는 `captures/before/`, 첫 보강 자료는 `captures/retouch1/`에 보존했다. 최종 전체2장/상세·확인창1x를 직접 열어 글자·문양·창 경계를 확인했으나 사용자 승인 PASS를 대신하지 않는다. 거래/State 코드는 기능709/0 이후 변경0, 보강 재실행은 렌더 전용 분기이며 전체 회귀를 반복하지 않았다. legacy 예약 키 표시의 안전 fallback은 렌더 검사에서 별도로 확인했다.

캡처 경로(절대): `/Users/fordeargamers/exoduser-wt/_out/demo11-19ui/captures/`.
정상 훅/정확 경로 staging 후 자기 브랜치 일반 push·원격 일치·DONE 작성 뒤 자기 worktree 제거. 최종 SHA와 제거 확인은 L/DONE.txt에 기록한다.
