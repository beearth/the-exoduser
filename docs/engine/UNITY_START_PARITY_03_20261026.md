# UNITY-START-PARITY-03 — 필드 전역 밝기 합성 분리

상태: **IMPLEMENTED_UNVERIFIED**, GPU 인수 전. 최종 판정과 SHA는 `~/exoduser-wt/_out/UNITY-START-PARITY-03/DONE.txt`에 기록한다.

부모 `2ecc4e4abf958adf041c304e126a17f87df9510c`, 같은 `codex/unity-start-parity-01-20261026` 브랜치. 정본 snapshot SHA256 `dee094fd165e9b2fb3fbf0eb9cacc3bc3eddeb2c8eeea9c4772ba6cbc1f05209`. main/PC/사용자 실행본 반영이 아니다.

## 원인 분리

| 단계 / id | 정본·측정 | 결과 / 변경 |
|---|---|---|
| MAP_TEXTURE | 시작 화면의 chunk_3_6/4_6/3_7/4_7 웹 사본과 Unity PNG SHA256 동일4/4, 픽셀차0. 기존 LIGHT02 조명 OFF 캡처와 같은 월드좌표 원본 crop를 비교 | 5개80×60 바닥 영역 평균채널 차 −.029167..−.045000/255. 1024→1000 bilinear 재구성과 실제 raster의 미세차. 텍스처 import가 +6 전역 차이를 만든 근거 없음 |
| IMPORT / CAMERA | Gamma project, chunk sRGBTexture1, no mipmap, textureCompression0. 해당 floor는 불투명 texture로 덮임 | 설정·카메라 배경 변경0. 화면 밖/투명영역까지 동일하다는 주장은 아님 |
| BLOOM_NORMAL | source4481–4497/55203: sixth-size canvas, multiply RGB60, self copy±2px/globalAlpha.18, 최종 globalAlpha.08. GPU proxy6028의 globalCompositeOperation setter는 no-op; pipeline5592는 SrcAlpha/OneMinusSrcAlpha | Unity composite가 `world + bloom*.08`로 가산하던 오류. **`world*(1−.08)+bloom*.08`**로 교정. 값·반경 보상0; 기존 캐시·RT·pass 그대로 |
| OTHER_LIGHTING | ambient(6,16,9,.38), env(100,160,255,.06), fog pulse .28±.08/4초, vignette .2, CSS contrast1.05→brightness.97 | 이번 값·순서·위상 변경0. 원본 encoded sRGB 감마 합성 유지. 나머지 잔차를 이 값의 오류로 단정하지 않음 |
| PRACTICE_BACKDROP | 정본 parry-lesson.css1: left45% transparent→#08070ba6, opacity.5; native practice는 해당 backdrop 미이식 | 오른쪽 공간 차이에 별도 기여. 이번 필드 조명 수정에 UI 전체 이식을 끼워 넣지 않음. 방사표는 원본 방식대로 mask0이므로 포함됨 |
| ICC | 재사용 웹 PNG에 Display P3 Gamut with sRGB Transfer ICC, Unity PNG 무태그 | 이전 표와 동일하게 저장 byte Y′를 기본 표로 유지하되 웹을 sRGB로 변환한 보조표도 기록. 저장byte를 양쪽 모두 엄밀한 sRGB라 해석하지 않음 |

조명 OFF 대조는 **기존 Unity 실제 캡처 + 웹과 동일byte인 원본 texture의 같은 floor 좌표**다. 기존 web-start-lesson-intro 자체는 조명이 화면 전체에 적용돼 완전한 무조명 영역이 없다. 새 웹 OFF runtime을 찍었다는 주장은 하지 않는다. CPU 합성 예측과 새 GPU 실측을 구분한다. 원시 근거 `texture-stage.json`, `texture-source-byte-audit.json`, `pixel-probes.json`, `source-composite-cpu-prediction.json`.

## 검수 계약·소유

빌드1회→기존 ordinary-entry54tick 시작+900프레임1회→제단 capture-only1회→기존 HUD/practice 각1회. 웹 PNG 재사용. 새 진단 테스트파일0. 실제 실패 시 무수정 재실행0, 같은 항목2회 실패 시 중지. GPU 직전 사용자 PID38141/48476/52157 제외 타 Editor/Player를 검사하며 있으면5분 간격 최대90분 대기. 자기 실행만 관리한다.

이번 생산코드 소유는 FieldLighting.shader1hunk뿐. NativeGame.cs0hunk, NativeLobby/NativeLobbyVideo/audio/intro-silence/UNITY-MAC-20261024 WIP 불변. 매프레임 load/allocation/추가RT/pass0. 전용 output의 QA identity·roster만 사용. path명시 commit/push, hooks 유지. 상세 검수 결과를 아래에 기록한다.
