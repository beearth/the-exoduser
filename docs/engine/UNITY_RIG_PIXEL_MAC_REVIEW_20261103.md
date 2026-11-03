# 리깅 픽셀 14:25·19:00 수정 — Mac 검수 요청

대상 브랜치: codex/unity-rigpixel-20261103. 정확 SHA는 REPORT.md 첫 줄과 이번 커밋을 대조한다. 포함 공통은 cbdcbc2822e32bffdddf6da622ac1d071e8a9013이다. PC는 컴파일만 하며 정식 빌드·Player·최종 화면은 Mac 담당이다.

이전 22918886e의 실제 Mac 캡처는 qa/mac-captures-20261103의 qa/unity-rigpixel/22918886e/다. 1920 FPS121.7 / 3840 FPS75.1·실루엣은 확인됐으나, CTO가 망토 분리 픽셀·회청 갑옷·매끈한 흰 검격을 RETOUCH로 지정했다. 이번 수정의 합격 증거로 재사용하지 않는다.

| 변경 | 확인할 것 |
|---|---|
| 망토 | 1~2텍셀 분리 섬과 그 검은 테가0. 연결된 찢김 계단·얼굴·머리·칼끝은 보존 |
| 흑철 | 큰 갑옷 바탕은 중성 흑철, 실제 달/횃불의 넓고 제한된 금속 하이라이트. 늪 암부에서 실루엣이 묻히거나 플라스틱처럼 뜨면 FAIL |
| 검격 | 원본 시트·5레이어·Core 타이밍 유지. rigpixel만 영웅 RT와 같은 정수배 격자/Point/4단색/1픽셀 ink. 고해상도 흰 블러 띠·분리 잔점0, 탄막 가독성 회귀0 |

## 같은 패키지 실행 인자

Mac의 실제 소유 checkout과 승인 실행기를 사용한다. 아래 OUTPUT/QA는 Mac의 절대 경로로 정하고 고정 폴더를 덮어쓴다. PC의 exe나 -force-d3d11은 사용하지 않는다. 맵과 Core, 다른 소유 변경은 고치지 않는다.

1. Editor: Exoduser.CharacterLab.RigPixelVerification.Verify -output OUTPUT/editor-check.json. 네 셰이더·renderer·Humanoid true, 오류본문 RIGPIXEL_SHADER 로그. 이 검사는 Player 화면 판정이 아니다.
2. Mac build 1회: PortVerification.Build -output OUTPUT/build-current -receipt OUTPUT/build-receipt.json -remodel-scenes 1. 기존 build-current를 덮어쓰고 검수 뒤 패키지는 삭제한다.
3. 두 해상도 공통: --hero-render=rigpixel --remodel3d --unity-mute --unity-qa-sandbox QA/current -screen-fullscreen 0 -popupwindow -nosound -screen-height 1080. 가시창·소리·기존 앱 교체0, 실제 PNG 크기 확인.
4. 자연 입력/성능1920: --unity-rigpixel-natural -review-width 1920 -screen-width 1920 -output OUTPUT/capture-current/1920. 다음3840: -review-width 3840 -screen-width 3840 -output OUTPUT/capture-current/3840. 남길 것은 전체 1x와 늪/횃불 영웅·검격 3x 및 핵심 로그. 다른 자기 빌드/인코딩과 FPS측정을 겹치지 않는다.
5. 공격 동작: --unity-hero-review -review-width 1920 -screen-width 1920 -output OUTPUT/capture-current/motion. 대기·8방향·3타·회복·사망에서 망토 섬/칼끝/첫 접점/검격 격자를 본다. 제어 fixture이므로 자연전투로 보고하지 않는다. 기존 생성물은 덮어쓰고 선택한 증거만 남긴다.
6. 핵심 기능: --unity-m1-check -output OUTPUT/capture-current/m1. 같은 패키지의 로비→1-1/공격/드랍/보스/클리어/저장 기본 흐름과 사용자 세이브 격리 확인. 정상 exit와 실제 로그를 본다.
7. 영상은 선택한 실제 모션의 10초 무음본 한 개. 1x/3x에서 망토 낱픽셀/시간축 반짝임·검격의 결·발 미끄러짐을 직접 판단한다. 새로운 빌드/이전 영상 사본을 쌓지 않는다.

합격은 1920·3840의 낱픽셀0/흑철 LOCK/동일 픽셀 검격/60fps 회귀0다. 요청 문서나 PC 컴파일을 시각 PASS로 세지 않는다. 통합과 기본값 전환은 Mac PASS 후 CTO가 결정한다. 실패하면 같은 REPORT에 구체 화면·좌표·수정점을 회신한다. source SHA와 짧은 로그/판정 캡처만 보존하고 검수 완료 빌드는 지운다.
