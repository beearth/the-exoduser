# 전사 실시간 리깅 픽셀 렌더 — 2026-11-03

현재 상태: 전사 opt-in 구현·검수 진행. 게임용 아트/60fps/공통/Desktop은 아직 미검증이다. 최신 실행 영수증은 I:/EXODUSER-Storage/codex-takeover/rig-pixel/REPORT.md.

| 계약 | 코드·수치 |
|---|---|
| 모드 | 기본 sprite 유지. --hero-render=rigpixel 또는 --hero-render rigpixel. 마지막 명시 인자 우선, 부분 일치 없음. 통과 전 기본값 변경 없음 |
| 입력·모션 | 기존 Resources/Characters/Warrior R7, NativeHeroView.Sync → NativeHeroMotion 90 → CapeSpring 100 → NativeRigPixelHero 1000. Core/루트모션/판정/세이브 코드 변경0 |
| 격리·광원 | 기존 모델 layer30만 정사영 RT에 렌더. 최종 메인 카메라에서는30 제외. 원래 전사 전용 fill/rim은 끄고 같은 월드 위치에서 장면 달빛/캠프 실제광을 셀 셰이더에 적용 |
| RT | ARGB32 Linear, depth24, AA1, Point, Clamp, mip 없음, HDR/후처리 없음. URP17.6 SingleCameraRequest. 정사영 near .05/far24, 카메라 후퇴8u |
| 크기·정수배 | n=max(1,floor(camera.pixelHeight/1080)). 1920/3840×1080 n1. canvas=ceil(5.6/(worldUnitsPerPixel×n)/32)×32, 최소64/최대1024. 범위를 넘기면 기존 sprite 폴백. orthoSize=canvas×worldUnitsPerPixel×n/2 |
| 기준선 | Core가 정한 기존 hero root를 원점으로 사용. 캡처 중심은 view.up×round(.65/(wpp×n))×wpp×n. 최종 발밑은 NativeHd2D.SnapAnchor, 텍셀1개가 화면정수n픽셀. 맵 NativeHd2D/Remodel3D writer 변경0 |
| 명암·테 | floor(saturate(NdotL)×3+.5)/3의4단 셀 명암. normal/specular 디테일 미사용, albedo mip bias1.5. 달빛 향한 한쪽 edge만. 최종 알파 바깥 4이웃1텍셀 검은 외곽선. 디더링/그레인/노이즈 추가0 |
| 접지 | HD2DContact 셰이더의 별도 .62×.36u 지면 quad, 지면오프셋 .018u. 기존 스프라이트는 RT 첫 성공 뒤에만 숨김. 리소스/투영/렌더 실패 시 모델 숨김+sprite 폴백, 오류1회 |
| 수명 | RT는32텍셀 canvas 구간이 바뀔 때만 재생성. 종료 시 RT·자기 재질 해제와 자신이 바꾼 layer30 카메라 비트만 복원 |
| 제어 동작 검수 | --unity-hero-review --hero-render=rigpixel -review-width 1920 또는3840. 높이1080, 12개 구간 1156틱/2틱당PNG. 기존 fixture 유지하되 rigpixel의 방향 구간은 실제8방향 이동, 공격·피격·사망은 기존 제어 fixture. OS손조작/자연사망 증거가 아님 |
| 일반 입력/성능 | --unity-rigpixel-natural --hero-render=rigpixel -review-width 1920/3840. 실제 일반 FixedUpdate·가상InputSystem, AI/소환/충돌/HP 유지, 12초 중 첫2초 워밍업 제외. screenshot 인코딩 시간만 별도 제외하고 긴 프레임은 포함. 평균fps≥60, Core≥500틱, 이동>100px, 최종앵커≤.71px, 실제RT성공 확인. OS손조작 아님 |
| 비교·합격 | 같은 EXE M1, 1920/3840 실제 Player, 전사3x·10초 무음영상·NRFTW/기존C10 나란히. 발미끄러짐/모자이크/관통/실루엣/점/60fps 핵심FAIL이면 미채택. Editor/정책 테스트로 PASS 선언 금지 |

정책 테스트는 I:/EXODUSER-Storage/codex-takeover/rig-pixel/tests/run.ps1: 첫 RED policy 없음, GREEN23/23. Unity 첫 UPM 실패는 자식 ProgramData 환경 보완으로 해결; 64de26cf에서 실제 리그 Humanoid=true, renderer=false/shaders=false의 RED를 확인했다. 같은 검사 중 USER_SAVE changed3이 관측돼 정상 게이트 통과로 세지 않는다. 사용자 세이브를 수정/복원하지 않는다. 이후 실제 실행·시각 판정은 REPORT에 이어 기록한다.
