# 드루이드 독탄 접촉 임팩트 — 2026-10-09

정본: `ROOT-DRUID-POISON-IMPACT-20261009`. 적대 드루이드 독탄의 패링되지 않은 플레이어 접촉 표시를 독색 중심 타격·짧은 스플래시·잔향으로 정리했다. 기존 비행 표시는 유지한다. 본편 코드 연결 완료이며 정상 줌의 실제 보스전 인수와 A급 판정은 미완료다.

## 런타임 계약

| 항목 | 실제 값 / 적용 위치 |
|---|---|
| 접촉 분기 | 기존 blackBean 접촉 `_addBoom`의 `p._druidPoison && !p.friendly`만 `druid_poison_hit`; 나머지는 기존 `rainbow_light` |
| 렌더 소비 | 공유 boom renderer의 `druid_poison_hit` → `_drawDruidPoisonImpact(X,b,_tvfx2Imgs)` |
| 반경·수명 | 기존 `_bkR=120`, `mt=72`; 기존 업데이트 `t+=sp`, `t>=mt` 비활성화 |
| 풀·충돌·피해·중독 | 기존 boom pool 12, 생성 arms/RNG, 충돌·피해·중독·Q 패링·무적 분기 그대로 |
| 패링 규칙 | blackBean은 Q 마법 패링만, E 불가. 성공한 Q/블루콩과 friendly에는 새 접촉 예외 없음 |
| 입력 가드 | b 존재, t/mt/r/x/y finite, mt/r>0. age=max(0,t), p=min(1,age/mt), p>=1이면 그리지 않음 |
| 이미지 | 기존 `assets/vfx/Poison_MediumImpact.png` 512×512, 4×4. complete 및 naturalWidth/Height>=8일 때만 사용 |
| 원화·자산 | 첫 8개 스플래시 셀만 사용. 뒤의 링·구체 셀 제외. 원PNG 수정·새 생성·복제 프레임 없음 |
| 상태 안전 | save/try/finally/restore, translate(x,y), lighter, filter=none. 입력 boom 변경·랜덤·wallclock 호출 없음 |

## 표시 수치

| 부분 | 공식 / 색 / 시점 |
|---|---|
| 전체 잔향 | fade=(1-p)². 기존 72틱 종료에 0 |
| 작은 핵 | 반경 r×.22, 알파 fade×.16; radial stop 0 `#c9eca9`, .28 `#709f42`, 1 `#28462200` |
| 스플래시 창 | burst=max(0,1-age/24); age<24이며 이미지 준비된 경우만 표시 |
| 크기 | grow=1-(1-min(1,age/10))³; size=r×(.72+.32×grow). r120에서 폭86.4→124.8; 높이=size×ch/cw |
| 셀 보간 | frame=min(7,age/24×7), lo=floor(frame), mix=frame-lo. lo/lo+1의 가중치 1-mix/mix, 마지막 셀7 clamp |
| 원화 샘플 | cw=floor(width/4), ch=floor(height/4), 셀 경계 1px inset/cw-2/ch-2; 최대 drawImage 2회 |
| 스플래시 알파 | .9×burst²×각 보간 가중치; 새 자세 제작이나 24fps 의미 아님 |
| 잔여 파편 | n=min(6,arms.length), arm[ floor(i×arms.length/n) ], 기존 arms를 원주에 분산 선택 |
| 파편 위치 | travel=1-(1-p)³, d=r×(.1+.52×travel×arm.len); x=cos(a)×d, y=sin(a)×d+r×.18×p² |
| 파편 타원 | len=r×(.025+.018×arm.spd)×(1-p×.55), width=r×.011×(1-p×.7); rotation=a |
| 파편 색·알파 | 짝수 `#b3d77a`, 홀수 `#82b64f`, 알파 fade×.48 |
| 접촉 섬광 | age<5, flash=1-age/5, 알파 flash×.72, `#f0fbd9`; 타원 r×.09×(.7+.3×grow), r×.045 |
| 이미지 실패 | 스플래시만 생략. 핵·파편·초기 섬광은 기존 boom 시간으로 표시; 준비 재시도/타이머 추가 없음 |

일반 `rainbow_light`는 Poison_MediumImpact / Dark_DarkSmoke / Light_ImpactLight / Ice_ImpactIce의 기존 4겹 표시를 유지한다. 새 함수는 확장 위험 원판을 추가하지 않는다. 기존 화면 플래시·문자·독 디버프·일반 `_projHitFx`·다른 드루이드 탄종은 이번 변경 범위 밖이다.

## 최초 검증과 시각 판정

| 확인 | 결과 / 한계 |
|---|---|
| 최초 CPU | 실제 전체 inline JS 및 새 검토 페이지 구문, 실제 접촉 분기/renderer, 상태·RNG·lifetime·첫8셀·폴백·종료 검증: Node1 / 8그룹 / 59assertions PASS, fail0 |
| 소유 역검증 | working/HEAD 선 fullbytes 백업. 정확3hunk 역적용 결과 각 원본 byteexact; game foreign185B 보존 |
| 정적 peer | 기존 engine_editor helper의 새3hunk 검토 finding0/blocking0. 실제 본편 화면 인수와 별개 |
| native Canvas | 기존 ROOT Chrome 자체 검토 탭에서 기존4원화 로드4/4, age6/12 정지 비교, 실제 재생→72 종료. context/object PASS |
| 검토 설정 | r120/72ticks/arms12/scale.8 통제 fixture; 실제 공유 main 함수 원문 사용. API/storage/gameinit/audio 없음 |
| 검토 페이지 보정 | 최초 비교의 old branch 종료가드 누락1을 외부 검토 페이지에서만 정정. 보정 후 양쪽72에서 모두 사라짐; 제품 재수정 없음 |
| 환경 재시도 | 최신 직접 지시에 따라 기존3387 GET1: HTTP000/exit7. Mac 잠금 해제·기존 own Chrome 사용 가능 확인. 서버 restart·entry/SAVE_DIR 접근0 |
| 실제 본편 미검수 | 정상 줌·전체 보스전·성능·청취·실보상save 미검수. CPU/통제 Canvas를 본편 또는 A급 인수로 세지 않음 |

**VISUAL VERDICT: RETOUCH.** 통제 비교에서 다색 과노출과 넓은 겹침은 줄고 독색 접촉이 분리되지만, 기존 스플래시 원화의 별 모양과 전체 전투에서의 타격감·독 잔향 조화는 추가 본편 검수가 필요하다. 드루이드 외형·리깅·새 공격 모션·3D360·맵 작업 완료가 아니다.
