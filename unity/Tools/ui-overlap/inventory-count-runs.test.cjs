// 11-04 desktop-swap ratchet: 30 regressions, all on the bag count "가방 (0/300)" (inventory·ossuary·storage). Runs must not touch.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const R=f=>fs.readFileSync(path.resolve(__dirname,'../../Assets/Exoduser/Runtime',f),'utf8');
let failed=0;const test=(n,f)=>{try{f();console.log('PASS '+n);}catch(e){failed++;console.log('FAIL '+n+': '+e.message);}};
const o=R('NativeInventoryOssuary.cs');
test('one-pixel gap constant',()=>assert(/internal const float CountRunGap=1f;/.test(o)));
test('Serif text box is the run advance, not r.width+total/40',()=>{assert(o.includes('var box=new Rect(x+offset,r.y,(spacing==0?total:st.CalcSize(new GUIContent(g)).x),r.height);'));assert(!o.includes('spacing==0?r.width+total:40'));});
for(const f of ['NativeInventoryOssuary.cs','NativeInventoryDock.cs','NativeInventoryStorage.cs'])test(f+' count row: tight boxes and gaps',()=>{const s=R(f);
 assert.equal((s.match(/\+CountRunGap;/g)||[]).length,4);assert(!/Rect\(x,\d+(\.\d+)?,300,23\)/.test(s),'no 300px count boxes left');});
console.log(JSON.stringify({failed,passed:failed===0}));process.exitCode=failed?1:0;
