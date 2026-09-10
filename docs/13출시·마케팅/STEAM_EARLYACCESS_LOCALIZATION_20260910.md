# Steam 앞서 해보기 답변 현지화 — 2026-09-10

App ID `4749590`, Store Item ID `1189321`, EXODUSER: HELL LORD. 사용자가 지정한 상점 편집 화면에 앞서 해보기 답변을 번역·등록하고 서버 재내보내기로 검증했다.

| 항목 | 결과 |
|---|---|
| 언어 범위 | 실제 편집기·전체 JSON의 30개 언어. 아랍어 입력 항목 없음. Steam China 다운로드 옵션은 별도 독립 언어 키 없음 |
| 앞서 해보기 | 30언어×6답변=180필드 저장·정확 일치. 영어6개 한국어 오입력 교정, 나머지28언어168개 신규, 한국어6개 원문 보존 |
| 기존 상점 소개 | 30언어의 짧은 설명·상세 설명60필드 존재. 2026-09-09 최종 검증본과 동일하며 이번 작업 후에도 보존 |
| 비대상 필드 | 전체 재내보내기에서 앞서 해보기 외 변경0건. 한국어 전체 항목 원본 일치 |
| 표시 확인 | 재로드된 영어6답변 및 일본어6답변의 실제 편집 화면 확인 |
| 공개 상태 | Steamworks 저장 완료. 상점 최초 게시 전 Valve 검토·승인 안내가 남아 있음. 이번 작업은 Publish, EA 상태, 검수 요청, 가격 설정, 빌드·디포 변경을 수행하지 않음 |
| 검토 수준 | 한국어 원문 의미와 계획·가능성 표현을 유지한 번역. 별도 원어민 감수 완료를 뜻하지 않음 |

## 답변별 계약

| JSON 키 접미사 | 내용 | 보존 기준 |
|---|---|---|
| `why` | 앞서 해보기 이유 | 조작·탄막 패링·사슬·스킬·장비의 연결, 실제 플레이 피드백으로 밸런스·빌드·보스·사용 경험 개선 |
| `how_long` | 진행 기간 | 핵심 콘텐츠·시스템 완성과 출시 수준의 밸런스·안정성이 기준. 고정 기간·출시일 추가 없음 |
| `full_version` | 정식 버전 계획 | 지역·스테이지·보스·적·스킬·장비 확장 및 품질 개선 계획. 개발·피드백에 따라 조정 가능 |
| `current_state` | 현재 구현 | 핵심 전투·패링·사슬 이동·액티브/조합·파밍/빌드, 복수 지역·적·보스. 구체 콘텐츠 수 추가 없음 |
| `pricing` | 가격 방침 | 개발 진행·추가 콘텐츠 규모 고려, 정식 출시 때 변경 가능, 결정 시 사전 안내. 가격 인상·고정 가격 약속 추가 없음 |
| `community` | 커뮤니티 참여 | Steam 커뮤니티·플레이어 의견, 버그·경험 검토 및 개발에 도움이 되는 피드백 반영 |

공통 접두사는 `app[content][earlyaccess]`이다. 한국어는 원래 영어 칸에도 들어 있던 동일한 원문과 일치하며 그대로 유지했다. 스페인/중남미, 포르투갈/브라질, 중국어 간체/번체는 지역별로 작성했다.

## 언어별 결과

| 언어 코드 | 답변 | 저장 재조회 |
|---|---:|---|
| english | 6 | PASS |
| french | 6 | PASS |
| italian | 6 | PASS |
| german | 6 | PASS |
| spanish | 6 | PASS |
| greek | 6 | PASS |
| dutch | 6 | PASS |
| norwegian | 6 | PASS |
| danish | 6 | PASS |
| russian | 6 | PASS |
| romanian | 6 | PASS |
| malay | 6 | PASS |
| vietnamese | 6 | PASS |
| bulgarian | 6 | PASS |
| swedish | 6 | PASS |
| latam | 6 | PASS |
| ukrainian | 6 | PASS |
| indonesian | 6 | PASS |
| japanese | 6 | PASS |
| schinese | 6 | PASS |
| tchinese | 6 | PASS |
| czech | 6 | PASS |
| thai | 6 | PASS |
| turkish | 6 | PASS |
| brazilian | 6 | PASS |
| portuguese | 6 | PASS |
| polish | 6 | PASS |
| finnish | 6 | PASS |
| koreana | 6 | PASS·원문 유지 |
| hungarian | 6 | PASS |

## 산출물과 재검증

폴더: `output/steam_earlyaccess_20260910/`.

| 파일 | 용도 |
|---|---|
| `original_all.json` | 9월10일 변경 전 전체 상점 JSON 백업, 다운로드 `(7)` |
| `<language>.json` 29개 | 영어·신규28언어의 답변6개. 배열 순서는 위 계약 표 순서 |
| `pilot_upload.json`, `pilot_verified_all.json` | 영어·한국어 시범 업로드 및 정확 일치 확인, 다운로드 `(8)` |
| `all_upload.json` | 30언어×6필드만 포함한 실제 업로드 파일 |
| `final_verified_all.json` | 업로드 후 서버 전체 재내보내기, 다운로드 `(9)` |
| `verification.json` | 언어별 정확 일치·기존 소개 존재/길이·비대상 보존·해시 |

지원되는 다운로드 이벤트 대기와 파일 선택 UI를 사용했다. 최초 직접 다운로드는 `ERR_BLOCKED_BY_CLIENT`였으나 다운로드 이벤트 방식으로 정상 저장됐고 보안 설정을 변경하지 않았다. 파일 선택 뒤 값 조회가 시간 초과한 경우 화면에 `all_upload.json`이 표시됨을 확인한 후 업로드했다. 업로드 성공은 버튼 클릭만으로 판단하지 않고 최종 재내보내기의180필드 일치로 판정했다.

| 무결성 | SHA-256 |
|---|---|
| all_upload.json | `a93464daf188b5f419bc8aa647ad61df8f8a69534b98b154ae24a1402376f60f` |
| final_verified_all.json | `d00a844f4035e2b3f2f598342a31c137be3bccb7856853b5d1042d32ac2d792c` |

기존 [상점 설명 현지화 기록](STEAM_STORE_LOCALIZATION_20260909.md)을 이어받으며, [대시보드 감사](STEAM_DASHBOARD_AUDIT_20260909.md)의 A12 영어 답변 오입력은 이번 작업으로 해결됐다. 게임 내부의31지원항목·29코드와 상점 편집기의30언어는 별도 범위다.
