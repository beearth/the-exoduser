# 2026-05-20 작업 보고서

## 커서 시스템 대개편
- 커서 최대 크기 100% → **200%** (클램프 128→256)
- 기본 커서 사신낫 → **다크커서** (ChatGPT 이미지 기반)
- **다크 레드 / 다크 퍼플** 2종 커서 (Normal + Hover)
- CSS `cursor:pointer` → **다크 호버 커서** 자동 적용 (index.html + game.html)
- 구 canvas draw 커서 코드 262줄 삭제, 불필요 이미지 정리
- **커서 이미지 onload 시 자동 재적용** (로드 경쟁 해결)

## 로비 패드 네비게이션 전면 개편
- **모든 상호작용 요소** 패드 접근 가능 (캐릭터 슬롯, ENTER, Steam 위시리스트, 로그아웃, 시네마틱 다시보기)
- **ENTER 호버**: 패드 포커스 시 사운드 + 글로우 애니메이션 (`.gp-hover` 클래스)
- **Steam 위시리스트 호버**: 패드 포커스 시 글로우
- **우측 스틱**: 캐릭터 슬롯 스크롤 (휠처럼)
- **캐릭터 삭제**: X 버튼 → 커스텀 확인 모달 (브라우저 `confirm()` 제거)
- 삭제 확인 모달 패드 조작 (D-pad 좌우 + A/B)
- **캐릭터 선택 ≠ 입장**: PC와 동일하게 ENTER 버튼 별도 클릭 필요
- ENTER 사운드 2배 볼륨 (Web Audio API gain:2.0) + 패드 진동 최대 600ms

## 가상 키보드 (게임패드용)
- **한글 자동 조합 엔진** 구현 (초성+중성+종성, 복합 종성, 자모 단위 백스페이스)
- 한글 자모 + 복합 모음 + 영문 + 숫자 8행 배치
- 패드: D-pad 이동, A=입력, B=취소, X=백스페이스, Y=생성

## 인게임 패드 UI 확장
- **`_gpUINav` 셀렉터 대폭 확장**: `.inv-eq-slot`, `.gc-btn`, `.inv-storage-toggle`, `.cmp-close`, `label[cursor:pointer]`, `a[href]`, `[style*="cursor:pointer"]`
- **오버레이 목록 확장**: `victory`, `stageTransition` 추가
- **설정 패널**: A/B/X/Y + D-pad 설정 불가(고정 표시), LB/RB/Select/Start/L3/R3만 변경 가능
- 키바인딩 입력 대기 중 B=취소
- **인트로 가이드**: 패드 연결 시 자동으로 패드 버전 표시 (A/B/X/Y/LB/RB 등)
- `.gp-hover` 전역 패턴 정립 (docs 참조: `게임패드_호버_상호작용.md`)

## 로비 UI
- ENTER 버튼: 캐릭터 선택 전 **완전 투명** (`opacity:0`), 선택 후 페이드인
- 온라인 모드 자동 활성화 버그 수정 (로드 시 `btn.disabled=true` 유지)
- **시네마틱 다시보기** 버튼 추가 (로비 좌하단)
- 시네마틱 다시보기 시 비디오/자막/이미지/문 전부 초기화
- CLICK TO HELL 패드 핸들러 **break** 추가 (다른 핸들러 중복 실행 방지)

## BGM
- 장 BGM 소진 후 **전체 랜덤** 전환 (기존: 장+공용 혼합 → 변경: 전체 1~7장+gameplay 풀 랜덤)

## 시네마틱 연출 강화
- 모든 이미지 전환 시 **슬로우 줌** (4초, 1→1.08x)
- **화면 떨림 + 패드 진동** 4곳: 학살(img:4), 지옥추락(img:5), 탈출하라(img:7)
- `cinShake`, `cinShakeLight`, `cinZoomSlow`, `cinZoomIn` CSS 애니메이션 추가

## 1차 컷씬 연출 변경
- "탈출하라" 장면: 손가락 클로즈업(`08.png`) → 뒷모습(`09.png`, "또 보자 망자여") 분리
- 뒷모습 페이드아웃 제거 (다음 장면까지 유지)
- **컷씬 이미지 넘버링 정리**: 사용 순서대로 `00.png`~`20.png`
- **모든 shake 장면 패드 진동 동기화** (웃음 shake:2, 목마 shake:3, 탈출하라 shake:0.5, 디로이 "..." shake:3)
- `_cutVibDone` 플래그로 라인당 1회 진동 보장

## NW.js / Steam 환경
- **웹 버전 폐기**, NW.js 빌드만 취급 (2026-05-19 결정)
- `G:\hell`에 NW.js 런타임 설치 → `EXODUSER.exe` 직접 실행으로 테스트
- `.gitignore`에 NW.js 런타임 제외 (*.exe, *.dll, *.dat, *.pak, *.bin, locales/ 등)
- git 히스토리에서 대용량 파일 제거 (filter-branch)
- **SteamCMD 설치** + 빌드 업로드 스크립트 (`steam/steam_deploy.bat`, `steam/app_build_4749590.vdf`)
- Steamworks App ID: 4749590, 파트너 ID: 398693

## 번역 목록 추가 (2842~2849)
| No | 한국어 | English |
|----|--------|---------|
| 2842 | 다크 레드 | Dark Red |
| 2843 | 다크 퍼플 | Dark Purple |
| 2844 | 계정으로 입장하세요 | Sign in to enter |
| 2845 | 오프라인 모드 | Offline Mode |
| 2846 | A 버튼으로 계속 | Press A to continue |
| 2847 | A 버튼으로 시작 | Press A to start |
| 2848 | 고정 | Fixed |
| 2849 | ▶ 시네마틱 | ▶ Cinematic |

## 새 docs
- `docs/3.3 키바인딩+설정/게임패드_호버_상호작용.md` — 패드 호버 전체 리스트 + gp-hover 패턴

## TODO (다음 세션)
- [ ] 인게임 `_gpUINav` gp-hover 전역 적용 (모든 :hover에 .gp-hover 병기)
- [ ] xbow+holy 렌더 40ms 병목 최적화
- [ ] envVig 11.5ms 최적화
- [ ] drawP S7 전체 프로파일링
- [ ] 1차 컷씬에 제공된 네메시아 이미지 2장 적절한 위치에 활용
