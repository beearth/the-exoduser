# 플레이어 자체 개선 — 2.5D 명암 (2026-09-15)

> **공격 확장:** 명암 보정된 기존 본체 뒤에 별도80px 공격 시트를 병합한다. 생성된 등검 회전9포즈(방향별9프레임)에는 이48px 명암 필터를 다시 적용하지 않는다. [공격 전용 연결](../archetypes/silvertail/SILVERTAIL_ATTACK_REMASTER_20260915.md).

> 후속 사용자 지시: 실버테일은 명암 보정만으로 부족하여 본체 재제작으로 전환. [새 외형 v1·제작 상태](../archetypes/silvertail/SILVERTAIL_REMAKE_20260915.md). 새 원화 기반48px 본체를 런타임에 적용했으며 아래 명암 계약도 새 시트에 적용한다. 아래 기존 PNG 측정은 교체 전 이력이다.

기존 전사·실버테일의 어두운 중간 명암을 살리는 로딩 시점 렌더 보정이다. 원본 PNG, 48×48 셀, 실루엣, 프레임 수, 조준·피격·이동·공격 수치를 유지한다. 3D 모델/리깅 교체는 구현하지 않았다.

## 적용 계약

| id / 항목 | 값 | 적용 위치 |
|---|---|---|
| 전사 | `exoduser_warrior`, 8방향, idle 2 / walk 8 / atk 8 | `game.html`, `game-easy-test.html` |
| 실버테일 | `exoduser_silvertail`, 8방향, idle 2 / walk 4 / atk 4 | 동일 |
| 처리 순서 | `_loadCharAtlas` → `_load8Dir` → `_build8` → 최신 캐릭터 검사 → `_shadePlayerAtlas` → `_applyMaskAtlas` | 낡은 캐릭터 응답은 보정 전에 폐기 |
| 데이터 함수 | `_shadePlayerPixels(image,FW,FH)` → 새 `Uint8ClampedArray` | 입력 픽셀 버퍼 변경 없음 |
| 알파 | 모든 픽셀 원본값 유지. 알파 0이면 RGB까지 유지 | 실루엣·셀 경계 유지 |
| 최대 채널값 | `peak=max(R,G,B)` | `peak≤18` 또는 `peak≥185`이면 RGB도 원본 유지 |
| 광원 | 화면 좌상, 방향별 동일 | 약한 실루엣 경사 명암 |
| 표면 근사 | 각 픽셀의 `dx,dy=-2..2`, 중앙 제외 24개 이웃, `w=1/(dx²+dy²)` | 같은 셀 내부 알파/255 사용, 셀 밖은 0 |
| 경사 | `nx=-Σ(dx×a×w)`, `ny=-Σ(dy×a×w)`, `weight=Σw` | 원본 알파만 참조 |
| 광량 | `light=clamp(-(nx+ny)/weight×2,-1,1)` | 좌상단 경계가 더 밝음 |
| 중간 명암 | `mid=sin((peak−18)/167×π)` | 검정 외곽선·밝은 금속·은발 보호 |
| 보정 | `lift=mid×(14+light×12)`, `gain=(peak+lift)/peak` | 각 RGB=`round(원본RGB×gain)`, 색상 비율 보존 |
| 중복 방지 | `canvas._playerRelief=true` | 같은 캔버스는 재보정하지 않음 |
| 성능 | 새 아틀라스 로드당 1회 `getImageData`/`putImageData` | 매 프레임 보정·추가 렌더 패스 없음 |
| 이후 캐시 | `_buildOutlineAtlas`가 보정된 아틀라스로 기존 외곽선·밝기 캐시 생성 | 기존 `SpriteAnimator` 경로 사용 |

좌상단 광원과 무채색·혈적색, 은발의 기존 스타일 계약을 따른다. 바닥 그림자나 흰 외곽선을 원본에 굽지 않는다. `OPT.lighting`은 기존 월드 조명 옵션이며 이 아틀라스 명암 보정의 스위치가 아니다.

## 검증과 비교

| 검사 | 결과 |
|---|---|
| 자동 검사 | 두 진입점의 입력 불변성·알파 보존·암색/은발 보존·좌상단 광원·셀 간 독립성·중복 보정 방지 |
| 캐릭터 교체 | 이전 캐릭터의 늦은 응답은 보정/선택 반영되지 않음 |
| 실제 PNG 16방향 | 전사 RGB 변경 36,823px / 실버테일 39,209px, 알파 변경 모두 0px |
| 비교 화면 | `tools/player-relief-preview.html`: 대기/걷기/공격, 8방향, 3개 배경, 일시정지/재생 |
| 브라우저 측정 예시 | 방향별 시트 8장 보정 합계 전사 16.2ms / 실버테일 8.1ms. 비교 페이지 최초 1회 측정이며 기기별 보장값 아님 |
| 시각 검토 | 회색 배경 걷기·어두운 배경 공격에서 몸통 중간 명암 개선, 기존 무기·망토·은발 형태 유지 |

기존 시트의 저해상도, 실버테일 일부 프레임의 녹색 잔여색·치마 잘림은 이 명암 보정으로 교체/복원하지 않는다. 확인된 자체 개선 범위는 기존 외형의 명암·입체감이다.


## 2026-10-06 캐릭터 2.5D 리깅 움직임 독립 시험 인수

| 항목 | 실제 반영 / 인수 경계 |
|---|---|
| 완료 ID | `CHARACTER-RIG-MOTION-TRIAL-20261006` |
| 코드 / 소비자 | `tools/rig-motion-lab.html`·`rig-motion-lab.mjs`·`rig-motion-controller.mjs` 3개. 기존 격리 `http://127.0.0.1:3387/tools/rig-motion-lab.html`의 독립 소비자에만 채택 |
| 실제 원자료 | 기존 Vinebound Sentinel GLB Idle/Walking/Running 3개, 총 25,468,812 bytes. skin1 / mesh1 / bones24 / clip별 tracks72. 전사·실버테일 원본 PNG와 본편 sprite 소비자는 그대로 |
| 표시 / 이동 | 정사영 고도50°, 표시높이2.2, 대기·걷기·달리기 0.22초 전환, WASD/방향키의 8방향 이동·회전, Shift 달리기, 뼈대 표시. 시험 이동속도1.35/2.8 units/s, dt상한0.05초, 축별 경계±3.35 |
| 런타임 / 실패 | 로컬 Three r160, renderer1 / mixer1 / 활성 RAF최대1. motion 보조 모델2개 해제. GLB·bind·shader 실패 때 ready=false / 입력·RAF 중단, 새 renderer·다른 외형 폴백 없음 |
| 실제 검증 | controller5/5, 격리 Chrome 실제 GLB·키 입력·화면11/11, 추가 crossfade·셰이더 실패 주입2/2 PASS. 초기 모듈2개 문법 검사 및 최종 renderer 모듈 문법 검사 통과. 성공 그룹 반복 실행 없음 |
| 화면 / 영상 | root가 걷기·관절 표시 실제 스크린샷2개 시각 확인. 실제 canvas에서 24fps 요청 / 3.2초 VP9 WebM 저장. 오디오·본편 native·1-1 인수는 이번 시험 범위 밖 |
| 남은 제작 | 주인공 동일 외형의 rig 원본 / 무기 socket, 발 IK·보폭, world→screen·앞뒤 가림·맵 광원, 공격 판정과 clip 시간, 실제 본편·성능 인수. 독립 모션 성공을 주인공 교체·A급 완성으로 계산하지 않음 |
| 보존 / 송신 | 본편·맵·기존 에셋·세이브·Q/E·보호2_3 수정0. 기존 두 오더담당 및 전문팀 송신 소유 유지. 사용자 최신 수동 요청의 캐릭터 지원 담당1 배정; 새 관리 채팅·Claude 실행 세션·자동화 재개0 |
| 상세 정본 | [전체 수치·원자료 SHA·구현·실제 QA·후속 게이트](./CHARACTER_RIG_MOTION_TRIAL_20261006.md) |

앞의 “3D 모델/리깅 교체는 구현하지 않았다”는 현행 **본편 플레이어** 상태로 계속 유효하다. 이번의 24본 GLB 시험은 기존 아틀라스 명암 보정과 별도의 소비자이다.
