# 실버테일 r2 / r3 보행 교정 후보

`?spr=silver_r2` 개발 플래그 전용. 기본 실버테일 파일을 교체하지 않는다.

6개 폴더의 `atlas.png`가 웹 렌더 입력이다. `normal.png`는 실루엣 기반 OpenGL +Y 초안이며 이번 렌더에는 미사용이다. `metadata.json`에 atlas SHA-256·각 프레임 RGBA SHA·좌표·발 기준·제작 이력을 둔다.

원화/원본 기준: origin/main `78ebda580b9b5761583299bb5a80e463e63f4984`와 변화 없는 r2 제작 입력. 장비는 사용자 지정 C2 최종 키프레임(검은 갑옷·짙은 붉은 천·상부 등 허브의 직선 대검)을 따른다. r2 대기·보행은 CTO 후보 통과이며 제품/게임 승인이 아니다.

r3 수정은 N 보행4포즈 하체와 SE2 앞발 외곽선55픽셀이다. 나머지 보행27셀과 나머지5군 atlas는 승인 후보 r2 픽셀을 유지한다. 생성 도구는 내장 imagegen, 별도 유료 API 지출0. N 하체 원화/프롬프트는 `output/silvertail_r3/`에 보관한다.

[기술·검수 SSOT](../../../docs/archetypes/silvertail/SILVERTAIL_R2_PREVIEW_20261103.md).
