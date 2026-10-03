> **2026-10-02 본편 패키지 계약 갱신:** 아래의 데모 고정/기존 포트/업로드 기록은 당시 판본의 이력이다. 현행 Steam 본편은 명시 full target·3350 포트·별도 저장/프로필로 빌드하며, 웹/데모 기본값과 데모 제한은 보존한다. 정확한 수치·구현·검수 단계는 `docs/13출시·마케팅/STEAM_FULL_RESUBMISSION_20261002.md`를 따른다.


> **2026-09-22 현재 계약:** 영상은 자막 없는 v23공통영상+29언어 선택형22큐 자막으로 전환했다. 기존 v21/v22 고정 한글 자막 기록은 이전 이력이다. 음성/BGM·96.4초·5784프레임·스킵 시각은 유지한다. 상세: docs/16번역·로컬라이제이션/WARRIOR_LANGUAGE_SUBTITLES_20260922.md

# 언어 런타임·검증 계약 — 2026-09-09

최신 범위와 진행 상태는 [Steam 언어 목표](STEAM_LANGUAGE_SCOPE_20260909.md)를 따른다. 이번 변경은 텍스트 표시·번역 데이터에 한정한다. 스킬의 피해·비용·쿨다운·합체 계산과 영상·음성 시각은 유지한다.

## 런타임

| ID / 파일 | 현행 동작 |
|---|---|
| `ExoduserI18n.languages` | ko/en/zh/zht/ja/es/fr/de/ru/ptbr/it/vi/th/id/tr/pl/cs/hu/bg/el/fi/sv/da/no/nl/ro/uk/ar/ms, 29개 |
| `resolveLanguage` | Steam ID·지역 코드 정규화, 알 수 없는 코드는 null. pt 계열→ptbr, zh-Hant/TW/HK/MO→zht, nb/nn→no |
| `applyDocumentLanguage` | HTML lang: zh=zh-Hans, zht=zh-Hant, ptbr=pt-BR, no=nb, 나머지 내부 코드. 아랍어만 dir=rtl, 그 밖은 ltr |
| `_L(ko,en,values)` | KO는 원문. EN을 포함한 모든 비KO는 `_T(ko)` 우선, 미등록 키만 EN 인수로 폴백. 선택한 텍스트에 치환값 삽입 |
| 첫 진입 언어 | `hellcave_settings` 유무·JSON 파싱 성공과 무관하게 `hellLang`을 별도 복원·정규화. `_settingsMigrated`가 true인 정상 설정만 그 뒤 `saveSettings()`로 저장하고 `syncSettingsUI()` 호출. 이전 OPT.lang이 로비 선택을 덮어쓰지 않음. 손상된 JSON 원문 보존 |
| `format` | `{영문자로 시작하는 이름}` 토큰을 own property 값으로 치환. 0과 반복 토큰 보존, 없는 값의 토큰은 보존. 정규식 치환 문자열의 `$&` 등은 실행하지 않음 |
| `_T` 장비명 | MAIN 정확 키 우선. 접두사+기본형 분리 시 각 PFX/BASE 우선, 새 UI MAIN의 단어도 사용. ms는 기본명+수식어, 나머지는 기존 접두사+기본형 순서 |
| 패널 탭 | `.panel-nav-tab`에 원문 label/key를 저장. 언어 변경 시 자식 없는 해당 노드만 번역하여 즉시 갱신 |
| 슬롯 아이콘 | 장비 슬롯의 이모지와 명사를 분리. 명사만 기존 `_L` 카탈로그 조회 후 재조립 |
| 동적 문구 | 스킬 강화 24개 대입 + 창고/분해/제작/초기화 11개 호출 + 구역 타이틀을 템플릿으로 처리. 치환 전 문자열에 숫자를 삽입해 조회하지 않음 |
| 말레이어 생성 | `ms-adaptation.json` + `ms-overrides.json`. 명시 PFX/BASE 보정값을 MAIN에도 반영하여 단독 조회의 이전 오역을 덮어씀 |
| 말레이어 기본 데이터 | MAIN 2716 / PFX 48 / BASE 53. 로비 82키. 이전 ID 어휘 기반 생성 후 명시적인 말레이어 의미 보정 적용 |

## 자막 표시

| 항목 | 값 / 공식 |
|---|---|
| 캐릭터 원문 | 전쟁 PRO 34큐 중 21개 대사, INTRO 27큐 중 18개 대사 |
| 번역 선택 | KO 원문 배열을 복제하고 ID별 text만 교체. 28개 번역의 타이밍·이미지·화자 내부 ID·빈 연출 큐를 KO 메타데이터로 통일 |
| 캐시 | 원문 배열→번역 객체→sequence 순서 WeakMap/WeakMap/Map. 같은 입력의 새 배열 재생성 방지 |
| 화자 | `speakers.GODDESS/DIROY/HECTOR`는 현지 이름. GODDESS는 역할명이 아니라 네메시아 이름 |
| `wrapText` | 폭 `cw*.84`, Intl.Segmenter 단어 경계. 폭을 넘는 단어는 문자소 경계에서 분리. 명시적 줄바꿈 보존 |
| 내레이션 글자 | title: max(24,ch*.075), 일반: max(14,ch*.031). 행 간격 글자 크기×1.5 |
| 내레이션 위치 | 타이틀은 전체 줄 블록을 중앙 정렬. 일반은 마지막 줄 기준선 ch*.88 |
| 대사 본문 | 글자 크기 max(13,ch*.018), 줄 간격 max(20,ch*.028), 화자와 본문 간격 max(22,ch*.035) |
| 대사 배경 높이 | `max(ch*.22,(textGap+(줄수-1)*textLineHeight+max(13,ch*.018)+max(12,ch*.025))/.75)` |
| 대사 앵커 | subY=ch-subH, nameY=subY+subH*.25. LTR nameX=cw*.08, RTL nameX=cw*.92 |
| RTL | 캐릭터 자막 Canvas context.direction=rtl, 이름·대사 우측 정렬. 게임 공간 Canvas CSS는 ltr 유지 |
| 세계관 영상 | 기존 TextTrack/VTTCue 방식, 29×32=928큐. ms SRT/VTT 2개 추가, 전체58개. 음성·BGM·재생 위치 유지 |

## UI 데이터와 검증

| 파일 / 검사 | 범위 |
|---|---|
| `ui-source.json` | 576개 최초 감사 키. 한국어·영어 원본 |
| `ui-extra-source.json` | 실제 패널/간접 배열 감사로 추가한 66개. 성장 화면137개와 합쳐 총779개 등록 키 |
| `ui-growth-source.json` / `ui-growth/<code>.json` | 새 성장 화면137키 × 27번역 = 3,699개. `row(ko,en)`, `{ko,en}`, 2요소 설명 배열, 3요소 필터 배열도 수집 |
| `ui/<code>.json` | 최초 감사에서 필요한 언어별 보완값 |
| `ui-extra/<code>.json` | 추가 감사 키의 보완값 |
| `terminology.json` | 28개 비한국어의 기본 `뇌전창`을 Thunder Stake 계열 명칭으로 통일. 별도 합체 `전격의창`과 구별. VI 근성=`Bền Chí`, MS 참회=`Taubat`, PL 폭독칼날=`Ostrze Zarazy`. TR6·FI7·SV5·DA8·NO7·NL9·BG3·EL7개 혼합/오역 스킬명도 교정. 기존 카탈로그·UI·EXTRA·성장 화면 다음 마지막으로 적용 |
| `build-localization.mjs` | 세 원본 레지스트리 및 기존 카탈로그·로비·명시 별칭을 합쳐 번들 생성. 기본 실행은 누락 오류. `ui-needed.json`에서 이미 영어 폴백으로 판정된 키는 기존 값의 존재만으로 통과하지 않으며 `ui/<code>.json`의 명시 번역 필요. 진행 중에만 --draft |
| `test/localizationHandoff.test.js` | 설정 없는 첫 진입·손상된 설정과 독립 언어 복원, EN 이름의 canonical 번역 우선과 0 치환 |
| `test/localizationRuntime.test.js` | 31개 Steam ID, 지역 별칭, 토큰 치환, 자막 메타데이터, RTL 복귀, 단어·문자소 줄바꿈 |
| `test/localizationCoverage.test.js` | 전체 등록 키의 언어별 존재, 토큰 집합, 감사에서 확인된 영어 폴백의 명시 번역, 캐릭터 원문 ID 전량, 성장 화면의 모든 쌍 레지스트리 수집 |
| `test/worldIntroSubtitles.test.js` | 29언어32큐, 시각, 스타일 계약, SRT/VTT58개 원문 동등성 |
| 브라우저 언어 전환 | 게임29언어 선택값·dir·자막34/27큐, 로비29언어×선택창4개·hellLang 저장·dir. 페이지 오류0 |
| 자막 경계 검사 | 28언어×39문장×3해상도(1280×720/640×360/360×640)=3276개, 화면 밖 경계0 |
| 한계 | 구조·의미 표본·화면 검증은 출시용 원어민 감수를 대체하지 않음. 기본 카탈로그 전 항목의 문체 감수는 별도 |

이번 UI 감사에서 BGM 고유 곡명은 원래 제목을 유지하며, 장/공통/이벤트 선택 레이블은 번역 대상으로 분리한다. 개발 전용 bosstest 패널의 스킬 프리셋 이름은 배포 UI 번역 목록에 포함하지 않는다.

## 2026-09-16 Steam 반려 대응

| 대상 | 현재 계약 |
|---|---|
| 로비 `setUserLanguage` | 명시적 메뉴 선택 시 hellLang 저장 후 URL의 lang만 제거(history.replaceState). 다른 쿼리 보존. 최초 URL 지정은 사용자가 선택하기 전까지 유효 |
| 시작 안내 game.html | `_introGuideText`·조작 설명·대사 모두 기존 `_L` 조회. 언어 변경 중 열린 안내도 `_applyLang`에서 다시 그림. 최초 syncSettingsUI는 뒤쪽 let 초기화 전이므로 해당 안내 갱신만 로컬 try/catch로 보호. `introTextKr` 리프에 선택 번역, `introTextEn` 리프는 비움. 미등록 비KO 문구는 EN 인수 폴백 |
| 열린 펫 대사 | `_petBubble.sourceTxt`·`pair.sourceTxt` 보존, `_applyLang`에서 `_refreshPetBubbleLanguage` 호출. 현재 대사·대기 응답을 재번역하되 타이머/음성 재시작 없음 |
| ui-source.json | 악의기둥 원본 키의 오래된 5초/5s를 기존 런타임·번역 값인 10초/10s에 일치. 전투 값 변경 없음 |
| 테스트 | 실제 saveSettings와 저장소를 사용하는 회귀 검사, 손상 설정 보존, URL 선택 우선순위, 안내 번역 조회. 등록 키 존재만으로 전체 언어 지원을 보증하지 않음 |
| 현재 지원 판정 | 신규 한국어 고정 실습 및 영상 자막 때문에 비KO는 부분 번역. [재검수 보고서](../13출시·마케팅/STEAM_REVIEW_REMEDIATION_20260916.md)가 현재 Steam 표시 판정에 우선 |

## 최종 통합 검증

| 대상 | 결과 |
|---|---|
| 관련 Node 검사 | 45개 PASS |
| 새 성장 화면 | 29언어×43상태=1,247상태. 26패시브·5속성·6경로·계획 추가/취소·전체 환불 계획·검색 없음 상태. 한국어 잔류0·페이지 오류0 |
| 긴 이름 | `#statPanel .growth-detail-name`의 `overflow-wrap:anywhere`와 `min-width:0`. 시각적으로 숨긴 접근성 레이블은 overflow 검사에서 제외 |
| 업화선 설명 | 유도·DEX·MP10 오기 제거. 실제 직선 차징 투사체·레벨별 MP·시전속도 쿨다운에 일치. [정확한 계약](../2_1%20스킬관리+합체시스템+자원/FIREBEAM_LOCALIZATION_SOURCE_20260909.md) |

성장 화면의 실제 포인트 계산·계획 적용 로직은 별도 성장 화면 구현을 그대로 사용하며, 이 번역 작업은 그 동작을 변경하지 않는다.

## 2026-09-16 영어 설정 카드 후속 수정

| 대상 | 현재 계약 |
|---|---|
| game.html·game-easy-test.html renderSettings / charSelectGrid | 이름·설명 리프와 카드 aria-label에 기존 `_T(ch.name)` / `_T(ch.desc)` 적용. 캐릭터 설명은 aria-describedby로 실제 번역 리프 참조. 2026-09-29 easy-test 직접 출력도 본편과 일치; 두 HTML EN→KO 회귀 PASS. 신규 번역·전투·아트 변경 없음 |
| 검사 | settingsCharacterLanguage.test.js: 수정 전 한국어 노출 실패 재현, 수정 후 영어 표시 및 한국어 복귀 확인. 후속 관련 검사67개 통과 |
| EN 지원 범위 | 신규 실습3파일116/86/36개 한국어 리터럴 후보(aria·문장 조각 포함), 기존 정확 EN 키5/0/0. 캐릭터 선택 신규 설명·특성, 영상22개 고정 KO 자막은 별도 작업 필요. 영어 지원 체크 복원하지 않음 |
| 오탐 제외 | Exoduser Warrior, HP/MP/ST 및 공용 기호, 시작4컷 정상 영어 fallback을 EN 누락으로 세지 않음 |
| 상세 근거 | output/steam_install_review_20260916/english-audit.json, 후속 Steam 검수 보고서 |

## 2026-09-22 영어 캐릭터·배지·HUD 후속

| 대상 | 현재 구현 |
|---|---|
| 캐릭터 | 신규 소개·직업·특성19개 영어 등록 |
| 배지 | 3종 이름·조건·모음·알림 영어, 언어 전환 시 획득/알림 타이머 보존 |
| HUD | _applyLang에서 리프4개 및 플레이어 상태 aria-label 즉시 갱신. 일시정지에서도 적용 |
| 악의기둥 | 기존27언어 원본 JSON에는 5초가 남아 있었음. ui-needed와 실제 번역을10초로 고쳐 strict 빌드 복구 |
| 검증 | 번역 빌드와 관련14개 검사 PASS. 캐릭터 영상/타 언어 신규 실습은 후속 |

상세: docs/16번역·로컬라이제이션/ENGLISH_CHARACTER_BADGE_HUD_20260922.md


## 2026-09-22 로비 챕터명 번역

| 항목 | 현행 계약 |
|---|---|
| 원인 | 게임 언어 테이블에만 있던 챕터명을 로비 _TL이 찾지 못해 한국어 표시 |
| 로더 | build-localization에서 lobby-chapter-source7개를 ui[code]에 명시적으로 포함 |
| 기존6개 | lang_* 현재 번역 재사용, EN은 source 영어 |
| 지옥의 겨울 | hell-winter.json28언어 신규 번역, 구 얼음굴 명칭으로 대체하지 않음 |
| 진행 |7장35스테이지의 경계·층·저장 값 변경 없음 |
| 검증 |29언어×35스테이지 로비 표시 검사 |


## 2026-09-23 유골함 알림 영어 연결

직접 _T 호출 감사에서 발견된 알림6개를 notification-source.json에 등록했다. 기존 타 언어 테이블 번역을 보존하고 영어를 번들에 포함한다.8개 실행 파일의 직접 번역 호출 누락0개. 동적 데이터 전체를 보증하는 수치는 아니다.

| KO | EN |
|---|---|
| 유골함이 필요합니다! | Ossuary required! |
| 소환 가능한 전대가 없습니다! | No ancestors available to summon! |
| 도감 등록! | Registered to codex! |
| 전대 해금! | Ancestor unlocked! |
| 이미 더 높은 등급의 부위를 수집했습니다 | Already collected a higher-grade part |
| 전대 소환! | Ancestor summoned! |


## 2026-09-23 장비 동적 표시 번역

| 위치 | 표시 계약 |
|---|---|
| 인벤토리 상세·현재 장착 비교 | 무기/석궁 종류 및 장비명에 _T 적용 |
| 대장간 제작 | 장착 장비명·속성·무기/석궁 목록에 _T 적용 |
| 물약 강화 | HP 물약 이름을 _L로 번역하여 카드·선택 설명·성공 알림에 공유 |
| 성장 상세 | 무기 속성 ELN 값을 _T로 번역 |

양쪽 HTML에 동일 적용. 저장된 아이템 이름, 장비 수치, 제작 비용과 강화 효과는 변경하지 않는다.


## 2026-09-23 생성 유골 아이템 표시 이름

| 저장 키 | 영어 표시 | 번역 원본 |
|---|---|---|
| 전대의 유골함 | Ancestral Ossuary | 영어 번들 + 기존 27언어 lang 테이블 |
| 철갑 전대의 두개골 | Iron Warlord's Skull | bone-item-names.json |
| 철갑 전대의 몸통 | Iron Warlord's Torso | bone-item-names.json |
| 철갑 전대의 팔 | Iron Warlord's Arms | bone-item-names.json |
| 철갑 전대의 다리 | Iron Warlord's Legs | bone-item-names.json |

4부위 × 28개 비한국어 이름을 정확한 전체 키로 번들에 등록한다. 이전 접두사 분해 실패로 남던 한국어 표시를 해소하며 저장 키는 유지한다.


| 2026-09-23 품질 검토 보완 | 적용 |
|---|---|
| 철갑 전대 부위 명칭 | 영어 Iron Warlord, 나머지27언어는 기존 ui-extra 철갑 전대 명칭에 맞춰 소유격·격변화를 반영 |
| HP 물약 | hp-potion.json의28개 비한국어 명칭을 전체 키로 번들에 등록하여 영어 폴백 방지 |


| 2026-09-23 검증 실행 계약 | 내용 |
|---|---|
| verify-language-support.mjs | VM 모듈 활성화, 기존 성장 화면 테스트는 설치된 Chrome 사용. GROWTH_TEST_BROWSER_CHANNEL로 다른 설치 채널 지정 가능 |
| 실습 경고 렌더 fixture | 실행 파일의 실제 _projectileParryClass 함수를 함께 로드해 의존성을 검증. 전투 규칙은 변경하지 않음 |
| 생성 부위 문법 | 프랑스어 de l’ancêtre, 이탈리아어 dell’Antenato로 관사 축약 |

검사용 fixture를 require할 때에는 fixture 함수만 제공한다. 전체 전투 검사는 tools/test-parry-lesson.cjs 직접 실행으로 유지하며 번역 검사에서 중복 실행하지 않는다.


## 2026-09-23 자막 HTTP 응답

| 서버 | .vtt Content-Type |
|---|---|
| server.cjs 개발 서버 | text/vtt; charset=utf-8 |
| node-main.js NW.js 패키지 | text/vtt; charset=utf-8 |
| tools/local-static-server.mjs 검사 서버 | text/vtt; charset=utf-8 |

네이티브 TextTrack 자막을 올바른 MIME으로 전달한다. 패키지 서버의 실제 요청 처리 함수를29개 언어 자막에 실행하여 상태200·헤더·22큐를 검사한다.


## 2026-09-27 유골 콜렉션 제단 UI

| 항목 | 연결 |
|---|---|
| 새 문구 | 선대의 유골 콜렉션/Ancestral Bone Collection, 수집/Collected, 소환 해금/Summon unlocked, 유골 수집 중/Collection incomplete, 유골함 장착 필요/Equip an ossuary |
| 부위 설명 | 치명·위력/Critical·Power, 최대HP/Maximum HP, 공격 위력/Attack power, 크기·이동속도/Size·Movement speed |
| 경로 | renderOssPanel의 _L(ko,en), 부위 _bonePartName, 등급 _rarName 재사용 |
| 범위 | 신규 안내는 KO/EN 인라인 제공. 기존 부위/등급 번역 유지. 신규 안내의 다른 언어 전파는 미완료, 기존 _L 폴백 사용 |
| 은퇴 문구 | 이전 행 툴팁의 지속시간·4부위 수집 안내는 중앙 제단의 진행/해금 문구로 교체, 기존 번역 키는 호환 보존 |


## 2026-09-28 로비 카드 언어 즉시 갱신·DOM 상태 보존

| id / 적용 위치 | 현행 계약 |
|---|---|
| 원인 | 로비 언어 선택 후 정적 메뉴와 전대 표제만 갱신, 기존 카드 이름/직업/진행/삭제 안내/aria-label은 이전 언어로 남음 |
| _applyLobbyLang | 기존 _refreshStatusLanguage 다음에 _refreshLobbyCardsLanguage 호출. charList 안의 .char-item/.char-item-new에 등록한 _refreshLanguage 콜백만 실행. 목록 재조회·재렌더 없음 |
| 최초 적용 | _refreshLobbyCardsLanguage는 document.getElementById 사용. 초기 언어 적용은 const $ 초기화 전일 수 있으므로 $나 슬롯 상태를 읽지 않음. 리스트가 없으면 반환, 빈 카드/미등록 콜백은 건너뜀 |
| _addLobbyCardControl | label은 기존 문자열 또는 현재 언어를 계산하는 함수. card._refreshLanguage에서 label 함수 실행 후 .char-info 리프의 trim한 설명을 구분자 · 로 추가해 기존 button.char-select의 aria-label/title 동시 갱신. data-card-key·이벤트·DOM 노드 유지 |
| _lobbyCardLeaf | 지정한 카드 내부 셀렉터의 children.length===0일 때만 textContent 변경. 부모 컨테이너·이미지·하위 DOM 보존. 삭제 버튼은 title 속성만 갱신 |
| _lobbyCharacterCardLabel | 기존 CHAR_VISUALS 직업/클래스와 _formatLobbyStageProgress(stage,_TL) 재사용. .char-cls/.char-info/삭제 title 번역. 사용자 저장 이름, charIdx, 레벨, 스테이지 유지. 로컬 구분자 · /온라인 구분자 | 유지 |
| _lobbyDemoCardLabel | 표시 이름은 KO 묘왕 바르칸 / 그 외 Varkan, the Tomb King, 표제는 전대 소환 / ANCESTRAL SUMMON. 기존 렌더에서 캡처한 진행으로 레벨·Stage 1-1·처치·브라우저 저장 안내 재번역. 초기 Lv.1 START · Stage 1-1 · Lv.100 Cap 유지. 언어 전환 중 세이브 다시 읽기/쓰기 없음 |
| _lobbyNewCardLabel | 새 캐릭터/슬롯 가득참 및 기존 최대 개수 안내 재번역. 기존 공개5개·개발 Infinity 제한 유지. 가득찬 비활성 카드도 콜백 등록하되 버튼/생성 이벤트를 새로 만들지 않음 |
| 상태 보존 | 같은 카드·선택 버튼·이미지·초점 유지. _selectedSlot/_selectedSlotName/_slotScrollIdx/_onlineScrollIdx/_characterLoadSeq 변경 없음. 번역 카탈로그 신규 키·전투/저장 형식 변경 없음 |
| 회귀 | test/lobbyCardLanguage.test.js 신규11건: 데모2·온라인/로컬2·생성/가득참3·중첩 노드2·초기 적용1·기존 문자열 호환1. 원본7실패/4통과→수정 후11통과. $ 없는 초기화 검사도 수정 전1실패/10통과. 관련 통합239건 및 inline script4개 구문 통과 |
| 기존 검사 보완 | developerCharacterSlots에 실제 _lobbyAncestorName/_lobbyAncestorCaption 함수와 KO 언어 대역 포함. 표시 이름 검사를 승인된 묘왕 바르칸으로 맞춤. DEMO CHARACTER는 기존 슬롯 메타데이터용 내부 이름으로 유지 |
| 실제 언어 검증 | 960×540/1920×1080에서29언어×데모1·로컬 생성가능/가득참2·온라인 생성가능/가득참2=290조합. 동일 카드/버튼/이미지·선택·스크롤·초점 보존 및 가로 넘침 없음, pageerror0. 생성/삭제 저장 요청0 |
| 진행·메뉴 검증 | 격리 브라우저 저장 Lv.46/처치1795의 KO→EN 및 실제 언어 메뉴 Enter/Home/ArrowDown/Enter 확인. 레벨·처치·JSON 저장 원문 보존, 원래 select 초점 복귀. 실제 계정/사용자 슬롯 쓰기 없음 |
| 검증 범위 | 데모는 원본 Node 서버 페이지. 온라인/로컬 전체 슬롯은 별도 격리 페이지에서 _LOBBY_BUILD만 full로 바꾸고 슬롯 메타데이터/API를 대역으로 제공. 인증·서버 저장 종단 검증은 아님. 시각 점검은 번역 갱신/현재 배치 보존 범위 |
| 기록·커밋 | tmp/lobby-card-language/browser-demo.json, browser-full.json, browser-progress.json, red-tests.txt, initialization-red-tests.txt, tests.txt, changes.patch. 관련 문서8개 동기화. 코드·테스트는 동시 게시 커밋76924fc7b 및 초기화 보완4d7e00efb에서 반영 확인. 추가 문서8개 git add는 승인 뒤 WindowsApps pwsh.exe CreateProcessW 오류 -1073283067/FormatMessage317로 명령 실행 전 실패. 상세 문서 저장·패치 검증 완료, 추가 문서 커밋 미완료 |


## 2026-09-28 데모 카드 줄바꿈·입장 버튼 스크롤 분리

| 항목 | 현행 계약 |
|---|---|
| 데모 전용 | data-card-key=demo인 선택 버튼을 직접 가진 카드만 높이auto/최소84px 및 이름·정보 줄바꿈. 정보 줄높이1.45. 일반 로컬/온라인 카드는84px/진행nowrap 유지 |
| 입장 | .lobby-footer는 .lobby-right 직계 자식으로 .lobby-content 뒤/#lobbyStatus 앞. 목록/배너 세로 스크롤과 독립. CSS 캐시20260928-lobby-card-wrap |
| 검증 | 실제 데모29언어×진행2×화면7=406조합 및 일반 슬롯 대역6조합. 텍스트/입장 경계·초점 순서·저장 원문 보존, 가로 넘침/페이지 오류/쓰기 요청0. 기존105회귀+inline4구문 통과 |
| 상세 | [데모 카드·입장 배치 현행 계약](../3.1%20ui%20hud%20디자인/LOBBY_ANCESTOR_ART_20260928.md). 기존 공통 말줄임/84px 설명의 데모 예외 및 짧은 창의 배너 세로 스크롤을 이 절로 갱신. 신규 자산/저장 형식/게임패드 동작 변경 없음 |


## 2026-09-28 소환체와 플레이어 캐릭터 표시 분리

| 리프/함수 | KO / 그 외 |
|---|---|
| 미선택 _lobbyAncestorName / charDispTitle | 묘왕 바르칸 / Varkan, the Tomb King; 선택은 저장 이름 또는 데모 대검전사 / Greatsword Warrior |
| 미선택 _lobbyAncestorCaption / charDispSub | 선대 소환체 / ANCESTRAL SUMMON; 선택은 _TL(CHAR_VISUALS.job 또는 cls) |
| 미선택 _lobbyAncestorDetail / charDispDetail | 플레이어가 소환하는 선대의 영체 / A spirit summoned by the player.; 선택은 빈 리프/숨김 |
| _lobbyDemoCharacterName / 데모 카드 .char-name | 대검전사 / Greatsword Warrior. 이전 _lobbyPlayerRecordName 제거. CHAR_VISUALS[0].bust 전사 초상화는 언어 전환 때 같은 이미지 노드 유지 |
| 갱신 | 기존 카드/버튼/진행/초점 보존. 데모 .char-info는 진행 수치만, 소환체 표제 중복 없음. 초기 미선택에서도 이름/역할/설명 갱신, delayed $ 없이 직접 리프 접근 |
| 검수 | 관련6파일57개 회귀 통과. 세 화면 크기 실제 재생 및 설명 표시 확인 |


## 2026-09-28 짧은 창 Steam 배너·RTL 여백 마감

| 항목 | 현행 계약 |
|---|---|
| 짧은 창 | 높이≤600px는 배너 문장/.lobby-card-gap 숨김, 배너 내부padding0/gap0. 찜 버튼 최소높이44px/최대폭100%, 이미지 최대190px. 데모 카드 세로padding10px·최소높이84px. 높이≥601px는 기존 문장·간격 표시 |
| RTL·언어 | .lobby-content의 여백은 padding-inline-end8px. #lobbyWishlistBtn aria-label/title은 기존 번역키 STEAM 위시리스트 추가(id2841)로 즉시 갱신, 이미지 alt 빈값. 부모 DOM 교체·새 번역키·저장 형식 변경 없음 |
| 검증·캐시 | 실제29언어×진행2×화면9=522조합, 일반 슬롯 대역16조합, 기존105회귀/inline4구문 통과. 가로 이미지 잘림/페이지 오류/쓰기 요청0. CSS 캐시20260928-lobby-banner-compact2 |
| 상세 | [배너·논리 여백 현행 계약](../3.1%20ui%20hud%20디자인/lobby_full_patch.md). 기존 padding-right8px와 데모 카드 간격 설명은 이 절을 우선. 아주 작은480×360에서는 세로 스크롤 후 찜 버튼 접근. 동시 전대 아트·표제 변경 보존 |


## 2026-09-28 언어 메뉴 키 반복·IME 보호와 찜 버튼 초점선

| 항목 | 현행 계약 |
|---|---|
| 언어 메뉴 | 4개 select의 반복 열기와 팝업의 Enter/공백/Escape 반복 확정·취소 차단. isComposing/keyCode229 및 숨김·선택 노드 없는 메뉴는 처리하지 않음. 방향키 반복/Home/End/Tab·마우스·패드 경로 유지 |
| 찜 버튼 | #lobbyWishlistBtn도 기존 로비 focus-visible outline-offset−2px 적용. 공통2px/#ead6a5 테두리·버튼 크기·600px 배너 경계·언어·저장 계약 유지 |
| 검증 | 신규24건 원본19실패→통과, 관련167건/inline4구문 통과. 실제 키보드3크기·초점5크기 및 원본 패드 콜백 대역 확인. IME는 합성 이벤트/실물 패드·OS IME 검증 별도 |
| 상세 | [언어 키 입력·초점 현행 계약](../3.3%20키바인딩+설정/게임패드_호버_상호작용.md). 기존 언어 팝업 계약에 키 유지와 IME 보호 추가. 새 번역키/부모 DOM 교체/사용자 저장 요청 없음 |


## 2026-09-28 이름 입력 안내 상시 표시·취소 글자 가독성

| id / 적용 위치 | 현행 계약 |
|---|---|
| 원인 | 기존 입력칸 placeholder #443322와 취소 글자 #884433이 어두운 창에서 읽기 어려움. 320×360의 입력 내용 폭220px에서 영어 안내224.733px/일본어220.160px로 끝부분 잘림. 이름 입력 후에는 placeholder 안내가 사라짐 |
| charNameLabel | index.html에서 charName 바로 앞에 label.name-label/id charNameLabel/for charName 추가. 기존 번역키 캐릭터 이름 (2~8자)를 표시. 입력 중에도 안내·글자 제한 유지, 네이티브 input.labels로 입력 이름 제공. 부모·입력 DOM 교체 없음 |
| .name-label | display:block/text-align:start/color #bda183/font-size .875rem/line-height1.5/letter-spacing .05em/margin-bottom8px/overflow-wrap:anywhere. 실제16px 루트의 글꼴14px·줄높이21px. RTL은 논리 시작 방향 사용, 긴 번역은 줄바꿈 |
| charName | placeholder 속성과 기존 .name-input::placeholder 색 규칙 제거. maxlength8·입력 글꼴1rem·입력값/이름2~8자 검증·한글 IME/Enter 반복 보호·가상 키보드·생성/저장 경로 유지 |
| _applyLobbyLang | charNameLabel을 document.getElementById로 찾아 기존 _TL(캐릭터 이름 (2~8자))를 label 리프 textContent에 갱신. 입력값·초점·새 번역키·저장 형식 변경 없음. 처음 초기화 또는 노드 없는 화면에도 null 가드 유지 |
| 취소 글자 | 현행 .create-cancel-btn은 #dfceb0 중성 흑철 버튼. 활성 hover brightness1.13/border #c9ab7d, focus-visible2px #ead1a0/offset-4px. 이름·종료·삭제 확인창 흑철 마감 절이 이전 #bda183·붉은 호버를 대체하며 클릭/취소 정책 유지 |
| 대비 계산 | 계산용 창 배경 상한 RGB(26,17,11)에 새 안내/취소 RGB(189,161,131) 대비7.60846. 이전 취소2.58784, 이전 placeholder는 입력 배경 RGB(16,11,7)에서1.62392. CSS 합성 배경에 대한 계산이며 화면 픽셀 측정값은 아님 |
| 실제 브라우저 | Node 서버 원본29언어×320×280/320×360/480×360/960×540/1920×1080의5창×가상 키보드 꺼짐/켜짐2=290조건. 안내 전체 줄 경계·label 연결·입력값 이름유지/maxlength8·최소14px·색·팝업/버튼 접근·가로 넘침 없음 확인. pageerror0/쓰기 요청0 |
| 실제 키보드 | 320×280/480×360/960×540에서 Hero7 입력 후 KO→EN 값/초점 유지. Tab 이름→취소→생성→이름/Shift+Tab 역방향 및 Escape 후 기존 캐릭터 버튼 초점 복귀 확인. 실제 캐릭터 저장 요청 없음 |
| 회귀 | lobbyCardLanguage 기존11→12건: 안내 번역·동일 label 노드·입력값/빈 placeholder·초점 유지·API 요청0. 수정 전1실패/11통과→12통과. 관련12파일210건/inline script4개 구문 통과 |
| 기록·커밋 | tmp/lobby-name-detail의 placeholder-before.json,contrast.json,browser-matrix.json,interaction.json,summary.json,red-tests.txt,tests.txt,changes.patch. 코드·테스트 및 문서7개를 검토 패치로 정리. 현재 .git 쓰기 제한으로 이번 변경 커밋 미완료. 기존 스테이징 보존 |


## 2026-09-28 외형 미리보기 RTL 좌우 입력 정합

| id / 적용 위치 | 현행 계약 |
|---|---|
| 재현 | Node 서버 원본960×540·아랍어 dir=rtl. 전사0의 x492.48px,실버테일1의 x413.78px로1이 왼쪽에 있지만0에서 ArrowLeft가0을 유지했다. 패드도 좌=-1/우=+1 고정 인덱스 연산이라 같은 역방향 문제가 있었다. |
| 표시 방향 | 기존 ExoduserI18n.applyDocumentLanguage가 아랍어만 document.documentElement.dir=rtl,나머지는ltr로 설정한다. #visualGrid의 기존 flex 배치가 이 방향을 상속한다. 배치·아이콘·캐릭터 에셋을 바꾸지 않는다. |
| 키보드 | _visualSelectKeydown의 step=(ArrowRight?1:-1)×(현재 dir===rtl?-1:1). next=clamp(index+step,0,icons.length-1). 아이콘 초점에서 좌우는 화면상 좌우 이웃으로 이동하고 기존 click/focus(preventScroll:true)를 실행한다. |
| Home/End·잠금 | Home은 논리 첫 버튼0,End는 마지막 버튼icons.length-1. RTL에서 첫 버튼이 오른쪽이라는 기존 DOM 순서 유지. 선택/초점/aria-pressed/설명·미디어·생성 잠금은 같은 캐릭터로 갱신. 일반 전사0 생성 활성,실버테일1 출시 준비 잠금. |
| 패드 | 기존 lobbyNav의 외형 팝업 분기에서 step=현재 dir===rtl?-1:1. D-pad14 또는 좌스틱x<-0.5의 새 입력은 clamp(idx-step,0,cards.length-1),D-pad15 또는 x>0.5의 새 입력은 clamp(idx+step,0,cards.length-1). 기존 _viL/_viR 유지 판정·selectVisual·A확정/B취소 유지. |
| 언어 전환 | 입력 처리 때마다 현재 document.documentElement.dir를 읽는다. 열린 상태에서 en→ar→en으로 전환해도 다음 새 방향 입력이 현재 보이는 순서에 맞는다. 미리보기 재생·저장 순서·캐릭터 id는 바꾸지 않는다. |
| 보호 범위 | 키보드 Tab/Escape/IME·정보 영역 네이티브 스크롤 및 아이콘 밖 방향키 규칙 유지. 이름 가상 키보드/삭제 확인창 등 다른 패드 분기는 이번 변경 대상이 아니다. |
| 회귀 | test/lobbyVisualKeyboard.test.js31→37,새6건:RTL 좌우/경계/Home·End/잠금,열린 창 방향 전환,LTR·RTL×D-pad·스틱4조건. 수정 전37건33PASS/4FAIL→수정 후37PASS. 관련9파일155건 PASS,inline script4개 구문 PASS. |
| 실제 브라우저 | 320×280/960×540/1920×1080×ko/en/ar×키보드/D-pad/스틱=27흐름. 네이티브 키보드9·가상 패드18,선택·잠금·aria-pressed·좌우 끝 경계·취소 후 초점 복귀·횡넘침 없음. 열린 창 en→ar→en 추가 확인,pageerror0/쓰기 요청0. |
| 검증 범위 | 실제 서버 페이지의 기존 navigator.getGamepads 폴링과 lobbyNav를 사용하되패드 장치 표본만 브라우저 대역으로 주입했다. 실물 패드·진동 검증은 수행하지 않았다. 데모에는 생성 카드가 없어 openVisualSelect로 진입한 뒤 실제 버튼/키보드를 사용했다. |
| 기록·상태 | tmp/lobby-visual-rtl의 browser-before.json,browser-matrix.json,summary.json,verify-rtl.mjs,after-960-ar.png,red-tests.txt,green-tests.txt,tests.txt,changes.patch. 코드1·테스트1·관련문서8개. 현재 .git 쓰기 제한으로 커밋 미완료,기존 타 작업 스테이징 보존. |

## 2026-09-29 이름·종료·삭제 확인창 흑철 마감 — 기존 크기 보존

사용자 지시: UI 디테일 작업으로 UI 크기를 반복 변경하지 않는다. 2026-09-28 마감이 추가한 패딩·글자·버튼 치수·구분선·테두리 두께 덮어쓰기를 제거하고, 그 직전 크기로 복원했다. 아래 규격이 현행이다.

| id / 적용 위치 | 현행 계약 |
|---|---|
| 범위 | 이름창 width440px, 확인창 width400px. 기존 max-width:calc(100vw - 24px)/max-height:calc(100dvh - 24px), 내부 세로 스크롤·가로 숨김·scroll-padding-block8px 유지 |
| 기본 여백·테두리 | 이름창 padding48px 40px/border1px/radius2px; 확인창 padding24px 32px/border2px/radius8px. 폭≤480px 또는 높이≤480px는 두 창의 기존 padding24px 18px 유지. 공통 padding32px/3px double/radius0 덮어쓰기는 제거 |
| 글자·간격 | 이름 제목은 기존 Cinzel Decorative/1.5rem/letter-spacing.1em/margin-bottom8px. 설명은 기존 .8rem/.05em/margin-bottom28px, 입력은 기존16px/padding14px 18px/margin-bottom20px/radius2px. 폰트·줄높이·마진·자간을 재질 CSS에서 덮어쓰지 않음 |
| 버튼 | 기존 flex:1 1 96px/min-width0/min-height44px/줄바꿈 유지. 이름 생성·취소 padding12px 32px/.9rem/radius2px 및 각 버튼 기존 자간·굵기, 확인·취소 padding8px 28px/1rem/700/radius4px 유지. 재질 CSS에서 display·정렬·패딩·font를 덮어쓰지 않음 |
| 확인 안내 | 기존1rem/margin-bottom20px 및 기존 글꼴·줄높이 유지. 새18px 아래 패딩·구분선과16px/600/1.6 덮어쓰기는 제거 |
| 재질 | #756247 테두리색, linear-gradient(#131215ee,#0b0b0eef)/iron.png center320px/#111013, shadow0 18px 56px #000c/inset3px #090a0d/inset4px #a68a5433. 내부6px/1px #a68a542b 장식은 absolute/pointer-events:none으로 배치 치수에 영향 없음 |
| 색상 | 제목·확인문구 #ecd9b7/설명 #c4b69e/label #d3c1a2/입력 #f1e4c9 및 #090a0d. 기본 버튼 #dfceb0/border #74604a/중성 button.webp, 활성 생성·확인 #fff0d1/border #b57b59/가넷 오버레이 유지 |
| 상태 | 기존 .14s 재질·초점 transition, hover brightness1.13/#c9ab7d, active brightness.96/inset0 3px 7px #000a, focus-visible2px #ead1a0/offset-4px, disabled opacity.7/grayscale1/#aaa08e, reduced-motion transition:none. scrollbar-color만 유지하며 scrollbar-width 덮어쓰기도 제거 |
| 검수 | 현재 기본 브라우저 viewport2353×1262/scale1에서 KO·EN·AR×이름/확인창6조건. 기존 CSS 백업과 각11요소의 폭·높이·패딩·테두리 두께·font·줄높이·마진·자간·display 등23속성을 비교, 차이0. 이름창 실측 KO440×340/EN440×367/AR440×364, 확인창 KO·EN400×140/AR400×150. 번역에 따른 기존 줄바꿈·높이 차이는 유지 |
| 검수 경계 | 원본 DOM·CSS를 Node 서버에서 제공하고 앱 스크립트를 제거한 격리 렌더의 치수 대조. 저장·생성·삭제·종료 실행이나 게임패드 검증을 대체하지 않는다. 이전435배치/148회귀는 이전 마감 기록이며 이번 현행 크기의 검수 결과로 재사용하지 않음. 검수 viewport override는 해제하고 화면 크기를 다시 바꾸지 않음 |
| 회귀 | 관련 로비6개 테스트 파일132건 PASS. 이번 수정은 CSS 치수 복원·캐시 키 변경이며 생성·취소·이름 조합·초점 처리 코드는 변경하지 않음 |
| 캐시·상태 | index.html의 ui-refinement.css?v=20260929-lobby-size-preserved. tmp/lobby-size-restore-20260929에 백업·검색·검수·patch 보관. .git 읽기 전용으로 커밋 미완료, 타 작업 스테이징 보존 |

## 2026-09-29 로비 선택 이미지와 언어 갱신

| 항목 | 현행 계약 |
|---|---|
| 표시 | 미선택은 전대 이름/소환 표제/설명, 선택은 캐릭터 이름/번역된 직업. 내부 DEMO CHARACTER는 대검전사 / Greatsword Warrior |
| 갱신 | _applyLobbyLang의 _updateCharDisplay(_selectedCharDisplay) 경로 유지. 같은 외형의 영상 src·현재 시간·폴백 상태 유지; 카드/이미지 DOM과 저장 원문 유지 |
| 상세 | [선택 상태 SSOT](<../3.1 ui hud 디자인/LOBBY_ANCESTOR_ART_20260928.md>). 새 번역 키 없음 |
