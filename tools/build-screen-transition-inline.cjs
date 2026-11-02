// Regenerate the identical critical first-HTML boundary on both pages. No new runtime file.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const sharp=require('G:/exoduser/node_modules/sharp');
const acorn=require('G:/exoduser/node_modules/acorn');
const root=path.resolve(__dirname,'..');
function boot(labels,image,embers){
 const html=document.documentElement,key='exoduser:screen-transfer:v1';let since=0;
 try{since=Number(sessionStorage.getItem(key))||0;sessionStorage.removeItem(key);}catch{}
 if(since&&(Date.now()-since>15000||since>Date.now()))since=0;
 if(!since&&/game(?:demo)?\.html$/i.test(location.pathname))since=Date.now();
 const cover=document.createElement('div');cover.id='screenTransition';cover.setAttribute('aria-hidden','true');html.appendChild(cover);
 const sigil=document.createElement('span');sigil.id='screenLoadingSigil';sigil.setAttribute('aria-hidden','true');sigil.style.backgroundImage='url("'+image+'")';sigil.style.setProperty('--screen-sigil-embers','url("'+embers+'")');html.appendChild(sigil);
 const label=document.createElement('span');label.id='screenLoadingLabel';label.setAttribute('aria-hidden','true');let lang='ko';
 try{lang=localStorage.getItem('hellLang')||'ko';const settings=JSON.parse(localStorage.getItem('hellcave_settings')||'{}');if(settings.opt?.reduceMotion||localStorage.getItem('exoduser_menu_reduce_motion')==='1')html.dataset.screenReduced='1';}catch{}
 label.textContent=labels[lang]||labels.en;html.appendChild(label);
 if(since){window.__screenBootSince=since;html.dataset.screenCover='1';html.dataset.screenPending='1';html.style.setProperty('--screen-loading-delay',Math.max(0,300-(Date.now()-since))+'ms');html.style.setProperty('--screen-label-delay',Math.max(0,1000-(Date.now()-since))+'ms');if(Date.now()-since>=300)html.dataset.screenLoading='1';}
}
(async()=>{
 const index=fs.readFileSync(path.join(root,'index.html'),'utf8'),labels={ko:'불러오는 중...'};
 for(const m of index.matchAll(/const _LOBBY_([A-Z]+)\s*=\s*(?=\{)/g)){
  try{const start=m.index+m[0].length,expr=acorn.parseExpressionAt(index,start,{ecmaVersion:'latest'});const dict=vm.runInNewContext('('+index.slice(start,expr.end)+')');if(dict['불러오는 중...'])labels[m[1].toLowerCase()]=dict['불러오는 중...'];}catch{}
 }
 // Malay shares the existing centralized dictionary.
 const scope={};vm.runInNewContext(fs.readFileSync(path.join(root,'localization-data.js'),'utf8'),scope);
 labels.ms=scope.ExoduserLocalizationData.lobbyMs['불러오는 중...'];
 if(Object.keys(labels).length!==29)throw Error('Expected KO + 28 existing translations: '+Object.keys(labels));
 const inline=async name=>'data:image/webp;base64,'+(await sharp(path.join(root,'img/ui/silver_hell',name)).resize({height:256}).webp({lossless:true}).toBuffer()).toString('base64');
 const image=await inline('gate_sigil_loading.png'),embers=await inline('gate_sigil_loading_embers.png');
 const css='html,body{background-color:#000}#screenTransition{position:fixed;inset:0;z-index:2147483647;background:#000;opacity:0;pointer-events:none}html[data-screen-cover] #screenTransition{opacity:1;pointer-events:all}\n'+fs.readFileSync(path.join(root,'screen-transition.css'),'utf8');
 const block='<!-- screen-transition-critical:start -->\n<meta charset="UTF-8">\n<style>'+css+'</style>\n<script>('+boot.toString()+')('+JSON.stringify(labels)+','+JSON.stringify(image)+','+JSON.stringify(embers)+');</script>\n<!-- screen-transition-critical:end -->';
 for(const name of ['index.html','game.html']){
  const file=path.join(root,name);let text=fs.readFileSync(file,'utf8');
  if(text.includes('<!-- screen-transition-critical:start -->'))text=text.replace(/<!-- screen-transition-critical:start -->[^]*?<!-- screen-transition-critical:end -->/,block);
  else text=text.replace(/<style>html,body\{background-color:#000\}[^]*?<\/style>/,block);
  text=text.replace('<div id="screenTransition" aria-hidden="true"></div><span id="screenLoadingSigil" aria-hidden="true"></span>','');
  // Critical meta must precede translated text, and version the external fallback for cached clients.
  const end=text.indexOf('<!-- screen-transition-critical:end -->');
  text=text.slice(0,end)+text.slice(end).replace('<meta charset="UTF-8">','');
  text=text.replace(/screen-transition\.(js|css)\?v=20261102(?:-r[23])?/g,'screen-transition.$1?v=20261102-r3');
  fs.writeFileSync(file,text);
 }
 console.log('inline cover, original-art thumbnail and '+Object.keys(labels).length+' existing loading labels; '+Buffer.byteLength(block)+' bytes/page');
})().catch(e=>{console.error(e);process.exitCode=1;});
