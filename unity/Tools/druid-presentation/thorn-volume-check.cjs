// 실제 HLSL 순수 정규 함수의 식을 실행한다. 게임/GPU/아트 PASS 검사는 아니다.
const fs=require('node:fs'),path=require('node:path');
const file=path.resolve(__dirname,'../../Assets/Exoduser/Resources/Shaders/DruidProjectile.shader');
const source=fs.readFileSync(file,'utf8');
function body(name){
 const start=source.indexOf(name+'(');if(start<0)return null;
 const open=source.indexOf('{',start);let depth=1,end=open+1;
 for(;depth&&end<source.length;end++){if(source[end]==='{')depth++;if(source[end]==='}')depth--;}
 return source.slice(open+1,end-1);
}
function js(s){return s.replace(/\bfloat[234]?\s+(?=\w+\s*[=;])/g,'let ').replace(/\bconst\s+float\s+/g,'const ');}
const prelude=`const max=Math.max,min=Math.min,sqrt=Math.sqrt,sin=Math.sin,abs=Math.abs;
const saturate=x=>max(0,min(1,x)),clamp=(x,a,b)=>max(a,min(b,x));
const float2=(x,y)=>({x,y}),float3=(x,y,z)=>({x,y,z});
const normalize=n=>{const d=Math.hypot(n.x,n.y,n.z);return float3(n.x/d,n.y/d,n.z/d)};`;
let evaluate;
if(body('ThornSurfaceNormal')){
 const functions=[['ThornBranchHeight','x,y,ax,ay,bx,by,radius0,lift'],['ThornSurfaceHeight','p'],['ThornSurfaceNormal','p']];
 const program=functions.map(([name,args])=>`function ${name}(${args}){${js(body(name))}}`).join('\n');
 evaluate=new Function('p',prelude+program+';return ThornSurfaceNormal(p);');
}else{
 const start=source.indexOf('float seam=.035+.035*sin(p.x*4);');
 const end=source.indexOf('float facet=',start);
 if(start<0||end<0)throw Error('현재 정규 식을 찾지 못함');
 const actual=source.slice(start,end).replace('surfaceNormal=','return ');
 evaluate=new Function('p',prelude+js(actual));
}
const pairs=[
 [{x:-.401,y:.315},{x:-.339,y:.365}],
 [{x:-.674,y:.171},{x:-.616,y:.225}]
];
let checks=0,failures=0;
function check(ok,label,detail){checks++;if(!ok){failures++;console.log('FAIL '+label+' '+detail);}}
for(let i=0;i<pairs.length;i++){
 const [a,b]=pairs[i].map(evaluate),dot=a.x*b.x+a.y*b.y+a.z*b.z;
 check(dot<.94,'곁가지 양쪽 단면 정규 '+i,'내적='+dot);
}
for(let y=-1;y<=1.001;y+=.05)for(let x=-1;x<=1.001;x+=.05){
 const n=evaluate({x,y}),length=Math.hypot(n.x,n.y,n.z);
 check(Number.isFinite(length)&&Math.abs(length-1)<1e-6&&n.z>0,'유한한 단위 전면 정규',JSON.stringify({x,y,n}));
}
console.log(JSON.stringify({검사:checks,실패:failures,한계:'실제 HLSL 식의 수치 검사. Unity 셰이더 컴파일/GPU/1x 시각 판정은 별도'}));
process.exitCode=failures?1:0;
