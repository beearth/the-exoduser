# Steam 지원 언어 범위 — 2026-09-09

사용자의 최신 `스크린샷 2026-09-09 141010.png`를 구현 목표로 확정했다. **31개 Steam 항목의 인터페이스·자막**을 지원한다. 오디오는 “오디오는 다 체크해제야 자막 인터페이스만하면돼” 지시가 우선하므로 신규 더빙을 추가하지 않는다. 기존 영어 영상 음성은 유지한다.

## 언어 대응

| Steam 언어 ID | 내부 코드 | 언어 |
|---|---|---|
| koreana | ko | 한국어 |
| english | en | 영어 |
| schinese | zh | 중국어 간체 |
| tchinese | zht | 중국어 번체 |
| japanese | ja | 일본어 |
| spanish, latam | es | 스페인어, 중남미 스페인어 공통 번역 |
| french | fr | 프랑스어 |
| german | de | 독일어 |
| russian | ru | 러시아어 |
| brazilian, portuguese | ptbr | 브라질·포르투갈 포르투갈어 공통 번역 |
| italian | it | 이탈리아어 |
| vietnamese | vi | 베트남어 |
| thai | th | 태국어 |
| indonesian | id | 인도네시아어 |
| malay | ms | 말레이어 — 이번 목표에 포함 |
| turkish | tr | 튀르키예어 |
| polish | pl | 폴란드어 |
| czech | cs | 체코어 |
| hungarian | hu | 헝가리어 |
| bulgarian | bg | 불가리아어 |
| greek | el | 그리스어 |
| finnish | fi | 핀란드어 |
| swedish | sv | 스웨덴어 |
| danish | da | 덴마크어 |
| norwegian | no | 노르웨이어 |
| dutch | nl | 네덜란드어 |
| romanian | ro | 루마니아어 |
| ukrainian | uk | 우크라이나어 |
| arabic | ar | 아랍어 |

31개 Steam 항목은 **29개 내부 언어**로 해석된다. `brazilianportuguese`는 기존 호환 별칭으로 유지한다. 두 지역별 전용 어휘 감수는 별도이며 공통 번역을 사용한다. [Steam 공식 언어 코드](https://partner.steamgames.com/doc/store/localization/languages?language=english).

## 구현과 검증 상태

| 대상 | 현행 계약 | 상태 |
|---|---|---|
| 언어 선택 | 로비·영화·게임 드롭다운 29개, `hellLang` 저장, Steam malay/brazilian 해석 | 게임29언어·로비4개 선택창×29언어 브라우저 검사 통과 |
| 세계관 영상 | 29언어 × 32큐 = 928개, SRT/VTT 각 29개 = 58개 | 말레이어 추가, 기존 타이밍·음성 유지, 단위 검사 통과 |
| 캐릭터 전쟁 서사 | KO 34개 연출 큐 중 유효 대사 21개 × 번역 28언어 | 번역·적용 완료 |
| 네메시아 컷신 | KO 27개 연출 큐 중 유효 대사 18개 × 번역 28언어, 22b 경고 포함 | 번역·적용 완료 |
| 화자 이름 | 내부 GODDESS는 네메시아 이름으로 표시. 3명 × 28언어 = 84개 | 번역·검사 완료 |
| 자막 줄바꿈 | 폭 84%, 단어·문자소 경계, 대사 줄 수에 맞춰 하단 영역 확대 | 28언어 × 39문장 × 3해상도 = 3,276개 글자 경계 검사 통과 |
| UI 번역 | MAIN 원본576 + EXTRA66 + 성장 화면137 = 등록779키 | MAIN27언어13,300개, EXTRA27×66=1,782개, 성장 화면27×137=3,699개 보완. 초안 옵션 없는 번들 생성·커버리지 통과 |
| 동적 UI | `_L(ko,en,values)`로 번역 후 `{n}`/`{p0}` 등 값 삽입. 스킬 강화24개 대입·능력치 투자/환불·창고/분해/제작/초기화11개 호출·구역명 적용 | 스킬 강화 KO/EN 수치·계산 동등성 검사 통과 |
| 말레이어 기본 카탈로그 | MAIN 2716 / PFX 48 / BASE 53, 로비 82키 | PFX13+BASE11개 의미 보정·MAIN 단독 조회 반영 검수 통과. 추가 UI66개·본문575개 검수 통과, 1280×720 능력치 화면 확인 |
| 아랍어 | 문서 `lang=ar,dir=rtl`, 본문 우측 정렬·BiDi, 수치/키 LTR, 캔버스 자막 방향 지정 | 방향 전환·캐릭터 자막 경계 검사 통과, UI493개 검수 후 1280×720 능력치 화면 연결 글자·우측 정렬 확인 |

캐릭터 번역 원본과 의미 검토 기록은 [캐릭터 자막 계약](CHARACTER_STORY_TRANSLATIONS_20260909.md)을 따른다. 모든 번역은 출시용 원어민 감수를 완료한 상태로 간주하지 않는다. 이전 Phase별 카탈로그 완성 기록은 해당 시점의 이력이며 이후 추가 문구까지 보증하지 않는다.

## 데이터·갱신 계약

| 파일/함수 | 책임 |
|---|---|
| `localization-runtime.js` / `ExoduserI18n` | 언어 코드 해석, 문서 방향, 치환, 줄바꿈, 원문 연출 메타데이터 보존형 자막 캐시 |
| `localization/character-story/<code>.json` | prologue/intro ID별 자막과 speakers 이름 |
| `localization/ui-source.json`, `ui-needed.json` | KO·EN 원문 레지스트리와 이번 추가 번역 작업 목록 |
| `localization/ui-growth-source.json`, `ui-growth/<code>.json` | 계획·적용·취소, 6경로·26패시브, 속성 상세와 효과 수치 레이블137개 |
| `localization/ui/<code>.json` | 언어별 UI 보완 원본. 키·치환 토큰 보존 |
| `localization/ui-aliases.json` | 공백 차이 및 명시적으로 같은 뜻인 기존 키 재사용 |
| `tools/build-localization.mjs` | 원본→`localization-data.js` 생성. 기본 실행은 누락을 오류 처리, `--draft`는 진행 중 검사 전용 |
| `tools/build-malay-catalog.mjs` | ID 원본과 명시적 말레이어 어휘·문장 보정으로 독립 `lang_ms.js` 생성 |
| `tools/build-malay-subtitles.mjs` | 말레이어 32큐 및 SRT/VTT 생성 |
| `localization.css` | 아랍어 폰트·방향·줄바꿈. 게임 공간 캔버스는 LTR 유지 |
| 로비 병합 | 인라인 로비 테이블+외부 로비 테이블을 언어별 병합 후 UI 보완 적용. 외부 객체 때문에 인라인 전용 키가 소실되지 않음 |
| 패키징 | `build-nwjs.mjs`에 runtime/data/CSS 포함, `lang_*.js` 수집으로 말레이어 포함 |

## 완료 검사

1. MAIN27개 언어와 EXTRA·성장 화면을 작성하고 치환 토큰을 검사했다. MAIN24개 언어는 독립 스펙·품질 PASS, NO는 독립 검토의 접기 버튼 교정 반영, NL·EL과 성장 화면은 통합 담당 검토다. 원어민 감수 완료를 뜻하지 않는다.
2. 초안 옵션 없이 번들 생성과 카탈로그 커버리지 검사를 통과했다. 관련 단위·통합 검사45개 PASS.
3. 실제 로비29언어×선택창4개, 게임29언어, 성장 화면29언어×43상태=1,247상태를 검사했다. 새 진입 시 로비의 malay가 ms로 반영됨을 확인했다. 긴 패시브 이름은 문자소 경계 줄바꿈을 허용한다.
4. 관련 docs를 현행 계약에 동기화한다. Steam 상점 설정 변경·빌드 업로드는 이 로컬 업데이트와 별개이며 수행하지 않았다.
