const fs=require('fs'),r=__dirname,j=JSON.parse(fs.readFileSync(r+'/직접-시각판정.json')),t=JSON.parse(fs.readFileSync(r+'/납품-기술검사.json'));fs.writeFileSync(r+'/MAP_PRODUCTION_REPORT.md',`# MAP PRODUCTION REPORT — CH1-1 Blender 나무다리 R3

STAGE: 승인 썩은 숲·독액 강·나무다리용 독립 환경 키트/정적 키샷 조립. 실제 전체 맵 변경0.

MASTER
- silhouette: 대각선 나무다리와 좌우 큰 거목, 아래 파단 목질/낮은 그루터기, 먼 숲의 층.
- regions: 양 강둑·나무다리·북쪽 흙길·독액 수역의 정적 시연. Core 지역 계약 변경0.
- main route: Blender의 남→북 Y축 다리 접근/상판 중심을 비움. 게임 경로 검수 아님.
- side spaces: 강가·나무 밑동·전경 장식 공간. 실제 arena/travel 영역 설계/잠금 아님.

OUTER MASS
- LEFT: 실제 뒤틀린 거목 스캔과 파단 목질·이끼·균류.
- RIGHT: 가까운 전경 거목과 낮은 그루터기/목질로 외곽 질량 보강.
- TOP: 뒤쪽 거목·실루엣 카드·실제 체적 안개.
- SOUTH: 실제 파단 가지 프레임과 접지된 낮은 그루터기/낙엽.
- major holes: 정적 프레임 우측 빈 수역을 전경 질량으로 보강. 전체 실맵 외곽·뒤쪽 공간은 미검증.

LARGE
- source assets: Poly Haven CC0 원본/MD5/SHA 영수증. 큰 목질·암반은 실제 스캔 기반.
- composites: Fallen_Log 실제 베이크를 공유하는 전경 목질2개/침수 말뚝5개 조합.
- overlap: 깊이가 다른 실제 목질/지면/식생을 접합. 남은 현재 1x 판정은 직접-시각판정.json.
- repeated silhouette: 한 거목 원본을 양방향·회전·비례로 변주. 서로 다른 고유 스캔2종이라고 보고하지 않음.

MEDIUM
- connections: 파단 뿌리·처진 실물 잎 다발·균류·시든 덤불·갈색 낙엽을 실제 표면에 연결.
- remaining holes: 정적 시연 밖 공간과 게임 배치는 미검증. 원화 수준의 연속적인 이끼 질량은 후속 미세 조정 대상.

GROUND
- shadow: Cycles 실제 접촉 그림자/AO와 목질 반영. Unity의 실제 그림자·접지는 미검증.
- contamination: 젖은 흙·낙엽·이끼 저주파 혼합4K, 암반 톤/물가 젖은층, 실제 곡면 낙엽.
- structure integration: 연속 강둑 경사·강바닥, 독립 별 모양 흙섬 제거·침수된 실제 목질 접합. 게임 충돌 변경0.

PLAYABLE
- main arenas: 제작 범위 아님/미검증.
- travel space: 다리 접근과 중심의 정적 공간만 비움. 실이동/dodge 미검증.
- breathing space: 제작 범위 아님/미검증.
- threat space: 제작 범위 아님/미검증.
- combat readability: 실제 적/탄막/스킬/성능 미검증.

LANDMARK
- primary: 썩은 나무다리.
- secondary: 왼쪽 거목·강가 그루터기·다리 끝 횃불받침.
- tertiary: 작은 균류·늘어진 이끼·파단 말뚝. 불꽃/광원은 Blender 대리물.

CAMERA QA
- START: 실제 게임 미실행.
- EARLY: 실제 게임 미실행.
- ARENA: 실제 게임 미실행.
- SIDE L: 실제 게임 미실행.
- SIDE R: 실제 게임 미실행.
- LANDMARK: 승인 카메라 추정 단일 정적1920×1080/1x만 별도 검수. 실제 게임 미실행.
- LATE: 실제 게임 미실행.
- EXIT: 실제 게임 미실행.

TECH QA
- route: 실제 게임 미검증.
- collision: 변경0/실제 게임 미검증.
- pageerror: 실행 브라우저/게임 미검증.
- 404: 실행 브라우저/게임 미검증.
- seam: 납품 UV/맵/FBX 검사와 게임 청크 이음매는 별도. 게임 미검증.
- loading: 실제 Unity 임포터·로딩 미검증.
- performance: 정적 모듈${t.삼각형합계}tri, 조립 낙엽49344개. GPU/실게임/M1/드로콜/알파 overdraw 미검증.

FILES
- stage-owned: woodbridge-r3 산출·소스·실패/검수·레시피, 별도 sparse 작업 폴더의 tools/blender-env/woodbridge-r3 및 관련 docs2개.
- concurrent touched: 원래 작업 폴더의 다른 작업자 HEAD/WIP는 관측만. 수정/스테이징0.
- unrelated touched: 사용자 세이브·공용 INDEX·Core/Runtime·서버·앱·Unity/Player 변경0.

GIT
- staged: 자기 소유 레시피/README와 docs2개만 정확한 파일 경로로 처리.
- commit: 별도 codex/pc-blender-env-r3-20261030. 현재 최종 SHA는 최종-인계영수증.json.
- push: 코드/docs 복구 후보 원격 ref를 최종 SHA와 대조. 바이너리/렌더는 I:에 보존.
- deploy: 없음. 브랜치 전체 Runtime merge/Unity main/Steam/Set Live0. PC·Mac 전체 동기화 완료 주장0.

VISUAL VERDICT: ${j.판정}

NEXT PASS: ${j.다음작업}
`);console.log('공통 가이드23절의 모든 필드 기록');
