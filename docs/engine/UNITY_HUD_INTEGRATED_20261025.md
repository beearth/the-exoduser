# 하단 HUD 공통 받침 — 2026-10-25

## ROOT 최종 인수 — 2026-10-25

ROOT 시각 인수(source9dd5991057da5d8db116e4fae73db6f258ca6a77): 실제720/1080 Player에서 공통 받침·구슬/슬롯 연결·라벨 간격을 확인했다. 새 PNG는 `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-LOBBY-20261025/startup-capture-9dd5991/startup-gameplay-hud-720p.png`와 같은 폴더의1080p이다. d8f00e2의 두 해상도에서 라벨 보정을 먼저 확인했고, 마지막9dd5991에서는 Guide/전환 후 같은 HUD를 확인했다. 입력 영역·전투 수치·13개 이름은 그대로다. 최신 실행본은 `UNITY_MAC_PLAYABLE_20261025.md`를 따른다. 아래 후보/인수대기 문장은 구현 단계의 이전 기록이다.

상태: 표현 코드 구현, ROOT의 실제 Player 렌더·시각 인수 대기. 사용자의 HP/13슬롯/분할자원 구슬 일체감 개선 요청은 이번 HUD에 한해 원본 그대로 이식 원칙의 승인된 예외다. 새 전투 기능 또는 자원·입력 변경은 아니다.

## 근거와 목표

사용자 첨부는 `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-LOBBY-20261025/hud-reference-current/hud-reference.png` (1046×214, SHA256 `07143f8903b3d75e0ac9d717c28c619474d2ccb318376402cae6c4dbfa0baee0`). 현재 Native before는 같은 출력 루트의 `warrior-story-smoke-b45d7af0f/story-gameplay-natural-720p.png`. 두 PNG를 직접 확인했다. 기존 세 아트의 기준선은 같지만 연결 받침이 없고 기검참 상태 검정띠가 슬롯 위에 분리돼 있다. 중앙 하단에 낮은 공통 실루엣과 곡면 shoulder, 얕은 금속 lip, 접지 그림자를 더한다. 전체폭 프레임이나 큰 반투명 사각판은 만들지 않는다.

## 표현 계약

좌표는 기존 1920×1080 균등 배율 공간이다. `NativeHudDockLayout`의 ArtScale .9, 중앙 1040폭 구슬 배치, 13슬롯·ActiveSlot·PointerOverSlots rect는 변경하지 않는다. 기존 HP/MP/ST fill·shield·poise·transition·상태/비용 계산과 입력 executor도 그대로다.

| 요소 | 구현 수치 / 원본 |
|---|---|
| 공통 받침 | `NativeHudPresentation.cs`, 중앙 1048×172 범위. 기존 아트 바깥 각4px는 접지 lip/그림자 여유이며 구슬 위치는 유지 |
| 곡면 상단 | 중앙부터 거리274까지 상단8, 거리352까지 SmoothStep으로77, 끝524까지144로 하강. 1px alpha 가장자리, 2px 부근 밝은 lip, 5px 부근 recess |
| 표면 | CPU에서 최초1회 생성한 RGBA32 두 장. 저명도 금속 grain/음영과 같은 contour의 그림자. 매 프레임 재생성하지 않음. Dispose에서 해제 |
| 기존 금속 재사용 | `Art/ui/inventory/iron.png` 원본1254×1254를 상태 ridge·키판·바닥 rail에 UV로 재사용. PNG·import 설정 변경 없음 |
| 상태 ridge | 중앙540×30, y=`VisibleBar.y−30`. 기존 떠 있던 `SlotBar.y−18` 검정판 제거. 동일 상태 문자열·충전 비율/5px meter 유지 |
| 바닥 rail | 중앙620×10, y=`height−13`, 어두운 금속과1px 하단 반사. 기존 아트 아래 공통 기반으로 연결 |
| 키13개 | 기존 각 키판 rect·문자 유지, 독립 단색 검정 바탕을 동일 철 texture로 교체. 내용은 좌우3px씩 inset(총6 logicalpx), 이 내용폭에 맞춰 가로 squeeze. 글자 높이18logicalpx=720p에서12physicalpx 유지. 인접 최대폭 글자 사이8logicalpx=720p에서약5.3physicalpx 확보 |

기존 도킹/구도 이력은 `UNITY_UI_DOCK_20261024.md`, `UNITY_UI_COMPOSITION_20261024.md`를 유지한다. 이번 표현 후보의 현행 상세는 이 문서다. 이전 문서의 실제 렌더 PASS는 이번 변경의 시각 PASS로 승계하지 않는다.

## 검수 경계

본 worker는 제품 소유3파일 중 `NativeHud.cs`, `NativeHudSkills.cs`와 새 presentation만 변경했다. `NativeHudDockLayout.cs`는 동일 byte. 정적 diff/geometry 계약 확인과 `git diff --check`를 수행한다. 기존 `PortVerification`의 layout 검사는 Editor 진입이 필요하여 재실행하지 않았고, 중복 컴파일·GPU·Unity 빌드·GUI·서버 조작도 하지 않는다. ROOT가 동일 실제 장면1920/1280 렌더의 연결 실루엣·글자·fill·잘림을 확인할 때까지 VISUAL VERDICT는 미검수다. 세이브·Simulation·NativeGame·캐릭터·로비·시작 flow·인벤토리는 변경하지 않는다.

## ROOT 실화면 후 라벨 간격 보정 후보

통합 `1afffb9`의 `startup-capture-1afffb9/startup-gameplay-hud-720p.png`와 `startup-gameplay-hud-1080p.png`를 직접 확인했다. ROOT는 공통 받침·연결 실루엣을 인수 가능으로 판단했다. 720p에서 LMB/RMB/Shift가 연속 문자열처럼 붙는 문제는 기존 각 label이 키판폭 끝까지 채워졌기 때문이다. 위 좌우3px 내용 inset만 추가했으며 key13문자·키판·hitrect·ArtScale·원본이미지·수치는 유지한다. 이 라벨 후보의 실제 PNG는 ROOT의 다음 통합 빌드에서 확인하며, worker의 GPU/GUI/빌드·기존 suite 재실행은 없다. 현재 라벨 최종 시각 인수는 대기다.
