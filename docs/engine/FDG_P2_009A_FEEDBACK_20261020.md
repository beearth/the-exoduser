# P2-009a — 원본 레벨업·showPH·줍기 피드백

## 범위와 연결

기준 worktree `codex-p2-009a-feedback-ui`, 원본 `game.html` SHA-256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`.
상태 소유자의 `presentation_requested` 신호를 새 `NativeFeedback`이 소비한다. 기존 hurtE의 경험치·물약 계산과 NativeFloatingText 방출은 그대로이며 연출 소비자가 보상이나 텍스트를 재지급하지 않는다. Main 연결은 `_install_native_attack_audio()` 다음 한 줄뿐이다. 입력·레슨·Q/E·세이브·드랍 담당 파일은 수정하지 않는다.

| 대상 | 원본 행 | 값·포트 계약 |
|---|---|---|
| showPH | game.html 679~680, 43609 | 기본 500ms, 레벨업 2500ms. 현재 공지 교체와 기존 타이머 취소, opacity 전환 .1s, bottom 180px, 가운데 정렬, 원색 25px glow |
| 지옥강타 | 13000~13004 | ST 부족 우선 `ST 부족!` #ff4444. 다음 악의 부족 `악의 부족! (10)` #ff4444. 쿨만 남으면 무공지. 기존 레슨 면제·비용·쿨 조건 불변 |
| 가시덫 | 13011 | 악의 부족이면 `악의 부족! (5)` #ff4444. 쿨 단독 거절은 무공지 |
| 얼음보주 | 12917, 12922~12923 | 타 스킬 차단 `얼음보주 안에선 사용 불가!` #88ddff. MP 부족 `MP 부족!` #4488ff. 판정은 기존 실행자 소유 |
| 레벨업 | 43159~43167 | PASSIVES.pDemon>pHuman이면 #d38aff, 아니면 #ffdd00. `LEVEL UP!`/`TRANSCEND!`, `SP +N [AP +M]`의 원문·life60·y−40 보존. 1000+ 진행 게이트는 여전히 정직 정지 |
| 레벨업 합성 | 12764~12770, 12465~12492, 12515~12543 | 523/659/784/1047Hz, 간격95ms·마지막420ms, FM/Tone/Noise/Sub 총17층. 주파수 지터±5%, 각 원본 엔벌로프. 합성은 WorkerThreadPool에서 런타임 WAV로 생성(에셋 생성/편집 아님) |
| 물약 변환 픽업 | 28250~28259, 12772~12776 | hp만 악의 전환 후 SFX.pickup 3층(1400/2000Hz FM, 3200Hz Tone), +N #cc66ff life25·y−20. st/mp 버림은 무음 |
| 드랍·장비 픽업 | 16266~16271 | P2-006a 소유. drop 45ms 방지, rarity 4+/2+/나머지, vol .5, pitch±.04. 픽업6샘플·vol .5·pitch±.05. 이 어댑터는 장비 소리/텍스트를 다시 방출하지 않음 |
| 자원 실패 보이스 | 43609, 10151, 12332~12341, 12366 | 은꼬리(index1)만 원본 silvertail_resource_fail.mp3. 키 반복 차단10000ms, 후단 pitch .92~1.08. 샘플 gain은 sfxVol 두 번, 프로시저럴은 한 번 적용 |

소리는 실제 OPT 소유자의 `read_native_attack_audio_settings()`를 읽고, 자기 AudioStreamPlayer만 종료 정리한다. 합성 RNG는 오디오 전용으로 분리하여 게임플레이 RNG 소비를 추가하지 않는다. 처음 두 패턴을 미리 준비하고, 사용된 패턴은 다음 합성을 비동기로 준비한다. 연속 요청은 버리지 않고 완료 시 재생한다. 준비가 끝나지 않았으면 오디오 시작이 늦어질 수 있으나 게임 스레드는 합성을 기다리지 않는다.

## 원본 텍스트·번역 번호

`docs/16번역·로컬라이제이션/번역대상_전체목록.md`의 기존 번호를 사용한다. 새 번역 항목이나 표시 문구를 만들지 않는다. 실제 localize 호출은 기존 World 소비자이며 **현재 네이티브 범위는 ko identity**다. 이 작업이 다른 언어의 표시를 이식했다고 주장하지 않는다.

| 원문 | 기존 번호 | 원본 번역 정의 행 |
|---|---|---|
| MP 부족! | 0338 | game.html 6390, 6756 |
| ST 부족! | 0339 | 6390, 6624 |
| 악의 부족! | 0340 | 6390, 6621 |
| 얼음보주 안에선 사용 불가! | 1044 | 6619 |
| 악의 부족! (10) | 1049 | 6623 |
| 악의 부족! (5) | 1523 (`악의 부족! (`)+동적5+`)` | 6934, 13011 |
| LEVEL UP!·TRANSCEND!·Lv. N·SP/AP | 원본 리터럴/동적 텍스트 | 43162~43165, level-up-vfx.js 73 |

**SP/AP와 +N이 일반 화면에 안 보이는 것은 임의 누락이 아니다.** 원본 54833~54839의 일반 모드 화이트리스트(`시전/그로기/무적/CRIT/사망/탈출/✟/🌋`)가 이를 숨긴다. 기존 NativeFloatingText는 원문을 링에 수용하되 동일하게 렌더를 거른다. 테스트·화면을 위해 `_numStr`을 꾸며 넣거나 전투 테스트 모드로 바꾸지 않는다.

## 레벨업 VFX

원본 `level-up-vfx.js`(SHA-256 `184ebc2114aca1688bb9be07d41d9c115ed0e8a6f86db563898d5ead4c5c8259`) 4~5, 12~55, 69~131을 옮긴다. 신규 그림 대신 원본 프로시저럴 그라디언트·링·별·8방향 플레어를 런타임 shader로 그린다.

| 계약 | 원본 값 |
|---|---|
| 수명 | 표시3.5초, VFX3초, 라벨24px·y−70에서18px 상승·등장.08초/퇴장.6초 |
| 중첩 | 같은 P·stage·age<.24면 age 유지. strength=min(1.12,1+max(0,levels−1)×.03) |
| 취소 | P 변경·stage 변경·hp≤0·fallen. 네이티브 dead도 같은 사망 소유자 상태로 취소 |
| 레이어 | 원본 back/front 구분, ADD 합성. 보조 링·빔·18개 별, low 품질은 보조 생략·10개 별 |
| 악마화 | 원본 gold RGB→GBR 교환, 라벨 #e5b4ff/외곽 #1d092b. 인간 #ffe6a3/#241707 |

World의 실제 native frame 차이를 /60으로 초로 환산하여 전진한다. 별도 게임 시뮬레이션/저장 필드는 추가하지 않는다. Node VM이 **원본 JS를 직접 실행**한 36개 시간·앞뒤·품질 조합의 1,098개 VFX 검사를 Godot draw plan과 대조했다. 이 수치 일치는 Canvas와 Godot의 래스터 픽셀 동등성 증거가 아니다.

## UI 품질·검수 경계

UI_FOUNDATION/UI_COMPOSITION을 선행 확인했다. 기존 HUD의 NotoSerifKR FontVariation을 재사용하고 글꼴 에셋은 P2-007a 담당 소유라 수정하지 않는다. 원본 CSS 28.8px/.2em은 Godot 정수 font size/spacing에서 29px/6px로 양자화한다(게임 수치 조정 아님). 25px CSS blur는 σ=12.5·±3σ의 가우시안 두 패스로 실행한다. 신규 이모지는 추가하지 않는다.

실제 AMD RX9070XT의 1920×1080 창·OS screen readback·대상 1x crop을 확인했다. 알림이 기존 HUD 위에 있고 원색·중앙 정렬·광택 없는 원문 가독성이 확인되었다. 초기 두꺼운 shadow-outline 근사는 제거하고 원본 blur 반경으로 다시 검수했다. **VISUAL VERDICT: RETOUCH** — 원본 Nanum Myeongjo/Cinzel 인수·Canvas/Godot raster 완전 일치·실제 수동 전투는 남아 있다. 테스트 하니스의 상태 소유자 호출을 정상 무개입 플레이로 세지 않는다.

## 정직 정지·미이식

- 웹 master EQ 6000Hz−9dB / 3000Hz Q.8 −5dB / 250Hz+4dB, compressor −6dB·knee30·ratio2·attack.015/release.35와 전체 active-node 우선순위/상한은 이식하지 않았다. 새 임의 믹서·유사 음원으로 덮지 않는다. 프로시저럴 파형/스케줄·현재 gain까지만 확인한 부분 오디오 이식이다.
- P2-006a `claude/p2-006a-drop-pickup-20261020` SHA `48f0d8e7874ba0a7ca7c4e1897c9b799d8a03ce6`의 장비 SFX/픽업 텍스트 결과는 읽기 전용 참조했다. 이 기준선에는 native_world_drops가 없고, 병합·복사·별도 폴백을 하지 않았다. 장비 경로 통합 검수는 총괄 인수 후 필요하다.
- holyDome 성공 pickup 호출, 초월 진행, 예약 패시브 큐/그 공지, 해금 후 시네마틱, 세이브는 확장하지 않았다. 보상 신호 소비자가 없으면 state의 미이식 목록은 계속 남는다.
- cold/연속 오디오 요청은 worker 완료까지 지연될 수 있다. 실측·원로그와 알려진 기존 giant-slam 종료 resource ERROR는 [보고서](orders/reports/P2-009a_REPORT.md)에 구분한다.
