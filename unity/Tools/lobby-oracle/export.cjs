const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=process.argv[2]||'G:/exoduser',read=p=>fs.readFileSync(path.join(root,p),'utf8'),hash=p=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');
const c={};vm.runInNewContext(read('world-intro-subtitles-data.js'),c);vm.runInNewContext(read('world-intro-player.js'),c);
const index=read('index.html'),data=c.WorldIntroSubtitleData;
const video=/<video\b[^>]*id="worldIntroVideo"[^>]*src="([^"]+)"/.exec(index),hold=/const _CIN_HOLD_DUR=(\d+)/.exec(index);
if(!video||!hold||!Array.isArray(c.WorldIntroPlayer.CUTS))throw Error('Intro source anchors missing');
const output={schema:'exoduser.unity.lobby.v1',sourceFiles:['index.html','world-intro-player.js','world-intro-subtitles-data.js','world-intro-subtitles.js'].map(p=>({path:p,sha256:hash(p)})),worldVideo:path.basename(video[1]),holdSeconds:+hold[1]/1000,cuts:Array.from(c.WorldIntroPlayer.CUTS),captions:Object.entries(data.languages).map(([code,texts])=>({code,cues:data.timings.map(([start,end],i)=>({start,end,text:texts[i]}))}))};
fs.mkdirSync(__dirname,{recursive:true});fs.writeFileSync(path.join(__dirname,'oracle.json'),JSON.stringify(output,null,2)+'\n');console.log(JSON.stringify({languages:output.captions.length,cues:output.captions[0].cues.length,cuts:output.cuts.length,sourceFiles:output.sourceFiles}));
