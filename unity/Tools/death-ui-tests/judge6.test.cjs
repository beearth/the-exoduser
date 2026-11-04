const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),read=f=>fs.readFileSync(path.join(root,f),'utf8'),rt=f=>read('Assets/Exoduser/Runtime/'+f);
let failed=0;const test=(name,fn)=>{try{fn();console.log('PASS '+name);}catch(e){failed++;console.log('FAIL '+name+': '+e.message);}};
test('1 empty lobby slot has the same dark face as filled slots',()=>{
 const s=rt('NativeLobby.SilverLobby.cs');
 assert(/SilverSlotFace=new Color\(/.test(s));
 assert(/DrawEmptySilverSlot\(Rect card\)\{Fill\(card,SilverSlotFace\)/.test(s),'empty slot fills the face');
 assert(!/bool selected=index==Characters\.SelectedIndex;Fill\(card,SilverSlotFace\)/.test(s),'filled slots stay as they were (empty-slot change only)');
 // 11-04 RETOUCH: face lifted to Y 8.5 (alpha .94 kept against bleed); the model Y=(1-a)*bg+a*faceY must land in 7..10 over every measured bg (4.3 / 5.8 / 8.7 / 15.3).
 const m=s.match(/SilverSlotFace=new Color\((\d+)\/255f,(\d+)\/255f,(\d+)\/255f,([\d.]+)f\)/);assert(m,'face colour declared');
 const [r,g,b]=[m[1],m[2],m[3]].map(Number),a=+m[4],faceY=.299*r+.587*g+.114*b;
 assert(a>=.9&&a<1,'alpha '+a+' stays nearly opaque (no lamp/flag bleed at 3840)');
 for(const bg of [4.3,5.8,8.7,15.3]){const y=(1-a)*bg+a*faceY;assert(y>=7&&y<=10,'predicted empty-slot Y '+y.toFixed(2)+' over bg '+bg+' is outside 7..10');}
});
test('2 entry hover brightens ENTER with a soft elliptical glow (no box rim) through one shared EntryFocus path',()=>{
 const h=rt('NativeLobby.SilverHell.cs'),l=rt('NativeLobby.SilverLobby.cs');
 assert(!h.includes('DrawEntryRim')&&!h.includes('EntryRimReach'),'rectangular rim removed (read as a grey frame)');
 assert(h.includes('DrawEntryTextGlow(box)')&&/Mathf\.Sqrt\(x\*x\+y\*y\)/.test(h),'elliptical ENTER glow falling to 0 at its edge');
 assert(/GUI\.color=new Color\(1,1,1,\.18f\)/.test(h)&&(h.match(/DrawTexture\(new Rect\(0,0,inside\.width,inside\.height\),innerButtonGlow\)/g)||[]).length===1,'medallion glow back to one .18 draw (doubled .34 showed hard edges)');
 assert(/EntryHoverVisible=canEnter&&hovered&&NativeSilverHellUi\.EntryFocus\(play\)/.test(l)&&/bool hovered=EntryReviewState=="hover"\|\|EntryReviewState==null&&EntryPointerInside/.test(l),'QA hover state and real hover share EntryFocus');
 assert(/new Color\(232\/255f,226\/255f,212\/255f,d\*d\*\.42f\)/.test(h),'warm silver, not neon');
});
test('3 Greek experience label is the full word and no other language is elided',()=>{
 const d=JSON.parse(read('Assets/Exoduser/Resources/Data/demo_text.json'));
 const e=d.entries.find(x=>x.key==='경험치');assert.equal(e.texts[d.codes.indexOf('el')],'Εμπειρία');
 assert.equal(e.texts.length,29);assert(!e.texts.some(t=>/…|\.\.\./.test(t)));
 const p=rt('NativeObjectivePanel.cs');assert(p.includes('FitWord(')&&p.includes('WidthForLabels('),'panel widens and shrinks by one step, no ellipsis');
});
test('4 pet bubble body uses the NanumMyeongjo serif path of the name window',()=>{
 const s=rt('NativePetBubbleView.cs');
 assert(/font=Resources\.Load<Font>\("Art\/fonts\/NanumMyeongjo-Regular"\)\?\?NativeSilverHellUi\.Font\(\)/.test(s));
 assert(s.includes('fontSize=22')&&s.includes('style.fontSize>12'),'size rules unchanged');
});
test('5a sound tab rows end at 914 like the other tabs (96 + 818)',()=>{
 const s=rt('NativePauseMenu.A15Web.cs');
 assert(s.includes('RowFor(l,DefSfx,0,45,818);RowFor(l,DefBgm,0,93,818);'));
 assert(s.includes('"optBgmTrack",new Rect(0,141,818,48)'));
 assert(!/DefSfx,0,45,960/.test(s));assert(96+818===914);
});
test('5b death title: front title fades out before the panel title appears',()=>{
 const o=rt('NativeDeathOverlay.cs'),r=rt('NativeRevive.DeathScreen.cs');
 const fade=+r.match(/DeadTextFade=([\d.]+)f/)[1],delay=+o.match(/TitleGateDelay=([\d.]+)f/)[1];
 assert(fade<=delay,'front fade '+fade+' must end by gate delay '+delay);
 // death-pbz decision screen (11-04): its own title starts at TitleAt behind a BlackIn fill; the gate is met by timing, not multiplied in.
 const titleAt=+o.match(/TitleAt=([\d.]+)f/)[1];
 assert(titleAt>=delay,'decision title starts at '+titleAt+' after the gate delay '+delay);
 const smooth=t=>{t=Math.min(1,Math.max(0,t));return t*t*(3-2*t);};
 for(let t=0;t<=1.5;t+=.05){const front=1-smooth(t/fade),back=t<titleAt?0:1;assert(front*back<1e-9,'overlap at '+t.toFixed(2));}
});
console.log(JSON.stringify({groups:6,failed,passed:failed===0,scope:'source/layout contracts; screen judgement pending'}));process.exitCode=failed?1:0;
