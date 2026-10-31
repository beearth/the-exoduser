// 공식 CC0 이끼의 알파·색·노멀·거칠기만 받는다. 비용/인증 없음.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root='I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2/pbr-source/moss_01';
(async()=>{
 fs.mkdirSync(root,{recursive:true});const response=await fetch('https://api.polyhaven.com/files/moss_01');if(!response.ok)throw Error('공식 명세 HTTP '+response.status);const manifest=await response.json();fs.writeFileSync(root+'/files.json',JSON.stringify(manifest,null,2));console.log('제공 맵',Object.keys(manifest));
 const result=[];
 for(const [kind,ext] of [['Diffuse','jpg'],['Alpha','png'],['nor_gl','png'],['Rough','jpg']]){
  const item=manifest[kind]?.['2k']?.[ext];if(!item)throw Error('공식 맵 없음 '+kind);const p=path.join(root,kind+'.'+ext);if(new URL(item.url).hostname!=='dl.polyhaven.org')throw Error('공식 도메인 아님');if(!fs.existsSync(p)){const res=await fetch(item.url);if(!res.ok)throw Error('다운로드 HTTP '+res.status);fs.writeFileSync(p,Buffer.from(await res.arrayBuffer()));}const bytes=fs.readFileSync(p);if(crypto.createHash('md5').update(bytes).digest('hex')!==item.md5||bytes.length!==item.size)throw Error('공식 무결성 불일치 '+kind);result.push({종류:kind,경로:p,url:item.url,공식MD5일치:true,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),크기:bytes.length});
 }
 fs.writeFileSync(root+'/출처-다운로드.json',JSON.stringify({시각:new Date().toISOString(),원본:'https://polyhaven.com/a/moss_01',라이선스:'https://polyhaven.com/license - CC0',제작자:'Rob Tuytel',비용:0,파일:result},null,2));console.log('공식 CC0 이끼 맵2K·MD5/SHA 대조',result.length);
})().catch(e=>{console.error(e);process.exitCode=1});
