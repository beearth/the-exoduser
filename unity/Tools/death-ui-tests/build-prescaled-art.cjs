// Mechanical derivatives of existing project art. No generated texture/noise or new drawing.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),art=path.join(root,'Assets/Exoduser/Resources/Art'),dir=path.join(art,'ui/silver_hell');
const sharp=require(require.resolve('sharp',{paths:[root,path.resolve(root,'../node_modules'),'G:/exoduser']}));
async function save(name,buffer){const file=path.join(dir,name+'.png');fs.writeFileSync(file,buffer);if(!fs.existsSync(file+'.meta')){let meta=fs.readFileSync(path.join(dir,'btn_plaque_20261029.png.meta'),'utf8');meta=meta.replace(/^guid: .*$/m,'guid: '+crypto.randomBytes(16).toString('hex')).replace(/enableMipMap: 1/g,'enableMipMap: 0').replace(/filterMode: 2/g,'filterMode: 1');fs.writeFileSync(file+'.meta',meta);}}
(async()=>{
 const face=await sharp(path.join(dir,'btn_plaque_20261029.png')).extract({left:200,top:65,width:624,height:75}).resize(1092,170,{kernel:'lanczos3',fit:'fill'}).png().toBuffer();
 const chip=await sharp(path.join(art,'ui/inventory/plate.png')).composite([{input:face,left:54,top:43}]).png().toBuffer();
 for(const density of [1,2]){
  await save('btn_chip_'+density+'x',await sharp(chip).resize(150*density,32*density,{kernel:'lanczos3',fit:'fill'}).png().toBuffer());
  for(const [output,input]of [['ready','lobby_enter_btn_silver_20261029'],['disabled','lobby_enter_disabled']])await save('lobby_enter_'+output+'_'+density+'x',await sharp(path.join(dir,input+'.png')).resize(416*density,156*density,{kernel:'lanczos3',fit:'fill'}).png().toBuffer());
 }
 for(const [kind,input]of [['normal','btn_plaque_20261029'],['primary','btn_primary_composed']]){
  const source=path.join(dir,input+'.png'),size=await sharp(source).metadata();
  for(const height of [24,32,48,64,96])for(const density of [1,2])await save('btn_thorn_'+kind+'_'+height+'_'+density+'x',await sharp(source).resize(Math.round(size.width*height*density/size.height),height*density,{kernel:'lanczos3',fit:'fill'}).png().toBuffer());
 }
 console.log('Six existing chip/ENTER derivatives and twenty complete thorn 1x/2x Lanczos3 derivatives written; original PNGs unchanged.');
})().catch(e=>{console.error(e);process.exitCode=1;});
