# DEMO11-enemy-base3 — F 이관·Mac 문지기·3/7 자연 경계

기준 `1f0a71fb183e949dbdabfdc74586263e0f51eb01`, 같은 `codex/demo11-enemy-base-20261021`. 의존 F `ef64bd17`→merge `719d0e42`, E `70d1ca22`→merge `5a041ebd`. F merge factory 충돌은 기존 B common 준비 경계를 보존하고 F 추가부만 인수했고, E merge Main/CHANGELOG는 양쪽 API·절을 보존했다. E의 EL-01/37/38·State 의존은 승인된70d1ca22 이력이며 이번 own State 변경0이다. rebase/force/main push0.

## 범위·원본 계약

18종은 A5+B5+D5+F3이며, 문지기29는 별도 소비자다. 단일 등록표는19개 etype entry, 3/7은 PC 준비 전 이름만 등록한 가짜 entry를 만들지 않는다. 원본 에셋은 기존 atlas/profile byte 참조만 하고 맵 배치/새 bitmap/UI/번역/저장 변경0. 원본 game.html 전체 출력/평가 없이 필요한 행을 스트리밍 발췌해 독립 Node oracle을 실행한다.

| etype·단위 | 실제 Mac 구현·공통 경계·원문 행 | 후행·보호 범위 |
|---|---|---|
| F26·27·28 | F source-selected 검증·constructor·actor 고유 상태는 보존. factory 중복 표는 NATURAL_REGISTRATIONS 참조 view로, 직접 World/origin 등록은 common.admit_source_record/단일 prepared capability/43으로 이관. F actor 및 numeric build body byte 동일. G30847–30876·31125–31154·31226–31233·39086–39124·40540–40558 | F blizzard/icicle/charged projectile·swoop/slam 보호 owner 미바인딩 NOT_READY 유지. 임의 generic 탄/가짜 패링 ack0. F28 G42810–42815 사망 freeze/시각 전체 효과는 기존 F consumer가 미인수한 범위이며 PC HP/죽음/origin 검사만으로 해당 원문 효과까지 PASS로 승격0 |
| E29 문지기 | normal stage0/diff5/offset0/elite0/mods[] 완료 constructor packet→EL-01 forced 후처리 G31620–31628→실제 Marker→common Node profile admission. HP×4·ATK×2·r int×1.4·poise80·elite3/dropTier2만 후처리, 기존 shield/mods/aura 재계산0. G39125–39140: wind45·<120/<100·거리150..1200 strict/.008sp, G20049–20119 eProjAt I branch/입 r*.7/원문 JS ang||facing fallback, G20065–20093 warning60 후 실제 common35 탄 | 보호 강타·돌진 contact는 실제 PC Callable만, 미바인딩 pending/HOLD. 일반 charged projectile 별도 source owner 미연결. 실제 gate pointer/final death/alive/gate writer는 PCI-11 대기, Mac 직접 대입0 |
| E29 사망 | G42817–42824: 독립 원문 JS와8방향 packet/8U/black U<.5·red U>=.5/속도·생명·피해·wrapper flags 대조. 실제 PC final-death 이후에만 callback identity·alive=false·HP≤0 확인하고 warning60 queue. 생전 사망탄/RNG 소비·gate 개방0 | 실제 final-death callback 미바인딩, actual death carrier/원본 hitstop·FX·죽은 actor의60tick retention·최종 gate 인수는 PC 통합 후행. 단순 ack만으로 완료0. 사망 packet 모델 인수를 실제 사망8탄 검수로 표시하지 않음 |
| E3·7 자연 입장 | actual NativeSpawnHoleSystem/현재43 provider 경계에서 준비 조회. type3 실제 script의 PC hurtE field owner, type7 실제 six-element emitter와 실제 callbacks만 넣은 runtime.configure 거절을 인수. 거절은 ctor/RNG/Marker/registry 이전 | type3 field owner·M29 실제 패링/효과/음향 준비 없으면 NOT_READY. fixture cap/항상 false 패링·옵션 제거·다른 actor 대체0. 원문 recipe/binder/kernel 수정0 |

모든 AI/탄 시간은 기존 World native frame/sp를 사용한다. F는 기존 World phase, 문지기는 같은 World phase로1회만 진행하고 warning은 priority1/동일 frame dedup 후35 birth/motion으로 인계한다. 35의 element 동등성은 유지하며29의 실제 profile이 현재 방출 중인 packet capability에만 P/I override를 허용한다. arbitrary props·다른 actor·비현재 profile·미확정 사망은 거절한다. 자동 CDF는 기존0 외 HOLD를 유지하며 source pool29/RNG 순서·리롤/분모 변경0. source-selected 지원을 전체 자연 자동 플레이 완료로 주장하지 않는다.

## 검증·공용 변경

신규18종 통합104/0·문지기439/0 =543/0, 관련 F33/0·E19/0·기존 common0 31/0·35 registry29/0·auto14/0 =126/0, 합 **669/0**, factory 별도3그룹/실패0. 최종 실행 ERROR0·skip0. 관련 suite는 각1회이며 실패한 신규/import/oracle만 보완·재실행했다. Camera2D interpolation 경고 원문 보존, 이번 종료 누수 진단0. 실제 신설 문지기와18종 cohort는 별도 격리 실행이며 혼합19종 동시 플레이 검수는 아니다. 새 테스트 userdir `EXODUSER-demo11-enemy-base3-Isolated-20261021`, 기존은 파일 상수. 모든 Godot 직전 exact pgrep>=2면30초 대기, 매 실행 override 후0byte, 실제 사용자 저장 접근0. 원로그 `~/exoduser-wt/_out/demo11-enemy-base3/`.

| 검사·파일 | 결과·정확한 own 범위 |
|---|---|
| 신규 통합18·문지기·원문 oracle | **104/0 +439/0**. 동일 World의 A/B/D/F18종 실제 spawn/tick·16종 PC 죽음/43 origin, B8/D25 죽음HOLD 유지. 별도29 실제spawn/비치명 PC hurtE/HP 선행 lethal 후 terminalHOLD, warning60 후 I 실제8carrier birth/tick. 원문8death packet·lane release-order 모델은 PC actual death/carrier와 구분 |
| 관련 회귀·30마리 벤치 | F33/0·E19/0·공통0 31/0·35 29/0+14/0 각1회, factory3그룹/0실패. 실제 자연0 30마리/고정600tick 유효1회 mean2.868502ms/p953.878/p994.010/max**8.526ms**, total1,721,101µs. max는8.333333ms 예산 초과. 최적화0·엄격120fps PASS 아님.18종 혼합/특수탄/PC 접촉/GPU 최악부하 벤치로 확대0 |
| 공용 변경 기준 | merge 직후5a041ebd 대비. hunk는 `−이전행 +최종행,개수`. State/World/Player/QE/hurtE/기존 kernel/F actor0. 원본 factory679행 prefix byte 보존 |
| `main.gd` | +6 / −0; `-3140,0 +3141,6` |
| `enemy_factory.gd` | +15 / −8; `-683,0 +684,4`; `-757,5 +761,2`; `-763,0 +765`; `-767,3 +769,8` |
| `native_natural_enemy_base.gd` | +5 / −1; `-195 +195`; `-205,0 +206,4` |
| `native_demo11_boss_projectiles.gd` | +1 / −1; `-236 +236` |
| `native_demo11_etype_f_spawn.gd` | +8 / −2; `-59,0 +60,3`; `-63 +66`; `-65 +68`; `-101,0 +105,3` |

첫 import는 새 문지기 actor의 `_frozen` 직접 필드 참조 parse 오류로 실패했다(엔진 exit0이어도 ERROR5라 FAIL 기록). 상속 parent가 해당 필드를 갖지 않으므로 기존 native_final reader로 교정하고 실패 import만 재실행했다. 정상 import ERROR0. 이 실패 원문은 성공 수에 합산하지 않는다.

문지기 신규 검사 실패 이력: 첫 gate29는 type7 실제 emitter 미설치·Node wrapper 발췌의 닫는 괄호 누락으로2실패, 다음은 새 warning 함수 발췌 끝의 괄호 누락1실패였다. Node helper로 발췌를 교정할 때 사망 for 본문의 다음 행 누락도 확인해 보존했다. 실제 six-element 모듈을 profile 자식으로1회 configure/cache하여 실제 M29 부재를 조회하고, 유효 원문 범위/전체 for 문을 인수했다. 이어439단정 중 native_final.lv 누락1실패를 확인해 원 constructor level을 명시했고 최종439/0이다. packet 수치는 Vector2 float32 중간값 대신 JS와 같은 double scalar sin/cos로 계산했다. 마지막 type3/7 context reader는 실제 현재 group의 room만 읽고 미바인딩/미확인은{}로 거절하며, 해당 미바인딩 반례 검사는 아직 실행 전이던 E19 회귀에 포함했다. 통과한 기존 묶음 suite를 반복0.

원본 game.html은 fetch 시 origin/main0138c5bb9와 byte 동일(SHA-256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`, source-main-proof.json). 새 source/model/runtime 파일은 Mac 소유 신규 파일이며, 공통파일 전투 math/보호 경로·저장·번역/원본 bitmap 변경0. F actor/constructor 및 보호13파일 비교·실행 closure252 byte 대조·override0·R tracked HEAD/branch/INDEX/WORK 시작/종료 비교·일반 push/원격 일치 후 DONE/자기WT 제거로 마감한다. 원문 oracle input/output·실행별 실패/성공·fixed-wall-clock benchmark·공용 hunk를 원로그에 보존한다.
