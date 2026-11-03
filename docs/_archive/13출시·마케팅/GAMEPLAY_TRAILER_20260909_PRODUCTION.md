> **현재 상태:** V1 MP4만 사용자 요청으로 보존했고 나머지 원본·프루프·중간파일은 삭제 완료했다. 아래 파일 목록은 제작 당시 이력이다. 최신 검토본은 [V2 제작 기록](GAMEPLAY_TRAILER_V2_20260909.md)을 따른다.

# 신규 게임플레이 트레일러 — 2026-09-09 제작 기록

> **2026-09-09 피날레 v0.4:** 데모/bic 마지막 si3 보스의 HP는 `floor(22278×(1+.055n+.0015n²)×dm)`, n=max(0,monLv−1); 초기 쉴드=HP, 부활력20, 최대1회 35% HP 저항(확률clamp(1−신성력,0,1)), phase ATK는 base×1/1.12/1.25/1.4/1.6이다. 3막 음악·HUD·120f 카드 및 보스 바로 재도전/60f 인트로의 [현행 계약·검증](../8.1보스디자인바이블/DARK_DRUID_FINALE_PACING_v04.md)을 따른다. 일반 모드와 공용 패링 계약은 기존대로다. 아래 이전 버전의 HP/부활 유지 표현은 당시 이력이다.

2026-09-08 사용자 요청(1-1·2-1·3-1 대표 포인트, 1-1 보스전, 대규모 전투, 주요 스킬 소개)의 후속 제작이다. [초기 구성](GAMEPLAY_TRAILER_20260908_PLAN.md)을 잇는다. 2026-09-09 Chrome 확장 연결 후 실제 게임플레이를 신규 촬영했다. 로컬 검토용 70초 편집본이며 외부 게시/배포는 수행하지 않는다.

## 촬영 계약

| 항목 | 현행 값 / 적용 위치 |
|---|---|
| 촬영 도구 | `tools/trailer_session_20260909.mjs`, Browser 스킬의 Node 세션에서 `createTrailerSession` 호출 |
| 브라우저 제어 | 연결된 Chrome의 탭 CDP capability만 사용. 독립 Playwright 브라우저 실행 없음 |
| 출력 폴더 | `captures/gameplay_trailer_20260909/` |
| 화면 / 영상 | 1920×1080 가로, 원본 30fps. JPEG92 프레임 → FFmpeg libx264/veryfast/CRF17/yuv420p/faststart. 원본 무음, 최종 편집에서 게임 BGM·SFX 믹스 |
| 프레임 전진 | requestAnimationFrame 큐와 performance.now를 촬영 탭에서만 제어. 출력 프레임마다 1000/30ms 전진, 기존 loop의 60Hz 물리 갱신 유지. 시전 가속·쿨다운 매 프레임 초기화 없음 |
| 시험 캐릭터 | localhost `testchar=1`, Lv500 장비/해금 세팅. 촬영 전에 선택 스킬·합체 세팅을 조정하며 수집 조건은 테스트 캐릭터의 기존 해금 사용 |
| 환경 연출 | 맵·오브젝트 원본 유지. 카메라와 플레이어를 샷 시작 지점으로 이동. 환경 팬은 두 좌표 사이 smoothstep 보간. 일반 전투는 기본 추적, 채택한 보스 컷은 보스/플레이어 평균 x와 평균 y−160px를 draw 직전에 적용 |
| 전투 세팅 | 대규모 전투 시 게임 `mkEn`/`rollEtype`/`rollEl`로 64기 시작 군집. 원형 배치 각도 i×2.3999632297, 반경 260+(i%5)×70px. 실제 잔여 수는 capture_report에 기록. 어택 티켓 추가 없음 |
| 촬영 보호 | protect=true 컷은 매 프레임 HP/MP/ST 복구, `_dead=false`, iframes=0. 일반 난이도 생존 성능을 입증하는 영상으로 사용하지 않는다 |
| 피격 가림 | 촬영 탭 `draw` 래퍼에서 `_hitFlash.a=0`, `scrFlashA=0`으로 화면 전체 피격 플래시만 숨긴다. 적·스킬·보스 본체는 실제 렌더 |
| UI | 디버그 패널·FPS·펫 자막·토스트·지역 타이틀 숨김. 환경 컷 HUD 숨김, 전투 컷 하단 스킬/자원 표시. stageClock 후속 숨김 |
| 상태 변경 범위 | 전용 촬영 탭의 메모리와 임시 CSS만. char 파라미터 없는 테스트 URL로 `_charId=null`이며 dbSave는 캐릭터 ID가 없으면 반환한다. 종료 직전 `_dbReady=false`도 적용한 후 전용 탭 닫기·뷰포트 재설정 완료. game.html·맵 파일·실제 저장 데이터 직접 편집 없음 |
| 보고 | 컷별 before/after, 이벤트 시간, pan, 보호 여부, frames/fps, 실행시간을 capture_report.json에 기록. progress.json은 현재 컷 진행률 |
| 스틸 | 각 컷 처음·중간·마지막 JPEG, 별도 정찰 JPEG94 |
| 이전 영상 | 2026-09-02 보스 합성 영상은 포함하지 않음. 기존 로고 PNG로 만든 2026-09-08 엔드카드 4초만 재사용 |

보스 첫 컷은 `_enterBossArena()`의 현행 si0 다크드루이드다. 두 번째 보스 컷은 촬영 시작 전에 HP를 최대치의 0.42로 설정해 후반 패턴을 유도했다. 처치 연출이나 승리 화면을 합성하지 않는다. 환경 전환은 `initStage` 뒤 `_tickBgInit(9999)`와 `_waitObjSprites(8000)`으로 배경 초기화/에셋 대기를 완료했다. 후반 환경 및 보스 재촬영에서는 `_fbSpawned=true`, `_fdSpawned=true`와 해당 배열 비우기를 함께 적용해 추가 필드보스가 생기지 않도록 했다. 앞선 스킬/군집 컷에는 자연 생성된 추가 개체가 일부 남아 있다.

## 스킬 후보 갱신

| 스킬 ID | 한글명 | 촬영 내용 |
|---|---|---|
| iceOrb | 얼음보주 | 실제 activateIceOrb → activateIceShatter |
| giantSlam | 지옥강타 1 | Space 슬롯 `_dispatchSkillSlot(4,'Space')` |
| ancestorSummon | 전대 소환 | 숫자 3 슬롯 `_dispatchSkillSlot(2,'Digit3')` |
| lavaSummon | 탄막블랙홀 | 필살기 디스패치, 5초 흡수 후 실제 재분출 |

초기 참회 소개 컷은 지옥강타로 교체한다. 게임의 스킬 수치·이름 변경은 아니다.

## 채택 원본 / 편집 타임라인

| 타임라인 | 원본 / 소스 구간 | 내용 |
|---|---|---|
| 0–1.6초 | blackhole_take / 6–7.6초 | 오프닝 재분출 |
| 1.6–2.8초 | ice_slam_clean / 3–4.2초 | 강타 |
| 2.8–4초 | druid_boss_b / 3.8–5초 | 보스 독탄 |
| 4–8초 | ch1_altar_clean / 0–4초 | 1-1 제단. 카메라 `(5820,4070)`→`(5930,3890)`px |
| 8–12초 | ch2_hive_take / 0–4초 | si4 / 2-1 벌집·부화장. 카메라 `(3000,5700)`→`(2820,5540)`px |
| 12–16초 | ch3_ritual_take / 0–4초 | si10 / 3-1 `m_c3hellritual` `(4020,4020)`px. 카메라 `(3920,3920)`→`(4050,3790)`px |
| 16–19초 | ice_slam_clean / 0–3초 | 얼음보주 |
| 19–22초 | ice_slam_clean / 3–6초 | 지옥강타 |
| 22–28초 | ancestor_clean / 0–6초 | 전대 소환 |
| 28–36초 | blackhole_take / 0–8초 | 탄막블랙홀 흡수와 재분출 |
| 36–46초 | horde_take / 0–10초 | 군집 전투, 무기·회오리·강타 입력 |
| 46–56초 | druid_boss_tracking / 0–10초 | 다크드루이드, 추적 카메라 |
| 56–66초 | druid_boss_b / 0–10초 | 다크드루이드 후반 패턴과 탄막블랙홀 |
| 66–70초 | ../gameplay_trailer_20260908/EXODUSER_END_CARD_4S.mp4 | 기존 EXODUSER / HELL LORD 로고 |

`ch1_altar_take`는 상단 타이머, `ice_orb_take`/`ancestor_take`는 피격 가림, `druid_boss_a`는 고정 카메라에서 플레이어가 아래로 치우쳐 최종 입력에서 제외했다. 검토용 원본은 삭제하지 않는다. 스킬 소개의 군집 수는 64기로 시작하며 난이도/생존 밸런스 증명용 무편집 플레이가 아니다.

## 편집 도구 계약

| 항목 | 값 / 적용 위치 |
|---|---|
| 실행 | `python tools/build_gameplay_trailer_20260909.py` |
| 최종 출력 | `captures/gameplay_trailer_20260909/EXODUSER_GAMEPLAY_TRAILER_70S_1080P.mp4` |
| 보존 | 최종 파일이 이미 있으면 오류로 중단. 새 버전 출력 전 기존 검토본 보존 필요 |
| EDL | 14개 구간, 총 70초 / 2100프레임 / 30fps. 컷 전환은 하드 컷. `edit_report.json`에 소스·인점·길이·타임라인 기록 |
| 중간 인코딩 | libx264 / fast / CRF17 / threads4. 동시에 2개 컷 처리 |
| 최종 인코딩 | libx264 / slow / CRF18 / threads6 / 1920×1080 / faststart. yuv420p 옵션, JPEG의 full-range를 계승해 ffprobe 실제 pix_fmt=yuvj420p / color_range=pc / color_space=bt470bg |
| 색 보정 | 게임 컷 gamma1.52 / contrast1.05 / saturation1.10. 로고는 보정 제외 |
| 자막 | `edit/captions.ass`, Malgun Gothic. 제목46px / 큐22px / 설명24px. 상단 왼쪽 555×168px 반투명 패널, 160ms 인 / 180ms 아웃 |
| 카피 구분 | `군집의 영역`, `지옥의 의식`은 해당 컷의 마케팅 카피이며 게임 지역 이름 변경이 아니다. 스킬 이름은 현행 이름 사용 |
| BGM | `bgm/1장_썩은숲/Bloodsteel Ascension.mp3` 18초부터 70초. volume0.65, 시작0.35초 페이드, 66.6초부터3.4초 아웃 |
| SFX | 기존 fire_magic2 / slam heavy_hit / ice_storm / death_ice_shatter / ghost_laugh / hit heavy_hit. 12개 배치, 타임라인·레벨·길이는 편집 스크립트와 edit_report.json에 기록 |
| 오디오 | 편집 믹스, 라이브 음성 녹음 아님. loudnorm I−16 / TP−1.5 / LRA9, PCM 중간 믹스 → AAC256kbps / 48kHz / stereo |
| 검수 기록 | 최종 미디어 분석·전체 디코드·대표 프레임 육안 확인 결과를 아래에 기록 |

맵 가이드 v0.9와 _MAP_SSOT_INDEX를 읽었다. 전체 맵 제작/재배치 작업은 수행하지 않는다. 촬영 화면 검수와 전체 맵 검수의 범위를 구분하며 최종 보고에 MAP PRODUCTION REPORT를 포함한다.

## 최종 파일 검증

| 검증 | 결과 |
|---|---|
| 컨테이너 / 크기 | MP4, 221,972,206 bytes (약211.7MiB) |
| 영상 | H.264 High / 1920×1080 / 30/1fps / 2100프레임 / 70.000초 / 25,099,158bps |
| 오디오 | AAC / 48,000Hz / 2채널 / 70.000초 / 260,061bps |
| 음량 | volumedetect mean−18.8dB / max−1.3dB. 믹스의 TP−1.5dB는 정규화 목표이며 최종 AAC 측정 피크와 구분 |
| 전체 디코드 | FFmpeg 전체 영상·음성 null 디코드 exit0, 오류 출력 없음 |
| 화면 | 14개 대표 시점 contact sheet, 원본 정찰·중간 프레임, 1080p 자막 프레임 확인. 제단·벌집·의식 문양·스킬·보스 본체·로고 가시성 확인 |
| 프루프 | `captures/gameplay_trailer_20260909/FINAL_CONTACT_SHEET.jpg`, `caption_check.jpg` |
| 브라우저 | localhost3333 video/mp4 HTTP200. Chrome video duration70 / videoWidth1920 / videoHeight1080 / readyState4 / error=null / 실제 재생 시간 증가 확인 |
| 도구 검사 | capture JS node --check PASS, 편집 Python AST 문법 검사 PASS. 전체 생성 스크립트 실행 exit0 |
| 사용자 검토 | 공개 전 편집 취향·연출 검토는 사용자 판단. 외부 업로드 없음 |

## MAP PRODUCTION REPORT

| 항목 | 결과 |
|---|---|
| STAGE | CH1-1 / si0, CH2-1 / si4, CH3-1 / si10의 대표 촬영 화면 및 si0 보스 |
| MASTER | 기존 silhouette/regions/main route/side spaces 유지 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH/major holes 편집 없음 |
| LARGE | 기존 assets/composites/overlap/repetition 사용, 생성·재배치 없음 |
| MEDIUM | 기존 연결·구멍 유지 |
| GROUND | 기존 shadow/contamination/integration 사용, 최종 영상 밝기만 보정 |
| PLAYABLE | 기존 arena/travel/breathing/threat 공간 사용. 촬영용 군집과 캐릭터 보호는 위 계약 적용 |
| LANDMARK | 1-1 제단, 2-1 벌집·부화장, 3-1 의식 문양 확인 |
| CAMERA QA | 선택한 LANDMARK 3개와 BOSS 화면 육안 확인. 시작·좌우 사이드·모든 전투방·출구의 전체 맵 QA를 의미하지 않음 |
| TECH QA | 파일 전체 디코드·프레임 수·길이·오디오·로컬 재생 PASS. 맵 route/collision/seam/performance 회귀 검사는 수행하지 않음 |
| FILES | 캡처/편집 도구2개, 마케팅 제작기록·초기 구성·상위 문서, CHANGELOG_SYNC. 캡처·MP4는 로컬 산출물 |
| GIT | 위 도구와 docs만 커밋 대상으로 지정. 다른 작업의 game.html 변경 제외. push/deploy 없음 |
| VISUAL VERDICT | **PASS — 이번에 채택한 촬영 화면 및 70초 검토본 범위** |
| NEXT PASS | 사용자 편집 피드백에 따른 컷 길이·음악·카피 조정. 전체 맵 최종 승인과 별개 |
