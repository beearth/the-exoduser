const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');
const root = path.resolve(__dirname, '..');
const output = process.argv[2];
if (!output) throw new Error('Explicit G-drive output directory required');
fs.mkdirSync(output, { recursive: true });
const source = fs.readFileSync(path.join(root, 'game.html'), 'utf8');
const vfxSource = fs.readFileSync(path.join(root, 'level-up-vfx.js'), 'utf8');
const noop = () => {};
const gradient = { addColorStop: noop };
const painter = new Proxy({ createLinearGradient: () => gradient, createRadialGradient: () => gradient }, {
  get: (target, key) => target[key] || noop,
  set: (target, key, value) => { target[key] = value; return true; }
});
const context = { window: {}, document: { createElement: () => ({ getContext: () => painter }) } };
vm.runInNewContext(vfxSource, context);
const cells = ['0,0,128,256', '128,0,128,128', '0,256,256,128', '256,0,32,32', '256,64,128,128'];
const player = { x: 0, y: 0, hp: 100, lv: 7 };
const cases = [];
for (const age of [0, .01, .1, .24, .5, 1.5, 2.8, 3, 3.4]) {
  for (const reduced of [false, true]) {
    for (const front of [false, true]) {
      const effect = context.window.LevelUpVfx.create();
      effect.trigger(player, 0, 3, false);
      effect.update(age, player, 0);
      const calls = [];
      const draw = { save: noop, restore: noop, globalAlpha: 1, drawImage(...args) {
        calls.push({ cell: cells.indexOf(args.slice(1, 5).join(',')), x: args[5] + args[7] / 2,
          y: args[6] + args[8] / 2, w: args[7], h: args[8], alpha: this.globalAlpha });
      } };
      effect.draw(draw, player, 0, front, reduced);
      cases.push({ age, reduced, front, levels: 3, calls });
    }
  }
}
const synthesis = [];
let delay = 0;
const audio = {
  setTimeout: (callback, milliseconds) => { delay = milliseconds / 1000; callback(); },
  playFM: (carrier, modulator, depth, duration, volume, type, end) => synthesis.push(['fm', delay, carrier, modulator, depth, duration, volume, end || 0]),
  playTone: (frequency, duration, type, volume) => synthesis.push(['tone', delay, frequency, 0, 0, duration, volume, 0]),
  playNoise: (duration, frequency, volume, end) => synthesis.push(['noise', delay, frequency, 0, 0, duration, volume, end]),
  playSub: (frequency, duration, volume, end) => synthesis.push(['sub', delay, frequency, 0, 0, duration, volume, end])
};
const start = source.indexOf('  levelup(){');
const end = source.indexOf('  // Heavy landing', start);
const methods = source.slice(start, end > start ? end : source.indexOf('  slam(){', start));
const pickupEnd = methods.indexOf('\n  },', methods.indexOf('pickup(){')) + 5;
if (start < 0 || pickupEnd < 5) throw new Error('Original SFX methods not found');
const effects = vm.runInNewContext('({' + methods.slice(0, pickupEnd) + '})', audio);
effects.levelup();
const levelup = synthesis.splice(0);
delay = 0;
effects.pickup();
const fixture = { source: { game: crypto.createHash('sha256').update(source).digest('hex'), vfx: crypto.createHash('sha256').update(vfxSource).digest('hex') }, cases, audio: { levelup, pickup: synthesis } };
fs.writeFileSync(path.join(output, 'source-oracle.json'), JSON.stringify(fixture, null, 2));
const asset = 'sfx/voice/silvertail_resource_fail.mp3';
const destination = path.join(root, 'godot/assets', asset);
if (process.argv.includes('--copy-source-voice')) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(path.join(root, asset), destination);
}
const original = fs.readFileSync(path.join(root, asset));
const copied = fs.readFileSync(destination);
if (!original.equals(copied)) throw new Error('Original asset bytes differ');
const assets = [{ original: asset, copied: 'godot/assets/' + asset, bytes: original.length, sha256: crypto.createHash('sha256').update(original).digest('hex') }];
fs.writeFileSync(path.join(output, 'assets.json'), JSON.stringify(assets, null, 2));
console.log(JSON.stringify({ oracle_cases: cases.length, levelup_layers: levelup.length, pickup_layers: synthesis.length, byte_exact_assets: assets.length }));
