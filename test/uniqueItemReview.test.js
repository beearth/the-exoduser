import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
import { parse } from 'acorn';
import { UNIQUE_DEFINITIONS } from '../unique-item-project/definitions.js';

const html = readFileSync(new URL('../unique-item-project/review.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const ast = parse(script, { ecmaVersion: 'latest' });
function nodes(node) {
  if (!node || typeof node !== 'object') return [];
  return [node, ...Object.values(node).flatMap(value => Array.isArray(value) ? value.flatMap(nodes) : nodes(value))];
}
const imports = nodes(ast).filter(node => node.type === 'ImportExpression');

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
    assert.equal(this.children.length, 0, '텍스트 교체는 리프에만 허용');
    this.content = value;
  }
  get textContent() { return this.content; }
  set innerHTML(value) { assert.fail(`부모 DOM 교체 금지: ${value}`); }
  append(...children) { this.children.push(...children); }
  setAttribute(name, value) { this.attributes[name] = value; }
  addEventListener(name, callback) { this.listeners[name] = callback; }
}

async function render(loadDefinitions) {
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
    getElementById: id => id === 'items' ? main : status,
    createElement: tag => new Element(tag),
    querySelectorAll: selector => {
      assert.equal(selector, 'button[data-target]');
      return buttons;
    }
  };
  if (loadDefinitions) {
    const importNode = imports[0];
    const fixtureScript = script.slice(0, importNode.start) + 'loadDefinitions()' + script.slice(importNode.end);
    await vm.runInNewContext(fixtureScript, { document, loadDefinitions });
  } else {
    await new vm.Script(script, {
      filename: new URL('../unique-item-project/review.html', import.meta.url).pathname,
      importModuleDynamically: vm.constants.USE_MAIN_CONTEXT_DEFAULT_LOADER
    }).runInNewContext({ document });
  }
  return { main, status, body, buttons };
}

test('review dynamically imports the real definition module without catalog or path copies', () => {
  assert.deepEqual(imports.map(node => node.source.value), ['./definitions.js', './d10-tooltip.js']);
  assert.doesNotMatch(script, /const names|ui-\$|seedream-candidate|innerHTML/);
  for (const definition of UNIQUE_DEFINITIONS) assert.ok(!script.includes(definition.catalogName));
});

test('actual definitions render 22 cards and all 44 exact lazy image paths', async () => {
  const before = JSON.stringify(UNIQUE_DEFINITIONS);
  const { main, status } = await render();
  assert.equal(main.children.length, 22);
  assert.equal(main.attributes['aria-busy'], 'false');
  assert.match(status.textContent, /22종 정의.*개발 검토용/);
  let imageCount = 0;
  for (const [index, card] of main.children.entries()) {
    const definition = UNIQUE_DEFINITIONS[index];
    const [heading, equipment, effect, state, pair] = card.children;
    assert.equal(card.dataset.uniqueId, definition.uniqueId);
    assert.equal(heading.textContent, `${definition.uniqueId} · ${definition.catalogName}`);
    assert.equal(equipment.className, 'equipment');
    assert.equal(effect.textContent, `효과 제안: ${definition.effectId} · 미구현`);
    assert.equal(state.textContent, '정의: 제안·미채택 · 비활성 · 원화: 미채택');
    assert.equal(definition.enabled, false);
    assert.equal(definition.art.accepted, false);
    assert.equal(pair.children.length, 2);
    for (const [figureIndex, figure] of pair.children.entries()) {
      const [caption, image] = figure.children;
      const path = figureIndex === 0 ? definition.art.originalPath : definition.art.candidatePath;
      const label = figureIndex === 0 ? '기존 원화' : 'Seedream 후보';
      assert.equal(caption.textContent, label);
      assert.equal(image.src, `../${path}`);
      assert.equal(image.alt, `${definition.uniqueId} ${definition.catalogName} ${label}`);
      assert.equal(image.loading, 'lazy');
      assert.ok(existsSync(new URL(`../${path}`, import.meta.url)));
      imageCount++;
    }
  }
  assert.equal(imageCount, 44);
  assert.equal(JSON.stringify(UNIQUE_DEFINITIONS), before);
});

test('all equipment mappings use contract Korean slot names and SSOT weapon types', async () => {
  const expected = ['망토', '반지 1 / 반지 2', '무기 · 검', '장갑', '장화', '투구', '허리띠', '무기 · 단검', '팔찌', '흉갑', '무기 · 해머', '견갑', '허리띠', '목걸이', '활 · 석궁', '장갑', '투구', '목걸이', '장갑', '견갑', '흉갑', '투구'];
  const { main } = await render();
  assert.deepEqual(main.children.map(card => card.children[1].textContent), expected.map(label => `장착: ${label}`));
  for (const index of [5, 16, 21]) assert.doesNotMatch(main.children[index].children[1].textContent, /귀걸이/);
});

test('definition changes flow to names IDs equipment effect state and image paths', async () => {
  const definition = structuredClone(UNIQUE_DEFINITIONS[0]);
  Object.assign(definition, { uniqueId: 'FIXTURE-ID', catalogName: '변경된 정의', slots: ['headband'], effectId: 'FIXTURE-EFFECT' });
  definition.art.originalPath = 'assets/fixture-original.png';
  definition.art.candidatePath = 'assets/fixture-candidate.png';
  const { main } = await render(async () => ({ UNIQUE_DEFINITIONS: [definition] }));
  const [heading, equipment, effect, state, pair] = main.children[0].children;
  assert.equal(heading.textContent, 'FIXTURE-ID · 변경된 정의');
  assert.equal(equipment.textContent, '장착: 귀걸이 1');
  assert.equal(effect.textContent, '효과 제안: FIXTURE-EFFECT · 미구현');
  assert.match(state.textContent, /미채택.*비활성.*미채택/);
  assert.equal(pair.children[0].children[1].src, '../assets/fixture-original.png');
  assert.equal(pair.children[1].children[1].src, '../assets/fixture-candidate.png');
  definition.status = 'accepted';
  definition.enabled = true;
  definition.art.accepted = true;
  definition.effectStatus = 'implemented';
  const changed = await render(async () => ({ UNIQUE_DEFINITIONS: [definition] }));
  assert.equal(changed.main.children[0].children[3].textContent, '정의: accepted · 활성 · 원화: 채택');
  assert.equal(changed.main.children[0].children[2].textContent, '효과 제안: FIXTURE-EFFECT · implemented');
});

test('64/160 CSS and native buttons retain focus/keyboard semantics and ARIA toggle', async () => {
  for (const size of ['64', '160']) {
    assert.match(html, new RegExp(`body\\[data-size="${size}"\\] \\{ --image-size: ${size}px;`));
    assert.match(html, new RegExp(`<button type="button" data-target="${size}" aria-pressed="${size === '64'}">`));
  }
  assert.match(html, /width: var\(--image-size\); height: var\(--image-size\)/);
  assert.doesNotMatch(html, /tabindex="-1"|onkeydown|preventDefault/);
  const { body, buttons } = await render();
  for (const index of [1, 0, 1]) {
    buttons[index].listeners.click();
    assert.equal(body.dataset.size, buttons[index].dataset.target);
    assert.deepEqual(buttons.map(button => button.attributes['aria-pressed']), buttons.map((button, buttonIndex) => String(index === buttonIndex)));
  }
});

test('module loading failure displays actionable alert without disabling size controls', async () => {
  const { main, status, buttons, body } = await render(async () => { throw new Error('module unavailable'); });
  assert.equal(main.children.length, 0);
  assert.equal(main.attributes['aria-busy'], 'false');
  assert.equal(status.attributes.role, 'alert');
  assert.match(status.textContent, /불러오지 못했습니다.*HTTP.*definitions.js/);
  buttons[1].listeners.click();
  assert.equal(body.dataset.size, '160');
  assert.match(html, /id="review-status" role="status">정의를 불러오는 중/);
});
