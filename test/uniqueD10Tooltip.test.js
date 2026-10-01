import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
import { parse } from 'acorn';
import { UNIQUE_DEFINITIONS } from '../unique-item-project/definitions.js';
import { lookupRoll, describeRoll, toStoredValue } from '../unique-item-project/roll-values.js';
import { describeD10Tooltip, mountD10Tooltip } from '../unique-item-project/d10-tooltip.js';

const html = readFileSync(new URL('../unique-item-project/review.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

class Element {
  constructor(tag) {
    this.tagName = tag;
    this.children = [];
    this.dataset = {};
    this.attributes = {};
    this.listeners = {};
    this.content = '';
  }
  set textContent(value) {
    assert.equal(this.children.length, 0, '리프 노드만 교체');
    this.content = value;
  }
  get textContent() { return this.content; }
  set innerHTML(value) { assert.fail(`innerHTML 금지: ${value}`); }
  append(...children) { this.children.push(...children); }
  setAttribute(name, value) { this.attributes[name] = value; }
  addEventListener(name, callback) { this.listeners[name] = callback; }
}

async function review(failTooltip = false) {
  const main = new Element('main');
  const status = new Element('p');
  const body = new Element('body');
  body.dataset.size = '64';
  const buttons = ['64', '160'].map(size => {
    const button = new Element('button');
    button.dataset.target = size;
    button.setAttribute('aria-pressed', String(size === '64'));
    return button;
  });
  const document = {
    body,
    createElement: tag => new Element(tag),
    getElementById: id => id === 'items' ? main : status,
    querySelectorAll: selector => {
      assert.equal(selector, 'button[data-target]');
      return buttons;
    }
  };
  const source = failTooltip ? script.replace("import('./d10-tooltip.js')", 'failTooltipImport()') : script;
  await new vm.Script(source, {
    filename: new URL('../unique-item-project/review.html', import.meta.url).pathname,
    importModuleDynamically: vm.constants.USE_MAIN_CONTEXT_DEFAULT_LOADER
  }).runInNewContext({ document, failTooltipImport: async () => { throw new Error('missing module'); } });
  return { main, status, buttons, body };
}

test('D10 percent tooltip consumes current definition/lookup/describe/store contracts in KO and EN', () => {
  const before = JSON.stringify(UNIQUE_DEFINITIONS);
  const proposal = lookupRoll('U-D10');
  assert.equal(proposal.min, 10);
  assert.equal(proposal.max, 20);
  for (let raw = 10; raw <= 20; raw++) {
    for (const language of ['ko', 'en']) {
      const tooltip = describeD10Tooltip(raw, language);
      assert.equal(tooltip.uniqueId, 'UI-10');
      assert.equal(tooltip.effectId, 'U-D10');
      assert.equal(tooltip.stored, toStoredValue('U-D10', raw));
      assert.equal(tooltip.stored, raw / 100);
      assert.equal(tooltip.selected, describeRoll('UI-10', raw).text);
      assert.equal(tooltip.range, '10~20%');
      assert.equal(tooltip.enabled, false);
      assert.equal(tooltip.status, 'proposal');
      assert.ok(tooltip.description.includes(`${raw}%`));
      assert.doesNotMatch(tooltip.description + tooltip.disclaimer, /0\.1|0\.2/);
      assert.match(tooltip.description, language === 'ko' ? /100 이상.*실제로 소모한 성공 지옥강타.*소모한 분노.*복원.*최대 30/ : /successful Hell Slam.*actually spends at least 100 Rage.*Rage spent.*up to 30/);
      assert.match(tooltip.note, language === 'ko' ? /소모 전.*재발동시키지 않/ : /before spending.*does not retrigger/);
      assert.match(tooltip.disclaimer, language === 'ko' ? /단일아이템.*미채택·비활성.*게임 효과가 아닙/ : /single-item.*unaccepted and inactive.*not an active game effect/);
      assert.ok(Object.isFrozen(tooltip));
    }
  }
  assert.equal(JSON.stringify(UNIQUE_DEFINITIONS), before);
});

test('invalid rolls and unsupported language fail rather than display invalid player values', () => {
  for (const raw of [9, 21, 10.5, NaN, Infinity, -Infinity, '15', null, 0.15]) assert.throws(() => describeD10Tooltip(raw), RangeError);
  assert.throws(() => describeD10Tooltip(15, 'fr'), RangeError);
  assert.throws(() => mountD10Tooltip({ dataset: { uniqueId: 'UI-09' } }, {}), RangeError);
});

test('real review executes .js imports and mounts only UI-10 while preserving 22 cards/44 images', async () => {
  const { main, status } = await review();
  assert.equal(main.children.length, 22);
  assert.equal(main.attributes['aria-busy'], 'false');
  assert.match(status.textContent, /22종 정의/);
  let images = 0;
  for (const [index, card] of main.children.entries()) {
    const definition = UNIQUE_DEFINITIONS[index];
    assert.equal(card.dataset.uniqueId, definition.uniqueId);
    assert.equal(card.children[0].textContent, `${definition.uniqueId} · ${definition.catalogName}`);
    assert.equal(card.children[3].textContent, '정의: 제안·미채택 · 비활성 · 원화: 미채택');
    assert.equal(card.children.length, definition.uniqueId === 'UI-10' ? 6 : 5);
    for (const [figureIndex, figure] of card.children[4].children.entries()) {
      const image = figure.children[1];
      const path = figureIndex === 0 ? definition.art.originalPath : definition.art.candidatePath;
      assert.equal(image.src, `../${path}`);
      assert.equal(image.loading, 'lazy');
      assert.ok(existsSync(new URL(`../${path}`, import.meta.url)));
      images++;
    }
  }
  assert.equal(images, 44);
  const tooltip = main.children[9].children[5];
  assert.equal(tooltip.className, 'd10-tooltip');
  assert.equal(tooltip.children[3].lang, 'ko');
  assert.equal(tooltip.children[4].lang, 'en');
  assert.match(tooltip.children[2].textContent, /10~20%.*15%/);
});

test('10/15/20 native controls update bilingual leaf descriptions and ARIA without modifying other cards', async () => {
  const { main } = await review();
  const tooltip = main.children[9].children[5];
  const controls = tooltip.children[1];
  assert.equal(controls.attributes.role, 'group');
  assert.deepEqual(controls.children.map(button => button.dataset.roll), ['10', '15', '20']);
  const otherBefore = main.children.filter(card => card.dataset.uniqueId !== 'UI-10').map(card => card.children.length);
  for (const selectedIndex of [0, 2, 1]) {
    const button = controls.children[selectedIndex];
    assert.equal(button.type, 'button');
    button.listeners.click();
    assert.match(tooltip.children[3].textContent, new RegExp(`${button.dataset.roll}%`));
    assert.match(tooltip.children[4].textContent, new RegExp(`${button.dataset.roll}%`));
    assert.deepEqual(controls.children.map(control => control.attributes['aria-pressed']), controls.children.map((control, index) => String(index === selectedIndex)));
    for (const leaf of tooltip.children.slice(2)) assert.doesNotMatch(leaf.textContent, /0\.1|0\.2/);
  }
  assert.deepEqual(main.children.filter(card => card.dataset.uniqueId !== 'UI-10').map(card => card.children.length), otherBefore);
});

test('64/160 controls remain independent; native keyboard semantics are retained, not visually certified', async () => {
  const { buttons, body, main } = await review();
  for (const index of [1, 0]) {
    buttons[index].listeners.click();
    assert.equal(body.dataset.size, buttons[index].dataset.target);
    assert.deepEqual(buttons.map(button => button.attributes['aria-pressed']), buttons.map((button, buttonIndex) => String(index === buttonIndex)));
    assert.match(main.children[9].children[5].children[2].textContent, /15%/);
  }
  for (const size of ['64', '160']) assert.match(html, new RegExp(`body\\[data-size="${size}"\\] \\{ --image-size: ${size}px;`));
  assert.equal((html.match(/<button type="button" data-target=/g) || []).length, 2);
  const source = readFileSync(new URL('../unique-item-project/d10-tooltip.js', import.meta.url), 'utf8');
  const ast = parse(source, { ecmaVersion: 'latest', sourceType: 'module' });
  assert.deepEqual(ast.body.filter(node => node.type === 'ImportDeclaration').map(node => node.source.value), ['./definitions.js', './roll-values.js']);
  assert.doesNotMatch(source, /innerHTML|preventDefault|localStorage|Math\.random|fetch\(/);
});

test('tooltip module failure leaves original art comparison and size controls available with local alert', async () => {
  const { main, status, buttons, body } = await review(true);
  assert.equal(main.children.length, 22);
  assert.match(status.textContent, /22종 정의/);
  const failure = main.children[9].children[5];
  assert.equal(failure.attributes.role, 'alert');
  assert.match(failure.textContent, /불러오지 못했습니다.*d10-tooltip.js.*roll-values.js.*계속 이용/);
  assert.equal(main.children[9].children[4].children.length, 2);
  buttons[1].listeners.click();
  assert.equal(body.dataset.size, '160');
  assert.equal(main.attributes['aria-busy'], 'false');
});
