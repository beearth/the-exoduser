/* First-acquisition tutorials. Progress belongs to P and follows the character save. */
window._skillTutorial={
  current:null,phase:'read',deferred:new Set(),owner:null,library:false,
  state(){return P._skillTutorial||(P._skillTutorial={queue:[],done:[]})},
  snapshot(){return {skills:{...P.skills},passives:{...PASSIVES}}},
  record(before){
    if(!before||window._parryLesson?.active)return;
    for(const sk of SKILL_LIST)if(!(before.skills[sk.id]>0)&&P.skills[sk.id]>0)this.learned(sk.id);
    for(const pd of PASSIVE_DEF)if(!(before.passives[pd.key]>0)&&PASSIVES[pd.key]>0)this.learned('passive:'+pd.key);
  },
  learned(id){
    if(window._parryLesson?.active||!this.guide(id))return;
    const s=this.state();if(!s.done.includes(id)&&!s.queue.includes(id))s.queue.push(id);
  },
  serialize(){const s=this.state();return {queue:[...s.queue],done:[...s.done]}},
  restore(data){
    const clean=a=>Array.isArray(a)?[...new Set(a.filter(id=>typeof id==='string'&&this.guide(id)))]:[];
    const done=clean(data?.done);P._skillTutorial={done,queue:clean(data?.queue).filter(id=>!done.includes(id))};
    this.current=null;this.phase='read';this.deferred.clear();this.library=false;this.owner=P;this.seedNew=false;
  },
  owned(id){return id.startsWith('passive:')?PASSIVES[id.slice(8)]>0:P.skills[id]>0},
  text(ko,en){return typeof _L==='function'?_L(ko,en):ko},
  key(action,fallback){return keyName(BINDS[action]||fallback,true)},
  guide(id){
    const passive=id.startsWith('passive:');
    const sk=passive?PASSIVE_DEF.find(s=>s.key===id.slice(8)):_skById(id);
    if(!sk)return null;
    const title=this.text(sk.name,sk.nameEn||sk.name);
    const effect=this.text(sk.desc,sk.descEn||sk.desc);
    if(passive||id==='guardian')return {title,effect,mode:'explain',task:this.text('별도 키 없이 적용됩니다. 발동 조건과 효과를 확인하세요.','Applies automatically. Read its conditions and effects.')};
    const select=this.key('skillCycle','KeyL');
    let control='',task='';
    const special={
      bladeDash:['W / A / S / D',this.text('같은 이동 방향을 빠르게 두 번 눌러 전격이동하세요. MP와 기동게이지가 필요합니다.','Double-tap a movement direction to blink. Requires MP and mobility gauge.')],
      chargeBoost:[keyName('ShiftLeft',true),this.text('사슬을 발사해 이동하세요. 이동은 공용 기동게이지를 소비합니다.','Fire the chain and move. Movement consumes the shared mobility gauge.')],
      chainAssault:[keyName('ShiftLeft',true)+' → '+this.key('beam','mouse2'),this.text('사슬 이동 중 마법 공격을 눌러 화염폭발로 착지하세요.','During chain movement, press magic attack to land with a fire blast.')],
      chainSlam:[keyName('ShiftLeft',true)+' → '+this.key('shield','KeyE'),this.text('사슬 이동 중 불꽃칼날을 눌러 내려찍으세요.','During chain movement, press Flame Blade to slam down.')],
      chainSlash:[keyName('ShiftLeft',true)+' → '+this.key('weapon','mouse0'),this.text('사슬 이동 중 무기 공격을 눌러 전방을 베세요.','During chain movement, press weapon attack to slash forward.')],
      shieldThrow:[this.key('shield','KeyE'),this.text('불꽃칼날을 사용해 전방 충격파를 발동하세요.','Use Flame Blade to release its forward shockwave.')],
      execution:[keyName('KeyX',true),this.text('그로기 상태인 보스 가까이에서 처형하세요. 조건을 만족하지 못하면 발동하지 않습니다.','Execute a nearby groggy boss. It only activates when its conditions are met.')]
    };
    if(special[id]){[control,task]=special[id]}
    else{
      const family=Object.entries(SKILL_SLOT_DEFS).find(([name,d])=>name!=='tech'&&d.skills.includes(id));
      if(family){
        const group=family[0],actions={lmb:['weapon','mouse0'],rmb:['shield','KeyE'],magic:['beam','mouse2'],q:['parry','KeyQ'],charge:[null,'ShiftLeft'],ct:[null,'ControlLeft'],bow:[null,'KeyT']};
        const [action,fallback]=actions[group]||[null,'KeyL'];
        control=action?this.key(action,fallback):keyName(fallback,true);
        task=this.text(`[${select}] 스킬 선택에서 ${title}을 선택한 뒤 [${control}]로 사용하세요.`,`Select ${title} in [${select}], then use [${control}].`);
      }else{
        const slot=SKILL_SLOTS.indexOf(id);
        control=id==='execution'?keyName('KeyX',true):sk.ult?keyName('KeyZ',true):slot>=0?keyName(slot<4?'Digit'+(slot+1):slot===4?'Space':'KeyF',true):sk.cat==='tech'?keyName('KeyF',true):sk.cat==='rage'?keyName('Space',true):'1–4';
        task=this.text(`[${select}]에서 ${title}을 [${control}] 슬롯에 배정하고 사용하세요.`,`Assign ${title} to [${control}] in [${select}], then use it.`);
      }
    }
    const extra={
      whirlwind:['공격을 길게 눌러 회전참을 발동하세요.','Hold attack to spin.'],
      detonate:['보호막을 유지해 힘을 모은 뒤 해제하세요.','Hold the shield to gather power, then release.'],
      peaceShield:['보호막을 길게 눌러 회복 효과를 확인하세요.','Hold the shield to see its healing effect.'],
      iceOrb:['재입력하면 얼음을 파쇄합니다.','Press again to shatter the ice.'],
      ghostWalk:['이동하며 적과 탄막을 통과하고, 재입력으로 종료할 수 있습니다.','Move through enemies and projectiles; press again to end.'],
      timeWarp:['먼저 이동한 뒤 사용해 이전 위치로 돌아가세요.','Move first, then activate to return to an earlier position.'],
      holyDome:['설치한 영역 안에 머물러 자원 회복을 확인하세요.','Stay in the domain to recover resources.'],
      iceStorm:['키로 조준한 뒤 좌클릭으로 설치하세요. 취소는 완료로 인정하지 않습니다.','Aim with the skill key, then left-click to place. Canceling does not complete practice.'],
      thunderStake:['키로 조준한 뒤 좌클릭으로 설치하세요. 가까운 창끼리 전류가 연결됩니다.','Aim, then left-click to plant. Nearby stakes connect with lightning.'],
      maliceStorm:['키로 조준한 뒤 좌클릭으로 설치하세요.','Aim with the skill key, then left-click to place.'],
      maliceMortar:['키로 조준한 뒤 좌클릭으로 폭풍을 발사하세요.','Aim with the skill key, then left-click to launch the storm.'],
      hellRay:['조준한 뒤 좌클릭으로 쐐기를 설치하세요.','Aim, then left-click to place the wedge.'],
      fireBeam:['충전을 시작하고 재입력해 발사하세요.','Start charging, then press again to fire.'],
      burstLoop:['길게 눌러 충전한 뒤 폭발을 발동하세요.','Hold to charge, then release the explosion.'],
      arcLaser:['길게 눌러 냉기빔을 유지하세요.','Hold to channel the ice beam.'],
      voidScarecrow:['설치 후 탄막을 흡수시키고 재입력으로 회수할 수 있습니다.','After placement, absorb projectiles and press again to recall.'],
      explodeScarecrow:['설치 후 탄막을 흡수시키고 재입력하면 폭발합니다.','After placement, absorb projectiles and press again to detonate.'],
      ancestorSummon:['유골함과 도감의 완성된 전대가 필요합니다. 재입력하면 회수합니다.','Requires an ossuary and a completed ancestor collection. Press again to recall.'],
      ghostXbowTurret:['설치 후 재입력하면 이동식으로 돌아갑니다.','Press again after deploying to return to mobile mode.']
    };
    if(extra[id])task+=' '+this.text(...extra[id]);
    if(_isAbsorbed(id))task+=' '+this.text('합체에 통합되어 있습니다. L에서 해당 합체를 선택해 사용하세요.','Integrated into a fusion. Select and use the corresponding fusion in L.');
    return {title,effect,mode:'practice',control,task};
  },
  available(){return G.on&&P.hp>0&&!G.paused&&!G._intro&&!window._parryLesson?.active},
  tick(){
    if(this.owner!==P){this.owner=P;this.current=null;this.phase='read';this.deferred.clear();this.library=false;this.seedNew=!P._skillTutorial&&P.lv===1}
    if(!this.available()){if(this.panel)this.panel.hidden=true;if(this.launcher)this.launcher.hidden=true;return}
    if(this.seedNew){this.seedNew=false;this.record({skills:{},passives:{}});dbSaveNow()}
    const s=this.state();
    if(this.current&&!this.owned(this.current)){this.current=null;this.phase='read'}
    if(!this.current&&!this.library){this.current=s.queue.find(id=>this.owned(id)&&!this.deferred.has(id))||null;this.phase='read'}
    this.ensureUI();this.launcher.hidden=false;this.panel.hidden=!this.current&&!this.library;
    const stamp=(this.current||'')+'|'+this.phase+'|'+this.library+'|'+s.queue.length;
    this.refresh=(this.refresh||0)+1;
    if(this.lastStamp!==stamp||this.refresh%15===0){this.lastStamp=stamp;this.render()}
  },
  begin(){if(this.current&&this.phase==='read'&&this.available()&&this.guide(this.current).mode==='practice'){this.phase='practice';this.render()}},
  used(id,committed=false){
    if(!this.current||this.phase!=='practice'||!this.available())return;
    // These dispatchers also award proficiency on failed attempts or charge start.
    // Wait for their actual successful cast/explosion hook.
    if(!committed&&['venomBlade','maliceHunt','ltnChaser','timeWarp','burstLoop'].includes(id))return;
    const aiming={iceStorm:'_isAiming',maliceStorm:'_msAiming',maliceMortar:'_mmAiming',thunderStake:'_tsAiming',hellRay:'_hrAiming',boneWall:'_bwAiming'};
    if(aiming[id]&&P[aiming[id]])return;
    if(id!==this.current){
      // Absorbed skills are practiced through their actual, currently selected fusion host.
      if(!_isAbsorbed(this.current)||!this.fusionContains(id,this.current))return;
    }
    this.complete();
  },
  fusionContains(host,id){
    if(typeof _FUSE_PAIRS==='undefined')return false;
    const hosts={whirlDet:'whirlwind',slamStorm:'whirlwind',stormBeam:'whirlwind',stormBurst:'whirlwind',dimBreach:'chargeBoost',dimSlam:'chargeBoost',dimThunder:'chargeBoost',dimRush:'chargeBoost',dimBlast:'chargeBoost',sixFuse:'fanShot',elemFuse:'omniBeam',bladeFuse:'maliceHunt',plagueFuse:'maliceHunt',plagueVenom:'maliceHunt',iceMortar:'maliceMortar',boneStorm:'maliceStorm',elecRepent:'maliceStorm',shieldFuse:'maliceSwipe',pillarSlam:'giantSlam2',pillarSpike:'darkPillar',holyFuse:'holyDome',holyIce:'holyDome',holyWeak1:'holyDome',holyWeak2:'holyDome',holyWeak3:'holyDome',holyWeak4:'holyDome',siegeGhost:'ghostXbowTurret',dualScarecrow:'voidScarecrow',thunderGhost:'bladeDash',timeStep:'timeWarp',infernoSlam:'giantSlam2'};
    return Object.entries(_FUSE_PAIRS).some(([key,ids])=>P._fused?.[key]&&hosts[key]===host&&ids.includes(id));
  },
  confirm(){if(this.current&&this.available()&&this.guide(this.current).mode==='explain')this.complete()},
  complete(){const s=this.state();if(!s.done.includes(this.current))s.done.push(this.current);s.queue=s.queue.filter(id=>id!==this.current);this.phase='success';dbSaveNow();this.render()},
  next(){this.current=null;this.phase='read';this.tick()},
  defer(){if(this.current&&this.phase!=='success')this.deferred.add(this.current);this.current=null;this.library=false;this.phase='read';this.tick()},
  replay(id){if(!this.owned(id))return;this.deferred.delete(id);this.current=id;this.phase='read';this.library=false;this.tick()},
  node(tag,text){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n},
  ensureUI(){
    if(this.panel)return;
    this.panel=this.node('section');this.panel.id='skillTutorial';this.panel.setAttribute('aria-label','스킬별 튜토리얼');
    this.heading=this.node('h2');this.effect=this.node('p');this.task=this.node('p');this.status=this.node('p');this.status.setAttribute('aria-live','polite');
    this.primary=this.node('button');this.primary.type='button';this.primary.onclick=()=>{if(this.phase==='success')this.next();else if(this.guide(this.current)?.mode==='explain')this.confirm();else this.begin()};
    this.later=this.node('button',this.text('나중에','Later'));this.later.type='button';this.later.onclick=()=>this.defer();
    this.list=this.node('div');this.list.className='skill-tutorial-list';
    this.panel.append(this.heading,this.effect,this.task,this.status,this.primary,this.later,this.list);
    this.launcher=this.node('button',this.text('스킬 연습','Skill practice'));this.launcher.id='skillTutorialLauncher';this.launcher.type='button';
    this.launcher.onclick=()=>{this.library=!this.library;if(this.library)this.current=null;this.deferred.clear();this.tick()};
    // Consume clicks on tutorial controls before they reach the game canvas input.
    for(const el of [this.panel,this.launcher])for(const type of ['pointerdown','mousedown','mouseup','click','contextmenu'])el.addEventListener(type,e=>e.stopPropagation());
    document.body.append(this.panel,this.launcher);
    document.addEventListener('keydown',e=>{if(!e.repeat&&['KeyW','KeyA','KeyS','KeyD'].includes(e.code)&&!['INPUT','TEXTAREA','SELECT','BUTTON'].includes(e.target?.tagName))this.begin()});
  },
  setText(el,text){if(el.textContent!==text)el.textContent=text},
  render(){
    if(!this.panel)return;
    const s=this.state();this.setText(this.launcher,this.text('스킬 연습','Skill practice')+(s.queue.length?' · '+s.queue.length:''));
    this.list.hidden=!this.library;
    for(const n of [this.effect,this.task,this.status,this.primary,this.later])n.hidden=this.library;
    if(this.library){
      this.setText(this.heading,this.text('배운 스킬 다시 연습','Practice learned skills'));
      const ids=[...SKILL_LIST.filter(sk=>this.owned(sk.id)).map(sk=>sk.id),...PASSIVE_DEF.filter(pd=>PASSIVES[pd.key]>0).map(pd=>'passive:'+pd.key)];
      const signature=ids.join('|')+';'+s.done.join('|');
      if(this.listSignature!==signature){this.listSignature=signature;this.list.replaceChildren(...ids.map(id=>{const b=this.node('button',(s.done.includes(id)?'✓ ':'')+this.guide(id).title);b.type='button';b.onclick=()=>this.replay(id);return b}))}
      return;
    }
    if(!this.current)return;
    const g=this.guide(this.current);
    this.setText(this.heading,g.title+' · '+this.text('튜토리얼','Tutorial'));
    this.setText(this.effect,g.effect);this.setText(this.task,g.task);
    this.setText(this.status,this.phase==='success'?this.text('완료!','Complete!'):g.mode==='explain'?this.text('효과를 확인하고 다음으로 진행하세요.','Read the effect, then continue.'):this.phase==='practice'?this.text('실제로 발동하면 완료됩니다. 자원·쿨다운·대상 조건을 확인하세요.','Activate successfully to complete. Check resources, cooldown and target conditions.'):this.text('W / A / S / D 또는 시작 버튼으로 실습을 시작하세요.','Press W / A / S / D or Start to practice.'));
    this.setText(this.primary,this.phase==='success'?this.text('다음','Next'):g.mode==='explain'?this.text('효과 확인','Understood'):this.text('연습 시작','Start practice'));
    this.primary.hidden=this.phase==='practice';this.later.hidden=this.phase==='success';
  }
};
