import { ITEMS, getItem, filterItems } from './catalog.js';

const grid = document.querySelector('#item-grid');
const search = document.querySelector('#search');
const filters = [...document.querySelectorAll('[data-kind]')];
let activeKind = '전체';
let activeId = getItem(location.hash.slice(1))?.id || 'UI-03';

for (const kind of ['무기', '방어구', '장신구']) {
  document.querySelector(`[data-kind="${kind}"] small`)?.remove();
  const count = ITEMS.filter(item => item.kind === kind).length;
  const small = document.createElement('small');
  small.textContent = String(count);
  document.querySelector(`[data-kind="${kind}"]`).append(small);
}

function showDetail(item) {
  activeId = item.id;
  document.querySelector('#detail-id').textContent = item.id;
  document.querySelector('#detail-img').src = item.art;
  document.querySelector('#detail-img').alt = item.name;
  document.querySelector('#detail-kind').textContent = `${item.kind} / ${item.slot}`;
  document.querySelector('#detail-name').textContent = item.name;
  document.querySelector('#detail-lore').textContent = item.lore;
  document.querySelector('#detail-affix').textContent = item.affixId;
  document.querySelector('#detail-effect').textContent = item.effect;
  document.querySelector('#detail-motif').textContent = item.motif;
  for (const card of grid.querySelectorAll('[data-id]')) card.setAttribute('aria-pressed', String(card.dataset.id === item.id));
  history.replaceState(null, '', `#${item.id}`);
}

function render() {
  const found = filterItems({ kind: activeKind, query: search.value });
  grid.replaceChildren();
  const fragment = document.createDocumentFragment();
  for (const item of found) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'item-card';
    card.dataset.id = item.id;
    card.setAttribute('aria-pressed', String(item.id === activeId));
    card.setAttribute('aria-label', `${item.name}, ${item.slot}, ${item.affixId}`);
    const art = document.createElement('span'); art.className = 'card-art';
    const img = document.createElement('img'); img.src = item.art; img.alt = ''; img.loading = 'lazy'; art.append(img);
    const number = document.createElement('span'); number.className = 'card-number'; number.textContent = item.id; art.append(number);
    const text = document.createElement('span'); text.className = 'card-text';
    const slot = document.createElement('small'); slot.textContent = `${item.kind} / ${item.slot}`;
    const name = document.createElement('strong'); name.textContent = item.name;
    const effect = document.createElement('span'); effect.className = 'card-effect'; effect.textContent = item.effect;
    const affix = document.createElement('b'); affix.textContent = item.affixId;
    text.append(slot, name, effect, affix); card.append(art, text); fragment.append(card);
  }
  grid.append(fragment);
  document.querySelector('#result-count').textContent = String(found.length).padStart(2, '0');
  document.querySelector('#empty-state').hidden = found.length > 0;
}

grid.addEventListener('click', event => {
  const card = event.target.closest('[data-id]');
  if (!card) return;
  showDetail(getItem(card.dataset.id));
  if (matchMedia('(max-width: 980px)').matches) document.querySelector('.detail').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
search.addEventListener('input', render);
for (const button of filters) button.addEventListener('click', () => {
  activeKind = button.dataset.kind;
  for (const other of filters) other.setAttribute('aria-pressed', String(other === button));
  render();
});

render();
showDetail(getItem(activeId));
