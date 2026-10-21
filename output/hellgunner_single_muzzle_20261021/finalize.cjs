const fs=require('node:fs'),path=require('node:path');
const p=path.join(__dirname,'generation-receipt.json'),r=JSON.parse(fs.readFileSync(p));
r.visual_verdict='Both weapons show one forward firing bore each; large rear cylinders and male identity/dual-pistol composition are retained visually.';
r.visible_weapon_count=2;r.visible_muzzles_per_weapon=[1,1];r.user_adopted=false;r.runtime_integrated=false;
r.cost_scope='One completed request at displayed 200pt. No post-completion balance refresh for this task; shared account delta not inferred.';
fs.writeFileSync(p,JSON.stringify(r,null,2));
for(const f of ['docs/17게임아트팀/ART_TEAM_MASTER.md','docs/0마스터플랜/PROJECT_MANAGEMENT_MASTER.md']){
 const s=fs.readFileSync(f,'utf8'),lines=s.split('\n'),i=lines.findIndex(x=>x.startsWith('> **2026-10-21')&&x.includes(r.task_id));if(i<0)throw Error('Own note missing');
 lines[i]=lines[i].replace('생성 중','원본3312×2480 회수·각 총구1개 확인');fs.writeFileSync(f,lines.join('\n'));
}
console.log(JSON.stringify({task:r.task_id,size:r.size,muzzles:r.visible_muzzles_per_weapon,cost_displayed:r.displayed_cost_points}));
