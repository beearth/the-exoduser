const fs=require('node:fs'),readline=require('node:readline'),vm=require('node:vm'),assert=require('node:assert/strict');
const arg=n=>process.argv.find(x=>x.startsWith(n+'='))?.slice(n.length+1);
(async()=>{
 const stream=fs.createReadStream(arg('--source-index'));let lines=[],collect=false,guards=[];
 for await(const line of readline.createInterface({input:stream,crlfDelay:Infinity})){
  if(line.includes('if(name.length<2||name.length>8)')||line.includes('if(/[<>'))guards.push(line);
  if(line.startsWith('const CHAR_VISUALS='))collect=true;
  if(collect){lines.push(line);if(line.trim()==='];')break;}
 }
 stream.destroy();assert.equal(guards.length,2);const context={};vm.runInNewContext('catalog='+lines.join('\n').split('=').slice(1).join('='),context,{timeout:1000});
 vm.runInNewContext('function validName(name){name=name.trim();let valid=true;function setStatus(){valid=false;}function _TL(x){return x;}function check(){'+guards.join('\n')+'}check();return valid;}',context,{timeout:1000});
 const observed=JSON.parse(fs.readFileSync(arg('--observed'),'utf8'));let checks=0;
 for(const row of observed.cases){assert.equal(row.ready,context.validName(row.name),JSON.stringify(row.name));checks++;}
 assert.deepEqual(observed.characters,Array.from(context.catalog,x=>x.name));checks++;
 assert.deepEqual(observed.available,Array.from(context.catalog,x=>!x.comingSoon));checks++;
 console.log('DEMO11_07_SOURCE_RESULT assertions='+checks+' failures=0');
})().catch(e=>{console.error('DEMO11_07_SOURCE_FAIL '+e.message);process.exitCode=1;});
