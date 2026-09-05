// ENTER forged-metal art: decode and key once, then reuse the transparent result.
(function () {
  const button = document.querySelector('.cin-enter-btn');
  if (!button) return;
  const source = new Image();
  source.onload = function () {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = source.naturalWidth;
      canvas.height = source.naturalHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(source, 0, 0);
      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = frame.data;
      for (let i = 0; i < pixels.length; i += 4) {
        const neutral = Math.max(pixels[i], pixels[i + 2]);
        const excess = pixels[i + 1] - neutral;
        if (excess > 18) {
          pixels[i + 3] = Math.round(255 * (1 - Math.min(1, (excess - 18) / 64)));
          pixels[i + 1] = Math.min(pixels[i + 1], neutral + 4);
        }
      }
      ctx.putImageData(frame, 0, 0);
      const ready = new Image();
      ready.onload = function () {
        button.src = ready.src;
        button.dataset.art = 'forged-v1';
      };
      ready.src = canvas.toDataURL('image/png');
    } catch (error) {
      console.warn('[ENTER] Forged art unavailable; retaining original emblem.', error);
    }
  };
  source.src = 'img/cin_enter_forged_green_v1.png?v=20260906';
})();
