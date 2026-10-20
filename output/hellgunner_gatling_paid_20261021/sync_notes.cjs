const fs=require('node:fs');
const notes={
 'docs/17게임아트팀/ART_TEAM_MASTER.md':'> **2026-10-21 최신 유료 작화 탐색:** 사용자 “게틀링처럼 생긴 리볼버, 지금 거너는 너무 약해보여”에 따라 [게틀링형 리볼버 헬거너](HELLGUNNER_GATLING_REVOLVER_20261021.md)1장을 MagicLight GPT Image2.5 sunburst/4:3/200pt로 접수했다. task7518447066934194176. 거대 회전 총열+리볼버 실린더·강한 비대칭 실루엣. 이전 단일 총열 조건은 이번 새 시안에서 대체한다. 결과 회수·채택·게임 교체와 구분한다.',
 'docs/0마스터플랜/PROJECT_MANAGEMENT_MASTER.md':'> **2026-10-21 최신 신캐릭터 유료 작화:** 사용자 LoL급 개성 방향과 “게틀링처럼 생긴 리볼버, 거너가 약해보인다” 지시로 [신규 헬거너 시안](../17게임아트팀/HELLGUNNER_GATLING_REVOLVER_20261021.md)을 MagicLight 기존 포인트200pt로1장 접수(task7518447066934194176). 신규 충전0. 회전 총열 뭉치+거대 리볼버 실린더·묵직한 실루엣이며 이전 단일 총열 제한은 대체. 현재 생성 접수, 채택/게임 적용 아님.',
 'docs/11내러티브·로어디자인/NEW_HEROES_DESIGN_LOCK.md':'> **2026-10-21 사용자 최신 헬거너 정정:** “게틀링처럼 생긴 리볼버로 디자인해봐라 지금 거너는 너무 약해보여.” 신규 콘셉트는 회전 총열 뭉치와 거대한 리볼버 실린더를 한 자루로 결합한다. 아래 과거 단일 총열/총구 여러 개 금지는 새 시안에 적용하지 않는다. 캐릭터 고유 형상과 무게감을 강화한 유료 원화 탐색이며 게임 발사 방식/탄수/밸런스 확정이 아니다. [현재 제작 대장](../17게임아트팀/HELLGUNNER_GATLING_REVOLVER_20261021.md) 참조.',
 'docs/17게임아트팀/HELLGUNNER_REVOLVER_RIFLE_20261021.md':'> **2026-10-21 후속 사용자 지시가 우선:** “게틀링처럼 생긴 리볼버, 지금 거너는 너무 약해보여.” [최신 게틀링형 리볼버 시안](HELLGUNNER_GATLING_REVOLVER_20261021.md)은 거대 회전 총열 뭉치+후방 리볼버 실린더를 결합한다. 아래 단일 총열/일반 리볼버 라이플은 이전 제작 이력이며 새 유료 콘셉트의 총열 수를 제한하지 않는다. 과거 결과의 소급 채택이나 현행 게임 에셋 변경은 아니다.'
};
for(const [p,note] of Object.entries(notes)){
 const s=fs.readFileSync(p,'utf8');if(s.includes(note))continue;
 const i=s.indexOf('\n'),nl=s.includes('\r\n')?'\r\n':'\n';
 fs.writeFileSync(p,s.slice(0,i+1)+nl+note+nl+s.slice(i+1));
}
console.log(JSON.stringify({taskNotes:Object.keys(notes).length}));
