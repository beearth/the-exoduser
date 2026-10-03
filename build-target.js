// The web remains a demo. Windows packaging writes an explicit target into this file.
window.EXODUSER_BUILD_TARGET=(typeof nw!=='undefined'&&nw.App.manifest.exoduser?.target)||'demo';
