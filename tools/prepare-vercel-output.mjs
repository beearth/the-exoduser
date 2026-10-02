// Change only a derived Build Output API artifact. Public asset URLs stay unchanged.
import {readdirSync,statSync,readFileSync,writeFileSync,mkdirSync,renameSync,unlinkSync,existsSync} from 'node:fs';
import {resolve,join,relative,dirname,extname,sep} from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

export function prepareVercelOutput(directory) {
  const root=resolve(directory),configPath=join(dirname(root),'config.json');
  if(!existsSync(configPath))throw new Error('Missing Build Output API config');
  const config=JSON.parse(readFileSync(configPath,'utf8')),groups=new Map();
  function walk(dir) {
    for(const name of readdirSync(dir)) {
      const file=join(dir,name),stat=statSync(file);
      if(stat.isDirectory())walk(file);
      else if(stat.isFile()) {
        const publicPath=relative(root,file).split(sep).join('/').normalize('NFC');
        if(!/[^\x00-\x7f]/.test(publicPath))continue;
        const hash=createHash('sha256').update(readFileSync(file)).digest('hex');
        if(groups.has(publicPath)&&groups.get(publicPath).hash!==hash)throw new Error('Different bytes at normalized path: '+publicPath);
        const group=groups.get(publicPath)||{hash,files:[]};group.files.push(file);groups.set(publicPath,group);
      }
    }
  }
  walk(root); // Check all collisions before moving any file.
  config.overrides??={};let duplicates=0;
  for(const [publicPath,group] of groups) {
    const alias='_unicode/'+createHash('sha256').update(publicPath).digest('hex')+extname(publicPath);
    const target=join(root,alias);
    if(!target.startsWith(root+sep)||existsSync(target))throw new Error('Unsafe or existing alias: '+alias);
    mkdirSync(dirname(target),{recursive:true});renameSync(group.files[0],target);
    for(const duplicate of group.files.slice(1)){unlinkSync(duplicate);duplicates++;}
    config.overrides[alias]={...(config.overrides[publicPath]||{}),path:publicPath};
    delete config.overrides[publicPath];
  }
  writeFileSync(configPath,JSON.stringify(config,null,2)+'\n');
  return {aliases:groups.size,duplicates};
}
if(resolve(process.argv[1]||'')===fileURLToPath(import.meta.url))console.log(JSON.stringify(prepareVercelOutput(process.argv[2]||'.vercel/output/static')));
