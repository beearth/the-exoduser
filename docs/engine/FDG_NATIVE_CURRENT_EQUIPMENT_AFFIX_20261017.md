# 현재 장비 어픽스 실제 공개 getter — 2026-10-17

| 항목 | 현재 코드 계약 |
|---|---|
| 신규 공개 API | Main.read_native_source_equipment_affix(id: Variant) -> Dictionary |
| 실제 권위 | 현재 Main의 source_providers.get_provider_bundle() 안의 동일 affix.eq_affix(id). 실제 SourceState current INV reader와 기존 원 helper를 사용한다. 새 합산 공식·장비 snapshot·캐시 복사 없음. |
| 실제 기존 소비자 | read_native_player_projectile_pierce_flat()가 신규 API에 pierceFlat을 전달한다. 기존 store 재사용 reset 위치의 지연 호출 순서 유지. 신규 packet 생성 시 조회 없음. |
| 현재 수명 | 기존 Main live 검사와 source_providers 실제 ready 검사. 미준비 응답은 기존 status=NOT_READY / reason=actual_packet_affix_provider_not_ready 유지. value=0 제조 없음. |
| 응답 | helper의 Dictionary를 그대로 반환한다. READY, SOURCE_THROW, READY_PARTIAL_AFTER_SOURCE_THROW, NOT_READY 및 id/value/origin/reason을 변경하지 않는다. |
| 캐시 | 기존 helper 캐시와 명시적 invalidate_affix_cache 시점 유지. getter가 강제 rebuild/invalidate하지 않는다. 첫 조회 시 원 helper 자체의 lazy rebuild는 유지. |
| 입력 | id의 Variant를 그대로 전달하며 문자열 강제변환·임의 유효성 보정 없음. 기존 helper의 query-key 계약을 따른다. |
| 비연결 | ENEMYv2 피해 owner 등록/normal hurtE/죽음/중첩피해/VFX RNG/source clock은 이 API로 완성되지 않는다. 기존 flight dependency의 미연결 NR 유지. |
| 배포 | 원본 R, 실제 실행판, export, main 브랜치 변경 없음. 최신 전체 게임 인수 아님. |

## 새 영향 검수

| 검사 | 관측 및 한계 |
|---|---|
| 첫 실행 | Godot 4.7.2, 새 code-only fixture 12개 중 11 PASS / 1 FAIL, exit1. 실패는 fixture가 원 status 문자열을 READY_PARTIAL로 잘못 기대한 것. 제품 코드 수정 없음. |
| 실패 범위 1개 재검사 | 원 literal READY_PARTIAL_AFTER_SOURCE_THROW로 기대를 바로잡은 새 partial-only fixture 1 PASS / exit0. 앞선 11개 통과 검사 재실행 없음. 전체 최초 clean으로 기록하지 않는다. |
| 검수 대상 | 실제 equipment_affix_reader 원 코드 복사본 + 신규/기존 Main 메서드의 정확 추출본. current INV 교체, 원 캐시 유지·명시 무효화, 합계/음수/known absent, source throw 뒤 partial prefix, lifecycle/reader 손실 거절. |
| 실제 owner 경계 | Main 생명주기와 provider ready/claim은 fixture 대역. 전체 Main Tree, 실제 게임 INV 조작, 실제 Enemy HP/피해/시각/오디오/맵/원본 이미지·save 실행은 0. |
| 로그 | 두 실행 stdout/stderr 및 Godot log ERROR/WARN/leak 0. 첫 의미 검사 실패는 보존한다. |
| 사용량 | 시작 주간 계정 공유 누적37%; 날짜 최초 사용량 미상으로 일간 소비 미상. 종료 관측은 별도 receipt. |
