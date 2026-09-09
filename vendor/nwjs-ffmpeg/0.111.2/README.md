# NW.js 0.111.2 / Windows x64 media codecs

The stock runtime rendered the world-intro video but decoded no AAC audio.
The replacement is the version-matched community FFmpeg build linked by the
[official NW.js codec documentation](https://docs.nwjs.io/For%20Developers/Enable%20Proprietary%20Codecs/).

- Upstream: https://github.com/nwjs-ffmpeg-prebuilt/nwjs-ffmpeg-prebuilt/releases/tag/0.111.2
- Archive: `0.111.2-win-x64.zip`, 1,506,762 bytes
- Archive SHA-256: `2852daa7892ccc67b9c9c98cbee9f48e5b0f50c2005661b3cb678d654b7cdbc8` (GitHub release asset digest)
- `ffmpeg.dll` SHA-256: `be2504fbca75c5e3282a79481b5188167b43292cb378ec093ae8ca203ef30500`
- The builder verifies the DLL digest before staging and copies it to the final runtime directory after packaging.
- Runtime proof: `output/steam_20260909/nw_media_probe.json`; identical NW.js 0.111.2/Chromium 148 engine, video duration 113.291667s, AAC decoded bytes 65,491 and measured audio peak 0.340915 after replacement (both zero with stock DLL).

Upstream source and license information: https://github.com/nwjs-ffmpeg-prebuilt/nwjs-ffmpeg-prebuilt
