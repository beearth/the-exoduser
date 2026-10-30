# 사슬 제단 후보 구슬 정합 — 2026-10-31

기준8c7074c156c021731056448d15792489fc724d38의 Native 스킬 창 후속 소스 후보다. Core 실행 소유는11종/미이식44종 그대로다. 실제 Player/M1·Native 관리3단계·웹|Unity 영상·1x·공통/Desktop은 미완료 **NOT_READY**다.

| 항목 | 실제 웹 skill-forge.js | 이전 Native | 수정 후보 |
|---|---|---|---|
| Shift 모체 | chargeBoost 습득 시 모체 전환 | 모체 이름만 전환 | 모체·후보 함께 전환 |
| 구슬 수 | 모체 미습득2개, 습득6개 | 고정2개 | 동적2/6개 |
| 재료 | magicBlink, chainAssault, chainSlam, chainSlash, giantSlam | charge·magicBlink만 표시 | 실제5재료+기본charge |
| 정식판 순서 | 습득MB 우선0, 다른 습득재료1, 미습득3, 기본charge10/12 | 고정 순서 | 원문과 같은 안정정렬 |
| 데모 | dimBreach/dimSlam 허용으로 MB/기동불꽃 우선 규칙 유지, 뒤3재료 우선4·정식판 배지 | 후보 누락 | 원문 허용목록 기준 표시만 적용 |
| 미이식 저장 레벨 | P.skills 레벨로 후보 우선순위·배지 표시 | 미소유 값은 실행북에 없어서0 | 별도 읽기 전용 사본으로 표시 |
| 사슬 파생 아이콘 | SKILL_ICONS가3종 모두 chainSlash에 대응 | 해당 Native 아이콘 없음 | 원본1PNG 공용·런타임 원형 clip |

실제 forgeHost/forgeModel/orbItems와 원문 레시피·데모 허용목록을 실행한256조건에 저장 레벨 사본 검사를 더해 **7,440값0**이다. 충돌 습득유무·5재료 습득32조합·현재charge/MB·정식/데모를 포함한다. 원문은 비합체 상태에서 chainSlash 구슬을 봉인하지 않으므로 임의로 봉인하지 않는다. 합체·staged 재료·관계선/3D 제단 합성 연출은 여전히 미이식이며 이 후보는 실행 소유를 늘리지 않는다.

1920×1080 디자인 제단 로컬 좌표의 원문 orbSlots 계산: 지름58, 순서대로(253.4,377.2528),(880.6,377.2528),(253.4,196.1328),(880.6,196.1328),(410.2,105.5728),(723.8,105.5728). 기본2구슬은 앞2좌표다. 제단 원점(393,295.64), 이름 상단은 중심Y+42, 이름폭136·높이15, 둘째줄+16·높이14다. 기존 캡처의 제단 치수1134×671.36/예약영역을 넣은 원문 배치 결과이며 실제 Player 화면 증거가 아니다.

아이콘 img/skillskin_upscaled/chainSlash.png(420×512, SHA256 5d8ba076c7c3a799ef4d1bef8ff059ad5e872228c3de6b6da5d9d400700a7734)를 원본 byte 그대로 Resources/Art/ui/skill_icons/chainSlash_original.png에 재사용한다. 런타임에서 CSS object-fit:cover·scale1.18·원형 clip을128px 텍스처로 캐시한다. 흐린 구슬은 grayscale.75·brightness.56을 적용한다. 원본을 수정하거나 신규 생성하지 않는다. 미이식·정식판 표시와 실제 CanLearn/CanEquip 판정은 구분하며, 미이식 재료는 실행하지 않는다.

RestoreSkills는 미소유 레벨만 사본으로 보관해 SkillDisplayLevel에 제공한다. 원본 Dictionary의 후속 변경은 표시 사본에 영향을 주지 않는다. 소유 레벨은 항상 현재 실행북/기검 Config를 우선한다. CaptureSkills의 소유 목록·실제 저장 원문 보존·슬롯 예약은 그대로다.

고정41묶음 **8,877,916비교단위 불일치0**, 설치 Unity 참조 Core/Runtime 오류0(기존경고2/17). 근거: 사슬제단-구슬모델-원문.json, 제단6구슬-배치탐색.json, charge-orbits-green-r3/, charge-orbits-final-cpu/, charge-orbits-independent-compile-r1/. 모델 API 부재와 미소유 표시 API 부재를 각각 RED로 확인한 뒤 연결했다. 실제 클릭·학습·리셋·저장3단계·같은 화면1x는 아직 미검증이다. 현재 시스템 메모리 여유가 공식10GB보다 작아 신규 GPU/Player 실행0이다. 같은 HID 실패 방식을 반복하지 않는다.

### 2026-10-31 실제 조작 입력 소비 후속

[현행 계약](UNITY_SOURCE_INPUT_CONSUMPTION_20261031.md)에 K/KH/MB/MBjust 분리·조건부 just 소비·착지 literal 입력clear·실제 조작 한틱 공급자를 기록했다. 원문53,512값0, 기동파괴 홀드176,112값 RED144→0. 고정43묶음9,107,540단위0·설치참조0. Core11/미이식44 유지, 실제Player/M1/입력장치/OS반복/UI/영상/공통/Desktop은 미검증 NOT_READY다. HID 종료 문제의 해결 증거가 아니다.
