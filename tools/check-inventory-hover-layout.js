// Run in an isolated game.html browser tab with a populated inventory open.
// Does not equip, salvage, save, or change inventory contents.
(function checkInventoryHoverLayout(){
  const grid=document.getElementById('invGrid');
  if(!document.getElementById('invPanel').classList.contains('on')||!INV.bag.length){
    throw new Error('Open a populated test inventory first');
  }
  const selected=INV.selected;
  const results=[];
  try{
    INV.selected=null;
    _invClearHover();
    const before=grid.getBoundingClientRect().toJSON();
    const previews=INV.bag.slice(0,4).map((_,index)=>[index,'bag']);
    for(const slot of Object.keys(INV.equipped)){
      if(INV.equipped[slot])previews.push([slot,'eq']);
    }
    for(const [index,source] of previews){
      _invRenderDetail(index,source);
      const after=grid.getBoundingClientRect();
      const stable=['x','y','width','height'].every(key=>Math.abs(after[key]-before[key])<0.1);
      results.push({source,index,stable,beforeHeight:before.height,afterHeight:after.height});
      _invClearHover();
    }
    const failed=results.filter(result=>!result.stable);
    if(failed.length)throw new Error('Hover moves inventory hit area: '+JSON.stringify(failed));
    return {passed:results.length,results};
  }finally{
    INV.selected=selected;
    _invClearHover();
  }
})();
