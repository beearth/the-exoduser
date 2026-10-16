# Native World 플레이어 투사체 저장소 — 2026-10-17

상태: I 작업 브랜치 구현. R/main/served 미반영. 실제 비행·피해·표시·악의구 delivery 미연결이며 최신 전체 게임이 아니다.

| 항목 | source / 구현 계약 |
|---|---|
| source | canonical f8a8889846e53f5c063c24f469b080c8de415b6e game.html:17307–17362의 _mkPProj/_resetPProj/_recyclePProj/_getPProj |
| 실제 소유 | World._native_player_projectiles가 RefCounted store 소유. Main._ready가 실제 Player·Resource·SourceState 설치 후 world.bind_native_player_projectile_store(self) 호출 |
| 신규 | _mkPProj의 96필드. 새 _hitSet은 독립 Dictionary-backed Set. reset/pierceFlat/pPierce 조회 없음 |
| 재사용 순서 | free LIFO pop → prefix81필드 설정 → 같은 _hitSet.clear → 현재 eq_affix('pierceFlat') → _pierceRate=50+value → suffix25필드 → 현재 PASSIVES.pPierce 조회 |
| pPierce | level>0이면 pierce=min(.95,level×.05),pierceMax=level. 신규에는 자동 적용 없음. 실제 PASSIVES dictionary 필수; key 없음/null/false/빈 문자열은 원 ||0의 0. 유한 숫자 이외 shape는 NOT_READY |
| undefined | reset kbMult=undefined는 pool 전용 SourceUndefined 참조 sentinel. 신규에는 kbMult key 부재. 소비자는 is_source_undefined(value) 사용 필수. null/0/1로 바꾸거나 raw 숫자로 소비하지 않음 |
| 미기재 key | Dictionary.clear/전체 replace 없음. _mwMul/_uqEcho/_fbR0/_fbRMax 등 원 reset이 쓰지 않은 key·참조 보존. source 결함 동시 수리 없음 |
| 반납 순서 | _hitSet이 Dictionary-backed Set일 때만 같은 Set.clear(없음/null은 skip) → _bladeEchoPath=null → _bladeEchoCast=0 → free.size<120일 때만 저장. 120은 free cache 상한이며 live/동시 공격 제한 아님 |
| 제거 | retire(main,packet,recycle)의 실제 caller가 원 branch의 recycle 여부 명시. false는 free에 넣지 않음. range/wall 제거를 일괄 recycle로 변경하지 않음 |
| 원 fields | recycle에서 alive=false나 미기재 key 삭제를 추가하지 않음. 실제 fields Dictionary identity 유지 |
| registry | publish가 같은 Packet을 World-owned live array에 append. read_native_player_projectiles는 그 실제 array reference. native wrapper phase/store_id는 foreign/중복/잘못된 호출 거절용 metadata |
| 실제 affix 권위 | Main의 기존 ready source_providers bundle.affix.eq_affix('pierceFlat'). 신규 eager 조회 없음. READY_PARTIAL/비유한/누락은 거절 |
| 실제 passive 권위 | Main.source_state.read_current_passives()의 현재 holder. 공급자 부재를 {} 또는 새 기본 레벨로 제조하지 않음 |
| reset 실패 | prefix·기소비 provider 결과 rollback/retry 없음. popped packet은 issued의 reset_refused로 남고 publish/retire/reborrow 거절. snapshot에 수 표시. 자동 free 복구 없음 |
| lifecycle | 같은 Main→World→현재 player/source/provider, sameTree 및 unpaused mutation 필수. foreign packet/duplicate publish/return 거절. clock/RNG/MP/HP/skill cost 변경 없음 |
| World API | bind_native_player_projectile_store / borrow_native_player_projectile / publish_native_player_projectile / retire_native_player_projectile / read_native_player_projectiles / get_native_player_projectile_store_snapshot |
| Main manifest | player_projectile_store가 실제 snapshot 공개. pool ready와 flight/damage/visual/delivery false 구분. INCOMPLETE/latest_full_game=false 유지 |
| 미연결 | fireball 실제 projectile Node·pureflight·_gcT/sp/_dtSp 순서·collision/hurtE/poison·실 audio/proficiency/source image 준비·발사. 준비 guard를 true로 변경하지 않음 |
| 검수 경계 | 새 asset-free fixture에서 store 원형 + 신규 World/Main method fragments 실행. source/provider는 fixture. 전체 Main/Player/World scene·실제 source providers·GPU·이미지/오디오 import·사용자 창/세이브/API 검증 아님 |

수정 전 I/R owned INDEX·WORK, 기존 파일26copy(WORK/HEAD)와 신규2path absence, 부모별 realpath/is_dir/nonsymlink를 외부 prewrite-manifest에 기록했다. 원 da20 ref 보존 후 codex/mac-fireball-packet-store-20261017에서 작업한다. 계정 날짜 첫 관측이 없어 일간 소비는 미상이며 새20%를 배정하지 않는다.

| 최종 검수 / 이력 | 실제 관측 |
|---|---|
| 첫 parse | fixture StateFixture.ready가 Node.ready와 충돌. exit0이어도 parse ERROR로 실패 보존. fixture field만 holder_ready로 수리 |
| 첫 실행 | 34중31PASS·전체 source field 비교3FAIL. 종료 ERROR/WARNING0. 실제 World/Main 전체 실행을 뜻하지 않음 |
| 비교 실패 원인 | JSON.parse source 숫자 encoding과 native int/float literal이 Dictionary equality에서 달라졌음. 동일 product·동일 source oracle을 유지하고 비교쪽 JSON normalize만 적용 |
| 실패 범위만 재검수 | 3/3 PASS, 각 snapshot 모든 key/value의 Python 비교 차이0. 기존31과 원 owner39/6/외부 QA 재실행 없음 |
| 실제 source 추가 경계 | _recyclePProj의 조건부 hitSet.clear를 누락한 초안 교정. source null/absent return은 skip, 다음 reset에서는 원 clear 위치(prefix 후 affix 전)에 reset_refused. 정규 Set identity 유지 |
| 추가 새 영향 검수 | 실제 source 새 edge6관측, native 조건부 return/reset missing Set8/8 PASS. 기존 성공 suite 재연 없음 |
| 최종 코드 검수 제한 | 기존31은 조건부 수리 전 관측이며 새8은 바뀐 return/reset 경계만 검증. 전체 scene/실제 source providers/실 발사/성능 검증으로 합산하지 않음 |
| userdata 오류 | 첫 project 설정의 잘못된 config/custom_user_dir 때문에 실제 경로 FDG Engine Packet Store Fixture 관측. 원 기록 보존, metadata만 확인; 내용조회/삭제 없음 |
| userdata 교정 | 올바른 application/config/custom_user_dir_name로 실패3·새8에 한해 재실행, OS.get_user_data_dir=선언 FDG_ENGINE_PACKET_STORE_FIXTURE_20261017_8D04 일치 |
| 종료 상태 | 마지막3 및8 fixture 각각 ERROR0/WARNING0. 처음 parse/비교/경계 오류 때문에 wholeClean=false. live save 무수정·완전 격리 증명 아님 |

설정키 근거: [Godot 공식 ProjectSettings](https://docs.godotengine.org/en/4.3/classes/class_projectsettings.html#class-projectsettings-property-application-config-custom-user-dir-name). 실제 사용 binary는 4.7.2.stable.official.ed1daf0bf이며 해당 문서 버전과 동일하다는 주장은 하지 않는다.
