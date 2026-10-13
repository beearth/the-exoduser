# FDG 홍보 준비 콘텐츠 현황

최근 정리: **2026-10-14 01:33 KST**. 사용자 지시 「홍보준비 최신컨텐츠 업데이트됀거 정리해서 항상 정리해놔」를 반영한 지속 갱신 문서다. 기술 구현, 실제 게임 화면 검수, 공개 데모 배포, 영상 게시를 별도로 확인한다.

**UI 개발 소식1건과 스킬 노트4건(기검참·가시덫·회복의 영역·지옥강타 1)을 공식 YouTube에 게시하고 공개 페이지를 확인했다.** [UI](https://www.youtube.com/post/UgkxfJtDWBoJglf9RWKueZFsGwOBIRBYWULb) · [기검참](https://www.youtube.com/post/Ugkxpb6uTCUIAd3Ypj4_1vsi9cv2BKT-F93l) · [가시덫](https://www.youtube.com/post/UgkxhEsTSyRHSuYPkuEXJmUg-xnYL90AU9nj) · [회복의 영역](https://www.youtube.com/post/Ugkx2UIc57jBgsgkolbqytX0Nn3bgmkAz6if) · [지옥강타 1](https://www.youtube.com/post/UgkxrTYuXuoASizWPYhlrpJyCF-7pcSqJT8-). 지옥강타 1은 주변 원형 범위 타격과 분노의 피해 강화·소모를 소개했다. 분노 최소량은 발동 조건이 아니다. 기존 기능 소개이며 새 패치·신규 촬영 영상으로 표기하지 않았다. **전체 보스전 완료를 기다리는 대상은 리디자인 완료 대표 메인트레일러다.** UI·기존 스킬·캐릭터 원화/제작 과정은 각 소재의 실제 근거와 검수 범위에 맞게 계속 제작한다. 기존 원화30초·전투18초V3·R1 검토본과 새 대표 영상의 미승인 자동 공개 금지는 유지한다.

**최신 품질 조치:** 얼음오브·패링 Shorts는 같은 영상이 두 화면으로 복제된 구성을 사용해 **두 편 모두 비공개·공식 목록 제외**로 회수했다. [회수 결과·증거](../../marketing/operations/shorts-quality-withdrawal-20261010/withdrawal.json). 실제 화면·영상 또는 단계가 명확한 기존 원화와 간결한 설명을 함께 준비하고, 공개 전 완성 미리보기를 먼저 인도한다. 동일 영상의 확대 화면과 전체 화면을 동시에 복제하지 않으며 원화를 가리는 불투명 자막판을 사용하지 않는다. 매시간 점검을 긴 글 연속 게시 빈도로 해석하지 않는다. UI·스킬·캐릭터의 독립 준비를 계속하고 대표 보스전 완료 영상만 총괄 완료를 기다린다.

## Godot Q/E 연결 골격 — 2026-10-14 01:33 KST

| 항목 | 확인 범위 |
|---|---|
| 새 버전·근거 | main checkout commit `471f7d72255813ac24e0e7f20b95c9598f007e3e`, parent `f58ae5d5d3f8e36dcb8427e5b8cf420f69f17295`, 01:02:47 KST. 제목 `Bind native QE contact pipeline and one-time number atlas startup`. 변경 engine docs9경로·[Q/E 연결 문서](/Users/fordeargamers/the-exoduser/docs/engine/FDG_GODOT_QE_BINDING_20261014.md)의 커밋 저장본1개만 대조했다. 숫자 문서·기존 source/runtime/suite 재검증0. |
| 기술 검사 이력 | 첫 attempt01은 SCRIPT ERROR10으로 **INVALID/cleanPASS0**다. fixture 순서 수리 후 **first-valid10그룹/135 PASS**, 이후 독립 평화방패 hold **새1그룹/20 FIRST PASS**를 구분한다. 성공10 재실행0이며 같은 실행11개·최신 동일 source 전체 검수로 합치지 않는다. 총괄의 NUM2/총13 보고는 이번 Q/E 한 문서의 독립 결과로 합산하지 않았다. |
| 실제 본편·촬영 경계 | 선택 Q/E 접촉·시계 API 연결이다. stats8/resources6/services는 constructor fixture이며 실제 Main provider가 아니다. Main 입력·6탄 facade·BLACK Q source/carrier·E 이동/완료·전체 phase 미완, `full_source_phase_order_ready=false`, **production full Q/E admission pending · RETOUCH**. BLACK Q는 변이 전 거절하며 과거 Source Runtime19를 canonical 피해/bank 식의 증거로 사용하지 않는다. 공개 정상 교전·픽셀·최저사양240 검수 미완이다. |
| 홍보·다음 소재 | migration HEAD `9a4534b4` 동일. 새 정상 플레이 영상/원음/공개 승인/게시0·공개 준비0 유지. 다음 소재는 **기존 전사 수정 스틸 미리보기 검수·게시 판단**이다. 게임 품질 개선→사용자 플레이→실제 전체 화면·원음 녹화→완성 미리보기 기준과 같은 요청 비반복을 유지한다. |

## Godot 지면 자원 기술 연결 — 2026-10-14 00:31 KST

| 항목 | 확인 범위 |
|---|---|
| 새 버전·근거 | main checkout commit `f58ae5d5d3f8e36dcb8427e5b8cf420f69f17295`, parent `f070f8a4129073acbc1b00d4b8750e70e32fda2e`, 00:02:42 KST. 제목 `Bind original CH1 soil and litter textures to the native World`. commit 메타데이터·변경 engine docs8경로와 [지면 자원 연결 문서](../engine/FDG_GODOT_GROUND_SURFACE_BINDING_20261013.md)의 커밋 저장 내용1개만 읽었다. 총괄의 전체 docs9 보고와 engine docs8을 구별한다. |
| 기술 검수·시각 한계 | 원본 soil/litter 두 자원의 World 정적 underlay 연결은 새 고유3 **FIRST PASS**다. 원 자원2 첫 import는 별도 성공 이력으로 합산하지 않는다. 기존 opaque chunk가 위에 남아 전체 맵 시각 개선 완료가 아니다. physics·Main/save·GUI·public play/pixels0, Camera/GPU·seam·교전 시각·Windows1080p240 검수 미완료, **RETOUCH**. 마케팅 맵 제작/카메라 QA·코드/원PNG·suite·게임 실행0. |
| 적용·보류 경계 | source 지원6/미10·동결 Web/Windows 배송5/미11 유지. zones mask/SVG/zone blend는 **HOLD 유지·대체/검사/우회0**이다. Q 블랙콩의 속도/수명/피해 실제 반사 연결은 총괄 진행 보고이며 완성 시연으로 소개하지 않는다. |
| 홍보·다음 소재 | migration HEAD `9a4534b4` 동일. 새 정상 플레이 영상/원음/공개 승인/게시0·공개 준비0 유지. 다음 소재는 **기존 전사 수정 스틸 미리보기 검수·게시 판단**이다. 품질 개선→사용자 플레이→전체 화면·원음 녹화→완성 미리보기 기준과 같은 요청 비반복을 유지한다. |

## Godot 전투 텍스트 연결 — 2026-10-13 23:33 KST

| 항목 | 확인 범위 |
|---|---|
| 새 버전·근거 | main checkout commit `f070f8a4129073acbc1b00d4b8750e70e32fda2e`, parent `3a6ac050f60af0aef9660827751fad6c7757efc9`, 23:12:55 KST. 제목 `Bind native floating text to the World post phase`. commit 메타데이터·변경 docs7경로와 [전투 텍스트 연결 문서](../engine/FDG_GODOT_FLOATING_TEXT_BINDING_20261013.md)의 커밋 저장 내용1개만 읽었다. 이전 코드/검사/미디어 재검증0. |
| 기술·완성 상태 | 실제 World/HitFX 연결의 새 고유4 PASS는 **첫3 + 별도 lifecycle1**이다. 기존 성공3·옛 suite 재실행0이며 같은 실행4개로 합치지 않는다. `number_atlas_gap=true`·숫자atlas 미공급, 이번 Main/GUI0, 공개 자연 교전·canvas 비교·glyph/AA·240FPS 미확인, **RETOUCH**다. Main6/동결배송5 및 Q/E·M29 연결 진행은 총괄 보고이며 이 한 문서의 독립 확정값이 아니다. |
| 별도 작업 보류 | 총괄은 Claude 지도 마스크 파일 쓰기가 자동 승인 심사에서 위험 판단으로 거절됐고 상세 이유가 제공되지 않았다고 이미 알렸다. 해당 담당 작업의 보류이며 마케팅에서 재시도·우회·권한 질문을 하지 않았다. 반사탄·방패 버스트의 제작 시작을 새 정상 전투 완료로 세지 않는다. |
| 홍보·다음 소재 | migration HEAD `9a4534b4` 동일. 새 정상 플레이 영상/원음/공개 승인/게시0·공개 준비0 유지. 다음 소재는 **기존 전사 수정 스틸 미리보기 검수·게시 판단**이다. 품질 개선→사용자 플레이→실제 화면 전체·원음 녹화→완성 미리보기 기준과 같은 요청 비반복을 유지한다. |

## Godot 부분 통합 체크포인트 — 2026-10-13 22:35 KST

| 항목 | 확인 범위 |
|---|---|
| 실제 버전·근거 | `/Users/fordeargamers/the-exoduser`의 commit **`3a6ac050f60af0aef9660827751fad6c7757efc9`**, parent `b921fc4017703d8b37cc2a9de8fdb5781992165e`, 22:26:37 KST. 제목 `Integrate native owner phases and six-element projectile bindings`. commit 존재·메타데이터·변경 docs 경로14개와 [한 문서](../engine/FDG_GODOT_TYPE7_INTEGRATION_20261013.md)의 해당 커밋 저장 내용만 대조했다. 문서는 새 SHA 자체를 명시하지 않으므로 SHA의 문서 명시와 실제 commit 대조를 구별한다. |
| 부분 기술 검수 | 새 고유 기술12 PASS = type3 binding4 + World phase2 + element/FX4 + private runtime assembly2. source 지원6/미이식10, 동결 배송5/미11. constructor fixture overlay6→7은 실제 Main 자동 설치가 아니다. 마케팅 코드 읽기·suite 재실행·원본 에셋 재해시·게임 시작0이다. |
| 완성·촬영 경계 | **RETOUCH**. Main 자동등록0·본편 admission0, 자연 소환/교전·full Q/E·패링·M29 실제 event/impact/SOUND·공개 픽셀·최저사양1080p240 검수 미완료. Godot 첫 기술 통합을 본편 전체 완료·성능 개선·새 공개 데모로 소개하지 않는다. 기존 고정 PC 검토 사본도 갱신하지 않았다. |
| 홍보·다음 소재 | migration HEAD `9a4534b4` 동일. 새 정상 플레이 영상/원음/공개 승인/게시0·공개 준비0 유지. 다음 소재는 **기존 전사 수정 스틸 미리보기 검수·게시 판단**이다. 최신 인트로 전편 검수·교체 판단과 품질 개선→사용자 플레이→실제 화면 전체·원음 녹화→완성 미리보기 기준을 유지하며 같은 요청을 반복하지 않는다. |

## Godot 부분 구현 보고 — 2026-10-13 20:29 KST

| 항목 | 확인 범위 |
|---|---|
| 진행 중 코드·기술 검사 | 총괄 cursor `bd9703ff:42`는 **M29 돌진·소환 생성기·몬스터 AI 코드 준비**와 몬스터 AI 신규 검사6개 통과를 보고했다. 진행 중 담당 보고이며 마케팅 코드·검사 suite 재검증0이다. |
| 실제 소비·화면 경계 | 실제 투사체·효과 연결과 플레이 화면 검증은 남아 있으며 **기존 웹 빌드 지원 범위는 그대로**라는 보고다. 새 웹 플레이본·정상 연속 화면·원음·성능·전체 이식 완료로 소개하지 않는다. 고정 PC 소스 검토 사본의 범위도 이번 코드 보고만으로 갱신하지 않는다. |
| 홍보·다음 소재 | actual migration HEAD `9a4534b4` 동일. 전사 정적 캠페인 검토 대기·원고/원화10건·공개 준비0·새 게시/인게임 영상/원음/승인0 유지. 다음 소재는 **기존 전사 수정 스틸 미리보기 검수·게시 판단**이다. 품질 개선→사용자 플레이→실제 화면 전체·원음 녹화→완성 미리보기 기준과 로그인/미리보기/촬영 요청 비반복을 유지한다. |

## Godot PC 검토 사본·콘솔 고려 — 2026-10-13 10:24 KST

| 항목 | 확인한 범위·남은 검수 |
|---|---|
| 직접 지시·산출물 | 사용자가 「고도한번 해보자 뭐 플스이식같은것도 생각해야지」라고 지시했다. 기존 담당의 `godot/` 입력285파일을 고정한 [독립 PC 소스 검토 사본](/Users/fordeargamers/the-exoduser/output/godot-first-review-20261013/README.md)을 인도했다. 소스 commit `08e5cac1`과 담당 WIP를 포함하며 원본 소비 경로·게임 코드·기존 실행 앱은 변경하지 않았다. 이후 담당 원본의 변경을 이 고정본의 최신 반영으로 추정하지 않는다. |
| 검사·완료 범위 | 별도 사용자 데이터 경로에서 headless 가져오기1회·입력 없는 시작5프레임1회 PASS. GUI 실행·정상 연속 플레이·시각/원음·패드·Q 패링·저장 이관·밀집 전투/Windows 성능·전체 이식·Steam 데모·콘솔 실행은 미확인이다. Camera2D 보간 경고를 보존했다. 이미 완료한 가져오기·시작 검사와 전체 소스 복사를 반복하지 않는다. |
| 보존·근거 | [검토 영수증](../../marketing/operations/godot-console-20261013/receipt.json) · [PC/콘솔 기준](../engine/EXODUSER_GODOT_CONSOLE_READINESS_20261013.md). 자신의 기록 commit `13ffe008`과 입력 보존 branch `codex/backup-godot-review-20261013-bf58def0ea`의 commit `be81cece`를 원격에서 확인했다. 입력 보존은 시작 검사 이후·사용자 GUI 실행 이전이다. 타 팀 코드 인수·본편 적용 승인으로 사용하지 않는다. |
| PlayStation·다음 개발 기준 | Sony 승인·SDK와 별도 콘솔 지원이 필요하며 현재 PC Godot4.7.2의 포팅 업체 지원은 미확인이다. 패드 이동/조준/전투·메뉴, 입력/저장/플랫폼 서비스 분리는 다음 구현 요건이며 아직 구현 완료가 아니다. 가입·계약·결제·외부 연락·다른 채팅 지시0. |
| 홍보 운영·다음 소재 | 이 패키지는 **PC 소스 검토본이며 홍보 영상·완성 시각 소재로 집계하지 않는다.** 원고/원화10건·정적 캠페인1묶음·공개 준비0·새 게시/인게임 영상/원음0 유지. 다음 홍보 소재는 기존 전사 수정 스틸 미리보기 검수·게시 판단이다. Godot 체험 지시를 공개 승인으로 해석하지 않는다. 품질 개선→사용자 플레이→실제 화면 전체·원음 녹화→완성 미리보기 기준을 유지한다. 총괄 cursor32 실패는 직전 사용자 턴에서 관측됐고 이번 compact는 변경 없음이므로 재시작·반복 알림하지 않았다. |

## 2026-10-13 — 인디 사례 적용·전사 수정 스틸 캠페인

| 항목 | 현황 |
|---|---|
| 실제 완성 미리보기 | 10/1 공개 원본과10/8 제작 수정본의 같은2초 스틸2장·한 화면 버전 전환·한영 itch.io 개발일지·채널별 짧은 문안. 데스크톱·모바일 스틸/레이아웃 검수 완료. |
| 단계·공개 경계 | AI 보조 스토리 컷씬 제작 기록이며 인게임·새 Steam 패치가 아니다. 이번 정적 미리보기1묶음과 기존 원고/원화10건을 구분한다. 공개 검수 완료0·새 게시0·새 게임플레이 영상0. 최신 인트로 전편 시청·청취·공개 교체는 별도 미완료다. |
| 다음 조치 | 이번 스틸·짧은 글의 사용자 미리보기 검수와 게시 판단. 기존 로그인·미리보기 요청은 반복하지 않는다. 승인된 채널의 실제 게시와 URL 확인 후72시간·7일 유입/위시리스트·피드백을 기록한다. |
| 파일·근거 | [완성 미리보기](/Users/fordeargamers/the-exoduser/output/indie-marketing-20261013/REVIEW/preview.html) · [출처·해시·QA·측정](../../marketing/operations/indie-campaign-20261013/campaign.json) · [실행 기록](INDIE_MARKETING_EXECUTION_20261013.md) |

## 전사 인트로 최신본 대조 — 2026-10-11 00:01 KST

공개 전사 `r_TTBUrA6p4`의 업로드 원본은 migration의 **10월1일 v25**, 최신 완성본은 마케팅 체크아웃의 **10월8일 킬루 장면 수정본**이다. 동일한 `warrior_story_v23_clean.mp4` 이름을 사용하지만 해시·내용이 다르다. 게시용 복사본을 만들 때 최신 제작 체크아웃과 대조하지 않아 교체가 누락됐다. 최신본은 첫0~5초 손·칼자루 교정(10/6)을 포함하고51~58초 킬루 장면7컷을 반영한다. **96.4초·1920×1080·60fps**, SHA256 `277fbe09c4f5c0b70a98aae6376a8d820a7377cbd6f96a3bc62365cf0a166b34`. 기존 원음 패킷 스트림과 KO/EN22큐 선택형 자막을 유지했다.

[최신 완성 미리보기](/Users/fordeargamers/the-exoduser/output/warrior-intro-latest-20261011/REVIEW/EXODUSER_WARRIOR_INTRO_20261008_REVIEW.mp4)와 [근거·교체 상태](../../marketing/operations/warrior-intro-version-audit-20261011/audit.json)를 인도했다. 새 파일은 다시 편집·생성한 영상이 아닌 기존 최신 완성본의 해시 일치 복사다. 이번 전편 시청·청취는 수행하지 않았으며 기존 게임 반영 검토 이력을 새 YouTube 공개 승인으로 해석하지 않는다. **현재 구본 공개 상태 유지·신규 업로드0·공개 교체 미완료**. 첫 화면과 수정 구간을 포함한 완성본 사용자 검토 후 교체 판단한다. 게임/소비 코드·서버·세이브·다른 팀 파일은 수정하지 않았다.

## 게임 모션 품질 개선 — 최신 사용자 지시

사용자는 디자인 교체보다 전체 품질을 지적하며 **홍보영상 제작이 가능하도록 실제 게임 모션 프레임과 연결을 부드럽게 개선**하라고 했다. 최신 제작 순서는 **게임 품질 개선·검수 → 사용자 직접 플레이 → assistant가 실제 화면 전체와 원음을 녹화·편집 → 완성본 사용자 검수**다. assistant 시연 조작·자동 이동·staged 촬영을 사용자 자연 플레이로 소개하지 않는다. 사용자 플레이 세션과 새 촬영은 아직 시작하지 않았다. 현행 본편 전사는 대기2슬롯/고유1·보행8/고유8·베기9슬롯/고유8이다. 범용 클립/Shift와 착지 timer는 render 호출에 묶여 화면 FPS에 따라 속도가 달라지는 소스 문제가 있다. 보행 거리 시계와 전사 기본/E 공격 상태 시계는 이 문제와 구별한다. 회수된 Shorts A의 촬영 캐릭터는 실버테일이며 Q는 중복 idle2, 과거 강타는 atk4를 재사용했다. 옛 영상과 현재 본편의 캐릭터·소스를 혼동하지 않는다.

우선 단위는 **범용 visual clock 일관성 → 전사 보행8→24 실제 고유 중간 자세 → 실버테일 방어·공격 연결**이다. 타격·Q/E·자원·save·이동 주기를 보존하고 정상 배율의 실제 게임 전후 장면으로 검수한다. 새 프레임·게임 코드 수정·개선 영상은 아직0이며 완성으로 표시하지 않는다. [실제 근거·범위·인수 조건](../../marketing/operations/game-motion-quality-20261010/request.json). 게임 본편 공유 파일은 기존 총괄 소유이므로 전달 허가 질문의 직접 응답 전 다른 채팅으로 지시하지 않는다. UI·원화 등 독립 홍보 준비와 공개 전 미리보기 기준은 유지한다.

## 총괄 엔진 전환 방향 보고 — 2026-10-13 08:23 KST

| 항목 | 현재 확인 범위 |
|---|---|
| 사용자 요청·진행 방향 | 총괄 「맥북에서 총괄 시작하기」의 실제 사용자 메시지에서 Godot 마이그레이션·Unity/Godot 전환 요청을 확인했다. 총괄 cursor `bd9703ff:30`은 **Godot 첫 실행 플레이본 제작으로 전환하겠다는 진행 중 응답**이다. 기존 스프라이트·전투 규칙과 최신 기검참3타 홀드·새 검기를 기준으로 제시했다. |
| 실제 산출물·성능 경계 | Godot 작업본·첫 실행·최신 본편 통합·정상 플레이 장면·프레임 성능 측정은 이번 마케팅 관측에서 확인하지 않았다. 엔진 이름만으로 성능 개선이나 이식·보스전 전체 완료를 주장하지 않는다. 마케팅 코드·게임·서버·세이브 변경·다른 채팅 지시0이다. |
| 홍보 상태·다음 소재 | actual migration HEAD `9a4534b4` 동일. 전사 수정 스틸 캠페인1묶음은 **사용자 검토 대기·미게시**이며 기존 최신 인트로 전편 검수·교체 판단을 유지한다. 새 공개 승인·게시·인게임 영상·원음0. 첫 실제 실행 이식본 보고를 기다리되 게임 품질 개선→사용자 직접 플레이→실제 화면 전체·원음 녹화·편집→완성 미리보기 순서는 유지한다. 총괄이 이미 전달한 방향·로그인·미리보기 요청은 반복 알리지 않는다. |

## 최신 총괄 연결 문제 보고 — 2026-10-13 02:19 KST

| 항목 | 현재 확인 범위 |
|---|---|
| 실행본 불일치 보고 | 총괄 cursor `bd9703ff:24`가 기존 담당 cursor153의 **맥북 엔진 기검참3타 즉시 발사 ↔ 별도 본편3타 홀드·새 검기** 불일치 보고를 회수했다. 담당 보고 범위이며 마케팅 코드·커밋·실제 실행본 재검수0이다. 최신 본편 연결 완료·새 스킬 패치로 홍보하지 않는다. |
| PC·안개 검수 경계 | 총괄의 현재 프로젝트 목록에서 메인PC 작업본이 관측되지 않아 직접 실행 검수는 미확인이다. PC 소실·전체 원격 불가로 단정하지 않는다. 기존 담당의 별도 안개 검수 탭에 대한 인간 승인 반영 보고는 마케팅 촬영·기존 사용자 게임 조작 승인으로 사용하지 않는다. 안개100%/20% 실제 비교·환경 마감·전체 보스전 완료 미확정이다. |
| 홍보 상태·다음 소재 | actual migration HEAD `9a4534b4` 동일. 방금 인도한 전사 수정 스틸 캠페인1묶음은 **사용자 검토 대기·미게시**이며 기존 인트로 전편 검수·교체 판단과 함께 유지한다. 새 게시·인게임 영상·원음·공개 승인·게임/서버/탭/세이브 변경0. 이미 총괄이 보고한 문제나 로그인·미리보기 요청을 반복 알리지 않는다. |

## 총괄 제작 중 부분보고 — 2026-10-13 00:07 KST

| 항목 | 현재 확인 범위 |
|---|---|
| 별도 엔진 구현 보고 | 총괄 cursor `bd9703ff:22`가 기존 담당의 편집기 안개 조절·복원→인게임 consumer 코드/docs 작업과 **신규 검사11 PASS** 보고를 회수했다. 담당 turn `01a1308b-f81d-7b91-a620-cd17218b2fd4` / cursor152의 부분보고이며 마케팅 source/suite/Git 재검증은 하지 않았다. |
| 시각·완료 경계 | **실제 안개100%/20% 화면 비교는 다음 검수**다. export/reimport→실consumer의 새 원본 비교·정상checkpoint 미관측, `EDITOR_ENVIRONMENT_NATIVE_FIRST` 완료0. 기술 검사 통과를 시각 인수·정상 본편 화면·전체 환경/보스전 완료로 해석하지 않는다. 새 마케팅 촬영·원음·공개 승인0이다. |
| 준비 상태·다음 소재 | 실제 migration HEAD `9a4534b4` 동일, 본편·Steam 적용 미확인. 공개 준비0·새 게시0·게임/서버/탭/세이브 조작0·반복 요청0. **전사10/8 완성 미리보기 검수와 교체 판단**이 우선이며 악의구 원고·12초 시연안은 후속 준비다. |

[구조화 관측](../../marketing/operations/boss-redesign-watch-20261009.json)에 제작 중 부분보고와 이전 실제 발사/맵 연결/씬 관측을 구별해 보존했다. 새 완성 시각 자료가 없어 같은 미리보기·확인 요청이나 게시를 반복하지 않는다.

## 직전 국소 발사 관측 이력 — 2026-10-12 15:56 KST

| 항목 | 현재 확인 범위 |
|---|---|
| 국소 발사 인수 | 총괄 cursor `bd9703ff:14`가 별도 FDG **자연 발사 한 사건의 탄 생성·다음 이동·국소 가시성**만 한정 인수했다. native update2745 탄0→2746 dist9.187(이미1step 이동)→2747 dist18.375(2step)이다. **전체 씬 RETOUCH**, 정확 append 순간/거리0 렌더·첫 렌더 프레임·입 소켓과 탄 중심 정합은 미확정이다. |
| 화면·귀속 한계 | first-visible 캡처가2747→2776 업데이트에 걸쳐 반환되어 정확 native frame은 미확정이다. 탄 `owner=null`, 유일한 충전actor0의 charge2→0과 생성 연결을 확정 owner ID로 확대하지 않는다. frame2777의 retained객체는 접근 가능하지만 activeIndex−1·sameActiveObject false로 활성 `projs`에서 제거됐다. 이를 활성 비행 화면이나 제거 원인의 증거로 사용하지 않는다. |
| 새 실제 화면 자료 | 같은 사건 준비/후속 가시 PNG2560×1440 두 장만 최초 메타데이터 대조했다. `prepare.png` 2,593,136B·SHA `8f99db25…`, `first-visible.png` 2,551,035B·SHA `44a24640…`. 총괄이 후속 화면을 이미 인도했다. 마케팅 화면 재열람·시각 인수·원음 청취/영상 제작은 하지 않았다. |
| 실행·적용 경계 | receipt 난이도 index5·배율1·level1, WebGPU·perspective·zoom0.82·viewport1280×720·pixelScale1, 로컬 공개 QA `test=1`이다. 입력 주체·실행 checkout 미기록, loaded-resource hash 미검증이며 사용자 직접 플레이/NORMAL 명칭으로 확정하지 않는다. sourceCheckpoint `c2da92519b63fb3e1f524e7c39621a799a04bee7`; 이 자료의 코드/테스트/Git·강제 AI/부활/이동·persistent쓰기0, push/배포 미보고. 실제 migration HEAD `9a4534b4` 동일. 최종HP64.116·적1·생존·완료false이며 원음·본편/Steam 적용·공개 승인 미확인이다. |
| 근거·후속 제작 | 새 `emitter-event-receipt.json`·`source-read-receipt.json`·두metadata·`final-state.json`·entry URL 필요한 필드와 지정2PNG 존재/형식/크기/최초hash만 읽었다. 다음 **기존 몬스터 저작 배치→JSON 재가져오기→native factory 소비**는 제작 중이며 새 완료로 표시하지 않는다. **전사10/8 미리보기 검수·교체 판단** 우선, 악의구 원고·12초 시연안 후속 준비 유지. 새 홍보촬영/영상 제작/게시0, 공개 준비0이다. |

[구조화 관측](../../marketing/operations/boss-redesign-watch-20261009.json)에 새 사건의 한정 인수와 과거 씬/연결 범위를 구별해 보존했다. 이번 메타데이터 대조를 정상 본편 촬영·전체 보스전 완료·마케팅 공개 승인으로 사용하지 않으며 이미 전달된 알림/촬영 요청을 반복하지 않는다.

## 직전 맵 연결 이력 — 2026-10-12 13:56 KST

| 항목 | 현재 확인 범위 |
|---|---|
| 연결 기능 한정 완료 | 총괄 cursor `bd9703ff:12`가 별도 FDG **맵 편집 → JSON 재가져오기 → 인게임 소비 연결**과 편집 배치의 교전·출구 도달을 인도했다. 편집 prop/연결만 PASS, **전체 씬 RETOUCH**다. 동쪽 적·구울 가림의 화면층/깊이 보정은 기존 담당이 진행 중이다. 아래 직전 씬 관측 마감과 적용 범위를 구별한다. |
| 저작·실제 관측 | `prop-035 / m_c1sbone`의 타일(43,53)→(44,53) 이동, 기존38오브젝트와 native `fragment` 소비가 일치한다. compile receipt의 `prop-001` quarter 편집 예시는 별도 샘플이다. 마지막 관측은 completed true·적0·HP520·사망false. 난이도 index5·multiplier1·level1은 관측값이며 NORMAL이라는 명칭은 확정하지 않는다. 입력 주체·방식·적용 checkout은 미기록이다. |
| 새 화면·기록 경계 | 총괄이 출구 도착 스틸을 이미 인도했다. 별도 재시작 교전 metadata는1280×720·352장·14.030129초·관측 간격 중앙값41.203ms, camera zoom0.82·pageScale1이다. `fullRouteVideo:false`, replay 종료는 완료false·적3이므로 출구 도달 관측과 섞어 **연속 전체 경로 완료 영상**으로 소개하지 않는다. 원음 증거 없음·개별 이미지 hash 미기록이다. |
| 적용·검수 경계 | 총괄이 정상 checkpoint로 보고한 commit `e5fc65f5c9cb937b2a8a5198f719418c6b0e566e`, push/deploy false. 기존 읽은 receipt의 실제 필드는 `commit`이며 `normalCheckpoint` 필드는 없다. 정상 checkpoint는 총괄 보고 표현으로 한정한다. 본편 구현/적용 commit으로 확대하지 않는다. 실제 migration HEAD `9a4534b4` 동일. 본편·Steam 적용, 사용자 직접 플레이·원음·전편 시청/청취·공개 승인 미확인. 새 홍보촬영/영상 제작/게시0건이다. |
| 근거·다음 소재 | 새7JSON의 필요한 필드와 저작 fragment(5,768B·SHA `ee4690a2…`), verified metadata(74,596B·SHA `c604f186…`), 재가져오기 화면 파일(44,834B·SHA `6122298b…`) 최초대조만 했다. `editor-reimported.png`는 실제 JPEG이며 타인 파일을 수정하지 않았다. 화면 재열람·반복 QA·게임/서버/사용자탭/세이브 조작 없음. **전사10/8 완성 미리보기 검수와 교체 판단**이 우선이고 악의구 원고·12초 시연안은 후속 준비다. |

[구조화 관측](../../marketing/operations/boss-redesign-watch-20261009.json)에 이번 연결 기능 한정 완료와 직전 씬 마감·후보 거절 이력을 구별해 보존했다. 총괄이 이미 사용자에게 인도한 알림을 반복하지 않으며 전체 보스전 대표 영상 gate는 미충족이다.

## 직전 씬 관측 이력 — 2026-10-12 11:53 KST

| 항목 | 현재 확인 범위 |
|---|---|
| 씬 마감 | 총괄 cursor `bd9703ff:10` 직전 인도에서 별도 FDG 폐허 숲길의 교전·동쪽 캐릭터 가림·북쪽 출구 완주를 해당 관측 씬으로 마감했다. 제작자 receipt는 **현재 WebGPU scene만 PASS/CLOSED**다. 전체 엔진·다른 backend·EXODUSER 본편·보스전 리디자인 완료로 확대하지 않는다. |
| 전투·경로 근거 | receipt상 경로 완료·출구 안내 관측·사망0·잔여actor0·최종HP547.978. `publicActionsOnly:true`, 상태 주입0·난이도 변경 없음·persistent쓰기 없음. 실제 난이도 값과 조작 주체는 미기록이며 `normalCheckpoint:true`는 체크포인트 필드다. NORMAL 난이도나 사용자 직접 자연 플레이로 확정하지 않는다. |
| 새 시각 자료 | [새4컷 요약 GIF](/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/engine-ruined-forest-route-close/ruined-forest-route-close-highlights.gif): 960×540·52장·11.780초·9,595,689B·SHA `e026c367…`. 교전→동쪽 이동→북쪽→출구 발췌4컷이며 연속 전체 경로 촬영이 아니다. 끝 완료 스틸1초hold를 실제 플레이1초 지속의 실측으로 해석하지 않는다. 기존sample 사용·새 동작 프레임 생성 없음, GIF 원음 없음. 총괄이 이미 사용자에게 인도했다. |
| 적용·검수 경계 | 제작자 코드·문서 local commit `1355ee7fbcd4fc4e63731bcca8c7b50b4320a4a3`, push false. 실제 migration HEAD `9a4534b4` 동일, 본편·Steam 적용 미확인. 마케팅 시청/청취·사용자 공개 승인은 미완료이며 새 홍보촬영/영상 제작/게시0건이다. |
| 근거·다음 소재 | 새 `final-route-receipt.json`·`checkpoint-receipt.json`·`highlight-receipt.json`·`final-visual-verdict.json` 필요한 필드와 지정GIF 존재·크기·최초해시만 대조했다. 재생·시각 인수·반복 QA·게임/서버/탭/세이브 조작 없음. **전사10/8 완성 미리보기 검수와 교체 판단**이 우선이며 악의구 원고·12초 시연안은 후속 준비다. |

[구조화 관측](../../marketing/operations/boss-redesign-watch-20261009.json)에 새 씬 마감과 이전 후보 거절·시험 재생 근거를 각각 보존했다. 이 씬의 한정 마감을 대표 보스전 영상의 완료 gate로 사용하지 않으며 이미 전달된 인도 알림을 반복하지 않는다.

## 후보 정정 이력 — 2026-10-12 08:49 KST

| 항목 | 현재 확인 범위 |
|---|---|
| 인간 정정·후보 상태 | 총괄 cursor `bd9703ff:7`에서 사용자가 「악마보스를 무슨 영웅같이 만들어놨어」라고 평가했다. 총괄은 `assets/sprites/boss/review/druid_sw_higgsfield_max_20261009.png` 후보를 보스 디자인에서 제외했다. 승인 정본·새 플레이 가능 모델로 소개하지 않는다. 원본과 타인 WIP는 보존한다. |
| 방향과 구현 구별 | 총괄이 기존 담당에게 앞으로 쏠린 흉곽·비대칭 목질 팔·뒤틀린 짐승 관절·몸에서 이어진 뿌리 공격기관 기준을 전달했다고 보고했다. 접지→가시 탄막→반동은 첫 콤보의 제작 의도이며 새 모델·애니메이션·실제 패턴 완료 증거가 아니다. |
| 확인 요청 상태 | 해당 거절 후보에 대한 기존 정본 동일성 질문은 종료됐다. 마케팅에서 같은 질문이나 담당 지시를 반복하지 않는다. 전사 인트로 최신본의 미리보기 검토·공개 교체 미완료 상태는 별개로 유지한다. |
| 새 자료·공개 | 새 모델/공격 영상 산출물0·새 홍보 촬영/게시0. 실제 migration HEAD `9a4534b4` 동일, 본편·Steam 적용 및 공개 승인 미확인. 거절 후보와 과거 선택 강제 QA 재생본을 신형 완료 영상으로 사용하지 않는다. |
| 근거·다음 소재 | 최신 총괄 turn `01a12d53-eaf8-7540-beeb-0f6a7fc49ebd`의 인간 정정·종료 보고와 후보 식별 범위만 확인했다. 원화·영상 재생·청취·반복 QA·게임/서버/세이브 조작 없음. 전사10/8 완성 미리보기 검수와 교체 판단이 우선이며 악의구 원고·12초 시연안은 후속 준비다. |

[구조화 관측](../../marketing/operations/boss-redesign-watch-20261009.json)에 디자인 거절과 이전 재생 인도 근거를 각각 보존했다. 총괄이 이미 사용자에게 정정 결과를 전달했으므로 동일 알림·확인 요청을 추가하지 않는다.

## 직전 재생 인도 — 2026-10-12 03:49 KST (이력 보존)

| 항목 | 현재 확인 범위 |
|---|---|
| 최신 인도 | 새 cursor `bd9703ff:2`: 별도 FDG source-correction 테스트장의 실제 native 공개 QA 선택 강제 `fan`/`slam` 재생본. 공개 QA는 입력 경로이며 온라인 게시가 아니다. 자연 AI·사용자 직접 플레이 촬영으로 표시하지 않는다. |
| 제작 미완료 | `newBlackModelConnected`·`authored24FrameAnimationComplete`·`newStaffPlantCompoundSkillComplete` 모두false. 총괄이 신형 검은 드루이드 공격 동작 미완과 구형 공격 자료 잔존을 보고했다. 새 모델 연결·고유24자세·지팡이 꽂기 콤보·전체 보스전 완료로 소개하지 않는다. |
| 실제 발사 자료 | [fan 전체 GIF](/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/engine-dark-druid-source-correction-20261012/native-playback-20261012/native-fan-actual.gif): 1280×720·70장·2.800초·23,564,005B·SHA `d49c40b1…`. 물리8+마법4＝12발. [같은 기록의 축소 미리보기](/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/engine-dark-druid-source-correction-20261012/native-playback-20261012/native-fan-actual-preview.gif): 640×360·96색·7,979,110B·SHA `79cd609d…`. 총괄이 이미 사용자에게 제시했다. |
| 실제 내려찍기 자료 | [slam 전체 GIF](/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/engine-dark-druid-source-correction-20261012/native-playback-20261012/native-slam-actual.gif): 1280×720·68장·2.720초·22,360,108B·SHA `04032987…`. [같은 기록의 축소 미리보기](/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/engine-dark-druid-source-correction-20261012/native-playback-20261012/native-slam-actual-preview.gif): 640×360·96색·7,487,013B·SHA `1bf28e21…`. |
| 시간·원음 한계 | fan 기록185장/2.795496초, slam190장/2.704323초에서40ms마다 직전 실제 프레임을 선택했다. 포즈 보간 없음. GIF 마지막 hold의 별도 길이/관측 여부는 미기재다. 기록 수·샘플 수를 고유 저작 자세·native 전 프레임 검수·FPS 개선으로 확대하지 않는다. 원음 없음이다. |
| 결과·소스 경계 | 두 기록 종료에서 보스 생존, 플레이어 HP fan407.5625/slam266.83125, 처치 증거 없음. 종료 `sourceAfter`는 `dark-druid-idle-8dir-v3`/base8(SHA `ceb3843f…`)이며 전 구간 source identity 증거가 아니다. |
| 적용 경계 | 이 재생 영수증의 코드변경0·API/사용자세이브쓰기0·각persistent쓰기0. commit 미보고. migration HEAD는 `9a4534b4`와 동일하며 본편·Steam 적용은 미확인이다. |
| 이력·홍보 상태 | 이전 namespace cursor61의 강제Q/자연AI 수용,60/59/58/56/50 근거를 구조화 이력에 보존했다. 신형 제작·시각 인수·마케팅 시청/청취·공개 승인은 미완료, 새 홍보촬영·영상 제작·게시0건이다. 전사 최신본 검토와 악의구 후속 준비를 유지한다. |

마케팅 담당은 새 종료 보고·재생 영수증 필요한 필드와 지정4GIF 존재·크기·해시만 처음 대조했다. 실제 재생·이미지 보기·추가 QA·게임/서버/세이브 조작은 하지 않았다. [구조화 관측](../../marketing/operations/boss-redesign-watch-20261009.json). 대표 영상의 본편 전체 완료·정상 사용자 플레이·원음·공개 검토 조건은 아직 충족되지 않았다.

## 우선순위와 다음 소재

| 순서 | 작업 | 착수·완료 근거 |
|---|---|---|
| 1 | UI·스킬·캐릭터 부분 개발 소식 독립 제작 | 각 소재의 실제 구현·원본 자료·개별 검수 범위 |
| 2 | 실제 스틸·원화 또는 짧은 실제 시연과 간결한 설명 | 단계·적용 범위를 명시하고 완성 미리보기를 먼저 인도. 인게임 영상에는 실제 화면·원음 |
| 3 | 미리보기 검수 후 소재별 공개·피드백·다음 기록 | 공식 소유/게시권한·화면 구성·시청/청취·공개 URL·같은 문안 중복 방지 |
| 4 | 리디자인 완료 대표 보스전 영상 | 총괄 전체 완료 + 정상 본편 예고→대응→결과 촬영 가능 + 사용자 검토 |

**우선 검토:** 전사 인트로10/8 최신 완성본 미리보기와 공개 교체 판단. **후속 제작 소재 한 건:** 악의구 — 실제 시연/스틸과 간결한 설명의 완성 미리보기를 먼저 준비한다. 개별 한영 원고와12초 정상 시연안이 준비됐지만 새 영상·완성 시각 묶음은 아직 없다. 거리 유지→구체 발사→범위폭발→접근 흐름이다. [준비 문안](../../marketing/operations/partial-devlog-20261010/skill-malice-orb.txt) · [18건 제작 묶음](../../marketing/operations/partial-devlog-20261010/content-series.json). 지옥강타 1은 [게시 결과·근거·증거](../../marketing/operations/partial-devlog-20261010/giant-slam-publication.json)에 보존했다. 정상 시연 영상·원음 검수는 별도로 남아 있다. 이전 [촬영 경로 점검](../../marketing/operations/partial-devlog-20261010/holy-dome-capture-readiness.json)의 미해결 상태를 반복 점검하거나 같은 요청을 보내지 않았다.

## 콘텐츠 준비표

| 콘텐츠 | 확인된 상태 | 다음 조치·제한 | 공개 데모 적용 |
|---|---|---|---|
| 캐릭터·세계관 원화 티저 30초 | 검토본 인도·미게시 | 전편 감상·청취·사용자 검토 후 배포 판단 | 새 캐릭터 플레이 가능·새 데모 업데이트 주장 불가 |
| 현행 개발본 전투 티저 V3 18초 | 짧은 티저 시각 검수·청취 미완료·공개 미승인 | 본편 대표 트레일러 충분성 미충족. 리디자인 완료 영상으로 재사용하지 않음 | 촬영 개발본과 공개 데모의 일치 미확인 |
| 네메시아 자막 배경 제거 수정본 | 일부 공개 검토용·EN27 게시·KO27 파일 준비 | 한국어 자막 게시와 사용자 검토가 남음. 공개 교체 완료로 기록하지 않음 | 스토리 원화 재구성, 새 인게임 촬영 아님 |
| 전사 컷씬 | 공개10/1 구본·최신10/8 완성 미리보기 인도 | 최신 수정본 시청·청취·사용자 검수 후 교체. 구본을 최신으로 안내하지 않음 | 컷씬 소개·게임 플레이 녹화 아님 |
| 지옥의 틈 개발 기록 v0.1 | YouTube 공개·개발 중 | 후속 v0.2는 새 개선·새 증거가 있어야 준비. 기존 영상 중복 게시하지 않음 | 별도 개발 거점 프리뷰. 공개 데모 적용 미확인 |
| 패링·얼음오브 Shorts A/B | 두 화면 구성 품질 거부·2편 비공개·공식 목록 제외 | 같은 구성을 재공개하지 않음. 한 화면 수정본은 실제 시청/청취·사용자 미리보기 검토가 필요 | 기존 고레벨 staged 이력; 공개 데모 동일 빌드 단정 불가 |
| 드루이드 독탄 가독성·접촉 효과·효과음 | 본편 소비 연결·개발 중·실전 검수 미인수 | 정상 배율 탄막 가독성·연속 전투·원음 청취·동시 성능 확보 후 촬영 후보 | 미확인 |
| 드루이드 뿌리 분출 48장 | 본편 연결·RETOUCH | 후기 잔가지·접지·가림 수정과 실제 보스전 검수 필요. helper WebP는 인게임 녹화가 아님 | 미확인 |
| 보스 내려찍기·점프·벽충돌 충격 | 24장 효과 공유 연결·실제 caller 장면 미검수 | 정상 배율에서 예고→회피/대응→착지 결과 및 화면 가림·동시 성능 검수 | 미확인 |
| 크라켄 물구체·접촉·Q 패링 물보라 | 본편 연결·RETOUCH | 포말 연결·후기 원점·실전 합성 조화·정상 연속 전투와 청취 검수 필요 | 미확인 |
| 화마귀 용암구·접촉·Q 패링 임팩트 | 본편 연결·최신 Q 실제 화면 미검수 | 비행·접촉·Q 각각 실제 사용 크기의 정상 보스전 검수. 접촉 helper로 Q 검수를 대체하지 않음 | 미확인 |
| 변성술사·헬 헌터/크루시폼·아케인 랜서 원화 | 공식 홈페이지 원화·새 직업 구현 미확정 | 원화·개발 콘셉트로 표기. 선택·전투·아틀라스·저장 연결 확인 후 플레이 소개 | 신규3종 플레이 가능 미확인 |
| 기존 메인37초·구 네메시아·과거 R1 | 구 메인/네메시아 일부 공개·공식 목록 제외. R1 과거 검토본 | 재업로드·Steam 전송·신버전 재포장 제외 | 현행 버전 홍보 근거로 사용하지 않음 |

## 독립 제작 소재18건 — UI5·캐릭터3·스킬10

다음 항목은 전체 보스전 완료와 관계없이 운영한다. `문안 준비`와 `영상 준비`를 구별하며 현재 신규 정상 시연 영상 완료는0건이다. 기존 공개 영상2편은 재업로드하지 않는다. 패링·얼음오브 Shorts2편은 비공개로 회수했다. 문안/원화 준비10건은 자동 공개 승인 또는 영상 완성을 의미하지 않는다.

| 구분 | 소재 | 현재 결과 | 다음 장면·소개 |
|---|---|---|---|
| UI 부분 개발 소식 | 설정 창 화면 맞춤 | 한영 개발 소식 공개 | 켜기/끄기를 같은 화면에서 비교 |
| UI 부분 개발 소식 | 안내 글자·자막 크기 | 한영 개발 소식 공개 | 100%와140% 안내·자막 크기를 같은 화면에서 비교 |
| UI 부분 개발 소식 | 가방 정렬 | 한영 개발 소식 공개 | 같은 장비 목록을 정렬 전후로 비교 |
| UI 부분 개발 소식 | 흑철·청동 보석 소켓 | 개별 문안·시연안 준비 | 기존 소켓 PNG의 재질 소개 후 실제 장비창 사용 화면 확보 |
| UI 부분 개발 소식 | 지역 정화 목표 HUD | 개별 문안·시연안 준비 | 후속 배치의 목표·조건·봉인 사유 가독성 화면 검수 |
| 캐릭터 콘셉트 원화 소개 | 변성술사 | 기존 공개 원화·개별 소개 문안 준비 | 원본 원화와 무기·실루엣 설명으로 독립 소개. 미검수 모션 영상 사용하지 않음 |
| 캐릭터 콘셉트 원화 소개 | 헬 헌터 | 기존 공개 원화·개별 소개 문안 준비 | 원본 원화와 무기·실루엣 설명으로 독립 소개. 미검수 모션 영상 사용하지 않음 |
| 캐릭터 콘셉트 원화 소개 | 아케인 랜서 | 기존 공개 원화·개별 소개 문안 준비 | 원본 원화와 무기·실루엣 설명으로 독립 소개. 미검수 모션 영상 사용하지 않음 |
| 기존 스킬 개별 소개 | 기검참 | 한영 스킬 노트 공개·시연안 준비·신규 촬영 없음 | 같은 글 중복 게시 금지. 후속 실제 시연·원음 검수 |
| 기존 스킬 개별 소개 | 가시덫 | 한영 스킬 노트 공개·시연안 준비·신규 촬영 없음 | 현재 위치 설치·자연스러운 적 접근·감속/출혈 결과의 후속 실제 시연 |
| 기존 스킬 개별 소개 | 회복의 영역 | 한영 스킬 노트 공개·20초 시연안·신규 촬영 없음 | 현재 위치 고정 영역·살아 있는 범위 내 회복의 후속 정상 시연·원음 검수 |
| 기존 스킬 개별 소개 | 지옥강타 1 | 한영 스킬 노트 공개·18초 시연안·신규 촬영 없음 | 정상 전투로 분노 누적 → 주변 적에게 강타 → 분노 소모·타격 결과 |
| 기존 스킬 개별 소개 | 악의구 | 현행 소스 동작 확인·한영 문안·짧은 시연안 준비 | 거리 유지 → 구체 발사 → 범위폭발 → 접근 |
| 기존 스킬 개별 소개 | 회전참 | 현행 소스 동작 확인·한영 문안·짧은 시연안 준비 | 군집 진입 → 이동하며 회전 → ST 소모를 보고 해제·이탈 |
| 기존 스킬 개별 소개 | 폭풍소환 | 현행 소스 동작 확인·한영 문안·짧은 시연안 준비 | 조준 거리 변화 → 해제·설치 → 흡인된 적에게 후속 공격 |
| 기존 스킬 개별 소개 | 멸살광선 | 현행 소스 동작 확인·한영 문안·짧은 시연안 준비 | 접근선 잡기 → 광선 유지 → MP 소모를 보고 끊기 |
| 기존 스킬 개별 소개 | 악의기둥 | 현행 소스 동작 확인·한영 문안·짧은 시연안 준비 | 적 접근 → 현재 위치에 설치 → 순차 기둥 → 영역 내 교전 |
| 기존 스킬 개별 소개 | 뇌전창 | 현행 소스 동작 확인·한영 문안·짧은 시연안 준비 | 두 지점 설치 → 연결 아크 → 적의 선 통과 |

UI3종은 마케팅 제작 브랜치의 코드와 docs에 존재하고, 실제개발 migration/FDG스튜디오 현재 게임과 적용 차이가 있다. 보석 소켓 PNG는 UI 아트 원본이고 지역 목표 HUD의 옛 화면은 제목 겹침 이력 때문에 후속 배치 검수 후 사용한다. 신규3종은 공개 콘셉트 원화다. 선택창에는 comingSoon 잠금 미리보기가 있고 실제 전투 목록은 전사·실버테일2종이다. 코드명 헬거너/창법사와 원화명 헬 헌터/아케인 랜서를 구현ID처럼 합치지 않는다. FDG 참고 모션24셀은 게임용atlas·본편 연결 완료가 아니다. 모든 신규 항목의 공개 Steam 데모 적용은 미확인이다.

스킬 원고는 현행 기본 입력과 소비자를 기준으로 쓰고, 옛 설명과 다른 수치는 제외했다. 기존 staged 검수와 큰효과/보호막이 가리는 기검참 통제 렌더 스틸은 새 정상 시연으로 재포장하지 않는다. 원고·입력·소스 위치·시연 순서는 [제작 묶음](../../marketing/operations/partial-devlog-20261010/content-series.json)을 따른다.

개발 조사 범위: [실제 개발 checkout](/Users/fordeargamers/Projects/exoduser-migration-20261001)의 이전 소재 기준 `12c29afe…`부터 관측 HEAD **`9a4534b42f74093095ebc3364a25dd104e93b379`**까지다. 독립 helper/atlas/APNG/WebP·통제 STEP 화면은 정상 연속 인게임 영상과 구별한다. 24/48장은 효과 프레임 장수이며 FPS 주장이 아니다. 신규 보스 소재5건 모두 정상 전투·청취·성능·저장 인수가 남아 있다.

## 채널 배포 상태

과거 영상 상태는 기존 게시 증거를 재사용했다. 이번에는 공식 YouTube 소유자 편집·게시 기능을 확인하고 UI 개발 소식1건 및 기검참·가시덫·회복의 영역·지옥강타 1 스킬 소개4건의 작성자·한영 본문·공개 상세 페이지를 직접 검증했다. [UI 게시 증거](../../marketing/operations/partial-devlog-20261010/publication.json) · [기검참 게시 증거](../../marketing/operations/partial-devlog-20261010/ki-slash-publication.json) · [가시덫 게시 증거](../../marketing/operations/partial-devlog-20261010/spike-trap-publication.json) · [회복의 영역 게시 증거](../../marketing/operations/partial-devlog-20261010/holy-dome-publication.json) · [지옥강타 1 게시 증거](../../marketing/operations/partial-devlog-20261010/giant-slam-publication.json). 다른 채널 로그인·과거 영상 재검증은 반복하지 않았다.

| 채널 | 기록된 상태 | 운영 기준 |
|---|---|---|
| YouTube | 기존 공개 영상2편·Shorts2편 비공개 회수·검토용 일부 공개 별도 + 개발 글5건(UI1·스킬4) | 시각 자료·간결한 설명·완성 미리보기 먼저; 긴 글 자동 연속 게시 중단; 미승인 영상 자동 공개 금지 |
| Steam 상점 | 새 영상 항목1369319 메타데이터만 저장 | 파일 미전송. 구37초 전송 제외 |
| Steam 이벤트/공지 | 한영 초안 준비·Community 로그인 대기 | 실제 배포 때 적용 버전·변경·알려진 문제·영상·데모 링크 |
| Discord | FDG 계정/서버 이력, 웹 로그인/게시 확인 미완료 | 이전에 전달한 요청은 반복하지 않음 |
| itch.io | 프로젝트 존재·개발일지 로그인 대기 | 초안·파일 준비 상태만 관리 |
| Reddit | 공식 프로필·사람 확인 대기 | 게시 전 해당 커뮤니티 현행 규칙·AI 조건 확인 |
| Instagram / Threads / Bluesky | 공식 소유/로그인 확인 미완료 | 문안 재사용 후보, 게시 완료로 기록하지 않음 |

공식 [YouTube](https://www.youtube.com/@fordeargamers) · [공개 재생목록](https://www.youtube.com/playlist?list=PLKmxsIw9Q0Hk) · [Steam 데모 진입 상점](https://store.steampowered.com/app/4749590/EXODUSER_HELL_LORD/). 개발 기능을 데모 반영 패치로 소개하지 않는다. AI 보조 아트·음향 공개를 유지한다.

## 계속 갱신하는 방식

- 기존 **fdg** 점검에서 이 준비표와 [보스전 진행 상태](/Users/fordeargamers/.codex/worktrees/marketing-gameplay-20261008/the-exoduser/marketing/operations/boss-redesign-watch-20261009.json)를 함께 관리한다. 보스전 대기 중에도 매시간 부분 소재 확인·제작·운영을 함께 진행한다. 완료 버전 대표 트레일러 인도 뒤 기존 화·금11:00 KST 운영으로 복귀한다.
- 각 소재에 변경 근거·버전/커밋·실제 적용 여부·화면/원음·남은 검수·영상 파일/해시·게시 URL·다음 조치를 기록한다. 같은 자료를 반복 검수하거나 재게시하지 않는다.
- 변경이 있으면 이 문서와 [구조화 현황](../../marketing/operations/content-ready-index.json)을 함께 갱신한다. 변화 없는 진행 상태는 조용히 유지하고 전체 저장소 재조사는 하지 않는다.
- 게시 전에는 단일 소재의 예고→개발 과정/개선 전후→실제 업데이트→피드백 반영을 이어 기록한다. 길이·운영 방식은 [얼리액세스 사례 조사](EARLY_ACCESS_MARKETING_BENCHMARK_20261010.md)를 따른다.
- 운영 기록과 본인 변경만 커밋·GitHub 보존한다. 개발 코드·타 팀 파일·사용자 게임·서버·세이브를 변경하거나 재시작하지 않는다.

## 자료 근거

- **캐릭터·세계관 원화 티저 30초**: [근거1](/Users/fordeargamers/the-exoduser/docs/13출시·마케팅/TRAILER_ART_REFRESH_20261009.md) · [근거2](/Users/fordeargamers/the-exoduser/output/trailer-art-refresh-20261009/EXODUSER_ART_TEASER_30S_20261009.mp4)
- **현행 개발본 전투 티저 V3 18초**: [근거1](/Users/fordeargamers/.codex/worktrees/marketing-gameplay-20261008/the-exoduser/docs/13출시·마케팅/NEW_VERSION_TRAILER_PRODUCTION_20261009.md) · [근거2](/Users/fordeargamers/the-exoduser/output/trailer-production-20261009/FINAL_REVIEW/EXODUSER_NewVersion_CombatTeaser_20261009_REVIEW_V3.mp4)
- **네메시아 자막 배경 제거 수정본**: [근거1](/Users/fordeargamers/.codex/worktrees/marketing-gameplay-20261008/the-exoduser/docs/13출시·마케팅/NEMESIA_TEXT_ONLY_FIX_20261008.md) · [영상](https://youtu.be/0ERvrpHccZQ)
- **전사 컷씬**: [근거1](/Users/fordeargamers/.codex/worktrees/marketing-gameplay-20261008/the-exoduser/marketing/releases/20261008/deployment/publication-results.json) · [영상](https://youtu.be/r_TTBUrA6p4)
- **지옥의 틈 개발 기록 v0.1**: [근거1](/Users/fordeargamers/.codex/worktrees/marketing-gameplay-20261008/the-exoduser/docs/13출시·마케팅/RIFT_DEVLOG_V01_20261008.md) · [영상](https://youtu.be/i7ouSzivg4U)
- **패링·얼음오브 Shorts A/B**: [근거1](/Users/fordeargamers/.codex/worktrees/marketing-gameplay-20261008/the-exoduser/marketing/releases/20261008/deployment/publication-results.json) · [영상1](https://youtube.com/shorts/50eBpMxlkP0) · [영상2](https://youtube.com/shorts/NBOcxJgM-pA)
- **드루이드 독탄 가독성·접촉 효과·효과음** — 커밋 95cd06b3, 848f4cdb, 7c3e691a: [근거1](/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/5.1임펙트디자인/DRUID_PROJECTILE_READABILITY_20261009.md) · [근거2](/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/5.1임펙트디자인/DRUID_POISON_HIT24_ENGINE_20261009.md) · [근거3](/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/6사운드디자인/DRUID_POISON_PUBLIC_SFX_20261009.md)
- **드루이드 뿌리 분출 48장** — 커밋 91ac00bc: [근거1](/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/5.1임펙트디자인/DRUID_ROOTS48_ENGINE_20261010.md)
- **보스 내려찍기·점프·벽충돌 충격** — 커밋 b1a620fe, 6be8c225, 95be212d, a1d4d993: [근거1](/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/5.1임펙트디자인/BOSS_JUMP_IMPACT24_ENGINE_20261010.md) · [근거2](/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/5.1임펙트디자인/BOSS_SLAM_IMPACT24_ENGINE_20261010.md) · [근거3](/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/5.1임펙트디자인/BOSS_CHARGE_WALL_IMPACT24_ENGINE_20261010.md)
- **크라켄 물구체·접촉·Q 패링 물보라** — 커밋 a359bcd4, 91d49434: [근거1](/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/5.1임펙트디자인/KRAKEN_WATER_ORB24_ENGINE_20261010.md) · [근거2](/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/5.1임펙트디자인/BOSS_WATER_IMPACT24_ENGINE_20261010.md)
- **화마귀 용암구·접촉·Q 패링 임팩트** — 커밋 5a3247e6, 04abab63, 82777bb2: [근거1](/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/5.1임펙트디자인/FIREDEVIL_ORB24_ENGINE_20261010.md) · [근거2](/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/5.1임펙트디자인/BOSS_FIRE_Q_IMPACT24_ENGINE_20261010.md)
- **변성술사·헬 헌터/크루시폼·아케인 랜서 원화**: [근거1](/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/10ai에셋프롬프트모음/VIDEO_CHARACTER_BASES_20260928.md) · [근거2](/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/13출시·마케팅/FDG_HOMEPAGE_CHARACTERS_20260928.md)
- **기존 메인37초·구 네메시아·과거 R1**: [근거1](/Users/fordeargamers/.codex/worktrees/marketing-gameplay-20261008/the-exoduser/marketing/releases/20261008/deployment/publication-results.json)
