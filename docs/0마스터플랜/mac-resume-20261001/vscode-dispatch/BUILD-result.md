# BUILD-RECOVERY-CONTRACT 결과

2026-10-01, 배정 터미널10 / Codex(UI 번호·실제 모델·sessionId 미확인). 담당 범위 검사 완료, 생산 수정·패키지 검수 완료가 아니다.

## 소스와 방법

- HEAD `30a204a7aa348a88b90bdc922862c610a7da938f`. 실제 읽은 `server.cjs`, `node-main.js`, `build-nwjs.mjs`, 두 게임의 `_clearHeldInput`, `tools/test-chain-input-bindings.cjs`, `test/localStaticServerSaveApi.test.js`, `test/demoSaveRoute.test.js`, 기존 `tools/qa/map020-followup-build/build-audit.py`를 근거로 작성했다.
- 독립 도구 `tools/team-followup-20261001/BUILD/recovery-contract.cjs`는 현재 소스를 VM에서 실행한다. HTTP createServer/listen은 모형이며 실제 소켓을 열지 않는다. fs 접근은 본인 폴더의 고유 임시 fixture 경계로 제한한다. `.env`·실제 APPDATA·사용자 세이브를 읽지 않는다. 생성 fixture는 제거했다.
- 패키지 검사는 현재 빌더의 두 문자열 치환을 메모리 사본에 적용한 단위 검사다. 생성된 Windows 패키지를 실행하거나 검증한 것이 아니다. 소스별 SHA-256·Node 버전·UTC 시각·개별 assertion은 `recovery-evidence.json`에 보존했다. 원격 ref는 이번 담당에서 재조회하지 않았다. 배정서의 원격 대조 완료 기록과 이번 로컬 SHA를 구분한다.

## 계약별 판정

| 대상 | 확인한 계약 | 결과·남은 게이트 |
|---|---|---|
| 개발 서버 | 기본3333; PORT=3340 / HOST=127.0.0.1 / EXODUSER_SAVE_DIR는 절대경로 해석 | 모형3340·loopback, fixture 저장/불러오기·VM 재시작 복원 PASS. 실제 서버 정체·응답 SHA 미검수 |
| 통합 패키지 사본 | 고정3333→3347; APPDATA/EXODUSER-INTEGRATION-ID/saves; userdata-integration-ID | 치환 토큰·사본3347·fixture 복원 PASS. 실제 프로필·EXE·패키지 SHA·재실행 미검수 |
| 포트 유효성 | 개발 PORT 정수1~65535 | 0/65536/NaN/3.5 거부 PASS |
| 포트 충돌 | 두 생산 서버에 error 리스너 없음 | 누락 관측. EADDRINUSE 때 사용자 안내·안전 종료·다른 서버 콘텐츠 오인 방지 미검수. 리스너 부재 assertion PASS는 복구 PASS가 아님 |
| 잘못된 저장 위치 | 파일 아래 saves 경로 | ENOTDIR로 초기화 실패 확인. 경로 오류 안내/안전 종료 계약은 부족. 임의 유효 경로나 기존 디렉터리를 지정하면 격리 여부 자체는 보장하지 않음 |
| 슬롯·공유 재료 | 슬롯 정규화, 음수mats→0, `_sharedMats.json` 목록 제외 | 정상 슬롯 roundtrip·목록 PASS. `../복구`→`___복구`는 저장·직접 로드 가능하지만 `_` 시작 필터로 목록에서 숨음. 사용자 슬롯명 정책/예약 접두어 처리 인계 필요 |
| 중단 후 입력 | blur/hidden에서 K/KH/MB/MBjust·돌진 홀드·beam·컷신 skip 해제 | 양쪽 소스 함수/리스너 VM PASS; visible에서는 키 보존. OS alt-tab·패드 재주입·실제 포커스·게임 중단/재개 미검수 |
| 저장 중 강제 중단 | 두 서버 writeFileSync 직접 저장 | 원자적 임시 파일→rename·이전 정상본 보존 없음. VM 재시작 성공은 프로세스 강제종료/부분 쓰기 내구성 증거가 아님 |

## 실행 기록

| 명령 | exit | 근거 |
|---|---:|---|
| `node tools/team-followup-20261001/BUILD/recovery-contract.cjs` 최종 | 0 | 26 PASS / 0 FAIL; 누락 관측 assertion 포함 |
| `node tools/test-chain-input-bindings.cjs` | 0 | 본편·쉬운판 설정/키충돌/프리셋 회귀 PASS |
| `node --test test/demoSaveRoute.test.js` | 0 | 8 PASS / 0 FAIL, `BUILD/demo-route.log` |

초기 하니스 실행은 URL 전역 미주입으로 exit1이었다. URL 주입 뒤22PASS/2FAIL은 정규화 슬롯의 `_` 접두어 때문에 목록에서 숨는 실제 동작을 확인한 결과다. 슬롯 목록 assertion을 해당 관측으로 분리하고 정상 슬롯 검사2개를 추가해 최종26PASS로 정리했다. 생산 결함을 수정하여 통과시킨 것이 아니다. Node의 `DEP0169 url.parse()` 경고가 남았다.

`test/localStaticServerSaveApi.test.js`는 실제 listen 및 프로젝트 `saves/` 쓰기를 포함하므로 실행하지 않았다. 실제 서버·게임·브라우저·빌드·인코딩·LFS 다운로드·Git add/commit/push는0회. 공용 마스터·생산 코드·타 팀 파일·세이브는 변경하지 않았다. 변경 경로 수는 중간79건으로100 미만이며 타 팀 병행 변동 포함이다.

## docs 검색과 인계

`rg -n '입력.*정리|_clearHeldInput|EADDRINUSE|EXODUSER_SAVE_DIR|3347' docs/`를 수행했다. 58행 원자료는 `BUILD/docs-search.txt`다. 기존 통합 대장/PC 패키징/UI03 후보의 개발3340·통합3347 설명은 현재 계약과 일치한다. 공유 문서 쓰기 금지에 따라 이번 새로운 정보는 이 result에 기록한다.

총괄의 다음 문서 보충 후보: `INTEGRATION_BUILD_TEAM_MASTER.md` INT-002에 포트 충돌 리스너 부재·저장 경로 사전검증 미비와 실제 패키지 게이트를 추가; 저장 SSOT에 `_` 예약 접두어 슬롯 가시성 및 직접 쓰기의 중단 내구성 제약을 추가; 입력 SSOT에 VM 회귀와 실제 OS 포커스 검수 구분을 추가. 생산 diff는 아직 제안/적용하지 않았다. 다음 작업은 소유권 밖이므로 실행하지 않고 총괄에 인계한다. 원격 체크포인트도 총괄 담당이다.
