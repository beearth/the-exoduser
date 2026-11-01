import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,mkdtempSync,rmSync,statSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';

// Usage: node repro-web-derived-exact.mjs source.png output.webp SHARP_MODULE ENCODER LIBVIPS
const [source,target,sharpModule,encoder,libvips]=process.argv.slice(2);
if(!source||!target||!sharpModule||!encoder||!libvips)throw new Error('source.png output.webp SHARP_MODULE ENCODER LIBVIPS required');
const require=createRequire(import.meta.url),sharp=require(sharpModule);
const input=await sharp(source).metadata();
if(input.width>16383||input.height>16383)throw new Error('WebP dimension limit');
const raw=await sharp(source).ensureAlpha().raw().toBuffer();
const scratch=mkdtempSync(join(tmpdir(),'exo-exact-webp-'));
try{
 const rawFile=join(scratch,'source.rgba');writeFileSync(rawFile,raw);
 execFileSync(encoder,[libvips,rawFile,String(input.width),String(input.height),target],{stdio:'pipe'});
 const output=await sharp(target).metadata(),decoded=await sharp(target).ensureAlpha().raw().toBuffer();
 const equal=raw.equals(decoded)&&input.width===output.width&&input.height===output.height&&input.space===output.space&&Buffer.from(input.icc||[]).equals(Buffer.from(output.icc||[]));
 if(!equal)throw new Error('full RGBA, size, color space, or ICC mismatch');
 const bytes=readFileSync(target);
 console.log(JSON.stringify({source,target,sourceBytes:statSync(source).size,outputBytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),width:input.width,height:input.height,fullRGBAExact:true,iccBytes:input.icc?.length||0,colorSpace:input.space}));
}finally{rmSync(scratch,{recursive:true,force:true})}
