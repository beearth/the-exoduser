# playTone 시작·종료 예약 오류 정리 — source35 (2026-10-03)

source34의 실제 playTone 전체 함수에서 시작 또는 종료 예약이 동기 오류를 던질 때, 이미 연결한 오실레이터·게인을 정리하도록 양판에 적용했다. 정상 음색·시간·한도는 변경하지 않았다.

| 경계 / 항목 | source35 정확한 계약 |
|---|---|
| 적용 위치 | game.html / game-easy-test.html의 playTone, o.connect(g);g.connect(mbus()) 다음 |
| 오류 포착 | o.start(t)와 o.stop(t+dur+.02)를 같은 try/catch로 감싼다 |
| 오류 정리 순서 | o.stop() → o.disconnect() → g.disconnect(); 각각 독립 try/catch로 다음 시도를 보장한다 |
| 오류 전달 | 정리 후 throw e로 최초 시작/예약 오류 객체를 그대로 재전달한다 |
| 카운터 | 오류에서는 _activeNodeCnt 증가 지점에 도달하지 않는다. 다른 재생의 카운터를 감소시키지 않는다 |
| 종료 장치 | 오류에서는 새 onended 처리기·타이머를 등록하지 않는다 |
| 정상 경로 | 주파수·envelope·파형·예약 시각·노드 한도·기존 _dn·타이머를 그대로 유지한다 |
| 범위 밖 | 생성/context/envelope/connect/mbus 오류, 정상 _dn 및 타이머 등록 오류, playNoise/playDist/playFM |

| 통제 오류 사례 | 원본 관찰 | 변경 후 관찰 |
|---|---|---|
| start 실패 | 연결이 남고 별도 정리 없음 | 정지와 두 연결 해제를 각각 시도 |
| stop 예약 실패 | 시작된 노드와 두 연결이 남음, 처리기/타이머 없음 | 추가 stop과 두 연결 해제를 각각 시도 |
| 일부 정리 API 실패 | 독립 복구 없음 | 실패한 정리와 무관하게 나머지 연결 해제를 시도 |
| 모든 정리 API 실패 | 재생 경로 유지 | UNRECOVERED: 재생 경로가 남을 수 있다. 최초 오류 전달은 유지 |

검사는 외부 Audio API와 시계만 통제하고 실제 playTone 전체 함수를 실행했다. 양판 각9개, 총18개: 정상 명시 인수/기본 인수, 한도, 6개 오류 조합. 기존 코드 6 PASS/12 FAIL → 후보 18 PASS/0 FAIL. 실제 적용본은 toneStartStopCleanup 18개 + basicAttackAudioProgress 34개 = 52 PASS/0 FAIL. 12개 실패는 오류 조합 검사 수이며 독립 제품 결함12개를 의미하지 않는다. 통제 카운터4·cap48·dur .2의 정상 타이머700ms는 검사 조건이며 새 게임 설정이 아니다. 정상 onended와 timeout의 중복 호출에서 카운터5→4, 각 연결 해제1회가 유지됐다. inline JS12/importmap2 구문 검사 PASS. 실제 장치 오류 빈도·전체 caller·청취·제품 완료는 미검수다.

| 파일 | bytes | SHA256 |
|---|---:|---|
| game.html | 4035861 | 4bc474a8542c20deee21e64fd542f7e295d11dc1d98b350241cc991e423e1f0a |
| game-easy-test.html | 3913530 | 9bd5a9bb4de4cacb300e701394ec7dae59faf0b60ddfb2b109027a8f32f42169 |

각 판 +105B, 이 변경의 역변환은 source34 전체 원문과 exact 일치한다. playNoise/playDist/playFM 원문은 동일하다. 첫 전역 anchor 확인은 다른 함수에도 같은 구문이 있어 수정 전 중단했으며 이후 playTone 함수 범위로 제한했다.

근거는 SOUND0643 완료 msg_04893afbe993b162016ac0a4839f2487d0aa420832700c77a1 (2026-10-03T06:45:26.486Z), SOUND0653 완료 msg_04893afbe993b162016ac0a725a22887d09c362eb3a1e71028 (06:56:40.437Z)이다. 두 시작/예약 경계와 독립 정리만 부분 채택했다. 기존 파일5개 수정 전 백업, 코드2+검사1+docs4의 scope7만 보존한다. docs 전체 관련 검색 전후·원자료·실제 소비 대조·검사·핀은 tmp/mac-migration-runtime/continued-review-20261003/source35-tone-cleanup/에 보존한다.

기존 native 앱은 source29/3404 그대로이며 source30~35는 포함되지 않았다. 새 앱/빌드·사용자 세이브 수정0. 정상 시작→전투·획득→4지역/보스방→보스 사망·부활→재도전의 native 시각·청취 인수는 미완료다.
