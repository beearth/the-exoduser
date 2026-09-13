# 새로 배운 스킬별 튜토리얼

사용자 확정: 모든 스킬을 새로 배우면 해당 스킬의 별도 튜토리얼을 제공한다. `skill-tutorial.js`와 `skill-tutorial.css`를 일반/쉬운 게임에 공통 로드한다. 전투 스킬55개와 성장 패시브26개 전부 안내 정의를 가진다.

| 항목 / ID | 현재 코드 계약 |
|---|---|
| 신규 습득 | `snapshot()`으로 변경 전 `P.skills/PASSIVES`를 복사하고 `record(before)`에서 0 또는 미보유→양수 전환만 큐에 추가. 레벨 강화는 제외 |
| 학습 경로 | `_skClick` 개별 습득, `_learnSkillAuto` 추천 자동, `_execFuse`의 신규 구성/히든 지급, `addExp`의 Lv300 푸른비·Lv700 버스트루프/유령 허수아비, 성장 화면 `applyPlan/changePassive`의 첫 패시브 투자 |
| 동반 지급 | 기동불꽃 학습 시 기동파괴 동반 지급도 별도 항목. 합체로 새로 지급되는 평화의보호·참회도 별도 항목 |
| 신규 캐릭터 | 저장 상태가 없는 Lv1 캐릭터는 첫 이용 가능한 틱에서 기본 보유 스킬까지 등록. 기초 연습 중 임시 지급은 제외하고 연습이 끝난 실제 보유 목록으로 등록 |
| 기존 저장 | `dbRestore`에서 신규 필드 없는 기존 세이브는 빈 큐/완료 목록으로 복원. 보유 스킬을 소급 자동 팝업하지 않으며 우측 `스킬 연습`에서 복습 가능 |
| 순서 | `P._skillTutorial={queue:[],done:[]}`. 전투 스킬은 `SKILL_LIST` 순서, 패시브는 `PASSIVE_DEF` 순서로 한 습득 트랜잭션의 신규 항목을 추가. 기존 대기열 뒤에 연결. ID 중복 없음 |
| 별도 안내 | 각 스킬의 이름·효과 설명은 현행 `SKILL_LIST`, 패시브는 `PASSIVE_DEF` 참조. 고정/선택 슬롯과 현재 무기·마법·날개치기·보호막 키 바인딩을 표시. Shift/숫자/Space/F/Ctrl/T/X/Z는 실제 고정 입력 경로를 안내 |
| 실습 | 실제 전투 화면에서 수행하는 안내 과제. `read→practice→success`, WASD 중 아무 키 또는 `연습 시작`으로 진입. 안내를 읽기만 하거나 다른 스킬을 써서는 완료되지 않음 |
| 효과형 | `passive:` 접두사26종 및 자동 방어 구체 `guardian`은 `explain` 모드. 별도 시전 키 없이 설명을 읽고 `효과 확인`으로 완료 |
| 성공 이벤트 | 기존 `_addSkProf/_addSkProfTick`의 성공 경로 관찰. 연습 중(`_parryLesson.active`) 이벤트는 제외. 지속형은 실제 활성 틱을 인정 |
| 설치 스킬 | `_isAiming/_msAiming/_mmAiming/_tsAiming/_hrAiming/_bwAiming`이 참이면 완료 차단. 아이스스톰의 실제 장판 설치와 폭풍소환의 실제 발사에 별도 성공 훅 |
| 실패 오판 방지 | `venomBlade/maliceHunt/ltnChaser/timeWarp/burstLoop`는 일반 숙련 이벤트를 무시. 자원/조건 검사 통과 후 실제 시전 훅의 `used(id,true)`만 인정. 버스트루프는 충전 시작이 아닌 1단 이상 폭발 때 완료 |
| 처형 | X 입력의 보스·HP/MP/ST 조건 통과 및 실제 비용 차감/쿨다운 시작에서 `used('execution')` 호출 |
| 합체 흡수 | 현재 활성 합체의 구성 스킬이면 실제 호스트 시전을 사용 경험으로 인정. `_FUSE_PAIRS`, `P._fused`, `fusionContains(host,id)`로 동일 합체 소속을 확인. 미관련 스킬은 인정하지 않음 |
| 다음 / 나중에 | 성공 시 완료 목록 추가·큐에서 제거·`dbSaveNow`. `다음`으로 다음 스킬. `나중에`는 완료하지 않고 현 방문의 표시만 미룸. 큐는 저장에 남아 재접속 시 재안내 |
| 재연습 | 우측 `스킬 연습` 버튼에서 실제 보유 전투 스킬/패시브 목록을 열고 원하는 스킬 선택. 완료 스킬도 재연습 가능. 미보유 항목은 현재 과제를 막지 않고 대기열에 보존 |
| 게임 상태 | 게임 실행·생존·비일시정지·인트로 종료·기초 연습 비활성일 때만 표시/완료. 게임을 강제로 멈추거나 자원·슬롯·월드·스킬 레벨을 변경하지 않음. 기존 자원/쿨다운/대상 조건 사용 |
| 저장 | 모든5개 세이브 빌더에 `skillTutorial:{queue,done}`를 복사해 기록. 일반 `dbRestore` 및 DEMO500 `_d5` 복원에서 로드. 알 수 없는 ID/중복/이미 완료한 큐 항목 제거. 캐릭터가 바뀌면 런타임 선택/미루기/목록 상태 초기화 |
| UI | `#skillTutorial`: 우측18px/상단160px, 최대360px, 높이 `100vh−180px`, z100005. 버튼 상단48px/z100006. 높이600px 이하에서는 패널 padding12px·버튼 상단12px. 배지 아래 배치하며 패널 표시 중 기존 시스템 안내는 CSS로 숨겨 겹침 방지 |
| DOM / 갱신 | 생성한 리프 노드만 textContent 갱신. 복습 목록은 `replaceChildren`. 현재/단계/큐 변경 즉시, 그 외15틱마다 표시 갱신. 튜토리얼 버튼 마우스 이벤트가 전투로 전파되지 않음 |
| 기존 과제 | 기초·자원·시스템의 기존 체크리스트 및 해당 배지 조건을 수정하지 않음. 새 스킬 과제 완료 목록은 캐릭터별 독립 저장 |
| 캐시 | 일반/쉬운 HTML에서 JS `v=20260913-2`, CSS `v=20260913-3` |
| 검증 | `tools/test-skill-tutorial.cjs`:55+26 정의, 실제 추천 자동 및 동반 지급, 업그레이드 제외, 대기열 순서, 저장/복원, 미루기/복습, 임시 지급 제외, 설치 조준 차단, 조건 실패/실제 시전 구분. 양쪽 HTML 문법 검사 별도 수행 |
| 브라우저 검증 | 실제 추천 자동 학습에서 악의기둥→파쇄의 영역 대기열 및 학습 창 닫은 뒤 표시. 악의기둥 발동 완료. 독사의 ST 부족 시 미완료/실제 발사 시 완료. 아이스스톰 조준만으로 미완료/장판 설치 시 완료. 맹공 패시브 효과 안내·완료 저장/복원 확인. 카드 렌더 확인.55종 전체를 각각 실제 플레이한 검증은 아님 |

## 등록된 스킬별 안내

아래 표의 효과는 스킬 정의를 실시간 참조한다. 수치·공식은 별도로 복제하지 않는다. `자동 적용`은 효과 확인 과제다.

| ID | 한글명 | 안내 방식 | 조작/슬롯 |
|---|---|---|---|
| `chargeBoost` | 사슬기동:충돌 | 실제 발동 | ShiftLeft |
| `magicBlink` | 사슬기동:화염 | 실제 발동 | ShiftLeft |
| `ghostWalk` | 뇌전걸음 | 실제 발동 | ControlLeft |
| `bladeDash` | 전격이동 | 실제 발동 | W / A / S / D |
| `kiSlash` | 기검참 | 실제 발동 | mouse0 |
| `fireball` | 악의구 | 실제 발동 | mouse2 |
| `whirlwind` | 회전참 | 실제 발동 | mouse0 |
| `detonate` | 기폭팔 | 실제 발동 | KeyQ |
| `maliceSwipe` | 칼등 처내기 | 실제 발동 | KeyE |
| `fanShot` | 만화방창 | 실제 발동 | KeyT |
| `omniBeam` | 멸살광선 | 실제 발동 | mouse2 |
| `elemMissile` | 원소추적탄 | 실제 발동 | mouse2 |
| `guardian` | 악의 보호자 | 효과 확인 | 자동 적용 |
| `maliceHunt` | 악의 사냥 | 실제 발동 | 1–4 |
| `venomBlade` | 독사 | 실제 발동 | 1–4 |
| `ltnChaser` | 뇌전추격자 | 실제 발동 | 1–4 |
| `maliceMortar` | 폭풍소환 | 실제 발동 | 1–4 |
| `boneWall` | 해골무덤 | 실제 발동 | 1–4 |
| `blackStar` | 블랙 | 실제 발동 | KeyZ |
| `lavaSummon` | 탄막블랙홀 | 실제 발동 | KeyZ |
| `execution` | 처형 | 실제 발동 | KeyX |
| `iceOrb` | 얼음보주 | 실제 발동 | ControlLeft |
| `needleShot` | 만화방창 II | 실제 발동 | KeyT |
| `arcLaser` | 얼음송곳 | 실제 발동 | mouse2 |
| `fireBeam` | 업화선 | 실제 발동 | mouse2 |
| `maliceDome` | 신의영역 | 실제 발동 | 1–4 |
| `fireAura` | 지옥진 | 실제 발동 | mouse2 |
| `plagueBurst` | 폭독칼날 | 실제 발동 | 1–4 |
| `maliceStorm` | 악의폭풍 | 실제 발동 | 1–4 |
| `darkPillar` | 악의기둥 | 실제 발동 | 1–4 |
| `holyDome` | 회복의 영역 | 실제 발동 | KeyF |
| `holyPrison` | 구속의 영역 | 실제 발동 | KeyF |
| `iceStorm` | 아이스스톰 | 실제 발동 | 1–4 |
| `giantSlam` | 지옥강타 1 | 실제 발동 | Space |
| `giantSlam2` | 지옥강타 2 | 실제 발동 | Space |
| `skyCrusher` | 천공쇄기 | 실제 발동 | Space |
| `chainAssault` | 기동불꽃 | 실제 발동 | ShiftLeft → mouse2 |
| `chainSlam` | 기동파괴 | 실제 발동 | ShiftLeft → KeyE |
| `chainSlash` | 기동칼날개 | 실제 발동 | ShiftLeft → mouse0 |
| `peaceShield` | 평화의보호 | 실제 발동 | KeyQ |
| `hellRay` | 참회 | 실제 발동 | mouse2 |
| `shieldThrow` | 칼등날개 | 실제 발동 | KeyE |
| `weakPhys` | 파쇄의 영역 | 실제 발동 | KeyF |
| `weakMag` | 침식의 영역 | 실제 발동 | KeyF |
| `weakPj` | 관통의 영역 | 실제 발동 | KeyF |
| `weakRev` | 부활의 영역 | 실제 발동 | KeyF |
| `spikeTrap` | 가시덫 | 실제 발동 | 1–4 |
| `blueShot` | 푸른비 | 실제 발동 | mouse2 |
| `burstLoop` | 버스트루프 | 실제 발동 | mouse2 |
| `voidScarecrow` | 유령 허수아비 | 실제 발동 | 1–4 |
| `explodeScarecrow` | 폭발 허수아비 | 실제 발동 | 1–4 |
| `ancestorSummon` | 전대 소환 | 실제 발동 | 1–4 |
| `ghostXbowTurret` | 공성쇠뇌 | 실제 발동 | 1–4 |
| `timeWarp` | 시간왜곡 | 실제 발동 | ControlLeft |
| `thunderStake` | 뇌전창 | 실제 발동 | 1–4 |

## 패시브 안내

| 저장 ID | 한글명 | 안내 방식 |
|---|---|---|
| `passive:pAtk` | ⚔️ 맹공 | 현행 PASSIVE_DEF 효과·조건 확인 |
| `passive:pCharge` | 🔱 돌파 | 현행 PASSIVE_DEF 효과·조건 확인 |
| `passive:pParry` | ⚡ 반격 | 현행 PASSIVE_DEF 효과·조건 확인 |
| `passive:pMagic` | 🔮 마력폭주 | 현행 PASSIVE_DEF 효과·조건 확인 |
| `passive:pBow` | 🎯 정밀사격 | 현행 PASSIVE_DEF 효과·조건 확인 |
| `passive:pGuard` | 🛡 수호신 | 현행 PASSIVE_DEF 효과·조건 확인 |
| `passive:pRegen` | 💚 회복력 | 현행 PASSIVE_DEF 효과·조건 확인 |
| `passive:pCrit` | 💥 급소 | 현행 PASSIVE_DEF 효과·조건 확인 |
| `passive:pDrop` | 🎁 약탈 | 현행 PASSIVE_DEF 효과·조건 확인 |
| `passive:pPierce` | 🔱 관통 | 현행 PASSIVE_DEF 효과·조건 확인 |
| `passive:pMRegen` | 💠 마력회복 | 현행 PASSIVE_DEF 효과·조건 확인 |
| `passive:pXbow` | 🏹 쇠뇌력 | 현행 PASSIVE_DEF 효과·조건 확인 |
| `passive:pMelee` | ⚔ 광전사 | 현행 PASSIVE_DEF 효과·조건 확인 |
| `passive:pCombo` | 🎯 추적자 | 현행 PASSIVE_DEF 효과·조건 확인 |
| `passive:pAbund` | 🌿 풍요 | 현행 PASSIVE_DEF 효과·조건 확인 |
| `passive:pPred` | 🐺 약자포식 | 현행 PASSIVE_DEF 효과·조건 확인 |
| `passive:pDot` | ☠ 침식 | 현행 PASSIVE_DEF 효과·조건 확인 |
| `passive:pVital` | 💎 마력그릇 | 현행 PASSIVE_DEF 효과·조건 확인 |
| `passive:pStamina` | 💪 힘의그릇 | 현행 PASSIVE_DEF 효과·조건 확인 |
| `passive:pMalice` | 👿 악의중독 | 현행 PASSIVE_DEF 효과·조건 확인 |
| `passive:pFortify` | ❤️ 강인 | 현행 PASSIVE_DEF 효과·조건 확인 |
| `passive:pArmor` | 🛡 철벽 | 현행 PASSIVE_DEF 효과·조건 확인 |
| `passive:pHunter` | 🎯 사냥꾼 | 현행 PASSIVE_DEF 효과·조건 확인 |
| `passive:pHuman` | ✦ 인간성 | 현행 PASSIVE_DEF 효과·조건 확인 |
| `passive:pDemon` | ☠ 악마성 | 현행 PASSIVE_DEF 효과·조건 확인 |
| `passive:pRage` | 🔥 분노폭주 | 현행 PASSIVE_DEF 효과·조건 확인 |
