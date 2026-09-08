/* Character growth presentation; gameplay data stays in game.html. */
(function (global) {
  'use strict';
  const COSTS = [1, 1, 1, 2, 2, 2, 3, 3, 3, 5];
  const OFFENSE = new Set(['pAtk','pCharge','pParry','pMagic','pBow','pCrit','pPierce','pMelee','pCombo','pAbund','pPred','pDot','pXbow','pHunter','pRage']);
  const rankCost = rank => COSTS[rank] || 5;
  function statChange(value, max, points, amount) {
    if (!Number.isInteger(amount) || !amount || value + amount < 0 || value + amount > max || points - amount < 0) return null;
    return {value: value + amount, points: points - amount};
  }
  function passiveChange(value, max, points, amount) {
    if (amount !== 1 && amount !== -1) return null;
    const next = value + amount;
    const balance = points - (amount > 0 ? rankCost(value) : -rankCost(next));
    return next < 0 || next > max || balance < 0 ? null : {value: next, points: balance};
  }
  function refundTotals(stats, passives, grit) {
    const sp = Object.values(stats).reduce((sum, value) => sum + value, grit);
    const ap = Object.values(passives).reduce((sum, level) => {
      for (let rank = 0; rank < level; rank++) sum += rankCost(rank);
      return sum;
    }, 0);
    return {sp, ap};
  }
  function mount(api) {
    const root = api.root, doc = root.ownerDocument, t = api.text;
    const $ = id => root.querySelector('#' + id);
    const el = (tag, cls, text) => {
      const node = doc.createElement(tag);
      if (cls) node.className = cls;
      if (text !== undefined) node.textContent = text;
      return node;
    };
    const set = (id, value) => { $(id).textContent = value; };
    const name = def => api.strip(t(def.name, def.nameEn || def.name));
    const desc = def => t(def.desc, def.descEn || def.desc);
    const icon = (key, size = 24) => {
      const node = el('span', 'growth-glyph');
      // A fresh, detached leaf receives only trusted built-in SVG markup.
      node.innerHTML = api.icon(key, '#cdb386', size);
      node.setAttribute('aria-hidden', 'true');
      return node;
    };
    const button = (label, cls, action, focus) => {
      const node = el('button', cls, label);
      node.type = 'button'; node.onclick = action;
      if (focus) node.dataset.focus = focus;
      return node;
    };
    let selected = api.passiveDefs[0].key, filter = 'all', amount = 1;
    const filters = [['all','전체','All'],['offense','공격','Offense'],['support','보조','Support'],['learned','습득','Learned']];
    const search = $('growthSearch');
    search.addEventListener('input', render);
    // Native focus/activation keys stay in this dialog. J/ESC and panel shortcuts still bubble.
    for (const event of ['keydown','keyup']) root.addEventListener(event, e => {
      if (e.key === 'Tab' || (e.target.closest('button') && (e.key === ' ' || e.key === 'Enter'))) e.stopPropagation();
    });
    // Typing J/K/G/Space in search must never trigger game hotkeys.
    for (const event of ['keydown','keyup']) search.addEventListener(event, e => {
      e.stopPropagation();
      if (event === 'keydown' && e.key === 'Escape') { e.preventDefault(); search.blur(); }
    });
    function render() {
      const state = api.state(), focus = doc.activeElement?.dataset.focus;
      const scroll = [$('statGrid').scrollTop, $('passiveGrid').scrollTop, $('growthDetail').scrollTop];
      set('growthKicker', t('지옥의 길 · 캐릭터 성장', 'HELL ROAD / CHARACTER GROWTH'));
      set('growthTitle', t('능력치와 패시브', 'Attributes & Passives'));
      set('growthSubtitle', t('살아남는 방식은, 당신이 정한다.', 'Choose how you survive.'));
      set('growthSPLabel', t('투자 가능 SP', 'AVAILABLE SP')); set('spRemain', state.sp);
      set('growthAPLabel', t('투자 가능 AP', 'AVAILABLE AP')); set('apRemain', state.ap);
      set('growthAttributesTitle', t('기본 능력치', 'Attributes'));
      set('growthAttributesNote', t('1포인트당 1 SP · 투자량 기준', '1 SP per point · Allocated values'));
      set('growthPassivesTitle', t('패시브', 'Passives'));
      set('growthDetailLabel', t('선택한 패시브', 'SELECTED PASSIVE'));
      set('growthFooterNote', t('투자는 즉시 적용됩니다. 사용한 포인트는 언제든 환불할 수 있습니다.', 'Changes apply immediately. Spent points can be refunded at any time.'));
      set('statResetBtn', t('전체 초기화', 'Reset all'));
      set('statClose', t('닫기 [J]', 'Close [J]'));
      set('smToggleBtn', t('전투 능력치 보기', 'Combat stats'));
      set('growthSummaryClose', t('닫기', 'Close'));
      set('growthSummaryTitle', t('전투 능력치', 'Combat stats'));
      search.placeholder = t('패시브 이름·효과 검색', 'Search name or effect');
      search.setAttribute('aria-label', search.placeholder);
      const metrics = doc.createDocumentFragment();
      for (const [label, value] of [['HP',state.hp],['ST',state.st],['MP',state.mp]]) {
        const metric = el('div','growth-metric');
        metric.append(el('span','',label),el('strong','',Number(value || 0).toLocaleString())); metrics.append(metric);
      }
      $('growthMetrics').replaceChildren(metrics);
      $('growthAmount').replaceChildren(...[1,10].map(n => {
        const b = button('×' + n, 'growth-amount-btn', () => {amount=n;render();}, 'amount-' + n);
        b.setAttribute('aria-pressed', String(amount === n));
        b.setAttribute('aria-label',t(`한 번에 ${n}포인트 투자 또는 환불`,`Allocate or refund ${n} points at a time`));
        return b;
      }));
      const stats = doc.createDocumentFragment();
      const defs = [...api.statDefs, {key:'grit',name:'근성 (GRIT)',nameEn:'GRIT',desc:'MAX HP / MP / ST 각각 +1, 물리·속성 방어 +0.5',descEn:'MAX HP / MP / ST +1 each, DEF / eDEF +0.5'}];
      for (const def of defs) {
        const value = def.key === 'grit' ? state.grit : state.stats[def.key] || 0;
        const max = def.key === 'grit' ? Infinity : api.caps[def.key];
        const row = el('article','growth-stat'); row.dataset.stat = def.key;
        row.title = name(def) + ' · ' + (max === Infinity ? t('상한 없음','No cap') : t(`투자 상한 ${max}`,`Allocation cap ${max}`));
        const head = el('div','growth-stat-head');
        head.append(icon(def.key,22),el('h3','',name(def)),el('strong','growth-stat-value',value.toLocaleString()));
        const controls = el('div','growth-stat-controls');
        controls.append(el('span','growth-stat-cap',max === Infinity ? t('제한 없음','Uncapped') : `${value} / ${max}`));
        for (const direction of [-1,1]) {
          const n = direction * amount;
          const b = button((n > 0 ? '+' : '−') + amount, 'growth-step', () => api.changeStat(def.key,n), def.key + '-' + direction);
          b.disabled = !statChange(value,max,state.sp,n);
          b.setAttribute('aria-label',name(def) + ' ' + t(n > 0 ? `${amount} 투자` : `${amount} 환불`, n > 0 ? `add ${amount}` : `refund ${amount}`));
          controls.append(b);
        }
        row.append(head,el('p','growth-stat-desc',desc(def)),controls); stats.append(row);
      }
      $('statGrid').replaceChildren(stats);
      $('growthFilters').replaceChildren(...filters.map(([key,ko,en]) => {
        const b=button(t(ko,en),'growth-filter',()=>{filter=key;render();},'filter-'+key);
        b.setAttribute('aria-pressed',String(filter===key));return b;
      }));
      const query=search.value.trim().toLocaleLowerCase();
      const all=api.passiveDefs.slice().sort((a,b)=>Number(OFFENSE.has(b.key))-Number(OFFENSE.has(a.key)));
      const visible=all.filter(def => (filter==='all' || filter==='offense'&&OFFENSE.has(def.key) || filter==='support'&&!OFFENSE.has(def.key) || filter==='learned'&&state.passives[def.key]>0) && (!query || [name(def),desc(def),def.nameEn,def.key].join(' ').toLocaleLowerCase().includes(query)));
      set('growthCount',`${visible.length} / ${all.length}`);
      const cards=doc.createDocumentFragment();
      for(const def of visible) {
        const value=state.passives[def.key]||0;
        const card=button(undefined,'growth-passive',()=>{selected=def.key;$('growthDetail').scrollTop=0;render();},'passive-'+def.key);
        card.dataset.passive=def.key; card.setAttribute('aria-pressed',String(selected===def.key));
        const top=el('span','growth-card-top');
        top.append(icon(def.key,26),el('span','growth-card-type',OFFENSE.has(def.key)?t('공격','OFFENSE'):t('보조','SUPPORT')));
        const bottom=el('span','growth-card-bottom');
        bottom.append(el('span','growth-card-rank',`Lv. ${String(value).padStart(2,'0')} / ${def.max}`),el('span','growth-card-cost',value>=def.max?'MAX':`${rankCost(value)} AP`));
        const bar=el('span','growth-card-bar'),fill=el('span'); fill.style.width=Math.min(100,value/def.max*100)+'%';bar.append(fill);
        card.append(top,el('strong','growth-card-name',name(def)),el('span','growth-card-desc',desc(def)),bottom,bar);
        card.title=name(def);cards.append(card);
      }
      if(!visible.length) cards.append(el('p','growth-empty',t('조건에 맞는 패시브가 없습니다.','No passives match your search.')));
      $('passiveGrid').replaceChildren(cards);
      const def=api.passiveDefs.find(d=>d.key===selected)||api.passiveDefs[0],value=state.passives[def.key]||0;
      const detail=doc.createDocumentFragment(),hero=el('div','growth-detail-hero');
      hero.append(icon(def.key,62),el('span','growth-detail-category',OFFENSE.has(def.key)?t('공격 패시브','OFFENSE PASSIVE'):t('보조 패시브','SUPPORT PASSIVE')));
      detail.append(hero,el('h2','growth-detail-name',name(def)));
      const ranks=el('div','growth-rank-transition');
      ranks.append(el('span','',t('현재 레벨','Current rank')),el('strong','',String(value)),el('span','growth-rank-arrow','→'),el('strong','growth-rank-next',value>=def.max?'MAX':String(value+1)));
      detail.append(ranks);
      const pips=el('div','growth-rank-pips');
      for(let i=0;i<def.max;i++) pips.append(el('span',i<value?'filled':''));
      pips.setAttribute('aria-label',`${value} / ${def.max}`); detail.append(pips);
      detail.append(el('h3','growth-effect-label',t('레벨당 효과','EFFECT PER RANK')),el('p','growth-effect',desc(def)));
      detail.append(el('p','growth-detail-note',t('효과 설명의 상한과 발동 조건이 적용됩니다.','Effect caps and activation conditions in the description apply.')));
      $('growthDetail').replaceChildren(detail);
      const maxed=value>=def.max, cost=rankCost(value), canBuy=!maxed&&state.ap>=cost;
      const upgrade=$('growthUpgrade'), refund=$('growthRefund');
      upgrade.disabled=!canBuy;
      upgrade.textContent=maxed?t('최대 레벨 달성','Maximum rank'):t(`강화하기 · ${cost} AP`,`Upgrade · ${cost} AP`);
      upgrade.onclick=()=>api.changePassive(def.key,1);
      refund.disabled=value<1;
      refund.textContent=t(`1레벨 환불${value?' · +'+rankCost(value-1)+' AP':''}`,`Refund 1 rank${value?' · +'+rankCost(value-1)+' AP':''}`);
      refund.onclick=()=>api.changePassive(def.key,-1);
      set('growthUpgradeNote',maxed?t('모든 레벨을 습득했습니다.','All ranks learned.'):canBuy?t(`강화 후 남은 AP ${state.ap-cost}`,`${state.ap-cost} AP remaining after upgrade`):t(`AP ${cost-state.ap}이 더 필요합니다.`,`${cost-state.ap} more AP needed.`));
      if(focus) {
        const target=Array.from(root.querySelectorAll('[data-focus]')).find(n=>n.dataset.focus===focus);
        if(target&&!target.disabled)target.focus({preventScroll:true});
      }
      $('statGrid').scrollTop=scroll[0];$('passiveGrid').scrollTop=scroll[1];$('growthDetail').scrollTop=scroll[2];
    }
    return {render};
  }
  global.ExoduserStatsPanel = {mount, statChange, passiveChange, refundTotals, rankCost};
})(globalThis);
