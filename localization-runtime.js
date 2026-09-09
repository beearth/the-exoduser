/* Language identity, parameterized UI text and canonical character captions. */
(function(root){
  'use strict';
  const languages=Object.freeze('ko en zh zht ja es fr de ru ptbr it vi th id tr pl cs hu bg el fi sv da no nl ro uk ar ms'.split(' '));
  const steam={koreana:'ko',english:'en',schinese:'zh',tchinese:'zht',japanese:'ja',spanish:'es',latam:'es',french:'fr',german:'de',russian:'ru',portuguese:'ptbr',brazilian:'ptbr',brazilianportuguese:'ptbr',italian:'it',vietnamese:'vi',thai:'th',indonesian:'id',malay:'ms',turkish:'tr',polish:'pl',czech:'cs',hungarian:'hu',bulgarian:'bg',greek:'el',finnish:'fi',swedish:'sv',danish:'da',norwegian:'no',dutch:'nl',romanian:'ro',ukrainian:'uk',arabic:'ar'};
  const tags={zh:'zh-Hans',zht:'zh-Hant',ptbr:'pt-BR',no:'nb'};
  const stories=new WeakMap();
  function resolveLanguage(value){
    if(typeof value!=='string')return null;
    const raw=value.trim().toLowerCase().replaceAll('_','-');
    if(Object.hasOwn(steam,raw))return steam[raw];
    if(/^zh-(?:tw|hk|mo|hant)(?:-|$)/.test(raw))return 'zht';
    if(raw==='pt'||raw==='ptbr'||raw.startsWith('pt-'))return 'ptbr';
    if(/^(?:nb|nn)(?:-|$)/.test(raw))return 'no';
    const code=raw.split('-')[0];return languages.includes(code)?code:null;
  }
  function format(text,values){
    if(!values)return text;
    return text.replace(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/g,(token,key)=>Object.hasOwn(values,key)?String(values[key]):token);
  }
  function localizeStory(source,locale,sequence){
    if(!locale||!locale[sequence])return source;
    let byLocale=stories.get(source);if(!byLocale){byLocale=new WeakMap();stories.set(source,byLocale);}
    let bySequence=byLocale.get(locale);if(!bySequence){bySequence=new Map();byLocale.set(locale,bySequence);}
    if(!bySequence.has(sequence))bySequence.set(sequence,source.map(cue=>{
      const text=locale[sequence][String(cue.id)];
      return typeof text==='string'?{...cue,text}:cue;
    }));
    return bySequence.get(sequence);
  }
  function applyDocumentLanguage(doc,value){
    const code=resolveLanguage(value)||'en';
    doc.documentElement.lang=tags[code]||code;
    doc.documentElement.dir=code==='ar'?'rtl':'ltr';
    return code;
  }
  function wrapText(text,width,measure,language){
    const code=resolveLanguage(language)||'en',tag=tags[code]||code;
    const words=typeof Intl.Segmenter==='function'?new Intl.Segmenter(tag,{granularity:'word'}):null;
    const graphemes=typeof Intl.Segmenter==='function'?new Intl.Segmenter(tag,{granularity:'grapheme'}):null;
    const lines=[];
    for(const paragraph of text.split('\n')){
      let line='';
      const tokens=words?Array.from(words.segment(paragraph),part=>part.segment):paragraph.split(/(\s+)/);
      for(const token of tokens){
        if(measure(line+token)<=width){line+=token;continue;}
        if(line.trim()){lines.push(line.trimEnd());line='';}
        const next=token.trimStart();
        if(measure(next)<=width){line=next;continue;}
        const chars=graphemes?Array.from(graphemes.segment(next),part=>part.segment):Array.from(next);
        for(const char of chars){if(line&&measure(line+char)>width){lines.push(line);line='';}line+=char;}
      }
      if(line||!paragraph)lines.push(line.trimEnd());
    }
    return lines;
  }
  root.ExoduserI18n=Object.freeze({languages,resolveLanguage,format,localizeStory,applyDocumentLanguage,wrapText});
})(globalThis);
