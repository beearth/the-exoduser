const fs=require('node:fs'),path=require('node:path');
const p=path.join(__dirname,'generation-receipt.json'),r=JSON.parse(fs.readFileSync(p));
r.observed_balance_after_refresh=39890;r.observed_balance_delta=600;r.displayed_cost_points=200;
r.balance_attribution='One task submitted at displayed 200pt; aggregate tab balance changed 600pt while concurrent tasks exist. Do not attribute the full change to this task.';
r.visual_verdict='Male identity and sharper garment/weapon design improved for concept review; generated two Gatling revolvers rather than the requested single weapon. Not user-adopted or runtime-integrated.';
fs.writeFileSync(p,JSON.stringify(r,null,2));
for(const f of ['docs/17게임아트팀/ART_TEAM_MASTER.md','docs/0마스터플랜/PROJECT_MANAGEMENT_MASTER.md']){
 const s=fs.readFileSync(f,'utf8'),lines=s.split('\n'),i=lines.findIndex(x=>x.startsWith('> **2026-10-21')&&x.includes(r.task_id));
 if(i<0)throw Error('Own note missing');lines[i]=lines[i].replace('생성 중','원본2048×1536 회수·쌍리볼버 변주 검토');fs.writeFileSync(f,lines.join('\n'));
}
console.log(JSON.stringify({task:r.task_id,status:r.status,size:r.size,displayed_cost:r.displayed_cost_points,account_delta:r.observed_balance_delta}));
