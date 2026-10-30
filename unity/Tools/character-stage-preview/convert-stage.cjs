// 기존 보관 GLB를 읽기만 하며 Unity 검토 전용 기하로 변환한다. Blender·유료 호출 없음.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const identity=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
const unit=p=>{const l=Math.hypot(...p);if(!Number.isFinite(l)||l<1e-12)throw Error('잘못된 법선');return p.map(x=>x/l);};
function toUnity(p,m=identity){return [m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],-(m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14])];}
function normalToUnity(p,m=identity){
 const a=m[0],b=m[4],c=m[8],d=m[1],e=m[5],f=m[9],g=m[2],h=m[6],i=m[10];
 const det=a*(e*i-f*h)-b*(d*i-f*g)+c*(d*h-e*g);if(Math.abs(det)<1e-12)throw Error('특이 변환');
 return unit([((e*i-f*h)*p[0]+(f*g-d*i)*p[1]+(d*h-e*g)*p[2])/det,((c*h-b*i)*p[0]+(a*i-c*g)*p[1]+(b*g-a*h)*p[2])/det,-((b*f-c*e)*p[0]+(c*d-a*f)*p[1]+(a*e-b*d)*p[2])/det]);
}
function doorPoint(p,x,degrees){const a=degrees*Math.PI/180,c=Math.cos(a),s=Math.sin(a),dx=p[0]-x,dz=p[2]-4.63;return [x+c*dx-s*dz,p[1],4.63+s*dx+c*dz];}
function doorNormal(n,degrees){const a=degrees*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return [c*n[0]-s*n[2],n[1],s*n[0]+c*n[2]];}
function multiply(a,b){const m=[];for(let c=0;c<4;c++)for(let r=0;r<4;r++)m[c*4+r]=[0,1,2,3].reduce((s,k)=>s+a[k*4+r]*b[c*4+k],0);return m;}
function matrix(n){if(n.matrix)return n.matrix;const [x,y,z,w]=n.rotation||[0,0,0,1],[sx,sy,sz]=n.scale||[1,1,1],t=n.translation||[0,0,0];return [(1-2*(y*y+z*z))*sx,2*(x*y+z*w)*sx,2*(x*z-y*w)*sx,0,2*(x*y-z*w)*sy,(1-2*(x*x+z*z))*sy,2*(y*z+x*w)*sy,0,2*(x*z+y*w)*sz,2*(y*z-x*w)*sz,(1-2*(x*x+y*y))*sz,0,...t,1];}
function parse(bytes){if(bytes.readUInt32LE(0)!==0x46546c67||bytes.readUInt32LE(4)!==2||bytes.readUInt32LE(8)!==bytes.length)throw Error('GLB 헤더 오류');const jl=bytes.readUInt32LE(12);const g=JSON.parse(bytes.subarray(20,20+jl));const start=20+jl; if(bytes.readUInt32LE(start+4)!==0x004e4942)throw Error('GLB BIN 없음');return {g,bin:bytes.subarray(start+8,start+8+bytes.readUInt32LE(start))};}
function accessor(g,bin,index){const a=g.accessors[index],v=g.bufferViews[a.bufferView],dims={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type],size={5121:1,5123:2,5125:4,5126:4}[a.componentType];if(!dims||!size||a.sparse||a.normalized)throw Error('지원하지 않는 accessor '+index);const rows=[];for(let n=0;n<a.count;n++){const row=[];for(let k=0;k<dims;k++){const at=(v.byteOffset||0)+(a.byteOffset||0)+n*(v.byteStride||dims*size)+k*size;row.push(a.componentType===5126?bin.readFloatLE(at):a.componentType===5125?bin.readUInt32LE(at):a.componentType===5123?bin.readUInt16LE(at):bin.readUInt8(at));}rows.push(row);}return rows;}
function convert(input,out){
 const source=fs.readFileSync(input),{g,bin}=parse(source);if(g.skins?.length||g.animations?.length||g.cameras?.length)throw Error('기하 전용 입력에 영웅/애니/카메라 혼입');
 fs.mkdirSync(out,{recursive:true});const groups=new Map(),nodes=[];let triangles=0;
 function add(n,m){if(n.mesh===undefined)return;for(const primitive of g.meshes[n.mesh].primitives){if((primitive.mode??4)!==4)throw Error('삼각형 이외 기하');const positions=accessor(g,bin,primitive.attributes.POSITION),normals=accessor(g,bin,primitive.attributes.NORMAL),uvs=accessor(g,bin,primitive.attributes.TEXCOORD_0);let idx=accessor(g,bin,primitive.indices).flat();if(idx.some(i=>i>=positions.length))throw Error('인덱스 범위');
 const base=positions.map((p,i)=>({p:toUnity(p,m),n:normalToUnity(normals[i],m),uv:uvs[i]}));const center=toUnity([0,0,0],m);const beam=n.name.startsWith('문_가로보');
 for(const side of beam?[-1,1]:[0]){let mat=primitive.material??0;if(n.name==='후면_닫힌_질량')mat=1;let group=groups.get(mat);if(!group)groups.set(mat,group={material:mat,vertices:[],indices:[]});const offset=group.vertices.length;
 for(const v of base){let p=[...v.p],normal=[...v.n];
 if(n.name==='후면_닫힌_질량')p[2]+=6.9;
 if(n.name.startsWith('일곱고리_문장')){p[0]-=1.55;p[1]-=.15;p[2]+=6.5;}
 const door=n.name==='문_왼쪽'||n.name==='문_오른쪽'||n.name.startsWith('문_수직단조')||n.name.startsWith('대문_단조_리벳');
 if(beam){p[0]=p[0]*.5+side*1.47;normal=unit([normal[0]*2,normal[1],normal[2]]);}
 if(door||beam){const left=beam?side<0:center[0]<=0,angle=left?72:-58;p=doorPoint(p,left?-2.92:2.92,angle);normal=doorNormal(normal,angle);}
 if(![...p,...normal,...v.uv].every(Number.isFinite))throw Error('유한 기하 아님');group.vertices.push([...p,...normal,...v.uv]);}
 for(let i=0;i<idx.length;i+=3)group.indices.push(offset+idx[i],offset+idx[i+2],offset+idx[i+1]);triangles+=idx.length/3;}
 }nodes.push(n.name);}
 function walk(i,parent){const n=g.nodes[i],m=multiply(parent,matrix(n));add(n,m);for(const c of n.children||[])walk(c,m);}
 for(const i of g.scenes[g.scene||0].nodes)walk(i,identity);
 const all=[...groups.values()],chunks=[];const head=Buffer.alloc(8);head.write('CSP1');head.writeInt32LE(all.length,4);chunks.push(head);
 for(const group of all){const b=Buffer.alloc(12+group.vertices.length*32+group.indices.length*4);b.writeInt32LE(group.material,0);b.writeInt32LE(group.vertices.length,4);b.writeInt32LE(group.indices.length,8);let at=12;for(const v of group.vertices)for(const x of v){b.writeFloatLE(x,at);at+=4;}for(const x of group.indices){b.writeInt32LE(x,at);at+=4;}chunks.push(b);}
 fs.writeFileSync(path.join(out,'stage_geometry.bytes'),Buffer.concat(chunks));
 const images=g.images.map((im,i)=>{const v=g.bufferViews[im.bufferView],data=bin.subarray(v.byteOffset||0,(v.byteOffset||0)+v.byteLength);fs.writeFileSync(path.join(out,'texture'+i+'.bytes'),data);return {name:im.name,index:i,bytes:data.length,sha256:crypto.createHash('sha256').update(data).digest('hex')};});
 const tex=i=>i===undefined?-1:g.textures[i].source;
 const materials=g.materials.map(mat=>{const p=mat.pbrMetallicRoughness||{};return {name:mat.name,color:p.baseColorFactor||[1,1,1,1],metallic:p.metallicFactor??1,roughness:p.roughnessFactor??1,albedo:tex(p.baseColorTexture?.index),normal:tex(mat.normalTexture?.index),metalRough:tex(p.metallicRoughnessTexture?.index),normalScale:mat.normalTexture?.scale??1,emission:mat.emissiveFactor||[0,0,0]};});
 const manifest={schema:1,sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),scope:'기존 기하의 Unity 검토 전용 좌표·문 경첩 변환. 영웅 원본·Blender 수정 없음',materials,images,nodes,sourceNodes:nodes.length,meshGroups:all.length,triangles,vertices:all.reduce((s,g)=>s+g.vertices.length,0),doorAngles:[72,-58],rearWall:12.6};
 fs.writeFileSync(path.join(out,'stage.json'),JSON.stringify(manifest,null,2));return manifest;
}
module.exports={toUnity,normalToUnity,doorPoint,parse,accessor,convert};if(require.main===module){const m=convert(process.argv[2],process.argv[3]);console.log(JSON.stringify({nodes:m.sourceNodes,groups:m.meshGroups,triangles:m.triangles,vertices:m.vertices,source:m.sourceSha256}));}
