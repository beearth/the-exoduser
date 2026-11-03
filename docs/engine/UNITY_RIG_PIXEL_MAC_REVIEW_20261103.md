# 리깅 픽셀 21:20 — CTO 통합 준비·Mac 단독 성능 재측정

요청 브랜치: codex/unity-rigpixel-20261103. 최종 SHA는 REPORT.md 첫 줄. 최신공통 aa38bb8773274bd5f2c91fdc25c4eb2cf003565d(사망화면 포함)을 정상 merge했고, CHANGELOG의 리깅·사망UI 기록을 모두 보존했다. docs 정본은 unity/main이다.

- 기존 시각 근거: CTO21:20 브리프 / qa/mac-captures-20261103 @adc7233e6 / qa/unity-rigpixel/39e52fe/. 검격 사각면0·망토낱픽셀0·흑철·1px검격 PASS.
- 3840 56fps는 다른 Player 동시실행 오염으로 단독 재측정 대기다. 이것을 60fps PASS로 세지 않는다. 기본은 sprite이며 성능 PASS 뒤 CTO가 전환을 결정한다.
- PC 병합본 컴파일952896b8: c81bdc6455, exit0·C#0·네셰이더/R7 true·USER_SAVE0. 이번 단위 새Player·빌드·리깅코드수정0. 종전과 동일한 시각검사를 이유 없이 반복하지 않는다.

## 남은 Mac 측정

Mac의 소유 checkout·승인 실행기를 사용한다. 필요한 경우 최종 병합본을 고정 build-current에 한 번 빌드(-remodel-scenes 1)하고 같은 패키지를 사용한다. 기존 후보/사용자 실행본을 임의 교체하지 않는다.

1. 다른 QA Player·자기 빌드·인코딩이 측정창과 겹치지 않는 것을 읽기 전용으로 확인하고 순차 측정한다. 타인 앱을 종료하지 않는다. Player PID/시작·종료/동시실행 여부를 FPS와 함께 남긴다.
2. 공통 인자: --unity-rigpixel-natural --hero-render=rigpixel --remodel3d --unity-mute --unity-qa-sandbox QA/current -screen-fullscreen 0 -nosound -screen-height 1080. QA/OUTPUT은 Mac 절대 경로다. 가시창·소리0, PC용 -force-d3d11/-popupwindow 사용0.
3. 1920: -review-width 1920 -screen-width 1920 -output OUTPUT/capture-current/1920. 다음3840: -review-width 3840 -screen-width 3840 -output OUTPUT/capture-current/3840. 실제PNG크기·fps·p95·프레임분포·자연입력영수증을 확인한다.
4. 평균60fps 이상·검격뒤사각면/망토낱픽셀 회귀0이면 정확한 source/package·측정조건과 함께 회신한다. 같은 입력의 기존 유효 시각근거는 재사용한다. 실패하면 원인수정 없이 재실행하지 않는다.

CTO가 unity/main을 fast-forward로 인수한다. 기본 rigpixel 전환은 이 단독 성능 PASS 뒤 별도 결정이다. 요청 문서·PC 컴파일·소스 병합을 Player/성능/사용자 실행본 전달 완료로 보고하지 않는다. 고정 빌드와 캡처만 사용하고 확인이 끝난 패키지는 정리한다.
