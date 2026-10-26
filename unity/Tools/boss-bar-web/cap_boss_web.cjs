// PC-A23: web #bossBar capture. Server: cwd G:/exoduser, PORT=3411 EXODUSER_SAVE_DIR=<out>/save. usage: NODE_PATH=G:/exoduser/node_modules node cap_boss_web.cjs
// Steady state, intro timeline (Web Animations API: animations paused at exact times), and forced poise/status states (forced values, recorded in the JSON).
const L = require('./lib_web_ref.cjs');
const KEYS = ['#bossBar', '#bossName', '.bhw', '#bossHpF', '.bpow', '#bossPoiseF', '#bossPoiseLbl', '#bossStatus', '#bossStatus .bst-i'];
(async () => {
  const h = await L.launch('boss');
  const { page, ev } = h; const log = { forced: [], intro: [] };
  log.boot = await L.boot(h, 'a23' + Date.now().toString(36));
  await ev(`closeAllPanels()`); await L.wait(500);
  log.enter = await ev(`(()=>{_enterBossArena();return {boss:!!findBoss(),stage:G.stage}})()`);
  await L.wait(600); await ev(`(()=>{P.iframes=99999})()`); await L.wait(4400);
  log.boss = await ev(`(()=>{const b=findBoss();return b?{hp:b.hp,mhp:b.mhp,poise:b.poise,maxPoise:b.maxPoise,name:$('bossName').textContent}:null})()`);
  await L.shot(h, 'a23_steady'); L.writeJson('a23_steady', await L.dump(h, KEYS, [], 12, 40));
  // intro timeline: restart the intro class, then pause every animation at t (CSS delays included in currentTime)
  for (const t of [0, 0.3, 0.6, 0.9, 1.2, 1.5, 1.9]) {
    const r = await ev(`(()=>{const bb=$('bossBar');bb.classList.remove('intro');void bb.offsetWidth;bb.classList.add('intro');
      const an=document.getAnimations().filter(a=>bb.contains(a.effect.target));an.forEach(a=>{a.pause();a.currentTime=${t * 1000}});
      const n=bb.querySelector('.bn'),w=bb.querySelector('.bhw'),cn=getComputedStyle(n),cw=getComputedStyle(w);
      return {t:${t},anims:an.length,name:{op:cn.opacity,ls:cn.letterSpacing,filter:cn.filter,w:n.getBoundingClientRect().width},bhw:{op:cw.opacity,tf:cw.transform}}})()`);
    log.intro.push(r); await L.wait(120); await L.shot(h, 'a23_intro_t' + Math.round(t * 1000));
  }
  await ev(`(()=>{const bb=$('bossBar');bb.classList.remove('intro');document.getAnimations().forEach(a=>{try{a.cancel()}catch(e){}})})()`);
  await L.wait(600);
  const state = async (name, js, note) => {
    await ev(`(()=>{const b=findBoss();${js}})()`); await L.wait(450);
    log.forced.push({ name, js, note }); await L.shot(h, 'a23_' + name); L.writeJson('a23_' + name, await L.dump(h, KEYS, [], 12, 40));
  };
  await state('hp62_poise40', `b.hp=Math.floor(b.mhp*.62);b.poise=b.maxPoise*.4;`, 'HP 62%, poise 40% (yellow tier) — forced');
  await state('hp25_poise20_status', `b.hp=Math.floor(b.mhp*.25);b.poise=b.maxPoise*.2;b.bleedT=300;b.bleedStk=2;b.poisonT=240;b.poisonStk=3;b.burnT=120;b.burnStk=1;b._shockT=90;b._shockStk=1;`, 'HP 25%, poise 20% (red tier), bleed 2 / poison 3 / burn 1 / shock 1 — forced');
  await state('groggy', `b.bleedT=0;b.poisonT=0;b.burnT=0;b._shockT=0;b.hp=Math.floor(b.mhp*.5);b.stunned=130;b._maxStunned=180;`, 'groggy 130/180 ticks — forced');
  await state('immune', `b.stunned=0;b._pImmune=210;`, 'charging 210/300 ticks — forced');
  log.pageerrors = h.errs; L.writeJson('_log_boss', log); await h.ctx.close(); console.log(JSON.stringify(log, null, 1));
})();
