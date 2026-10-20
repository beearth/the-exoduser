import fs from 'node:fs';
import vm from 'node:vm';
import readline from 'node:readline';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const lines=[],glyphs=[],maps=[];let n=0;
for await(const line of readline.createInterface({input:fs.createReadStream(path.join(root,'game.html')),crlfDelay:Infinity})){n++;if(n>=27690&&n<=27727)lines.push(line);if(n>=27730&&n<=27785)glyphs.push(line);if(n>=27883&&n<=27884)maps.push(line);}
const lib=fs.readFileSync(path.join(root,'stat-panel-ui.js'),'utf8');
const ctx=vm.createContext({});vm.runInContext(lib+'\n'+lines.join('\n')+'\n'+glyphs.join('\n')+'\n'+maps.join('\n')+'\nglobalThis.defs=[...STAT_DEF,...PASSIVE_DEF];globalThis.iconFor=k=>ICONV[k==="grit"?"anvil":STAT_SVG[k]||PASSIVE_SVG[k]||"star"];',ctx);
const clean=s=>s.replace(/[\p{Extended_Pictographic}\uFE0F\u200D\u2726]/gu,'').trim();
const api=ctx.ExoduserStatsPanel;
const defs=ctx.defs.map(d=>({key:d.key,ko:clean(d.name),en:clean(d.nameEn),desc:d.desc,descEn:d.descEn,max:d.max??500}));
// GRIT is a growth-ui definition in web mount, not STAT_DEF.
if(!defs.some(d=>d.key==='grit'))defs.push({key:'grit',ko:'근성',en:'Grit',desc:'',descEn:'',max:0});
const effects={};for(const d of defs)effects[d.key]=(d.key.startsWith('p')?api.passiveEffects(d.key,0):api.statEffects(d.key,0)).map(r=>({...r,cap:Number.isFinite(r.cap)?r.cap:null}));
const data={source:{game_lines:[27690,27727],glyph_lines:[27730,27785],glyph_maps:[27883,27884],ui_sha256:crypto.createHash('sha256').update(lib).digest('hex')},defs,paths:api.paths,centers:api.bodyNodes,layout:api.constellationLayout(defs.filter(d=>d.key.startsWith('p'))),effects};
const half=lib.match(/const half='([^']+)'/)[1];
const anatomy=[...lib.matchAll(/side.append\(svg\('path',\{d:'([^']+)'/g)].map(m=>m[1]);
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="800" viewBox="0 0 1000 800"><g fill="none" stroke="#a39779" stroke-opacity=".38" stroke-width="1.2"><path d="${half}"/><path d="${half}" transform="translate(1000 0) scale(-1 1)"/>${anatomy.map(d=>`<path d="${d}"/><path d="${d}" transform="translate(1000 0) scale(-1 1)"/>`).join('')}</g><g fill="none" stroke="#8b8064" stroke-opacity=".09">${[275,305,365].map(r=>`<circle cx="500" cy="395" r="${r}"/>`).join('')}</g></svg>\n`;
const atlas=`<svg xmlns="http://www.w3.org/2000/svg" width="${defs.length*32}" height="32" viewBox="0 0 ${defs.length*32} 32"><g fill="none" stroke="#dfd6c2" color="#dfd6c2" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${defs.map((d,i)=>`<g transform="translate(${i*32+4} 4)">${ctx.iconFor(d.key)}</g>`).join('')}</g></svg>\n`;
const outputs={'godot/assets/ui/demo_growth_glyphs.svg':atlas,'godot/data/demo_growth_ui.json':JSON.stringify(data)+'\n','godot/assets/ui/demo_growth_body.svg':svg};
let bad=0;for(const [file,bytes] of Object.entries(outputs)){if(process.argv.includes('--check')){if(fs.readFileSync(path.join(root,file),'utf8')!==bytes)bad++;}else fs.writeFileSync(path.join(root,file),bytes);}
console.log(JSON.stringify({definitions:defs.length,centers:api.bodyNodes.length,ranks:data.layout.nodes.length,mismatches:bad}));process.exitCode=bad?1:0;
