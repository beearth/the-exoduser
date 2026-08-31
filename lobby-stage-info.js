(function(root){
  'use strict';

  const CHAPTERS=Object.freeze([
    Object.freeze({chapter:1,name:'썩은 숲',stages:4,startStage:0}),
    Object.freeze({chapter:2,name:'벌레굴',stages:6,startStage:4}),
    Object.freeze({chapter:3,name:'지옥의 겨울',stages:4,startStage:10}),
    Object.freeze({chapter:4,name:'고통의 화염지대',stages:7,startStage:14}),
    Object.freeze({chapter:5,name:'지옥의 군단',stages:5,startStage:21}),
    Object.freeze({chapter:6,name:'사도의 마굴',stages:6,startStage:26}),
    Object.freeze({chapter:7,name:'지옥성',stages:3,startStage:32}),
  ]);
  const LAST_STAGE=CHAPTERS.at(-1).startStage+CHAPTERS.at(-1).stages-1;

  function normalizeStage(value){
    const stage=Number(value);
    if(!Number.isFinite(stage))return 0;
    return Math.min(LAST_STAGE,Math.max(0,Math.trunc(stage)));
  }

  function getProgress(value){
    const stage=normalizeStage(value);
    const chapter=CHAPTERS.find(ch=>stage>=ch.startStage&&stage<ch.startStage+ch.stages)||CHAPTERS[0];
    return {
      stage,
      chapter:chapter.chapter,
      name:chapter.name,
      floor:stage-chapter.startStage+1,
    };
  }

  function formatProgress(value,translate){
    const info=getProgress(value);
    const t=typeof translate==='function'?translate:text=>text;
    return info.chapter+t('장')+' '+t(info.name)+' '+info.floor+t('층');
  }

  const api=Object.freeze({CHAPTERS,getProgress,formatProgress});
  root.LOBBY_STAGE_INFO=api;
  root._formatLobbyStageProgress=formatProgress;
})(globalThis);
