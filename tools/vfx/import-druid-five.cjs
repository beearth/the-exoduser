// Only CTO-approved sheets; no generation, Python, image noise, or shared checkout writes.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),dest=path.join(root,'unity/Assets/Exoduser/Resources/Art/vfx/boss/earth');
const names=['crack_strip_tile','ground_furrow_tile','root_vein_decal','root_vein_decal_emit','amber_drain_streak','pulse_band','wall_impact_dust','earth_eruption','thorn_spike','thorn_burst'];
const template=fs.readFileSync(path.join(dest,'ground_crack_radial.png.meta'),'utf8');
for(const name of names){
 const input=path.join('I:/EXODUSER-Storage/vfx-druid5',name+'.png'),data=fs.readFileSync(input);
 const w=data.readUInt32BE(16),h=data.readUInt32BE(20),target=path.join(dest,name+'.png');
 fs.writeFileSync(target,data);
 const guid=crypto.createHash('md5').update('exoduser-vfx-druid-five-'+name).digest('hex');
 fs.writeFileSync(target+'.meta',template.replace(/guid: [a-f0-9]+/, 'guid: '+guid));
 console.log(name+' '+w+'x'+h);
}
