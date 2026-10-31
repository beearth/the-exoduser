(function () {
  const art = window.FullscreenArt;
  if (!art) return;
  const gate = document.getElementById('gateWideArt');
  if (gate) {
    // The approved gate keeps its black background; never reload the retired cave plate.
    art.atmosphere(gate.parentElement, { tone: 'gate' });
  }
  const originalGate = document.querySelector('#cinGate>img');
  if (originalGate) {
    art.picture(originalGate, 'img/hellgate.png');
    art.atmosphere(originalGate.parentElement, { tone: 'gate' });
  }
  const nemesia = document.querySelector('.cin-nemesia-bg');
  if (nemesia) {
    art.background(nemesia, 'img/cin_nemesia_hd.png');
    art.atmosphere(nemesia, { tone: 'blood' });
  }
  const death = document.getElementById('death');
  if (death) {
    art.background(death, 'img/cin_remember_wide.png');
    art.atmosphere(death, { tone: 'blood' });
  }
  const csPlate = document.getElementById('csWideArt');
  art.video(document.getElementById('csIdleVid'), csPlate);
  art.video(document.getElementById('csSceneVid'), csPlate);
  if (csPlate) art.atmosphere(csPlate.parentElement);
  const lobbyPlate = document.getElementById('lobbyWideArt');
  art.video(document.getElementById('lobbyCharPreview'), lobbyPlate);
  art.video(document.getElementById('lobbyAmbientVideo'), lobbyPlate,
    { source: 'assets/lobby/lobby_varkan_crypt_poster_v2.webp' });
  if (lobbyPlate) {
    const selector = document.getElementById('charVisualPop');
    art.atmosphere(lobbyPlate.parentElement, { tone: 'crypt',
      isActive: () => !selector || selector.style.display === 'none' });
    // The selector is a sibling, so its opening must also wake the lobby occlusion check.
    if (selector && window.MutationObserver) new MutationObserver(() => art.refreshAtmosphere())
      .observe(selector, { attributes: true, attributeFilter: ['style', 'class'] });
  }
  document.querySelectorAll('.cin-img').forEach(host => art.atmosphere(host));
  ['stageTransition', 'chapterGate', 'demoEnd'].forEach(id => art.atmosphere(document.getElementById(id)));
})();
