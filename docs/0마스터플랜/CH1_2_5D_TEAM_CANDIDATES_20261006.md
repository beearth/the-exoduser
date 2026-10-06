# 2.5D 전문팀 완료 소유 후보 보존 — 2026-10-06

[공통 목표](./CH1_2_5D_PRODUCTION_GOALS_20261006.md)에 따라 Claude8이 송신한 기존8팀 중 아래6팀은 실제 peer 수신→성공 source→공식 완료 ID 및 end_turn→idle를 인계했다. 원총괄은 6파일의 actual bytes/full SHA256을 아래 핀과 대조했다. 실제 NUL/untracked 전체 변경83 도달에 따라 상세 소비자 검수가 끝나기를 기다리지 않고 **완료 소유 raw·후보 미채택**으로 code+docs checkpoint한다. ART/MAP의 대기/WIP는 포함하지 않는다.

| 역할 | 정확 파일 | bytes | SHA256 | 공식 완료 ID | 실제 end_turn ID |
|---|---|---:|---|---|---|
| SKILL | `tools/team-followup-20261006/hell-rift/SKILL/visual-pose-consumer-2_5d.candidate.mjs` | 13284 | `5145fdb8c9ab0031709d21ad76330e997076901fb603b23ce796cf5a0ddcfb9e` | `CH1-2_5D-CHARACTER-MAP-SLICE-20261006-SKILL-CANDIDATE` | `f813a7df-c41d-4c00-b3dc-d51636a64f7c` |
| QA | `tools/team-followup-20261006/hell-rift/QA/slice-acceptance-2_5d.candidate.mjs` | 16508 | `ece531ed025321595327975642aad9a021e7c21ffc335d8b62e96993e0288e5b` | `CH1-2_5D-CHARACTER-MAP-SLICE-20261006-QA-CANDIDATE` | `98dde302-4442-4257-9f48-d1f26328da29` |
| ENEMY | `tools/team-followup-20261006/hell-rift/ENEMY/enemy-display-adapter-2_5d.candidate.mjs` | 13669 | `3f5d7d1c4f3314d1a96db37c39f0f38cfbcce630e78ef2214af046929ad75232` | `CH1-2_5D-CHARACTER-MAP-SLICE-20261006-ENEMY-CANDIDATE` | `56a6242f-56e1-4663-bec5-3245d6355f51` |
| ANIMVFX | `tools/team-followup-20261006/hell-rift/ANIMVFX/actor-effect-lifetime-2_5d.candidate.mjs` | 9201 | `1c9677089bf219ed0a5d486dc8873cb5fcbf4e7851a5df304996b3957c4c7400` | `CH1-2_5D-CHARACTER-MAP-SLICE-20261006-ANIMVFX-CANDIDATE` | `3ff70cbe-fb39-4275-8d3e-a7a031fae9d3` |
| BOSS | `tools/team-followup-20261006/hell-rift/BOSS/dark-druid-state-adapter-2_5d.candidate.mjs` | 10508 | `325c220cb74e0dd69561bab0cb43d4cf6669f1519fd689677c20d7b093a7add3` | `CH1-2_5D-CHARACTER-MAP-SLICE-20261006-BOSS-CANDIDATE` | `28c227b8-c549-4c92-9f11-281a79f67c65` |
| STORY | `tools/team-followup-20261006/hell-rift/STORY/rift-ascent-conditions-2_5d.candidate.mjs` | 9346 | `fd82218ad4c1f8a7b929b16eda1d1203fd848128d54bfee66b53b4e02e72c17e` | `CH1-2_5D-CHARACTER-MAP-SLICE-20261006-STORY-CANDIDATE` | `385be7e1-b2f3-492f-9a89-47e9d028dff6` |

## 상태·미인수 접점

| 후보 | 의미 검수 / 소비자 채택 상태 |
|---|---|
| SKILL | visual pose 지속·release 후보. 팀 자체 fixture 보고26 PASS, 원총괄 재실행0, 실제 rig 구동 연결 대기 |
| QA | source/cell predicates 후보. 팀 자체 순수 층 pass30/fail0/pending4 보고. 실제 snapshot/nav/resize provider·화면 가림 검수 대기 |
| ENEMY | 일반 적 표시 크기·facing·발 앵커 adapter 후보. 팀 자체9 PASS 보고. 현재 일반 적은 rig catalog에 없어 fallback2d, calibration 필요 |
| ANIMVFX | foot/world effect lifetime 후보. 팀 자체 stub12 PASS 보고. GPU/재질/전경/접지 및 실제 loop 소비자 검수 대기 |
| BOSS | 드루이드 상태→현재 rig의 idle/walk/run/attack API adapter 후보. 팀 자체 verify PASS 보고. dive/emerge/transform 전용 rig mode는 현재 없음. 기존 별도 dive/emerge/transform 이미지의 존재와 catalog 미채택은 구분 |
| STORY | 상승 조건과 대사 node reference 후보. 팀 자체13 PASS 보고. 실제 장완료 flag/readState/ITEM/QUESTNPC provider 미연결, 미확정 provider는 fail-closed |

이 원자료 보존을 생산 채택·본편/native/청취/시각 인수·A급 완성으로 계산하지 않는다. root 실제 source 의미 검수·최소 consumer 연결·관련 docs 전체 검색과 정확 동기화·code+docs scoped Git·3387 화면 검수는 별도 순차 Gate이다. 이번 보존 과정의 source test 재실행0, 원자료 수정0, 타인 WIP stage0.

Codex7 7팀 새 지시 중 첫 UIUX 송신이 자동 승인 검토에서 거절되어 실제 수신0/나머지6 미송신이다. 사유는 해당 도구의 승인 요구와 현재 approval policy=never이다. 재시도·우회하지 않는다. Claude8 MAP는 peer 체인의 인간 입력 요구로 새 source0이며, ART는 이전 Chrome 선택 대기다. 송신8과 실 제작6을 구분한다. paused 자동화·아침메일 유지, 새 팀·Claude 실행세션·Windows·게임/빌드 추가0.


## MAP 복구 후 실제 완료와 의미 검수

기존 별도 목적의 대기는 보존하고 현재 내부 소유 scene 검증 후보만 목적구분 피드백 후 peer/source/Write/end로 완료했다. 새 팀·세션·권한변경·이전 거절 목적 재시도0.

| 역할 / 원자료 | bytes / full SHA256 | 공식 완료 ID / actual end_turn | 상태 |
|---|---|---|---|
| MAP / tools/team-followup-20261006/hell-rift/MAP/scene-roundtrip-2_5d.candidate.mjs | 6743 / 70ea5ad59ecc82e5d3926c203ddee82d1aaba2f38ea8b49db7a6a16a912e0239 | CH1-2_5D-CHARACTER-MAP-SLICE-20261006-MAP-CANDIDATE / ea4d8287-0d9b-4dc9-87bd-2c642d5f2d3c @ 2026-10-06T13:04:22.614Z | raw 보존 / 인수 predicate 미채택 |

원총괄 검수: nav1192 개수와 자기 좌표 역변환만 확인하여 같은 개수 nav 교체·원본 start/exit·주민 feet·mask 변경을 정확 대조하지 않는다. source SHA를 실제 bytes 검증 없이 반환하므로 보존 근거로 사용하지 않는다. 현재는 projection 참고이며 실제 editor save/import/export roundtrip은 미구현이다. pivot/rotation/flip 미지원도 수정 대상이다.

기존 후보 검수: QA crop h/anchorY의 정상 변화에 발드리프트 오탐 및 world foot 관측 부재, BOSS 전용 원화 부재 표기 오류(실제 dive/emerge/transform 이미지 존재), STORY 잘못된 flags/Promise를 빈 신규상태로 오인하는 문제가 확인됐다. SKILL explicit locomotion 모드 미적용은 root 파생 public consumer에서 수정했다. ANIMVFX는 rotation 초기화·실패 의존성·동일 transparent pass 계약을 root 파생본에 반영했다. 새 v2 목표 CH1-2_5D-CONSUMER-CORRECTION-20261006-{ROLE}은 MAP/QA/BOSS/STORY만 각1파일 상한으로 오더담당에게 인계했으며 원 raw7을 수정하지 않는다. 팀 자체 fixture나 이전 memory 결과를 root 의미 PASS로 계산하지 않는다.

QA1257 memory 회차는 실제 임시 probe.mjs 작성·실행·삭제가 관측되어 파일출력0/scratch0/cleanup0으로 계산할 수 없다. 원자료·production 수정 증거는 없으며 오더담당이 원 command/result와 정정 인계를 own STATE에 보존했다. root는 해당 파일에 접근하거나 재삭제하지 않는다.

## 실제 consumer 채택 후 상태 — 첫6/후속MAP 보존은 위 시점별 이력

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

## v2 완료 소유4의 즉시 보존 (상세 의미 검수 전)

Claude8 13:12:54Z inventory 및 현재TASK의 성공source/공식end4/idle4를 실제 인계받았다. 원총괄 actual86에서 bytes/fullSHA를 재대조해 아래4개를 후보미채택checkpoint한다. 팀자체fixture를root 의미PASS로 계산하지 않으며 이전raw7은불변이다. 13:10:09Z end0은이전관측이력이다.

| 역할 / 정확파일 | bytes / fullSHA256 | 공식완료ID / actualend |
|---|---|---|
| MAP / `tools/team-followup-20261006/hell-rift/MAP/scene-roundtrip-2_5d.v2.candidate.mjs` | 11736 / `bd5aedb146ec72713d88ebc3bff256a6047b1f1fe6312158133d655a4cb9e336` | `CH1-2_5D-CONSUMER-CORRECTION-20261006-MAP-V2-CANDIDATE` / `c4f9b5b7-2f21-466c-92a1-c121d69a97fe` |
| QA / `tools/team-followup-20261006/hell-rift/QA/slice-acceptance-2_5d.v2.candidate.mjs` | 12131 / `abe974b6571fd239f7b07695113122642e6a5b9ecc02d56777705e36a6e3a955` | `CH1-2_5D-CONSUMER-CORRECTION-20261006-QA-V2-CANDIDATE` / `10b9623c-6c27-4b3e-9969-fe989860cb12` |
| BOSS / `tools/team-followup-20261006/hell-rift/BOSS/dark-druid-state-adapter-2_5d.v2.candidate.mjs` | 15017 / `2f1c7b546e4dfbeb461a78ad38a6e1936fc9a3464d58272b1b07b0673ad9bab2` | `CH1-2_5D-CONSUMER-CORRECTION-20261006-BOSS-V2-CANDIDATE` / `88190da0-1df5-4cb2-a838-5129bb2bbeba` |
| STORY / `tools/team-followup-20261006/hell-rift/STORY/rift-ascent-conditions-2_5d.v2.candidate.mjs` | 9425 / `d2a6ec471aacfb4bb4eea3b6ecf05a2b34af20ce6d1ba7253827cc6567aa712c` | `CH1-2_5D-CONSUMER-CORRECTION-20261006-STORY-V2-CANDIDATE` / `d9c8cceb-8813-4de4-b669-a7d32f4464e2` |

MAP은원본동일성/핀과projection/editor미인수구분,QA는crop/foot/provider오탐분리,BOSS는실재전용원화와catalog미등록/rest·가시성분리,STORY는잘못된read/previewflag를commit으로오인하지않는후보다. 모두본편/독립consumer추가채택0. 실제3387·native·청취 Gate는별도다. QA1257scratch위반이력도불변.

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

| 역할 | 파일 | bytes | SHA256 | 공식 완료 ID | actual end UUID |
|---|---|---:|---|---|---|
| MAP | `tools/team-followup-20261006/hell-rift/MAP/scene-roundtrip-2_5d.v3.candidate.mjs` | 11746 | `e10b79849bdf34230daaaab6c976a759229ee14953ed9d6f467f65e333de555c` | `CH1-2_5D-STRICT-CONSUMER-FIX-20261006-MAP-V3-CANDIDATE` | `8692e444-573b-4996-99ce-cf3a3c2dd04f` |
| QA | `tools/team-followup-20261006/hell-rift/QA/slice-acceptance-2_5d.v3.candidate.mjs` | 13173 | `d5be0daa4a4581be086840a97a5b9678775d216706586e60f08b4344eb5b0886` | `CH1-2_5D-STRICT-CONSUMER-FIX-20261006-QA-V3-CANDIDATE` | `64f6d8e2-aefe-49fb-8a11-da6537f3fd90` |
| BOSS | `tools/team-followup-20261006/hell-rift/BOSS/dark-druid-state-adapter-2_5d.v3.candidate.mjs` | 13050 | `91863d207abc0d7510d779773566cdf5228f6c9edbcd7cca8690cb9f4ecdcb76` | `CH1-2_5D-STRICT-CONSUMER-FIX-20261006-BOSS-V3-CANDIDATE` | `896d13d5-507e-454c-9997-df289b789db8` |
| STORY | `tools/team-followup-20261006/hell-rift/STORY/rift-ascent-conditions-2_5d.v3.candidate.mjs` | 10099 | `6be8a40c14e71464080bf97ad89d01bd0359512fd4a74388a95a792c42d887d7` | `CH1-2_5D-STRICT-CONSUMER-FIX-20261006-STORY-V3-CANDIDATE` | `fc652f08-a57b-4878-a85d-4e2ae467b234` |

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

### STORY v4 exact 완료 원자료 / 미채택

| 파일 | bytes | SHA256 | 공식 완료 ID | end UUID / textSHA |
|---|---:|---|---|---|
| tools/team-followup-20261006/hell-rift/STORY/rift-ascent-conditions-2_5d.v4.candidate.mjs | 10164 | `0473eb649fafd16374bca26455972255ec3ef1988d44bf32fb5bdbfac2ffa8de` | CH1-2_5D-STORY-ASYNC-GUARD-20261006-V4-CANDIDATE | `e2aff546-5762-4ea1-89d2-70538445478e` / `edb5d367cd3c379dfb861833a73f8ab9d3477b88a4d0778fb409a1ff40464b79` |

팀 stdin 새10/10는source 검증이며 root 의미검토상 thenable/prototype/예외 경계2결함 해결·this=ports 회귀P2를 별도 기록한다. 원본 변경0/public미채택.


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

### STORY v5 exact 완료 후보 / 일반 소비 미채택

| 파일 | bytes | SHA256 | 공식 완료 ID | end UUID / textSHA |
|---|---:|---|---|---|
| `tools/team-followup-20261006/hell-rift/STORY/rift-ascent-conditions-2_5d.v5.candidate.mjs` | 9811 | `d22b652d78107a99489e4a75313df8f8be22793826ab86031fceebfdbc4a6f9a` | `CH1-2_5D-STORY-METHOD-CONTEXT-20261006-V5-CANDIDATE` | `436f895c-ae0f-4156-94ca-44155afd547c` / `fc9072efe2699ff5500588481daf2becd3fbe343628aedcce0451de398511f99` |

실제 신규 성공 source `toolu_01Q8Z5PDP6CD4FT2P9tHyMe7`→result `0b6a5226-b4c8-4b92-8f05-15a025b22127`@13:37:30.282Z, Write@13:38:17.009Z, 신규 stdin `toolu_016WfKv7BRqfJFZor8rFYfkf`→`a964da2b-d7d8-4653-97eb-952dcb74c381`@13:38:35.238Z(7 pass /0 fail), actualend@13:39:06.362Z, inventoryidle@13:39:25.731231Z. root는 bytes/SHA와 source receiver84/101·예외 경계를 대조했다. 팀fixture·root읽기검수·3387화면·본편/native는 별도 Gate다.


## Interactive Rift continuation: 완료 소유 raw6+표시 모듈1 우선 보존 — 2026-10-06T14:22:24.286200+00:00

새 목표 `CH1-2_5D-INTERACTIVE-RIFT-CONTINUATION-20261006`. 실제 NUL83부터 모든 후보 상세검수·root 통합 완료를 기다리지 않고 exact 공식 end/idle/pin이 확인된 raw6을 후보 미채택으로 먼저 보존한다. 기존 raw17 뒤 현재 누적 raw23. ANIMVFX 미종료 WIP 및 root main/html/terrain WIP는 stage0.

| 역할/파일 | bytes | SHA256 | 공식 완료 ID | end UUID / textSHA |
|---|---:|---|---|---|
| MAP / `tools/team-followup-20261006/hell-rift/MAP/editor-roundtrip-port-2_5d.candidate.mjs` | 5401 | `caaf28557724e36caa9794dc28f6abcf68f4569da967ab9291f3718e43c4dbe0` | `CH1-2_5D-INTERACTIVE-RIFT-CONTINUATION-20261006-MAP-EDITOR-PORT-CANDIDATE` | `126406cd-ce42-4707-bba8-80207de392db` / `29583304cb0c36e2c54e409113ef726939652a0e0550e4681427f7a3dfb0b1a4` |
| BOSS / `tools/team-followup-20261006/hell-rift/BOSS/dark-druid-special-motion-2_5d.candidate.mjs` | 11217 | `bff23e2b83de0e8cf976bed38dc33769c2d160338092a92b726baf463b176609` | `CH1-2_5D-INTERACTIVE-RIFT-CONTINUATION-20261006-BOSS-SPECIAL-MOTION-SOURCE-CANDIDATE` | `682ac460-664c-4260-9a2d-660eaf107eaa` / `c308368ee12f9b3c912066502be45f21b940beb485d859d789440c2389a52722` |
| STORY / `tools/team-followup-20261006/hell-rift/STORY/npc-dialogue-preview-2_5d.candidate.mjs` | 10318 | `cb92cb5e5a3ef050adb10ede127fd10f7fe4fc3a7adcd6cce47575b305da835e` | `CH1-2_5D-INTERACTIVE-RIFT-CONTINUATION-20261006-STORY-NPC-DIALOGUE-PREVIEW-CANDIDATE` | `90f41c04-7cf4-41e2-b35a-776e0dfe1a2b` / `f622d50a2e30b18ceb50f959beca3d446156cbb4f5138957a62f34855ce3c514` |
| SKILL / `tools/team-followup-20261006/hell-rift/SKILL/dialogue-pose-arbitration-2_5d.candidate.mjs` | 10674 | `d76516e2017bfac014bc9c9e239eec934f14e6c2c2d34ab0a301c1191a4c976f` | `CH1-2_5D-INTERACTIVE-RIFT-CONTINUATION-20261006-SKILL-DIALOGUE-POSE-CANDIDATE` | `bff6abce-11c8-4244-8574-7c1e37bc931b` / `928a988e4d671f4e95b9a17466cb4d040df0f20f93c5451bce20b1d39902dd39` |
| QA / `tools/team-followup-20261006/hell-rift/QA/interactive-session-acceptance-2_5d.candidate.mjs` | 12137 | `d73762ed7267d09162931d606d155c763117f0fb36321453f901bf0d8bbc2db6` | `CH1-2_5D-INTERACTIVE-RIFT-CONTINUATION-20261006-QA-INTERACTIVE-SESSION-CANDIDATE` | `b9e0fa2a-a059-4e34-9142-0c252a75575f` / `4ac1c760d6b83870f8b10c35b165e470383b00ce42027d6178d1fd88f36865c2` |
| ENEMY / `tools/team-followup-20261006/hell-rift/ENEMY/enemy-atlas-display-source-2_5d.candidate.mjs` | 11156 | `9c24980c05453474f029ebd43fb19f8b20a105bc1f85fa0a2314e1d336584ab6` | `CH1-2_5D-INTERACTIVE-RIFT-CONTINUATION-20261006-ENEMY-ATLAS-DISPLAY-CANDIDATE` | `c431263e-d41d-4106-b747-34b29c6bf6f7` / `b0afa4812c8a3cb0fbf4d0a105b5117e383f82e9f7f07fc3499362126f88ea1c` |

root 기존 character_preview의 완료 `tools/2_5d/rift-resident-billboards.mjs` 12354B/5f3dac92b70c11fa32bc980a005a62c2b14cae2c241af3a49ec6d6041bf5722d도 소비 미인수로 보존한다. createRiftResidentBillboards({THREE,terrain,camera,scene,displayScale=1.8})→object3d/update/snapshot/residents/dispose. 생성 시 scene.add; 자체RAF/타이머/입력0. 표시 배율 유한 Number .5…3(기본1.8); 하란87.19723183391004×144/베린90.43598615916956×87.69550173010381/네사68.97257769652651×144/도릭74.3225806451613×144. source foot 보존. order=30+(footY−4320)/8000*10 →32.925/31.575/30.875/27.725. atlas881398B/1254²/ff20e1f5dc1a8849edb64a10380c1d9eb21688de1817f098b144a57410190a38 HTTP SHA 확인/Texture1공유/Linear/no mipmaps. 원본 픽셀/리깅 추가0. 공유 CircleGeometry48/shadow order15/Y+.002/opacity.26/표시 .42,.08반경 rx2…32,ry1…8/r12 walk불가면 숨김, 기존 editor nav-clipped radial과 별도 lab 타원. dispose unique자원/atlas image=null/cleanupErrors 기록. 최종 구문PASS는 실제 browser/가림/발픽셀/대화/save/native/청취 인수와 별도이다.

| 신규 raw 의미 경계 | 현행 판정 |
|---|---|
| MAP | 실제 export 문자열을 editor import로 재로드하지 않음. fake handle/serialization-only가 VERIFIED 승격 가능, serializedBytes 문자열 길이. 후보 미채택; actual editor 검수는 root 독립 수정 필요 |
| BOSS | existing dive/emerge/transform/beast 실존 atlas/cell 근거, footAnchor/referenceHeight UNKNOWN. 새 catalog등록/리깅0 |
| STORY | read-only preview session, actual choose/grant/save consumer 아님. 본편 E=shield 충돌 지적; lab 상호작용 R로 조정 예정 |
| SKILL | dialogue phase snapshot을 소비하는 visual pose arbiter, 본편 입력/스킬변경0. root live 소비 미연결 |
| QA | readonly editor/session trace, provider가 fixture이면 실제 editor PASS 아님. root 실제 snapshot sequence/다운로드 검수 필요 |
| ENEMY | actual _ch8Atlas cell/crop producer, walk _idxSet gate; renderer/assetload/rig/AI/본편 채택0 |

Codex7 새 QUESTNPC 첫송신은 approvalpolicy=never에서 도구승인필요로 거절(수신0), 다른6미송신; 거절우회/전문 직접송신0. Claude8 신규7은 기존 session별1파일로 송신/peer확인, 이 checkpoint actualend/idle6만 보존. ART기존선택대기. 전원가동 완료 선언0.

MAP 최초 오타20261006 Write 후 rm -rf는 사용자 삭제/cleanup0 위반. 최초 outscope source를 제외하고 correct20261001 Write14:15:18.344Z 이후 정상경로만 분리. MAP end126406cd…14:16:28.696Z. STORY 종료문에도 outside20261006-PLACEHOLDER Write/rm을 공개하여 별도 실제 tool 증거 확인 요청; '레포 밖이라 삭제금지 준수'로 계산0. 기타 삭제피해범위 UNKNOWN, 추가삭제/이동/cleanup0. 실제 game/sourcePNG/scene/nav/save/protected10/foreign68 전후 exact보존; paused자동화·메일/Windows/권한/설치/새팀0.

현재 VISUAL VERDICT: RETOUCH. 지도 원화1254² 확대흐림/높이UNKNOWN. root live integration·실editor·본편/native6/청취/IK/A급 인수0. 전체 docs NPC/주민/2.5D/displayScale/editor-port/currentgoal 키워드 검색 및 현행 완료/후보대장 갱신으로 보존한다.


## 지옥의 틈 NPC 실제 연결 / 현재 독립 3387 계약 — 2026-10-06T14:38:11.904785+00:00

현재 목표 `CH1-2_5D-INTERACTIVE-RIFT-CONTINUATION-20261006`. 이전 clip2260×1400/NPC 미연결/실editor 미인수 기록은 당시 관측 이력이다. 이번 lab은 전체8000×8000 원본 nav1192 범위에서 주민4의 원래 발을 표시하고, 기존 대화 consumer와 카메라 추종을 연결한다. 본편 source start/exit·scene/nav·게임·사용자 세이브와 분리한다.

| 항목 | 현재 실제 코드·검수 |
|---|---|
| 소비자 | tools/2_5d-world-lab.html/.mjs + rift-terrain.mjs + scene-registration.mjs + 새 interaction-cue-lifetime.mjs. 기존 주민 billboard 모듈을 실제 연결 |
| 실제 결과 | 최종 Mac Chrome/3387 브라우저 23검사 PASS, pageerror0/HTTP실패0. 원본 atlas 변조 시 ready=false/RAF0. 초기 QA 하니스 오류와 수정 후 최종 PASS를 별도 보존 |
| NPC/대화 | 원본 atlas/발4·displayScale1.8, R대화. 물건 받기1회·재방문 중복0·다른 NPC 부탁 수락을 실제 선택. trialRecords 2, actualGrant=false/editor-session-only. 본편 아이템·퀘스트·save·상승 적용0 |
| 위치 시험 | 원본 NPC foot·nav 불변. 별도 displayApproach로 하란4780/6660·베린5900/5580·네사6180/5020·도릭5100/2500, NPC까지 모두120worldpx. 버튼은 시험 위치 이동이며 전체 여정 실플레이 증거가 아님 |
| 실제 에디터 | 별도 fresh3387에서 저장 버튼 다운로드→그 파일 importProject(...,false)→snapshot 대조. 실제90767B/c508e70d… 원본과 동일. 비동기·입력변조·파일SHA불일치 포함5검사 PASS. lab 현재 editorProvider 없음=PENDING 유지 |
| 시각/영상 | 네 주민 대화·부탁 화면 실제 확인, 캐릭터 겹침 완화. interactive-motion.webm 522811B는 canvas 이동/공격·외형교체 영상이며 DOM대화/소리 미포함. 맵1254² 확대 흐림·hard wedge·마스크 feather 미재현 때문에 VISUAL VERDICT: RETOUCH |
| 남은 Gate | physicalHeight UNKNOWN, NPC 정적billboard, 전용주민리깅·발픽셀IK·본편/native6·보스전 여정·청취·A급 인수0 |
| 팀 현황 | Claude8 기존7 source/end/idle 실제 확인. 완료 raw 누적24(기존17+이번7). public 역할 SKILL/ANIMVFX/MAP/QA4 유지, cue는 ANIMVFX 추가 파생모듈. 신규 MAP/BOSS/STORY/SKILL/QA/ENEMY raw를 일반 본편 소비로 승격0. Codex7 첫 전문송신 자동승인검토 거절/수신0·다른6미송신, ART 기존선택대기; 전원가동 선언0 |

상세 수치·공식·API·원자료 핀·§23 보고는 `docs/4.1맵디자인+설정/HELL_RIFT_2_5D_SLICE_20261006.md`의 이 목표 절을 따른다. 실제 증거는 `/Users/fordeargamers/.codex/visualizations/rift-interactive-20261006/`의 final-interaction-v2-result.json(23), editor-final-result.json(5), actual-editor-export.scene.json, final-rift-*.png, final-nessa-request.png, interactive-motion.webm 및 Git 영수증이다. source/fixture/root browser/native/listening 인수를 서로 대체하지 않는다.

### ANIMVFX 공식 완료 및 현행 소비 경계

| 파일 | bytes | SHA256 | 공식 완료 ID | actual end UUID / textSHA |
|---|---:|---|---|---|
| tools/team-followup-20261006/hell-rift/ANIMVFX/interaction-cue-lifetime-2_5d.candidate.mjs | 9287 | 140748cf0ed50961e18b26750c66e240fb0c40abd8ace2baac8e1c54aa0ae567 | CH1-2_5D-INTERACTIVE-RIFT-CONTINUATION-20261006-ANIMVFX-INTERACTION-CUE-CANDIDATE | 97feb100-4d0d-40e9-83b9-f8ef88ba16bf / eeacb26c5f1aac11770e80b0bfe1f36b502cc79b6cef8e0a85bebd0f694b61db |

actual end14:21:55.097Z/idle14:23:13.378665Z.원자료는후보로보존, root 파생public 14063B/1fe07971b3943d4a72ee618d467faf5bfea41175525e19f8f6478740be09aab7을실제lab에연결했다. 팀 초기9134B 검사는10PASS+2FAIL이며exit0만으로전체PASS로계산0. 최종9287B 실제관측은수정3check만; 이전10유지주장은추론이다. 호출은node --input-type=module -e이며stdin아님. root 별도새stdin1회6groupPASS·실Chrome23checkPASS를구분한다. 팀untracked48은전체NUL카운트가아니다. 기존6raw+root주민module은075e3e83d52a124d3fc1326da9a614dfe2436e00 정상push/remoteexact로먼저보존했다.

| 신규raw | root판정/채택 |
|---|---|
| MAP | 미채택; root별도async/actualdownloadimport수정. fakeprovider/문자열길이오류이력유지 |
| STORY | selectNode95행 own-key guard없는 __proto__/constructor P2, raw미채택. 기존Map기반대화consumer를사용 |
| BOSS | 12자SHA접두사는fullpin아님. dive/emerge1774×887/2609546B/fullSHA4d154deda10592a655b2504ddcfa186f2e9af443da1146166683c8ad50c506ce, transform2400×724/1634653B/7b329ce2d70b9572144391579405029cc74ac07c479b67d73783bea021dc365d, beast1774×887/1788236B/41cf09b5b90208bf343f13032664bcccbc9d22607a1aa913ab953e257860b8fd. beastdir[0,7,6,5,4,3,2,1]/underhidden/footAnchor·referenceHeightUNKNOWN. 새catalog등록·본편소비0 |
| SKILL/QA/ENEMY | 이번raw 일반소비미채택. root 기존poseconsumer/actualbrowserQA를사용. enemy source crop은renderer/AI검수아님 |
| ANIMVFX | raw불변 후보보존/root파생cue만실화면소비. grant/save/native0 |

### 실제 경로·삭제 규칙 위반 기록

| 담당 | 실제 도구 관측 | 현재 경계 |
|---|---|---|
| MAP | wrong20261006 tree Write14:14:33.984Z 성공5703e523-b7d0-4f8c-a490-409b5feea257, rm -rf14:14:50.726Z 성공81d0a9a7-5487-4561-8338-b362a68354e8. correct20261001 Write14:15:18.344Z 성공5d928889-5129-406b-ada1-59da3450ac31 | wrongtree 없음/피해 UNKNOWN |
| STORY | wrong20261006-PLACEHOLDER11B Write14:14:43.413Z 성공bf6a168f-a7ec-4427-99e1-2573c13010d5, rm -f14:14:52.434Z 성공f65065c6-0eff-4ed7-8204-809e5b040bb4. placeholder SHA4097889236a2af26c293033feb964c4cf118c0224e0d063fec0a89e9d0569ef2 | placeholder 없음/피해 UNKNOWN |

둘 다 사용자 삭제/cleanup0 위반이며 '레포밖이므로준수'로계산하지않는다. 현재wrongtree/placeholder없음은기존내용없음의증거가아니다. 덮어쓰기·삭제피해범위 UNKNOWN. 담당로그의실제도구기록과정상correctWrite/end를분리보존, 종료된팀추가송신/추가삭제·이동·cleanup·추정복구0. 보호10/foreign68/sourcePNG·scene/nav·save는원총괄전후핀으로별도확인한다.


## CH1-RIFT-QUALITY-NOW-20261007 즉시 완료 소유 보존 1

실제 변경83에서 상세 시각검수가 끝나기를 기다리지 않고 공식end/정확pins가 일치하는 raw만 보존한다. ANIMVFX는 당시 공식 종료가 없어 stage에서 제외했다. ENEMY는 stage 직전 공식 종료·핀 확인이 완료되어 포함했다. 전문7의 새 TASK source 도구 성공은 owner checkpoint ALL7으로 확인했다. 아래 raw의 본편·public 채택은 모두 false, VISUAL/native/청취/실제보상·save 인수0. 두 public 모듈은 root 별도 구현이며 새 raw를 곧바로 public 소비하지 않는다. terrain/world-lab 통합3파일은 root 진행 중이므로 이번 stage에 포함하지 않는다.

| 역할 | 공식 완료 ID | end UUID | bytes | full SHA256 |
|---|---|---|---:|---|
| MAP | CH1-RIFT-QUALITY-NOW-20261007-MAP-FEATHER-CANDIDATE | c0cabec2-c0f3-479e-8d48-651e8fc18068 | 7795 | 10e7c36bd9669bbd4aeab934bafc204209742acfb69015f09eddb047288794cc |
| BOSS | CH1-RIFT-QUALITY-NOW-20261007-SPECIAL-PREVIEW-CANDIDATE | d39cd29f-d453-4749-a106-321d55c6f893 | 12416 | d12d01d1550b633b77068eafff4ca47d129972e6fb7f1d31a273725f00fc0529 |
| STORY | CH1-RIFT-QUALITY-NOW-20261007-DIALOGUE-GUARDS-CANDIDATE | 4cb06859-5092-4523-a598-6a47d038df9c | 11655 | 8a6618b325286b05f7d47b8ae80818079efb95b0028a95fc3e8049e728a37f39 |
| SKILL | CH1-RIFT-QUALITY-NOW-20261007-DIALOGUE-POSE-CANDIDATE | 8c01b2af-2808-4557-9449-7e38f2004f53 | 11228 | d34743b66b1448bb8b834f1920b71c08ec7057d4045689a5a4ae00b891a51bb6 |
| ENEMY | CH1-RIFT-QUALITY-NOW-20261007-BILLBOARD-CANDIDATE | 39db6227-df66-47e4-84ec-d85d3ea66a69 | 13505 | 4cbb0545d6b1a91b5afc4933df478cdac8382fc7929f842e83a5da20cf4d04b6 |
| QA | CH1-RIFT-QUALITY-NOW-20261007-RETOUCH-GATES-CANDIDATE | 017a77c0-7858-4f84-8ac4-9c93fee3873d | 14463 | 23bcc909916c4bd84e65dabca55ef6bd335b8c25f3411157e7f751ffa1851ec9 |

Public ground module14,016B/e9faf5ecdfd65793391a0dc9cf28e03c398be54eb72a9308b0f49228b50e60eb, special module11,926B/b6660fe0a16634d0e2b9ed87aab19058d00e86652c43e5be7b55b75fa5b68f8b. CPU 핵심 검증은 각 worker 신규 stdin1회이며 실제 WebGL은 다음 root Gate. 외부 영수증 `rift-quality-live-20261007/checkpoint1-pins.json`.


## 2026-10-07 全7 raw保존·채택 Gate 정정

checkpoint1은stage직전ENEMY공식end가확인되어raw6(7,795B MAP/12,416B BOSS/11,655B STORY/11,228B SKILL/13,505B ENEMY/14,463B QA)를보존했다. 본문및CHANGELOG의기존raw5표기는수집중작성숫자였으며정확Gitstage는6이다. ANIMVFX 공식완료 `CH1-RIFT-QUALITY-NOW-20261007-GROUND-MATERIAL-CANDIDATE`/end `706905f4-d587-495b-beaf-ecd688a06f91`/10462B/fullSHA `6aba605a7cb144634a0653c05e66c1f819f0d63f73eaf936bbf76c0f4f3d9eb4`까지이번checkpoint2에서미채택raw로추가보존한다. raw24이력+이번7=31완료후보원자료, sourcepixels/기존pins불변.

| 후보 | 현재채택 Gate/다음 수정 필요 |
|---|---|
| MAP | 120worldpx/원boundaryUV sampler계약확인. 실제opaque28nearest/sourcecolor/material은root별도구현, raw 직접import0 |
| ANIMVFX | RETOUCH/HOLD. alphaMap r160은G인데raw는A에edge128작성, linear비보행spill, 실제PNG/navSHA·strictprofile부재, asyncdispose후allocation누수. rootpublichardnearest+softmask+hash소비는별도이며raw채택false |
| STORY v2 | HOLD. provider getter/inheritedthenable/flagsgetter와stateKnown오인. actualnearest/open/choose/close/snapshot대체0, session→committed승격0/gift·quest분리유지. 다음안전methoddescriptor/fieldUNKNOWN파생만 |
| SKILL v2 | HOLD. 이전rawpose import로publicrun/finite계약누락, NEUTRAL이새facing무시, attackRemaining이nested. methodgetter/inheritedthenable/supportedaccessorUNKNOWN누락. publicpose+safeprovider+facing+top-leveladapter파생필요 |
| BOSS/ENEMY | 보존완료≠public직접채택. sourcepixels/footUNKNOWN/세션preview경계및소비API추가검수중. rootbaked는이전mapping에서별도구현 |
| QA | HOLD. asyncimportrejection미await/가짜providernull PASS, 빈pin/bounds/extents/pose/teardown/walk관측PASS, attackRemaining1을miss. realeditor evidence/FORMAT_VERIFIED구분/필수관측PENDING/publicsnapshot필요 |

검수는독립worker신규stdin각1회: STORY/SKILL14probe(불일치10/정상4), ANIMVFX/QA8반례 확인. fullsuite/기존검사반복0. 현재raw미채택/native·청취·실제보상save인수0. 다음작업은기존owner가이정확결함별독립파생파일을소유팀에배정하며root가직접전문송신하지않는다.


## CH1-RIFT-QUALITY-NEXT-20261007 완료 소유 원자료 보존 — 2026-10-07

기존 Claude7의 새 TASK 송신/peer/첫 성공 source/공식 end·idle/정확 최종핀7을 owner 2026-10-06T17:02:13.624713Z 실조회로 확인했다. 원자료 누적31+7=38. 아래7 후보는 본편/public 미채택이며 의미검수와 root 실제화면 소비 Gate가 남아 있다. 파일 존재를 완료로 계산하지 않았다. 실제79에서 이 완료 기록을 docs에 추가하면80에 도달하므로 상세검수를 기다리지 않고 완료소유만 정상 checkpoint한다. 기존 foreign68/owner STATELOG4/index0·sourcepixels/scene/nav1192/save·보호2_3/Q전용/어택티켓금지를 보존한다.

| 역할 | 공식 완료 ID | 새 raw 파일(역할 하위) | bytes | SHA256 | end UUID |
|---|---|---|---:|---|---|
| MAP | CH1-RIFT-QUALITY-NEXT-20261007-FOREGROUND-REGISTRY-CANDIDATE | rift-foreground-registry-2_5d.candidate.mjs | 7649 | 1a9f6ac3d28510d9a1f0b1fc1e46d27965b2fe78884e7a408eb7d0c9799295d6 | e38c1504-6462-4f00-bb13-2c1ff5e71704 |
| ANIMVFX | CH1-RIFT-QUALITY-NEXT-20261007-GROUND-GUARDS-V2-CANDIDATE | rift-ground-material-2_5d.v2.candidate.mjs | 6304 | 840ef4bdd1fb47627acd20a4fe3183ffdc70582e7b1c886260d15b73369263c7 | fc134e06-2eae-4cbd-a9fd-ca5c3c6b0597 |
| BOSS | CH1-RIFT-QUALITY-NEXT-20261007-SPECIAL-CELL-AUDIT-CANDIDATE | dark-druid-special-cell-audit-2_5d.candidate.mjs | 14727 | 19a5ab52cf27c14a68daa45ab1bb81c48fa6a65adfba58ab7e0b73df1565da09 | 7479afdc-4521-4136-aad5-01d7e92c38ce |
| STORY | CH1-RIFT-QUALITY-NEXT-20261007-DIALOGUE-GUARDS-V3-CANDIDATE | npc-dialogue-preview-2_5d.v3.candidate.mjs | 11929 | 604832bf97b891596c2db9c379dbe44f4335648a05dec753baa0190d3d8077b2 | d019423b-9b23-4d96-9aee-ee643c09f209 |
| SKILL | CH1-RIFT-QUALITY-NEXT-20261007-DIALOGUE-POSE-V3-CANDIDATE | dialogue-pose-arbitration-2_5d.v3.candidate.mjs | 12161 | f3b01624dc4d19a63053d9f349f4aa68a88f2bc34b3ce6b4894955105da08f55 | 3cca7a69-752e-420e-9264-5de8288809e2 |
| ENEMY | CH1-RIFT-QUALITY-NEXT-20261007-PINNED-LOADER-CANDIDATE | enemy-atlas-pinned-loader-2_5d.candidate.mjs | 16481 | 1ad5b47b8b4c33090e89c0841e9072d3f64b7325fa7e6297bcad6ac37b4b791a | dca6cb5b-fa10-4826-82a5-cda5b57778c1 |
| QA | CH1-RIFT-QUALITY-NEXT-20261007-EVIDENCE-GATES-V2-CANDIDATE | rift-retouch-consumer-acceptance-2_5d.v2.candidate.mjs | 17170 | 7b61b0b4e4d85203c59410f57361be1e1df2bfcb39782d1644839947874b1feb | fd27dc6d-6e21-482c-b3b3-4804351b86f5 |

전체prefix=`tools/team-followup-20261007/hell-rift/<역할>/`. full end textSHA와 경로 realparent·bytes/전체SHA 재대조는 외부 `rift-quality-next-20261007/completed-pins.json`에 보존한다. owner docEvidence/testEvidence 일부가 비어 있어 선행문서 전체읽기·테스트 실행 전체를 인계문 주장만으로 승격하지 않는다.

- MAP: 실제3전경 XY/pivot/mask/crop/footY 표시 소비·동일카메라 검수는 root Gate. VISUAL VERDICT: RETOUCH(이번raw 실제화면 미관찰).
- ANIMVFX/QA/STORY/SKILL/BOSS/ENEMY: 신규 의미검수 중이며 이전 PASS를 재사용하지 않는다. 원자료 보존과 public 채택을 구분한다.
- native6/청취/실제유품 지급·퀘스트/save/물리높이·anatomical foot/IK/A급 인수0. 기존 MAP/STORY 외부쓰기·삭제 위반과 피해UNKNOWN 이력 유지.
- 계속 운영: exoduser-2 ACTIVE/30분/종료없음; 기존 owner만 후속송신/root직접전문중복0. raw 보존 후 root통합검수 및 새로운 결함별 승인단위로 연결한다.


## CH1-RIFT-QUALITY-FIX-20261007 완료 소유 raw checkpoint — 2026-10-07

실제 NUL/untracked 전체81에서 공식완료7만 상세채택검수를 기다리지 않고 보존한다. owner 최종 실조회 2026-10-06T17:16:28.385454+00:00의 송신7/peer7/첫성공source7/공식end·idle7을 정확pins·end원문SHA와 대조했다. 원자료38+7=45, public/본편 직접채택0. root terrain/worldlab2 WIP·foreign68·ownerSTATELOG4는 stage 제외.

| 역할 | 공식 완료 ID | 소유 raw 경로 | bytes | SHA256 | end UUID |
|---|---|---|---:|---|---|
| MAP | CH1-RIFT-QUALITY-FIX-20261007-FOREGROUND-CONTRACT-V2-CANDIDATE | tools/team-followup-20261007/hell-rift/MAP/rift-foreground-registry-2_5d.v2.candidate.mjs | 8744 | d81ed403f80aa6106c6fdb30c1d5ade4d78d4d1e0b2876239db5b172afe46b2d | 5033f56d-81a5-4770-959f-594e7544cea6 |
| ANIMVFX | CH1-RIFT-QUALITY-FIX-20261007-GROUND-HANDLE-V3-CANDIDATE | tools/team-followup-20261007/hell-rift/ANIMVFX/rift-ground-material-2_5d.v3.candidate.mjs | 6464 | 059e4a4cd459bf3c765626d09cded000dd6aa28d6d7472dacf1ae41bf48df121 | 21d7fba1-26e4-4d34-a71f-ac4e3d4c5e6e |
| BOSS | CH1-RIFT-QUALITY-FIX-20261007-CELL-AUDIT-GUARDS-V2-CANDIDATE | tools/team-followup-20261007/hell-rift/BOSS/dark-druid-special-cell-audit-2_5d.v2.candidate.mjs | 12484 | 2c81896b5ba064480e238244b4a4f1be416259d591a05997323eff3596307caa | ca1f12ca-fc95-4b1a-9159-9da6316c3166 |
| STORY | CH1-RIFT-QUALITY-FIX-20261007-DIALOGUE-GUARDS-V4-CANDIDATE | tools/team-followup-20261007/hell-rift/STORY/npc-dialogue-preview-2_5d.v4.candidate.mjs | 12583 | b607d9c5b0c673ece00ff02d37fa0c55e4a8a34574bd4e097929e2194aed6b89 | ec2c3f1f-6d05-4284-a172-291f1bf5788b |
| SKILL | CH1-RIFT-QUALITY-FIX-20261007-DIALOGUE-POSE-V4-CANDIDATE | tools/team-followup-20261007/hell-rift/SKILL/dialogue-pose-arbitration-2_5d.v4.candidate.mjs | 12905 | e4608bc7ef9ccedf36da70dcf1481b0461dd690c9b4302701b2783ffe1d94e62 | 065193b0-bcc5-4203-96bf-7833b3955887 |
| ENEMY | CH1-RIFT-QUALITY-FIX-20261007-PINNED-LOADER-V2-CANDIDATE | tools/team-followup-20261007/hell-rift/ENEMY/enemy-atlas-pinned-loader-2_5d.v2.candidate.mjs | 11548 | 21d7a0a2321b9d0ce92d36c61f37d71c965e4ed7213637a336b616d0ec793b76 | c31ede05-26d4-4870-b9a5-8ed1c72a43f4 |
| QA | CH1-RIFT-QUALITY-FIX-20261007-EVIDENCE-GATES-V3-CANDIDATE | tools/team-followup-20261007/hell-rift/QA/rift-retouch-consumer-acceptance-2_5d.v3.candidate.mjs | 14527 | 9ef0d80ac48ac168790012e1204f0430ef3ff8f6dd5e19f147196c4508a1048c | d18a6f9f-756e-482f-beb3-1ccf1259cf27 |

MAP stdin 앞2회/BOSS 앞1회 inner Node 실패와 최종보고를 별도 보존한다. toolResult is_error=false를 내부 test PASS로 계산하지 않는다. MAP/ANIMVFX 최신 TASK의 full guide·SSOT·LOCK 실제읽기 근거는 owner상 UNVERIFIED이며 자기보고를 Gate충족으로 승격0. 나머지 신규 semantic 검수도 pending. 파일존재/fixture/raw보존≠본편/native·청취·보상save/A급완성. 정본 관련 keyword 전체검색과 exactpins/end/정상Git 영수증은 외부 rift-quality-next-20261007/fix-*에 기록한다.


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


## CH1-RIFT-CONSUMER-LINK-20261007 완료 소유 부분보존

실제79에서 관련완료문서 추가로80에 도달하므로 모든end/상세검수 대기 없이 현재 공식end·정확핀 7건만 후보미채택 정상checkpoint. 원자료45+7=52. 미완료source·end미확인WIP/foreign68/ownerSTATELOG4 제외. 신규7팀 송신·peer·첫source 각7을 확인했으며 이 숫자는완료수가아니다. MAP/ANIMVFX 선행guide실Read 미확인검수위반/복구는owner에만 인계; 늦은읽기 소급PASS0. root 다음단위는후보추가생산을반복하지않고NPC observation·dialogue pose 실제public 소비/화면 연결이다.

| 역할 | 공식 완료 ID | 정확소유경로 | bytes | SHA256 | end UUID |
|---|---|---|---:|---|---|
| MAP | CH1-RIFT-CONSUMER-LINK-20261007-FOREGROUND-VIEW-DATA-CANDIDATE | tools/team-followup-20261007/hell-rift/MAP/rift-foreground-view-data-2_5d.candidate.mjs | 7891 | ec7eab8802d90361bf2d8e2a96df1b5927bafc7de5cb230079f99fb93b78632f | 40490349-8d26-487d-96ec-b196bd5acbdc |
| SKILL | CH1-RIFT-CONSUMER-LINK-20261007-DIALOGUE-POSE-CONSUMER-CANDIDATE | tools/team-followup-20261007/hell-rift/SKILL/dialogue-pose-consumer-2_5d.candidate.mjs | 14971 | 28cfb0dd57fdd1aec5aee639b7a62474ea1bd5005d978745dfed7cdbd2a90ad2 | a94e50d2-e9b5-49a3-8eed-cde440074224 |
| QA | CH1-RIFT-CONSUMER-LINK-20261007-CONSUMER-LINK-GATES-CANDIDATE | tools/team-followup-20261007/hell-rift/QA/rift-consumer-link-gates-2_5d.candidate.mjs | 10144 | 4a27ea67edfdeb26872b0a2053487a8d8e548645878fbb9a561a847d4940c3c8 | a4d1af70-336c-4c7b-a07f-1d0d3d100296 |
| ENEMY | CH1-RIFT-CONSUMER-LINK-20261007-CORRUPTED-WOLF-CONSUMER-CANDIDATE | tools/team-followup-20261007/hell-rift/ENEMY/corrupted-wolf-preview-2_5d.candidate.mjs | 9814 | 8479b1148c911f3c5bb7b42c8522af6b00c4d9c9cee1ccb1e9731fb9596349c2 | bc2a6cbd-34b2-4a47-be81-f55c65075e5a |
| ANIMVFX | CH1-RIFT-CONSUMER-LINK-20261007-GROUND-CONSUMER-HANDLE-CANDIDATE | tools/team-followup-20261007/hell-rift/ANIMVFX/rift-ground-consumer-handle-2_5d.candidate.mjs | 7452 | 3f51de1d506d59c17ecdaf46ee0549889ed9afcecd3b7e24dc096180edef8e2b | c73e818b-87c5-4132-ac51-4e9395c3f7e1 |
| BOSS | CH1-RIFT-CONSUMER-LINK-20261007-SOURCE-OBSERVATIONS-CANDIDATE | tools/team-followup-20261007/hell-rift/BOSS/dark-druid-source-observations-2_5d.candidate.mjs | 9356 | 8248e87c69f8e6bc731557888cea0d10a165843305b80aa493cac3de68f90738 | 7961f3f7-eec1-4d2f-904d-2ac9e585c811 |
| STORY | CH1-RIFT-CONSUMER-LINK-20261007-DIALOGUE-OBSERVATION-CONSUMER-CANDIDATE | tools/team-followup-20261007/hell-rift/STORY/dialogue-observation-consumer-2_5d.candidate.mjs | 8532 | 30a3185cab9066ab73bc1b49770bb7397ae64bcdc0f153636379db5709b89029 | e603cefb-1cbc-44ee-a6d5-a7b59485b278 |

원raw·selftest/합성snapshot≠root WebGL/native/audio/실보상save 인수. 중복TASK/새팀/실행세션0. 해당root34분씬단위의 actual전경/남몸가림수정/실대화 증거와 구분. normalcommit/push·remoteexact는외부 consumer-link-preservation-receipt.json에보존.


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


| 파일 | bytes | SHA256 | 채택 |
|---|---:|---|---|
| `editor.html` | 258258 | `9f3ef622a4f8d7399f404ea4a2c05e340af90c1332885614758b8d0931841294` | root public 구현·새실화면 인수 |
| `tools/2_5d-world-lab.mjs` | 31196 | `9a97b78d9db61e72158b2cf44733a233781e732ecc0a177966f5b7825b615867` | root public 구현·새실화면 인수 |
| `tools/2_5d/editor-preview-entry.mjs` | 7557 | `b26f9c07ee833b55363b9f4c6d6f4c3c6cbe86893593654567d82d53f662ed47` | root public 구현·새실화면 인수 |
| `tools/2_5d/editor-preview-host.mjs` | 12236 | `63085fb0fbccd03c3957495aa0bc34559d74399b5d119a05389281effbd4ed22` | root public 구현·새실화면 인수 |
| `tools/team-followup-20261007/hell-rift/MAP/editor-preview-entry-2_5d.candidate.mjs` | 6092 | `d4b805be94ae4a55901ecc6987221569b58e463d0b5d3d32933708af1c668c2e` | 미채택 원자료53/공식end 확인 |

전문 MAP raw는 6092B, sourcepeer8c97df32-3f7b-4906-93ec-bd4ad55d1c4e, 첫source toolu_017smkJJqD2YnJ6zXbyQ6ULU/result07f1195f-7400-49a5-8c2f-241212ca2a2f, 공식end26736e4c-a55a-4193-91b1-22805e870bf5. 전문stdin3회(초기2실패/최종1성공) 이력보존/소급PASS0. rootpublic10+9 의미검수와18실화면은 별도다.


## 2026-10-07 ROOT-RIFT-SEAM-RAW54-PRESERVATION-20261007

| 항목 | 정확 값 / 상태 |
|---|---|
| TASK / 완료 ID | CH1-RIFT-SEAM-CONTACT-20261007-ANIMVFX / CH1-RIFT-SEAM-CONTACT-20261007-ANIMVFX-CANDIDATE |
| 소유 파일 | tools/team-followup-20261007/hell-rift/ANIMVFX/rift-cliff-contact-underlay-2_5d.candidate.mjs |
| 원자료 exact pin | 10558 bytes / SHA256 42c881af73d0ad67461ea794e09e310901f98a2b7d2ef53e6319b310edcb6af0 |
| 공식 end | 4f7fc022-56ac-4a14-b411-c5eb26e96245 / 2026-10-06T18:16:42.744Z / end raw SHA256 49b17a8cec0a91f9cbfe895a35f07900e1172050b848b1c705f1d8d97d6b3299 |
| peer / 첫 유용 source | 5b055bf2-8b7b-4b7d-ab91-fc2f6fdd3033 18:12:15.933Z / Read toolu_016V4engfwSNt64qDjk6J4dX → 83b094c2-3dc8-470b-b7f3-422f2d517119 18:13:47.664Z |
| 전문 검증 | stdin 1회 13 PASS exit0. root의 의미·GPU·시각 채택 검증으로 승격하지 않는다. |
| 원자료 보존 / 채택 | 완료 raw54의 정확 bytes를 미채택 상태로 보존. public 직접 import0. 이전 raw53 보존과 별도이며 새로운 완료 raw는 1개이다. |
| 원자료 결함 | rowY 저장 + flipY=false + V=1-y 조합의 수직 반전; Linear alphaMap의 비보행 누출; 재prepare parent orphan; params 검증 부재(Infinity 루프 가능); Mesh/geometry 중간 throw 자원 누수. default 실제 center 최대alpha .14이며 명목strength .42와 다르다. |
| 현재 public 전경 계약 | 원본 terrain16689 bytes SHA256 c600aa524b5a664dc0c8d00fd296c972add38f7c97b066e3985966cc33e2e3b2 유지. source maskFeather0, footY4320/5360/6920, order30/31.3/33.25. 원자료 주석의 detail5/occluder10/shadow15는 현행 계약으로 사용하지 않는다. |
| feather6 실험 | GPU3 LINK_STATUS PASS에도 동일 카메라 비교의 실제 배경 개선 미확인. 외부 deferred-inward-feather6-rift-terrain.mjs로 보존하고 자기 변경만 exact 원본 bytes로 복원. public 채택 보류. 남쪽 픽셀차0, 동쪽30/북쪽8은 캐릭터 영역으로 경계 개선 근거가 아니다. |
| 보존 기준 | team NUL44 주장 대신 root 전체 rename-aware NUL 사용. 원 end→관측186.845372초를 3분 이내 보장으로 주장하지 않는다. 코드+docs 정상 commit/push 후 외부 receipt로 remote exact SHA 검증. |
| 다음 단위 | root derivative contact underlay에서 rowY UV·nearest hard nav gate·소유 수명·유효 입력을 수정하고 실제 shader link / 같은 카메라 비교. sourcePNG/scene/nav1192 및 본편/세이브 변경0. |
| 완료 경계 | 원자료 보존≠consumer 채택≠본편/native6/청취/실제 보상save/A급. 기존 editor 왕복18·NPC/wolf25는 과거 검수이며 새 검수에 합산하지 않는다. |

MAP PRODUCTION REPORT — STAGE: 지옥의 틈 절벽 접합 후보 보존/선별. MASTER: 기존 비대칭 실루엣·남→북 주경로·주민 곁 side space 유지. OUTER MASS: LEFT/RIGHT/TOP/SOUTH·major holes 원화 그대로. LARGE: 기존 sourcePNG·3전경 composites/crop·overlap·silhouette 그대로. MEDIUM: connections/remaining holes 변경0. GROUND: shadow 후보는 결함으로 미채택; contamination/structure integration 현행 유지. PLAYABLE: travel/breathing space nav1192 그대로, arenas/threat/combat 인수 PENDING. LANDMARK: primary 상승문·secondary 균열·tertiary 주민 유지. CAMERA QA: 남Haran4780,6660 / 동Berin5900,5580 / 북Dorik5100,2500 동일 발 위치 비교; START/EARLY/ARENA/SIDE L/LATE 전체 및 EXIT 본편 인수 PENDING. TECH QA: route/collision 불변; 실험3카메라 pageerror0/4040; seam 개선 미확인; 원본 복원 후 실제 GPU link1 PASS; loading/performance 정량 인수 PENDING. FILES: 완료 raw 신규1, root 실험 원본 복원; concurrent/unrelated touched0. GIT: 완료 소유 raw+이 동기화 docs 한정 정상 보존; push/exact SHA는 외부 영수증에 기록; deploy0. VISUAL VERDICT: RETOUCH. NEXT PASS: corrected contact underlay actual WebGL와 visible seam 비교.


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
