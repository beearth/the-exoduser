// Native Higgsedit DRAFT authoring. No React, render, generated media or upload.
// Root selects exact source trims and supplies already-trimmed CFR30 MP4 files.
// A whole-script build replaces its project timeline: use a fresh draft dir.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import { spawnSync } from "node:child_process";

export const CONTRACT = Object.freeze({
  schemaVersion: 1,
  fps: 30,
  width: 1920,
  height: 1080,
  minSeconds: 30,
  maxSeconds: 40,
  fontFamily: "DM Sans",
  foreground: "#f3efe7",
  muted: "#dedbd4",
  cta: "PLAY THE FREE DEMO ON STEAM",
  stagedLabel: "Staged skill demo · Development build",
  owner: "FDG_TRAILER_REBUILD_20261008_DRAFT",
});

export const ALLOWED_TITLES = Object.freeze({
  parry: "PARRY & COUNTER",
  skills: "UNLEASH YOUR SKILLS",
});

function requireValue(condition, message) {
  if (!condition) throw new Error(`Trailer draft preflight: ${message}`);
}

export function exactFrames(seconds, name) {
  requireValue(typeof seconds === "number" && Number.isFinite(seconds) && seconds >= 0,
    `${name} must be a finite nonnegative number, not an unselected/null value.`);
  const frames = Math.round(seconds * CONTRACT.fps);
  requireValue(Number.isSafeInteger(frames) && Math.abs(frames / CONTRACT.fps - seconds) <= 1e-7,
    `${name} must align exactly to the ${CONTRACT.fps}fps frame grid.`);
  return frames;
}

function inputFile(inputDir, file, name) {
  requireValue(typeof file === "string" && file.trim().length > 0, `${name} file is not selected.`);
  const path = isAbsolute(file) ? resolve(file) : resolve(inputDir, file);
  requireValue(existsSync(path), `missing ${name}: ${path}`);
  return path;
}

function runProbe(file, args, executable) {
  const result = spawnSync(executable, ["-v", "error", ...args, "-of", "json", file], {
    encoding: "utf8", maxBuffer: 64 * 1024 * 1024,
  });
  requireValue(!result.error, `ffprobe could not run: ${result.error?.message || "unknown"}`);
  requireValue(result.status === 0 && !String(result.stderr || "").trim(),
    `ffprobe failed for ${file}: ${String(result.stderr || result.status).trim()}`);
  try { return JSON.parse(result.stdout); }
  catch { throw new Error(`Trailer draft preflight: invalid ffprobe JSON for ${file}`); }
}

function ratio(value) {
  const [n, d = 1] = String(value).split("/").map(Number);
  return d && Number.isFinite(n) ? n / d : NaN;
}

// Validates actual decoded frames and their timestamps, not a claimed duration.
// AAC tails can extend container duration; they do not extend video coverage.
export function probePrepared(file, expectedFrames, executable = "ffprobe") {
  const video = runProbe(file, [
    "-select_streams", "v:0", "-count_frames", "-show_frames", "-show_streams",
    "-show_entries", "stream=codec_name,pix_fmt,width,height,avg_frame_rate,r_frame_rate,nb_read_frames:frame=best_effort_timestamp_time",
  ], executable);
  const stream = video.streams?.[0];
  requireValue(stream && stream.codec_name === "h264" && stream.pix_fmt === "yuv420p",
    `${file} must be a prepared H.264/yuv420p MP4, not a raw VP9/WebM input.`);
  requireValue(stream.width === CONTRACT.width && stream.height === CONTRACT.height,
    `${file} must preserve the complete ${CONTRACT.width}×${CONTRACT.height} frame.`);
  requireValue(ratio(stream.avg_frame_rate) === CONTRACT.fps && ratio(stream.r_frame_rate) === CONTRACT.fps,
    `${file} must declare CFR${CONTRACT.fps}; do not infer source render FPS from this output rate.`);
  requireValue(Number(stream.nb_read_frames) === expectedFrames && video.frames?.length === expectedFrames,
    `${file} has ${stream.nb_read_frames}/${video.frames?.length} decoded frames; expected exactly ${expectedFrames}. Pre-trim this shot first.`);
  for (let i = 0; i < expectedFrames; i += 1) {
    const pts = Number(video.frames[i].best_effort_timestamp_time);
    requireValue(Number.isFinite(pts) && Math.abs(pts - i / CONTRACT.fps) <= 0.00001,
      `${file} frame ${i} has PTS ${pts}; expected zero-based CFR PTS ${i / CONTRACT.fps}.`);
  }
  const all = runProbe(file, ["-show_streams", "-show_entries", "stream=codec_type,codec_name,channels,sample_rate"], executable);
  const audio = all.streams?.filter((s) => s.codec_type === "audio") || [];
  requireValue(audio.length === 1 && audio[0].codec_name === "aac" && Number(audio[0].channels) === 2,
    `${file} must carry exactly one prepared AAC stereo source-game audio track.`);
  return { frames: expectedFrames, fps: CONTRACT.fps, width: stream.width,
    height: stream.height, videoCodec: stream.codec_name, audioCodec: audio[0].codec_name,
    audioSampleRate: Number(audio[0].sample_rate), pts: "ZERO_BASED_CFR_VERIFIED" };
}

export function resolveDraft(manifest, inputDir) {
  requireValue(manifest.schemaVersion === CONTRACT.schemaVersion, "unsupported manifest schemaVersion.");
  requireValue(manifest.status === "DRAFT_SELECTED" && manifest.publication === "DRAFT_ONLY",
    "root must finish selection and set status=DRAFT_SELECTED; publication must remain DRAFT_ONLY.");
  requireValue(manifest.fps === CONTRACT.fps && manifest.width === CONTRACT.width && manifest.height === CONTRACT.height,
    "this draft contract is 1920×1080 at 30fps.");
  requireValue(Array.isArray(manifest.shots) && manifest.shots.length > 0, "select actual shots before build.");
  requireValue(manifest.sources && typeof manifest.sources === "object", "sources provenance inventory is required.");
  const ids = new Set();
  const usedTitles = new Set();
  let cursorFrames = 0;
  const shots = manifest.shots.map((shot, index) => {
    requireValue(typeof shot.id === "string" && /^[a-z0-9_-]+$/.test(shot.id) && !ids.has(shot.id),
      `shot ${index} needs a unique lowercase id.`);
    ids.add(shot.id);
    const source = manifest.sources[shot.source];
    requireValue(source && ["natural", "staged"].includes(shot.type) && source.type === shot.type,
      `${shot.id} source/type must match a natural or staged provenance entry.`);
    requireValue(source.status === "DURABLE_FILE_VERIFIED", `${shot.id} raw provenance is still awaiting a durable-file check.`);
    // from audits the original chosen interval. Native source trim stays ZERO.
    const originalFromFrames = exactFrames(shot.from, `${shot.id}.from`);
    const frames = exactFrames(shot.dur, `${shot.id}.dur`);
    requireValue(frames > 0, `${shot.id}.dur must be positive.`);
    const prepared = inputFile(inputDir, shot.prepared, `${shot.id} prepared`);
    requireValue(/\.mp4$/i.test(prepared), `${shot.id} prepared file must be MP4.`);
    requireValue(shot.title === null || Object.hasOwn(ALLOWED_TITLES, shot.title),
      `${shot.id} title must be null, parry or skills.`);
    let title = null;
    if (shot.title !== null) {
      requireValue(!usedTitles.has(shot.title), `promotional title ${shot.title} can appear only once.`);
      usedTitles.add(shot.title);
      const titleAtFrames = exactFrames(shot.titleAt ?? 9 / CONTRACT.fps, `${shot.id}.titleAt`);
      const titleFrames = exactFrames(shot.titleDur ?? Math.min(2, (frames - titleAtFrames) / CONTRACT.fps), `${shot.id}.titleDur`);
      requireValue(titleFrames >= 18 && titleAtFrames + titleFrames <= frames,
        `${shot.id} title must fit its shot and last at least 18 frames.`);
      title = { key: shot.title, text: ALLOWED_TITLES[shot.title],
        at: titleAtFrames / CONTRACT.fps, dur: titleFrames / CONTRACT.fps };
    }
    const entry = { ...shot, prepared, originalFromFrames, frames,
      nativeFrom: 0, atFrames: cursorFrames, at: cursorFrames / CONTRACT.fps,
      dur: frames / CONTRACT.fps, title };
    cursorFrames += frames;
    return entry;
  });
  requireValue(cursorFrames >= CONTRACT.minSeconds * CONTRACT.fps && cursorFrames <= CONTRACT.maxSeconds * CONTRACT.fps,
    `selected footage must total ${CONTRACT.minSeconds}–${CONTRACT.maxSeconds}s; no silent filler is appended.`);
  const closing = shots[shots.length - 1];
  requireValue(manifest.cta?.shotId === closing.id && closing.title === null,
    "CTA must reference the final prepared gameplay shot, without a second promotional title.");
  requireValue(closing.frames >= 2 * CONTRACT.fps && closing.frames <= 4 * CONTRACT.fps,
    "select a readable 2–4s closing gameplay shot for the logo/Steam CTA.");
  requireValue(manifest.assets?.logo?.verifiedOriginal === true,
    "verify the existing original game logo; generated/logo-text substitutions are not allowed.");
  const logo = inputFile(inputDir, manifest.assets.logo.file, "original game logo");
  requireValue(/\.(png|jpe?g|webp)$/i.test(logo), "original logo must be a native image input.");
  return { shots, logo, closing, frames: cursorFrames, duration: cursorFrames / CONTRACT.fps };
}

// Supported native opacity keyframes; local time, no callback/HTML/CSS runtime.
function shortFade(dur) {
  const edge = 6 / CONTRACT.fps;
  return [{ property: "opacity", keyframes: [
    { at: 0, value: 0, easing: "linear" },
    { at: edge, value: 1, easing: "linear" },
    { at: dur - edge, value: 1, easing: "linear" },
    { at: dur, value: 0 },
  ] }];
}

function titleNode(text, dur) {
  return <frame width={CONTRACT.width} height={CONTRACT.height} layout="none">
    <text x={96} y={72} width={1728} height={64} fontFamily={CONTRACT.fontFamily}
      fontSize={38} fontWeight={700} color={CONTRACT.foreground}
      strokeColor="#111111" strokeWidth={1}
      shadow={{ x: 0, y: 2, blur: 5, color: "#000000" }}
      animate={shortFade(dur)}>{text}</text>
  </frame>;
}

function stagedNode() {
  return <frame width={CONTRACT.width} height={CONTRACT.height} layout="none">
    <text x={96} y={1006} width={1728} height={34} fontFamily={CONTRACT.fontFamily}
      fontSize={20} color={CONTRACT.muted} strokeColor="#111111" strokeWidth={1}
      shadow={{ x: 0, y: 1, blur: 4, color: "#000000" }}>{CONTRACT.stagedLabel}</text>
  </frame>;
}

function ctaNode(logo, dur) {
  // Transparent composition over the final actual gameplay shot, retaining its
  // original audio. Root selects a calm readable close, not a battle obscured by a logo.
  return <frame width={CONTRACT.width} height={CONTRACT.height} layout="none">
    <frame x={500} y={250} width={920} height={450} layout="column" animate={shortFade(dur)}>
      <media file={logo} fit="contain" width="fill" height="fill" />
    </frame>
    <text x={192} y={840} width={1536} height={76} align="center" fontFamily={CONTRACT.fontFamily}
      fontSize={48} fontWeight={700} color={CONTRACT.foreground}
      strokeColor="#111111" strokeWidth={1}
      shadow={{ x: 0, y: 2, blur: 5, color: "#000000" }}
      animate={shortFade(dur)}>{CONTRACT.cta}</text>
  </frame>;
}

export default async ({ project }) => {
  const inputDir = process.env.EXODUSER_REBUILD_INPUT_DIR;
  const manifestPath = process.env.EXODUSER_REBUILD_MANIFEST;
  const projectDir = process.env.EXODUSER_REBUILD_PROJECT_DIR;
  requireValue(inputDir && manifestPath && projectDir,
    "set EXODUSER_REBUILD_INPUT_DIR, EXODUSER_REBUILD_MANIFEST and a fresh EXODUSER_REBUILD_PROJECT_DIR.");
  const manifest = JSON.parse(readFileSync(resolve(manifestPath), "utf8"));
  const plan = resolveDraft(manifest, resolve(inputDir));
  const ffprobe = process.env.EXODUSER_FFPROBE || "ffprobe";
  const validated = {};
  for (const shot of plan.shots) {
    const key = `${shot.prepared}:${shot.frames}`;
    if (!validated[key]) validated[key] = probePrepared(shot.prepared, shot.frames, ffprobe);
  }
  const output = resolve(projectDir);
  const markerPath = resolve(output, "fdg-draft-owner.json");
  if (existsSync(resolve(output, "project.json"))) {
    const owned = existsSync(markerPath) && JSON.parse(readFileSync(markerPath, "utf8")).owner === CONTRACT.owner;
    requireValue(owned && process.env.EXODUSER_REBUILD_REPLACE_OWN_DRAFT === "1",
      "existing project refused. Choose a fresh draft dir, or explicitly rebuild this script's own marked draft.");
  }
  // All selected files/frame counts/timestamps are checked BEFORE project mutation.
  mkdirSync(dirname(output), { recursive: true });
  const p = await project({ dir: output, size: "1920x1080", fps: CONTRACT.fps, background: "#08090c" });
  const handles = new Map();
  for (const shot of plan.shots) {
    if (!handles.has(shot.prepared)) handles.set(shot.prepared, await p.add(shot.prepared));
  }
  const logo = await p.add(plan.logo);
  for (const shot of plan.shots) {
    // Prepared clip begins at original `from`, already trimmed/reset to PTS0.
    // Native `from:0` avoids the previously observed VP9 source-time problem.
    p.cut(handles.get(shot.prepared), { from: 0, dur: shot.dur, at: shot.at, fit: "contain" });
    if (shot.type === "staged") p.compose(stagedNode(), { at: shot.at, dur: shot.dur, name: `${shot.id}-staged` });
    if (shot.title) p.compose(titleNode(shot.title.text, shot.title.dur), {
      at: shot.at + shot.title.at, dur: shot.title.dur, name: `${shot.id}-title`,
    });
  }
  p.compose(ctaNode(logo, plan.closing.dur), {
    at: plan.closing.at, dur: plan.closing.dur, name: "final-steam-cta",
  });
  writeFileSync(markerPath, JSON.stringify({ owner: CONTRACT.owner, publication: "DRAFT_ONLY" }, null, 2) + "\n");
  writeFileSync(resolve(output, "fdg-selected-build-plan.json"), JSON.stringify({
    status: "NATIVE_DRAFT_AUTHORED_NOT_RENDERED", publication: "DRAFT_ONLY",
    manifest: resolve(manifestPath), projectDir: output, frames: plan.frames,
    duration: plan.duration, fps: CONTRACT.fps, size: "1920x1080",
    shots: plan.shots.map(({ id, source, type, from, dur, prepared, nativeFrom, atFrames, frames, title }) =>
      ({ id, source, type, originalFrom: from, dur, prepared, nativeFrom, atFrames, frames, title })),
    cta: { at: plan.closing.at, dur: plan.closing.dur, overGameplay: true, originalAudioRetained: true },
    preparedValidation: validated,
    renderPerformed: false, visualReview: "PENDING_ROOT", fullListening: "PENDING_ROOT",
    userApproval: "PENDING", uploaded: false,
  }, null, 2) + "\n");
  console.log(JSON.stringify({ status: "DRAFT_AUTHORED_NOT_RENDERED", projectDir: output,
    duration: plan.duration, frames: plan.frames,
    next: "Root inspects the native timeline/frames, renders, and performs full viewing/listening. No automatic publication." }));
};
