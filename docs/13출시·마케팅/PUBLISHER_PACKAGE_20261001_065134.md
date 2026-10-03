# 퍼블리셔용 Windows 데모 ZIP — 20261001-065134

사용자 요청: “zip 최신버전으로 패키징하고”. 생성·검수: 2026-10-01 06:51–07:03 KST.

**로컬 패키지 및 ZIP 생성 완료. 압축 무결성 PASS. 전체 native 게임플레이·교전 FPS는 미검수이며, Drive 업로드·메일 발송은 하지 않았다.**

## 입력과 복구 지점

| 항목 | 값 / 근거 |
|---|---|
| 고정 소스 | `dd4c12b94b4ce90afc14bee15809b70c1a541863` |
| GitHub ref | `codex/mac-environment-20261001`; 빌드 시작 시 원격 SHA 일치 확인 |
| 최종 원격 조회 | 07:02 KST `2d1fc53de045842ad941a95d0b3bc9ddaf2478b2` |
| 추가 커밋과 동등성 | 고정 소스의 후손. 추가 변경은 관리 문서·Mac 팀 실행 도구·진단 도구/테스트 26개이며 패키지 입력 변경 0개. 당시 최신 원격 게임 입력과 동등 |
| 기존 WIP 보존 | `955a2758fa2f1865a9c1c5d3900418d543f3a3d3` 복구본을 포함한 소스 |
| 공용 체크아웃 | HEAD `aacc7b02bef9d5cd7db6ea5d6466d7b8e4c11a3c` 유지. 공용 Git staging/commit/reset/checkout/push 수행 없음 |
| 소스 추출 | `tmp/publisher-package-20261001-065134/source.git` 별도 bare 저장소에서 참조 확인. 각 입력 Git blob과 실제 파일 대조 |

진행 중인 다른 팀의 새 WIP를 임의 혼합하지 않았다. 원격 소스 보존과 로컬 실행 패키지는 별도 상태다. 이 결과 문서와 대용량 ZIP을 GitHub에 업로드했다는 뜻은 아니다.

## 산출물

기준 폴더: `output/applications/publisher-latest-20261001-065134/`.

| 항목 | 값 |
|---|---|
| ZIP | `02_EXODUSER_DEMO_WIN64_20261001-065134.zip` |
| ZIP 크기 | 6,975,744,996 bytes (약 6.98 GB / 6.50 GiB) |
| SHA-256 | `3199435464996067f6d0c1cd33a5851b2599b472752596da657a2f188740e712` |
| 멤버 | 6,644개, 중복 경로 없음, 단일 최상위 폴더 |
| 압축 전 | 7,458,737,352 bytes |
| 실행 폴더 | `EXODUSER_DEMO_WIN64_20261001-065134/` |
| 실행 방법 | ZIP 전체 해제 후 `START_EXODUSER.cmd` 또는 `EXODUSER.exe` 실행 |
| 실행 엔진 | NW.js 0.111.2, Windows x64. 이전 검증 런타임 475개 파일을 manifest SHA로 대조 |
| 실행 설정 | `http://localhost:3337/index.html?demo=1`, 전체화면 |
| 전용 프로필 | `userdata-publisher-20261001-065134` |
| 전용 API 저장소 | `%APPDATA%/EXODUSER-PUBLISHER-20261001-065134/saves` |

패키징용 포트·저장 이름 변경은 이 출력 사본에만 적용했다. 기존 정상 패키지·사용자 세이브를 변경하지 않았다. QA 임시 설정은 원래 배포 설정으로 복원한 뒤 압축했다. ZIP 안의 최종 설정을 다시 읽어 확인했다.

## 검수 결과

| 구분 | 결과 | 범위와 근거 |
|---|---|---|
| 입력 파일 | PASS | 소스 6,165개 + 런타임 475개 + 생성 안내/설정 4개. manifest 크기·SHA 대조 |
| 압축 | PASS | 6,644개 파일 전체 CRC 검사, 원본 파일 해시 대조, ZIP 전체 SHA-256 계산 |
| 개인정보/사용자 데이터 | PASS | manifest 및 ZIP 경로에서 사용자 프로필·세이브·`.git`·환경 인증 파일 제외 |
| 회귀 테스트 | **29/30 PASS** | 고정 소스에서 8개 테스트 파일 실행. `demoScope.test.js` 로비 안내 문구 정규식 1건 실패 |
| 남은 테스트 실패 | 미해결 | 기존 테스트가 `DEMO CHARACTER` 뒤의 특정 문구 배열을 요구. 현재 로비 레이아웃에 해당 배열 없음. Lv.100 상한/CH1-1 계약 테스트와 실제 로비 표시는 확인. 이 작업에서 게임/테스트를 수정하지 않음 |
| native 실행 | 부분 PASS | 실제 EXODUSER.exe 기동과 내장 서버 HTTP 200 확인. QA에서 숨김 창·격리 프로필 사용. native CDP 연결 실패로 native 시각·전투·오디오 검수 미실시 |
| 브라우저 플레이 흐름 | PASS | 동일 패키지 서버 + 설치된 Chrome, 1280×720: 데모 진입→신규 전사→스토리 스킵→CH1-1→튜토리얼 스킵→이동 입력→설정→로비 복귀 |
| 저장 지속성 | PASS (브라우저) | Chrome 프로세스 종료·동일 격리 프로필 재시작 후 캐릭터 이름·Lv.1·stage 0 복원 |
| 서버/자원 | PASS | 주요 파일 11개 응답 해시가 패키지와 일치. 격리 API 저장/불러오기 성공. 관찰 중 page error·HTTP 400 이상 0건 |
| 성능 | **미검수** | 교전 FPS·첫 처치 지연·프레임 드랍 개선을 실측하지 않음 |

회귀 테스트 초기 실행에서 격리 fixture 누락이 발견되어, 필요한 고정 소스 문서/빌더를 추가한 후 재실행했다. 최종 29/30 결과는 `tests-complete.log` 기준이다. 기능 테스트를 그래픽 품질 또는 모든 전투 콘텐츠의 완료 증거로 간주하지 않는다.

## 증거 파일

- 출력 폴더의 `build-manifest.json`, `archive-verification.json`, `EXODUSER_DEMO_SHA256.txt`.
- `runtime-qa.json`, `zip-config-check.json`, `package-input-check.json`, `source-remote-check.json`.
- 출력 `qa/10-play.png`, `qa/11-settings.png`, `qa/12-restored-lobby.png`.
- `tmp/publisher-package-20261001-065134/tests-complete.log`, `build.mjs`, `archive-build.py`, `archive.log`.
- QA 세이브/브라우저 프로필은 tmp 격리 경로에만 있으며 ZIP에 넣지 않았다. 작업 소유 QA 프로세스는 종료했다.

## 전달 단계

1. 로컬 ZIP 생성·무결성 검사 완료.
2. native 전체 플레이·오디오·교전 FPS 검수 및 로비 문구 테스트 불일치 처리 남음.
3. 기존 소개서의 기검참 설명·ZIP 파일명·AX 성과·고객 포지셔닝 갱신 남음.
4. Drive 신규 버전 업로드·권한·원격 파일 재조회 미실시.
5. 3사 Gmail은 기존 초안 상태. 이번 ZIP 작업에서는 초안을 수정하거나 발송하지 않음. 실제 공유 링크 확정 후 작성 메모·미확정 항목 정리 필요.

메일 준비 로컬 상태는 `output/applications/publisher-email-prep-20261001/delivery-readiness.json`에 이 ZIP 경로·해시와 잔여 단계를 반영했다.
