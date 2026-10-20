# DEMO11-etype-b — DEMO11-58~62 자연 소환 인수 경계

**부분 산출물 제출 / 다섯 종 모두 NOT_READY. 실제 자연 소환·전투 구현 완료가 아니다.** 기준 `origin/main` `0138c5bb9188d27cee10cb1a901d075092ddb88f`, DEMO11-43 의존 `9b763da9900c3c225fa60caa556f5b8c9ea227a3` 정상 merge. main이 이 의존의 조상이어서 fast-forward했으며 rebase/force0. 브랜치 `codex/demo11-etype-b-20261021`.

## 인수 결과

| 단위 / etype | 원본 game.html 행 | 결과와 다음 실제 구현 접점 |
|---|---|---|
| DEMO11-58 / 8 | 31195–31196,38941,42784–42790 | NOT_READY. 기존 factory `native_type_ai_not_ported`. 투척은 원문 삭제. 사망 반경50 아군 hurtE·플레이어 magic hurtP는 보호 death owner에 요청해야 함. 이번에 hurtE 옵션 거부를 재현한 종이라는 주장은 하지 않음 |
| DEMO11-59 / 9 | 31197–31198,38944–38958 | NOT_READY. 같은 factory 거절. deadPool 첫 적합 시체의 HP50%/쉴드0/recover60·poise 복원, 실패60 재시도와 동일 객체 재활성화 접점 필요 |
| DEMO11-60 / 10 | 31200,38960–38971 | NOT_READY. 같은 factory 거절. 은신·뒤35 위치 canMv·telegraph20/windup10을 기존 공통 전투 actor에 합칠 접점 필요 |
| DEMO11-61 / 11 | 31202,38973–38983,40777–40797 | NOT_READY. 같은 factory 거절. eSummon35·etype3 2~3개·6원소/HP절반/쉴드0. type3 recipe/actor/6원소 emitter 재사용 후보. type7의 1~2개 결과를 그대로 전용하면 틀림. 부모/자식 MAP11 위치 승인과 실제 registry/origin 연결 필요 |
| DEMO11-62 / 12 | 31204,38985–38990 | NOT_READY. 같은 factory 거절. hp<40% 최초1회 speed×2.2/baseAtk=~~(×1.5)/atk 동기화를 실제 actor 필드에 적용할 접점 필요 |

현행 `enemy_factory.gd:151–166`은 5종을 모두 거절하고 `consume_atomic:568–616`은 이 종들의 actor를 생성하지 않는다. 기본 일반 AI로 보이는 `enemy.gd`도 제한된 중형4 profile용이며, flesh consumer에는 windup 입장이 없다고 명시되어 있다. `native_element_projectile_emitter.gd:89–90`의 실제 발사 admission은 type3/7/21뿐이다. 이를 지원된 etype로 위장하거나 data.etype만 교체해 자연 등록하지 않았다.

**묶음 A와 통합 후보:** 공통 동적 constructor/factory admission, 원본 idle/windup/recover phase·RNG, 실제 원소 projectile caller, World ens/phase 등록 후 adapter origin 등록. 사용자 지시대로 동일 공통 helper를 새로 만들거나 A의 진행 파일을 수정·반입하지 않았다. 이 접점 정렬 전 B의 특수 상태를 붙인 가짜 actor를 등록하지 않았다. 따라서 현재 산출물은 요청된 전투 구현의 선행 경계이며, 특수 상태 실행자와 자연 스케줄러 연결은 남아 있다.

## 이번 코드와 검증

B 전용 `native_demo11_etype_b_preflight.gd`는 직접 호출형 검사다. 실제 DEMO11-43 adapter가 현재일 때만 각 etype의 Marker 후보를 요청하고 기존 factory의 admission을 따로 기록한다. 반경은 caller의 명시 입력만 받고 좌표/반경 기본값이 없다. 한 종 거절 후 다음 종을 계속 처리한다. 최소 `{etype}` record는 factory의 거절 조회에만 사용하며 constructor·consume_atomic에 보내지 않는다. `ready:false`/`actor_registered:false`를 보존한다. Main 자동 호출·실제 생성/등록 함수는 추가하지 않았다.

| 검증 | 수치·범위 |
|---|---|
| 신규 경계 하니스 1회 | 27검사/0실패. 실제 Main/World/State/DEMO11-43 + 하니스 Provider/Marker. 5종 후보/정확한 ID·etype/거절 후 계속/음수 반경·stale 거부/등록·예정 분모 불변. 실제 etype actor 0개이며 전투 PASS가 아님 |
| 기존 DEMO11-43 무수정 1회 | 40검사/0실패. 기존 테스트 Provider를 상속 재사용했고 같은 helper 복사0. HP/플레이어 피해·패링 실행0 |
| 기존 회귀 내 adapter 벽시계 벤치 | 10,000회×3query, 평균120.3825µs/p99 208µs/max835µs. 원래 회귀에 포함된 측정 1회이며 후보 query 비용만. **요청된 5종 실제 동시 스폰 120fps 벤치는 미실행**: 실제 등록0이므로 예산 통과로 대체하지 않음 |
| 실행·경고 | import/new/adapter 각1회 exit0·ERROR0. 각 실제 Main 실행 Camera2D interpolation 경고1. `new.err`/`adapter.err` 원문 보존; 원인 선재 판정0 |
| 공용 변경 | 이번 자체 Main/State/World/Player·PC 전투·hurtE/hurtP 0줄. 의존43 Main의 adapter 12줄은 기인수 코드이며 자체 변경으로 세지 않음. 신규 tick·목록 생성 API·private clock·RNG0 |

원로그 `~/exoduser-wt/_out/demo11-etype-b/`. 새 테스트 격리 이름 `EXODUSER-demo11-etype-b-Isolated-20261021`, 기존 회귀는 파일 상수 `EXODUSER-demo11-43-Isolated-20261021`. 매 실행 pgrep gate/2 이상30초 대기, override finally 0byte. 실제 사용자 저장 접근0, 맵 지형/배치·바이너리·번역 텍스트·화면 추가0. Marker fixture는 MAP11 제품 provider 인수 증거가 아니다. 종별 행은 최신 main 원본에서 확인했고 추정으로 누락 경로를 READY로 하지 않았다.

관련 설계는 [docs/8.0 인수 경계](../../../8.0몬스터디자인/DEMO11_ETYPE_B_ADMISSION_20261021.md)에 기록했다. push·원격 SHA 확인 뒤 DONE에 NOT_READY 및 미실행 벤치를 적고 자기 worktree만 제거한다. R과 타 담당 작업은 보존한다.
