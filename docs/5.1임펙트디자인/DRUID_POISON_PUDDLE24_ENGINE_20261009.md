# 드루이드 독액장판 24프레임 · 공통 엔진 리소스

`ROOT-ENGINE-POISON-PUDDLE24-20261009`. 사용자 최신 “게임엔진팀 만들어서”, “Godot 같은 엔진을 따라”, “독액장판도24프레임 이상” 지시에 따라 ROOT와 엔진 런타임·애니메이션·에디터3담당이 한 실제 본편 단위를 제작했다. 이 엔진팀 범위에는 새 팀 생성이 직접 승인되었으며, 기존 전문15의 송신 소유/거절 경계는 그대로다.

## 실제 구현과 기준

| 범위 | 구현 / 한계 |
|---|---|
| 공통 원화 리소스 | 에디터→JSON→본편이 같은 `exoduser-atlas-clip/version1`과 PNG를 소비. [리소스·에디터 정본](../5.0애니메이션파이프라인/ENGINE_SPRITE_CLIP_RESOURCE_20261009.md), [시간·crop API](../5.0애니메이션파이프라인/ENGINE_ATLAS_CLIP_RUNTIME_20261009.md) |
| Godot 적용 | `tools/godot/exoduser_atlas_clip.gd`가 같은 JSON Dictionary와 이미 로드된 Texture2D를 받아 SpriteFrames/AtlasTexture를 생성. row-major, inset1px, filter_cliptrue, frame 상대 duration1, 리소스 fps/loop를 소비. format/version·name·양의 정수·실 texture 나눗셈·셀>2px 검증. sourcePath의 파일 로드는 caller 소유 |
| Godot loop 호환 | 새 `set_animation_loop_mode`가 있으면 0(once)/1(linear); 없으면 기존 boolean setter. GDScript format/version 타입부터 검증한 뒤 비교. 실제 Godot executable 없음/실행·컴파일未검수 |
| 참고와 미구현 | 공식 [SpriteFrames](https://docs.godotengine.org/en/stable/classes/class_spriteframes.html)·[AtlasTexture](https://docs.godotengine.org/en/stable/classes/class_atlastexture.html)의 원화/시간 resource 분리를 적용. [AnimationTree](https://docs.godotengine.org/en/stable/tutorials/animation/animation_tree.html)의 상태·blend 분리는 후속이며, 이번에 상태그래프/전체 Godot 이식/새3D리그를 완성한 것이 아님 |

## 실제 원화·메타데이터

| 항목 | 정확 값 |
|---|---|
| PNG / JSON | `assets/vfx/boss/druid_poison_pool_24_20261009.png` / 같은 stem의 `.clip.json` |
| name | `druid_poison_pool` |
| clip | columns6, rows4, frameCount24, fps24, looptrue; 1초 반복,0기준 row-major |
| 생성 | Higgsfield gpt_image_2_5/sunburst/max/4k/transparent/3:2/count1. 원job `696cf9f1-99af-4ea5-bd8e-baa64b6f7cfb`, 실제 raw3504×2336/584px cell. 24개 개별 기포·파문 그림 |
| 정렬 packaging | 색/alpha/그림 재생성·개별 scale 변경0. 동일553×330 source crop와 source floor anchor를 공통768px 셀에 scale1로 재배치. 본체 center(384,384), floor(384,519), 결과4608×3072. 큰 해상도는 투명여백이고 원화 detail 업스케일이 아님 |
| 제품 PNG | 5,818,481 bytes, SHA256 `471326317969316dd34a45de4bf9736f6525634f110022c9d5b41a505819d304` |
| 원본 보존·판독 | 모든24셀 edgealpha0·visibleRGBA hash24, alpha>16 본체와 cropRGBA exact보존. 위치 정렬 후 last→first RMSE7.43(일반5.86..10.57). 검정/회색 실제알파 합성 직접판독에서24기포 단계 확인 |
| 정정 생성 이력 | raw preview의 alpha0 숨은RGB를 사각 배경으로 오인하여 좁은 정정job `cc6faed8-9f9b-4955-9937-51846156726f` 1건을 추가했다. 실제 알파 합성에서는 둘 다 사각판이 없고 원본 packed의 점성/루프가 더 안정적이라 원본만 채택. 정정본·그릇된 첫 판정은 외부영수증 이력으로 보존. 작업별 견적15credits씩2건, 실제 계정 debit/잔액은 재조회하지 않음 |

## 실제 본편 consumer

| 지점 / 상수 | 정확 계약 |
|---|---|
| 로딩 | `_loadDruidPoolClip`: 공통 runtime `?v=20261009-v1` + clip JSON→Image. 로컬 assets/ 경로와 version/loop·factory metadata, intrinsic grid/inset1 모든rect 검증 뒤만 readytrue |
| 프레임 | `_drawDruidPoolClip`는 기존 pool.t/60초를 `sampleAtlasClip`에 전달, 단일 원화 frame 소비. wallclock/RAF/RNG/추가 프레임 복제/시간별 alpha합성 없음 |
| 표시 크기 | `R=pool.r×1.12`; 고정 registered PNG의 alpha>0 maxradius334.380770978px/768cell/inset1로 uniform safe max1.1224927764를 측정. 해당 resource 고정scale만 사용, 기존 실제 위험반경은 pool.r |
| 범위 표시 | 원화 위 기존 색 `#a9d76a`·알파 callerAlpha×0.55, 바깥 r/안쪽 max(0,r−1.2)의 얇은 원. 실제 판정/범위·경고 시간 변화 없음. WebGL Canvas proxy의 clip() no-op에 의존하지 않음 |
| lava / poison | 기존 si0/si3 렌더 조건 그대로 새clip 우선. lava 예고 t/warnT×.42, 활성.65, 마지막20% fade. poison `ppF×.68`, ppF의 시작/마지막20% fade 기존 식 유지 |
| finale | `_drawDruidFinalePool` 새clip→기존SVG→기존 aoe4×2/8셀 순서. 예고.36/활성.72×fade, fade=min(1,(maxT−t)/60), 외곽·전조 수축링1.5px/.38fade 유지 |
| 실패 | module/JSON/schema/image/intrinsic 실패는 readyfalse. 기존 SVG 및 원 aoe8셀 표시 폴백. 같은 pool clock/피해/경고/수명 소비 |
| 복구 | 새 drawImage와 경계 fill의 ctx.save를 각각 finally에서 restore. 상태오류에서 caller alpha/style 복구, 자체 render 예외는 기존 caller로 전달 |
| 비변경 | lp/pp update·반경150/175·수명300/240·전조55/73/91·피해·RNG·SFX·Q전용blackBean·원PNG·사용자save·기존 타인WIP. chaseAoe/groundFissure는 기존SVG, 다른보스/캐릭터 전체24전환 아님 |

## 최초 검수와 시각 판정

| epoch | 결과 / 인수 한계 |
|---|---|
| 공통 runtime | 첫 Node1/7그룹193assertions PASS. clock/frame/crop/입력 경계. 실제PNG·GPU검수 없음 |
| 에디터 | 첫 새delta Node1/8그룹65조건 PASS. actual core/controller·통제DOM/Image dimensions/RAF. 키JSON 호환/FPS opt-in/import실패 보존/undo40. native·실다운로드 저장 미인수 |
| 본편 source | 첫 검사 준비에서 importmap JSON을 JS로 취급해 FAIL/제품소비未도달. 준비 scanner만 정정한 별도 Node1/actualwholeJS+actual runtime/Image fixture의7그룹120조건 PASS; 첫준비Node와 합산하지 않음 |
| 실제 PNG Canvas | 첫 R=√.5의 actual PNG decode/actual main helper offscreen Canvas24가시프레임·loop·경계27조건 PASS지만 중앙너무작음 RETOUCH. alpha fit으로1.12를 정정한 별도 좁은 delta24frames/27조건 PASS/원 밖 픽셀0(1.5px AA 허용)/60tick loopexact. 기존 whole suite 재실행0 |
| 소스 peer | 최초 blocker0, Godot 타입비교finding1→closed1, 최종1.12 sourceblocker0. 실제Godot 컴파일을 source검토로 대신하지 않음 |
| 실제 시각 | ROOT 실제알파 합성·controlled Canvas 정지/24프레임을 직접판독. 새 점성/기포는 유지되고 위치/크기 고정. 원형 범위 전체를 점성면이 채우지는 않으며 실제 맵/전투 조화 추가검수 필요. **VISUAL VERDICT: RETOUCH** |
| 未인수 | 기존3387 연결거부/복구질문 미응답·현재Mac잠금으로 actual main 정상줌/전체보스전/GPU/성능/청취/실save/A급 검수0. 이번 새서버·restart·entry/SAVE_DIR 접근·사용자탭 입력/reload·native재시도0 |

외부 최종 영수증 `E/engine-poison-puddle24-20261009/completion.json`이 소유 Git/원격보존의 최종 결과다. `main-consumer-playback.webp`는 실제 main draw helper의 독립 Canvas 검토 재생으로, 실제 본편 녹화가 아니다. 이미지1장·도구·CPU를 보스전 전체완성이나 A급으로 표시하지 않는다.
