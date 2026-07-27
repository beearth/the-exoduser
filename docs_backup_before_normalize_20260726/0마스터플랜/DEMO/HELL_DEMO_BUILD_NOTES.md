# HELL: EXODUSER — 데모 빌드 노트

작성일: 2026.05.18 | 대상 폴더: G:\hell-DEMO\
배포: itch.io 무료 · beearth/exoduser:windows-demo

---

## 빌드 정의

| 항목 | 값 |
|---|---|
| 폴더 | G:\hell-DEMO\ |
| 진입 파일 | indexdemo.html → gamedemo.html |
| 세이브 | localStorage `hellsave_demo_0~2` (3슬롯) |
| 레벨 캡 | 100 (`_DEMO_LV_CAP=100`) |
| 스테이지 | 1-1만 (`_DEMO_LAST_STAGE=0`) |
| 로그인 | 없음 |
| 가격 | 무료 |
| 버전 | v0.1-demo |

## 버전 설명 문구 (로비 내 표시)

> 본 버전은 **데모 버전**으로 LV100 · 1-1 스테이지만 체험하는 체험·데모·테스트 버전입니다.

## 세이브 구조

- 슬롯 3개: `hellsave_demo_0`, `hellsave_demo_1`, `hellsave_demo_2`
- 구버전 마이그레이션: `hellsave_demo` → `hellsave_demo_0` (IIFE, 0번 비어있을 때만)

## 제한 코드 위치 (gamedemo.html)

| 제한 | 상수/조건 |
|---|---|
| 레벨 캡 | `_DEMO_LV_CAP=100` + `_BUILD_TIER==='demo'` |
| 스테이지 제한 | `_DEMO_LAST_STAGE=0` + demoEnd 화면 |
| 합체 제한 | `_DEMO_FUSE_ALLOWED` (현재 전부 허용) |
| 어픽스 제한 | `_DEMO_AFFIX_BANNED` (현재 전부 허용) |

## 배포 명령

```bat
butler push "G:\hell-DEMO" beearth/exoduser:windows-demo --userversion 0.1.0
```

## 완료된 작업 이력

| 일자 | 작업 |
|---|---|
| 2026.05.16 | 데모 풀 로비 + 3슬롯 세이브 시스템 구축 |
| 2026.05.16 | hellsave_demo → hellsave_demo_0 마이그레이션 |
| 2026.05.18 | 로비 버전 설명 텍스트 추가 |

---

문서 끝. FDG (FOR DEAR GAMERS).
