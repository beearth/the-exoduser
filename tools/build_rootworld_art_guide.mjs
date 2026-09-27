import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
const root=path.resolve(import.meta.dirname,'..');
const source=fs.readFileSync(path.join(root,'game.html'),'utf8');
function extract(name){const start=source.indexOf(`function ${name}(`);if(start<0)throw Error(name);let depth=0;for(let i=source.indexOf('{',start);i<source.length;i++){if(source[i]==='{')depth++;if(source[i]==='}'&&!--depth)return source.slice(start,i+1);}throw Error(name);}
const layout=Function(`${extract('_rleEncodeGrid')};return ${extract('_buildDiabloField')}`)()(0,200,200);
const cells=[];for(let i=0;i<layout.tileRLE.length;i+=2)for(let n=0;n<layout.tileRLE[i+1];n++)cells.push(layout.tileRLE[i]);
for(let y=2;y<=35;y++)for(let x=88;x<=112;x++)cells[y*200+x]=1;
let floor='';for(let y=0;y<200;y++)for(let x=0;x<200;x++)if(cells[y*200+x]){const begin=x;while(x+1<200&&cells[y*200+x+1])x++;floor+=`M${begin},${y}h${x-begin+1}v1h-${x-begin+1}Z`;}
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="2048" viewBox="0 0 200 200"><defs><clipPath id="floor"><path d="${floor}"/></clipPath></defs><rect width="200" height="200" fill="#171d18"/><path d="${floor}" fill="#887961"/><ellipse cx="150" cy="113" rx="25" ry="30" fill="#666b3d" clip-path="url(#floor)"/></svg>`;
const out=path.join(root,'output/imagegen/rootworld_master_20260924');fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'geometry-guide.svg'),svg);
await sharp(Buffer.from(svg)).png().toFile(path.join(out,'geometry-guide.png'));
console.log(out);
