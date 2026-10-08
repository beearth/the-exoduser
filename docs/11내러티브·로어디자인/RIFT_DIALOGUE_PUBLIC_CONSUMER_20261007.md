

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


## 2026-10-07 ROOT-RIFT-MAIN-ENTRY-RAW55-PRESERVATION-20261007

| 항목 | 정확 값 / 상태 |
|---|---|
| 이전 공개 보존 | 02f39ad0 commit의 contact 독립비교 code3/docs16 정상push·remote exact. actual contact7 GUI PASS / 별도 canonical GPU1 PASS지만 ON효과의 nav계단 얼룩은 VISUAL FAIL이고 기본OFF; 전체맵 RETOUCH. |
| TASK / 완료 | CH1-RIFT-MAIN-ENTRY-GATE-20261007-MAP / CH1-RIFT-MAIN-ENTRY-GATE-20261007-MAP-CANDIDATE |
| 신규 완료 raw55 | tools/team-followup-20261007/hell-rift/MAP/rift-main-entry-gate.candidate.mjs / 7800 bytes / SHA256 93bf091af30bd2575ed2c49fb4d5e7f49179a3365d2ae9c4899b3990950ab216. 정확 공식end 원자료 미채택보존; public/main 직접import0. |
| 공식 end / 관측 | f89e5333-40ca-4bea-a78c-0343c5464393 / 2026-10-06T18:36:00.966Z / end rawSHA111888bec76dc14cbc523380ae7d3ccea4328463e909c13ee4f38b4b6ae1e8ed. owner 관측18:39:31.124643Z. |
| 수신 / source | peer6bdd0087-edf9-4829-beea-ff423c367f94 18:31:09.267Z; Bash source toolu_01Ad1gM3uQNFL53Wi9FoXC1i→d2a7f2ee-ddae-47a3-b2f1-bf0b9d862b07 18:31:44.029Z. 요구 대사consumer 문서의 이번 TASK Read 근거 미확인, 소급선행PASS0. root 검수에서 문서 실독을 따로 적용. |
| 전문 stdin / 경계 | stdin1 PASS exit0(toolu_01PTt6aFb9jcKwpGYqwe7ru7→88585705-8169-43d4-a8cd-2341c2d57f96). assertions 수를 임의추정하지 않는다. 이 PASS≠root 의미 채택 / main / native / real grant/save. |
| 검수 P1 | old async checkpoint/enterRift await·catch가 cancel→new enter 이후 phase를idle로 덮어써 신규작업을 지운다. continue가 전체fresh clearContinue를 검사하지 않아 same-stage stageCleared=false/final/demo/unknown을 진행시키며 null상태는 uncaught. |
| 핸들 / 실패 계약 | raw dispose→restore 순서는 현행 editor host released=true 때문에 restore를 막는다(restore→dispose 필요). null/invalid/thenable/getter handle을유효진입으로승격금지. live state getter·difficulty context 변화·unknown checkpoint승인·failure fallthrough에의한 stageadvance도 public 채택전 검수/수정 대상. |
| 다음 승인 단위 | 기존Claude8→기존MAP에 새 CH1-RIFT-MAIN-ENTRY-GUARDS-V2-20261007-MAP를 인계할 계획. raw55 기존핀불변/new raw1만, token소유상태쓰기·plain detached admission·최신 clear/status/stage/difficulty·captured valid restore/dispose 순서·latehandle해제·실패 no-autoadvance. 코드제작→공식end/핀보존→root최소 mainhost연결 순서. 인계만으로 실제송신/착수/완료를 선언0. |
| 저장 / 보상 | game.html 변경0. 실제G.revision 필드 없음; 새 fake revision을현재구현으로선언0. SP10재지급0, bossbackup재사용0, R/pickup경계새연결0. actualGrant:false, 사용자save·INV·persistentgiftledger/quest 쓰기0. |
| 보존 / 운영 | 소유 raw+관련docs 한정정상commit/push·remote exact SHA는외부영수증에서확인. foreign68/ownerSTATELOG4 보존, 새팀·관리채팅·Claude session0/전문직접송신0/완료TASK중복0. 24시간연속제작 / paused타자동화·아침메일재개0. |

MAP PRODUCTION REPORT — STAGE: 지옥의 틈 main-entry 논리 후보 raw55 보존. MASTER/OUTER MASS/LARGE/MEDIUM/GROUND/PLAYABLE/LANDMARK: 지형·원화·nav1192·본편모두 변경0; 전환 API만 미채택후보로 보존. CAMERA QA 미수행. TECH QA: 전문stdin1 PASS와 root정적P1 확인을 구분; route/collision/pageerror/404/seam/loading/performance main관측PENDING. FILES: 완료stage-ownedraw1 / 관련rootdocs5; concurrent/unrelated touched0. GIT: 소유완료만 정상commit/push, deploy0. VISUAL VERDICT: RETOUCH (이 논리 후보 화면 NOT ASSESSED; 이전contactON효과FAIL 유지). NEXT PASS: current-state/epoch/validhandle 실패방향을 보정하고 실제 본편host 왕복Gate 검수.


## 2026-10-07 ROOT-RIFT-MAIN-GATE-PUBLIC-20261007 — public 논리·격리 host 계약, 본편 미연결

앞선 main-entry 원자료 보존·미구현 계획은 해당 시점 이력으로 유지한다. 현재 root 독립 public gate와 동일 origin host는 아래 계약으로 구현됐다. 모듈 파일 생성/import와 격리3387 검수는 game.html 진입·실제 nextStage·본편 저장/보상 인수가 아니다. 원자료를 직접 import하지 않으며 G.revision 같은 가짜 본편 필드를 추가하지 않는다.

| 현재 public / 원자료 | bytes | full SHA256 / 공식 근거 |
|---|---:|---|
| tools/2_5d/rift-main-entry-gate.mjs | 16280 | f9dbbcb891e79748d6b71eb08e331745ccd62f7992d0210fe438fbd3574038fd |
| tools/2_5d/main-rift-host.mjs | 17683 | 008a33930406b5ceaea70fb83050eab46acbd24eb7cf98579cae7b64adb6dc38 |
| tools/team-followup-20261007/hell-rift/MAP/rift-main-entry-guards-v2.candidate.mjs | 11268 | 646bf810623bfe7ce687c1bd4d560f40fc751b9586cd46326c0d7764635e72be; officialend be7786a7-6b57-4b97-a55e-e1e7cada25e1; raw 不변·직접 import0 |

| API / 상태 | 현행 수치·구조·실패 경계 |
|---|---|
| gate factory / API | createRiftMainEntryGate({ports}) → enter(), continue(), cancel(), dispose(), snapshot(). gate completionId ROOT-RIFT-MAIN-ENTRY-GATE-20261007. ports의 readState/checkpoint/enterRift/resumeStage는 own-data 함수 참조를 factory에서 캡처하며 ports를 receiver로 호출. |
| ports.readState() | 동기 own plain object(Object.prototype 또는 null), own-data 필수 stage/stageCleared/status/difficultyOff/contextId. stage safe integer≥0; stageCleared boolean; difficultyOff finite number; contextId null/undefined 제외 string/finite number/bigint/symbol/boolean primitive. |
| status / 진입 | enum clear-continue/dead/final/demo/unknown. stageCleared===true AND status===clear-continue만 진입. 실제 P.s=fallen은 caller에서 dead로 투영하거나 admission 실패. host의 느슨한 status 검사만으로 final/demo 진입을 승인하지 않음. |
| state / UNKNOWN | detached frozen null-prototype 캡처 {stage,stageCleared,status,difficultyOff,contextId,epoch}. getter 실행0; own/inherited then descriptor·accessor·비정상 구조·reflection/proxy trap throw는 UNKNOWN. proxy trap 자체를 호출하지 않는다는 보장은 아님. |
| epoch / context | gate-owned epoch는 enter/cancel/invalidate/dispose 수명 구분용. root contextId는 실제 lexical P/캐릭터/run job 동일성을 대표하는 caller-local primitive이어야 함. state의 5필드를 모두 비교; stage만 같은 새 job은 같은 승인으로 취급하지 않음. G.revision 쓰기0. |
| ports.checkpoint(captured) | true 또는 같은 realm의 native Promise<true>만 승인. false/null/undefined/비true settlement/getter/thenable/throw/reject/stale는 거절. 이 true는 caller 준비 승인이고 dbSave/디스크 ACK/유품 지급 ACK가 아님. |
| Promise 경계 | gate는 exact native Promise.prototype·intrinsic then brand만 소비. own then/constructor, subclass/foreign realm/proxy/lookalike/arbitrary thenable은 UNKNOWN. 반환 핸들 then을 읽거나 임의 Promise.resolve assimilation하지 않음. |
| ports.enterRift(onExit,captured) | own plain restore() 필수/own dispose() 선택 핸들 또는 같은 realm native Promise<handle>. null/invalid/throw/reject/load failure/stale는 유효 진입으로 승격하지 않음. onExit는 해당 job 취소만, continue/nextStage 호출0. |
| 핸들 정리 | 함수 참조와 원 receiver를 캡처; restore→dispose 각 최대1회. raw 메서드 교체/accessor를 다시 읽지 않음. 정리는 동기 반환이어야 하며 async/UNKNOWN 반환·예외는 commit 차단. native rejection 관측과 arbitrary thenable adoption은 구분. |
| 취소 / 늦은 완료 | handle detach·current 제거·epoch 변경·state clear를 외부 cleanup 이전에 완료, cleanup 이후 취소 상태쓰기0. external port/await/handle cleanup 전후 job+epoch+fresh context 확인. 옛 checkpoint/host/resume reject가 새 job/handle을 지우지 않음. 늦은 valid old handle은 독립 정리. |
| ports.resumeStage(commit,captured) | undefined/true 또는 같은 realm native Promise<undefined 또는 true>만 정상 반환. continue는 진행 예약만; delayed callback은 commit() AND rootJobIsCurrent()일 때 caller nextStage를 1회 허용. host.cancel()로 top layer를 닫되 gate.cancel()로 예약 job을 취소하지 않는 caller seam 필요. |
| delayed commit | fresh 5필드 동일성 확인→permissionConsumed 설정→handle cleanup→epoch/disposed/context 재확인→permissionIssued. 외부 cleanup이 cancel/dispose/context 변경/new enter하면 false; duplicate callback false. async cleanup은 false. |
| 실패 결과 / host 정리 | 모든 gate 결과 fallthrough:false. 실패 뒤 자동 stage advance0. hostCancelRequired는 실제 해당 job 소유 실패이고 새 job이 없는 경우에만 true; root job도 대조해야 새 host를 닫지 않음. host가 null/error UI를 반환하는 경로는 caller가 본인 host.cancel()로 retained dialog를 정리. |
| gate snapshot | phase/disposed/epoch/scheduled/commitPermissionConsumed/commitPermissionIssued/permissionCount/stage/contextId/ownsHandle/reason/actualStageAcknowledged. phase는 entering/rift/scheduled/committing/permission-issued 또는 idle/disposed. actualStageAcknowledged:false 고정; permissionCount는 허용 횟수이며 실제 stage 성공 수가 아님. |
| host factory / API | createMainRiftHost({document,window,readContext,timeoutMs?,pollMs?}) → enterRift(onExit), cancel(), dispose(), snapshot(). 직접 continue/nextStage API0. HTTP(S) 동일 origin의 포트3387만 허용; iframe tools/2_5d-world-lab.html. 본편3333/3340 연결0. |
| host readContext() | 동기 own-data plain {player:P,character:string,stage:integer≥0,context:G 또는 run token,on:false,stageCleared:true,status?:primitive}. player 실제 객체·character 비어있지 않은 string; context 객체 또는 string/boolean/finite number 허용. status optional string/boolean/finite number, dead/fallen/reviving/lastStand 거절. gate contextId의 primitive 계약과 별개. |
| host poll / UI / resources | default timeout30000ms/poll100ms; 허용 timeout100..60000ms/poll20..1000ms. owned timer loading/active 최대1; restore로 부모 화면 귀환/취소/실패 후 timer0; 성공 enterRift handle resolve 이후 active에는 poll timer1. owned dialog/iframe/status leaf만; iframe about:blank→detach, child pagehide에서 기존 WebGL 해제. host renderer0/RAF0, 자동대화0, parent player/save/reward 쓰기0. |
| host input / identity | actual child Object.prototype realm만 plain snapshot에 허용. Tab/Enter/NumpadEnter/Space native 유지, Escape 본인 host 종료. 부모 이미-held key/gamepad/앞선 same-window capture는 caller 소유. iframe focus로 발생하는 부모 blur를 실제 게임 이탈로 잘못 처리하지 않음. |

| 검수 묶음 / 코드핀 | 실제 증거·완료 경계 — 서로 합산하지 않음 |
|---|---|
| public gate 순수 의미검수 | 외부 main-gate/semantic-test.mjs를 Node stdin 실제1회 실행: 24 고유그룹/222 조건 PASS, fail0/unreached0/exit0. cancel→new epoch/late handle/native Promise/getter/cleanup reentry/delayed permit 반례 포함. 본편·DOM·저장 검수0. |
| 기존 host GUI14 | main-host/browser-result.json 최초 cross-realm 준비 실패(checks0)를 보존. child realm 보정 뒤 browser-fixed-result.json 실제14 PASS는 host SHA6cd3a13627e5eeccd8484ca843ec29ff1255ede47e1a8299493d65405367d0e6의 이력. intentional HTTP5031과 관련 console1은 예외 주입이고 unexpected error0. 현재핀으로14 재실행0. |
| 최종 host 제한검수 | main-host/error-formatter-limited-result.json의 현 host008a3393…에서 readContext message-getter throw/null throw 실패 주입 2건 PASS와 정상 entry/restore-disposal GUI2 PASS를 분리 기록. 이전 GUI14와 합산0. 실제 main context는 모의 own-data fixture, 사용자 저장·본편0. |
| 신규 gate-host interop | 문서 작성 시 root 실제3387 4항목 검수 진행/인수 PENDING. 외부 main-gate-host-interop/interop-result.json의 preliminary raw4 기록은 수신됐으나 이 행에서 최종 인수로 승격0. 독립 delayed advance 대역이며 본편 nextStage ACK로 계산하지 않음. |
| 미인수 | mainGameAccepted/native6Accepted/audioAccepted/rewardAccepted/saveAccepted/actualStageAcknowledged 모두 false. A급/완전3D/실grant/본편 연결 완료 선언0. 전체맵 RETOUCH; 논리·문서 작업의 새 실제화면 관찰0. |

외부 백업·prefix 확인·전체 docs 검색/disposition·최종 핀: /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/main-gate/docs-sync/. 원본 전체 bytes prefix 유지한 LF append만 수행한다. 기존 raw55/V2 원자료·원화PNG·scene/nav1192·주민 발 좌표·game.html·사용자save·보호2_3·Q전용패링/어택티켓금지·타인WIP를 변경하지 않는다.

### 대사 관측·상승 여정과 지속 보상의 경계

| NPC / 독립 대사 | 현행 session flag / record | 본편 미구현 권한 |
|---|---|---|
| rift-rest-haran / 하란 | rift.haran.met; record 없음 | 만남 관측만, 실제 stage 전환·save0 |
| rift-gift-berin / 베린 | rift.berin.giftGiven; gift/story.berin.keepsake/actualGrant:false | 유품 symbolic record이며 실제 itemID·inventory grant·persistent 지급 ledger 없음. 동일 session Map 재방문 중복기록 guard를 durable 지급으로 승격하지 않음. |
| rift-request-nessa / 네사 | rift.nessa.questAccepted; quest/story.nessa.findLin/actualGrant:false | 부탁 session record만; game quest 등록·저장·구조완료0. foundLin!=rescuedLin. |
| rift-prepare-dorik / 도릭 | rift.dorik.met; record 없음 | 위층 안내만; gate.continue 및 실제 nextStage를 대사 선택으로 자동 호출0 |

대화 observer의 editor-session-only / committed:false / committedPromoted:false / grant,reward,save:null 계약을 유지한다. public stage gate는 대화 controller의 trialFlags/Map을 저장하거나 성공으로 바꾸지 않는다. 최하층에서 올라가는 여정·장/스테이지 사이 지옥의 틈·망자의 유품과 부탁은 서사 설정이며, 실제 보상과 퀘스트 지속은 별도 데이터/저장 인수가 필요하다. 본편 DEMO first1-1 우회, R hold pickup·parent gamepad/update held·5000ms 전환/900ms curtain epoch 연결은 아직 미구현이다. 모듈 import/격리 iframe 왕복을 본편 이야기 진행 완료로 계산하지 않는다.

| 후속 순서 | 필요한 실제 완료 조건 |
|---|---|
| stage 수명 | lexical P/character/root-local job capture·기존 dbSave 반복0·clear SP10 재지급0·DEMO/final 정책·parent held입력/지연 전환 guard |
| 공간·대화 | 본편 clear→동일 지옥의 틈 iframe→explicit continue 왕복 실관측; 실제grant/save0 경계 우선 |
| 유품·부탁 지속 | 실제 itemID/수용 공간/중복 지급 ledger/inventory 동시저장 readback ACK; quest 소비자와 지속·재방문·실패/retry 인수 |
| 보존 | canonical sourcePNG/scene/nav1192/NPC발·rawV2·본편game·사용자save·보호2_3 불변; 기존 첫화면/대사branch/기존GUI/옛테스트 재실행0 |

MAP PRODUCTION REPORT — STAGE: ROOT-RIFT-MAIN-GATE-PUBLIC-20261007 대사/진행 권한 동기화. MASTER/OUTER MASS/LARGE/MEDIUM/GROUND/PLAYABLE/LANDMARK: 맵/geometry/원화/nav1192/NPC배치·대사 원문·보상 생성 변경0, public stage gate와 session-only 대사 기록의 권한을 분리. CAMERA QA: 이 worker 새 관찰0; root interop4 최종 인수 PENDING. TECH QA: pure gate24그룹/222조건 실제stdin1 PASS; 옛 host GUI14와 현 host 실패 주입 2건 + 정상 GUI 2건 별도, main/native6/audio/save/grant0. FILES: 본인 docs2 append LF만; 다른 docs·code·STATE·index·WIP 변경0. GIT: root 소유 code+관련 docs 한정 checkpoint/push 예정, 본인 stage/commit/push0/deploy0. VISUAL VERDICT: RETOUCH (전체맵; 본 작업 화면 NOT ASSESSED). NEXT PASS: 실제 본편 최소 진입·explicit continue와 지연전환 ACK 검수, 이후 유품/부탁 지속 저장 Gate.


### ROOT-RIFT-MAIN-GATE-PUBLIC-20261007 최신 총괄 인수 — gate-host interop 4/4

위 최초 append의 신규 interop PENDING 문구는 작성 시점 이력이다. 이후 총괄이 main-gate-host-interop/interop-result.json의 시작/종료 source핀과 §23 근거를 대조하고 새 실제3387 4/4 PASS를 인수했다. 코드 gate16280B/f9dbbcb8… 및 host17683B/008a3393…는 시작/종료 동일하며 변경0. 이전 gate 순수24그룹/222조건, 옛 host GUI14, 최종 host 실패 주입 2건 + 정상 GUI 2건는 별개 묶음으로 합산0.

| 이번 신규 interop 항목 | 실제 결과 / 경계 |
|---|---|
| actual ready iframe + explicit continue | continue는 예약만; 부모 owned host 닫힌 뒤 delayed commit 최초 true/중복 false. 대역 mockadvance1; 실제 nextStage ACK0. |
| actual Escape | 해당 gate/owned iframe 취소·timer0·advance0, 새 자동 continue0. |
| 예약 후 context 교체 | contextId와 host context 교체 뒤 저장 callback false·mockadvance0; 옛 허가 재활성0. |
| HTTP503/null host 실패 | 의도된 load failure 주입1, null handle admission 거절·fallthrough:false·caller owned dialog 정리·advance0. unexpected page/console/HTTP error0과 주입 오류를 구분. |
| source / 실제 게임 | 시작종료 code2핀 exact. actualMainGame:false / native6Accepted:false / saveAccepted:false / audioAccepted:false / stageAcknowledged:false. delayedAdvanceIsMock:true, plainMainContextFixture:true. 사용자save·보상·quest·game.html 쓰기0. |
| 외부 화면·판정 | main-gate-host-interop/interop-entry.png 및 interop-scheduled-return.png; 직접 화면 검토는 root 책임. 전체맵 VISUAL VERDICT RETOUCH, 본 문서 worker 새 화면관찰0. |

MAP PRODUCTION REPORT 최신 인수 갱신 — STAGE: public gate-host 독립 왕복. MASTER/OUTER MASS/LARGE/MEDIUM/GROUND/PLAYABLE/LANDMARK 변경0; canonical 원화/nav1192/주민 발·본편불변. CAMERA QA: root 실제 격리 entry/return 화면2, 전체8카메라/전투/native미인수. TECH QA: 신규interop4/4 PASS는 readiness/explicit delayed permission/Escape/context 교체/주입 실패 수명 검수이며 실제게임 route/collision/save/reward/audio 완료0. FILES: docs2 LF-only append; concurrent/WIP prefix 보존. GIT: root가 소유완료 한정 checkpoint/push, 본 worker Git쓰기0/deploy0. VISUAL VERDICT: RETOUCH. NEXT PASS: 본편 DEMO/부모입력/5초 callback+900ms curtain epoch 최소 연결과 실제 nextStage ACK 후 지속 NPC grant/quest/save Gate.

## ROOT-RIFT-PARENT-INPUT-LEASE-20261007 — public 부모 입력 lease 완료 / 본편 훅 미연결

이 절은 앞선 public lease WIP·caller 격리 미구현 문구의 최신 상태를 구분한다. 완료된 것은 `tools/2_5d/rift-parent-input-lease.mjs`의 순수 정책 소비자이며, 실제 game.html 입력·simulation을 정지시키는 main 훅은 아직 연결되지 않았다. raw63/64 원자료는 직접 import하지 않고 provenance로 보존한다. host 닫힘/disposed만으로 예약 중인 root job을 해제하지 않는다.

| id / 적용 위치 | 정확 현행 계약 | 구현·인수 경계 |
|---|---|---|
| source / 완료 ID | ROOT-RIFT-PARENT-INPUT-LEASE-20261007; 최종12294B; SHA256 `d22e6f2c2bcac8f86fa62901c5f1cf62d0c2b497f9c39530a236c9292b89efc1` | native rejection observer 최소 보정 뒤 확정된 public derivative 1파일. raw 직접 import0 / game.html main 훅0 |
| factory / ports | `createRiftParentInputLease({ports:{readOwned,clearHeld}})` | options/ports는 own-data plain object, prototype는 같은 realm Object.prototype 또는 null. own/inherited then descriptor 거절; getter 실행으로 검증하지 않음. 함수와 원 ports receiver 캡처 |
| readOwned / 권한 | 동기 own-data plain `{owned:boolean,epoch:safe integer}`; epoch 최솟값0·최댓값9007199254740991 | root-local job의 비감소 epoch가 authoritative. host token/G.revision을 추측하지 않음. host는 닫혔어도 delayed root job이 남으면 owned:true |
| 통과 / 차단 | 현재 유효한 명시적 owned:false만 status inactive·block:false. owned/unknown/stale/disposed는 block:true | UNKNOWN·reflection/proxy throw·동기 재진입·옛 epoch·release된 epoch 재사용은 부모 실행 허가가 아님. Proxy trap 호출0 보장은 아님 |
| clearHeld | 각 새 owned epoch 첫 관측에 시도1회. 동기 undefined 또는 true만 성공; false/객체/thenable/Promise/throw는 실패 | clear 전에 epoch 기록, 외부 호출 후 fresh readOwned 재검사. 실패는 그 epoch에 고정되어 반복 해제0; 더 새 epoch는 별도 준비. clearHeld의 실제 _clearHeldInput→_gpClearAll 연결은 root caller 소유 |
| suppressUpdate | fresh readPolicy().block boolean | 실제 update 첫 실행문·lesson/KeyP/held shortcut 이전 호출은 main 후속 |
| suppressGamepadPoll | fresh block boolean | _pollGamepad 시작 전에 실제 caller 소비 필요; G.onfalse/paused만으로 폴링·UI 클릭이 막히지 않음 |
| suppressGamepadKeyInject | fresh block boolean | 직접 K/MB 주입 이전 소비 필요; poll의 직접 WASD 쓰기와 별개 |
| suppressFacingMutation | fresh block boolean | update 밖 mouse/gamepad facing 변경 이전 소비 필요; 방향 계산·BINDS·보호 패링 변경0 |
| suppressAutoNextStage | fresh block boolean | scheduled root job도 소유 차단 유지. commit 허가/실제 nextStage ACK를 이 boolean 자체로 대신하지 않음 |
| readPolicy / 반환 | frozen null-prototype: status/reason/owned/epoch/block/allowParent/blockParentInput/blockParentSim/blockGamepad/heldClearEpoch/heldClearSucceeded/heldClearAttempts/disposed/parentStateWrites/actualMainHooksAccepted | 각 suppressor는 fresh ownership 읽기. caller가 프레임당1회 정책을 읽는 경우 모든 실제 hotpath에서 block을 소비해야 함 |
| captureFreshOwnership | 안정된 owned:true 및 clear 성공 때 frozen detached `{owned:true,epoch}`, 그 외 null | 진단 캡처이며 persistent permission·restore/release handle이 아님. 이후 root job 변화는 caller가 재검사 |
| dispose | 최초 true / 이후 false. 폐기 뒤 항상 차단 | 내부 수명만 종료. 원 G/P 상태·root job·host·held 입력을 자동 복원하지 않음 |
| 순수 경계 / 수치 | module timer0 / RAF0 / DOM writes0 / parent state writes0 / save0 / reward0 / nextStage0 / automaticTalk0 | 모듈 추가 자체가 실제 freeze가 아님. 실제 gameplay·native input·save/grant/quest 인수0 |
| 초기 핀 의미 검수 이력 | 12058B / SHA256 `01ce35a76bffe36056680899916436f991d232f4d3e8e5f6cede0ffcb804c676`; 초기 stdin1회 / 16그룹 / 288조건 / PASS16 / FAIL0 / 미도달0 / exit0 | `parent-input-lease/new-module-raw-result.json`의 초기 핀 검사. 최종12294 핀에서 이 전체 검사 재실행0. 기존 raw63/64의 7 negative failure, gate24/222·hostGUI14·최종host4·interop4와 합산0; 문서 worker 새 실행0 |
| 최종 핀 제한 검수 | 새 제한 stdin 실제1회: 최초FAIL1 / unhandled rejection1 → 외부 byteexact 백업 → 제품 최소 보정1회 → 후속6그룹 / 33조건 / PASS6 / FAIL0 / 미도달0 / newUnhandled0 / overall exit0 | `parent-input-lease/rejected-read-owned-limited-result.json`, final-receipt.json. 최초 실패는 숨기지 않고 보존; 초기16/288 재실행0. 프로세스 전체 exit0와 최초 실패 이력은 별도 |
| 비동기 소유 반환 거부 | 같은 realm native Promise는 캡처된 intrinsic then으로 rejection만 관찰; owned / 성공 승격0, 상태 UNKNOWN / block=true | native prototype 동일, own constructor 없음, native constructor/species 계약 보존일 때만 관찰. value.then getter0. foreign Promise / plain thenable은 getter0 UNKNOWN; 검사 foreign는 fulfilled 값이며 적대 foreign/constructor-accessor rejection 관찰 인수 주장0 |
| 원자료 불변 | SKILL raw63 18140B/SHA `f37496ba97808f0f831c507d90c18b35666295e79bf648de884fcfe4bc7547b6`, end ff7cfaf0-984b-4257-b7ea-c626705f50a9; ENEMY raw64 10122B/SHA `880f204f1a1a7ae7bb5b5ec7587585544c6ebfad20520ef5e82d494730020e03`, end 45bd281e-7659-412d-afc7-2156b118b904 | 신규 검수 시작/종료 pin exact, 문서 작업에서도 fullSHA 재확인. 원자료 수정0 / public 직접 import0 |

`classifyProjectedEvent(projected)`는 advisory만 반환하며 실제 DOM event dispatch/주입·preventDefault·focus를 수행하지 않는다. active일 때 caller가 native event에서 own primitive data를 투영해야 한다. 명시적 inactive에서는 event/type/getter/prototype를 읽지 않고 parent 통과한다. active에서 type·선택 code/key/repeat/isComposing/button own-data 계약과 fresh epoch를 재확인하며 UNKNOWN이면 none으로 차단한다.

| iframe 권고 키 / 이벤트 | 정확 의미 | 실제 소비 경계 |
|---|---|---|
| KeyW/A/S/D·ArrowUp/Down/Left/Right | walk; labWalkSpeed260 | 기존 child lab 기준값. 정책 모듈이 새 이동·주입을 실행하지 않음 |
| ShiftLeft/Right | run; labRunSpeed470 | 기존 child 동작 권고이며 parent charge 입력 변경0 |
| KeyJ / KeyR / Space | attack / dialogue / pause | R은 parent pickup이 아니며 Space는 gate.continue가 아님 |
| Escape / Tab / Enter / NumpadEnter | close-dialogue / modal-native / modal-native / modal-native | child 권고와 parent host 명시적 Return/Escape 취소를 구분 |
| keyup/mouseup/pointerup/pointercancel/touchend/touchcancel/blur/focusout/compositionend | none·parent-release-only·clearHeld:true 권고 | classifier가 release hook을 추가 실행하는 것이 아님. 종료 held/gamepad 재동기화는 root caller 소유 |
| active pointer·wheel/click/contextmenu / composition | pointer는 none; composition은 iframe 권고 | parent mutation 차단 / 전달·포커스·네이티브 Tab/Enter 기본 동작은 실제 host/caller 책임 |

최소 본편 접점의 읽기 전용 계획은 외부 `main-seam/read-only-plan.json` 26436B / SHA256 `c195b898cac382c24680941fee1cd6de393cd3091cf9ab90d19b955e7cc9af72`에 별도 보존한다. 실제 update 첫문·poll·inject/facing·held 해제·root job/epoch 연결, 5000ms callback의 일회 허가와 900ms shared curtain 소유 보호는 미구현이다. 현재 `_DEMO_MODE=true`/`_DEMO_LAST_STAGE=0`에서 nextBtn이 _proceedNextStage를 우회하는 정책, 명시적 Continue UI, public host의 HTTP 동일 origin3387 범위 및 child P/char 실제 연결은 해결되지 않았다. signedDifficulty -5..+5와 stage level offset -100/-50/0/+50/+100을 혼용하지 않는다. 모듈 import나 mock advance로 첫1-1 본편 진입 완료를 선언하지 않는다.

원본문 bytes prefix100%와 타인 WIP를 보존한 LF append만 수행한다. 외부 백업·docs 전체 keyword search·모든 매칭 파일 disposition·6문서 최종핀은 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/parent-input-lease/docs-sync/rig-motion-prefix/`에 있다. 운영 정본의 최신 관리 상태는 PROJECT_MANAGEMENT_MASTER의 같은 완료 ID를 따른다. 다른 담당 DPR 문서/코드는 본 작업에서 수치·완료 판정을 추가하지 않는다. 사용자save·보스 retry/_preArenaBackup·SP10 clear 보상·원PNG/scene/nav·보호2_3/Q 전용 magic 패링/E 불가/어택티켓 금지 변경0.

### 대화·유품·부탁 적용 경계

child KeyR dialogue 권고는 existing preview 대화의 실행 조건을 설명하며, parent R/L3 pickup이나 실제 아이템 부여로 연결하지 않는다. 베린 symbolic story.berin.keepsake와 네사 story.nessa.findLin은 현행 editor-session-only/actualGrant:false이며, 도릭 안내로 gate.continue를 자동 호출하지 않는다. foundLin과 rescuedLin도 구분한다. public lease는 trial Map/flag를 저장하지 않으며 gift ledger·quest 지속·chapterGate·save ACK 권한을 만들지 않는다.

## ROOT-RIFT-MAIN-SEAM-INTEGRATION-20261007 — 격리 main 소스 훅 연결 / 실제 게임 인수 대기

이 절이 신규 소스 연결 상태의 정본이다. 앞선 public host/gate/lease 절의 “main 훅0·미연결”은 해당 당시 핀의 이력이며, 현재 `game.html` 일반 `_proceedNextStage` 경로에는 lexical root job과 public runtime 소비자가 연결되었다. 적용 origin은 정확히 `http://127.0.0.1:3387`이다. 기본 데모 종료 분기, 실제 본편 플레이·다음 stage ACK·native6·음향·지속 save ACK·child 실제 P/캐릭터 전달은 별도 미인수다. 모듈 구현·fixture PASS를 이 인수로 승격하지 않는다.

### 동결 소스와 적용 범위

| id / 소스 | 현재 값 / 핀 | 적용·제외 |
| --- | --- | --- |
| game.html | 4050426 B / SHA256 `ece8c398068903caf666979b33c3e0f541043db1e58f98a65d7c68e427f74230` | root block + 정확15접점. 원본 본체·타인 WIP·보호2_3 수정0 |
| tools/2_5d/main-rift-runtime.mjs | 7519 B / SHA256 `b93cb86f7857bd4242af8b9cc9478cceea591d03aad872bca76a5af06b471b69` | 새 public orchestration consumer. raw 직접 import0 |
| public foundation host | 17683 B / SHA256 `008a33930406b5ceaea70fb83050eab46acbd24eb7cf98579cae7b64adb6dc38` | 기존 public import / 동일 origin iframe host |
| public foundation gate | 16280 B / SHA256 `f9dbbcb891e79748d6b71eb08e331745ccd62f7992d0210fe438fbd3574038fd` | 기존 one-shot permission/context 계약 유지 |
| public foundation lease | 12294 B / SHA256 `d22e6f2c2bcac8f86fa62901c5f1cf62d0c2b497f9c39530a236c9292b89efc1` | 기존 strict ownership 계약 유지 |
| origin / 활성 | `location.origin === http://127.0.0.1:3387` | 3333·3340·file: 활성0. 새 서버/게임 실행0 |
| 데모 현재 기본값 | `_DEMO_MODE=true`, `_DEMO_LAST_STAGE=0` | nextBtn의 기존 terminal demo 분기는 직접 nextStage 호출 유지. 기본1-1→틈 허브 PENDING |
| foundation 진단 상수 | 기존 public module의 `actualMainHooksAccepted:false` 유지 | foundation 자체 인수 flag와 현재 caller 소스 연결을 구분. 새 runtime은 `mainSeamConnected:true` |
| source 등록/해상도 | canonical nav1192·원PNG/scene/주민 feet·1254² plate→8000² world 그대로 | 맵 확대 흐림·절벽 접합 RETOUCH 미해결. 이 연결은 해상도 개선이 아님 |

### runtime API와 실제 lexical ports

`createMainRiftRuntime({window,document,ports})`는 window/document.body·정확 origin3387 및 아래7개 함수 ports를 요구한다. 이 factory는 외부 임의 context를 본편으로 인증하는 validator가 아니며, game 내부의 실제 lexical 참조를 제공하는 caller와 public foundation guards가 함께 계약을 수행한다.

| ports id | 정확 반환 / 소비 | 수명·저장 경계 |
| --- | --- | --- |
| readOwned() | 동기 `{owned:!!_rootRiftJob&&!job.closed, epoch:_rootRiftEpoch}` | host token이나 G.revision 추정0; root-local epoch authoritative |
| clearHeld() | `_rootRiftClearOnce` → 동기 true/false | 새 job 최초 시도1회. `_clearHeldInput()`로 Shift 무장 해제 후 `_gpClearAll()`; _gpSynced=false·axes0·_gpAiming=false |
| isCurrent(captured) | `_rootRiftCurrent(job)` exact identity boolean | 같은 job/P/G/stage/char/difficulty/save/status·clear/boss/HP·G.onfalse 재검사 |
| readHostContext() | 현재 actual `{player:P,character,stage:G.stage,context:G,on:G.on,stageCleared:G.stageCleared,status:P.s}` | stale이면 throw; parent P 참조 읽기가 child P 전달을 뜻하지 않음 |
| readGateState(captured) | 현재 `{stage,stageCleared,status:clear-continue,difficultyOff,contextId:job.epoch}` 또는 null | 실제 stage offset 사용. 임의 G 필드 추가0 |
| schedule(commit,captured) | 현재 job 확인 후 controlled showStageTransition 설치 / undefined | 5000ms 대기 중 lease 유지; callback은 current→commit→current→기존 nextStage |
| release(captured,why) | `_rootRiftRelease` matching job만 true / 그 외 false | 옛 job이 새 job·curtain을 해제0; 안전한 같은 context에서만 이전 G.on 복원 |

| runtime API | 정확 동작 / 반환 | 상태·실패 경계 |
| --- | --- | --- |
| enter(captured) | async; 성공 frozen null-prototype `{entered:true,fallthrough:false,rootEpoch}` | 중복/disposed/stale는 entered:false. gate await 뒤 fresh ownership과 Continue DOM 설치 확인 |
| continue() | phase=rift·현재 소유 때만 gate.continue; scheduled===true면 true | 명시 Continue만 예약. 자동 advance/failure fallthrough0; 반복 scheduled 클릭 false |
| parentEvent(event) | 처리했으면 true; host native modal 제어에는 false | own Continue click 또는 비반복 Enter/NumpadEnter/Space만 명시 진행. 나머지 parent 이벤트 차단 |
| block(channel) | update/poll/inject/facing/auto → 대응 lease suppressor boolean | 알 수 없는 channel은 true 차단. game caller는 import/기존 save 대기 중에도 먼저 차단 |
| cancel(why=cancelled) | 현재 record close, 성공 true / 없거나 이미 닫혔으면 false | own Continue 제거→gate.dispose→host.cancel→matching release |
| finished(captured) | 현재 captured identity만 close(advanced,false) | root caller finally가 release. 성공 다음 stage에서 이전 G.on 복원0 |
| dispose() | 최초 cancel(page-disposed)·host.dispose·lease.dispose 후 true / 반복 false | 소유 UI/모듈 수명만 종료. parent game save/reward 소유0 |
| snapshot() | frozen null-prototype detached primitive fields + foundation snapshots | disposed/phase/reason/rootEpoch/entered/scheduled/continueButton/host/lease/gate; mainSeamConnected=true |
| snapshot 미인수/소유값 | actualStageAdvanceAccepted=false, childCharacterLinked=false, saveAckAccepted=false | saveWrites0 / rewardWrites0 / automaticTalk=false / raf0 / timers0. game curtain 기존 RAF/timer는 별도 |
| phase / reason | phase idle→entering→rift→scheduled→idle; reason idle/preparing/ready/explicit-continue 등 | 실패 reason stale-or-duplicate/gate-entry-failed/stale-entry/entry-or-continue-ui-failed/continue-failed/continue-refused; 취소 why·advanced 별도 |

### job 캡처·held 입력·epoch·취소·전환

| id / 접점 | 정확 규칙 / 수치 | 인수 경계 |
| --- | --- | --- |
| 진입 admission | stageCleared===true / bossAlive===false / stage safe integer≥0 / finite HP>0 / G.on boolean / finite difficulty / charIdx 유효 정수 | P.s dead/fallen/reviving/lastStand 거부. 현재 job·dead page·default demo terminal·epoch≥9007199254740990 거부 |
| captured job | epoch, P/G 참조, stage, charId, charIdx, character, difficultyOff, difficultyIndex, dbSave 함수 참조, _dbReady, P.s, previousOn | charId null도 identity로 허용. character는 charIdx===1이면 silvertail, 그 외 warrior; child 전송0 |
| job flags | heldCleared/closed/cancelling/advancing 최초 false; begin에서 ++epoch | root job 등록·G.on=false·held 해제는 기존 save await보다 먼저 |
| fresh identity | 현재 job/epoch/P/G/stage/charId/charIdx/(G._stageDiffOff??0)/(OPT.diff??5)/dbSave/_dbReady/P.s 일치 | finite HP>0·cleartrue·bossfalse도 확인. current는 !closed·!cancelling·G.on===false 추가 |
| 기존 난이도 | NEXT_DIFF_OPTS off = -100/-50/0/+50/+100; OPT.diff 기본5 | stage level offset와 difficulty index 분리; signed -5..+5로 임의 역변환0. 기존 선택·수식 무변경 |
| 기존 저장 | job.saveReady일 때 `_proceedNextStage` 기존 dbSave 최대1회 await | 이미 앞선 clear-save는 별도. void/skip/catch resolve는 준비 완료일 뿐 durable ACK가 아님 |
| await 경계 | save 뒤 context-after-save; lazy import 뒤 context-after-import fresh 검사 | matching job에만 invalidate. 실패 rift-entry-failed에서 자동 nextStage0 |
| 입력 해제/복원 | clearOnce 최초1회·release에서 다시 held/axes/aim 해제 | 옛 held 키/축 복원0. 같은 identity·G.onfalse의 안전한 취소에만 previousOn 복원 |
| 부모 hard block | import/준비 중 job이 있으면 차단; stale/lease throw는 invalidate 후 해당 hotpath 차단 | scheduled에서 iframe 닫혀도 root owned 유지. 명시 inactive에서 기존 부모 실행 통과 |
| 자동 stage / 명시 commit | 일반 nextStage는 auto 차단; 현재 job.advancing만 예외 | `_rootRiftAdvance`: current→함수 commit의 truthy 결과→current→기존 nextStage1회; final finally release restore=false |
| curtain 기본 수치 | 기존 RAF bar45% → owned wait5000ms → bar100% → owned hide900ms | 새 runtime RAF/timer0; 기존 game curtain 각 핸들만 소유/취소 |
| curtain 이중 소유 | curtainOwner===_rootRiftCurtainEpoch 및 bootOwner===_bootLoadEpoch | callback 전 current job도 검사. 성공 뒤900ms hide는 옛 stage identity가 아닌 curtain+boot 소유 검사 |
| matching cancel 최소 보정 | `why!==advanced`인 같은 job release가 own curtain.cancel 즉시 호출 | scheduled Escape가5000ms 대기를 즉시 제거. successful advanced의900ms fade는 유지 |
| curtain cancel() | 최초 true / 반복 false; own RAF/wait/hide만 clear; current curtain이면 opacity0/pointerEventsnone | 옛 cancel/hide가 새 curtain·boot cover를 덮지 않음. callback false/throw controlled 경로는 refuse/onCancel |
| context 무효화 | retry/character-change/init-stage/boot-loading/lobby/pagehide/parent-hidden/changed lexical context | advancing 중 authorized init-stage/boot-loading invalidate 제외. active job 중복진입은 거절; 새 job 전에 남은 curtain만 cancel. boot-loading은 새 curtain/boot token 사용 |
| 취소 UX | safe 취소일 때 기존 nextBtn disabled=false·opacity1, leaf status 귀환 안내 | host Return은 job 취소/부모 복귀이며 continue 예약이 아님. parent blur 취소 추가0 |
| 정확 원본 보존 | 15 replacement 역변환 결과 = 최초 원본4039085 B / SHA256 `4f4eba2596c33f4e0c28e1e68ac224560e17c944cdbe9596ad9956c7578e3ccd` | 구조 byte 대조 근거; git reset/checkout0·old suite 재실행0. clear 보상SP10/retry EXP30%/부활/save 기존 동작 보존 |

### 키·DOM·본편15접점

| id / key 또는 DOM | 현행 소비 | 변경하지 않는 경계 |
| --- | --- | --- |
| 명시 Continue | button id root-rift-continue-${captured.epoch}; 문구 “위로 올라가기 · 다음 구역”; aria “지옥의 틈을 떠나 다음 구역으로 이동” | host current token safe integer≥1·open dialog[data-main-rift-host]·첫 HEADER에만 append |
| Continue 입력 | own button target에서 click / 비반복 keydown Enter·NumpadEnter·Space | 전역 Space/Enter가 gate.continue를 뜻하지 않음; host의 native Tab/Return/Escape controls 유지 |
| Continue 스타일 | padding9px16px / border1px #c7b580 / radius7px / bg#544328 / fg#fff0c9 / font600 14px system-ui | 소유 button만 remove; 부모 textContent/innerHTML 교체0 |
| 상태 leaf | root-rift-main-status / role=status / display:block / min-height21px / margin9px0 / #d9bd86 / font13px/1.6 system-ui | nextBtn 앞 own span 삽입. children.length===0에서만 textContent 교체 |
| parent capture18종 | keydown/keyup/pointerdown/pointerup/pointermove/pointercancel/mousedown/mouseup/mousemove/click/dblclick/auxclick/contextmenu/touchstart/touchmove/touchend/touchcancel/wheel | window capture:true/passive:false. 현 job 때 parent mutation 차단; modal 내부는 host control에 양도 |
| Escape/visibility/pagehide | nonrepeat Escape matching cancel; document.hidden이면 parent-hidden; pagehide dead flag·invalidate·runtime.dispose | parent blur 취소0. 오래된 job 취소는 새 job 불변 |
| child 기본 키 | WASD/방향키 walk260; Shift run470; J attack; R dialogue; Space pause | 기존 lab 속도/동작 유지. 자동 dialogue0; child R을 parent pickup으로 해석0 |
| 원래 parent 설정 | BINDS/BINDS2·마우스 aim·패드 twin-stick·Q 전용 magic blackBean 패링 유지 | E magic 패링 추가0 / 어택티켓 제한 신규 구현0 / 보호2_3 변경0 |

아래 줄번호는 동결 `game.html` ece8 핀 기준이며 접점은 root block1 + 기존 함수/이벤트 소비14 = 15개다.

| 접점 id | source line / 함수 | 새 소비 |
| --- | --- | --- |
| root job / orchestration | 3438–3557 root block | job/epoch/capture/quarantine/readonly snapshot |
| character change | 10283 _loadCharAtlas | character-change invalidate |
| mouse facing | 12567 _setMouseFacing | facing lease guard |
| gamepad auto aim | 13132 _gpAutoAim | facing guard |
| gamepad key inject | 13163 _gpInjectKey | inject guard; release는 기존 held clear만 |
| gamepad poll | 13489 _pollGamepad | poll 시작 guard |
| gamepad direct WASD | 13758 직접 K/KH 쓰기 | inject guard로 poll 외 실제 직접 주입 보호 |
| init stage | 30478 initStage | init-stage invalidate / authorized advancing 예외 |
| simulation update | 31041 update | lesson/KeyP/held shortcut보다 먼저 update guard |
| auto next stage | 42610 nextStage | auto guard / authorized advancing만 기존 본체 허용 |
| retry | 61667 기존 retry callback | retry invalidate |
| stage transition | 61739 showStageTransition | optional rootControl + owned RAF/5000/900 lifecycle |
| boot loading | 61791 showBootLoading | boot-loading invalidate 및 curtain token 증분 |
| normal proceed | 61859 _proceedNextStage | capture→기존 save→fresh→runtime import→fresh→enter |
| lobby | 61890 goToLobby | lobby invalidate 후 기존 저장/로비 이동 |

`window.__riftMainIntegration.snapshot()`은 frozen readonly 진단이며 enabled/epoch/owned/reason/phase/guardedAdvanceCalls와 childCharacterLinked:false/durableSaveAccepted:false/demoHubAccepted:false를 반환한다. mutable P/G/job·release 함수·save handle을 노출하지 않는다. 정상 demo nextBtn의61880 terminal branch는 `_proceedNextStage`를 우회해 기존 nextStage를 직접 호출하므로, 이 진단의 존재만으로1-1 허브를 인수하지 않는다.

### 핀별 검수·미인수

| 검수 / source pin | 새 실행 / 정확 결과 | 범위 / 승격 금지 |
| --- | --- | --- |
| 과거 source-seam VM | game4050167 B / SHA256 `f3a084bc1a136186ccca3157b9a9a1f5f41133b72eebfb10aa2641fe2a017cf3`; runtime b93c 동일; 실제1회9그룹/133조건 PASS9 FAIL0 exit0 | lexical source+runtime 실제 함수 및 host/gate/lease 인터페이스 double. 본편·HTTP·GPU·save writes·native0 |
| 최종 matching Escape 보정 | game4050426/ece8 + runtime7519/b93c; 제한 신규1회2그룹/20조건 PASS2 FAIL0 exit0 | final release/transition/runtime 경계만. 앞9/133 재실행0·두 핀 결과 합산0 |
| syntax 이력 | 완료 corrected syntax1회 PASS는 과거 f3a inline1 + runtime; 기존 importmap JSON 오분류 checker 실패1회 별도 | 최초 parser 실패는 변경제품 도달 전 tooling 실패. final 제한2/20에서 변경 lexical parse/실행; 옛 syntax 결과 재승격0 |
| 신규 runtime DOMQA | actual Chrome1/context1/QA parent1/child3 직렬; 신규3그룹/15 subchecks PASS3 FAIL0 exit0 | detached stage1 P/G fixture. actual game/5000ms900ms/nextStage/held gamepad/update 검수0; 기존 검수 합산/재실행0 |
| 실제 main 인수 | actualGameExecuted=false / actualStageAdvance=false / nativeSix=false / audio=false / saveAck=false / actualGPU=false | mock nextStage count는 실제 advance가 아님. childUsesActualPCharacter=false / defaultDemoCH1_1HubRoute=false |
| 미래 인수 조건 | DEMO terminal route 정책 별도 확정→actual current parent→host Continue→actual nextStage ACK→game native6·음향·지속 저장 | 현재 source 접점 구현과 실사용/실게임 인수를 분리. NPC grant/quest·영구 보상 후속 PENDING |

근거: 외부 `main-seam-integration/rig-motion-implementation/final-receipt.json`·handoff.md·동결 소스 actual diff/runtime. 문서 worker의 새 테스트·브라우저·게임·Git 실행0. docs 전체 keyword 검색은65파일/520매칭 줄, raw887635 B; 모든 매칭 파일의 수정/보존/타인 소유 disposition과6문서 byteexact 백업은 외부 `main-seam-integration/docs-related-sync/`에 보존한다. 기존 원문 bytes prefix100%·기존 완료 이력·타인 WIP를 유지한 LF append만 적용한다.

### 대화 consumer 정본 적용

| id | 현재 적용 | 미구현·보호 경계 |
| --- | --- | --- |
| 틈 방문 | 일반 proceed seam이 public host iframe을 연 뒤 명시 Continue를 제공 | 자동 NPC open0·실제 본편 NPC P/character/quest/save 전달0 |
| dialogue 키 | child R dialogue 기존 소비자 유지 / parent Continue Enter·Space는 own button에만 | 대화 종료/Escape/host Return과 stage 예약을 분리 |
| 사연·보상 | 기존 STORY source/one-shot 시험 기록 불변 | parent dbSave 준비를 NPC 보상의 durable ACK로 쓰지 않음 |
| 상승 | 명시 “위로 올라가기 · 다음 구역”이 current gate commit을 예약 | DEMO1-1 terminal 분기는 기존 그대로이므로 story hub 실제 경로 인수 PENDING |


### ROOT-RIFT-RUNTIME-CONSUMER-BROWSER-20261007 — 신규 실제 DOM 결과 / fixture 경계

문서 작성 중 도착한 helper 결과를 현행으로 반영한다. actual public runtime/host/gate/lease와 실제 child lab을 격리3387에서 사용했다. 부모는 detached own plain P/G/job의 stage1·clear-continue·difficultyOff0·contextId=epoch fixture이며 actual game.html은 실행하지 않았다.

| 관측 id | 정확 신규 결과 | 미인수 경계 |
|---|---|---|
| 실행 / 결과 | actual harness1 / Chrome launch1 / context1 / QA parent1 / child3 직렬 / screenshot3; 신규3그룹·15 observed subchecks PASS3 FAIL0·failedSubchecks0·exit0 | 제품 수정0. source9/133·final2/20·interop4·기존 hostGUI14 재실행/합산0 |
| native Continue click·Enter | 각 trusted own button 입력→scheduled; rootOwned=true/leaseBlock=true/leaseOwned=true; clearHeldCalls1/scheduleCalls1 | host owned dialog0/iframe0/poll timers0. 예약 직후 mockAdvance0·permission false |
| 지연 gate callback | click/Enter 각 최초 permission true1·중복false1·모의advance1·release advanced1 | QA 메모리에 보류한 실제 gate callback 수동 호출. actual nextStage0 /5000ms·900ms timer 검수0 |
| 예약 중 W / Escape | 각 경로 trusted W downstream0. Escape에서 release(parent-escape)1→old callback2 false·mockadvance0 | actual main held/gamepad/update 검수0. matching curtain source2/20과 별도 |
| child readiness | 직렬3 child 각각 ready=true/error=null/frames6/backing canvas1036×714 | 동시 중복 실행0; 기존 지도 route/collision/GPU lifecycle 검사 반복0 |
| 오류 / 외부 영향 | pageerror0/consoleError0/httpErrors0/foreignRequests0/mutationRequests0/downloads0; isolatedStorageUnchanged=true | repoWrites0/gitWrites0·사용자save/보상/schema 쓰기0 |
| 핀 보존 | public code5 + 보호원본6 =11개 전후exact; game4050426/ece8 읽기 핀 전후일치 | lab36039 B / SHA256 `8388efcf35e8b9a768750fc54227928232363a32f8113039d4f81a04a90eca93`; game 실행0 |
| 시각 판정 | helper tested desktop own Continue/host 제거/부모 귀환 UI PASS; 전체맵 VISUAL RETOUCH | 원1254 plate 확대 흐림·작은 raster 캐릭터·전체맵 A급未인수. mobile NOT_TESTED. 문서 worker 새 화면관찰0 |
| 본편 미인수 | actualMainGame=false/native6Accepted=false/audioAccepted=false/saveAccepted=false/rewardAccepted=false/actualNextStageCalled0/stageAcknowledged=false | child P/캐릭터 전달0·DEMO1-1 hub PENDING·actual5000/900/gamepad/update0 |
| 실제 증거 | runtime-consumer-browser/acceptance-summary.json·final-receipt.json·map-production-report.txt | runtime-owned-continue-ready.png /runtime-click-scheduled.png /runtime-escape-cancelled.png; 스크린3과 원시결과 별도 보존 |

### MAP PRODUCTION REPORT — §23 / source consumer 문서 동기화

```text
STAGE: ROOT-RIFT-MAIN-SEAM-INTEGRATION-20261007; source consumer 구현 계약 docs6 동기화. 실제 game 인수 대기.
MASTER
- silhouette / regions / main route / side spaces: 원형 맵 계획 그대로; 변경0.
OUTER MASS
- LEFT / RIGHT / TOP / SOUTH / major holes: 원형 지형/마스크/높이 등록 변경0.
LARGE
- source assets / composites / overlap / repeated silhouette: 원PNG/1254 plate/atlas 변경0; 반복 원화 해소 선언0.
MEDIUM
- connections / remaining holes: 원형 접합 유지; 절벽 접합 RETOUCH.
GROUND
- shadow / contamination / structure integration: 기존 접지·재질 소비 유지; 이번 변경0.
PLAYABLE
- main arenas / travel space / breathing space / threat space / combat readability: 일반 caller seam source 구현; 실제 게임(native6) 새 검수0.
LANDMARK
- primary / secondary / tertiary: 원화/배치 변경0.
CAMERA QA
- START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT: 이번 새 화면검수0; 전체맵 기존 RETOUCH 유지.
TECH QA
- route / collision: nav1192·feet·원본 scene 보존; 실제 본편 종주/전투 완료0.
- pageerror / 404 / loading / performance: 신규 runtime fixture DOMQA3/15 PASS; pageerror/console/HTTP/foreign/mutation/download 각각0. 실제 game5000/900·gamepad/update 검수0.
- seam: oldf3a9/133과 finalece8 제한2/20은 다른 핀/범위이며 합산0.
FILES
- stage-owned: 지정된 관련6문서 LF append; 원문 전체 bytes prefix100% 보존.
- concurrent touched / unrelated touched: rootops6·완료worlddocs3·게임/코드/STATE/타인 WIP 변경0.
GIT
- staged / commit / push: worker0; 완료소유 code+docs checkpoint와 remote exactSHA는 root 담당.
- deploy: 0.
VISUAL VERDICT: RETOUCH. 전체맵 원본1254² 확대 흐림·절벽 접합 미해결; source tests의 visual 승격0.
NEXT PASS: DEMO1-1 허브 정책과 실제 현재 parent→명시 Continue→nextStage ACK, native6·audio·durable save Gate 별도 인수.
```
### ROOT-ACTOR-REBUILD-CONSUMER-GUARD-20261007 완료 소비자 / NPC canonical 경계

| 항목 | 현재 코드·검수·계획의 정확한 상태 |
|---|---|
| 완료 source | `tools/2_5d-world-lab.mjs` 39715B / `050f627b712e1e8c83c5d51d010b1e61c177be8f4645fd63fe5220317c8a7dc8`; 이전 36039B/8388efcf 버전은 역사 핀. 원문9접점 역변환 전체 exact |
| 효과 재생성 소비자 | retiring 전 슬롯을 frozen `INERT_EFFECT`로 비활성화하고 기존 `releaseResource`로 오류·중복 cleanup을 집계. epoch/request identity/job owner/slot identity를 callback 뒤 재확인; stale handle는 자기소유만 해제·게시0. generation은 MAX_SAFE_INTEGER에서 포화하지만 새 frozen request identity로 최신요청을 구분 |
| 중첩 요청 | 동기 callback의 재진입을 허용하되 최신 pending 요청1만 기존 frame 시작에서 처리. finally 즉시 재귀0; dispose 시 pending/request 무효화. 초기 생성도 local create→takeInitialized→publish 순서. `createEffects`는 initializationScene을 사용 |
| 진단 계약 | `__rift25Lifecycle.snapshot().effectRebuild` 및 기존 lab snapshot의 frozen `{generation,phase,pending,failures,cueFailures,reasons}`. phase는 idle/cue/retiring/creating/publishing. INERT reason은 rebuild-unavailable; slot reason은 rebuild-pending/factory-failed/slot-replaced. 실패 시 효과 비활성 상태를 리프 UI에 표시 |
| 새 source 검수 | 신규 단일 source VM1 / 11그룹104조건 PASS / FAIL0 / exit0. actual Three와 public producer 사용, lifecycle/RAF/UI ports는 mock. 이번 소스검수로 GUI/GPU/main/native6/save/audio 승격0. source limited-result19801B/`add91a250b887fcd26ba8a85885bc34abf52d3ee71b3ee75f94cf18ea4f5b893` |
| 완료 영수증 | 외부 `actor-rebuild-consumer-guard/final-receipt.json` 8754B / `e2ccde8c49fd9f2f8f23e0f5bb78541b088a473043785965ae3484a15deac2e0`; worker code1+docs3 frozen, root 완료소유 checkpoint 대상. 새 브라우저3범위는 별도 진행중이며 완료0 |
| 불변 producer / 본편 | actor12162B/`a80898889231d8780dbaad13b110c36171be2a93c7b6147c21fc3a3e2010c26b`; game4050426B/ece8c398 및 mainruntime7519B/b93cb86f 유지. actor cleanup은5856578b, 이전 실제 Chrome 준비2FAIL와 GPU후검사2FAIL 및 제한12조건 관측은4b487cde 역사에 보존. old suite 재실행·합산0 |
| owner memory | reentrant 공식 end `b7c855c2-b213-4860-af41-9a433e5aef9a`@2026-10-06T20:37:33.547Z / endraw `d07d61da3a399bd0c03fef32478dcecf892052e2336093acd80328e44b98c001`. reported9 중 유효7 / 무조건 assert(true)2 제외; root 재실행0. 소스구현 신규104조건과 합산0 |
| 미해결 생성 경계 | producer geometry constructor 부분할당 및 `scene.add→all.push` 소유 등록 전 callback 재진입은 이번 소비자 수정으로 해결 증명0. 기존 owner의 독립조사 수집을 이어감 / 전문TASK 중복송신0 |
| 실제 주민 | Haran/Berin/Nessa/Dorik 4명. 이전 요청의 fifth는 UNCONFIRMED_REQUEST_SCOPE / 기존 NPC5확정0. 읽기영수증 `npc-canonical-identity-lookup/read-only-result.json`30058B/`5385815a9ee00a1426fa0261b23b4dece300407a8565ff31c7a9a19de4415c3d` |
| 베린 유품 | offer/o_take→gift.accept / story.berin.keepsake는 기존 대화 참조. canonical 지급 item definition/quantity/durable ledger는 UNDEFINED. grantOnce:true를 quantity1로 추론0; game mkItem의 Date.now+Math.random은 생성 인스턴스ID이며 contentID가 아님. 사용자 유품 종류 질문 pending / 실제 지급 consumer 미구현 |
| 네사 부탁 / 다른 주민 | story/o_accept→quest.accept / story.nessa.findLin·벌레굴 참조는 기존. 등록 questID/Lin entity/구출조건/보상 UNDEFINED. Haran/Dorik 대화·session met flags는 기존, main durable flags 미등록. 보스/여신/다른 플래그 임의전용0 |
| 다음 승인 미완료 | 기존 owner를 통해 producer부분할당·등록 조사 종료수집, 새 실제 Chrome 재생성 검수, 명시 NPC choice→Continuebusy→동일slot inventory+ledger ACK/readback 소비자 진행. canonical 유품 질문에 의존하는 지급 바인딩은 답 전 보류, 독립 제작 지속 |
| 범위·인수 | 맵 geometry/outermass/ground/landmark/DPR/색/opacity/default motion/원PNG·scene·nav 변경0. 전체맵 VISUAL RETOUCH; defaultdemo CH1-1→hub, childP/char, 본편native6·청취·실보상save·A급 미인수. fixture/raw/lab/소스접점을 실제플레이완료로 계산0 |

전체 docs 검색은 `effectRebuild|updateReducedMotion|createEffects|INERT_EFFECT|actor-effect-lifetime|reduced.motion|재생성|cleanupFailures`로164경로853줄 / raw1164941B/`10b2bcd91dac12f1339837cd715a951b8f90b41984306b83b752af1eb9869f7f`, precise19경로223줄과 경로별 disposition을 기록했다. 관련 현재핀·구현상태는 worker3+rootops6+directional/editor/SSOT/dialogue에 동기화하고 과거 원prefix와 EOF LF1을 보존한다. 보호2_3·타인WIP·ownerSTATELOG는 변경0.

MAP PRODUCTION REPORT (§23): MASTER PLAN=기존 지옥의 틈 2.5D 소비자의 효과 수명 보정; LARGE OUTER MASS/MEDIUM CONNECTION/GROUND CONNECTION/PLAYABLE-COMBAT/LANDMARK-CENTER/SMALL DETAIL=지형·원화·배치 변경0, 기존 SSOT/LOCK/guide 유지. CAMERA QA=신규 화면검수 별도 진행중/이번 source 완료판정에는 포함0. TECH QA=신규 source VM11/104 PASS와9접점 역변환 exact; geometry 부분할당은 미해결. ACTUAL PLAY/NATIVE/AUDIO/SAVE=미인수. **VISUAL VERDICT: RETOUCH**.
### ROOT-ACTOR-REBUILD-CONSUMER-BROWSER-20261007 후속 실제 관측 / 실패 이력 보존

코드1+docs14 완료 guard는 `bd0d89e10f0fab7ce843184dab44a951a296346a` normal commit/push·remote exact에 보존했다. world39715B/050f627b…와 actor12162B/a8089888…는 이번 화면 검수 전후 불변이다. 소스 VM11/104와 아래 실제 Chrome 조건은 별도 검수이며 합산하지 않는다.

| 새 실제 관측 | 정확한 인수·제한 |
|---|---|
| 최초 원실행 | Chrome1/context1/parent1/child3, 준비7PASS / raw0PASS·3waittimeoutFAIL·exit1. matches false→true였으나 change event0 / generation0 / old3 / dispose0, consumer 조건0도달. 제품 결함 판정UNKNOWN / 최초 실패·PNG 보존 |
| 승인 후속 | Chrome1/context1/parent1/child3, 신규3scope/15조건 PASS·FAIL0·exit0. 후속 필수setup10관측은 새로운 PASS 수에 포함0. 처음3FAIL을 교체·합산0 |
| native trigger | 실제 updateReducedMotion 리스너 readytrue 등록 확인. same-origin iframe는 parent CDP target 공유; 별도Frame session 미지원 오류 원문 보존. 실제 parent CDP Emulation 설정1회+500ms 순수대기/비폴링으로 browser-generated MQL isTrustedtrue 각child3 관측, synthetic-init fallback0 / OS사용자설정 변경0 |
| 최초 원인 경계 | matches getter polling 제거와 CDP설정 경로를 동시에 바꿨으므로 최초 실패의 단일원인 확정0. 실패를 소비자 결함 또는 특정 관측간섭으로 단정0 |
| retirement 오류 | old warrior dispose 호출 전에 슬롯INERT, actual public producer material throw 뒤 controlledError1/cleanupFailures1. old3 각dispose1, reducedMotion=true 새current3 실소비; generation1/idle/pendingfalse/factoryFailure0/cueFailure0/reasons빈값. 다른 actor 처리 계속 |
| 중첩 반환 | 실제 새 factory 반환 직전 synthetic MQL(isTrustedfalse)1: generation1 creating을 revoke→generation2 pendingtrue. 생성완료 stale handle1은 dispose1/update0, 기존RAF 시작의 pendingflush 정확1회→latest current3 소비. factory recursiondepth1/pendingRAF1. 이 합성 callback을 자연MQL/OS동작으로 승격0 |
| 종료 반환 | 같은factory 반환 직전 synthetic pagehide(isTrustedfalse)1: old3 및 unpublished new 각dispose1 / lateResourceRejected1 / INERT 유지. readyfalse/disposedtrue/epoch1/RAFfalse/pendingfalse, 이후 RAF요청·DOM변경·lateconsume/publish0. native navigation/pagehide 인수로 승격0 |
| actual render | 새 active consumer 상태에서 current program LINKtrue/getError0와 실제 existingRAF/render를 관측. post-unload GL0 조건을 쓰지 않음 / context loss 및 물리GPU메모리 해제 UNKNOWN·미인수 |
| 전체 새 실행수 | 이번 task만 Chrome2/context2/parent2/child6. 과거 child6/runtime3/actor2/CPU7/owner모델11·9/기존DPR 재실행·합산0 |
| 보호 / 오류 | source11핀 전후 exact, pageerror/consoleerror/HTTP404/foreign/mutation/download0, source scene clone 및 격리storage 불변. worker의 repo/docs/Git/save 쓰기0, 게임/서버 실행0 |
| 실제 화면 | `actor-rebuild-consumer-browser/followup/native-retirement-new-current.png`1096541B/`6bb5336279c87451b0812325b23b17706d6ef3afa0250ec6856b9ea013878670`; root가1600×1050 정지화면 직접확인. 다크드루이드 표시·retirement뒤렌더 관측, 배경 확대 흐림은 남음 / 모션영상·전체카메라·A급 인수0 |
| 정확 증거핀 | 최초raw72068B/`9be85d317ff8f5aee14697f61b38853d0765f72b34d58fba65744c63ccb5c1bd`; 후속raw506135B/`cdf3b38de667d402ba2d7b6403e2722cca77420fbbfeeb44b20d2ca759adbeb6`; summary23027B/`bd964b35919458ff01ac74fd0a3b38112359388bcdaba7564ed326b3f3046f2d` |
| 종료 영수증 / §23 | final-receipt6925B/`463398d6a8f55d5059bf612820febafec3f7c102c1b3201246270182c3afb1d7`; map-production-report4518B/`31cb0012ea6a76d9604a1dbfbf7e1dc8e47e406bba0ce7a37efffa61617b000c`, 외부 실제3387 독립fixture / 본편native6·save·audio 미인수 |
| 새 producer memory | 공식end `44504058-6e75-4e38-8bed-a4215bcfcfe1`@2026-10-06T20:45:49.855Z / raw7087B/`c80e2bb464ef4ee531d11ae70766fd8f14b969e780c53ed68d2c2f4edfb0cd9d`. reported7assertions는 실제producer source+fakeTHREE/scene, FIXED 일부모델; root실험0·GPU0·실dispose콜백재진입 증명0 |
| 다음 source 의존성 | read-only-plan21958B/`64bd2d583d9862064567d98e3d9de99d4bcad3aba2f630cf1224827191aca4ea`: geometry 부분할당, material/Mesh/add 실패의 private pending ledger+공통persistent dedup, 성공committed만 all.length/meshes집계가 필요한 미구현 계획. add attach후throw의 remove 실패를 숨기지 않음. update throw가 RAF를 멈추는 별도consumer 오류정책도 미해결 |
| 실제 후속 owner | 2026-10-06T21:01:27.103921Z 관측 CH1-RIFT-ACTOR-EFFECT-ACQUIRE-CALLBACK-UNWIND-20261007-ANIMVFX-MEMORY sent/peer/Read/source1·end0 / 메모리·파일0. Mesh 생성 실패·실dispose콜백 두 새단위만 기존owner 송신. 같은TASK/7assertions 재송신·재실행0. STORY기존큐 미소비, 실제4NPC·유품종류 질문pending / dependent지급만답대기·독립제작지속 |

MAP PRODUCTION REPORT (§23): MASTER/OUTER MASS/LARGE/MEDIUM/GROUND/LANDMARK=기존 silhouette·route·asset·배치·nav·ground 구조 변경0, guide/SSOT/LOCK 유지. PLAYABLE=3387 독립 실제worldlab iframe의 효과교체 소비자3범위만 관측; combat·실게임·보상·장전환·save/native6·audio0. CAMERA QA=새1600×1050 endpoint정지화면 확인 / START→EXIT 전체재생·영상검수0. TECH QA=최초3timeout 이력과후속3scope15조건 PASS를 분리, source11 exact·물리GPU UNKNOWN. FILES=worker 외부 증거만/root 관련docs 동기화, 타인WIP·원PNG/scene/nav·보호2_3·user save 불변. **VISUAL VERDICT: RETOUCH**.

관련 docs disposition은 신규 소스 완료단위의 whole164경로853줄/precise19경로223줄, `npc-canonical-identity-lookup/root-rebuild-docs-disposition.json`23701B/`d197783b7fd4c33868e274f7c502b747fc4f8756748e3ca5d59d8b8a599cb541`와 추가 current worldlab 참조 HELL_RIFT_EDITOR_RESULT를 따른다. 이번14문서의 과거 원prefix를 유지하고 EOF LF1로 새 사실만 동기화한다. 본편 defaultdemo→hub·childP/char·NPC durableACK/readback·실청취/native6/실save·A급 완료 선언0. WOLF 거절 목적 HOLD와 피해UNKNOWN은 기존기록대로 유지한다.
### ROOT-ACTOR-GEOMETRY-CONSTRUCTOR-UNWIND-20261007 완료 접점 / 새 후속 근거

| 항목 | 현재 구현·검수·남은 범위 |
|---|---|
| 현재 public actor | `tools/2_5d/actor-effect-lifetime.mjs`12639B/`6870a20883dd9e858895d0fdb951f5ab34bf3f33043ff63a88c9a381e3b982eb`; 이전12162B/a8089888은 dispose 및 Chrome 검수 당시 역사 핀. source1접점 역변환 전체12162B exact / 외부백업 선행 |
| 생성 실패 회수 | 두 geometry constructor를 local refs dustGeo/attackGeo(null초기값)로 감싸고 throw 시 `unwindGeometryConstruction`으로 반환받은 owned ref만 Set identity중복 없이 각각 dispose 시도. cleanup 실패여도 다음 owned ref 시도·원 thrown value 그대로 전달. cleanup 실패를 성공 회수로 표시0 / 추가오류API·disposed통계 변경0 |
| 불변 생성 arguments | dust RingGeometry(0.55,1,28,1), attack RingGeometry(0.62,1,24,1,-0.9,1.8), 생성 순서 및 normal path 동일. constructor 외 publicAPI/default/depth/spawn/acquire/material/Mesh/place/update/dispose·number성공계약 불변 |
| 새 제한검수 | 단일stdin1 / source6그룹 유의미24조건 PASS / FAIL0 / exit0. normal actualThree·실제geometry dispose event + constructor실패 fake port·actualprivatehelper CPU. 원raw25PASS 중 미연결 disposeCalls assertion1 제외; 첫constructor exact nullthrow·첫constructor1회호출은 유효관측, 미보유ref dispose0를 실제측정으로 주장0. 전체재실행0 |
| 남은 경계 | constructor 내부에서 throw해 반환ref가 없는 allocation은 UNKNOWN. cleanup throw의 실제회수 실패도 해결완료0. material/Mesh/add 실패·acquire재진입·privatependingledger·persistentdedup·frame/update 오류정책은 이번 접점 밖 미해결; public fullproducer 교체완료0 |
| 최종 source 영수증 | `actor-geometry-constructor-unwind/final-receipt.json`11730B/`3d166986f5632c51c8884afce83f01f33bb271533d288db2de1e8165e2acac8c`, workercode1+docs2 frozen / 정상소유checkpoint 대상. newGUI/GPU/main/native6/audio/save 인수0 |
| world / 이전 실제 Chrome | world39715B/`050f627b712e1e8c83c5d51d010b1e61c177be8f4645fd63fe5220317c8a7dc8` 불변. sourceguard code1+docs14는bd0d89e1, 실제Chrome 후속3/15 PASS와최초3timeout이력은5fffc2e6에보존; 그때actor12162핀 검수였으며 새12639 GUI·GPU검수로승격0. nativeMQL trusted3와callback synthetic2 provenance 유지·old실행/CPU47/104 재실행·합산0 |
| 새 owner memory | CH1-RIFT-ACTOR-EFFECT-ACQUIRE-CALLBACK-UNWIND-20261007-ANIMVFX-MEMORY-RESULT 공식end `13ccc735-8e0b-4cdb-a218-0a17e82fbb1b`@2026-10-06T21:03:18.621Z/raw7642B/`e5f631661eb8f339cae217937a46d460b2d5279a91a1da59bc1c2f98b2cc8d96`. 첫stdin은 미존재snapshot.disposed 검사로exit1, 다음은actualproducer+fakeTHREE/scene 실dispose콜백 결함재현11PASS/exit0. 두실행·FIXED모델·root미채택을 구분, 실제브라우저/GPU·수정완료로세지않음 |
| 다음 승인 단위 | 기존owner가 새 terrain변환콜백 중 종료와 effect.update throw→RAF중단 정책2접점을 조사 중. 새공식end/정확핀만 이어수집하고 동일TASK/7·11모델 재송신·재실행0. root 허용 최소실구현은 성공committed수와pending소유를분리하고 disposed후live재게시·rollback중복해제·attach후remove실패를 숨기지 않는 producer/consumer 순서 |
| 콘텐츠 의존성 | 실제Haran/Berin/Nessa/Dorik4/NPC유품종류질문pending은 그대로. dependent지급item·quantity·Lin퀘스트정의/동일slot inventory+ledger ACK/readback 미구현만답대기, 독립수명·맵·에디터제작지속 / STORY큐중복송신0 |

코드 변경 뒤 whole docs 관련keyword검색49경로662줄/raw1406762B/`2889835670b2ae50daed3f019f28d4e9558be304b023a2238d9be24ed408021b`, precise20경로313줄 disposition을 기록했다. 처음 overescaped scene.add 항목은 누락구성요소만1회검색·union dedup했고 최초검색파일을보존했다. worker현재source/docs2와 root 관련현재참조16문서에 새핀·계약·인수상태를 동기화하고 과거fullprefix/EOF LF1을 보존한다. ownerSTATELOG·보호2_3·타인WIP·원PNG/scene/nav·user save 변경0.

MAP PRODUCTION REPORT (§23): MASTER PLAN=actor constructor owned resource unwind; OUTER MASS/LARGE/MEDIUM/GROUND/PLAYABLE/LANDMARK/SMALL DETAIL=기존맵geometry·배치·원화·nav·대화/보상 변경0, guide/SSOT/LOCK 유지. CAMERA QA=이번 새화면/영상0, 이전endpoint화면에서배경확대흐림미해결. TECH QA=source1접점역변환exact/새6그룹 유의미24조건 PASS와raw25의제외1분리; constructor실패CPU/fakeport이고GPU/실게임아님. ACTUAL MAIN/NATIVE6/AUDIO/SAVE=A급 포함 미인수. **VISUAL VERDICT: RETOUCH / 이번 시각 NOT ASSESSED**. WOLF 거절목적 HOLD·피해UNKNOWN과이전모든실패이력은 그대로보존한다.

## 2026-10-07 지형 콜백 종료와 효과 오류 격리의 현행 정본

ROOT-ACTOR-TERRAIN-CALLBACK-CLOSURE-20261007 및 ROOT-ACTOR-UPDATE-FAILURE-CONSUMER-GUARD-20261007의 완료 사실이다. 앞선 12639/39715 source·CPU24/104·Chrome15의 '현재' 설명은 해당 시점 이력이며 아래 핀이 현행이다. 맵 원화·geometry·nav·본편/P/G/세이브·보상·키바인딩·보호2_3/Q전용 magic blackBean·어택티켓 계약은 변경하지 않았다.

| 항목 | 현행 값·구현·검수 경계 |
|---|---|
| public producer | tools/2_5d/actor-effect-lifetime.mjs 12844B / SHA256 660f09d604f4a5f4bcc9ae5e3e1774d2bd52e42744585704706337845c0b0afb. borrowed terrain.worldToScene 직후 disposed이면 p/mesh 접근 전에 place=false, spawn은 visible/live/spawned 재게시0. dust/attack 생성 및 기존 live 순회는 즉시 inactive stats 복사 반환. 원 terrain thrown value·기존 cleanup 오류 의미 보존 |
| public consumer | tools/2_5d-world-lab.mjs 41575B / SHA256 df1760cbf0c1862dc01e591011212aa5a65dcd8d807a49da0441778c5780994e. actor ID/handle/rig/epoch 캡처·snapshot 오류와 update catch 분리, 실패한 동일 slot만 INERT-before-release. 해제 callback 뒤 새 slot/선택/rebuild를 다시 쓰지 않음 |
| 재진입·프레임 | updateOwner가 있으면 살아 있는 정상 pose에서 장식 update만 skip(true), camera/dialogue의 나머지 pose는 유지. dispose가 먼저 owner/epoch를 무효화. pose/render/sample/UI 이후 lifecycle 확인 및 이미 예약된 RAF/document.hidden 확인으로 단일 기존 RAF 유지·종료 뒤 draw/UI/예약0 |
| readonly 진단 | __rift25Lifecycle.snapshot().effectUpdate 및 __rift25Lab.snapshot().effectUpdate = frozen {failures,phase,reasons:frozen copy}. failures는0 시작·caught effect update마다+1·Number.MAX_SAFE_INTEGER 포화. phase=idle/snapshot/updating/retiring, 실패한 현행 slot reason=update-failed, 새 rebuild publish는 해당 reason을 빈문자열로 갱신. 고정 status 리프에 '효과 재생 오류 N' 표시 |
| 소유·미해결 | 아직 다른 slot이 같은 handle을 보유하면 실패 slot에서 release를 보류하고 최종 teardown에 맡김. alias 완전 인수0. material/Mesh/scene.add private pending ledger, 참조 미반환 constructor 내부 할당, rig.snapshot 원오류→readytrue/RAF0 복구는 별도 미해결. Error.message/getter 조회0 |
| 정상 상수 | maxLive24, dust520ms/attack240ms/간격110ms, footBand4320·bands19/39, groundLift0.003, public dust0.14/attack0.17, RGB0x1a140f/0xc8623a·opacity0.5/0.8·reducedMotion=false·depthTest=true 불변. lab 플레이어dust0.022/attack0.08·드루이드dust0.042/attack0.145·depthTest=false 불변 |
| 새 producer source 검수 | 단일 Node 실행9그룹37조건 PASS/FAIL0/exit0. 실제 Three/public producer + 주입 borrowed terrain callback/event의 범위. old24/104/전문13 재실행·합산0 |
| 새 consumer source 검수 | 단일 Node 실행13그룹105조건 PASS/FAIL0/미도달0/exit0. 변경 source18함수/readonly hook·정상 actual Three/public producer. DOM/RAF/renderer/pagehide는 VM fixture이며 Chrome/GPU/native 인수 아님 |
| 새 실제 브라우저 원결과 | 기존3387 격리 parent의 Chrome1/context1/parent1/child5, 원4scope PASS/1scope FAIL·19조건 PASS/1조건 FAIL·exit1 보존. selection scope의 reason==='disposed' 기대실패이며 종료 후 onActorChange가 reason만 바꾸는 실제 source를 관측. activefalse/live0/pool0·해제 event·postwrite0와 같은 뜻으로 취급0 |
| 새 저장자료 제한 평가 | 추가 Chrome/context/child0, 기존 성공19 재평가0. 원 failed 공통1 설명과 미도달4만 after/failureObservation JSON pointer로 좁게 평가하여5지원/UNKNOWN0/exit0. 원 browserFAIL·exit1을 대체하거나5 clean browserPASS로 합산0 |
| 새 실제 화면 | 실제 다크드루이드 이동 y3740→3709.684 및 walk 대표 PNG를 root가 직접 확인. 새 active GL LINKtrue/getError0와 선택변경 뒤 정상 silvertail updates1→2·frames20→21/old16고정 관측. 합성 선택/pagehide는 isTrustedfalse, 실제 물리 GPU 회수·전체카메라·영상·본편native6·청취·보상save 인수0 |
| 공식 memory 입력 | end bb77d9f1-d84b-4851-9e04-cd477b7594c1@2026-10-06T21:10:48.664Z / raw6260B e12cbb9e0c3b4aaee0b28126c654f5ae3ae602cfe6e5f5a9c459c5dded0ad698. reported13은 실제producer7+frame모델6; root source105/37과 합산·실험 반복0 |
| 다음 작업·운영 | 기존 owner의 UPDATE-RETIRE-CALLBACKS 메모리 TASK 송신1은 새 전문 중복지시 없이 공식 end/첫source만 수집. root 소유 producer ledger·rig fatal 진단/회복·선명도·본편 최소 연결은 미완료. 실제4NPC·베린 유품 품목 질문은 해당 지급만대기, STORY 미소비 큐 재송신0. 24시간 제작·주간 사용률 약15 percentage points/day 목표 유지·이 채팅 일일 정확 token 보장0 |

전체 docs 관련 검색은 after-review 27경로538줄/899461B/SHA256 ab9c872435dd23e436143bc6ee613e6689fc13b67a33205ba1d34a8fa87ae4d2이며 모든 경로 disposition을 보존한다. 최초 draft 검색27경로608줄/1059412B/96ada057a39adb91ea8640e3443ca1b50dfb7b072e68790921b67e1d9cc4ac18도 이력 보존. 소유 문서는 원 fullprefix100%·EOF LF1을 보존하며 code2+관련 docs의 정상 commit/push·원격 exact 확인으로 이어진다. 타인 foreign68·owner STATE/LOG4·held WOLF raw 및 이전 승인 거절 목적은 변경하지 않는다.

MAP PRODUCTION REPORT (§23): MASTER=지옥의 틈의 actor cosmetic 수명·프레임 오류 격리. LARGE OUTER MASS→MEDIUM CONNECTION→GROUND CONNECTION→PLAYABLE/COMBAT→LANDMARK/CENTER→SMALL DETAIL=원화·대지·배치·nav·전투 변경0/기존 guide·SSOT·LOCK 유지. CAMERA QA=새 독립3387의 이동·walk endpoint PNG1 직접 확인/전체 여정·영상 미인수. TECH QA=producer9/37, consumer13/105, 원 Chrome19PASS1FAIL/exit1 및 저장자료 좁은5지원 평가를 분리. 실제 물리 GPU·본편native6·audio·durable save 미인수. **VISUAL VERDICT: RETOUCH**. 배경 확대 흐림이 남아 있으며 A급·실플레이 완료로 계산하지 않는다.

외부 증거: /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/actor-terrain-callback-closure/final-receipt.json (9184B/c054acf05392da5e7228751beb6a7078e99cb0de1ca26ca1425682cf47beec18), actor-update-failure-consumer-guard/final-source-receipt.json (9352B/2c9cf0d08802276b243e7a9c31b16ef27d802a61bd9785c881ccaa1a69f2da2e), actor-terrain-frame-browser/ 원실패·제한평가·PNG 및 actor-update-failure-formal-end.json (6871B/7bb543948989cc2f3c6ca3b1d2c65556bde7cdf58daa3762d518fe8036e09ebd). 최초 소비자 draft41558/a811 검토의 paused pose 회귀는 검수 실행 전에41575/df1760으로 보정·백업 보존했고, rig snapshot 원오류 미해결은 숨기지 않는다.

브라우저 exact evidence / final receipt6200B: 88e918fa55e90ac33b26e113d7d1a7d4d1a29a8ee9f43686fc86e104a947a735; summary25866B/dbf709bf5f9d1fb370c5030c9f75e280e6db5a9a787785b43dacfd5c705d7091; §23 report4251B/1160af0c152b54c9b2c15076fbd3cc1137d0f247915dfaed9855299a1a95e532. 실제PNG1093251B/68c096c355ec2c065d5ac9d67f68eb9b71e0a91182bd546b0b484c047d1f1250, 경로 /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/actor-terrain-frame-browser/actual-motion-after-isolated-update-error.png.

### 2026-10-07 ROOT-ACTOR-PENDING-ALLOCATION-LEDGER-20261007 · 현 소비 계약

| 항목 | 현재 구현 / 인수 범위 |
|---|---|
| public source | `tools/2_5d/actor-effect-lifetime.mjs` 14758 B / SHA256 `95b16f5daaf3b64661f59076b0d4fff041ef3d4ca1f760c1df63f98cc78d6e44` |
| 획득 소유권 | material·Mesh 반환 참조는 private pending으로 기록. 성공적으로 등록된 항목만 기존 `all`·`meshes`·최초 `dispose()` 반환 수에 포함한다. pending 개수 공개 0 |
| 종료·부분 실패 | ctor 반환·Mesh setter·scene.add 종료 뒤 disposed guard. 추가 게시·후속 root setter/add 차단; add 진행 중 detach는 반환 뒤 처리하여 dispose 뒤 attach를 누락하지 않음 |
| 회수 중복 | rollback/dispose는 같은 controller의 persistent identity dedup을 공유. borrowed scene/terrain 회수 0. remove 및 owned release 실패를 성공 해제로 계산하지 않으며 재시도 0 |
| 새 snapshot 필드 | frozen `allocationCleanup={detachFailures,releaseFailures}`. 각 primitive 안전정수 0 시작, 해당 실제 예외에 1 증가, `Number.MAX_SAFE_INTEGER`에서 포화 |
| 원 오류·수치 | constructor/add의 원 thrown value(null 포함) 유지. 정상 API·풀/수명/밴드/초기 committed 숫자와 기존 update/terrain guard 보존 |
| 최초 source 검수 | 14628 B / `eff18b04cc80c47ee41f62602b782a44ac213e074fe3e936c2d333eaf3f2dfb3`에서 실제 source·Three와 주입 ctor/borrowed scene 콜백의 단일 Node 16그룹·162조건 PASS. 기존 검사 재실행 0 |
| 읽기 반례와 제한 보정 | root 읽기검토의 Mesh setter→dispose→late scene.add 가능성은 native 실제 관측이 아니다. 해당 경계만 새 source에서 신규 단일 source CPU 4그룹·74조건 PASS / FAIL0·미도달0 / exit0, 원162 재실행0; 최초162와 합산·핀 이동·원 실패 교체 0 |
| 한계 | 참조 미반환 ctor 내부 할당 UNKNOWN. 임의 ctor identity alias·dependency 자체 외부 late write 일반 보장 0. 실패 remove의 실제 attached 상태·release event 0은 회수 성공이 아니다. GUI·GPU·본편/native6·청취·실save 새 인수 0 |

원 source12844/660f와 종료 소비자41575/df1760는 각각 보존 이력이다. 이번 변경은 효과 자원 획득·회수 계약이며 맵 PNG/scene/nav·geometry 배치·카메라·전투·Q 전용·보호2_3 변경 0. §23: 작업=효과 allocation consumer, MASTER/지형/플레이/랜드마크/세부/카메라 새 제작=0, TECH=신규 단일 source CPU 4그룹·74조건 PASS / FAIL0·미도달0 / exit0, 원162 재실행0 및 이전16/162를 별도 기록, 신규 VISUAL NOT ASSESSED / 기존 전체 RETOUCH. 같은 검사·TASK·이력 재실행 0.

다음 미완료: 맵 흐림·절벽 접합 시각 품질, rig.snapshot/render fatal frame 복구, NPC 유품·부탁의 본편 durable 소비자, 실제 native6·청취·보상 save. 최신 운영 근거는 PROJECT_MANAGEMENT_MASTER와 연속 dispatch 정본을 따른다.

### 2026-10-07 ROOT-RIFT-PLATE-SHARPNESS-AB-20261007 · 현재 비교 consumer와 실화면 인수

| 항목 | 현재 구현 / 검수 범위 |
|---|---|
| ground source | `tools/2_5d/rift-ground-detail.mjs` 21249 B / `830eef30ee9bc9e74219d12fa954300796a5b2ee53ce961bc3544affdfb8837e` |
| terrain source | `tools/2_5d/rift-terrain.mjs` 16816 B / `c7079fdbc32f4d19cc9ee89e6dc67ae81d6cb92d7d28e7169d29829ed45d44a0` |
| lab source | `tools/2_5d-world-lab.mjs` 42125 B / `4c5cdb71a0bd4330c3afb6d75440b41f6f33f42989360af31a517999ec1be101`; HTML 12266 B / `e2f0f1692df08f67bc2e6dc42f8e692a53ca060e33833813c8f58492adb8089c` |
| 비교 UI / API | `plate-sharpness` select 0 / 0.5 / 1, 기본0/OFF. leaf `plate-sharpness-status`. 새 factory옵션 `plateSharpness=0, renderer=null`(borrowed), ground/terrain `setPlateSharpness(number)`; 유한 number0..1 검사. `__rift25Lab.snapshot().terrain.groundDetail.plateSharpness`의 requestedStrength/effectiveStrength 구분 |
| 처리 범위 | 등록된1254×1254 원 plate의 ground RGB 확대만 Catmull-Rom 16 taps와 중앙2×2 채널별 min/max clamp. UV texel-centre clamp. 기존sample의alpha·multiply 보존. gamma 변환 추가0·원PNG/scene/nav/geometry/camera/rig/save 변경0 |
| 활성 조건 / fallback | 실제같은borrowed renderer·pinned Three160 map chunk·등록plate·WebGL2 또는 엄격WebGL1 OES_standard_derivatives. 양축 derivative footprint >0 및 ≤1 조건에서만 확대RGB 재구성. unknown/mismatch/minifying는 원plate. ground-detail OFF 또는 dispose 뒤 effective0. compiled는hook 계약이며 LINK 인수와 별개 |
| 샘플 비용 | 활성확대 plate 원1+추가RGB16=17 fetch(기존대비+16). 기존ground nominal4→20, 조건별분기·GPU실측아님. 읽기계획의+15는 미채택 제안 이력. 추가 texture/geometry/renderer/RAF/timer0 |
| source Gate | 동결code4의 신규 Node1회 11그룹153조건 PASS / FAIL0·미도달0·exit0. actualThree160/actualfactory·shaderhook와 GLSL CPU계산; image decode/canvas/renderer capabilities는fixture·GPU0. 이전suite 재실행·합산0 |
| 실Chrome Gate | 같은4source핀 신규 Chrome1/context1/labpage1/child0. 6그룹13조건 PASS / FAIL0·미도달0·exit0, 재실행0. paused160%/DPR1/전사(5480,3740)/detailON 동일조건에서 실제select handler→uniform 0→0.5→1→0. source4+보호8 exact·scene/storage 불변. selectOption change는isTrustedfalse |
| 실제 픽셀 | 0.5 RGB600148px / 1 RGB745063px 변화, 합성최종framebuffer alpha차이 각각0. OFF복귀 RGBA 및PNG exact. 이 alpha는 중간 원plate 투명shader alpha의 독립 검증이 아니다 |
| 실제 LINK / 비용 관측 | 13program LINK true·GL0·404/오류/foreign0. 각조건 warmup8+renderer.render wall60표본 median 0/0.5/1/복귀 = 0.5/0.6/0.5/0.6ms, calls11/triangles2456 동일. GPU시간·17fetch 비용실측·실물성능 보장이 아니다 |
| 시각 판정 / 적용 | root와GUI담당이 원본/강함PNG 직접 관찰. 바닥 결·윤곽 소폭 강화, 절벽·뿌리 저해상도 흐림은 여전히 큼. 전체 VISUAL VERDICT: RETOUCH. 비교기능만 적용, 기본0/OFF 유지·새디테일복원/A급완성/맵선명도완성PASS0 |
| 정확 근거 | implementation/final-receipt16070B/c2bdd2f21f4315a4eb5398e300095f8ebca4fb594167fa2e19d8b72435bdcc8a. browser/final-receipt9199B/b800f617a39c8f800a0a4c280a760213c943ea5374e02c5323de186f35962a31. source153과GUI13 합산0. readonlyreview7443B/c3f39c3320b37c7e50097383219b1193df552519dc97f09420a6d8ec0404ac4e는같은4핀초안읽기, 테스트아님 |

§23 MAP PRODUCTION REPORT: 작업=등록지면RGB 확대비교; 선행=fullguide·SSOT_INDEX·stageLOCK와exact읽기계획37853/a6df. MASTER PLAN→LARGE OUTER MASS→MEDIUM CONNECTION→GROUND CONNECTION→PLAYABLE/COMBAT→LANDMARK/CENTER→SMALL DETAIL은 기존등록공간보존/새geometry·배치0. CAMERA QA=동일paused160%/DPR1 새Chrome A/B·복귀·전사동작재개. TECH QA=source11/153와GUI6/13 별도핀·source12 exact·LINK13/GL0. VISUAL VERDICT: RETOUCH. PNG4와controls1은 외부 `plate-sharpness-ab-browser/`에 보존. 본편/native6·청취·실보상save·GPU물리메모리·실물모니터·독립platealpha 미인수.

현재shader 비교기능의기본OFF와전경/절벽흐림 RETOUCH를유지한다. 다음작업은실editor mask1024중간축소·feather/cache 및fatalframe 소비접점, NPCdurablebinding·본편native6/청취/save이며 정본PROJECT_MANAGEMENT_MASTER의 최신운영근거를따른다.
### 2026-10-07 ROOT-EDITOR-MASK-SOURCE-NATIVE-AB-20261007 · 선택 원본 마스크 비교와 실제 Canvas 검수

| 항목 | 현재 구현 / 정확한 인수 경계 |
|---|---|
| source | `tools/map-scene-editor.js` 82229 B / `4c037c1cd732ecb6001365ef46352abe47dbfaa2bd8fec4458024fe0adc633fd` |
| 기본 / 적용 대상 | `scene-mask-resolution` select legacy/native, 기본legacy. 선택한 feather 또는 sourceParallax composed-mask 객체1개만 native opt-in. leaf `scene-mask-resolution-status`; `EXODUSER_SCENE_EDITOR.maskResolution()` read-only 관측 |
| 버퍼 / 경계 | legacy는 기존 최대축1024 중간 버퍼(작은crop는 확대될 수 있음), native는 기존8192 image-admission 범위 안의 원본 crop `ceil(w/h)`. crop/월드aspect/월드feather·256 feather샘플/CTM/opacity 보존. 새8192 cap 정책 추가0 |
| 실제 대상 | 등록 심연 `obj-rift-depth` source1920×1920 / fullcrop / world8000×8000 / feather120 / sourceParallax0.965: legacy1024²→native1920². roots/horn3은 직접clip 경로여서 이 composed-mask 비교 적용·개선 주장0 |
| 선택 / 캐시 | 기존 최대8 insertion-order 캐시 유지, 옵션·선택 전환 시 이전native만 해제하여 retained native≤1. 원본PNG/scene/nav/배치 변경0. native retainedRGBA 계산값과 실제물리메모리·GC·GPU회수 구분 |
| 내보내기 / 저장 | unselected·직접clip·PNG export는 기존legacy 처리. 원화1920 이상 새로운 세부 생성0. 실제동일scene/localStorage 불변; 본편 save·보상 저장 인수0 |
| source CPU 이력 | 최초82218 B / bd89e5da3bdbdcca2d835607b1e885fed1cbb9224d10e6e3edffd395fd1f3ac6에서 신규Node1회10그룹129조건 PASS / FAIL0·미도달0·exit0. DOM/Image/Canvas ports fixture, 실제Canvas RGB/GPU0. 최종82229는 옵션문구1개 정정뿐이며 전체inverse exact; CPU129 재실행·최종핀 이동0 |
| 첫 실제 Chrome | 최종82229/4c037 실제JS response exact. Chrome1/context1/editorpage1. 그룹1·2 PASS, 그룹3의복귀RGBA FAIL(도달5조건중4PASS/1FAIL), 그룹3잔여·4~6 미도달·exit1. RGB912418px/max11 차이, alpha차0. legacy mask/image alpha histogram·feather256 hash·crop/destination/CTM/opacity exact. 최초실패 보존·원인확정0 |
| 한정 후속 | 실패3·미도달4~6만 새Chrome1/context1/page1, 4그룹6조건 PASS / FAIL0·미도달0·exit0. 비교 전4회 main readback+실제UI redraw warmup은준비관측/PASS집계0. sentinel 최초→2번째 변경, 2~4번째 exact. Chromium backend 전환은 가설/미관측 |
| 후속 실제 픽셀 | 안정화된 같은view4100/4100/zoom0.864/selection에서 legacy→native→legacy RGBA와PNG exact복귀. native RGB678172px/max13 변화·합성최종alpha차0. 최초미안정복귀FAIL을 지우거나 전체6cleanPASS로 합산0 |
| 실제 cache 관측 | native선택1/retainedRGBA29491200 B → plainhorn선택native0/abysslegacy1024/8388608 B → abyss재선택native1. 실제1객체 관측, 설정8 eviction/2 composed객체/GPU메모리 인수0 |
| 보호 / 시각 | source14정확핀·scene/storage{} exact, 오류·404·foreign0. root/GUI담당 원본·native PNG 직접관찰: 심연 미세세부차이 약함, 확대된 절벽·전경의 전체흐림 지속. VISUAL VERDICT: RETOUCH, 기본legacy 유지·A급/본편/native6/청취/실보상save 인수0 |
| 영수증 | worker final34835 B / 92b8d3f1949f982df007104cd17dcb57747e66926e1caa985b45bc3bc0d808dc. 첫 실패분석4034 B / b54582d8aa3653db3b7cdb38d572639c1e26ee9b593a615a951050abd4883e54. GUI final 7806 B / e8b9454e0c6f1f361654e3592ac1e7e8a6041f723beef78c61c43dc2772a8adb; 첫검사와한정후속 별도핀/합산0. |

§23 MAP PRODUCTION REPORT: 작업=기존선택composed-mask의legacy/native 중간해상도 비교; fullguide·SSOT_INDEX·stageLOCK 선행정확근거를재사용. MASTER PLAN→LARGE OUTER MASS→MEDIUM CONNECTION→GROUND CONNECTION→PLAYABLE/COMBAT→LANDMARK/CENTER→SMALL DETAIL은등록원화·geometry·nav·배치를보존/새제작0. CAMERA QA=같은view/zoom/selection Canvas A/B와첫복귀FAIL·관측안정화후한정복귀인수분리. TECH QA=sourceCPU10/129 이력핀·최종문구inverse, 실제첫FAIL 및한정후속4/6, 실제native선택해제·legacy export·source14정확. VISUAL VERDICT: RETOUCH. 첫/후속PNG와원자료는외부 `editor-mask-source-native-browser/`에보존. 전체맵선명도완성·main/native6·청취·GPU물리회수·실save 미인수.

선택된composed-mask의기본legacy와실제첫복귀FAIL/관측안정화한정후속을분리하여유지한다. 원화·전경·절벽확대흐림은전체RETOUCH이며본편/native6·청취/save미인수. 다음fatalframe 소비접점과최신운영근거는PROJECT_MANAGEMENT_MASTER를따른다.

### 2026-10-07 ROOT-RIFT-FRAME-FATAL-CONSUMER-20261007 · 필수 snapshot/render 실패의 현재 owner 중단

| 항목 | 현재 consumer / 정확한 검수 범위 |
|---|---|
| source | `tools/2_5d-world-lab.mjs` 45509 B / `3c5faddc2c0dc32b3e0feef3cce9550ec4a4aeb3b99be8bf61a044d69b8ac8ad` |
| 최소 접점 | 공통 `readRigSnapshot(id,rig,owner=null)`: effect update·paused updateUi·select의 실제 rig.snapshot 호출. 공통 render의 실제renderer.render. init/provider 전체예외·game.html 본편의일괄예외처리 변경0 |
| current fence | snapshot 전 id/rig/lifecycleEpoch·선택슬롯·optional effectUpdateOwner 참조, render 전 renderer/scene/camera/lifecycleEpoch 참조를캡처. 호출전후 current재확인. disposed/contextLost/epoch·identity/선택변경이 먼저이면 stale primitive관측만하고현재자원·UI·ready를덮지않음. 실제같은id re-init기능 추가/확인0 |
| 중단 / 우선순위 | 현재 실패만 최초private thrown reference+presence를기록(undefined/null도보존); ready=false/error고정/raf0/lastTime=null/heldclear·attackQueued=false·previewMode=null·anchorJob=null·rebuildrequest/pending/owner·updateowner해제를plainstate로먼저commit. previewentry무효화. 기존resume/rebuild/current guard로재시작0 |
| 고정 오류 | `FRAME_FATAL_ERROR='캐릭터 또는 화면 표시 오류로 시험을 중단했습니다. 페이지를 다시 열어 주세요.'`. raw `error.message`/String/getter/coercion 읽기0, 외부throw를기존fail(error) formatter에전달0. DOM leaf만보고·부모내용교체0, control.disabled/기존loading표시 |
| 진단 | `__rift25Lifecycle.snapshot().frameFatal` frozen primitive: failed/hasCause/phase(`rig-snapshot` 또는 `render`)/actorId/epoch/staleFailures/reportFailures/heldKeyCount/attackQueued/previewMode/anchorPending/rebuildPending/rebuildOwnerActive/updateOwnerActive. stale/report count는기존Number.MAX_SAFE_INTEGER까지saturate. rawcause/rig/renderer/ownerhandle 공개0 |
| 보고 재진입 | DOM/cancelRAF 보고 전후disposed·epoch·고정error current경계를확인하고개별보고실패는reportFailures로보존. 원thrown identity/phase와failclosed 상태를덮지않음. render성공/현재일때만frames++ |
| 자원 수명 / 미도입 | fatal은sticky STOPPED 상태이며즉시resource release정책0. 기존pagehide/dispose가단일full teardown owner, WeakSet attempt-before-release·독립정리실패계수계약유지. 재시도3/한프레임bridge/lastSnapshot cache/새필드schema검증/새RAF·timer·factory0 |
| source Gate | 최종45509/3c5f의신규Node1회 actual-source VM8그룹41조건 PASS / FAIL0·미도달0·준비오류0·exit0. 실제sourcefunction/span과actualThree/publicproducer정상경로, DOM/RAF/rig/renderer는통제ports. fullbrowser/WebGL GPU검사아님. oldmemory7/9·effect37/105·oldChrome 재실행·합산0 |
| source 경계 | active snapshot·pausedUI/select·frame/directrender·pagehide승리·selected/slot변경·undefined/null/hostileformatter·후속독립dispose/report실패·safe진단/restart 차단을호출한 CPU근거. 모든provider/driver예외를처리했다고확대0. 공개 `__rift25Lab.snapshot` 원형불변: 실패후안전검수는Lifecycle진단사용 |
| 실제 Chrome | 실제 최종world HTTP source45509/3c5f exact, originalrig/Three query provider를호출한후통제된snapshot/render fixture throw(자발적provider/GPU driver오류가아님). 최초Chrome1/context1/parentQAfixture1/순차actuallabchild3: frame rig.snapshot·frame renderer.render 2그룹12조건PASS, paused-select그룹TIMEOUT FAIL/exit1·6조건미도달. actualfixedleafUI/RAF0·입력/jobs해제·rawformatter getters0·trusted nativepagehide·rig3/renderer1 및riggeometry3/material3 dispose호출관측, 물리GPU해제보장아님. 세번째는trustedpause click/ArrowDown에도change0/fixtureThrows0/전사·readytrue/정상pausedRAF여서제품실패경계未도달. 세번째준비만새Chrome1/context1/parent1/child1 한정후속 ArrowDown+Enter: 다시native-selectcommit TIMEOUT/exit1,0PASS/1FAIL·조건0도달·6미도달,fixtureThrows0/readytrue·전사유지. 추가Chrome0·선택consumer GUI UNKNOWN, pausedRAF updateUi GUI UNKNOWN(CPUactualsource근거별도). 총Chrome/context/parent2씩·child4, 원첫2PASS/1FAIL과후속0PASS/1FAIL을합산·성공12/CPU41재실행0. actualsource12정확/원scene/storage·pageerror/404/foreign0. 최초raw341391B/8f71a4438b002d119e2b3287cac4196449ecdac5d6c86347cfc94d754d29df4f, 후속raw74934B/fccc3a0d5d28b6c16ed4345a8520d8612186ee9bb16345995c030f5ebc1c9769 동결 |
| 정확 근거 | worker final21520 B / 826615d9ca926e3725aec10b390369f7b43ea6e2a436c7bc0fe20255afea4bf3; readonly계획13398 B / 849c28b3fe23e799c03fdde9d1765a70d9c94d1407c65f8ccb4ba62d9578da69는실행0 이력. 새actualChrome final9747 B / 9c8f87a7b94b228073c0a98d8bafc44ed580b4b40131bd3ad193d70909735dfa; summary24217/dcbaf2bdf44bdf6c276692bd37cf46b5881491e853a596e7fb37cab28402bd13; §23 report3886/cebec413b296fce7c5b10d38ab580b48c10d4cf4cbb27a60b969c797fd0d3edb |

§23 MAP PRODUCTION REPORT: 작업=기존world의필수snapshot/render TECH QA 실패consumer; fullguide/SSOT_INDEX/stageLOCK의기존정확읽기근거재사용. MASTER→OUTER→MEDIUM→GROUND→PLAYABLE→LANDMARK→DETAIL은원PNG/scene/nav/geometry/발접지/배치/카메라보존·새맵제작0. CAMERA QA=새오류UI에대한실제lab실패주입범위분리. TECH QA=최종source8/41 및새Chrome별도핀; stickySTOPPED→nativepagehide teardown 관측, 물리GPU해제아님. VISUAL VERDICT: RETOUCH(기존전체맵), 오류UI검수는맵선명도/A급완성의인수가아님. 본편/native6·청취·실보상save·allproviderfault 미인수.

#### 원총괄 현재 운영·새 전문 메모리 원자료 (후보 미채택)

| 단위 | 정확 공식 완료·검수 범위 |
|---|---|
| root 현재 보존 | ROOT-RIFT-FRAME-FATAL-CONSUMER-20261007의 완료 code1+관련정본docs21만 정상 checkpoint 대상. 직전 HEAD/remote exact c6f295858c656cf729fb77f1417ad039ed280dee. 타인68·owner STATE/LOG4·WOLF HOLD1은 별도 유지/index 포함0. 현재 code45509/3c5f, worker21520/8266와 GUI9747/9c8f의 신규 근거만 동기화. 실제 push 및 원격 SHA는 해당 단위 외부 remote-preservation-receipt.json으로 사후 확인하며 이 문서의 과거 HEAD를 현재 HEAD로 치환하지 않음 |
| 전체 docs 검색·분류 | 신규코드후 rg docs 전체40경로358행. 현재 source 계약 관련 정본21개 동기화; 나머지19개는 owner 로그의 과거 결과, 변경하지 않은 게임/안개/영상/다른 rig-lab 오류 처리·키바인딩·맵geometry·오디오 계약을 원형 유지. 전체 경로별 disposition/백업/prefix/EOF/GFM은 root-current-docs-sync-receipt.json. 보호2_3/타인 WIP 변경0 |
| MAP project preview | CH1-RIFT-EDITOR-PROJECT-PREVIEW-ISOLATION-20261007-MAP-MEMORY 공식end32bf873e-4619-4c7d-b1fb-145c1d260569@2026-10-06T22:23:15.264Z, raw6838/9b40293abd8b46d29bec6646003a451dd91a7114e33603fb7072a1039ccec9bd; 외부 보존11565/29ad9712a5cd9745fefe9dc1504208c6c48973adb21e4d4dbea36e6d30b7de42. 현재 editor 표시 flags의 project 유출은 확인되지 않음; 임의필드 clone passthrough 가정과 실제 저장 배선은 별개. guide의 이전 선행 순서 FAIL은 소급 PASS0 |
| ANIM material 원자료 | CH1-RIFT-CHARACTER-MATERIAL-VFX-READABILITY-20261007-ANIMVFX-MEMORY 공식endc03dbdfe-a638-4b6c-b9a9-2f2c9d7fb15d@2026-10-06T22:21:43.874Z, raw7179/ab117eba5e7198db0ec8f7b1c29c48af93b729a9fa500bbee1211c8ff4b29c45; 보존18360/c2d5050df822989fa3b3ff01096077ff416ca3699e574c75492b2f33cd64a9da. 최초 산술stdin은 assert1PASS 뒤 잘못된 예상34.675/실제34.275로 FAIL·후속미도달/exit1, 수정 재실행0. 실제 픽셀/실루엣 인수0 |
| root 재질 실제 context 읽기 | read-only-result10580/42c5e21a02de576b8414e9a192a02f6c6d4ca191ceaf1557230f05a4f5676153, 실행·GUI0. Three r160의 opaque→transmissive→transparent 및 리스트 내부 renderOrder 계약은 맞음. 그러나 실제 world consumer는 rig.material.transparent=true/depthTest=false/depthWrite=false로 덮고 effect도transparent=true이므로 base rig factory의 opaque 계약만으로 world를 판정하면 안 됨. 실제 world에서는 동일groupOrder의 effect19/39와actor25.6–34.6 비교가 투명 리스트 내부 source 계약에 해당. 실제 GPU 가림/선명도/새 alphaTest·filter·depth 정책 채택0 |
| MAP restore token 새 원자료 | CH1-RIFT-PREVIEW-RESTORE-ACTUAL-TOKEN-UNWIND-20261007-MAP-MEMORY 공식end97d3c06d-f4a8-404c-bfd6-e0c5e30ce5e7@2026-10-06T22:38:43.522Z, raw5403/8bc123de504a09b58491178968dc1899e1b8b9647e4c4edd8af3160249bcb22d; 보존6429/5da44fcac1d66140268ffed47eda55167f5786fa9b68f6efed9ad989a53b0b54. 실제 entry 함수+fake 기록 port를 구동해 old handle restore/dispose·new handle 미호출, restore throw 후 dispose/Promise rejection observer/once를 관측했다는 메모리결과. 이것은 실제 iframe pose의 cross-token 격리 인수가 아님. release가 호출하는 handle 자체와 port가 구현하는 실제 token 격리를 구분. 실제 editor import cancel 배선/iframe pose/async side effect UNKNOWN, 새 cleanup e.message 제안·async 정책 미채택 |
| ANIM pass-depth 새 원자료 | CH1-RIFT-VFX-RENDER-PASS-DEPTH-CONTRACT-20261007-ANIMVFX-MEMORY 공식end33d949d7-96fa-4f91-bf7e-212e25089842@2026-10-06T22:38:02.931Z, raw6485/f58fed970783bc7d4a22a4341714be88852662f5dea5663bb8060dfa613fe8f7; 보존7499/451ae2be85d8da8de1a81d14bc77e2a297bd39f09658d3d0467bca5ccd56d7eb. 새로운 Three source Read/실행0. base opaque만 적용해 actualworld도opaque라고 한 결론은 root 관측된 world override와 충돌하므로 채택0. LinearFilter와 opaque alphaTest만으로 반투명 blend fringe를 단정하지 않음; actualworld의 transparent override는 별도. depthTest:true 옵션은 consumer의 depthWrite=false·렌더순서까지 포함한 새 실제 검수 없이 채택0 |
| 기존 owner 후속 | Claude8 최신 turn134: ANIM 모션 위상/UV 신규TASK1·peer1·실제source1/end0, MAP 후속은 전문 완료문의 인간승인 질문으로 보류. root는 기존 사용자 직접 팀운영 승인에 비춰 이 보류만 복구 피드백1회; 실제 외부manifest 도구거절/삭제·피해UNKNOWN/cleanup0 경계는 그대로. 전문 중복·새팀·새실행세션0. 실제 계속 여부는 새 owner 송신/peer/source/end 근거로만 확인 |
| 다음 독립 root 접점 | 본편 root P/character와 child 최초 actor 선택의 연결을 별도 exact-source 읽기 중. 기존 epoch/save/Continue 검사는 재실행0. P/HP/inventory 전체전달·본편 native 인수를 이 계획으로 선언0. NPC 유품 실제 contentID/수량·부탁 questID/구조대상은 기존 미확정 유지 |
| 운영/인수 경계 | 연속 제작 유지/다른paused자동화·아침메일재개0. 사용률 목표 약15 account weekly percentage points/day, 공유 관측·일별token 미제공이므로 이 채팅의 정확 하루소비 보장0/토큰태우기0. 본편native6·청취·실save·A급완성0. 원화1254→8000확대 흐림/legacy1024mask는 미해결·VISUAL RETOUCH. WOLF 거절 뒤 같은 산출물 corrected-path write 이력·피해UNKNOWN 유지, 해당 후보 추가읽기·실행·검수·채택·Git0 |

### 2026-10-07 ROOT-RIFT-MAIN-CHARACTER-SEED-20261007 · 부모 선택과 최초 2.5D 표시 연결

이 절은 초기 캐릭터 표시 연결의 최신 source 계약이다. 이전 핀의 child 캐릭터 전달0/host17683·world45509는 당시 이력으로 보존한다. 본편 root 진단의 미인수 상수와 public host의 초기 표시 ACK는 서로 다른 범위다.

| 항목 | 현재 구현·정확한 범위 |
|---|---|
| host source | tools/2_5d/main-rift-host.mjs 18931 B / a242f619d0a6f1bf3e8809a8f059e0979606b4356addd6f9b1e12c73cbc4f967 |
| child source | tools/2_5d-world-lab.mjs 46833 B / fbab9b30265a0b211220e0e03775249bee8385fdae26c5c30bfe691409bcb5cb |
| 실제 누락 접점 | 기존 game의 _charIdx0/1→warrior/silvertail 및 runtime readHostContext→host는 존재. 이전 host 고정 iframe URL·child 초기 select(warrior) 때문에 silvertail도 전사로 표시. 실제 현재 사용자의 live class 관측을 이 source 반례로 대신하지 않음 |
| 호스트 허용값 | contextSnapshot.character는 정확 primitive 문자열 warrior 또는 silvertail. MAIN_RIFT_HOST.characterSeedKey='main-character', characterLinkScope='initial-display-only', fullPlayerLinked=false. unknown/empty/main dark-druid는 admission 실패 |
| per-entry URL | 캡처한 context.character만 새 URL.searchParams.set('main-character',character)로 넣고 expectedCharacter/entryURL/characterAck=false를 해당 record에 보관. onLoad와poll이 동일origin·lab pathname·정확 record.entryURL href를 검사. parent P/UUID/HP/inventory/flags/좌표/facing의 query·payload 직렬화0 |
| child 초기 준비 | readInitialCharacterSeed(window.location.search)→main-character 없음이면 standalone/editor 기본warrior. present는 getAll 결과 정확1개+허용두ID만 통과, empty/duplicate/unsupported는 고정 내부오류로중단. renderer 생성 전에검사. prepareInitialCharacterDisplay가 state.selected·dropdown.value·rig visible·helper hidden·CHARACTER_RIG_CATALOG 한글명을 first ready/reset/render 전에동기화 |
| 초기 ACK | initialCharacter는 private 초기ID, initialCharacterReady는 reset/select 이후 ready·error없음·disposed아님·선택일치에따른boolean. __rift25Lab.snapshot의 own-data primitive initialCharacter/initialCharacterReady/selected를 host가 loading때읽고 ready=true일때 expectedCharacter와정확일치해야characterAck=true/active/handle을resolve. child snapshot accessor/proxy/throw는 고정 'UNKNOWN · 지옥의 틈 초기 표시 ACK 읽기 실패'로 치환·외부message/String 읽기0 |
| 재진입·변경 경계 | ACK read 이후 current record·sameContext 재확인; stale/cancelled entry가 새 entry를active로 만들지 않음. active 이후 새manual비교를강제원복0; standalone dark-druid 수동비교는기존경로. 초기ACK는계속 player 상태를동기화한다는뜻이아님 |
| 진단 범위 구분 | host.snapshot().childCharacterLinked는 current.characterAck===true만. MAIN_RIFT_HOST.fullPlayerLinked=false 유지. window.__riftMainIntegration.snapshot()의 childCharacterLinked:false/durableSaveAccepted:false/demoHubAccepted:false 등 game 자체미인수진단은실제game코드불변이므로그대로이며 host 초기표시true로대체0 |
| 그대로인 소비자 | game.html4050426/ece8c398068903caf666979b33c3e0f541043db1e58f98a65d7c68e427f74230와 main-rift-runtime.mjs7519/b93cb86f7857bd4242af8b9cc9478cceea591d03aad872bca76a5af06b471b69 byte불변. Continue/epoch/save/lease/guardedAdvance·기존5000ms/900ms·host30000ms/100ms 정책변경·재검사0. spawn5480/3740·geometry/nav/PNG/카메라·렌더기본값·발접지변경0 |
| source 최초 Gate | actual importedhost+actual child unchangedfunction/startup/API span을 VM에서호출, actualThree/catalog+통제DOM/RAF/rig/renderer/iframe/P/G ports. 최초8그룹 중4완료·29조건도달(28PASS/1FAIL)·4그룹잔여미도달/exit1. fixture의 INTERACTION_CUE_PROVENANCE/SLICE_ACCEPTANCE_PROVENANCE/SCENE_REGISTRATION_PROVENANCE 3누락→actualsnapshot참조예외→host실패/정상timer1기대FAIL. 제품결함확인0·원FAIL동결 |
| source 한정후속 | root승인으로외부fixture의실제누락imports3만공급. 이미PASS한조건재단언0/제품2코드핀변경0. 미도달 ACK·hostactive·P identity 두class각3조건+standalone/manual3+정상timer1만 새4그룹10조건PASS/FAIL0·미도달0·준비오류0/exit0. 원FAIL과합산/전체clean suite PASS선언0·old검사0 |
| source 정확근거 | worker final21003/686b31461510bf0c6cbc0f191ded0d9c32fe6118f433acd1f5376ce3449b79f8; 최초raw7624/6acc16e83e9a876f334de74077a909d873ddf105b5e183edc5ee8a6125783379; 판정1083/6107533374c9675ec4aae266fe7842a8686c7bd23813dccbde968fef7f95daa8; 한정raw3512/a62bee6ed7148a8908b8dbf7c2680362c37c8e6f4ebeda0f76b990e20bcdf9d9. source2 역변환 exact·소유doc원prefix159478·EOF1/GFM3표 |
| 새 actual Chrome | 신규 actualChrome1/context1/parent1에서 host child2를전사→실버테일순차실행(max동시1). 새2그룹12조건PASS/FAIL0/미도달0/exit0, 추가실행0. 첫원본render ordinal1과ACK전전사6draw·실버테일7draw 모두해당rig/이름/dropdown일치. host own-data ACK3/childCharacterLinked=true(initial-display-only), runtime top-level false는그대로. 각GL13program LINKtrue/getError0/contextLostfalse/canvas1036×714; source-owned timer1→close0/finaldispose0, 전체native timerqueueUNKNOWN. source17exact/P·G detachedfixture·storage{}불변/오류·404·외부·변경요청0. root·helper PNG2직접확인: 초기표시UI PASS/전체맵RETOUCH. final9034/3fa1faad6b5dda2c3ec8609f6e2d3397bbda76d908676717fe9d67bf8525546c; summary22474/41fd6c7a8d284404bff1f51fa24611d3fbd96871b1a1108df2ca9fc901ee739a; raw388349/58988832f471a8c4f5567054fc3d0b4f1428312cf59ff0892517d5daf8b743ac; 전사PNG859610/41cd4c7bdca71d80b5681de872d71933404b992745a1986c26b228fc485e16cb·실버테일PNG861337/d87d4917a92cbfc7a977798d1beeb902d6c59a386179e81c27a5201682acd995. actualgame.html/native6/fullplayer/save/audio/physicalscanout인수0·oldGUI/CPU합산0 |
| 추가 새 실제 rig 소비자 검수 | 실제character-rigs factory3(전사2독립/실버테일1)→update72호출→private setFrame/nativeThree UV matrix/geometry attributes·weightChecks 소비를신규Node1에서검수: 새7그룹93조건PASS/FAIL0/미도달0/exit0. attack frame8/phase1뒤idle·독립소유자·dispose각1, nativeTexture35의disposeevent35 확인. PNG26/metadata2exact. Image는PNG IHDR크기기반MOCK이며실RGBAdecode·GPUupload·world실행·actualGUI·본편native6·청취·save인수0. 새visual NOT ASSESSED/전체RETOUCH. 준비단계Path.write_text newline API오류1은제품도달0/Node0, root승인외부파일쓰기API만보정뒤최초제품Node1; 제품실패재시도0. final5888/39d2e931065fc9df34ab3f6f36e4687cb3ca4f85699952b8cc2ea43a5532ed04, unit16128/1258909d0e4a6686c9433e37040ae743199f7292c6bf6abedc6706a3e5454da7, raw771/2cd6bfc0430edd2a3b59ed1a6b18eabc0559e9077e0eaacae48f7f05a3be8aec. source수정권고0 |
| docs·정상보존 | 신규code후 전체rg28경로370행/raw433377/f1d85f951cb7068549f12a946c996b6db9ebfee86f65257a16eb564aecd278bc. root 관련정본24개를현재계약/범위로동기화·모든path disposition. ownerLOG와다른출시후보/맵geometry 이력4경로는원값유지. fullbyte백업→fullprefix/EOF1/GFM→정확소유code2+docs24 정상commit/push·remoteexact은 외부 main-character-seed-consumer/remote-preservation-receipt.json에서확인. foreign68·ownerSTATELOG4·heldWOLF1 소유외/stage0 |

§23 MAP PRODUCTION REPORT: MASTER=기존본편두class의지옥의틈초기표시연결. fullguide607e36a49a99205be61c0aeedb438da06bffaf13370360acc99fe86be751e80b/SSOT_INDEX·stageLOCK의기존정확full읽기근거적용. LARGE OUTER→MEDIUM→GROUND→PLAYABLE→LANDMARK→DETAIL은기존PNG/scene/nav/geometry/카메라/랜드마크/기존23보존·새배치0. CAMERA QA=새actualhost/child초기render표시범위만. TECH QA=최초sourceFAIL29도달/한정4x10과actualChrome별도영수증. VISUAL VERDICT: RETOUCH(전체맵), 새class 표시검수는전체맵선명도·해부학모션·본편native6·청취·실보상save·A급완성의인수가아님. 원화1254→8000확대/기본legacy1024mask흐림미해결.

| 새 전문 원자료·독립 후속 | 원총괄 보존·채택 경계 |
|---|---|
| ANIM motion UV 공식 raw | endda8430aa-df06-47d5-b729-ad0394de1d2e@2026-10-06T22:44:15.704Z, raw6359/a887281013d8afc85125ae4730bc5d4bb7d02fb5a826b3355b2e327b9a992972; 외부7081/4694e403a03d0e17b772e997bf10a6b08b4988cf6bf3a7b955eff4345580d2d5. 전문보고stdin8PASS는actualcharacterRigFrame+복사공식만·actualupdate/setFrame/GPU未호출. root readonly12195/8f2d1d396abab42518a3847e612025df6185b5e60a2237bcab724eb8f8b6a838에서신규source결함확정0, 실버테일walk가변crop/anchor→geometry실소비를새검수범위로분리 |
| MAP host/modal 원자료 | end70832dd3-592c-47c1-98d8-0f199c955fa5, raw4935/9f220fec67181b840ade1c00f92a470f39ebb013ba4bc13f6ef1624949f13898; 보존5665/c4a05aa52540a0201ee6a1e8751f9819aa5d0eadaf7242b9905275436ba525a6. 새공식memory후보미채택, root실행·실화면·본편인수0 |
| ANIM dialogue owner 원자료 | end53b09739-bd8c-479f-b0a4-6838041a4aec, raw6240/9b9ad0f617ddca16b5f459d4158d23de3a89b2553cca5dd83f19e845f67cfaa9; 보존6895/7f55fb6f0a265ec35d7a7b550ca629fc3a8f048d5bcaf82e433df6bfe05e1cf7. 새공식memory후보미채택, root실행·실화면·본편인수0 |
| 새 owner 업무 | Claude8 기존owner가 MAP CH1-RIFT-SCENE-OBJECT-ASSET-INTEGRITY-20261007-MAP-MEMORY와 QA CH1-LOBBY-CHARACTER-VISIBLE-BOUNDS-20261007-QA-MEMORY를각sent1/peer1/firstsource1/end0·busy로기록. ANIM CH1-RIFT-VFX-ARBITRATED-ATTACK-EMISSION-20261007-ANIMVFX-MEMORY도sent1/peer1/Read1/firstsource1/end0·busy. 수신/첫source를완료로계산0·전원가동과장0. MAP추가권한질문은이미승인된기존팀독립작업에대한전문자가질문이며실제autoapproval거절로오인0, 기존승인범위업무계속. 새raw의의미검토·후속은기존owner에게만1회인계 |
| 계속운영/보호 | 기존Claude8/Codex7만전문송신소유·root직접/중복송신0·새팀/세션0. 거절된Codex송신/ART선택/WOLF쓰기목적재시도·도구/경로/호스트/권한우회0, MAP/STORY외부쓰기·삭제피해UNKNOWN유지. WOLF거절뒤같은산출물correctedpathwrite 이력보존·추가접근/검수/실행/채택/Git0. 타인WIP/사용자save/보호2_3·Q전용magicblackBean(E불가)·어택티켓금지보존. 실제NUL80부터완료소유checkpoint/100전새산출중단. 계정주간사용률약15pp/day 목표는공유관측이며이채팅정확일별token보장·토큰태우기0. 기존단일root연속heartbeat/다른paused자동화·아침메일재개0 |

> **소스·검수 시점 이력:** 아래 lab10557·lab10712의 핀과 2px/1.3018px 관측은 당시 결과로 보존한다. 현행 lab16215의 CSS 최소12 표시 계약은 ROOT-EDITOR-PROBE-CSS-SIZE-20261007 절을 따른다. base sphere radius.04/segments12·8 및 보행240worldpx/s·충돌r12worldpx·dt상한.05s·벽 접촉 규칙은 이번 변경으로 바뀌지 않는다.

### 2026-10-07 편집 snapshot·가져온 이미지·보행점 현재 정본 동기화

| 항목 | 현재값·인수 경계 |
|---|---|
| 최초 source 보존 이력 | 당시 factory18576/lab10540의 정상 commit/push remote exact 000e6d3c04e7a8e004c6ed3c36f166e81f9846bf, code5/docs4. NUL81→73/index0/foreign68 exact. 최초 commit hook의 CHANGELOG_SYNC 누락 exit1은 진행log 보충 후 정상통과; bypass0 |
| 실제 연결 | 별도 “편집 씬 · 2.5D” 버튼 → current EXODUSER_SCENE_EDITOR detached snapshot → 실제 core.validate/UTF8<=32000000 → fresh owned iframe → actual child.loadScene(...,{entryId:'editor-scene-N'}) → same current/URL/window/API 및 ready/loading/disposed/entryId/error ACK. timeout30000ms/poll100ms. 기존 canonical 주민 선택 미리보기와 분리 |
| source 정확핀 | editor.html258409/b9e3a61dd9c6a11eff220b7f39a6dc9db76e375be2615422b586d12d5186b41e; host14648/39490d20c548a6eb8536439cb962c833ff3ef6e8cdc488ba9a196532121c1a3d; terrain18672/294e4369d5cfe4116ad6b85fa1648b6c89509d3fb009fdfe75ed7cb5af5d7faf; lab HTML2997/6b988ed8e352276ca8a67b9e4a06a7e0f6a713feb2d061c227dbccd0d31e7653; lab MJS10557/1c5cdf0c8d37e4ecfc8d8a5dfec0e1e436c3d7fce62ccf4a0ed96590c5ccf07d |
| 실제 소비 계약 | 현재 assets crop/원본크기·layer순서/visible/foot정렬/parallax·object transform/pivot/rotation/flipX/opacity·polygon mask/feather/sourceParallax·walkable/start를 소비. 원 PNG/scene/nav 수정0. Three r160 angle50°/scale400 X/Z image-plane, mask alpha longedge256/geometryHeight0/physicalHeightUNKNOWN. layerOrderStride2001. 상세공식·상수·resource ownership은 HELL_RIFT_EDITOR_RESULT/MAP_SCENE_EDITOR/HELL_RIFT_2_5D_SLICE 최신절 |
| 화면·입력 | 별도 금빛 보행 probe(캐릭터아님), WASD/방향키 world240px/s/radius12/dt<=.05·대각선정규화, orthographic 기본/perspective45°/near.01/far10000/zoom.5..3/.1/DPRfinitepositive기본1/cap2. readonly sceneSnapshot clone·pagehide/abort/close/stale cleanup. host/child가 editor history/selection/save에쓰기0 |
| source 검수 | 이전 factory18576/nativeThree 통제Image8그룹40PASS(final14929/027545958decf3ccfc16a28cb19503097eee9829ddea6ef88e482126752bb9f5). 초기host숫자draft12/51PASS는문자열child미검수이력, finalstring strict2/11PASS별도(final9468/323361fe7a824422ba6a2fc37404b12cf4c0bdc6ecc5dd499e82261322c04fe5). oldsuite재실행·합산0 |
| 다른 실제 입력 검사 | 기존world source불변. nativeJ attack/ring/render 관측은최초capturemicrotask조건FAIL1/12미도달과분리. 외부windowbubble후heldrepeat/fresh/idle4PASS·대화동기render DOM조건FAIL1/3미도달/exit1, 이후render/PNG하란패널보였으나neutral240ms/J닫기후공격未인수. E/live-input-fx-consumer-browser/final-receipt.json13800/2ed847c0ce3fa2de3d4ca0abee6bb9880b738ebeb327cdb0608099e196feaa86;전체clean13PASS0/추가FX실행0 |
| 미연결·제한 | Unity PNG+.meta/FileReader dataURI import 출력의 이미지 소비 연결만 추가. Unity 프로젝트/Prefab/FBX/임의 shader 호환 인수0. 본편캐릭터P/UUID/HP/inv/flags/유품·부탁durable save·실native6·청취·A급미인수. 원화1254→8000확대/legacy1024mask흐림 미해결·전체맵RETOUCH |
| 보호·운영 | 사용자save·원PNG/scene/nav·기존23·보호2_3·Q전용magicblackBean(E불가)·어택티켓금지/foreign68/ownerSTATELOG WIP/heldWOLF1 보존. root전문직접중복송신/새팀/세션0, 기존owner후속만. 실제NUL80완료소유checkpoint/100전새산출중단, 기존단일heartbeat/다른paused자동화·아침메일유지 |

| 이번 최소 코드 보정 | 정확 계약·검증 경계 |
|---|---|
| ROOT-EDITOR-PROBE-VISIBILITY-20261007 | lab:103 markerMaterial에 transparent:true 한 flag만 추가. 기존SphereGeometry radius.04/widthSegments12/heightSegments8/color0xf1c67b/depthTestfalse/depthWritefalse/renderOrder100000 불변. 기존 opaque pass 뒤 transparent 지형이 표식을 덮는 실제PNG 실패를 수정. OLD10540/6e298397…→NEW10557/1c5cdf0c… inverse exact |
| ROOT-EDITOR-IMPORTED-IMAGE-CONSUMER-20261007 | factory:223 source guard1곳만 추가. 기존 assets/·img/ PNG/JPEG/WebP 경로와 core동일 case-sensitive data:image/(png\|jpeg\|webp);base64,[A-Za-z0-9+/=]+ 허용. core src최대14000000문자/hostUTF8최대32000000B 유지. alias jpg·SVG/GIF/잘못된alphabet/빈URI/HTTP/blob/protocolrelative 거부. native decoder의 format sniffing과 MIME/content 일치 정책은 구분 |
| 수명·크기 | default native Image.decode/naturalWidth·naturalHeight exact·source별Texture 공유·명시release 소유/abort/stale/latecleanup 계약 불변. nativeImage.decode가 허용 alphabet의 손상padding·비이미지 데이터도 거부하는지는 별도 실제GUI 근거. borrowed loader에 release없으면 외부image에 임의cleanup0 |
| 신규 source 검사 | actual factory+Three resource/통제 Image.decode 포트 1회6그룹32조건PASS/FAIL0/미도달0/exit0. source18672/294e4369d5cfe4116ad6b85fa1648b6c89509d3fb009fdfe75ed7cb5af5d7faf. final-source-receipt.json27161B/bbce82d435dd3e98d2b485660ff912635832fcbfbc042d51bb9eb3de81e2d29a. old40 재실행0, 이 source 검사를 native decode/GPU로 승격0 |

| 실제 편집 scene 검수·새 화면 보정 | 관측 결과와 미도달 경계 |
|---|---|
| 이전 edited scene source epoch | factory18576/2d304d02d268cdc83dfd1f0b702134b7c91a53a12f8b936b30c39e6373dfcb41·lab10540/6e298397b1c8e5fdc2d28ac010e2e9081329f901b557adbcff821aa3487ffc70. 처음 numeric grid=false fixture는 import 선행FAIL1/0PASS/13미도달, 외부 grid0 보정 후 새GUI6PASS/하네스 geometry summary 누락FAIL1/7미도달. 오류 원자료 2건을 보존하며 clean14PASS로 계산하지 않음 |
| 저장된 실제 geometry 한정 판독 | 새Chrome0. 실제 원래 렌더 관측의 geometry/UV1조건과 hidden/order1조건만2PASS. 27vertices/81positionchannels/54UV 각 두관측 maxerror0; hidden west2 제외·visible12 및 실제 renderOrder 일치. archival-geometry-result.json7494/521325442e658d69aae703e60a0589cb6b80a44d302c1fda89daa319e339d8a6 |
| 이전 epoch 남은 새 native 보행·종료 | 새Chrome1/editor1/child1, G4/G5만6PASS/FAIL0/미도달0/exit0. start4020,7740→S4020,7756.008→W4020,7732.032; blocked0→1·current canWalk true/장애중심 false. actual pagehide trusted·RAF false·dispose attempt1/renderer.dispose return1·geometry13/material13/maptexture3 총29이벤트 각1·hosttimer0·storage{} 및 부모memory보존. private feather·physicalGPU해제 UNKNOWN |
| 이전 epoch 최종 보존 | 전체 물리Chrome3/context3/editor3/child2이며 live6+archival2+remaining6을 별도 기록. completion-receipt.json11894/5ce0c4a0f5cb69a99d780b0b2ebcaf85af506beeb2bb7380d3a86dfca2aca8cc. 당시 gold probe PNG 안보임/markerPixelAcceptedfalse/전체RETOUCH, 현재 source와 혼동0 |
| 새 source epoch 실제 보행점 픽셀 | ROOT-EDITOR-PROBE-VISIBILITY-20261007. Chrome1/context1/editor1/child1 종료·source8+protected9 exact. 자동P1/P2 2PASS/FAIL0/미도달0/exit0 및 PNG직접판독P3 1PASS 별도. canvas1084×716/projectedcentre543.6273,662.3/radius1.3018px, gold2pixels(543,662),(543,661) RGBA[241,198,123,255]/채널오차0. nativeGL LINK5/error0/contextnotlost. OLD_RGBA UNKNOWN·동일장면 AB숫자비교0 |
| 새 probe 근거와 가독성 | final-receipt.json8254/ede3a1645df3f42965d3e5fc61a477af61e1966679a31f0617552006d3abfcbb; actual-probe-visible.png659535/e59e9a503ccfb03531b4d0eaeb70ada802c16edc30d294944bd4c95bb167a96f. root PNG직접확인. 금빛점 표시만인수·여전히작음/맵흐림 RETOUCH. 선택적PNG좌표분석1회는PIL부재exit1/미도달로별도보존·설치/우회/재실행0 |
| 가져온 이미지 새 native 소비자 | ROOT-EDITOR-IMPORTED-IMAGE-CONSUMER-20261007-NATIVE-DECODE-GUI. 원editor importProject(false)→원host→원factory/lab. Chrome1/context1/parent1/child1/maxlive1, intrinsic HTMLImageElement.decode 위임·원Promise반환/mock0. PNG122×69/JPEG1280×720/WebP1200×256 native decode3조건 및 actualGL1조건으로4PASS(2그룹). visibleObjects3/frames5/LINK3true/draw35/GLerror0/contextnotlost. root 성공PNG 직접판독. Unity 파일chooser/PNGmeta 전체workflow·본편인수0 |
| native 첫 실패·미도달 | N3-padding(data:image/png;base64,A===)는 실제 editor import 선행예외로 첫FAIL1·child 생성0/해당factory native decode未도달. N4비이미지/N5크기불일치2미도달, exit1/재시도0. native decode negative3 모두未인수이며 통제Image CPU32와 구분. 원자료에 console net::ERR_INVALID_URL1·pageerror0/외부요청0/쓰기0/다운로드0 보존. 제품factory 결함확정0/clean7PASS0 |

| native 최종 영수증·첫 실패 판정 | final-native-receipt.json9203/7e1cf4fa9b5d7cb044fdcb1d4fce21b72fa3b3db25d7a7da07d50f186edaa6be; native-first-failure-adjudication.json4929/d1e2764db4cc11d8e27928f827b782a92ed7d03288babf81772c1255f466e35d. editor.js623 importProject→31 picture()의 onerror 선행구간을 source로 확인. raw의 정확throw stack은 formatter가 객체presence/phase만 남겨 UNKNOWN이며 재구성0. native 손상padding/nonimage/metadata mismatch factory3조건은 모두 NOT_REACHED |

| 전문팀 공식 완료 원자료 | root 의미검토·채택 경계 |
|---|---|
| 실제 착수 | MAP·SKILL·QA·BOSS·ENEMY·ANIMVFX의 현재 TASK별 successful source와 공식 end 6건. 송신/peer/ACK만으로 착수·완료 계산하지 않음. 기존 owner가 후속을 담당하며 root 직접 전문팀 송신0 |
| 원문 보존 | ROOT-SIX-EDITOR-CONSUMER-RAW-PRESERVATION-20261007, 외부 six-editor-consumer-raw-preservation/manifest.json 3777B/db80a57ad7485d87982b70cd90f44d2d5cd0caec8ed7f9e56fc1da4515cb7064. 여섯 raw의 공식 end ID/시각/원문 bytes/fullSHA, 후보 미채택 |
| MAP | 실제 groundDetail 모듈+통제 loader에서 reject/wrong-size가 prepare:false로 흡수됨. 기존 partial-commit 결함 제안 철회. GUI/이미지 decode 인수0 |
| SKILL | source 의미검토: 현재 host hidden/close/dispose 경로 keys/RAF 해제. standalone listener 정리는 선택적 제안, 새 코드 채택0 |
| QA | admission/ACK/stale 차단 source 확인. ACK 뒤 child 렌더 실패가 외부 host active 상태에 반영되지 않는 경계는 source 관찰·실 GPU 미재현 UNKNOWN; 후속 별도 |
| BOSS | crop 검증과 UV 범위 source 확인. 고정 far10000의 극단 scene 경계는 일반 8000px scene과 구분; 현 맵 실제 결함으로 승격0 |
| ENEMY | 첫 stdin export-shape 오류 exit1 보존, 런타임 PASS0. tileSize16/radius12의 5점 collision gap은 손계산 후보, 현재 tileSize40 맵 영향0/미채택. 맵 guide 전체 선행 미수행 사실 유지 |
| ANIMVFX | source+전사 산술 모델 exit0; GPU/픽셀 관측0. atlas crop half-texel bleed·sourceParallax 극단 경계는 필요성 UNKNOWN/미채택. 이전 외부 Write2+Edit1 범위 위반과 피해 UNKNOWN 유지, 해당 3대상 추가 접근·실행·삭제0 |
| owner 보존 | CLAUDE8-SIX-CONSUMER-20261007-2338 완료소유 STATE/LOG2 정상 commit/push remote exact d4c6800385c08ffc88612d800f040e0ad20cac80. NUL73→71/index0/foreign68 exact, 그 뒤 owner 새 기록은 별도 WIP |

| docs 전체 검색·보존 | 정확 범위 |
|---|---|
| 관련 검색 | 최초77경로2044물리행(2038 path-line+장문생략표시6), probe후27경로353행, source guard후34경로415행. 최초 검색의 끝부분 일부 장문 출력은 생략되었고 77문서를 전수 읽었다고 선언하지 않음. 현재18정본+기존팀registry경계절1=19에 동기화, historical/owner WIP/다른모드/보호2_3 보존 |
| disposition 정확핀 | 최초 disposition.json91474/c5301efbe0c5d844755b3306e69b1dc4bedb199f79995f3cea4123237a207b23; finaldelta47882/6091b18084cf714ea65546c76bd620db148b63b04ee2148abbb2097acb8754c3. sourceguard wholeJSONL1618915/28084ad421d86aef4cc0a357c85d982847e05731857e2db2adfbc5be954413c0 |
| append 소유 | code2+currentdocs19만 정상commit/push하며 실제 완료와 remote exactSHA는 외부 editor-scene-combined-preservation/remote-preservation-receipt.json에서 확인한다. priorcode000e 및 ownerd4c680은 이력이며 이번 code2의 commitSHA로 오인하지 않음. docs19 fullbyte백업/fullprefix/EOF1·sourceexact·foreign68exact/index확인 선행 |
| 후속 | 다음 root 승인단위는 작은 probe가독성·흐림/접합/재질 보정, 가져오기 전체workflow/negative 미도달 원인 분리, 최소본편player/NPCdurable consumer·native6이다. 기존owner는 이미 여섯 전문팀에후속배정했고 ANIM·SKILL 성공source확인/나머지4당시도구시작대기. 이 관측을전원가동·완료로승격0. root검수중독립팀보류0·같은TASK재송신0 |

§23 MAP PRODUCTION REPORT — ROOT-EDITOR-EDITED-SCENE-CONSUMER-20261007 / PROBE-VISIBILITY / IMPORTED-IMAGE-CONSUMER
- MASTER PLAN: guide 전수읽기18392B/607e36a49a99205be61c0aeedb438da06bffaf13370360acc99fe86be751e80b와 _MAP_SSOT_INDEX·stageLOCK의 기존 근거를 적용했다. 이번 단위는 현재 편집 snapshot의 별도 2.5D 소비와 화면·입력 검수다.
- LARGE OUTER MASS → MEDIUM CONNECTION → GROUND CONNECTION → PLAYABLE/COMBAT → LANDMARK/CENTER → SMALL DETAIL: 기존 원PNG/scene/nav/배치/기존23를 보존했다. 앞 단계 신규제작 완료0·physical geometryHeight0/실제 높이충돌 UNKNOWN.
- PLAYABLE/COMBAT: authored walkable/start·radius12/240px/s probe의 실제 이동/장애차단을 이전 epoch 새조건6 중에서 확인했다. 현재 probe는 캐릭터가 아니며 전투/NPC대화/유품·부탁/보상/save는 이 editor viewer에 미연결이다.
- LAYERS/CAMERA: transform/pivot/rotation/flipX/crop/UV/hidden/order 및 mask/feather/sourceParallax 계약. orthographic기본/perspective45°/near.01/far10000/zoom.5..3/.1/DPRcap2. 원 PNG의 실제 깊이/해부학모션 인수0.
- TECH QA: old factory CPU8그룹40/host draft12그룹51조건와 finalstring2그룹11조건은 이력. 새guard actualfactory+Three/통제Image6그룹32PASS; 새probe 실제GL자동2PASS·PNG판독1PASS; 새native3format decode+GL4PASS/첫import예외FAIL1/미도달2를 분리했다. 전체합산 cleanPASS0·기존suite반복0.
- VISUAL VERDICT: RETOUCH. 금빛 probe 표시와 PNG/JPEG/WebP 이미지 소비는 실제 화면에서 확인했으나 probe가 작고 원화1254→8000 확대/legacy1024mask 흐림·절벽전경접합·재질이 남아 있다. 독립preview/fixture/raw보존은 본편native6·청취·실보상save·A급완성의 인수가 아니다.

> **소스·검수 시점 이력:** 아래 lab10557·lab10712의 핀과 2px/1.3018px 관측은 당시 결과로 보존한다. 현행 lab16215의 CSS 최소12 표시 계약은 ROOT-EDITOR-PROBE-CSS-SIZE-20261007 절을 따른다. base sphere radius.04/segments12·8 및 보행240worldpx/s·충돌r12worldpx·dt상한.05s·벽 접촉 규칙은 이번 변경으로 바뀌지 않는다.

### ROOT-EDITOR-DIAGONAL-WALL-SLIDE-20261007 — 편집 씬 벽 접촉 보행 현재 계약

이 절은 current lab10712 소스 epoch의 구현·신규 검수 정본이다. 직전 lab10557과 그 시점의 성공·실패·미도달 기록은 당시 이력으로 보존한다.

| 항목 | 현재 구현·인수 범위 |
|---|---|
| 소유 코드 | tools/editor-scene-preview-lab.mjs 10712B / SHA256 698e48c83bb96d89117ba8f9d5d3f0ace321c6fd8493e3f309bfc9d80674a6f3. move 한 구역만 보정. |
| 입력·요청 이동 | WASD/화살표 dx,dy hypot 정규화, 240world px/s, 호출자 tick dt0…0.05초, 최대 요청 이동12world px. |
| 기존 성공 경로 | combined endpoint canWalk(x,y,12)가 통과하면 기존 x,y 동시 이동을 유지한다. |
| 새 실패 경로 | combined 실패 후 blocked를1 증가. dx&&dy&&step>0에서만 X를 검사·적용하고 그 결과 player.x에서 Y를 검사·적용한다. 각 검사 radius12. 막힌 축은 유지. |
| 카운터·속도 | blocked는 combined 실패당1이다. 양축 실패당2가 아니다. 살아남은 축 재정규화0; 대각 한 축 속도240/√2. dt0에서는 fallback을 생략하며 이미 invalid한 발 위치의 combined 실패 카운터는 기존처럼1이다. |
| 검증 한계 | endpoint 검사다. swept collision/실제 신체·높이/모든 tile 크기의 관통0 인수는 아니다. 금빛 점은 보행 표식이며 실캐릭터가 아니다. |
| 원자료와 채택 | ENEMY 공식end3c1224f6-5a08-4a53-ae7e-dc5d6d1a3fa8@2026-10-07T00:04:16.896Z의 raw7099B/827504f177358db7c8fe1964b4f74d481e94896a3b39b799a59183ec8385ab16를 의미 검토했다. raw 무조건 축 이동 제안은 실행하지 않고 root가 combined-first/실패당1/positive-step으로 최소 변형했다. SKILL focus·QA retry 후보는 이번 미채택. |
| 신규 CPU | 실제 private move(dt) 추출 함수+기존 actual core.canWalk, Node1회, 8그룹/8복합조건 PASS, FAIL0/미도달0/unhandled0/exit0. r12 경계·X/Y slide·양축 차단·정규화 최대12·dt0 포함. dt상한은 호출자 계약이며 닫힌 dt0 위치는 합성 fixture. |
| 신규 실제 화면·입력 | 실제 Chrome1/context1/editor1/child1, trusted D+W. 3그룹/3조건 PASS, FAIL0/미도달0/exit0. 원래 에디터→host→child/Three 경로이며 제품 mock0·synthetic input0. |
| 실측 | 시작4020,7740→4025.651197395243,7672.13471956884; 관측8위치 actual core r12 통과. 모서리4025.651197395243,7652.330072841369에서3연속80ms 정지·frames/blocked 증가·held2. 전수 경로/연속 충돌 증명으로 확대하지 않는다. |
| QA 원본 보존 | canonical clone의 메모리 walkable3셀(열100/행191…193), start4020,7740/exit4020,7660만 importProject(false)했다. 원본 scene/nav/PNG·에디터 부모 fixture·local/session storage·save 불변. source8/protected9 전후 exact, pageerror0/4040/변경요청0/download0. |
| 의미·검색 | docs전체 신규 행동/소스핀 검색25경로·중복제거972행: current19/history2/ownerWIP3/다른mode1. 전수문서 fullread로 계산0. helper heading 추출 StopIteration은 준비 읽기 실패이며 제품 미도달로 별도 보존. |
| 시각·본편 경계 | 직접 PNG 판독: 하단 금빛 표식이 작고 원화 구도/레이어 표시 유지. VISUAL VERDICT: RETOUCH. 원화1254→8000 및 legacy1024 mask 흐림·절벽 전경 재질은 미해결. 실캐릭터/NPC durable/main/native6/청취/실보상save/A급완성 인수0. |
| 영수증 | /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/editor-wall-slide-20261007/validation-receipt.json 3874B/c66885a2cb7bed74c3c91166aabc0be2e10360db15aba87988f47deb09ab7a11. CPU/native/PNG/의미 검토·검색 정확핀은 해당 영수증 참조. |
| MAP PRODUCTION REPORT §23 | /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/editor-wall-slide-20261007/map-production-report.txt 2498B/6a21ee7a154adac271c92d056e3c2226c08b7c32d7500aec26604b17f61506ea. MASTER/OUTER/LARGE/MEDIUM/GROUND/LANDMARK은 기존 유지, 새 PLAYABLE은 한정 통로 검수, CAMERA는 새 PNG 한 장이며 전수8구역 인수0. |
| 후속 | NPC 대화 선택 후 포커스/Escape/canvas 복귀의 새 정적 후보를 실제 소스 확인 뒤 최소 구현한다. Codex 감독의 읽기 결과만 있으며 아직 구현·GUI 인수0. Claude 감독은 기존 배정6팀의 새 완료/후속을 계속 수집한다. |
| 보존 | source-change fullbyte 백업 선행. foreign68/ownerSTATELOG4 WIP/heldWOLF1/기존23/user save/원PNG·scene·nav/LOCK/보호2_3/Q전용magicblackBean(E불가)/어택티켓금지 유지. denied 목적 재시도·도구/경로/권한 우회0. 기존 WOLF 사후동일출력쓰기/damageUNKNOWN 이력 유지·추가 접근0. |

## 현재 소비자 갱신 — NPC 키보드 초점 (ROOT-NPC-DIALOGUE-KEYBOARD-FOCUS-20261007)

이 절은 기존 에디터의 선택 주민 → 2.5D 대화 UI에 적용된 최신 계약이다. 앞선 ‘NPC 초점 미구현’ 및 이전 소스·검사 핀은 당시 이력으로 보존한다. 편집 씬 보행 probe, 부모 game 입력 lease와 본편 대화·보상 저장은 별도 범위다.

| 항목 | 현재 코드·관측값 | 적용·인수 경계 |
|---|---|---|
| 변경 소스 | tools/2_5d-world-lab.mjs · 48,309 B · SHA256 7761cb34eabd17a9f7f296e605042eb4120d7f999d6014d62d0bb1c1bb2e11b8 | HTML·대화 controller·공격/저장 경로 변경 0 |
| 열기·노드 전환 | 성공한 talk/open 또는 choose 결과 isOpen에서 현재 첫 enabled 선택지에 focus; 선택지 없으면 dialogue-close | 기존 선택지 교체 후 현재 노드로 초점 연결 |
| 오래된 선택지 | ready/paused, button.isConnected, list.contains(button), actor, lifecycleEpoch, dialogueSignature 검사 | 제거된 버튼·다른 actor/epoch·이전 signature 차단 |
| focusDialogueInput | ready, !paused, !error, !disposed, !contextLost, !document.hidden, document.hasFocus(), actor/epoch 일치, 현재 open 상태 검사 | 열린 패널은 hidden이면 초점 이동 0 |
| 일반 닫기 | 열린 대화의 manual/escape 닫기, 선택 결과 closeReason=dialogue.close 후 world-canvas로 복귀 | window blur·reset·actor 변경·dispose 닫기에서 강제 회수 0 |
| 선택지 키 | Tab 이동 · Enter 선택 · 비반복 Escape 닫기 | panel Escape는 preventDefault/stopPropagation; native Tab/Enter 유지 |
| 게임 입력 범위 | R/J/WASD는 기존 world-canvas 전용 | 선택지 초점 중 R/J/WASD를 canvas로 재전송하지 않음; J/FX 재검수 0 |
| 화면 안내 | 대화 시험 · 선택은 게임에 저장되지 않습니다 · Tab으로 이동 · Enter로 선택 · Escape로 닫기 | 열린 dialogue-notice 리프만 갱신; controller view.notice/API 불변 |
| 신규 실제 검수 | Chrome/context/parent/child 각 1 · 새 5그룹/5조건 PASS5/FAIL0/미도달0/exit0 | R 첫 선택지, Enter about→meet, Escape+W, 종료 선택·닫기 버튼, 실제 부모 초점 이동 |
| 이동·blur 관측 | W y6660→6655.658, keyup 후 실제 lifecycle heldKeyCount0; Shift+Tab3으로 부모 return, trusted child windowblur, 이후 2 render frames 부모 초점 유지 | host 접근점4700,6660은 준비 위치 이동; 전체 경로 보행 인수 0 |
| 보존 | source10/protected9·부모 scene·local/session storage exact; pageerror/404/mutation/download 0 | 원본 PNG/scene/nav·user save·외부 WIP 보존 |
| 화면 판정 | 실제 PNG2 root 직접 판독: 첫 선택지 금색 초점선·한국어 안내 가독, 일반 닫기 후 패널 숨김 | 전체 VISUAL VERDICT: RETOUCH. 확대 배경 흐림·캐릭터 부근 주황 삼각형 겹침(원인 UNKNOWN)·좁은 접근 간격 남음 |
| 미인수 | 본편/native6·청취·유품/부탁 durable consumer·실보상 save·A급 지도 완성 0 | 기존 Haran met session flag만 관측; 미확정 Berin/Nessa 보상 ID 추정 0 |

구현·정적 검토·신규 native 검수는 각각 구분해 보존한다. 실제 하네스 실행 전 없는 snapshot.heldKeys 진단을 __rift25Lifecycle.snapshot().frameFatal.heldKeyCount로 보정했다(제품 실패 0). 구현 영수증 작성의 첫 Python quoting SyntaxError는 준비 실패/write0/product0으로 별도 기록했다. 기존 J/FX·클래스 표시·옛 GUI suite를 반복하거나 과거 실패를 새 PASS에 합산하지 않았다.

정확 근거 디렉터리: /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/npc-keyboard-focus-20261007
- validation-receipt.json · 3,919 B / 1c761dec1e064be22c870249bcc0f31617421ace4246c9e407ca8c5f22e6491d
- native-result.json · 133,586 B / 852f843873c89b21d309d00a6420e0990523cfedf62be769d9b87d9b26e2ffad
- map-production-report.txt · 2,432 B / 8173c39d1eb5569bfcca5135878a758e3f28af9823b66eaa64238baed2ed029c
- native-open-choice-focus.png · 820,497 B / 7ad599df0b6184fbb15c2a9bb19ae956c66c11c92e76adc3c670e40ae8212680
- native-closed-canvas-return.png · 892,101 B / 836425b244d7be135dff1af068250e3c748d11ffc7b4f5020803623ba2bb863c

문서 보존 준비에서 절대경로를 Git HEAD 경로로 사용한 첫 명령은 exit128/문서 쓰기0으로 실패했고, 이어진 보존 준비는 영수증 부재로 exit1/Git stage0이었다. 저장소 상대경로로 준비를 바로잡은 뒤 정상 보존한다. 제품·native 검수 실패와 구분한다.

code+docs 정상 commit/push 및 원격 exact SHA는 같은 디렉터리 remote-preservation-receipt.json에 기록한다. 이 절의 신규 UI 검수만으로 전체 게임 완료를 선언하지 않는다.

> **당시 소스·검수 이력:** 아래 a04a9133 공개 핀과 sceneY+.70 소비 위치, 이전 원인 분리2·headgap2/GUI23은 해당 시점의 기록이다. 공용 openSize=.045와 미주입 openLift=.70 fallback은 현행에도 유지한다. 현행 world의 열린 주민 cue 위치는 ROOT-NPC-CUE-TOP-ANCHOR-20261007의 NPC별 cameraUp·billboard 상단 기준을 따른다. 원 raw 핀과 과거 검수 결과를 바꾸거나 이번 결과와 합산하지 않는다.

## 열린 대화 표시 가독성 현재 계약 — ROOT-OPEN-CUE-READABILITY-20261007

| 항목 | 현재 계약 / 관측 경계 |
|---|---|
| 완료 단위 | ROOT-OPEN-CUE-READABILITY-20261007; public interaction-cue-lifetime.mjs 14,064 B / SHA256 a04a913308ab87aa39616a848225193df8adb4ede39f4df8dc1bed1060af93aa |
| 변경2개 | INTERACTION_CUE_DEFAULTS.openSize .12→.045; openLift .42→.70. 이 두 상수 역변환만으로 이전14,063 B/1fe07971b3943d4a72ee618d467faf5bfea41175525e19f8f6478740be09aab7 전체bytes 복원(구현영수증). |
| 크기/위치 단위 | 열린 mesh scale의 x/y/z=.045 고정(scene units), worldToScene(anchor.x,anchor.y)의 결과 sceneY에 .70 추가. NPC foot XY·player/displayApproach·보행/물리 높이는 변경하지 않는다. |
| 열린 도형/재질 | RingGeometry(0,1,3,1), RGB0xc8623a, base opacity.8, camera world quaternion 복사, transparenttrue/depthTestfalse/depthWritefalse/DoubleSide/toneMappedfalse 유지. |
| 접근 cue 불변 | 접근ring size.16, RGB0xcdbb86/base opacity.55, RingGeometry(.5,1,32,1), groundLift.003. 열린size=.045 고정; 접근size=.16p. |
| pulse/순서 불변 | p=1+.22sin(clock/1000×1.6×2π), normal opacity=clamp(base×(.75+.25p),0,1); reduced-motion p1·base opacity·clock0. orderFor 주입 root NPC순서+.5, 미주입 default31. |
| 수명/입력 불변 | mesh2 pool, caller 기존RAF, 독자RAF/timer0. maxAnchors4/world8000, API/provider읽기·failclosed·종료해제·option범위 그대로. 대화/입력/neutral240ms/저장/아이템/퀘스트/카메라/원PNG/nav/원발 변경0. |
| 이전 public/원 raw | public14,063 B/1fe07971… 및 GUI23/초기 source검수는 당시 이력. 원 ANIMVFX raw9,287 B / SHA256 140748cf0ed50961e18b26750c66e240fb0c40abd8ace2baac8e1c54aa0ae567·공식완료ID 불변. 새 root2상수 변경을 raw 수정/후보새인수로 표시하지 않는다. |
| 원인 분리 관측 | root actual Chrome1·새2조건 PASS/FAIL0, 같은 pose3렌더+추가2렌더. prior open mesh 숨김 전후 실제 PNG RGBA diff777px, bbox476,275…511,316; 복원diff0·PNGbytesexact. 이 setup의 주황삼각형 원인은 public rift-interaction-open mesh로 확정. |
| 관측 범위 | 기존 selected-NPC editor host의 setup4700/6660, source11/protected9 exact. 원인 분리 관측은 이전 .12/.42 소스에서 수행되어 새 .045/.70의 위치/가독 인수로 계산하지 않는다. |
| 새 위치 Gate | 첫 실제 Chrome/context/parent 각1·순차child2/maxlive1, 신규2그룹·2조건 PASS2/FAIL0/미도달0/exit0. 추가 GPU렌더0·old suite 반복0. 원인분리 oldsource2조건과 합산하지 않는다. |
| 판정/미인수 | 원화 확대흐림 미해결·전체맵 VISUAL VERDICT: RETOUCH. Haran oversized 몸/머리 덮음 해소; Berin 몸미가림·주황cue는 보이나 앉은NPC보다 높이 떠 플레이어머리 근처여서 대상식별 미감 RETOUCH. alpha/anatomical head·인접tall druid·전체route/A급/main/native6/audio/영구보상·save 인수0. 기존 NPC-focus5/oldJFX/GUI23과 합산·재실행0. |
| Haran 실제 CSS 관측 | marker width13.49267294713161 × height15.559228631481488, NPCPlaneGapCSS10.176916437173531. 실제PNG에서 작은cue 가독 및 몸/머리덮음해소(root 판독). |
| Berin 실제 CSS 관측 | marker width13.492672947131666 × height15.559228631481403, NPCPlaneGapCSS38.276382209682936. 실제PNG에서 몸미가림/주황cue 가독, 고정lift로 앉은NPC와 떨어져 뜬 대상식별 미감 RETOUCH(root 판독). |
| 새 보호/오류 관측 | source11/protected9/추가 billboard·Three2 exact(독립 집계·중복가능), 부모scene/storage exact. GET-only, GL/errors/mutations/downloads0, Chrome종료. 이 helper 제품 CPU/Chrome 실행0. |
| 계획/실행 근거 | 계획6,046 B / 0c91c06980083198f576b9414c59ad4b25a4a0013fa7e17568c5525562636c66; runner17,617 B / 52bd8590afcd439bc7f1c53b99b5ae4cd4ea1c32b9c80379700d45acf313ab2f. 상속limit는 실행 전2/2로 정정; 실제 실행결과만 인수한다. |
| 최종 영수증 | validation-receipt.json4,586 B / 68744e5bca766ab537524cc064dcb9722682ae0cdff510842471f1a17525613c; native-result.json110,529 B / a8b570fa9aee9a5eacd73477a9def1eb3eb502f9dce38f33152a72cb1b7c9ff9. |

### MAP PRODUCTION REPORT (§23)

| 항목 | 범위 / 판정 |
|---|---|
| STAGE | ROOT-OPEN-CUE-READABILITY-20261007 docs disposition |
| MASTER | region/mainroute/sides unchanged |
| OUTER MASS | all outer mass/holes unchanged |
| LARGE | source art/atlas/large geometry unchanged |
| MEDIUM | connections unchanged |
| GROUND | source nav1192/feet/ground unchanged |
| PLAYABLE | cue decoration only; setupapproach not fullroute acceptance |
| LANDMARK | unchanged |
| CAMERA QA | root 실제 동일camera Haran/Berin2 setups, 카메라/geometry 수정0. actual PNG2 root 판독: Haran몸/머리덮음해소·Berin몸미가림; Berin 높이/대상식별 RETOUCH. alphahead/tall druid 미관측; helperGUI0. |
| TECH QA | 새 실제 Chrome1/context1/parent1/순차child2/maxlive1,2그룹2조건PASS/FAIL0/미도달0/exit0; source11/protected9/additional2 독립exact·GL/errors/mutations/downloads0·Chromeclosed. 이 helper product 실행0. |
| FILES | root code1 + approveddocs23; helper externaldocs-disposition only; owner/foreign/held preserved |
| GIT | 원총괄 소유 code1+docs23 정상 commit/push 및 remote exactSHA는 외부 remote-preservation-receipt.json에 기록; 이 문서 작성 시 보존 전 단계. |
| VISUAL VERDICT | RETOUCH (whole map and target-identification aesthetics); limited numeric/readability Gate2PASS |
| mainNative6 | False |
| audio | False |
| save | False |
| newLimitedNative | {'groups': 2, 'conditions': 2, 'pass': 2, 'fail': 0, 'unreached': 0, 'exit': 0} |
| unaccepted | ['fullMapSharpness', 'alpha/anatomical head', 'adjacent tall dark druid overlap', 'whole route', 'main/native6', 'audio', 'durable reward/save', 'Agrade'] |

정확 근거: /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/open-cue-readability-20261007/validation-receipt.json (4586 B / SHA256 68744e5bca766ab537524cc064dcb9722682ae0cdff510842471f1a17525613c). 전체맵 RETOUCH; 본편/native6·청취·실보상save·A급 완료로 계산하지 않는다.

### ROOT-EDITOR-PROBE-CSS-SIZE-20261007 — 편집 씬 보행점 CSS 표시 규격

이 절은 독립 편집 씬 lab의 보행점 표시 계약이다. lab10557/10712 당시의 금빛2픽셀·투영반지름1.3018px 관측과 검수 핀은 이력으로 보존하며, 새 CSS 하한12와 합산하지 않는다. sphere는 이동 위치를 보여 주는 표식으로 실제 캐릭터가 아니다.

| 항목 | 현행 계약 | 적용·한계 |
|---|---|---|
| 소스 | tools/editor-scene-preview-lab.mjs 16215B / SHA256 2794ecd9ef243d57a061b2f165ec7e6b37cafcc7834616a454c110e6d3bdd751 | 직전10712/698e48c8… 검수 이력 보존 |
| base mesh·재질 | SphereGeometry radius.04, widthSegments12, heightSegments8; 0xf1c67b, transparent:true, depthTest:false, depthWrite:false, renderOrder100000 | 기존 geometry·재질 유지; .04를 CSS12나 충돌r12로 치환하지 않음 |
| CSS 표시 하한 | PROBE_MIN_DIAMETER_CSS=12 | CSS 화면 지름 하한; 유효한 projection/depth에서만 표시. 물리 크기·캐릭터 규격 아님 |
| geometry 실제 반경 | 생성 직후1회 indexed triangle의 face-plane 원점거리 최솟값 innerRadius 측정; finite/index/퇴화 검사 | 실제 Three CPU 측정 .03794303237259694; source 상수로 박아 둔 값 아님 |
| 정사영 배율 | k=min(cssWidth×abs(P[0]),cssHeight×abs(P[5]))/2 | CSS getBoundingClientRect 크기 사용 |
| 원근 배율 | depth=-cameraSpaceCentre.z, k=정사영식/depth | 유효 near<depth<far 필수 |
| 절대 scale | max(1,12/(2×innerRadius×k)); marker.scale.setScalar(scale) | 누적0·DPR 재곱0; cached Vector3 1개 |
| 깊이 여유 | .04×scale<min(depth−near,far−depth) | 불충족은 minimum-unmet로 probe 숨김; scene render/ready 전체 실패 아님 |
| 투영/수명 가드 | render 전 camera/marker world matrix 갱신; current record·renderer·scene·camera·marker identity 재확인 | stale/closed/disposed 소유자에게 scale/진단/render 쓰기0; 추가 RAF/timer0 |
| 진단 API | snapshot().probe는 fresh frozen {minDiameterCss,scale,reason} | 초기 scale1/not-ready; release scale:null/unavailable. invalid에서 유한 기존 scale 또는null, visible:false |
| reason8 | visible, invalid-projection, behind-camera, outside-depth, unsupported-camera, minimum-unmet, unavailable, not-ready | 표시 상태이며 native/품질 인수 아님 |
| 보행·저장 불변 | 속도240worldpx/s, 충돌r12worldpx, dt상한.05s, combined 성공 우선·실패 시 X→Y/blocked1 규칙 유지 | source PNG/scene/nav/start/history/본편P/save 변경0 |
| 신규 CPU | 실제 전체 lab source에서 static import2개만 제외한 VM + 실제 Three r160 + 통제 DOM/renderer; 6그룹26조건PASS/FAIL0/미도달0/exit0 | GPU0/Chrome0. 최초 Node 준비오류 exit1·제품도달0은 별도 보존 후 metadata키만 제한 보정 |
| CPU 투영 관측 | 실제 mesh projection width≈12.6505437034556 CSSpx, height≥12.6024 CSSpx | CPU fixture만; 실제 PNG 픽셀/실물 모니터 관측 아님 |
| 첫 신규 native | Chrome1/context1/parent1/child1. 정사영 zoom.5/1/3 조건3PASS; P4 원근 전환 snapshot 대기 Timeout1/후속2미도달/exit1 | 원근 geometry 관측 전 setup 실패. 종료 후 scene/storage 검증도 미도달; 처음부터6PASS로 바꾸지 않음 |
| 새 제한 원근 native | 추가 Chrome1/context1/parent1/child1. 원근 zoom.5/1/3 새조건3PASS/FAIL0/미도달0/exit0; 통과한 정사영3 재실행0 | 물리 Chrome 총2. 실제 DOM selectOption input/change trustedfalse; Home/End zoom·Fit click trustedtrue |
| 신규 CSS 실제 투영 | 정사영3: width≈12.6625735341/height≈12.6024044322. 원근 .5:12.6625735341×12.490511188, 1:12.6625735341×12.9093851627, 3:12.6625735341×18.3360597271 CSSpx | indexed geometry 투영 수치. 정사영/원근 zoom3는 XY 화면 밖이라 가시성 인수0; alpha 픽셀 지름은 미측정 |
| root PNG 직접판독 | 정사영.5/1·원근.5/1 PNG4에서 남쪽 진입 금색 원형 보행점 식별 PASS 한정 | 실제 캐릭터 아님; 전체 맵 확대 흐림/접합/미감은 RETOUCH. helper의 별도 Chrome/PNG 재검수0 |
| 새 제한 종료·보존 | source8/protected9·부모scene/storage exact. trusted pagehide→disposed:true/ready:false/RAF:false, host ownedTimer0/iframe0 | 실제 논리 종료 관측; physical GPU free UNKNOWN. 첫 실행의 미도달 보존검사를 후속 결과로 소급하지 않음 |
| 최종 영수증 | validation-receipt.json 14181B / SHA256 3f57198f016a7db8d8b1ef85828a90167868b6acdb5f28c9c802ad823f29257a | 첫 CPU metadata 준비오류/실CPU26PASS/첫native실패/원근제한3PASS 별도 보존 |
| 인수 경계 | 전체 맵 VISUAL VERDICT: RETOUCH; 신규 표시 식별은 root판독4뷰만 PASS | 배경 확대 흐림·접합 개선 주장이 아님. 본편native6/audio/save/A급 인수0 |

검색은 구현worker broad1회(130경로2707행)와 helper targeted1회(22경로2372행)의 서로 다른2쿼리이다. 경로 교집합21/합집합131이며 현재 동기화 정본19·보존112로 처분했다. 다른 시점의 ownerSTATE/LOG 행을 고유 의미 행수로 합산하지 않는다.

#### MAP PRODUCTION REPORT (§23)

| 항목 | 이번 단위 실제 결과 |
|---|---|
| MASTER PLAN / LARGE OUTER MASS / MEDIUM CONNECTION / GROUND CONNECTION | 원본 지형·외곽·연결·바닥 변경0. 가이드 전체·SSOT 선행 순서 유지 |
| PLAYABLE / COMBAT / LANDMARK / SMALL DETAIL | 이동·충돌·랜드마크 변경0. 이동 검사용 금색 probe의 CSS 표시만 개선; 실캐릭터 아님 |
| CAMERA QA | 남쪽 진입 정사영.5/1·원근.5/1 PNG4 직접판독, 위치 표시 식별 PASS 한정. zoom3는 양 모드 화면 밖이라 가시성 인수0. 전경·중앙·출구 전체 route 미검수 |
| TECH QA | 실제source+Three CPU6그룹26PASS; 첫 native 정사영3PASS/원근입력setupFAIL1/미도달2와 새제한원근3PASS는 별도. 새제한 scene/storage/source8/protected9 exact·trusted pagehide 논리종료, GPU물리해제UNKNOWN |
| FILES / GIT | root 소유 lab1+관련docs19만 정상 commit/push. 외부 원문백업·검수·원격exactSHA는 editor-probe-css-size-20261007/remote-preservation-receipt.json에 보존 |
| VISUAL VERDICT | RETOUCH — 전체 맵 확대 흐림·절벽/전경 접합 미해결. 새 금색 위치 표시 식별만4뷰 PASS |
| NEXT PASS | 실제 캐릭터·NPC consumer와 본편 연결, 맵 해상도·레이어 접합 개선. 기존 완료 검사 반복0; 본편native6/청취/save/A급 완료 아님 |

## NPC별 열린 대화 표식의 현행 계약 — ROOT-NPC-CUE-TOP-ANCHOR-20261007

이 절은 이전 source epoch의 전역 sceneY+.70 배치 조항을 대체하는 현행 world consumer 계약이다. 과거 원문·수치·실패·미도달·검수 핀은 당시 이력으로 보존한다. public 기본값 openSize=.045/openLift=.70은 유지하며, resolver 미지정 호출만 기존 .70 fallback을 쓴다. editor CSS12 금색 probe 계약은 별도 소비자로 유지한다.

| 항목 | 현재 코드·범위 |
|---|---|
| 완료 소유 source | tools/2_5d-world-lab.mjs 54,541 B / SHA256 3463744d4371cc57ce7d50b86161430605d87f46c3be4e27989156d7b754218b; tools/2_5d/interaction-cue-lifetime.mjs 15,046 B / SHA256 37de3f41c96aa59db2ba0777d8928f16f60f6018de6b07bd0e22ad8f52d03e6a |
| public 옵션 | openPointFor=null 또는 함수. 호출 인수는 npcId와 매 호출 fresh frozen {x,y} world foot. resolver 반환값 own-data finite {x,y,z}는 scene XYZ로 그대로 소비하고 openLift를 다시 더하지 않는다. world foot은 ground ring·정렬의 권위값이다. |
| public 실패 격리 | null/throw/accessor/nonfinite 결과는 open 표식만 숨김; approach pool·terrain renderer 유지. snapshot.openPointUnknown=true/reason=open-point-unknown. resolver 없음은 기존 .70 fallback. lifetimeToken은 retire/reset/dispose에서 교체하여 재진입 후 stale publish를 막는다. |
| world resolver | residentCueOwn/residentCueIdentity/residentCueBodyAligned/createResidentOpenPointResolver. 현재 resident 4개 중 unique npcId·visible·동일 world foot·source/display·실제 foot/body 소유관계 확인. 실제 camera quaternion의 up을 사용한다. |
| 배치 공식 | openCenter = footScene + cameraUp × (sceneHeight × pivotY + .015 + INTERACTION_CUE_DEFAULTS.openSize). .015는 보수적 여백 항이며 .045는 기존 삼각형 circumradius; 실제 mesh 하단과의 간격은 투영 geometry로 별도 확인한다. 해부학적 머리나 alpha 상단 인수 아님. |
| NPC별 현재 값 | Haran/Nessa/Dorik sceneHeight=.36, pivotY=1, foot→center=.42 scene. Berin sceneHeight=.21923875432525952, pivotY=1, foot→center=.2792387543252595 scene. source rotation=0만 지원. |
| transform 가드 | scene parent=null 및 scene/resident root identity; foot parent=root/scaleXYZ=1/position=worldToScene 결과. body parent=foot/positionXYZ=0/scaleYZ=1, scaleX는 boolean source.flipX의 ±1과 일치; body quaternion identity. foot quaternion은 camera quaternion q 또는 -q와 최대 성분차 ≤32×Number.EPSILON(7.105427357601002e-15). 지원하지 않는 변형/accessor/nonfinite는 null. 마지막 외부 호출 뒤 transform 재확인. |
| 소유·입력 수명 | resident/terrain/camera/scene/dialogue/lifecycleEpoch/selected actor/rig identity가 현재여야 한다. residentCueGeneration fresh identity를 clearIntent와 열린 closeDialogue에서 교체하여 actor 왕복/닫힘 중 stale resolver를 차단한다. callback 뒤 current 재검사. 추가 RAF/timer=0; Quaternion/Vector3는 resolver별 재사용. |
| 유지 범위 | openSize=.045/openLift=.70, 색0xc8623a 및 기존 pulse/material/order/geometry, 접근 ring, 원PNG/scene/nav/foot-Y정렬/충돌/대화 controller/본편/save 보존. 공개 기본값 일괄 재조정0. |

### 새 의미·실화면 검수의 정확 범위

| 검수 | 관측·판정 |
|---|---|
| 최초 CPU epoch | world52,918 B/39b05f57f16f103c28106532e951fd337bcb04c4120406c2e2d066dc5192f016 + 위 public15,046 B. actual Three+실제 helper/공개 consumer, 5그룹20조건 PASS 뒤 top-four 첫 Float32 1e-8 비교 FAIL1/후속6그룹 미도달/exit1/unhandled0. 최초 delta 원자료 미보존은 UNKNOWN 유지. |
| 제한 CPU 후속 | 같은 중간 source에서 실패·미도달 범위만 7그룹22조건 PASS/FAIL0/미도달0/exit0. 새 관측 Haran 상단차 약1.430511e-8을 독립 Float32 cast 모델로 설명, 최대 잔차1.72e-15. 이전20조건 재실행0. 최초 FAIL을 clean PASS로 교체0. |
| 최종 guard CPU | 현재 world54,541 B/3463744d…의 추가 transform/own-data/최종 callback 가드만 5그룹20조건 PASS/FAIL0/미도달0/exit0. 이전20/22조건 재실행0. 세 결과를 clean 전체 suite로 합산0. |
| 신규 native | 최종source로 actual Chrome1/context1/parent1/순차child2/maxlive1. trusted R 입력 후 실제 render 관측, Haran/Berin 신규2조건 PASS/FAIL0/미도달0/exit0. 기존 identity A/B·focus·size·J/FX suite 재실행0, 추가GPU render0. |
| 실 geometry 간격 | Haran cue하단↔body상단 .021028843224048188 scene / 4.197882828600825 CSSpx; Berin .021028853767265154 scene / 4.1978849332901405 CSSpx. 두 centerResidual=0, 각 실제 GL 프로그램15개 LINK=true/GL error0. canvas CSS1014×698.6875/backing1016×701/DPR1. |
| 보존·종료 | source12/protected9 exact, parent scene/storage exact, mutation/API write/download/pageerror/404=0. trusted pagehide2 뒤 disposed=true/ready=false/RAF=false, 관측된 자원 release attempt 각각1(복수 자원 kind는 개별 수). physical GPU free는 UNKNOWN. |
| root PNG 직접판독 | haran-canvas.png 1,200,071 B/765e79890d5222b8c43768805b072b59a77d294acebaccb63df8603f4b1d5bfb: 현재 pose의 표식 식별·몸 가림 해소 PASS 한정. berin-canvas.png 1,206,276 B/8ec76f2622b3344ce663e4352cd1847bec9bd05486f59818e9eb1809b182b14b: 인접 player와 cue 부근의 시각적 겹침/식별 미감 RETOUCH, mesh 원인분리0. geometry2 PASS를 미감 전체 PASS로 승격0. |
| 원자료 위치 | /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/npc-cue-top-anchor-20261007/. implementation-receipt.json56,565 B/b15396bbc5ed026eef8cf0748647bb05c41dc3b2324caa736001627939bc3098; validation-receipt.json20,154 B/6e5b220b12dd85b387d901a09ea35452adb4cac0e744d2ee09b79839f51ee30f; native-result.json35,210 B/bf5d135337b5c22f85760fa2225979bb729189cb91a006fbdc6ea39ccc33beb0. |
| docs 검색 | 중간 source의 broad250행/26path, 최종 guard targeted2행/2path, 최종 source의 필수252행/26path는 서로 다른 query/epoch 원자료로 구분. 현행 cue23문서 동기화, ownerSTATE/LOG2와 다른 editor 참조1은 보존. 26문서 전체 정독·단일검색으로 과장0. |
| 미인수 | 원화1254→8000확대 흐림/legacy1024 mask 흐림, 전체맵/A급, 실제지형높이, fullPlayerLinked, 같은후보 본편native6, 청취, 실제유품/부탁 durable save 모두 미인수. fixture/독립lab/원자료보존은 본편완료가 아님. |

### MAP PRODUCTION REPORT (§23)

| 구분 | 이번 작업 보고 |
|---|---|
| STAGE | ROOT-NPC-CUE-TOP-ANCHOR-20261007 / 지옥의 틈 기존 world의 NPC 열린 표식 consumer |
| MASTER | silhouette/regions/main route/side spaces 기존 유지. guide full18,392 B/607e36a49a99205be61c0aeedb438da06bffaf13370360acc99fe86be751e80b 및 SSOT_INDEX/stageLOCK 선행 읽기 근거 적용. |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH/major holes 기존 유지·새 geometry/배치0. |
| LARGE | source assets/composites/overlap/repeated silhouette 원PNG/승인원자료 보존·새 원화0. |
| MEDIUM | connections/remaining holes 기존 유지·경로 수정0. |
| GROUND | shadow/contamination/structure integration 기존 유지·색재질 수정0. |
| PLAYABLE | main arenas/travel/breathing/threat/combat readability 기존 유지. NPC 표식 수직 기준만 수정, 전투·충돌·foot 이동 수정0. |
| LANDMARK | primary/secondary/tertiary 기존 유지. |
| CAMERA QA | START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 전수 인수0. 새 실제 Haran/Berin 대화 pose2만 관측, geometry 간격2 PASS; Haran 식별 PASS 한정/Berin 식별 RETOUCH. |
| TECH QA | route/collision 변경0·전체경로 검수0; 실제 pageerror0/4040; seam=NPC별 cameraUp 상단 배치; loading=두 순차 child 실제ready/render; 성능 정량 benchmark0·추가RAF/timer0. CPU3 epoch/최초FAIL/제한후속/native2를 별도 보존. |
| FILES | stage-owned code2+현재docs23, concurrent touched0/unrelated touched0. heldWOLF/STORY 추가접근0, 타인WIP·원PNG/scene/nav/save·보호2_3·Q전용/어택티켓금지 보존. |
| GIT | 이 완료소유 code2+docs23만 정상 stage/commit/push 대상으로 한다. 실제 최종 HEAD/remote exact/NUL/index/foreign68는 같은 외부 폴더 remote-preservation-receipt.json의 검증 결과를 따른다. deploy0. |
| VISUAL VERDICT | RETOUCH. Haran 한정 가독성 개선, Berin 인접 player 겹침 및 전체 확대흐림 남음. |
| NEXT PASS | 현재 개선을 보존한 뒤 Berin 표식과 player의 겹침을 새 소유·수명 계약 내에서 검토. 전역lift 재변경/옛A-B검사 반복0. 맵 선명도는 승인된 원자료·전경/절벽 sampling 소비 경계부터 별도 후속. |

## 베린 표식 회피 후보 미채택·실화면 FAIL 보존 — ROOT-BERIN-CUE-AVOIDANCE-20261007

이 단위는 실제 베린 접근 장면의 겹침을 해소하지 못했다. 후보를 공개 소비자로 채택하지 않고 root 소유 수정 전 fullbyte 백업으로 공개 파일을 정확히 복원했다. 기존 `ROOT-NPC-CUE-TOP-ANCHOR-20261007` 현행 본문·수치·역사 라벨은 그대로 유효하다. Git reset/checkout·삭제·타인 WIP 복구는 수행하지 않았다.

| 구분 | 정확한 상태·핀 |
|---|---|
| 현행 공개 world | `tools/2_5d-world-lab.mjs` 54541B / SHA256 `3463744d4371cc57ce7d50b86161430605d87f46c3be4e27989156d7b754218b`. 소유 사전 백업과 fullbyte exact. 공개 회피 로직 추가0 |
| 현행 공개 cue | `tools/2_5d/interaction-cue-lifetime.mjs` 15046B / `37de3f41c96aa59db2ba0777d8928f16f60f6018de6b07bd0e22ad8f52d03e6a`, 변경0. `openSize=.045`, `openLift=.70`, 색 `0xc8623a`·material/geometry/order/pulse/foot-ring 유지 |
| 미채택 후보 | 외부 `berin-cue-avoidance-20261007/world-unadopted-62789.mjs` 62789B / `6211f0bc0f2539cb422cf22a549918ffdf0a3f8b7cc21bfa7643a737542d3f93`. 후보 존재·CPU 통과는 공개 채택/겹침 수정 완료가 아님 |
| 후보의 기준 A | NPC footScene + cameraUp × (`sceneHeight*pivotY + .015 + .045`). 베린 높이 `.21923875432525952`, pivotY=1, center lift `.2792387543252595`. 다른3NPC의 A 유지. 이 공식의 현행 공개 의미는 이전 top-anchor 절과 같음 |
| 후보의 제한 이동 | 베린·정사영·현재 보이는 canonical SkinnedMesh609/index3360/12bones만. A 기준 right/up 양축 겹침일 때 δL=`minRight-.045-.015`, δR=`maxRight+.045+.015`; cap=`sceneWidth/2+.045+.015` 이내 최소 abs(δ), 동률 왼쪽. 허용 후보 없으면 A. 원형 반경의 보수적 사각형 기준이며 alpha 윤곽/삼각형의 최단 이동이 아님 |
| 후보의 수명·비용 | fresh pose identity/owner/actor/rig/epoch/generation 및 자원 참조·버전을 정점 호출 뒤 확인. 12×16 bone/mesh 행렬값 전수는 최종 측정·게시 직전, malformed/throw 조기 종료 때 확인. stale는 null로 숨김, current unsupported는 A. 중간 변경 후 완전 원복은 미관측. 추가 RAF/timer/rig.update0. 이 후보의 매프레임 비용은 공개 코드에 남기지 않음 |

| 검수 epoch | 실제 근거·판정 |
|---|---|
| 초기 후보 CPU | 62749B / `b2d9ec49f13669fb22b2f2b710b6afbba4cb16e8419d42f9c876d5ef17826c48`의 실제 private helper + Three r160, 8그룹28조건 PASS/FAIL0/미도달0/unhandled0/exit0. 현재 공개 소스의 새 검사로 계산0 |
| 독립 소스 검토 | Codex7 공식 turn `01a1142a-27e1-7d00-a626-20df4e40ad9c`: 행렬값 변경 후 throw/잘못된 반환/nonfinite의 조기 fallback에 full 검증 누락 P2. provider 원문2703B / `5895cb2a2665789450cdc6e5912d39ec82958ad11dbfdc2b646c149c4c36e86f`. 정적 반례, Codex 실행0 |
| 최종 후보 한정 CPU | 조기 종료3곳의 full 검증 최소 보정 뒤 62789/6211f0에서 신규3조건 PASS/FAIL0/미도달0/message getter0/unhandled0/exit0. 구28 재실행0, clean31 PASS 합산0. CPU 물리 실행2회 |
| 최초 실제 native | 물리 Chrome1/context1/parent1/child1/maxlive1, trusted R 뒤 실제 onAfterRender 한 프레임의 현재 warrior609 변형 정점·cue/NPC geometry 관측. 새1조건 0 PASS/1 FAIL/미도달0/exit1: `New avoidance pose did not shift`. 동일 native 추가 실행0 |
| 실제 상한 실패 | 베린 sceneWidth `.2260899653979239` → cap `.17304498269896196`. skin right 범위 `[-.24756335542587582,.29254377373434926]`, up `[-.2017611808480261,.3385331182595573]`. δL `-.3075633554258758`, δR `.35254377373434925` 모두 cap 초과 → δ0/A 유지. 전체 geometry가 투명 여백을 포함한다는 한계이며 정확 alpha 윤곽 측정은 아님 |
| 실제 화면·GPU | 수직 gap `4.1978849332901405` CSS px 유지; 수평 gap `-.29256335542587575` scene / `-58.48091364558178` CSS px. GL program15 LINK=true/error0/contextLost=false. 원 callback·prototype descriptor 복원 exact. source13/protected9 전후 exact. 페이지 오류/HTTP404/mutation/download0 |
| 실패 뒤 경계 | Chrome/context 닫힘 확인. 성공 후 parentScene/storage 비교·trusted pagehide/lifecycle 후검수는 미도달. failure 시 liveChild counter1은 finally 브라우저 종료와 별개 기록. 물리 GPU 회수 UNKNOWN. private pose token은 native observer에서 미노출/미관측 |
| 실패 화면 | `berin-canvas.png` 1206124B / `93ad1cb0b0e95386b525f566e488bf93025a682a8a2aecc702e186ca7d4b105a`. root 직접 판독: 표식/전사 몸 겹침 미해결. 실제 rig frameIndex/crop은 최초 observer에 미보존 UNKNOWN |

모든 외부 근거의 루트는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/berin-cue-avoidance-20261007/`이다. `implementation-receipt.json` 10479B/`efb83bb98d31b7eada4a02ea68648748e64dfc9cc11b4ace1acfb5e0b33c00cf`, `native-result.json`, `unadopted-restoration-receipt.json`으로 후보·실패·공개 복원을 구분한다. owner 0201/0207/0212 새 provider 단일 text14건은 `owner-new-formal-raw/manifest.json` 23592B/`46c9fe53e456e055e5961b5b65c7f537e043e8d622ebc95f1c9bd69bd614993d`에 정확 UUID/시각/bytes/fullSHA로 미채택 보존했다. 전문14 raw 의미 실행/채택0이며 제작14건 완료를 뜻하지 않는다.

후보 최종 소스 시점 docs 검색은 1079행/31경로(`implementation-docs-keywords.txt`1293347B/`52c385ba9e7512b855a3b36c6876da3f165f1b97762c8ba5baecc4d3923dda6d`), 공개 복원 뒤 다른 query/epoch의 필수 검색은1221행/54경로(`docs-post-restoration-keywords.txt`2467655B/`06ef4a36042ece3961cf5d4d4b63aefcbc29f557cf28d31443bc7686341d5b8e`)다. 교집합31/합집합54이며 전체54문서 전수 읽기를 뜻하지 않는다. 관련 현재23에는 미채택·복원 근거만 append하고 다른 mode/과거/owner WIP31은 보존한다. 기존 현재 top-anchor 본문 변경0. 이번 정상 Git 보존은 docs 한정이며 미채택 후보·foreign·owner STATE/LOG·held 후보 stage0; 최종 원격 exact SHA는 외부 `remote-preservation-receipt.json`으로 확인한다.

다음 미완료는 기존 decoded 이미지의 alpha 점유와 실제 UV/index 셀을 이용한 보수적 bounds의 새 소비 계약이다. 현재 source 읽기/원자료 feasibility 단계이며 구현·채택·새 native 인수0이다. 원본 이미지 변경·재생성·매프레임 픽셀 스캔·상한 임의 확대를 완료 방안으로 간주하지 않는다. 원화1254→8000 확대·legacy1024 mask 흐림, 본편 native6/청취/실보상save·A급 완성은 계속 미인수다.

새 source 계약은 Codex7 turn `01a1142f-cc5c-7dd2-ac7f-e46332f1a6e8`의 provider 원문3681B/`b98dcb9125002ab29778dd2bb88ee2747255922e919d620c47517aa9331906c9`에 보존했다. 읽기 시작 world62789→종료54541의 root 의도 복원을 핀 변경으로 기록했고 종료 world 재검토0이다. 안정 rig11211B/`d3ec77150627c6cf9ff4c9d4ed97a0015f78df9e5590b3fca595f5374587fa14`·catalog9338B/`990e9c6cb81e0c573a8bc3dd6223ee21184e4692af47576078495fabd685f66a`에서 기존 `texture.source.data`의 decoded Image와 실제 UV/texture matrix를 활용할 접점만 확인했다. alpha 공개 API·새 코드·실행0이다. rotation0/flipY=true/inset.5의 제안 매핑은 pixelX=`frame.x+.5+u*(frame.w-1)`, pixelY=`frame.y+.5+(1-v)*(frame.h-1)`이며 geometry/frame/filter/owner/pose의 새 소비 검수가 필요하다.

대표 원자료 feasibility는 native 실패 frame과 별개인 canonical warrior/idle/south frame0, `img/exoduser_warrior/south.png`1008×48/32485B/`d04c5a3e7831b4a349908a5f31361c39f9993e5fdccc5f792585bce8e601d467`, crop(0,0,48,48)만 측정했다. 첫 준비는 복원 world 핀 전달 누락으로 FAIL(exit1), PNG decode0/수치 미도달; 조건을 한정 정정한 후 실제 첫 PNG decode1은 exit0이다. RGBA8/color6/noninterlaced/CRC3 확인, alpha≥21 픽셀398개·alpha>0=516개·alpha255=179개, bbox x[11,33)/y[14,46). source-local20×28 직접 coverage130셀/활성 corner164개, 한 grid-cell 여유196셀/활성 corner230/609개(cols3..15/rows7..28)다. 실제 UV·skinning·현재 frame·cap 분리 인수가 아니며 대표 raw와 현 native를 동일 frame으로 추정0. `opaque-feasibility/feasibility-receipt.json`5581B/`6743895089c55a37b871918116c81de05ba63a9654843c1603203d469e788539`, `alpha-grid-followup-result.json`19139B/`dcb0cc3d8f13eba77476a985b57df2898f182492ccea922f4f46fc6a8496bbaa`에 준비 실패와 최초 실제 측정을 별도 보존했다. 제품·이미지 변경/Chrome/추가 PNG 측정0.

```text
MAP PRODUCTION REPORT
STAGE: ROOT-BERIN-CUE-AVOIDANCE-20261007 미채택 후보의 실제 FAIL 및 공개 복원
MASTER PLAN: full guide18392B/607e36a49a99205be61c0aeedb438da06bffaf13370360acc99fe86be751e80b·SSOT_INDEX/stageLOCK 선행 적용; 기존 silhouette/지역/main route/side space 보존
LARGE OUTER MASS / MEDIUM CONNECTION / GROUND CONNECTION: 원 PNG·scene·nav·geometry·발 위치 변경0, 새 인수0
PLAYABLE / COMBAT: 기존 host 접근 setup와 trusted R만; 원본 route·전투·획득·save 인수0
LANDMARK / CENTER / SMALL DETAIL: 기존 배치 유지; 베린 cue 회피 후보는 미채택·공개 사전 백업 exact 복원
CAMERA QA: 실제609 geometry의 cap 초과로 수평 겹침 미해결, 첫1조건 FAIL 동결
TECH QA: 초기CPU28/최종신규3/native0PASS1FAIL 별도; source13/protected9 exact; 후검수 미도달 보존
FILES / GIT: 외부 exact 후보·실패·복원 영수증 + 관련 docs만 정상 보존; 공개 code delta0/미채택 코드 stage0
VISUAL VERDICT: RETOUCH — 전체맵 및 베린 겹침 미해결. 회피 geometry Gate FAIL
NEXT PASS: alpha-aware 보수적 셀 점유 source/API 계약·원자료 수치부터 새 단위 검토; 기존 검사 자동 재실행0
```

추가 cap source/수학 검토 `CODEX7-BERIN-OPAQUE-CAP-FEASIBILITY-20261007`(공식 turn `01a11435-5732-7c21-83d8-6bdf85811169`)의 provider 단일 원문은 `codex-opaque-cap-official-end.txt` 3303B/`f45694b428a15585a3676f77e86364d3636d1c95c11f130ad98737f9c8011d88`에 미채택 보존했다. A 기준 수평 bounds [L,R], NPC 반폭 h, r=.045/m=.015/cap=h+r+m인 기존 보수적 사각형 모델에서 겹침 시 왼쪽 가능 조건은 L≥−h, 오른쪽은 R≤h다. L<−h 및 R>h이면 양방향 cap 초과이며, 중심 q=(L+R)/2·반폭 b=(R−L)/2의 가능 조건은 b−|q|≤h다. 최초 실패 전체 geometry 값으로 계산한 한쪽 edge의 필요 축소는 약 .134518/.179499 scene이며 alpha 적용 결과가 아니다. 실제 direction/frame/elapsed/pose/발/A를 고정한 새 alpha 투영 가능성 Gate를 통과한 후보만 새 화면 검수 대상으로 삼는다. 실제 실패 frame UNKNOWN·대표 raw 동일 pose 추정0·cap 새 값 확정0·새 코드/CPU/GPU/Chrome/전문송신0이다. 기존 정책 유지·별도 유한 outreach·유효 위치 없을 때 open 숨김의 대안은 모두 미확정 제안이다.

### 2026-10-07 ROOT-MAIN-RIFT-VIEW-CONSUMER-20261007 · 본편에서 지옥의 틈 둘러보기

기존 클리어 후 다음 구역 경로와 별개인 표시 전용 진입을 실제 main에 추가했다. 아래 현재 예외가 앞선 clear-only 시점의 기록을 덮어쓰지는 않는다. 본편 진행·저장 권한은 그대로다.

| 항목 | 현재 계약·근거 |
|---|---|
| 노출 | 실제 main의 origin이 http://127.0.0.1:3387이고 ch1RiftView=1일 때만 생성한다. 기본 OFF이며 기존 로비 carry4에 포함하지 않는다. 설정 메뉴·OPT·BINDS 저장 항목이 아니다. |
| 진입 버튼 | root-rift-view-open, native button type=button, 지옥의 틈 둘러보기. fixed left18px/bottom150px/z-index75, minHeight44px, padding10px 16px, border1px, radius7px, font600 14px system-ui. 설정 footer에는 넣지 않는다. |
| 버튼 입력 | mousedown은 preventDefault+stopPropagation으로 기존 window MB arming을 막는다. Enter/NumpadEnter/Space의 keydown·keyup은 stopPropagation만 하여 브라우저 기본 click을 허용한다. Tab·키 재지정 정책은 그대로다. |
| 실제 admission | enabled/notdead/visible, view job과 clear job이 없고 P/G 존재, G.on===true/G.paused===false, stage0/nonarena/stageCleared===false, P.s===idle와 finite hp>0, charIdx0 또는1, _parryLesson.active 아님. 버튼 자체를 이 admission에 맞춰 숨김/disabled로 갱신하는 구현은 아니다. |
| 부모 소유 | await 전에 _rootRiftViewJob을 게시하고 G.on=false. P/G/map/stage/charId/charIdx/status/paused/기존 stage epoch와 새 viewToken을 캡처한다. view epoch는 새 entry 때 증가하며 _rootRiftViewSame으로 현재 job/부모를 확인한다. |
| 공개 host | createMainRiftViewHost({window,document,readContext}) → frozen {openView,cancel,dispose,snapshot,parentEvent}. 기존 createMainRiftHost의 clear-only admission은 별도 유지한다. view는 main-rift-runtime/gate/checkpoint/Continue/schedule을 거치지 않는다. |
| readContext | own plain {player,character,stage,context,on,stageCleared,status,map,viewToken}. 실제 stage0/onfalse/stageClearedfalse를 전달하며 가짜 클리어를 만들지 않는다. game은 정확한 127.0.0.1 origin을 요구하고 public view host는 로컬 localhost 또는127.0.0.1:3387을 허용한다. |
| child 표시·ACK | 기존 tools/2_5d-world-lab.html에 main-character=warrior 또는silvertail과 view-only=1을 전달한다. initialCharacter/initialCharacterReady/selected 정확일치 및 viewOnlytrue/durableWritesfalse/parentStateLinkedfalse를 확인한다. 전체 P/G·장비·퀘스트 상태 전달은 없다. |
| 사용자 화면 | view-only만 header/footer/aside를 display:none으로 감춘다. main은 padding/margin0·max-width해제·100vh, stage는 width/height100%·aspect-ratio auto·border/radius0. 실험조작 DOM은 보존하지만 화면 선택 접근은 감춘다. 일반 standalone/clear host의 해당 화면 배치는 바꾸지 않는다. |
| 접근성·리프 문구 | stage aria-label 지옥의 틈. canvas는 기존 WASD/방향키·Shift·J·R와 Escape 전투 복귀를 안내한다. loading-title 지옥의 틈으로 들어갑니다, loading-detail 공간을 준비하고 있습니다. legend는 리프일 때만 기존 조작과 Esc 복귀를 표시한다. 물리·rig·NPC·API는 그대로다. |
| host 문구 | 제목 지옥의 틈, iframe title 지옥의 틈 둘러보기, 준비 공간을 준비하고 있습니다., ready WASD 이동 · R 대화 · Esc 돌아가기, 종료 버튼 전투로 돌아가기. 주요 흐름에는 standalone 실험 조작·기술 표시를 드러내지 않는다. |
| ESC 우선순위 | ready 이후 view host가 child capture keydown을 설치한다. nonrepeat Escape를 preventDefault+stopImmediatePropagation한 뒤 child-escape로 본편에 즉시 귀환한다. 이 경로는 child NPC 대화의 Escape보다 우선하며 view-only에만 적용한다. 기존 standalone/clear host Escape는 그대로다. |
| 입력 격리 | 기존 _rootRiftBlock가 view 소유 중 update/facing/gamepad poll·key inject/direct held/auto nextStage를 차단한다. 부모 capture quarantine는 view host의 native controls로 전달한다. 진입 시 _rootRiftClearHeld를 재사용하고 held·패드축·aim 상태는 복원하지 않는다. G.paused는 직접 쓰지 않는다. |
| release 보정 | current/nonclosed/nonreleasing job만 받으며 j.releasing=true를 먼저 설정해 lease를 유지한다. 시작 currentSame일 때만 clearHeld하고 finally에서 currentSame을 재확인한다. 여전히 current job일 때만 closed/detach/reason을 쓰며 restore&&safe인 경우 캡처한 j.context.on만 previousOn으로 복귀한다. releasing 중 Block은 true다. |
| 취소·포커스 | init/retry/char/lobby의 기존 invalidate, visibility hidden/pagehide, 늦은 import/handle에 현재 identity 경계를 적용한다. host는 entry 당시 activeElement를 캡처해 connected/sameContext인 경우 복귀한다. mouse launch의 preventDefault 때문에 항상 launch button으로 복귀한다고 주장하지 않는다. |
| 소유 자원 | host timer clear·child ESC listener 제거·iframe about:blank·자기 dialog 제거와 child 기존 pagehide cleanup을 사용한다. 기존 timeout30000ms/poll100ms 유지, 추가 renderer/RAF 소유0. 실제 종료 표본은 timer0/iframe0이었다. |
| 저장·진행 권한 | view 경로의 checkpoint/dbSave/reward/quest grant/clear/nextStage 호출0. child 이동·대화는 독립 session이며 본편으로 보상·퀘스트·저장을 전송하지 않는다. initial class 문자열 표시 연결만 제공하며 fullPlayerLinkedfalse/durableSaveAcceptedfalse다. |
| 격리 한계 | 동일 origin iframe은 보안 sandbox가 아니다. 이 단위는 협력하는 표시 소비자의 포트/수명 경계다. 진단상 writes0를 실제 backend 저장·보안 검증 완료로 해석하지 않는다. |
| 불변 | 원PNG/scene/nav/발 좌표/geometry/카메라/rig motion/부모 전투·AI·클리어·nextStage·5000ms/900ms 기존 진행 계약은 변경하지 않는다. 기존 game foreign185 B와 설정3.3 foreign2948 B는 미채택 보존한다. |

현재 source 핀

| 항목 | 현재 계약·근거 |
|---|---|
| game.html | 4098926 B / SHA256 229d570440c0199e5d73c661817ec0e909f865de9cd3f0724ea0c6fcbd9e6949 |
| tools/2_5d/main-rift-host.mjs | 21121 B / SHA256 e6438f8651638bfe7b35b241b1d01a1fe69cba6362808eca7c3322198f3ba3b2 |
| tools/2_5d-world-lab.mjs | 55664 B / SHA256 082e75e14a01bb56819173d8cfc43fc41b35d7fe94f4613502153136af4bb9f1 |
| game ROOT owned | 4098741 B / SHA256 422bd8c9f4272bb3e978c69db9cff9d291e233976774b16ecfbfed496e178995; working의 기존 foreign185 B는 미채택 보존 |

검수는 source/범위별로 분리한다.

| 항목 | 현재 계약·근거 |
|---|---|
| 준비·구문 이력 | 초기 seam 준비 assertion은 repoWrite0. game4098489/f592의 괄호 오류는 정적 source 구문 결함 발견이며 Nodeparse0/제품VM0/native0다. 1byte 교정4098488/75c197도 CPU0 이력이다. 실행 parseFAIL로 기록하지 않는다. |
| 이전 root CPU | launch 입력 보강 뒤 game4098783/2d2 source의 최초7그룹48조건 PASS. release guard 이전 source의 이력이며 최종229d 검수로 소급하거나 재실행하지 않는다. |
| host CPU | host21121/e643 source의 actual module+통제DOM 신규9그룹41조건 PASS. 실제 WebGL/native 검수와 별개다. |
| 최종 release CPU | game4098926/229d source의 한정3그룹8조건 PASS. 이전48·host41과 clean 전체 합산하지 않는다. |
| 새 native 범위 | headed Chrome1/context1/page1/maxLivePage1/child동시1의 최초3조건 PASS, FAIL0/setupFAIL0/미도달0/exit0. main button→child 실제 표시/이동→Escape 귀환과 부모W 재개만 새 인수다. |
| 위치·부모 표본 | child x5480/y3740→y3612.6260000000016(modewalk/frames109). 부모 P x4020/y7420/sidle/hp542는 귀환까지 같고, 실제W 재개 뒤 y7368.796899999992였다. 같은 P/G/map 및 적·진행·저장 표본 보존을 관측했으며 모든 상태의 보존을 전수 증명한 것은 아니다. |
| 새 화면 표본 | controlsHidden true, child stageHeight612=viewportHeight612. root가 open/moving/return PNG3을 직접 판독해 실제 둘러보기·감춘 기술조작·이동 몸체·복귀 HUD/body 가시성만 한정 확인했다. |
| 오류·요청 | pageerror0/HTTP오류0. requestFailures5는 외부 font 의도 차단3과 local intro.mp4 abort2이며 후자 직접원인은 UNKNOWN. 모든 API는 합성 응답으로 격리, 합성 POST/api/mats1 forwardedfalse, save0/childAPI0/usersave0/durableACKfalse. context/browser closedtrue. |
| 미인수 | native GL·물리GPU 해제 UNKNOWN. 실main 전체 진행/native6/청취/실세이브/A급 미인수. 해부학적 발·전8방향·주민 전체 경로·물리 높이 미인수. 원화 확대 흐림·작고 어두운 몸·복귀 bonfire/portrait/FX 중첩이 남아 전체 VISUAL VERDICT RETOUCH. |

| 항목 | 현재 계약·근거 |
|---|---|
| 최종 검증 | /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/main-rift-view-consumer-20261007/validation-receipt.json — 6098 B / bb2a1e51265689353d7c48d5194d230a8ae84e69fbda94ff4ddf4462602a1143 |
| root 시각 판정 | /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/main-rift-view-consumer-20261007/visual-verdict.json — 5427 B / 92a3c8e40dc51f2e286e328f87ad14f7b8e099f0edc4a5ec505604f2219ca4b1 |
| 최초 native 원자료 | /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/main-rift-view-consumer-20261007/native-first-only/result.json — 137809 B / 1c3c70bf9287530f3eef94702a8068e0dd8cf7ce9ff6c0d10041b857cacac50d |
| 검색 범위 | 관련키워드 전체 검색1회:32경로/1007행/1118 occurrence. release 한정delta1회0매칭, child presentation 한정delta1회는 외부 검색영수증 값. 보호2_3 본문1경로/owner STATE·LOG6경로는 제외·path-only. archive 텍스트 일괄제외0. matching32문서 전부 full-read했다고 주장하지 않는다. |
| 보존 상태 | 코드3+현재문서8의 정상 stage/commit/push는 root 소유로 예정. 현재 문서 작성자는 Git쓰기/CPU/Chrome실행0이며 자기 commit SHA를 추정하지 않는다. |


### 2026-10-07 ROOT-MAIN-RIFT-NPC-PRESENCE-20261007 · 둘러보기 주민 접근 안내

새 stage 안내는 기존 dialogue.nearest(dialoguePlayer)와 현재 view를 읽는 표시 소비자다. 기존 aside 숨김/초기 class 표시/부모 lease/ESC 복귀는 유지하며, 이번 소스와 검수 결과가 이 안내 계약의 최신값이다. 다른 문서의 ROOT-MAIN-RIFT-VIEW-CONSUMER 핀·native3은 그 이전 TASK의 이력으로 보존한다.

| source | bytes | SHA256 | 이번 변경 |
|---|---:|---|---|
| tools/2_5d-world-lab.mjs | 56848 | 9dd71e4a9cbc898e4b7a20610735f78feee668dab723c67b25f431bafe005dd8 | stage 안내 leaf·표시/숨김·canvas focus guard |
| game.html working | 4098926 | 229d570440c0199e5d73c661817ec0e909f865de9cd3f0724ea0c6fcbd9e6949 | 이전 view unit 소스 그대로; foreign185 미채택 보존 |
| tools/2_5d/main-rift-host.mjs | 21121 | e6438f8651638bfe7b35b241b1d01a1fe69cba6362808eca7c3322198f3ba3b2 | 이전 host 그대로 |

| 표시 계약 | 현재 값·경계 |
|---|---|
| 생성 | viewOnly=true일 때만 .stage에 div#view-npc-prompt.view-npc-prompt를 append. initial hidden=true; role=status; aria-live=polite. 일반 standalone/clear host와 기존 #npc-near·API는 유지. |
| 원본 소비 | updateDialogue의 기존 nearestNpc=dialogue.nearest(dialoguePlayer) 뒤 updateViewNpcPrompt(view)를 호출한다. 원 range140/segment20/nav radius12·주민좌표를 바꾸거나 별도 nearest를 만들지 않는다. |
| 문구·노출 | `${nearestNpc.name.ko} · R로 대화`. ready && !paused && !error && !disposed && !contextLost && !document.hidden && document.hasFocus() && activeElement===world-canvas && !view && nearestNpc. |
| 숨김 | 조건 불충족은 hidden=true/leaf빈값. clearIntent/stopFrame/fatal report에서도 숨기며 dispose는 기존 stopFrame 경로를 따른다. 기존 leaf()의 children.length===0 가드를 사용한다. |
| CSS 배치 | position:absolute;bottom:70px;left:50%;transform:translateX(-50%);max-width:calc(100% - 32px);padding:10px 16px. |
| CSS 표시 | background:#101914ed;border:1px solid #d2ba83;border-radius:6px;color:#ead9ab;font-size:14px;text-align:center;pointer-events:none. 클릭버튼/44px 입력 target이 아니다. |
| 시간·포커스 | 기존 time-lastUi >180ms 주기여서 이탈 직후 이전 힌트가 잠깐 남을 수 있다. R admission은 fresh 위치를 확인한다. 문서 포커스만으로는 canvas-only R를 받을 수 없어 activeElement 조건을 추가했다. |
| 그대로인 권한 | R/Escape·부모 lease·대사/선택지/controller·보상/quest/sessionMap/save·nav/start·원PNG/scene·actor/body·카메라 변경0. 추가 RAF/timer0. |
| 중간 이력 | 56804/d975ad28은 document.hasFocus만 있던 런타임 전 중간핀. 44B focus guard 추가 후56848/9dd71e4로 동결했다. 이전핀 결과를 최종 검수로 소급하지 않는다. |

| 검수 epoch | 실제 결과·미인수 |
|---|---|
| ROOT CPU | 최종9dd source actual 함수/통제DOM 신규4그룹27조건 PASS, FAIL0/미도달0; 동적21/정적6, VM21. 물리Node2=준비pin 실패1(productVM0)+실검수Node1, GPU0. |
| ROOT native | 최초 headed Chrome1/context1/page1/maxLivePage1/child동시1. N1 근접 안내 PASS, N2 정본Dorik R대화·명시닫기·canvas focus·안내복귀 PASS. 이어 parent whole localStorage assertion FAIL1/exit1. manual host return 및 post-return 검사는 미도달. raw의 미완료 복합검사1을 N3 전체 미진입으로 읽지 않는다. 추가Chrome0. |
| 자연 보행 | 원래 시작(5480,3740)→도릭접근9구간→이탈2구간, 전체11구간 blocked0·teleport0·classSeed0. 도착(5187.3775169021155,2545.8089102189833), nearestNpc=rift-prepare-dorik. 이탈(5314.405055520887,2746.6504488377427), nearestNpc=null. 네주민 전체 경로 인수는 아니다. |
| 실패 전 부모 표본 | on/paused/stage/stageCleared/bossAlive/bossArena/P/mats/exp/kills/regions/bag 표본을 storage 실패 전에 검사했다. 최종 부모 identity와 manual return은 미도달이므로 부모 전체수명 보존을 주장하지 않는다. |
| 저장 실패 | fresh context의 hellsave_demo 변경을 관측해 storageFreezeAccepted=false. 직접 writer/stack/시점 원인은 UNKNOWN이며 소스 리뷰 대기다. savePOST0과 localStorage 불변은 다른 주장이다. |
| 오류·격리 | pageerror0/HTTPerror0. requestFailures5=외부font 의도차단3+local intro abort2(직접원인UNKNOWN). 모든API합성, matsPOST1/forwardedMutations0/savePOST0/childAPI0/durableSaveACKfalse. browserclosed=true. GL/물리GPU해제UNKNOWN. |
| root 시각 | dorik-near-prompt.png와 dorik-dialogue.png 직접판독2. 금색 이름/R와 정본대화/선택지는 보인다. 작고 어두운 몸·주민/플레이어 겹침·1254→8000 확대 및 기존mask 흐림·이 포즈 cue/body 겹침이 남는다. cue 원인 mesh 분리검수는 하지 않았으며 후보 미채택. |
| 합산·완료 경계 | 새CPU27/native2PASS1FAIL과 기존view native3/host9·41/release3·8/cue/focus 검사를 clean 합산하지 않는다. native6/청취/실save/durable보상/해부학발/물리높이/전8방향/전체route/A급 미인수. 전체 VISUAL VERDICT RETOUCH. |

| 근거 | 정확 핀 |
|---|---|
| validation-receipt.json | 4086 B / 7ba0ded21eb3d7b97013b45cda9ec2bcd3f32e0c616c09deaf08d7b5cac9ebfe |
| visual-verdict.json | 2361 B / ce12d93e67c19ab86e362c17f172b32205eca533154fec958532d4663b0c9114 |
| CPU execution-receipt.json | 2396 B / cd1a860fb0320d458ada70d9129781bce58e4b25e1caf2ed096ff31f90c6006e |
| native-first-only/result.json | 70848 B / 927db63cdcb3ce3997749656914be81b5ddfe4b912c96310b44af40aa7b86a64 |

근거 루트는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/main-rift-npc-presence-20261007/`다. 문서 담당자는 지정 source/receipt와 필요한 정본만 읽었고 제품CPU/Chrome/Git 실행0이다. 신규 whole docs 검색1회는29경로142행142occurrence이며 보호2_3/owner 거대STATELOG 본문 제외·텍스트 archive 포함이다. 이를 29문서 전체 완독으로 표시하지 않는다. 새4정본이 현재 안내 계약을 우선하며 MASTER/SSOT의 직전TASK fullprefix는 그대로 보존한다. 정상 Git checkpoint는 root 후속 소유이며 완료SHA를 미리 적지 않는다.


### 2026-10-07 ROOT-MAIN-RIFT-SAVE-ADMISSION-20261007 · 저장 대기 후 둘러보기 입장

앞 NPC 접근 단위의 저장동등성 실패를 완료로 덮지 않고, 부모의 알려진 저장 예약/진행이 남아 있을 때 view 입장을 기다리는 별도 consumer를 추가했다. 이전 ROOT-MAIN-RIFT-VIEW/NPC-PRESENCE 핀·결과는 각각 해당 epoch 이력이며 아래가 현재 save-admission 계약이다.

| source | bytes | SHA256 |
|---|---:|---|
| game.html working | 4100302 | 4166ed4b16d62fa87a47c39218553a3827a320b51c29cc553c64854901333c19 |
| game.html root owned | 4100117 | 1228f7c536cded491fc36b5c683322e7144fcc126922a8a65e1f3d23d33fe74f |
| tools/2_5d/main-rift-host.mjs 그대로 | 21121 | e6438f8651638bfe7b35b241b1d01a1fe69cba6362808eca7c3322198f3ba3b2 |
| tools/2_5d-world-lab.mjs 그대로 | 56848 | 9dd71e4a9cbc898e4b7a20610735f78feee668dab723c67b25f431bafe005dd8 |

| 소비자 계약 | 현재 정확 값 |
|---|---|
| scope | 기존 http://127.0.0.1:3387 && ch1RiftView=1/defaultOFF/carry4제외. view·clear host의진행권한은별도유지. |
| busy | `!_rootRiftViewSaveStateReady || !_dbReady || _rootRiftViewBootSaves.size!==0 || !!(_saving || _saveDebounce || _pendingForce || dbSaveNow.pending)`. ready는false로시작해_pendingForce 초기화직후true여서 lexicalstate접근순서를보호한다. |
| 예약 | 기존3000ms boot저장4곳을 wrapper로소비. OFF는원setTimeout. ON은각고유ticket을Set에추가하고timer의await dbSave finally에서해당ticket만삭제. 저장취소/강제호출추가0. |
| 입장 | 기존admission뒤 busy면 reason='save-pending'/false. job생성·G.onfalse·hostopen보다앞이다. |
| 버튼 | connected/live일때 disabled=busy||owned; owned '지옥의 틈 둘러보는 중' 우선, busy '저장 중 · 잠시 기다려주세요', 그외 '지옥의 틈 둘러보기'. children.length===0 leaf만변경. 생성직후/기존Block에서갱신·추가제품RAF/interval0. |
| readonly | __riftMainView.snapshot().saveBusy/pendingBootSaves. 기존saveWrites0/durableSaveAcceptedfalse는해당view권한이며부모전체storagefreeze/실ACK증거아님. |
| 보존 | 기존500ms debounce/5000ms force/pendingdrain/dbSave/schema/API/backend·부모lease/clear/nextstage/보상·quest·child대사/R·nav/scene/원PNG/actor불변. gameforeign185·설정3.3foreign2948미채택보존. |
| 한계 | 입장전knownpending의검사다. 소유중임의writer/다른document/globalstorage lock/외부실save격리보장0. dbSave return/Promise settle는durableACK아님. |

| 새 검수 | 실제 결과·범위 |
|---|---|
| CPU | actual전체함수+통제DOM/timers/Promise/import. Node1/VM18/4그룹20PASS=동적18+정적2, FAIL0/미도달0/unhandled0/exit0. realbackend/native/GPU아님. |
| native 실제수 | 최초headed Chrome1/context1/page1/child1/maxLivePage1/maxLiveChild1, 새3조건PASS/FAIL0/미도달0/exit0. |
| S1 | 자연boot pendingBootSaves1·disabled에서settled0·enabled로전환관측. |
| S2 | admitted view후8초의부모P/G/map/적/진행과freshcontext저장표본exact. 해당기간표본이지보편적no-write보장아님. |
| S3 | manualreturn·같은부모identity·hosttimer0/iframe0/buttonenabled관측. |
| 과거실패 | 이전NPC native N1/N2 PASS 뒤hellsave_demo동등성FAIL1/hostreturn미도달/exit1은동결. 도릭route재실행0·새20/3과clean합산0. 당시writer직접원인미확정. |
| 오류·격리 | pageerror0/HTTPerror0; requestfail6=font의도차단3+introabort3직접원인UNKNOWN. API합성matsPOST1forward0/savePOST0/childAPI0/usersave0/durableACKfalse. context/browserclosed·GL/물리GPU해제UNKNOWN. |
| root 시각 | save-admitted-rift.png 859587 B/c19efb7d81adb4822d4dc994aa48d295704ab0383e075aff3e49966c17557dbc 직접판독1. 원래시작의전사/pet/복귀버튼·힌트표시한정. 배경확대흐림·작고어두운몸으로전체RETOUCH. |
| 미인수 | samepose미감A/B·전체NPC왕복·발/물리높이/전8방향·native6/청취/실save/durable보상·quest/A급완료0. |

| 근거 | bytes / SHA256 |
|---|---|
| implementation-receipt.json | 3635 / c65613a24be2f3fbf4c54b5313b6addbff13b36c74b510467bb1b059a51d42ba |
| cpu/execution-receipt.json | 2054 / ace436bc67115d315130a2ba6049059c534dfaa6e1ac4853896efa95c7a85e89 |
| native-first-only/result.json | 19926 / 5cc2c3743b280e56c2bae05b13085e3a090f7ee636d7e7485ed3753087ab9d03 |
| validation-receipt.json | 3944 / 0ce77c95729de88a110d846f0f6a3db23d9b82ddda3177e9657057ebe5467d64 |
| visual-verdict.json | 4201 / 6b85abdb5e06776a0f4805d7b16428c91ee787e2be5c4c064b16437b8bcfc597 |

근거 루트는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/main-rift-save-admission-20261007/`다. Codex147 actualsource 정적review finding0은별도원문1033 B/518bda627967240e0216f6652ed11f48bf249aef72534af700f765b2b2b937c9이며실행PASS대체아님. 다른raw11은미채택이다. 준비단계의잘못된primary경로읽기실패1(write0)/Codex원문수집Pythonencoding실패1(rawwrite0)은제품FAIL로합산하지않는다. 신규whole docs검색1회는16경로39행51occurrence·보호2_3/owner거대본문제외·텍스트archive포함이며전수완독아니다. [저장primary](<../15 세이브+데이터구조/15 세이브+데이터구조.md>) / [§23전체보고](<../4.1맵디자인+설정/HELL_RIFT_2_5D_SLICE_20261006.md>). 본문원prefix/옛epoch유지·문서담당제품CPU/Chrome/Git0·root정상checkpoint예정.


### 2026-10-07 ROOT-MAIN-RIFT-NPC-PROMPT-FRESHNESS-20261007 · 주민 접근 안내 잔류 숨김

최종 `tools/2_5d-world-lab.mjs`는 **57096 B / SHA256 `d07e5520564dde709cb0e2469315e14f620e12bc950b6de29a0b22444148c255`**다. 기존56848/9dd71e4의180ms 잔류 설명과 당시 검수 결과는 그 source epoch의 이력으로 보존하며, 이 새 절이 현재 안내 갱신 계약을 우선한다.

| 항목 | 현재 계약 |
|---|---|
| 이름·표시 주기 | 기존 `time-state.lastUi >180ms` UI 주기를 유지한다. 새 대상 이름을 매프레임 즉시 표시한다고 보장하지 않는다. |
| cue 결과 | `pose(dt)`가 기존 `interactionCue.update`의 frozen snapshot을 반환한다. frame은 local `promptCue=null`로 시작하고 재생 중 move/pose 뒤 반환값을 받는다. |
| frame말 대조 | 유효한 frame에서 기존 updateUi 뒤·다음 RAF 예약 전에 검사한다. `active===true && disposed===false && approachVisible===true && nearestNpc && approachNpc===nearestNpc.npcId`를 모두 충족해야 이전 안내를 유지하며, 나머지는 view-only `#view-npc-prompt`를 숨기고 leaf를 빈 문자열로 만든다. |
| 대상·수명 | cue에는 이름이 없어 기존 nearestNpc의 이름을 쓴다. cue 누락/비활성/대상 불일치 및 paused frame의 null은 숨김 대상이다. 기존 clearIntent/stopFrame/fatal/dispose·canvas focus·대화닫힘 노출 가드는 유지한다. epoch 중단으로 frame이 일찍 끝난 경우 전체화면 최종숨김까지 새로 보장한 검수는 아니다. |
| 그대로인 계약 | CSS bottom70px/font14px 등 기존배치·주민좌표·nearest/range140/segment20/nav radius12·R fresh admission·대사/controller/보상/quest/save·카메라는 그대로다. 추가 nearest 탐색/입력/RAF/timer0. |

| 검수 epoch | 한정 결과 |
|---|---|
| 신규 actual-source CPU | Node1/VM20·5그룹22조건 PASS(동적20/정적2), FAIL/미도달/setup/unhandled0·exit0. 실제 pose/frame/hide/leaf 경로를 통제DOM·cue/rig/effects/renderer/RAF기록 ports로 소비했다. full cue GPU·전체 updateUi/dialogue/route·fatal lifetime 검수는 아니다. |
| 신규 실제 화면 | 최초 headed Chrome1/context1/page1/child1/maxLive1·새2조건2PASS, FAIL/setup/미도달0·exit0. 추가실행0. 기존11waypoint는 setup뿐이며 옛route/dialogue/8초/saveGate assertion0이다. CPU22와 native2 또는 옛결과를 clean suite로 합산하지 않는다. |
| firstOut | frame797/time7464.2/lastUi7289.1로 age175.1ms. cached nearest는 도릭이지만 cueVisible=false/cueNpc=null이며 promptHidden=true·promptText="". staleCacheObserved=true/uiNotRefreshed=true로180ms UI 갱신 전 숨김을 관측했다. |
| 직전 관측 | frame796/time7455.7에서 도릭 cueVisible=true·promptHidden=false였다. firstOut의 exactframe 근거는 readonly post-RAF telemetry다. after-out PNG는 그첫frame을 정확촬영한 자료가 아니다. |
| 격리·오류 | source4 HTTP/local exact(검증원문 HTTPSourcePins=8). pageerror/HTTPerror0. requestFailure5=외부font 의도차단3+localintroabort2(직접원인UNKNOWN). matsPOST1 합성/forward0/savePOST0/childAPI0/user-save0/durableACKfalse. context/browserclosed·PTY79638 종료/exit0. GL/물리GPU해제UNKNOWN. |
| 시각·미인수 | root PNG2 직접판독. 근접안내와 이탈후 숨김은 보이나 배경확대흐림/근접NPC·플레이어겹침은 남는다. 전체RETOUCH, 해부학발/전8방향/물리높이/native6/audio/saveACK/A급 미인수다. |

| 근거 | bytes / SHA256 |
|---|---|
| implementation-receipt.json | 708 / 5479db5853966484df0d9e361d92bfe54ad83175e9796af3a2ac9928713f2341 |
| validation-receipt.json | 4678 / af4563131e07122a0660430e4806110ea2d6f1e3944ad5b337418a23f6e2c0e2 |
| visual-verdict.json | 3740 / b94464fbbd070403adc41faed41fbf50ccb64407489cab3845ac3aaaf67cddfc |
| cpu/execution-receipt.json | 2540 / 7460a8e22daf0dad970a768cc61a49bfe347e7d95a505378c7ce1d5e79ef8a1c |
| native-first-only/result.json | 87839 / e8971a8ca7eedc2f6c33e1076de9bb2982b9fe78ee9d71d9b83fbc74796faec8 |

근거루트는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/main-rift-npc-freshness-20261007`다. old9dd NPC검수와game4166 저장대기검수는원래epoch로보존하고소급성공/재실행/합산0. 코드후whole docs검색1회는42경로98행107occurrence이며보호2_3/owner거대본문제외·텍스트archive포함이다. 42문서전수완독을주장하지않는다. 문서준비nonUTF8parse1/write0→ASCII정정1은제품실패가아니다. 원fullprefix보존·문서담당제품CPU/Chrome/Git0·root정상checkpoint예정. [§23전체보고](<../4.1맵디자인+설정/HELL_RIFT_2_5D_SLICE_20261006.md>).

### 2026-10-08 ROOT-MAIN-RIFT-VIEW-ZOOM-CONSUMER-20261008 · 둘러보기 확대/축소

현재 `tools/2_5d-world-lab.mjs`는 **60546B / SHA256 `9e82f40f140c125e71c3a8de63182c4c541f0bc4451b772acfb779739d4e05f0`**다. 아래는 새 view-only 줌 UI의 현재 계약이며, 앞선 view/NPC/freshness 작업의 소스 핀·검수 결과는 각 작업 당시 이력으로 보존한다. 기존 frame말 NPC 안내 숨김 계약은 유지한다.

| 항목 | 현재 계약 |
|---|---|
| 노출 | `view-only=1`의 stage 안 별도 `.view-zoom` 그룹. 숨겨진 aside를 다시 노출하지 않으며 일반 standalone의 기존 aside 확대 컨트롤 유지 |
| 버튼/표시 | `#view-zoom-out`의 `−`, `#view-zoom-in`의 `+`, 리프 `#view-zoom-value`의 정수 percent. 버튼 최소 가로/세로 44 CSS px |
| 원래 범위 | 기존 HTML `#zoom`: min80/max220/step5/value100. 80~220%, 5%p 간격, 초기100% |
| 소비 | 기존 range의 `stepDown()/stepUp()` → `applyZoomInput()` → `resize()` → `camera.zoom=Number(range.value)/100` → projection 갱신 |
| 경계 | 최소에서 축소/최대에서 확대 비활성. camera zoom을 .8~2.2 단위에서 finite 검증 후 표시용 percent만80~220 clamp/정수 반올림. `2.2*100`의 부동소수 오차로 정상 상한이 거절되지 않도록 구분 |
| 수명/identity | captured epoch/camera/scene/renderer/DOM/range 정의(min/max/step) 일치와 ready/error/contextloss/disposed 상태 확인. paused/hidden이면 조작 비활성 |
| 리프 안전 | captured output이 현재 ID 노드와 동일·connected·children0일 때 그 리프만 쓴다. 교체된 새 노드를 지우지 않음 |
| focus | 조작 성공 후 현재/usable이고 대화가 닫혀 있을 때만 canvas focus 복귀. 열린 대화의 선택지 focus를 강제 회수하지 않음 |
| 반복/저장 | 기존 updateUi/stopFrame/visibility 경로에 sync. 새 RAF/timer/저장 항목0; OPT/BINDS/로비carry4 추가0 |

줌은 기존 카메라의 화면 배율만 소비한다. actor의 world 크기/발 좌표, 원 PNG/scene/nav/배치, 근접 거리140, R/WASD/Escape, parent lease·저장 대기·복귀·클리어·보상 권한을 바꾸지 않는다. 다른 모드의 조작/scene 저장과 연결하지 않는다.

검수는 ROOT의 **최초 Node1 / 7그룹 / 25조건 PASS, FAIL·setup·미도달0 / exit0**다. 실제 소스의 resize/apply/install/stop/lifecycle/UI 생성 구역을 통제 DOM/range/renderer/dialogue 포트로 실행했다. 100→105→100, 220→215, 80 경계, paused/hidden/error/contextloss/disposed/epoch, 교체 리프, range 포트 재진입·throw, standalone UI0, 대화 focus 보존을 이 범위에서 확인했다. native `range.stepUp` 의미·실WebGL/GPU·실화면 인수는 아니다. 소스 peer의 새 actionable0은 정적 검토이며 별도 실행 성공으로 합산하지 않는다.

새 Chrome0/native **NOT_RUN**, 새 PNG0, 이번 UI 시각 **NOT_ASSESSED**다. 사용자 IAB tab13의 이전 로드 소스를 유지하고 reload/새 게임0이다. 전체 **VISUAL VERDICT: RETOUCH**. 실제 줌 가독성/버튼 겹침·전8카메라·발/물리높이/native6/audio/durable save는 이번에 인수하지 않았다.

근거는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/main-rift-view-zoom-20261008`의 `validation-receipt.json`1236B/`e92f4a1c24fd4271f0663c4d72a3dcbfb72f66699cfc452924be982730b14e8f`, `cpu-result.json`3776B/`a48a7d172cdef5a83cb5126c57dfd237328c22d76bbb1bc1d0bdcaef50392bce`, `source-peer-review.json`18147B/`411cb174ff05f146a3bd66ba715d4cf5207659447ca5983dc44a43306836265f`, `visual-verdict.json`3495B/`7ce66d415ecb0c4ca951e8d633bf06b70e893d27f65d3c531d59bd2acdca7f80`다. 최종 소스는 7hunk/원 before 역변환 exact이며, 문서 담당의 새 제품 실행/Git0이다. 원총괄 Git 보존은 문서 작성 시 예정 상태로서 commit/push 완료를 미리 주장하지 않는다.

코드후 docs 전체 관련 검색 최초1회는43경로/142행/184 occurrence다. 보호2_3/설정3.3 및 거대 owner 본문·해시는 제외/path-only, 그 외 텍스트 이력은 검색범위에 포함했다. 43문서 전수 완독 주장은 없다. 직접 관련 정본4에만 추가하며, MASTER/SSOT의 이전 view 작업 핀은 해당 epoch로 보존하고 최신 계약은 이4정본을 따른다. 선행 준비 source핀 불일치1은 검색0/제품0/백업0의 준비 중단이며, 최종9e82 ACK 뒤 검색을 최초1회 수행했다.


## 2026-10-08 메인 Rift 둘러보기 지면 선명도 기본값

이번 기록은 **ROOT-MAIN-RIFT-VIEW-SHARPNESS-CONSUMER-20261008**의 현재 소비 범위다. 기존 ROOT-RIFT-PLATE-SHARPNESS-AB-20261007의 default OFF와 153 CPU/13 GUI 조건은 당시 소스의 이력으로 보존한다. 아래 view-only 기본값이 현재 해당 범위에서 우선하며, 그 옛 검수를 다시 실행하거나 이번 소스의 성공 수로 합산하지 않았다.

| 항목 | 현재 계약 |
|---|---|
| 제품 소스 | `tools/2_5d-world-lab.mjs` 60,594B / SHA256 `3a5b3e650a99f36e5734d5539ea80e27f58d85f8a40315bb628951c2bd315960` |
| 변경 | 초기 terrain 생성 직전 `if(viewOnly)$('plate-sharpness').value='0.5';` 한 줄, 1hunk/+48B |
| 범위별 요청값 | view-only에서 최초 생성 요청값0.5. standalone·기존 clearhost는 HTML 기본값0 유지; 브라우저 자체 form restore까지 강제로0이라는 주장은 하지 않는다 |
| 기존 소비 | 기존 select 값을 Number로 factory에 전달하며 change handler·snapshot·setter 계약은 그대로다. 줌100%와 선명도0.5는 서로 다른 값이다 |
| 원본 한계 | 등록1254×1254 plate를8000×8000 world에 사용한다. 기존 ground RGB의 Catmull-Rom16 추가 탭과 원본1=활성17 samples; 원본에 없는 디테일 생성·복원0 |
| 픽셀별 폴백 | 기존 derivative의 양축 footprint가 >0 및 ≤1인 확대 RGB에만 적용. uniform effectiveStrength0.5도 각 축소 픽셀에서는 원plate를 읽을 수 있어 실제 픽셀 ACK가 아니다. 미지원 renderer/chunk/derivative 등의 기존 폴백 유지 |
| 유지 | 원PNG/scene/nav/지형geometry/배치/actor 크기·카메라/입력·대사·보상·저장 권한 변경0. ground-only이며 절벽·뿌리·전경의 흐림 개선은 미인수 |
| 정적 검토 | 기존 초기화/select/factory/setter/compile guards를 읽은 저위험 기본값 연결 검토. ROOT source-contract peer blocking0; 새 테스트·Node CPU·Chrome/GPU·PNG0, native NOT_RUN |
| 현재 화면 | 사용자 IAB14의 view-only100% 이전 로드 화면은 reload/입력/닫기/복제0. 이번 기본값의 live 반영을 주장하지 않으며 다음 정상 재진입에서 새 child가 소비한다 |
| 시각·한계 | 이번 UI NOT_ASSESSED / VISUAL VERDICT: RETOUCH. 실제 픽셀·성능·전체8카메라·route/native6/청취·durable save/A급 미인수 |
| 다음 사용자 방향 | CH1 외곽 썩은강 방향과 다른 적합 지역의 용암 방향은 NEXT PASS다. 이번 구현0이며 stage/좌표/geometry/배치/에셋을 확정하지 않는다 |

ROOT 근거는 외부 `main-rift-view-sharpness-consumer-20261008/implementation-receipt.json`, `validation-receipt.json`, `visual-verdict.json` 및 `finaldelta`의 정적 검토다. 공식 원문2건은 미채택 보존 뒤 일부 소스 계약에만 소비했으며 원문 존재를 제품 실행·시각 완료로 세지 않는다.

§23 전체와 WOLF/held 보호 경계는 [HELL_RIFT_2_5D_SLICE](<../4.1맵디자인+설정/HELL_RIFT_2_5D_SLICE_20261006.md>)의 같은 TASK 절을 따른다.
