# 실버테일 등검 회전 공격 — 2026-09-15 v2

사용자 최신 확정: 실버테일은 **등에 붙어 있는 검을 몸의 회전으로 휘둘러 타격**하고, 손에는 **보조 단검**을 사용한다. 기존 단검1자루·왼손 배치를 유지한다. 손에 대검을 들고 베는 이전 v1은 불채택이며 런타임에서 사용하지 않는다.

## 에셋·장비 계약

| 항목 | 현행 값·적용 |
|---|---|
| 주무기 | 상부 등/목뒤 허브에 연결된 회전검1. 공격 내내 연결 유지, 손으로 잡지 않음 |
| 보조무기 | 왼손 곡선 단검1, 오른손은 균형 자세. 공격 중 왼 허벅지 검집은 비움 |
| 본체 | 은발 높은 포니테일·흑철 갑주·갈라진 치마. 몸의 세로축을 중심으로 돌아가며 발은 바닥 피벗 |
| 공격 시트 | `img/exoduser_silvertail/attack-spin-v2.png`, 240×240 RGBA, 3×3, 9고유 포즈 |
| 소스 순서 | S→SW→W→NW→N→NE→E→SE→S 복귀. 생성 원본 중 후면 대각 두 셀은 실제 시점을 확인해 패킹 때 순서를 교정 |
| 셀 | 80×80, 발 앵커 `(40,62)`, 중앙 렌더 원점 대비 발 y=22 |
| 생성 참조 | 당시 8시점 시안은 2026-09-27 프로젝트에서 제거. 현행 공식 키아트는 [`SILVERTAIL_KEYART_CANON_20260927.md`](./SILVERTAIL_KEYART_CANON_20260927.md)의 2장. 기존 패킹 수치는 이력으로 유지 |
| 생성본 | `output/silvertail_attack_20260915/spin/source.png`, 1223×1286 RGBA |
| 생성 | 내장 imagegen: 회전 본체 생성→왼손 단검 편집. PixelLab 미사용 |
| 패커 | `tools/pack-silvertail-attack.cjs`; 모든 프레임 동일0.112배율, alpha 경계 크롭·발 정렬·80px 셀 경계 여백 검사 |
| 패킹 좌표 | 패커의 `poses` 배열이 각 소스 사각형/앵커 정의. 산출 위치는 `spin/packing.json` |
| 보관 | 이전 `attack-remaster-v1.png`와 앞/뒤 손대검 생성본은 불채택 작업 이력이며 현재 로더 참조 없음 |

## 런타임 연결

| 항목 | 값·공식·적용 |
|---|---|
| 적용 | `game.html`, `game-easy-test.html`의 실버테일 기검참과 E 공격 |
| 기본 시트 | `CHAR_LIST` idle2/walk4/atk4, 48px 본체. atk4는 로딩 실패 시 폴백이며 성공 시9프레임 확장 우선 |
| 로더 | `player-attack-remaster.js`, `SilvertailAttackRemaster.apply(base,frameMap,done)` |
| 병합 | width=`max(base.width,240)`, height=`base.height+240`; 현행480×384→480×624. 원본 캔버스·프레임맵 불변 |
| 방향 | 로더 dirs=`s,se,e,ne,n,nw,w,sw`, row=0..7, 시작 소스=`(8-row)%8` |
| 회전 클립 | f=0..8, i=`(start+f)%8`; S 방향 마지막만 별도 복귀 포즈 i=8 사용. 모든 방향에9프레임, 처음8포즈는8방향 순환 |
| 소스 좌표 | x=`(i%3)×80`, y=`base.height+floor(i/3)×80`, w/h=80 |
| 매핑 | `atk1/atk2/atk3/bash`만 교체, idle/walk/gSlam 등 기존 매핑 보존 |
| 몸 회전 배속 | `speed=1.5`, `spinProgress(p)=clamp(p×speed,0,1)`. 몸 회전 50% 가속, 완료 후 마지막 자세 유지 |
| LMB 준비 | `SilvertailAttackRemaster.progress('wWindup',left,recoveryTicks)=0` |
| LMB 타격 | recovery=`max(1,recoveryTicks)`, progress=`clamp(1.5×(5-left)/(5+recovery),0,1)` |
| LMB 회수 | progress=`clamp(1.5×(5+recovery-left)/(5+recovery),0,1)` |
| LMB 프레임 | `min(8,floor(progress×9))`; 회전 정규화 시간 `(5+recovery)/1.5`틱. recovery=16이면21→14틱(60fps 기준350→233.33ms). 첫 공격 프레임 생략/회수 시 재시작 없음 |
| E 프레임 | 실제 방향 atk2 배열 길이를 사용(확장9/폴백4), 9프레임 배속은 `_silvertailAttackPose`에서1회 적용하며 bodyProgress=`pose.spinProgress`; 폴백4는 기존240ms; `min(n-1,floor(bodyProgress×n))` |
| E 시간 | shield spinProgress=`clamp(elapsed/240×1.5,0,1)`(9프레임). 몸과 일반/강화 E 아크가160ms 진행률 공유. 4프레임 폴백240ms, 포즈 수명360ms 유지. [강화 아크](SILVERTAIL_E_ARC_20260916.md) |
| 렌더 | `SpriteAnimator.draw`로 몸의 각 시점 순환. 화면 위에서 이미지 전체를 기울여 돌리지 않음 |
| 조준·전투 | P.facing, 피해·범위·공속·자원·패링·LMB 검기 변경 없음. E VFX는2026-09-16 기존 보라 아크 강화형 및 몸 동기화 적용 |
| 명암·캐시 | 본체에 기존 `_shadePlayerAtlas` 후 공격 확장 병합. 공격에는48px 명암 필터 재적용 없음; 외곽선/밝기 캐시는 병합본으로 갱신 |
| 폴백 | 이미지 로딩 실패 또는240×240 규격 불일치 시 원본 유지 |
| 비동기 보호 | `_charIdx!==idx` 또는 `_atlasMask!==c`이면 늦은 결과 폐기 |
| 버전 | JS `?v=20260915-spin-speed15`; PNG `?v=20260915-spin2` |
| 배포 | `build-nwjs.mjs` FILES에 로더 포함, PNG는 기존 img 복사 |
| 배율 | 기존2×0.65=1.3 유지 |

## 검증·통합

| 검증 | 결과 |
|---|---|
| 자동 | 회전 시작/완주·8시점 순환·폴백·캐릭터 전환·배포·기존 모션/선택·새 본체 패킹·명암 테스트36개 통과(초기 통합). 배속 변경 검증은 아래 추가 기록 |
| 배속 검증 | 위 회귀 검사와 1.5배 진행률·14틱/160ms 완료·완료 자세 유지 검사를 합쳐37개 통과. 기존9포즈 순환 및 준비0프레임 유지 확인 |
| 패킹 | 9포즈 모두80px 셀 내부 여백 검사 통과 |
| 시각 | `tools/silvertail-attack-preview.html`: 실제 SpriteAnimator/병합 로더로8조준 방향×9프레임,1.3배/3배 확인. 미리보기 `60/speed=40ms/프레임`(기존60ms 대비1.5배)은 검수용이며 전투시간과 별개 |
| 병렬 본체 | 새 idle/walk 리마스터가 현재 적용됨. 그 시트를 덮어쓰지 않고 조립된 결과 아래에 공격을 추가 |
| 제한 | 생성 포즈의 등검 길이·머리카락·갑옷 세부가 시점마다 미세하게 달라짐. 손대검 동작은 제거했으며 완전한 리깅 모델과 동일한 형태 보존을 의미하지 않음 |

프롬프트: `output/silvertail_attack_20260915/spin/prompt_body.txt`, `prompt_dagger.txt`.
