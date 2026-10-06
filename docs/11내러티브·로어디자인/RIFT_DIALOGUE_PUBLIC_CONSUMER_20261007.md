

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
