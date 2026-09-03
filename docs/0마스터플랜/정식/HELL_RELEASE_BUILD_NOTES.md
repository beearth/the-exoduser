# HELL: EXODUSER — 정식 출시 빌드 노트

작성일: 2026.05.18 | 상태: 미출시 (계획)

---

## 빌드 정의

| 항목 | 값 |
|---|---|
| 배포 플랫폼 | Steam + itch.io (유료) |
| 진입 파일 | index.html → game.html |
| 세이브 | Supabase 클라우드 (로컬 fallback) |
| 레벨 캡 | 없음 (전체 해제) |
| 스테이지 | 전체 7챕터 35에리어 |
| 로그인 | Google OAuth (Supabase) |
| 가격 | 미정 |
| 버전 | v1.0.0 (미정) |

## 버전 설명 문구 (로비 내 표시)

> 없음 — 정식 버전은 별도 버전 안내 문구 없음.

## 제한 코드

- `_BUILD_TIER='release'` (예정)
- 데모/EA 제한 상수 전부 제거
- `_DEMO_LV_CAP`, `_DEMO_LAST_STAGE`, `_EA_LAST_STAGE` 등 미사용

## 출시 전 필수 완료 항목 (백로그)

- [ ] 전체 7챕터 35에리어 맵 완성
- [ ] 몬스터 100종 구현
- [ ] 보스 19종 구현
- [ ] 아이템/어픽스 55종 구현
- [ ] 스킬 합체 16종 구현
- [ ] Steam Steamworks SDK 연동
- [ ] 리더보드 / 업적
- [ ] 세이브 클라우드 동기화 (Steam Cloud)
- [x] Steam 런치 트레일러 제작 — 2026-09-02 현행 보스 가시성 수정 마스터 60.8초 (`captures/trailer_steam_bossfix_20260902/EXODUSER_STEAM_TRAILER_BOSSFIX_20260902.mp4`). 16:9 1920×1080, 60fps H.264 High 17.301Mbps/AAC 48kHz, 첫 7.7초 gameplay-first. 신규 API v2 타이틀/CTA, 스킬·패링·전대·크라켄 피격 폭발/10분열·화마귀·CH3와 다크드루이드 560px/흑요염 파괴자 620px/벌레 여왕 500px 전신 보스전을 포함한다. 드루이드는 게임 실적용 `boss_dark_druid_walk.png` 4×8 시트의 방향별 유휴 프레임을 사용하고 구형 `boss_dark_druid_f0.png`는 제외한다. 신성폭발·검은별 입력 0, 보스 5컷 pageerror/404 0, blackdetect 이상 구간 0, 트레일러 테스트 19/19 및 접촉시트 육안 PASS. 보스 본체가 누락된 직전 리메이크·이전 64.1초본·V3 기반 가로본·세로본은 Steam 납품 제외. 배포 전 BGM 권리 확인 필요.
- [ ] itch.io / Steam 페이지 완성

## 배포 명령 (예정)

```bat
butler push "G:\hell-release" beearth/exoduser:windows --userversion 1.0.0
```

```
steam depot upload ...
```

---

문서 끝. FDG (FOR DEAR GAMERS).
