#!/usr/bin/env node
/**
 * Meshy AI 3D 모델 생성 스크립트
 *
 * 사용법:
 *   node meshy_generate.js "dark gothic treasure chest"
 *   node meshy_generate.js "medieval iron chest" --refine TASK_ID
 *   node meshy_generate.js --status TASK_ID
 *   node meshy_generate.js --download TASK_ID
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = 'msy_4mruNERfjYUH3AcbPbuVzNSOtni2thvgJobP';
const BASE = 'https://api.meshy.ai/openapi/v2';
const OUT_DIR = path.join(__dirname, 'assets', '3d');

function api(method, endpoint, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE + endpoint);
    const opts = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        'Authorization': 'Bearer ' + API_KEY,
        'Content-Type': 'application/json'
      }
    };
    const req = https.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(dest); });
    }).on('error', e => { fs.unlink(dest, () => {}); reject(e); });
  });
}

async function createPreview(prompt) {
  console.log(`[MESHY] 프리뷰 생성 중: "${prompt}"`);
  const res = await api('POST', '/text-to-3d', {
    mode: 'preview',
    prompt,
    ai_model: 'meshy-6',
    topology: 'quad',
    target_polycount: 30000,
    should_remesh: true,
    target_formats: ['glb'],
    art_style: 'realistic'
  });
  if (res.status >= 400) {
    console.error('[MESHY] 에러:', JSON.stringify(res.data, null, 2));
    process.exit(1);
  }
  const taskId = res.data.result;
  console.log(`[MESHY] Task ID: ${taskId}`);
  console.log(`[MESHY] 상태 확인: node meshy_generate.js --status ${taskId}`);
  console.log(`[MESHY] 다운로드:  node meshy_generate.js --download ${taskId}`);
  return taskId;
}

async function createRefine(previewTaskId) {
  console.log(`[MESHY] 리파인 생성 중 (프리뷰: ${previewTaskId})`);
  const res = await api('POST', '/text-to-3d', {
    mode: 'refine',
    preview_task_id: previewTaskId,
    target_formats: ['glb']
  });
  if (res.status >= 400) {
    console.error('[MESHY] 에러:', JSON.stringify(res.data, null, 2));
    process.exit(1);
  }
  const taskId = res.data.result;
  console.log(`[MESHY] Refine Task ID: ${taskId}`);
  return taskId;
}

async function checkStatus(taskId) {
  const res = await api('GET', `/text-to-3d/${taskId}`);
  const d = res.data;
  console.log(`[MESHY] Task: ${taskId}`);
  console.log(`  상태: ${d.status}  진행: ${d.progress}%`);
  console.log(`  프롬프트: ${d.prompt || '(refine)'}`);
  if (d.status === 'SUCCEEDED' && d.model_urls) {
    console.log(`  GLB: ${d.model_urls.glb || 'N/A'}`);
    Object.keys(d.model_urls).forEach(fmt => {
      console.log(`  ${fmt}: ${d.model_urls[fmt]}`);
    });
  }
  if (d.status === 'FAILED') {
    console.log(`  에러: ${d.task_error?.message || 'unknown'}`);
  }
  return d;
}

async function pollUntilDone(taskId, intervalMs = 10000) {
  console.log(`[MESHY] 완료까지 폴링 중 (${intervalMs / 1000}초 간격)...`);
  while (true) {
    const d = await checkStatus(taskId);
    if (d.status === 'SUCCEEDED') return d;
    if (d.status === 'FAILED') { console.error('[MESHY] 생성 실패!'); process.exit(1); }
    await new Promise(r => setTimeout(r, intervalMs));
  }
}

async function downloadModel(taskId) {
  const d = await checkStatus(taskId);
  if (d.status !== 'SUCCEEDED') {
    console.log('[MESHY] 아직 완료되지 않음. --poll 옵션 사용 또는 나중에 다시 시도.');
    return;
  }
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const [fmt, url] of Object.entries(d.model_urls || {})) {
    if (!url) continue;
    const safe = (d.prompt || taskId).replace(/[^a-zA-Z0-9가-힣_-]/g, '_').slice(0, 40);
    const dest = path.join(OUT_DIR, `${safe}_${taskId.slice(0, 8)}.${fmt}`);
    console.log(`[MESHY] 다운로드: ${fmt} → ${dest}`);
    await download(url, dest);
    console.log(`[MESHY] 완료: ${dest}`);
  }
}

// === CLI ===
async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('사용법:');
    console.log('  node meshy_generate.js "프롬프트"              -- 프리뷰 생성');
    console.log('  node meshy_generate.js "프롬프트" --poll        -- 생성 + 완료까지 대기 + 다운로드');
    console.log('  node meshy_generate.js --refine TASK_ID        -- 리파인 생성');
    console.log('  node meshy_generate.js --status TASK_ID        -- 상태 확인');
    console.log('  node meshy_generate.js --download TASK_ID      -- GLB 다운로드');
    console.log('  node meshy_generate.js --poll TASK_ID          -- 완료까지 대기 + 다운로드');
    return;
  }

  if (args[0] === '--status') return checkStatus(args[1]);
  if (args[0] === '--download') return downloadModel(args[1]);
  if (args[0] === '--refine') {
    const tid = await createRefine(args[1]);
    if (args.includes('--poll')) {
      await pollUntilDone(tid);
      await downloadModel(tid);
    }
    return;
  }
  if (args[0] === '--poll' && args[1]) {
    await pollUntilDone(args[1]);
    await downloadModel(args[1]);
    return;
  }

  // 프롬프트로 프리뷰 생성
  const prompt = args[0];
  const taskId = await createPreview(prompt);
  if (args.includes('--poll')) {
    const d = await pollUntilDone(taskId);
    await downloadModel(taskId);
  }
}

main().catch(e => { console.error('[MESHY] 치명적 에러:', e.message); process.exit(1); });
