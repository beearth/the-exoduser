# 최신 전체 변경 웹 배포 — 2026-09-10

사용자 지시: 최신 버전 전체 커밋·푸시·배포. 현 작업 디렉터리의 게임·로비·테스트·문서·영상 제작 결과를 커밋 대상으로 취합한다. 웹 서비스는 runtime manifest와 .vercelignore를 따른다. 제작 원본/검수 결과는 Git에 보존하고 런타임이 참조하는 파일만 정적 배포한다.

| 변경 | 검증 / 관련 기록 |
|---|---|
| Mac 화면 고정 금색 띠 | ray=0 광선 단독 OFF 비교 추가, 기본/1 ON. [조사 기록](../12퍼포먼스·최적화/MAC_FIXED_RAY_ISOLATION_20260910.md). 원인·실기 해결 미확정 |
| 캐릭터 생성·시네마틱·동기화 | 현재 캐릭터 메타데이터 반영, 네메시스 인트로, 대사 스킵, 목록/삭제 동기화의 최신 변경 포함 |
| 저장 | cloudAutoSave 최신 회귀와 오류 재시도 검증 포함. 상세는 세이브 문서 |
| 영상 | v25 피해 숫자 제작 도구·기록 및 대검전사 편집 결과 보존 |
| 검증 | atmosRayIsolation, rendererOptIn, lightingTextureFreshness, characterIdentityIntro, characterSync, characterStoryCreation, characterStoryControls, cloudAutoSave, runtimePackaging 총66개 PASS |
| 배포 | 확정 Git commit에서 정적 파일을 추출·해시 검증 후 hell production 배포. 공개 파일·광선 플래그·실제 WebGL2 부팅 로그는 배포 후 확인 |

이 배포는 Mac에서 ray=0/1 동일 장면 비교를 가능하게 한다. Mac 세로 띠 소멸과 이동·전투·FPS 정상화는 아직 판정하지 않는다.
