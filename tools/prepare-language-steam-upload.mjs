// Legacy entry point: explicit artifact and Steam identity are now required.
import './prepare-release-steam-upload.mjs';
if(!process.argv.some(arg=>arg.startsWith('--root=')))throw Error('Use --root=... --out=... --app-id=4749590 --depot-id=4749591 for the verified full release');
