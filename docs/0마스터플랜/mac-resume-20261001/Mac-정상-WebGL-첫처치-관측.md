# Mac 정상 WebGL 첫 자연 처치 관측 — 2026-10-01

## 판정

정규 WebGL2 부팅과 신규 Lv1 캐릭터로 **이동·좌클릭 입력 후 자연 처치 1건**을 관측했다. 단일 진단 기준점이며 고주사율 PASS, PC 329ms 원인 확정·해결, 성능 개선율을 뜻하지 않는다. 마지막 피해가 좌클릭·기본 자동석궁·펫 중 무엇인지는 분리하지 않았다. 따라서 **수동 공격만으로 낸 첫 처치**는 미확인이다.

선행 시도는 W 연속 입력 뒤 수동 공격 전에 자연 처치가 발생해 `preflight-auto-*`로 분리했다. 채택 표본은 별도 새 저장 원점에서 다시 정상 부팅한 한 건이다. 실제 실행은 총 2회이며 두 결과를 합치거나 좋은 값만 뽑아 비교하지 않았다. 게임은 항상 하나씩 실행했다.

## 실행 조건

| 항목 | 확인값 |
|---|---|
| 입력 HEAD / 원격 | `319de39d12e86f5c1965b6a6e7067dd44a934464` / 같은 브랜치 원격 SHA 일치 |
| 본편 디스크 = HTTP = 종료 디스크 SHA256 | `28a9da122cda65417c015101fb182f68173992646ee0020e4e13793ac243df35` |
| 서버 / 저장 | 기존 `server.cjs` PID36083, 127.0.0.1:3340, `tmp/mac-migration-runtime/saves`. 본 데모는 원점별 localStorage의 `hellsave_demo` 사용 |
| 채택 URL | `http://qa-firstkill-manual-20261001.localhost:3340/game.html?webgpu=0` |
| 저장·프로필 격리 | 기존 Chrome 프로필 안의 **새 loopback 원점**. 사용자 127.0.0.1 원점 및 기존 localhost QA 저장과 분리. 별도 Chrome user-data-dir·OS 프로필 격리는 아님 |
| 기기 / 브라우저 | Apple M5 Pro, RAM24GiB, Chrome152.0.0.0, ANGLE Metal Apple M5 Pro |
| viewport / DPR / 실제 주 캔버스 | 1352×663 CSS px / 2 / **1352×662** backing px. viewport override 없음 |
| 렌더러 | 정상 URL 정책 `webgpu=0`; `_useGL=true`, `_useGPU=false`, boot 완료·warm 완료·전경 확인 |
| 옵션 | high, resScale100, SSAA1, fpsCap0(무제한), parts80, 난이도5. bloom·lighting·postfx·deathFx·fog·grain 켜짐 |
| 옵션 제한 | 관측 설치 시 atmos1, 회수 시 atmos2. 기존 자동 품질 정책(`game.html` 59506–59507행)이 남아 있으며 전환 시각은 미계측. 완전 고정 품질 A/B 표본이 아님. 작업자가 품질·HP·적 수·공격력을 변경하지 않음 |
| 일반 시작 | 새 Lv1, 시네마틱 ESC → 안내 건너뛰기 → 연습 건너뛰기. 테스트 캐릭터·강제 부팅·mkEn/hurtE 호출·강제 tick/부활·HP 보충·RNG 변경 없음 |
| 부하 조율 | Claude11 idle/done 및 Codex 지원3 완료. 새 게임·빌드·인코딩·대형 에셋 작업 병렬 실행 없음. 시스템 전체 외부 부하를 지속 추적한 표본은 아님 |

## 입력·처치 증거

- 계측 구간에 도구 native 좌클릭2회(게임 좌표675,245)와 W2회가 모두 `isTrusted=true`로 기록됐다. 별도의 연습 건너뛰기 클릭1회는 공격 입력에서 제외했다. 사람이 물리적으로 누른 키라고 주장하지 않는다.
- 플레이어 y7420 → 7169.999999999998, 약250 이동. 첫 처치 직후 Lv1·HP558, `G.kills` 0→1, 자연 생존 적8. 자동 회수 종료 때도 kills1·생존 적14·HP558이었다.
- 첫 처치 확인 시각은 페이지 performance.now **41866.8ms**, 첫 게임 좌클릭 후 **3132.4ms**. 이는 update 뒤 kill counter 증가를 읽은 시각으로 정확한 내부 lethal instruction 시각은 아니다.
- 관측기는 첫 처치 뒤 약1526ms에 자동 정지했다. 전체 관측12470.2ms에는 시작 안내 대기가 포함된다. 게임 입력부터 자동 종료까지 **4658.4ms**를 별도 집계하며 경계를 가로지르는 프레임 간격은 제외했다.
- 회수 도중에도 게임은 자연 진행해 이후7처치 뒤 플레이어가 사망했다. `post-run-death.png`는 **측정 이후 종료 화면**이고 첫 처치 순간의 스크린샷이 아니다. 자동 종료된 표본에 이후 전투·사망 수치를 섞지 않았다.

## 프레임 결과

단위 ms, 분위수는 nearest-rank. rAF는 별도 관측 콜백 간격, draw 간격은 실제 게임 draw 호출 시작 사이 시간이다. 둘은 화면 표시 프레임을 직접 측정한 값이 아니다.

| 구간 / 값 | N | 평균 | p95 | p99 | 최대 | >50 / >100 |
|---|---:|---:|---:|---:|---:|---:|
| 전체 관측 rAF 간격 | 458 | 27.18 | 34.80 | 58.40 | 216.30 | 7 / 1 |
| 전체 관측 draw 간격 | 458 | 26.73 | 36.30 | 76.70 | 111.10 | 7 / 3 |
| 게임 입력→자동 종료 rAF 간격 | 145 | 31.90 | **41.70** | **43.30** | 50.60 | 1 / 0 |
| 게임 입력→자동 종료 draw 간격 | 145 | 31.89 | **38.60** | **43.40** | 76.70 | 1 / 0 |
| 게임 입력→자동 종료 update 호출 경과 | 279 | 0.58 | 0.90 | 3.00 | 12.70 | 0 / 0 |
| 게임 입력→자동 종료 draw 호출 경과 | 146 | 1.12 | 3.50 | 4.80 | 6.70 | 0 / 0 |
| 첫 처치 ±500ms rAF 간격 | 29 | 33.34 | 41.90 | 42.60 | 42.60 | 0 / 0 |
| 첫 처치 ±500ms draw 간격 | 29 | 33.28 | 40.60 | 43.40 | 43.40 | 0 / 0 |

게임 입력 구간 실제 draw 호출 빈도는 약31Hz다. FPS무제한 설정을 고주사율 달성으로 해석하지 않는다. PerformanceObserver longtask는 전체4건(103/77/106/110ms), 모두 게임 입력 이전; 게임 입력 구간0건이다. longtask와 rAF/draw 간격은 정의가 달라 숫자가 같을 필요가 없다. 해당 구간 blur/visibilitychange/resize 이벤트0, 처음·처치·종료 모두 전경이었다.

## 첫 처치 CPU / GL 귀속 범위

| 시각 / 경로 | 직접 관측한 동기 경과 |
|---|---|
| 41854.8 `_addCorpse` | 포함11.50ms, 감싼 자식 제외0.10ms |
| 41855.1 `_addHeadGib` (위 시체 경로 자식) | 포함11.20ms, 감싼 자식 제외0.20ms |
| 41855.4 `2d.drawImage` (머리 파편 자식) | 10.80ms |
| 41868.3 `gl.texImage2D` | 1.20ms, `assets/vfx/Blood_FBF_4x4.png` |

중첩11.5+11.2+10.8을 합산하지 않는다. drawImage 반환 대기의 원인이 이미지 디코드·GPU 동기화·드라이버 중 무엇인지는 이 기록으로 확정하지 못한다. GL API 경과는 GPU 실행 시간 자체가 아니며 GPU timer query를 쓰지 않았다. 이 처치에서 관측한 약11.5ms를 PC329ms의 원인으로 귀속하지 않는다.

기존 검증된 `tools/qa_first_kill_cpu_probe.js`와 별도 임시 frame 관측기를 사용했다. 원본 반환·예외를 전달하고 상태를 읽었으며 처치 규칙은 바꾸지 않았다. CPU 래퍼 기록 누락0·포화false, `_worldDropSkin`은 기존 코드에 없어 missing에 남았다. update/draw 래퍼와 CDP CPU Profiler의 오버헤드를 포함하므로 무계측 성능 본표로 간주하지 않는다.

CPU profile은 44.264초/29579샘플로 관측 종료 후 시간까지 포함한다. profile clock과 페이지 clock의 정확한 정렬을 기록하지 않았으므로 전체 프로파일을 첫 처치 비용으로 합산하지 않는다. 위 첫 처치 귀속은 동일 페이지 performance.now를 쓰는 동기 래퍼 기록에 근거한다.

## 회수·보호·남은 일

- 첫 처치 자동 종료로 update/draw·CPU 래퍼·이벤트·rAF·타이머·PerformanceObserver 정리. runtime 원본 복구 확인. Profiler.stop/disable 뒤 JSON 저장, 탭 about:blank로 게임 종료. 옵션 직접 변경·viewport override가 없어 복구할 사용자 옵션은 없다.
- 생산 game/easy 코드 변경0, 본편 SHA 유지, 기존 정규화22경로·빈 인덱스 유지. PC·원래 Mac3333·사용자 저장 및 VS Code 신뢰 승인 대기를 건드리지 않았다.
- 원자료 조건 assertion: kill0→1·종료1, native W2/게임 클릭2, 약250이동, 관측기정지·누락0·가시성 이벤트0 확인. 이것은 증거 정합성 검수이며 일반 게임 CI 전체 PASS가 아니다.
- 다음 판단 근거: 동기 시체 캡처10.8ms와 draw 간격 최대76.7ms는 별개로 조사한다. 정확한 최종 피해원, 옵션 전환 시각, GPU 시간, 고주사율, 무계측 반복/고정 조건 A/B는 미확인이다. 이 표본만으로 생산 최적화·화질 하향을 적용하지 않는다.

[요약 JSON](normal-first-kill-evidence/summary.json) · [실행 메타데이터](normal-first-kill-evidence/metadata.json) · [원자료 묶음](normal-first-kill-evidence/evidence.zip) · [정리 확인](normal-first-kill-evidence/cleanup.json).
