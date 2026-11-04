# 체험판 flavor 문구 F1·F2 — 02:20 순차 지시

판정표는 `origin/unity/main 6ef1899cb`의 `docs/11내러티브·로어디자인/DEMO_V0_1_1_TEXT_AUDIT_20261104.md` §5다. Desktop 교체3 빌드 실패/385 유지 기록과 F-1 보강41bfb2212a push 뒤 이 데이터 수정을 수행했다. 화면·Mac 원어/RTL 판정과 구분한다.

| 항목 | 반영 |
|---|---|
| F1 | stageclear_labels.json의 demoWishlist를 판정표에 실제로 열거된19행(ko 포함)과 글자 단위로 일치시켰다. 나머지10언어와 demoSub/demoNext 및 다른 모든 필드는 그대로 보존했다. 판정표 본문의 "17개"와 실제19행 수가 달라 표의 명시 문구를 기준으로 적용했다 |
| F2 | 번역목록 중복4259/4260 두행 삭제. 기존3473/2824 참조 문장 추가. 4261 KO를 정식판 위시리스트에 추가로 변경. buildflavor_web.json 두 button 배열의 영어 End demo를 End of Demo로 통일 |
| 줄바꿈 | 기존 목록에 단독 LF1개가 섞여 편집 준비가 처음 중단됐다. LF1개만 CRLF로 정상화하고 출력 전체 CRLF 유지. 의미 없는 전파일 줄바꿈 변경 없음 |
| F3 | 아랍어 완료 화면 RTL 경로 연결은 배정 밖 후속으로 유지. 이번 데이터가 ar 실제 표시 PASS를 의미하지 않음 |

검사: `C:/nvm4w/nodejs/node.exe unity/Tools/demo-flavor-tests/retouch.cjs` 최종39/39 통과. 29개 locale 고유성·허용 wishlist 변경만 반영·나머지10언어/전체 비대상 필드 보존·기존 번호 유지/중복 제거·명시 참조·KO목록 동기화·영어 버튼2곳·CRLF를 확인했다. 편집이 처음 중단됐을 때 뒤 검사가 실행돼 미수정 ko로1회 실패했다. 실행 순서를 편집 성공 후 검사로 고쳐 최종1회 통과했으며 같은 실패 재발0이다.

데이터만 바꿨고 추가 Unity 컴파일/빌드/Player/Steam 업로드는 하지 않았다. 직전 F-1 PC 컴파일348efe7a·회귀38/6/64/두 프로세스7 결과는 별도 소스 검증이다. Mac Player UI 인자는 `--unity-build-flavor demo --unity-mute --unity-qa-sandbox <빈 절대 경로>`이며 실제 문구·줄바꿈·RTL·입력은 Mac 검수 대기다.

기계 결과: `I:/EXODUSER-Storage/codex-takeover/unity-11-fullrun/text-retouch-result.json`. 최종 SHA와 Desktop385 유지 상태는 REPORT 맨 위.
