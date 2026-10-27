# 스팀 앱 버그 진단·포트 수정 세션 인계 — 2026-10-26

- 세션: PC Claude Opus 5.5 / 역할: Steam판 "자꾸 안 됨" 진단 → node-main 포트 바인딩 수정
- SSOT: `docs/13출시·마케팅/NW_PORT_BINDING_FIX_20261026.md` (원인·수정·포트 표·검증·배포 반영)
- 관련: `docs/13출시·마케팅/STEAM_UPDATE_RULES.md`, `G:\exoduser-steam\state\daily_release_*.md`, 메모리 `steam-build-port-3333-conflict.md`·`steam-steampipe-setup.md`

## 진단 결론 (사용자에게 보고 완료)
1. 10/10~10/22에 올린 BuildID 7개(25842101 … 26120761, v0.7.0~0.7.7)가 **하나도 Set Live되지 않음** → Steam default는 아직 25482996(9/24). 설치본(`E:\steam\…\EXODUSER HELL LORD`)도 그 빌드.
2. 25482996은 본편인데 데모 모드(`?demo=1`, `_LOBBY_BUILD='demo'`, Lv100)이고 포트 3333이다. 개발 PC에서는 `server.cjs`가 `[::]:3333`을 잡고 있어 Steam 창에 **개발 작업트리 화면**이 뜬다.
3. 10/23·24·26 배포가 없던 것은 "v0.7.7 이후 커밋 0" 규칙대로 건너뛴 것이다(버그 아님). 10/19는 merge가 진행 중이라 커밋에 실패했다.

## 완료한 작업 단위
- 커밋 `10ce8d7ba` (main 로컬, 12파일): node-main 127.0.0.1+::1 동시 바인딩, fallback(full 3360~3390 / demo 3361~3391), 시작 페이지 `nw-boot.html`(29개 언어 실패 안내), release-target·build-nwjs·package.json·테스트·docs 5종·번역목록 No.3338~3340.
- 검증: 단위 6/6, 실제 NW.js 0.111.2 충돌 시나리오 5종, 실패 화면 4개 언어 캡처 직접 확인.

## 남은 일 / 대기
- **push 안 함**: 로컬 main이 origin과 갈라짐(로컬 +10, 원격 +126). 병합 판단은 사용자 몫. 9시 배포는 로컬 HEAD를 빌드하므로 push 없이도 반영된다.
- 10/27 09:00 `EXODUSER_DailySteamRelease`가 v0.7.8을 빌드·업로드할 예정(이 커밋 포함). 결과 로그: `G:\exoduser-steam\logs\daily_release_20261027-*.log`.
- 사용자: 새 BuildID를 Steamworks default에 Set Live(https://partner.steamgames.com/apps/builds/4749590). 그 뒤 Steam 설치본을 실제로 확인한다.
- 미조치: Supabase Redirect URL에 3360~3390 추가(fallback 포트에서 OAuth를 쓸 때만 필요).

## 주의
- `test/`·`tests/`는 I: 보관소 링크라 테스트는 `node --preserve-symlinks --preserve-symlinks-main --test test/releaseTarget.test.js`로 돌린다.
- 번역 목록 `docs/16번역·로컬라이제이션/번역대상_전체목록.md`에는 다른 세션의 미커밋 WIP가 있다(상점 미디어 절). 이번에는 HEAD+추가분만 커밋했다.
- 실행 중인 개발 서버(3333)와 Steam 게임은 종료하지 않는다.

## 재개 후 첫 행동
1. 10/27 09:00 이후 위 로그를 보고 v0.7.8 BuildID와 성공 여부를 확인한다.
2. 사용자가 Set Live하면 설치본 `package.nw/package.json`의 main이 `nw-boot.html`인지, `oauth-debug.log`의 바인딩 줄을 확인한다.
