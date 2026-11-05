# MANUAL/TOOLS — 도구 사용 매뉴얼 색인 (2026-11-05)

근거: [DIRECTION_RESET 11-05 09:50](../../DIRECTION_RESET_20261105.md) "도구 사용 매뉴얼 없이는 그 도구를 제작에 쓰지 않는다." 파일마다 8칸 틀: ① 목적·단계 ② 입력 형식 ③ 옵션 전수표(옵션 → 무엇을 바꾸나 → 우리 설정값 → 근거 출처) ④ 절차 ⑤ 출력 형식·네이밍 ⑥ 검수 방법 ⑦ 금지·흔한 실패 ⑧ 실습 기록.

작성 순서(CTO 11-05 15:05 범위 조정, 사용자 "모든 자원 캐릭터 심화" → 캐릭터 도구 우선):

| 순서 | 파일 | 단계 | 상태 |
|---|---|---|---|
| 1 | [BLENDER_RIGIFY_RIG.md](BLENDER_RIGIFY_RIG.md) | 리깅(Rigify·본 표준·Humanoid/UE 호환) | 조사 완료(클라우드), 실습 Mac 대기 |
| 2 | [BLENDER_WEIGHT_TRANSFER.md](BLENDER_WEIGHT_TRANSFER.md) | 웨이트 전사(Data Transfer, 파트 간) | 〃 |
| 3 | [BLENDER_MODULAR_PARTS_BODYMASK.md](BLENDER_MODULAR_PARTS_BODYMASK.md) | 모듈러 파트 분할·바디 마스크 | 〃 |
| 4 | [SOCKET_WEAPON_ATTACH.md](SOCKET_WEAPON_ATTACH.md) | 소켓/무기 부착(Blender→Unity/UE) | 〃 |
| 5 | [UNITY_BONES_REMAP_UE_LEADERPOSE.md](UNITY_BONES_REMAP_UE_LEADERPOSE.md) | Unity SkinnedMeshRenderer bones 재매핑·UE Leader Pose | 〃 |
| 5b | [pixel_oe.md](pixel_oe.md) | 픽셀 렌더 후처리(아웃라인 확장·대비 다운스케일·팔레트) — CTO 1순위 평가 | 조사 완료, Mac 실습 과제(입력·명령·기대 출력) 기재 |
| 5c | [pixel_fx.md](pixel_fx.md) | 임팩트 플립북 재료(코드 이펙트 244, 팔레트·타이밍 맞춤만) | 〃 |
| 5d | [sprite_gen.md](sprite_gen.md) | 시트 조립·영상 프레임/루프·배경 분리 **유틸만**(생성 경로 금지) | 조사 완료, 실습 선택 |
| — | 2dimg2motion(정지 이미지→14프레임) | 채택 안 함 — TOOL_MASTERY §1b-6 한 줄 | — |
| 6 | (분리 예정) 리토폴로지·UV·베이크·LOD·생성 옵션표 | 소품 파이프라인 | 내용은 [../TOOL_MASTERY_20261105.md](../TOOL_MASTERY_20261105.md) §1b·§2에 있음(유지). 캐릭터 5장 실습 뒤 8칸 파일로 분리 |

출처 표기는 TOOL_MASTERY §0과 같다: `[열림]` 직접 확인 / `[발췌]` 검색 발췌 / `[미검증]` 상충·없음. 이 세션 네트워크에서 docs.blender.org·docs.unity3d.com·dev.epicgames.com은 열리지 않아 GitHub 소스와 발췌로 채웠다. Mac 실습 때 원문을 열어 설정 이름을 대조한다.
