// No third-party PNG dependency. Supported: non-interlaced 8-bit RGB/RGBA PNG.
// RGB channel MAE is measured on stored 0..255 samples, NOT perceptual Delta E.
import { readFileSync, existsSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

function crc32(bytes) {
  let crc=0xffffffff;
  for (const byte of bytes) { crc^=byte; for(let bit=0;bit<8;bit++) crc=(crc>>>1)^((crc&1)?0xedb88320:0); }
  return (crc^0xffffffff)>>>0;
}
function paeth(a,b,c) {
  const p=a+b-c, x=Math.abs(p-a), y=Math.abs(p-b), z=Math.abs(p-c);
  return x<=y && x<=z ? a : y<=z ? b : c;
}
export function decodePng(buffer) {
  if (!buffer.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex'))) throw new Error('Invalid PNG signature');
  let offset=8, header=null, ended=false; const idat=[];
  while(offset<buffer.length) {
    if(offset+12>buffer.length) throw new Error('Truncated PNG chunk');
    const size=buffer.readUInt32BE(offset), end=offset+12+size;
    if(end>buffer.length) throw new Error('Truncated PNG payload');
    const type=buffer.toString('ascii',offset+4,offset+8), data=buffer.subarray(offset+8,offset+8+size);
    if(crc32(buffer.subarray(offset+4,offset+8+size))!==buffer.readUInt32BE(offset+8+size)) throw new Error(`PNG CRC mismatch: ${type}`);
    if(!header && type!=='IHDR') throw new Error('PNG IHDR must be first');
    if(type==='IHDR') {
      if(header || size!==13) throw new Error('Invalid/duplicate IHDR');
      const width=data.readUInt32BE(), height=data.readUInt32BE(4), depth=data[8], color=data[9];
      if(depth!==8 || ![2,6].includes(color) || data[10]!==0 || data[11]!==0 || data[12]!==0)
        throw new Error('Only non-interlaced 8-bit RGB/RGBA PNG supported; convert capture explicitly');
      if(!width || !height || width*height>64000000) throw new Error('PNG dimensions exceed review limit');
      header={width,height,bpp:color===6?4:3};
    } else if(type==='IDAT') idat.push(data);
    else if(type==='acTL' || type==='tRNS') throw new Error(`Unsupported PNG extension: ${type}`);
    else if(type==='IEND') { if(size!==0 || end!==buffer.length) throw new Error('Invalid PNG end'); ended=true;break; }
    else if(type[0]===type[0].toUpperCase()) throw new Error(`Unsupported critical PNG chunk: ${type}`);
    offset=end;
  }
  if(!ended || !idat.length) throw new Error('Incomplete PNG');
  const {width,height,bpp}=header, stride=width*bpp, expected=(stride+1)*height;
  const inflated=inflateSync(Buffer.concat(idat),{maxOutputLength:expected});
  if(inflated.length!==expected) throw new Error('PNG scanline length mismatch');
  const pixels=Buffer.alloc(stride*height); let input=0;
  for(let y=0;y<height;y++) {
    const filter=inflated[input++]; if(filter>4) throw new Error(`Invalid PNG filter ${filter}`);
    for(let x=0;x<stride;x++) {
      const at=y*stride+x, left=x>=bpp?pixels[at-bpp]:0, up=y?pixels[at-stride]:0, corner=y && x>=bpp?pixels[at-stride-bpp]:0;
      const predictor=filter===0?0:filter===1?left:filter===2?up:filter===3?Math.floor((left+up)/2):paeth(left,up,corner);
      pixels[at]=(inflated[input++]+predictor)&255;
    }
  }
  const rgb=new Uint8Array(width*height*3); let transparentPixels=0;
  for(let p=0;p<width*height;p++) {
    const alpha=bpp===4?pixels[p*bpp+3]/255:1; if(alpha<1) transparentPixels++;
    for(let c=0;c<3;c++) rgb[p*3+c]=Math.round(pixels[p*bpp+c]*alpha);
  }
  return {width,height,rgb,transparentPixels};
}
export function compareImages(images, threshold=15) {
  if(images.length!==4) throw new Error('Exactly four images in a,b,c,d order required');
  const {width,height}=images[0];
  if(!images.every(im=>im.width===width && im.height===height && im.rgb.length===width*height*3)) throw new Error('Image dimensions must match exactly');
  const pairs=[];
  for(let a=0;a<4;a++) for(let b=a+1;b<4;b++) {
    let sum=0;for(let i=0;i<images[a].rgb.length;i++) sum+=Math.abs(images[a].rgb[i]-images[b].rgb[i]);
    const mean=sum/images[a].rgb.length;
    pairs.push({label:`${'abcd'[a]}-${'abcd'[b]}`,mean,passed:mean>=threshold});
  }
  return {width,height,threshold,pairs,passed:pairs.every(pair=>pair.passed)};
}
export function comparePngPaths(paths) {
  if(paths.length!==4 || paths.some(path=>!existsSync(path))) {
    console.log('화면 평균 차: 미측정 — 실제 a,b,c,d PNG 4개 경로가 필요합니다. VISUAL PASS 없음.');
    return {status:'UNMEASURED',exitCode:2};
  }
  const images=paths.map(path=>decodePng(readFileSync(path))), result=compareImages(images);
  console.log(`PNG ${result.width}x${result.height}; full-frame RGB channel MAE 0..255; threshold >=15; alpha over black; no ICC/gamma conversion`);
  if(images.some(im=>im.transparentPixels)) console.log('주의: 투명 픽셀을 검정 배경에 합성했습니다.');
  for(const pair of result.pairs) console.log(`${pair.passed?'PASS':'FAIL'} ${pair.label}: mean=${pair.mean.toFixed(4)} ${pair.passed?'>=':'<'} 15`);
  console.log(result.passed?'PAIR-DIFFERENCE PASS — readability/isolated scene/noise still require visual review':'PAIR-DIFFERENCE FAIL — one or more pairs below 15');
  return {...result,status:result.passed?'PASS':'FAIL',exitCode:result.passed?0:1};
}
