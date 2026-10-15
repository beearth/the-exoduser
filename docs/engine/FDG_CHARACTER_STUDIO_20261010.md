> **2026-10-15 native 현행:** 실제 Main 정지 UI에서 전사0/실버테일1 선택→실제 Player/profile/시트/발앵커를 연결했다. 원본 localStorage charIdx 복원은 미구현,선택 전 indexnull. 아래 고정 Warrior/selector 미구현 문구는 이전 이력이다. [현재 계약·새 검수·MAP PRODUCTION REPORT](FDG_GODOT_NATIVE_FIRST_20261013.md#native-명시-캐릭터-선택--2026-10-15-현행-계약).

| 변경 항목 | 현재 계약 |
|---|---|
| 선택0 / 선택1 | idle2/walk8·4/source_attack8·4/ready attack9·9,표시scale2.0·1.3. 원본R remaster 우선. 24고유장·24FPS 미달. |
| live API | Main.read_native_character_selection()(0)→Player.apply_native_character_selection(reader)(1)→get_native_character_profile_snapshot()(0). 유실시NR/본체숨김/새공격거부. original_storage_restoredfalse/latest_full_gamefalse. |
| 새 소비 / 검수 | 승인Silver body8+spin1 PNG9원바이트 최초소비. 최종격리GPU26PASS/새4프레임. publicplayfalse/VISUAL RETOUCH. 원수치/QE/physics/geometry/save/사용자창 불변. |

# FDG Studio v0.2 · 24장·24FPS와 캐릭터 품질

> 현행 v0.19 일반 본체 검수: 실제 이미지 범위 내 전체 셀 fit·1/2/4 맞춤 확대·앵커 표시·원본 비율 썸네일24개 paging·non-loop 정지/선택 프레임 재생을 연결했다. 장수·FPS·저작 scale은 임의 변경하지 않는다. [새 계약·실제 UI/저장 증거](FDG_SPRITE_PREVIEW_20261011.md). 아래 신규3종 참고 모션의 수치·이전 검수는 완료 이력으로 보존한다.

2026-10-10 / Asia·Seoul. 사용자 확정은 **장수와 재생 속도 모두24**, 신규 캐릭터와 퀄리티·모델링에 집중하는 것이다. 현재 체크아웃의 제작 스튜디오에 신규3종의 기존 원화·실제 영상 프레임, 비교·확대·수동 검수, 24FPS 적용 및 실제 시트 편집을 연결했다. `game.html`과 별도 제품 R의 `fdg-engine/`는 변경하지 않았다.

## 실제 에셋과 제작 목표

| ID / 한글명 | 실제 자료 | Studio 재생 | 적용 상태 |
|---|---|---|---|
| `exoduser_warrior` / 엑소듀서 전사 | 기존48×48,21×1,8방향; idle2/walk8/attack8셀 | sprite 및 각 동작24FPS | 기존 본체 미리보기. 동작24장 목표는 아직 미달 |
| `exoduser_silvertail` / 실버테일 | 기존48×48,10×1,8방향; idle2/walk4/attack4셀 | sprite 및 각 동작24FPS | 기존 본체 미리보기. 동작24장 목표는 아직 미달 |
| `transmuter` / 변성술사 | 원화v4 + 첫1초 실제 영상24셀 | 24장/24FPS/1초 | 참고 모션, 모델·리그·게임용8방향·전투 동작 미확보 |
| `hell_hunter` / 헬 헌터 | 원화v3 + 첫1초 실제 영상24셀 | 24장/24FPS/1초 | 참고 모션, 모델·리그·게임용8방향·전투 동작 미확보 |
| `arcane_lancer` / 아케인 랜서 | 기존 원화 + 첫1초 준비·충전 영상24셀 | 24장/24FPS/1초 | 참고 모션, 기존RETOUCH 유지. 원본의 찌르기1.8~2.3초는 추출 범위 밖 |

새 시트3장은 각각 **6×4셀, 셀768×432, 전체4608×1728, 고유RGBA24셀**이다. 실제 프레임0..23을 추출했고 시간 보간·동일 그림 복제·PixelLab 생성은 하지 않았다. 픽셀 차이는 압축·밝기·천 변화에서도 생기므로 고유 포즈24개 또는 품질 향상을 증명하지 않는다. 원본 배경·브랜드 글자가 남으며 투명 게임 스프라이트가 아니다. 출처·실제 미디어 시간·프레임SHA·재현 명령은 [참고 에셋 계약](FDG_CHARACTER_ASSETS.md)과 [manifest](../../assets/fdg/character-reference/manifest.json)이 정본이다.

| 기존 동작 | 현행 실제 장수 | 24FPS에서 명목 길이 | 목표 |
|---|---:|---:|---|
| 전사/실버테일 idle | 2 | 2/24초 | 실제24셀,24FPS |
| 전사 walk/attack | 8 | 8/24초 | 실제24셀,24FPS |
| 실버테일 walk/attack | 4 | 4/24초 | 실제24셀,24FPS |

위 길이는 FDG 시간 기반 미리보기이며 본편 이동거리 기반 보행·공격 판정·SFX 타이밍은 변경하지 않았다. 장수를24로 선언하여 부족한 셀을 숨기지 않는다. 원본 본체를 실제24장으로 제작·교체하는 작업은 남아 있다.

## 프로젝트·호환 계약

| 필드 / 상수 | 정확한 값·제약 | 위치 |
|---|---|---|
| `schemaVersion` | 기존1 유지 | 프로젝트 파일·저장 키 `fdg.studio.project.v1` |
| `CHARACTER_TARGET` | `{frames:24,fps:24}` | `project.js` |
| `characterQuality` | optional, 있으면 정확히24/24 | 기본 프로젝트 포함; 기존 저장 생략 허용 |
| `characterDrafts` | optional 배열0~128개, 그룹 내 고유ID | 신규 참고 자료. 기존 `characters`와 분리 |
| ID/이름 | 각1~120자 | 복제·표시 |
| `referenceSrc`, `clip.src` | 기존 로컬 이미지 경로 검증 | URL·경로이탈 등 거부 |
| `clip` | 실제24장·24FPS, 각 셀1~4096px, 열/행1~256; grid≤256셀, atlas≤16,000,000pixels | sprite 셀 범위 검증도 적용 |
| `designLocks` | 1~16개 문자열, 각1~240자 | 원형·형태·무기·그립 기준 |
| `provenance.scope` | `reference-motion` 고정 | 모델·본편 완료로 오표기 금지 |
| `gameplayApplied`, `modelAvailable` | 모두false | 다른 값은 가져오기 거부 |
| `provenance.reviewStatus` | pending/retouch | 원본 검수 상태, 수동 항목으로 승격하지 않음 |
| `review` | optional 객체 | silhouette/proportions/face/weapon/grip/feet 각각 pending/retouch/pass |
| playable 선택 | `preview.characterId`는 `characters` ID만 | 신규 참고ID를 실행 캐릭터로 넣으면 검증 실패 |
| animation 범위 | `start<columns`, `row×columns+start+frames≤sprite.frames` | 여러 행의 실제24셀 재생 가능, 미선언 셀 침범 거부 |

기존 저장값은 가져오기에서 임의로24FPS로 바꾸지 않는다. **캐릭터24FPS 적용**은 모든 기존 본체의 sprite/animations FPS와 목표24/24를 한 트랜잭션으로 변경하며 실제 장수를 보존한다. **신규 캐릭터3종 연결**은 없는ID만 추가하고 목표24/24를 설정한다. 기존 수동 검수와 후보는 보존하며 중복 연결은 새 undo를 만들지 않는다. 두 버튼은 테스트 실행 중 비활성이고 각각 한 번의 undo로 복원한다.

## 확대·모션·수동 검수

| UI / ID | 동작·수치 |
|---|---|
| 리소스 그룹 | `characterDrafts`: 신규 캐릭터24장 제작 |
| 참고 선택 | 캐릭터 탭으로 열지만 runtime 플레이어ID를 변경하지 않음; `#play` 비활성 |
| `#character-view` | motion/reference/compare. compare는 원화 위 모션 alpha.5 |
| `#character-zoom` | 맞춤 기준1/2/4배; 표시 창에 맞춤/맞춤2×/맞춤4×. 원본 비율 유지,1 선택 시 중심(.5,.5) 복원. v0.19부터 일반 characters에서도 활성, 해당 geometry는 별도 정본 |
| 캔버스 클릭 | 확대된 그림의 얼굴·무기·손·발 위치를 화면 중심으로 옮김. 중심은0..1 제한 |
| 캔버스 | 960×600, 주요 그림 영역475px높이 |
| 썸네일 | 실제24개,12열×2행,64×36px·간격10px·행44px; 클릭으로 프레임 선택 |
| `#frame` | 0..23. 표시1/24..24/24, 스크럽 시 재생 정지 |
| 재생 | 24FPS non-loop, 1초에서23번 프레임 유지하고 정지. 마지막 프레임에서 재생하면0부터 |
| `#quality-badge` | 선언24/24FPS 및 TECH PASS/REVIEW/FAIL |
| `#quality-summary` | 정확한 픽셀 고유 프레임 수와 참고/배경/모델·8방향 미확보 상태 |
| 원본 검수 상태 | provenance pending는 사용자 검수 대기, retouch는 수정 필요로 읽기 전용 표시 |
| 수동 검수6항목 | 실루엣/신체 비율/얼굴 일관성/무기 구조/손·견착/발·접지 |
| 수동 상태 | pending=검수 대기, retouch=수정 필요, pass=참고 화면 통과 |
| 검수 이력 | 각 항목 변경은1트랜잭션으로 undo/redo·JSON·로컬 저장 보존 |
| 기존 본체 인스펙터 | 셀 규격·열/행·실제 장수·애니메이션start/row/frames/FPS 편집,24장 미달 경고 |

자동 기술 검수는 [RGBA 측정 공식](FDG_CHARACTER_QUALITY.md)에 따라 정확한 중복·빈 셀·알파·경계 후보·밝기·인접/루프 변화량을 계산한다. 불투명 영상은 `opaque-background`로 **TECH REVIEW**이며 자동 미술 판정은 항상unreviewed다. 수동pass는 해당 참고 화면의 항목만 의미하고 게임용 모델·전투·8방향 완료를 부여하지 않는다.

## 로딩·처리 수명

| 항목 | 구현 계약·한계 |
|---|---|
| 변경 요청 | 요청 번호를 올리고 그림·검수 상태를 비운 뒤 로드. 이전 비동기 완료는 새 선택을 덮어쓰지 않음 |
| 실패 이미지 | 실패Promise는 캐시에서 제거하여 다음 편집/선택 때 재시도. 새 요청으로 교체된 뒤의 이전 이미지 완료는 캐시/오류 상태를 변경하지 않음 |
| 선택한 참고 자료 | 원화/시트를 병렬 로드. 다른 현재 후보의 이미지Map 항목 제거 |
| 픽셀 읽기 | 이미지 총16M픽셀 제한 확인 후 Canvas/getImageData, helper도 규격/한계 재검증 |
| 결과 캐시 | clip JSON을 키로 수치 report만 유지. RGBA 원본을 캐시에 남기지 않음 |
| 임시 Canvas | 검수 성공 후 width/height=0, 픽셀 버퍼는 지역 수명 |
| 검수 캔버스 옵션 | character-canvas만 `willReadFrequently:true`, 참고 모션은 smoothing enabled/high, 기존 픽셀 본체는 smoothing false. 런타임 캔버스 옵션 변경0 |
| 반복 readback/확대 검증 | 좁은 Chrome 실험에서 default1배 복귀는280,269픽셀 차이/max채널74, willReadFrequently는복귀·반복redraw 모두RGBA차이0. source/프레임/좌표가 아니라 raster 경로 차이로 판단하고 검수 화면만 옵션 고정 |
| 정지 화면 | 선택/스크럽/확대/비교 때 명시적 redraw. 재생 중만 계속 그림 |
| 단순 디코드 환산 | atlas1개31,850,496bytes=30.375MiB RGBA. 원화·Canvas·브라우저/GPU 추가 메모리는 별도 |
| 성능 판정 | 실제 peak메모리·기기GPU·NW.js·본편 전투 FPS는 이번 기술 결과에 포함하지 않음 |

## 형태·모델 제작 Gate

| 대상 | 유지할 형상 | 다음 제작·검수 |
|---|---|---|
| 변성술사 | 큰 푸른 구형 코어·발톱 장갑이 주무기. 여성 낫의 날·자루·그립은 장갑에서 형성되는 순수 에너지. 남성 푸른 활 | 얼굴/갑옷/비율 턴어라운드, 장갑-손-무기 연결·크기 유지 |
| 헬 헌터 | 실린더 리볼버 총기·견착·양손 그립, 절제된 붉은 천. 평시 닫힌 작살 총구→발사 때4날개 개방→중앙 단일 포구→닫힘 | 손/총기 리그와 개폐 상태 검수, 발사 리코일·발 접지 |
| 아케인 랜서 | 은발·후드·검은 갑옷, 가는 직선 창대·금속 창끝·브론즈 궤도 고리·단일 축·양손·양발 | 창끝/고리/손을 가리는 효과 수정, 끝까지 이어지는 무기와 발 가시성 검수 |

모델링 요구사항은 원화와 원천 문서에서 가져온 제작 기준이며 모델 생성·리깅 완료의 증거가 아니다. 작업 순서는 원형/앞·옆·뒤 턴어라운드→손·무기 연결 및 리그→각 동작의 실제24장·24FPS→8방향(동작당192셀)→투명 배경·발앵커·게임 스케일→본편 전투 판정/SFX/VFX 동기화→카메라·실기 검수다. 현재는 참고 자료 연결과 검수 도구 단계다.

## 검증·시각 판정

최종 Node/Chrome 결과는 아래에 기록한다. 새 원천의 추출·해시 검증과 사람이 보는 그림 품질을 별도로 기록한다.

| 검사 | 범위·현재 기록 |
|---|---|
| Node | `npm run engine:check`: **151/151 PASS**, 실패0/skip0. project85+runtime15+legacy7+품질10+신규 실제시트34 |
| 소스 | `npm run check`:69/69 PASS |
| Chrome | `npm run engine:qa`: **12/12 PASS**, pageerror0/PNG404 0. 기존8+실제24셀·확대비교/검수이력/구저장3+이미지decode실패복구1. 두 번째 썸네일 행/index13·24FPS진행·마지막23정지·220ms후 유지·정확한RGBA SHA 일치 포함 |
| 증거 | `tmp/fdg-character-24-20261010/qa/report.json`와`character-quality.png`, map/characters/skills/vfx 화면 및 프로젝트JSON |
| 이미지 오류 복구 | 별도 Chrome fault injection **PASS**, 의도한 누락 원화404 2회/pageerror0. 검수 변경 후 재요청·오류 유지, 정상 원화 재가져오기 후 오류 해제 확인. `qa/image-recovery.json` |
| 초기 수정 | 초기에 draft Play 비활성이 validate()에서 덮였던 문제 수정. Chrome 첫 확장 실행은 숨겨진 맵 버튼 oracle 오류로 실패→실제 draft Play/public validation 검사로 수정. 두 번째는 확대복귀의 실제 RGBA 불일치로 실패→위 검수 Canvas옵션 변경, RGBA해시 완전일치 유지. 최종12/12 PASS |
| 캐릭터 VISUAL VERDICT | **RETOUCH**. 참고 화면은 비교·확대 가능하나 배경/텍스트가 있고 모델·리그·8방향·완전한 전투 동작 미확보. 아케인 랜서 기존RETOUCH 유지 |
| production 맵 판정 | 이번 캐릭터 작업은 지형/환경 변경0. 기존 [MAP PRODUCTION REPORT](FDG_QA_20261010.md)의 완성 환경VISUAL FAIL·기술PASS 판정 유지 |

### 화면에서 확인한 후속 수정 항목

| 대상 | 이번 화면 검토·판정 | 다음 확인 |
|---|---|---|
| 변성술사 | 원화와 모션은 듀오/배경 구도이며 게임에서 쓰는 개별 본체가 아니다. 발 전체가 드러나는 게임용 프레임 검수가 필요 | 성별별 본체 분리·발 가시성·장갑 코어 크기·순수 에너지 낫 연결 |
| 헬 헌터 | 보존 원화에 펼쳐진 붉은 총구 날개가 보인다. 평시 닫힌 총구 계약을 해당 원화만으로 충족했다고 판정하지 않음 | 6실린더 형상 정합·평시닫힘/발사4날개·견착/양손·발 접지 |
| 아케인 랜서 | 참고 비교 화면에서 큰 발광 효과가 창끝/고리/손 세부 판독을 어렵게 한다. 기존RETOUCH 유지 | 효과를 줄인 본체·무기 구조 확인 및 실제 찌르기 구간의 손/발 연속 검수 |

위 항목은 참고 화면을 보고 기록한 제작 과제이며 자동 픽셀 지표로 얻은 결론이 아니다. 기본 프로젝트의 수동 검수 항목은 pending이며 실제 검수자가 기록한다.

수정 전 백업과 전체 docs `grep -r` 결과는 `tmp/fdg-character-24-20261010/`에 보존한다. 코드·관련 문서·원본 추적 manifest를 함께 로컬 커밋하며 관련 없는 기존 작업·보호 패링 문서는 변경하지 않는다.

## v0.4 실제3D 엔진 시험체와 신규 캐릭터의 경계

| 항목 | 현재 상태 |
|---|---|
| 일반 리깅 저작 도구 | [3D 리깅 시험실](FDG_RIG_STUDIO_20261010.md)의3본/16정점/28삼각형·LBS·호환색재질2종·클립2종·편집/재생/저장복원은새Node47/Chrome12PASS |
| 신규3종 | 위기술시험체와별개. modelAvailable:false/gameplayApplied:false, reference-motion/RETOUCH·모델/리그/8방향/전투미확보 유지 |
| FPS | 일반리그clip은1..120가변, 게임용sprite24장·24FPS 제작목표는유지 |
| 다음 모델 Gate | 승인된캐릭터별실제mesh/손·무기rig/발접지·UV/재질·방향/동작을확보하고본편카메라/전투에서검수. GPU·외부모델import·자동가중치·PBR/의상은미구현 |
