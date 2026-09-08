import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
const voice = html.slice(html.indexOf('const _SILVERTAIL_VOICE_MAP='), html.indexOf('function _sfxCat('));

for (const boot of ['_startTestChar', '_startDemoTest']) {
  for (const selected of [0, 1]) {
    test(`${boot} preserves selected character ${selected} for sprite and voice`, () => {
      const start = html.indexOf(`async function ${boot}(){`);
      const body = html.slice(html.indexOf('\n', start), html.indexOf('  // Lv500', start));
      const context = vm.createContext({
        _charIdx: selected, _charName: '', _stageTestReq: 0,
        mkP: () => ({}), INV: {}, G: {}, PASSIVE_DEF: [], PASSIVES: {},
        showBootLoading() {}, setBootLoading() {}, _cacheExitCenter() {}, _getStore() {},
        performance: { now: () => 1000 },
      });
      vm.runInContext(body + '\n' + voice, context);
      assert.equal(context._charIdx, selected, 'boot must keep the identity of the already loaded sprite');
      for (const cue of ['male_grunt', 'voice_attack', 'voice_ult', 'player_hit1', 'repentance']) {
        const actual = vm.runInContext(`_silvertailVoiceKey('${cue}')`, context);
        if (selected === 1) assert.match(actual, /^silvertail_/, cue);
        else assert.equal(actual, cue);
      }
    });
  }
}
