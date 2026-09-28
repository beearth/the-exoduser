# HELL: EXODUSER — 데모 빌드 노트

> **2026-09-28 현행 `G:/exoduser` 공개 데모:** 아래의 `G:/hell-DEMO` 3슬롯 기록은 구 빌드 이력이다. 현재 `index.html`/`game.html`은 단일 `hellsave_demo` 브라우저 저장을 사용한다. 로그인 세션이 남아도 데모 로비는 `OFFLINE`·`대검전사` 캐릭터 정보 1개를 보여 주며(내부 슬롯명 `DEMO CHARACTER` 유지), 오른쪽 초상화는 CHAR_VISUALS[0].bust의 전사 이미지이며, 왼쪽은 `선대 소환체 · 묘왕 바르칸`과 영체 설명을 별도로 표시하고 저장된 레벨·처치수를 표시한다. 현행 저장 계약은 [세이브 구조](../../15%20세이브+데이터구조/15%20세이브+데이터구조.md)를 따른다.

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

> 본 버전은 **데모 버전**으로 Lv.1부터 Lv.100까지 1-1 스테이지만 체험하는 체험·데모·테스트 버전입니다.

## 현행 공개 데모 계약 (2026-09-21)

`?demo`와 `?bic`은 같은 공개 데모 범위를 사용한다. 신규 캐릭터는 Lv.1에서 시작하며, 경험치는 Lv.100에서 멈춘다. 1-1(`stage=0`)을 클리어하면 `#demoEnd`를 표시하고 1-2로 진행하지 않는다.

| id | 항목 | 코드 상수/위치 | 값 | 적용 시점 |
|---|---|---|---|---|
| DEMO-SCOPE-001 | 레벨 상한 | `game.html` `_DEMO_LV_CAP` | `100` | `addExp()` 진입 및 레벨업 루프 |
| DEMO-SCOPE-002 | 진행 범위 | `game.html` `_DEMO_LAST_STAGE` | `0` = 1-1 | `nextStage()`에서 1-1 클리어 직후 종료 |
| DEMO-SCOPE-003 | 진입 경로 | `?demo`, `?bic` | 동일한 Lv.1→Lv.100·1-1 | 공개 데모 부팅 |
| DEMO-SCOPE-004 | 로비 표시 | `index.html` `_LOBBY_VER_LIMITS.demo`/데모 캐릭터 카드 | `Lv.1 START · Stage 1-1 Only · Lv.100 Cap · 1~2h` | 데모 로비 |

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
