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
