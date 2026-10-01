(() => {
  const pngPath='img/ui/item-cutouts/ring_phys_masked.png';
  function candidateSource(source,path=pngPath){
    const needle="const cutoutSrc=_ITEM_CUTOUT_BASES.has(base)?'img/ui/item-cutouts/'+base+'_phys_cutout.png':'';";
    if(source.split(needle).length!==2)throw Error('unexpected skin function');
    return source.replace(needle,`const cutoutSrc=base==='ring'&&el==='phys'?${JSON.stringify(path)}:(_ITEM_CUTOUT_BASES.has(base)?'img/ui/item-cutouts/'+base+'_phys_cutout.png':'');`);
  }
  window.__ringPngDiagnostic={candidateSource,pngPath};
})();
