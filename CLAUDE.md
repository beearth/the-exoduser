# CLAUDE.md — 지옥의 길 (Hell Road)

## PC 작업 공간·캐시·산출물 — 2026-10-29 22시 사용자 확정

- PC Unity 프로젝트·작업 폴더·`Library`·`DOTNET_CLI_HOME`·UPM 캐시는 **NTFS**다. `G:/exoduser-wt/codex-<역할>` 우선, 상태·소유·여유 공간을 확인한 E: 경로 차선이다. 사용자 메인 `G:/exoduser` 파일은 readonly이며 승인된 별도 `G:/exoduser-wt` 작업본은 쓰기 허용이다.
- H5·docs 작업본은 계속 `I:/exoduser-wt/codex-<역할>`, 모델·다운로드·원본 에셋 보관·빌드·캡처·로그·일반 렌더 캐시·임시 프로필은 `I:/EXODUSER-Storage/` 하위다. I:는 exFAT이며 위 Unity 작업·캐시는 두지 않는다. 이 22시 정정이 이전 Unity I: 기본값보다 우선한다.
- Unity는 필요한 `unity`·해당 `docs`·검수 도구만 sparse checkout한다. 소유·Git 연결·WIP·필수 입력 byte와 `.meta`를 확인해 필요한 범위만 인수하고, 원본은 `git show` 또는 정확한 파일로 대조한다. 웹 영상·음원·전체 에셋 복제는 하지 않으며 버전 관리할 에셋은 엔진별 자기 소스 작업본에 둔다.
- 기존 I: 작업본·에셋과 G:/E: 소스·세이브·타인 WIP·실행기를 보존한다. 이동 중인 폴더의 쓰기를 안전한 경계에서 멈추고 실제 목적지·복사 완료·Git 등록·INDEX/WORK 보존 확인 뒤 재개한다. 임의 이동·삭제·전체 복제·중복 복사·작업 중 sparse 축소를 하지 않는다.
- 실제 Unity 소스·캐시는 NTFS, 출력·보관은 I:인지 확인한다. Git 예외는 확인한 자기 정확 경로에 명령 범위로만 적용하고 전역/wildcard 신뢰를 늘리지 않는다. Mac 경로·독립 작업, 기존 실패 카운터·중단 이력·통합/배포 권한은 유지한다. 상세는 [빌드·백업 정책](docs/13출시·마케팅/BUILD_BACKUP_POLICY_20261001.md#2026-10-29-pc-저장-위치--i-기본값)을 따른다.

## 결과물 품질·재작업 책임 — 2026-10-29 사용자 재확정

- 모든 담당과 후속 세션은 착수 전에 [공통 품질 기준의 2026-10-29 실행 규칙](docs/0마스터플랜/AAA_QUALITY_STANDARD_20260927.md#2026-10-29-실행-규칙--시각-완성도와-재작업-책임)을 읽고 현재 작업에 적용한다.
- 실제 게임 시점의 구도·실루엣·재질·조명·접지·가독성·동작을 직접 검수한다. 모델 확보·재생·컴파일·테스트 PASS만으로 디자인 완료를 선언하지 않는다.
- 제작자는 수정·재검수까지 맡고 총괄은 같은 후보의 실제 화면·동작을 확인한다. RETOUCH는 구체 결함·수정 담당·다음 산출물을 남기고 개선을 계속한다. 문서·배정·병합을 결과물 완성으로 보고하지 않는다.
- 합격선은 공통 품질 기준의 `합격선 — 기준 샘플과 단계별 탈락 조건`을 따른다. 핵심 결함 하나라도 있으면 해당 범위 FAIL, 증거가 없으면 미검증이다. 부분 시안의 개선·RETOUCH를 게임용 아트 PASS로 올리지 않는다. 같은 방법의 두 후보가 같은 핵심 결함으로 연속 FAIL이면 제작 단계와 방법을 바꾼다.
- 기존 RETOUCH 통합 허용 정책과 품질 완료 판정은 별도다. 통합한 후보의 품질 결함을 숨기거나 디자인 PASS로 승격하지 않는다.
- 보스는 전체 디자인 리마스터·3D 리모델링이 주 범위다. 기존 보스 SSOT에 따라 모델·리깅·Animator·움직임·공격 템포·예고·VFX/SFX·등장/퇴장 연출·실게임 검수까지 진행한다. 개별 버그 수정으로 배정을 축소하지 않는다.

## Claude 모델 기준 — 2026-10-17 사용자 확정

- 현재 사용자 기준은 Opus 5.5이며 프로젝트의 재시작/다음 실행 기본 model은 `claude-opus-5-5`로 맞춘다.
- 이후 새 개발 단위 배정·기존 Claude 세션 재개 때는 실제 사용 가능한 최신 최상위 모델을 확인해 적용한다. 임의로 하위 모델로 낮추지 않는다.
- 현재 세션의 선택 모델과 재시작/다음 실행 기본값은 별도로 확인한다. 설정값만으로 실제 응답 모델 변경을 주장하지 않고 선택 표시와 가능한 새 응답의 model ID를 구분한다.
- 사용자 전역 메모리·인증·권한·호스트 설정은 Git에 넣지 않는다. 사용자 승인된 프로젝트 model-only 인계는 원작성자·원백업과 ENGINE의 새 백업/3way 통합을 구분하고 비model JSON값을 보존한다.

## 모델 라우팅 규칙

- **메인 세션에서 직접 처리**: 단순 버그픽스, 수치 조정, 단일 파일 수정
- **heavy 에이전트에 위임** (`.claude/agents/heavy.md`): 신규 시스템 구현, 다중 파일 리팩토링, 성능 최적화 작업

## 배포 전 필수 (절대 규칙)

**사용자가 요청한 배포 전 자기 소유 변경의 정상 통합을 확인한다:**
- tracked INDEX/WORK와 자기 소유 경로를 분리 확인하고 타인 WIP/untracked를 포함하지 않는다.
- `git add -A` 대신 정확한 소유 경로만 스테이징하고 코드+관련 docs를 정상 commit한다. 현재 원격 부모/expected SHA를 보존하여 force=false 또는 비강제 fast-forward로 반영한다.
- 원격 ref와 해당 배포의 실제 source 경로를 확인한다. 자기 소유 target이 정렬됐다는 사실을 전체 checkout clean·PC/Native/전체 최신게임 완료로 확대하지 않는다.
- 기존 사용자창·서버를 자동 재시작하지 않으며 Git 반영만으로 이미 열린 실행본이 갱신됐다고 보고하지 않는다. 기존 배포/HOLD/PC·Steam 승인 범위를 유지한다.

**DEMO/EA 동기화 (배포 시 반드시 함께):**
```bash
# game.html 동기화
cp G:/exoduser/game.html G:/exoduser-DEMO/game.html
cp G:/exoduser/game.html G:/exoduser-DEMO/gamedemo.html
cp G:/exoduser/game.html G:/exoduser-ea/game.html
# DEMO 폴더: _BIC=true, _DEMO_MODE=true, _DEMO_LV_CAP=100 강제 (game.html + gamedemo.html 둘 다)
for f in G:/exoduser-DEMO/game.html G:/exoduser-DEMO/gamedemo.html; do sed -i "s/const _BIC=location.search.includes('bic')/const _BIC=true/" "$f" && sed -i "s/_DEMO_MODE=_BIC||location.search.includes('demo')/_DEMO_MODE=true/" "$f" && sed -i "s/_DEMO_LV_CAP=_BIC?100:500/_DEMO_LV_CAP=100/" "$f"; done
# DEMO/EA 에셋 동기화 (sfx/img/assets/bgm/sprites 전체)
for d in sfx img assets bgm sprites; do cp -r "G:/exoduser/$d/"* "G:/exoduser-DEMO/$d/" 2>/dev/null; cp -r "G:/exoduser/$d/"* "G:/exoduser-ea/$d/" 2>/dev/null; done
# index.html 동기화
cp G:/exoduser/index.html G:/exoduser-ea/index.html
cp G:/exoduser/index.html G:/exoduser-DEMO/indexdemo.html
cp G:/exoduser/index.html G:/exoduser-DEMO/index.html
# _LOBBY_BUILD 버전별 설정 (복사 후 반드시 실행)
sed -i "s/_LOBBY_BUILD='full'/_LOBBY_BUILD='demo'/" G:/exoduser-DEMO/indexdemo.html
sed -i "s/_LOBBY_BUILD='full'/_LOBBY_BUILD='demo'/" G:/exoduser-DEMO/index.html
sed -i "s/_LOBBY_BUILD='full'/_LOBBY_BUILD='ea'/" G:/exoduser-ea/index.html
# lang/data 파일 동기화
for f in lang_*.js lobby_i18n.js maps_data.js; do cp "G:/exoduser/$f" "G:/exoduser-DEMO/$f" && cp "G:/exoduser/$f" "G:/exoduser-ea/$f"; done
```
- game.html, index.html, lang_*.js 중 **하나라도 수정하면** 위 명령 전부 실행
- DEMO의 메인은 `indexdemo.html` — `index.html`만 복사하면 반영 안 됨
- DEMO 폴더 `game.html`+`gamedemo.html` 둘 다 `_DEMO_MODE=true`, `_DEMO_LV_CAP=100` sed 강제
- 개발 중 버전 전환: `?bic` → BIC부스 데모(Lv100), `?demo` → 일반데모(Lv500), 파라미터 없음 → 정식
- **`_LOBBY_BUILD`**: DEMO=`'demo'`, EA=`'ea'`, 정식=`'full'` — 복사 후 반드시 sed로 변경

## 엔진별 버전 분리 (2026-10-27 사용자 확정)

- **H5(웹) = `main`**: game.html·index.html·lang·`engine/fdg`(웹 런타임, game.html이 import)·Steam/NW 빌드·공통 기획 docs.
- **Godot = `godot/main`** (동결, 607110d52). main에 `godot/`를 다시 넣지 않는다.
- **Unity = `unity/main`** (10-27 신설, 시작점 = `codex/unity-mac-20261024` 끝). 작업 브랜치 `claude/unity-pc-*`·`codex/unity-*`는 `unity/main`으로만 병합하고, main으로는 병합하지 않는다. `unity/main` 안의 웹 파일은 이식 대조용 사본이라 고치지 않는다. Codex는 10-27 `unity/main`으로 전환했다(Codex 커밋으로 확인). `codex/unity-mac-20261024`는 퇴역 — 새 커밋 금지. PC→Codex 공지(INBOX)는 main과 `unity/main` 두 곳에 올린다. Unity 이식 문서(`docs/engine/UNITY_*`, INBOX)는 main에 둔다.
- **Unity 리모델링 (2026-10-27 사용자 확정, 이식 단계 종료)**: 이식한 전투·시스템 Core(`unity/Assets/Exoduser/Runtime/Core`, 웹 원본 oracle 검증)는 그대로 쓰고 게임 규칙의 정답으로 삼는다. 표현은 Unity 도구로 새로 만든다: URP·Volume, Terrain·ProBuilder·NavMesh, Cinemachine, Timeline·Animator, VFX Graph·Shader Graph, Input System, Audio Mixer. 맵·보스는 웹을 따라 하지 않고 새로 설계한다. UI는 웹 그대로 유지한다.
- 엔진 코드를 커밋하기 전에 지금 브랜치가 그 엔진 줄기인지 확인한다. 상세·이력: `docs/0마스터플랜/REPO_SYNC_ENGINE_SPLIT_20261027.md`

## 총괄 자율 결정 (2026-10-27 사용자 확정)

- 게임 전체 레퍼런스·목표는 이미 정해져 있다(웹 = 기준, Hell Gothic 톤, 네온·만화풍 제거, 유니티 이식 = M1 "1-1 한 판 완주" 우선). 이 범위 안의 선택(다음 후보 순서, A/B안, 배정, 세션 증설)은 **각 총괄이 직접 결정하고 진행**한 뒤 결과만 보고한다. 사용자에게 고르라고 묻지 않는다.
- 사용자에게 묻는 것은 다음뿐이다: 기존 레퍼런스·목표에 없는 새 방향, 유료 크레딧 지출(Higgsfield 등), Steam Set Live·외부 게시·배포, 되돌릴 수 없는 삭제.
- 결정의 근거와 판정은 해당 SSOT 문서에 남긴다.

## 디스크 사용 (2026-10-29 22시 Unity NTFS 정정 우선)

- C 드라이브(시스템 SSD)에는 대용량 산출물을 두지 않는다. H5·docs 작업본은 I:, Unity 작업본·Library·DOTNET_CLI_HOME·UPM 캐시는 NTFS의 G: 우선·확인한 E: 차선이다. 빌드·캡처·다운로드·Playwright 프로필·덤프·로그·일반 렌더 캐시는 `I:\EXODUSER-Storage\` 하위에 둔다. 이전 `E:\exoduser-wt\_out` 대체 출력은 새 작업에 사용하지 않는다. 기존 작업본·사용자 메인 G: 소스·실행본은 보존하며 자동 이동하지 않는다.
- 백그라운드 명령에서 `python -`처럼 stdin을 기다리는 형태를 쓰지 않는다. stdin이 없으면 대화형 REPL이 오류를 무한 반복하며 디스크를 채운다(10-27 Temp 로그 162GB 사고). 스크립트는 파일로 넘긴다.
- Playwright·브라우저 임시 프로필은 쓰고 나면 지운다.

## 서버

```
cd G:\exoduser
& "C:\nvm4w\nodejs\node.exe" server.cjs
```
- 포트 3333, `/api/slots` 등 API 포함
- **python http.server 사용 금지** — API 404 남
- `node`를 그냥 치면 `C:\WINDOWS\system32\node`(깨진 shim)가 잡혀 실행 실패 → 반드시 `C:\nvm4w\nodejs\node.exe` 전체 경로 사용 (또는 `G:\NODE.JS\node.exe`)

## 기획 문서 (docs/ 폴더 30개)

### 마스터
| 폴더 | 내용 |
|---|---|
| `0마스터플랜/` | 마스터 바이블 v2.3 (~42000토큰, 부분 읽기) |

### 그래픽/비주얼
| 폴더 | 내용 |
|---|---|
| `1전체그래픽세팅/` | 환경 비주얼 14STEP + 아틀라스 + Tier |
| `5.0애니메이션파이프라인/` | PixelLab 워크플로우, 아틀라스 빌드 |
| `5.1임펙트디자인/` | VFX 임팩트 총정리 (.docx) |

### 게임 시스템
| 폴더 | 내용 |
|---|---|
| `2게임디자인레벨디자인/` | 레벨 디자인, 난이도 커브 |
| `2_1 스킬관리+합체시스템+자원/` | 스킬 슬롯, 합체 16종, 비용 공식 |
| `2_2 무기+활+속성시스템/` | 무기 7종, 활 5종, 속성 5종+상성 |
| `2_3 돌진+패링+방패시스템/` | 돌진/패링/방패/포이즈 (수정금지) |
| `2_4 펫시스템/` | 까마귀/고양이, 대사 |
| `2_5 부활+에너지쉴드시스템/` | 보스 본모습/구울, 신성력, 에너지쉴드 |
| `2_6 소환굴+리프트시스템/` | 소환굴 4등급, 리프트, 맵 파이프라인 |
| `2_7 인벤토리+장비시스템/` | INV 구조, 필터, 비교, 분해 |
| `2_8 퀵슬롯+물약시스템/` | QSLOTS, POT, 자동사용 |

### UI/UX
| 폴더 | 내용 |
|---|---|
| `3.1 ui hud 디자인/` | HUD 리디자인 + UI 2차정비 |
| `3.2메타·진행시스템/` | 영구 진행, 화폐, 강화 경제 |
| `3.3 키바인딩+설정/` | BINDS, OPT, FPS캡, Tier 프리셋 |

### 에셋/디자인
| 폴더 | 내용 |
|---|---|
| `4.0케릭터스프라이트 디자인/` | 플레이어 스프라이트 |
| `4.1맵디자인+설정/` | 7장 35에리어 MAP BIBLE + 맵오브젝트 + 타일맵에디터 |
| `6사운드디자인/` | SFX, BGM, 보이스 |
| `7아이템디자인/` | AFFIX 55종 아이템 시스템 완전판 |

### 몬스터/보스/AI
| 폴더 | 내용 |
|---|---|
| `8.0몬스터디자인/` | 몬스터 100종 데이터 |
| `8.1보스디자인바이블/` | 19보스 + BOSS_MOVES 49종 |
| `8.2레어몹디자인/` | 레어몹 10종 (etype 90~99) |
| `9적ai패턴디자인/` | AI 파이프라인 v3.1 |

### 기타
| 폴더 | 내용 |
|---|---|
| `10ai에셋프롬프트모음/` | PixelLab/ComfyUI/ElevenLabs 프롬프트 |
| `11내러티브·로어디자인/` | 세계관, 대사, 시네마틱 |
| `12퍼포먼스·최적화/` | Chrome 병목, Tier, 핫패스 규칙 |
| `13출시·마케팅/` | itch.io/Steam 전략 |
| `14밸런스+수치테이블/` | 스탯, 데미지 공식, 강화, 내구도 |
| `15 세이브+데이터구조/` | P/G/INV 직렬화, 마이그레이션 |
| `17게임아트팀/` | **아트 팀장 마스터(ART_TEAM_MASTER.md)** — 캐릭터 DESIGN LOCK 색인·제작 파이프라인·에셋 교체 현황·백로그·사고 기록 |

## 게임 시스템 기본 규칙

### 에너지쉴드 (eShield) — 추가 HP바 (2026-05-13 단순화)
- 쉴드 = HP와 동일한 추가 HP바, 색만 다름 (물리/마법 구분 없음)
- 모든 DR(기본DR + barrier + 조건부DR) 적용 후 쉴드→HP 순서로 분배
- 쉴드가 남아있는 한 HP는 절대 안 깎임
- 쉴드 일부 격파 시 오버플로우만 HP로 (추가 패널티 없음)
- DOT 제외. 단, `shieldHit:true` 플래그가 있으면 DOT도 쉴드 적용 (shockField 전류장판 등 마법 장판).
- 플레이어/몬스터 공통 (eShieldMax>0 조건).

### 기검참 (kiSlash) 콤보
- 7/7/7 균등 콤보 (`×7.0` 고정), _skMul(b:2.0) 곱해서 타당 실제 14×
- "7 7 7"은 _skMul 포함 최종값이 아니라 콤보 승수 — 최종은 14 14 14

## 참고 파일

| 파일 | 용도 |
|------|------|
| `game.html` | 현재 게임 코드 (메인) |
| `index.html` | 로비/시네마틱/캐릭터 선택 |
| `G:\exoduser-DEMO\` | NW.js 데모 빌드 (itch.io 무료 배포) |
| `G:\exoduser-ea\` | NW.js EA 빌드 (itch.io + Steam EA) |

## 작업 규칙

> **2중 법칙**: 이 파일(CLAUDE.md)과 메모리(`MEMORY.md`)는 상호 보완한다. 작업 시작 시 **둘 다** 확인할 것. CLAUDE.md에 없는 규칙이 메모리에 있고, 메모리에 없는 규칙이 CLAUDE.md에 있다.

### 작업물 퀄리티·디자인 (최우선 — 절대 규칙)

**"동작한다"는 완료가 아니다. 게임에 어울리는 퀄리티까지가 완료다.** 모든 작업물(UI·HUD·텍스트·VFX·에셋·문서)은 이 게임의 톤에 맞춰 최선을 다해 만든다. 사용자가 매번 말하지 않아도 기본값이다.

1. **착수 전 디자인 언어 확인** — 화면에 보이는 것을 만들기 전에 반드시 읽는다:
   - `docs/3.1 ui hud 디자인/UI_FOUNDATION_20260924.md` (Hell Gothic: 흑철·악마 뿔/날개·붉은 지옥불·뼈색 문자)
   - `docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md` (프레임·제목판·버튼·슬롯 마감 최신 계약)
   - 같은 화면에 이미 있는 비슷한 요소(예: 구역 제목 `#areaTitle`, 스테이지 클리어 패널, 레벨업 연출)의 CSS를 그대로 기준으로 삼는다.
2. **폰트** — 게임 토큰만 쓴다: 본문·표기 `var(--font-hell)`(나눔명조 계열), 제목·숫자·영문 `var(--font-hell-title)` / `'Cinzel'`, 강조 `var(--font-display)`. 기본 산세리프(`Noto Sans KR` 단독)·시스템 폰트로 새 게임 UI를 만들지 않는다.
3. **색·장식** — 뼈색 문자(#dfd6c2 계열)·금빛 헤어라인(rgba(164,147,115,.5))·흑철 반투명 배경·붉은 지옥불 포인트. 원색 초록/노랑 텍스트, 기본 알림 스타일 재사용으로 때우지 않는다. 이모지(⏱⭐🏆🔒 등)를 게임 UI 아이콘 대용으로 쓰지 않는다 — 벡터/에셋 아이콘 또는 텍스트 장식으로.
4. **캔버스 텍스트** — GPU 프록시(`X`)에서는 `strokeText`가 GL층 위 별도 캔버스에 그려져 fill을 덮는다. 외곽선은 fillText 오프셋 방식으로.
5. **검수는 눈으로** — 테스트 PASS·pageerror 0은 필요조건일 뿐이다. 반드시 실제 게임 화면 스크린샷(1600×900 / 1920×1080, 1x 크기 확대 크롭 포함)을 직접 보고 "이 게임의 기존 UI 옆에 놓아도 같은 게임처럼 보이는가"를 판정한다. 어울리지 않으면 완료 보고하지 않는다.
6. **완료 보고 기준** — 기능 동작 + 디자인 톤 일치 + 가독성(1x 실크기) 세 가지를 모두 확인한 뒤에만 "완료". 디자인 미확인이면 "기능만 완료, 디자인 미검수"라고 명시한다.
7. **캐릭터 디자인·디테일 통일 (중요)** — 같은 캐릭터는 모든 이미지에서 얼굴 문양(문신처럼 같은 모양·위치)·장신구·갑옷·머리가 동일해야 한다. 생성 전 캐릭터별 DESIGN LOCK 문서를 읽고 고정 사양을 프롬프트에 그대로 넣는다. 예: 네메시아 = `docs/11내러티브·로어디자인/NEMESIA_DESIGN_LOCK.md`.
8. **AI 이미지에 점(잔점·점묘·디더링·반짝이 점) 절대 금지** — 머리카락·갑옷·피부 어디에도. 레퍼런스는 블러로 뭉개 구도만 전달하고, 결과는 1x 확대로 점 유무를 확인한 뒤에만 채택한다.
9. **이미지 생성 기본 서비스 = MagicLight Toolbox (2026-09-30 최신 사용자 지시)** — 포인트가 소진되거나 요청 비용에 부족할 때까지 `https://magiclight.ai/toolbox/`를 먼저 사용한다. 맵 오브젝트·배경·텍스처·지형 패치·일반 물체/아이템은 Seedream 5.0 Pro를 우선 시험한다. 디자인 LOCK 캐릭터·스토리 소품은 해당 서비스에서 적합한 GPT 이미지 모델을 확인해 사용한다. MagicLight 잔액 부족이 실제 확인되면 연결된 Higgsfield 모델로 전환한다. 절차·프롬프트 골격·키잉·검수: `docs/4.1맵디자인+설정/MAP_OBJECT_SEEDREAM_PIPELINE_20260930.md`, 서비스 우선순위: `docs/10ai에셋프롬프트모음/IMAGE_PROVIDER_PRIORITY_20260925.md`.

### Steam 업데이트 규칙 (2026-10-09 사용자 확정)

매일 오전 9시, 하루 최대 1회. 버전은 `release-version.json` 단일 기준(PATCH +1/일), 패치노트 `docs/13출시·마케팅/patch_notes/v<버전>.md`(한·영) 필수, 커밋된 HEAD로 빌드, Set Live·Steam 패치노트 게시는 사용자 확인 후. 상세: `docs/13출시·마케팅/STEAM_UPDATE_RULES.md`

### 원격 브라우저 작업 = Mac (2026-10-04 사용자 지시)

- Claude in Chrome 등 **모든 원격 브라우저 작업은 Mac Chrome "Browser 2"**(macOS로 표시된 브라우저. deviceId는 재연결 때 바뀔 수 있음)로 한다. 상시 켜져 있으므로 브라우저 선택을 묻지 말고 바로 선택.
- Windows 로컬 파일(scratchpad 등)도 `file_upload`로 Mac 브라우저에 업로드된다(확인됨).
- 사이트 로그인이 풀려 있으면 사용자에게 Mac에서 직접 로그인 요청(대리 로그인 금지).

### docs/ 동기화 (최우선 — 절대 규칙)

docs/는 게임과 완전 동기화된 진실 공급원(source of truth)이다. **토씨 하나 틀리면 안 된다.** docs에 적힌 수치와 게임 코드의 수치가 1이라도 다르면 즉시 수정해야 한다.

1. **모든 코드 변경 후** `Grep`으로 docs/ 전체에서 관련 키워드 검색 — 예외 없음
2. **매칭되는 문서의 수치·공식·이름·상수를 현재 코드값과 100% 일치시킬 것**
3. 변경 범위 (전부 해당):
   - 이름 변경 (방패→견갑 등)
   - 배율/공식 변경 (데미지, 비용, 쿨다운, 사거리, 지속시간 등)
   - 시스템 추가/삭제/구조 변경
   - 어픽스/스킬/아이템/몬스터 추가·삭제·수정
   - 구현 상태 변경 (미구현→구현, 삭제 등)
   - 상수값, 티어, 확률, 프레임 수 등 모든 숫자
4. **테이블 형태로 꼼꼼하게 정리** — id, 한글명, 수치, 슬롯, 적용 위치, 공식 등 항목별
5. **빠짐없이** — 사소한 수치 하나, 변수명 하나라도 바뀌면 docs에 반영
6. **커밋에 docs 변경 반드시 포함** — 코드만 커밋하고 docs 빼먹으면 안 됨
7. **docs에 없는 정보 발견 시 즉시 추가** — docs가 불완전하면 보충
8. **보충사항·정리·기획·계획도 기록** — 작업 중 발견한 설계 의도, 밸런스 근거, 구현 계획, 시스템 간 관계, 미구현 목록, TODO 등도 해당 docs 폴더에 기록. docs는 단순 수치 나열이 아니라 왜 그렇게 됐는지, 앞으로 뭘 할 건지까지 담아야 한다

### DOM 조작 안전 규칙 (절대 준수)

1. **`textContent`/`innerHTML`로 부모 컨테이너 내용 교체 금지** — 자식 노드가 전부 날아감
2. **`querySelectorAll('div')` 같은 광범위 선택자로 `textContent` 설정 금지**
3. **`textContent` 교체 대상은 반드시 리프 노드(`d.children.length === 0`)만** — 또는 특정 `id`/`class`로 직접 선택
4. 자식 노드 수 확인 없이 `textContent` 교체하면 하위 DOM 트리 전체가 파괴됨

### 작업별 필수 문서 (읽기 + 쓰기)

코딩 **전**에 읽고, 코딩 **후**에 쓴다. 빠짐없이.

| 작업 | 코딩 전 읽을 docs | 코딩 후 갱신할 docs |
|---|---|---|
| 스킬 추가/수정 | `2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md` | 같은 문서 (스킬 테이블, 슬롯, 비용) + `14밸런스+수치테이블/스킬별_DPS_자원소비표.md` |
| 합체 추가/수정 | 위 문서의 **"합체 추가 시 수정 체크리스트"** + **"성급 규칙"** | 같은 문서 (합체 목록, 성급, 흡수 테이블, 등록 목록) |
| 추천빌드 수정 | `2_1 스킬관리+합체시스템+자원/추천빌드_SKILL_REC_PATH.md` | 같은 문서 (단계별 대조표) |
| 밸런스/수치 변경 | `14밸런스+수치테이블/` | 같은 폴더 내 해당 표 |
| 몬스터 추가/수정 | `8.0몬스터디자인/` | 같은 문서 (몬스터 테이블) |
| 보스 추가/수정 | `8.1보스디자인바이블/` | 같은 문서 (보스 무브셋, HP 등) |
| 아이템/어픽스 수정 | `7아이템디자인/` | 같은 문서 (어픽스 테이블, 슬롯) |
| 맵/레벨 수정 | `4.1맵디자인+설정/` | 같은 문서 (에리어, 오브젝트) |
| UI/HUD 수정 | `3.1 ui hud 디자인/` | 같은 문서 |
| VFX/임팩트 수정 | `5.1임펙트디자인/` | 같은 문서 |
| 사운드 추가/수정 | `6사운드디자인/` | 같은 문서 |
| 무기/활/속성 수정 | `2_2 무기+활+속성시스템/` | 같은 문서 |
| 돌진/패링/방패 수정 | `2_3 돌진+패링+방패시스템/` (수정금지) | — |
| 인벤토리/장비 수정 | `2_7 인벤토리+장비시스템/` | 같은 문서 |
| 세이브/데이터 수정 | `15 세이브+데이터구조/` | 같은 문서 (직렬화, 마이그레이션) |
| AI 이미지 생성·교체 (컷신·로딩·캐릭터·맵 오브젝트) | `17게임아트팀/ART_TEAM_MASTER.md` + 해당 캐릭터 DESIGN LOCK | 같은 문서 (현황표·로그·백로그) |

### 번역·다국어 작업 규칙 (절대 준수)

번역 작업은 아래 순서를 반드시 지킨다. **절차를 건너뛰면 누락이 생긴다.**

1. **전수조사 먼저** — 코드에서 번역 대상 문자열 전체를 추출, 목록에 없는 항목을 찾아낸다
2. **리스트 완성 먼저** — `docs/16번역·로컬라이제이션/번역대상_전체목록.md`에 No. 넘버링하여 추가
3. **하나씩 순서대로** — 넘버링 순으로 한 항목씩 번역, 임의로 묶거나 건너뛰지 않는다
4. **100% 완료 후 검수** — 모든 항목 처리 후 전체를 한 번 더 대조 검수
5. **lang 파일 전파** — _EN 추가 시 26개 lang_*.js 전체에 동일하게 전파
6. **docs 상태 갱신** — 작업 완료 후 전체목록.md, 번역_가이드.md 상태 업데이트

> **규칙**: 번역 전 리스트가 없으면 작업 시작 금지. 리스트가 불완전하면 보완 후 시작.

> **절대 규칙 — 텍스트 추가 시**: 게임에 표시되는 텍스트를 **단 하나라도 추가하면** 반드시 `번역대상_전체목록.md`에 넘버링하여 등록해야 한다. _EN 추가와 동시에 목록 등록. 누락 금지.

### 버그/문제 해결

- 해당 시스템의 docs 폴더를 **1차 레퍼런스**로 읽고, 설계 의도·공식·제약조건을 파악한 뒤 해결책을 찾을 것
- docs에 없는 정보면 코드 조사 후 docs에 추가

### 동시 세션 / git commit ownership (auto-sync cron 주의)

> **배경**: `auto-sync cron`이 주기적으로 `git add -A` + `commit "auto: session sync"` + push를 실행한다. 여러 세션이 동시에 working-tree를 편집하면 **한 세션의 변경이 다른 세션의 파일과 같은 commit에 흡수**된다. 실제 사고: `ae7eaf82`에 Track D1(perf) 변경과 boss3d 타세션 파일이 번들됨 (docs/PERF_MAC_CHROME_AUDIT.md §git provenance).

1. **작업별 commit ownership 분리** — 가능하면 세션마다 **별도 branch 또는 worktree**에서 작업. 한 세션 = 한 논리적 변경 집합.
2. **커밋은 경로 지정 스테이징** — `git add -A` 금지. 정확한 자기 소유 경로만 `git add --`로 스테이징하고 코드+관련 docs를 한 논리 단위로 정상 commit한다.
3. **타세션 파일 불간섭** — 무관한 타인 WIP는 읽기/쓰기/stage하지 않는다. 사용자가 정확히 승인하고 담당자가 인계한 변경만 원작성자·원백업·자기 fresh backup/3way를 구분해 통합한다. 전체 설정 복사나 다른 키 덮어쓰기는 하지 않는다.
4. **history rewrite 금지** — 이미 push된 commit이 잘못 번들돼도 `reset`/`rebase`/force-push로 재작성하지 말 것. **provenance note**(해당 docs)로 사실만 기록.
5. **auto-sync 흡수 시** — 내 변경이 `auto: session sync`에 흡수됐으면, 재분리 시도(soft reset 등)보다 **provenance note 기록**을 우선. `git reset`은 권한 게이트라 거부될 수 있음.
6. **동시성 회피 최선책** — 장시간·다파일 작업은 `git worktree add`로 격리(예: `affix-phase1` 워크트리 관례). 메인 working-tree 공유를 줄인다.
