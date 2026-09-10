# V25 — 설명 자막·데미지 텍스트 58초 트레일러

사용자 후속 지시: 두 영상 모두 데미지 텍스트 버전. V22 파생 V24 98초는 완료됐으며, 이번 결과물은 V23 파생 V25 58초다.

| 항목 | 계약 |
|---|---|
| 상태 | 제작·기술 검증·CONTACT_01–03 시각 검수 완료 |
| 출력 | `captures/gameplay_trailer_20260909/EXODUSER_SKILL_TRAILER_V25_DAMAGE_TEXT_CAPTIONS_58S_1080P60.mp4` |
| 편집 | V23의 13컷·58초, 1920×1080/60fps. 원래 스킬 설명 문구·타이밍 유지, 보스 없음 |
| 소스 | 6개 스킬 take 별도 촬영, 기존 CH1/CH2/CH3 환경 재사용, 54–58초 로고는 V23 원본 영상 재사용 |
| 숫자 | V24의 `__rt.damageText=true` 및 원래 게임 `drawNumStr` 사용. 숫자 수치·크기·색·수명 변경 없음 |
| 촬영 안전 | 격리된 여성 testchar, 저장 비활성, 시작 HP 1억/iframes0, 녹화 중 MP/ST만 회복. 기존 게임 코드·맵 변경 없음 |
| 촬영 장비 | 무작위 테스트 장비에서 `onCritExplode`/`onCritChain` 두 affix만 제외하고 `_eqAffixCache=null`로 재계산. 시전/피해 공식은 유지. 원본 장비 선택이 촬영마다 달라지는 테스트 모드이며 저장되지 않음 |
| 분노 | 실제 적 24기 차징·Q 패링으로 축적. 강타 take 시작은 최대 분노, 3.8초 실제 시전 |
| 화염 | 원본과 같은 1–6초 Shift+RMB 6회, 7.5초 실제 `_detonateAssaultFlames()` |
| 나머지 | 얼음보주 1.5초, 전대 소환 1초, 블랙홀 1초. 실제 적 탄막 .2/2/3.8초 차징으로 흡수/방출 촬영 |
| 적 배치 | 분노24/Lv35/r380, 강타256/Lv35/r220, 화염128/Lv75/r420, 얼음72/Lv35/r400, 전대72/Lv120/r430, 블랙홀120/Lv80/r390. 반경은 기존 r+(i%9)×20, 실제 `mkEn` 공식 사용 |
| 얼음 레벨 | 기존 V2의 Lv65에서 V24와 같은 Lv35로 촬영. 보호막이 피해를 전부 흡수해 숫자가 없던 얼음 take를 교체. 게임 스탯 공식 변경 없음 |
| 자막 | V2 ASS 생성기의 54초 이전 cue만 보존. x112, 기존 폰트·크기·등장/퇴장·그라데이션 유지. 보스 및 이전 66초 로고 문구 제외 |
| 폰트 | 기존 검수된 `tmp/trailer_v2/fonts/TrailerNotoBlack.ttf` 6,221,156 bytes를 V25 fonts에 복사. 같은 정적 wght900 파일을 그대로 사용 |
| 음원 | 동시 녹음 여성 음성·SFX×1.8, highpass35Hz, 53.85초부터 .15초 fade. Bloodsteel Ascension 18초부터58초/BGM×.48, 마지막2초 fade. loudnorm I−16/TP−1.5/LRA9 |
| 인코딩 | H.264 CRF18 slow/8 threads, filter_complex_threads2, yuv420p/BT.709 limited, AAC320k/48k stereo, faststart. `encode.log`에 종료 진단을 보존하며 `--final-only`로 기존 12개 편집 조각을 재사용 가능 |
| 도구 | `tools/recapture_trailer_damage_v25_20260910.py`, `tools/build_trailer_damage_v25_20260910.py` |
| 검증 도구 | `tools/verify_trailer_damage_v25_20260910.py`: 58초/3480프레임/전체 디코드/비무음, 자막 행 일치, 실제 숫자·여성 음성·화염 중첩, 환경·로고 원본 비교, Chrome 재생 |
| 별도 경로 | 원본/검수 `tmp/trailer_damage_v25/`, 중간 편집 `edit/`. V23/V24 파일 보존 |

## 최종 검증

| 항목 | 결과 |
|---|---|
| 파일 | 99,532,738 bytes, 58.000초, 3,480프레임, 1920×1080/60fps |
| 오디오 | AAC/48kHz/stereo, 평균 −18.8dB, 최대 −1.5dB, 전체 디코드 오류 없음 |
| 자막 | 54초 이전 ASS 36행의 문구·타이밍 원본과 완전 일치 |
| 원본 영상 비교 | 4.5/7.5/10.5초 환경·55.5/57.8초 로고: 640×360 RGB 평균 차이 0.9097/0.7313/0.6119/0.6242/0.8671 (0–255 범위) |
| 브라우저 | Chrome에서 32초 탐색 후 33.171129초까지 재생, duration58/error없음 |
| 보존 | V23 및 V24 SHA256이 제작 전과 일치 |
| 최종 SHA256 | `b1b7386a78484252253a2c7f79b31dadba7fb836a0e0014e6689e93379cd2b34` |
| 검수 파일 | `tmp/trailer_damage_v25/verification.json`, `CONTACT_01.jpg`–`CONTACT_03.jpg`, `audio_levels.txt`, `review.html` |
| 인코딩 재시도 | 최초 최종 인코더가 진단 없는 비정상 종료. 복합 필터 스레드 2개 제한 및 로그 보존을 추가한 재시도 완료. 최초 종료 원인은 확정하지 않음 |

## 촬영 오류 조사

최초 촬영에서 `hurtE` 38848행의 `onCritChain` → `hurtE(...,{pure:true})` 재귀로 `Maximum call stack size exceeded`가 발생했다. 치명타 프록 블록은 `pure:true` 호출에도 재진입하고, `onCritExplode` 역시 동일한 형태의 재진입 호출을 가진다. 무작위 테스트 장비가 해당 옵션을 포함할 수 있다. 실패 촬영 전체는 `tmp/trailer_damage_v25/attempt1/`에 보존하고 최종 소스에서 제외한다. 게임 로직 수정은 이번 영상 작업 범위에 포함하지 않고 촬영 장비에서 이 두 옵션만 제외해 재촬영한다. 각 `*_loadout.json`에 제거 목록과 재계산된 값 0/0을 기록한다.

## MAP PRODUCTION REPORT

최종 사용 소스의 촬영 감사(최종 편집 후 횟수가 아닌 원본 take 합계):

| take | 프레임 | 숫자 그리기 호출 | 여성 음성 | 최대 간격(ms) |
|---|---:|---:|---:|---:|
| rage_charge | 465 | 415 | 8 | 96.1 |
| rage_slam | 457 | 210 | 4 | 214.7 |
| fire_stack_b | 636 | 177 | 7 | 128.6 |
| ice_orb | 406 | 255 | 4 | 73.8 |
| ancestor | 446 | 133 | 1 | 58.0 |
| blackhole | 593 | 35 | 4 | 83.3 |

합계 숫자 호출 1,225회/여성 음성 28회/남성·공용 플레이어 보이스 0회. 6 take 재촬영 및 최종 얼음 Lv35 교체 실행에서 pageerror/LOOP CRASH 0. 숫자 호출은 같은 숫자를 매 프레임 그린 수이며 타격 횟수가 아니다. 화염 입력 6회 중 최종 촬영의 생성 장판은 최대 5개, 최고 중첩 배열 `[2,1,1,0,0]`; 7.5초 기폭 뒤 장판은 0개다. 초안 pilot의 6개/`[2,2,1,1,0,0]`는 최종 수치가 아니다. 강타 촬영 최대 간격 214.7ms로, 60fps 출력이 native 무지연 촬영을 의미하지 않는다.

| 항목 | 범위 |
|---|---|
| STAGE | CH1 스킬 전투, 기존 CH1/CH2/CH3 환경 영상 |
| MASTER / OUTER MASS | silhouette/regions/main route/side spaces, LEFT/RIGHT/TOP/SOUTH/major holes 변경 없음 |
| LARGE / MEDIUM / GROUND | assets/composites/overlap/repetition, connections/holes, shadow/contamination/structure integration 변경 없음 |
| PLAYABLE / LANDMARK | arenas/travel/breathing/threat space, primary/secondary/tertiary 변경 없음. 실제 숫자·자막 가독성 CONTACT_01–03에서 확인 |
| CAMERA QA | ARENA 촬영 시각 검수 PASS. START/EARLY/SIDE L/SIDE R/LANDMARK/LATE/EXIT 신규 맵 판정 없음 |
| TECH QA | route/collision/seam 변경 없음. 최종 소스 pageerror/LOOP CRASH0, 전체 디코드·Chrome 재생 PASS. 최대 촬영 간격214.7ms |
| FILES | 전용 촬영·편집 도구와 문서. 동시 시네마틱 작업 파일 변경 없음 |
| GIT | 전용 도구·문서를 함께 커밋. push/deploy 없음 |
| VISUAL VERDICT | PASS — 이번 영상의 숫자·설명 자막·환경 연결·로고 범위. 신규 맵 geometry 판정 아님 |
| NEXT PASS | 요청된 두 영상 V24 98초/V25 58초 완료 |
