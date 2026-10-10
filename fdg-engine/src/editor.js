(function (global) {
  'use strict';

  const FDG = global.FDG || (global.FDG = {});
  const JSON_LIMIT = 1000000;
  let editorSerial = 0;

  function finiteInput(value, positive) {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new TypeError('숫자를 입력해 주세요.');
    }
    const text = value.trim();
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(text)) {
      throw new TypeError('유효한 숫자를 입력해 주세요.');
    }
    const number = Number(text);
    if (!Number.isFinite(number) || (positive && number <= 0)) {
      throw new RangeError(positive ? '크기는 0보다 큰 숫자여야 합니다.' : '유한한 숫자를 입력해 주세요.');
    }
    return number;
  }

  function parseScene(text, factories) {
    if (typeof text !== 'string' || text.length === 0 || text.length > JSON_LIMIT) {
      throw new RangeError('씬 JSON은 1~1,000,000자여야 합니다.');
    }
    if (!FDG.SceneTree || typeof FDG.SceneTree.fromJSON !== 'function') {
      throw new Error('FDG SceneTree가 먼저 로드되어야 합니다.');
    }
    return FDG.SceneTree.fromJSON(JSON.parse(text), factories);
  }

  function assertTree(tree) {
    if (!tree || !tree.root || typeof tree.advance !== 'function' ||
        typeof tree.stepOnce !== 'function' || typeof tree.toJSON !== 'function') {
      throw new TypeError('유효한 FDG SceneTree가 필요합니다.');
    }
  }

  class Editor {
    constructor(options) {
      if (!options || typeof options !== 'object') throw new TypeError('에디터 옵션이 필요합니다.');
      assertTree(options.tree);
      const element = options.rootElement;
      if (!element || !element.ownerDocument || typeof element.appendChild !== 'function') {
        throw new TypeError('에디터의 rootElement가 필요합니다.');
      }
      if (!options.renderer || typeof options.renderer.setTree !== 'function' ||
          typeof options.renderer.render !== 'function') {
        throw new TypeError('setTree/render를 제공하는 renderer가 필요합니다.');
      }
      if (options.onTreeChange !== undefined && typeof options.onTreeChange !== 'function') {
        throw new TypeError('onTreeChange는 함수여야 합니다.');
      }
      this.tree = options.tree;
      this.renderer = options.renderer;
      this.rootElement = element;
      this.factories = options.factories || {};
      this.onTreeChange = options.onTreeChange || null;
      this.document = element.ownerDocument;
      this.selected = this.tree.root;
      this.mounted = false;
      this.destroyed = false;
      this._revision = 0;
      this._importToken = 0;
      this._nextNodeNumber = 1;
      this._listeners = [];
      this._downloadURL = null;
      this._treeSignature = '';
      this._serial = ++editorSerial;
    }

    static parseNumber(value, positive) { return finiteInput(value, positive === true); }
    static parseSceneJSON(text, factories) { return parseScene(text, factories || {}); }

    _active() {
      if (!this.mounted || this.destroyed) throw new Error('mount()로 열린 에디터에서만 작업할 수 있습니다.');
    }

    _leaf(element, text) {
      if (element.children.length !== 0) throw new Error('리프 노드에만 텍스트를 쓸 수 있습니다.');
      element.textContent = text;
      return element;
    }

    _element(tag, className, text) {
      const element = this.document.createElement(tag);
      if (className) element.className = className;
      if (text !== undefined) this._leaf(element, text);
      return element;
    }

    _listen(element, type, listener) {
      element.addEventListener(type, listener);
      this._listeners.push(() => element.removeEventListener(type, listener));
    }

    _button(text, action) {
      const button = this._element('button', 'fdg-editor-button', text);
      button.type = 'button';
      this._listen(button, 'click', () => this._run(action));
      return button;
    }

    _notice(message, error) {
      if (!this.status) return;
      this._leaf(this.status, message);
      this.status.dataset.error = error ? 'true' : 'false';
    }

    _run(action) {
      if (!this.mounted || this.destroyed) return;
      try { action(); }
      catch (error) {
        this._notice(error instanceof Error ? error.message : '작업을 완료하지 못했습니다.', true);
        this._syncInspector(true);
      }
    }

    _nodes() {
      const entries = [];
      const stack = [{ node: this.tree.root, depth: 0 }];
      const seen = new Set();
      while (stack.length) {
        const entry = stack.pop();
        if (seen.has(entry.node)) throw new Error('씬 트리에 순환 참조가 있습니다.');
        seen.add(entry.node);
        entries.push(entry);
        const children = entry.node.children;
        for (let i = children.length - 1; i >= 0; i--) {
          stack.push({ node: children[i], depth: entry.depth + 1 });
        }
      }
      return entries;
    }

    mount() {
      if (this.destroyed) throw new Error('종료한 에디터는 다시 열 수 없습니다.');
      if (this.mounted) return this;
      this.shell = this._element('section', 'fdg-editor-shell');
      this.shell.setAttribute('aria-label', 'FDG Engine 씬 에디터');
      const toolbar = this._element('div', 'fdg-editor-toolbar');
      this.playButton = this._button('재생', () => this.play());
      this.pauseButton = this._button('일시정지', () => this.pause());
      this.stepButton = this._button('한 스텝', () => this.step());
      this.addButton = this._button('+ Node', () => this.addNode());
      this.deleteButton = this._button('선택 삭제', () => this.deleteSelected());
      toolbar.append(this.playButton, this.pauseButton, this.stepButton, this.addButton, this.deleteButton);

      const panels = this._element('div', 'fdg-editor-panels');
      const treePanel = this._element('section', 'fdg-editor-tree');
      treePanel.appendChild(this._element('h2', '', '씬 트리'));
      this.treeList = this._element('div', 'fdg-tree-list');
      this.treeList.setAttribute('role', 'group');
      this.treeList.setAttribute('aria-label', '노드 선택');
      this._listen(this.treeList, 'click', event => {
        const button = event.target.closest('button[data-node-id]');
        if (button && this.treeList.contains(button)) this._run(() => this.select(button.dataset.nodeId));
      });
      this._listen(this.treeList, 'keydown', event => {
        if (event.key === 'Delete' && event.target.tagName === 'BUTTON') {
          event.preventDefault();
          this._run(() => this.deleteSelected());
        }
      });
      treePanel.appendChild(this.treeList);

      const inspector = this._element('section', 'fdg-editor-inspector');
      inspector.appendChild(this._element('h2', '', '속성'));
      this.identity = this._element('p', 'fdg-editor-identity');
      inspector.appendChild(this.identity);
      this.fields = {};
      this._field(inspector, 'name', '이름', 'text');
      this._field(inspector, 'x', '위치 X', 'number', '0.1');
      this._field(inspector, 'y', '위치 Y', 'number', '0.1');
      this._field(inspector, 'z', '높이 Z', 'number', '0.1');
      this._field(inspector, 'rotation', '회전 (rad)', 'number', '0.01');
      this._field(inspector, 'scaleX', '크기 X', 'number', '0.05');
      this._field(inspector, 'scaleY', '크기 Y', 'number', '0.05');
      this._field(inspector, 'visible', '표시', 'checkbox');
      panels.append(treePanel, inspector);

      const jsonPanel = this._element('section', 'fdg-editor-json');
      jsonPanel.appendChild(this._element('h2', '', '씬 JSON'));
      const jsonActions = this._element('div', 'fdg-editor-json-actions');
      jsonActions.append(this._button('JSON 내보내기', () => this.exportJSON()),
        this._button('입력 JSON 가져오기', () => this.importJSON(this.json.value)),
        this._button('JSON 파일 열기', () => this.fileInput.click()));
      this.fileInput = this._element('input');
      this.fileInput.type = 'file';
      this.fileInput.accept = '.json,application/json';
      this.fileInput.hidden = true;
      this._listen(this.fileInput, 'change', () => this._importFile());
      this.json = this._element('textarea', 'fdg-editor-json-text');
      this.json.setAttribute('aria-label', '씬 JSON 입력 및 내보내기 대안');
      this._listen(this.json, 'input', () => { this._revision++; });
      this.json.spellcheck = false;
      this.json.maxLength = JSON_LIMIT;
      this.json.rows = 8;
      jsonPanel.append(jsonActions, this.fileInput, this.json);

      this.status = this._element('p', 'fdg-editor-status');
      this.status.setAttribute('role', 'status');
      this.status.setAttribute('aria-live', 'polite');
      this.shell.append(toolbar, panels, jsonPanel, this.status);
      this.renderer.setTree(this.tree);
      this.rootElement.appendChild(this.shell);
      this.mounted = true;
      this.refresh();
      this._notice('FDG Engine · 노드를 선택해 씬을 편집하세요.');
      return this;
    }

    _field(parent, key, labelText, type, step) {
      const container = this._element('div', 'fdg-editor-field');
      const label = this._element('label', '', labelText);
      const input = this._element('input');
      input.type = type;
      input.id = 'fdg-' + this._serial + '-' + key;
      label.htmlFor = input.id;
      if (step) input.step = step;
      if (key === 'name') input.maxLength = 200;
      this.fields[key] = input;
      this._listen(input, 'input', () => { this._revision++; });
      this._listen(input, 'change', () => this._run(() => this._editField(key, input)));
      container.append(label, input);
      parent.appendChild(container);
    }

    _syncTree(entries) {
      const signature = JSON.stringify(entries.map(entry =>
        [entry.node.id, entry.node.name, entry.node.type, entry.depth]));
      if (signature !== this._treeSignature) {
        const focusId = this.treeList.contains(this.document.activeElement) ?
          this.document.activeElement.dataset.nodeId : null;
        const buttons = entries.map(entry => {
          const node = entry.node;
          const button = this._element('button', 'fdg-tree-node', node.name + ' · ' + node.type);
          button.type = 'button';
          button.dataset.nodeId = node.id;
          button.style.paddingInlineStart = (12 + entry.depth * 14) + 'px';
          return button;
        });
        this.treeList.replaceChildren(...buttons);
        this._treeSignature = signature;
        if (focusId) {
          const button = buttons.find(value => value.dataset.nodeId === focusId);
          if (button) button.focus();
        }
      }
      for (const button of this.treeList.children) {
        const selected = !!this.selected && button.dataset.nodeId === this.selected.id;
        button.setAttribute('aria-pressed', String(selected));
        button.classList.toggle('is-selected', selected);
      }
    }

    _syncInspector(force) {
      if (!this.fields) return;
      const node = this.selected;
      this._leaf(this.identity, node ? node.type + ' · ' + node.id : '선택한 노드가 없습니다.');
      for (const [key, input] of Object.entries(this.fields)) {
        input.disabled = !node;
        if (!force && this.document.activeElement === input) continue;
        if (key === 'visible') input.checked = !!node && node.visible;
        else if (!node) input.value = '';
        else if (key === 'name') input.value = node.name;
        else if (key === 'rotation') input.value = String(node.rotation);
        else if (key === 'scaleX') input.value = String(node.scale.x);
        else if (key === 'scaleY') input.value = String(node.scale.y);
        else input.value = String(node.position[key]);
      }
    }

    refresh() {
      if (!this.mounted || this.destroyed) return this;
      const entries = this._nodes();
      const selectionChanged = !!this.selected && !entries.some(entry => entry.node === this.selected);
      if (selectionChanged) this.selected = this.tree.root;
      this._syncTree(entries);
      this._syncInspector(selectionChanged);
      this.playButton.disabled = !this.tree.paused;
      this.pauseButton.disabled = this.tree.paused;
      this.deleteButton.disabled = !this.selected || this.selected === this.tree.root;
      return this;
    }

    _render() { this.renderer.render(this.tree); }

    _changed(message) {
      this._revision++;
      this.refresh();
      let warning = null;
      if (this.onTreeChange) {
        try { this.onTreeChange(this.tree); }
        catch (error) { warning = '씬은 변경됐지만 변경 알림에 오류가 있습니다.'; }
      }
      try { this._render(); }
      catch (error) { warning = '씬은 변경됐지만 화면을 그리지 못했습니다.'; }
      this._notice(warning || message, !!warning);
    }

    select(nodeOrId) {
      this._active();
      const entries = this._nodes();
      const node = nodeOrId === null ? null : entries.find(entry =>
        typeof nodeOrId === 'string' ? entry.node.id === nodeOrId : entry.node === nodeOrId)?.node;
      if (nodeOrId !== null && !node) throw new Error('현재 씬에 속한 노드만 선택할 수 있습니다.');
      this.selected = node;
      this._revision++;
      this.refresh();
      this._syncInspector(true);
      return node;
    }

    _editField(key, input) {
      const node = this.selected;
      if (!node || !this._nodes().some(entry => entry.node === node)) throw new Error('노드를 먼저 선택해 주세요.');
      let value;
      if (key === 'visible') value = input.checked;
      else if (key === 'name') {
        value = input.value.trim();
        if (!value || value.length > 200) throw new RangeError('이름은 1~200자여야 합니다.');
      } else value = finiteInput(input.value, false);
      if (key === 'name' || key === 'rotation' || key === 'visible') node[key] = value;
      else if (key === 'scaleX') node.scale.x = value;
      else if (key === 'scaleY') node.scale.y = value;
      else node.position[key] = value;
      this.tree.paused = true;
      this._changed('속성을 변경했습니다. 씬은 일시정지 상태입니다.');
    }

    play() {
      this._active();
      this.tree.paused = false;
      this._revision++;
      this.refresh();
      this._notice('재생 중입니다.');
    }

    pause() {
      this._active();
      this.tree.paused = true;
      this._revision++;
      this.refresh();
      this._notice('일시정지했습니다.');
    }

    step() {
      this._active();
      this.tree.paused = true;
      this.tree.stepOnce();
      this._revision++;
      this.refresh();
      this._render();
      this._notice('고정 스텝 한 번 진행했습니다 (' + this.tree.fixedStep + '초).');
    }

    addNode() {
      this._active();
      if (!FDG.Node) throw new Error('FDG Node가 먼저 로드되어야 합니다.');
      const parent = this.selected || this.tree.root;
      if (!this._nodes().some(entry => entry.node === parent)) throw new Error('현재 씬의 부모 노드가 필요합니다.');
      const node = new FDG.Node({ name: 'Node ' + this._nextNodeNumber });
      parent.addChild(node);
      this._nextNodeNumber++;
      this.selected = node;
      this.tree.paused = true;
      this._syncInspector(true);
      this._changed('Node를 추가했습니다.');
      return node;
    }

    deleteSelected() {
      this._active();
      const node = this.selected;
      if (!node || node === this.tree.root) throw new Error('루트 노드는 삭제할 수 없습니다.');
      if (!this._nodes().some(entry => entry.node === node)) throw new Error('현재 씬의 노드만 삭제할 수 있습니다.');
      const parent = node.parent;
      parent.removeChild(node);
      this.selected = parent;
      this.tree.paused = true;
      this._syncInspector(true);
      this._changed('선택한 노드와 하위 노드를 삭제했습니다.');
    }

    importJSON(text) {
      this._active();
      const next = parseScene(text, this.factories);
      assertTree(next);
      next.paused = true;
      const previous = this.tree;
      try { this.renderer.setTree(next); }
      catch (error) {
        try { this.renderer.setTree(previous); } catch (ignored) { /* renderer owns its failure state */ }
        throw error;
      }
      this._importToken++;
      this.tree = next;
      this.selected = next.root;
      this._treeSignature = '';
      this._syncInspector(true);
      this._changed('씬을 가져왔습니다. 일시정지 상태로 열었습니다.');
      return next;
    }

    async _importFile() {
      const file = this.fileInput.files && this.fileInput.files[0];
      this.fileInput.value = '';
      if (!file) return;
      const token = ++this._importToken;
      const revision = this._revision;
      const tree = this.tree;
      try {
        if (file.size > JSON_LIMIT) throw new RangeError('JSON 파일은 1,000,000바이트 이하로 선택해 주세요.');
        const text = await file.text();
        if (!this.mounted || this.destroyed || token !== this._importToken) return;
        if (tree !== this.tree || revision !== this._revision) {
          this._notice('파일을 읽는 동안 씬이나 선택이 바뀌어 가져오기를 취소했습니다.', true);
          return;
        }
        this.importJSON(text);
      } catch (error) {
        if (this.mounted && !this.destroyed && token === this._importToken) {
          this._notice(error instanceof Error ? error.message : '파일을 가져오지 못했습니다.', true);
        }
      }
    }

    exportJSON() {
      this._active();
      const text = JSON.stringify(this.tree.toJSON(), null, 2);
      if (text.length > JSON_LIMIT) throw new RangeError('씬 JSON이 내보내기 한도를 넘었습니다.');
      this.json.value = text;
      const view = this.document.defaultView || global;
      if (!view.URL || typeof view.URL.createObjectURL !== 'function' || typeof view.Blob !== 'function') {
        this._notice('아래 JSON을 복사해 저장할 수 있습니다.');
        return text;
      }
      if (this._downloadURL) view.URL.revokeObjectURL(this._downloadURL);
      this._downloadURL = view.URL.createObjectURL(new view.Blob([text], { type: 'application/json' }));
      const link = this._element('a');
      link.href = this._downloadURL;
      link.download = 'fdg-scene.json';
      link.hidden = true;
      this.shell.appendChild(link);
      try { link.click(); }
      finally { link.remove(); }
      this._notice('다운로드를 요청했습니다. 아래 JSON을 복사해 저장할 수도 있습니다.');
      return text;
    }

    snapshot() {
      return Object.freeze({ mounted: this.mounted, destroyed: this.destroyed, paused: this.tree.paused,
        selectedId: this.selected ? this.selected.id : null, nodeCount: this._nodes().length,
        fixedStep: this.tree.fixedStep, revision: this._revision });
    }

    destroy() {
      if (this.destroyed) return;
      this._importToken++;
      for (const remove of this._listeners) remove();
      this._listeners.length = 0;
      const view = this.document.defaultView || global;
      if (this._downloadURL && view.URL) view.URL.revokeObjectURL(this._downloadURL);
      this._downloadURL = null;
      if (this.shell) this.shell.remove();
      this.selected = null;
      this.mounted = false;
      this.destroyed = true;
    }
  }

  FDG.Editor = Editor;
  if (typeof module !== 'undefined' && module.exports) module.exports = FDG;
})(globalThis);
