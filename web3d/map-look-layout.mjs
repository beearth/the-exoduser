import {seeded} from './living-layout.mjs';
const file=p=>p.texture.split('/').pop();
export function mapLookLayout(data,anchors){
 const lights=[];
 for(const spec of data.lights){
  const props=spec.prop?anchors.props.filter(p=>p.id===spec.prop):[{position:spec.position}];
  props.forEach((p,i)=>{if(spec.nth!==undefined&&spec.nth!==i)return;
   lights.push({...spec,position:p.position.map((v,k)=>v+(spec.offset?.[k]||0))});});
 }
 for(const p of anchors.props)if(data.tree_glow.textures.includes(file(p)))lights.push({...data.tree_glow,id:'tree_glow_'+p.id,position:[...p.position],radius:p.draw_size[0]*data.tree_glow.radius_scale});
 const angle=data.light_shafts.angle_deg*Math.PI/180;
 const shafts=data.light_shafts.shafts.map(([x,y,width,length],i)=>({position:[x,y],width,length,angle,phase:i*1.7}));
 for(const s of shafts)lights.push({id:'shaft_pool',position:[s.position[0]-Math.sin(angle)*s.length*.4,s.position[1]+Math.cos(angle)*s.length*.4],radius:s.width*1.1,energy:data.light_shafts.pool_energy,color:data.light_shafts.pool_color,pulse:[.12,.25]});
 const shadows=anchors.props.filter(p=>!data.prop_shadow.skip_textures.includes(file(p)));
 const center=anchors.boundary.reduce((c,p)=>[c[0]+p[0]*anchors.tile_size/anchors.boundary.length,c[1]+p[1]*anchors.tile_size/anchors.boundary.length],[0,0]);
 const random=seeded(20261020),f=data.foreground,foreground=[];
 for(let i=0;i<anchors.boundary.length;i+=f.every){
  const p=anchors.boundary[i].map(v=>v*anchors.tile_size),dx=p[0]-center[0],dy=p[1]-center[1],d=Math.hypot(dx,dy);
  foreground.push({position:[p[0]+dx/d*f.push_out,p[1]+dy/d*f.push_out],size:f.size[0]+random()*(f.size[1]-f.size[0]),rotation:(random()*2-1)*Math.PI,flip:random()<.5,texture:f.textures[i%f.textures.length],alpha:f.tint[3]});
 }
 return {lights,shadows,shafts,foreground,occluders:anchors.prop_colliders.filter(c=>c.kind==='circle'&&c.radii[0]*data.occluder_radius_scale>=8)};
}
export function holeLights(data,holes){return (holes||[]).filter(h=>h&&Number.isFinite(h.x)&&h.alive!==false&&!h.closed).map(h=>({...data.spawn_hole_light,id:'hole',position:[h.x,h.y],radius:data.spawn_hole_light.radius_base+(h.size||0)*data.spawn_hole_light.radius_per_size}));}
export function effectLights(data,projectiles,blasts){
 const out=[],table=data.fx_lights,keys=['fire','lightning','ice','holy','dark'];
 for(const p of projectiles){if(!p||!Number.isFinite(p.x)||p.life<=0)continue;
  const spec=table[p._kiSlash?'crescent.gd':`enemy_projectile_${keys[p.el]||'fire'}.gd`];out.push({...spec,id:'fx',position:[p.x,p.y]});if(out.length===data.fx_light_limit)return out;}
 for(const p of blasts){if(!p||!Number.isFinite(p.x))continue;out.push({...table['hit_effect.gd'],id:'fx',position:[p.x,p.y]});if(out.length===data.fx_light_limit)break;}
 return out;
}
export function animatedEnergy(row,time){
 const phase=(row.position[0]*.0137+row.position[1]*.0091)%(Math.PI*2);let k=1;
 if(row.flicker){const [a,s]=row.flicker;k+=a*(.6*Math.sin(time*s+phase)+.4*Math.sin(time*s*2.71+phase*3.1));}
 if(row.pulse)k+=row.pulse[0]*Math.sin(time*row.pulse[1]*Math.PI+phase);
 return Math.max(0,row.energy*k);
}
export function foregroundPose(row,center,hero,walkable,parallax){
 const position=row.position.map((v,i)=>v+(v-(i?center.y:center.x))*parallax),distance=Math.hypot(position[0]-hero.x,position[1]-hero.y),near=row.size*.5;
 let k=Math.max(0,Math.min(1,(distance-near*.7)/(near*.6)));if(walkable)k*=.35;
 return {position,alpha:.28+(row.alpha-.28)*k};
}

// Restore the player pool after the cold ambient pass; authored hue stays local.
export function renderEnergy(row,time){return animatedEnergy(row,time)*(row.id==='player'?.8:row.id==='fx'?.7:1.45);}
