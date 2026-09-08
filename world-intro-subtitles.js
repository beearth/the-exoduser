/* Native, seek-safe captions; never touches video/audio playback clocks. */
(function(root){
  'use strict';
  const data=root.WorldIntroSubtitleData,instances=new WeakMap();
  const tags={zht:'zh-Hant',zh:'zh-Hans',ptbr:'pt-BR',no:'nb'};
  function resolveLanguage(value){
    if(typeof value!=='string')return null;
    const raw=value.toLowerCase().replaceAll('_','-');
    if(/^zh-(?:tw|hk|mo|hant)(?:-|$)/.test(raw))return 'zht';
    if(raw==='ptbr'||raw==='pt'||raw.startsWith('pt-'))return 'ptbr';
    if(/^(?:nb|nn)(?:-|$)/.test(raw))return 'no';
    const code=raw.split('-')[0];
    return Object.hasOwn(data.languages,code)?code:null;
  }
  function normalizeLanguage(value){return resolveLanguage(value)||'en';}
  function attach(video){
    if(instances.has(video))return instances.get(video);
    const tracks=new Map();
    const api={
      setLanguage(value){
        const code=normalizeLanguage(value);
        let track=tracks.get(code);
        if(!track){
          track=video.addTextTrack('subtitles',code,tags[code]||code);
          track.mode='hidden';
          data.timings.forEach(([start,end],i)=>{
            const cue=new root.VTTCue(start,end,data.languages[code][i]);
            cue.id=String(i+1);cue.align='center';cue.size=84;
            cue.snapToLines=true;cue.line=-3;
            cue.position=50;cue.positionAlign='center';
            track.addCue(cue);
          });
          tracks.set(code,track);
        }
        tracks.forEach((t,k)=>{t.mode=k===code?'showing':'disabled';});
        video.dataset.subtitleLanguage=code;
        return code;
      },
      disable(){tracks.forEach(t=>{t.mode='disabled';});}
    };
    instances.set(video,api);return api;
  }
  root.WorldIntroSubtitles=Object.freeze({attach,resolveLanguage,normalizeLanguage});
})(globalThis);
