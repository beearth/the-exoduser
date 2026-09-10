# 2026-09-09 V22 스킬 몽타주

> **2026-09-10 파생본:** [V24 데미지 텍스트 버전](SKILL_TRAILER_V24_DAMAGE_TEXT_20260910.md)은 같은 편집표로 숫자를 표시해 재촬영한다. 공유 runtime의 `__rt.damageText=true`에서만 텍스트를 유지하며 기존 V22의 숨김 동작은 그대로다.

> **새 로고 적용본:** [V22 NEW LOGO 98초](SKILL_TRAILER_V22_NEW_LOGO_20260909.md). 원본 몽타주와 오디오는 유지하고 마지막94–98초 로고를 V23 디자인으로 교체한 별도 파일이다.

> **사용자 용도 확정(2026-09-09): 이 영상은 스킬 트레일러로 사용한다.** 다음 별도 제작물은 [30초 맵 소개](MAP_INTRO_20260909.md)다. V22 영상 파일은 그대로 보존한다.

사용자 최신 요청: 스킬 대부분을 짧은 컷에 촘촘하게 배치하고, 블랙스타를 포함한다. 여성 캐릭터의 실제 여성 음성, 자막 없는 글로벌 검토본, 보이는 몬스터, 실제 탄막 충돌, 다양한 탄막과 무지개탄을 함께 검수한다. V2/V2.1 파일은 이전 검토 이력으로 보존한다.

## 촬영 계약

| 항목 | V22 구현 |
|---|---|
| 런타임 | `server.cjs`, localhost:3333, `game.html?testchar=1`, 선택 캐릭터 1 |
| 도구 | `tools/recapture_trailer_combat_v22_20260909.py`, Playwright headless Chrome. 매 take 새 브라우저 context/페이지로 저장소·시전·장판·시체·입력 상태를 격리한다 |
| 저장 | 촬영 메모리에서 `_dbReady=false`, `_charId=null`; 캐릭터 저장 안 함 |
| HP | take 시작 시 `P.mhp=P.hp=100000000`, `P.iframes=0`; 매 프레임 HP 회복·무적 부여·사망 해제 없음 |
| 자원 | `protect`는 이제 MP/ST만 각각 최대치로 회복한다. 공격 충돌·패링·피격·기본 회피·스킬 고유 무적은 실제 게임 경로 |
| 캐릭터 렌더 | 녹화 중 `drawP()` 호출에 한해서 기존 피격 깜박임용 iframes 값을 잠시 0으로 그린 뒤 `finally`에서 복원한다. 업데이트/충돌 판정은 복원된 실제 값을 사용한다 |
| 적 | `mkEn`으로 현재 스폰 공식을 사용한다. take별 임시 `P.lv`로 몬스터 레벨 설정 후 플레이어 Lv500 복원. 기본 몬스터 Lv35, HP·쉴드·공격 공식 변경 없음 |
| 적 종류 | etype `[0,1,3,4,6,7]`, 속성 `[EL.P,EL.F,EL.I,EL.L,EL.D]` 순환 |
| 공간 인덱스 | 장면 교체 후 `_shDirty=true;shRebuild()`로 전체 재구성. 교체 전 `ens`의 보이지 않는 적이 증분 공간 인덱스에 남지 않게 한다 |
| 첫 공격 | 촬영 시작 시 `_firstShot=false`, `projT=180+i*25`로 군집의 첫 일제사격을 분산. 이후 실제 AI/쿨다운을 사용한다 |
| 연출 탄막 | 화면 내 살아 있는 적 최대 24기를 `black/fire/water/red/special/normal` 순서로 실제 60f 차징시킨다. `_tickProjCharge → _fireChargedProj`가 발사한다. 빈 공간의 가상 발사체 생성 제거 |
| 무지개탄 | 실제 `blackBean`. Q 성공 시 블루콩 유도반사, E 패링 불가 계약 유지. 촬영 입력은 실제 키 이벤트이며 패링 윈도우/쿨다운을 강제 재설정하지 않는다 |
| 지옥강타 | 분노 강조 take는 시작 분노를 `_rageMax()`로 설정한다. 사용 시 실제 소모·피해·폭발 처리 |
| 블랙스타 | `ULT_SLOT='blackStar'`, `_dispatchSkillSlot(-1,...)`; Lv5 540f(9초) 흡인 후 `fireBlackStar`. 시전 시간 가속 없음. 현재 구현은 피해 없는 흡인 유틸이며 종료 시 스턴·넉백·기둥/버스트 발생 |
| 블랙홀 | `lavaSummon` 실제 300f 흡수·포획·재분출. 다양한 실제 적 탄막을 투입한다 |
| 텍스트 | 녹화 `draw()` 동안에만 `G.txts=[]`로 부유 텍스트를 제외하고 finally에서 원래 배열 복원. 추가 Canvas 한글 문자열 제외. 편집 자막/자막용 어두운 판 없음. 기존 영어 로고 사용 |
| 오디오 | 실제 AudioBuffer 시작 이벤트·키·캐릭터 번호 기록. `_comp` 출력과 필살기 직결 음성을 함께 녹음. 남성/공용 플레이어 보이스가 재생되면 실패 |
| 실패 조건 | 녹화 마지막 HP≤0, 예상 종료보다 0.4초 이상 빠른 프레임 중단, pageerror 또는 `[LOOP CRASH]` |

`test/trailerCombatSafety.test.js`는 HP/피격 무적 보존, 렌더 후 iframes 복원, 시작 HP 계약, 교체 후 공간 인덱스 전체 재구성을 검사한다. 스킬 발동 감사는 `_addSkProf`, 슬롯 디스패치, 블랙스타 종료 이벤트를 기록하고 실제 프레임으로 보완한다. 디스패치 성공만으로 시각 PASS를 선언하지 않는다. 기둥 take는 `pillarSpike` 합체로 darkPillar와 spikeTrap을 함께 사용하며, 기둥 합체의 실제 렌더 강도를 그대로 촬영한다.

## 몬스터 몸체 누락 수정

| ID | 위치 | 원인 | 복구 |
|---|---|---|---|
| `skinless_hound` | idx25, col1/row3, south·west | idle atlas 256×256 셀이 완전 투명; walk가 없어 이 방향에서 몸체 누락 | 기존 `img/ch1_8dir/skinless_hound/{south,west}.png` 248×248 원본을 셀 중앙 `(4,4)`에 재포장 |

`tools/repair_ch1_empty_atlas_cells.py`는 수정 전 `tmp/trailer_v22_before`에 백업하고 빈 셀만 복구한다. 신규 캐릭터 생성 없음. `test/test_ch1_atlas_visibility.py`는 40종×8방향의 알파가 전부 비어 있지 않은지 검사한다. 메타데이터·이동 시트·충돌·수치는 변경하지 않는다.

## 편집·검수 기록

| 항목 | 경로/계약 |
|---|---|
| 원본·감사 | `tmp/trailer_combat_v22/*.webm`, 동명 JSON의 `samples/audio/combat/skills` |
| 편집 | `tools/build_trailer_combat_v22_20260909.py` |
| 편집표 | `tmp/trailer_combat_v22/timeline.json`, 각 컷 sourceStart 및 최종 start/end |
| 출력 | `captures/gameplay_trailer_20260909/EXODUSER_GAMEPLAY_TRAILER_V22_SKILL_MONTAGE_1080P60.mp4` |
| 마스터 | 1920×1080, 60fps, H.264 CRF18/preset slow, AAC320k. 원본 속도 1× |
| 길이 | 48컷·98초. EDL의 각 duration 합계로 영상·음악·오디오 길이를 계산하며 마지막 2초 음악 페이드. 기존 V2 EDL의 70초 결과는 동일 |
| 음악 | 기존 Bloodsteel Ascension 18초부터, volume0.48; 동시 녹화 SFX volume1.8, 최종 loudnorm -16 LUFS / TP -1.5 / LRA9 |
| 맵 범위 | 밋밋한 CH1 제단 도입 컷 제외. 기존 CH2 벌집·CH3 의식장 환경 컷 각 2초 사용. 용뼈와 제단의 실제 맵 재배치는 이번 스킬 촬영 파이프라인에 미포함이며 별도 미완 항목으로 유지 |

## 최종 검증 — 2026-09-09

| 항목 | 결과 |
|---|---|
| 최종 파일 | 169,838,214 bytes, 98초, 5880프레임, 1920×1080, 60/1 fps, AAC |
| 디코드/브라우저 | 전체 ffmpeg 디코드 PASS. Chrome native video readyState4, 98초, seek 74초 이후 실제 재생 전진, media error 없음 |
| 자막 | 자막 스트림 0, ASS 합성 없음. 최종 48개 컷 중간 프레임에서 추가 설명 자막 없음. 영어 로고/일부 게임 영어 UI는 유지 |
| 실제 촬영 음성 | 여성 전용 AudioBuffer 재생 70건, 남성·공용 플레이어 보이스 0건. 편집 전 19 take 합계이며 최종 편집 음성 수로 오인하지 않는다 |
| 피격 | 실제 HP가 감소한 발사체 접촉 154건. 전 take 생존. 보호막·기동기 고유 무적은 원래 규칙 유지 |
| 탄막 | 무지개탄/화염/물/적색 탄막 및 속성 0~5 발사 이벤트 확인. undefined 표시는 기존 발사체의 el 미지정 감사값이며 별도 신규 탄종이 아니다 |
| 블랙스타 | 시전 0.510초, 실제 종료 9.514초. 종료 구간을 오프닝과 후반 85~88.5초에 사용 |
| 스킬 범위 | 원본에서 SKILL_LIST 55종 중 38종(69.09%)의 숙련도 발동 또는 슬롯 디스패치 성공 확인. 기본/자동 스킬 포함. 합체 3종은 별도. 이 수치는 각 스킬의 독립된 시각 표현 38종을 보증하지 않는다 |
| 자동 검증 | Node 관련 20/20, Python atlas 1/1 PASS. 8방향×40종의 완전 투명 셀 0. 두 복구 셀 바깥 픽셀 변화 없음 |
| 런타임 오류 | 19 take pageerror/LOOP CRASH 0건 |
| 프레임 제한 | 출력은 고정 60fps. 원본 최대 프레임 간격 268.6ms(지옥강타 대량 처치). 보스 60.1ms. 원본의 순간 지연이 있으며 완전한 native 60fps 성능 보증이 아니다 |
| 시각 확인 | FINAL_CONTACT_SHEET_01~06.jpg 전 48컷 및 개별 스킬 proof를 육안 확인. 블랙스타 문양·다색 탄막·강타 폭발·뼈벽·얼음보주·전대 소환·보스 본체·영어 로고 확인 |
| 시각 잔여 | domains 4개 컷은 보호막 효과가 겹쳐 각 스킬 차이가 약하다. 일부 작은 탄환·장판 스킬은 짧은 컷에서 구별이 제한된다. 용뼈 추가/제단 개선 요구는 아래 미완 항목이다 |

### 촬영 수치

| take | 길이(s) | 시작 적 수 | 적 레벨 | 반경 | 기록 프레임 | 처치 | 최소 HP | HP 감소 접촉 | 여성 음성 | 최대 간격(ms) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| rainbow_parry | 9 | 24 | 35 | 380 | 527 | 6 | 63782177.894 | 17 | 7 | 169.5 |
| rage_slam | 6 | 112 | 35 | 270 | 332 | 117 | 83007513.452 | 23 | 4 | 268.6 |
| blackstar | 13 | 32 | 35 | 500 | 772 | 2 | 46661776.744 | 15 | 6 | 87.0 |
| blackhole | 9 | 48 | 35 | 480 | 517 | 15 | 95506291.806 | 6 | 4 | 170.8 |
| blades | 8 | 72 | 35 | 420 | 458 | 93 | 93010609.316 | 3 | 4 | 92.9 |
| ice_orb | 5.5 | 64 | 35 | 420 | 319 | 2 | 89655596.371 | 2 | 2 | 73.4 |
| pillars | 7 | 88 | 35 | 320 | 401 | 105 | 95005820.847 | 8 | 1 | 103.8 |
| bone_storm | 8 | 64 | 35 | 420 | 462 | 39 | 96005994.578 | 5 | 5 | 141.8 |
| mortar | 5 | 64 | 35 | 420 | 290 | 38 | 96005901.067 | 3 | 6 | 70.7 |
| domains | 8 | 64 | 35 | 420 | 477 | 0 | 100000000.000 | 0 | 1 | 55.5 |
| traps | 7 | 64 | 35 | 420 | 405 | 33 | 97505543.825 | 5 | 2 | 91.7 |
| scarecrow | 8 | 32 | 35 | 420 | 452 | 34 | 88273787.369 | 9 | 4 | 222.7 |
| ancestor | 7 | 64 | 35 | 420 | 406 | 12 | 96006673.161 | 2 | 3 | 72.6 |
| ki_whirl | 7 | 96 | 35 | 220 | 400 | 66 | 82506308.978 | 16 | 7 | 89.9 |
| magic_beams | 9 | 96 | 35 | 420 | 514 | 74 | 79077229.663 | 18 | 4 | 199.9 |
| mobility | 7 | 96 | 35 | 420 | 406 | 23 | 100000000.000 | 0 | 0 | 85.2 |
| fused_storm | 6 | 112 | 35 | 420 | 344 | 101 | 95006712.928 | 4 | 2 | 109.7 |
| fused_slam | 5 | 96 | 35 | 300 | 276 | 96 | 95506817.095 | 5 | 4 | 240.1 |
| boss | 10 | 0 | 35 | 420 | 598 | 0 | 87000310.391 | 13 | 4 | 60.1 |

보스 take의 count=0은 아레나 진입 전 초기 군집 수이며, 실제 보스 1기는 `_enterBossArena(true)`로 생성한다. 적 수는 전투 중 소환/스폰으로 변한다. HP 소수부는 기존 회복 효과로 변할 수 있으며 촬영기가 매 프레임 회복한 값이 아니다.

### 관측 스킬 ID

| ID | 현재 한글명 |
|---|---|
| `ancestorSummon` | 전대 소환 |
| `arcLaser` | 얼음송곳 |
| `blackStar` | 블랙 |
| `bladeDash` | 전격이동 |
| `blueShot` | 푸른비 |
| `boneWall` | 해골무덤 |
| `chainSlash` | 기동칼날개 |
| `darkPillar` | 악의기둥 |
| `detonate` | 기폭팔 |
| `elemMissile` | 원소추적탄 |
| `explodeScarecrow` | 폭발 허수아비 |
| `fireBeam` | 업화선 |
| `fireball` | 악의구 |
| `ghostXbowTurret` | 공성쇠뇌 |
| `giantSlam` | 지옥강타 1 |
| `giantSlam2` | 지옥강타 2 |
| `holyDome` | 회복의 영역 |
| `holyPrison` | 구속의 영역 |
| `iceOrb` | 얼음보주 |
| `iceStorm` | 아이스스톰 |
| `kiSlash` | 기검참 |
| `lavaSummon` | 탄막블랙홀 |
| `ltnChaser` | 뇌전추격자 |
| `magicBlink` | 사슬기동:화염 |
| `maliceDome` | 신의영역 |
| `maliceHunt` | 악의 사냥 |
| `maliceMortar` | 폭풍소환 |
| `maliceStorm` | 악의폭풍 |
| `needleShot` | 만화방창 II |
| `plagueBurst` | 폭독칼날 |
| `skyCrusher` | 천공쇄기 |
| `spikeTrap` | 가시덫 |
| `thunderStake` | 뇌전창 |
| `timeWarp` | 시간왜곡 |
| `venomBlade` | 독사 |
| `voidScarecrow` | 유령 허수아비 |
| `weakMag` | 침식의 영역 |
| `whirlwind` | 회전참 |

### 편집표

| 컷 | take | 원본 시작 | 최종 시작 | 최종 끝 |
|---:|---|---:|---:|---:|
| 1 | blackstar | 9.45 | 0.00 | 1.00 |
| 2 | fused_slam | 1.05 | 1.00 | 2.00 |
| 3 | rainbow_parry | 1.30 | 2.00 | 3.00 |
| 4 | ch2_hive | 0.60 | 3.00 | 5.00 |
| 5 | ch3_ritual | 0.60 | 5.00 | 7.00 |
| 6 | ki_whirl | 0.50 | 7.00 | 8.80 |
| 7 | ki_whirl | 3.00 | 8.80 | 11.00 |
| 8 | mobility | 0.40 | 11.00 | 12.10 |
| 9 | mobility | 1.60 | 12.10 | 13.10 |
| 10 | mobility | 2.50 | 13.10 | 14.80 |
| 11 | mobility | 5.60 | 14.80 | 15.90 |
| 12 | magic_beams | 0.30 | 15.90 | 17.00 |
| 13 | magic_beams | 1.80 | 17.00 | 18.10 |
| 14 | magic_beams | 3.30 | 18.10 | 19.30 |
| 15 | magic_beams | 4.60 | 19.30 | 21.50 |
| 16 | blades | 0.40 | 21.50 | 22.90 |
| 17 | blades | 2.20 | 22.90 | 24.30 |
| 18 | blades | 4.20 | 24.30 | 25.70 |
| 19 | blades | 6.00 | 25.70 | 27.30 |
| 20 | rainbow_parry | 0.50 | 27.30 | 33.10 |
| 21 | rage_slam | 0.80 | 33.10 | 36.90 |
| 22 | bone_storm | 0.40 | 36.90 | 38.50 |
| 23 | bone_storm | 2.60 | 38.50 | 40.30 |
| 24 | bone_storm | 5.10 | 40.30 | 42.10 |
| 25 | mortar | 0.60 | 42.10 | 44.40 |
| 26 | ice_orb | 0.60 | 44.40 | 47.90 |
| 27 | pillars | 0.40 | 47.90 | 50.10 |
| 28 | pillars | 3.40 | 50.10 | 52.30 |
| 29 | traps | 0.40 | 52.30 | 53.40 |
| 30 | traps | 2.90 | 53.40 | 54.80 |
| 31 | traps | 4.70 | 54.80 | 56.60 |
| 32 | domains | 0.30 | 56.60 | 57.80 |
| 33 | domains | 2.00 | 57.80 | 59.00 |
| 34 | domains | 4.00 | 59.00 | 60.20 |
| 35 | domains | 6.00 | 60.20 | 61.40 |
| 36 | scarecrow | 0.30 | 61.40 | 63.20 |
| 37 | scarecrow | 3.00 | 63.20 | 64.60 |
| 38 | scarecrow | 5.80 | 64.60 | 66.40 |
| 39 | ancestor | 0.50 | 66.40 | 69.20 |
| 40 | ancestor | 4.50 | 69.20 | 71.20 |
| 41 | fused_storm | 0.40 | 71.20 | 74.70 |
| 42 | fused_slam | 0.50 | 74.70 | 77.70 |
| 43 | blackstar | 0.40 | 77.70 | 79.50 |
| 44 | blackhole | 0.60 | 79.50 | 82.30 |
| 45 | blackhole | 5.40 | 82.30 | 85.00 |
| 46 | blackstar | 9.00 | 85.00 | 88.50 |
| 47 | boss | 1.70 | 88.50 | 94.00 |
| 48 | title | 0.00 | 94.00 | 98.00 |

## MAP PRODUCTION REPORT — 기존 맵 촬영 범위

| 항목 | 이번 작업 |
|---|---|
| STAGE | 현행 CH1-1 전투, 기존 CH2 벌집/CH3 의식장 컷 재사용. 새 맵 제작 없음 |
| MASTER | silhouette/regions/main route/side spaces: 현행 SSOT 유지, 변경 0 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH/major holes: 수정·재판정 안 함 |
| LARGE | source assets/composites/overlap/repeated silhouette: 맵 에셋 수정 0 |
| MEDIUM | connections/remaining holes: 수정 0 |
| GROUND | shadow/contamination/structure integration: 수정 0 |
| PLAYABLE | arenas/travel/breathing/threat space: geometry 변경 0. 촬영 전투 가독성은 위 시각 기록 참조 |
| LANDMARK | primary 중앙 트리/secondary side POI/tertiary 현행 소품 유지. 현재 CH1-1 런타임에는 m_dragon_skeleton/m_dragon_3d 배치 0이며 m_c1altar만 해당 검색에 관측됨 |
| CAMERA QA | START/EARLY/SIDE L/LATE/EXIT 신규 검수 없음. ARENA 군집 전투와 보스, 기존 SIDE R/랜드마크 컷 확인. 제단 컷은 제외 |
| TECH QA | route/collision/seam 새 검사 없음. 전투 pageerror0. 전체 asset404 검사는 이번 최종 검사에 미포함. 별도 랜드마크 탐색 1회 networkidle 60초 시간 초과, 실제 G.on 대기로 재탐색 성공. 성능 최대268.6ms 원본 간격 |
| FILES | stage-owned 맵 파일 수정 0. 촬영 도구/atlas 2개/관련 docs·tests 변경. 기존 game.html 등 동시 WIP는 이번 커밋에 넣지 않음 |
| GIT | 이번 소유 코드+docs만 선택 커밋. push/deploy 없음 |
| VISUAL VERDICT | RETOUCH — 스킬 몽타주 검토본 제작 완료. 용뼈 활용·제단 맵 연출은 미완이며 map visual PASS로 판정하지 않음 |
| NEXT PASS | 현행 CH1-1 SSOT와 함께 용뼈의 실제 맵 배치/전투 경로/랜드마크 구도를 설계·검수한 뒤 환경 컷 교체 |
