# 실버테일 본체 재제작 — 2026-09-15

> **2026-09-24 Shift 비행·착지:** 전용6포즈×8방향 시트를 기존48px 본체 아래에 확장했다. idle/walk/등검 공격 셀은 보존. [실버테일 Shift 계약](./SILVERTAIL_DASH_FLIGHT_20260924.md).

## 2026-09-15 승인 시안 기반 스프라이트 적용

| 항목 | 현재 값·파일·공식 |
|---|---|
| 보행 교정 | `output/silvertail_walk_fix_20260915/`의8방향4포즈로 보행 교체. [원인·앵커·검증](./SILVERTAIL_WALK_FIX_20260915.md) |
| 기반 본체 원본 | `assets/sprites/player/silvertail_v2/{s,se,e,ne,n,nw,w,sw}.png`, 각각1254×1254 RGBA / 3×3 포즈. 같은 폴더 `prompt_방향.txt` |
| 제작 | 내장 imagegen으로8장, 각9고유 포즈. 순서 idle1 / walk4 / 공격 폴백4. 총72고유 포즈 |
| 게임 시트 | `img/exoduser_silvertail/`의16파일(시계8+영문 별칭8), 각각480×48 RGBA |
| 방향 매핑 | s=6, se=5, e=3, ne=1, n=12, nw=11, w=9, sw=7 |
| 슬롯 | 48×48, idle2(동일 포즈 복제) + walk4(고유) + atk4(고유 폴백) =10. 공격 확장 성공 시 atk1/atk2/atk3/bash는80px 시트 우선 |
| 버전 | `_SILVERTAIL_ASSET_VERSION='20260915-walk-v3'`, 두 게임 진입점 동일 |
| 패커 | 기반 `tools/pack-silvertail-remake.mjs` 후 `tools/pack-silvertail-walk.mjs`로 보행4셀 교정. alpha≥80의8연결 성분, 면적>이미지면적×0.001, 정확히9포즈 검사. 세 행으로 나눈 뒤 가로 순서 정렬 |
| 크롭 | 각 연결 성분 경계에서2px 확장. 칼이 명목 격자를 넘어도 전체 실루엣 보존 |
| 크기 | idle+walk 공통배율=min(45/idle높이,46/본체최대폭,46/본체최대높이). 공격 폴백=min(46/전체최대폭,46/전체최대높이). Lanczos3 축소, 프레임별 개별 정규화 없음 |
| 배치 | 대기·공격 폴백 가로는 실루엣 중앙, 새 보행은 상체 갑옷 앵커 정렬, 세로는 셀47px 바닥에 맞춤. 공격 확장 발y=62는80px 셀 중심에서22px, 본체 불투명 발은48px 중심에서약22px |
| 게임 배율 | 기존2×0.65=1.3 유지. 걷기 거리주기256px 및 피해·피격·이동속도 불변 |
| 백업·재현 | `output/silvertail_sprites_20260915/originals/`, 패킹 결과·소스 경계는 같은 폴더 `packed/manifest.json` |
| 미리보기 | `tools/silvertail-sprite-preview.html`, 실제 SpriteAnimator와 공격 병합 로더. 걷기/대기/공격/전환,1.3배·3배, 배경3종, 정지·단계 이동 |
| 이전 자동 검증 | 보행 자연스러움 판정 이전의 관련47테스트 통과:8방향32고유 보행,16파일 별칭 일치, 셀 상하 불투명 경계 여백, 기존 모션·캐릭터 교체·공격 병합 회귀 |
| 시각 검증 | 브라우저에서 실제 게임 시트·명암 함수·SpriteAnimator·공격 병합을 사용해 걷기와 대기/공격 전환을1.3배·3배로 확인 |
| 제한 | 생성 포즈는 수작업 리깅이 아니므로 머리카락·등칼·치마의 미세 형태와 공격 확장 간 자세 차이가 남는다. 스프라이트 구현과 완전한 장비 캐논 일치는 별도 판정 |

이 항목이 아래 및 구2026-08-17 키아트/PixelLab 제작 기록의 본체·버전·패커 계약보다 우선한다. 대기 두 슬롯은 호흡 애니메이션이 아닌 동일 정지 포즈다.

> **공격 병렬 제작 완료:** v1 외형을 참조한 등검 회전9포즈(방향별9프레임)을 별도80px 셀 시트로 제작해 기검참/E에 연결했다. 48px idle/walk는 승인된 새 원화 기반 리마스터로 교체했다. [공격 전용 계약·검증·통합 잔여](./SILVERTAIL_ATTACK_REMASTER_20260915.md). 아래 시안 이력에 이어 새 대기·보행 본체도 게임에 적용했다.

사용자 최신 지시: 기존 명암 보정만으로는 만족스럽지 않아 실버테일 자체를 다시 제작한다.

## 제작 기준

| 항목 | 방향 |
|---|---|
| 정체성 | 성인 여성 검무사, 은회색 높은 포니테일, 흑철 갑주, 목뒤 회전 허브와 등칼 |
| 수정 | 어깨·몸통·팔·종아리 볼륨 확보. 실처럼 가는 치마 조각을 큰 패널 중심으로 정리 |
| 무기 | 주 회전대검 1 + 왼쪽 바깥 허벅지 보조 단검 1. idle 양손 비움 |
| 목표 가독 | 포니테일 / 등칼 / 갈라진 치마의 세 축, 앞쪽 두 다리 분리 |
| 제작 도구 | 내장 imagegen. PixelLab 사용 안 함 |
| 방향 | 외형 시안 → 게임 카메라·장비 구조 교정 → 8방향 애니메이션 → 48px 검증 → 런타임 교체 |

## v1 산출물과 판정

| 항목 | 상태 |
|---|---|
| 원화 | 당시 8시점 시안은 2026-09-27 공식 이미지 2장 고정으로 프로젝트에서 제거. 현행 키아트는 [`SILVERTAIL_KEYART_CANON_20260927.md`](./SILVERTAIL_KEYART_CANON_20260927.md) |
| 규격 | 1536×1024 RGBA, 4열×2행, 8시점 외형 시안 |
| 생성 프롬프트 | 같은 폴더 `prompt_v1.txt` |
| 외형 개선 | 기존 가는 팔다리보다 갑옷·몸통·부츠가 명확하고 치마 패널 분리 |
| 방향 순서 | 생성기가 요청한 좌우 순서를 반대로 그린 부분이 있어 시계 파일로 바로 배정 불가 |
| 보완 | 낮은 탑다운 게임 카메라, ㄱ자 등칼의 오른쪽 hip 오프셋, 원화 배경/그림자 분리, 셀 여백·발 앵커 정렬 |
| 애니메이션 | 새 대기8포즈(슬롯2개씩 복제), 걷기8방향×4프레임 제작·연결. 공격은 별도8방향×9프레임 등검 회전 확장 사용 |
| 런타임 | 새48px 본체 + 명암 보정 + 공격 전용80px 확장 적용 |
| 판정 | 시안 승인 후 새 본체 교체 완료. 세부 무기 수납/방향별 형태 일치는 보정 여지 있음 |

v1.2의 장비 정체성을 참고하되, 최신 재제작 지시에 따라 기존 저해상도 본체 자체의 형태와 비율을 개선한다. 새 애니메이션 제작 시 기존 시계 파일 `12/1/3/5/6/7/9/11`, 셀 48×48, 현재 idle 2 / walk 4 / atk 4 계약을 기준으로 삼고 변경 시 문서·코드를 함께 갱신한다.


### ROOT-CH1-SILVERTAIL-PACKED-MAIN-20261007 — 실버테일 본편 packed 대기·보행 표시

이 절은 이전 warrior/strike/recovery 및 public1254 고해상도 시험 epoch 뒤의 새 본편 소비 범위다. 이전 소스 핀·검사·실버테일 채택 보류 기록은 당시 결과로 보존하고, 현행 main packed 소비에는 이 절을 우선한다.

class1 localhost/127.0.0.1:3387의 명시 ch1Three=1&ch1Rig=1(기본OFF), P.hp>0/P.s=idle/stage0·비보스·production smoothing에서만 실제 최종 native idle2/walk4/run4 48×48 셀을 빌려 표시한다. 기존 packed 본체의 idle2(동일 pose)/walk4·원PNG/패커/48px 셀·등검80px 확장·게임 배율2×.65=1.3은 그대로다.

| 새 소비 | 값 |
|---|---|
| 셀/위상 | 현재 native f와셀, phase=(f+.5)/N; N=2/4/4 |
| 기준 | anchor24,47/reference45; 기존 X 안(0,+23), parent .65/_pScale 재적용0 |
| 원자료 범위 | 기존 명암/확장 로드가 끝난 main atlas canvas 차용; public1254 원화 경로와 구분. 원PNG hash 섭취/새 패킹/픽셀 수정0 |
| native 보존 | 공격·특수·사망·실패 native, 기존 생성/보행 교정39·47은 당시 이력 |

정확한 optional API·세 소스 핀·공통 경계는 `docs/4.0케릭터스프라이트 디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md`의 동일 completion 절을 따른다.

최종 source의 새 main currentness CPU3그룹15조건 PASS와 actual factory/adapter 한정 CPU9그룹39조건 PASS는 별도 epoch다. 첫 실제 main native Chrome/context/page 각1의3조건 PASS 및 trusted W 이동/대기복귀를 관측했다. 최초 CPU 오라클FAIL2개 이력과 최종 pageErrors SecurityError1을 보존하므로 전체 clean PASS로 합산하지 않는다. 이 오류는 main3check 뒤 about:blank와 무조건 classseed localStorage source상 하니스 cleanup으로 추정되지만 직접 stack/시점 귀속은 미관측이다. root PNG2 직접 판독은 몸 표시/이동만 한정 인수, 전체 VISUAL VERDICT: RETOUCH. 실제 클래스선택 UI·해부학적 발·8방향·공격/특수/사망 rig·live DS ghost·전체 native6·청취·실보상save ACK/A급은 미인수다.

최초 main VM은6그룹 중52조건 PASS 뒤 P4scope의 suspend1 기대 오라클FAIL1/후속P5·P6 두그룹 미도달/exit1이었다. 실제제품의 packed retire와 기존scope fence가 idempotent suspend2를 호출하므로 오라클한정 expected2로 정정; 별도P4/P5/P6의3그룹6조건 PASS/FAIL0/미도달0/exit0. 원52재실행0·clean58합산0·이 오라클로 인한제품수정0. 이후 읽기에서 발견한 별도currentness 접점을 최종main/adapter에서 보강했다.


| 최종 currentness 보강 | 정확 범위 |
|---|---|
| adapter live native | 같은 animator여도 own anim/f, fm의mode_direction 배열 identity/정확 count/선택 cell identity와 own crop x/y/w/h가 captured source와 같아야 publication/render를 유지 |
| main live frame | _ch1RigPackedFrameCurrent가 현재 P/map/atlas/animator와 native direction/mode/f·배열/count·selectedcell/crop을 확인. snapshot/publication을 parent blit 앞에서 검증 |
| ghost | packedOwner+packedCapture를 가진 class1 sameframe ghost는 adapter snapshot 전후 live frame 현재성을 모두 확인. 기존 canvas/matrix 단회 재사용 |
| blit 이후 | 이미 완료한 synchronous drawImage 뒤 scope/프레임 변화는 ghost publication만 retire하고 returntrue하여 legacy 본체 중복 draw를 요청하지 않음. 완료 pixel rollback이나 parent silent GPU upload 검증은 UNKNOWN |

최초 main CPU52PASS·오라클FAIL1 및 별도limited6PASS는 보강 전325e/bc6f/e1f1 epoch 이력이다. 최종525d/8de8 소스의 새 guard/combinedCPU/native 결과와 합산하거나 최초실패를 지우지 않는다. 최종 검수는 아래 별도 epoch 결과로만 인수한다.

최종 검수는 main15/combined한정39/native3을 별도 계산하며 원52·12와 각각오라클FAIL/한정6 및 최종SecurityError1을 보존한다. native idle7(SW)/run4(N)·trusted W y7420→7336.933640000013→idle와borrowed480×1136/48²/609정점만관측, classseed사용으로실제class선택UI미인수. root PNG2몸/이동한정·전체RETOUCH, exit0은전체browsercleanPASS가아니다. SecurityError는about:blank/classseedsource상cleanup추정일뿐직접귀속未관측. 정확epoch·원문핀/종료오류/미인수는 DIRECTIONAL 동일completion절을따른다.
