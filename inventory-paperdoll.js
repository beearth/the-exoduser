// Keep the original equipment knight while removing its nearly black plate.
(() => {
  const stage = document.querySelector('#invPanel .inv-eq-wrap');
  const equipment = stage?.closest('.inv-equip');
  if (stage && equipment) {
    const fit = () => {
      if (!equipment.clientWidth || !equipment.clientHeight) return;
      const scale = Math.max(.1, Math.min(2.1,
        (equipment.clientWidth - 36) / 654,
        (equipment.clientHeight - 130) / 480));
      stage.style.setProperty('zoom', String(scale), 'important');
    };
    new ResizeObserver(fit).observe(equipment);
    fit();
  }
  const paperdoll = document.querySelector('#invPanel .inv-eq-sil');
  const source = paperdoll?.dataset.originalSrc;
  if (!paperdoll || !source) return;

  (async () => {
    try {
      const response = await fetch(source, { mode: 'cors' });
      if (!response.ok) throw new Error(`Knight art HTTP ${response.status}`);
      const bitmap = await createImageBitmap(await response.blob());
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) throw new Error('Knight art canvas unavailable');
      context.drawImage(bitmap, 0, 0);
      bitmap.close?.();
      const image = context.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = image.data;
      for (let i = 0; i < pixels.length; i += 4) {
        const light = pixels[i] * .25 + pixels[i + 1] * .5 + pixels[i + 2] * .25;
        pixels[i + 3] = Math.round(255 * Math.min(1, Math.max(0, (light - 22) / 45)));
      }
      context.putImageData(image, 0, 0);
      const keyed = canvas.toDataURL('image/png');
      const decoded = new Image();
      decoded.src = keyed;
      await decoded.decode();
      if (!paperdoll.isConnected) return;
      paperdoll.src = keyed;
    } catch (error) {
      // The local transparent knight remains as the offline/loading fallback.
      console.warn('Equipment knight background removal failed:', error);
    } finally {
      paperdoll.classList.add('is-ready');
    }
  })();
})();
