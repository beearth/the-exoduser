// CH1-02 approved scope: derive through unchanged export_world, preserve base map,
// promote only native tree texture/file fields and byte-identical static PNGs.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {isDeepStrictEqual} from 'node:util';
import {fileURLToPath} from 'node:url';
export const TREE_IDS = ['m_ctree17','m_ctree18','m_ctree19','m_ctree20'];
export const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const fail = message => { throw new Error(message); };
const read = filename => JSON.parse(fs.readFileSync(filename,'utf8'));
function noSymlinks(filename) {
  for(let p=path.resolve(filename);p!==path.dirname(p);p=path.dirname(p)) {
    if(fs.existsSync(p)&&fs.lstatSync(p).isSymbolicLink())fail('Symlink destination rejected: '+p);
  }
}
export function scopedMap(base, candidate) {
  if(base.stage!==0||candidate.stage!==0)fail("UNSUPPORTED_STAGE: CH1-02 is stage0 only");
  const result=structuredClone(base), geometry=structuredClone(candidate);
  delete geometry.source;
  const normalized=structuredClone(base);delete normalized.source;
  for(const id of TREE_IDS) {
    const index=base.props.findIndex(p=>p.id===id), current=candidate.props[index];
    if(index<0||current?.id!==id)fail('Tree order changed: '+id);
    for(const field of ['texture','metadata'])if(!current[field])fail('Missing tree field '+id);
    result.props[index].texture=current.texture;
    result.props[index].metadata.file=current.metadata.file;
    normalized.props[index].texture=current.texture;
    normalized.props[index].metadata.file=current.metadata.file;
  }
  if(!isDeepStrictEqual(normalized,geometry))fail('OUT_OF_SCOPE: generator changed geometry, placement, collision or other fields');
  return result;
}
export function synchronize(rootInput,evidenceInput,{apply=false}={}) {
  const root=fs.realpathSync(rootInput), evidence=path.resolve(evidenceInput);
  if(evidence===root||!path.relative(root,evidence).startsWith('..'+path.sep))fail('Evidence must be outside source root');
  noSymlinks(evidence);
  const mapFile=path.join(root,'godot/data/map.json');noSymlinks(mapFile);
  const baseBytes=fs.readFileSync(mapFile), base=JSON.parse(baseBytes);
  if(apply&&fs.existsSync(path.join(evidence,'map.before.json'))&&sha(fs.readFileSync(path.join(evidence,'map.before.json')))!==sha(baseBytes))fail('Evidence directory already contains a different before-map; choose a new evidence directory');
  const exporter=path.join(root,'godot/tools/export_world.mjs'), originalExporter=fs.readFileSync(exporter);
  const output=path.join(evidence,'reextract'), copyTool=path.join(output,'tools/export_world.mjs');
  fs.mkdirSync(path.dirname(copyTool),{recursive:true});fs.writeFileSync(copyTool,originalExporter);
  const stdout=execFileSync(process.execPath,[copyTool,root,path.join(evidence,'export-evidence')],{encoding:'utf8',env:process.env});
  fs.writeFileSync(path.join(evidence,'export.stdout.log'),stdout);
  const candidate=read(path.join(output,'data/map.json')), receipt=read(path.join(evidence,'export-evidence/export-receipt.json'));
  const promoted=scopedMap(base,candidate);
  const sourceText=fs.readFileSync(path.join(root,'game.html'),'utf8');
  const snapshot=read(path.join(root,'godot/data/ch1_map_source/si0.json'));
  if(snapshot.source.game_sha256!==sha(sourceText))fail('Latest source differs from admitted CH1-01 source pin');
  for(const id of TREE_IDS) {
    const native=snapshot.ch1_deco_raw.find(p=>p.id===id), prop=candidate.props.find(p=>p.id===id);
    if(!native||prop.metadata.file!==native.file||prop.texture!=='res://assets/map/props/'+native.file)fail('Raw native tree contract mismatch '+id);
  }
  const assets=receipt.assets.map(entry=>{
    const relative=path.relative(output,entry.destination);
    if(relative.startsWith('..')||path.isAbsolute(relative)||!relative.endsWith('.png'))fail('Invalid exporter destination');
    const source=fs.realpathSync(entry.source), extracted=path.join(output,relative), target=path.join(root,'godot',relative);
    if(!source.startsWith(root+path.sep))fail('External source asset');
    const bytes=fs.readFileSync(source), digest=sha(bytes);
    if(digest!==entry.sha256||sha(fs.readFileSync(extracted))!==digest)fail('Exporter PNG bytes differ');
    const exists=fs.existsSync(target), old=exists?sha(fs.readFileSync(target)):null;
    if(old!==digest&&!/^assets\/map\/production_finish\/chunk_[0-7]_[0-7]\.png$/.test(relative)
      &&!TREE_IDS.some(id=>candidate.props.find(p=>p.id===id).texture==='res://'+relative))fail('OUT_OF_SCOPE asset change '+relative);
    noSymlinks(target);
    return {source:path.relative(root,source),target:'godot/'+relative,bytes:bytes.length,sha256:digest,before_sha256:old,changed:old!==digest};
  });
  if(assets.length!==92)fail('Expected full exporter receipt of 92 PNGs');
  const currentChanges=assets.filter(a=>a.changed);
  const history=base.source.asset_updates||[];
  const previous=history.find(entry=>entry.task==='CH1-02');
  if(!previous&&(currentChanges.length!==46||currentChanges.filter(a=>a.target.includes('/production_finish/')).length!==42))fail('Unexpected baseline asset delta');
  if(previous&&currentChanges.length!==0)fail('Existing CH1-02 receipt no longer matches target PNGs');
  const lines={};
  for(const id of TREE_IDS) {
    const marker="{id:'"+id+"',file:";
    const offset=sourceText.indexOf(marker);if(offset<0)fail('Missing source declaration '+id);
    lines[id]=sourceText.slice(0,offset).split('\n').length;
  }
  const update=previous||{task:'CH1-02',source_main_sha:execFileSync('git',['rev-parse','origin/main'],{cwd:root,encoding:'utf8'}).trim(),
    source_root:root,game_sha256:sha(sourceText),exporter_sha256:sha(originalExporter),source_lines:lines,
    baked_source_lines:[11615,11616],placement_source_line:18138,
    scope:'four static tree texture/file pairs and 42 baked chunks; no geometry/placement/collider changes',
    before_map_sha256:sha(baseBytes),assets:assets.map(({changed,...a})=>a)};
  if(previous&&(previous.game_sha256!==sha(sourceText)||previous.exporter_sha256!==sha(originalExporter)))fail('Stale asset provenance');
  promoted.source.asset_updates=previous?history:[...history,update];
  const outputBytes=JSON.stringify(promoted), plan={schema:'exoduser.ch1-02.static-assets.v1',apply,source:root,
    source_game_sha256:sha(sourceText),exporter_sha256:sha(originalExporter),png_count:assets.length,
    changed_pngs:currentChanges.map(a=>a.target),changed_png_count:currentChanges.length,
    approved_tree_fields:TREE_IDS.flatMap(id=>{const i=base.props.findIndex(p=>p.id===id);return ['/props/'+i+'/texture','/props/'+i+'/metadata/file'];}),
    geometry_placement_collision_unchanged:true,base_provenance_preserved:true,assets,
    before_map_sha256:sha(baseBytes),after_map_sha256:sha(outputBytes)};
  fs.mkdirSync(evidence,{recursive:true});fs.writeFileSync(path.join(evidence,'map.candidate.json'),outputBytes);
  fs.writeFileSync(path.join(evidence,'scoped-plan.json'),JSON.stringify(plan,null,2));
  if(apply) {
    // Validate ALL inputs first, then back up only this approved scope.
    for(const asset of currentChanges) {
      const target=path.join(root,asset.target);
      if(fs.existsSync(target)) {const backup=path.join(evidence,'before',asset.target);fs.mkdirSync(path.dirname(backup),{recursive:true});fs.copyFileSync(target,backup);}
    }
    fs.writeFileSync(path.join(evidence,'map.before.json'),baseBytes);
    for(const asset of currentChanges) {const target=path.join(root,asset.target);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(root,asset.source),target);}
    noSymlinks(mapFile);fs.writeFileSync(mapFile,outputBytes);
  }
  return plan;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {
    const args=process.argv.slice(2);
    if(args.length<2||args.length>3||(args[2]&&args[2]!=='--apply'))fail('Usage: sync_ch1_stage0_assets.mjs <latest-WT-root> <external-evidence-dir> [--apply]');
    const result=synchronize(args[0],args[1],{apply:args[2]==='--apply'});
    console.log(JSON.stringify({apply:result.apply,png_count:result.png_count,changed_png_count:result.changed_png_count,geometry_placement_collision_unchanged:true,after_map_sha256:result.after_map_sha256}));
  } catch(error) { console.error(error.message);process.exitCode=1; }
}
