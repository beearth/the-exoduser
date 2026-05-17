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
- [ ] 런치 트레일러 제작
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
