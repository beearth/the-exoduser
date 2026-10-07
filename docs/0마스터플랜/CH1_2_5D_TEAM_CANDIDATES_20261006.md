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

운영 최신 근거: root remote 2c61ca0a53e67d64a0cdcaa6ff66ca9c60f0d120의 source37·consumer105 CPU와 Chrome 최초19PASS/1FAIL·saved-raw 제한5 adjudication은 이전12844 source의 별도 이력이다. 이번14758 source의 새 GUI/GPU 인수0. UPDATE-RETIRE-CALLBACKS memory 공식end 3775b47a-682f-4b2e-b108-3203d487f7fe@2026-10-06T21:22:49.745Z, raw6565B/d400841cb6e032058b8abc3bc6d7b33b1a3327d7fd1b977de0cf0e46d788fe82: 9 callback MODEL 조건이며 실제 producer/world import0·root 재실행0, source 검수와 합산0. MAP-TEXEL-FILTER-BLUR는 마지막2026-10-06T21:43:50Z 관측에서 송신/peer/full-guideRead1048 각1·source0·end0; CHARACTER-FRAME-FATAL-RECOVERY는 마지막21:43:51Z 관측에서 송신/peer/Read/source 각1·end0이다. 해당 시점 근거이며 현재 완료 선언이 아니다. 맵 선명도 읽기계획37853B/a6dfcb5c0da02c913c2673fb5cca6487d9de8985ace4bb47e4c9efae31a3fd50는 선택0/.5/1·defaultOFF 제안만 존재하며 shader 구현·새 GUI0이다. 다음 생산 우선은 맵 흐림 실제 비교 consumer, fatal frame 복구, NPC 기존4명 durable 소비자, 본편/native6·청취·실save다. WOLF 거절 후보 실행·채택0/피해UNKNOWN, STORY peer/source/end0. 사용률15 percentage points/day는 계정공용 목표이며 정확 채팅 daily-token 보장0·동일검사/TASK 반복0. 다른 paused 자동화·아침메일 재개0.

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

운영 최신: root 5fd0960e11bd0ecf60c0fc535e750c74e3ec50fc의 actor14758/95b16·code1+docs21 정상원격보존과 제한CPU4/74는 별도 이전완료이며 원14628/eff18 CPU16/162 재실행·핀 이동0. 이 비교단위는미완료였던 root source4를실구현하고소유완료만보존한다. MAP-TEXEL-FILTER-BLUR 공식end117a2b1c-ca3a-4b43-bf0a-c1c8dfd9241e@2026-10-06T21:45:55.972Z/raw7919B/fa04d89baad6bf6d9993bf40e63a4a000c8f30d340060af7bb441b304e307a2f, 외부map-texel-filter-blur-formal-end10484B/bedcb889f12d0b7fea1190dc7341e1f5c8e94879daac566b17f1c9cc05848a77은readonly제안·픽셀미관측·anisotropy효과/무메모리·maskcache/feather 제안미인수이며 root재실행0. CHARACTER-FRAME-FATAL 공식endcfd126a0-6cc5-4568-a3e2-58c8b0613e4f@2026-10-06T21:46:20.390Z/raw6923B/9ac3497fef5084051b92dc27853ed48fb63082e7f42c190a422ef82d464b828c, 외부actor-character-fatal-formal-end9875B/7ee799e10f4dc39cb82a56b0815b486528b6cbcbc8c78d15b99dc930d45a2340의7PASS는handwrittenMODEL(actualworldimport0). MAX_SNAPSHOT_RECOVER3·last-valididentity/epoch 제안미인수. owner가기존MAP maskfeather/cache 및ANIM snapshotidentity 새단위를각1회송신중이며 root중복송신0·전원가동과장0. 다음root우선=실editor mask1024축소/feather·cache 소비접점개선과fatalframe failclosed·캐릭터/본편연결. NPC유품contentID/questbinding은기존사용자답pending만보류·독립제작계속. WOLF거절후correctedpath쓰기incident/피해UNKNOWN을유지하고후보추가접근·실행·채택·stage0. 24시간단일rootheartbeat와공용15percentagepoints/day 목표유지, 같은검사/TASK/감사반복·토큰태우기0·다른paused자동화/아침메일재개0.
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

운영 최신: 직전remote exact237bfc3ddc199a5b6ab989b241a83515b71a8a91의source4+docs21 plateRGB비교/실Chrome6그룹13조건은별도완료이며 재실행0. 이번source1+docs21 선택마스크native비교는최초복귀FAIL을보존한한정후속인수, 본편/A급으로승격0. MAP MASK-FEATHER-CACHE 공식end85bfa803-23ce-426a-96bd-7dc9cabbb094@2026-10-06T22:07:39.606Z/raw7909B/f807a70c06c94dd4a76a8e6bc0e4a047162cb6e4e7faad79c54928d0d7ffb13e와외부root영수증23111B/453aa0088f9fbcd7e2413d839e5470c32366f4d10700b481067d60138abf9269를미채택memory로보존; 선행guide읽기순서FAIL·뒤늦은보정수신/end39fa07ea-b068-49e8-9d75-d96eb3c882c4는과거FAIL을PASS로정정하지않는다. ANIM SNAPSHOT-IDENTITY 공식end3ee6a53e-928d-4fd2-85c2-222833831079@2026-10-06T22:09:32.997Z/raw7176B/3351e3554c9a204c551c882939b6661238432550aa5d0eb0ebb580421af2cac6, 외부root영수증25715B/b83943cb64463bdd4b46892f27195ae30362e1189b10c6a70af6529a9192baa0의9PASS는fake-rigMODEL(actualworldimport0). 한프레임bridge·retry3·lastSnapshot 제안정책미승인/미채택·root재실행0. 현재owner가기존MAP editor왕복/preview복원 및ANIM재질/VFX가독성 새단위를각1회송신/peer했고 첫source/end는직전관측대기; root직접전문송신0·전원가동과장0. 다음root단위=actualrig.snapshot/render 실패 시defaultfailclosed consumer, readonly계획13398B/849c28b3fe23e799c03fdde9d1765a70d9c94d1407c65f8ccb4ba62d9578da69의currentidentity/epoch·고정오류·입력해제·RAF0/기존dispose owner. NPCdurableitem/questbinding은기존사용자답pending만보류·독립제작계속. WOLF거절후correctedpath쓰기incident/피해UNKNOWN유지·후보추가접근실행채택stage0. 단일root24시간제작·공용15percentagepoints/day 목표를유용한검수제작으로추구하며동일검사/TASK/감사반복·토큰태우기0·다른PAUSED자동화/아침메일재개0.

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

### 2026-10-07 ROOT 편집 snapshot 소비자 현재 경계

| 항목 | 현재 사실·후속 |
|---|---|
| root 최소 구현 | editor-scene-terrain18672/294e4369d5cfe4116ad6b85fa1648b6c89509d3fb009fdfe75ed7cb5af5d7faf의 프로젝트경로+core동일PNG/JPEG/WebP dataURI guard; lab10557/1c5cdf0c8d37e4ecfc8d8a5dfec0e1e436c3d7fce62ccf4a0ed96590c5ccf07d의 probe transparent:true. 전문raw의 자동채택과 구분 |
| 새 검수 | actualfactory+Three/통제Image6그룹32PASS; 별도probe실GL자동2PASS+PNG직접1PASS; 별도nativePNG/JPEG/WebP decode+GL4PASS/첫editor importFAIL1/2미도달/exit1. factorynative negative3전부NOT_REACHED·재시도0. 이전edited epoch live6+archival2+remaining6/하네스실패2도 별도이력 |
| raw6 보존·미채택 | six-editor-consumer-raw-preservation/manifest.json3777/db80a57ad7485d87982b70cd90f44d2d5cd0caec8ed7f9e56fc1da4515cb7064의 공식end/pins만 보존. MAP철회/SKILL선택정리/QA postACK source경계/BOSS극단값/ENEMY 첫stdinFAIL·guide미선행/ANIM copiedmodel과현재GPU를 구분. raw6게임채택0 |
| 실제 업무 상태 | 여섯 전문팀의 이전 source/officialend를 수집한 기존Claude8 owner가 다음배정 각2개를보냈다. 당시 ANIM·SKILL successfulsource·나머지4 도구시작대기. root가기존배정의 firstsource/공식end 수집을이어가도록owner에인계. 수신·file존재만실착수완료로계산0·전원가동과장0·root전문송신/중복송신/새팀/세션0 |
| 보존·제한 | currentdocs18+이registry경계절1·code2만 root정상보존, remoteexact은 외부 editor-scene-combined-preservation/remote-preservation-receipt.json. 원PNG/scene/nav/foreign68/ownerSTATELOGWIP/heldWOLF/기존23/사용자save/보호2_3/Q전용magicblackBean(E불가)/어택티켓금지 유지 |
| 실제 시각 판정 | VISUAL VERDICT: RETOUCH. tinyprobe가독성/원화확대·mask흐림/절벽전경재질·본편캐릭터/NPCdurable보상/save/native6/청취/A급미완료. 별도PNG의 source등록fixture를완성된지옥의틈으로계산0 |

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

### ROOT-RIG-POSE-PUBLICATION-20261007 — rig 내부 pose 갱신 완료 조회 API

| 항목 | 현행 소스 계약 | 한계 |
|---|---|---|
| source | tools/2_5d/character-rigs.mjs · 12,284 B · SHA256 b89c2c29e4755b99b25d6bb26e84d4ad3aa754472cd71abf6e0dd2302d29a4a0 | 기존 모션·프레임 UV·bones·crop·지형·world·저장 API 변경 0 |
| snapshot.posePublication | null 또는 frozen record 자체 identity token. 필드 normalizedPhase/mode/direction/frame/elapsed/source | snapshot 반복은 같은 record 참조; 같은 frame/elapsed라도 새 정상 update는 새 identity |
| 진입·게시 | update 진입 updateDepth++ → options getter 전 null. 실제 mesh.updateMatrixWorld(true)·skeleton.update 성공 및 samejob/notdisposed, depth===1일 때만 게시 | inner update는 계산·반환만; update 안 callback의 publication은 null |
| 실패·종료 | catch null 후 원 thrown identity 재throw. finally depth--, stale outer null, 정상 job만 null. dispose 첫 publication/job null | dispose는 진행 중 stack depth를 reset하지 않음. 기존 cleanup throw 이후 모든 자원 정리 완료를 증명하지 않음 |
| phase·source | 기존 finite phase clamp 0..1 / 자동 elapsed%duration/duration, frame min(frames−1,floor(phase×frames)); source는 기존 frozen frameInfo | 새 모션·프레임/PNG/UV 생성 0 |
| 첫 반환 | factory 내부 idle update(0) 성공 뒤 publication 포함 | 최초 항상 null인 API 아님 |
| 의미 | rig 내부 mesh/skeleton matrix 갱신 완료 조회 | 이후 caller world/parent transform·texture/geometry 제자리 변경·alpha/opaque 소비·GPU freshness UNKNOWN |
| 신규 검수 | 실제 factory/catalog/vendored Three 첫 CPU 1회, 14그룹·90조건 PASS; FAIL/미도달/unhandled 0, exit0, source/fixture PNG exact | Image는 PNG IHDR controlled port. 실제 decode·GPU·Chrome·native·alpha 소비 0. 이전93 등 검수 합산·반복 0 |
| shared checkout 경계 | root의 game 쓰기/stage 0, 현재 game은 별도 writer UNKNOWN WIP 보존·완료 Git 범위 제외 | checkout 전체 game bytes 불변 주장 0; 보호 나머지8 exact와 별도 |
| 인수 상태 | API source/CPU 검수 완료; 신규 시각 NOT ASSESSED, 전체 VISUAL RETOUCH | 본편 native6·audio·save·A급 인수 0; Berin 미채택 후보/복원 world 현행 이력 유지 |

MAP PRODUCTION REPORT (§23): STAGE=CH1-1 2.5D 캐릭터 기반 API; MASTER/OUTER/LARGE/MEDIUM/GROUND/PLAYABLE/LANDMARK/CAMERA 배치 변경0. TECH=신규 실제 rig CPU14그룹90조건 PASS, GPU/화면/청취/본편 플레이0. FILES=rig1+관련docs14; 타인 game/ownerWIP·원 PNG/scene/nav 보존. GIT=이 완료소유만 정상 보존, 배포0. VISUAL VERDICT: RETOUCH. NEXT PASS=실제 1-1 권위 map/P/카메라를 소비하는 2.5D 맵·캐릭터 연결.
