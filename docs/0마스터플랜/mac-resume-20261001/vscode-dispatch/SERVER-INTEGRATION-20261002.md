# 서버 범위 전송·저장 실패 처리 인수

2026-10-01 18:01 UTC 합본 검수. 변경 전 HEAD/GitHub ref `aafcd9d5733506c89906c3389863b6c8adf23a23` 일치, 공유 index empty, server.cjs clean. 원 server SHA `339fad6ab51cba92f6ca7a386c8aeb251f68cdb58cdfa55c109f57b1758a42ad`를 frozen before로 보존한 뒤 BUILD/BALANCE 두 완료 후보만 순차 적용했다. 합본 SHA `6a7c1083ac10b105cca3624c8fd0e919d14a59b32774612ff0a00cb881be8538`.

## 실제 변경

- Range suffix: 길이10000에서 bytes=-500을 기존0–500/501바이트 대신9500–9999/500바이트로 계산한다. 고정/열린 끝/큰 숫자 clamp 및 416을 처리한다. GET 외/알 수 없는 단위/미지원 다중범위는 기존 전체 응답 경로를 사용한다. GET 캐시·gzip 분기는 byte 그대로다. [RFC9110 §14.1.2·14.2](https://www.rfc-editor.org/rfc/rfc9110.html#section-14.1.2)의 suffix 정의와 범위 무시 허용을 확인했다. If-Range/조건부 Range 순서 및 HEAD 전체 최적화는 기존 남은 문제로 분리한다.
- POST /api/save: 같은 디렉터리의 wx 임시파일에 직렬화 내용을 기록·close한 뒤 rename한다. 실패 시 자신이 만든 임시파일만 정리한다. 기존 파일 삭제 fallback 없음, EEXIST 시 타 파일 삭제0. 슬롯·저장 스키마·성공/400 JSON·outer500 계약은 유지하고 성공 ACK는 rename 뒤다. [Node fs rename 문서](https://nodejs.org/api/fs.html#fsrenamesyncoldpath-newpath)의 기존파일 교체 계약을 참고했으며 파일시스템의 크래시 내구성까지 보장한다는 뜻은 아니다.

## 검수 및 보존

`node tools/team-followup-20261001/root-review/server-integration.mjs`: actual production Range23 + 실제 production helper/route 메모리fs13 + actual 전체 HTTP handler4 =40그룹 PASS. 기존 suffix 잘못된 결과와 부분쓰기 손상 RED를 frozen before로 계속 재현한다. 전체 handler는 AST 표현식만 VM에서 호출하여 성공 ACK 순서/쓰기 실패/rename 실패/깨진 JSON500을 검수했다. http.createServer/listen 자체 호출0, .env 로드0, 실제 저장/API/사용자파일 접근0.

생산 전체가 두 검수 후보의 정확한 합본인지 byte 비교하고 전체 구문 검사를 통과했다. 담당 제출20파일 전후 SHA 보존. 기존 검사/증거를 덮지 않고 root 전용 파생 테스트에서 before와 현재 생산을 분리한다. 담당 원검사는 옛 server를 전제로 하므로 생산변경 후 직접 재실행하지 않으며, frozen before와 파생 하니스가 RED/회귀를 재현한다. root 출력은 outputs/team-review-20261002/server-integration에 있다.

실제 디스크 교체/Windows 동작/전원손실/프로세스 크래시/fsync/실 HTTP/미디어 재생은 미검수다. EPERM 서버 검수는 우회하지 않았다. close/unlink 실패 시 descriptor 또는 임시파일이 남을 수 있고 기존 슬롯을 지우지 않는다. 영상 멈춤 원인해결, 런타임 저장/재실행 PASS로 확대하지 않는다. 공유 mats API는 범위 밖이다. 실행 중 서버·기존 앱·사용자게임1573846373·세이브·빌드 변경0, 재시작0. 이번 소스 수정은 실행 중 프로세스에 즉시 적용되었다고 주장하지 않는다.

## 팀 상태

BUILD/BALANCE 기존 완료 turn을 읽고 후보를 인수했다. UIUX filter-focus도 완료됐으며 owner 보고32 RED→GREEN/26검사 후보는 아직 root 미검수·미적용이다. ITEM CSP 진단23PASS는 이전 체크포인트이며 원주입자는 UNKNOWN/QA 실제 게이트 유지. 이번에 추가로 확인된 ITEM 독립 구현 결함이 없어 중복 과제를 보내지 않았다.

기존7팀 연결을 새 CUA getState로 다시 확인했다. 이번 응답은 apps=[] 및 'Mac is locked and automatic unlock could not unlock it'. 이전 -10005를 재사용한 판단이 아니다. 기존 팀7건은 미전달을 유지하고 사용자에게 잠금 해제를 요청했다. 잠금 해제 전 맹목입력/세션복제/보안설정변경0. QA만 실제 UI/런타임 슬롯을 소유하며 현재 실행 중으로 표시하지 않는다.
