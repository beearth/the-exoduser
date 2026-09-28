// Keep the original equipment knight while removing its nearly black plate.
(() => {
  const stage = document.querySelector('#invPanel .inv-eq-wrap');
  const equipment = stage?.closest('.inv-equip');
  if (stage && equipment) {
    const fit = () => {
      if (!equipment.clientWidth || !equipment.clientHeight) return;
      const scale = Math.max(.1, Math.min(2.1,
        (equipment.clientWidth - 36) / 654,
        (equipment.clientHeight - 98) / 560));
      stage.style.setProperty('zoom', String(scale), 'important');
    };
    new ResizeObserver(fit).observe(equipment);
    fit();
  }
  // Use the authored alpha cutout; luminance keys erase dark armour.
  const paperdoll = document.querySelector('#invPanel .inv-eq-sil');
  if (paperdoll) {
    paperdoll.decode().catch(() => {}).finally(() => {
      paperdoll.classList.add('is-ready');
    });
  }
})();
