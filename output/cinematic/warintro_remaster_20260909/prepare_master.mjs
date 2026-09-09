import fs from 'node:fs';
import path from 'node:path';

const root = path.dirname(new URL(import.meta.url).pathname).replace(/^\/(\w:)/, '$1');
const read = p => JSON.parse(fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, ''));
const source = read(path.join(root, 'source_manifest.json'));
const lineIds = [['wa02'],['wa04'],['wa06'],['wa08'],['wa09'],['wa11'],['wa12'],['wa14','wa15'],['wa17'],['wa19','wa20','wa21'],['wa22','wa23'],['wa24'],['wa26'],['wa28'],['wa29'],['wa31','wa33']];
const folders = ['', 'w02_v2', 'w03', 'w04_v3', 'w05', 'w06', ...Array.from({length:10},(_,i)=>`batch/w${String(i+7).padStart(2,'0')}`)];
folders[15] = 'batch/w16_v2';
const base = 'https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/';
const known = ['d6063c30-9338-4300-995a-73e9fe7b61a3.mp4','a903c1a7-d08f-4d24-99d6-b9b2f37407f2.mp4','2f90a608-89f5-4c3b-b286-7aa423d6fe5d.mp4','df510745-de71-4d70-9504-8c55b3fda6de.mp4','5bbe4b9a-0e40-4834-8cb6-b3c8c1985d4c.mp4'];
const time = s => { const [h,m,t] = s.replace(',','.').split(':').map(Number); return h*3600+m*60+t; };
const stamp = s => {let n=Math.round(s*1000);return `${String(Math.floor(n/3600000)).padStart(2,'0')}:${String(Math.floor(n/60000)%60).padStart(2,'0')}:${String(Math.floor(n/1000)%60).padStart(2,'0')},${String(n%1000).padStart(3,'0')}`;};
const lines = source.lines;
const segments = [], captions = [];
let at = 0;
for (let i=0;i<16;i++) {
  const dir = path.join(root, folders[i]);
  const qa = read(path.join(dir,'qa.json'));
  const deliverable = i<5 ? null : read(path.join(dir,'deliverable.json'));
  const cleanUrl = known[i] ? base+known[i] : deliverable.clean_url;
  if (!cleanUrl) throw new Error(`Missing clean URL W${i+1}`);
  const trim = i===0 || i===3 ? 0 : .5;
  const duration = qa.duration_s;
  if (!Number.isFinite(duration)) throw new Error(`Missing duration W${i+1}`);
  const blocks=fs.readFileSync(path.join(dir,'caps.srt'),'utf8').replace(/^\uFEFF/,'').trim().split(/\r?\n\s*\r?\n/);
  if (blocks.length!==lineIds[i].length) throw new Error(`Wrong caption count W${i+1}`);
  for (let j=0;j<blocks.length;j++) {
    const rows=blocks[j].split(/\r?\n/), [a,b]=rows[1].split(' --> ').map(time), text=rows.slice(2).join('\n');
    const original=lines.find(x=>x.id===lineIds[i][j]);
    if (text.replace(/\s/g,'')!==original.ko.replace(/\s/g,'')) throw new Error(`Caption differs ${original.id}`);
    if (!(a>=trim && b<=duration && a<b)) throw new Error(`Caption outside clip ${original.id}`);
    captions.push({id:original.id,scene:i+1,start_s:at+a-trim,end_s:at+b-trim,ko:text,en:original.en});
  }
  segments.push({scene:i+1,folder:folders[i],clean_url:cleanUrl,source_duration_s:duration,trim_start_s:trim,duration_s:duration-trim,at_s:at,voice_start_s:qa.voice_start_s??1,voice_duration_s:qa.voice_duration_s,caption_ids:lineIds[i]});
  at+=duration-trim;
}
if(captions.length!==21 || new Set(captions.map(x=>x.id)).size!==21) throw new Error('Expected exactly21 original lines');
for(let i=1;i<captions.length;i++)if(captions[i].start_s<captions[i-1].end_s)throw new Error('Overlapping captions');
const out=path.join(root,'full_review');fs.mkdirSync(out,{recursive:true});
const manifest={version:1,date:'2026-09-09',size:'1280x720',fps:24,duration_s:at,scene_count:16,caption_count:21,voice_id:'WS6naCm8T4gbyzsLnOjK',segments,captions};
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
fs.writeFileSync(path.join(out,'caps.srt'),captions.map((c,i)=>`${i+1}\n${stamp(c.start_s)} --> ${stamp(c.end_s)}\n${c.ko}\n`).join('\n'));
console.log(JSON.stringify({duration_s:at,scenes:segments.length,captions:captions.length}));
