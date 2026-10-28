# Steam 이벤트 패치노트 게시본 — v0.7.10 (v0.7.0~v0.7.10 합본)

- 상태: **v0.7.10 사전 검토분 반영 · 빌드 결과·최종 게시 확인 대기 (사용자 확인 전 게시 금지)** — STEAM_UPDATE_RULES §7.4
- 범위 결정 (2026-10-28 사용자, CTO 승인 카드): 26258132(v0.7.9)는 Set Live하지 않고, 10-29 09:00 빌드(v0.7.10)를 Set Live 후보로 삼는다. 게시물은 **v0.7.0~v0.7.9 합본 + v0.7.10** — 플레이어가 지금 받은 마지막 공개 빌드(25202408, 2026-09-08 업로드) 이후 실제로 받는 변화 전체.
- 원본: `v0.7.0.md`(final), v0.7.1~v0.7.7 커밋 수동 큐레이션(노트 파일은 초안 그대로, 대부분 Godot 이식 커밋), `v0.7.8.md`·`v0.7.9.md`(final). v0.7.0 노트가 다루지 않은 2026-09-08~09-20 구간은 이후 다시 바뀐 것을 빼고 남은 큰 변화만 한 줄씩 넣었다.
- 최종 상태 기준으로 합쳤다: 여러 번 바뀐 항목(스킬 창·로고·튜토리얼 문구·전격이동)은 지금 게임에 있는 모습만 적는다.
- 이벤트 유형: Patch Notes / Game Update. 제목 `v0.7.10 Update (2026-10-29)`. EN 본문 = 기본 언어, KO = 같은 이벤트의 한국어 탭.
- 이 파일로 `steam_event_v0.7.9.md`를 대체한다.

## v0.7.10 준비·빌드 후 확인

- [x] v0.7.9 태그 `d04602919` → `origin/main 62b538d0063fbf045d0ed97fca3cac1c2580d198` 일반 커밋 169개 검토. 출시본 변경을 `v0.7.10.md` 한·영 final로 작성하고 아래 본문에 합쳤다. Unity·Godot·도구·문서·미반영 후보는 제외했다.
- [ ] 10-29 실제 빌드 source SHA까지 추가된 출시본 변경을 재대조하고 BuildID·smoke·게임 내 패치노트 캡처를 확인한다.
- [ ] 확정 BuildID의 Set Live와 합본 최종 게시 내용에 대한 사용자 확인을 받은 뒤에만 수동 게시한다.

## EN (BBCode)

```
[p]This update brings together everything since the last public build in September.[/p]

[h2]New[/h2]
[list]
[*]Added sounds for opening and closing panels, switching tabs, canceling actions, failed equipment changes, and salvaging gear
[*]The Warrior's basic evade is now a Roll — hold a direction and press Space (rebindable in Key Settings). Available from the start without a skill slot, invulnerable for most of the motion, and usable to break out of stagger and stun
[*]Lightning Dash is now a mage-only skill. Skill points spent on Lightning Dash and its fusions in existing saves are fully refunded
[*]Skill window rebuilt as a fusion altar — equippable skills float as orbs around it, and skills that can be fused are linked by arcs of lightning. Drag the skill in the center slot off the altar to clear it
[*]Gem quality (1–100) and Socket Stones — open up to 5 sockets on gear and upgrade low-quality sockets
[*]19 Legendary and 25 Unique items with exclusive looks, plus new affixes
[*]Added entrance and defeat lines for selected bosses across Chapters 1–3, along with pet reactions after Chapter 2 and 3 boss defeats
[*]The Dark Druid of 1-1 now sinks into the earth and escapes at its final defeat, and your pet has something to say about it
[*]Chapter 1 forest comes alive — 12 rotten bio-tree variants with swaying branches and blinking eyes
[*]Chapter 1 depth pass — trees occlude you, canopies fade, standing props cast shadows, and map borders gain foreground framing
[*]New Warrior two-handed sword swing and redrawn eight-direction Silvertail sprites
[*]Afterimage trails for movement skills
[*]New enemy attack warning sounds — melee, ranged, grab, and boss attacks each get their own cue
[*]New Dark Druid sound effects, a heavy critical hit sound, button sounds, and Chapter 1 forest ambience
[*]Completing a system guide now awards a badge medal, and the guide closes on its own after 5 seconds
[*]Guide text size setting and a new "Fit settings window to screen" option
[/list]

[h2]Improved[/h2]
[list]
[*]Reworked the entry screen with a logo and sigil depicting the seven rings of Hell and a broken chain
[*]Simplified the title menu, lobby, and character selection screen with fewer heavy borders and ornaments, silver serif lettering, and black-iron panels
[*]Compare the next stage’s difficulty across five cards, with arrow keys or A/D to change your selection
[*]Added a dark backing to tutorial guidance and unified boss-name, phase-transition, victory, and chapter-clear banners
[*]Refined pet dialogue to match each character’s voice and the story; expanded translations for boss names, dialogue, chapter progression messages, and loading tips
[*]Title screen remaster — new logo, a red-sun cliffside backdrop in motion, and black-iron menu buttons
[*]Unified colors across the game — title menu, windows, Skill window, Inventory, Settings, and HUD now use silver and black iron with crimson accents
[*]Settings and Skill windows trimmed of extra ornament for easier reading
[*]Number keys 1–4 are now skill slots only — potions are used by Auto Potion
[*]Reworked skill and hit effects across fire, dark, ice, water, arcane, and poison to match the hellish palette — no more neon stars, magenta sparkles, or teal smoke
[*]Ki Slash redrawn in silver and black, and Malice Orb now leaves a smoky comet tail
[*]Hell Slam — the bright flash that covered the screen is replaced by a white-hot core at the point of impact, and the lava erupts faster (damage and hitboxes unchanged)
[*]Explosions expand faster, and movement skills no longer wash the screen in orange
[*]New shots in the world intro, an updated Warrior story video, and many remastered cutscenes and loading images
[*]Bag sorting now ranks items by overall score instead of rarity, with auto-sort on by default
[*]Gem sockets redesigned as black-iron and bronze setting art, and the gear slot is renamed "Off-hand" for characters without shields
[*]Chapter 1 maps brightened so the art reads outside the player light; the altar's toxic moat, the east poison pit, and walkable map edges are easier to read
[*]Character list, creation, and entry screens rebalanced in the lobby
[*]Title plaques in Settings, Skills, Forge, and Stats auto-fit text in every language
[*]Corrected Silvertail's description to "Ceaseless Motion"
[*]Tutorial flow reorganized
[*]Translation pass — filled in missing lines and leftover Korean text in every language
[/list]

[h2]Fixed[/h2]
[list]
[*]Fixed poison projectiles, orbs, and pools remaining after the Dark Druid burrows away in 1-1
[*]Restored firing sounds for repeater and arcane crossbows
[*]Improved Korean pet-bubble wrapping to reduce breaks within words
[*]Fixed narrow chapter-clear messages wrapping long text unnecessarily
[*]Skills no longer go on cooldown when they fail to activate, and skill aiming is cleared when the game window loses focus
[*]The death menu responds to the keyboard correctly
[*]Item affix percentages and comparison warnings now display correctly
[*]Many stability fixes for skill resource costs, inventory, equipment stats, sound, and saving
[*]The east poison pit in Chapter 1 now matches its visible rim
[*]Burn, poison, and bleed damage no longer persists after retrying a boss room
[*]Skull totem no longer has an oversized invisible collision circle
[*]Bosses stuck in walls are safely relocated instead of dying instantly
[*]Ossuaries no longer roll random special effects they were never meant to have (applies to Ossuaries found after this update)
[*]Fixed broken frames in the world intro
[*]Fixed the game opening to a blank or wrong page on PCs where another program was already using its port — it now finds a free port automatically and shows a notice if none is available
[*]Enemy attack warning sounds no longer get cut off when combat gets loud, and no longer play by mistake on player skills or grab hits
[*]Removed an old terrain strip visible at the bottom of the start screen
[*]Tutorial now shows the correct Ki Slash 3rd-hit full charge time (2s)
[/list]

[h2]Balance[/h2]
[list]
[*]Malice Weakness no longer wears off — it lasts until the enemy dies and stacks up to 10 times (+30% each, up to +300%)
[*]Blast Shot resource drain now matches its listed cost of 5
[/list]
```

## KO (BBCode)

```
[p]이번 업데이트는 9월 마지막 공개 빌드 이후의 변경을 모두 담았습니다.[/p]

[h2]새 기능[/h2]
[list]
[*]창 열기·닫기, 탭 전환, 행동 취소, 장착 실패와 장비 분해를 알려 주는 효과음을 추가했습니다
[*]전사의 기본 회피가 구르기로 바뀌었습니다 — 방향키를 누른 채 Space(키 설정에서 변경 가능). 스킬 슬롯 없이 처음부터 쓸 수 있고, 동작 대부분이 무적이며, 경직·기절 중에도 빠져나올 수 있습니다
[*]전격이동은 마법사 계열 전용 기술이 되었습니다. 기존 세이브에서 전격이동과 관련 합체에 쓴 스킬 포인트는 모두 돌려드립니다
[*]스킬 창을 합성 제단으로 새로 만들었습니다 — 장착할 수 있는 스킬이 제단 둘레를 떠다니는 구슬로 보이고, 합성할 수 있는 스킬끼리 전류로 이어집니다. 가운데 슬롯의 스킬을 원판 밖으로 끌어내면 슬롯을 비울 수 있습니다
[*]보석 품질(1~100)과 소켓석 도입 — 장비의 홈을 최대 5개까지 열고 낮은 품질 홈을 승급할 수 있습니다
[*]전설 19종·유니크 25종 아이템과 전용 외관, 새 어픽스 추가
[*]1~3장 일부 보스의 등장·처치 대사와 2·3장 보스 처치 후 펫 반응을 추가했습니다
[*]1-1 다크드루이드가 마지막으로 쓰러질 때 땅속으로 가라앉아 달아나며, 펫이 이를 두고 한마디 합니다
[*]1장 숲이 살아 움직입니다 — 썩은 생체나무 12종 변형, 가지 흔들림, 눈 깜빡임
[*]1장 지형 입체감 강화 — 나무 뒤 가림, 수관 투과, 서 있는 사물의 그림자, 지도 경계 전경 연출
[*]전사의 양손 대검 휘두르기 동작과 실버테일의 8방향 몸 그림을 새로 만들었습니다
[*]이동 기술에 잔상 궤적 연출 추가
[*]적 공격 예고음 추가 — 근접·원거리·잡기·보스 공격마다 다른 소리로 미리 알려 줍니다
[*]다크드루이드 전용 연출음, 묵직한 치명타 타격음, 버튼 선택음, 1장 숲 환경음 추가
[*]시스템 안내를 마치면 배지 메달이 표시되고, 안내는 5초 뒤 자동으로 닫힙니다
[*]안내 글자 크기 설정과 '설정 창 화면에 맞추기' 옵션 추가
[/list]

[h2]개선[/h2]
[list]
[*]첫 진입 화면을 일곱 지옥의 고리와 끊어진 사슬을 담은 인장과 로고로 새롭게 꾸몄습니다
[*]시작 메뉴·로비·캐릭터 선택 화면의 큰 테두리와 장식을 덜고, 은빛 명조와 흑철 바탕으로 정돈했습니다
[*]다음 난관의 난이도를 다섯 장의 카드로 비교하고, 방향키나 A·D로 선택할 수 있습니다
[*]튜토리얼 안내 뒤에 어두운 판을 더하고 보스 이름·막 전환·승리·장 클리어 배너의 글꼴과 장식을 통일했습니다
[*]펫 대사를 캐릭터의 말투와 이야기 흐름에 맞게 다듬고, 보스 이름·대사·장 진행 안내·로딩 팁의 번역을 보강했습니다
[*]첫 화면 리마스터 — 새 로고, 붉은 태양이 뜬 절벽 배경 영상, 흑철 판 메뉴 버튼
[*]화면 전체의 색을 통일했습니다 — 타이틀 메뉴·창·스킬 창·인벤토리·설정·HUD를 은빛·흑철 바탕에 진홍 포인트로 정리
[*]설정 창과 스킬 창의 장식을 덜어 내 더 읽기 쉽게 다듬었습니다
[*]숫자 키 1~4는 이제 스킬 전용입니다 — 물약은 자동 물약으로 사용됩니다
[*]화염·암흑·빙결·물·아케인·독 계열 스킬·피격 효과를 지옥 톤으로 다시 만들었습니다 — 튀는 네온 별·마젠타 별·청록 연기 제거
[*]기검참을 은빛과 검은 잉크로 다시 그렸고, 악의구가 연기 섞인 혜성 꼬리를 남깁니다
[*]지옥강타 — 화면을 덮던 밝은 섬광 대신 충돌 지점에 백열 불꽃이 맺히고, 용암이 더 빨리 솟습니다 (피해·판정은 그대로)
[*]폭발 효과가 더 빨리 퍼지고, 이동 기술을 쓸 때 화면이 주황색으로 덮이던 효과를 없앴습니다
[*]세계관 인트로 새 장면, 전사 이야기 영상 개선판, 컷신·로딩 이미지 다수 리마스터
[*]가방 정렬 기준을 등급에서 종합지수로 바꾸고 기본 자동 정렬을 적용했습니다
[*]보석 소켓 표기를 흑철·청동 세팅 그림으로 바꾸고, 방패가 없는 캐릭터를 위해 장비 슬롯 이름을 '보조무기'로 정리했습니다
[*]1장 맵이 플레이어 조명 밖에서도 잘 보이도록 밝기를 조정했고, 제단 독 해자·동쪽 독 구덩이·걸을 수 있는 경계가 더 잘 보입니다
[*]로비의 캐릭터 목록·생성·입장 화면 배치를 다듬었습니다
[*]설정·스킬·대장간·능력치 제목판이 모든 언어의 글자 길이에 맞게 자동 조정됩니다
[*]실버테일 소개 문구를 '멈추지 않는 기동'으로 바로잡았습니다
[*]튜토리얼 흐름을 다시 구성했습니다
[*]번역 보강 — 모든 언어에서 빠져 있거나 한국어로 남아 있던 문구를 채웠습니다
[/list]

[h2]버그 수정[/h2]
[list]
[*]1-1 다크드루이드가 땅속으로 달아난 뒤에도 독 탄·구슬·늪이 남아 있던 문제를 수정했습니다
[*]연사·마력석궁의 발사음이 들리지 않던 문제를 수정했습니다
[*]한국어 펫 말풍선에서 낱말이 중간에 끊겨 읽기 어렵던 문제를 줄였습니다
[*]장 클리어 안내의 폭이 좁아 긴 문구가 불필요하게 줄바꿈되던 문제를 수정했습니다
[*]스킬 발동이 실패해도 쿨다운이 돌던 문제, 게임 창이 포커스를 잃은 뒤 스킬 조준이 남아 있던 문제 수정
[*]사망 메뉴가 키보드로 제대로 조작되지 않던 문제 수정
[*]아이템 어픽스 % 표기와 비교 경고가 잘못 나오던 문제 수정
[*]스킬 자원 소모·인벤토리·장비 능력치·사운드·저장 안정성 문제 다수 수정
[*]1장 동쪽 독 구덩이의 충돌 범위가 보이는 테두리와 맞지 않던 문제 수정
[*]보스방 재도전 후 화상·중독·출혈 지속 피해가 남아 있던 문제 수정
[*]해골 토템의 보이지 않는 충돌 범위가 과도하게 크던 문제 수정
[*]보스가 벽에 끼었을 때 즉사하던 문제 수정 — 안전한 위치로 재배치됩니다
[*]유골함에 설계에 없는 무작위 특수효과가 붙던 문제 수정 (이번 업데이트 이후 얻는 유골함부터 적용)
[*]세계관 인트로 일부 장면의 화면 깨짐 수정
[*]PC에서 다른 프로그램이 같은 포트를 쓰고 있으면 게임이 빈 화면으로 뜨거나 엉뚱한 페이지에 연결되던 문제 수정 — 빈 포트를 자동으로 찾고, 실패하면 안내 화면을 보여 줍니다
[*]전투 중 소리가 많을 때 적 공격 예고음이 묻히던 문제, 플레이어 기술·잡기 명중 때 예고음이 잘못 나던 문제 수정
[*]시작 화면 하단에 구버전 지형 띠가 보이던 문제 수정
[*]튜토리얼 기검참 3타 완전 충전 시간 표기 수정 (2초)
[/list]

[h2]밸런스[/h2]
[list]
[*]악의 약화가 더 이상 풀리지 않습니다 — 적이 죽을 때까지 유지되며 최대 10단까지 쌓입니다 (단당 +30%, 최대 +300%)
[*]폭발 사격의 자원 소비를 표기된 비용 5와 일치하도록 수정
[/list]
```

## 확인 메모

| 항목 | 내용 |
|---|---|
| 게임 내 패치노트 | 10-28 수정으로 매일 빌드는 `status: final` 노트만 게임 안에 넣는다(초안 제외). v0.7.10.md를 final로 미리 작성했으므로, 이 준비 커밋을 포함한 원격 main에서 10-29 빌드가 성공하면 v0.7.10·v0.7.9·v0.7.8·v0.7.0 정리본이 함께 들어간다. 현재 patch-notes.js는 바꾸지 않았으며 실제 표시·가독성은 빌드 뒤 검수한다 |
| 9월 구간 | 25202408(09-08) 이후 ~ v0.7.0 노트 시작(09-20) 사이 커밋은 약 135개다. 이후 다시 바뀐 것(튜토리얼 세부 문구·전격이동 실습·수치 다수)은 빼고 지금도 남은 큰 변화만 넣었다 |
