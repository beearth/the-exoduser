// Run with explicit --root and --project; Junction physical paths are irrelevant.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const argument=k=>{const i=process.argv.indexOf(k);if(i<0||!process.argv[i+1])throw Error('Missing '+k);return path.resolve(process.argv[i+1])};
const root=argument('--root'),project=argument('--project'),res=project+'/Assets/Exoduser/Resources',rows=[];
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
function copy(source,destination){const b=fs.readFileSync(root+'/'+source),to=res+'/'+destination;fs.mkdirSync(path.dirname(to),{recursive:true});fs.writeFileSync(to,b);if(digest(fs.readFileSync(to))!==digest(b))throw Error('Copy mismatch '+source);rows.push({source,destination,bytes:b.length,sha256:digest(b)});}
function texture(source){const rel=source.replace('res://assets/','');copy('godot/assets/'+rel,'Art/'+rel);return 'Art/'+rel.replace(/\.png$/,'');}
const m=JSON.parse(fs.readFileSync(root+'/godot/data/map.json','utf8'));
const map={width:m.width,height:m.height,tileSize:m.tile_size,startX:m.start_position[0],startY:m.start_position[1],tiles:m.tiles,hill:m.hill,
 colliders:m.prop_colliders.map(p=>({x:p.position[0],y:p.position[1],rx:p.radii[0],ry:p.radii[1]})),
 chunks:m.chunks.map(c=>({texture:texture(c.texture),x:c.world_rect[0],y:c.world_rect[1],width:c.world_rect[2],height:c.world_rect[3],sx:c.source_rect[0],sy:c.source_rect[1],sw:c.source_rect[2],sh:c.source_rect[3]})),
 props:m.props.map(p=>({id:p.id,texture:texture(p.texture),x:p.position[0],y:p.position[1],width:p.draw_size[0],height:p.draw_size[1],pivotX:p.pivot[0],pivotY:p.pivot[1],rotation:p.rotation_degrees,alpha:p.alpha,ground:p.ground,flip:p.flip_h}))};
// Existing web canvas exports only; no regeneration or geometry changes.
map.altarMoat={};
for(const [key,name] of Object.entries({hill:'hill',channel:'moat',glow:'moatGlow',bubble:'moatBubble'})){
 copy('godot/assets/map/web_parity/living/'+name+'.png','Art/map/altar_moat/'+name+'.png');
 map.altarMoat[key]='Art/map/altar_moat/'+name;
}
for(const f of fs.readdirSync(root+'/godot/assets/player').filter(f=>f.endsWith('.png')))copy('godot/assets/player/'+f,'Art/player/'+f);
for(const f of fs.readdirSync(root+'/godot/assets/enemy').filter(f=>f.startsWith('atlas_ch1_8dir')&&f.endsWith('.png')))copy('godot/assets/enemy/'+f,'Art/enemy/'+f);
for(const f of ['ui_bar_only.png','ui_globe_hp.png','ui_globe_mp.png','mm_frame.png'])copy('godot/assets/ui/'+f,'Art/ui/'+f);
copy('godot/assets/fonts/NotoSansKR.ttf','Art/fonts/NotoSansKR.ttf');
copy('godot/assets/fonts/ofl/nanummyeongjo/NanumMyeongjo-Regular.ttf','Art/fonts/NanumMyeongjo-Regular.ttf');
copy('godot/assets/fonts/ofl/nanummyeongjo/OFL.txt','Art/fonts/NanumMyeongjo-OFL.txt');
copy('godot/assets/fonts/ofl/cinzeldecorative/CinzelDecorative-Bold.ttf','Art/fonts/CinzelDecorative-Bold.ttf');
copy('godot/assets/fonts/ofl/cinzeldecorative/OFL.txt','Art/fonts/CinzelDecorative-OFL.txt');
copy('godot/assets/ui/skill_icons/kiSlash.png','Art/ui/skill_icons/kiSlash.png');
texture('res://assets/vfx/ki_slash_silver_sheet.png');
texture('res://assets/vfx/ki_slash_hit_silver_sheet.png');
for(const key of ['sword_swing1','sword_swing2','sword_swing3'])copy('sfx/swing/'+key+'.mp3','Audio/'+key+'.mp3');
copy('sfx/scarecrow_charge.mp3','Audio/scarecrow_charge.mp3');
copy('sfx/sword_parry/sfxsword_parry.mp3','Audio/sword_parry.mp3');
const source=fs.readFileSync(root+'/godot/source_snapshot/game.html');
fs.mkdirSync(res+'/Data',{recursive:true});fs.writeFileSync(res+'/Data/ch1_map.json',JSON.stringify(map));
fs.mkdirSync(project+'/Tools/Fixtures',{recursive:true});fs.writeFileSync(project+'/Tools/Fixtures/source_receipt.json',JSON.stringify({schema:'exoduser.unity.source-assets.v1',sourceSha256:digest(source),mapSourceSha256:digest(fs.readFileSync(root+'/godot/data/map.json')),assetCount:rows.length,bytes:rows.reduce((s,r)=>s+r.bytes,0),assets:rows},null,2));
console.log(JSON.stringify({assetCount:rows.length,bytes:rows.reduce((s,r)=>s+r.bytes,0),map:{width:map.width,height:map.height,chunks:map.chunks.length,props:map.props.length},sourceSha256:digest(source)}));
