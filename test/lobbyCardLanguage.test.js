import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {parse} from 'acorn';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8'),functions=new Map();
for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)){
 for(const node of parse(m[1],{ecmaVersion:'latest'}).body){
  if(node.type==='FunctionDeclaration')functions.set(node.id.name,m[1].slice(node.start,node.end));
 }
}
function setup(){
 let language='ko',requests=0;const cards=[],nodes={};
 const document={activeElement:null,body:{},getElementById:id=>nodes[id]||null,querySelector:()=>null,createElement:()=>element()};
 function element(text=''){
  const attrs={};return {children:[],textContent:text,dataset:{},isConnected:true,
   setAttribute(k,v){attrs[k]=String(v);},getAttribute:k=>attrs[k]??null,addEventListener(){},
   focus(){document.activeElement=this;}};
 }
 const dictionary={'전사':'Warrior','궁수':'Ranger','처치':'Kills','브라우저 저장':'Browser Save',
  '삭제':'Delete','새 캐릭터':'New Character','슬롯 가득참':'Slots Full','최대':'Max','개':' characters'};
 const ctx=vm.createContext({document,$:id=>nodes[id]||null,console,
  _lobbyLang:()=>language,_TL:s=>language==='ko'?s:dictionary[s]||s,
  _LOBBY_BUILD:'demo',_LOBBY_TABLES:{},_LOBBY_EN:dictionary,_selectedCharDisplay:null,
  CHAR_VISUALS:[{job:'전사'},{job:'궁수'}],ExoduserI18n:{applyDocumentLanguage(){}},
  _refreshStatusLanguage(){},_formatLobbyStageProgress:stage=>(language==='ko'?'층 ':'Stage ')+stage,
  setTimeout(){},fetch(){requests++;throw Error('Changing labels must not fetch or save');}});
 const names=['_applyLobbyLang','_addLobbyCardControl','_refreshLobbyCardsLanguage','_lobbyCardLeaf',
  '_lobbyCharacterCardLabel','_lobbyDemoCardLabel','_lobbyNewCardLabel','_lobbyAncestorName','_lobbyAncestorCaption','_lobbyAncestorDetail','_lobbyPlayerRecordName'];
 vm.runInContext(names.map(n=>functions.get(n)||'').join('\n'),ctx);
 nodes.langSelect={value:'ko'};nodes.charList={querySelectorAll:()=>cards};
 function card({info=true}={}){
  const leaves={'.char-name':element('original'),'.char-cls':element('original'),'.char-info':info?element('original'):null,'.char-del':element()};
  const image=element(),node={children:[image],querySelector:selector=>leaves[selector]||null,
   prepend(control){this.control=control;this.children.unshift(control);},image,leaves};cards.push(node);return node;
 }
 function change(lang){language=lang;ctx._applyLobbyLang();}
 return {ctx,document,nodes,card,change,cards,requests:()=>requests};
}
for(const progress of [null,{lv:46,kills:1795}])test('demo card switches visible and accessible labels without replacing nodes: '+JSON.stringify(progress),()=>{
 const s=setup(),card=s.card();s.ctx._addLobbyCardControl(card,()=>s.ctx._lobbyDemoCardLabel(card,progress),'demo');
 const control=card.control,children=card.children;control.focus();s.change('en');
 assert.equal(card.leaves['.char-name'].textContent,'Player Record');
 assert.ok(card.leaves['.char-info'].textContent.startsWith('Lv.'));
 if(progress){assert.match(card.leaves['.char-info'].textContent,/Lv\.46.*Kills 1,795.*Browser Save/);}
 assert.ok(control.getAttribute('aria-label').startsWith('Player Record · '));
 assert.equal(control.title,control.getAttribute('aria-label'));assert.equal(card.children,children);assert.equal(card.control,control);
 assert.equal(s.document.activeElement,control);assert.equal(s.requests(),0);
 s.change('ko');assert.equal(card.leaves['.char-name'].textContent,'플레이어 기록');assert.ok(control.title.startsWith('플레이어 기록'));
});
for(const [mode,separator] of [['local',' · '],['online',' | ']])test(mode+' character retains its custom name, level, stage and focus while labels change',()=>{
 const s=setup(),card=s.card();card.leaves['.char-name'].textContent='사용자 이름';
 s.ctx._addLobbyCardControl(card,()=>s.ctx._lobbyCharacterCardLabel(card,'사용자 이름',1,37,12,separator),mode+':chosen');
 card.control.focus();s.change('en');
 assert.equal(card.leaves['.char-name'].textContent,'사용자 이름');assert.equal(card.leaves['.char-cls'].textContent,'Ranger');
 assert.equal(card.leaves['.char-info'].textContent,'Lv.37'+separator+'Stage 12');assert.equal(card.leaves['.char-del'].title,'Delete');
 assert.equal(card.control.getAttribute('aria-label'),'사용자 이름 · Ranger · Lv.37'+separator+'Stage 12');
 assert.equal(s.document.activeElement,card.control);assert.equal(card.control.dataset.cardKey,mode+':chosen');assert.equal(s.requests(),0);
 s.change('ko');assert.equal(card.leaves['.char-cls'].textContent,'궁수');assert.equal(card.leaves['.char-del'].title,'삭제');
});
test('available creation card translates its text and button description together',()=>{
 const s=setup(),card=s.card({info:false});s.ctx._addLobbyCardControl(card,()=>s.ctx._lobbyNewCardLabel(card,true,5),'new');
 s.change('en');assert.equal(card.leaves['.char-name'].textContent,'New Character');assert.equal(card.control.title,'New Character');
 s.change('ko');assert.equal(card.leaves['.char-name'].textContent,'새 캐릭터');assert.equal(s.requests(),0);
});
for(const info of [false,true])test('full creation card translates without acquiring an interactive control: '+info,()=>{
 const s=setup(),card=s.card({info});card._refreshLanguage=()=>s.ctx._lobbyNewCardLabel(card,false,5);
 s.change('en');assert.equal(card.leaves['.char-name'].textContent,'Slots Full');assert.equal(card.control,undefined);
 if(info)assert.equal(card.leaves['.char-info'].textContent,'Max 5 characters');
 s.change('ko');assert.equal(card.leaves['.char-name'].textContent,'슬롯 가득참');assert.equal(s.requests(),0);
});
for(const kind of ['demo','character'])test(kind+' refresh preserves unexpected nested text containers',()=>{
 const s=setup(),card=s.card(),nameChild={},infoChild={};
 card.leaves['.char-name'].children=[nameChild];card.leaves['.char-info'].children=[infoChild];
 const label=kind==='demo'?()=>s.ctx._lobbyDemoCardLabel(card,null):()=>s.ctx._lobbyCharacterCardLabel(card,'saved',0,1,0);
 s.ctx._addLobbyCardControl(card,label,'chosen');s.change('en');
 assert.equal(card.leaves['.char-name'].textContent,'original');assert.equal(card.leaves['.char-info'].textContent,'original');
 assert.equal(card.leaves['.char-name'].children[0],nameChild);assert.equal(card.leaves['.char-info'].children[0],infoChild);
});
test('language application is safe before a list or slot state has initialized',()=>{
 const s=setup();delete s.nodes.charList;delete s.ctx.$;s.change('en');assert.equal(s.requests(),0);
});
test('existing fixed card labels remain compatible with the shared control helper',()=>{
 const s=setup(),card=s.card();card.leaves['.char-info'].textContent='Lv.9';s.ctx._addLobbyCardControl(card,'fixed','saved');
 assert.equal(card.control.title,'fixed · Lv.9');assert.equal(card.control.dataset.cardKey,'saved');
});
