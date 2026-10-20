// Read only the three bounded literal blocks, never evaluate the application.
const fs=require('node:fs'),readline=require('node:readline'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const arg=name=>process.argv.find(x=>x.startsWith(name+'='))?.slice(name.length+1);
(async()=>{
 const root=arg('--source-root'),target=arg('--catalog');assert(root&&target);
 async function literal(file,name){let collecting=false,lines=[],start=0,end=0,n=0;const input=fs.createReadStream(path.join(root,file));
 for await(const line of readline.createInterface({input,crlfDelay:Infinity})){n++;if(!collecting&&line.startsWith('const '+name+'=')){collecting=true;start=n;}if(collecting){lines.push(line);if(['};','];'].includes(line.trim())){end=n;break;}}}
 input.destroy();assert(end>start);const c={};vm.runInNewContext('result='+lines.join('\n').split('=').slice(1).join('='),c,{timeout:1000});return JSON.parse(JSON.stringify(c.result));}
 const world=await literal('index.html','CIN_LINES'),war=await literal('game.html','PROLOGUE_LINES'),intro=await literal('game.html','INTRO_CUTSCENE_LINES');
 const images={};for await(const line of readline.createInterface({input:fs.createReadStream(path.join(root,'index.html')),crlfDelay:Infinity})){const m=line.match(/id="cinImg(\d+)".*?(?:data-src|src)="([^"]+)"/);if(m)images[+m[1]-1]=m[2].split('?')[0];}
 const data=JSON.parse(fs.readFileSync(target,'utf8'));let count=0,previous='';const check=(a,b)=>{assert.deepEqual(a,b);count++;};
 check(data.segments.map(x=>x.id),['world','warrior','intro']);check(data.segments[0].duration,Math.round(world.at(-1).v*1000));
 const wc=world.filter(x=>!x.exit);check(data.segments[0].cues.length,wc.length);
 wc.forEach((x,i)=>{if(x.img!==undefined)previous=images[x.img]||'';const c=data.segments[0].cues[i];check([c.text,c.en,c.t,c.dur,c.asset],[x.text||'',x.en||'',Math.round(x.v*1000),x.dur,previous]);});
 for(const [i,source] of [[1,war],[2,intro]]){const s=data.segments[i],en=Object.fromEntries(source.en.map(x=>[x.id,x]));check(s.cues.length,source.ko.length);source.ko.forEach((x,j)=>{const c=s.cues[j],asset=x.img?(x.img.includes('/')?'assets/cutscene/'+x.img:'assets/cutscene/images/'+x.img):'';check([c.id,c.text,c.en,c.t,c.dur,c.asset],[x.id,x.text||'',en[x.id]?.text??x.text,x.t,x.dur,asset]);});check(s.duration,Math.max(...source.ko.map(x=>x.t+x.dur)));}
 for(const s of data.segments)for(const c of s.cues)if(c.asset)check(fs.existsSync(path.join(root,c.asset)),true);
 console.log('DEMO11_08_SOURCE_RESULT assertions='+count+' failures=0');
})().catch(e=>{console.error('DEMO11_08_SOURCE_FAIL '+e.message);process.exitCode=1;});
