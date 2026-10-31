(function () {
  const art = window.FullscreenArt;
  if (!art) return;
  const gate = document.getElementById('gateWideArt');
  if (gate) art.picture(gate, 'assets/fullscreen-wide/20261031/gate-original.png');
  const originalGate = document.querySelector('#cinGate>img');
  if (originalGate) art.picture(originalGate, 'img/hellgate.png');
  const nemesia = document.querySelector('.cin-nemesia-bg');
  if (nemesia) art.background(nemesia, 'img/cin_nemesia_hd.png');
  const death = document.getElementById('death');
  if (death) art.background(death, 'img/cin_remember_wide.png');
})();
