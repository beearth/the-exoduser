# Unity 등급 색 변주 후보 (2026-11-05)

**문서 조사이다. 구현은 최종 갑옷 뒤에 한다.** 후보: Shader Graph 재질 1종 + 등급별 재질 변형 3개.

| 근거 | 출처 |
|---|---|
| MaterialPropertyBlock은 SRP Batcher와 호환되지 않고, 쓰면 성능이 떨어질 수 있다 | [Unity MaterialPropertyBlock](https://docs.unity.com/en-us/engine/6000.0/script-reference/unityengine/materialpropertyblock) |
| GameObject가 호환되려면 메시나 스킨드 메시여야 하고 MaterialPropertyBlock을 쓰지 않아야 한다 | [Check SRP Batcher compatibility](https://docs.unity3d.com/6000.3/Documentation/Manual/SRPBatcher-Materials.html) |
| 커스텀 셰이더는 재질 속성을 `UnityPerMaterial` 버퍼 하나에 둔다 | [URP shader SRP Batcher](https://docs.unity3d.com/6000.3/Documentation/Manual/urp/shaders-in-universalrp-srp-batcher.html) |
| 같은 셰이더로 재질을 여럿 쓰되 셰이더 변형은 적게 (2020.1 문서, 오래됨) | [SRP Batcher](https://docs.unity3d.com/2020.1/Documentation/Manual/SRPBatcher.html) |

위 항목은 검색 요약으로 읽었고 페이지 전체를 읽지 않았다.

**미확인:** Shader Graph 재질이 호환되는지, 저해상도 픽셀 렌더와의 관계, 마스크 방식(정점 색 대 1채널 텍스처), 프로젝트의 SRP Batcher 설정 상태.
