import fs from 'node:fs';
const base='C:/Users/심도진/Desktop/';
for(const name of ['imgres.htm','imgres (1).htm','imgres (2).htm','imgres (3).htm']){
 const data=fs.readFileSync(base+name);const s=data.toString('utf8');
 const urls=[...new Set([...s.matchAll(/(?:src|href|content)=["']([^"']+)["']/gi)].map(m=>m[1]).filter(u=>/https?:|_files\//.test(u)))];
 console.log(JSON.stringify({name,bytes:data.length,title:s.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1],begin:s.slice(0,350),imageTags:[...s.matchAll(/<img\b[^>]*>/gi)].slice(0,8).map(m=>m[0].slice(0,900)),urls:urls.slice(0,25)},null,2));
}
