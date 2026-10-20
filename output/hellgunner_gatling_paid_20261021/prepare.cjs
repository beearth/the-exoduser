const fs=require('node:fs'),path=require('node:path');
const dir=__dirname,root=path.resolve(dir,'../..');
fs.mkdirSync(path.join(dir,'original'),{recursive:true});
for(const file of ['docs/17게임아트팀/ART_TEAM_MASTER.md','docs/0마스터플랜/PROJECT_MANAGEMENT_MASTER.md','docs/11내러티브·로어디자인/NEW_HEROES_DESIGN_LOCK.md','docs/17게임아트팀/HELLGUNNER_REVOLVER_RIFLE_20261021.md']){
 const target=path.join(dir,'original',path.basename(file));
 if(!fs.existsSync(target))fs.copyFileSync(path.join(root,file),target);
}
const receipt={created_at:new Date().toISOString(),provider:'MagicLight Toolbox',model:'GPT Image 2.5 sunburst',task_id:'7518447066934194176',status:'generating',count:1,aspect_ratio:'4:3',displayed_cost_points:200,observed_balance_before:40690,balance_scope:'Fresh task tab; earlier existing tab showed stale 41490; concurrent other tasks exist, total balance changes cannot all be attributed to this task.',reference:'assets/charselect/silvertail_cut.png',reference_role:'Painting quality only, not identity/costume/pose',user_direction:'Paid generation; new conceptual unique character; Gatling-like revolver and stronger gunner silhouette',prompt:'EXODUSER 성인 여성 헬거너의 완전히 새로운 콘셉트. 참조는 반실사 얼굴·재질·깊은 명암 품질만, 인물·의상·포즈는 복제하지 말 것. 처형용 탄환을 운구하는 강인한 여성 집행자. 비대칭 적갈 단발, 창백한 성숙한 여성 얼굴, 냉정한 눈. 관처럼 묵직한 한쪽 흑철 견갑과 암적색 반망토, 짙은 가죽·닫힌 중장화, 낮게 버티는 넓은 자세. 양손에 거대한 게틀링처럼 생긴 리볼버 한 자루. 총구는 원형으로 묶인 여섯 회전총열, 뒤에는 거대 6연발 리볼버 실린더·노출 해머·권총 손잡이·짧은 어깨받침. 무기는 상체만큼 굵고 육중하며 좌전방을 향함. 총검 하나. 권총과 라이플을 따로 만들지 말 것. 탄띠급탄식 현대 기관총·별도 무기 없음. 넓은 반달형 무기 실루엣과 비대칭 어깨가 기억에 남게. 거칠고 닳은 흑철·가죽·암적색 천, 작은 황동 반사, 네온·입자·문자 없음. 전신·발·무기 전체와 여백, 짙은 청회색 단순 배경.'};
fs.writeFileSync(path.join(dir,'generation-receipt.json'),JSON.stringify(receipt,null,2));
console.log(JSON.stringify({task_id:receipt.task_id,prompt_length:receipt.prompt.length,status:receipt.status}));
