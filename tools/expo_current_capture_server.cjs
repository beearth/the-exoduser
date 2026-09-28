// Isolated local capture origin: current project files, disposable progress, no production writes.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const OUT=path.join(ROOT,'output','indie-live-expo-20261201','current-20260928');
fs.mkdirSync(OUT,{recursive:true});
const MIME={'.html':'text/html;charset=utf-8','.js':'text/javascript;charset=utf-8','.css':'text/css;charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.mp4':'video/mp4','.mp3':'audio/mpeg','.wav':'audio/wav','.ogg':'audio/ogg','.ttf':'font/ttf','.woff2':'font/woff2'};
http.createServer((req,res)=>{
  const u=new URL(req.url,'http://127.0.0.1:3338');
  if(u.pathname==='/__recording'&&req.method==='POST'){
    const name=u.searchParams.get('name')||'';
    if(!/^[a-z0-9_-]+\.(webm|json)$/.test(name)){res.writeHead(400).end();return;}
    const chunks=[];let length=0;
    req.on('data',c=>{length+=c.length;if(length>200*1024*1024){req.destroy();return;}chunks.push(c)});
    req.on('end',()=>{try{
      const b=Buffer.concat(chunks);
      if(name.endsWith('.webm')&&b.subarray(0,4).toString('hex')!=='1a45dfa3')throw Error('WebM required');
      if(name.endsWith('.json'))JSON.parse(b.toString('utf8'));
      fs.writeFileSync(path.join(OUT,name),b);
      res.writeHead(200,{'Content-Type':'application/json'}).end(JSON.stringify({ok:true,name,bytes:b.length}));
    }catch{res.writeHead(400).end();}});return;
  }
  if(u.pathname==='/__capture'&&req.method==='POST'){
    const name=u.searchParams.get('name')||'';
    if(!/^[a-z0-9_-]+\.jpg$/.test(name)){res.writeHead(400).end();return;}
    const chunks=[];let length=0;
    req.on('data',c=>{length+=c.length;if(length>30*1024*1024){req.destroy();return;}chunks.push(c)});
    req.on('end',()=>{try{const b=Buffer.from(Buffer.concat(chunks).toString('utf8'),'base64');if(b[0]!==255||b[1]!==216)throw Error('JPEG required');fs.writeFileSync(path.join(OUT,name),b);res.writeHead(200,{'Content-Type':'application/json'}).end(JSON.stringify({ok:true,name,bytes:b.length}));}catch{res.writeHead(400).end();}});return;
  }
  if(u.pathname.startsWith('/api/')){
    const body=u.pathname==='/api/slots'?{ok:true,slots:[]}:u.pathname==='/api/mats'?{ok:true,mats:0}:{ok:true,data:null};
    res.writeHead(200,{'Content-Type':'application/json'}).end(JSON.stringify(body));return;
  }
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405).end();return;}
  let pathname;try{pathname=decodeURIComponent(u.pathname)}catch{res.writeHead(400).end();return;}
  const file=path.resolve(ROOT,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(ROOT+path.sep)||file.includes(path.sep+'private-business'+path.sep)||file.includes(path.sep+'.git'+path.sep)){res.writeHead(403).end();return;}
  fs.stat(file,(err,st)=>{if(err||!st.isFile()){res.writeHead(404).end();return;}
    const headers={'Content-Type':MIME[path.extname(file).toLowerCase()]||'application/octet-stream','Cache-Control':'no-store','Accept-Ranges':'bytes'};
    let start=0,end=st.size-1,code=200;const range=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range||'');
    if(range){start=Number(range[1]);if(range[2])end=Math.min(Number(range[2]),end);if(start>end){res.writeHead(416).end();return;}code=206;headers['Content-Range']=`bytes ${start}-${end}/${st.size}`;}
    headers['Content-Length']=end-start+1;res.writeHead(code,headers);
    if(req.method==='HEAD'){res.end();return;}fs.createReadStream(file,{start,end}).pipe(res);
  });
}).listen(3338,'127.0.0.1',()=>console.log('EXPO capture origin http://127.0.0.1:3338 — current files, API writes discarded'));
