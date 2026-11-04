// 11-04 integration preview 6 NRE: A2FieldAtmosphere hit an r3Roots entry Destroy()ed by HellLighting ("Shafts"/cards) once the steps yield between frames.
// Scope is every Runtime/NativeGame*.cs (not a fixed file list), so a branch that adds an unguarded r3Roots loop elsewhere is caught.
// Second rule: the assembly setups are IEnumerators; a bare call statement would silently never run.
const fs=require('node:fs'),path=require('node:path');const dir=path.resolve(__dirname,'../../Assets/Exoduser/Runtime');
let bad=[],calls=[],scanned=0;
for(const f of fs.readdirSync(dir).filter(n=>/^NativeGame.*\.cs$/.test(n)||/^HellLighting.*\.cs$/.test(n))){scanned++;
 const lines=fs.readFileSync(path.join(dir,f),'utf8').split('\n');
 lines.forEach((l,i)=>{
  if(/foreach\s*\(var root in r3Roots\)/.test(l)){const ctx=l+(lines[i+1]||'')+(lines[i+2]||'');if(!/root\s*!=\s*null|root\s*==\s*null/.test(ctx))bad.push(f+':'+(i+1));}
  const m=/\b(A2FieldSetup|A2FieldSetupSteps|A2ForestSetup|HellLightingSetup|Remodel3DLoad|Remodel3DLoadSteps)\s*\(/.exec(l);
  if(m&&!/IEnumerator\s+\w+\s*\(/.test(l)){const before=l.slice(0,m.index);if(!/(yield\s+return\s*|StartCoroutine\s*\(\s*|AssemblyGuard\.Run\s*\(\s*)$/.test(before)&&!/=\s*$/.test(before))calls.push(f+':'+(i+1)+' '+m[1]);}
 });}
const fail=bad.length||calls.length;
console.log((bad.length?'FAIL':'PASS')+' every r3Roots loop guards destroyed roots in '+scanned+' files'+(bad.length?' '+bad.join(','):''));
console.log((calls.length?'FAIL':'PASS')+' assembly IEnumerators are only run via yield return / StartCoroutine / AssemblyGuard'+(calls.length?' '+calls.join(','):''));
process.exitCode=fail?1:0;
