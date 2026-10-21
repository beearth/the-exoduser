# DEMO11 — HUD·사운드 이벤트 context pack

## 원본 계약

| R 행 | 핵심 |
|---|---|
| 12341–12904 | SFX 등록/큐/priority/category/voice cap 및 공격·사망·시작스킬 호출군. missing buffer/동률 포화는 재생을 거절할 수 있다. |
| 28267–28675 | quickslot/자원/HUD 갱신 및 전투 표시 경계. |
| 35893–35910 | 자동 물약의 tutorial/SFX/text/stat 순서. |
| 44050 이후, 46969 이후 | 스킬 HUD/관리 UI와 선택 slot 정보. |
| 60308 이후 | HP text, Lv/XP/kill/자원 HUD writer. |

원본 BGM, lobby/video 음악, options mix는 SFX event와 별 수명이다. UI label을 갱신하는 것과 실제 전투 event/SFX를 발생시키는 것은 분리한다.

## 호출 순서

게임 상태/전투 성공 event → producer가 key/payload → SFX backend priority/category/voice gate → Audio node 재생, 동시에 owner가 HUD snapshot/anim/text를 갱신한다. 스킬은 성공 시에만 CD/숙련/HUD로 가며 SFX를 단순 입력 feedback으로 만들지 않는다.

## Godot origin/main 대응

`main.gd:47`의 `native_sound_event`, `main.gd:1898–2177,2385–2436`, `native_skill_slots`의 AudioStream 호출은 공격·사망·시작4스킬 일부(D35)다. `hud.gd:88–118,804–870,1089–1149` 및 `main.gd:276–300`는 기본 Lv/XP/SP/AP/자원 HUD(D33)다. 선택 스킬/물약/보스HP/인벤 등 D34와 backend/BGM/mix D36은 통합 대기; `native_sound_backend.gd`는 연결0이다.

## 관련 docs

- `docs/3.1 ui hud 디자인/`, `docs/3.3 키바인딩+설정/`, `docs/6사운드디자인/`
- `docs/engine/FDG_SOURCE_TRACE_SOUND_20261020.md` §1, §3–4
- `docs/engine/DEMO11_COMPLETION_GAP_20261021.md` D33–D36

## 주의

HUD 숫자/AudioStream 존재를 전체 HUD·청감 PASS로 보고하지 않는다. 옵트인 mix/BGM/lobby 영상 owner, 전투 event, PC UI 담당의 범위를 섞지 않으며 Q/E 소리를 이유로 보호 전투 경로를 바꾸지 않는다.

## 2026-10-21 INTEG-6c 후속 계약

INTEG-6c 현행: HUD42는 --map11=off 수동 intro 계약, headless 캡처만 skip하고 UI문구검사 유지(37/0). 음악41은 --map11=off 및 life owner가 legacy player_died 음악을 억제함을 검사한 뒤 공개 death music seam 검증(66/0 CoreAudio). 데모boss곡은 Ashen Druid - Boss.mp3(−12.4LUFS), AUDIO-01 boss bus−7dB·간헐필드·덕킹 수치 유지. 상세·실패이력·한계: [INTEG-6c](../INTEG6C_REGRESSION_20261021.md).
