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
