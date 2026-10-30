# 캐릭터 선택 3D 무대 준비 — 2026-10-30

사용자 브리프 I:/EXODUSER-Storage/codex-takeover/charselect-stage-brief.md의 준비 산출물 3종(설계·Blender 무대/렌더 비교·기존 영웅 현황)을 제출했다. **Unity 미실행·제품 소스 변경 0·승인 전 게임 반영 0**이다. 전체 게임용 아트 완료가 아니다.

| 구분 | 실제 결과 |
|---|---|
| 체크아웃 / branch | G:/exoduser-wt/codex-charselect / codex/pc-charselect-stage-20261030 |
| 기준 source | 6a196f4840e574c4dce55f0d1c3bdf7b932ff19b. 착수·마감 fetch의 origin/unity/main과 일치 |
| 산출 위치 | I:/EXODUSER-Storage/demo-art/charselect/ |
| 설계 | DESIGN_SHEET.png·DESIGN.md·stage-spec-final.json. 사슬 재판정, 5직업 앵커, 집중 50mm·전체 조망 48mm·1600×900, 주광/보조/림·작은 UI 3판 |
| 실제 메시 | charselect_stage.blend, 바닥·기둥·철창·사슬·화로·문. 520오브젝트 / 기본 68,144삼각형. 기하 전용 GLB는 102,800삼각형 |
| 최종 후보 SHA-256 | 6e43c5a8b82a67b18cc4faa199fabdf8080c84faa065179675bf35fef3135dbd |
| 재질 | Poly Haven 수도원 석재·산화 철 CC0 PBR 2종·2K 8파일, MD5/원본 SHA 대조. LICENSES.md·texture-sources.json. 영웅은 기존 프로젝트 자산 조건 계승 |
| 직접 본 증거 | stage_final.png·stage_overview_final.png·stage_empty.png·stage_silvertail.png·REFERENCE_COMPARISON.png·DETAIL_1X.png·UI_LAYOUT.png. 같은 최종 후보의 카메라 구도 차이를 명시 |
| 기술 검수 | 새 Blender 재개방 11/0, GLB 구조 5/0. 내장 이미지 11개, 실제 UV·5앵커·전사 1.85m / 바닥 0.48m |
| 최종 판정 | VISUAL VERDICT: RETOUCH. 제작 Codex 자체 정적 시안 판정. CTO 독립 판정·실게임·움직임·성능 미검증 |

## 영웅 현황과 남은 범위

현행 UI NativeLobby.SilverCharacter.cs의 순서는 전사·실버테일·헬거너·변성술사·창법사다. 영웅 제작 보드의 아이반을 헬거너 대신 끼워 넣지 않았다.

| 대상 | 이번 직접 확인 | 다음 담당·산출물 |
|---|---|---|
| 전사 | 현재 HEAD Art/Characters/Warrior FBX 미보유. I: Meshy 원본 FBX·GLB 실제 개방, 61,981삼각형·24뼈·1.85m. 무기 없는 기본 보행 정지 프레임을 중앙 배치 | 영웅 담당: 인수된 전사 최종 FBX·재질·대검·망토 보조 뼈·대기·파지 복구/검수 |
| 실버테일 | 현재 HEAD의 Rigged/Walk/Run·PNG3종·별도 단검 보유. 61,410삼각형·24뼈·1.72m, 실제 무대 정적 렌더 | 영웅 담당: 단검 소켓·등검 접힘·치마·하이힐·최종 대기. 출시 잠금 유지 |
| 아이반 | 현재 HEAD FBX와 총/텍스처 보유. 61,522삼각형·24뼈·1.85m 구조 확인. 이번 새 화면·동작 판정 없음 | 영웅 담당: 기존 LOCK 헤어/얼룩/천 미해결, 총 파지·역할 확정 |
| 헬거너·변성술사·창법사 | 현재 HEAD 대응 FBX 없음, 설계 위치만 예약 | 원화 채택·모델·리그·무기·대기 준비 |
| 무대 장면 | 얼굴·흑철·암적 천 분리, 하단 UI 도면의 영웅 가림 없음 | 무대 아트: 참고보다 단순한 문판 표면·공간 깊이 보강. 불꽃은 정적 메시, 실제 원화 UI·선택·모션 미구현 |

기존 UNITY_CHARACTER_IMPORT_CANDIDATE_20261028.md의 준비/LOCK 미해결 상태를 보존한다. 과거 Unity PASS를 이번 실행으로 소급하지 않는다. 모델 표·프레임 범위·입력 25파일 해시는 HERO_STATUS.md·hero-inventory.json·hero-source-hashes.json을 따른다.

## 검수·보존·인수

상세 보고·맵 제작 가이드 §23 항목·재현·기각 후보 정리는 I:/EXODUSER-Storage/demo-art/charselect/REPORT.md에 있다. ARTIFACTS.json에 제출 28파일 해시, cleanup-receipt.json에 자기 기각/중복 사본 10개 삭제를 기록했다. 원본·타 팀 WIP·세이브 삭제 0이다. 관련 키워드로 전체 docs 88문서 매칭을 조사했으며 제품 수치 변경은 없다.

이 커밋은 인계 문서만 백업한다. 대형 blend/glb는 I: 보존이며 GitHub 업로드가 아니다. unity/main 병합·Mac 인수·기존 실행 앱 변경·빌드·배포 0. 사용자 채택 승인 뒤 별도 Unity 실행 단위에서 영웅 대기/무기/천·실제 UI·Player·1x·성능을 검수한다. 준비 산출물 완료를 사용자 채택·게임 아트 PASS로 올리지 않는다.


## 후속 한 건 — 1920×1080 후면 깊이 마감

사용자/총괄의 승인된 후속 1건을 같은 checkout/branch에서 수행했다. 원본 charselect_stage.blend SHA-256 6e43c5a8b82a67b18cc4faa199fabdf8080c84faa065179675bf35fef3135dbd는 보존했고, 산출은 I:/EXODUSER-Storage/demo-art/charselect/depth-finish/에 분리했다.

| 항목 | 실제 결과 |
|---|---|
| 편집 B | B_depth_finish.blend / SHA-256 b235ef43a4d940345d0f45cd3540402d8ba982b25f873d0eec5fdd60229406a1 |
| 실제 공간 | 주 아치 Y=4.10m → 후실 관문 Y=11.72m(7.62m). 좌/우 문 72°/-58° 개방, 안쪽 면·2단·주춧돌·별도 후실·0.24m 오목 첨두 패널 |
| 조명·재질 | 기존 광원·카메라·영웅·원본 PBR·월드·노출 유지. 보유 PBR의 문 전용 사본과 후실 150/55/80W 3광원만 마감 |
| 직접 본 증거 | A_1920.png / B_1920.png / AB_1920.png / AB_DETAIL_1X.png / REFERENCE_COMPARISON_1920.png. A/B 같은 해상도·렌더 설정, 1x crop, 참고 비율 차이 표시 |
| 기술 | 새 Blender A/B 재개방 12/0. 기존 이미지 바이트·재질 노드·영웅·카메라·광원 보존 및 새 깊이/UV/가로보 부착 검사 |
| 판정 | VISUAL VERDICT: RETOUCH. 실제 열린 문–바닥–먼 관문의 깊이와 가림은 성립. 재질 변화/중간 디테일·공기감은 참고보다 단순하고 후실 아치 상부는 고정 카메라 밖으로 잘림 |
| 검수자 | 제작 Codex 자체 정적 판정. 이번 B의 CTO 독립 판정·사용자 채택·Unity PASS 없음 |
| 보존·종료 | 첫 밝은 후실 FAIL 자료와 기술 보정 자료 보존, 삭제 0. 최종 B는 RETOUCH이며 새 후보를 자동 제작하지 않고 대기 |

상세 변경·큰 남은 차이·맵 제작 보고 변경분은 기존 I: REPORT.md의 이번 절, 정확 해시는 depth-finish/SHA_MANIFEST.json·VERDICT.json을 따른다. Unity/Player/빌드/제품 통합·unity/main·바탕화면·유료·삭제 0. 무기/리그/새 영웅/잠금은 이 한 건 밖이며 수정하지 않았다.
