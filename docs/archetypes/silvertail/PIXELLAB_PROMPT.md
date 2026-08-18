# SILVERTAIL / BLADE DANCER — PixelLab 생성 프롬프트

파이프라인: PixelLab character `eda1221a-6fee-4228-9350-c36a15a3eaea` / template `mannequin` / directions 8 / view `low top-down` / size 224×224

> **캐논 기준 = MASTER TURNAROUND + WEAPON BIBLE (refs/).**
> 스프라이트 세트는 이 두 레퍼런스와 99% 싱크가 목표. 프롬프트/편집은 전부 여기에 맞춘다.

## 무기 = ROTARY BLADE SYSTEM (웨폰 바이블 확정)
- **단일 회전대검 1자루** — 목 뒤 **회전 허브(rotary hub)** 에 연결. 총길이 1830mm.
- **IDLE(정지)**: 블레이드가 **수직으로 접혀 등 척추 중앙에 밀착**, 팁이 허벅지 근처까지. 대각선 ✗, 머리 위로 솟음 ✗.
- **ACTION(공격/스프린트)**: 원심력으로 전개 → 큰 검을 **한 손에 draw** + 다른 손에 **단검 1자루**.
- **단검 2자루**: IDLE엔 **양쪽 허벅지 홀스터**(THIGH DAGGER, both sides), 액션에만 손에.

## ⚠️ v2 프롬프트 폐기 사유 (싱크 갭 원인)
구 v2는 "머리 위 대각선 대검 + 양손 쌍단검"으로 적혀 있었음 → 이는 **액션 무기배치를 IDLE에 잘못 얹은 것**.
`pixellab/Idle_rotations_8dir_EDIT.gif` / `_silvertail_edit_contact.png` 가 이 오류를 반영(특히 north 등검이 얇은 대각선 힐트로 나옴). 캐논과 불일치 → 재편집/재생성 대상.

## v3 IDLE 프롬프트 (캐논)
```
silver-haired female blade dancer, very long high silver ponytail, blackened iron plate
armor over sheer black mesh midriff, black plate bustier, long tattered ragged feathered
black skirt splitting into thin blade-like shreds (Berserk style), thigh-high black armored
high-heeled boots, a single folded straight double-edged blade sheathed flat and vertical
down the center of her spine, connected to a round mechanical rotary hub at the back of the
neck, blade tip reaching mid-thigh, two curved daggers holstered on both outer thighs,
empty hands, gritty dark fantasy, Berserk + FromSoftware art language, high contrast,
muted black palette (#0E0E10 / #1A1A1D / #2B2B2F, ash-white hair #C7C7C7)
```

## v3 ACTION 프롬프트 (attack/whirl/sprint 계열)
```
...(위와 동일 캐릭터)... rotary blade DEPLOYED and gripped in the right hand as an oversized
greatsword, a single curved dagger in the left hand, ragged skirt shreds trailing in motion
```

## north(REAR) 재편집 타겟 — 정밀
웨폰 바이블 back뷰 아트(refs/ Weapon Bible 좌상단) 기준:
1. 어깨/목 뒤에 **원형 회전 허브 디스크** (기계식, 브라스 스터드)
2. 그 아래로 **직선 블레이드가 척추 정중앙을 따라 수직 하강**, 팁 ~허벅지
3. 은발 포니테일이 블레이드 위를 부분적으로 덮음
4. 대검을 머리 위로 세우지 말 것 · 대각선 금지 · 손에 단검 금지(IDLE)

## 인게임 동기화 상태 (2026-08-08)

PixelLab ZIP의 최신 `Idle/animations/walk`만 `img/exoduser_silvertail/`에 적용한다. 각 인게임 PNG는 투명 배경 **480×48px** 가로 스트립이며 전사와 같은 프레임 구성인 **idle 2 + walk 8 = 10프레임**이다. `game.html`의 실버테일 설정도 `idleN:2`, `walkN:8`, `fw:48`, `fh:48`로 일치해야 한다. PixelLab `Idle/rotations`의 좌측 2프레임은 방향이 섞여 있으므로 사용하지 않는다. 두 idle 프레임은 방향이 맞는 walk 원본 `frame_000`을 동일하게 복제한다. 따라서 정지 중 보행 애니메이션은 재생되지 않으며, 걷기만 같은 원본의 `frame_000`~`frame_007`을 사용한다. PixelLab 224px 원본의 투명 패딩과 **가장자리에 연결된 검은 무투명 배경**은 프레임별로 투명화한 뒤 48px 셀에 `contain` 방식으로 맞춘다. `contain`의 빈 영역도 반드시 투명 배경(`RGBA 0,0,0,0`)으로 지정한다. 기본 검정 배경을 쓰면 사이드 프레임에 검은 사각형이 다시 생긴다. 따라서 기존 로더의 `idleN > 1` 멀티프레임 조건을 그대로 만족한다.

| 인게임 방향 파일 | 정지 2프레임 PixelLab 원본 | 걷기 8프레임 PixelLab 원본 |
|---|---|---|
| `6.png` | `south` | `south` |
| `5.png` | `south-west` (7시) walk `0` 복제 | `south-west` (7시) walk `0~7` |
| `3.png` | `east` (3시) walk `0` 복제 | `east` (3시) walk `0~7` |
| `1.png` | `north-east` (1시) | `north-east` (1시) |
| `12.png` | `north` | `north` |
| `11.png` | `north-west` (11시) walk `0` 복제 | `north-west` (11시) walk `0~7` |
| `9.png` | `west` (9시) | `west` (9시) |
| `7.png` | `south-east` (5시) | `south-east` (5시) |

전사와 같은 내부 8방향 행 순서를 사용한다. 실버테일 에셋 파일명은 방향 영문 대신 시 방향만 사용한다: `12, 1, 3, 5, 6, 7, 9, 11`. 수동 확인 매핑은 5시·7시만 같은 walk 원본을 서로 교환한다. 방향이 섞인 PixelLab `rotations`는 전 방향에서 완전히 제외한다.

재동기화 명령은 `npm run pixellab:silvertail:sync`이다. 이 명령은 API의 만료 가능한 개별 프레임 URL 대신 캐릭터 ZIP을 사용하며, 위의 5시↔7시 walk 원본 교환과 rotations 제외만 항상 적용한다. 게임 로더는 실버테일 PNG에 `?v=` + `_SILVERTAIL_ASSET_VERSION`를 붙인다. 2026-08-17부터 `20260817-keyart-body-v1` (키아트 본체). 구값 `20260808-clockfiles-v11`은 PixelLab 시트 시절.

## 상태(state)별 생성 필요

현재 적용됨: idle rotations, walk 9프레임. 미적용: attack(deploy), whirl, throw, dash. 추가 상태를 만들 때도 48×48 다운스케일 후 방향·프레임 수를 `game.html`과 이 문서에 함께 반영한다.

## 참고 레퍼런스 (refs/)
- MASTER TURNAROUND (09_41_58) — FRONT/45/SIDE/REAR45/REAR + 디테일(넥허브·접힌블레이드·허벅지단검)
- WEAPON BIBLE (10_20_48) — 로터리 블레이드 구조/폴드·디플로이/콤보
- 2D GAME SPRITE CONCEPT — 게임 스프라이트 타겟 룩
- 색상: PRIMARY #0E0E10 / METAL #2B2B2F / BLOOD RED #6B0D0D / ASH WHITE #C7C7C7
