# V24 — 데미지 텍스트 스킬 트레일러

사용자 요청: 데미지 텍스트가 들어간 별도 버전. 원본 선택 응답 전 V22 98초 몽타주를 기준으로 진행한다고 안내했다.

| 항목 | 계약 |
|---|---|
| 상태 | 제작·최종 디코드·오디오·48컷 시각 검수 완료 |
| 출력 | `captures/gameplay_trailer_20260909/EXODUSER_SKILL_TRAILER_V24_DAMAGE_TEXT_98S_1080P60.mp4` |
| 편집 | V22의 48컷·98초·1920×1080·60fps. 0–88.5초 재촬영 스킬/기존 환경. 88.5–98초 보스·새 로고는 기존 V22 새 로고 파일의 영상·오디오 함께 재사용 |
| 전투 소스 | 현행 게임에서 V22의 19 take 재촬영. `tmp/trailer_damage_v24/`에 별도 저장 |
| 환경 소스 | 기존 `tmp/trailer_v2/ch2_hive.webm`, `ch3_ritual.webm` 재사용 |
| 표시 옵션 | `__rt.damageText=true`이면 원본 `draw()`에 원래 `G.txts` 전달. false/미지정은 기존 부유 텍스트 숨김·finally 복원 |
| 숫자 | 실제 `addTxt` → `G.txts` → `drawNumStr`. 피해량·크기·색·수명·40칸 링 버퍼 변경 없음. 촬영 컨텍스트에서 `_FLOAT_TEXT_ENABLED=true` |
| 현행 단발 피해 표시 | `G._dmgPeakShow`의 최고 피해를 표시. `G._dmgTxts` 추적 항목은 최대 1개이며 더 큰 피해가 오면 교체한다. 추적 시간 50프레임, 표시 life 일반 50/치명타 70, sz 일반 56/치명타 72. `_col` 일반 `#ffcc33`/치명타 `#dd2200`; 실제 숫자 아틀라스는 일반 흰색 계열/치명타 빨강. V24도 이 게임 계약을 따른다 |
| 텍스트 범위 | 게임의 필수 텍스트 whitelist 유지. V22의 Canvas 한글 문자열 제외 유지. 추가 설명 자막 없음 |
| 증거 | 각 take JSON의 samples에 누적 `numberDraws`와 `lastNumber` 기록. 실제 `drawNumStr` 호출만 집계; 고유 타격 수가 아님 |
| 안전 | 기존 전투/여성 음성/격리 context/저장 차단/실제 피격 계약 유지. 공유 게임 파일 수정 없음 |
| 오디오 | 0–88.5초 새 전투와 동시 녹음한 여성 음성·SFX. Bloodsteel Ascension 18초부터, SFX×1.8/BGM×0.48, loudnorm I−16/TP−1.5/LRA9. 88.5–98초 원본 V22의 이미 믹싱된 음원을 영상과 함께 이어 붙임 |
| 로고 | 원본 V22 새 로고 파일 94–98초의 `skill_title_crimson_rift_v3.png` 연출 그대로 재사용 |
| 최종 결합 | 새 master 0–88.5초 + 기존 V22 88.5–98초. H.264 CRF18 fast, BT.709 limited/yuv420p, AAC320k, faststart |
| 도구 | `tools/recapture_trailer_damage_v24_20260910.py`, `tools/build_trailer_damage_v24_20260910.py` |
| 검증 도구 | `tools/verify_trailer_damage_v24_20260910.py`: 전체 디코드, 5880프레임/98초/AAC48k stereo, 비무음, 실제 숫자 호출·여성 음성·피격, 48컷 프레임, Chrome 재생 |
| 보존 해시 | V22 새 로고 SHA256 `f4a7c33f82cac4fc23528f16969e4c72ca2e402393716b662b3419016ec17135`, V23 SHA256 `0b8d8bb3bf4d9ac54233a626fd9cc5cf5424281fd70663c6019dd6fcee7943ae` |
| 회귀 검사 | `test/trailerCombatSafety.test.js`: 숫자 배열 그대로 전달, 기본 숨김·예외 시 배열 복원, HP/무적/공간 인덱스 보존 6건 PASS |

## 재촬영 결과

| 항목 | 실측 |
|---|---|
| 촬영 | 19 take 완료. 지옥강타 1개 pilot + 나머지 18개 본 촬영; 각 실행 pageerror 0 |
| 숫자 그리기 | 전 take 누적 4,421회. 18개 전투 take에서 발생, 보스 take는 0. 화면 프레임마다 반복한 호출 수이며 타격 횟수가 아니다 |
| 여성 음성 | 원본 19 take 합계 68회. 남성/공용 플레이어 보이스 0 |
| 실제 피격 | HP가 감소한 발사체 접촉 178회. 전 take 종료까지 생존 |
| 스킬 | 숙련도 또는 디스패치 성공 38개 ID, 블랙스타 release 9.5039초. 개별 스킬의 독립 시각 표현 38종을 보증하는 수치는 아님 |
| 프레임 간격 | 최대 237.4ms (fused_slam). 출력은 60fps 고정이며 원본 순간 지연까지 없는 native 60fps 보증은 아님 |
| 숫자 사전 시각 확인 | 지옥강타 1.7초 및 전대 소환 2.8963초에서 실제 붉은 치명타 숫자와 전투 화면 확인 |
| 보스 재촬영 제외 | 현행 `_enterBossArena(true)` 결과가 V22의 원래 다크드루이드와 다른 보스로 잡혀, 새 boss take는 최종 편집에서 제외. 원본 V22의 88.5–98초 영상·오디오로 복원. 위 19 take 총계에는 제외된 boss 실험이 포함됨 |

## 최종 검증

| 항목 | 결과 |
|---|---|
| 파일 | 161,674,482 bytes, 98.000초, 5880프레임, 1920×1080/60fps |
| 영상·오디오 디코드 | 전체 FFmpeg 디코드 PASS. AAC stereo48kHz, 평균 −17.9dB/최대 −1.4dB; 무음 아님 |
| 사용 소스 감사 | 최종 편집에 사용한 새 18 take에서 여성 음성 63회·남성/공용 플레이어 음성 0회·피해 접촉 154회. 모두 원본 take 기준이며 최종 편집 후 횟수가 아님 |
| 보스·로고 보존 | 90/91.25/93/94.5/96/97.8초 원본 대비 평균 픽셀 차이 0.3499–0.5210/255. 재인코딩 손실 범위 |
| 원본 파일 | V22 새 로고·V23 SHA256 작업 전후 동일 |
| Chrome | 34초 seek 후 35.175279초까지 실제 재생 전진, 98초/1920×1080, media error 없음 |
| 시각 확인 | `FINAL_CONTACT_01~06.jpg` 48컷 육안 확인. 흰 일반 피해·붉은 치명타·주요 VFX·기존 다크드루이드·로고 철자/여백 확인 |
| 시각 한계 | 기존 domains 장면의 중첩된 보호막 때문에 네 영역의 차이는 약하다. 순간 숫자는 게임의 최고 피해 표시 규칙을 따르므로 모든 컷/모든 프레임에 나오지는 않는다 |
| VISUAL VERDICT | PASS — 이번 데미지 표시 파생 영상 범위. 신규 맵 전체 품질 승인 아님 |
| 기록 | `tmp/trailer_damage_v24/verification.json`, `audio_levels.txt`, `FINAL_CONTACT_01~06.jpg`, `review.html` |

## MAP PRODUCTION REPORT — 기존 전투 공간 재촬영

| 항목 | 범위 |
|---|---|
| STAGE | 현행 CH1 스킬 전투, 기존 CH2/CH3 환경 영상, V22 원본 CH1 보스·엔딩 |
| MASTER / OUTER MASS | silhouette/regions/main route/side spaces, LEFT/RIGHT/TOP/SOUTH/major holes 변경 없음 |
| LARGE / MEDIUM / GROUND | source assets/composites/overlap/repeated silhouette, connections/remaining holes, shadow/contamination/structure integration 변경 없음 |
| PLAYABLE / LANDMARK | arena/travel/breathing/threat space, primary/secondary/tertiary 변경 없음. 숫자 포함 전투 가독성 확인 |
| CAMERA QA | ARENA 숫자·캐릭터·VFX 확인, 원본 보스 보존 확인. START/EARLY/SIDE L/SIDE R/LANDMARK/LATE/EXIT 신규 맵 판정 없음 |
| TECH QA | route/collision/seam 변경 없음. pageerror 0, 전체 loading/녹화 완료. asset 404 별도 집계 안 함. 최대 프레임 간격 237.4ms |
| FILES | stage-owned 맵 파일 0. 공유 촬영 runtime, 전용 제작 도구·테스트·문서만 수정 |
| GIT | 작업 코드·테스트·문서를 함께 커밋. captures/tmp는 기존 gitignore로 제외. push/deploy 없음 |
| VISUAL VERDICT | PASS — 데미지 텍스트 영상 범위 |
| NEXT PASS | 사용자 영상 확인 |
