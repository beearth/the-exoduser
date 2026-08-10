const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'img', 'fdg_intro', 'fdg_reference.png');
const outputDir = path.join(root, 'output');
const prepared = path.join(outputDir, 'fdg_reference_1280x720.png');
const generated = path.join(outputDir, process.env.FDG_VIDEO_RAW_OUTPUT || 'fdg_sora_raw.mp4');
const finalVideo = path.join(outputDir, process.env.FDG_VIDEO_FINAL_OUTPUT || 'fdg_studio_intro_3s.mp4');
const model = process.env.FDG_VIDEO_MODEL || 'sora-2-pro';
const size = '1280x720';
const seconds = '8';
const maxAttempts = Number(process.env.FDG_VIDEO_ATTEMPTS || 3);
const existingVideoId = process.env.FDG_VIDEO_ID || '';
const editSourceVideoId = process.env.FDG_VIDEO_EDIT_SOURCE || '';
const editPrompt = process.env.FDG_VIDEO_EDIT_PROMPT || '';
const prompt = 'Use the supplied 16:9 FDG key visual as the exact first frame. Preserve the wolf emblem, FDG engraving, black iron frame, engraved stone wall, cracks, smoke, and all typography without redesigning or adding anything. Timeline: 0.0 black screen. 0.3 subtle smoke rises from both lower corners. 0.8 faint red light begins inside the existing wall cracks. 1.2 the existing wolf eyes become visible. 1.6 the existing stone wall cracks slowly open a little. 2.0 the existing engraved FDG lettering becomes visible from shadow. 2.3 a thin subdued lava glow travels only through the existing engraved grooves. 2.6 wolf eyes gently glow red. 2.9 a few tiny embers rise. 3.0 fade to black. Slow, restrained AAA dark industrial fantasy studio ident. No new objects, no redraw, no extra text, no explosions, no fire burst, no camera shake, no fast edits.';

const requireKey = () => {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not configured.');
};

const run = (file, args) => execFileSync(file, args, { cwd: root, stdio: 'inherit' });

const prepareReference = () => {
  fs.mkdirSync(outputDir, { recursive: true });
  run('ffmpeg', ['-y', '-i', source, '-vf', 'scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:black', '-frames:v', '1', '-c:v', 'png', prepared]);
};

const readJson = async response => {
  const text = await response.text();
  let body;
  try { body = JSON.parse(text); } catch { body = { raw: text }; }
  if (!response.ok) throw new Error(`OpenAI API ${response.status}: ${JSON.stringify(body)}`);
  return body;
};

const createJob = async () => {
  const form = new FormData();
  form.append('model', model);
  form.append('prompt', prompt);
  form.append('size', size);
  form.append('seconds', seconds);
  form.append('input_reference', new Blob([fs.readFileSync(prepared)], { type: 'image/png' }), 'fdg_reference.png');
  const response = await fetch('https://api.openai.com/v1/videos', { method: 'POST', headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: form });
  return readJson(response);
};

const createEdit = async () => {
  const response = await fetch('https://api.openai.com/v1/videos/edits', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ video: { id: editSourceVideoId }, prompt: editPrompt })
  });
  return readJson(response);
};

const waitForJob = async id => {
  for (;;) {
    const response = await fetch(`https://api.openai.com/v1/videos/${id}`, { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } });
    const job = await readJson(response);
    console.log(`[FDG] ${job.status} ${job.progress ?? 0}%`);
    if (job.status === 'completed') return job;
    if (job.status === 'failed' || job.status === 'expired') throw new Error(`Video job ${job.status}: ${JSON.stringify(job)}`);
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
};

const downloadAndTrim = async id => {
  const response = await fetch(`https://api.openai.com/v1/videos/${id}/content`, { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } });
  if (!response.ok) throw new Error(`Video download failed: ${response.status} ${await response.text()}`);
  fs.writeFileSync(generated, Buffer.from(await response.arrayBuffer()));
  run('ffmpeg', ['-y', '-i', generated, '-t', '3', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', finalVideo]);
};

(async () => {
  requireKey();
  if (!fs.existsSync(source)) throw new Error(`Reference image missing: ${source}`);
  prepareReference();
  if (existingVideoId) {
    console.log(`[FDG] resuming job ${existingVideoId}`);
    await waitForJob(existingVideoId);
    await downloadAndTrim(existingVideoId);
    console.log(`[FDG] complete: ${finalVideo}`);
    return;
  }
  if (editSourceVideoId) {
    if (!editPrompt) throw new Error('FDG_VIDEO_EDIT_PROMPT is required for video edits.');
    console.log(`[FDG] editing job ${editSourceVideoId}`);
    const edited = await createEdit();
    console.log(`[FDG] edit job ${edited.id}`);
    await waitForJob(edited.id);
    await downloadAndTrim(edited.id);
    console.log(`[FDG] complete: ${finalVideo}`);
    return;
  }
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[FDG] submitting ${model} image-to-video job (${attempt}/${maxAttempts})`);
      const created = await createJob();
      console.log(`[FDG] job ${created.id}`);
      await waitForJob(created.id);
      await downloadAndTrim(created.id);
      console.log(`[FDG] complete: ${finalVideo}`);
      return;
    } catch (error) {
      lastError = error;
      console.error(`[FDG] attempt ${attempt} failed: ${error.message}`);
      if (attempt < maxAttempts) await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  throw lastError;
})().catch(error => { console.error(`[FDG] ${error.message}`); process.exitCode = 1; });
