# 다크드루이드 독립 ORB24 — 공통 엔진 소비 계약

`ROOT-ENGINE-DRUID-ORB24-20261009`. 실제 `game.html`의 `G._druidOrbs` 비행 표시를 공통 atlas 엔진에 연결한다. 일반 `projs`의 `blackBean`과 다른 엔티티이며 패링 표식을 추가하지 않는다. 기존 원본8셀은 실패 폴백이다.

## 본편·리소스 계약

| 항목 | 현재 값·적용 위치 |
|---|---|
| 리소스 | `assets/vfx/boss/druid_orb_24_20261009.clip.json`; `format=exoduser-atlas-clip`, `version=1`, `name=druid_orb` |
| 원화 | `assets/vfx/boss/druid_orb_24_20261009.png`; 3840×2560/640px 셀/6열×4행, 24개 개별 표면 변화. 9771023B/SHA256 `58615b37b19a3428866ed47751a184d8d70974d1e879842d4eedc162ffb7a101` |
| 시간 | `fps=300/7=42.857142857142854`, `loop=true`. 24개 자세의 회전 주기는 기존8셀×70ms와 같은 .56초. 24FPS 또는 .56초에24틱을 뜻하지 않음 |
| main API | 기존 `atlas-clip-runtime.mjs?v=20261009-v1`의 `createAtlasClip`, `sampleAtlasClip`, `getAtlasFrameRect` 재사용. 새 공통 API 변경0 |
| 입력 | 기존 `orb.t/60`초. 생성마다 `t=0`, 기존 update에서 `t+=sp`. 감속 `sp=(slowMo>0?.35:1)*_dtSp` 유지 |
| 표시 | 소스 inset1, 등록된 셀당1회 draw. `R=orb.r×2.4`; 현재r26이면 표시 사각형124.8px. 위치·피해 판정은 원래값 |
| 로딩 | JSON+runtime 동시 로드 → 정확 PNG 경로/format/version/loop 검증 → 실제 이미지·분할 crop 확인 뒤 ready. 실패·미로드 시 old8; old sheet 실패만으로 새ready를 막지 않음 |
| 캐시 | JSON·PNG·runtime 모두 `?v=20261009-v1`. 기존 sheet `?v=20260927-edge3` 유지 |
| 폴백 | `assets/sprites/boss/boss_dark_druid_orb.png`, 4×2/8, `_now/70`, `R=r×2.4`. 새 자원 실패일 때만 사용 |
| 제출 | 새ready이면 구체당 새셀1회·old0회. Canvas save/finally restore, 원래 합성/alpha 입력 유지. 새 타이머·RAF·RNG0 |
| 에디터·Godot | 같은 flat JSON과 실제 PNG를 기존 리소스 입력에서 소비. 에디터 JSON 입력란에 붙여넣어 적용; 파일선택기 없음. editor inset0/main·Godot inset1. Godot 실행 인수는 미완료 |

## 전투 경계

| 계약 | 보존값·범위 |
|---|---|
| 실제 producer | 현재 si0 살아 있는 `_bossRef`: 110틱마다3발·각도 ±.14rad·속도6.8/틱·r26·피해floor(atk×.6) |
| 접촉/제거 | 기존 플레이어 접촉·`t>460`·맵밖±40 제거 유지. 이 단위에서 update 변경0 |
| 대응 | ORB는 일반projs 밖·반사불가. 기존 `isPWin()` Q/E창 접촉방어와 소멸 유지. `blackBean`은 별도로 Q만 반사/E불가 |
| 종료/정리 | 아레나·initStage·retry 초기화 유지. bossAlive=false 뒤 기존 ORB update 멈춤/잔류 렌더 배열은 원래계약; 새셀도 멈춘 t를 표시. 잔류 정리 수정0 |
| 피날레 | 현재 `_DEMO_MODE=true`, `_DEMO_LAST_STAGE=0`이고 `_isDruidFinale`는 stage3도 동시에 요구한다. 현재 si0의 live ORB를 피날레 인수로 세지 않음. 이전 si3 피날레 계약/생성정지 이력 유지 |
| 보호 | 원PNG·기존 장판24·SFX·충돌·피해·RNG·세이브·Q/E분류 불변. 다른 보스/캐릭터 전체24 또는 Godot 전체이식·새3D 완료가 아님 |

## 제작·검수

Higgsfield `gpt_image_2_5/sunburst/max/4k/transparent/3:2/count1`, job `dda66c87-06ce-49f9-ba3e-e1b860b5c35d`, 견적15크레딧. 실제청구/잔액조회0. 생성 결과는 실제 RGBA를 검정/회색에 합성해서 판독하며 alpha0 숨은RGB를 배경으로 판정하지 않는다. 원본3504×2336/584px 균등셀에서 각 고알파 본체 중심을 찾아 global source 공통crop[-235,-283,266,226]·scale1/resample0/RGBAexact로640셀 center(320,320)에 정렬했다. 모든crop이 원이미지 내부이며 고알파body 누락·다른고알파body 혼입·edgealpha는0. 가시RGBA/검정/회색 합성의24개 프레임이 모두 서로 다르다. 원본·정렬과 직접판독 결과는 외부 `E/engine-druid-orb24-20261009/animation/` 영수증 우선이다.

| 검수 | 결과·한계 |
|---|---|
| 최초 새 source CPU | Node1, 실제 whole inline JS7개 구문+실제 loader/helper/render와 기존 actualruntime import, 6그룹91조건PASS. wallclock에 묶였던 before witness1은 별도 |
| 통제 fixture | 가상Image/fetch/Canvas; ready·24개 crop/phase·.56초 loop·old8 실패폴백·double submission0·throw 복구. 실제 PNG/게임 실행 인수는 아님 |
| Source peer | 검토한 실제2hunk blocking0. Q/E/update/save/RNG 변경0 확인 |
| 공통 리소스 교정 | 최초제품JSON의필수name누락1을검토에서발견→name=druid_orb만추가, 역제거원bytesexact·PNG/다른field불변. 최종JSON320B, actualeditor makeResource→resourceJSON 새한정assertion1PASS·finding1closed/잔여0. 이전passed suite/PNG검사재실행0 |
| 실제PNG 픽셀 epoch | 별도 최초Node1/51조건PASS. 실제whole drawhelper+decode된원PNG/신규PNG,24가시프레임·fixedR2.4 box·loopPixelexact·orb불변. 통제 detached Canvas이며 실제보스전/GPU/native가 아님 |
| ROOT 직접판독 | 검정/회색24합성과 actualhelper124.8px strip에서 원형 몸체·밝은핵·장식정리가 읽히고 크기/중심이 안정됨. actualhelper 독립WebP proof24장/총560ms; 인게임녹화가 아님 |
| 루프 결함 | 마지막→첫 registeredRMSE34.59, 일반20.17~28.68보다 변화가 큼. 연속 자연스러움/A급 미인수·RETOUCH; seamless loop로 보고하지 않음 |
| 시각 인수 경계 | 정상줌 본편·전체보스전·GPU·성능·청취·실save·A급 미인수 |

현재 시각 인수는 **VISUAL VERDICT: RETOUCH**다. 실제 보스전과의 조화가 검수되기 전 A급 완료로 표시하지 않는다. 외부 `E/engine-druid-orb24-20261009/completion.json`이 최종 소유 Git·검수 영수증이다.
