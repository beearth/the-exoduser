# 전사 양손 가로 베기 — 야구 배트 스윙

## 사용자 확정과 원인

사용자는 이전 타이밍 수정에 대해 “너무 깔짝거린다”, “스윙하는 느낌”, “야구베트 휘두르듯”이라고 요구했다. 이전 8프레임은 들어올림·베기 사이 자세 차이가 작고 회수용 포즈가 없어 7→1→0으로 급히 되돌아갔다. 숫자상 판정 일치만으로 원하는 운동감이 만들어지지 않았다. 이전 검사 통과는 시각 품질 승인이 아니다.

기존 전사 외형 참조로 **양손으로 검을 뒤로 당김→몸통 회전→가로 베기→반대편 어깨까지 마무리→검 내리기** 9포즈를 제작했다. PixelLab 호출 없이 내장 imagegen으로 기존 캐릭터 공격을 편집했다. 생성 결과는 검·갑옷 세부가 기존 저해상도 원본과 다르며 원본 픽셀을 그대로 보존한 편집은 아니다.

## 에셋·연결 계약

| 항목 | 현행 값 |
|---|---|
| 소스 | `output/warrior_swing_weight_20260915/{s,se,e,ne,n}.png`, 각 3×3·9포즈 |
| 방향 | s,se,e,ne,n,nw,w,sw; nw/w/sw는 ne/e/se 셀 좌우 반전으로 조립. 좌측 3방향은 스윙 손잡이 방향도 대칭 |
| 런타임 시트 | `img/exoduser_warrior/attack-bat-v1.png`, RGBA 720×640, 80px 셀, 9열×8행 |
| 버전 | 이미지 `20260915-bat2`, 재생 모듈 `20260915-speed85` |
| 패커 | `tools/pack-warrior-bat-swing.cjs`, 공통 축척 0.098, 발 기준 y=58, x=40 |
| 분리 | `pack-silvertail-remake.mjs`의 연결요소 탐색 재사용. alpha≥80인 8연결 실루엣 9개를 행·열 순으로 분리하고 해당 연결요소만 추출. 칼끝이 명목상 3×3 칸 경계를 넘어도 보존하며 이웃 포즈의 픽셀은 제외 |
| 정렬 | 각 분리 실루엣 경계 상자 아래 40%에서 alpha>200, max(R,G,B)<145, G>0.48R, 상자 x 12~88%인 픽셀을 검사. 조건 픽셀이 12개 이상인 마지막 행을 발 바닥으로 선택하고 아래 16행의 x 최솟값/최댓값 중점으로 정렬 |
| 중립 연결 | 8번은 소스 0번을 재사용하여 처음과 끝 포즈 동일 |
| 로더 | `warrior-bat-swing.js`, `WarriorBatSwing.apply` |
| 아틀라스 확장 | 기존 본체 아래 640px 추가, 폭 max(기존 폭,720). 방향별 atk1/atk2/atk3/bash만 교체 |
| 대상 | 전사만. idle/walk/기타 스킬, 실버테일 시트 유지 |
| 프레임 선택 | `_wFr.length===9`이면 `WarriorBatSwing.frame`, 그 외 이전 `_warriorAttackFrame` 폴백 |
| 로드 실패 | 에러 또는 크기 불일치 시 기존 시트 유지. 캐릭터 전환·본체 교체 후 늦게 끝난 로드 무시 |
| 진입점·패키징 | game.html, game-easy-test.html, build-nwjs.mjs에 모듈 포함 |
| 명암 | 새 공격 PNG의 명암을 사용. 기존 idle/walk의 캐시 명암 보정 유지 |

## 재생 계약

사용자의 “프레임 속도 조금만 내려봐” 요청으로 **재생 속도 `speed=0.85`**를 적용한다. 전투 시간·데미지·패링·반사·입력·이동 수치는 변경하지 않는다. 일반 공격은 2번부터 시작하며 E는 준비부터 9포즈를 사용한다. 프레임 번호는 0 기준이다.

`frame`이 아래 시간 변환을 적용하고, 이어지는 기존 포즈 표의 `baseFrame`을 호출한다.

| 시간 변환 | 현행 계산 |
|---|---|
| 준비 | left'=windupTicks−(windupTicks−left)×0.85 |
| 베기 | T=일반5/E20. left'=T−(T−left)×0.85 |
| 베기 길이 | 일반5→5.882353틱, E20→23.529412틱(약17.65% 길어짐) |
| 회수로 이어질 베기 | delay=T×(1/0.85−1). recovery=max(1,recoveryTicks), elapsed=recovery−left. elapsed<delay이면 해당 공격 baseFrame에 left'=T−(T+elapsed)×0.85 전달 |
| 남은 회수 | elapsed≥delay이면 left 유지, recoveryTicks'=max(0.001,recovery−delay). baseFrame 내부는 max(1,recoveryTicks') 사용 |
| 종료 | 회수 left≤0은8번. 종료 시점은 기존 상태와 동일하며, 늘어난 베기만큼 회수 대기 구간을 줄임 |

| baseFrame 상태 | 변환된 시간에 대한 프레임 계산 |
|---|---|
| wWindup | `min(2,floor(clamp(1-left/max(1,windupTicks))×3))` |
| wSwing | `min(6,2+floor(max(0,5-left)))`: left=5/4/3/2/1에서 2/3/4/5/6 |
| sBash | elapsed=20-left. `<2:0`, `<4:1`, `<7:2`, `<8:3`, `<11:4`, `<14:5`, 나머지6 |
| 시각 타격 포즈 | 4번 시작은 일반 경과2/0.85=2.352941틱, E 경과8/0.85=9.411765틱. 실제 판정은 기존 일반 경과2틱/E 경과8틱 유지 |
| wRecover/sRecover | r=clamp(1-left/max(1,recoveryTicks)). r<0.45는6(반대 어깨 마무리), r<0.8은7(검 내림), 나머지8(중립) |
| 시간 입력 | 기존 `floor(10/(wp().spd||1))||1`, 일반 회수 `floor(16/((wp().spd||0.3)×statDex()×(1+_eqAffix('meleeAtkSpd')+_eqAffix('glovesAtkSpd'))))||1`, E 회수 `floor(28/pParryRmbSpd())||1` |
| 방향 | 전사 일반 공격은 atkArc, E는 facing. 본체를 화면 평면에서 회전시키지 않고 포즈 내부 몸통 회전을 사용 |

## 검증

| 항목 | 결과 |
|---|---|
| 자동 검사 | 관련 32개 통과 후 패킹 경계 검사를 추가하여 새 모듈 4개 재검사 통과(고유 검사 총33개). 팔로스루 유지, 연속 순서, E 전체 9포즈, 에러 폴백과 idle/walk 보존, 72개 셀 경계 투명·8방향 중립 시작/끝 동일 검사 |
| 실제 게임 | 별도 저장 차단 슬롯에서 8방향×일반/E update→draw 실행. E 0~8 모두, 일반은 초기 2번 이후3~8 표시. 양쪽 회수에 새 마무리 포즈 사용 |
| 비교 | `/tools/warrior-swing-review.html`, 기존 8프레임 교정본과 새 E 베기를 4배로 나란히 재생, 일시정지/한 틱 진행 제공 |
| 시각 범위 | 크게 당긴 검, 반대쪽 어깨 마무리, 발 기준선과 게임 로딩을 표본 화면으로 확인. 사용자 최종 운동감 승인은 별도 |
| 남은 제약 | 5틱 일반 공격은 E보다 준비 시간이 짧음. 좌측 3방향 대칭, 생성한 방향 간 갑옷/검의 작은 차이 존재 |

### 85% 속도 조정 검증

`test/warriorBatSwing.test.js` 5개 통과. 속도 0.85, 준비 자세 유지 증가, 공격→회수 프레임 연속성, 회수1/4/16/28틱 종료, 기존 에셋 패킹·폴백 검사를 확인했다. 비교 페이지와 양쪽 게임 진입점의 모듈 캐시 키도 갱신했다.

### ROOT-CH1-1-WARRIOR-STRIKE-RIG-20261007 — 본편 전사 LMB 베기 표시 부분 연결

기존 attack-bat-v1 720×640/80px9×8와 WarriorBatSwing의 프레임 선택·speed=.85·전투 시간은 유지한다. 본편 opt-in은 해당 source를 붙인 현재 atlas의 정확9셀만 rig attack으로 표시하며 공격 foot(40,58)에 로컬(0,+18)을 적용한다.

정확한 origin·atlas gate·셀·phase·anchor·미채택 상태는 `docs/4.0케릭터스프라이트 디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md`의 동일 completion 절을 따른다.

최종 sparse guard의 새 한정 CPU는 6조건 PASS/FAIL0/미도달0/exit0이며 최초 공격 CPU100PASS·1FAIL은 별도 보존한다. root가 인계한 동일2a052 소스의 새 main native는 Chrome/context/page 각1, 실제 LMB east/index2의4조건 PASS/FAIL0/미도달0/exit0이다. 실제 atk2 f2/phase2.5÷9/609vertices/canvas85×85/alpha>16픽셀581/GL0, 현재 owned LMB-origin1을 관측했고 wRecover에서 bodyCurrent=false, idle 복귀 owner=null을 관측했다. pageerror/httpfailure0 및 POSTmats1 차단/서버도달0이다. W setup1300ms 입력 중 xy4020,7420이 변하지 않아 이동 성공을 주장하지 않는다. root PNG 직접 판독은 main 시작 금빛FX가 몸·발을 가리고 격리 공격 그림은 보이는 상태다. VISUAL VERDICT: RETOUCH. 실제 발·native8방향·회수 rig·DS ghost·native6·audio·save는 미인수다. 이전 idle/W native5 및 clock5 CPU와 합산하지 않는다.

최초 공격 CPU는 2a052 epoch에서9그룹 도달/8그룹 완료/100조건 PASS·1FAIL/exit1이었다. native.every가 sparse hole(index8)을 건너뛰어 잘못된 배열을 허용한 반례를 원 result.json에 동결했다. 최종8a4e 소스는 i0…8 직접 for-loop와 Object.hasOwn(native,i)로 각 셀의 실재 own index를 요구한다. 최초100PASS를 재실행하지 않은 sparse 한정 후속은 6조건 PASS/FAIL0/미도달0/exit0이다. hole8·hole0·hole4·inherited-only4·own undefined8은 렌더0으로 차단했고 dense 대표 n/f4는 phase.5/anchor(0,18)/단회 렌더를 유지했다. 앞선 native4PASS는 2a052 소스의 결과이며 최종 own-index guard의 native 검수는 미실행/추가Chrome0이다. clean 전체 PASS로 합산하지 않는다.

검수 원문은 외부 ch1-main-warrior-attack-20261007/validation-receipt.json에 epoch별로 보존한다. 최종 game SHA는 8a4e83ab107ad18979f05c7ced7b02e56ee617dee0c64bd9fa3a715c519795b2, sparse 한정 원문은 9440B/637d3d33c0c3d861c3902f3da808ca07d5ffa1e8c588beefde14c4b9dcdc9f7a이다. docs 전체 무제외 관련 검색45경로 중 현재정본13을 동기화하고 역사·타모드·owner WIP·보호2_3의32경로는 그대로 보존했다.

### ROOT-CH1-NATURAL-SPAWN-VISIBILITY-20261007 — 최종 소스의 새 실화면 관측

앞선 2a052 공격4조건/금빛FX 가림과 별개로, 최종 game4058588B/8a4e83ab107ad18979f05c7ced7b02e56ee617dee0c64bd9fa3a715c519795b2에서 새1Chrome/context/page·3조건 PASS/FAIL0/미도달0/exit0을 관측했다. 기존 공격4조건·CPU100PASS1FAIL·sparse 한정6PASS를 재실행하거나 합산하지 않았다.

실제 LMB 후 W 입력 동안 document focus=true/BODY, BINDS.up=KeyW, trusted keydown/up, K/KH=true→false, frame57→137을 기록했고 P.y7420→7200.653340000013으로 이동했다. 이번 관측은 정상 이동의 한 사례이며 이전 W 무이동 원인은 여전히 UNKNOWN이다. G._bonfire.t243→0/frame57→300의 자연 종료를 기다렸으며 FX·시간·위치 강제 변경0이다. 최종 own-index guard의 정상 dense 공격 한 장면도 본편에서 도달했다. sparse/inherited 음수 경계는 CPU6조건 범위다.

root가 자연 종료 후 idle/strike PNG2를 직접 판독했다. 전사의 몸과 하단 다리·발 주변은 해당 pose에서 식별되나 평면 baked 지면·공격FX/인접 적 가림은 남는다. VISUAL VERDICT: RETOUCH. 전체 동작의 해부학적 접지·8방향·회수 rig·DS ghost·실높이·같은후보 native6·청취·실보상save·A급 인수는 미완료다. 원 source/PNG/scene/nav/세이브는 보존했고 POSTmats1은 서버 도달 전에 차단했다.

외부 원문: ch1-main-warrior-attack-20261007/natural-visibility/result.json36127B/287d70769f01f02651e9aec4a4b2911a03f6898c1125fa05649376b29acd3f53. 이 별도 관측은 기존 코드 완료18cc60d5806c8e82c0295e1bdbbb50ba89d00278에 대한 추가 증거이며 새 제품 코드 변경0이다.


### ROOT-CH1-LMB-RECOVERY-RIG-20261007 — 정상 LMB에서 승계한 회수 본체 표시

기존 BAT의9포즈·frame 선택·speed.85·준비/베기/회수 시간표는 유지한다. 본편 opt-in의 정상 LMB 승계 회수만 이미 선택된 atk3 프레임을 rig attack으로 표시하며 anchor(0,18)/body-local32를 사용한다.

정확한 owner phase/정상 전이 승계/특수·acceptedQ revoke/atk3 gate/회수 counter는 `docs/4.0케릭터스프라이트 디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md`의 동일 completion 절을 따른다.

이번 source523a recovery CPU는 실제 main 함수/전이/Q 취소와 통제 animator·side-effect port를 소비한 최초1회6그룹42복합조건 PASS42/FAIL0/미도달0/setup0/exit0다. finisher는 revoke 전이 prefix만 실행했고 실제 PNG/renderer/GPU/save는0이다. 별도 신규 native는 같은 최종 source의 실제 본편 Chrome/context/page 각1회,3조건 PASS3/FAIL0/미도달0/exit0다. 실제 LMB→wRecover/atk3 f6→7→8·phase6.5/9→7.5/9→8.5/9·owner recovery·609정점·heightLocal32·alpha>16 579픽셀·GL0와 실제 idle 복귀/owner null을 관측했다. source8/같은 map exact, pageerror/HTTP실패0, POST /api/mats1은 서버 도달 전 차단, 사용자 save 조작0·owned browser 닫힘이다. CPU42와 native3 및 기존 carry25/strike4/과거 FAIL·한정 결과를 합산하거나 재실행하지 않는다. root PNG2 직접판독은 현 east pose의 회수 몸 표시/대기 복귀만 한정 인수했다. 검기FX 몸·발 부근 가림, 회색 평면 baked 지면/배경 확대 흐림이 남으므로 VISUAL VERDICT: RETOUCH다. 해부학 발/8방향/실DS ghost/높이/전체 native6/청취/실보상save/A급은 미인수다. 근거: 외부 recovery/validation-receipt.json2702B/4fc6af74bf6ffae5140d9e1648937093cf2741735f994baaf7ab82f79daea9c2, cpu-receipt.json9965B/50b6e6e80c21ef3595cc6ab9afec37e07e9db3831eef9352c9bebb47a47723c6, native-result.json102950B/26a12f81168296c6b9b5130a69180c46f17a0b78f3e1083aa6765b97b84d09de, visual-verdict.json2514B/c78360ecf19835709c4f87d3d683c77d88b2632d3b93c9b44507ac2398a3ec91.

### ROOT-CH1-WARRIOR-CHARGE-FINISHER-RIG-20261008

WarriorBatSwing의 기존 최종 f와 atk2/atk3 셀을 전사 돌진 뒤 피니셔에도 재사용한다. 프레임 선택·속도·windup/recovery 공식은 변경하지 않았다.

현재 정확 계약·검증 한계는 [DIRECTIONAL_CHARACTER_RIGS_20261006.md](DIRECTIONAL_CHARACTER_RIGS_20261006.md)의 동일 단위 절을 따른다. 이전20261007 정상 LMB 검수/수치는 그 epoch 이력으로 보존한다.
