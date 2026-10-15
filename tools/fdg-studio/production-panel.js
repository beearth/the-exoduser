import { productionReview } from '../../engine/fdg/production-review.js?v=0.18.1';

const labels = { ready: '기술 준비', review: '보완', blocked: '오류', pending: '미확인' };
const leaf = (tag, text) => { const node = document.createElement(tag); node.textContent = text; return node; };

export class ProductionPanel {
  constructor({ snapshot, navigate, download }) {
    this.snapshot = snapshot; this.navigate = navigate; this.download = download;
    this.dialog = document.getElementById('production-dialog'); this.listeners = [];
    this.listen(document.getElementById('production-open'), 'click', () => this.open());
    this.listen(document.getElementById('production-close'), 'click', () => this.dialog.close());
    this.listen(document.getElementById('production-export'), 'click', () => this.download(this.review(), 'fdg-production-review.json'));
    this.listen(document.getElementById('production-checks'), 'click', event => {
      const button = event.target.closest('[data-production-target]'); if (!button) return;
      this.dialog.close(); this.navigate(button.dataset.productionTarget);
    });
  }
  listen(target, event, callback) { target.addEventListener(event, callback); this.listeners.push([target, event, callback]); }
  review() { const { project, ...options } = this.snapshot(); return productionReview(project, options); }
  refresh() {
    const report = this.review(), counts = report.counts;
    const badge = document.getElementById('production-summary');
    badge.textContent = counts.blocked ? `제작 오류 ${counts.blocked}` : `보완 ${counts.review} · 미확인 ${counts.pending}`;
    badge.classList.toggle('error', counts.blocked > 0);
    if (!this.dialog.open) return;
    document.getElementById('production-project').textContent = `${report.projectId} · 기술 준비 ${counts.ready}/${report.checks.length}`;
    const fragment = document.createDocumentFragment();
    for (const check of report.checks) {
      const row = document.createElement('article'); row.className = `production-check ${check.status}`;
      const heading = document.createElement('div'); heading.append(leaf('strong', check.name), leaf('span', labels[check.status]));
      row.append(heading, leaf('p', check.detail));
      if (check.target) { const button = leaf('button', check.target === 'optimization' ? '측정 열기' : '해당 작업 열기'); button.type = 'button'; button.dataset.productionTarget = check.target; row.append(button); }
      fragment.append(row);
    }
    document.getElementById('production-checks').replaceChildren(fragment);
  }
  open() { this.dialog.showModal(); this.refresh(); }
  dispose() { for (const [target, event, callback] of this.listeners) target.removeEventListener(event, callback); this.listeners.length = 0; }
}
