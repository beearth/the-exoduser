// Decode API artwork once; remove its black matte before showing it over the video.
(() => {
  document.querySelectorAll('.cin-title-art, .cin-enter-art').forEach(logo => {
  const source = new Image();
  source.onload = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = source.naturalWidth;
      canvas.height = source.naturalHeight;
      const ctx = canvas.getContext('2d', {willReadFrequently:true});
      ctx.drawImage(source,0,0);
      const frame = ctx.getImageData(0,0,canvas.width,canvas.height);
      const p = frame.data;
      for(let i=0;i<p.length;i+=4){
        const light=Math.max(p[i],p[i+1],p[i+2]);
        p[i+3]=Math.round(255*Math.max(0,Math.min(1,(light-8)/24)));
      }
      ctx.putImageData(frame,0,0);
      const ready = new Image();
      ready.onload=()=>{logo.src=ready.src;logo.dataset.ready='true';logo.parentElement.dataset.artReady='true';};
      ready.src=canvas.toDataURL('image/png');
    } catch(error) { console.warn('[Logo] Matte decode failed',error); }
  };
  source.src=logo.getAttribute('src');
  });
})();
