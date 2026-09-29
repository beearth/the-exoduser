// A single local r160 namespace is shared by classic layers and ES modules.
(function(){
  if(window._threeReady)return;
  window._threeReady=import('./assets/vendor/three-r160/build/three.module.js')
    .then(three=>{window.THREE=three;return three;})
    .catch(error=>{console.warn('[THREE] Local runtime unavailable; 3D layers disabled',error);return null;});
})();
