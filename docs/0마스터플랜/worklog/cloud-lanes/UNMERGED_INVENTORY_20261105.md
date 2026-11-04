# unity/main 미병합 작업 전수 목록 (11-05, 레인 I1)

- 작성: 클라우드 세션(I1 레인), 기준 unity/main = `7958690` (11-05 02:32 KST). 목록만, 코드 수정 없음. 버려도 되는지는 판단하지 않고 사실만 적는다.
- 범위: 원격 브랜치 874개 중 마지막 커밋이 10-26 이후인 382개(unity/main 제외). 판정 출처는 표마다 적었고, 출처가 없으면 "판정 기록을 못 찾음"이다.

## 맨 위 요약

**판정 대기 34 · RETOUCH 중 6 · 상태 불명 59** (미병합 "끝점" 브랜치 114개 기준) / FAIL·중단 15

| 분류 | 개수 | 설명 |
|---|---|---|
| 병합됨 | 114 | unity/main 조상 84개 + 10-26 이후 커밋이 전부 unity/main에 있는 30개(오래된 줄기만 달라 ancestor는 아님) |
| 다른 브랜치에 흡수됨 | 164 | 미병합이지만 위 끝점 브랜치 중 하나가 그 커밋을 그대로 포함. 끝점이 살아 있으면 조용히 사라지지 않음 |
| 판정 대기 | 34 | 제출·검수·촬영·실측 대기 |
| RETOUCH 중 | 6 | RETOUCH 판정 또는 실패 일부 기록이 있고 고치는 중 |
| FAIL·중단 | 15 | 제목·문서에 실패/중단이 적힌 것 |
| 상태 불명 | 59 | 백업 스냅샷, 웹/아트 계열, 판정 문구를 못 찾은 것 |

읽는 법: "ahead"는 10-26 이후 커밋 중 unity/main에 없는 수. main(웹) 계통을 합친 브랜치는 수백~수천으로 크게 나온다(godot/웹 파일 포함). "고유 패치"는 `git cherry`로 본 unity/main에 같은 패치가 없는 커밋 수(전체 이력 기준). 이 목록은 분류만 했고, 판정(PASS)은 Mac·디자인총괄만 낸다.

## 1. 지정 레인 추적

| 레인 | 브랜치 | SHA | 날짜 | 위치 | 판정/근거 |
|---|---|---|---|---|---|
| A2R 맵 | `claude/unity-pc-a2r-route-20261104` | `2308e2111` | 2026-11-04 | 흡수됨 → claude/unity-cloud-boss-hp-drop-20261104 | RETOUCH — 디자인 RETOUCH(카드 덤불 2.5~3H, 늪 칼날 가장자리), map-d5·map-swamp 보정 후 디자인 PASS 필요 (HANDOFF §3) |
| A2R NRE 수정 | `claude/unity-cloud-a2r-nre-fix-20261104` | `8a5740a22` | 2026-11-04 | 흡수됨 → claude/unity-cloud-boss-hp-drop-20261104 | A2R 맵 NRE 수정 — a2r-route와 함께 판정 대기 (커밋 8a5740a22) |
| map-swamp | `codex/unity-map-swamp-20261104` | `61ecfb98c` | 2026-11-05 | FAIL·중단 | "second swamp visual failure and stop gate"(2회 시각 실패). 핸드오프 §2는 RETOUCH 대응 중 (61ecfb98c 제목 / HANDOFF) |
| map-keyshot | `codex/unity-map-keyshot-20261104` | `502b27dae` | 2026-11-04 | RETOUCH 중 | 키샷 3차 native 실패·S3 부분 증거(Steam 키샷 데모 v0 ①) (502b27dae 제목) |
| map-fieldbuild | `codex/unity-map-fieldbuild-20261104` | `532655299` | 2026-11-05 | FAIL·중단 | "필드 실측·화면 실패 기록과 굽기 채택 차단" (532655299 제목) |
| map-webcards | `codex/unity-map-a2-webcards-20261104` | `133a33484` | 2026-11-05 | 판정 대기 | 웹 카드 로딩 단축 — 1.5초 이하 실측 대기 (HANDOFF §2) |
| map-loadprof | `codex/unity-map-loadprof-20261104` | `f703d5b8e` | 2026-11-04 | 판정 대기 | 지면 192장 5.9s → 1.0s 이하 목표, 순번 대기·미검증 단계 (f703d5b8e 제목) |
| map-d5 | `codex/unity-map-d5-20261104` | `e737103ea` | 2026-11-04 | RETOUCH 중 | D5 남은 3항목·큰 카드 0.45H 이하·3D 덤불·흰 사각형 — 디자인 RETOUCH 대응 (HANDOFF §2) |
| map-scale-c1 | `codex/unity-map-scale-c1-20261104` | `a0e66b2c2` | 2026-11-04 | 판정 대기 | ×2 2D 실측, 적 수 채택 보류 판정 (a0e66b2c2 제목) |
| map-b5-main | `codex/unity-map-b5-main-20261104` | `6beb20c9f` | 2026-11-04 | 판정 대기 | B5 "검증 필요" — 공용 실행기 HALT로 검증 보류 (HANDOFF §3 / 6beb20c9f) |
| char-modular | `codex/unity-char-modular-20261104` | `a801204b7` | 2026-11-04 | 판정 대기 | 대검 1920 modular PASS, 남은 촬영(shoot4.ps1) → 디자인 PASS 대기 (HANDOFF §3) |
| rigpixel | `codex/unity-rigpixel-20261103` | `a4c8b4ea4` | 2026-11-04 | FAIL·중단 | "interrupted hero rigpixel handoff before modular rebuild" 중단 보존(modular로 대체) (a4c8b4ea4 제목) |
| druid-vfx5 | `codex/unity-druid-vfx5-20261104` | `874218da0` | 2026-11-04 | 판정 대기 | 드루이드 남은 5기술 VFX 본체. 재빌드 중, 탄막 겹침 촬영 → 판정 (HANDOFF §3) |
| druid 슬램 | `claude/unity-pc-vfx-druid-slam-20261104` | `38236aa61` | 2026-11-04 | 흡수됨 → codex/unity-druid-vfx5-20261104 | druid-vfx5에 포함 — 판정 대기 |
| druid 실루엣 | `claude/unity-cloud-druid-silhouette-20261104` | `a1f7d925a` | 2026-11-04 | 흡수됨 → claude/unity-cloud-boss-hp-drop-20261104 | 드루이드 실루엣 분석(L14 계열) — Mac에서 회색 잔존 확인(mac_20261104.md) |
| boss-arena | `codex/unity-boss-arena-20261103` | `1fa74ff82` | 2026-11-04 | 흡수됨 → claude/unity-cloud-boss-hp-drop-20261104 | 판정 대기 — 컴파일 0 오류, 보스전 rigpixel 촬영 → 디자인 PASS (HANDOFF §3). 이후 boss-all 합본에서 Mac RETOUCH |
| boss-abc | `codex/unity-boss-abc-20261105` | `15fde55a3` | 2026-11-05 | 흡수됨 → codex/unity-boss-all-20261105 | RETOUCH — Mac 15fde55a3 중간: 근평면 0·burrowStrike 해소, 실루엣 회색·HP 급감 재현 (mac_20261104.md) |
| boss-all | `codex/unity-boss-all-20261105` | `dd7fb0b6c` | 2026-11-05 | RETOUCH 중 | boss-abc·b2r·fix-a/b/c·ac·base·b2-botdeath·arena 합본(dd7fb0b6c). Mac: 실루엣 회색·HP 급감 재현 (mac_20261104.md) |
| preview6 | `claude/unity-integration-preview6-20261104` | `6229288c0` | 2026-11-04 | 흡수됨 → claude/unity-cloud-boss-hp-drop-20261104 | FAIL — Mac 세션 판정 요약에 preview6 FAIL (mac-transfer 커밋 0dce1d732 이력) |
| preview(1차) | `claude/unity-integration-preview-20261104` | `6dc0ac0b7` | 2026-11-04 | 상태 불명 | preview6의 앞 세대 통합 미리보기(병합 아님) (6dc0ac0b7) |
| i18n-5th | `codex/unity-i18n-5th-20261105` | `52ebb74a9` | 2026-11-05 | 판정 대기 | R1 12차 PASS(탭 모양 변화는 디자인 판정 필요) (6dc4805b5) |
| i18n-4th | `codex/unity-i18n-4th-20261105` | `ad5419ba1` | 2026-11-05 | 흡수됨 → codex/unity-i18n-5th-20261105 | 끝점 판정: 판정 대기 — R1 12차 PASS(탭 모양 변화는 디자인 판정 필요) |
| i18n-first-impression | `codex/unity-i18n-first-impression-20261104` | `ed7a85655` | 2026-11-04 | 병합됨 | unity/main 포함 |
| i18n-audit | `codex/unity-i18n-audit-20261104` | `b9ce9b848` | 2026-11-04 | 흡수됨 → codex/unity-i18n-5th-20261105 | 끝점 판정: 판정 대기 — R1 12차 PASS(탭 모양 변화는 디자인 판정 필요) |
| 사운드 R5 | `claude/unity-pc-sound-r5` | `7eefc676a` | 2026-11-04 | 병합됨 | unity/main 포함 |
| 사운드 R8 | `claude/unity-pc-sound-r8-20261104` | `0881c7e5e` | 2026-11-04 | 병합됨 | unity/main 포함 |
| 사운드 R9 | `claude/unity-pc-sound-r9-20261104` | `cf575bfa0` | 2026-11-04 | 병합됨 | unity/main 포함 |
| 사운드 R10 | `claude/unity-pc-sound-r10-20261104` | `a04450ec8` | 2026-11-04 | 병합됨 | unity/main 포함 |
| 사운드 wire R8R9 | `claude/unity-pc-sound-wire-r8r9-20261104` | `63cac8900` | 2026-11-04 | 병합됨 | unity/main 포함 |
| 사운드 G1 | `claude/unity-pc-sound-g1-20261104` | `d67926918` | 2026-11-04 | 병합됨 | unity/main 포함 |
| 사운드 BGM list/license | `claude/unity-pc-sound-bgm-list-20261104` | `c4b03f22e` | 2026-11-04 | 병합됨 | unity/main 포함 |
| 사운드 BGM license | `claude/unity-pc-sound-bgm-license-20261104` | `ba56124ab` | 2026-11-04 | 병합됨 | unity/main 포함 |
| 사운드 BGM import | `codex/unity-bgm-import-p1-20261104` | `5c1d29ac5` | 2026-11-04 | 병합됨 | unity/main 포함 |
| 사운드 인수(10-28) | `codex/pc-sound-takeover-20261028` | `d9edf9bd8` | 2026-10-31 | 상태 불명 | 승인 ui_tab 원본·Unity 누락 연결 manifest 전달 — Runtime 미적용 (d9edf9bd8 제목) |
| 사운드 rm1(10-27) | `claude/unity-pc-sound-rm1-20261027` | `acf2fb948` | 2026-10-28 | 흡수됨 → codex/backup-hd2d-input-20261031T083218329Z | 끝점 판정: 상태 불명 — "HD2D 입력 복구 스냅샷 - WIP 미검수". 10-28 claude/unity-pc-* 다수를 포함 |
| Tripo/Meshy MCP·API | `codex/mcp-api-team-20261031` | `6299db9aa` | 2026-11-03 | 상태 불명 | Meshy/Tripo 포함 MCP·API 팀 후보(chest shader 준비) (6299db9aa) |
| Tripo 직접 인증 | `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` | `4f6919a4e` | 2026-11-02 | 상태 불명 | Tripo 직접 인증 기록 + 현대 의상 스터디(아트 백업 체인 끝점) (4f6919a4e) |
| Blender 다리 키트 | `codex/pc-blender-env-r3-20261030` | `b9ffca060` | 2026-10-30 | 상태 불명 | 나무다리 R3 환경 키트(Blender 스캔 기반) 직접 검수 보존 (b9ffca060) |
| 보스 Blender | `codex/pc-boss-takeover-20261028` | `d6d8ad1ad` | 2026-10-29 | FAIL·중단 | "Blender S3 staff authoring failure study" (d6d8ad1ad 제목) |
| 드루이드 R4 | `codex/pc-boss-druid-r4-pure-20261031` | `59cd16dd3` | 2026-10-31 | FAIL·중단 | "연속 인체 브러시 표본 형태 불합격" 기록 (59cd16dd3 제목) |
| Mac 전달 | `claude/mac-transfer-20261104` | `0dce1d732` | 2026-11-05 | 판정 대기 | Mac 전달 묶음(병합 대상 아님). 결과 커밋에 preview6 FAIL·combo4 RETOUCH 정리 (HANDOFF §3 + 0dce1d732) |
| combo4 | `claude/unity-pc-candidate-combo4-20261104` | `a8618d9bf` | 2026-11-04 | RETOUCH 중 | 5브랜치 합친 판정용 빌드(병합하지 않음). Mac 판정 RETOUCH; 구성 5브랜치는 3c37ef885로 unity/main 병합됨 (HANDOFF §3 / mac-transfer) |

- Tripo·Meshy 산출물은 별도 브랜치가 아니라 위 `mcp-api-team`·`multiverse…tripo-api`·`pc-blender-env-r3`·`pc-boss-*`·`demo-art-*`·`pc-sprites11-art`에 들어 있다. 사운드 R5~R10·BGM은 모두 병합됨(미병합 사운드는 10-28 인수/rm1 두 줄기뿐).

## 2. 미병합 끝점 브랜치 114개 (판정 대기 · RETOUCH · FAIL · 상태 불명)

끝점 = 다른 원격 브랜치가 그 커밋을 포함하지 않는 브랜치. 분류 순서로 정렬.

| 분류 | 브랜치 | 마지막 SHA | 날짜 | ahead | 고유 패치 | 바뀐 경로(상위) | 무엇/판정 | 출처 |
|---|---|---|---|---|---|---|---|---|
| RETOUCH 중 | `claude/unity-mac-report-20261104` | `c151c9b11` | 2026-11-05 | 16 | 16 | "docs(19)  | 보스 15fde55a3 중간: 근평면 0·burrowStrike 해소, 실루엣 P1~P3 회색·HP 급감 재현 → 보스 RETOUCH | reports/mac_20261104.md |
| RETOUCH 중 | `claude/unity-pc-candidate-combo4-20261104` | `a8618d9bf` | 2026-11-04 | 12 | 1 | docs/CHANGELOG_SYNC.md(1)  | 5브랜치 합친 판정용 빌드(병합하지 않음). Mac 판정 RETOUCH; 구성 5브랜치는 3c37ef885로 unity/main 병합됨 | HANDOFF §3 / mac-transfer |
| RETOUCH 중 | `codex/unity-boss-all-20261105` | `dd7fb0b6c` | 2026-11-05 | 160 | 119 | AE/Resources(2915) AE/Runtime(321) docs/engine(110)  | boss-abc·b2r·fix-a/b/c·ac·base·b2-botdeath·arena 합본(dd7fb0b6c). Mac: 실루엣 회색·HP 급감 재현 | mac_20261104.md |
| RETOUCH 중 | `codex/unity-crash-p2-20261105` | `0b021b4e4` | 2026-11-05 | 1 | 1 | AE/Runtime(3) docs/CHANGELOG_SYNC.md(1) Tools/crash-p2/run-tests.cjs(1 | R2: 펫 카탈로그 실패가 매 프레임 반복 → RETOUCH | 2c0a6d2c0 |
| RETOUCH 중 | `codex/unity-map-d5-20261104` | `e737103ea` | 2026-11-04 | 115 | 104 | AE/Resources(4735) AE/Runtime(259) docs/CHANGELOG_SYNC.md(71)  | D5 남은 3항목·큰 카드 0.45H 이하·3D 덤불·흰 사각형 — 디자인 RETOUCH 대응 | HANDOFF §2 |
| RETOUCH 중 | `codex/unity-map-keyshot-20261104` | `502b27dae` | 2026-11-04 | 109 | 98 | AE/Resources(4738) AE/Runtime(240) docs/CHANGELOG_SYNC.md(73)  | 키샷 3차 native 실패·S3 부분 증거(Steam 키샷 데모 v0 ①) | 502b27dae 제목 |
| 판정 대기 | `claude/mac-transfer-20261104` | `0dce1d732` | 2026-11-05 | 4 | 4 | transfer(12) "docs(2)  | Mac 전달 묶음(병합 대상 아님). 결과 커밋에 preview6 FAIL·combo4 RETOUCH 정리 | HANDOFF §3 + 0dce1d732 |
| 판정 대기 | `claude/trusting-maxwell-q00is3` | `fd2155e0c` | 2026-11-03 | 795 | 3189 | godot(2176) "docs(1211) assets(456)  | 쓰레기 일괄분해·인벤토리 제목·일시정지 실버 헬 — 클라우드 적용 기록(85ca8fd9), PC 실기 검수 인계 | fd2155e0c |
| 판정 대기 | `claude/unity-cloud-boss-hp-drop-20261104` | `549b6500c` | 2026-11-04 | 147 | 112 | AE/Resources(2914) AE/Runtime(303) docs/engine(105)  | L14 드루이드 HP 급감 원인 분석(문서). 코드 가드는 컴파일 미확인·Mac 재판정 필요 | 549b6500c |
| 판정 대기 | `claude/unity-cloud-crash-audit-20261104` | `92751f490` | 2026-11-04 | 1 | 1 | "docs(1)  | L6 크래시 0 정적 감사 보고(P1 2건 → crash-p1-fix로 unity/main 병합됨) | 92751f490 |
| 판정 대기 | `claude/unity-cloud-demo-package-20261104` | `e477e8c22` | 2026-11-04 | 1 | 1 | "docs(2) docs/CHANGELOG_SYNC.md(1)  | L7 데모 v0 ④ Steam 체험판 점검표(사용자 결정 D1~D7 대기) | e477e8c22 |
| 판정 대기 | `claude/unity-cloud-i18n-audit-20261104` | `59a2f424c` | 2026-11-04 | 1 | 1 | "docs(2)  | C3 29개 언어 감사 보고(보고만) | 59a2f424c |
| 판정 대기 | `claude/unity-cloud-killu-fix-20261104` | `9ca546595` | 2026-11-04 | 2 | 2 | AE/Runtime(3) docs/CHANGELOG_SYNC.md(2) "docs(2)  | L5 R1 oracle bn 킬루 보정 | 9ca546595 |
| 판정 대기 | `claude/unity-cloud-mergeready-20261104` | `f815cf516` | 2026-11-04 | 1 | 1 | "docs(1)  | L1 병합 대기 5브랜치 사전 점검(5개는 이후 unity/main 병합됨) | f815cf516 |
| 판정 대기 | `claude/unity-cloud-postmerge-docs-20261105` | `ee9a41a51` | 2026-11-04 | 1 | 1 | "docs(3) docs/CHANGELOG_SYNC.md(1)  | C1 데모 통합 후속 문서 | ee9a41a51 |
| 판정 대기 | `claude/unity-cloud-review-20261104` | `6dc4805b5` | 2026-11-04 | 14 | 14 | "docs(14)  | R1 12차 검수 기록: i18n-5th PASS(탭 모양은 디자인 판정 필요) | 6dc4805b5 |
| 판정 대기 | `claude/unity-cloud-review2-20261105` | `2c0a6d2c0` | 2026-11-04 | 1 | 1 | "docs(1)  | R2 검수: debug-t2·자산 영수증 2건·K3 PASS, crash-p2 RETOUCH | 2c0a6d2c0 |
| 판정 대기 | `claude/unity-cloud-vfx-angler-combine-20261104` | `d4f07acaa` | 2026-11-05 | 7 | 4 | AE/Runtime(15) AE/Resources(6) "docs(6)  | L4 앵글러 물구슬 합본 — R1 PASS + PC 컴파일 + 화면 판정 대기 | LANES_CLOUD L4 / d4f07acaa |
| 판정 대기 | `claude/unity-frame-opt-20261103` | `9c4f5de80` | 2026-11-03 | 5 | 5 | AE/Runtime(17) docs/CHANGELOG_SYNC.md(3) Tools/perf/run-mac.sh(2)  | U9a 2D 카메라 생략 최적화, U6~U9a 측정 기록(화면 판정 없음) | 9c4f5de80 |
| 판정 대기 | `claude/unity-pc-du5-speed-regen-20261104` | `98cf59aab` | 2026-11-04 | 2 | 2 | AE/Runtime(6) "docs(2) docs/engine(1)  | D-U5 속도/재생 parity, D-U6 보드 반영 | 98cf59aab |
| 판정 대기 | `claude/unity-pc-inv-salvage-20261103` | `259cd9f24` | 2026-11-04 | 2 | 2 | AE/Runtime(13) Tools/salvage-oracle/oracle.json(1) Tools/salvage-oracl | 일시정지 MetalAction 글자색 수정 외 쓰레기 분해 oracle | 259cd9f24 |
| 판정 대기 | `claude/unity-pc-mipmap-merge-20261104` | `fbfca73ae` | 2026-11-04 | 2 | 1 | docs/engine(1)  | mipmap 병합 후 UNITY_HERO_MODULAR_G0 문서 11줄 복원 | fbfca73ae |
| 판정 대기 | `claude/unity-pc-quit-hardexit-20261104` | `850615ca1` | 2026-11-04 | 8 | 6 | AE/Runtime(89) docs/engine(5) docs/CHANGELOG_SYNC.md(5)  | Unity 안 꺼짐 하드 종료 — 깨끗한 부팅 18회 통과 뒤 병합 조건 | HANDOFF §3,§5 |
| 판정 대기 | `claude/unity-pc-report-pcexec-20261104` | `b500c0d97` | 2026-11-05 | 3 | 3 | "docs(12)  | 보스룸 코덱스 3건 결과 보고(문서만) | b500c0d97 |
| 판정 대기 | `claude/unity-pc-telegraph-linear-20261104` | `288111eee` | 2026-11-04 | 1 | 1 | AE/Runtime(2) docs/CHANGELOG_SYNC.md(1)  | 드루이드 예고 정점색 선형 변환(민트 원판 수정) | 288111eee |
| 판정 대기 | `claude/unity-pc-ui-candidate-combo-20261104` | `71c366324` | 2026-11-04 | 3 | 0 |  | ossuary-count 합친 UI 판정용 병합 | 71c366324 |
| 판정 대기 | `claude/unity-pc-vfx-hits-20261104` | `61ef5d2ec` | 2026-11-04 | 6 | 4 | AE/Runtime(12) "docs(6) docs/CHANGELOG_SYNC.md(4)  | 적 피격 스파크 테이퍼 r4 | 61ef5d2ec |
| 판정 대기 | `claude/unity-pc-vfx-summon-silver-20261104` | `c56bc4254` | 2026-11-04 | 7 | 7 | AE/Runtime(12) tools(5) AE/Resources(3)  | 소환진 안내 촬영 전 로스터 폴더 선생성(원인 미검증) | c56bc4254 |
| 판정 대기 | `claude/unity-ui-overlap-merged-check-20261104` | `610c1bca6` | 2026-11-04 | 3 | 2 | AE/Runtime(8) docs/engine(5) docs/CHANGELOG_SYNC.md(2)  | UI overlap pass1+2 병합 Player 확인용 | 610c1bca6 |
| 판정 대기 | `codex/unity-asset-receipt-sync-20261105` | `0f9277507` | 2026-11-05 | 5 | 5 | docs/CHANGELOG_SYNC.md(5) docs/engine(1) Tools/pet-bubble-tests/export | 자산 영수증 12건 정합 — R2 PASS(병합 대기) | 2c0a6d2c0 |
| 판정 대기 | `codex/unity-char-modular-20261104` | `a801204b7` | 2026-11-04 | 18 | 16 | AE/Art(92) docs/engine(20) Tools/char-modular/bake(14)  | 대검 1920 modular PASS, 남은 촬영(shoot4.ps1) → 디자인 PASS 대기 | HANDOFF §3 |
| 판정 대기 | `codex/unity-debug-t2-20261104` | `8be06c5f5` | 2026-11-05 | 4 | 4 | docs/CHANGELOG_SYNC.md(4) Tools/ki-slash-oracle/poise-oracle.cjs(2) To | R2 PASS(병합 대기). D-T2-E 열린 항목 | 2c0a6d2c0 |
| 판정 대기 | `codex/unity-docs-linkcheck-20261104` | `2ec876c4e` | 2026-11-05 | 1 | 1 | "docs(2)  | 문서 링크·선행 경로 감사 | 2ec876c4e |
| 판정 대기 | `codex/unity-druid-vfx5-20261104` | `874218da0` | 2026-11-04 | 49 | 34 | AE/Runtime(131) AE/Resources(108) docs/engine(58)  | 드루이드 남은 5기술 VFX 본체. 재빌드 중, 탄막 겹침 촬영 → 판정 | HANDOFF §3 |
| 판정 대기 | `codex/unity-i18n-5th-20261105` | `52ebb74a9` | 2026-11-05 | 16 | 13 | AE/Runtime(43) "docs(20) docs/CHANGELOG_SYNC.md(13)  | R1 12차 PASS(탭 모양 변화는 디자인 판정 필요) | 6dc4805b5 |
| 판정 대기 | `codex/unity-map-a2-webcards-20261104` | `133a33484` | 2026-11-05 | 94 | 87 | AE/Resources(4792) AE/Runtime(221) docs/CHANGELOG_SYNC.md(67)  | 웹 카드 로딩 단축 — 1.5초 이하 실측 대기 | HANDOFF §2 |
| 판정 대기 | `codex/unity-map-b5-main-20261104` | `6beb20c9f` | 2026-11-04 | 4 | 4 | docs/CHANGELOG_SYNC.md(4) AE/Runtime(4) "docs(2)  | B5 "검증 필요" — 공용 실행기 HALT로 검증 보류 | HANDOFF §3 / 6beb20c9f |
| 판정 대기 | `codex/unity-map-loadprof-20261104` | `f703d5b8e` | 2026-11-04 | 104 | 93 | AE/Resources(4735) AE/Runtime(238) docs/CHANGELOG_SYNC.md(68)  | 지면 192장 5.9s → 1.0s 이하 목표, 순번 대기·미검증 단계 | f703d5b8e 제목 |
| 판정 대기 | `codex/unity-map-scale-c1-20261104` | `a0e66b2c2` | 2026-11-04 | 8 | 7 | AE/Runtime(18) "docs(8) docs/CHANGELOG_SYNC.md(7)  | ×2 2D 실측, 적 수 채택 보류 판정 | a0e66b2c2 제목 |
| 판정 대기 | `codex/unity-run-exception-audit2-20261104` | `fbe300e3b` | 2026-11-04 | 1 | 1 | docs/engine(1)  | 병합 대기 브랜치 예외 위험 2차 정적 점검 | fbe300e3b |
| FAIL·중단 | `claude/unity-pc-c04-oracle-20261027` | `ccd4166dc` | 2026-10-27 | 58 | 2894 | docs/engine(128) AE/Runtime(70) docs/CHANGELOG_SYNC.md(34)  | C04-ORACLE-2 WIP 중단본(CTO 10-27: C07이 대조, 미실행) | ccd4166dc 제목 |
| FAIL·중단 | `claude/unity-pc-devtools-web-introdiag-20261028` | `219cdef80` | 2026-10-28 | 300 | 3044 | AE/Runtime(635) AE/Remodel(320) docs/engine(190)  | "diag: ... temporary, not for merge" 임시 진단 | 219cdef80 제목 |
| FAIL·중단 | `codex/demo-art-boss-20261030` | `d1452233b` | 2026-10-30 | 486 | 3175 | AE/Runtime(824) AE/Remodel(378) AE/Resources(343)  | "record failed R2 surface rebuild silhouette" — 드루이드 R2 실루엣 실패 기록 | d1452233b 제목 |
| FAIL·중단 | `codex/mac-decal-noeffect-regression-20261102` | `b98037afc` | 2026-11-02 | 838 | 3488 | AE/Resources(2485) AE/Runtime(1643) docs/engine(794)  | "no-decal regression and imported-byte audit" 기록 | b98037afc 제목 |
| FAIL·중단 | `codex/mac-ground-alpha-20261102` | `7fda42539` | 2026-11-02 | 841 | 3491 | AE/Resources(2480) AE/Runtime(1651) docs/engine(799)  | "actual GPU contribution ground-contact failure on Mac" | 7fda42539 제목 |
| FAIL·중단 | `codex/mac-ground-final-qa-20261102` | `63bc9e1f3` | 2026-11-02 | 844 | 3494 | AE/Resources(2483) AE/Runtime(1658) docs/engine(803)  | "Mac product projection blocking before QA diagnostics" | 63bc9e1f3 제목 |
| FAIL·중단 | `codex/pc-boss-druid-r4-pure-20261031` | `59cd16dd3` | 2026-10-31 | 613 | 3286 | AE/Runtime(1141) AE/Resources(773) docs/engine(500)  | "연속 인체 브러시 표본 형태 불합격" 기록 | 59cd16dd3 제목 |
| FAIL·중단 | `codex/pc-boss-takeover-20261028` | `d6d8ad1ad` | 2026-10-29 | 338 | 3069 | AE/Runtime(671) AE/Remodel(344) docs/engine(210)  | "Blender S3 staff authoring failure study" | d6d8ad1ad 제목 |
| FAIL·중단 | `codex/pc-unity-steam-keyshot2-20261030` | `d755d238f` | 2026-10-30 | 498 | 3187 | AE/Runtime(865) AE/Resources(432) AE/Remodel(378)  | "키샷 후보6 실제 시각 FAIL과 UI우선 대기" | d755d238f 제목 |
| FAIL·중단 | `codex/pc-varco-trial-20261030` | `394c8f084` | 2026-10-30 | 485 | 3174 | AE/Runtime(824) AE/Remodel(378) AE/Resources(343)  | VARCO 시험 잔액 차단 — 재개 근거 기록 | 394c8f084 제목 |
| FAIL·중단 | `codex/unity-map-fieldbuild-20261104` | `532655299` | 2026-11-05 | 93 | 86 | AE/Resources(4239) AE/Runtime(229) docs/CHANGELOG_SYNC.md(66)  | "필드 실측·화면 실패 기록과 굽기 채택 차단" | 532655299 제목 |
| FAIL·중단 | `codex/unity-map-swamp-20261104` | `61ecfb98c` | 2026-11-05 | 108 | 97 | AE/Resources(4743) AE/Runtime(248) docs/CHANGELOG_SYNC.md(71)  | "second swamp visual failure and stop gate"(2회 시각 실패). 핸드오프 §2는 RETOUCH 대응 중 | 61ecfb98c 제목 / HANDOFF |
| FAIL·중단 | `codex/unity-map25d-20261102` | `c15f03e83` | 2026-11-03 | 844 | 3493 | AE/Resources(2480) AE/Runtime(1640) AE/Remodel(1372)  | "사용자 방향 정정(13:40)으로 GB1 작업 중단" WIP 보존 | c15f03e83 제목 |
| FAIL·중단 | `codex/unity-rigpixel-20261103` | `a4c8b4ea4` | 2026-11-04 | 1 | 1 | AE/Runtime(11) docs/engine(2) docs/CHANGELOG_SYNC.md(1)  | "interrupted hero rigpixel handoff before modular rebuild" 중단 보존(modular로 대체) | a4c8b4ea4 제목 |
| FAIL·중단 | `qa/mac-captures-20261103` | `7523bbc8d` | 2026-11-03 | 14 | 14 | qa(140)  | "boss arena 321c6b1 captures — gate FAIL" | 7523bbc8d 제목 |
| 상태 불명 | `claude/unity-first60-20261105` | `602c53f95` | 2026-11-05 | 6 | 5 | AE/Resources(164) AE/Runtime(16) "docs(4)  | 제작 순서 매뉴얼 추가 + 에셋 164건. 판정 기록 못 찾음 | 602c53f95 |
| 상태 불명 | `claude/unity-integration-preview-20261104` | `6dc0ac0b7` | 2026-11-04 | 134 | 93 | AE/Resources(2902) AE/Runtime(279) docs/engine(92)  | preview6의 앞 세대 통합 미리보기(병합 아님) | 6dc0ac0b7 |
| 상태 불명 | `claude/unity-pc-devtools-buildloop3-20261028` | `0ea27c069` | 2026-10-28 | 285 | 3036 | AE/Runtime(614) AE/Remodel(320) docs/engine(187)  | 판정 기록을 못 찾음. 제목: feat(devtools): requiredMedia 에 title_motion_20261028.mp4 추가 | 0ea27c069 |
| 상태 불명 | `claude/unity-pc-devtools-codex-20261028` | `37f057195` | 2026-10-28 | 302 | 3043 | AE/Runtime(643) AE/Remodel(320) docs/engine(192)  | 판정 기록을 못 찾음. 제목: feat(devtools): Codex 실행 표준 래퍼 exo-codex.ps1 + 워크트리 정리 도구 exo-worktree | 37f057195 |
| 상태 불명 | `claude/unity-pc-herolight-20261028` | `ff20dc2d2` | 2026-10-28 | 129 | 2944 | AE/Runtime(399) docs/engine(153) AE/Resources(110)  | 판정 기록을 못 찾음. 제목: feat(unity): Hero Light 공용 설정 — Rendering Layer 1=Hero, URP PC_High·Ma | ff20dc2d2 |
| 상태 불명 | `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` | `4f6919a4e` | 2026-11-02 | 665 | 3093 | godot(2176) "docs(1069) assets(495)  | Tripo 직접 인증 기록 + 현대 의상 스터디(아트 백업 체인 끝점) | 4f6919a4e |
| 상태 불명 | `codex/backup-hd2d-input-20261031T083218329Z` | `c9b036627` | 2026-10-31 | 632 | 3305 | AE/Runtime(1149) AE/Resources(781) docs/engine(529)  | "HD2D 입력 복구 스냅샷 - WIP 미검수". 10-28 claude/unity-pc-* 다수를 포함 | c9b036627 |
| 상태 불명 | `codex/backup-unity-11-fullrun-20261103-083442` | `dff30b955` | 2026-11-03 | 1 | 0 |  | WIP 복구 스냅샷(1-1 입장·미니맵 준비) | dff30b955 |
| 상태 불명 | `codex/backup-unity-parity-fifth-prep-20261103` | `78cd4682b` | 2026-11-03 | 1 | 1 | AE/Runtime(97) AE/Resources(6) docs/engine(1)  | 5차 미인수 전환·스킬 준비 백업 | 78cd4682b |
| 상태 불명 | `codex/backup-unity-parity-fifth-prep-20261103b` | `059fcb9f6` | 2026-11-03 | 2 | 2 | AE/Runtime(97) AE/Resources(4) docs/engine(1)  | 5차 미인수 스킬·패시브·대장간 준비 백업 | 059fcb9f6 |
| 상태 불명 | `codex/backup-unity-parity-fifth-prep-20261103c` | `106521b84` | 2026-11-03 | 1 | 1 | AE/Resources(190) AE/Runtime(95) docs/engine(2)  | 5차 미인수 스킬 UI·패시브·원본 웹 오디오 준비 백업 | 106521b84 |
| 상태 불명 | `codex/backup-unity-parity-p0-20261103` | `0a21d3f47` | 2026-11-03 | 2 | 0 | AE/Runtime(4) docs/engine(2) Tools/ui-overlap/check.ps1(1)  | P0 중단 지점과 소유 프로세스 정리 근거 백업 | 0a21d3f47 |
| 상태 불명 | `codex/character-basic-story-unity-20261102` | `52563eeb8` | 2026-11-02 | 837 | 3487 | AE/Resources(2482) AE/Runtime(1643) docs/engine(793)  | 캐릭터 좌측 기본 스토리 29언어 패널(대량 선행 포함) | 52563eeb8 |
| 상태 불명 | `codex/character-basic-story-web-20261102` | `fdf5565e6` | 2026-11-02 | 690 | 3107 | godot(2176) "docs(1078) localization(398)  | 웹·Unity 선택 화면 검수와 인수 경계 | fdf5565e6 |
| 상태 불명 | `codex/demo-art-character-20261030` | `5e5ce45f2` | 2026-11-03 | 487 | 3176 | AE/Runtime(824) AE/Remodel(378) AE/Resources(343)  | v22 작업 인수·피부 보정 실험 판정 보존 | 5e5ce45f2 |
| 상태 불명 | `codex/dota-vfx-candidates-20261102` | `ba4ffd016` | 2026-11-02 | 691 | 3108 | godot(2176) "docs(1078) localization(398)  | 직접 플레이 가능한 이펙트 테스트베드 | ba4ffd016 |
| 상태 불명 | `codex/fdg-intro-materials-20261101` | `38f0ea6be` | 2026-11-01 | 648 | 3076 | godot(2176) "docs(1006) localization(398)  | FDG 인트로 재질 스터디 | 38f0ea6be |
| 상태 불명 | `codex/h5-web-delivery-20261101` | `e5bad4d07` | 2026-11-03 | 677 | 3105 | godot(2176) "docs(1112) localization(398)  | 웹 첫 렌더 감사 타이밍 | e5bad4d07 |
| 상태 불명 | `codex/killu-bloodtears-v3-20261027` | `2ad3300b4` | 2026-10-27 | 62 | 2566 | godot(2176) "bgm(142) "docs(87)  | Killu 피눈물 v3 웹 런타임 배포(main 계통) | 2ad3300b4 |
| 상태 불명 | `codex/mac-facing-ground-qa-20261101` | `66da456c4` | 2026-11-01 | 667 | 3339 | AE/Resources(1524) AE/Runtime(1279) docs/engine(577)  | holy dome 메시 격리 판정 기록 | 66da456c4 |
| 상태 불명 | `codex/mac-ground-bounded-qa-20261102` | `d01389fd2` | 2026-11-02 | 848 | 3498 | AE/Resources(2483) AE/Runtime(1660) docs/engine(809)  | Mac 프로파일 가드 복구·다음 GPU QA 계약 기록 | d01389fd2 |
| 상태 불명 | `codex/mac-ground-decal-receiver-20261101` | `71135bf70` | 2026-11-01 | 663 | 3335 | AE/Resources(1396) AE/Runtime(1256) docs/engine(566)  | A2 투영기 GPU 비교(한정) | 71135bf70 |
| 상태 불명 | `codex/mac-ground-placement-qa-20261102` | `a5d174da8` | 2026-11-02 | 839 | 3489 | AE/Resources(2480) AE/Runtime(1644) docs/engine(795)  | producer phase 설치 가능·렌더 상태 단언 | a5d174da8 |
| 상태 불명 | `codex/mac-ground-receiver-smoke-20261102` | `5489db697` | 2026-11-03 | 876 | 3523 | AE/Resources(2500) AE/Runtime(1684) docs/engine(909)  | Win64 좌표 빌드·정확 배달 패키지 기록 | 5489db697 |
| 상태 불명 | `codex/mac-patchnotes-button-20261029` | `7229e2687` | 2026-10-29 | 466 | 3156 | AE/Runtime(799) AE/Remodel(368) AE/Resources(342)  | Settings QA 의도치 않은 저장 경계 기록 | 7229e2687 |
| 상태 불명 | `codex/mac-walk-four-frame-repack-20261102` | `350034aa7` | 2026-11-02 | 829 | 3479 | AE/Resources(2474) AE/Runtime(1635) docs/engine(790)  | walk 4프레임 재포장 + Web3D 무손실 파생 | 350034aa7 |
| 상태 불명 | `codex/mcp-api-team-20261031` | `6299db9aa` | 2026-11-03 | 675 | 3097 | godot(2176) "docs(1045) localization(398)  | Meshy/Tripo 포함 MCP·API 팀 후보(chest shader 준비) | 6299db9aa |
| 상태 불명 | `codex/pc-blender-env-r3-20261030` | `b9ffca060` | 2026-10-30 | 514 | 3202 | AE/Runtime(939) AE/Resources(852) AE/Remodel(378)  | 나무다리 R3 환경 키트(Blender 스캔 기반) 직접 검수 보존 | b9ffca060 |
| 상태 불명 | `codex/pc-boss-druid-20261030` | `bbc6d128d` | 2026-10-31 | 621 | 3290 | AE/Runtime(1143) AE/Resources(775) docs/engine(509)  | 드루이드 12초 비교 자료·부분 인수 경계 | bbc6d128d |
| 상태 불명 | `codex/pc-character-heroes-20261028` | `f8ce091b9` | 2026-11-02 | 304 | 3045 | AE/Runtime(643) AE/Remodel(320) docs/engine(193)  | 판정 기록을 못 찾음. 제목: docs(character): 결함 확대판 포함 최종 검토 수량 동기화 | f8ce091b9 |
| 상태 불명 | `codex/pc-charselect-stage-20261030` | `fd500567e` | 2026-10-30 | 499 | 3188 | AE/Runtime(897) AE/Resources(751) AE/Remodel(378)  | 캐릭터 선택 무대 후면 깊이 마감 인계 | fd500567e |
| 상태 불명 | `codex/pc-design-boss-quality-review-20261029` | `43e4eb269` | 2026-10-29 | 504 | 2965 | godot(2176) "docs(606) docs/engine(174)  | 보스 품질 검수 · 패치노트 접근 복구 | 43e4eb269 |
| 상태 불명 | `codex/pc-design-stat-summary-20261028` | `79f8c34b7` | 2026-10-28 | 470 | 2934 | godot(2176) "docs(565) docs/engine(153)  | 스탯 요약 디자인 | 79f8c34b7 |
| 상태 불명 | `codex/pc-design-title-motion-20261028` | `79c1ad392` | 2026-10-28 | 437 | 2914 | godot(2176) "docs(533) "bgm(142)  | 타이틀 모션 디자인(main 병합 포함) | 79c1ad392 |
| 상태 불명 | `codex/pc-devtools-tools-20261028` | `94b8e6590` | 2026-10-28 | 305 | 3046 | AE/Runtime(643) AE/Remodel(320) docs/engine(192)  | 판정 기록을 못 찾음. 제목: fix(devtools): constrain manual worktree removal to verified cache cas | 94b8e6590 |
| 상태 불명 | `codex/pc-facing-only-delivery-20261101` | `b3f807266` | 2026-11-01 | 662 | 3334 | AE/Resources(1524) AE/Runtime(1267) docs/engine(569)  | 몬스터 방향 수정만 분리 | b3f807266 |
| 상태 불명 | `codex/pc-impact-remaster-20261031` | `d58f7663a` | 2026-11-03 | 10 | 8 | AE/Runtime(21) "docs(8) Tools/impact-feedback/Program.cs(3)  | 투사체 가독성 관문 완료 기록(지면 AoE P0 전) | d58f7663a |
| 상태 불명 | `codex/pc-latest-desktop-20261031` | `70d8f98be` | 2026-10-31 | 677 | 3340 | AE/Resources(1401) AE/Runtime(1272) docs/engine(576)  | 최신 공통+A2 바탕화면 검증 후보 보존 | 70d8f98be |
| 상태 불명 | `codex/pc-malice-orb-fix-20261030` | `f78f5f6cb` | 2026-10-31 | 654 | 3323 | AE/Runtime(1311) AE/Resources(809) docs/engine(629)  | 드루이드 사용자 답변·콜백 관측 미검증 범위 | f78f5f6cb |
| 상태 불명 | `codex/pc-mobility-hud-20261101` | `5023fe192` | 2026-11-01 | 668 | 3339 | AE/Resources(1524) AE/Runtime(1275) docs/engine(575)  | 방향·장판 후보 최종 컴파일·사용자 실행 보존 경계 | 5023fe192 |
| 상태 불명 | `codex/pc-runner-batchlog-fix-20261029` | `898f229e4` | 2026-10-29 | 464 | 3154 | AE/Runtime(793) AE/Remodel(368) AE/Resources(341)  | 판정 기록을 못 찾음. 제목: fix: preserve Unity batch run receipt when log is unreadable | 898f229e4 |
| 상태 불명 | `codex/pc-sound-takeover-20261028` | `d9edf9bd8` | 2026-10-31 | 325 | 3059 | AE/Runtime(694) AE/Resources(330) AE/Remodel(320)  | 승인 ui_tab 원본·Unity 누락 연결 manifest 전달 — Runtime 미적용 | d9edf9bd8 제목 |
| 상태 불명 | `codex/pc-sprites11-art-20261103` | `12abca4f4` | 2026-11-03 | 781 | 3436 | AE/Resources(2054) AE/Runtime(1524) art-review(810)  | 드루이드 LOCK 부분 retouch 복구 입력 보존 | 12abca4f4 |
| 상태 불명 | `codex/pc-title-silver-menu-20261030` | `d22ce8bd1` | 2026-10-30 | 518 | 2979 | godot(2176) "docs(631) docs/engine(175)  | 타이틀 메뉴 은빛 헤어라인 교체 | d22ce8bd1 |
| 상태 불명 | `codex/pc-unity-keyshot-final-20261030` | `47e519f41` | 2026-10-30 | 496 | 3185 | AE/Runtime(860) AE/Remodel(378) AE/Resources(373)  | 보스 바닥 잔점 제거·돌 노멀 | 47e519f41 |
| 상태 불명 | `codex/pc-unity-steam-keyshot-20261030` | `d19847702` | 2026-11-01 | 755 | 3413 | AE/Resources(2048) AE/Runtime(1466) docs/engine(679)  | A2 지면 두 셰이더 DBuffer 수신 후보(지면 데칼 QA 체인의 선행) | d19847702 |
| 상태 불명 | `codex/pc-unity-ui-assets-20261030` | `38edf98a4` | 2026-10-31 | 626 | 3298 | AE/Runtime(1164) AE/Resources(796) docs/engine(527)  | 전 화면 16:9 안전영역·초광폭 실측 검수 | 38edf98a4 |
| 상태 불명 | `codex/silver-r2-preview-20261103` | `05a7d2bf8` | 2026-11-03 | 765 | 3162 | godot(2176) "docs(1167) assets(447)  | 실버 R2 미리보기 guard 행 수 | 05a7d2bf8 |
| 상태 불명 | `codex/subscription-credit-policy-20261030-0937-remote` | `6a42b6d17` | 2026-10-30 | 518 | 2979 | godot(2176) "docs(631) docs/engine(175)  | 기간별 구독 크레딧 관리 정책 문서 | 6a42b6d17 |
| 상태 불명 | `codex/ui-resume-player-20261026` | `da0260454` | 2026-10-27 | 10 | 2808 | docs/engine(23) AE/Runtime(1)  | UI 카피 검토 인계 후보 문서 | da0260454 |
| 상태 불명 | `codex/unity-currency-name-20261031` | `3333f9931` | 2026-10-31 | 618 | 3291 | AE/Runtime(1145) AE/Resources(788) docs/engine(513)  | 악의 오브 명칭·4단계 원화·획득 연출 | 3333f9931 |
| 상태 불명 | `codex/unity-ground-placement-20261102` | `32d41c0ec` | 2026-11-03 | 6 | 5 | docs/engine(8) AE/Runtime(6) Tools/skill-ui-tests/HeaderLayoutProgram. | 캘리브레이션 매트릭스 격리 테스트 | 32d41c0ec |
| 상태 불명 | `codex/unity-hellgate-world-capture-20261103` | `12dd66948` | 2026-11-03 | 1 | 1 | AE/Runtime(2) docs/engine(1) docs/CHANGELOG_SYNC.md(1)  | Hell Gate 필드 프레임 캡처 수정 | 12dd66948 |
| 상태 불명 | `codex/unity-lobby-uisound-20261102` | `131887780` | 2026-11-02 | 854 | 3504 | AE/Resources(2785) AE/Runtime(1723) docs/engine(819)  | 로비 오디오 플레이어·버퍼 검증 | 131887780 |
| 상태 불명 | `codex/unity-mac-20261024` | `ff311bce3` | 2026-10-27 | 23 | 2859 | docs/engine(60) AE/Runtime(28) docs/CHANGELOG_SYNC.md(16)  | INBOX 알림(main bgm NFD 중복 71개 삭제) 등 10-27 이전 Mac 줄기 | ff311bce3 |
| 상태 불명 | `codex/web-character-unlimited-20261101` | `5852b5deb` | 2026-11-01 | 649 | 3077 | godot(2176) "docs(1008) localization(398)  | 웹 로비 캐릭터 슬롯 제한 제거 | 5852b5deb |
| 상태 불명 | `codex/web-fx-trial-20261031` | `d9c8d482c` | 2026-10-31 | 531 | 2992 | godot(2176) "docs(650) docs/engine(203)  | H5 효과 시험(선택 조명·후처리) | d9c8d482c |
| 상태 불명 | `codex/web3d-trial-20261031` | `832095ae8` | 2026-11-03 | 778 | 3173 | godot(2176) "docs(1192) assets(428)  | Web3D 시험·R9 배달 | 832095ae8 |
| 상태 불명 | `codex/wini-short-anime-storyboard-20261102` | `2fd7a09e8` | 2026-11-02 | 692 | 3108 | godot(2176) "docs(1081) localization(398)  | 위니 단편 애니 180초 24쇼트 콘티 초안 | 2fd7a09e8 |

## 3. 다른 브랜치에 흡수됨 (164개)

| 브랜치 | SHA | 날짜 | ahead | 흡수한 끝점(최대 2) |
|---|---|---|---|---|
| `claude/festive-darwin-jrf8hy` | `81fdafbb2` | 2026-11-03 | 782 | `claude/trusting-maxwell-q00is3` |
| `claude/unity-cloud-a2r-nre-fix-20261104` | `8a5740a22` | 2026-11-04 | 47 | `claude/unity-cloud-boss-hp-drop-20261104`, `codex/unity-boss-all-20261105` |
| `claude/unity-cloud-druid-silhouette-20261104` | `a1f7d925a` | 2026-11-04 | 141 | `claude/unity-cloud-boss-hp-drop-20261104`, `codex/unity-boss-all-20261105` |
| `claude/unity-integration-preview6-20261104` | `6229288c0` | 2026-11-04 | 140 | `claude/unity-cloud-boss-hp-drop-20261104`, `codex/unity-boss-all-20261105` |
| `claude/unity-pc-a15-rangestep-20261028` | `2ac579319` | 2026-10-28 | 281 | `codex/backup-hd2d-input-20261031T083218329Z`, `codex/character-basic-story-unity-20261102` |
| `claude/unity-pc-a16-20261026` | `24c20a94a` | 2026-10-26 | 0 | `claude/unity-pc-c04-oracle-20261027`, `claude/unity-pc-devtools-buildloop3-20261028` |
| `claude/unity-pc-a18-20261027` | `2f0538418` | 2026-10-28 | 183 | `claude/unity-pc-devtools-buildloop3-20261028`, `claude/unity-pc-devtools-codex-20261028` |
| `claude/unity-pc-a2r-route-20261104` | `2308e2111` | 2026-11-04 | 45 | `claude/unity-cloud-boss-hp-drop-20261104`, `codex/unity-boss-all-20261105` |
| `claude/unity-pc-b07-20261026` | `09f56d877` | 2026-10-27 | 1 | `claude/unity-pc-c04-oracle-20261027`, `claude/unity-pc-devtools-buildloop3-20261028` |
| `claude/unity-pc-c01-20261026` | `6496a5660` | 2026-10-27 | 9 | `claude/unity-pc-devtools-buildloop3-20261028`, `claude/unity-pc-devtools-codex-20261028` |
| `claude/unity-pc-c01-asmdef-20261028` | `2c4cc7245` | 2026-10-28 | 307 | `codex/backup-hd2d-input-20261031T083218329Z`, `codex/character-basic-story-unity-20261102` |
| `claude/unity-pc-camclamp-20261028` | `f5a0cbb82` | 2026-10-28 | 159 | `claude/unity-pc-devtools-buildloop3-20261028`, `claude/unity-pc-devtools-codex-20261028` |
| `claude/unity-pc-candidate-combo2-20261104` | `f40103024` | 2026-11-04 | 2 | `claude/unity-pc-candidate-combo4-20261104` |
| `claude/unity-pc-candidate-combo3-20261104` | `856d4eaa5` | 2026-11-04 | 8 | `claude/unity-pc-candidate-combo4-20261104` |
| `claude/unity-pc-dash-hit-20261028` | `c4136ea8e` | 2026-10-28 | 296 | `claude/unity-pc-devtools-codex-20261028`, `codex/backup-hd2d-input-20261031T083218329Z` |
| `claude/unity-pc-dbt5-20261028` | `959aa5d3a` | 2026-10-28 | 248 | `claude/unity-pc-devtools-buildloop3-20261028`, `claude/unity-pc-devtools-codex-20261028` |
| `claude/unity-pc-devtools-buildloop-20261028` | `be5c4264c` | 2026-10-28 | 245 | `claude/unity-pc-devtools-buildloop3-20261028`, `claude/unity-pc-devtools-codex-20261028` |
| `claude/unity-pc-devtools-buildloop2-20261028` | `0c8101c37` | 2026-10-28 | 280 | `claude/unity-pc-devtools-buildloop3-20261028` |
| `claude/unity-pc-devtools-lookdev-20261028` | `3ef2607ac` | 2026-10-28 | 252 | `claude/unity-pc-devtools-buildloop3-20261028`, `claude/unity-pc-devtools-codex-20261028` |
| `claude/unity-pc-devtools-maplint-20261028` | `9a96d08bd` | 2026-10-28 | 253 | `claude/unity-pc-devtools-buildloop3-20261028`, `claude/unity-pc-devtools-codex-20261028` |
| `claude/unity-pc-devtools-runner-20261028` | `36448bdb9` | 2026-10-28 | 256 | `claude/unity-pc-devtools-buildloop3-20261028`, `claude/unity-pc-devtools-codex-20261028` |
| `claude/unity-pc-devtools-runner2-20261028` | `2aa218bcd` | 2026-10-28 | 283 | `codex/backup-hd2d-input-20261031T083218329Z`, `codex/character-basic-story-unity-20261102` |
| `claude/unity-pc-devtools-web-20261028` | `f564c7b8b` | 2026-10-28 | 238 | `claude/unity-pc-devtools-web-introdiag-20261028` |
| `claude/unity-pc-forge-a14-20261026` | `c334bb0f6` | 2026-10-26 | 0 | `claude/unity-pc-c04-oracle-20261027`, `claude/unity-pc-devtools-buildloop3-20261028` |
| `claude/unity-pc-holydome-webparity-20261028` | `e505a211e` | 2026-10-28 | 301 | `codex/backup-hd2d-input-20261031T083218329Z`, `codex/character-basic-story-unity-20261102` |
| `claude/unity-pc-hud-webgpu-20261028` | `a56a40d0d` | 2026-10-28 | 284 | `codex/backup-hd2d-input-20261031T083218329Z`, `codex/character-basic-story-unity-20261102` |
| `claude/unity-pc-intro-skip-20261028` | `65e14f1bb` | 2026-10-28 | 295 | `claude/unity-pc-devtools-codex-20261028`, `claude/unity-pc-devtools-web-introdiag-20261028` |
| `claude/unity-pc-inventory-u04-20261026` | `a48faf9ea` | 2026-10-26 | 0 | `claude/unity-pc-c04-oracle-20261027`, `claude/unity-pc-devtools-buildloop3-20261028` |
| `claude/unity-pc-lt34-20261028` | `9b1847712` | 2026-10-28 | 286 | `codex/backup-hd2d-input-20261031T083218329Z`, `codex/character-basic-story-unity-20261102` |
| `claude/unity-pc-lt5-areakills-20261028` | `5248f5e73` | 2026-10-28 | 284 | `claude/unity-pc-devtools-codex-20261028`, `claude/unity-pc-devtools-web-introdiag-20261028` |
| `claude/unity-pc-m1-fixedmobs-20261027` | `6ec0b3cb1` | 2026-10-28 | 141 | `claude/unity-pc-devtools-buildloop3-20261028`, `claude/unity-pc-devtools-codex-20261028` |
| `claude/unity-pc-m1-hud-20261028` | `1a7c96946` | 2026-10-28 | 223 | `claude/unity-pc-devtools-buildloop3-20261028`, `claude/unity-pc-devtools-codex-20261028` |
| `claude/unity-pc-m1-region-20261028` | `f64f85c17` | 2026-10-28 | 208 | `claude/unity-pc-devtools-buildloop3-20261028`, `claude/unity-pc-devtools-codex-20261028` |
| `claude/unity-pc-o1-killtail-20261028` | `938394077` | 2026-10-28 | 233 | `claude/unity-pc-devtools-buildloop3-20261028`, `claude/unity-pc-devtools-codex-20261028` |
| `claude/unity-pc-oracle-spawn-20261028` | `145da66ba` | 2026-10-28 | 171 | `claude/unity-pc-devtools-buildloop3-20261028`, `claude/unity-pc-devtools-codex-20261028` |
| `claude/unity-pc-overlays-20261026` | `98ed00497` | 2026-10-26 | 0 | `claude/unity-pc-c04-oracle-20261027`, `claude/unity-pc-devtools-buildloop3-20261028` |
| `claude/unity-pc-parry-reflect-20261028` | `b3993c2a1` | 2026-10-28 | 155 | `claude/unity-pc-devtools-buildloop3-20261028`, `claude/unity-pc-devtools-codex-20261028` |
| `claude/unity-pc-rm-int-20261028` | `f1af4da10` | 2026-10-28 | 305 | `codex/backup-hd2d-input-20261031T083218329Z`, `codex/character-basic-story-unity-20261102` |
| `claude/unity-pc-rm1-20261027` | `8eed73a6b` | 2026-10-28 | 217 | `codex/backup-hd2d-input-20261031T083218329Z`, `codex/character-basic-story-unity-20261102` |
| `claude/unity-pc-rm2-20261028` | `3317e7f30` | 2026-10-28 | 182 | `codex/backup-hd2d-input-20261031T083218329Z`, `codex/character-basic-story-unity-20261102` |
| `claude/unity-pc-rm3-20261028` | `08ef231b1` | 2026-10-28 | 207 | `codex/backup-hd2d-input-20261031T083218329Z`, `codex/character-basic-story-unity-20261102` |
| `claude/unity-pc-rm4-20261028` | `ef2536291` | 2026-10-28 | 184 | `codex/backup-hd2d-input-20261031T083218329Z`, `codex/character-basic-story-unity-20261102` |
| `claude/unity-pc-rmb0-20261028` | `cac9c1c89` | 2026-10-28 | 179 | `claude/unity-pc-devtools-buildloop3-20261028`, `claude/unity-pc-devtools-codex-20261028` |
| `claude/unity-pc-rmb0b-20261028` | `e898331df` | 2026-10-28 | 196 | `claude/unity-pc-devtools-buildloop3-20261028`, `claude/unity-pc-devtools-codex-20261028` |
| `claude/unity-pc-rmb1-20261027` | `00353dda9` | 2026-10-28 | 281 | `codex/backup-hd2d-input-20261031T083218329Z`, `codex/character-basic-story-unity-20261102` |
| `claude/unity-pc-sound-rm1-20261027` | `acf2fb948` | 2026-10-28 | 322 | `codex/backup-hd2d-input-20261031T083218329Z`, `codex/character-basic-story-unity-20261102` |
| `claude/unity-pc-stat-parity-20261026` | `1c270003a` | 2026-10-26 | 0 | `claude/unity-pc-c04-oracle-20261027`, `claude/unity-pc-devtools-buildloop3-20261028` |
| `claude/unity-pc-title-menu-20261028` | `5aa1cddb0` | 2026-10-28 | 300 | `claude/unity-pc-devtools-codex-20261028`, `codex/backup-hd2d-input-20261031T083218329Z` |
| `claude/unity-pc-vfx-angler-water-impl-20261104` | `0409212b9` | 2026-11-04 | 3 | `claude/unity-cloud-vfx-angler-combine-20261104` |
| `claude/unity-pc-vfx-arena-occlusion-20261104` | `b54b5e01e` | 2026-11-04 | 1 | `claude/unity-cloud-boss-hp-drop-20261104`, `codex/unity-boss-all-20261105` |
| `claude/unity-pc-vfx-d18-20261028` | `9c7c7c29e` | 2026-10-28 | 281 | `claude/unity-pc-devtools-codex-20261028`, `claude/unity-pc-devtools-web-introdiag-20261028` |
| `claude/unity-pc-vfx-druid-slam-20261104` | `38236aa61` | 2026-11-04 | 48 | `codex/unity-druid-vfx5-20261104` |
| `claude/unity-pc-vfx-poison-20261028` | `c1f8f769b` | 2026-10-28 | 227 | `codex/backup-hd2d-input-20261031T083218329Z`, `codex/character-basic-story-unity-20261102` |
| `claude/unity-pc-vfx-rm1-20261027` | `d5943d1c4` | 2026-10-28 | 151 | `codex/backup-hd2d-input-20261031T083218329Z`, `codex/character-basic-story-unity-20261102` |
| `claude/unity-pc-vfx-shared-render-20261028` | `0ebc103c0` | 2026-10-28 | 130 | `claude/unity-pc-devtools-buildloop3-20261028`, `claude/unity-pc-devtools-codex-20261028` |
| `claude/unity-pc-win-parity-20261026` | `27d766dae` | 2026-10-26 | 0 | `claude/unity-pc-c04-oracle-20261027`, `claude/unity-pc-devtools-buildloop3-20261028` |
| `claude/unity-port-master-20261026` | `1770c2698` | 2026-10-26 | 0 | `claude/trusting-maxwell-q00is3`, `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` |
| `claude/unity-rm0-engine-20261027` | `dc929d682` | 2026-10-28 | 303 | `codex/backup-hd2d-input-20261031T083218329Z`, `codex/character-basic-story-unity-20261102` |
| `codex/backup-20261101-161140682-approved-magic-spears-clean` | `2b815ac93` | 2026-11-02 | 652 | `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` |
| `codex/backup-20261101-235912349-hairstyle-fullbody-sets` | `d95ade431` | 2026-11-02 | 653 | `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` |
| `codex/backup-20261102-001939415-approved-asymmetric-hair` | `4ad3f1bba` | 2026-11-02 | 654 | `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` |
| `codex/backup-20261102-002915089-woni-liv-face-review` | `90bd351cb` | 2026-11-02 | 655 | `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` |
| `codex/backup-20261102-010611838-neutral-front-review` | `007e4e1b6` | 2026-11-02 | 656 | `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` |
| `codex/backup-20261102-011417920-independent-face-studies` | `7c9942196` | 2026-11-02 | 657 | `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` |
| `codex/backup-20261102-012620867-portrait-fullbody-review` | `c617efb2c` | 2026-11-02 | 658 | `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` |
| `codex/backup-20261102-015030791-locked-faces-gameprep` | `e6835fe69` | 2026-11-02 | 659 | `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` |
| `codex/backup-20261102-020546959-purple-sidebraid-preview` | `b1bb8d1ee` | 2026-11-02 | 660 | `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` |
| `codex/backup-20261102-022826066-athletic-heroes-hair-selection` | `2b9a4c87a` | 2026-11-02 | 661 | `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` |
| `codex/backup-20261102-050236902-lean-blue-charselect-source` | `8bef99f6b` | 2026-11-02 | 662 | `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` |
| `codex/backup-20261102-053455724-female-heroes-v22-rigged-walk-run` | `0e7682db8` | 2026-11-02 | 663 | `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` |
| `codex/backup-20261102-060312792-v22-preview-serving-repair` | `aee416408` | 2026-11-02 | 664 | `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` |
| `codex/boss-docs-20261029` | `9a2cda861` | 2026-10-29 | 503 | `claude/trusting-maxwell-q00is3`, `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` |
| `codex/cto-quality-standard-20261029` | `77e92a44e` | 2026-10-29 | 490 | `claude/trusting-maxwell-q00is3`, `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` |
| `codex/cto-storage-policy-20261029` | `33bf18603` | 2026-10-29 | 494 | `claude/trusting-maxwell-q00is3`, `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` |
| `codex/docs-character-capacity-mac-20261101` | `512307fee` | 2026-11-01 | 650 | `claude/trusting-maxwell-q00is3`, `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` |
| `codex/docs-ground-placement-20261102` | `374e75f71` | 2026-11-03 | 762 | `claude/trusting-maxwell-q00is3`, `codex/silver-r2-preview-20261103` |
| `codex/docs-rigpixel-20261103` | `24f197bf7` | 2026-11-03 | 775 | `claude/trusting-maxwell-q00is3` |
| `codex/h5-title-wide-framing-20261029` | `866887a50` | 2026-10-29 | 508 | `claude/trusting-maxwell-q00is3`, `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` |
| `codex/h5-web-unity-sync-20261101` | `228564360` | 2026-11-01 | 635 | `claude/trusting-maxwell-q00is3`, `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` |
| `codex/mac-character-capacity-qa-20261101` | `907083b7c` | 2026-11-01 | 666 | `codex/character-basic-story-unity-20261102`, `codex/mac-decal-noeffect-regression-20261102` |
| `codex/mac-current-decal-receiver-20261102` | `1403c5ee6` | 2026-11-02 | 836 | `codex/character-basic-story-unity-20261102`, `codex/mac-decal-noeffect-regression-20261102` |
| `codex/mac-facing-only-delivery-20261102` | `e3b24ac5d` | 2026-11-02 | 671 | `codex/character-basic-story-unity-20261102`, `codex/mac-decal-noeffect-regression-20261102` |
| `codex/mac-ground-placement-verified-20261102` | `0fe68452b` | 2026-11-02 | 839 | `codex/mac-ground-alpha-20261102` |
| `codex/mac-ground-win-candidate-20261102` | `80d0ae89c` | 2026-11-02 | 867 | `codex/mac-ground-receiver-smoke-20261102` |
| `codex/mac-loading-art-overlay-20261101` | `c3362d2df` | 2026-11-01 | 661 | `codex/character-basic-story-unity-20261102`, `codex/mac-decal-noeffect-regression-20261102` |
| `codex/mac-stag-southwest-delivery-20261102` | `6ad8b809c` | 2026-11-02 | 833 | `codex/character-basic-story-unity-20261102`, `codex/mac-decal-noeffect-regression-20261102` |
| `codex/mac-west-walk-source-repair-20261102` | `a7c2913a7` | 2026-11-02 | 825 | `codex/character-basic-story-unity-20261102`, `codex/mac-decal-noeffect-regression-20261102` |
| `codex/main-docs-cleanup-20261104` | `b94c8fbff` | 2026-11-04 | 812 | 끝점 없음(main 등 비끝점이 포함) |
| `codex/nrftw-reference-20261031` | `75213b501` | 2026-10-31 | 529 | `claude/trusting-maxwell-q00is3`, `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` |
| `codex/pc-blender-env-20261030` | `4c2797c7f` | 2026-10-30 | 515 | `codex/character-basic-story-unity-20261102`, `codex/mac-decal-noeffect-regression-20261102` |
| `codex/pc-custom-c02b-20261028` | `b953a4c05` | 2026-10-29 | 315 | `codex/backup-hd2d-input-20261031T083218329Z`, `codex/character-basic-story-unity-20261102` |
| `codex/pc-design-boss-review-20261029` | `5801b65ed` | 2026-10-29 | 476 | `claude/trusting-maxwell-q00is3`, `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` |
| `codex/pc-design-druid-gaunt-20261029` | `5d0d4d44a` | 2026-10-29 | 478 | `claude/trusting-maxwell-q00is3`, `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` |
| `codex/pc-design-growth-review-20261028` | `2b9cb3bf8` | 2026-10-28 | 462 | `claude/trusting-maxwell-q00is3`, `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` |
| `codex/pc-design-intro-tone-20261028` | `408c7cde9` | 2026-10-28 | 464 | `claude/trusting-maxwell-q00is3`, `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` |
| `codex/pc-design-sigil-review-20261028` | `1b9fb0836` | 2026-10-28 | 470 | `claude/trusting-maxwell-q00is3`, `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` |
| `codex/pc-hd2d-map-r5-stage1-integration-20261031` | `b673cb3f7` | 2026-10-31 | 650 | `codex/character-basic-story-unity-20261102`, `codex/mac-decal-noeffect-regression-20261102` |
| `codex/pc-hd2d-stage1-pure-integration-20261031` | `842bae975` | 2026-10-31 | 639 | `codex/pc-sprites11-art-20261103` |
| `codex/pc-hd2d-trial-20261031` | `5b45b6a48` | 2026-11-01 | 774 | `codex/pc-sprites11-art-20261103` |
| `codex/pc-hero-docs-20261030` | `fc9b6290d` | 2026-10-31 | 530 | `claude/trusting-maxwell-q00is3`, `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` |
| `codex/pc-hero-quality-20261030` | `15c8ed3c5` | 2026-10-31 | 617 | `codex/backup-hd2d-input-20261031T083218329Z`, `codex/character-basic-story-unity-20261102` |
| `codex/pc-latest-test-qa-20261028` | `13e522a62` | 2026-10-28 | 467 | `claude/trusting-maxwell-q00is3`, `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` |
| `codex/pc-map-arena-20261028` | `2f2e8bc9b` | 2026-10-28 | 302 | `codex/backup-hd2d-input-20261031T083218329Z`, `codex/character-basic-story-unity-20261102` |
| `codex/pc-playtest-fix-20261030` | `118a9421a` | 2026-10-31 | 638 | `codex/character-basic-story-unity-20261102`, `codex/mac-decal-noeffect-regression-20261102` |
| `codex/pc-playtest-handoff-20261030` | `afcb02ba3` | 2026-10-31 | 601 | `claude/trusting-maxwell-q00is3`, `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` |
| `codex/pc-preview-all-20261029` | `11d0fc5d0` | 2026-10-29 | 455 | `codex/backup-hd2d-input-20261031T083218329Z`, `codex/character-basic-story-unity-20261102` |
| `codex/pc-runner-storage-fix-20261029` | `fe1bc518f` | 2026-10-29 | 463 | `codex/pc-runner-batchlog-fix-20261029` |
| `codex/pc-sprites11-docs-20261103` | `e0e6716c2` | 2026-11-03 | 765 | `claude/trusting-maxwell-q00is3`, `codex/web3d-trial-20261031` |
| `codex/pc-stag-southwest-source-repair-20261102` | `6d5e08466` | 2026-11-02 | 829 | `codex/character-basic-story-unity-20261102`, `codex/mac-decal-noeffect-regression-20261102` |
| `codex/pc-story-ch4-spine-20261028` | `1f72c85b6` | 2026-10-28 | 457 | `claude/trusting-maxwell-q00is3`, `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` |
| `codex/pc-ui-sound-match-20261031` | `19c6ccec8` | 2026-10-31 | 649 | `codex/character-basic-story-unity-20261102`, `codex/mac-decal-noeffect-regression-20261102` |
| `codex/pc-ui-title-delivery-docs-20261030` | `18aef1218` | 2026-10-30 | 518 | `claude/trusting-maxwell-q00is3`, `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` |
| `codex/pc-ui-ultrawide-20261031` | `8bcc1964d` | 2026-11-02 | 820 | `codex/character-basic-story-unity-20261102`, `codex/mac-decal-noeffect-regression-20261102` |
| `codex/pc-unity-integrator-merge-20261028` | `34bae665b` | 2026-10-28 | 313 | `codex/backup-hd2d-input-20261031T083218329Z`, `codex/character-basic-story-unity-20261102` |
| `codex/pc-unity-mcp-20261030` | `b9491cf58` | 2026-10-31 | 608 | `codex/backup-hd2d-input-20261031T083218329Z`, `codex/character-basic-story-unity-20261102` |
| `codex/pc-unity-visual-handoff-20261029` | `07334c9a3` | 2026-10-30 | 513 | `claude/trusting-maxwell-q00is3`, `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` |
| `codex/pc-unity-visual-ntfs-20261029` | `1bde3f7c9` | 2026-10-30 | 488 | `codex/character-basic-story-unity-20261102`, `codex/mac-decal-noeffect-regression-20261102` |
| `codex/pc-unity-visual-webparity-20261029` | `2897a54bc` | 2026-10-29 | 464 | `codex/backup-hd2d-input-20261031T083218329Z`, `codex/character-basic-story-unity-20261102` |
| `codex/pc-vfx-rm1-int-20261028` | `919fd0597` | 2026-10-28 | 314 | `codex/backup-hd2d-input-20261031T083218329Z`, `codex/character-basic-story-unity-20261102` |
| `codex/project-work-manual-20261029` | `057f6f4b7` | 2026-10-30 | 517 | `claude/trusting-maxwell-q00is3`, `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` |
| `codex/unity-asset-receipt-triage-20261105` | `be138919f` | 2026-11-05 | 4 | `codex/unity-asset-receipt-sync-20261105` |
| `codex/unity-boss-abc-20261105` | `15fde55a3` | 2026-11-05 | 154 | `codex/unity-boss-all-20261105` |
| `codex/unity-boss-ac-20261104` | `24fe03612` | 2026-11-05 | 150 | `codex/unity-boss-all-20261105` |
| `codex/unity-boss-arena-20261103` | `1fa74ff82` | 2026-11-04 | 42 | `claude/unity-cloud-boss-hp-drop-20261104`, `codex/unity-boss-all-20261105` |
| `codex/unity-boss-b1-moveset-20261105` | `99fb99b0a` | 2026-11-05 | 148 | `codex/unity-boss-all-20261105` |
| `codex/unity-boss-b2-botdeath-20261105` | `1c5ebace1` | 2026-11-05 | 147 | `codex/unity-boss-all-20261105` |
| `codex/unity-boss-b2r-20261105` | `ee87ed7a5` | 2026-11-05 | 148 | `codex/unity-boss-all-20261105` |
| `codex/unity-boss-base-20261104` | `7445707be` | 2026-11-05 | 146 | `claude/unity-cloud-boss-hp-drop-20261104`, `codex/unity-boss-all-20261105` |
| `codex/unity-boss-fix-a-20261104` | `814cadaa8` | 2026-11-05 | 147 | `codex/unity-boss-all-20261105` |
| `codex/unity-boss-fix-b-20261104` | `ed96b68a1` | 2026-11-05 | 148 | `codex/unity-boss-all-20261105` |
| `codex/unity-boss-fix-c-20261104` | `0f6599378` | 2026-11-05 | 147 | `codex/unity-boss-all-20261105` |
| `codex/unity-character-capacity-20261101` | `a9ddfbffc` | 2026-11-01 | 663 | `codex/character-basic-story-unity-20261102`, `codex/mac-decal-noeffect-regression-20261102` |
| `codex/unity-enemy-rt-fallback-20261104` | `3dbfbf966` | 2026-11-04 | 37 | `claude/unity-cloud-boss-hp-drop-20261104`, `codex/unity-boss-all-20261105` |
| `codex/unity-i18n-4th-20261105` | `ad5419ba1` | 2026-11-05 | 14 | `codex/unity-i18n-5th-20261105` |
| `codex/unity-i18n-audit-20261104` | `b9ce9b848` | 2026-11-04 | 3 | `codex/unity-i18n-5th-20261105` |
| `codex/unity-i18n-code-20261104` | `b32cc046e` | 2026-11-04 | 1 | `codex/unity-i18n-5th-20261105` |
| `codex/unity-i18n-druid-text-20261104` | `11ce8abca` | 2026-11-04 | 41 | `claude/unity-cloud-boss-hp-drop-20261104`, `codex/unity-boss-all-20261105` |
| `codex/unity-i18n-merge-fill-20261104` | `da5720fea` | 2026-11-04 | 13 | `codex/unity-i18n-5th-20261105` |
| `codex/unity-mac-sync-20261028` | `7c2baaf00` | 2026-10-29 | 330 | `codex/backup-hd2d-input-20261031T083218329Z`, `codex/character-basic-story-unity-20261102` |
| `codex/unity-map-a2-20261103` | `d9e5a2742` | 2026-11-04 | 96 | `codex/unity-map-d5-20261104`, `codex/unity-map-keyshot-20261104` |
| `codex/unity-map-a2-smokeguard-20261104` | `499522244` | 2026-11-04 | 80 | `claude/unity-cloud-boss-hp-drop-20261104`, `codex/unity-boss-all-20261105` |
| `codex/unity-map-a2-veg3doff-20261104` | `a3fc13799` | 2026-11-04 | 67 | `claude/unity-integration-preview-20261104` |
| `codex/unity-map-boardsync-20261104` | `9b56680e8` | 2026-11-04 | 86 | `codex/unity-map-d5-20261104`, `codex/unity-map-keyshot-20261104` |
| `codex/unity-map-light-01-20261026` | `8fb4072db` | 2026-10-26 | 0 | 끝점 없음(main 등 비끝점이 포함) |
| `codex/unity-map-wind-20261104` | `319e7a815` | 2026-11-04 | 77 | `claude/unity-cloud-boss-hp-drop-20261104`, `claude/unity-integration-preview-20261104` |
| `codex/unity-moat-01-20261026` | `66d4fd860` | 2026-10-26 | 0 | 끝점 없음(main 등 비끝점이 포함) |
| `codex/unity-pet-01-20261026` | `ec6e7b0a9` | 2026-10-26 | 0 | 끝점 없음(main 등 비끝점이 포함) |
| `codex/unity-ui-overlap-burn-20261104` | `6c35279ee` | 2026-11-04 | 1 | `claude/unity-ui-overlap-merged-check-20261104` |
| `codex/unity-ui-overlap-burn2-20261104` | `99a785d7a` | 2026-11-04 | 1 | `claude/unity-ui-overlap-merged-check-20261104` |
| `codex/unity-vfx-audit-fix-20261104` | `6c66c7672` | 2026-11-04 | 1 | `claude/unity-cloud-vfx-angler-combine-20261104` |
| `codex/web-combat-feel-20261031` | `659327b5a` | 2026-10-31 | 589 | `claude/trusting-maxwell-q00is3`, `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` |
| `codex/web-currency-orb-20261031` | `233d562f6` | 2026-10-31 | 541 | `claude/trusting-maxwell-q00is3`, `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` |
| `codex/web-ddung-20261031` | `63b31bb3f` | 2026-10-31 | 615 | `claude/trusting-maxwell-q00is3`, `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` |
| `codex/web-intro-nodoor-20261031` | `b4b9b2f5b` | 2026-10-31 | 623 | `claude/trusting-maxwell-q00is3`, `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` |
| `codex/web-keyart-wide-20261031` | `5a31eb573` | 2026-11-02 | 726 | `claude/trusting-maxwell-q00is3`, `codex/silver-r2-preview-20261103` |
| `codex/web-loading-final35-20261031` | `f3086ea61` | 2026-10-31 | 573 | `claude/trusting-maxwell-q00is3`, `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` |
| `codex/web-loading-wide-20261031` | `baabceeae` | 2026-10-31 | 553 | `claude/trusting-maxwell-q00is3`, `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` |
| `codex/web-skill-window-20261031` | `9f5db2ac6` | 2026-10-31 | 540 | `claude/trusting-maxwell-q00is3`, `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` |
| `codex/web-skillwin-sockets-20261031` | `d59aadd60` | 2026-10-31 | 545 | `claude/trusting-maxwell-q00is3`, `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` |
| `codex/web-stat-window-20261031` | `521be1238` | 2026-10-31 | 537 | `claude/trusting-maxwell-q00is3`, `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` |
| `codex/web-transitions-20261102` | `740722e1a` | 2026-11-02 | 742 | `claude/trusting-maxwell-q00is3`, `codex/silver-r2-preview-20261103` |
| `codex/web-wide-anim-20261031` | `108980fb5` | 2026-10-31 | 632 | `claude/trusting-maxwell-q00is3`, `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` |
| `godot/main` | `607110d52` | 2026-10-27 | 1 | `claude/trusting-maxwell-q00is3`, `codex/backup-20261102-062551318-multiverse-modern-outfits-tripo-api` |
| `main` | `b94c8fbff` | 2026-11-04 | 812 | 끝점 없음(main 등 비끝점이 포함) |

## 4. 병합됨 (114개)

### 4-1. unity/main의 조상 (84)

`claude/docs-cleanup-20261103`, `claude/unity-cloud-crash-p1-fix-20261104`, `claude/unity-cloud-demo-integration-20261104`, `claude/unity-cloud-docsync3-20261104`, `claude/unity-cloud-oracle-triage-20261104`, `claude/unity-cloud-unmerged-inventory-20261105`, `claude/unity-cloud-white-disc-20261104`, `claude/unity-pc-boss-docs-20261103`, `claude/unity-pc-canmv-oracle-20261104`, `claude/unity-pc-classname-fit-20261104`, `claude/unity-pc-death-pbz-20261104`, `claude/unity-pc-demo-flavor-fix-20261104`, `claude/unity-pc-demo-flavor-merge-20261104`, `claude/unity-pc-dt3-docs-20261104`, `claude/unity-pc-du1-hunter-20261104`, `claude/unity-pc-du2-defense-20261104`, `claude/unity-pc-du3-resources-20261104`, `claude/unity-pc-enemy3d-30-20261104`, `claude/unity-pc-entry-lobby-20261104`, `claude/unity-pc-field-prepare-merge-20261104`, `claude/unity-pc-field-prepare-wait-20261104`, `claude/unity-pc-first-impression-tone-20261104`, `claude/unity-pc-g2-stats-20261104`, `claude/unity-pc-ground-proj-linear-20261104`, `claude/unity-pc-impact-review-fix-20261104`, `claude/unity-pc-inv-salvage-20261103-mac`, `claude/unity-pc-lobby-poster-20261104`, `claude/unity-pc-m1-09c-20261104`, `claude/unity-pc-mobility-ring-20261103`, `claude/unity-pc-options-wave1-20261104`, `claude/unity-pc-options-wave2-20261104`, `claude/unity-pc-ossuary-count-20261104`, `claude/unity-pc-parry-docs-20261103`, `claude/unity-pc-sound-bgm-license-20261104`, `claude/unity-pc-sound-bgm-list-20261104`, `claude/unity-pc-sound-g1-20261104`, `claude/unity-pc-sound-r10-20261104`, `claude/unity-pc-sound-r5`, `claude/unity-pc-sound-r8-20261104`, `claude/unity-pc-sound-r9-20261104`, `claude/unity-pc-sound-wire-r8r9-20261104`, `claude/unity-pc-sweep-verdict-20261104`, `claude/unity-pc-ui-minor6-20261104`, `claude/unity-pc-vfx-blood-20261103`, `claude/unity-pc-vfx-bullets-20261103`, `claude/unity-pc-vfx-druid7-20261104`, `claude/unity-pc-vfx-elhit-20261104`, `claude/unity-pc-vfx-hitanchor-20261104`, `claude/unity-pc-vfx-ki-20261103`, `claude/unity-pc-vfx-kidisk-20261104`, `claude/unity-pc-vfx-kraken-water-20261104`, `claude/unity-pc-vfx-missing-20261103`, `claude/unity-pc-vfx-orb2-20261103`, `claude/unity-pc-vfx-orb3-20261103`, `claude/unity-pc-vfx-retouch-20261103`, `claude/unity-pc-vfx-retouch-20261104`, `claude/unity-pc-vfx-skillpal-20261104`, `claude/unity-pc-vfx-spark-20261103`, `codex/pc-devtools-fix-20261102`, `codex/unity-11-fullrun-20261102`, `codex/unity-bgm-import-p1-20261104`, `codex/unity-char-g0-st-ivan-20261104`, `codex/unity-char-socket-audit-20261104`, `codex/unity-core-angler-parry-20261104`, `codex/unity-death-screen-20261103`, `codex/unity-debug-ai-oracle-a-layer-20261104`, `codex/unity-debug-oracle-sweep-20261104`, `codex/unity-debug-resource-oracle-20261104`, `codex/unity-demo-flavor-20261103`, `codex/unity-demo-text-20261104`, `codex/unity-docs-from-main-20261104`, `codex/unity-docs-sync-20261104`, `codex/unity-docs-sync2-20261104`, `codex/unity-enemy3d-20261104`, `codex/unity-fullrun-measure-20261104`, `codex/unity-ground-aoe-decal-20261103`, `codex/unity-holdskip-fix-20261103`, `codex/unity-i18n-first-impression-20261104`, `codex/unity-parity-1102`, `codex/unity-parry-g2-20261103`, `codex/unity-pause-options-parity-20261104`, `codex/unity-run-exception-audit-20261104`, `codex/unity-ui-mipmap-20261104`, `codex/unity-ui-plate-20261103`

### 4-2. 10-26 이후 커밋이 모두 unity/main에 있음 (30)

마지막 커밋이 10-26~27이고 그 이후 커밋은 unity/main에 같은 해시로 들어 있다(ancestor 검사는 오래된 줄기 차이로 실패). 일부는 이후 10-28 계열이 흡수.

`claude/optimistic-maxwell-ccbr1o` `aa2fdeda6`, `claude/pc-enemy-actors-20261023` `a34b5e582`, `claude/sleepy-feynman-mgacit` `f0be3aecc`, `claude/unity-pc-a16-20261026` `24c20a94a`, `claude/unity-pc-forge-a14-20261026` `c334bb0f6`, `claude/unity-pc-inventory-u04-20261026` `a48faf9ea`, `claude/unity-pc-map3d-20261026` `5108c7098`, `claude/unity-pc-overlays-20261026` `98ed00497`, `claude/unity-pc-stat-parity-20261026` `1c270003a`, `claude/unity-pc-win-parity-20261026` `27d766dae`, `claude/unity-port-master-20261026` `1770c2698`, `codex/backup-killu-punishment-20261026-121635` `466f13bd0`, `codex/backup-slam-visual-20261026` `0bd8ac1c1`, `codex/backup-steam-combat-variety-20261026` `627c8fd62`, `codex/backup-steam-gallery-20261026T0035Z` `5cbf79854`, `codex/backup-steam-lit-combat-20261026` `98606affe`, `codex/backup-steam-localization-20261025T234131Z` `1651bca91`, `codex/backup-steam-map-lighting-20261025T235444Z` `93d90d516`, `codex/ch1-unity-map-plan-20261026` `0eb4991ab`, `codex/handoff-mac-hud-9dd5991-20261026` `1e1469af5`, `codex/handoff-mac-hud-world-blend-idle-20261026` `2ffe646f2`, `codex/map-look-steam-20261026` `52f5e153e`, `codex/reference-handoff-hud-clean-20261026` `50726aacc`, `codex/unity-lobby-diagnostics-20261026` `69ff6e500`, `codex/unity-map-light-01-20261026` `8fb4072db`, `codex/unity-map-light-03-20261026` `eadb42324`, `codex/unity-map3d-organic-mass-20261026` `ef59413dc`, `codex/unity-moat-01-20261026` `66d4fd860`, `codex/unity-pet-01-20261026` `ec6e7b0a9`, `codex/unity-start-parity-01-20261026` `3dbf62e64`

## 5. 확인 방법

- `git ls-remote origin refs/heads/*` 874개 → `git fetch --filter=blob:none` → `git merge-base --is-ancestor <브랜치> origin/unity/main`, `git rev-list --count --since=2026-10-26 origin/unity/main..<브랜치>`, `git cherry`, `git for-each-ref --contains`.
- 판정 출처: `CTO_HANDOFF_20261104_NIGHT.md`(§2 코덱스 레인, §3 병합 대기), `LANES_CLOUD.md`, `reports/mac_20261104.md`(claude/unity-mac-report), 각 브랜치 커밋 제목. 브랜치 안 문서 본문은 대부분 읽지 않았다.
- 10-26 이전에 마지막 커밋이 있는 브랜치(약 490개)는 범위 밖이다.
