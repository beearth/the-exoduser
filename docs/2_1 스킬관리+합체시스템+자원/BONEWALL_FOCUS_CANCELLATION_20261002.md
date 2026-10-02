# 해골무덤 포커스 취소 소스 인수 — 2026-10-02

양판 `_clearHeldInput`의 기존 P guard에 `P._bwAiming=false`만 각18bytes 추가했다. 등록 blur/hidden 후 남은 plain boneWall 패드 조준이 나중의 새 확정을 소비하던 경계를 취소한다. **focus만으로 즉시 발사되는 결함은 아니며, source 인수와 실제 focus/패드/게임 인수는 분리한다.**

| id / 값 / 접점 | 현재 source 계약 |
|---|---|
| 취소 | `_bwAiming=false`; 기존 `_beamHold/_mmAiming/_mmCharging/_msAiming/_msCharging` 취소 문장 보존. 기존 생성물 제거/환급0 |
| 입력 체인 | 실제 선택 GP LT+ABXY→`_gpInjectKey` KeyboardEvent→등록 gameplay keydown→`_dispatchSkillSlot`→boneWall aim. aim=true를 직접 seed한 ingress 모형 아님 |
| 정상 확정 | 실제 선택 GP release가 MBjust[0] 설정→boneWall update if→전체 fireBoneWall. KBM Digit1은 기존1000px clamp의 즉발 |
| blur/hidden 뒤 fresh confirm | 등록callback→helper에서 aim false. 이후 실제 `_gpInjectKey(mouse0,true)` 새확정에도 선택block 추가 wall·악의/stock/rech·RNG·숙련·audio/presentation sink0, MBjust[0] true 유지. native mouse/전체update 판정 아님 |
| visible | 기존 document.hidden 조건으로 helper 미호출, held/aim 상태 보존 |
| 원가/실비 | 기존 metadata/raw12·`fireBoneWall→_malCost(12)`·`_MALICE_COST_MUL=.5`: 해당 실제조건 악의6, MP0가능. source 비용/장비할인 공식 변경0 |
| 스택/충전 | 정상스택차감1. belowmax이고 기존rech0일 때 `_bwRech=1500f` 설정. 충전1500프레임 실제 진행·모든스택 조합 검수 아님 |
| 정상 효과 | wall1; 진입/발사 숙련 sink 각1, SFX.magic(EL.D), skull_summon(.6,_r(.9,.15)), shake6; 이fixture pitch RNG1. 실제 피해/음향/고정RNG 보장 없음 |
| 범위 | plain boneWall만. 기존 RMB 우선취소·악의5/stock0 재검사·P null/멱등·다른family sentinel·반복입력 경계 관측. 합체/다른family 발사·Q/보호2_3 변경0 |

| 생산 파일 | 최종 SHA-256 | 현재 1-based 접점 |
|---|---|---|
| game.html | `391155f3700e584cebf260942a95cfd4f4bbcc2cd6d700c6db65084ab7ad35d2` | helper12880/guard12886/blur12889/hidden12890 |
| game-easy-test.html | `21a4d3b73b6ddcf765ec1e4a9505329c9f28248828f95b5cbc8993f005f52c0a` | helper12276/guard12282/blur12285/hidden12286 |

변경 전 source는 main `569e8def89643251cf8670fef26ef2949db72becadbb1579826f2741ee993103` / easy `7022aa1cf52b7a9c194a9533109caf5b5fd16e473f891c7b1693df0fe8d9245e`다. 두18bytes 역치환은 각 원백업 전체 bytes와 일치하며 변경 접점 밖 source/EOL 보존이다. fireBoneWall·_malCost·기존 storm/mortar/SOUND/보스 복귀 접점은 재수정하지 않았다.

| 검수 | 확정 결과와 한계 |
|---|---|
| 새 실제 source 검사 | `test/boneWallFocusCancellationAcceptance.test.cjs`, 최종20/20 PASS·fixture오류0·정상 옛접점 대조4동등. 정상대조 수를 PASS에 중복 합산하지 않음 |
| 검사 원문 | SHA `f8b3b8c59649021b15d45024c0d50083bab2d6745578e5141acbb083c0b8f3e3`, baseline 이후수정0 |
| 역사 baseline | 20그룹16PASS/4FAIL·fixture오류0. 양판 blur/hidden4건: aim남음→나중확정 악의6/stock1/rech1500/wall1/RNG1. 최종수치와합산0 |
| 구문 | inlineJS12/importmapJSON2 PASS 각1회. 기존팀/root 검사 및 docs담당 검사 재실행0 |
| 실제 source | GP 선택경계·등록callback·slot/absorption·metadata·autoAim/dispatcher·확정 if·fireBoneWall·_malCost 추출 |
| 대역 | pad button/event/document 및 P/G 상태, damage/stat/proficiency/presentation/audio sink. 전체 _pollGamepad/update/DOM/게임루프 실행 아님 |

실패드·native focus/이벤트 전달·hidden rAF·실제 마우스·전체 프레임/피해·wall충돌·충전진행·오디오 backend/청취·storage/빌드/패키지 미인수다. MBjust[0] 유지와 다른family sentinel 관측은 선택 source 경계이며 전체 입력 소비/다른 스킬 발사를 보장하지 않는다.

생산 영수증 `tmp/mac-migration-runtime/continued-review-20261002/bonewall-focus-acceptance/receipt.json`, SHA `6a01db8d718a116c38b0ac0da8f4737bfd404407282b5223e9b154f6402de980`; 접점 증거 `source-patch.json`. 원팀 후보의 `_malCost=v` 대역에서 원가12를 차감한 관측은 그대로 보존하고 현행 실비6과 구분한다.

docs source변경 후 관련 fullrg1회223행/50경로/85625bytes(raw SHA `96817fd33789931fcacc2c344a0ae2c406e19166796874bbebc81481bda0952f`)를 무절단 저장·전행분류했다. 정본3(스킬main/자원공식/SKILL03)은 기존 prefix/EOL100% 보존 append이며 원가12표·과거 mortar/storm/audit/원자료·NFD백업·보호2_3·root/운영 문서를 치환하지 않는다.

source/doc SHA·백업·prefix·검색/분류 완료 증거는 `tmp/mac-migration-runtime/continued-review-20261002/bonewall-focus-docs-backup/completion.json`에 기록한다. 신규 내용은 취소 수명 계약만 보강하며 비용/쿨다운/충전/피해/합체/저장 정책 변경0이다.
