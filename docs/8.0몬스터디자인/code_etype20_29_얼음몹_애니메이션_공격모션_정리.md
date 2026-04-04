# code etype20~29 얼음몹 애니메이션/공격모션 정리
> 정확한 월드 챕터 표기: `1장 = 썩은 숲`, `2장 = 벌레굴`, `3장 = 얼음굴`
> 기준: `game.html`의 `ATLAS_ENEMY_LAYOUT` etype 20~29, `몬스터_총관리.md` AI 노트, `img/pixellab_all` 대표 자산 현황
> 작성일: 2026-04-04
> 목표: 보스 리디자인 전에 코드상 `etype 20~29` 얼음 몬스터 10종의 전투 애니메이션과 공격 모션 기준을 먼저 고정한다.

## 범위
- 월드 기준 `1장`은 `썩은 숲`이다.
- 이 문서는 월드 챕터 문서가 아니라, 현재 코드상 `etype 20~29`로 묶인 얼음 몬스터 10종 정리다.
- 실제 `1장부터 완성` 작업은 썩은 숲 몬스터 묶음을 따로 분리해서 진행해야 한다.

## 공통 제작 기준
- 4방향 기준은 `south / west / north / east`로 통일한다.
- 기본 전투 세트는 `idle / walk / attack / hit` 4종이다.
- 이 묶음의 몬스터는 모두 `death` 전용 행 없이 기본 전투 행부터 완성한다.
- `attack`은 몬스터별 공격 성격에 맞춰 폴더를 선택하되, 같은 자산에 여러 공격 폴더를 섞지 않는다.
- 원거리형은 `fireball`을 우선 사용하고 `cross-punch`는 넣지 않는다.
  `build_monster_atlas.cjs`는 `cross-punch` 우선순위가 더 높아서 둘 다 있으면 근접 공격처럼 잡힌다.
- 사족보행형은 `idle / walk-4-frames / bark`를 허용한다.
  2026-04-04 기준 `tools/build_monster_atlas.cjs`에 별칭 매핑을 추가해 빌드 가능하게 맞췄다.

## 코드상 요구 상태

| etype | 이름 | 셀 | 상태 요구 |
|---|---|---|---|
| 20 | 빙결 전사 | 48 | `idle4 / walk4 / attack4 / hit2` |
| 21 | 빙궁수 | 48 | `idle4 / walk4 / attack4 / hit2` |
| 22 | 서리 늑대 | 48 | `idle4 / walk4 / attack6 / hit2` |
| 23 | 얼음 정령 | 48 | `idle4 / walk4 / attack4 / hit2` |
| 24 | 동상 좀비 | 48 | `idle4 / walk4 / attack4 / hit2` |
| 25 | 빙판 슬라임 | 48 | `idle4 / walk4 / attack2 / hit2` |
| 26 | 눈보라 마법사 | 48 | `idle4 / walk4 / attack6 / hit2` |
| 27 | 고드름 박쥐 | 48 | `idle4 / walk4 / attack4 / hit2` |
| 28 | 빙하 골렘 | 64 | `idle4 / walk4 / attack6 / hit2` |
| 29 | 빙마 | 64 | `idle4 / walk4 / attack6 / hit2` |

## 몬스터별 공격 모션 기준

| etype | 몬스터 | AI | 추천 공격 모션 | 권장 PixelLab 폴더 | 대표 자산 현황 | 다음 액션 |
|---|---|---|---|---|---|---|
| 20 | 빙결 전사 | `Melee` | 얼음검 전진베기 1회, 짧고 무거운 4프레임 | `lead-jab` 또는 `cross-punch` | `Frost Warrior` `43a2c159` `11/16` 세트. `idle south`, `walk 3dir`, `attack 4dir`, `hit 3dir` | `idle 3dir`, `walk north`, `hit south` 보강 |
| 21 | 빙궁수 | `Ranged` | 활 대신 1차는 손/활 들고 냉기 투사체 발사 | `fireball` | `Ice Archer` `4ebaf86c` `12/16` 세트. `walk 4dir`, `hit 4dir`, `attack 3dir`, `idle 1dir` | `idle 3dir`, `attack west` 추가. 최종형은 활 포즈 리디자인 |
| 22 | 서리 늑대 | `Charger` | 낮은 자세 돌진 후 물기, 몸통이 앞으로 쏠리는 6프레임 | `bark` | `Frost Wolf` `fcf2fc52` `4/16` 세트. `walk-4-frames`만 4dir 존재 | `idle`, `attack`, `hit` 전부 신규 제작. 현 묶음 최우선 보완 대상 |
| 23 | 얼음 정령 | `Ranged` | 부유 캐스팅 후 얼음 탄 발사, 몸 자체는 크게 이동하지 않음 | `fireball` | `Ice Elemental` `78a3508d` `6/16` 세트. `attack 3dir`, `hit 3dir`만 존재 | `idle 4dir`, `walk 4dir`, `south attack/hit` 추가 |
| 24 | 동상 좀비 | `Tank` | 어깨 들이밀기 또는 팔 휘두르기, 둔하고 느린 4프레임 | `cross-punch` | `etype24_frostZombie` `c99cebea` `5/16` 세트. 대부분 `south` 위주 | 사실상 4방향 재작업 수준 |
| 25 | 빙판 슬라임 | `Trapper` | 몸통 밀어치기 또는 빙판 분사, 짧은 2프레임 | `pushing` | `etype25_iceSlime` `c583cac8` `15/16` 세트. 공격만 1방향 부족 | `attack west` 1세트만 추가하면 1차 완료 |
| 26 | 눈보라 마법사 | `Sorcerer` | 지팡이/팔 들어 올린 뒤 눈보라 시전, 캐스팅형 6프레임 | `fireball` | `etype26_blizzardMage` `fffd7e58` `16/16` 세트 완료 | 현 자산은 완성. 다만 `cross-punch` 대신 `fireball`로 공격 모션 리디자인 검토 |
| 27 | 고드름 박쥐 | `Flyer` | 급강하 할퀴기 또는 고드름 투하, 전방 찌르기형 4프레임 | `lead-jab` | `etype27_icicleBat` `de26108e` `16/16` 세트 완료 | 현 자산 사용 가능. 박쥐형 실루엣 강조만 선택사항 |
| 28 | 빙하 골렘 | `MiniBoss` | 양팔 내려찍기 + 빙결파, 무게감 있는 6프레임 | `cross-punch` | `etype28_glacierGolem` `15e43a55` `9/16` 세트. `idle 4dir`, `attack 3dir`, `walk south`, `hit south` | `walk 3dir`, `hit 3dir`, `attack west` 추가 |
| 29 | 빙마 | `MiniBoss` | 기본 공격은 전방 빙결파 시전, 돌진은 패턴으로 분리 | `fireball` | `etype29_iceDevil` `8e213f58` `16/16` 세트 완료 | 현 자산 사용 가능. 장기적으로 `cross-punch` 계열을 캐스팅형으로 리디자인 가능 |

## 현재 우선순위

### 1차 즉시 보완
- `22 서리 늑대`: 현재 `walk`만 있고 공격/피격/아이들 전부 비어 있다.
- `24 동상 좀비`: 남쪽 위주 임시본이라 4방향 전투 감이 없다.
- `23 얼음 정령`: 캐스팅형 핵심 몬스터인데 `idle/walk`가 빠져 있다.
- `28 빙하 골렘`: 이 묶음의 미니보스급인데 `walk/hit` 방향이 거의 비어 있다.

### 2차 마감
- `20 빙결 전사`
- `21 빙궁수`
- `25 빙판 슬라임`

### 3차 폴리시
- `26 눈보라 마법사`
- `27 고드름 박쥐`
- `29 빙마`

## 파이프라인 메모
- 현재 `img/pixellab_all` 기준 이 얼음 etype 묶음의 대표 자산 최대치는 대부분 `16` 방향세트가 기준선이다.
- `서리 늑대`처럼 `walk-4-frames`를 쓰는 사족보행 자산은 이전까지 일반 빌드 스크립트에서 인식되지 않았고, 이번에 `tools/build_monster_atlas.cjs`에서 별칭 지원을 추가했다.
- 원거리형이 `cross-punch`를 들고 있으면 아틀라스 빌드에서 근접 공격으로 채택된다.
  이 얼음 묶음에서는 `빙궁수`, `얼음 정령`, `눈보라 마법사`, `빙마`를 가능하면 `fireball`만 유지하는 쪽이 맞다.

## 완료 기준
- code `etype 20~29` 10종 전부 `idle / walk / attack / hit` 4세트 확보
- 4방향 기준 누락 0
- 공격 모션이 AI 타입과 읽기상 일치
- `build_monster_atlas.cjs` 기준으로 별도 수동 수정 없이 아틀라스화 가능
