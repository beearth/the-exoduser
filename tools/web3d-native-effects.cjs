// Export the existing native ground-effect drawing, without scenery, actors or projectiles.
// Run after changes to drawP; tests verify that this is the current native source.
const fs=require('node:fs'),path=require('node:path');const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'game.html'),'utf8');
const a=html.indexOf('function drawP(){')+'function drawP(){'.length;
const b=html.indexOf('  _s6PlayerStart=performance.now();',a);
if(a<20||b<a)throw Error('Native ground effect boundaries not found');
let body=html.slice(a,b);
// The target covers a larger world rectangle than the native screen at zoom .47.
body=body.replace(/const _vl=.*?;/,'const _vl=G.cam.x-2600,_vr=G.cam.x+2600,_vt=G.cam.y-2600,_vb=G.cam.y+2600;');
body+='\n  _drawEnemyShotWarnings();_drawPhysicalBites();_renderBloodSplats(X,G.cam);\n';
fs.writeFileSync(path.join(root,'web3d/native-ground-effects.js'),`// Generated from current game.html drawP ground pass. No terrain/actor/native world render.\nwindow._Web3DDrawNativeGround=function(ctx){const previous=X;X=ctx;try{${body}\n}finally{X=previous;}};\n`);
console.log('Native ground-effect source exported: '+body.split('\n').length+' lines');
const acorn=require(require.resolve('acorn',{paths:[root,'G:/exoduser']}));
const script=html.slice(html.indexOf('<script>\n// ┌')+9).split('</script>')[0];
const ast=acorn.parse(script,{ecmaVersion:'latest'});const loops=[];
function walk(n){if(!n||typeof n!=='object')return;if(n.type==='ForStatement')loops.push(n);for(const [k,v]of Object.entries(n))if(!['start','end'].includes(k)){if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v);}}
walk(ast);
const player=loops.find(n=>script.slice(n.start,n.start+100).includes('let _ppi3=0;'));
const enemy=loops.find(n=>script.slice(n.start,n.start+110).includes('let _vi=0;_vi<_visProjs.length')&&script.slice(n.start,n.end).includes('const _sceneBillboard='));
if(!player||!enemy)throw Error('Native projectile loops not found');
const clean=n=>script.slice(n.start,n.end).replace(/if\(p\._sprFr==null\)p\._sprFr=Math.random\(\)\*8;p\._sprFr\+=\.(12|15);/g,'');
fs.appendFileSync(path.join(root,'web3d/native-ground-effects.js'),`\nwindow._Web3DDrawNativeProjectile=function(ctx,projectile,friendly){const previous=X;X=ctx;try{const projs=[projectile],pProjs=[projectile],_visProjs=[0],_vl=-Infinity,_vr=Infinity,_vt=-Infinity,_vb=Infinity,_PP_DRAW_MAX=9999;let _ppDrawN=0;if(friendly){${clean(player)}}else{${clean(enemy)}}}finally{X=previous;}};\n`);
console.log('Both native projectile families exported, frame advancement excluded');
