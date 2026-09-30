# 첫 처치 긴 프레임 CPU 경로 조사

## Mac 이전 인계·정지

사용자 최신 정지 지시에 따라 이 조사 한 건을 계측 준비·구문 검사까지 마무리하고 정지한다. 자동 연속 진행, 새 측정, M2 패키지 대조는 시작하지 않는다.

| 복구·증거 항목 | 정확한 기준 |
|---|---|
| 조사 시 HEAD | `737848097f6c88839b8ef83ae4f5aec88e172f6b` |
| 조사 시 working game.html SHA256 | `8481373e1ba6f4e3ffa28cc10aaab8ee5e06931f0dcb0b84229490c7b38d070e` — 공용 미커밋 변경 포함, HEAD 동일 주장 없음 |
| 계측 파일 SHA256 | `744c2a66d4c5001483797cc20a564a80440c47667dd511dd1148a03be155261b` |
| 검증 | Node `--check tools/qa_first_kill_cpu_probe.js` exit 0. 실게임 실행 0 |
| 원격 WIP 백업 | 총괄 인수값 `codex/backup-20261001-020248`, `5ea53a92d0c5a2c9bb1cc1c69b5ae2bc93477f45`; 본 조사에서 독립 원격 대조는 수행하지 않음 |

Mac에서 이어갈 한 건: 가시 headed 정규 부팅에서 첫 처치 한 번의 CPU 귀속을 확인한다. 서버는 `node server.cjs`; 기존 프로브에는 `--chrome=/Applications/Google Chrome.app/Contents/MacOS/Google Chrome --char=new --scen=COMBAT --inject=tools/qa_first_kill_cpu_probe.js --profile=1`을 사용한다. 실행 전 Mac 경로 처리·의존성·세이브 차단·정상 visibility를 검증하고 CPU/GPU 결과를 Windows와 직접 성능 비교하지 않는다. 종료 직전 `page.evaluate(() => window.__qaFirstKill.stop())` 결과를 JSON에 저장하도록 하니스 회수 지점을 먼저 보강해야 한다. 현재 프로브는 해당 records를 자동 회수하지 않는다.

미검증: 주입 래퍼의 정규 런타임 설치/회수, 329ms 원본 재대조, 사망 종류별 분리, Mac 정상 부팅, 패키지 SHA 대조. 성능 개선 선언 없음. 생산 게임·ENEMY/VFX 소유 구역·세이브 수정 없음.

총괄 후속 인계의 329ms는 원본 표본 재대조 전 보고값이다. 이번 작업은 코드 조사·계측 준비이며 새 게임 측정을 수행하지 않았다. 생산 코드 변경 없음.

| 경로 | 확인한 코드 | 분리할 비용 / 가설 |
|---|---|---|
| `_fmDeathFx` → `_addCorpse` | 독립 필드몹 전용 시트 캡처가 가능 | 사망 연출 포함 시간, 시체 캡처·핏자국·머리 파편 자식 비용 |
| `_addCorpse` | 128² 풀 캔버스 clear·현재 시트 draw; deathFx 옵션 검사 | 첫 이미지 디코드 또는 큐 대기와 풀 검색 구분 |
| `_addHeadGib` | 동일 이름 선언 2곳, 뒤 선언에 48² 캡처·크롭 | 활성 함수 소스 확인 필수. 앞 선언 기준 계측/수정 금지 |
| `_worldDropFxTile` → `_maskWorldDropBlack` | 캐시 미스 때 512² 타일 생성, draw → getImageData → 픽셀 루프 → putImageData | 첫 드롭 시 읽기백 대기와 픽셀 변환 분리. 캐시 히트와 미스 구분 |
| GL texImage2D | 시체/드롭 첫 draw와 별도 시점에 수행 가능 | CPU API 대기 시간이며 GPU 실행 시간 자체로 해석 금지 |

`tools/qa_first_kill_cpu_probe.js`는 정상 부트 후 `--inject`로 설치하는 임시 래퍼다. 포함 시간·계측된 자식 제외 시간·호출 시각·부모·캔버스 크기를 기록한다. 미존재 함수는 missing으로 남긴다. 생산 사망 판정·보상·VFX 플래시 구역을 편집하지 않는다. `__qaFirstKill.stop()`은 래퍼를 복구한다. 최대 20,000개 기록 이후 표본은 누락되므로 짧은 진단에만 사용한다.

다음 조율된 진단에서는 첫 처치 전부터 프레임/CPU 프로파일과 함께 기록하고, 처치 직후 update와 다음 draw까지 동일 시간축으로 대조한다. 원래 프로브의 최종 JSON 회수에 records를 포함해야 한다(현재 inject 반환값만으로 이후 기록을 자동 저장하지 않음). 래퍼 오버헤드 때문에 ABAB 성능 본표에 합치지 않는다. deathFx를 끄는 실험은 진단용 조건으로만 명시하며 해결 결과로 보고하지 않는다.

ENEMY에는 실제 사망 종류·최초 kill 시각·보상 경로 호출 정보를 요청할 인계 지점을 남긴다. VFX에는 시체/고어 렌더 첫 업로드와 플래시 종료를 같은 프레임에서 확인할 지점을 남긴다. 생산 수정은 329ms의 직접 귀속 이후 판단한다. 패키지 대조는 정확한 패키지 SHA 수신 후 별도 수행한다.
