// Exact material GUID intake. Never guesses a texture from the module's filename.
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const sharp=require(require.resolve('sharp',{paths:[process.cwd(),'G:/exoduser']}));
const root=path.resolve(__dirname,'..');
const source='I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3/delivery/Assets/Exoduser/Art/Environment/CH1_1_WoodbridgeR3';
const dest=path.join(root,'assets/web3d/textures');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
  sharp.concurrency(2);await fs.mkdir(dest,{recursive:true});
  const guidPaths=new Map(),textures=path.join(source,'Textures');
  for(const name of await fs.readdir(textures))if(name.endsWith('.png.meta')){
    const text=await fs.readFile(path.join(textures,name),'utf8');
    const guid=/^guid: (\w+)/m.exec(text)?.[1];if(guid)guidPaths.set(guid,path.join(textures,name.slice(0,-5)));
  }
  const scene=JSON.parse(await fs.readFile(path.join(root,'assets/web3d/scene.json'),'utf8')),receipt=[];
  for(const id of scene.modules){
    const material=await fs.readFile(path.join(source,'Materials',id+'.mat'),'utf8');
    const find=slot=>{
      const guid=new RegExp('- '+slot+':\\s*\\n\\s*m_Texture: \\{fileID: 2800000, guid: (\\w+)').exec(material)?.[1];
      const file=guidPaths.get(guid);if(!file)throw Error(id+' unresolved '+slot+' '+guid);return file;
    };
    const files={base:find('_BaseMap'),normal:find('_BumpMap'),ao:find('_OcclusionMap'),metal:find('_MetallicGlossMap')};
    const bytes=Object.fromEntries(await Promise.all(Object.entries(files).map(async([k,p])=>[k,await fs.readFile(p)])));
    const resolution=/Ancient_Tree/.test(id)?2048:1024;
    await sharp(bytes.base).resize({width:resolution,height:resolution,fit:'inside'}).webp({quality:94,alphaQuality:100}).toFile(path.join(dest,id+'_BaseColor.webp'));
    await sharp(bytes.normal).resize({width:1024,height:1024,fit:'inside'}).webp({lossless:true}).toFile(path.join(dest,id+'_Normal.webp'));
    const metal=await sharp(bytes.metal).resize(1024,1024).ensureAlpha().raw().toBuffer();
    const ao=await sharp(bytes.ao).resize(1024,1024).removeAlpha().greyscale().raw().toBuffer();
    const orm=Buffer.alloc(1024*1024*3);
    for(let i=0;i<ao.length;i++){orm[i*3]=ao[i];orm[i*3+1]=255-metal[i*4+3];orm[i*3+2]=metal[i*4];}
    await sharp(orm,{raw:{width:1024,height:1024,channels:3}}).webp({lossless:true}).toFile(path.join(dest,id+'_ORM.webp'));
    receipt.push({id,resolution,files:Object.fromEntries(Object.entries(files).map(([k,file])=>[k,{file,sha256:sha(bytes[k])}]))});
  }
  await fs.writeFile(path.join(root,'assets/web3d/texture-intake.json'),JSON.stringify({source,orm:'R=AO,G=1-Smoothness,B=Metallic',receipt},null,2));
  console.log('Material GUID closure: '+receipt.length+' materials / '+receipt.length*3+' runtime maps');
})().catch(e=>{console.error(e);process.exitCode=1;});
