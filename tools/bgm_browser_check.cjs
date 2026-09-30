// S-02: Chromium(게임과 같은 엔진)에서 BGM 파일 로드·디코드 측정. 사용: node server.cjs 실행 후
// PW=$(npm root -g)/playwright node tools/bgm_browser_check.cjs '["bgm/…wav","audio_review/S-02/…mp3"]'
// 관리: docs/6사운드디자인/SOUND_TEAM_LEAD.md (S-02)
const {chromium}=require(process.env.PW);
const files=JSON.parse(process.argv[2]);
(async()=>{
  const b=await chromium.launch({executablePath:process.env.CHROMIUM||undefined,args:['--autoplay-policy=no-user-gesture-required']});
  const p=await b.newPage();
  await p.goto('http://localhost:3333/__blank_s02__').catch(()=>{});
  const res=[];
  for(const f of files){
    const r=await p.evaluate(async(f)=>{
      const url='http://localhost:3333/'+f.split('/').map(encodeURIComponent).join('/');
      const out={file:f};
      // 1) HTMLAudio path used by BGM._getAudio: time to canplay / canplaythrough, reported duration
      await new Promise(res=>{const a=new Audio();const t0=performance.now();a.preload='auto';
        a.oncanplay=()=>{out.canplay_ms=Math.round(performance.now()-t0)};
        a.oncanplaythrough=()=>{out.canplaythrough_ms=Math.round(performance.now()-t0);out.media_duration=+a.duration.toFixed(3);res()};
        a.onerror=()=>{out.media_error=a.error&&a.error.code;res()};setTimeout(res,60000);a.src=url;});
      // 2) Full decode in Chromium: sample count + leading/trailing silence at 48 kHz
      try{const ab=await (await fetch(url)).arrayBuffer();out.bytes=ab.byteLength;
        const ctx=new OfflineAudioContext(2,48000,48000);const t1=performance.now();
        const buf=await ctx.decodeAudioData(ab);out.decode_ms=Math.round(performance.now()-t1);
        out.decoded_samples=buf.length;out.decoded_mb_f32=+(buf.length*buf.numberOfChannels*4/1e6).toFixed(1);
        const d=buf.getChannelData(0),th=0.001;let i=0;while(i<d.length&&Math.abs(d[i])<th)i++;let j=d.length-1;while(j>0&&Math.abs(d[j])<th)j--;
        out.lead_ms=+(i/48).toFixed(1);out.trail_ms=+((d.length-1-j)/48).toFixed(1);
      }catch(e){out.decode_error=String(e)}
      return out;
    },f);
    console.log(JSON.stringify(r));
  }
  await b.close();
})();
