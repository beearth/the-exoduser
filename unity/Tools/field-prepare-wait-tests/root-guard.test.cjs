// 11-04 integration preview 6 NRE: A2FieldAtmosphere hit an r3Roots entry Destroy()ed by HellLighting ("Shafts"/cards) once the steps yield between frames.
const fs=require('node:fs'),path=require('node:path');const R=f=>fs.readFileSync(path.resolve(__dirname,'../../Assets/Exoduser/Runtime',f),'utf8');
let bad=[];for(const f of ['NativeGame.A2Field.cs','NativeGame.A2Forest.cs','NativeGame.HellLighting.cs','NativeGame.Remodel3D.cs','NativeGame.RemodelArena.cs']){let s;try{s=R(f);}catch{continue;}
 const lines=s.split('\n');lines.forEach((l,i)=>{if(!/foreach\s*\(var root in r3Roots\)/.test(l))return;const ctx=l+(lines[i+1]||'')+(lines[i+2]||'');if(!/root\s*!=\s*null|root\s*==\s*null/.test(ctx))bad.push(f+':'+(i+1));});}
console.log((bad.length?'FAIL':'PASS')+' every r3Roots loop guards destroyed roots'+(bad.length?' '+bad.join(','):''));process.exitCode=bad.length?1:0;
