
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
| game.html renderSettings / charSelectGrid | 이름·설명 리프에 `_T(ch.name)` / `_T(ch.desc)` 적용. 기존 영어 전사 이름·설명의 조회 우회 수정. 신규 번역·전투·아트 변경 없음 |
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
