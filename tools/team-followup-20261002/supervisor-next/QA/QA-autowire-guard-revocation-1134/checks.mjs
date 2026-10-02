// AUTONOMOUS MEMORY WORK (allowNewOwnedFiles=false) — scratchpad only, 0 repo files, real source file UNMODIFIED.
// 감독 수정 피드백 이행: actual bootstrap(browser-bootstrap-api.js)에 자동 guard-revocation 패치를 연결하고,
// fixture에서 revoke 직접호출 없이 '실제 두 caller'(정상 uninstall / 설치실패 rollback)만으로
// 포획 함수(savedCreate) postcall 생성=0 과 foreign descriptor 보존을 검수한다.
// 이전 5/6/8 검사 반복 0. 실제 factory/createReview binding 사용.

import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import path from 'node:path';

const ITEM = '/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261001/ITEM';
const API_PATH = path.join(ITEM, 'browser-bootstrap-api.js');
const INTEG_PATH = path.join(ITEM, 'browser-host/persistence-integration-port.js');
const MK_PATH = path.join(ITEM, 'browser-host/mk-item-fixture.js');
const PROP = '_d10PersistenceReviewPort';
const sha = s => createHash('sha256').update(s).digest('hex');

const realText = readFileSync(API_PATH, 'utf8');

// ---- 최소 자동 guard-revocation 패치 (문자열 변환, 실제 파일 미수정) ----
function applyAll(src) {
  const counts = {wrap: 0, uninstall: 0, catch: 0};
  let out = src.replace(
    "  const installed={value:port,writable:true,configurable:true,enumerable:original?.enumerable??false};\n  let active=false;",
    m => { counts.wrap++; return (
      "  let revoked=false;\n" +
      "  const _guard=fn=>(...a)=>{if(revoked)throw new Error('포트 수명 종료 · 포획 함수 호출 금지');return fn.apply(port,a);};\n" +
      "  const _guardedPort=Object.freeze({status:port.status,enabled:port.enabled,runtimeReady:port.runtimeReady,createReview:_guard(port.createReview),readItem:_guard(port.readItem),restoreItem:_guard(port.restoreItem),serializeItem:_guard(port.serializeItem)});\n" +
      "  const installed={value:_guardedPort,writable:true,configurable:true,enumerable:original?.enumerable??false};\n  let active=false;"
    ); });
  out = out.replace(
    "      if(!active)return Object.freeze({status:'already-uninstalled'});\n" +
    "      if(!same(descriptor(host),installed)){\n" +
    "        active=false;installations.delete(host);return Object.freeze({status:'foreign-preserved'});\n" +
    "      }\n" +
    "      restore();active=false;installations.delete(host);return Object.freeze({status:'restored'});",
    m => { counts.uninstall++; return (
      "      if(!active){revoked=true;return Object.freeze({status:'already-uninstalled'});}\n" +
      "      if(!same(descriptor(host),installed)){\n" +
      "        active=false;revoked=true;installations.delete(host);return Object.freeze({status:'foreign-preserved'});\n" +
      "      }\n" +
      "      restore();active=false;revoked=true;installations.delete(host);return Object.freeze({status:'restored'});"
    ); });
  out = out.replace(
    "  }catch(error){\n    active=false;installations.delete(host);",
    m => { counts.catch++; return "  }catch(error){\n    active=false;revoked=true;installations.delete(host);"; });
  return {out, counts};
}

const {out: patchedText, counts} = applyAll(realText);
if (counts.wrap !== 1 || counts.uninstall !== 1 || counts.catch !== 1) {
  console.log('PATCH_ANCHOR_FAIL', JSON.stringify(counts)); process.exit(2);
}

async function loadModule(text, id) {
  const m = new vm.SourceTextModule(text, {context: vm.createContext({}), identifier: id});
  await m.link(() => { throw new Error('no imports'); });
  await m.evaluate();
  return m.namespace;
}
const real = await loadModule(realText, 'api-real');
const fixed = await loadModule(patchedText, 'api-patched');
const {createD10PersistenceIntegration} = await import(pathToFileURL(INTEG_PATH).href);
const {createMkItemFixture} = await import(pathToFileURL(MK_PATH).href);

const REQUEST = {proposalOnly: true, uniqueId: 'UI-10', tier: 1, element: 0, baseRarity: 2};
function deps(c, onInstalled) {
  const mk = createMkItemFixture({random: () => { c.rand++; return 0.5; }});
  return {reviewOnly: true,
    createPort: ({mkItem, rng}) => { c.factory++; return createD10PersistenceIntegration({mkItem, rng}); },
    mkItem: (...a) => { c.mkItem++; return mk(...a); }, rng: () => { c.rng++; return 0.5; },
    ...(onInstalled ? {onInstalled} : {})};
}
const snap = h => { const d = Object.getOwnPropertyDescriptor(h, PROP); return d ? {present: true, value: d.value} : {present: false}; };
const uid = x => x && typeof x === 'object' ? x.uniqueId : String(x);
const R = [];

// ===== PATCH-CONTROL: 패치해도 정상 owned 동작 유지 =====
{
  const {installD10Review} = fixed; const h = {}; const c = {factory: 0, mkItem: 0, rng: 0, rand: 0};
  const handle = installD10Review({host: h, ...deps(c)});
  const gp = snap(h).value; const saved = gp.createReview;
  const a = handle.create(REQUEST), b = gp.createReview(REQUEST), d = saved(REQUEST);
  const act = gp.enabled === false && gp.runtimeReady === false && gp.status === 'proposal';
  handle.uninstall();
  R.push({id: 'PATCH-CONTROL', ok: uid(a) === 'UI-10' && uid(b) === 'UI-10' && uid(d) === 'UI-10' && act,
    obs: `handle=${uid(a)} direct=${uid(b)} saved=${uid(d)} activation=${act}`});
}

// ===== PATCH-NORMAL: 실제 handle.uninstall() 만으로 포획 함수 무력화 (fixture revoke 직접호출 0) =====
{
  const {installD10Review} = fixed; const h = {}; const c = {factory: 0, mkItem: 0, rng: 0, rand: 0};
  const handle = installD10Review({host: h, ...deps(c)});
  const saved = snap(h).value.createReview;          // 포획
  const okOwned = uid(saved(REQUEST)) === 'UI-10';
  const close = handle.uninstall();                  // 실제 caller #1 (manual revoke 아님)
  const absent = snap(h).present === false;
  const before = {mkItem: c.mkItem, rng: c.rng};
  let threw = false, msg = ''; try { saved(REQUEST); } catch (e) { threw = true; msg = e.message; }
  const post = {mkItem: c.mkItem - before.mkItem, rng: c.rng - before.rng};
  R.push({id: 'PATCH-NORMAL', ok: okOwned && close.status === 'restored' && absent && threw && post.mkItem === 0 && post.rng === 0,
    obs: `owned=${okOwned} close=${close.status} absent=${absent} postThrew=${threw}(${msg}) postcall mkItem=${post.mkItem} rng=${post.rng}`});
}

// ===== PATCH-ROLLBACK: 설치실패 rollback(catch) 자동 revoke → 잔존 포획 함수 무력화 =====
{
  const {installD10Review} = fixed; const target = {}; let delHits = 0;
  const host = new Proxy(target, {deleteProperty(tt, p) { if (p === PROP) { delHits++; return false; } return Reflect.deleteProperty(tt, p); }});
  const c = {factory: 0, mkItem: 0, rng: 0, rand: 0}; let saved = null, agg = null;
  try { installD10Review({host, ...deps(c, h => { saved = host[PROP].createReview; throw new Error('late-install-failure'); })}); }
  catch (e) { agg = e; }
  const isAgg = agg && agg.constructor.name === 'AggregateError';
  const residual = snap(host).present;               // delete 실패로 guardedPort 잔존
  const before = {mkItem: c.mkItem, rng: c.rng};
  let threw = false, msg = ''; try { saved(REQUEST); } catch (e) { threw = true; msg = e.message; }
  const post = {mkItem: c.mkItem - before.mkItem, rng: c.rng - before.rng};
  R.push({id: 'PATCH-ROLLBACK', ok: isAgg && delHits >= 1 && residual && threw && post.mkItem === 0 && post.rng === 0,
    obs: `AggregateError=${isAgg} delHits=${delHits} residual=${residual} postThrew=${threw}(${msg}) postcall mkItem=${post.mkItem} rng=${post.rng}`});
}

// ===== PATCH-FOREIGN: 타주체 교체 → foreign-preserved descriptor 보존 + 포획 함수 무력화 =====
{
  const {installD10Review} = fixed; const h = {}; const c = {factory: 0, mkItem: 0, rng: 0, rand: 0};
  const handle = installD10Review({host: h, ...deps(c)});
  const saved = snap(h).value.createReview;
  Object.defineProperty(h, PROP, {value: 'FOREIGN-OWNER', writable: true, enumerable: true, configurable: true});
  const close = handle.uninstall();                  // 실제 caller: foreign-preserved 분기
  const after = snap(h);
  let threw = false; try { saved(REQUEST); } catch { threw = true; }
  R.push({id: 'PATCH-FOREIGN', ok: close.status === 'foreign-preserved' && after.present && after.value === 'FOREIGN-OWNER' && threw,
    obs: `close=${close.status} foreignPreserved=${after.value === 'FOREIGN-OWNER'} savedThrew=${threw}`});
}

// ===== REGRESS-UNPATCHED: 동일 시나리오에서 현행(미패치)은 여전히 누수 (delta 확인) =====
{
  const {installD10Review} = real; const h = {}; const c = {factory: 0, mkItem: 0, rng: 0, rand: 0};
  const handle = installD10Review({host: h, ...deps(c)});
  const saved = snap(h).value.createReview;
  handle.uninstall();
  const before = {mkItem: c.mkItem};
  let made = null; try { made = saved(REQUEST); } catch { /* */ }
  const post = c.mkItem - before.mkItem;
  R.push({id: 'REGRESS-UNPATCHED', ok: uid(made) === 'UI-10' && post > 0, defectPersists: uid(made) === 'UI-10',
    obs: `현행 postcall uid=${uid(made)} postcall mkItem=${post} (누수 지속=${uid(made) === 'UI-10'})`});
}

console.log(JSON.stringify({
  realSha: sha(realText), patchedSha: sha(patchedText), patchAnchors: counts,
  node: process.version, checks: R, allPass: R.every(x => x.ok),
}, null, 2));
