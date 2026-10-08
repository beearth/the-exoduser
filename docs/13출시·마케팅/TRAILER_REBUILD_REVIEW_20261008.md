# EXODUSER: HELL LORD — 대표 트레일러 재제작 검토

기준일: **2026-10-08 KST**. 사용자 피드백은 “진짜 게임 트레일러도 기존 다른 게임 양식은 전혀 없고 그냥 대충 만든 느낌이 너무 난다”, “누가 게임 트레일러를 저렇게 만드냐”다. 기존 결과는 **사용자 거부 / 대표 트레일러 편집 품질 FAIL**로 기록한다. 파일 재생 성공과 광고로서의 완성도를 분리한다.

이 문서는 재제작의 근거와 검수 계약이다. 새 렌더·새 촬영·새 게시가 완료됐다는 기록이 아니다. **새 메인 트레일러는 검수용 DRAFT로 제작하며, 사용자 검수·승인 전 추가 공개하지 않는다.** 기존 공개 영상의 URL·공개 상태는 이 문서가 변경하지 않는다. 기존 영상 비공개·교체 여부도 실제 플랫폼 작업 기록으로 별도 확인한다.

## 1. 확인 범위와 기존 소재의 한계

내부 근거: [촬영 manifest](FRESH_CAPTURE_MANIFEST_20261008.md), [기존 편집 계약](VIDEO_EDIT_PLAN_20261008.md), [납품·검수 기록](VIDEO_DELIVERY_20261008.md). 총괄의 실제 풋티지 감사와 사용자 피드백을 함께 반영했다. 이 문서 작성자가 추가로 영상을 전구간 시청하거나 오디오를 청취했다는 뜻은 아니다.

| 항목 | 확인된 상태 | 제작에 주는 제약 |
|---|---|---|
| 채택 원본 | 같은 CH1 정상 맵의 패링·강타·불·얼음·블랙홀 5개 staged 시연 | 서로 다른 지역·일반 성장 과정·장시간 자연 플레이의 증거로 사용하지 않는다 |
| 촬영 조건 | Lv500 showcase, 인위적 적 배치·높은 HP·자원 보충·scripted take. 상세값은 촬영 manifest를 따른다 | 정규 데모 난이도·일반 무편집 플레이로 소개하지 않는다 |
| 준비 입력 길이 | 패링 5초 + 강타 7초 + 불 8초 + 얼음 7초 + 블랙홀 7초 = **34초** | 이 34초 전체가 광고에 적합한 화면이라는 뜻은 아니다. 반복·정지·늘이기로 긴 트레일러를 만들지 않는다 |
| 기존 가로본 | 패링 0–4 → 강타 4–11 → 불 11–19 → 얼음 19–26 → 블랙홀 26–33 → CTA 33–37초 | 실제 전투 33초를 스킬 순서대로 이어 붙인 구조. 전투 접근·위험 대응·보상으로 이어지는 흐름이 부족하다 |
| 기존 CTA 오디오 | 마지막 4초 의도적 무음. 게임 구간은 원음 유지 | 전투 종료부터 브랜드·행동 안내까지 오디오 흐름을 다시 설계해야 한다 |
| 미확보 소재 | 충분한 자연 이동·적 조우·보스전·루팅·장비 변화. 후속 자연 플레이 촬영 상태는 §9 참고 | 확보 전에 보스·전리품·풍부한 지역·성장 장면을 문구나 다른 게임 자산으로 대체하지 않는다 |
| 일반 데모 원본 | 20초 manual은 경고·피격/쓰러짐 구도 문제로 광고 제외, 로컬 감사 보존 | 일반 플레이가 이미 확보됐다는 보고에 사용하지 않는다 |
| Steam 동일성 | 개발 런타임과 공개 Steam 데모 바이너리·전체 에셋 동일성 미검증 | “현재 Steam 데모 그대로”라고 단정하지 않는다 |

## 2. 기술 QA와 편집 품질 판정

| 검수 계층 | 기존 결과 | 판정의 정확한 의미 |
|---|---|---|
| 파일·코덱·프레임·전체 decode | **PASS** | 기존 납품 기록의 가로 37초, 1920×1080, 30fps, 1,110프레임, H.264/AAC 검사 범위. 파일 손상 없음 |
| 보존 원본과 시간 대조 | **PASS — 기록된 표본 범위** | 대조한 표본의 원본 시간 진행이 맞음. 전구간 연출·재미·가독성 승인으로 확대하지 않는다 |
| contact sheet 화면 검사 | **기존 표본 PASS 이력 보존** | 기록한 정지 표본에 대한 결과. 사용자 시청 후의 대표 영상 편집 품질 FAIL을 뒤집지 않는다 |
| 오디오 신호·decode | **PASS — 신호 검사 범위** | 오디오 트랙과 신호 확인. 주관적인 전구간 청취는 미수행 |
| 대표 트레일러 편집 품질 | **FAIL / USER REJECTED** | 장르의 플레이 매력, 장면 선정, 전개·리듬·오디오·브랜드 완성도가 공개 대표 영상 기준에 미달 |
| 신규 검수본 | **DRAFT / NOT RENDERED BY THIS DOCUMENT** | 새 파일의 실제 검수와 사용자 승인이 필요. 새 렌더 성공을 미리 PASS 처리하지 않는다 |

“RELEASE_READY” 등 기존 패키지 검수 결과는 당시 기술·표본 검수 이력으로 남긴다. 현재 재제작 대상의 광고 품질 승인이나 추가 배포 허가로 재사용하지 않는다.

## 3. 먼저 만드는 24–40초 검수본

현재 원본만으로 완성된 ARPG 전체 경험을 보여 주는 데 한계가 있다. 첫 검수본은 **전투 스킬 중심의 개발 영상**이라는 범위를 지키면서 구도·가독성·장면의 완결성·오디오를 개선한다. 새 자연 플레이 확보 전에는 이 초안을 최종 대표 트레일러로 확정하지 않는다.

아래는 **34초 목표의 제안 타임라인**이다. 원본의 확정 trim이나 구현 상수가 아니며, 실제 프레임 감사 후 조정한다. 각 구간에 읽을 수 있는 행동이 없으면 삭제하고 24–40초 범위에서 단축한다.

| 제안 구간 | 화면·역할 | 선택·편집 기준 |
|---|---|---|
| 0–3초 | 가장 읽히는 강타 또는 밀집 전투의 공격·결과 | 긴 로고·검정 화면 없이 시작. 첫 3초에 주인공·적·타격 결과가 보여야 한다 |
| 3–8초 | 패링: 접근 탄 → 성공 → 반격 결과 | 성공 섬광만 떼지 말고 위험과 대응을 연결. 화면에서 확인되는 성공만 채택 |
| 8–14초 | 불 계열: 발동 → 공격 진행 → 적 반응 | 효과가 화면을 덮는 부분보다 플레이어의 행동과 적 반응이 읽히는 구간 선택 |
| 14–20초 | 얼음 계열의 다른 전투 리듬 | 직전 컷과 구분되는 공격 동작·효과를 보여 준다. 글씨로 없는 차이를 만들지 않는다 |
| 20–27초 | 블랙홀 계열의 시작·성장·결과 | 실제 촬영에 있는 효과만 사용. 효과 발동 전에 자르거나 결과 없이 끊지 않는다 |
| 27–30초 | 남은 원본에서 독립적으로 완결된 강한 타격 | 앞 컷의 공격 결과처럼 속이지 않는다. 유효한 새 순간이 없으면 이 3초를 삭제하고 총 31초로 마감 |
| 30–34초 | 게임 로고와 Steam 데모 안내 | 27–30초 삭제 시 27–31초로 이동. 실제 게임명과 확인된 무료 데모 안내만 표시 |

동일 사건을 반복 재생해 분량을 채우지 않는다. 서로 다른 take를 하나의 연속 전투처럼 위장하지 않는다. 컷 길이는 효과의 발동과 결과가 읽히는 시간을 우선하며, 음악 박자 때문에 핵심 결과를 자르지 않는다. 45–60초 확장은 아래 신규 촬영이 확보될 때 검토한다.

## 4. 화면·문구·오디오 원칙

| 항목 | 검수 계약 |
|---|---|
| 화면 | 가로 16:9 전체 플레이 화면 유지. 확대가 필요해도 캐릭터·적 전조·공격 결과를 함께 읽을 수 있어야 함. Canvas 원본에 없는 HTML HUD를 복원했다고 주장하지 않음 |
| 텍스트 | 홍보 문구 **최대 3개**, 각 장면에 짧게 표시. 자막 배경은 투명, 필요한 얇은 윤곽·그림자로 대비 확보. 큰 불투명 박스·설명판으로 액션을 가리지 않음 |
| 기존 표시 | staged 개발 시연이라는 작은 출처 표시 유지. 이 필수 표시와 게임 로고는 아래 홍보 문구 3개와 별개이며, 화면을 가리지 않는 위치에서 실제 미리보기로 확인 |
| 장면 전달 | 영상만으로 기능이 읽힌 다음 짧은 문구가 보조. 실제 패링이 불명확하면 패링 문구도 제외 |
| 속도 | 실제 동작 속도 유지. 촬영 실패를 속도 변경·프레임 보간·정지 화면으로 감추지 않음 |
| 원음 | 타격·스킬·적 반응을 들을 수 있도록 원음 우선. 의도하지 않은 뚝 끊김·과도한 음량·클리핑·무음 공백을 전구간 청취 |
| 음악 | 기존 게임 음악 중 사용 권리가 확인되고 장면에 맞는 트랙만 검토. 새 음악 생성·권리 미확인 외부 트랙 사용 금지. 기존 원음에 음악이 포함됐다면 이중으로 겹치지 않음 |
| CTA 마감 | 적절한 원음 tail 또는 확인된 음악의 종지를 활용해 마무리. 새 소리나 음악을 사용하지 못하는 경우에도 4초 무음을 자동으로 정답 처리하지 않고 짧은 마감 길이를 검토 |
| 검수 대상 | 정상 크기·축소 미리보기, 무음·유음 두 조건에서 전체 재생. 프레임 표본과 파형 검사는 전체 시청·청취를 대체하지 않음 |

문구 후보는 다음 **3개**로 제한한다. 실제 장면이 증명하지 못하는 문구는 삭제한다.

| ID | 영문 문구 | 사용할 수 있는 조건 |
|---|---|---|
| T1 | **PARRY & COUNTER** | 적 공격·성공한 패링·반격 결과가 모두 읽힐 때 |
| T2 | **UNLEASH YOUR SKILLS** | 실제 스킬 발동과 적 반응이 읽힐 때 |
| T3 | **PLAY THE FREE DEMO ON STEAM** | 마지막 CTA. 무료 Windows Steam 데모의 실제 공개 상태 유지 확인 |

“세계 최초”, “차세대”, “완벽한”, 검증되지 않은 수치·클래스 수·지역 수·플레이 시간은 사용하지 않는다. 이번 5개 staged take만으로 보스·루팅·빌드 다양성 전체를 약속하지 않는다. 공개 문안에는 개발 빌드와 Steam 데모의 차이 가능성, 기존 AI 보조 아트/오디오 공개를 유지한다.

## 5. 실제 대표 트레일러에 필요한 신규 촬영

| 우선순위 | 신규 촬영 요구 | 통과 기준 |
|---|---|---|
| P0 | 일반 플레이의 이동 → 적 조우 → 밀집 전투 → 생존/처치 흐름 | 정상 카메라·실제 입력·현재 공개 데모 또는 식별된 개발 빌드. 경고·디버그 화면·캐릭터 소실·떨림·끊김이 없는 연속 구간 확보 |
| P0 | 탄막 패턴 인지 → 회피 또는 패링 → 반격 | 단순 효과 전시가 아닌 플레이 선택과 결과가 보임. 실제 보호 설계·조작 규칙을 바꾸지 않음 |
| P1 | 다른 전투 구도·몹 조합의 실전 | 같은 위치의 5개 스킬 시연과 구별되는 화면. 게임에 존재하는 환경만 촬영하며 새 맵 제작으로 범위 확장하지 않음 |
| P1 | 실제 드롭 → 획득 → 장비/성장 결과 | 현재 빌드에서 동작하고 화면에 읽힐 때만 채택. 가짜 드롭·가짜 UI·정지 이미지를 실제 플레이처럼 합성하지 않음 |
| P1 | 보스·강적의 전조 → 대응 → 반격 | 실제 촬영과 원본 확보가 전제. 미확보 상태는 백로그로 유지하고 트레일러에서 약속하지 않음 |
| P0 | 원본·실행 빌드 식별과 격리 | source Git/hash·실행 경로·실제 촬영 날짜·take·원본 길이·FPS·오디오·staging 여부 기록. 사용자 세이브·개발 세션 보존 |

대표 영상에 필요한 소재가 부족하면 신규 촬영을 이어간다. 부족한 부분을 다른 게임 자산·AI 가짜 게임플레이·과장 문구로 채우지 않는다. 버그가 드러난 틈은 개선 확인 전까지 일반 대표 전투 소재와 분리하며, 개발 기록으로 사용할 때는 WIP 버전을 표시한다.

## 6. 편집 품질 실패 체크 5개

다음 중 하나라도 해당하면 공개 대표 영상 승인을 보류하고 수정한다.

1. 파일·코덱·decode 검사 통과를 재미·편집·시각 품질 승인으로 바꿨다.
2. 첫 10초 무음 시청에서 주인공의 행동·위험·타격 결과가 읽히지 않는다.
3. 큰 글씨·배경판·과도한 확대가 캐릭터·적 전조·핵심 아트를 가린다.
4. 효과 나열·같은 사건 반복으로 분량을 채우고, 공격의 시작·대응·결과나 오디오 고조가 끊긴다.
5. staged 시연을 일반 플레이로 오인하게 만들거나, 화면에 없는 기능을 약속하거나, 마지막 게임명·Steam 데모 안내가 불명확하다.

신규 파일의 기술 QA, 전체 시청·청취, 편집 품질 판정, 사용자 승인, 실제 게시를 각각 별도 상태로 기록한다. 검수용 파일은 DRAFT라는 이름·상태를 유지하고 승인 전 추가 공개하지 않는다.

## 7. 공식 참고자료와 확인 범위

| 공식 출처 | 이번에 확인한 내용 | EXODUSER에 적용하는 판단 |
|---|---|---|
| [Steamworks — Trailers](https://partner.steamgames.com/doc/store/trailer?l=english) | 첫 트레일러는 플레이어가 실제로 보게 될 시점의 게임플레이 중심을 권장. HUD는 플레이 이해에 도움이 될 수 있음. 10초 이내 인상과 무음 시청을 고려하도록 안내 | 먼저 실제 플레이를 이해시키고, 글씨·로고·컷씬이 이를 대신하지 않게 한다 |
| [Path of Exile 2 — Early Access Gameplay Trailer](https://www.youtube.com/watch?v=0VZsq_vJjGk) / [공식 발표](https://www.pathofexile.com/forum/view-thread/3587754) / [공식 발표 영상](https://www.youtube.com/watch?v=ZpIbaTXJD4g) | 공식 채널·공식 연결 확인. 발표 영상 설명의 Opening Cinematic과 Gameplay Trailer 챕터가 분리됨 | 세계관 컷씬과 실제 전투 소개의 목적을 구분한다 |
| [Last Epoch — Official Technical Trailer](https://www.youtube.com/watch?v=ddvY964TCoQ) / [공식 Launch Trailer 발표](https://forum.lastepoch.com/t/launch-trailer-echoes-from-the-void/61870) | 공식 채널 게시 확인. 공식 발표는 Launch Trailer와 CGI Trailer를 구분함 | 대표 플레이 소개에 필요한 실제 전투 증거를 별도로 확보한다 |
| [Hades II — v1.0 Gameplay Showcase](https://www.youtube.com/watch?v=-SnaCUsUF3E) / [공식 게임 페이지](https://www.supergiantgames.com/games/hades-ii/) | Supergiant 공식 채널·공식 페이지 연결 확인. 공식 페이지는 Launch Trailer와 Gameplay Showcase를 각각 연결함 | 시네마틱 소개와 플레이 쇼케이스를 목적에 맞게 편집한다 |

2026-10-08 web 조사로 공식 페이지·영상 제목·게시자·설명·연결을 확인했다. 참고 영상들을 실제 재생 시청한 초 단위 분석은 수행하지 않았으므로 그러한 분석을 근거로 제시하지 않는다. 첫 3초 hook·24–40초 검수본·문구 최대 3개는 **이번 재제작의 편집 판단**이며 Steam 공식 규정이나 참고작의 확정 타임라인이 아니다. 다른 게임의 자산·음악·고유 문구·레이아웃을 복제하지 않는다.

## 8. 이번 문서 작업 범위

초기 문서 작업은 관련 `37초|Lv500|scripted|편집품질|사용자.*거부|TRAILER_REBUILD_REVIEW`를 마케팅 docs에서 검색하고 기존 manifest·편집 계약·납품 기록을 확인했다. 후속 도구 구현 후에는 `marketing_trailer_rebuild_20261008|EXODUSER_REBUILD_|PARRY & COUNTER|UNLEASH YOUR SKILLS|TRAILER_REBUILD_REVIEW_20261008`를 docs 전체에서 검색해 이 문서에 신규 계약을 기록했다.

담당 변경은 **이 문서·`tools/marketing_trailer_rebuild_20261008.jsx`·`marketing/trailers/rebuild-20261008/edit-plan.json` 세 파일**이다. 영상·다른 docs·CHANGELOG·공용 인덱스는 수정하지 않았으며, 촬영·native 빌드·렌더·공개·커밋은 수행하지 않았다. 기존 문서의 현행 상태 갱신과 실제 재제작 결과 기록은 총괄 담당이다.

## 9. 후속 native DRAFT builder 계약

후속 총괄 보고에서 일반 Lv1 수동 키 UI 플레이 **20초·9킬·실측 렌더 FPS 54.96** 촬영 성공을 확인했다. 전투값·적 배치 변경은 없다고 보고됐으나 첫 다운로드가 실패해 기존 3338 서버 저장 경로로 재촬영 중이다. 따라서 **영구 파일·최종 길이·정확 trim은 아직 미확정**이다. 아래 원본 계획의 `natural`은 `CAPTURED_PENDING_DURABLE_FILE`로 남겼으며 저장 성공을 미리 주장하지 않는다. 실측 렌더 FPS와 향후 CFR30 준비·출력 FPS는 별도다.

| 파일 | 실제 역할 | 현 상태 |
|---|---|---|
| [native builder](../../tools/marketing_trailer_rebuild_20261008.jsx) | 선택 manifest를 검증하고 새 native 16:9 프로젝트를 authoring하는 스크립트 | **DRAFT SCRIPT / NATIVE BUILD NOT RUN / NO RENDER / NO UPLOAD** |
| [source·shot plan](../../marketing/trailers/rebuild-20261008/edit-plan.json) | 원본 목록·6개 제안 shot 역할·선택 필드·환경변수 계약 | **DRAFT_AWAITING_ROOT_SELECTION**. 정확한 from/dur/prepared는 null, 임의 최종 trim 없음 |

§3은 기존 소재만 사용했을 때의 편집 제안이다. 새 자연 플레이를 포함한 실제 순서·정확한 원본 구간·최종 길이는 **총괄이 시청 후 작성하는 선택 manifest**가 결정한다. 도구는 분량을 자동으로 만들거나 누락된 영상을 다른 자산으로 대체하지 않는다.

### 입력과 사전 검증

| 항목 | 구현 계약 |
|---|---|
| 필수 환경변수 | `EXODUSER_REBUILD_INPUT_DIR`, `EXODUSER_REBUILD_MANIFEST`, `EXODUSER_REBUILD_PROJECT_DIR` |
| 선택 환경변수 | `EXODUSER_FFPROBE`는 실행 경로, 기본 `ffprobe`. `EXODUSER_REBUILD_REPLACE_OWN_DRAFT=1`은 이 도구가 소유 마커를 남긴 초안의 명시적 재빌드에만 사용 |
| 선택 상태 | `schemaVersion=1`, `status=DRAFT_SELECTED`, `publication=DRAFT_ONLY`, 1920×1080·30fps. 제공된 미선택 JSON은 명확한 오류로 중단 |
| shot 필드 | 고유 `id`, 원본 목록 key인 `source`, 일치하는 `type=natural|staged`, 원본 감사용 `from`, 선택 길이 `dur`, 사전 trim MP4 경로 `prepared`, `title=null|parry|skills` |
| 원본 확인 | 선택 원본의 `status=DURABLE_FILE_VERIFIED` 필요. `natural`은 총괄이 실제 영구 파일을 확인한 뒤 변경. 원본 출처·해시는 총괄이 기록하며 builder의 prepared 검증이 이를 대신하지 않음 |
| from/dur | 숫자·유한값·30fps 프레임 격자 검사. `from`은 원본 선택 구간의 감사 정보, **native cut from은 항상 0** |
| 준비 파일 | 각 shot별로 먼저 trim하고 PTS0으로 맞춘 **H.264/yuv420p CFR30 1920×1080 MP4 + AAC stereo 원음 1트랙**. 실제 decoded frame 수가 해당 `dur×30`과 정확히 같아야 함 |
| 실제 프레임 검사 | `ffprobe -count_frames -show_frames`로 decoded frame 수와 모든 video PTS를 검사. frame i의 PTS는 `i/30`과 오차 0.00001초 이내. 첫 PTS도 0이어야 함 |
| 컨테이너 길이 | AAC tail을 영상 coverage로 사용하지 않음. 컨테이너 duration 주장 대신 실제 decoded frames·매프레임 PTS 검사 |
| 최종 길이 | 선택 shot의 프레임 합계로만 24–40초. 부족분에 무음 카드·정지 프레임을 자동 추가하지 않음 |
| 로고 | `assets.logo.verifiedOriginal=true`, 실제 기존 게임 로고 이미지 파일 필요. 기본 후보는 `img/brand/logo_transparent.png`, 총괄이 원본을 확인·복사한 후 사용. 새 생성·텍스트 대체 로고 없음 |
| 빌드 보호 | 모든 사전 검증 후에만 project 생성. 기존 `project.json`이 있는 경우 소유 마커와 명시적 own-draft 재빌드 플래그 없이는 중단. 공용·사용자 편집 프로젝트에 whole build 금지 |

### 실제 화면·오디오 구현

| 요소 | native 구현 |
|---|---|
| 플레이 영상 | `p.cut(handle,{from:0,dur,at,fit:"contain"})`, 1920×1080 전체 화면. 실제 원음 1회 유지 |
| 짧은 제목 | `PARRY & COUNTER`, `UNLEASH YOUR SKILLS` 각각 최대 1회. x96/y72/w1728/h64, DM Sans 38px·700, 투명 배경·1px 윤곽·작은 그림자 |
| 제목 시간 | 선택 shot 안에서 기본 0.3초 뒤·최대 2초. 선택 `titleAt`/`titleDur` 지정 가능하며 프레임 격자·shot 범위를 검사. 최소 18프레임 |
| staged 표시 | staged shot에서만 x96/y1006/w1728/h34, 20px의 `Staged skill demo · Development build`. 자연 플레이 shot에 staged 표시를 붙이거나 staged shot의 표시를 없애지 않음 |
| fade | native `animate` opacity keyframes. 시작·종료 각 **6프레임/0.2초**, 나머지 1 유지. HTML/CSS·콜백·미지원 스타일 없음 |
| CTA | 마지막 **2–4초의 실제 gameplay shot** 위에 원본 로고와 `PLAY THE FREE DEMO ON STEAM`만 투명 합성. 마지막 shot id를 `cta.shotId`로 지정하고 다른 제목은 금지 |
| CTA 좌표 | 로고 x500/y250/w920/h450 contain, Steam 문구 x192/y840/w1536/h76·48px·700. 원본 구도와의 겹침은 총괄의 실제 프레임 검수 대상 |
| CTA 오디오 | 마지막 gameplay spine의 실제 원음을 유지. 별도 4초 무음 카드·새 음악·새 효과음·새 보이스 없음 |
| 결과 기록 | 프로젝트 안의 `fdg-selected-build-plan.json`에 선택 구간·native from0·프레임·검증값·DRAFT·미렌더·미승인·미업로드 상태 저장. 이는 렌더 영수증이 아님 |

마지막 shot은 로고 때문에 중요한 전투가 가려지지 않는 읽기 쉬운 구간을 총괄이 고른다. staged 표시·글씨·로고 위치와 fade의 실제 출력은 native 프레임 검수에서 확인하며, 스크립트 작성만으로 시각 PASS를 주장하지 않는다.

### 재현 순서와 검증 범위

1. 총괄이 영구 원본을 확보하고 실제 시청 후 source·shot을 선택한다. JSON의 `from`/`dur`는 원본 선택 구간이며 각 `prepared` 파일을 별도 trim·CFR30·PTS0으로 준비한다.
2. 원본 로고를 확인·복사하고 JSON의 원본 검증 상태·선택 상태를 갱신한다. 사용하지 않는 제안 shot은 제거하거나 실제 선정한 shot으로 대체한다.
3. native runtime에서 DM Sans 400/700·ffprobe·higgsedit 사용 가능 여부를 확인한다. 실제 출력은 root 담당이며 이 스크립트에는 render/upload 호출이 없다.

```sh
EXODUSER_REBUILD_INPUT_DIR=/home/user/exoduser-rebuild-input \
EXODUSER_REBUILD_MANIFEST=/home/user/exoduser-rebuild-input/selected-plan.json \
EXODUSER_REBUILD_PROJECT_DIR=/home/user/exoduser-edits/rebuild-20261008-draft \
higgsedit build /home/user/marketing_trailer_rebuild_20261008.jsx
```

4. 총괄이 native timeline·cut 경계·실제 frame·전체 렌더를 검사하고 영상 전구간을 무음·유음으로 시청·청취한다. 그 후 사용자 검수용 DRAFT 파일과 근거를 전달한다. 승인 전 추가 공개하지 않는다.

도구 작성 시 video-editing `SKILL.md`, compose·assembly·geometry·animation-contract·title-animation 문서를 읽고 native opacity keyframe 지원을 확인했다. 로컬에서 JSON parse와 pure preflight 함수, `148/30초=148프레임`, 7초=210프레임, null·프레임 격자 이탈 거부, 미선택 manifest 거부를 확인했다. **로컬 ffprobe/higgsedit가 없어 실제 prepared 파일 프레임 감사·native 빌드·렌더·전체 시청/청취는 수행하지 않았다.** 이 검증은 JSX native 컴파일·렌더 호환성 확인을 대신하지 않는다.


## Root 실제 선별 — 26.3초 검수용 티저

분량을 채우려고 빈 숲길을 늘리지 않는다. 새 실제교전11.3초·연속이동5초·기존 staged패링/슬램/블랙홀10초=26.3초/789프레임. 자연촬영2개는 전투수치·인위적적배치 변경0, 오류0이며 Steam공개빌드동일성 미확인. HTML HUD는 녹화에 포함되지 않았다. 첫4초시작보호막과 두번째추가촬영의 무교전·무음부분은 제외했다. native입력은각구간을0시각CFR30MP4로사전trim. 새main은DRAFT_ONLY,사용자검수전공개금지. 현재프레임표/음원mix/실제native검수결과는아래추가한다.

| 순서 | 원본 | from(초) | dur(초/프레임) | 역할 |
|---|---|---:|---:|---|
| 1 | 실제char1첫take | 5 | 3.7/111 | 즉시교전·첫처치 |
| 2 | 실제char0셋째take | 5 | 7.6/228 | 다른캐릭터실제연속교전 |
| 3 | stagedparry원본 | 148/30 | 3/90 | 실제Q패링·반격 |
| 4 | stagedrage원본 | 89/30 | 3/90 | 스킬발동·슬램임팩트 |
| 5 | stagedblackhole원본 | 4 | 4/120 | 블랙홀폭발클라이맥스 |
| 6 | 실제char1첫take | 12.4 | 2/60 | 전투후이동 |
| 7 | 실제char1첫take | 14.4 | 3/90 | 연속이동위원본로고·SteamCTA |

원문프로토타입builder는marketing/trailers/rebuild-20261008/original-builder-proposal.jsx에백업. 최소길이는기존30초에서24초로낮췄으며최대40초는동일. 게임런타임·전투·세이브변경없음.


## 10. 기존 프로젝트 주제가 선택·26.3초 후반 오디오 믹스 계약

최신 root 선별본 **26.3초 / 789프레임**에 기존 프로젝트 주제가 **‘심연의 탈주’**를 사용한다. 새 음악·보이스·SFX 생성은 없다. root의 native 프로젝트·현재 shot 선택은 유지하고 **native 렌더 후 FFmpeg postmix**로 기존 게임 원음과 음악을 합친다. 이 절은 source·측정·재현 계약이며, 실제 최종 mix 완료·청취 승인·공개를 미리 주장하지 않는다.

### 원본·채택 근거·검증 범위

| 항목 | 확인 내용 |
|---|---|
| 원본 repository 상대 경로 | `bgm/cutscene/prologue_theme.mp3` |
| 원본 absolute 경로 | `/Users/fordeargamers/.codex/worktrees/marketing-gameplay-20261008/the-exoduser/bgm/cutscene/prologue_theme.mp3` |
| 실제 파일 | **5,356,373 B**, SHA256 **`9ab69e88008f6ebc625c4c694d7d8aa066dd1c6f465185cfc9e5d10be49e9865`** |
| 프로젝트 채택 SSOT | [주제가 Suno 프롬프트·채택 기록](../6사운드디자인/주제가_SUNO_프롬프트.md): 2026-07-27 사용자 채택 Suno 인스트루멘털 4곡 중 ‘심연의 탈주’, 게임 연결·기존 파일 보존, 타이틀/로비/트레일러 재사용 가능 명시 |
| 이번 재사용 근거 | 사용자의 기존 게임 트레일러 재편집·배포·프로젝트 자산/음악 재사용 지시와 위 채택 SSOT를 기준으로 root가 이 곡 선택 |
| 저작권 확인 범위 | **프로젝트의 사용자 채택·재사용 가능 기록과 기존 파일 출처 확인**. 생성 당시 서비스 플랜·상업권 영수증·계정 계약은 이번 조사에서 독립 검증하지 않음. 영수증 독립 검증 완료나 제3자 권리 보증으로 확대하지 않음 |
| 실제 청취 | **미수행**. 곡의 청각적 적합성·박자·악기·원음과의 마스킹을 실제 들었다고 주장하지 않음 |

### 원본 파형·길이·클리핑 실측

macOS `afinfo`의 패킷 추정 길이는 **223.152초**다. `afconvert -f WAVE -d LEF32`로 디코드한 float PCM은 **48,000Hz·2채널·10,710,144프레임/채널 = 223.128초**다. 아래 sample peak/RMS는 해당 디코드 샘플 기준이며 oversampled true peak·LUFS 측정과 구분한다.

| 대상 | 길이·프레임 | sample peak | RMS | `abs(sample) >= 1.0` / `>= 0.999` |
|---|---|---:|---:|---:|
| 원본 전체 | 223.128초 / 10,710,144프레임/채널 | **0.989807129 / −0.088988dBFS** | **−12.081295dBFS** | **0 / 0샘플** |
| 이번 선택 **14–40.3초** | **26.3초 / 1,262,400프레임/채널** | **0.950256348 / −0.443184dBFS** | **−14.190781dBFS** | **0 / 0샘플** |
| 선택 구간에 gain0.18만 적용한 계산값 | fade·게임 원음 합산 전 | **−15.337734dBFS** | **−29.085330dBFS** | 최종 mix·AAC의 실측값 아님 |

100ms peak envelope의 전체 최대 0.989807129, 최소 0.000091553, 완전 0인 window는 **0개**였다. 파형은 실제 생성해 확인했으나 곡을 청취한 것은 아니다. 원본 sample clipping 미검출은 압축 전 clipping·최종 AAC true peak·최종 mix clipping이 없다는 보증이 아니다.

측정 자료: `/tmp/fdg-prologue-theme-measurement-20261008.json`, `/tmp/fdg-prologue-theme-waveform-20261008.png`. 이 임시 자료만으로 영구 납품 보존을 완료했다고 계산하지 않으며, 필요한 측정 기록은 root가 editable ZIP/납품 경로에 함께 보존한다.

### native 오디오 API 확인과 채택 경로

| 확인 대상 | 실제 확인 결과 |
|---|---|
| 설치 타입 `/opt/fable/types/fable.d.ts` | `Project.add(file)`·`Project.cut(handle,{from,dur,at,fit})` 지원. `Project.audio` 없음. `CutOptions`에 volume/gain/trackIndex 없음 |
| 설치 구현 `/opt/fable/dist-node/cli.mjs` | `add`는 MP3를 audio asset으로 import 가능. `cut`은 항상 **lane0**에 배치하므로 영상 spine과 별도 BGM 트랙을 같은 호출로 안전하게 나누는 API가 아님 |
| 설치 CLI help | `place --trackIndex`·`animate --property volume --keyframes`·`duck --trackIndex --db --rampSec` 지원 확인. 별도 audio verb 없음 |
| [video-editing assembly](/Users/fordeargamers/.codex/plugins/cache/openai-curated-remote/app-6a3293e129088191abf0875820e839da/2.1.0/skills/video-editing/references/assembly.md) | composed media는 picture-only, 추가 audio bed는 별도 mix 또는 FFmpeg mux/mix 경로 사용 가능. 실제 skill 경로는 아래 absolute 경로와 동일 |
| 이번 채택 | native 추가 트랙·`p.audio`·gain 인자를 임의로 만들지 않음. **현재 builder 변경 없이 native 렌더 후 FFmpeg로 1회 연속 음악 bed를 합성** |

참고 skill absolute 경로: `/Users/fordeargamers/.codex/plugins/cache/openai-curated-remote/app-6a3293e129088191abf0875820e839da/2.1.0/skills/video-editing/references/assembly.md`.

### postmix 변수 계약

| 변수 | 값·동작 |
|---|---|
| 전체 길이 | **26.3초 / 789 video frames / 1,262,400 audio frames@48kHz** |
| 음악 시작 | 원본 **14초**, 26.3초를 연속 사용. 장면 전환마다 음악을 재시작하지 않음 |
| 게임 원음 gain | **1.0**, 기존 실제 원음 유지. 마지막 **0.15초**만 fade-out, 시작 **26.15초** |
| 음악 gain | **0.18** (amplitude gain, **−14.894550dB**). 사람에게 들리는 음량이 18%라는 뜻이 아님 |
| 음악 fade-in | **0.4초**, 전체 timeline 0–0.4초 |
| 음악 fade-out | **2초**, 전체 timeline **24.3–26.3초** |
| 합성 | `amix=inputs=2:duration=first:normalize=0`, game1.0 + music0.18. 합성으로 원음 gain을 자동 절반으로 낮추지 않음 |
| 최종 제한 | `alimiter=limit=0.95:level=false:latency=true`. 자동 makeup level 비활성화·lookahead 지연 보상. limiter가 동작한 peak 구간은 원본 PCM과 동일하다고 주장하지 않음 |
| 오디오 출력 | AAC stereo 48kHz·256kbps. 최종 AAC 디코드 후 길이·sample/true peak·클리핑·전구간 청취는 별도 최종 검수 |
| 영상 출력 | 기본은 native video stream copy. 선택한 마지막 **0.2초** 영상 fade-out은 **26.1–26.3초/6프레임**이며 이 옵션 적용 시 영상 재인코딩 필요 |
| 원음 한계 | 원본에 녹음되지 않은 SFX는 복원할 수 없음. 원음에 음악이 이미 섞여 있다면 별도 stem 없이 SFX만 완전히 분리·원복했다고 주장하지 않음. 새 BGM은 실제 현장 녹음이 아닌 편집 bed |

설치 FFmpeg help에서 `amix normalize` 기본 true, `alimiter level` 기본 true와 `latency` 옵션을 확인했다. 이 계약은 normalize와 auto level을 명시적으로 끈다.

### 재현 명령 — 기본 video stream copy

아래 경로 변수는 root의 실제 native render·원본 음원·고유 DRAFT 출력 경로에 맞춰 지정한다. 이 문서 작업에서 명령을 실행하거나 최종 mix를 렌더하지 않았다.

```sh
FDG_NATIVE_RENDER=/home/user/exoduser-rebuild/native-draft.mp4
FDG_THEME_AUDIO=/home/user/exoduser-rebuild/source-audio/prologue_theme.mp3
FDG_POSTMIX_OUT=/home/user/exoduser-rebuild/EXODUSER_COMBAT_DRAFT_26_3S.mp4

ffmpeg -hide_banner -y \
  -i "$FDG_NATIVE_RENDER" \
  -ss 14 -t 26.3 -i "$FDG_THEME_AUDIO" \
  -filter_complex "[0:a]aresample=48000,atrim=duration=26.3,asetpts=PTS-STARTPTS,volume=1,afade=t=out:st=26.15:d=0.15[sfx];[1:a]aresample=48000,atrim=duration=26.3,asetpts=PTS-STARTPTS,volume=0.18,afade=t=in:st=0:d=0.4,afade=t=out:st=24.3:d=2[bgm];[sfx][bgm]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95:level=false:latency=true[mix]" \
  -map 0:v:0 -map "[mix]" \
  -c:v copy -c:a aac -b:a 256k -ar 48000 -ac 2 \
  -t 26.3 -movflags +faststart "$FDG_POSTMIX_OUT"
```

선택적인 마지막 영상 fade를 적용하려면 filter graph에 `;[0:v]fade=t=out:st=26.1:d=0.2[v]`를 추가하고 `-map 0:v:0 -c:v copy` 대신 `-map "[v]" -c:v libx264 -crf 17 -pix_fmt yuv420p -r 30 -frames:v 789`를 사용한다. 두 경로 모두 음악은 하나의 연속 source clock을 사용한다. 실제 최종 인코딩 옵션과 사용 경로는 root가 최종 receipt에 기록한다.

### editable ZIP 보존 계약

root가 새 native editable ZIP에 다음을 **함께 포함**한다. 아직 패키징 완료를 주장하지 않는다.

- native 프로젝트·선정 shot manifest·현재 builder와 최종 output 연결 기록.
- **원본 `source-audio/prologue_theme.mp3` 그대로**, 위 원본 SHA256·repository 상대 경로·채택 SSOT·확인 범위.
- 정확한 **postmix 재현 명령 파일**, 실제 입출력 상대 경로·26.3초·gain/fade/limiter 옵션·선택 영상 fade 여부.
- native 원음 render와 postmix 최종 MP4를 구분하는 receipt·체크섬·최종 오디오 검수 결과. 음악이 없는 native timeline만으로 최종 soundtrack까지 재현 가능하다고 보고하지 않음.

이번 후속 작업은 이 문서 §10 추가와 원본의 임시 PCM·파형·수치 측정만 수행했다. 기존 root 선별표·builder·JSON·게임 코드·원본 음악·Git 인덱스·커밋·게시 상태는 변경하지 않았다.


## Root 실제 export 수정 R1

첫26.3초export15.3초에서회색직사각테두리를발견했다. rage준비원본1.0초와export15.3초를직접대조해동일테두리가원본에이미있음을확인했다. 홍보검수에서제외한다. 3초슬램shot을기존ice_orb prepared2.5–5.5초(원본104/30–194/30초)로교체. 전체26.3초/789프레임·음악·CTA는동일. 위최초선별표의4번슬램은R1이전이력이며현재선택은edit-plan.json의ice-surge가우선한다. 두ice원본표본2.5/4초에서테두리없음·실제얼음오브/파편확인. 첫export는기술검사이력으로만보존,사용자검수본은R1. 새버전은계속DRAFT_ONLY.


## 최종 검수용 인도 — R1 / 26.3초

| 항목 | 실제 결과 |
|---|---|
| 현재 파일 | `EXODUSER_GAMEPLAY_TEASER_REVIEW_V2_R1_20261008.mp4`,1920×1080,H264/AACstereo48k,30fps,789프레임,26.3초 |
| 실제 MP4 | 39,116,121B,SHA256 `d402dc9ec9750ec20b3c556fdfe4c87fce1e89f8ba07105e30bf8ebd1266dc34` |
| 영상 구성 | 실제char1근접전3.7s→실제char0연속교전7.6s→Q패링3s→얼음오브3s→블랙홀4s→실제이동2s→원본로고·SteamCTA3s. 별도무음카드·원화가리는불투명자막판없음 |
| 실제 검사 | nativecheck clean,renderdiagnostics/fallback0,전체A/VdecodePASS,실제789f/CFR30검사. native1.2/12.8/18.5/24.7초·export1.2/6/12.8/15.3/20.5/24.7초실제표본확인 |
| 오디오 | 기존원음+원본주제가연속postmix완료. 최종AACdecode samplepeak0.9568819403648376(-0.38283283925840184dBFS),fullscaleclipped0. 실제청취·사용자최종승인미수행. 정확한ebur128truepeak/LUFS및freeze로그는final-qa.json보존 |
| 시각 한계 | 자연촬영숲이 어둡고아바타작음. 얼음전투15.3초기존피격빨간flash포함. 새지역/보스/장비빌드선택/Steambinary동일성입증아님. 이결과를완성상점트레일러로자동승인하지않음 |
| 최종 상태 | **DRAFT_ONLY / USER_REVIEW_PENDING**, YouTube새메인업로드0·Steam업로드0 |
| 인도 폴더 | `/Users/fordeargamers/the-exoduser/output/FDG_FINAL_RELEASE_20261008/revisions/gameplay-teaser-v2/` — MP4/contact sheet/QA/editable ZIP/체크섬/URL·상태manifest |
| 재현 보존 | 원본음악·채택SSOT·nativeproject/폰트/선택MP4·실제rendered-edit-plan·postmix.sh·native원음render·최종mixMP4를editable ZIP에포함. 마지막음악bed는nativeproject외부postmix이므로스크립트함께필요 |
| 공개 정리 | 기존메인과badpanel네메시아는일부공개·공식playlist제외,공개playlist4편독립확인. 네메시아글씨수정본은0ERvrpHccZQ일부공개·EN27자막게시·KO파일준비/YouTube게시미완료 |

현재출력의정확한기계검수·음원및소스manifest는 [final-qa.json](../../marketing/trailers/rebuild-20261008/final-qa.json), [실제rendered-edit-plan](../../marketing/trailers/rebuild-20261008/rendered-edit-plan.json), [인도URL·게시상태](../../marketing/trailers/rebuild-20261008/delivery-urls.json)로추적한다. 전구간주관적시청/청취와사용자검수승인전새main공개하지않는다.
