# DEMO11-45 — MAP11 실제 provider 연결 후 보물상자 한 종 재개

**provider BLOCKED는 해소. 자연 보스 완료·부활 판정은 PC 인터페이스 대기(NOT_READY).** 같은 브랜치 `codex/map11-prod-20261021`에 소비자/보상/State 경로를 구현했다. 보스가 죽었다고 가정해 제품 상자를 보여주지 않는다.

| 원본·구현 | 결과 |
|---|---|
| 첫 종 선정 | 상자 `G41819–41838` 보스 부활 대기까지 해소된 뒤 bossRoom 중심 1회. 봉화 생성 주석(`25795–25811`), 제단stage>=5(`25870–25879`), 상인stage0 도달 미확인(NPC_WORLD §2.1). 다른 종/고정 상점/맵 배치·룩 제작0 |
| 실제 위치·수명 | Main이 로드한 field runtime의 **map11.arena.boss** / boss_center 실제 Marker만 받는다. 위치 fallback0. 상자 opened는 Node/runtime 수명, 새 영속 키0. stage 재부팅은 새 소비자, 기존 provider 퇴역/불일치는 개봉 거부 |
| 사용·중복·보상 | source `32855–32878` <60·R 엣지·첫 개봉·중복/재진입 거부. 장비3~5개는 기존 `kill_reward/drop_item_source.gd`의 mk_item 재사용(별도 factory0), 실제 World 공유 RNG. 원본 slot/el/rarity/분산 순서 대조. **5 악의 + addPotion hp2→2 악의 =총7**, 물약 재고2로 오역0. 원문 `28250–28257` |
| State/INV·저장 상태 | 실제 Main/State/chest identity·pending-open guard→기존 append_native_drop_records(DEMO11-21)→기존 apply_native_pickup_item이 INV에 반입. 신규 save writer0·save_requested만 receipt, save_committed=false. 원본 demo literal `62131–62160`에는 opened/worldItems/MAP_OBJS 없음. 영속 개봉/미수거 drop을 새 저장 key로 추가0. 상위 collector/IO 전체 왕복 완료는 주장하지 않음 |
| 남은 조건 | `request_completion(receipt,owner)`는 현재 PC typed authority 계약이 없어 NOT_READY. 임의 HP0 Dict/없는 actor는 완료가 아니다. 제품은 _available=false/hidden. PC owner의 보스 epoch·최종 처치/부활 대기 해소 판정을 인수하는 admission만 후속으로 연결해야 함. 해당 피해/부활 writer 수정0. pet firstChest/SFX/3D 연출은 기존 담당 접점이며 이 단위가 새로운 구현으로 주장하지 않음 |
| 검증·한계 | 최종 상자26/0, 원문 Node VM3사례(외곽 정책·실제 mkItem은 기존 모듈), 실제 State journal+7·INV 반입·거리/중복/가짜 완료 거부. 활성화는 명시적 component fixture로만 검사했으며 자연 보스 처치가 아니다. 최초 상수 RNG 하니스 재추첨 hang은 원로그 보존 후 자기 PID만 종료/고정seed로 수정. 제품 RNG/원본 재추첨 수정0 |

새 격리 `EXODUSER-map11-prod-Isolated-20261021`, 관련 기존 테스트는 각 파일 상수. 별도 상인 UI/게임 텍스트 추가0 → 번역 수정/상인 캡처 해당 없음. 공용 Main/World/State의 범위·관계 회귀·벽시계 벤치·캡처·실행 원로그는 [MAP11-PROD 보고서](map11-prod_REPORT.md), 실제 필드↔아레나 transport가 상자/보스 처치 완료를 뜻하지 않는다. 원로그 `_out/map11-prod/`, 최종 SHA·원격·정리는 DONE.txt.
