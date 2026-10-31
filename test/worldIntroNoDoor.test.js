import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const click=html.slice(html.indexOf('  function onVidClick(){'),html.indexOf('  function startWorldIntro(){'));
for(const build of ['full','demo','ea'])for(const gate of [true,false])test(build+' ENTER starts v22b immediately with gateLock='+gate,()=>{
 let starts=0,legacyPlays=0;const classes={add(){}};
 const ctx=vm.createContext({_vidStarted:false,_cinDone:false,_cinReady:false,_LOBBY_BUILD:build,
 console:{log(){}},prompt:{querySelector:()=>({classList:classes}),style:{}},skipBtn:{classList:classes},
 document:{getElementById:()=>gate?{}:null},window:{},_GP:{},performance:{now:()=>0},
 setTimeout(){},setInterval(){return 1},clearInterval(){},startCinBgm(){},startWorldIntro(){starts++},
 vid:{style:{},play(){legacyPlays++;return Promise.resolve()}}});
 vm.runInContext(click+';onVidClick();onVidClick();',ctx);
 assert.equal(starts,1,'all routes must start v22b once, independently of decorative DOM');
 assert.equal(legacyPlays,0,'no legacy doorway playback');assert.equal(ctx._cinReady,true);
});
test('lobby never loads or displays the retired door movie and background',()=>{
 assert.doesNotMatch(html,/<source[^>]+src=["']video\/intro\.mp4/);
 assert.doesNotMatch(html,/id=["']cinGate["']|class=["']cin-door-scene|url\(['"]?img\/hellgate\.png/);
 assert.match(html,/id="worldIntroVideo" src="video\/world_intro_v22b_steam\.mp4"/);
});
test('preview and account seen contracts are preserved',()=>{
 const seen=html.slice(html.indexOf('function _cinSeenChk(){'),html.indexOf('// ═══ Prologue Script'));
 assert.ok(seen.includes('user_metadata.cin_seen'));assert.ok(seen.includes("'_cinSeen:'+u.id"));
 assert.ok(seen.includes('if(_cinPreview)return;'));
});

test('legacy demo entry funnels query and fragment into the canonical lobby',()=>{
 const entry=readFileSync(new URL('../indexdemo.html',import.meta.url),'utf8');
 assert.doesNotMatch(entry,/video\/intro\.mp4|cin-door-scene|const CIN_LINES/);
 const script=entry.match(/<script>([\s\S]*?)<\/script>/)?.[1];assert.ok(script);
 let target;vm.runInNewContext(script,{location:{search:'?cinematic=1&lang=ja',hash:'#intro',replace:value=>target=value}});
 assert.equal(target,'index.html?cinematic=1&lang=ja#intro');
 const builder=readFileSync(new URL('../build-nwjs.mjs',import.meta.url),'utf8');assert.ok(builder.includes("'indexdemo.html'"));
});
