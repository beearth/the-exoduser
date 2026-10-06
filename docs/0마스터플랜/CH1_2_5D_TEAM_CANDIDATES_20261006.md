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
