# 대형 탄막 재채색 결과 — 1b 정적 보완

사용자 실행본 반영 없음. 기준 HEAD `9dc27dea561269bfc6639a6419de0bc0224479d3`, 브랜치 `claude/unity-pc-vfx-bullets-20261103`. **최신1b: 혜성·오브 본체 밖 성분0/독탄 생성·소스 연결, 정적 보완 완료. 전체 형태 RETOUCH·실게임 미검증.** 다음 관문은 runtime 시트 소비 인수와 같은 빌드07e·11a 검수다. 커밋·push는 지시문에서 금지하여 총괄 담당이다.

아래는 **1차 당시의 결과·실패 이력**이며, 최신 파일 상태·수치는 끝의「1b」절을 따른다.

## 산출물과 실제 변경

| 파일(저장소 상대) | 결과 |
|---|---|
| `unity/Assets/Exoduser/Resources/Art/vfx/field/proj_bolt_comet_el.png` + `.meta` | 생성. 2032×1096, 8×8, 254×137, 행P/F/I/D/L/H/E/적 독 |
| `unity/Assets/Exoduser/Resources/Art/vfx/field/proj_elem_orb_el.png` + `.meta` | 생성. 3072×1536, 6×6, 512×256, 행F/I/D/L/H/E |
| `unity/Assets/Exoduser/Runtime/NativeBossView.FieldBullets.cs` | 위 시트 사용, 원소→행 변경, 런타임 무지개 tint 제거. 기존 caller의 el 선택·물리 이빨입·크기·속도·프레임·Core 불변 |
| `tools/vfx/recolor_bullet_sheets.py` | 비용0 휘도 램프 생성기. 독탄 원본1254px의 기존 정수313셀/상단2px 여백 보존 수정 준비, 실행 미확인 |
| `tools/vfx/bullet_recolor_checks.py` | 수학·알파·밝기·실제100셀·meta 검사. ignore에 걸리던 test_ 파일명에서 옮김 |
| `docs/5.1임펙트디자인/VFX_BULLET_REMASTER_G1_20261103.md` | 브리프·직접 본 레퍼런스·원소색 표·현재/목표 크기·타이밍·관문 |
| `docs/5.1임펙트디자인/VFX_구현가이드.md`, `docs/CHANGELOG_SYNC.md`, 이 결과문 | Unity 후보와 웹/기존 독탄을 구분해 동기화 |
| `tmp/design-review/bullet-remaster/comet_compare.png`, `orb_compare.png` | 기존/재채색 같은 배율 비교판, 직접 열어 확인. Git ignore인 작은 검토 산출물 |

`NativeDruidArt.cs`는 독탄 파일이 없는 연결을 제거하고 시작 상태로 복구했다(diff0). `boss/druid_poison_orb.png`·meta·독탄 비교판·asset_1x_3x.png는 만들지 못했다. 원본PNG·세이브·타세션·NativeGame.cs·NativeGame.M1Check.cs·KiImpactView.cs·runtime Vfx/*·game.html 수정0, 영구 삭제0, 유료API0, 외부 쓰기0.

## 색 표 (그림자 → 중간 → 코어 / 백열)

| 원소 | 색 |
|---|---|
| 물리 | #2a2220 → #9a8a72 → #efe6d2 / #fff4d0 |
| 화염 | #4a1610 → #d8562a → #ffd9a0 / #fff4d0 |
| 빙결 | #1a2a36 → #5f98c0 → #e8f3f8 / #fff4d0 |
| 암흑 | #170c20 → #5e3478 → #cdb2e0 / #fff4d0 |
| 번개 | #2e2814 → #c8a848 → #fff4d0 / #fff4d0 |
| 신성 | #3a2c18 → #c9a45e → #fff2d6 / #fff4d0 |
| 대지 | #241a10 → #7e6236 → #dcc8a4 / #fff4d0 |
| 적 독 | #1c2810 → #5f8a2e → #c8e8a8 / #eef8e0 (혜성8행만 생성, 드루이드 미적용) |

## 검증과 중단 사유

- 알고리즘 검사: 초기 미구현 상태에서 팔레트/잔점 제거 실패를 확인한 뒤 구현. 수정 뒤4개 PASS (`C:/Python314/python.exe -B tools/vfx/test_recolor_bullet_sheets.py`, 당시 파일명). 파일명만 마지막에 `bullet_recolor_checks.py`로 변경했다.
- 실제 산출물 검사3개 PASS: 혜성64셀 알파 동일·240+ 비율≤3%, 오브36셀 원본 행 재배치·알파 증가0·240+ 비율≤3%, 두 meta는 GUID만 다르고 서로 고유함. 실행 당시 `tools/vfx`에서 `C:/Python314/python.exe -B -m unittest test_recolor_bullet_sheets.GeneratedAssetsTests`. 같은 통과 검사 반복 없음.
- 생성 시도1 FAIL: numpy 기본 보간 p97로 픽셀 수를 올림하여 빙결 등에서 밝은 픽셀 3.0086%가 됨. `method='higher'` 수정·비정수 모집단 회귀 추가 후 해결.
- 생성 시도2 FAIL: 혜성·오브 생성/각100셀 검사 통과 뒤 원본 독탄1254×1254를 4로 나누는 assert 실패. 표준/운영 규칙의 2회 실패 중단을 적용, 3차 실행0. 기존 PoisonShot은 313×313 정수 나눗셈이며 미사용2px가 있음. 수정안만 준비했다.
- `git diff --check` PASS. C# 컴파일·Unity import·Player·07e·11a·자연 전투 미실시. buildloop run id **없음**. 외부 로그/QA sandbox 쓰기가 표준 실행 경계에 걸리므로 실행하지 않음. 커밋·push도 명시 금지여서 작업 파일 상태로 남김.

## 직접 본 결함과 후속

1. 혜성은 무지개를 제거했지만 원본 별모양 점이 그대로 남는다. 알파 완전 보존 조건과 점0 기준을 동시에 충족하지 못해 **형태 FAIL**. 2차는 별/점 없는 새 실루엣 또는 명시적인 원본 알파 재작업 범위가 필요하다.
2. 오브의 분리된 얼룩은 줄었지만 본체가 가는 실 묶음이다. 낮은 배율에서 끊긴 점으로 읽힐 위험이 남아 **형태 RETOUCH/실게임 미검증**, 점0 PASS 아님. 2차는 큰 탄두+짧은 꼬리의 형태 재제작 후보.
3. 원본 알파를 보존한 혜성은 RGBA의 RGB 휘도243까지 있어도 검정 합성 최고237~239 수준이다(진단 프레임0..7). **게임 화면 코어240+ 달성으로 주장하지 않는다.** 알파를 바꾸지 않는 1차의 한계이며 셰이더/합성 검수 필요.
4. 독탄 라임 문제는 아직 남아 있다. 중단 규칙 때문에 수정 준비된1254px 생성기를 실행하지 않았고 런타임 연결도 유지했다. 후속에서는 동일313셀과 원본 샘플링 좌표를 지켜 생성 후 고정 Rect로 연결해야 한다(SheetCell 반올림 사용 금지).
5. remodel3d는 `NativeSkillRemaster.Current.Drawn(p)`가 true이면 이 시트를 소비하지 않는다. 다른 레인 runtime Vfx/*를 수정하지 않았으므로 실제 노출은 총괄 인수 후07e/11a로 확인해야 한다.
6. 지정 레퍼런스에서 PoE2 적 투사체 장면을 직접 확인하지 못했다. 캐릭터 실제 키 대비 크기·07e 실제1x/3x 크롭·1920/3840·무음10초도 미검증이다.

2차 새 형태 제작은 이번에 실행하지 않았다. 기존 소스의 알파 재작업은 비용0 가능, 새 AI 원화는 공급자별 유료 가능성이 있어 비용 확인/승인 전 호출하지 않는다. 현재 비교판은 참고용이며 사용자 실행본 적용·리마스터 완료 보고가 아니다.

## 1b — 분리 잔점 제거와 독탄 완성

지정 프롬프트 `I:/EXODUSER-Storage/codex-runs/20261103-190425_vfx-bullets-1b/prompt.md`를 읽고 해당 worktree에서 직접 수정했다. 신규 이미지 생성/유료API/Unity/브라우저/빌드/외부 쓰기/삭제/Git 변경 명령0. 기존1차 WIP를 이어받았고 `NativeBossView.FieldBullets.cs`는 이번에 추가 수정하지 않았다. fetch는 공용.git 쓰기를 피하기 위해 실행하지 않아 원격 최신성 미확인이다. 캐시 origin/main의 운영·작업·품질 매뉴얼을 읽었으며 실행 지시문의 소유 파일을 따른다.

| 변경 파일 | 1b 결과 |
|---|---|
| `unity/Assets/Exoduser/Resources/Art/vfx/field/proj_bolt_comet_el.png` | 2032×1096/64셀. alpha>0.05의8연결 성분,최대 본체 외 면적<셀0.5% 또는 bbox 최대변<6px 제거. 분리 성분392→0 |
| `unity/Assets/Exoduser/Resources/Art/vfx/field/proj_elem_orb_el.png` | 3072×1536/36셀. 기존5×5 opening 결과에서 분리 성분 면적<셀0.5% 제거.74→0. 본체에 연결된 가는 실 유지 |
| `unity/Assets/Exoduser/Resources/Art/vfx/boss/druid_poison_orb.png` + `.meta` | 신규1254×1254/4×4/16f. 적 독 램프 #1c2810→#5f8a2e→#c8e8a8→#eef8e0. 원본 alpha/위2px/오른쪽2px 유지,원본과 같은 importer/새 GUID |
| `unity/Assets/Exoduser/Runtime/NativeDruidArt.cs` | PoisonShot의 resource만 새 시트로 교체하고 RGBA를 그대로 복사. 회색화×#66dd22 제거. `cw=t.width/4`,`ch=t.height/4`,`ox=frame%4*cw`,`oy=(3-frame/4)*ch` 그대로.313셀/프레임/피벗/생성 texture 설정 유지 |
| `tools/vfx/recolor_bullet_sheets.py`, `bullet_recolor_checks.py` | 성분/저알파 잔광 정리,3x 성분 집계,본체 alpha·RGB 보존 검사,정수 독탄 셀/메타 검사와 비교판 생성 갱신 |
| `docs/5.1임펙트디자인/{VFX_구현가이드,DRUID_POISON_PROJECTILES,VFX_BULLET_REMASTER_G1_20261103,VFX_BULLET_REMASTER_RESULT_20261103}.md`, `docs/CHANGELOG_SYNC.md` | docs 전체 관련키워드 검색 후 Unity 후보 상태와 웹 기존 계약을 구분해 동기화 |
| `tmp/design-review/bullet-remaster/{comet_compare,orb_compare,poison_compare}.png` | 원본|보완 같은 배율,각1개의3x NEAREST 전후 크롭 포함.3장 직접 열어 확인. 독탄 크롭도 정수셀 위2px 오프셋 적용 |
| `tmp/design-review/bullet-remaster/{asset_checks.json,asset_1x_3x.png}`, `tmp/{bullet_1b_probe,bullet_1b_review}.py` | 작은 정적 수치·보조 비교/진단. 게임 캡처 아님. 검토 폴더 합계 약3.7MB,20GB 미만 |

저알파 주변은 가장 가까운 성분에 귀속해 분리 성분의 잔광도0으로 만든다. 본체1px 근처의 분리 점을 dilation으로 되살리지 않는다. 본체로 분류된 alpha>0.05 픽셀의 alpha 차이0,시트 전체 RGB 차이0(1차 대비),alpha 증가0을 확인했다. 본체 주변에서 본체에 귀속된 저알파도 그대로다. **전체 알파 완전 보존 주장은 폐기하고 본체에만 적용**했다. 알파가 달라진 픽셀은 혜성47,696/오브67,299이며 독탄은0이다.

검증 명령: `C:/Python314/python.exe -B tools/vfx/recolor_bullet_sheets.py`; 관련 스위트는 `tools/vfx`에서 `C:/Python314/python.exe -B -m unittest bullet_recolor_checks`. RED2개(기존 혜성 잔점/독탄 파일 없음) 확인→구현 후 **9개 PASS**. 100셀을 각각3x NEAREST로 확대해 alpha>0.05 본체 밖 성분이 모두0인지 세었다. 나머지16셀은 원본 정수 좌표로 재채색한 RGBA/alpha 일치,미사용 여백,3개 importer의 GUID만 변경을 확인했다. `git diff --check`와 C# diff 검토로 변경 경계를 확인한다. C# 컴파일/Unity import/실제 Sprite 렌더는 미실시다.

1b 생성1회는 잔점 제거 후 기존 밝기 비율 검사에서 실패했다. 원인: RGB·밝은 픽셀 수는 같지만 가시 픽셀 분모가 작아졌다. 승인된 색을 유지하도록 검사 기준을 제거 전 가시 픽셀의3% 절대 예산으로 수정하고,허용된1회 재시도는 성공했다. **제거 후 실제 최대240+ 비율은 혜성3.03893%/오브3.16114%/독탄0.68393%**다. 사후3% 이하라고 보고하지 않으며,새 밝은 픽셀을 추가하거나 RGB를 바꾸지 않았다. 생성 성공 검사를 반복하지 않았고,독탄 비교판은 여백 크롭 수정분만 다시 저장했다.

직접 본 판정: 혜성 분리 별/잔점 제거는 정적 범위 PASS. 오브 분리 실 조각도 제거됐으나 연결된 실 묶음의 본체 형태는 **RETOUCH**로 유지한다. 독탄은 라임 단색 곱에서 어두운 올리브·연한 코어로 바뀌었지만 원본의 위성 구체/질감 점을 그대로 보존했으므로 독탄 점0·형태 PASS를 주장하지 않는다. **본체 밖 성분0은 혜성/오브의 지정 임계값 검사에만 해당**하며 전체 게임 아트 PASS가 아니다.

남은 문제: 원소구의 큰 탄두+짧은 꼬리 형태 재제작은2차. `NativeSkillRemaster.Current.Drawn(p)`가 true인 경로의 실제 시트 소비,독탄 importer/런타임 합성,1920/3840 실게임1x/3x,07e·11a·무음10초·자연 밀집전은 총괄 인수 후 검수해야 한다. 사용자 실행본 교체·커밋·push는 하지 않았다. 원본PNG·game.html·Core·다른 세션·세이브 변경0,영구 삭제0.

END
