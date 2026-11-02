'use strict';
// Explicit one-shot private candidate transfer. No directory browsing, writes or process launching.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),crypto=require('node:crypto');
if(process.argv.length!==3||!path.isAbsolute(process.argv[2]))throw Error('Explicit absolute config required');
const cfg=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
if(cfg.bind!=='192.168.0.233'||cfg.peer!=='192.168.0.146'||cfg.port!==3334||cfg.candidateOnly!==true)throw Error('Reviewed private endpoint contract differs');
const routes=['/package.zip','/manifest.json','/pack-receipt.json','/win-delivery.py','/candidate-packet.json'];
if(Object.keys(cfg.files).sort().join('|')!==routes.sort().join('|'))throw Error('Exactly five explicit routes required');
const entries=new Map(),sockets=new Set();
const identity=s=>[s.dev,s.ino,s.size,s.mtimeMs,s.ctimeMs].join(':');
for(const [route,row]of Object.entries(cfg.files)){
 if(!path.isAbsolute(row.path)||!/^([a-f0-9]{64})$/.test(row.sha256)||(!Number.isSafeInteger(row.bytes)||row.bytes<=0))throw Error('Invalid file attestation');
 const fd=fs.openSync(row.path,fs.constants.O_RDONLY|fs.constants.O_NOFOLLOW),stat=fs.fstatSync(fd);if(!stat.isFile()||stat.size!==row.bytes)throw Error('File identity/size differs');
 const h=crypto.createHash('sha256'),buf=Buffer.alloc(1024*1024);let offset=0,n;while((n=fs.readSync(fd,buf,0,buf.length,offset))>0){h.update(buf.subarray(0,n));offset+=n;}
 if(h.digest('hex')!==row.sha256||identity(fs.fstatSync(fd))!==identity(stat))throw Error('File bytes changed before listen');
 entries.set(route,{...row,fd,identity:identity(stat)});
}
const logFd=fs.openSync(cfg.log,fs.constants.O_WRONLY|fs.constants.O_CREAT|fs.constants.O_EXCL,0o600);
function log(x){fs.writeSync(logFd,JSON.stringify({utc:new Date().toISOString(),...x})+'\n');fs.fsyncSync(logFd);}
function intact(e){try{const s=fs.lstatSync(e.path);return !s.isSymbolicLink()&&identity(s)===e.identity&&identity(fs.fstatSync(e.fd))===e.identity;}catch{return false;}}
const server=http.createServer((req,res)=>{
 const peer=req.socket.remoteAddress;
 if(peer!==cfg.peer&&peer!=='::ffff:'+cfg.peer){res.writeHead(403);res.end();return;}
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return;}
 const e=entries.get(req.url);if(!e){res.writeHead(404);res.end();return;}
 if(!intact(e)){log({event:'FILE_DRIFT_BLOCKED',route:req.url});res.writeHead(409);res.end();return;}
 let start=0,end=e.bytes-1,status=200;
 if(req.headers.range){
  const m=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);let ok=!!m&&(m[1]||m[2]);
  if(ok){if(!m[1])start=Math.max(0,e.bytes-Number(m[2]));else{start=Number(m[1]);if(m[2])end=Number(m[2]);}ok=Number.isSafeInteger(start)&&Number.isSafeInteger(end)&&start>=0&&end>=start&&start<e.bytes&&end<e.bytes;}
  if(!ok){res.writeHead(416,{'Content-Range':'bytes */'+e.bytes});res.end();return;}status=206;
 }
 const headers={'Content-Type':'application/octet-stream','Content-Length':end-start+1,'Accept-Ranges':'bytes','ETag':'"'+e.sha256+'"','Cache-Control':'no-store','X-Exoduser-Candidate-Only':'true','Content-Disposition':'attachment; filename="'+path.basename(req.url)+'"'};
 if(status===206)headers['Content-Range']=`bytes ${start}-${end}/${e.bytes}`;
 res.writeHead(status,headers);if(req.method==='HEAD'){res.end();return;}
 const stream=fs.createReadStream(null,{fd:e.fd,autoClose:false,start,end});let sent=0;stream.on('data',b=>sent+=b.length);stream.on('error',err=>{log({event:'STREAM_ERROR',route:req.url,message:err.message});res.destroy();});
 res.on('close',()=>stream.destroy());res.on('finish',()=>log({event:'GET_FINISHED',route:req.url,start,end,sent,identityUnchangedAfter:intact(e)}));stream.pipe(res);
});
server.on('connection',s=>{sockets.add(s);s.on('close',()=>sockets.delete(s));});
let closing=false;function close(reason){if(closing)return;closing=true;log({event:'STOPPING',reason});for(const s of sockets)s.destroy();server.close(()=>{for(const e of entries.values())fs.closeSync(e.fd);fs.closeSync(logFd);process.exit(0);});}
process.on('SIGTERM',()=>close('owner-SIGTERM'));process.on('SIGINT',()=>close('owner-SIGINT'));
server.on('error',e=>{log({event:'LISTEN_ERROR',message:e.message});process.exitCode=1;for(const e of entries.values())fs.closeSync(e.fd);fs.closeSync(logFd);});
server.listen(cfg.port,cfg.bind,()=>{log({event:'LISTENING',bind:cfg.bind,peer:cfg.peer,port:cfg.port,routes,candidateOnly:true});process.stdout.write(JSON.stringify({bind:cfg.bind,peer:cfg.peer,port:cfg.port,candidateOnly:true,routes})+'\n');});
setTimeout(()=>close('one-shot-20minute-expiry'),20*60*1000).unref();
