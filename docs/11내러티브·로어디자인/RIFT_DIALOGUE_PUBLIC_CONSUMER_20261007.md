

# 지옥의 틈 실제 대화 관측·포즈 consumer — 2026-10-07

## 2026-10-07 ROOT-RIFT-NPC-WOLF-CONSUMER-20261007 실제 public 연결

| 현행 항목 | 값·적용 위치·인수 범위 |
|---|---|
| 코드 | `tools/2_5d-world-lab.mjs/.html` + `tools/2_5d/dialogue-observation.mjs`, `dialogue-pose.mjs`, `corrupted-wolf.mjs`; 독립3387 public 파생 소비자 |
| 실제 대화 | 기존 `createRiftDialogue` controller의 snapshot을 관찰. `trialFlags` 4 / `trialRecords` 2 / `view.options` 8 / prototype 검사 16단계 / id 96자 |
| 포즈 | 3 actor별 `createDialoguePoseArbiter`; 기존 `createVisualPoseConsumer`만 import. run 1.55 / walk 1 / facing 0..7 / 기존 phase·attackDuration·top-level attackRemaining 유지 |
| 대화 수명 | open 또는 UNKNOWN은 idle, 옛 공격 폐기. close/actor변경/blur/reset 뒤 새 입력 허용. canvas→대화 선택지 blur는 close하지 않음, window blur는 close+release |
| 대화 관측 | `linked/stateKnown/supported/isOpen/scope/sessionOnly/view/trial/providersUnknown` frozen. accessor/throw/thenable/잘못된 구조는 UNKNOWN+null, getter 실행0 |
| 실제 보상 | `editor-session-only`, `actualGrant:false`, `committed:false`, `committedPromoted:false`, `grant/reward/save:null`. 본편 지급·저장 채택0 |
| 늑대 | skin `corrupted_wolf`; JSON2+PNG16 실제bytes/fullSHA/IHDR→ImageBitmap→원본RGBA 셀→Three DataTexture. raw placeholder Texture 경로는 직접 채택0 |
| 늑대 셀 | cell256 / cols8 / rows5 / idx13 / col5 / row1 / framesPerMob4. idle2048×1280 / walk8192×1280. 8방향 `south,south-east,east,north-east,north,north-west,west,south-west` |
| 늑대 frame | 방향 모두 walk0,1,2 유효 / walk3 빈 셀. alpha>16인 픽셀0이면 같은방향 검증된idle0로 fallback; alphaTest .01 |
| 늑대 timing | native walkDistance 128/프레임; 거리 미제공 lab previewFps6. 원JSON metadataFPS UNKNOWN, 임의로 sourceFPS6 선언0. previewFps>0·≤60; update dt finite≥0·최대.05초 사용 |
| 늑대 표시·자원 | displayHeight .36 시험값 / 셀 하단 중앙 배치 / anatomical foot·referenceHeight UNKNOWN. loadConcurrency2; 256² RGBA DataTexture32 / 8,388,608B / atlas16close / liveAtlasBitmaps0 |
| 늑대 재질 | Linear mag/min, ClampToEdge, mipmapsfalse, colorSpaceSRGB, bottom-up 복사·flipYfalse, transparenttrue/depthTestfalse/depthWritefalse/DoubleSide/toneMappedfalse |
| 공통 정렬 | actor/resident/전경/늑대=`30+(footY-4320)/8000*10`. 새RAF/timer0; 기존 lab RAF1만 소비 |
| 시험 배치 | root 시작5480,3740 유지; 늑대는 캐릭터 주변 offsets `(180,100),(-180,100),(180,-100),(-180,-100),(0,180),(0,-180)` 중 canWalk radius12가 true인 첫 위치 |
| 새 UI | `wolf-visible/wolf-mode/wolf-facing/wolf-near/wolf-status`, `dialogue-session`. 늑대8방향 idle/walk·현재캐릭터옆 배치·유품/부탁 각개수 표시; 리프만 textContent |
| 의미 검수 | observation/pose 최초14중6PASS·8FAIL(배열 descriptor 오류); 제품1행수정 후 실패8+가려진 index-getter1=9PASS, 성공6재실행0. wolf새17/17PASS |
| 실WebGL 검수 | 이번 새고유25유효PASS=첫11+대화10+수명4. Chrome/3387 실제PNGdecode·8dirGPU·3actor R대화·선택click·유품·부탁·run·blur·reset. pageerror/consoleerror/HTTPerror0 |
| 보존된 검사 실패 | 첫 harness 방향 기대 `E`≠실제`east`; 후속 walk setup 누락 timeout(0검수); `pose.running` 없음으로 false FAIL. source/pose 실제결함으로 둔갑0; 한정 후속에서 수정된 기대 검수 |
| 영상 | Playwright ffmpeg 미설치로 페이지 생성 전 UNAVAILABLE/검수0. 설치0. 실제 스크린샷은 별도 성공; 영상 생성 주장0 |
| 시각 판정 | 실제 start·베린 유품·네사 부탁 화면 열람. 캐릭터/주민/늑대 표시와 대화는 관측; 큰1254²판 확대흐림·절벽재질/접합·해부학적발·전체stageCamera 미인수. VISUAL VERDICT RETOUCH |
| 다음 실제 작업 | owner Claude8만 `CH1-RIFT-EDITOR-ENTRY-20261007-MAP` 송신/peer/firstsource 확인. 선택주민 접근점→2.5D previewPort 실행 adapter 제작; root editorbutton/labport/GUI 검수는 다음 최소단위 |
| 원자료·Git 범위 | raw52는 48fa4a43f95541ec3a1c9cc55c650aefdba2185a remoteexact로 미채택보존. 이번 root code5+관련docs20만 정상checkpoint; PNG/scene/nav/game/index/save/foreign68/보호2_3불변 |

| NPC id | 실제 flag | 관찰하는 trial record | 적용 범위 |
|---|---|---|---|
| rift-rest-haran | rift.haran.met | 없음 | 실제 R/닫기 후 session flag |
| rift-gift-berin | rift.berin.giftGiven | gift / story.berin.keepsake / actualGrant:false | 유품 선택당 최대1, 재진입 중복0 |
| rift-request-nessa | rift.nessa.questAccepted | quest / story.nessa.findLin / actualGrant:false | 부탁 수락 최대1, game quest 등록0 |
| rift-prepare-dorik | rift.dorik.met | 없음 | 기존 위층 안내 / 실제 gate 전환0 |

| root owned code | bytes | fullSHA256 |
|---|---:|---|
| tools/2_5d-world-lab.mjs | 27959 | `efccd3adca2af8fecfa72327ea2ed1f7c4afa34f113f629dce4b0367ba73f2e7` |
| tools/2_5d-world-lab.html | 11829 | `72619d05fe7f92200b40d209320b452e4b5d1c4a9b53d617df2f6fedd79fc06a` |
| tools/2_5d/dialogue-observation.mjs | 9830 | `3a08185ffa567736fe9c4333e6a2fd293261842becced48e0b13d4370fc836a5` |
| tools/2_5d/dialogue-pose.mjs | 5937 | `5ff101af0e891c9be279212dab503ff583da4f92bfda6abe44b74c6a624f262a` |
| tools/2_5d/corrupted-wolf.mjs | 20662 | `ac3fd86a5441c84cd477a716e86af8cec92b61589781a8296b4b59acdec17acc` |


## 2026-10-07 ROOT-RIFT-EDITOR-ENTRY-CONSUMER-20261007 실제 에디터 왕복

이 절은 현행 에디터 연결을 갱신한다. 앞선 선택NPC→2.5D PENDING 기록은 당시 이력이다. 실제 editor3387의 선택 주민 버튼과 동일 origin iframe을 연결했고 네 주민의 진입·복귀를 관측했다. 본편/native6·청취·실제 보상/save·A급 인수는 여전히 미완료다.

| 현재 항목 | 정확 구현·근거 |
|---|---|
| 진입 | `editor.html`의 `scene-preview-25d` → `createEditorPreviewHost` → public `createEditorPreviewEntry` → 실제 `__rift25Lab.enterPreview`. 실제 `EXODUSER_SCENE_EDITOR.snapshot()/selection()/player()`와 workspace.inert 소비 |
| 선택·검증 | 매 클릭 fresh scene/선택; canonical 90767B의 actual registration await/동일성 확인; 정본읽기·검사 중 선택/scene 변경, 보행시험, 미지원 객체는 거절. 원 scene/nav1192/geometry/pixels/에디터History/save 쓰기0 |
| 접근점 | Haran4700,6660 / Berin6020,5540 / Nessa6300,4980 / Dorik5220,2460. NPC/object ID 일치·실worldbounds·nav radius12·nearestNpc.npcId 확인, 자동 대화0 |
| 화면·입력 | 모달 부모 keydown/keyup capture 전파차단(preventDefault0), nativeTab/Enter/Space/Escape 유지; iframe 내부키는 별도window. 성공 currentepoch 후 world-canvas focus, WASD와 R 실제관측 |
| 수명 | 새token/사용자이동/actor교체/reset 뒤 oldrestore 거절; 유효한 복귀는 원발5480,3740로1회복원. 닫기/visibility/pagehide는 취소·대기해제·iframe about:blank. 독립 RAF 추가0 |
| 새 검수 | public adapter stdin10 PASS 실제1회 / lab port 메모리9 PASS 실제1회 / 이번 실제Chrome18유효항목 PASS(기존25 재집계0), page/console/HTTP error0. host 최초테스트0였으나 root 실제화면 연결을 검수 |
| 실패 이력 | 최초GUI의 nearestResident 가정 때문에 Haran 판단FAIL. 실제필드는 nearestNpc.npcId이며 코드변경없이 실패항목과 미실행항목만 후속17PASS. 초기 지원주민없음 PASS1은 재검사0. 모달 shortcut P1/focus P2는 구현 전 정적검토에서 발견·수정 |
| 원자료 보존 | MAP 완료 `CH1-RIFT-EDITOR-ENTRY-20261007-MAP-CANDIDATE`, officialend26736e4c-a55a-4193-91b1-22805e870bf5. raw누적52→53, raw 직접import0/후보미채택보존과 root 파생소비를 구분 |
| 시각·다음 | 전체그림1254² 확대 흐림, 절벽/전경 접합·실발/물리높이·전체8카메라/전투 인수 잔여. VISUAL VERDICT: RETOUCH. 다음은 원자료 증식보다 현행맵 실제재질·seam·본편최소연결 Gate |

근거 외부 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/editor-entry-*`: browser-result/followup-result/summary, modal/haran-canvas/return PNG, public-pins 및 preservation 영수증. 직전root59721dec0fcdfd7f054f8bbc9cfe63b1d2e86d6c 원격정확보존 이후 본 단위만 code+docs 정상commit/push하고 새정확HEAD는 외부영수증에서 확인한다. foreign68·ownerSTATELOG4 보존/새팀·세션·전문직접중복송신0/다른paused자동화·아침메일재개0. 24시간 연속제작·일별19시요약1회·제작중지0은 그대로다.

### public API·수치·범위

| 위치/ID | 현행 값·계약 |
|---|---|
| entry factory | `createEditorPreviewEntry({readEditor,canonicalBytes,previewPort}) → {enter,cancel,dispose,snapshot}`; readEditor 동기 plain 또는 actual own method handle, Promise/getter/unknown·inherited state 거절; safe JSON copy budget150000/depth64 |
| canonical/payload | `assets/map/hell_rift/resident_layers_20261006/hell-rift-residents-v2.scene.json`; bytes최대32000000(32MB), typedbytes copy; payload `{npcId,objectId,x,y}`; public assessRegistration+prepareResidentPreview 소비 |
| host factory | `createEditorPreviewHost({document,window,fetcher,readEditor?,timeoutMs?,pollMs?}) → {open,close,dispose,snapshot}`; sameorigin `tools/2_5d-world-lab.html`; canonical lazy cache; default30000ms/100ms; allowed timeout100..60000ms/poll20..1000ms; 별도RAF0 |
| lab port | `window.__rift25Lab.enterPreview({npcId,objectId,x,y})` sync 성공 frozen `{restore()}`, 실패null; snapshot.previewEntry `{active,token,npcId,objectId,reason}`; radius12/width8000/height8000 nav1192 원계약유지 |
| handle | restore 본인active token1회, oldhandle가새pose덮기0. adapter cancel/dispose/late=restore1+optionaldispose1, 성공교체=old dispose-only; host wrapper restore/release1회; 포커스실패로 승인pose/닫기수명파괴0 |
| DOM ID | scene-preview-25d / scene-preview-25d-panel / scene-preview-25d-frame / scene-preview-25d-status(leaf) / scene-preview-25d-close / scene-preview-25d-title. 부모 innerHTML/textContent 교체0; footerstatus 안전leaf만 갱신 |
| UI 규격 | modal width min1600px/96vw, height/max92vh, radius12px, border1px, close minheight36px; heading16px/line1.5; footer status maxwidth55%/ellipsis. CSS게임수치·발크기변경0 |
| 주민 ID | obj-resident-haran→rift-rest-haran; obj-resident-berin→rift-gift-berin; obj-resident-nessa→rift-request-nessa; obj-resident-dorik→rift-prepare-dorik |
| readonly 경계 | editor scene/nav/start/exit/view/selection 원보존; 게임/저장consumer 호출0. iframe대화 선택은 독립session-only이며 실제 유품grant/quest/save 도입0. 키 격리는 preview모달만이며 기존 본편Q/E/보호2_3 변경0 |


## 2026-10-07 ROOT-RIFT-MAIN-SAVE-INTEGRATION-PLAN-20261007 (미구현 계획)

| 항목 / 코드 접점 | 현행 사실 / 승인 다음 구현 Gate |
|---|---|
| 진행 전환 | game.html:_proceedNextStage는 _dbReady일 때 await dbSave 뒤 showStageTransition(()=>nextStage()). 지옥의 틈 runtime/return 단계는 아직 없다. nextStage는 지도·적·출구를 교체하고 stage를 증가시키므로 그 이전에 1회 진입/continue Gate를 배치할 계획. |
| 클리어 보상 | G.stageCleared guard의 SP+10 재지급0. DEMO 최종/전체 victory 분기 보존. _captureBossFieldState/_preArenaBackup을 거점 복귀용으로 빌려 쓰지 않는다. |
| 입력 / nav | R/L3은 기존 portal/NPC, R hold는 pickup 경로가 있어 dialogue와 이동 소비자 범위를 별도 격리해야 한다. 기존 숲 canMv/nav와 지옥의 틈200²/tile40/nav1192를 혼용하지 않는다. G.paused만으로 모든 인벤토리/ESC 입력을 막았다고 계산하지 않는다. |
| 실제 대화 / 보상 | lab의 rift.berin.giftGiven / story.berin.keepsake와 rift.nessa.questAccepted / story.nessa.findLin은 session flag/관측 effect, actualGrant:false. keepsake 실제 itemID 및 지속 gift ledger, quest 저장은 구현되지 않았다. foundLin과 rescuedLin을 동일완료로 취급하지 않는다. |
| 저장 ACK | pickupItem true 및 await dbSave resolve만으로 실제 디스크/서버 ACK 또는 원자적 인벤토리+ledger 저장을 주장하지 않는다. save 직렬화 일반/데모 각 분기의 rift 위치·return stage·gift ledger·quest 필드는 아직 없다. 사용자save 초기화/삭제/변조0. |
| 순서 | 1: stage-entry/continue/cancel 최신 stage lifetime guard. 2: 동일 공간·NPC 대화 왕복(실Grant0). 3: 실제 itemID·inventory capacity admission + 지속중복ledger + inventory/ledger 함께저장되고 readback 검증된 ACK 후에만 giftGiven. 4: quest 지속/실행consumer, 재입장·저장실패·retry 인수. 미구현 값을 현재 코드 상수/필드로 선언하지 않는다. |
| 전문 소유 / root 소비 | 기존Claude8만 MAP CH1-RIFT-MAIN-ENTRY-GATE-20261007-MAP를 신규1 후보에 배정. root가 공식end/bytes/fullSHA 수집 후 공용 main adapter를 최소 통합할 예정. 현재 source 검색만 확인, 본편/native/UI/audio/save 인수 PENDING. 기존 독립 작업 전원보류0/전문중복송신0. |
| 목표 | 최하층→상승 여정, 장/스테이지 사이 기묘한 지옥의 틈과 주민 유품·부탁이 다음 도전 목표로 이어지는 사용자 설정. fixed village/tent 반복으로 대체하지 않는다. |
