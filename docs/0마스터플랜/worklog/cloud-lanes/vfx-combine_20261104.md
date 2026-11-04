# L4 vfx-combine 결과 (2026-11-04)

브랜치 `claude/unity-cloud-vfx-angler-combine-20261104` (기준 e3d8d6a54 포함, 시작 2f9fb68a). **컴파일 미확인(PC)·화면 미검수.**

| 병합 | 소스 | 충돌 | 해결 |
|---|---|---|---|
| 1 | angler-water-impl 0409212b9 | CHANGELOG_SYNC | 양쪽 줄 유지, 마커 제거, CRLF 유지(CR 수 = 줄 수) |
| 2 | vfx-audit-fix 6c66c7672 | CHANGELOG_SYNC, VFX_LEAD_MASTER(표 13·16), FieldBullets 주석 | 양쪽 유지 |

- FieldBullets: `AnglerSplitDraw`·`AnglerOrbDraw`를 `p.Friendly` 분기 앞으로 이동(분열탄은 Friendly라 필수). Core(44edc5215) 무변경.
- 정적 검토: 마커 0, 중복 정의 없음(AnglerRim/FriendlyFieldRim 별개), 테스트 등록(Program.cs·run.cjs) 양쪽 유지, AuditFixTests의 Friendly<Web 순서 검사 유지.
- 남은 위험: 컴파일·990+23 검사 미실행; 분열탄 은백 테는 AnglerRim이 담당(Friendly 테 중복 없음); 이미지 3장 화면 판정 Mac 대기.
