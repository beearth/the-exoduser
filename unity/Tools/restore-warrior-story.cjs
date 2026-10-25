// Reconstruct the byte-exact warrior story runtime from the Git-backed small media parts.
// Tools belongs on I:; only the assembled active movie belongs on the SSD.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const i=process.argv.indexOf('--project'),project=path.resolve(i<0?path.join(__dirname,'..'):process.argv[i+1]);
const input=project+'/Tools/MediaRecovery/warrior-story-v23',manifest=JSON.parse(fs.readFileSync(input+'/manifest.json','utf8'));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const parts=manifest.parts.map(row=>{const b=fs.readFileSync(input+'/'+row.path);if(b.length!==row.bytes||hash(b)!==row.sha256)throw Error('Media part differs '+row.path);return b;});
const bytes=Buffer.concat(parts);if(bytes.length!==manifest.bytes||hash(bytes)!==manifest.sha256)throw Error('Assembled movie differs');
const dest=path.join(project,manifest.destination);fs.mkdirSync(path.dirname(dest),{recursive:true});
if(!fs.existsSync(dest)||hash(fs.readFileSync(dest))!==manifest.sha256)fs.writeFileSync(dest,bytes);
if(hash(fs.readFileSync(dest))!==manifest.sha256)throw Error('Runtime write differs');
console.log(JSON.stringify({scope:'Byte-exact Git media recovery; no transcoding',destination:dest,bytes:bytes.length,sha256:manifest.sha256,parts:parts.length,passed:true}));
