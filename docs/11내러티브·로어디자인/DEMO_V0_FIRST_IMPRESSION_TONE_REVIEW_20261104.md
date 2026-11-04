# 데모 v0 첫인상 문구 톤 검수 (한국어·영어) — STY-24

기준일: 2026-11-04. 스토리 총괄. CTO 배정 "데모 v0 ③ 첫인상 문구".
기준: origin/unity/main `731b4b558`의 `Resources/Data`. 설정 정본은 [STORY_LEAD_MASTER](STORY_LEAD_MASTER_20261026.md)(이하 SLM)와 거기서 가리키는 캐릭터·펫 정본이다.

- 적용은 아래 데이터 패치 제안을 유니티 총괄이 반영하는 방식으로만 한다. 이 문서는 게임 데이터를 바꾸지 않는다.
- 한국어 문장이 바뀌는 행은 새 번호(No.4274~4287)로 [번역대상_전체목록](../16번역·로컬라이제이션/번역대상_전체목록.md)에 등록했다. 영어만 바뀌는 행은 기존 번호의 EN 칸을 고친다.
- 반영할 때 나머지 27개 언어도 같은 뜻으로 맞춰야 한다.

## 0. 범위와 화면 노출

| 대상 | 파일 | 화면에 나오는가 | 결과 |
|---|---|---|---|
| 데모 문구 81항목 | `demo_text.json` (`NativeDemoText`) | 나옴 | 영어 5건 수정 |
| 사망 결정 화면 | `death_decision_text.json` | 나옴 | 영어 1건 수정 |
| 부활 대기 화면 | `death_screen_labels.json` | 나옴 | 영어 1건 수정 |
| 사망 펫 대사 | `death_web.json` `petLines` | **안 나옴**. `NativeDeathOverlay`가 불러오기만 하고 그리지 않는다 | 낡은 사본 1건 표시 |
| 펫 말풍선 | `pet_bubble.json` | 나옴 | 영어 2건 수정. 나오는 조건은 [STY-23 §6](DEMO_V0_1_1_TEXT_AUDIT_20261104.md) 참고 |
| 1-1 지옥문 라벨 | `hellgate_objectives.json` | 나옴 | 영어 1건 수정 |
| 캐릭터 선택 | `NativeLobby.CharacterPresentation.cs` 표, `visual_select_labels.json`, `character_basic_stories.json`, `character_dialog_labels.json` | 나옴 | **P0 1건**, P1 4건 |

## 1. P0 — 설정과 정면으로 어긋남

| # | 위치 | 지금 | 고친 안 | 근거 |
|---|---|---|---|---|
| C1 | 캐릭터 선택 3번 총기 슬롯: `presentationNames[2]`·`presentationJobs[2]`·`presentationDescriptions[2]`·`presentationTraits[2,*]` | 이름 **헬거너**, 직업 창포수, 설명 "자신의 피를 탄환 삼는 혈월의 창포수", 특성 혈탄 장전(체력 소모 관통탄)·관통 창격·역추진 도약. 그런데 같은 화면 왼쪽 기본 스토리는 **아이반**(자기 폭탄이 고향을 부순 죄책감)이다 | 이름 **아이반 / Ivan**(No.4274), 직업 **폭파공 / Demolitionist**(No.4275), 설명 **"그가 지나간 자리엔 검은 연기만 남는다" / "Where he passes, only black smoke remains."**(No.4276). 특성 3개는 아래 표 C1-특성 | SLM STY-D1(10-26 사용자): 총기 슬롯은 검은 연기 아이반, 헬거너(갤럭시 헌터)는 보관. SLM §7 STY-10 아이반 카드 초안 v1. 아이반 전투 바이블: 헬거너의 HP 탄을 복제하지 않는다 |

C1-특성 (`presentationTraits[2,*]`, 아이콘 키는 그대로 두고 디자인 총괄이 판정):

| 칸 | 제목 KO / EN | 본문 KO / EN | No. |
|---|---|---|---|
| 0 | 무거운 한 발 / One Heavy Round | 중거리에서 큰 약실의 한 발로 목표를 무너뜨립니다. / From mid-range, bring your target down with one heavy-chamber round. | 4277·4278 |
| 1 | 붉은 부착탄 / Red Sticky Charge | 적에게 붙인 탄이 잠시 뒤 터져 몰려든 무리를 흩어 놓습니다. / A round stuck to an enemy bursts a moment later and scatters the crowd. | 4279·4280 |
| 2 | 검은 연기 / Black Smoke | 연막을 남기며 옆으로 빠져 다음 사격 자리를 잡습니다. / Leave a smokescreen as you slip aside and take your next firing position. | 4281·4282 |

- 슬롯 ID `exoduser_hellgunner`, `comingSoon`, 원화·문장 아이콘은 바꾸지 않는다(SLM §7, STY-D5).
- 레일 라벨(`NativeLobby.CharacterPresentation.cs` 198행, `NativeLobby.SilverCharacter.cs` 121행 `railLabels`)의 "헬거너"도 "아이반"으로 바꾼다.

## 2. P1 — 설정·말투가 어긋남

| # | 위치 | 지금 | 고친 안 | 근거 |
|---|---|---|---|---|
| C2 | 실버테일 한 줄 설명 `presentationDescriptions[1]` (No.3712) | 회전하는 단 하나의 검, 그녀의 춤은 파멸 / One spinning blade. Her dance brings ruin. | **단검과 그가 남긴 장검, 그녀의 춤은 파멸 / A dagger and the longsword he left behind. Her dance brings ruin.** (No.4283) | `SILVERTAIL_STORY_CANON_20261028.md` 머리말·무기 행(11-02 사용자 정정): 본래 단검 암살자이고, 등에 부착된 회전 공격용 장검은 다이안의 무기다. "단 하나의 검"은 같은 화면 왼쪽 기본 스토리(단검과 장검)와 어긋난다 |
| C3 | 실버테일 특성 0 본문 `presentationTraits[1,0]` (No.3715) | 회전대검으로 사방의 적을 동시에 베어냅니다. | **등에 단 장검을 회전시켜 사방의 적을 동시에 베어냅니다. / Spin the longsword on your back to cut down enemies on every side.** (No.4284) | 같은 정본. 무기 이름을 "장검"으로 통일 |
| C4 | 실버테일 기본 스토리 EN `character_basic_stories.json` en.stories[1] | …She now fights with a dagger and a longsword attached to her back, striking as she spins. | **…She now fights with her dagger and Daian's longsword fixed to her back, striking as she spins.** (KO는 그대로, EN 칸만) | KO "다이안의 장검을 등에 부착하고"에서 '다이안의'가 EN에서 빠졌다. 그 검이 누구 것인지가 이 인물의 핵심이다 |
| C5 | 이름 입력 설명 `character_dialog_labels.json` description (No.4112) | 지옥에 보낼 캐릭터의 이름을 지어주세요 / Choose a name for the character you will send to hell. | **지옥에 보낼 자의 이름을 지어라 / Name the one you will send into Hell.** (No.4286) | 같은 화면 제목 "지옥에 강림할 화신을 선택하라"와 사망 화면 "포기할 것인가?"가 모두 하라체다. 이 줄만 해요체에 "캐릭터"라는 메타 단어를 쓴다. Hell은 다른 화면처럼 대문자로 쓴다 |
| C6 | 실버테일 특성 2 본문 `presentationTraits[1,2]` (No.3717) | 화려한 회피와 폭발적인 딜을 오가는 곡예입니다. | **화려한 회피와 폭발적인 공격을 오가는 곡예입니다. / Flow between graceful evasions and explosive strikes.** (No.4285) | "딜"은 게이머 은어라 다른 특성 문장(베어냅니다·되받아칩니다)과 결이 다르다 |
| C7 | 창법사 기본 스토리 KO `character_basic_stories.json` ko.stories[4] | 수만 년간 전쟁이 이어진 호전적인 세계, 트발토. 마법과 전사의 모든 클래스를 마스터한 최고등급의 리더로서 전장을 지배한다. | **수만 년간 전쟁이 이어진 호전적인 세계, 트발토. 마법과 전사의 모든 클래스를 마스터한 최고등급의 리더, 창법사는 전장을 지배한다.** (No.4287, EN은 이미 Spearmage가 주어라 그대로) | 둘째 문장에 주어가 없어 누가 지배하는지 읽히지 않는다. `SPEARMAGE_STORY_CANON_20261102.md`가 사용자 직접 설정이라 단어는 그대로 두고 주어만 넣는다 |
| D1 | 사망 결정 화면 EN 제목 `death_decision_text.json` en.title (No.4264) | There is no rest — 바로 밑 장식 행 THERE IS NO REST와 같은 말이 두 번 나온다 | **The dead find no rest** (EN 칸만, KO "안식은 없다"·장식 행은 그대로) | KO 화면은 한국어 제목과 영문 장식이 짝을 이루지만, EN 화면은 같은 문장의 반복이 된다. "지옥에 떨어진 자(망자)"는 전사 소개·펫 대사의 공통 설정이다 |
| D2 | 사망 펫 대사 `death_web.json` dd_queen (지금은 화면에 안 나옴) | …여왕님이 실망하시겠군. | **…여신님이 실망하시겠군.** (웹 현행 latest-web 06ac6882b와 같은 값으로 다시 옮김) | SLM STY-D14·D18: 펫이 말하는 "여왕님"은 "여신님"으로 통일. Unity 사본은 10-26 추출본이라 낡았다. 사망 펫 대사를 화면에 붙일 때 사본 전체를 웹 현행으로 다시 옮긴다 |

## 3. P2 — 영어 다듬기 (KO 그대로, 기존 번호 EN 칸만)

| # | 위치 | 지금 EN | 고친 EN | 이유 |
|---|---|---|---|---|
| T1 | demo_text "새 거름이 떨어졌군." (No.3343) | Fresh compost has fallen. | **Fresh compost, dropped right in.** | 드루이드가 떨어진 플레이어를 거름이라 부르는 비아냥이다. 지금 문장은 "거름이 쓰러졌다"로도 읽힌다 |
| T2 | demo_text "출구가 열렸다!" (No.0516) | Exit opened! | **The exit is open!** | 같은 화면의 완성 알림 No.4258 "Boss slain · The exit is open"과 맞춘다 |
| T3 | demo_text "정화" (No.3105) | Purged | **Purified** | 지옥문 목표 패널은 "regions purified", "Region purified"를 쓴다. 같은 HUD에서 Purged/Purified가 섞인다 |
| T4 | demo_text "지옥문 봉인 (지역 " | Gate Sealed (Regions | **Hell Gate sealed (Regions** | 같은 화면의 "Hell Gate"(demo_text·지옥문 패널)와 맞춘다 |
| T5 | demo_text "…아직 기도가 끝나지 않았다." | …The prayer… is not yet finished. | **…The prayer is not yet finished.** | KO에 없는 중간 말줄임이 EN에만 있다 |
| T6 | 부활 대기 `death_screen_labels.json` next (No.3864) | Retry or return to the lobby shortly | **In a moment: retry or return to the lobby** | "shortly"가 문장 끝에 붙어 "짧게 돌아가라"처럼 읽힌다 |
| T7 | 지옥문 direction (No.4257) | To the boss room — follow the gate on the minimap | **To the boss room — follow the Hell Gate marker on the minimap** | KO "미니맵 지옥문 표식"의 '표식'이 빠졌다 |
| T8 | 펫 crisis_hp30 고양이 "사슬 던져! 끌려가면 무적이야!" (No.0808) | Throw the chain! Invincible while pulled! | **Throw the chain! You're untouchable while it pulls you.** | 전보문 투다. 디로이는 느낌표를 경고에 한 번만 쓴다(`PET_VOICE_CANON_20261028.md` §2.1) |
| T9 | 펫 hp_critical 까마귀 "…죽기 직전이다. 패링해. 피를 채워." (No.2894) | ...Almost dead. Parry. Recover HP. | **…Almost dead. Parry. Take your blood back.** | 핵터의 짧은 명령체에 "Recover HP"는 시스템 문구처럼 읽힌다. KO "피를 채워"를 살린다. 말줄임은 KO처럼 `…`로 쓴다 |

## 4. 통과 (고칠 것 없음)

| 대상 | 판단 |
|---|---|
| 보스 이름 34개 | 웹 정본과 같다. 지옥기형(STY-D10)·킬루(No.3477) 반영됨 |
| 보스 처치·도주 대사(No.3344, die 대사) | 짧고 건조한 톤이 일정하다 |
| 사망 결정 화면 KO | 하라체로 통일돼 있다. "다시 일어선다 / 처음부터 다시 / 포기한다"와 결과 문장의 톤이 일정하다(동작 일치는 이 검수 범위 밖) |
| 펫 말풍선 KO 14문장 | 디로이(고양이)=도도·직설, 핵터(까마귀)=냉소·짧은 명령에 맞다. hp_critical의 `!!`는 정본이 허용한 긴급 경고 2줄 중 하나 |
| 지옥문 라벨 KO | 하라체·명사형이 일정하다. "앵글러" 표기(STY-23) 반영됨 |
| 전사·아이반·변성술사 기본 스토리 | 각 정본(전사 영상 원문, `BLACK_SMOKE_CHARACTER_STORY_20261026.md`, `TRANSMUTER_STORY_CANON_20261102.md`)과 같다 |

## 5. 보고만 하는 것 (이번 패치에 넣지 않음)

- 변성술사 카드의 직업 라벨은 "사신 / Reaper"이고 특성은 낫 하나뿐이다. 정본(`TRANSMUTER_STORY_CANON_20261102.md`)은 활·낫·창·검으로 무기를 바꾸는 변성술사다. 낫은 그중 한 형태라 충돌은 아니다. 다만 직업명은 디자인 LOCK 갱신 때 정한다.
- `visual_select_labels.json`에 화면에서 쓰지 않는 "쌍단검 기동" 2행이 남아 있다. EN 칸도 한국어다. 화면 노출은 없으므로 정리만 하면 된다(STY-03에서 "멈추지 않는 기동"으로 대체됨).
- `characterLoreKeys` 5문장(예: 실버테일 "마녀로 쫓겨 떨어진 지옥")은 STY-20에서 화면에서 뺀 옛 소개라 그려지지 않는다. 다시 쓸 때는 11-02 실버테일 정정과 맞춰 고쳐야 한다.
- 사망 펫 대사 `dd_purpose`류("가족의 원수")는 전사 전용 문맥이다. 데모 v0는 전사만 고를 수 있어 지금은 문제없다. 다른 캐릭터를 열 때 캐릭터별로 걸러야 한다.

## 6. 반영 체크리스트 (유니티 총괄)

1. C1~C7·D1·T1~T9의 KO/EN 값을 각 데이터와 `NativeLobby.CharacterPresentation.cs` 표에 넣는다.
2. 한국어가 바뀐 No.4274~4287은 나머지 27개 언어를 번역해 같은 파일에 넣는다. 웹 정본 키가 없는 새 문장이다.
3. EN만 바뀐 행은 번역 목록의 해당 No. EN 칸도 같이 고친다.
4. 화면 확인은 Mac 1920×1080 1x 캡처로 한다: 캐릭터 선택 5슬롯(특히 아이반 카드·실버테일 카드), 사망 결정 화면 en, 지옥문 패널 en.
