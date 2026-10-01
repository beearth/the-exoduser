import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const prefix='tools/team-followup-20261001/BUILD/mac-character-media-',startedAt=new Date().toISOString();
const source=fs.readFileSync('index.html','utf8'),config=JSON.parse(fs.readFileSync('outputs/team-review-20261002/mac-app/execute-config.json'));
const sha=data=>createHash('sha256').update(data).digest('hex');
const mediaSource=source+'\n'+fs.readFileSync('character-story-player.js','utf8');
const videos=[...new Set([...mediaSource.matchAll(/['"]([^'"\r\n]+\.mp4)(?:\?[^'"\r\n]*)?['"]/g)].map(match=>match[1]))].filter(value=>value.includes('bg_scene1_loop')||value.includes('idle_warrior_cs3')||/story|world|warrior/i.test(value));
const appRoots=fs.readdirSync('outputs/mac-package-ready').filter(name=>/59376|abf57/.test(name)).map(name=>{const packageRoot=path.join('outputs/mac-package-ready',name,'package');const app=fs.readdirSync(packageRoot).find(value=>value.endsWith('.app'));return path.join(packageRoot,app,'Contents/Resources/app.nw');});
function inspect(value){
  if(!fs.existsSync(value))return {path:value,exists:false};const descriptor=fs.openSync(value,'r');try{const stat=fs.fstatSync(descriptor),hash=createHash('sha256'),buffer=Buffer.alloc(1024*1024);let count;while((count=fs.readSync(descriptor,buffer,0,buffer.length,null))>0)hash.update(buffer.subarray(0,count));
    const boxes=[],samples=[];let offset=0;while(offset+8<=stat.size){const header=Buffer.alloc(16);fs.readSync(descriptor,header,0,16,offset);let size=header.readUInt32BE(0),headerBytes=8;const type=header.toString('ascii',4,8);if(size===1){size=Number(header.readBigUInt64BE(8));headerBytes=16;}if(size===0)size=stat.size-offset;if(size<headerBytes||offset+size>stat.size){boxes.push({offset,type,size,invalid:true});break;}boxes.push({offset,type,size});if(type==='moov'&&size<16*1024*1024){const data=Buffer.alloc(size);fs.readSync(descriptor,data,0,size,offset);for(let position=4;position<data.length-100;position++){const codec=data.toString('ascii',position,position+4);if(!['avc1','avc3','hvc1','hev1','vp09','av01','mp4a'].includes(codec))continue;const entrySize=data.readUInt32BE(position-4);if(entrySize<36||position-4+entrySize>data.length)continue;const entry={codec,entrySize};if(codec!=='mp4a'){entry.width=data.readUInt16BE(position+28);entry.height=data.readUInt16BE(position+30);}const entryData=data.subarray(position-4,position-4+entrySize);const avc=entryData.indexOf(Buffer.from('avcC'));if(avc>=0&&avc+8<entryData.length){entry.avcProfile=entryData[avc+5];entry.avcCompatibility=entryData[avc+6];entry.avcLevel=entryData[avc+7];}samples.push(entry);}}
      offset+=size;
    }const after=fs.fstatSync(descriptor);return {path:value,exists:true,bytes:stat.size,sha256:hash.digest('hex'),stable:after.size===stat.size&&after.mtimeMs===stat.mtimeMs,boxes,samples,limit:'MP4 box/sample-entry 헤더만; decode/브라우저 지원 인수 아님'};
  }finally{fs.closeSync(descriptor);}
}
const files=videos.map(relative=>{const original=inspect(relative),packaged=appRoots.map(root=>inspect(path.join(root,relative)));return {relative,manifest:config.inputs.find(entry=>entry.path===relative)??null,original,packaged,allSame:packaged.every(entry=>entry.sha256===original.sha256&&entry.bytes===original.bytes)};});
const textHashes=['index.html','node-main.js','character-story-player.js',...appRoots.flatMap(root=>['index.html','node-main.js','character-story-player.js'].map(value=>path.join(root,value)))].map(value=>({path:value,sha256:sha(fs.readFileSync(value))}));
const result={startedAt,completedAt:new Date().toISOString(),videos,files,textHashes,tools:'command -v ffprobe/mediainfo/ffmpeg 없음; 설치/다운로드0; 소형 자체 MP4 header 검사',limits:'실제 media.error/canPlayType/AX 추가관측 UNKNOWN; UI/재시작/디코드0'};
fs.writeFileSync(prefix+'evidence.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
