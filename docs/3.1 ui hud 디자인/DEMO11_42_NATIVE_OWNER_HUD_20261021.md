# DEMO11-42 — native HUD 실제 owner 연결

기준 main ac3764bfe. 기존 HUD/슬롯/오브/창 배치를 보존하고 PublicHUD의 표시 전용 자식 Demo11OwnerHUD를 추가한다. 스킬 창은 PC 개편 대기이며 변경하지 않는다. 캐릭터·보스·피해·패링·방패·분노·저장 writer는 추가하지 않는다.

보스 HP는 DEMO11-34 Main.read_native_demo_boss → 실제 actor.snapshot.enemy.hp/mhp만 읽는다. actor dormant/분리/오류/비정상 HP/죽음은 바를 숨기고 WAITING_OWNER는 관측된 HP를 유지한다. HP commit/전투 완성을 뜻하지 않는다. stage0 보스명 다크드루이드는 game.html:16689,16706을 따른다.

보스바는 원본 HUD #bossBar(387–396,954–958)의 상단 중앙18px·500×14px·흑철 레일·붉은 지옥불 4색 그라데이션을 재사용한다. 제목 hell_title(Cinzel Decorative→명조), 본문 hell, 숫자 cinzel_hell, 뼈색 #dfd6c2와 흑철 정보판의 #a49373 금빛 헤어라인을 사용한다. 기존 NATIVE_UI_FONTS의 정적 캐시를 재사용하고 신규 기본 산세리프/이모지는 없다. 인트로 바 채움·포이즈·실드·부활 문구를 새 owner 계약 없이 흉내내지 않는다.

스킬 owner는 기존 slot_rules.slot_value와 NativeSkillSlots.read_native_slot_cooldowns다. 기존 HUD의 dispatcher 대응 8슬롯 아이콘도 같은 selector를 읽는다. 고정 전투 키의 실행 경로는 그대로다. 마지막 요청 키의 현재 배정(배정이 바뀌면 갱신), 선택 이름·쿨·미연결 상태를 하단 스킬바 위에 표시한다. 최초 표시 키는 1이며 UI 선택을 게임 배정에 쓰지 않는다. ST/mst·MP/mmp·SP·악의는 State P/G getter만 읽는다. 10Hz 표시 갱신은 owner 시간을 전진시키지 않는다.

NativeSkillSlots.dispatch_native_slot에 결과 관찰 신호만 추가해 키 입력/Main 호출이 같은 실패 표시를 사용한다. 성공은 이전 실패를 지우며 거절은 3초 표시한다. 기존 cast_gate_refused는 여러 gate를 합친 계약이므로 특정 자원 부족을 추정하지 않는다. 번역대상_전체목록에 새 KO/EN 대상을 등록했으며 다국어 실행 완료를 주장하지 않는다.

검수 및 캡처 판정은 [보고서](../engine/orders/reports/demo11-42_REPORT.md)에 기록한다. 캡처는 실제 Main HUD 위에 fixture-only 배정/HP readback을 사용하며 실제 arena 전투 완료 증거가 아니다.
