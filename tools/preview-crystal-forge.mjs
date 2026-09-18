// Isolated browser fixture: actual game CSS, panels, crystal code and renderers.
// Never boots the game or reads/writes player saves. Rebuild after game.html edits.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const html=readFileSync(new URL('../game.html',import.meta.url),'utf8');
const slice=(a,b)=>{const start=html.indexOf(a),end=html.indexOf(b,start);if(start<0||end<0)throw Error('Missing extraction boundary: '+a+' / '+b);return html.slice(start,end);};
const css=slice('<style>','</style>').slice('<style>'.length);
const panels=slice('<!-- INVENTORY PANEL -->','<div class="panel" id="storagePanel">');
if(/<script/i.test(panels))throw Error('Fixture must not boot the game');
if(!panels.includes('id="forge"'))throw Error('Missing forge panel');
const crystal=slice('const CR_ATK_SLOTS=','const ITEM_SIZE=');
const forge=slice('function renderForge(){',"$('fgClose').onclick=");
const inventory=slice('function renderInv(){',"$('invClose').onclick=");
const socket=slice("  // ── 2.5) 결정 슬롯 인터랙티브 UI",'  // ── 3) 장착 아이템 ──');
const en=slice('const _EN={','\n};')+'\n};';
const fixture=`
const $=id=>document.getElementById(id),OPT={lang:'ko'},G={mats:100000,forgeTab:'crystal'},P={x:0,y:0};
${en}
const _L=(ko,en,args={})=>(OPT.lang==='ko'?ko:en).replace(/\\{(\\w+)\\}/g,(_,k)=>args[k]??k),_T=s=>OPT.lang==='ko'?s:(_EN[s]||s);
const _glyph=()=>'',_malCost=v=>Math.ceil(v*.5),_ensureForgeAtlasLoad=()=>{},BGM={play(){}},SFX={forge(){}};
const applyStats=()=>{},addTxt=()=>{},notify=()=>{},dbSaveNow=()=>{};
let _forgeSel=null,_salSel=new Set(),_rerollSel=null,_gpCrIdx=0;
${crystal}
${forge}
const INV={bag:[],equipped:{armor:{slot:'armor',socketCount:2,crystals:[null,null]}},selected:null};
const SLOT_NAMES=['weapon','bow','helmet','bracelet','ring1','ring2','necklace','headband','belt','gloves','armor','shield','pants','boots','cape'];
const slotLabels=['무기','석궁','왕관','팔찌','반지1','반지2','목걸이','귀걸이','벨트','장갑','갑옷','견갑','바지','부츠','망토'];
const EQ_POS=SLOT_NAMES.map((_,i)=>[16+(i%3)*104,Math.floor(i/3)*44]);
const _slotName=i=>slotLabels[i],_slotGlyph=()=>'',_itemSkin=()=>'',_rarName=i=>['일반','매직','레어','전설','유니크'][i];
const RARITY_C=['#999','#4488ff','#eecc44','#ee8844','#ffdd66'],EL={P:0,F:1,I:2,D:3,L:4},ELC=RARITY_C,INV_COLS=10;
let invFilter={slot:null,rarity:null,el:null},BAG_MAX=60,_GC_SZ=48,_invSalSel=new Set(),_invHover=-1;
const _invRows=()=>6,calcCP=()=>({total:100,atk:50,def:40,extra:10}),renderInvStorage=()=>{},renderOssPanel=()=>{},_invClearHover=()=>{};
function _invRenderDetail(idx,source){const rp=$('invRight'),it=INV.equipped[idx];rp.replaceChildren();${socket}}
${inventory}
function showFixture(id){document.querySelectorAll('.panel').forEach(p=>p.classList.remove('on'));$(id).classList.add('on');if(id==='forge')renderForge();else {renderInv();_invRenderDetail('armor','eq');}}
function seed(){CRYSTAL_BAG=[];for(const id of CRYSTAL_IDS){for(let n=0;n<12;n++)CRYSTAL_BAG.push({id,star:0,enh:0});for(let n=0;n<2;n++)CRYSTAL_BAG.push({id,star:2,enh:5});}CRYSTAL_DUST=1000;_crForgeFilter='all';_crForgeSel=-1;showFixture('forge');}
document.querySelector('#fixtureForge').onclick=()=>showFixture('forge');
document.querySelector('#fixtureInv').onclick=()=>showFixture('invPanel');
document.querySelector('#fixtureLang').onclick=()=>{OPT.lang=OPT.lang==='ko'?'en':'ko';showFixture('forge')};
document.querySelector('#fixtureSeed').onclick=seed;
seed();
`;
const out=new URL('../tmp/crystal_forge_20260918/preview.html',import.meta.url);
mkdirSync(new URL('.',out),{recursive:true});
writeFileSync(out,`<!doctype html><html><head><meta charset="utf-8"><base href="/"><title>결정 관리 UI 검증</title><style>${css}</style><style>#fixtureTools{position:fixed;top:0;left:0;z-index:99999;background:#222;padding:3px;color:white}#fixtureTools button{padding:3px 8px}</style></head><body><nav id="fixtureTools">저장 없는 테스트 <button id="fixtureForge">대장간 보기</button><button id="fixtureInv">인벤 보기</button><button id="fixtureLang">KO / EN</button><button id="fixtureSeed">결정 252개 초기화</button></nav>${panels}<script>${fixture}</script></body></html>`);
console.log(out.pathname);
