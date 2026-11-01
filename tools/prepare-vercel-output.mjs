// Change only a derived Build Output API artifact. Public asset URLs stay unchanged.
import {readdirSync,statSync,readFileSync,writeFileSync,mkdirSync,renameSync,unlinkSync,existsSync} from 'node:fs';
import {resolve,join,relative,dirname,extname,sep} from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {WEB_DERIVED_SIDECAR,validateStagedWebDerivedAssets} from './web-derived-assets.mjs';

export function prepareVercelOutput(directory) {
  const root=resolve(directory),configPath=join(dirname(root),'config.json');
  if(!existsSync(configPath))throw new Error('Missing Build Output API config');
  const config=JSON.parse(readFileSync(configPath,'utf8')),groups=new Map();
  const derived=validateStagedWebDerivedAssets(root),publicDerived=new Set(derived.map(asset=>asset.public_path));
  const sidecar=join(root,WEB_DERIVED_SIDECAR),receipt=join(dirname(root),'web-derived-output.json');
  if(derived.length&&existsSync(receipt)&&readFileSync(receipt,'utf8')!==readFileSync(sidecar,'utf8'))throw new Error('Existing derivative receipt differs');
  function walk(dir) {
    for(const name of readdirSync(dir)) {
      const file=join(dir,name),stat=statSync(file);
      if(stat.isDirectory())walk(file);
      else if(stat.isFile()) {
        const publicPath=relative(root,file).split(sep).join('/').normalize('NFC');
        if(publicDerived.has(publicPath))throw new Error('Original and derivative both staged: '+publicPath);
        if(!/[^\x00-\x7f]/.test(publicPath))continue;
        const hash=createHash('sha256').update(readFileSync(file)).digest('hex');
        if(groups.has(publicPath)&&groups.get(publicPath).hash!==hash)throw new Error('Different bytes at normalized path: '+publicPath);
        const group=groups.get(publicPath)||{hash,files:[]};group.files.push(file);groups.set(publicPath,group);
      }
    }
  }
  walk(root); // Check all collisions before moving any file.
  config.overrides??={};let duplicates=0;
  const moves=[];
  for(const [publicPath,group] of groups){
    const alias='_unicode/'+createHash('sha256').update(publicPath).digest('hex')+extname(publicPath),target=join(root,alias);
    if(!target.startsWith(root+sep)||existsSync(target))throw new Error('Unsafe or existing alias: '+alias);
    moves.push({publicPath,group,alias,target});
  }
  for(const asset of derived){
    for(const [key,value] of Object.entries(config.overrides))if(key!==asset.staged_path&&key!==asset.public_path&&value.path?.normalize('NFC')===asset.public_path)throw new Error('Conflicting derivative URL override: '+asset.public_path);
    for(const key of [asset.public_path,asset.staged_path])if(config.overrides[key]?.path&&config.overrides[key].path.normalize('NFC')!==asset.public_path)throw new Error('Conflicting derivative URL override: '+asset.public_path);
  }
  for(const asset of derived){
    config.overrides[asset.staged_path]={...(config.overrides[asset.public_path]||{}),...(config.overrides[asset.staged_path]||{}),path:asset.public_path,contentType:asset.mime};
    delete config.overrides[asset.public_path];
  }
  for(const {publicPath,group,alias,target} of moves) {
    mkdirSync(dirname(target),{recursive:true});renameSync(group.files[0],target);
    for(const duplicate of group.files.slice(1)){unlinkSync(duplicate);duplicates++;}
    config.overrides[alias]={...(config.overrides[publicPath]||{}),path:publicPath};
    delete config.overrides[publicPath];
  }
  writeFileSync(configPath,JSON.stringify(config,null,2)+'\n');
  if(derived.length){writeFileSync(receipt,readFileSync(sidecar));unlinkSync(sidecar);}
  return {aliases:groups.size,duplicates,derived:derived.length};
}
if(resolve(process.argv[1]||'')===fileURLToPath(import.meta.url))console.log(JSON.stringify(prepareVercelOutput(process.argv[2]||'.vercel/output/static')));
