# CH1 2.5D 캐릭터·맵 공통 제작 목표 — 2026-10-06

## 최신 사용자 확정

“다크드루이드도 저렇게 만들어보자”, “캐릭터들도 그렇게 구현하고”, “맵도 저렇게 2.5D로 구현하고”, “자동게임제작팀은 다 놀고있는데 뭐 목표설정부터 안한거같은데”를 현재 수동 제작 지시로 적용한다. 이전 목표의 범위소진 대기를 새 목표의 완료로 계산하지 않는다. 기존 paused 자동화·아침메일은 재개하지 않는다.

| 항목 | 현재 목표와 인수 기준 |
|---|---|
| 공통 목표 ID | CH1-2_5D-CHARACTER-MAP-SLICE-20261006 |
| 첫 결과물 | 지옥의 틈의 같은 화면에서 전사·실버테일·다크드루이드를 선택하고 8방향 이동·대기·공격 모션, 지면 발 접지, 깊은 균열과 전경 가림을 확인하는 독립 3387 후보 |
| 외형 | 기존 승인 에셋 유지. 다른 보스 GLB를 다크드루이드라고 대체하지 않는다 |
| 리깅 단계 | 기존 방향 그림에 실제 Bone/SkinnedMesh 관절 변형을 더한 2.5D 시험. 승인된 완전 입체 플레이어·다크드루이드 원본이 없으므로 완전 3D 모델 제작/채택과 구분 |
| 맵 단계 | 현재 scene의 world/XY 등록·nav·spawn/exit 보존. 원자료에 없는 절벽 높이는 새 시험 geometry로 표시하고 원화의 실제 높이 데이터라고 주장하지 않는다 |
| 품질 판단 | 원화 확대·smoothing만으로 세부가 복원되지 않음. 캐릭터 원본 셀 해상도·clipping과 가까운 카메라의 맵 해상도 한계를 기록. 화면 없는 visual PASS 금지 |
| 첫 검수 | 실제 키보드 이동, 세 외형 교체, 방향 셀·bone 변화, nav 밖 이동 제한, 전경 가림, resize/로딩 실패. 화면·영상과 관찰 결과 보존 |
| 완료 구분 | 원자료 → 독립 consumer 구현 → fixture/브라우저 검수 → 본편 채택 → native/청취 인수. 첫 후보는 본편/native 완료가 아니다 |

## 기존 전문팀 15개의 새 책임

관리 3개(원총괄 + Codex7 + Claude8), 전문 15개는 유지한다. 새 팀·관리 채팅·Claude 실행 세션을 만들지 않는다. 아래 송신은 각 오더담당만 소유한다. 실제 수신·착수·유용한 source/작성·공식 완료를 별도로 기록하며 전원 가동을 미확인 선언하지 않는다.

| 오더담당 | 기존 역할 | 이번 독립 결과물 / 소비 접점 |
|---|---|---|
| Codex7 | UIUX | 독립 2.5D 후보의 캐릭터 선택·해상도/크기 표시·키보드 안내의 적용 가능한 접근성/조작 코드 계약 |
| Codex7 | ITEM | NPC 단일 유품의 기존 itemKey·슬롯 save 연결 계약과 지급/영수증 단일 처리 후보. 신규 경제 수치 금지 |
| Codex7 | BUILD | 기존 3387에서 상대 URL/import-map/Three dependency를 소비하는 최소 연결 후보. 설치·빌드·서버 추가 금지 |
| Codex7 | BALANCE | 전사/실버테일/드루이드의 기존 실제 발 앵커·표시 크기·collision 반경 대응 표와 visual scale 후보. 전투 수치 변경 금지 |
| Codex7 | SOUND | 기존 이동·거점·상승 음원의 실제 경로와 사용자 gesture 이후 재생/정지·중복 재생 방지 consumer 후보. 새 음원 생성/청취 완료 주장 금지 |
| Codex7 | QUESTNPC | 기존 주민 위치·접근·대화 키와 지옥의 틈의 부탁/유품 조건 연결 후보. root 구현 파일 충돌 금지 |
| Codex7 | MARKETING | 이번 후보에 보여줄 외형·모션·깊이/가림을 판별 가능한 촬영 순서와 실제 결과만 기재할 인수 기록 양식. 게시 금지 |
| Claude8 | ART | 기존 승인 원화의 원본 해상도·crop·투명 전경/중경·부품 사용 계약. 신규 생성은 별도 승인된 기존 ART 작업의 실제 도구 가용성 확인 후 구분 |
| Claude8 | MAP | 현재 scene의 nav·XY 등록·절벽 전경 마스크를 보존하는 2.5D editor roundtrip 후보. 높이 원자료 없음 명시 |
| Claude8 | SKILL | 이동/공격 visual pose consumer와 기존 스킬 이벤트의 연결 후보. root motion·새 피해 계산·Q 전용 계약 변경 금지 |
| Claude8 | QA | 이번 3개 외형의 셀·bone·접지·nav·가림·resize를 실패로 잡는 독립 인수 후보. 이전 검사 반복 금지 |
| Claude8 | ENEMY | 일반 적의 기존 방향/접지/표시 크기 계약을 캐릭터 API로 연결할 후보. 새 spawn/AI 수치 변경 금지 |
| Claude8 | ANIMVFX | 기존 effect의 actor foot/world anchor와 render lifetime 연결 후보. root character 모듈 중복 구현 금지 |
| Claude8 | BOSS | 다크드루이드 기존 방향·walk/attack/dive/emerge/transform 상태를 표시 API에 연결하는 후보. si/전투 LOCK/보호2_3 변경 금지 |
| Claude8 | STORY | 기존 지옥의 틈 대사/부탁·준비/정체 망자 의미가 다음 상승 목표로 이어지는 조건 데이터/consumer 후보. 마을 건물 해석 금지 |

## 원총괄의 현재 구현 소유

| 담당 | 파일 / 책임 |
|---|---|
| 원총괄 | tools/2_5d-world-lab.html, tools/2_5d-world-lab.mjs의 통합·실제 화면 검수·docs 동기화·scoped Git |
| 기존 rig_motion 지원 에이전트 | tools/2_5d/character-rigs.mjs, character-rig-catalog.mjs, docs/4.0케릭터스프라이트 디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md |
| 기존 editor_architecture 지원 에이전트 | 현행 맵 SSOT에 맞는 지형/좌표 계약 조사. terrain 구현 소유는 원총괄 후속에서 확정 |
| 기존 character_preview 지원 에이전트 | 승인된 플레이어 asset/crop/방향 계약 read-only 조사 |

전문팀은 위 원총괄 구현 파일·공유정본·타인 WIP를 직접 수정하지 않는다. 각 담당의 기존 소유 디렉터리 안에 이번 목적의 구체 코드/데이터를 한 파일 이하로 제출하고 완료 pins/공식 완료 ID로 인계한다. 코드 원자료를 보고서만으로 대체하지 않는다. 실제 작성 도구가 거절되면 그 작업의 목적/도구/사유를 한 번 기록하며 같은 목적을 다른 도구로 우회하지 않는다. 독립적으로 허용된 작업은 계속한다.

## 공유 변경수와 보호

시작 HEAD 09243adbc30b9dcb4aeccd0e3b5cc777baef2748, 실제 NUL/untracked 전체 변경 72, index 0. 실제 80부터 상세 채택 대기를 이유로 지연하지 않고 완료 소유 raw를 정확 pins/공식 완료 ID로 후보 미채택 보존한다. 100 이전 새 산출을 멈춘다. 팀별 새 파일 최대 1은 상한이며 현재 공간·완료 보존을 오더담당이 순차 확인한다. 삭제/ignore/cleanup/롤백 없이 공간을 확보한다.

AGENTS/LOCK/SSOT/맵 가이드 전체·§23, 보호2_3, Q 전용 magic/blackBean 패링·E 불가, 어택 티켓 금지, 기존23/사용자 세이브/타인 WIP 보존. 게임3333/3340·사용자앱3381/3383·Windows 조작, 설치/권한/인증/결제/게시, 중복 게임/빌드 금지. 실 검수는 격리 3387만 사용한다.

## 실제 목표 실행 및 이번 consumer 완료

공식 완료ID `ROOT-CHARACTERS-RIFT-2_5D-CONSUMER-20261006`. 세캐릭터의 실제12본 weighted skin·8방향·키보드보행·1회공격·발접지·심연/전경가림을 독립3387 lab에 연결했다. SKILL·ANIMVFX 원raw에서 수정한 publicconsumer를 실제채택했다. 정확코드/수치/원본핀/검수는 `DIRECTIONAL_CHARACTER_RIGS_20261006.md`와 `HELL_RIFT_2_5D_SLICE_20261006.md`를 따른다. 본편/NPC지급·save·상승·전투/native/청취/A급 인수는 아직 없다.

| 구분 | 실제 관찰 상태 |
|---|---|
| 기존 전문15 목표 | 공통목표와역할별출력15개정의완료; 관리3/전문15 유지 |
| Claude8 첫회차 | 8송신,7역할(SKILL/QA/ENEMY/ANIMVFX/BOSS/STORY/MAP) 코드원자료·공식end/idle 인계 및 정확raw보존. ART는기존선택목적대기 |
| 소비자 채택 | SKILL·ANIMVFX corrected public파생본2개는 이번root lab에서실제소비. 다른raw5개는미채택 |
| 수정v2 | CH1-2_5D-CONSUMER-CORRECTION-20261006-MAP/QA/BOSS/STORY 기존4팀에13:08:24Z각1회송신·실제peer4. 13:10:09Z 관측source3/end0/STORY작성1; 이후파일존재만으로완료계산0,완료영수증수집을담당에게인계 |
| Codex7 | UIUX 첫송신자동승인검토거절(도구승인필요/currentpolicynever),실제수신0/나머지6미송신. 이전거절목적재시도·우회0 |
| root실검수 | 502원본/셀contracts,실제browser9+8+13그룹,마지막정지중교체/reset3검사PASS. 팀fixture를root검수로재사용하지않음 |
| 화면판정 | 캐릭터원형·실제bone변형·고해상도실버테일소비확인. 맵1254²확대흐림/skirt접합으로VISUALRETOUCH. 완전3D원본/native6/청취미인수 |

완료소유코드·관련docs만checkpoint한다. 원자료7의공식ID·actualbytes/fullSHA/end는 `CH1_2_5D_TEAM_CANDIDATES_20261006.md`에보존했다. 기존paused자동화/아침메일·보호2_3·Q전용·어택티켓금지·사용자save·타인WIP·이전23·user게임3333/3340·앱3381/3383/Windows보존. v2작성중파일이나오더STATE/LOG는rootstage에포함하지않는다.

후속실제관측 2026-10-06T13:12:54Z: MAP/QA/BOSS/STORY v2 성공source·정확완료ID/actualend4·idle4 인계 완료. 원총괄 actual86에서4code의byte/fullSHA를대조해후보미채택즉시보존한다. 직전미완료표기는그관측시점이력이며현재raw완료4/consumer추가채택0,상세root의미검수전이다. 정확핀은CH1_2_5D_TEAM_CANDIDATES_20261006.md의v2보존절.

## v2 원자료 의미 검수와 실제 코드 복구 목표

원총괄 지원 담당의 읽기 검수로 다음 결함을 확인했다. 원 v1/v2를 수정하거나 검사를 재실행하지 않았으며, 해당 후보의 consumer 채택을 보류한다. 현재 화면의 검수된 public SKILL·ANIMVFX consumer 및 실제 3캐릭터 이동·가림은 유지한다.

| 역할 | 실제 source 결함 | 채택 전에 필요한 수정 |
|---|---|---|
| MAP | 51–73 보호된 sourcePins·전경 asset/opacity/crop·심연 mask/transform 비교 누락, 166 editor FAIL 무시, 29 byte view 범위 무시, 123 provider가 원 기준을 변조할 수 있음 | 보호 필드 정확 대조, 요청 editor FAIL 반영, byteOffset/byteLength 정확 해시, baseline·provider clone 분리 |
| QA | 71 anchorY/h 불변을 접지로 오판, 80 Three units를 world px로 안내, 107 모든 프레임 예외를 끝으로 삼아 calibration PASS 가능 | source 규격과 실제 drift 분리, sceneToWorld 역변환 x/y 공급, catalog의 명시 frames와 실제 예외 FAIL |
| BOSS | 110 지속 lastStand를 영구 transform hold로 사용, 78–85 누락/임의 Dash 문자열을 정상 모션으로 추정 | 실제 유한 reviving 창만 hold, lastStand는 context, 실제 상태 allowlist와 UNKNOWN 유지 |
| STORY | 64–79 Date/Map/class·상속 true를 commit으로 인정, 70–86 getter/Proxy 예외가 UNKNOWN 가드를 탈출 | plain prototype 및 own boolean data descriptor, 검증 전체 예외 처리; authoritative chapter gate는 유지 |

이 근거를 Claude8 담당에게 `CH1-2_5D-STRICT-CONSUMER-FIX-20261006-{MAP,QA,BOSS,STORY}`로 인계했다. 기존 각 소유 폴더에서 새 .v3.candidate.mjs 한 파일만 작성하도록 요청했고, 전문팀 재송신·공유/root/game/scene/nav/save·v1/v2 편집·scratch·삭제는 허용하지 않는다. 실제 peer/source/end/idle와 새 bytes/fullSHA를 받은 뒤 완료를 계산한다. 이 문서 작성 시 root 피드백 전달은 확인됐지만 전문팀 실제 착수/완료는 별도 영수증 대기다. Codex7/ART의 기존 막힌 목적은 재시도하거나 우회하지 않는다.

전체 docs 관련 키워드 검색80문서, 현행 계약·상태 동기화15문서. 나머지65는 이전 시점 기록·본편 2D/전투/save/다른 stage 또는 오더담당 소유 근거이며 별도 독립 consumer의 값으로 덮어쓰지 않았다. exact disposition 및 모든 원본/현재 핀은 외부 `/Users/fordeargamers/.codex/visualizations/dark-druid-character-rigs-20261006/`에 보존한다. CHANGELOG의 기존 혼합 CRLF/LF prefix는 원본 bytes로 보존했고 새 기록만 추가했다. 기본 diff-check가 CR을 trailing whitespace로 지적한 진단을 기록하고, 기존 CR-at-EOL을 인정한 diff 검사에서는 새 범위 오류0이었다. 구현 수치나 내용의 변경으로 계산하지 않는다.

## 2.5D strict v3 실제 완료본 보존 — 2026-10-06T13:27:07.725018+00:00

Claude8 기존 MAP·QA·BOSS·STORY 4역할이 현재 TASK의 실제 source4·공식 end4·idle4와 코드4를 인계했다. 최초 raw7+v2 raw4는 불변이며 v3는 별도 후보4로 보존한다. 새 제작팀·실행 세션·자동화 재개0. 이 보존은 consumer 채택이나 본편/native/청취/A급 인수를 뜻하지 않는다.

정확 후보 핀·공식 완료 ID·end UUID는 CH1_2_5D_TEAM_CANDIDATES_20261006.md의 같은 v3 보존절에 기록했다.

새 코드4 syntax 검사 PASS. 팀이 보고한 source 반례 검증은 화면/native 검증과 구분한다. BOSS 검증은 실제 Node 후보 직접 실행(17/17)이며 stdin 검증으로 기록하지 않는다. MAP은 검토상 앞선4결함 해결, QA는 앞선3결함 해결 및 referenceHeight 유한수 가드 P2가 남아 public 파생본에서 수정 후 채택할 계획이다. BOSS/STORY 의미 검수는 진행 중, v3 public 채택0이다.

전체 docs 관련 키워드 검색 후 기록·보호 원본·현재 독립 시험과 본편 계약을 구분해 동기화했다. 수정 원문은 bytes 그대로 백업하고 append했다. actual NUL80에 도달하는 즉시 완료 소유 코드4+관리 docs4만 checkpoint한다. 타인 WIP/오더담당 STATE·LOG/게임·씬·nav·에셋·사용자 세이브를 stage하지 않는다. 맵 화면의 기존 VISUAL VERDICT: RETOUCH는 유지한다.


## 2.5D 현행 소비 계약·제작 목표 동기화 — 2026-10-06T13:37:48.744345+00:00

이 기록은 앞선 시점의 source/채택 대기 이력을 갱신하는 현재 독립 3387 결과다. 공통 목표는 `CH1-2_5D-CHARACTER-MAP-SLICE-20261006`(전사·실버테일·다크드루이드의 같은 지옥의 틈 2.5D 화면에서8방향·대기/보행/달리기/공격·깊이/가림). 관리3/전문15의 기존 역할별 코드 산출 목표를 유지하고 새 팀·관리 채팅·실행 세션은 추가하지 않는다.

| 항목 | 현재 상태 / 코드와 같은 계약 |
|---|---|
| 실제 팀 원자료 | 최초7+v2 4+v3 4+STORY v4 1=완료 소유 raw16 보존. source 도구·공식 end·bytes/fullSHA를 확인했다. 원자료 보존은 consumer/native 인수와 구분 |
| public 소비 | SKILL visual-pose-consumer·ANIMVFX actor-effect-lifetime·MAP scene-registration·QA slice-acceptance 4역할의 파생본을 실제 root lab에서 소비. BOSS/ENEMY/STORY 일반 본편 소비0 |
| 실제 맵 검사 | 실제 로딩 terrain.sourceSceneSnapshot()=K.clone(source)를90767 B canonical HTTP raw의 SHA256·보호 payload와 대조. world XY 투영 왕복 VERIFIED/1192타일. editorProvider 없음=PENDING; 실제 editor 저장·불러오기 인수0 |
| 표시 검사 | 실제 getWorldPosition→sceneToWorld의 actor 원점 world px를 제자리12 렌더 프레임 관측. drift 허용4 px/clip inset12·nav radius12. raw scene units·anchorY/h 비율을 접지 증거로 계산0 |
| source 규격 | 선언 frames×8방향을 순회, finite 양수 referenceHeight/asset width,height/rect, cell 내부 anchor. Infinity/NaN/숫자문자열/0 거부. 정상 crop별 anchor 변화 허용 |
| 검사 무효화 | 이동 키/blur/캐릭터/모션/reset/정지와 자동 attack→idle 시 이전PASS/FAIL=PENDING·samples0. paused 요청은PENDING, 완료 관측으로 계산0. snapshot 결과는 structuredClone |
| renderer/perf | 기존renderer1/RAF최대1/추가mixer0 유지, diagnostic job은12 samples 뒤 폐기. 새로운 save/scene/nav 쓰기·게임/빌드/서버 실행0. 실물폰·장시간FPS 미인수 |
| 실제 검증 | root Mac Chrome/3387 새21검사+자동모션해제5검사 PASS/새runtime0,3id×4mode에서144 프레임 앵커/nav 관측. 이전502/9+8+13+3 검사는 반복하지 않음. 실제 화면3장과 결과json 보존 |
| 시각 판정 | 맵1254² 확대 흐림·hard wedge·절벽 skirt seam이 남아 VISUAL VERDICT: RETOUCH. 새 높이는 authoredDepth240/inset.9 시험값/physicalHeight UNKNOWN. 본편 전투/NPCgrant·save·상승/native6/청취/IK 발픽셀/A급 인수0 |

정확 원화/셀/geometry/순서·수치·API·provenance는 `DIRECTIONAL_CHARACTER_RIGS_20261006.md`와 `HELL_RIFT_2_5D_SLICE_20261006.md`의 최신 실제 MAP·QA v3 public 소비 절 및 §23 MAP PRODUCTION REPORT을 따른다. 기존 역사 문서·본편2D 계약·다른stage LOCK는 독립lab 값으로 덮어쓰지 않는다. raw의 공식 완료ID/end/정확핀은 CH1_2_5D_TEAM_CANDIDATES_20261006.md에 보존한다. 외부 증거 `/Users/fordeargamers/.codex/visualizations/dark-druid-character-rigs-20261006/v3-live-qa/`의 result.json21·mode-release-result.json5·final-diagnostics.png를 구분한다.

STORY v4는 요청2결함을 해결했지만 method provider의 this=ports를 분리 호출로 잃는 P2가 남아 일반 consumer 채택0이다. Claude8 담당에게만 `CH1-2_5D-STORY-METHOD-CONTEXT-20261006`으로 신규 v5 1파일/rs.call(ports)·cc.call(ports) 복원을 인계했으며, 이 기록 시점의 송신 인계와 이후 실제 peer/source/end 검수는 구분한다. 동일 TASK 재송신·다른 역할 중복지시0. Codex7 UIUX 첫 송신은 자동승인검토에서 도구승인필요/currentpolicynever로 거절되어 수신0/다른6미송신, ART 기존 선택 대기도 별도다. 전원 가동을 선언하지 않는다.

원격 exact `75ce5819ef6e1bbccb5a2acdf5a2db7142b6054e`(v3raw4) 및 `ac96c952b4f3a36e53cd210f745551dd13b8e146`(root code5+STORYv4raw1+상세docs3)의 보존을 확인했다. 후자는 actual80 checkpoint 시도에서 진행로그 hook 누락을 잡아 우회 없이 보완한 actual81 정상 commit이다. 전체 docs 관련 키워드 검색 후 관련15문서를 현재 계약/역할 상태로 동기화하며, 기존 bytes prefix와 백업을 보존한다. 현 관리 docs도 실제80부터 완료 소유 범위만 즉시 정상checkpoint한다. foreign68/owner STATELOG4/보호10/게임·scene/nav·sourcePNG·save/2_3·Q전용·어택티켓 금지·이전23 유지. paused 자동화·메일/권한/설치/Windows/게시/새팀 재개0.


## STORY v5 실제 완료·원자료 보존 동기화 — 2026-10-06T13:42:22.974466+00:00

이 절은 직전 v5 대기 기록 이후의 공식 완료 관측이다. `CH1-2_5D-CHARACTER-MAP-SLICE-20261006`의 기존 역할별 목표는 유지한다.

| 항목 | 현행 실제 상태 |
|---|---|
| 원자료 | 최초7+v2 4+v3 4+STORY v4 1+v5 1=완료 소유 raw17. 새 v5 공식 ID `CH1-2_5D-STORY-METHOD-CONTEXT-20261006-V5-CANDIDATE` / actual end `436f895c-ae0f-4156-94ca-44155afd547c`@2026-10-06T13:39:06.362Z, source·end·idle 확인 |
| 의미검수 | `readCommitted` 실제84행 `rs.call(ports)` 및 `chapterGate` 실제101행 `cc.call(ports)`로 this=ports 회귀 해결. lookup/검증/호출 예외→UNKNOWN, thenable/accessor 거부, flags UNKNOWN과 authoritative true 독립 유지. 공식 종료문의91/109는 이전v4 위치이며 현재v5 위치로 혼동하지 않음 |
| 검증 경계 | 팀 신규 stdin7/7 PASS는 팀 source 검증. 개별 getter 반례의 신규stdout 증거는 없음; guard 유지는 root 읽기 검수 근거. root 기존 실제3387 신규21+5 검사 및 화면3장은 이전 실관찰로 보존하며 반복/합산 재검사0 |
| 채택 경계 | public 소비4(SKILL/ANIMVFX/MAP/QA) 유지. STORY v5 일반 consumer·아이템 지급·퀘스트등록·save·본편상승 채택0. editor roundtrip PENDING/native6·청취·IK 발픽셀·완전3D·A급 인수0 |
| 시각/팀 상태 | VISUAL VERDICT: RETOUCH(맵 확대 흐림·wedge·skirt seam). Codex7 첫송신 자동승인검토 거절/수신0·나머지6미송신, ART 기존선택대기. 새팀/실행세션/같은TASK 재송신·거절우회0 |

새 원자료는 `CH1_2_5D_TEAM_CANDIDATES_20261006.md` exact pin 표와 외부 `story-v5-official-receipt.json`으로 추적한다. 원본 v1–v4·게임·sourcePNG·scene/nav·save·foreign68·보호10·기존23은 유지한다. 완료소유만 actual80부터 즉시 code+docs checkpoint하고 정상push·remote exactSHA를 확인한다. paused 자동화/아침메일·권한·설치·Windows·게시 재개0.


## 현행 독립 3387 NPC·맵 연결 동기화 — 2026-10-06T14:40:05.634520+00:00

현행 목표 `CH1-2_5D-INTERACTIVE-RIFT-CONTINUATION-20261006`. 이전clip2260×1400·주민미연결·실editor미인수 설명은 이전 관측이다. 아래는 최신 tools/2_5d-world-lab과 해당 파생 consumer의 실제 상태이며 다른stage LOCK/본편 계약을 바꾸지 않는다.

| 항목 | 코드와 같은 현행 상태 |
|---|---|
| 맵/카메라 | RIFT_TERRAIN.clip 0/0…8000/8000, groundTriangles32, source nav1192 불변. centre5430/3900·reset5480/3740, 정사영50°/scale400/기본높이3.5, 배우 위치를추종. physicalHeight UNKNOWN/depth240/inset.9 |
| 지면/절벽 | 2026-10-06 이력: skirt shade=1−.78f/maskFeatherApplied=false. 2026-10-07 현행: 고정globalUV·28선분 최단거리/120worldpx/opacity.38 sRGB 합성을 skirt·backplane 공용 불투명재질로 소비, shader 연결 뒤 maskFeatherApplied=true. ground-only sRGB soft-light alpha.4/nav1192/mirror480²/period320. sourcePNG1254²·1920²불변/원해상도 확대흐림 RETOUCH |
| NPC4 표시 | 기존1254²atlas SHA ff20e1f5… /displayScale1.8/정적billboard. sourcefeet 하란4660/6660·베린6020/5580·네사6300/5020·도릭5220/2500 불변. 배우/주민order=30+(footY−4320)/8000×10/뿔30 |
| 접근·대화 | displayApproach 하란4780/6660·베린5900/5580·네사6180/5020·도릭5100/2500/각120거리. nearest일치·navradius12검사. R/KeyR대화, 기존createRiftDialogue/session Map 사용; range140/line step≤20/radius12. 원본접근검사40거리/source.start·exit/nav변경0 |
| 선택·종료 | 실제베린gift1·재방문중복0·네사quest1, 총trial2/actualGrantfalse/editor-session-only. 이동·외형/모션/위치변경·pause·Escape·닫기·pagehide에서닫음. 대화중neutralidle/facing. 본편grant·quest등록·save·chaptergate0 |
| cue 소비 | interaction-cue-lifetime.mjs의mesh2 pool/추가RAF·timer0. 접근ring0xcdbb86/opacity.55/size.16/lift.003·열림marker0xc8623a/opacity.8/size.12/lift.42. NPC원본foot에표시/order=NPC+.5. pulse1.6Hz/depth.22; reduced-motion정적/캐시최대4·guard실패숨김·종료해제 |
| API·에디터 | scene-registration.editorRoundtrip이async save/load. format-only=FORMAT_VERIFIED/realEditorfalse, provider없음PENDING. 실제다운로드/import·90767B원본SHA c508e70d…동일검수5PASS. browser evidence의savedUTF8 SHA 불일치/input변조/async실패FAIL. lab metric-editor는provider미공급PENDING |
| 실관측 | 새최종Chrome/3387 actual23검사PASS/pageerror0/HTTP실패0/NPCatlas핀변조readyfalse·RAF0/pagehidecueNPC해제. 스냅샷복사·reduced-motion·외형교체·대화종료검사포함. 실제canvas영상522811B/DOM대화·소리미포함 |
| 팀/채택 | Claude8 기존7source/end/idle, raw24(기존17+이번7)후보보존. 신규raw와root파생consumer채택구분/public4역할유지/cue는기존ANIMVFX추가모듈. 신규STORYraw own-key P2/BOSSfootAnchor·referenceHeightUNKNOWN/MAPecho오류미채택 |
| 송신/보존 | Codex7전문첫송신자동승인검토거절/수신0·다른6미송신, ART기존선택대기/전원가동선언0. owner STATELOG4 별도/foreign68·보호10·기존23·sourcePNG/scene/nav/save·2_3/Q전용·어택티켓금지유지 |
| 인수/다음 Gate | VISUAL VERDICT: RETOUCH. 독립NPC표시·대화시험과본편연결/보스여정/native6/청취/IK발픽셀/A급 인수를구분. 고밀도지면·절벽/전경alpha·feather 보정 및본편consumer연결남음 |

전수 키워드검색 근거와 정확상세수치/API/핀/§23 MAP PRODUCTION REPORT: `docs/4.1맵디자인+설정/HELL_RIFT_2_5D_SLICE_20261006.md`의 현행목표 절. 실제editor/provenance는 MAP_SCENE_EDITOR_20261005.md, 공식완료ID·fullpin·후보미채택 및MAP/STORY경로·삭제규칙위반의실제증거/피해UNKNOWN은 CH1_2_5D_TEAM_CANDIDATES_20261006.md. 외부 `/Users/fordeargamers/.codex/visualizations/rift-interactive-20261006/`의 final-interaction-v2-result.json/editor-final-result.json/화면/interactive-motion.webm/Git영수증을따른다. 이전QA를새검사로합산0. 코드/주요docs/raw는25a6e38df92c132cf6f1dd98db364391fbb18699에서완료소유NUL82 checkpoint, 나머지관련docs는80부터순차checkpoint·정상push/remoteexact로보존한다. paused자동화·아침메일/새팀·실행세션/설치·권한·게시·Windows재개0.


## 2026-10-08 총괄 자율 제작 일정 — 2026-10-07 사용자 승인

사용자 최신 지시: “내일은 진짜 내가 바뻐서 니가 총괄로 일을 좀 시켜야하는데”. 현재 한국시간 2026-10-07 새벽 기준 다음 날짜인 2026-10-08 09:00–19:00을 실행일로 설정했다. 날짜 확인 선택지는 선택사항이며 별도 응답 전에는 이 날짜를 따른다. 기존 2026-10-06 라운드의 임시 `newFollowupTaskProhibited=true`는 해당 종료 라운드 이력으로 보존하며, 이번 날짜의 승인된 새 작업을 영구 보류하는 근거로 사용하지 않는다. 이 절 작성은 목표·일정 준비이며 전문팀 착수·새 코드·시각 인수 완료를 뜻하지 않는다.

| 운영 항목 | 확정된 계약 / 실제 상태 |
|---|---|
| 공통 목표 | CH1-RIFT-QUALITY-DAY-20261008: 지옥의 틈 확대 재질·절벽/전경 접합, 기존 캐릭터/드루이드 특수 표시, NPC 대화/유품/부탁 consumer, 실제 맵 에디터 연결 개선 |
| 실제 기준 | 시작 HEAD 80bf013284987b2c3b50733bf7f90c4de70ee65b / 실제 rename-aware NUL·전체 untracked72 / index 비어 있음. 기존 raw24·독립3387 화면23검사·실제 editor5검사는 과거 근거이며 새 검수로 재합산하지 않음 |
| 일정 | 기존 원총괄 heartbeat exoduser-2만 2026-10-08 한국시간09–19시 매 정시로 갱신·ACTIVE 저장 확인. 1분 자동화가 아님. 다른 exoduser/exoduser-mac/exoduser-claude8/exoduser-9는 PAUSED 유지 |
| 보고 | 변화 없음·idle·동일 현황 반복 보고0. 의미 있는 완료·실패·필수 결정만 전달.19시 실제 반영/화면·영상/검증/Git/남은 문제 한 번 보고 후 exoduser-2 일시중지.19시 이후 새 제작·중복보고0 |
| 단일 송신 | Codex7 01a0fb1e-4ec3-7dd3-bba2-f87518e881fa / Claude8 01a0fd2d-8a6f-7f01-b2da-70119654cffe만 기존 전문15 송신 소유. root는 통합·docs·Git·3387 실검수 소유. 새 팀·관리채팅·Claude 실행 세션·전문팀 직접/중복 송신0 |
| 완료 뒤 다음 행동 | 각 taskId·정확 소유파일·의존성·완료기준·송신/peer·첫 성공 source·공식 end·bytes/fullSHA·검수판정·nextAction을 ledger에 기록. 실제 완료핀 수집→미채택 보존→root 의미 검수→최소 소비 연결→관련 docs 전수 검색·정확 동기화→code+docs commit/push/remote exactSHA→다음 승인 미완료 단위로 연결. 검수 중 다른 독립 작업 일괄 보류0 |
| 거절 경계 | Codex 전문팀 송신의 실제 자동 승인 검토 거절(current approval policy never)과 ART 기존 선택 대기는 별도 미착수로 기록. 같은 거절 목적 재시도·다른 도구/경로/호스트/권한 우회0. 허용된 root 구현·검수와 별도 독립 작업은 계속하며 전원 가동으로 과장0 |
| 저장소/안전 | 실제 checkout /Users/fordeargamers/Projects/exoduser-migration-20261001. 완료소유만80부터 즉시 checkpoint/100 전 새 산출 중단. 수정 전 백업·소유 exact path 충돌검사. 타인 WIP·기존23·사용자save·원본scene/nav/PNG·LOCK·보호2_3/Q 전용 magic blackBean(E 패링 불가)/어택티켓금지 보존 |
| 도구 범위 | 기존 격리 editor3387만. 사용자 게임3333/3340·앱3381/3383·Windows·새 서버·중복 게임/빌드/대형 작업0. 삭제/cleanup/권한/인증/설치/결제/게시0. 맵 작업자 가이드 전체+SSOT 순서 선행, §23 MAP PRODUCTION REPORT·실제 VISUAL VERDICT 필수 |
| 기존 사고 | MAP/STORY의 잘못된 외부경로 쓰기·삭제는 실제 규칙 위반이고 피해 UNKNOWN. 완료 후보와 별도로 이력 유지. 경로가 다르면 쓰기를 멈추고 삭제로 수습하지 않음 |
| 품질 경계 | 현재 VISUAL VERDICT RETOUCH. 원1254² 확대 흐림·hard wedge/절벽 seam·물리높이UNKNOWN·특수모션 발 메타 미확인·본편/NPC 실제 grant·quest/save/상승/native6/청취/A급 미인수. fixture·후보보존·lab만으로 이 Gate를 통과 처리0 |

### 기존 Claude8 역할별 다음 제작 단위 — 아직 배정 준비

아래 역할별 정확 새 소유파일은 모두 `tools/team-followup-20261008/hell-rift/<ROLE>/` 하위 한 파일이다. 기존 raw/public/game/씬/nav/save를 전문팀이 수정하지 않는다. 실제 송신·수신·완료 근거는 오더 담당이 인계한 뒤 별도로 기록한다. ART의 기존 막힌 선택 목적은 포함하지 않는다. MAP/STORY는 경로·삭제 재발 방지 exact path guard를 필수 적용한다.

| 역할 / 새 TASK suffix / 파일 | 구체적 산출과 완료 Gate |
|---|---|
| MAP / MAP-FEATHER / rift-feather-boundary-2_5d.candidate.mjs | opening·전경 alpha 경계를 source XY/UV/nav/mask 불변으로 Three에서 소비. feather 폭은 현행 source 근거와 단위 확인 후 명시하며 임의확정0. 경계 alpha/내부·외부/등록 변형 반례→root 동일 카메라 전후 시각 검수 |
| ANIMVFX / GROUND-MATERIAL / rift-ground-material-2_5d.candidate.mjs | 완료 editor 재질 arrival-detail crop240²·mirror480²·period320·alpha.4의 Three 소비 접점. world 고정·비보행/심연 영향0·추가RAF0·dispose. 원본 해상도 복원 주장0 |
| BOSS / SPECIAL-PREVIEW / dark-druid-special-preview-2_5d.candidate.mjs | 기존 dive/emerge/transform/beast 시트 fullSHA·cell·frame·방향의 실제 표시 consumer. 기존 draw 계약을 확인하며 foot/referenceHeight UNKNOWN을 추정하지 않고 표시/미인수 분리 |
| STORY / DIALOGUE-GUARDS / npc-dialogue-preview-2_5d.v2.candidate.mjs | own-key P2를 고치고 실제 createRiftDialogue snapshot/receiver 연계. getter·상속·thenable·throw 거부, gift 재수락 중복0·quest 분리. 실제 grant/save/chapter gate 미구현을 숨기지 않음 |
| SKILL / DIALOGUE-POSE / dialogue-pose-arbitration-2_5d.v2.candidate.mjs | 실제 isOpen/view.npcId/view.nodeId 계약에 맞추고 대화 진입·종료/캐릭터·blur·reset 후 이전 공격 잔존0. neutral idle/facing 유지. 기존 root 소비자 중복 구현0 |
| ENEMY / BILLBOARD / enemy-atlas-billboard-2_5d.candidate.mjs | 완료 경로 매핑을 반복하지 않고 기존 CH1 일반몹1종 idle/walk Three 표시. 실 atlas/meta·cell·발/크기·정렬/dispose·누락 failclosed. spawn/AI/피해/충돌 수치 변경0 |
| QA / RETOUCH-GATES / rift-retouch-consumer-acceptance-2_5d.candidate.mjs | 새 consumer 등록·수명·관측 근거 predicate. 실제 editor와 format/echo 구분, async reject/원본 변조/nav 재질누출/경계·특수모션UNKNOWN·공격잔존 반례. 실제 관측 없으면 PENDING |

TASK ID는 `CH1-RIFT-QUALITY-DAY-20261008-<suffix>`이며 완료 ID는 동일 TASK에 `-CANDIDATE`를 붙인다. MAP/ANIMVFX 시각 개선을 먼저 root에서 소비하고 나머지 독립 단위는 병행한다. active TASK에는 중복 메시지를 보내지 않으며 미완료 의존성은 정확히 표시한다.

Codex7의 기존7 역할도 UIUX 조작·선택/ITEM 단일 유품 provider/BUILD 상대 import·에셋/BALANCE 표시크기·발/SOUND gesture 이후 기존음원 수명/QUESTNPC 본편 대화·진행 연결/MARKETING 실제 촬영 근거라는 목표를 유지한다. 전문팀 송신이 거절된 현재는 목표 보유와 실제 착수를 구분하며, 거절 목적을 재배정해 우회하지 않는다. 원총괄과 기존 허용 지원 담당의 독립 소비자 조사·통합은 해당 거절 action을 우회하지 않는 범위에서 계속한다.

이 준비의 전체 docs 관련 키워드 검색은 외부 `/Users/fordeargamers/.codex/visualizations/exoduser-next-day-20261008/docs-keyword-search.txt`에 보존했다. 관련 현재 관리계약4문서와 CHANGELOG에 동일 일정·연속 진행 정책을 append하고, 과거 라운드/오더 STATELOG/본편 SSOT·보호 문서는 덮어쓰지 않는다. 원본 bytes prefix·외부 백업·소유5문서 한정 Git 영수증을 같은 외부 폴더에 보존한다. 이 변경은 제작 일정 준비이며 맵 구현/시각 Gate 변경0이다.


## 현행 우선 지시 — 2026-10-07 즉시 연속 제작

사용자 “지금부터 시작해야지 24시간 돌아가는 시스템”이 이전10/8날짜대기·09–19시window·19시중지·완료라운드 뒤 새후속보류를 대체한다. 이전 준비절은 당시 이력이며 현행 운영 제한이 아니다.

| 항목 | 현행 정본 |
|---|---|
| 운영 | exoduser-2 단일root heartbeat ACTIVE/매30분/종료시각없음, API update와 실제automation.toml 일치 확인. 맥과Codex앱이 켜져 있을 때 실행. 다른4자동화/아침메일PAUSED유지 |
| 작업 흐름 | 실제코드 → 공식end/bytes/fullSHA → raw미채택보존 → 의미검수 → 최소consumer → 실화면 → docs전체검색/정확동기화 → 정상code+docs commit/push/remote exactSHA → 다음승인미완료단위. root검수 동안 독립팀 일괄보류0 |
| 송신 | 전문15의 송신은 기존Codex7/Claude8 owner만. 기존Claude7의 이번품질TASK actualsource7/end7 확인; 거절된Codex/ART 목적 재시도·우회0, 전원가동과장0. 관리3+전문15=18 유지/새팀·세션0 |
| 목표 | CH1-RIFT-QUALITY-NOW-20261007: 맵재질·절벽/전경 접합, 캐릭터특수동작, NPC실consumer, 맵에디터 최소연결. 이번완료 단위를10/8에 중복송신0 |
| 보고 | 변화없음/idle/같은검사·TASK 반복0. 의미있는완료·실패·필수결정만 알림.19시 요약은 일별1회이며 제작일시중지0. 인간중지시중지/임의재개0 |
| 자원/보존 | 실제NUL/-uall80부터 완료소유핀만즉시checkpoint/100전새산출중단. foreign68+ownerSTATELOG4/raw원본/LOCK/nav1192/세이브/보호2_3·Q전용magic/어택티켓금지유지. editor3387만/새서버·Windows·게임빌드중복·설치·권한·인증·삭제cleanup0 |
| 현행 결과 | root ground-detail+baked-special public모듈 및terrain/worldlab 실제WebGL 연결. raw7은 의미검수/미채택보존 구분. fixture·독립Chrome≠본편native6/청취/실제보상save/A급완성 |

정확 코드·수치·검수 근거는 HELL_RIFT_2_5D_SLICE_20261006 및 DIRECTIONAL_CHARACTER_RIGS_20261006의 2026-10-07 현행절, 후보채택 Gate는 CH1_2_5D_TEAM_CANDIDATES_20261006의 최신절을 따른다.


## 2026-10-07 다음 품질 작업 — CH1-RIFT-QUALITY-NEXT-20261007

직전통합정상push/remoteexactSHA `5f1a3b4d5e558efd01b8fc218b98f8197c0db7f0`, 신규실Chrome유효27PASS/foreign68보존/index0/실제NUL72. raw31미채택보존과public소비를구분한다. 아래기존Claude7의다음1TASK씩은지금기존owner에게전달됐으며owner채팅에서수신ACK했다. 이는송신/peer/실code착수/end까지전부완료됐다는뜻은아니다. 각실제근거는owner새round영수증으로확인하고이전qualityNow를재송신하지않는다.

| 기존역할 | 다음TASK suffix | 정확새소유파일(tools/team-followup-20261007/hell-rift/역할/) | 완료Gate/소비 목적 |
|---|---|---|---|
| MAP | FOREGROUND-REGISTRY | rift-foreground-registry-2_5d.candidate.mjs | 실제foot west/east/south3개의원XY/pivot/mask/cropUV/footY등록과ThreecallerAPI. 주민분리/nav1192불변/높이UNKNOWN |
| ANIMVFX | GROUND-GUARDS-V2 | rift-ground-material-2_5d.v2.candidate.mjs | publicgroundmaterial 정확API adapter/실PNG·navSHA/hardnearest×softlinear/asyncprepareepoch/disposecleanup |
| BOSS | SPECIAL-CELL-AUDIT | dark-druid-special-cell-audit-2_5d.candidate.mjs | 실제PNGdecode8셀alphaoccupiedbounds/edge관측, erupt상단잔여띠source 측정. anatomicalfoot추정/sourcepixels변경0 |
| STORY | DIALOGUE-GUARDS-V3 | npc-dialogue-preview-2_5d.v3.candidate.mjs | methodgetter실행0/inheritedthenable·flagsaccessor→UNKNOWN/receiver·session정확/actualdialogue를대체0 |
| SKILL | DIALOGUE-POSE-V3 | dialogue-pose-arbitration-2_5d.v3.candidate.mjs | 성숙publicpose/run/finitefacing/safeprovider/top-levelattackRemaining/close·char·blur·reset후이전공격0 |
| ENEMY | PINNED-LOADER | enemy-atlas-pinned-loader-2_5d.candidate.mjs | 실제CH1 ghoul atlas/meta/walkimage measuredbytes/fullSHA/decode/UV범위/async수명 loader와기존billboard접점. AI·spawn·damage/save0 |
| QA | EVIDENCE-GATES-V2 | rift-retouch-consumer-acceptance-2_5d.v2.candidate.mjs | await실editor export/import evidence/FORMAT_VERIFIED≠VERIFIED/필수관측없으면PENDING/publicsnapshots·실bytespins/UNKNOWN/native청취오인0 |

각TASK ID=`CH1-RIFT-QUALITY-NEXT-20261007-<suffix>`, 공식completion=TASK+-CANDIDATE. 지정1새raw파일만/이전raw31불변/새harness·temp·세션·팀0. 기존owner만전문송신, source도구·end분리, root가통합실화면·docs/Git Gate를소유. 실제80부터완료소유만즉시보존/100전newoutputSTOP. 원총괄끝난뒤대기하도록일괄보류하지않고단일ACTIVE rootheartbeat가이어받는다.

Codex7의latestcontrol은memory로만갱신되었고owner STATE/LOG는쓰기허용범위밖이라미갱신이라고보고했다. 이전UIUX/QUESTNPC전문송신은자동승인검토가권한을요구하면서거절한목적만유지한다. root전체/Claude독립작업보류로확대0, 권한요청·다른tool/path/host우회0/전원가동과장0.


## CH1-RIFT-QUALITY-NEXT-20261007 완료 소유 원자료 보존 — 2026-10-07

기존 Claude7의 새 TASK 송신/peer/첫 성공 source/공식 end·idle/정확 최종핀7을 owner 2026-10-06T17:02:13.624713Z 실조회로 확인했다. 원자료 누적31+7=38. 아래7 후보는 본편/public 미채택이며 의미검수와 root 실제화면 소비 Gate가 남아 있다. 파일 존재를 완료로 계산하지 않았다. 실제79에서 이 완료 기록을 docs에 추가하면80에 도달하므로 상세검수를 기다리지 않고 완료소유만 정상 checkpoint한다. 기존 foreign68/owner STATELOG4/index0·sourcepixels/scene/nav1192/save·보호2_3/Q전용/어택티켓금지를 보존한다.

기존7팀 공식 완료 후보를 각각 정확pin별 후보미채택으로 보존한다. 현재 진행은 root가 실제 전경3 소비/새 의미검수→화면→docs/Git→다음 결함별 작업인계이며, 전체38후보 보존을 생산완성으로 선언하지 않는다. 전문팀에 같은NEXT TASK 재송신0/새팀·세션0. 정확표는 CH1_2_5D_TEAM_CANDIDATES_20261006 최신절.


## 2026-10-07 현행 전경3·보행 바닥 가림 수정

완료ID `ROOT-RIFT-FOREGROUND-NAV-CONSUMER-20261007`. 독립3387 world-lab에서 원본 전경1→3을 연결했다. 이전 east-only/actor20·40 기록은 당시 이력이며 현행 계약은 아래와 같다. 기존 에디터 scene의 3조각·geometry·mask·PNG·nav1192는 불변이다.

| 적용 위치 | 현행 정확 계약 |
|---|---|
| terrain/lab 전경 | obj-east-horn footY4320/order30/mask11/triangle9; obj-west-root footY5360/order31.3/mask12/triangle10; obj-south-root footY6920/order33.25/mask10/triangle8 |
| 공통 앞뒤 순서 | actor·resident·전경 모두 `30+(footY-4320)/8000*10`; transparent=true/depthTest=false/depthWrite=false. 전경pivot(0,1)/rotationX−angle/alphaTest.01/원maskFeather0. 겹침 선택fade.32(OFF1) |
| 바닥 가림 차단 | 공용nav200²/40000B RedFormat/UnsignedByte·Nearest/no mipmaps. `(199-y)*200+x`에 walkable255/나머지0, `riftForegroundUV=(worldX/8000,1-worldY/8000)`. map_fragment 뒤 alpha×`1-step(.5,nav.r)`/후속 alphatest. 원nav 쓰기0 |
| API/snapshot | occluderFootY4320 호환값 유지; foreground 배열의 objectId/footY/renderOrder/opacity/maskPoints/triangles/sourceCrop/feather/nonWalkableOnly=true 추가. geometry/material 각3+공용navtexture1 terrain 소유·Set dispose1회/borrowedplate 중복dispose0 |
| 실제 관측 | 전경 등록/순서/원본 보존/선택fade 11유효성공 후 정지중disabled talk 클릭harness30초 timeout FAIL 보존. 남쪽 실제몸가림 발견 후 nav-alpha 수정. 수정후 신규4항목(바닥차단/실Haran대화/실KeyS이동/실shader·page·consoleerror0) PASS. 이전27을 이번검사 수에 재사용0 |
| 시각 인수 | 실제before east/south/north 캡처를 보존하고 수정후 south/east 열람. 남쪽몸가림 수정 확인; 서측 전경 전체/실전투·출구·8카메라 인수 UNKNOWN. 원판1254² 확대흐림 남음. VISUAL VERDICT: RETOUCH |
| 경계 | 독립lab≠본편/native6·청취·실보상save·물리높이·해부학적foot/IK·A급완성. 원자료45 미채택 보존과 public 별도구현을 구분 |

정확XY/crop/shader·실패/수정화면·§23 보고는 `docs/4.1맵디자인+설정/HELL_RIFT_2_5D_SLICE_20261006.md` 최신절. 근거 외부 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/foreground-{before,after,mask}-*`. docs 전체 관련keyword 검색247매칭32파일을 현행/역사/타시스템으로 분류했다. ownerSTATELOG·잠금/보호문서·역사영수증은 수정0.

현재 `CH1-RIFT-QUALITY-FIX-20261007` 전문7은 송신/peer/실source/공식end·idle 각7을 확인하여 raw45 미채택 보존완료. root 전경 public 실제화면 Gate는 위와 별도이며 ACK만으로 전원착수라 선언0. 새 FIX 의미검수도 독립 지원각stdin1회만 수행: STORY/SKILL10그룹 PASS8/FAIL2, BOSS/ENEMY18검사 PASS12/FAIL6. MAP/ANIMVFX/QA는 다음 실제결함 확인(성공tool 자체를전체PASS로계산0).

| 역할/현재 후보 | root 의미검수/다음 소비 Gate |
|---|---|
| MAP v2 | 16²texture BUILT·opacity.25→material1 불일치·material constructor throw geometry누수. 원public navalpha없어 교체0. guide 전체실읽기UNVERIFIED 유지 |
| ANIMVFX v3 | 이전prepare 완료가새prepare 진행상태를false로씀; material17승인. latestepoch 한정 상태갱신·실Three material검사 필요 |
| BOSS v2 | finite band/flag/alpha/frame가드 신규확인; Node zlib/fs감사코드 browser import0/semanticfootUNKNOWN |
| STORY v4 | flagsaccessor 실행0이나 stateKnown:true/UNKNOWN[] 요구불일치. ownthen 검사 상속경계 미수정 코드확인/전역prototype테스트반복0 |
| SKILL v4 | snapshot/supported descriptor throw가resolve밖탈출, outercatch회귀. receiver/run1.55/facing6/top-levelremaining/close·char·blur·reset 옛공격0 확인 |
| ENEMY v2 | 실제corrupted_wolf eastwalk alpha[6010,6198,6454,0]/frame3빈셀. helper검증과loader핀 미연결/부분빈셀미소비/globalgen방향병렬취소/재로드oldbitmap누수/공개UV범위/THREE없어oktrue 결함. public파생consumer에서최소보완필요 |
| QA v3 | runner pinnedbytes비교·UNKNOWN/native/visual PENDING집계 수정확인. exportedgrader 비hex64/source not-a-sha PASS, reversedbounds/NaNbound/월드밖좌표/음수remaining PASS. 구조·hex동일성가드 필요 |

이 후보들은 raw보존≠public채택이고 다음작업은 기존Claude8 owner만 전문송신한다. root의 독립consumer구현·화면검수를 일괄보류하지 않는다. 단일root heartbeat ACTIVE/30분/종료없음·19시일별요약1회/제작중지0. 다른paused4·아침메일재개0. Codex UIUX/QUESTNPC 거절action 재시도·우회0/전원가동과장0. previous NEXT ENEMY의ghoul 명칭은이력오류이며 실제검증대상은corrupted_wolf이다.


## CH1-RIFT-CONSUMER-LINK-20261007 — 다음 작업 인계

root 전경완료 code2+docs16 정상push/remoteexact `9600afee0982a1456d833fc3c40d14c1ae096f18`, raw45 보존 `83a7324ed651deb954e04825a4a8cad43d719ff7`. 최신 사용자24시간지시의 다음승인미완료 단위를 기존Claude8 owner 01a0fd2d-8a6f-7f01-b2da-70119654cffe에 전달했다. 이 문서 작성시점은 root 실제인계 확인이며 전문7 송신/peer/source/공식end 완료로 승격0. owner 신규round에서 각근거를 수집한다. 이전NEXT/FIX TASK 중복송신0/새팀·세션0.

| 역할 | TASK suffix | 정확 새소유파일 (tools/team-followup-20261007/hell-rift/역할/) | 소비 목적/완료Gate |
|---|---|---|---|
| MAP | FOREGROUND-VIEW-DATA | rift-foreground-view-data-2_5d.candidate.mjs | 실제public navalpha renderer 유지+canonical/3전경등록/footorder/crop/pins/bounds 진단자료; plate1254²/opacity contract 확인. wholeguide실Read source선행 |
| ANIMVFX | GROUND-CONSUMER-HANDLE | rift-ground-consumer-handle-2_5d.candidate.mjs | publicground 실제API/실ThreeMaterial/latestepoch 상태/취소handle1회해제/view-onlyA/B. wholeguide실Read source선행 |
| BOSS | SOURCE-OBSERVATIONS | dark-druid-source-observations-2_5d.candidate.mjs | 기존PNG8cell alpha/빈셀/upperband actual관측과browser-safe 데이터 export; fs/zlib browser직접import0/foot UNKNOWN |
| STORY | DIALOGUE-OBSERVATION-CONSUMER | dialogue-observation-consumer-2_5d.candidate.mjs | actualdialogue observation·flagaccessorUNKNOWN/inheritedthenable/descriptorfailclosed/session·gift·quest 보존 |
| SKILL | DIALOGUE-POSE-CONSUMER | dialogue-pose-consumer-2_5d.candidate.mjs | maturepublicpose+배우당arbiter·actualsnapshot/globalcatch/새입력·종료수명·run1.55/facing/remaining>=0 |
| ENEMY | CORRUPTED-WOLF-CONSUMER | corrupted-wolf-preview-2_5d.candidate.mjs | 실제rawbytes/fullSHA/JSON/IHDR→decode→texture/selfcontained 1종idle/유효walk·emptyframe fallback/key별epoch/bitmap수명/UV guards/THREE dependency |
| QA | CONSUMER-LINK-GATES | rift-consumer-link-gates-2_5d.candidate.mjs | actualbytesregistration await+typedbounds/order/world/remaining>=0/hex·pin동일성/누락PENDING; echo/selfreport≠실WebGL/native/audio |

TASK=CH1-RIFT-CONSUMER-LINK-20261007-<suffix>, 완료ID=TASK-CANDIDATE. 각1신규파일만, 원자료45/public/foreign68/ownerSTATELOG4·PNG/nav/save는별도소유보존. 실제80부터완료소유정확pins/end만즉시checkpoint·100전newoutputSTOP. root독립통합 중 전문독립작업일괄보류0. 맵 §23/시각RETOUCH·미관측명시/자동검사PASS를시각PASS로대체0.


## 2026-10-07 ROOT-RIFT-NPC-WOLF-CONSUMER-20261007 실제 public 연결

이 부록은 현재 독립3387 public 소비자의 구현 상태다. 앞선 raw/fixture 완료 이력은 보존하며 본편/native·청취·보상save 완료로 승격하지 않는다.

| 현재 적용 | 값·상태 |
|---|---|
| NPC consumer | observation+pose 실제controller 연결 / 3actor 대화idle·공격취소 / 유품·부탁 각1 session-only / committedfalse |
| 늑대 consumer | 기존 JSON2+PNG16 실제decode / 8dir idle·walk0..2 / 빈3→같은dir idle / displayHeight.36 / preview6fps≠UNKNOWN metadataFPS |
| 자원·정렬 | 256²textures32/8,388,608B/atlas16close/추가RAF0 / `30+(footY-4320)/8000*10` |
| 검수·남음 | 이번 새25유효실WebGL 검수 / errors0 / RETOUCH; 큰맵흐림·실발·본편native6·청취·보상save 미인수 |
| 다음 | 기존 MAP owner의 선택NPC→2.5D entry adapter 제작; root editorbutton/labport 다음 최소연결 |

정확 API/범위/5code핀/새근거/§23 전체 보고는 `docs/4.1맵디자인+설정/HELL_RIFT_2_5D_SLICE_20261006.md`의 같은 완료ID 부록을 따른다. raw52 checkpoint48fa4a43f95541ec3a1c9cc55c650aefdba2185a와 root public 파생 채택을 구분한다. MAP·ANIM LINK 선행guide위반은 보존했고 실제fullRead복구2/end2를 확인했으며 소급PASS0.


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


## 2026-10-07 ROOT-RIFT-CONTACT-VISUAL-GATE-20261007

| id / 적용 위치 | 정확 현행 계약 |
|---|---|
| 공개 모듈 / 핀 | tools/2_5d/rift-contact-underlay.mjs / 13198 bytes / SHA256 d6194d518e4e4a6100ea312ed14de1e3f4968dab56563a2247501c5d8b00aae2 |
| API | await createRiftContactUnderlay({THREE,terrain,enabled=false}) → object3d / setEnabled(boolean) / snapshot() / dispose(). 단일 async factory, prepare/reload 없음; source-nav hash 대기 후 terrain 수명 재검사. |
| 상태 / 채택 | ROOT-PUBLIC-EXPERIMENT. raw54 직접 import0; 결함 보정 derivative를 독립lab 비교 도구로 보존. VISUAL FAIL이므로 기본enabled=false; HTML cliff-contact는 unchecked. 본편 채택0. |
| UI consumer / 핀 | tools/2_5d-world-lab.html 11943 bytes SHA256 c55c498c01a84ac63a932ebfcd8296277bc6eb8e22264673a7083d5163e0465d; 경계 음영 비교 체크박스 cliff-contact. tools/2_5d-world-lab.mjs 32861 bytes SHA256 5a8bcfe054fa597822e0b44b3e3fd4725282bc710a62739385eaabcc5c392b1d. |
| canonical | grid200²/tile40/world8000/nav1192, source-nav40000 bytes 0/1/fullSHA a4508aa62f21c9b4380640307b36eef06656ebdf0c0245a2f78833d65dda0179. sceneSHA c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a. 원본PNG·scene·nav·terrain geometry/3전경은 쓰기0. |
| 수직 UV / hard mask | source rowY 배열 / 글로벌 geometryUV(x/8000,1-y/8000), shaderSampleUV=(u,1-v). 원본 sourceNavByteEncoding=0/1; 별도 hardMaskByteEncoding=0/255, UnsignedByteType normalize→hardMaskNormalizedEncoding=0/1. Nearest Red40000 bytes, step(.5,sample.r) gate. 비보행38808칸 gate0, 보행1192칸 gate1. |
| band / 공식 | contactTiles1.5=60world, strength.42, distance=max(0,nearest nonwalk center tile distance-.5), alpha=distance<1.5?.42*(1-distance/1.5):0. Linear RGBA160000 bytes × Nearest hard gate. band574칸; actual centermax .28 / 8bit max71/255=.2784313725490196. 명목상한 .42를 실제max라고 계산하지 않는다. |
| 표시 순서 / 소유 | color0x05080a(329738), blend normal-dark, quad order6/lift1.25, depthTest=false/depthWrite=false/transparent=true/DoubleSide/toneMapped=false. owned texture2=200000 bytes+geometry1+material1=4; borrowed0; partial constructor/Hash-late/dispose/double-dispose 검사. ownRAF/timer0, source/scene/nav/savewrite0. |
| GPU 검수 | lab foregroundShaderPrograms canonical1 및 contactShaderPrograms 양면2, renderer.compile 후 실제 gl.LINK_STATUS=true를 별도 검사. cacheKey rift-contact-underlay-linear-band-nearest-nav1192-v2. snapshot.shaderRegistered/Calls는 shader injection만 뜻하며 GPU link PASS를 대신하지 않는다. 초기 root가 양면 프로그램2를1로 가정한 acceptance 오류로 GUI0 FAIL; 실제2linktrue 진단 후 cardinality2로 수정, 실패영수증 보존. |
| 신규 CPU 검수 | 실제 Three r160 stdin18 PASS에는 0/1 GPU normalized byte blind spot이 있었다. 이후 수정된 별도 제한stdin5 PASS에서 actual DataTexture byte/255와 gate, UV, sourceSHA를 확인. 이전18 PASS를 실제 alpha 표시 증거로 승격하지 않는다. |
| 신규 실제 화면 검수 | contact actual WebGL·OFF/ON 동일 남/동/북 카메라·정본/무오류 6 PASS + default OFF와 실제2link 1 PASS. 별도 canonical 복원 GPU1 PASS. 과거 editor18/NPCwolf25 재실행·합산0. pageerror0/4040. |
| 시각 결과 | OFF/ON 남119106·동104434·북106164 pixels가 바뀌나 nav 경계를 계단형 얼룩으로 노출하므로 접촉 음영 VISUAL VERDICT: FAIL. 실제 clip이 그림 속 절벽 발과 일치하는 접지 음영 인수는 실패했다. 기본OFF로 기존 화면 보존. 전체 맵 VISUAL VERDICT: RETOUCH, 원본1254² 확대흐림/입체높이/본편 인수 미해결. |
| 외부 근거 | /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/contact-* PNG/result/pixel-comparison, before-contact-* 백업, restored-foreground-gpu-result.json. fixture/raw/lab≠본편/native6/청취/실보상save/A급. |
| 다음 승인 단위 | 기존 Claude8→MAP CH1-RIFT-MAIN-ENTRY-GATE-20261007-MAP(신규 rift-main-entry-gate.candidate.mjs1). peer6bdd0087-edf9-4829-beea-ff423c367f94 18:31:09.267Z, source Bash toolu_01Ad1gM3uQNFL53Wi9FoXC1i→d2a7f2ee-ddae-47a3-b2f1-bf0b9d862b07 18:31:44.029Z. 정식 end/pin 대기이며 수신·검색만으로 전체 선행Read/완료/본편연결을 계산하지 않는다. |

MAP PRODUCTION REPORT
- STAGE: 지옥의 틈 보행 경계 contact-shade 비교 / 기본OFF.
- MASTER: 기존 비대칭 실루엣/남→북 main route/주민 side spaces·regions 유지.
- OUTER MASS: LEFT/RIGHT/TOP/SOUTH와 major holes 원화 불변.
- LARGE: source assets·3전경 composites/crop·overlap·repeated silhouette 변경0.
- MEDIUM: connections/remaining holes 변경0.
- GROUND: shadow 비교는 계단 nav 얼룩으로 FAIL; contamination/structure integration 기본OFF로 기존 보존.
- PLAYABLE: nav1192 travel/breathing space 유지; main arenas/threat/combat readability 본편 인수 PENDING.
- LANDMARK: primary 상승문·secondary 균열·tertiary 주민 그대로.
- CAMERA QA: 남Haran4780,6660 / 동Berin5900,5580 / 북Dorik5100,2500 같은 카메라 OFF/ON. START/초반/ARENA/SIDE L/LATE/EXIT 전체 본편 인수 PENDING.
- TECH QA: route/collision 불변; pageerror0/4040; loading7실관측 PASS; seam 시각 FAIL; performance 정량 인수 PENDING.
- FILES: root public module1 + labhtml/mjs2, concurrent/unrelated touched0.
- GIT: completed-owned code3+동기화docs 정상commit/push 및 remote exact SHA는 외부영수증에서 확인; deploy0.
- VISUAL VERDICT: FAIL(음영 ON), RETOUCH(전체 맵 / 기본 OFF).
- NEXT PASS: nav 셀을 실제 그림 속 절벽 발로 취급하지 말고 authored foreground 접합 위치/부드러운 실제 경계 검수; 별도 본편 entry gate→실제 NPC 왕복→보상/save atomicACK 단위.


### ROOT-DAILY-PRODUCTION-15P-RAW56-20261007 — 실제 제작 확대·계정 사용 기준·새 완료후보

사용자 최신 직접 지시 “최대한 일을 시켜라”, “하루에15퍼센트씩은 쓰게 조정하면서 써”를 승인된 미완료 제작/검수의 병렬 확대 목표로 반영했다. 원총괄 단일 heartbeat의 24시간 연속제작/한국시간 일별19시 요약1회/제작중지0은 유지한다. 이 절은 최신 운영값이며 이전 날짜대기·19시중지·1분감사 이력은 당시 기록이다. 목적 없는 토큰 소모·이미 끝난 검사/같은 TASK 반복은 하지 않는다.

| 항목 | 실제 확인값·계약 | 경계 |
|---|---|---|
| 사용 목표 | 하루 약15%포인트 사용 증가를 실제 제작량 목표로 사용 | 정확 일일 토큰/이 채팅 소비율 보장 아님. 계정 전체 공유 사용률 |
| 시작 측정 | 2026-10-07 KST, primary 주간창10080분 usedPercent41/remaining59, reset2026-10-12T11:52:56Z | 일일 token값·secondary값 제공 없음. 다른 채팅 소비 포함/reset시 재기준 |
| 운영 저장 | exoduser-2 ACTIVE/30분/종료시각없음, API update 및 실제 TOML 확인 | 다른4 PAUSED자동화·아침메일 재개0, 자동구매·유료설정변경0 |
| 조절 | 기존 허용 독립팀과 root 코드·의미·실화면·docs·Git 단위를 병렬 수행. 일별 및 실제 한도변경 때 사용률 확인 | 목표도달만으로 승인제작 중지0/실제차단·한도 우회0 |
| 전문팀 송신 | 기존 Codex7/Claude8 두 owner만. 아래 새6단위는 Claude8 기존세션에 각1회 actual송신/peer6 확인 | root 직접전문·중복TASK·새팀·실행세션0. 15전문 전원가동으로 과장0 |
| 최신 확인 | 18:53:23.359302Z owner receipt sent6/peer6/Read4/usefulSource5/end0 | ENEMY의 성공 Bash 본문과 Read 도구를 구분. ART 거절purpose 및 Codex 실제송신 차단 유지 |
| 완료 보존 | raw55 7800B/SHA93bf091af30bd2575ed2c49fb4d5e7f49179a3365d2ae9c4899b3990950ab216; d58027d5a4714121cd6b77dbbf955b1036762752 정상push/remoteexact | 직접채택 semanticFAIL. 첫 ls-remote DNS실패 뒤 정상 read-only 재조회로 exact 확인 |

| 새 TASK ID (공통 앞부분 CH1-RIFT-MAIN-PARALLEL-20261007-) | 정확 단독 소유파일 (tools/team-followup-20261007/hell-rift/) | 소비 목적·미인수 |
|---|---|---|
| SKILL | SKILL/rift-main-input-policy.candidate.mjs | 부모 전투/holdpickup/키패드와 iframe 걷기·대화 입력 경계 pure policy. Q/E 의미 변경0 |
| ENEMY | ENEMY/rift-main-simulation-policy.candidate.mjs | Rift 부모 update/spawn/projectile 동결 policy. 실제game전체적용0 |
| BOSS | BOSS/rift-main-stage-clear-admission.candidate.mjs | 실제 stageclear/final/demo/retry admissibility 사전 policy. SP10재지급/backup재활용0 |
| STORY | STORY/rift-main-story-flags.candidate.mjs | 세션 대화 symbolic flags detached serialize/restore. foundLin!=rescuedLin/actualGrant·durableACKfalse |
| ANIMVFX | ANIMVFX/rift-wolf-foot-bounds.candidate.mjs | 기존32PNG/8dir alpha bounds·최하단행 측정. 원PNG불변/alpha경계!=해부학발·IK |
| QA | QA/rift-main-evidence-contract.candidate.mjs | raw/fixture/lab/main/native6/audio/durableGrant 근거 구분. 계약module!=실제검수통과 |

각 COMPLETION-ID는 TASK ID에 -CANDIDATE를 붙인다. 새6은 기존 진행 MAP V2와 독립이다. 실제source/공식end/exactpin이 없는 후보는 완료로 stage하지 않는다. owner의 인계 ACK만으로 전문착수/완료를 승격하지 않는다. root는 별도 tools/2_5d/main-rift-host.mjs의 DOM/iframe public 구현·실브라우저 검수와 game.html 최소접점 검토를 병행한다. host 구현memory검사와 실제 browser/native 인수를 분리하며, 본편 held입력/gamepad/update seam·현재 DEMO 분기 우회·실제캐릭터 port 연결은 미구현이다. 원화/scene/nav·main game/사용자save 변경0.

새 MAP V2 raw56 공식완료: TASK CH1-RIFT-MAIN-ENTRY-GUARDS-V2-20261007-MAP / COMPLETION-ID CH1-RIFT-MAIN-ENTRY-GUARDS-V2-20261007-MAP-CANDIDATE. 정확파일 tools/team-followup-20261007/hell-rift/MAP/rift-main-entry-guards-v2.candidate.mjs, **11268B / fullSHA256 646bf810623bfe7ce687c1bd4d560f40fc751b9586cd46326c0d7764635e72be**. 공식end be7786a7-6b57-4b97-a55e-e1e7cada25e1@2026-10-06T18:52:29.614Z, end rawSHA d20e443e73af16cb7dabe42ef7d8429e242d2235377aed102d9de6a8d79e61ca. peer87780d51-0294-4fa8-a4af-1c070816e07d@18:45:40.512Z. firstUsefulSource Bash toolu_01LUx3kmjZMTfrqwu2fctpxj→f02580c3-0ab7-4281-842b-a42a9e7529d4@18:46:09.978Z. Read 도구0/Bash 실제본문반환범위는 별도영수증이며 필수전체문서실독을 소급PASS0. 신규 stdin **2회**: 첫 unsettled top-level await exit13(중간11021B), 수정후 exit0(최종11268B). clean1회PASS/실제main완료라고 표기하지 않는다. **원자료 미채택 exact보존 / root 의미·public채택·실화면·native·저장Gate PENDING**.

현재 1-1은 _DEMO_MODE=true/_DEMO_LAST_STAGE=0이고 nextBtn의 데모 분기가 _proceedNextStage를 우회한다. 일반 전환 접점의 host/gate 구현만으로 현재1-1 틈진입완료를 선언하지 않는다. 실제5초 showStageTransition callback 및900ms curtain 정리의 job/epoch, P/G/_charId(null정상)/_charIdx/stage/difficulty identity, heldinput/gamepad/update 격리, 취소·실패시 자동nextStage0을 후속소유 범위로 남긴다. 보스retry/_preArenaBackup·SP10clear보상·_DEMO_MODE·nextStage/doWin원본문 변경0.

MAP PRODUCTION REPORT: STAGE=Rift main 진입후보·입력/상태/발접지 독립 제작 배정. MASTER/OUTER MASS/MEDIUM/GROUND/PLAYABLE/LANDMARK/DETAIL geometry 변경0. CAMERA QA=이번새판정 미실행. TECH QA=raw56 전문 stdin 첫exit13/수정exit0 및 실제송신·source근거만, 본편native6/audio/durableGrant/save는0. FILES=완료owned raw56+관련운영docs만 normal checkpoint, WIP/owner STATELOG4/foreign68 미stage. **VISUAL VERDICT: RETOUCH** (전체맵 기존판정 유지); contact는 실화면FAIL/defaultOFF이고 원plate1254²의 확대흐림 미해결. 다음pass=root V2 의미검토·독립host 실브라우저·검수된 본편접점/새6완료핀 보존이며 A급완성0.

외부 /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/: usage-daily-production-baseline.json, daily-production-automation-receipt.json, main-parallel-dispatch-20261007.txt, main-parallel-start-receipt.json, main-entry-raw56-formal-receipt.json, daily-production-docs-keyword-search.txt 및 보존영수증. actual rename-aware NUL80부터 완료owned exactpins/공식end만 즉시 checkpoint,100전 신규산출중단. AGENTS/LOCK/맵guide/보호2_3/Q-only magicblackBean(E패링불가)/어택티켓금지/기존23/사용자save/외부WIP 유지.


#### ROOT-MAIN-PARALLEL-RAW57-60-20261007 — 新 완료4 후보 미채택 보존

18:58:21.772361Z 최신 owner 영수증 sent6/peer6/source5/end4. 아래4는 공식end/bytes/fullSHA가 확인된 원자료만 보존하며 public/main 직접채택·실제플레이·native6·청취·실보상save 인수0이다. 독립5번째 ANIMVFX는 당시진행중, STORY는 input대기 및 의존성확인1건 미수신으로 전원가동 주장0. 실제외부 피해UNKNOWN/거절purpose경계는 그대로다.

| 역할·완료ID | 정확 신규파일 | bytes | fullSHA256 | 공식end/시각 |
|---|---|---:|---|---|
| SKILL / CH1-RIFT-MAIN-PARALLEL-20261007-SKILL-CANDIDATE | tools/team-followup-20261007/hell-rift/SKILL/rift-main-input-policy.candidate.mjs | 16071 | 1dde95f9ab99dbf96ea3f1ca31a1db977d9f2b24c369fcec3e0b9cebbd07d70a | 82347339-efe0-41b4-9eb3-81d8fc5c1a6e / 2026-10-06T18:57:32.589Z |
| ENEMY / CH1-RIFT-MAIN-PARALLEL-20261007-ENEMY-CANDIDATE | tools/team-followup-20261007/hell-rift/ENEMY/rift-main-simulation-policy.candidate.mjs | 7636 | e95b842227ae2d4af4ff8d153947d125f3e84d35e04c4c4421c490f893126e55 | 4656ffda-e456-4a28-8661-5ca63ac30c98 / 2026-10-06T18:56:33.594Z |
| BOSS / CH1-RIFT-MAIN-PARALLEL-20261007-BOSS-CANDIDATE | tools/team-followup-20261007/hell-rift/BOSS/rift-main-stage-clear-admission.candidate.mjs | 7674 | 96fd68cc3959a7fddd6490f472ed1262327aec636883cf009a870c521c65142a | a31598a3-62dd-4adc-92a0-2a1f796abebe / 2026-10-06T18:56:20.150Z |
| QA / CH1-RIFT-MAIN-PARALLEL-20261007-QA-CANDIDATE | tools/team-followup-20261007/hell-rift/QA/rift-main-evidence-contract.candidate.mjs | 12974 | 371d0995fbefa9a0b31bde01c4d3bd9bc0018134b74b5d2724076a3817459a92 | 388e85e1-3c36-4290-ad85-c74523372528 / 2026-10-06T18:56:54.861Z |

MAP raw56의 root 새정적검토는 직접채택 **semanticFAIL**이다. old resume Promise rejection의 schedEpoch누락, raw.then/ret.then getter/handle검증예외, cancel cleanup뒤재진입상태쓰기, commit cleanup중 context/dispose변경뒤true발급, mutablehandle메서드재읽기/unsafeerror.message를 새root public tools/2_5d/rift-main-entry-gate.mjs에서만 보완한다. 원자료11268B/fullSHA646bf810623bfe7ce687c1bd4d560f40fc751b9586cd46326c0d7764635e72be는불변/공식완료보존. 새public은작성중이며본절시점완료·실검수로승격0. 원칙은 restore→dispose각1회/cleanup전epoch·handle분리/cleanup뒤identity재확인/지연one-shot허가와실제stage성공분리/실패자동advance0이다.

후속 독립 MAP TASK CH1-RIFT-EDITOR-MASK-RESOLUTION-20261007-MAP를 기존Claude8 owner에게1회인계했다(전문송신·peer·source는최신ownerround로확인). 정확 신규소유 tools/team-followup-20261007/hell-rift/MAP/rift-editor-mask-resolution.candidate.mjs max1. 현2D maskedPicture의 max1024 중간canvas가source1254²를추가축소하는경로를조사·후보구현하는단위이며 Three의source확대흐림과분리한다. consumer/원PNG변경·새이미지제작0, actualsource/실화면A-B없이선명도PASS0.

root main-rift-host의 실제브라우저검사에서 parent/child Object.prototype realm 차이로정상ready거절첫FAIL(checks0)을발견했고보존한후 childrealm만명시허용하여새GUI14PASS를관측했다. 현errorformatter 예외경계를소유파일1에서보완중이므로 최종pin/신규제한검수는후속영수증으로확정한다. 기존memory16과새GUI14를합산0. 실제editor3387/모의maincontext의격리host검사이며actualMainGame/native6/audio/durableGift/saveAcceptedfalse. root가entry/return1600×1000실화면을확인: hostUI PASS,전체맵RETOUCH/1254²확대흐림유지. 게임held/gamepad/update와DEMO1-1진입은미구현이다.

이번보존은완료raw4+운영관련docs만정상checkpoint하며rootpublicWIP/진행MAP·ANIM·STORY/ownerSTATELOG4/foreign68미stage. 관련전체keyword검색 및 기존바이트prefix보존. 외부 main-parallel-raw57-60-formal-receipt.json와daily-production-* 영수증을따른다. §23 MAP PRODUCTION REPORT는앞절을유지하고이번raw4 source완료를actualnative/맵A급으로승격0. VISUAL VERDICT: RETOUCH.


## ROOT-PUBLIC-RIFT-FOLLOWTHROUGH-20261007 — 연속 제작 / 미채택 raw63–66

직전12파일 `5f8a62ebf4f7f1f9f2bc86ebb70ed78509a8a176` 정상 commit/push·원격 exact 확인 완료. public host `tools/2_5d/main-rift-host.mjs`17683B/008a33930406b5ceaea70fb83050eab46acbd24eb7cf98579cae7b64adb6dc38, public gate `tools/2_5d/rift-main-entry-gate.mjs`16280B/f9dbbcb891e79748d6b71eb08e331745ccd62f7992d0210fe438fbd3574038fd 및 docs8/raw61·62를 보존했다. exact운영계약·모든 API/상수·숫자는 PROJECT_MANAGEMENT_MASTER의 ROOT-MAIN-HOST-PRESERVATION-RAW61-62 및 ROOT-RIFT-MAIN-GATE-PUBLIC 절, SLICE/EDITOR_RESULT/MAP_SCENE_EDITOR/THREE/세이브/대사 소비자 문서의 같은 완료 절을 따른다. 원자료 raw56 미채택 의미FAIL은 파생 public과 구분한다.

| 새 검수 단위 | 결과 / 핀 경계 |
|---|---|
| gate pure | 신규 stdin1 / 24 groups·222 conditions PASS, exit0. 실제 main ACK0 |
| host | 최초 child realm FAIL체크0 / 이전6cd… GUI14 PASS / 최종008a… 실패주입2+정상GUI2 PASS를 분리. 반복·합산0 |
| gate+host actual interop | 최종 f9db+008a exact / 신규4 PASS. 실제 WebGL iframe·명시 continue scheduled만 / 지연 mockadvance1·재허가false / Escape 취소 / context교체거부 / expectedHTTP503+500ms 실패 cleanup. 모의 P/G이며 실제 nextStage/save/audio/native6 미인수 |
| 화면 | host entry/return UI PASS / 전체 맵 RETOUCH / plate1254²→8000² 확대 흐림 미해결. 원 PNG/nav/scene/지형 geometry 변경0 |
| raw61 독립 root 검수 | PNG16+JSON2/40셀(32유효+8빈walk3) 실제 바이트·픽셀 표 일치. 새stdin1 데이터5PASS/API경계4FAIL(exit1). getter/type/negative threshold/NaN frame/unknownmode 결함 → raw 미채택. alpha>16 측정≠public alphaTest.01·해부학적발·IK |
| raw62 MAP | 7258B/603b8a6b8e792747f51e93b9e230a4dd868d99a8a7d724bf22b4a289d572cdb9. TASK 시작 전 fresh가이드/SSOT 선행누락 FAIL / 미채택. 단순2D nativebuffer 후보와 Three확대 흐림 분리. 보정1회 enqueue/실행첨부 전달 흔적을 담당 기록으로 분리, 선행소급PASS0 |

CH1-RIFT-MAIN-POLICIES-FIX-20261007의 기존 SKILL/ENEMY/BOSS/QA 4팀은 송신4/peer4를 넘어 공식end4·exactpins4로 갱신되었다. 아래는 다음 소비자 후보를 정밀 검수하기 전에 완료소유 원자료를 미채택 상태로 checkpoint하는 표다. 후보 stdin 자기보고는 실제 main·native6·청취·보상save 인수로 승격하지 않는다.

| 역할 | 공식 완료 ID | 정확 파일 | bytes / fullSHA256 | official end UUID / 시간 / end rawSHA256 |
|---|---|---|---|---|
| SKILL | CH1-RIFT-MAIN-POLICIES-FIX-20261007-SKILL-CANDIDATE | tools/team-followup-20261007/hell-rift/SKILL/rift-main-input-policy-v2.candidate.mjs | 18140 / f37496ba97808f0f831c507d90c18b35666295e79bf648de884fcfe4bc7547b6 | ff7cfaf0-984b-4257-b7ea-c626705f50a9 / 2026-10-06T19:12:05.081Z / 364ad91baf9f314649924dee959ad3cd8c677decb9fd7a3be7d7c347a3207af7 |
| ENEMY | CH1-RIFT-MAIN-POLICIES-FIX-20261007-ENEMY-CANDIDATE | tools/team-followup-20261007/hell-rift/ENEMY/rift-main-simulation-policy-v2.candidate.mjs | 10122 / 880f204f1a1a7ae7bb5b5ec7587585544c6ebfad20520ef5e82d494730020e03 | 45bd281e-7659-412d-afc7-2156b118b904 / 2026-10-06T19:12:02.896Z / 993e246f2b11c89fff4b12bedd7b804ce7fa456ce0e97b800a19e6657d8b3eb5 |
| BOSS | CH1-RIFT-MAIN-POLICIES-FIX-20261007-BOSS-CANDIDATE | tools/team-followup-20261007/hell-rift/BOSS/rift-main-stage-clear-admission-v2.candidate.mjs | 9477 / 6eec849eebf9039b79807f7f7b327b36516649343985141f8bf36597452242e5 | d868227c-f5f1-4785-92c8-62da7ab6963d / 2026-10-06T19:10:39.523Z / 7ba8a877016ba37b423210427bcd041ff2f0b8915548f4b6f6702a9acd003888 |
| QA | CH1-RIFT-MAIN-POLICIES-FIX-20261007-QA-CANDIDATE | tools/team-followup-20261007/hell-rift/QA/rift-main-evidence-contract-v2.candidate.mjs | 15720 / 2789ed1ee1543f9b202da962fec04a0424057694453a188970a6036be22464a2 | d329f12e-4b08-4f63-8809-d478435be163 / 2026-10-06T19:11:28.300Z / c66b2953bcf522b99c2b3719615d96db9fb709b93bb214e05f2a20c35053716e |

raw63–66는 root direct import/production 채택0·root 의미검수 PENDING. root 읽기검수를 입력+시뮬레이션 / 보스+근거형식으로 병렬 분리했으며 같은 검사를 재실행하지 않는다. 새측정·상태·필드의 형식검증은 본편실측과 구분한다. ANIM 후속 TASK CH1-RIFT-WOLF-FOOT-BOUNDS-FIX-20261007-ANIMVFX(max1, rift-wolf-foot-bounds-v2.candidate.mjs)는 공식raw61 결함에 대한 신규 단위로 기존Claude8 owner에게1회 인계했으며 actualsend/peer/source/end는 해당 최신영수증으로 확인해야 한다. STORY 기존부족의존성 보충은1회enqueue와실제peer수신을 구분/반복0.

새 소비자의 root 다음 접점은 lexical P/G capture, update밖 gamepad poll·inject·facing 차단, already-held 초기화, 정상 stage clear admission·DEMO_MODE=true/LAST_STAGE=0 분기,5000ms callback·900ms curtain epoch 및 실제 지속 저장/유품/부탁 consumer다. public module 완료만으로 game.html이 연동됐다고 선언하지 않는다. dbSave/SP10 보상 재지급·Q전용 blackBean/E불가·어택티켓·2_3 설계 변경0.

하루 약15 percentage points 계정사용 목표: 기준 주간10080분41%/남음59%, reset2026-10-12T11:52:56Z, 모든채팅공용/일일토큰값 미제공. 의미있는 제작·검수·후속배정에 쓰며 반복감사·같은TASK·이미완료검사로 소비하지 않는다. 목표도달로 제작 중지0/실한도는 준수/자동결제·설정변경·우회0. 단일rootheartbeat30분 ACTIVE로 연속운영, 다른 PAUSED·아침메일 재개0. 원총괄직접전문중복송신0/Claude8·Codex7 기존owner만송신소유/거절된Codex·ART 목적 재시도0.

실제 NUL80부터 모든후보상세인수 대기없이 완료소유 officialend/fullpin만 즉시 checkpoint.100전새산출중단. foreign68·ownerSTATELOG4·타인WIP·원PNG·사용자save·기존23 보존. §23: MASTER/OUTER/MEDIUM/GROUND/랜드마크/DETAIL 기존불변, PLAYABLE 독립iframe만, CAMERA 실제entry/return UI, TECH 새결과핀별분리, VISUAL VERDICT 전체RETOUCH·hostUI PASS, 본편/native6/audio/save/A급 미인수. 다음 정상 code+docs commit/push·remote exactSHA를 외부 보존 영수증으로 확인한다.


### ROOT-PUBLIC-RIFT-CHECKPOINT-RAW63-66-20261007

정확 source/end로 raw63–66 후보4를 미채택 보존한다. root 독립 읽기 반례 결과 raw63 SKILL invalid상태에서 classify 차단과 autoNext/gamepad helper허용 불일치, raw64 ENEMY own phase/inherited then/expectedToken getter실행·throw/invalidboolean·disposed-oldtoken 우회가 관측됐다. 새로운 stdin1 / 7조건FAIL·PASS0·미도달0·exit1, source 전후 exact. raw 직접채택/임의getter실행없는strictroot파생필요. BOSS/QA 신규 반례 stdin1 실제8조건FAIL/exit1: BOSS capturedContext prototype/숫자 String 변환의 getter·throw, QA expectedPin 미사용/다른pin·bare문자열 native6 PASS·kind없는visual PASS·fixtureboolean saveACK PASS 및 오류이름/Promise/ownKeys trap전파를관측했다. 검사준비 공유폴더 EEXIST는조건0·후보호출0로별도보존. 두raw미채택 semanticFAIL. signedDiff는 _diffSigned의-5..+5이고 다음stageDiffOff는 NEXT_DIFF_OPTS [-100,-50,0,50,100](game61689–61696)로서 서로다른수치다. source자체검사PASS는 실제인수로승격하지 않는다.

앞서 검수된 raw61 측정은 PNG16 atlas/40셀=32유효+8빈이며32 PNG가 아니다. 데이터표정확/API4FAIL과해부학적발·IK未인수를분리했다. 원raw61–66 변경0. root의 신규정확소유 tools/2_5d/rift-parent-input-lease.mjs는 rootjob/epoch를host단순disposed보다우선하는 명시ownboolean차단/held초기화각epoch1/parent sim·gamepad poll·inject·facing·autoNext gate 준비를 구현 중이다. 존재/착수는완료가아니며 WIP stage0. publichost/gate 독립모듈의5f8a62eb…보존과실제본편연결未완료는별개다.

세이브/대사 문서의 host formatter 제한 검수에서 '음성2'라고 잘못 쓴 표기는 실제 '실패 주입 2건 + 정상 GUI 2건'으로 정정했다. 코드변경·음성검수추가0·audio미인수. 원작업전fullprefix보존,5f8 committedbyte백업선행 후새append구간만정정/normal다음commit/amend0. _MAP_SSOT_INDEX와RESOLUTION_DETAIL·키바인딩 관련정본도현재publicmodule핀/해상도/미구현hotpath와정확동기화.

foreign68 bytes/fullSHA·ownerSTATELOG4·타인WIP·user save/원PNG/scene/nav/game/보호2_3/기존23 보존. 실제80부터완료소유만정상checkpoint, raw공식end/fullSHA표는 ROOT-PUBLIC-RIFT-FOLLOWTHROUGH의 4행과 외부 main-policies-fix-raw63-66-formal-receipt.json을따른다. 일일15%포인트목표는계정공용주간사용관측기준이며토큰낭비·반복시험·채팅전용소비보장0. §23 VIEW: 실제hostentryreturn UI PASS / 전체VISUAL VERDICT RETOUCH / 본편native6/save/audio/A급未인수.


### ROOT-RIFT-INPUT-DPR-RAW67-CHECKPOINT-20261007

완료소유 공개 모듈 1개와 DPR resize 수정 1개, 공식 완료 raw67을 정확핀으로 보존한다. 관련 정본 9문서와 운영 정본 6문서를 동기화한다. 파일 존재/fixture PASS/원자료 보존을 본편 인수로 계산하지 않는다.

| 항목 | 파일·정확 계약 | bytes / SHA256 | 검수·채택 |
|---|---|---|---|
| parent input lease 최종 | tools/2_5d/rift-parent-input-lease.mjs / createRiftParentInputLease({ports:{readOwned,clearHeld}}) | 12294 / d22e6f2c2bcac8f86fa62901c5f1cf62d0c2b497f9c39530a236c9292b89efc1 | 동기 root job 소유권 차단 모듈 완료; 실제 game hotpath 연결 PENDING |
| DPR resize | tools/2_5d-world-lab.mjs resize() / Number finitepositive DPR만 채택, invalid1, cap2, 값이 달라질 때만 setPixelRatio, init 기존 cap2 유지 | 33105 / 2ee937444788ad8e0c4885867e376e14fc1345ee5a5851561092b7052a367d12 | syntax1 및 새 실제 Chrome 실험1 PASS; 실제 모니터 전환/DPR 단독 자동감지 미인수 |
| raw67 ANIMVFX V2 | tools/team-followup-20261007/hell-rift/ANIMVFX/rift-wolf-foot-bounds-v2.candidate.mjs / CH1-RIFT-WOLF-FOOT-BOUNDS-FIX-20261007-ANIMVFX-CANDIDATE | 10514 / 4848ab0ffe5af71c3f9d0a4560bbdc72c08a627e283c0e36803f5b0bf9348088 | 공식 end 6ec60258-852e-436e-b15d-5a4b433d6250 / 2026-10-06T19:24:23.093Z / end rawSHA a6a1980792a00dde158cabf97b8e26c944cc383bc60079369e8d3a506f5775c4; 미채택 보존·root 의미검수 PENDING |

| parent input lease 세부 | 현재 값·계약 |
|---|---|
| 필수 ownership | synchronous own plain Object.prototype/null record의 own-data owned:boolean + epoch safe integer 0..9007199254740991. 명시적인 현재 owned:false만 allowParent=true. missing/getter/inherited/thenable/throw/낮은 epoch/해제epoch 재사용/disposed는 UNKNOWN 또는 STALE/DISPOSED block=true |
| held 초기화 | clearHeld own-data function+original ports receiver; 각 owned epoch 첫1회, 외부 콜백 전에 시도기록, 동기 undefined/true만 성공. 콜백 후 rootowned/epoch 재검사, 같은 실패epoch 재시도0. host dispose가 root job 소유권을 해제하지 못함 |
| API | readPolicy, suppressUpdate, suppressGamepadPoll, suppressGamepadKeyInject, suppressFacingMutation, suppressAutoNextStage, classifyProjectedEvent, captureFreshOwnership, dispose |
| projected input | root caller의 own primitive event projection만 소비. iframe WASD/arrows walk260·Shift run470·J attack·R dialogue·Space pause·Esc close-dialogue·Tab/Enter modal-native은 advisory. native event dispatch/preventDefault/부모 이벤트 변조0 |
| 부작용 | timer0/RAF0/DOM0/save0/reward0/nextStage0. captureFreshOwnership은 detached frozen 진단이고 영속 permission/해제handle이 아님. 실제 update 최상단/gamepad poll/key injection/facing/auto-next 및 held exit resync는 caller 연동 필요 |
| 비동기 실패 보정 | 같은realm native Promise prototype/no own constructor/원 native constructor·species 상태에 한해 captured intrinsic then으로 rejection만 관찰. Promise를 owned나 성공으로 승격0. own then getter 실행0; arbitrary then/foreign Promise 채택0. 검사 foreign Promise는 fulfilled fixture이며 적대 foreign/constructor accessor rejected Promise까지 관찰했다고 주장0 |
| 초기 핀 검수 이력 | 12058 bytes / 01ce35a76bffe36056680899916436f991d232f4d3e8e5f6cede0ffcb804c676에서 신규 stdin1·16그룹288조건 PASS/FAIL0/exit0. 최종 핀으로 재실행하지 않았음 |
| 최종 제한 검수 | 새 stdin1에서 최초 FAIL1/3조건·unhandled1(UNKNOWN/block은 정상) 보존→external byteexact backup→observer 최소보정1→후속6그룹33조건 PASS6/FAIL0/newUnhandled0/overall exit0. 원16/288 재실행0; 의미 stdin 총2회. 초기·최종 핀과 실패를 합산 PASS로 덮지 않음 |

DPR 실제 experiment1: CSS 1034×712.46875 고정, DPR1→2→3→1.25에서 backing/GL 1036×714→2072×1428→2072×1428(cap2)→1295×892; LINK=true GPU program13/GLerror0. 같은 launch의 NaN/Infinity/0/negative/string/undefined fallback1 synthetic6도 별도 기록. editor scene/terrain/foot5480/3740 불변. 1254px 원본을 8000 world에 확대하는 흐림 및 2D legacy1024 mask 병목은 별도 미해결이다. resize3줄로 원본 해상도나 보행/geometry를 바꿨다고 선언하지 않는다.

root 본편 접점 읽기 결과: 정상 _proceedNextStage의 기존 dbSave1 앞에서 rootepoch/P/G 캡처 후 await 뒤 동일성 검증이 필요하고, clear reward/save를 중복하지 않는다. clear시 G.on=true·_bossArena=true일 수 있어 arena만으로 유효 clear를 막지 않는다. update의 systemLesson·panel key가 pause 이전이고 gamepad poll·direct WASD·mouse facing도 별도 guard가 필요하다. clearHeld 뒤 gpClearAll 순서, Continue는 host UI만 닫고 gate.cancel0/rootlease는 지연5000ms 동안 유지, callback에서 현재job→commit1→현재job→nextStage1 및 curtain900ms 별도token이 필요하다. DEMO_MODE=true/LAST_STAGE=0의 기존 nextBtn 분기와 3387-only host admission·실제 Continue UI·child P/char 연결은 PENDING. game.html/DEMO·보상·세이브·Q전용blackBean(E패링불가)/어택티켓/보호2_3 변경0.

일일 약15%포인트 제작 목표는 계정 전체 주간 사용률 관측 기준이다(10080분 창 기준41%/남음59%, reset2026-10-12T11:52:56Z; 일일 tokens 미제공). 실제 제작·신규 의미검수·후속 배정으로 쓰고 같은검사/완료/TASK 반복·소비만 위한 작업0. 목표달성만으로 연속 제작 중지0, 실제한도는 준수. 단일rootheartbeat30분 ACTIVE, 다른paused·아침메일 재개0. 기존Claude8/Codex7 owner만 전문송신, 거절된Codex/ART 목적 우회0. ANIMVFX 다음 효과 수명 작업은 owner가 1회 배정·peer/첫source 확인했고 root 전문중복지시0.

MAP PRODUCTION REPORT (§23): MASTER PLAN 기존 guide/SSOT/LOCK 우선; LARGE OUTER MASS/MEDIUM CONNECTION/GROUND CONNECTION/랜드마크/SMALL DETAIL 변경0; PLAYABLE/COMBAT 독립 소비자 모듈이며 본편native6/실보상save未인수; CAMERA QA DPR 새 실WebGL1 및 해당source 화면3, parentlease 화면검수0; TECH QA 신규 검사와 초기핀 이력 분리; 원화·scene/nav·타인WIP·foreign68 bytes/fullSHA·ownerSTATELOG4·user save/기존23 보존. VISUAL VERDICT: RETOUCH. 기존 host entry/return UI PASS와 전체 맵/본편/native6/audio/A급未인수를 구분한다. 정확 code+docs 정상commit/push·remote exactSHA는 외부 영수증으로 확인한다. 실제 NUL80부터는 완료소유만 즉시checkpoint/100전새산출중단한다.


### ROOT-RIFT-RAW67-STRICT-REVIEW-20261007

raw67 ANIMVFX V2 공식완료 후보는 f5a01e3a72a34fdfdb5b6b1bd2053fddfceaa2ee에 미채택 보존 후 신규 제한검수했다. 이전 부록의 root 의미검수 PENDING 상태는 아래 SEMANTIC FAIL 결과로 갱신한다. 원자료 수정·소비자 채택0.

| 항목 | 현재 근거·판정 |
|---|---|
| source/end | tools/team-followup-20261007/hell-rift/ANIMVFX/rift-wolf-foot-bounds-v2.candidate.mjs 10514B / 4848ab0ffe5af71c3f9d0a4560bbdc72c08a627e283c0e36803f5b0bf9348088; CH1-RIFT-WOLF-FOOT-BOUNDS-FIX-20261007-ANIMVFX-CANDIDATE; 공식end6ec60258-852e-436e-b15d-5a4b433d6250@2026-10-06T19:24:23.093Z/endrawSHAa6a1980792a00dde158cabf97b8e26c944cc383bc60079369e8d3a506f5775c4 |
| 신규 검수 | 제한stdin 실제1회/10그룹=8PASS+2FAIL/96조건중5FAIL/미도달0/unhandled0/exit1. 원40셀 전수측정·raw61 옛5PASS4FAIL 반복0 |
| 새 P2 plain admission | readOpt86–87이 STRICT_INPUT_CONTRACT의 undefined 또는 plain object와 달리 null/Date/Map/class instance를 받아들임:4조건FAIL. own plain Object.prototype/null prototype을 명시적으로 제한하는 consumer가 필요 |
| 새 P2 typed length | measureFootBounds104에서 rgba.length mutable property lookup. 실제8bytes Uint8Array에 own length4를붙이면 cell1 exact4bytes admission을 통과:1조건FAIL. captured TypedArray intrinsic length/byteLength·brand 검사가 필요 |
| 통과 범위 | opts descriptor/getter0·Proxythrow/error.message0·NaN/invalid frame·unknown mode·intcell·threshold와 대표 south1 실측 alpha4114px/lowestRow187, blank frame3 same-dir idle fallback PASS. 정상대표1을 전체40셀 재인수로 계산0 |
| 원본·consumer | source V2/v1·현 tools/2_5d/corrupted-wolf.mjs20662B/ac3fd86a5441c84cd477a716e86af8cec92b61589781a8296b4b59acdec17acc·img/atlas_ch1_8dir_south.png798229B/156e76481bc26682afe7d85c01c94477e66e1718bbe88f9d67baddbcc561da23 포함4핀 전후exact; 원PNG/scene/nav/실제consumer변경0 |
| 검수 영수증 | 외부 raw67-review/raw67-limited-review.json24761B/b167bc5f2689025336b4660b41759e0effcedef75c2474b606f5dd0d244f6b71. 새 실패는 이력 보존하고 source 존재/자체PASS/공식end를 의미PASS로 승격0 |
| 후속 | 기존 Claude8 owner에 새 결과·원격보존을1회인계. 진행중 CH1-RIFT-PARENT-CHILD-EFFECT-LIFETIME-20261007-ANIMVFX-MEMORY(송신/peer/Read/첫source1)는 유지, 같은 TASK 재송신0/root전문송신0/독립팀일괄보류0. 효과수명 완료 뒤 정확end/pin 및 승인된 다음새단위는 owner소유 |

MAP PRODUCTION REPORT (§23): MASTER/OUTER/MEDIUM/GROUND/랜드마크/DETAIL 변형0; PLAYABLE 기존consumer 유지/새raw미채택; CAMERA 새GUI관찰0; TECH 위제한stdin1·정확4핀; code수정0·관련정본6문서append/fullprefix보존. VISUAL VERDICT: RETOUCH / 해당API 실화면 NOT ASSESSED. 해부학적발/IK/본편native6/청취/실보상save/A급未인수. 일일15%포인트 계정공용주간사용목표는 의미있는제작·신규검수에 적용하고 토큰낭비·동일검사/TASK반복으로맞추지않는다.


## 2026-10-07 ROOT-RIFT-CHILD-LIFETIME: 실제 종료 검수와 생산 반영

| 항목 | 현재 사실·정확 계약 |
|---|---|
| 완료 소유 | ROOT-RIFT-CHILD-LIFETIME-20261007: tools/2_5d-world-lab.mjs 36039B / SHA256 8388efcf35e8b9a768750fc54227928232363a32f8113039d4f81a04a90eca93. 기존 ANIMVFX-MEMORY 공식 end c0a741f3-4fd7-4f07-a6ad-d2a888823376 @2026-10-06T19:33:53.039Z의 파일0·메모리3PASS는 선행 이력이며 이번 실제 구현·Chrome 검수와 구분 |
| 구현 | 첫 top-level await 이전 native pagehide 등록. 종료 시 disposed/epoch를 먼저 변경하고 각 자원의 cleanup을 독립 실행. 생성완료 뒤 늦게 반환된 terrain/residents/rigs/special은 adopt·scene/DOM/ready·RAF 재시작을 막고 즉시 dispose. 한 cleanup 예외가 이후 cleanup을 막지 않음. readonly __rift25Lifecycle.snapshot()은 detached frozen primitive 진단만 노출 |
| 최종 소스 제한검수 | final 8388 핀에서 신규 미도달 5그룹·100조건 PASS/exit0. 이전 35079B/dcaad20f prototype 10그룹5PASS5FAIL/110조건은 STORY fixture가 비어서 5경계 미도달한 이력, 제한 하네스 parse 실패1은 product 호출0. 성공한 기존5·메모리3·DPR·publichost/gate/lease 검사를 재실행하거나 최종 전체suite PASS로 합산하지 않음 |
| 실제 Chrome | ROOT-RIFT-CHILD-LIFETIME-BROWSER-20261007: 고유6그룹 PASS6/FAIL0/partialUnknown0; observed subcheck21 PASS21, process exit0. 실제 Chrome launch1/context1/parentpage1/childdocument6, native trusted pagehide6/6. 보호18 source핀 전후 exact, pageerror/consoleError/HTTP오류/외부요청/변경요청0 |
| 취소 경계 | terrain/resident/special/rig 실제 factory가 생성완료한 뒤 반환 gate에서 취소한 4경계; lateResourceRejected 각각1·실제 dispose 각각1. 미완료 HTTP 중 취소 실험으로 주장하지 않음. 지연 fetch3(terrain/resident/special), rig는 cache. 종료 뒤 frame/RAF/DOM/native draw 재활성화0 |
| 예외와 GPU 관측 | 실제 terrain.dispose 이후 정리 예외1을 주입해도 renderer/residents/dialogue 등 해제 진행. 정상·예외 각각 native deleteProgram13/deleteTexture13/deleteBuffer38, cleanupFailures 예외경계1. 이 native API 호출과 JavaScript dispose 관측은 물리 GPU/OS 메모리 반환 인수가 아니며 physicalGpuMemory UNKNOWN 유지 |
| 문서 정본 | HELL_RIFT_RESOLUTION_DETAIL_20261006.md 73149B/51e2eda13ed335d1056e9564ee58824c1fd45d2854940ef2519f5b52858e0cc0; HELL_RIFT_2_5D_SLICE_20261006.md 127553B/aef712a2456a92e905d1ea03e360e6aef009d89adbb9a92db048df7ffbc566ff; THREE_LOCAL_SINGLE_RUNTIME_20260929.md 93236B/dbe32dfed193e1b829228add274fea9f7d0eb53b1b4909ae6a27808188e8704b. 각 원문 prefix100%·새 append EOF LF1 |
| 증거 | 외부 /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/child-lifetime-browser/acceptance-summary.json·final-receipt.json·map-production-report.txt·actual-ready-gpu.png·parent-after-cleanup.png. raw-result SHA256 9a6b60b96fe30a81fc6672bfc7734f82cf16171a9b6619c7fcf92b28c23a0da5. fixture와 실제 Chrome는 별도 영수증 |
| 다음 미완료 | 새 main-rift-runtime/game 정상3387 clear-route 소스 연결은 별도 완료 단위로 docs·신규 소비자 화면검수 중. 기본 DEMO_MODE=true/LAST_STAGE0 nextBtn 종료→허브는 PENDING. 실제 main/native6/청취/유품·부탁 보상 durable save/child P·char 전달/A급 인수0 |
| 오더·운영 | 기존 Claude8 owner의 CH1-RIFT-WOLF-FOOT-INPUT-BRAND-FIX-20261007-ANIMVFX는 송신/peer/Read/첫source1, 최신 공식end 수신 전까지 완료로 계산0. raw67 V2 의미FAIL·미채택 보존 및 이전 거절 송신 경계 유지. 24시간 제작·계정 공용 주간사용률 약15 percentage points/day 목표는 의미있는 신규 구현·검수·후속배정으로 운영; 동일 검사/TASK 반복·토큰태우기0 |

MAP PRODUCTION REPORT (§23): MASTER/OUTER/MEDIUM/GROUND/LANDMARK/DETAIL 원본 지형·PNG·scene/nav 변경0; PLAYABLE 종료 뒤 입력/RAF/자원 수명 소비자 최소 보정; CAMERA actual-ready/parent-return UI PASS, 전체맵은 확대 원화·재질/접합 과제로 RETOUCH; TECH 위 실제6 및 source 검수 핀·실패이력 분리; 관련 docs 전체검색·정확 동기화 후 완료 소유 code+docs만 정상 checkpoint/push. VISUAL VERDICT: RETOUCH. 실물 모니터·본편 native6·청취·보상 save·A급완성은 미인수.


## 2026-10-07 ROOT-RIFT-MAIN-SEAM: 정상 전환 소스 연결과 신규 소비자 화면

| id·적용 위치 | 현재 값·구현·인수 경계 |
|---|---|
| ROOT-RIFT-MAIN-SEAM-INTEGRATION-20261007 | game.html 4050426B / SHA256 ece8c398068903caf666979b33c3e0f541043db1e58f98a65d7c68e427f74230; tools/2_5d/main-rift-runtime.mjs 7519B / SHA256 b93cb86f7857bd4242af8b9cc9478cceea591d03aad872bca76a5af06b471b69. 初期 game4039085B/4f4eba2596c33f4e0c28e1e68ac224560e17c944cdbe9596ad9956c7578e3ccd bytebackup 및 최종15접점 역변환 원문 exact |
| 실행 범위·원 DEMO | location.origin === http://127.0.0.1:3387일 때만 lexical root 소비자 활성. 정상 _proceedNextStage clear-route에 소스 hook 구현, 사용자3333/3340/file 경로 동작과 기존 demo terminal nextBtn은 유지. _DEMO_MODE=true/_DEMO_LAST_STAGE=0 기본 CH1-1은 terminal branch를 우회하지 않아 허브 진입 PENDING |
| 실제 capture·admission | _rootRiftBegin 이전의 P/G/player/context/stage/_charId/_charIdx/difficultyOff=(G._stageDiffOff??0)/difficultyIndex=(OPT.diff??5)/save=dbSave/saveReady=_dbReady/status=P.s/previousOn=G.on을 root job에 보존. stage safe integer>=0, hp finite>0, stageCleared===true/bossAlive===false·charIdx범위·MAX_SAFE_INTEGER epoch 경계·dead/fallen/reviving/lastStand 차단. 정상 clear의 G.on=true 및 _bossArena=true 자체를 오인 차단하지 않음. G.on=false 전환 뒤 held clear, 기존 dbSave 호출1 await 및 import·enter 뒤 동일 capture 검사 |
| input·epoch | _rootRiftEpoch/job이 권한 정본. _clearHeldInput 이후 _gpClearAll, _gpSynced=false·axes0·G._gpAiming=false. held restore0. update 맨앞(systemLesson/panelkey 이전), gamepad poll/inject/direct WASD/facing/autoAim, autoNext·nextStage에 lease guard. parent capture quarantine은 legacy gameplay 이벤트를 차단하고 host native modal 컨트롤 및 자기 Continue를 허용. init-stage/boot-loading/retry/char/lobby/hidden/pagehide에서 matching-job 무효화; advancing 중 자기 init-stage/boot-loading은 예외 |
| runtime API | createMainRiftRuntime({window,document,ports}); ports own functions readOwned/clearHeld/isCurrent/readHostContext/readGateState/schedule/release. enter(captured), continueStage(), parentEvent(event), block(channel), finished(captured), cancel(reason), dispose(), snapshot(). foundation publichost17683/008a33930406b5ceaea70fb83050eab46acbd24eb7cf98579cae7b64adb6dc38·gate16280/f9dbbcb891e79748d6b71eb08e331745ccd62f7992d0210fe438fbd3574038fd·lease12294/d22e6f2c2bcac8f86fa62901c5f1cf62d0c2b497f9c39530a236c9292b89efc1은 변경0 |
| Continue·5000ms·900ms | 자기 leaf button '위로 올라가기 · 다음 구역', click·Enter/NumpadEnter/Space 명시동작만 continue. gate.restore()/dispose()로 hostUI만 닫고 gate.cancel0; rootowned는 예약5000ms 동안 유지. 현재job 검사→gate one-shot commit1→현재job 재검사→기존 nextStage1. 성공한 fade900ms는 별도 curtain epoch와 boot epoch로 보호. parent Escape 등 advanced 이외 matching-job release는 자기 curtain RAF/wait/hide를 즉시 cancel; queued old callback이 새job/새curtain을 취소하지 않음 |
| 상태·캐릭터 | readHostContext {player:P,character,stage:G.stage,context:G,on:G.on,stageCleared,status:P.s}; readGateState {stage,stageCleared,status:'clear-continue',difficultyOff,contextId:epoch}. character는 _charIdx===1이면 silvertail, 그 외 warrior인 host admission 문자열이며 child P/char 연동 인수가 아님. runtime snapshot.mainSeamConnected=true는 소스 연결 상태; actualStageAdvanceAccepted/childCharacterLinked/saveAckAccepted=false, save/reward/RAF/timer0는 runtime 자신 범위. classicgame curtain timer는 위 별도소유. __riftMainIntegration.snapshot()의 durableSaveAccepted/demoHubAccepted/childCharacterLinked=false |
| source 검수 이력 | 구 game4050167B/f3a084bc1a136186ccca3157b9a9a1f5f41133b72eebfb10aa2641fe2a017cf3에서 신규 source9그룹133조건 PASS9/FAIL0/exit0. final ece8에서 matching-job Escape 취소 보정 신규 제한2그룹20조건 PASS2/FAIL0/exit0. 원9/133 재실행0/최종전체suite로합산0. 최초 syntax checker는 importmap JSON 오분류로 변경 main/module 도달 전 실패; 보정 checker의 main+module syntax PASS와 final 제한section parse를 별도 보존 |
| 신규 소비자 실제 DOM | ROOT-RIFT-RUNTIME-CONSUMER-BROWSER-20261007: 고유3그룹/15subchecks PASS/exit0, 실제 Chrome launch1/context1/QA부모page1/child3직렬. runtime의 실제 자기 Continue click·Enter 각각 hostUI/polltimer0·예약 rootowned/leaseblock 유지·지연 permissiontrue1/duplicatefalse1·모의advance1. 예약 중 trusted W downstream0, Escape release(parent-escape)1→oldcallback2false·모의advance0. publiccode5+원자료6 핀11 exact/gamefinal핀 전후 exact; pageerror/console/HTTP/외부·변경요청0 |
| DOM fixture의 한계 | QA 부모는 detached P/G/stage1 ports로 실제 runtime과 host iframe을 연결한 fixture. 실제 game.html·nextStage·5000ms/900ms·save·본편 held/gamepad/update·mobile 인수0. 이 신규3/15는 이전 host-gate interop4·source9/133·final2/20·child수명6/21과 합산·반복하지 않음 |
| 문서·외부 영수증 | API·save/input/editor 계약은 키바인딩/세이브/RIFT_DIALOGUE_PUBLIC_CONSUMER/HELL_RIFT_EDITOR_RESULT/MAP_SCENE_EDITOR/_MAP_SSOT_INDEX 정본6 및 lifecycle3·rootops6에 정확 동기화. 외부 main-seam-integration/rig-motion-implementation/final-receipt.json·handoff.md와 runtime-consumer-browser/acceptance-summary.json·final-receipt.json·map-production-report.txt·runtime-owned-continue-ready.png·runtime-click-scheduled.png·runtime-escape-cancelled.png를 구분. 앞선 child 수명 code1+docs9 정상 보존 remote exact 27c05d650f1d42831f5993c2a6a292a9f92c891f |
| 다음 승인 미완료 | 기본 demo1-1 종료→허브 정책/실제캐릭터 전달, NPC 유품·부탁의 명시선택과 동일save ledger의 async durable ACK, 맵 확대 흐림/절벽·전경 재질접합, 실제 editor/main/native6·청취·보상save 검수. 기존 tools/map-scene-rift-dialogue.mjs session choose(actualGrant:false) 또는 async void dbSave의 resolve를 durable 승인으로 간주0. 24시간 제작은 완료핀·보존 후 다음 미완료를 이어가며 기존 owner 송신독점/거절경계/타인WIP·user save·원PNG·scene/nav/보호2_3/Q전용/어택티켓금지 유지 |

MAP PRODUCTION REPORT (§23): MASTER→OUTER→MEDIUM→GROUND→PLAYABLE→LANDMARK→DETAIL 순서에서 지형·원PNG·scene/nav 수정0, 기존 2.5D 보행화면을 normal parent consumer에 연결; CAMERA 신규 desktop Continue/예약/취소 UI PASS, 맵 RETOUCH; TECH source 핀·prototype/final/신규DOM fixture 분리, 실제 main(native6)·audio·durable save 미인수. 관련 docs 전체검색·fullprefix backup·새 append EOF LF1·완료소유 code+docs 정상 commit/push/remote exact은 외부보존 영수증으로 확인. VISUAL VERDICT: RETOUCH. 소스 구현과 실제 CH1-1 플레이 인수를 구분하며 A급완성 선언0.


## 2026-10-07 늑대 V3 거절 후 동일산출 기록: 채택·추가실행 보류

| 항목 | 최신 확인 사실·경계 |
|---|---|
| root 정상 완료 | 본편 정상3387 전환 소스 code2+docs15는 정상 commit/push remote exact 6de5e92e7783b824c18e66e80d18d08979714743. 직전 child 수명 code1+docs9 remote exact 27c05d650f1d42831f5993c2a6a292a9f92c891f. source/DOM fixture 검수와 실제 CH1-1 native·청취·보상 save 미인수는 기존 최신 append대로 유지 |
| V3 공식 완료·정확 핀 | CH1-RIFT-WOLF-FOOT-INPUT-BRAND-FIX-20261007-ANIMVFX-CANDIDATE, 공식 end 673f01c7-025f-40d3-ac1d-156b596c850a @2026-10-06T19:51:28.593Z/end rawSHA b9d644ad82c80768ef6a9d050140249590c3c46be60fc8139f7a461d5cbbab25. 현 checkout tools/team-followup-20261007/hell-rift/ANIMVFX/rift-wolf-foot-bounds-v3.candidate.mjs 12388B/f37e21c29046a860d23439ff8874561c2ba36c9338aee05c291f646868055256은 읽기 전용 exact 확인. 송신/peer/Read/첫source/end 각1은 공식완료 증거이며 안전/의미/소비자 채택 증거가 아님 |
| 실제 자동 거절 | 최초 Write 요청 경로 /Users/fordeargamers/Projects/exoduser-migration-20261007/hell-rift/ANIMVFX/rift-wolf-foot-bounds-v3.candidate.mjs는 실제 checkout 밖. toolUseId toolu_017r31hjgx8cAyJFNVBzWfJn, 거절 결과3cbcc1cb-c2d1-41c5-baf8-3086e50ab31d @2026-10-06T19:48:38.284Z. Claude Code auto mode classifier가 dangerous로 거절했고 구체 이유는 제공하지 않음 |
| 거절 뒤 기록·감사 판정 | 이후 동일 V3 산출을 실제 checkout의 정경로에 작성한 성공 기록이 있음. 팀의 '우회 없이' 주장과 결과 자체에 적용된 거절 제한이 충돌한다. root/owner는 DENIAL_THEN_SAME_OUTPUT_WRITE_AT_CORRECTED_PATH로 감사하며, 해당 목적 추가송신·작성·우회·root 신규 실행/의미검수·consumer채택·원격 raw보존을 보류. 기존 파일을 수정/삭제/cleanup하지 않음. 거절 경로 생성/피해는 UNKNOWN이며 그 경로 탐색·repair·삭제로 소급 안전 판정하지 않음 |
| 원격·검사 구분 | V3 remoteACK=false, unadopted denied-outcome incident hold. 팀 최초 stdin exit1과 후속22 assertions PASS/exit0는 별도 보고 이력이며 root가 같은검사를 재실행하거나 의미PASS로 승격하지 않음. V2 raw67 10514/4848ab0...의 기존 의미FAIL·미채택 원격보존은 그대로 |
| 독립 전문 작업 | CH1-RIFT-ACTOR-EFFECT-OWNED-RELEASE-20261007-ANIMVFX는 별도 승인 목적이고 owner가 이미1회 송신/peer1. 최신 Read0/성공source0/end0; actor-effect-release-2_5d.candidate.mjs 파일 존재를 착수·완료로 계산하지 않음. root중복송신0·위V3같은목적재시도0·독립작업일괄보류0. owner가 이후 실제 firstsource/공식end/정확핀을 수집 |
| 다음 생산 입력 | NPC-main read-only-plan.json 27415B/2ef9a646659ede063dc250103b06b768c8d0752b9766a93fe88ecd3765473ce3, docs-related-search.json 51952B/460a86f053790bb801bd415b18802622f650b33a4ef651f3e31ef51ea8dad0c7. 실제 controller tools/map-scene-rift-dialogue.mjs choose는 임시 Map(actualGrant:false), lab:122 선택·:421 공개진단에 parent action port0, runtime Continue에 거래busy guard0. 기존 async void dbSave/pickup의 지급 즉시5초제한 dbSaveForce는 같은 inventory+ledger durable commit으로 간주0. 다음은 explicit choice/거래busy, 한 슬롯 snapshot 저장 및 {ok:true,slot} ACK+같은slot readback, 검증된 유품 매핑. root 읽기계획은 구현/저장/게임 인수0 |
| 보존·운영 | 실제 NUL 90→74로 완료 code2+docs15 보존, foreign68 exact/index0. 신규 raw2는 이번 root 코드 커밋에 포함0, 소유 ownerSTATELOG4는 root쓰기0. 80부터 완료소유 즉시checkpoint/100전새산출중단, 24시간 의미있는 제작·신규검수·후속배정 지속, 계정공용 주간사용률 약15pp/day 목표/토큰태우기·동일TASK반복0·다른 PAUSED 자동화/아침메일 재개0 |

MAP PRODUCTION REPORT (§23): 이번 단위는 문서 감사·정확 pins 기록만이며 geometry/원PNG/scene/nav/실제 consumer·검사·GUI 수정0. 실제 main source 연결의 신규 UI fixture PASS 및 전체맵 VISUAL VERDICT: RETOUCH 유지. V3는 raw/file·공식end·자체assertion을 실플레이나 채택으로 계산하지 않는다. 외부 animWolfV3DeniedOutcomeIncident20261007-root-observed.json과 raw67BrandFix20261007CompletedOwnedHandoff-root-observed.json에 정확 증거 보존; 자동 거절 목적 외 독립 root·기존 owner 작업은 계속한다.


## 2026-10-07 raw69 ACTOR-EFFECT-OWNED-RELEASE 공식 완료: 후보 미채택 보존

| 항목 | 정확 핀·인수 경계 |
|---|---|
| 완료 소유 | CH1-RIFT-ACTOR-EFFECT-OWNED-RELEASE-20261007-ANIMVFX-CANDIDATE, tools/team-followup-20261007/hell-rift/ANIMVFX/actor-effect-release-2_5d.candidate.mjs 6649B/SHA256 caaf02550bcdd0ecf7f6ae90db445153aebdd66a92cace41c81bbbed8137059c. raw69 번호는 별도 효과해제 후보이며 denied V3 raw68과 다른 승인 목적 |
| 공식 end·firstsource | b4e272d8-7219-499d-b688-5d69f5f27910 @2026-10-06T20:15:23.328Z/end rawSHA3a09da72b1bdcdfa867ca2cf419696f624991a094465c29d58538e643be8a619. 송신/peer/Read/성공source/end 각1. first successful Bash toolu_019V1KuPVfT6WTW7nod1rs7W/result11a2496e-9c95-4c19-970e-caa4f73ba87c @20:09:26.464Z |
| 보존 Gate | root 읽기 전용 exact bytes/fullSHA 및 경로·realparent·symlink/충돌 확인, 원 후보 수정0. 실제80부터 완료소유 공식end/exactpin을 상세전수검수 대기 없이 code1+docs6 정상 checkpoint/push로 미채택 보존; 원격 ACK는 외부 remote-preservation-receipt.json에서 확인 |
| 검사·채택 | 팀 보고 신규14검사 PASS는 팀 이력이며 root 의미검수·actual consumer·native GUI·GPU memory·실효과 반환 인수0/PENDING. 기존 ANIM actor-effect-lifetime public producer/renderer와 원PNG·scene/nav·main code2 변경0. 파일존재·공식end·자체PASS를 소비자채택으로 승격0, productionAdopted=false |
| 독립 다음 단위 | owner는 기존 ANIM idle를 확인하고 효과 재생성 중 예외·재진입의 별도 memory 조사 단위를 배정 중. 같은 raw69 TASK 재송신0·전문 root직접송신0·새팀/세션0. STORY 새 durable action mapping은 이전 입력이 큐에 남아 있어 새 중복송신 보류; prepared/handoff를 전문 실제 착수로 계산0. root NPC read-only 계획과 canonical 유품·부탁 매핑·async save ACK 과제는 유지 |
| 거절 경계 | raw68 V3 denied-outcome hold는 여전히 untracked/미채택/원격raw ACKfalse/추가실행·검수·채택0. 동일outcome 다른경로 작성 충돌/거절경로피해UNKNOWN·탐색/수리/삭제0 유지. 이번 raw69 공식 후보 미채택보존이 그 거절 목적을 재시도하거나 검사·채택하는 경로가 되지 않음 |
| 실제 main 상태 | 정상3387 root sourcehook·Continue 구현은 6de5e92e 코드 commit의 ece8 game/b93c runtime로 동결. 실제 source 제한2/20과 신규 DOM fixture3/15 및 child 수명6/21은 각기 별도. 기본demo1-1 허브/childP캐릭터/durable save/main-native6/청취/A급은 미인수, 전체맵RETOUCH 유지 |

MAP PRODUCTION REPORT (§23): MASTER/OUTER/MEDIUM/GROUND/PLAYABLE/LANDMARK/DETAIL·원화/scene/nav/consumer 변경0; 이번 단계는 공식 raw69 소유완료 보존 및 문서 동기화만 수행. CAMERA 신규검수0, TECH exactpin·공식end·원문prefix backup·새append EOF LF1·정상code+docs 보존, 팀14PASS≠root/native 인수. VISUAL VERDICT: RETOUCH / raw69 실화면 NOT ASSESSED. 이후 root 의미검수와 기존owner의 새 memory 결과를 구분해 최소 생산 통합한다.

### ROOT-ACTOR-OWNED-DISPOSE-20261007 — 내부 자원 해제 최소 구현 (2026-10-07 KST)

기존 효과 생성·동작·공개 API는 보존하고 `dispose()` 내부만 보강했다. 원 후보 raw69 전체 producer 교체는 API 불일치로 미채택이며, root는 동일한 해제 목적의 최소 인라인 구현을 public consumer에 적용했다. 코드 밖 모든 byte와 defaults/provenance는 이전 원문과 일치한다.

| 구분 | 정확한 현재 계약 / 근거 |
|---|---|
| 소유 code | `tools/2_5d/actor-effect-lifetime.mjs` 12162B / `a80898889231d8780dbaad13b110c36171be2a93c7b6147c21fc3a3e2010c26b` |
| 수정 경계 | `dispose()`만; `update` / `onActorChange` / `onSceneChange` / spawn / rebuild / options / defaults / provenance 변경0 |
| 실제 해제 대상 | disposed=true 선행 후 현재 `all.slice()` capture; 초기 빈 풀 snapshot을 해제 대상으로 재사용0 |
| 해제 순서 | 각 entry mesh hidden → scene.remove → material.dispose, 이후 dustGeo / attackGeo; 각각 개별 try/catch로 나머지 시도 계속 |
| 소유 handle 중복 | mesh detach Set / material·shared geometry release Set으로 identity당 시도1; mesh별 shared geometry 해제0 |
| 실패 기록 | catch된 원 예외의 message/getter를 읽지 않고 실패 개수만 누적. 마지막에 controlled Error(`actor effects 소유 자원 해제 실패: N`)를 throw하여 기존 lab cleanupFailures consumer가 관측 |
| finally | live/free 길이0, active=false, reason=disposed, stats.live/pool0. 실패에서도 닫힌 상태이며 dispose 재진입·반복은0 / 재해제0 |
| 반환값 | 정상 최초 dispose는 기존 number `all.length` 유지(빈 풀0); 실패 최초는 number 미반환 / controlled Error; 이후0 |
| 공유 외부 자원 | borrowed scene / camera / terrain / texture traversal·dispose0, renderer/worldlab/main source 변경0 |
| 신규 의미 검수 | 실제 repo Three CPU 객체 + public producer + 기존 lab releaseResource 추출 소비자, stdin1 / 7그룹47조건 PASS / FAIL0. WebGL·실제 pagehide·본편·save0 |
| 원 후보 | raw69 6649B / `caaf02550bcdd0ecf7f6ae90db445153aebdd66a92cace41c81bbbed8137059c`, 공식 end `b4e272d8-7219-499d-b688-5d69f5f27910`, `aff41d87a38b8b08a18ac7d2d9e99a2054d38a18` remote exact에 후보 미채택 보존. 전체 export/args/메서드/return 불일치 보고와 root 최소 구현 구분 |
| 전문 후속 | 기존 owner가 송신한 `CH1-RIFT-ACTOR-EFFECT-RUNTIME-REBUILD-20261007-ANIMVFX-MEMORY` 재송신0; root dispose-only와 독립인 update/rebuild 예외·재진입 조사 |
| NPC 후속 | STORY durable action mapping은 기존 입력·clarification 미수신 큐 때문에 prepared/send0; 5NPC item/quest ID를 임의 확정0, 실제 착수 주장0 |
| 신규 GUI | actor 내부 오류 1건 주입의 새 Chrome 검수 준비 중 / PENDING. 과거 child6/21·runtime3/15·team14·DPR 검사 재실행·합산0 |
| docs 전체 검색 | external `actor-owned-dispose-docs-related/search-disposition.json`의 전체 docs 관련키워드 검색·경로별 disposition; rig owned docs3와 directional doc는 별도 완료 핀 후 포함 |
| Git 인수 | 이 단위 commit/push/remote exact는 후속 external 영수증에 기록; 작성 시 root HEAD aff41. 완료 소유만 checkpoint / ownerSTATELOG4·foreign68·거절 rawV3 staging0 |
| 자동 승인 경계 | WOLF V3 최초 checkout 밖 Write 자동 승인 검토 거절(dangerous / 구체 사유 미제공) 뒤 동일 산출 작성 사고는 HOLD 유지. 해당 목적 작성·실행·의미검수·채택·원격 raw 보존·우회0; 거절경로 생성/피해 UNKNOWN |
| 품질 한계 | 기본 DEMO_MODE=true/LAST_STAGE0의 CH1-1→hub PENDING; child P/char·NPC durable inventory+ledger ACK/readback·본편 native6·청취·실보상save·물리 GPU 메모리·A급 미인수 |

MAP PRODUCTION REPORT (§23): 작업=actor effect teardown consumer; MASTER PLAN/OUTER MASS/MEDIUM/GROUND/PLAYABLE/LANDMARK/DETAIL/CAMERA geometry 변경0; 기존 guide/SSOT/LOCK 보호. TECH=신규 CPU7/47 PASS, 신규 Chrome PENDING. 실제 지형/해부학 foot/IK/게임 플레이 품질로 격상0. **VISUAL VERDICT: RETOUCH** (이 단위 신규 화면 미관측).

검수 원자료: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/actor-owned-dispose-20261007/limited-check-result.json` / `dispose-replacement.json`; root 호환성 읽기 보고 `actor-release-candidate-compatibility/compatibility-report.json`. 백업·원문 fullprefix·EOF LF1·정확 source 핀 확인 후 완료 소유 code+docs만 보존한다.

### ROOT-ACTOR-OWNED-DISPOSE-20261007 신규 Chrome 관측·실패 이력 / 후속 접점

public `actor-effect-lifetime.mjs` dispose-only 최소 구현은 code1+docs9로 `5856578bf6cc211315fb9303ab01418e36984ca8` normal commit/push·remote exact에 보존했다. 현재 public actor는 12162B / `a80898889231d8780dbaad13b110c36171be2a93c7b6147c21fc3a3e2010c26b`, worldlab는 36039B / `8388efcf35e8b9a768750fc54227928232363a32f8113039d4f81a04a90eca93`이다. 기존 producer API/defaults/provenance·dispose 밖 전체 원문과 현재 mesh/material/shared cleanup의 number/오류 계약은 이전 구현 영수증대로 유지한다. raw69 full producer 미채택과 root inline cleanup 채택은 서로 다르다.

| 새 관측 / 분류 | 정확한 결과 |
|---|---|
| 최초 준비 실행 | Chrome1/context1/parent1/child2, 준비0PASS·2FAIL·exit1; 기존 idle frame0과 dust110ms 조건 때문에 예상 pool3 미도달 / disposal 인수조건0. 해당 시점 제품판정 불가, 원실패 이력 유지 |
| 승인 후속 실행 | public onActorChange로 edge reset 후 실제 dust2+attack1 / mesh3 / geometry2; Chrome1/context1/parent1/child2. 각6조건 관측 PASS, 총12조건 PASS; 마지막 GPU후검사2FAIL·exit1 유지 |
| 전체 그룹 판정 | followup raw0PASS·2FAIL; 전체 제품/GUI PASS 선언0. 관측12조건을 원 그룹 판정과 합산·교체0 |
| actual native 소비자 | QA detached parent의 실제 mainhost → 기존 실제 worldlab iframe. trusted pagehide 후 actual public producer dispose를 호출; game.html/native6/에디터 사용자흐름 검수0 |
| remove-throw | remove 시도3/성공2; 실패 owned mesh1은 attached·hidden으로 잔류. material actual dispose event3/3, shared geometry2/2. 잔류를 성공 해제로 표시0 |
| material-throw | remove3/3; material 각 시도1이나 첫 actual dispose event0, 나머지2 event각1; geometry2/2. 실패 material 해제 성공 주장0 |
| 진단 / 반복 | 각 case controlled Error(`actor effects 소유 자원 해제 실패: 1`) 및 actual lab cleanupFailures1. 반복 dispose0 / 부작용 재시도0. 내부N과 lab resource실패1을 혼동0 |
| borrowed 경계 | producer dispose 전후 camera/terrain/비소유scene children/current textures 불변; borrowed texture dispose event0. 이후 lab 자기소유 terrain/texture cleanup과 분리 |
| 실제 GL 렌더 | 두 case render 시 LINK_STATUS true / getError0 / native bufferData·draw 관측. 신규 effect buffer upload8 각 case |
| 실제 native 삭제 호출 | remove/material 순서 deleteBuffer46/46, deleteProgram13/11, deleteTexture13/13. material 실패의 program차이 및 failed event0 유지 |
| GPU후검사 실패 | iframe unload 뒤 isContextLost=true / getError37442(CONTEXT_LOST_WEBGL). 그 시점 error===0와 비교한 원 후검사2FAIL 유지. 이전 render GL0와 시점 분리; 추가 Chrome0 / 물리 GPU 메모리 해제 UNKNOWN |
| 전체 새 실행수 | Chrome2/context2/parent2/child4; 최초2FAIL와 후속12PASS·2FAIL 분리. 기존 child6/21·runtime3/15·CPU7/47·owner14/11·DPR 재실행·합산0 |
| 소스 / 오류 | protected source11핀 전후 exact; pageerror/consoleerror/404/foreign/mutation0; repo source·docs·Git·save 변경0(검수 worker). actor12162/a808 exact 유지 |
| 원자료 pins | 최초raw `c262a83ba794208d9c5abd363b4c882cb74aeaf164dc4637ed22d9f763fae417`; 후속raw `03a6e795276bae83d36f436c93db5622b56a982c5ee6b28d3a8afdcc76c9a5bc`; 최종receipt `3dd7fd3caa8034c3a74e06f7d41bce3371cb427c707868a9cffc9ef10d3f12c4`; summary `ba2da122d960e2604fcca7ce2f2e448bd1cfee1169b04bf03fae0f1f890debd1` |
| 실제 화면 | external `actor-owned-dispose-browser/followup/actual-owned-ring-pool.png` / `668e4bfb95c29edf545f6fe48868d9ffaa9a1f96a2f5ea84ee157312447fd35d`; 화면 개선/A급 증거로 승격0 |
| owner 새 memory | `CH1-RIFT-ACTOR-EFFECT-RUNTIME-REBUILD-20261007-ANIMVFX-MEMORY-RESULT`, 공식 end `519bf6c5-b01d-4943-a74c-5f59fcfb4419`@2026-10-06T20:24:59.163Z / endrawSHA `7b967f94f5a3b48157a600af44c9b1cd362a01776a2d4dd40f70a24db699e72e`; source-derived 모델11PASS는 owner이력 / root재실행0 / public 적용0 |
| root 다음 접점 | read-only plan20069B / `c0863b26cc3b24eeb158d24959fe4898b968f792917eb60cd9c3423ded846443`: effects 슬롯 INERT 선행→releaseResource→외부callback 뒤 disposed/epoch/generation/identity 재검사, 중첩phase guard→기존 RAF의 latest pending, 초기local create→takeInitialized→publish. 아직 계획/구현0 |
| 남은 producer 경계 | geometry ctor 부분할당 및 acquire의 scene.add→all.push 재진입은 initializationScene add guard만으로 입증0. 기존 owner의 새 actorReentrantPublish memory TASK sent/peer/Read/source1·end0 관측을 이어감; 같은TASK 재송신0 |
| NPC 수 정정 | 이전 '5NPC'는 root→owner 요청범위였으며 실제 current dialogue controller/RIFT_DIALOGUE 정본 조회는 Haran/Berin/Nessa/Dorik 4주민. 미확인 fifth를 기존 NPC로 확정0. item/quantity/quest identity 좁은 조회 진행, 새 보상 ID 임의확정0 |
| 지속 생산 / 거절 경계 | 기존 owner만 전문송신, 한 단위보존 뒤 다음 승인미완료. STORY 이전 큐 미소비/send0 유지. WOLF V3 auto approval Write 거절(dangerous/구체 사유 미제공) 뒤 동일산출 사고 purpose HOLD / 실행·채택·원격 raw보존·우회0 / 피해UNKNOWN |
| 인수 한계 | CH1-1 defaultdemo→hub·childP/char·NPC inventory+ledger durableACK/readback·실제본편native6·청취·실보상save·A급 미인수. 검수/계획/fixture/파일보존을 실제플레이완료로 계산0 |

MAP PRODUCTION REPORT (§23): 범위=public actor cleanup의 actual Chrome 관측/오류 이력 보존; geometry·outermass·ground·landmark·camera 배치 변경0, 기존 guide/SSOT/LOCK 유지. TECH=신규 CPU7/47 PASS는 이전 code checkpoint의 별도 검수; 이번 Chrome raw 두 followup 그룹 FAIL 유지/제한 actor 조건12관측 PASS. remove 잔류1·material actual dispose미도달1·native 삭제호출과 physical GPU UNKNOWN을 기록했다. 실제 게임·모바일·native6·청취·save0. **VISUAL VERDICT: RETOUCH**.

외부 증거 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/actor-owned-dispose-browser/`의 final-receipt/acceptance-summary/map-production-report/원·후속 raw와 실제화면을 사용한다. 전체docs actor 관련 검색은53파일1181줄(raw2524094B/`29a74c5d66613e938339359107cc2b1790263c1cb8bc00f56895f447198b9a59`) 및 소스좁은검색22파일336줄의 경로별 disposition을 따른다. rootops6·소비자 actor3·directional·map editor·SSOT의 현재핀/인수상태를 정확 동기화하고 과거 원문fullprefix와 EOF LF1을 보존한다.
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
