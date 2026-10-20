const fs=require('node:fs'),path=require('node:path');
const p=path.join(__dirname,'generation-receipt.json'),r=JSON.parse(fs.readFileSync(p));
r.observed_balance_after_refresh=40490;r.observed_points_delta=200;r.displayed_cost_points=200;
r.visual_verdict='Concept review candidate: coherent Gatling-like revolver mass and stronger silhouette; not user-adopted or connected to runtime.';
fs.writeFileSync(p,JSON.stringify(r,null,2));
for(const file of ['docs/17게임아트팀/ART_TEAM_MASTER.md','docs/0마스터플랜/PROJECT_MANAGEMENT_MASTER.md']){
 const s=fs.readFileSync(file,'utf8');const lines=s.split('\n');
 const index=lines.findIndex(line=>line.startsWith('> **2026-10-21')&&line.includes('7518447066934194176'));
 if(index<0)throw new Error('Task-owned note missing');
 lines[index]=lines[index].replace('접수했다. task7518447066934194176.','완료·원본3312×2480을 회수했다. task7518447066934194176.').replace('현재 생성 접수, 채택/게임 적용 아님.','원본3312×2480 회수 완료·구조/무게감 검수, 사용자 채택/게임 적용 아님.');
 fs.writeFileSync(file,lines.join('\n'));
}
console.log(JSON.stringify({task:r.task_id,status:r.status,size:r.size,points_delta:r.observed_points_delta}));
