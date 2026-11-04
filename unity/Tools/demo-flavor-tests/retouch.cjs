const fs=require('node:fs'),cp=require('node:child_process'),path=require('node:path');process.chdir(path.resolve(__dirname,'../../..'));
let checks=0;const check=(ok,label)=>{if(!ok)throw Error(label);checks++;};
const labels='unity/Assets/Exoduser/Resources/Data/stageclear_labels.json',registry='docs/16번역·로컬라이제이션/번역대상_전체목록.md';
const read=p=>fs.readFileSync(p,'utf8'),show=p=>cp.execFileSync('git',['show','HEAD:'+p],{encoding:'utf8'});
try{
 const audit=cp.execFileSync('git',['show','6ef1899cb:docs/11내러티브·로어디자인/DEMO_V0_1_1_TEXT_AUDIT_20261104.md'],{encoding:'utf8'}).split('F1 바꿀 문구:')[1];
 const expected=new Map([...audit.matchAll(/^\| ([a-z]+) \| (.+) \|\r?$/gm)].map(x=>[x[1],x[2]])),current=JSON.parse(read(labels)),before=JSON.parse(show(labels));
 check(expected.size===19,'audit table has 19 actual language rows including ko');check(current.entries.length===29&&new Set(current.entries.map(x=>x.code)).size===29,'29 unique locales remain');
 for(const row of current.entries){const old=before.entries.find(x=>x.code===row.code);check(JSON.stringify(row)===JSON.stringify({...old,demoWishlist:expected.get(row.code)||old.demoWishlist}),'only approved wishlist text changes: '+row.code);}
 const list=read(registry);check(!/(?<!\r)\n/.test(list)&&list.includes('\r\n'),'registry uniform CRLF');
 for(const n of [4259,4260])check(!new RegExp('^\\| '+n+' \\|','m').test(list),'duplicate row removed '+n);
 for(const n of [3473,2824])check(new RegExp('^\\| '+n+' \\|','m').test(list),'existing canonical row retained '+n);
 check(list.includes('demoSub는 기존 No.3473')&&list.includes('기존 No.2824(데모 종료 / End of Demo)'),'explicit canonical references');
 check(list.includes('| 4261 | 정식판 위시리스트에 추가 |'),'wishlist KO registry synchronized');
 const flavor=read('unity/Assets/Exoduser/Resources/Data/buildflavor_web.json');JSON.parse(flavor);check(!flavor.includes('"End demo"')&&(flavor.match(/"End of Demo"/g)||[]).length===2,'both flavor English buttons use canonical End of Demo');
 const result={passed:true,checks,audit:'6ef1899cb section5',approvedLocaleRows:19,unchangedLocales:10,duplicateRowsRemoved:[4259,4260],canonicalReferences:[3473,2824],crlfPreserved:true};
 fs.writeFileSync('I:/EXODUSER-Storage/codex-takeover/unity-11-fullrun/text-retouch-result.json',JSON.stringify(result,null,2)+'\n');console.log('PASS '+checks+' text retouch checks');
}catch(e){console.error('FAIL text retouch: '+e.message);process.exitCode=1;}
