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
