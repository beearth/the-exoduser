const fs = require('node:fs');
const path = require('node:path');
const [build, receipt] = process.argv.slice(2);
const files = [];
function walk(dir) { for (const e of fs.readdirSync(dir, {withFileTypes:true})) { const p=path.join(dir,e.name); if(e.isDirectory()) walk(p); else files.push(p); } }
if (!build || !receipt || !fs.existsSync(path.join(build, 'EXODUSER-Unity.exe'))) throw new Error('검사할 실제 EXODUSER Player 빌드와 영수증 경로가 필요합니다.');
walk(build);
const managed=files.filter(p=>p.endsWith('.dll'));
const violations=files.filter(p=>/MCPForUnity/i.test(path.basename(p)));
const references=managed.filter(p=>fs.readFileSync(p).includes(Buffer.from('MCPForUnity')));
const result={검사:'실제 Player MCP 파일과 관리 어셈블리 참조 부재',빌드:build,파일수:files.length,DLL수:managed.length,MCP파일:violations,MCP참조:references,통과:managed.length>0&&violations.length===0&&references.length===0};
fs.writeFileSync(receipt,JSON.stringify(result,null,2));
console.log(JSON.stringify(result));
process.exitCode=result.통과?0:1;
