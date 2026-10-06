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
