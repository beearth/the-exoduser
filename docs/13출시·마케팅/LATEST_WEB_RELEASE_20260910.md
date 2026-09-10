# 최신 전체 변경 웹 배포 — 2026-09-10

> **대상 정정:** 아래 hell-smoky 배포는 사용자 서비스와 다른 프로젝트였다. 실제 서비스는 **the-exoduser.vercel.app**. [정정·복구 기록](PRODUCTION_TARGET_CORRECTION_20260910.md)을 우선한다.

사용자 지시: 최신 버전 전체 커밋·푸시·배포. 현 작업 디렉터리의 게임·로비·테스트·문서·영상 제작 결과를 커밋 대상으로 취합한다. 웹 서비스는 runtime manifest와 .vercelignore를 따른다. 제작 원본/검수 결과는 Git에 보존하고 런타임이 참조하는 파일만 정적 배포한다.

| 변경 | 검증 / 관련 기록 |
|---|---|
| Mac 화면 고정 금색 띠 | 최초 비교는 기본/1 ON이었으나 165113 스크린샷 확인 후 기본 OFF로 변경, ray=1만 진단 ON. [현행 계약](../12퍼포먼스·최적화/MAC_FIXED_RAY_ISOLATION_20260910.md). Mac 실기 해결 미확정 |
| 캐릭터 생성·시네마틱·동기화 | 현재 캐릭터 메타데이터 반영, 네메시스 인트로, 대사 스킵, 목록/삭제 동기화의 최신 변경 포함 |
| 저장 | cloudAutoSave 최신 회귀와 오류 재시도 검증 포함. 상세는 세이브 문서 |
| 영상 | v25 피해 숫자 제작 도구·기록 및 대검전사 편집 결과 보존 |
| 검증 | atmosRayIsolation, rendererOptIn, lightingTextureFreshness, characterIdentityIntro, characterSync, characterStoryCreation, characterStoryControls, cloudAutoSave, runtimePackaging 총66개 PASS |
| 배포 | 확정 Git commit에서 정적 파일을 추출·해시 검증 후 hell production 배포. 공개 파일·광선 플래그·실제 WebGL2 부팅 로그는 배포 후 확인 |

이 배포는 Mac에서 ray=0/1 동일 장면 비교를 가능하게 한다. Mac 세로 띠 소멸과 이동·전투·FPS 정상화는 아직 판정하지 않는다.

## 배포 기록

| 항목 | 결과 |
|---|---|
| 1차 확정 | c5d5b5f5f1dad1f584826bce5c22f3132b89bf70, main·작업 브랜치 푸시 완료 |
| 1차 공개 배포 | dpl_FgG5uM8aFjMrB4PGg7GFVmYHAtBA READY, hell-smoky.vercel.app 연결 |
| 공개 해시 | game=4d0c8b23124697a55af247017e1ffdd1405b502213b9002a697fc78bbb393b17, index=793e0129efefac363032f6e079f5d82a472386a310958cba618a2dcf438b3ebd, 고정 커밋과 일치 |
| 공개 브라우저 | Windows Chrome153, ray=0/1 각각 플래그0/1 및 ray-isolation 로그 확인, 양쪽 실제 WebGL2 컨텍스트·pageerror0. captures/renderer_optin_20260910/latest-ray-boot-report.json |
| 후속 최신 포함 | 배포 중 완료된160263fcb 검증 기록과 d4e9f7bd6의 warrior_story_v22_bgm.mp4·런타임 참조를 최종 배포에 추가. 전사 영상87,255,213바이트, 대사 구간 BGM ducking 포함 |
| 범위 | 렌더러·광선 비교 코드는 동일. 후속 배포는 시네마틱 BGM 변경 포함을 위한 것이며 Mac 해결 판정이 아님 |
