// Read-only existing web/registered copy import. Never adds translations or edits web.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),cp=require('node:child_process');
const root=path.resolve(__dirname,'../..'),web=path.resolve(process.argv[2]||'G:/exoduser-wt/latest-web');
const source=fs.readFileSync(path.join(web,'game.html'),'utf8'),at=source.indexOf('const _EN={'),end=source.indexOf('\n};',at)+3;
if(at<0||end<3)throw Error('EN boundaries');
const tables={en:vm.runInNewContext(source.slice(at,end)+'\n'+[...source.matchAll(/Object\.assign\(_EN,\{[\s\S]*?\}\);/g)].map(m=>m[0]).join('\n')+'\n_EN',{}, {timeout:2000})};
const codes='ko en zh ja es zht ru de ptbr fr pl it uk tr vi th id ar sv da no fi cs hu ro nl el bg ms'.split(' ');
for(const code of codes.slice(2))tables[code]=vm.runInNewContext(fs.readFileSync(path.join(web,'lang_'+code+'.js'),'utf8')+'\n_'+code.toUpperCase(),{}, {timeout:2000});
const cue=(id,tier,weight,seconds,cooldown,key,pairKey,pairSeconds)=>({id,tier,weight,who:'crow',key,seconds,cooldown,pairWho:'cat',pairKey,pairSeconds});
const cues=[
 cue('env_ch0',0,0,4,99999,'…새 한 마리 안 우네. 숲이 다 먹었어.','…나무가 우릴 보고 있어. 기분 나빠.',4),
 cue('boss_intro_ch0',4,0,5,99999,'…첫 번째다. 부담 갖지 마. 죽어도 다시 와.','첫 보스야. 겁먹지 마, 우리도 있어.',4),
 cue('warn_hp50',5,40,3,60,'…절반이다. 정신차려.','체력 반 남았어! 물약 마실 타이밍!',3),
 cue('crisis_hp30',5,60,4,20,'피가 새고 있다. Shift. 빠져.','사슬 던져! 끌려가면 무적이야!',4),
 cue('hp_critical',5,100,3,30,'…죽기 직전이다. 패링해. 피를 채워.','한 방이면 죽어! 패링으로 HP 채워!!',3)
];
const entries=[];
for(const key of new Set(cues.flatMap(c=>[c.key,c.pairKey]))){
 if(!source.includes("'"+key+"'"))throw Error('Unregistered source text '+key);
 entries.push({key,texts:codes.map(code=>{const value=code==='ko'?key:tables[code][key];if(!value)throw Error('Missing '+code+': '+key);return value;})});
}
const locPath='docs/11내러티브·로어디자인/ch1_1_plan_v2_text_i18n.json';
const registered=cp.spawnSync('C:/Program Files/Git/cmd/git.exe',['show','origin/unity/main:'+locPath],{cwd:path.resolve(root,'..'),encoding:'utf8',windowsHide:true});
const locationSource=registered.status===0?'origin/unity/main:'+locPath:'latest-web:'+locPath;
const locations=JSON.parse(registered.status===0?registered.stdout:fs.readFileSync(path.join(web,locPath),'utf8'));
for(const [id,who] of [['ch11.line.crow.01','crow'],['ch11.line.cat.03','cat'],['ch11.line.crow.04','crow'],['ch11.line.crow.07','crow']]){
 const row=locations[id];if(!row)throw Error(id);
 cues.push({id,who,key:row.ko,tier:0,weight:0,seconds:4,cooldown:99999,pairWho:'',pairKey:'',pairSeconds:0});
 entries.push({key:row.ko,number:row.num,texts:codes.map(c=>{if(!row[c])throw Error(id+'/'+c);return row[c];})});
}
const sourceCommit=cp.execFileSync('C:/Program Files/Git/cmd/git.exe',['-C',web,'rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim();
const data={sourceCommit,locationSource,codes,cues,entries};
if(require.main===module){fs.writeFileSync(path.join(root,'Assets/Exoduser/Resources/Data/pet_bubble.json'),JSON.stringify(data,null,2)+'\n');console.log('Existing pet copy imported: '+cues.length+' cues / '+entries.length+' keys x '+codes.length+' locales; GB1 automatic triggers held.');}
module.exports=data;
