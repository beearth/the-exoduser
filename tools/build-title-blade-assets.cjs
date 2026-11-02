/* Adopt only the edited hub/blade corridor; all other source pixels are preserved. */
const fs=require('node:fs/promises'),sharp=require('sharp');
const out='I:/EXODUSER-Storage/codex-takeover/title-final-three-20261102';
async function main(){
 const edit=process.argv[2];if(!edit)throw Error('Edited character crop path required');
 const source='I:/EXODUSER-Storage/codex-takeover/title-moon-20261102/C2-close-moon-lowered-3840x1920.png';
 const box={left:2420,top:480,width:930,height:1040};
 const svg=Buffer.from(`<svg width="930" height="1040" xmlns="http://www.w3.org/2000/svg"><g fill="white" stroke="white" stroke-width="10" stroke-linejoin="round">
 <ellipse cx="267" cy="191" rx="28" ry="30"/>
 <path d="M252 205 L284 205 L321 340 L289 351 Z"/>
 <path d="M287 315 L320 316 L449 752 L410 726 Z"/>
 <path d="M255 251 L296 251 L626 1012 L582 1018 Z"/>
 </g></svg>`);
 const mask=await sharp(svg).blur(2).greyscale().raw().toBuffer();
 const base=await sharp(source).removeAlpha().raw().toBuffer();
 const edited=await sharp(edit).resize(930,1040,{fit:'fill',kernel:'lanczos3'}).removeAlpha().raw().toBuffer();
 const result=Buffer.from(base);let changed=0,outsideChanges=0;
 for(let y=0;y<1040;y++)for(let x=0;x<930;x++){
  const p=y*930+x,a=mask[p]/255,q=((y+480)*3840+x+2420)*3;
  if(a){changed++;for(let c=0;c<3;c++)result[q+c]=Math.round(base[q+c]*(1-a)+edited[p*3+c]*a);}
 }
 for(let y=0;y<1920;y++)for(let x=0;x<3840;x++){
  const a=x>=2420&&x<3350&&y>=480&&y<1520?mask[(y-480)*930+x-2420]:0;
  const p=(y*3840+x)*3;
  if(!a&&(result[p]!==base[p]||result[p+1]!==base[p+1]||result[p+2]!==base[p+2]))outsideChanges++;
 }
 await fs.mkdir(out,{recursive:true});
 await sharp(result,{raw:{width:3840,height:1920,channels:3}}).png().toFile(out+'/C2-close-backblade-moon-3840x1920.png');
 await sharp(mask,{raw:{width:930,height:1040,channels:1}}).png().toFile(out+'/blade-adoption-mask.png');
 await sharp(result,{raw:{width:3840,height:1920,channels:3}}).extract(box).png().toFile(out+'/blade-adopted-1x.png');
 await fs.writeFile(out+'/blade-edit-receipt.json',JSON.stringify({source,edit,crop:box,changedMaskPixels:changed,outsideChanges,method:'Built-in image editing; adopt only hub/blade/removal corridor, exact original bytes elsewhere',equipment:'Upper-back rotary hub; clean black/silver blade behind body down to right mid-calf; empty hands'},null,2));
 if(outsideChanges)throw Error('Pixels outside sword corridor changed');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
