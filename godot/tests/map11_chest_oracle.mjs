import fs from 'node:fs';import vm from 'node:vm';import readline from 'node:readline';
const arg=k=>process.argv.find(s=>s.startsWith(k+'='))?.slice(k.length+1);
const lines=[];let n=0,slots,normalize;
for await(const s of readline.createInterface({input:fs.createReadStream(arg('--source-game')),crlfDelay:Infinity})){n++;if(n===15176)slots=s;if(n===15953)normalize=s;if(n>=32855&&n<=32880)lines.push(s);}
if(!slots?.includes('SLOT_NAMES'))throw new Error('source slot anchor moved');
const results=[];
for(const c of JSON.parse(fs.readFileSync(arg('--cases-file'),'utf8'))){
 let index=0;const drops=[];const G={stage:0,mats:0};const worldItems=[{x:0,y:0,type:'chest',picked:false,opened:false}];
 const ctx=vm.createContext({G,P:{x:0,y:0},worldItems,window:{},OPT:{shake:0},SFX:{victory(){}},EL:{P:0,F:1,I:2,D:3,L:4,H:5},_T:s=>s,_petTut:{firstChest:true},dst:Math.hypot,addTxt(){},addParts(){},addPotion(type,count){G.mats+=count;return true},mkItem:(slot,tier,el,rarity)=>({slot,tier,el,rarity}),_wiPush:r=>drops.push(r),Math:Object.create(Math)});
 ctx.dst=(x,y,a,b)=>Math.hypot(x-a,y-b);ctx.Math.random=()=>c.values[index++];
 if(!normalize?.includes("el=EL.P"))throw new Error('source mkItem normalization moved');
 vm.runInContext('function mkItem(slot,tier,el,rarity){'+normalize+'return {slot,tier,el,rarity};}\n'+slots+'\n'+lines.join('\n'),ctx);
 results.push({records:drops,mats:G.mats,outer_draws:index,opened:worldItems[0].opened});
}
fs.writeFileSync(arg('--out-file'),JSON.stringify(results));
