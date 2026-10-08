# CLAUDE.md — 지옥의 길 (Hell Road)

## 모델 라우팅 규칙

- **메인 세션에서 직접 처리**: 단순 버그픽스, 수치 조정, 단일 파일 수정
- **heavy 에이전트에 위임** (`.claude/agents/heavy.md`): 신규 시스템 구현, 다중 파일 리팩토링, 성능 최적화 작업

## 배포 전 필수 (절대 규칙)

**Vercel 배포 전 반드시 커밋+푸시 확인:**
```
git add -A && git status && git push origin main
```
- 배포 요청 시 **자동으로 위 명령 실행** — 수동 확인 필수
- working tree clean + push 완료 확인 후에만 배포 진행
- 안 하면 구버전이 배포됨

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
2. **커밋은 경로 지정 스테이징** — `git add -A` 금지, 반드시 `git add <내 파일들>`로 **내 변경만** 스테이징 후 즉시 `git commit`. auto-sync가 흡수하기 전에 선점.
3. **타세션 파일 불간섭** — 다른 세션이 수정 중인 파일(working-tree의 M/??)은 **읽지도 쓰지도 스테이징도 하지 말 것**. 내 작업과 무관한 변경은 그대로 둔다.
4. **history rewrite 금지** — 이미 push된 commit이 잘못 번들돼도 `reset`/`rebase`/force-push로 재작성하지 말 것. **provenance note**(해당 docs)로 사실만 기록.
5. **auto-sync 흡수 시** — 내 변경이 `auto: session sync`에 흡수됐으면, 재분리 시도(soft reset 등)보다 **provenance note 기록**을 우선. `git reset`은 권한 게이트라 거부될 수 있음.
6. **동시성 회피 최선책** — 장시간·다파일 작업은 `git worktree add`로 격리(예: `affix-phase1` 워크트리 관례). 메인 working-tree 공유를 줄인다.
