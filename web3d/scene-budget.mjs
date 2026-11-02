export function dynamicLights(data,projectiles,blasts,hero,view){
 const table=data.fx_lights,rows=[],keys=['fire','lightning','ice','holy','dark'];
 const add=(p,spec,kind,priority)=>{
  if(!p||!spec||!Number.isFinite(p.x)||!Number.isFinite(p.y)||p.life<=0)return;
  if(view&&(p.x+spec.radius<view.x||p.x-spec.radius>view.x+view.w||p.y+spec.radius<view.y||p.y-spec.radius>view.y+view.h))return;
  rows.push({...spec,id:'fx',kind,position:[p.x,p.y],priority,distance:(p.x-hero.x)**2+(p.y-hero.y)**2});
 };
 for(const b of blasts)add(b,table['hit_effect.gd'],'hit',0);
 for(const p of projectiles)add(p,table[p?._kiSlash?'crescent.gd':`enemy_projectile_${keys[p?.el]||'fire'}.gd`],p?._kiSlash?'slash':'projectile',p?._kiSlash?1:2);
 rows.sort((a,b)=>a.priority-b.priority||a.distance-b.distance);
 return rows.slice(0,data.fx_light_limit);
}
// Budgets concern added environment only. Never reduce native combat/HUD.
export function sceneBudget(quality,proxy,layerMs=0){
 const requested=quality==='low'||proxy?3:quality==='mid'?1:0,level=Math.max(requested,layerMs>18?3:layerMs>11?2:layerMs>7.5?1:0);
 return {level,scale:[1,.88,.75,.65][level],foliage:[800,560,320,160][level],particles:[190,128,72,36][level],lightLimit:[40,32,24,16][level],shaftDust:[14,8,4,2][level],sway:level<3,heroLight:true,occlusionAlpha:.35};
}
