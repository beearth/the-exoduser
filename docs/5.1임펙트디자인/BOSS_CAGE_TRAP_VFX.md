# 공용 뼈감옥(`cageTrap`/`boneWall`/`boneStorm`) VFX SSOT

> **2026-09-06 최종 확정 — 해골무덤 플레이어 전용:** 드루이드만이 아니라 **전체 보스(si0~34)의 cageTrap 사용을 금지**한다. 아래 보스 사용 계약은 이전 기록이다. 모든 무브셋에서 제외, 관련 콤보 2개 제거, AI 점수 -1, 강제 실행도 생성·피해·소리 없이 recover/25f 종료. idx41 정의는 배열 인덱스 호환용 예약으로 보존한다. 플레이어 boneWall/boneStorm과 공용 boss_cageTrap 이미지·음향은 유지한다. 기존 보스용 잔여 배열/렌더는 호환용이며 신규 생성 경로는 없다. 회귀 검사: 35개 stage 강제 호출 모두 생성 0, 플레이어 공용 시트·음향 포함 관련 테스트 7개 PASS.

> 최종 업데이트: 2026-09-03
> 런타임: `game.html`의 `registerVFX('boss_cageTrap', ...)`, `// ══ 감옥 렌더 ══`, `// ══ 활성 해골무덤 렌더 ══` 블록

## 에셋 계약

| ID | 한글명 | 런타임 파일 | 포맷 | 전체 크기 | 배열 | 셀 | 프레임 | 합성 |
|---|---|---|---|---:|---:|---:|---:|---|
| `boss_cageTrap` | 뼈감옥 | `assets/vfx/boss/boss_cageTrap.webp` | 투명 RGBA WebP | `1536×1024` | `3×2` | `512×512` | `6` | `source-over` |

- 원본은 사용자가 제공한 `ChatGPT Image 2026년 9월 3일 오후 07_33_33.png`(`1448×1086`, RGBA)이다. 상단 3개·하단 3개로 구성된 6프레임 투명 콜라주다.
- `tools/process-boss-cage-trap-sheet.mjs`가 원본의 3×2 고정 격자를 자르고 각 프레임을 `488×488` 안에 비율 유지로 축소한 뒤 `512×512` 셀에 12px 여백으로 배치한다.
- 런타임 시트는 `1536×1024` 3×2이며 여섯 셀을 모두 성장 프레임으로 사용한다.
- 보관 원본은 `assets/vfx/boss/source/boss_cageTrap_source_20260903_193333.png`이다.
- 활성 런타임 경로와 레거시 루트 경로 `boss_cageTrap.webp`는 같은 정규화 결과를 사용한다.
- 교체 전 루트 초안은 `assets/vfx/boss_backup_20260903/boss_cageTrap.webp`에 보존한다.
- 등록 ID는 기존 보스 로더 호환을 위해 `boss_cageTrap`을 유지하지만, 같은 시트를 보스 `cageTrap`, 플레이어 `boneWall`(해골무덤), 합체 `boneStorm`(해골번개)이 공용한다.

## 재생·배치 계약

> 2026-09-06: 드루이드(si0/si3)에서는 cageTrap 생성 금지(무브셋 제외 + 실행 가드). 다른 보스 및 플레이어 boneWall/boneStorm의 공용 VFX는 그대로 유지한다.

| 단계 | 시간 | 프레임/표현 | alpha | 비고 |
|---|---:|---|---:|---|
| 경고 | `0≤t<40f` | 빨간 점선 반경 `110px` | `0→0.4` | 스프라이트 미표시 |
| 성장 | `40≤t<76f` | `floor(min(1,(t-40)/36)×6)`, 상한 `5` | `1` | `36f` 동안 0→5 전개 |
| 유지 | `76≤t<180f` | frame `5` | `1` | 완성된 뼈감옥 유지 |
| 퇴장 | `180≤t<210f` | frame `5→0` 역재생 | `1→0` | 마지막 `30f` 수축 역재생+페이드 |

| 배치 항목 | 값 | 근거 |
|---|---:|---|
| 월드 반경 | `ct.r=110px` | 전투 판정 불변 |
| 스프라이트 크기 | `ct.r×3.35=368.5px` | 바깥 보라 링·뼈 장식을 포함한 시각 직경 |
| 화면 X | `ct.x-size/2` | 중앙 정렬 |
| 화면 Y | `ct.y-size×0.54` | 지면 링을 판정 중심에 맞추고 높은 뼈 가시는 위로 솟게 배치 |

## 플레이어 해골무덤·해골번개 재생 계약

| 대상 | 생성 배열 | 성장 | 유지 | 퇴장 | 시각 크기 | 추가 레이어 |
|---|---|---|---|---|---:|---|
| `boneWall` 해골무덤 | `G._boneWalls` | `riseT=60f`, `floor(min(t/riseT,1)×6)`, 상한 frame 5 | `phase='stand'`, frame 5 | 마지막 `60f`, frame `5→0` 역재생+alpha `1→0` | `ringR×3.35` | 없음 |
| `boneStorm` 해골번개 | `G._boneWalls` + `G._fireZones(type='boneStorm')` | 해골무덤과 동일 | 해골무덤과 동일 | 해골무덤과 동일 | `ringR×3.35` | 링 내부에 기존 녹색 이오닉 스톰·암흑 DOT 유지 |

| 플레이어 배치 항목 | 값 | 근거 |
|---|---:|---|
| 월드 반경 | `ringR=floor((400+(Lv-1)×18)×0.7)` | 기존 충돌·차단 범위 불변; Lv1 `280px`, Lv20 `519px` |
| 화면 X | `bw.x-size/2` | 보스 시트와 동일한 중앙 정렬 |
| 화면 Y | `bw.y-size×0.54` | 지면 링과 판정 중심 정렬 |
| 이미지 로드 실패 | 기존 `pilCnt=floor(2π×ringR/18)` 절차식 해골벽 | 기능·가시성 안전 폴백 |

플레이어 경로는 시각만 교체한다. 스택, 악의/MP 비용, 지속시간, 생성 피해, 적·투사체 차단, 사슬기동 관통, 악의폭풍 DOT 및 합체 판정은 변경하지 않는다.

## 공용 생성 사운드 계약

| 생성 대상 | 필수 공통음 | 추가음 | 호출 규칙 |
|---|---|---|---|
| 보스 `cageTrap` | `skull_summon`, vol `0.6`, pitch `0.9±0.15` | `SFX.magic(2)` | `G._cageTraps.push()` 직후 1회 |
| `boneWall` 해골무덤 | `skull_summon`, vol `0.6`, pitch `0.9±0.15` | `SFX.magic(EL.D)` | `G._boneWalls.push()` 직후 1회 |
| `boneStorm` 해골번개 | `skull_summon`, 동일 | `SFX.magic(EL.D)` | 합체 분기 전에 1회 |
| `elecRepent` 참회 귀환 | `skull_summon`, 동일 | `SFX.magic(EL.L)` + 전사 `repentance` / 실버테일 `silvertail_repentance` | 참회 분기 여부와 무관하게 뼈벽 생성 직후 1회 |

`skull_summon`은 `sfx/skillsound/bone/skull_summon.mp3`(MP3, 44.1kHz stereo, 1.48초)를 사용한다. 참회 귀환에서 캐릭터별 참회 음성이 뼈 생성음을 대체하지 않는다. 실버테일은 남성 음성 포함 `repentance` 대신 `_SILVERTAIL_VOICE_MAP`의 전용 여성 `silvertail_repentance`(`Repent!`)를 재생한다.

## 실패 안전·검증

| 항목 | 계약 |
|---|---|
| 이미지 로드 전/실패 | 갈색 원과 회전하는 12개 가시로 된 기존 절차식 렌더를 사용한다. |
| 판정 분리 | 스프라이트 프레임은 시각 전용이다. 피해는 `abs(distance(P,cage)-110)<20`인 테두리 밴드에서만 발생한다. |
| 회귀 테스트 | `test/bossCageTrapSprite.test.js`가 파일 크기·알파·6개 셀의 비절단 여백·등록 규격·보스/플레이어 성장 및 퇴장 역재생·절차식 폴백·해골번개 공용 경로·모든 뼈감옥 생성 경로의 `skull_summon` 1회 호출을 검증한다. |
| 인게임 캡처 | `captures/bone_cage_20260903/bone_cage_six_frames_ingame.png`에서 0→5 전 프레임을 실제 맵 위에 동시 배치해 검수한다. |
| 변경 금지 | 반경 `110`, 경고 `40f`, 수명 `210f`, 피해 `ATK×0.8`, 재타격 `20f`, 패링 가능 계약은 시각 교체로 변경하지 않는다. |
