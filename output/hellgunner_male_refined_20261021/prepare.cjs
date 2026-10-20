const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..');fs.mkdirSync(path.join(__dirname,'original'),{recursive:true});
const notes={
 'docs/17게임아트팀/ART_TEAM_MASTER.md':'> **2026-10-21 최신 남성 헬거너 시안:** 사용자가 관형 견갑의 여성 후보를 “촌스럽고 투박하다”고 거절하고 남성안을 지시했다. [정제된 남성 헬거너](HELLGUNNER_MALE_REFINED_20261021.md): 게틀링형 리볼버 유지, 관/큰 탄환/고철 덩어리 제거, 정교한 외장과 긴 코트 실루엣. MagicLight Sunburst200pt1장 task7518452248233431040 생성 중. 이전 여성 유료 후보는 미채택 이력이며 게임 코드/에셋 교체 없음.',
 'docs/0마스터플랜/PROJECT_MANAGEMENT_MASTER.md':'> **2026-10-21 최신 헬거너 유료 작화:** 관형 여성 후보를 사용자 거절 후 [남성 헬거너 새 시안](../17게임아트팀/HELLGUNNER_MALE_REFINED_20261021.md)으로 전환. 정교한 게틀링형 리볼버·날카로운 남성 인상·비대칭 긴 코트, MagicLight Sunburst200pt1장 task7518452248233431040 생성 중. 원화 탐색이며 현행 캐릭터 성별/게임 에셋 변경은 별도.',
 'docs/11내러티브·로어디자인/NEW_HEROES_DESIGN_LOCK.md':'> **2026-10-21 사용자 최신 헬거너 정정:** “너무 촌스럽다 투박하고”, “차라리 남캐로 하던가”. 관형 견갑 여성 시안은 미채택. [남성 헬거너 원화 시안](../17게임아트팀/HELLGUNNER_MALE_REFINED_20261021.md)은 게틀링형 리볼버를 유지하되 정교한 기계 외장·날카로운 남성 인상·긴 코트로 새로 설계한다. 기존 여성 얼굴을 바꾸는 단순 편집이나 현행 게임 에셋/코드 교체는 아니다.',
 'docs/17게임아트팀/HELLGUNNER_GATLING_REVOLVER_20261021.md':'> **사용자 후속 거절 — 현행 채택안 아님:** “너무 촌스럽다 투박하고”, “차라리 남캐로 하던가”. 아래 관형 견갑 여성 후보는 미채택 이력으로 보존한다. [정제된 남성 헬거너 시안](HELLGUNNER_MALE_REFINED_20261021.md)이 현재 탐색 방향이다.'
};
for(const [file,note] of Object.entries(notes)){
 const s=fs.readFileSync(path.join(root,file),'utf8'),backup=path.join(__dirname,'original',path.basename(file));
 if(!fs.existsSync(backup))fs.writeFileSync(backup,s);
 if(s.includes(note))continue;const i=s.indexOf('\n'),nl=s.includes('\r\n')?'\r\n':'\n';
 fs.writeFileSync(path.join(root,file),s.slice(0,i+1)+nl+note+nl+s.slice(i+1));
}
const r={created_at:new Date().toISOString(),provider:'MagicLight Toolbox',model:'GPT Image 2.5 sunburst',task_id:'7518452248233431040',status:'generating',count:1,aspect_ratio:'4:3',displayed_cost_points:200,observed_balance_before:40490,reference:'assets/charselect/warrior_cut.png',reference_role:'Painting quality only; not face, costume, sword or pose',reference_sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'assets/charselect/warrior_cut.png'))).digest('hex'),prompt:'EXODUSER 남성 헬거너를 새로 디자인. 참조는 반실사 게임 원화의 작화 밀도와 깊은 명암 품질만. 참조의 얼굴·갑옷·검·포즈는 복제하지 말 것. 키 큰 성인 남성, 절제된 근육과 날카로운 턱선, 뒤로 넘긴 짙은 적갈발과 한 가닥 잿빛 머리, 냉정하고 오만한 눈. 조형적이고 세련된 게임 키아트, 사진 아님. 긴 비대칭 흑색 테일코트와 암적색 안감, 잘록한 허리, 겹친 얇은 흑철 판금과 닫힌 장화. 양손에 강력한 게틀링형 리볼버 한 자루, 길이는 신장의 2/3. 촘촘한 6총열 군집과 거대 후방 회전 실린더를 하나의 정교한 흑철 외장으로 연결. 큰 탄환은 외장 속에 감추고 실린더 회전 틈과 날렵한 해머·손잡이를 분명히. 얇은 은빛 모서리와 짙은 진홍 홈, 절제된 정밀 가공, 작은 하부 총검. 가는 견갑 곡선을 총의 회전 문양과 반복. 관·해골·녹슨 고철·철판 덩어리·탄띠·거대 어깨상자 없음. 힘 있는 비틀린 전투 자세, 전신·발·무기 전체와 여백, 어두운 무채색 배경, 문자 없음.'};
fs.writeFileSync(path.join(__dirname,'generation-receipt.json'),JSON.stringify(r,null,2));console.log(JSON.stringify({task:r.task_id,prompt_length:r.prompt.length,status:r.status}));
