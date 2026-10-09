/**
 * EXODUSER new-version EN master — native Higgsedit authoring ONLY.
 * Read video-editing/SKILL.md and references/{compose,caption-titling,assembly}.md.
 * No React/DOM, generated footage, download, render, upload or publication.
 *
 * Usage, in the native CLI environment (root owns execution):
 *   1. Create a fresh production directory; copy this script and the completed
 *      shot-plan.template.json there as edit.jsx and shot-plan.json.
 *   2. Under input/, supply originallogo.png, dm-sans-400.woff2,
 *      dm-sans-700.woff2 and DM-Sans-OFL.txt from the approved existing assets.
 *      The three media/font files must match ORIGINAL_ASSETS below exactly.
 *   3. Supply current migration H.264/yuv420p 1920x1080 MP4s and exact source
 *      audits. NORMAL_PLAY and the game's own NORMAL_TUTORIAL are accepted.
 *      Encoded ~29.7fps/VFR is accepted: p.cut uses real source seconds at speed1;
 *      only the OUTPUT timeline is30fps. No automatic retime or transcode.
 *      expectedBuilds may list multiple exact approved capture snapshots during
 *      concurrent development. Legacy single expectedBuild remains supported.
 *   4. For a review render use status=REVIEW_CANDIDATE and explicitly retain
 *      unapproved/UNHEARD states. Inspect each chosen visual interval first.
 *      APPROVED_FOR_BUILD additionally
 *      requires actual source/shot audio PASS and final/CTA approval evidence.
 *   5. EXODUSER_PRODUCTION_DIR=/absolute/fresh-package higgsedit build edit.jsx
 *      ffprobe must be installed; EXODUSER_FFPROBE may name its executable.
 *      Output is always <EXODUSER_PRODUCTION_DIR>/project. That path MUST NOT
 *      already exist. Rebuilds require a new production directory.
 *
 * Source gate: missing files, version/hash mismatches, agent-added enemies or
 * agent-altered combat values fail in BOTH modes. No silent filtering, old3333,
 * staged/test footage or placeholder sources. Candidate items may explicitly
 * remain REVIEW_CANDIDATE/approved=false; this never grants publication approval.
 * Each source's file SHA, audit SHA identity, current checkout/commit/game hash,
 * capture kind, frame timestamps, dimensions and audio presence are checked
 * BEFORE project creation. Audits and shot reviews are human-authored evidence;
 * this script validates their consistency, not the truth of a gameplay claim.
 * Candidate audio may remain UNHEARD (or absent), recorded as a publication
 * blocker. It does not prevent building a movie for actual viewing/listening.
 * The incomplete template still fails on missing identities/intervals/files.
 *
 * Shot order is ascending manifest.order; output positions are cumulative actual
 * durations, never suggested markers. Total INCLUDING the4s endcard is18–50s;
 * prefer14–20s of good combat plus4s branding over padding. STATIC is the default
 * native brand endcard. OVER_GAMEPLAY is optional and requires a clear last4s.
 * Only parry and kiSlash may carry one short caption each, 2–3s, outside the CTA.
 * Whole-frame contain is the default. Explicit shot.crop is a source-pixel16:9
 * rectangle, permitted ONLY with crop.visualPass=true and actual review evidence.
 * A clipped native media overlay renders that rectangle while the unmuted
 * original p.cut spine retains audio; source files are never rewritten.
 * No implicit crop, zoom, interpolation, extra BGM or gameplay modification.
 * This script produces the EN master. A KO version needs a separately reviewed
 * Noto Sans KR input/type setup; it must not substitute DM Sans for Korean.
 *
 * On native import/authoring failure the fresh partial project is retained for
 * diagnosis; never point this script at an existing/shared project to retry.
 * OFL travels with the fonts in any subsequent editable-package delivery.
 */
import { existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";

export const CONTRACT = Object.freeze({
  schemaVersion: 1, fps: 30, width: 1920, height: 1080,
  minFrames: 540, maxFrames: 1500, endcardFrames: 120,
  checkout: "/Users/fordeargamers/Projects/exoduser-migration-20261001",
  foreground: "#f1eee6", secondary: "#dedbd4",
});

export const ORIGINAL_ASSETS = Object.freeze({
  logo: { file: "input/originallogo.png", sha256: "f11cba79c2527b16787df38c15eaa134b761195f3c0190e49b87daa631e49205" },
  regular: { file: "input/dm-sans-400.woff2", sha256: "f0a0ffc3882838b72d83fb011910b6c0f603f86c3ecbd2d1c1b5f3f9fcaed0a1" },
  bold: { file: "input/dm-sans-700.woff2", sha256: "d91b32eb570dce33ede97c7513b4dc465b9f5691edf5c532872d3f62959b1117" },
});
export const COPY = Object.freeze({ parry: "PARRY. STRIKE BACK.", kiSlash: "CHARGE. CUT THROUGH." });
const SHA = /^[0-9a-f]{64}$/;
const COMMIT = /^[0-9a-f]{40}$/;
const ROLES = new Set(["hook", "combat", "parry", "kiSlash", "magic", "trap", "movement", "closing"]);

function demand(ok, message) {
  if (!ok) throw new Error(`EXODUSER production preflight: ${message}`);
}
function nonempty(value) { return typeof value === "string" && value.trim().length > 0; }
function integer(value, minimum = 0) { return Number.isSafeInteger(value) && value >= minimum; }
function digest(file) { return createHash("sha256").update(readFileSync(file)).digest("hex"); }
function inside(base, file) {
  const rel = relative(base, file);
  return rel !== "" && !isAbsolute(rel) && rel !== ".." && !rel.startsWith(`..${sep}`);
}
function inputFile(base, name, label) {
  demand(nonempty(name) && !isAbsolute(name) && !/^[a-z][a-z0-9+.-]*:/i.test(name), `${label}: use a package-relative file, not a URL/absolute path.`);
  const lexical = resolve(base, name);
  demand(inside(base, lexical) && existsSync(lexical), `${label}: missing/outside-package input ${name}.`);
  const actual = realpathSync(lexical);
  demand(inside(base, actual) && lstatSync(actual).isFile(), `${label}: input must be a regular file inside the package.`);
  return actual;
}
function jsonFile(file, label) {
  try { return JSON.parse(readFileSync(file, "utf8")); }
  catch (error) { throw new Error(`EXODUSER production preflight: invalid ${label}: ${error.message}`); }
}
function sameBuild(build, expected, label) {
  const allowed = Array.isArray(expected) ? expected : [expected];
  const match = allowed.find(item => build?.checkout === item?.checkout && build?.commit === item?.commit &&
    build?.gameSha256 === item?.gameSha256);
  demand(match, `${label}: version mismatch against the explicit allowed build snapshot(s).`);
  return match;
}
function approval(item, label, candidate = false) {
  demand(candidate
    ? ["REVIEW_CANDIDATE", "PASS"].includes(item?.status) && typeof item?.approved === "boolean"
    : item?.approved === true && item?.status === "PASS",
    `${label}: ${candidate ? "explicit REVIEW_CANDIDATE/PASS status and boolean approved are required" : "approved=true and status=PASS are required"}.`);
}
function sourceSeconds(item) {
  if (typeof item?.fromSeconds === "number" && Number.isFinite(item.fromSeconds) && item.fromSeconds >= 0) return item.fromSeconds;
  // Legacy fromFrame is a30fps EDIT-TIME tick, never a decoded source-frame index.
  return integer(item?.fromFrame) ? item.fromFrame / 30 : NaN;
}
function ratio(value) {
  const [a, b = 1] = String(value).split("/").map(Number);
  return Number.isFinite(a) && Number.isFinite(b) && b !== 0 ? a / b : NaN;
}

// Decode to check real timestamp coverage. A real29.7fps/VFR capture is not
// falsely labelled CFR30 or stretched to30 source frames per second.
export function probeSource(file, executable = process.env.EXODUSER_FFPROBE || "ffprobe") {
  const run = spawnSync(executable, ["-v", "error", "-show_streams", "-show_frames", "-show_entries",
    "stream=codec_type,codec_name,pix_fmt,width,height,r_frame_rate,avg_frame_rate,start_time,duration,sample_rate,channels:frame=media_type,best_effort_timestamp_time,pkt_duration_time",
    "-of", "json", file], { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  demand(!run.error && run.status === 0 && !String(run.stderr || "").trim(),
    `ffprobe/decode failed for ${file}: ${run.error?.message || String(run.stderr || run.status).trim()}.`);
  let result;
  try { result = JSON.parse(run.stdout); }
  catch { throw new Error(`EXODUSER production preflight: ffprobe returned invalid JSON for ${file}.`); }
  const videos = (result.streams || []).filter(s => s.codec_type === "video");
  const audios = (result.streams || []).filter(s => s.codec_type === "audio");
  const video = videos[0];
  demand(videos.length === 1 && video?.codec_name === "h264" && video?.pix_fmt === "yuv420p" &&
    video?.width === CONTRACT.width && video?.height === CONTRACT.height,
    `${file}: require one full-frame H.264/yuv420p1920x1080 video; no automatic transcode.`);
  demand(audios.length <= 1, `${file}: multiple audio streams need an explicitly reviewed preparation.`);
  const frames = (result.frames || []).filter(f => f.media_type === "video");
  demand(frames.length > 0, `${file}: decoded picture frames are missing.`);
  let previous = -Infinity;
  frames.forEach((f, index) => {
    const pts = Number(f.best_effort_timestamp_time);
    demand(Number.isFinite(pts) && pts > previous, `${file}: frame${index} has missing/non-monotonic timestamp${pts}.`);
    previous = pts;
  });
  const firstPTS = Number(frames[0].best_effort_timestamp_time);
  const lastPTS = Number(frames[frames.length - 1].best_effort_timestamp_time);
  const averageFPS = ratio(video.avg_frame_rate);
  const lastDuration = Number(frames[frames.length - 1].pkt_duration_time);
  const frameTail = lastDuration > 0 ? lastDuration : averageFPS > 0 ? 1 / averageFPS : NaN;
  const decodedDuration = lastPTS - firstPTS + frameTail;
  const streamDuration = Number(video.duration);
  const duration = streamDuration > 0 ? Math.min(streamDuration, decodedDuration) : decodedDuration;
  demand(Number.isFinite(duration) && duration > 0, `${file}: actual video duration is unknown.`);
  const audioPresent = audios.length === 1 && (result.frames || []).some(f => f.media_type === "audio");
  return { frames: frames.length, duration, sourceAverageFPS: Number.isFinite(averageFPS) ? averageFPS : null,
    sourceRate: video.r_frame_rate, firstVideoPTS: firstPTS, width: 1920, height: 1080,
    audio: { present: audioPresent, codec: audios[0]?.codec_name || null,
      sampleRate: audios[0]?.sample_rate ? Number(audios[0].sample_rate) : null, channels: audios[0]?.channels || 0 },
    frameClock: "DECODED_MONOTONIC_SOURCE_TIMESTAMPS", outputFPS: 30, sourceSpeed: 1 };
}

export function preflight(base, manifest, probe = probeSource) {
  demand(manifest?.schemaVersion === 1 && ["REVIEW_CANDIDATE", "APPROVED_FOR_BUILD"].includes(manifest.status), "use REVIEW_CANDIDATE for review authoring or APPROVED_FOR_BUILD after actual approval.");
  const candidate = manifest.status === "REVIEW_CANDIDATE";
  const publicationBlockers = candidate ? ["REVIEW_CANDIDATE_NOT_PUBLICLY_APPROVED"] : [];
  demand(manifest.language === "en", "this script requires language=en and the approved DM Sans inputs.");
  const expectedBuilds = manifest.expectedBuilds === undefined ? [manifest.expectedBuild] : manifest.expectedBuilds;
  demand(Array.isArray(expectedBuilds) && expectedBuilds.length > 0 && expectedBuilds.every(build =>
    build?.checkout === CONTRACT.checkout && COMMIT.test(build?.commit || "") && SHA.test(build?.gameSha256 || "")),
    "expectedBuilds (or legacy expectedBuild) must identify exact current migration checkout/full commit/loaded game SHA256 tuples.");
  demand(manifest.sources && typeof manifest.sources === "object" && !Array.isArray(manifest.sources), "sources map is required.");
  demand(Array.isArray(manifest.shots) && manifest.shots.length > 0, "select actual approved shots; no placeholder timeline.");
  const ids = new Set(), orders = new Set(), captions = new Set();
  let cursor = 0;
  const shots = [...manifest.shots].sort((a, b) => a.order - b.order).map(shot => {
    demand(nonempty(shot.id) && /^[a-z0-9_-]+$/.test(shot.id) && !ids.has(shot.id), "shot IDs must be unique lowercase identifiers.");
    demand(integer(shot.order, 1) && !orders.has(shot.order), `${shot.id}: unique positive integer order is required.`);
    ids.add(shot.id); orders.add(shot.order); approval(shot, `shot ${shot.id}`, candidate);
    demand(ROLES.has(shot.role) && nonempty(shot.sourceId) && Object.hasOwn(manifest.sources, shot.sourceId), `${shot.id}: missing source/role.`);
    const fromSeconds = sourceSeconds(shot);
    demand(Number.isFinite(fromSeconds) && integer(shot.durationFrames, 1), `${shot.id}: select exact source fromSeconds/durationFrames.`);
    if (typeof shot.fromSeconds === "number" && integer(shot.fromFrame)) demand(Math.abs(shot.fromSeconds - shot.fromFrame / 30) < 1e-7, `${shot.id}: conflicting source time fields.`);
    const review = shot.review;
    demand((candidate ? ["REVIEW_CANDIDATE", "PASS"].includes(review?.status) : review?.status === "PASS") &&
      review?.visualPass === true && typeof review?.audioPass === "boolean" && nonempty(review?.evidence), `${shot.id}: exact visual-interval review and explicit audio state are required.`);
    if (!candidate) demand(review.audioPass === true, `${shot.id}: unheard/failed audio cannot receive public approval.`);
    if (!review.audioPass) publicationBlockers.push(`${shot.id}:SHOT_AUDIO_NOT_PASSED`);
    demand(Math.abs(sourceSeconds(review) - fromSeconds) < 1e-7 && review.durationFrames === shot.durationFrames, `${shot.id}: review does not match the selected source interval.`);
    if (["parry", "kiSlash", "magic", "trap"].includes(shot.role)) demand(review.featureVerified === true,
      `${shot.id}: the named action must be verified in this exact shot, even without promotional copy.`);
    const crop = shot.crop ?? null;
    if (crop) demand(integer(crop.x) && integer(crop.y) && integer(crop.width, 1) && integer(crop.height, 1) &&
      crop.x + crop.width <= 1920 && crop.y + crop.height <= 1080 && crop.width * 1080 === crop.height * 1920 &&
      crop.visualPass === true && nonempty(crop.evidence), `${shot.id}: explicit in-bounds16:9 source-pixel crop plus visual PASS/evidence is required.`);
    let caption = null;
    if (shot.copy !== null) {
      const copy = shot.copy;
      demand(copy && Object.hasOwn(COPY, copy.key) && copy.key === shot.role && !captions.has(copy.key), `${shot.id}: only one parry/kiSlash caption each is allowed.`);
      demand(integer(copy.offsetFrames) && integer(copy.durationFrames, 60) && copy.durationFrames <= 90 &&
        copy.offsetFrames + copy.durationFrames <= shot.durationFrames, `${shot.id}: caption must fit its shot and last 2–3s.`);
      demand(review.featureVerified === true && review.topLeftClear === true, `${shot.id}: caption feature/clear area must be visually approved.`);
      captions.add(copy.key); caption = { ...copy, text: COPY[copy.key] };
    }
    const chosen = { ...shot, fromSeconds, crop, atFrame: cursor, caption };
    cursor += shot.durationFrames;
    return chosen;
  });
  const cta = manifest.cta;
  const staticEndcard = cta?.mode === "STATIC";
  demand(staticEndcard || cta?.mode === "OVER_GAMEPLAY", "CTA mode must be STATIC or OVER_GAMEPLAY.");
  const totalFrames = cursor + (staticEndcard ? 120 : 0);
  demand(totalFrames >= CONTRACT.minFrames && totalFrames <= CONTRACT.maxFrames, "selected shots plus the endcard must total18–50s; never add filler to reach24/35s.");
  demand(shots[0].role === "hook" && shots[0].copy === null, "start with a reviewed gameplay hook, without an opening card.");
  const closing = shots[shots.length - 1];
  if (!staticEndcard) demand(closing.copy === null && closing.durationFrames >= 120 && closing.review.ctaClear === true,
    "OVER_GAMEPLAY requires a reviewed clear last4s; use STATIC when no such gameplay close exists.");
  const ctaAtFrame = staticEndcard ? cursor : cursor - 120;
  for (const shot of shots) if (shot.caption) demand(shot.atFrame + shot.caption.offsetFrames + shot.caption.durationFrames <= ctaAtFrame,
    `${shot.id}: gameplay copy cannot overlap the endcard.`);
  approval(cta, "CTA", candidate);
  let demo = null;
  try { demo = new URL(cta.demoUrl); } catch { /* Candidate may retain an unchecked CTA link. */ }
  const ctaReady = demo?.protocol === "https:" && demo?.hostname === "store.steampowered.com" && /^\/app\/\d+(?:\/|$)/.test(demo?.pathname || "") &&
    cta.demoAvailable === true && nonempty(cta.evidence) && typeof cta.footageIsDemoBuild === "boolean" &&
    (cta.footageIsDemoBuild || nonempty(cta.descriptionDisclosure));
  if (!ctaReady || !cta.approved) publicationBlockers.push("CTA_PUBLIC_DEMO_REVIEW_PENDING");
  if (!candidate) demand(ctaReady, "CTA: public demo, link and build-equivalence/disclosure review are required for approval.");
  if (!candidate) demand(manifest.finalReview?.status === "PASS" && manifest.finalReview?.visualPass === true &&
    manifest.finalReview?.audioPass === true && nonempty(manifest.finalReview?.evidence), "full candidate viewing/listening evidence is required before APPROVED_FOR_BUILD.");

  const sourceChecks = {};
  for (const sourceId of new Set(shots.map(s => s.sourceId))) {
    const source = manifest.sources[sourceId];
    approval(source, `source ${sourceId}`, candidate);
    const sourceBuild = sameBuild(source.build, expectedBuilds, `source ${sourceId}`);
    demand(SHA.test(source.sha256 || ""), `source ${sourceId}: exact prepared-file SHA256 is required.`);
    const file = inputFile(base, source.file, `source ${sourceId}`);
    demand(/\.mp4$/i.test(file) && digest(file) === source.sha256, `source ${sourceId}: missing/changed prepared MP4.`);
    const audit = jsonFile(inputFile(base, source.auditFile, `audit ${sourceId}`), `audit ${sourceId}`);
    approval(audit, `audit ${sourceId}`, candidate); sameBuild(audit.build, sourceBuild, `audit ${sourceId}`);
    demand(audit.mediaSha256 === source.sha256, `audit ${sourceId}: audit is not bound to these exact media bytes.`);
    demand(["NORMAL_PLAY", "NORMAL_TUTORIAL"].includes(audit.captureKind) && source.captureKind === audit.captureKind &&
      audit.staged === false && audit.agentSpawnedEnemies === false && audit.agentModifiedCombatValues === false &&
      typeof audit.baseGameTutorialSpawns === "boolean" && (audit.captureKind !== "NORMAL_PLAY" || !audit.baseGameTutorialSpawns) &&
      audit.currentVersionVerified === true, `audit ${sourceId}: current normal play/tutorial only; reject agent spawning/combat edits and record built-in tutorial spawning separately.`);
    demand((audit.serverPort === null || integer(audit.serverPort, 1) && audit.serverPort <= 65535) && audit.serverPort !== 3333,
      `audit ${sourceId}: old 3333/unknown server provenance is forbidden (native without a server uses null).`);
    demand((candidate ? ["PARTIAL", "PASS"].includes(audit.visualReview) : audit.visualReview === "PASS") &&
      typeof audit.sourceAudioHeard === "boolean" && ["PASS", "PENDING", "UNHEARD", "MISSING", "FAIL"].includes(audit.audioReview) &&
      nonempty(audit.reviewedBy) && nonempty(audit.reviewedAt) && nonempty(audit.evidence), `audit ${sourceId}: visual evidence and honest heard/unheard audio state are required.`);
    demand(audit.sourceAudioHeard || audit.audioReview !== "PASS", `audit ${sourceId}: unheard source audio cannot be labelled PASS.`);
    if (!audit.sourceAudioHeard || audit.audioReview !== "PASS") publicationBlockers.push(`${sourceId}:SOURCE_AUDIO_${audit.sourceAudioHeard ? audit.audioReview : "UNHEARD"}`);
    if (!candidate) demand(audit.sourceAudioHeard && audit.audioReview === "PASS", `audit ${sourceId}: unheard/failed source audio blocks public approval.`);
    const metadata = probe(file);
    const derivation = audit.derivation ?? null;
    if (derivation) demand(SHA.test(derivation.rawSha256 || "") && Number.isFinite(derivation.originalInSeconds) &&
      Number.isFinite(derivation.originalOutSeconds) && derivation.originalInSeconds >= 0 &&
      derivation.originalOutSeconds > derivation.originalInSeconds && derivation.speed === 1 &&
      derivation.interpolation === false && nonempty(derivation.method),
      `audit ${sourceId}: derivation must preserve exact rawSHA/original IN-OUT and real speed without interpolation.`);
    for (const shot of shots.filter(s => s.sourceId === sourceId)) {
      demand(shot.review.sourceSha256 === source.sha256, `${shot.id}: shot review belongs to different source bytes.`);
      demand(shot.fromSeconds + shot.durationFrames / 30 <= metadata.duration + 0.00002, `${shot.id}: selected interval exceeds decoded source-time coverage.`);
    }
    if (!metadata.audio.present) publicationBlockers.push(`${sourceId}:SOURCE_AUDIO_MISSING`);
    if (!candidate) demand(metadata.audio.present, `source ${sourceId}: missing source audio blocks public approval.`);
    sourceChecks[sourceId] = { file, sha256: source.sha256, auditFile: source.auditFile, build: sourceBuild,
      captureKind: audit.captureKind, baseGameTutorialSpawns: audit.baseGameTutorialSpawns,
      tutorialSteps: audit.tutorialSteps || [], agentSpawnedEnemies: false, agentModifiedCombatValues: false,
      sourceAudioHeard: audit.sourceAudioHeard, audioReview: audit.audioReview, derivation, ...metadata };
  }
  const assets = {};
  for (const [key, asset] of Object.entries(ORIGINAL_ASSETS)) {
    const file = inputFile(base, asset.file, `asset ${key}`);
    demand(digest(file) === asset.sha256, `asset ${key}: use the exact approved original asset bytes.`);
    assets[key] = file;
  }
  const licenseFile = inputFile(base, "input/DM-Sans-OFL.txt", "DM Sans OFL");
  const license = readFileSync(licenseFile, "utf8");
  demand(license.includes("The DM Sans Project Authors") && license.includes("SIL OPEN FONT LICENSE Version 1.1"), "DM Sans copyright/OFL file is missing or incorrect.");
  const projectDir = join(base, "project");
  demand(!existsSync(projectDir), "project path already exists; choose a fresh production directory. Shared/old projects are never rebuilt.");
  return { status: manifest.status, candidate, expectedBuild: expectedBuilds.length === 1 ? expectedBuilds[0] : null,
    expectedBuilds, shots, gameplayFrames: cursor,
    frames: totalFrames, duration: totalFrames / 30, ctaAtFrame, staticEndcard, sourceChecks,
    publicationBlockers: [...new Set(publicationBlockers)], assets, licenseFile, projectDir };
}

// JSX below is native composition. Raw keyframes are local seconds, with no
// animation callback or DOM. Optional explicit crop is picture-only; original
// game audio remains on the cut spine. Endcard may have a static background.
function opacityFade(duration, edge = 0.25) {
  return [{ property: "opacity", keyframes: [
    { at: 0, value: 0, easing: "linear" },
    { at: edge, value: 1, easing: "linear" },
    { at: duration - edge, value: 1, easing: "linear" },
    { at: duration, value: 0, easing: "linear" },
  ] }];
}
function featureNode(copy, bold) {
  return <frame width={1920} height={1080} layout="none">
    <text x={144} y={144} width={1440} height={72} fontFamily="DM Sans" fontWeight={700}
      typography={{ fontAssetId: bold.id, language: "en", direction: "ltr" }}
      fontSize={52} letterSpacing={1} lineHeight={1.15} color={CONTRACT.foreground}
      shadow={{ x: 0, y: 2, blur: 5, color: "#000000" }}
      animate={opacityFade(copy.durationFrames / 30, 0.15)}>{copy.text}</text>
  </frame>;
}
function croppedPictureNode(handle, shot) {
  const crop = shot.crop;
  const scale = 1920 / crop.width;
  return <frame width={1920} height={1080} layout="none" clip={true} background="#08090c">
    <media file={handle} trimStart={shot.fromSeconds} fit="fill"
      x={-crop.x * scale} y={-crop.y * scale} width={1920 * scale} height={1080 * scale} />
  </frame>;
}
function endcardNode(logo, bold, regular, staticEndcard) {
  return <frame width={1920} height={1080} layout="none" background={staticEndcard ? "#08090c" : undefined}>
    <frame width={1920} height={1080} layout="none" animate={opacityFade(4)}>
    <frame x={440} y={216} width={1040} height={520} layout="column">
      <media file={logo} fit="contain" width="fill" height="fill" />
    </frame>
    <rect x={912} y={742} width={96} height={2} fill="#c44232" />
    <text x={200} y={790} width={1520} height={64} align="center" fontFamily="DM Sans" fontWeight={700}
      typography={{ fontAssetId: bold.id, language: "en", direction: "ltr" }}
      fontSize={44} letterSpacing={2} lineHeight={1.15} color={CONTRACT.foreground}
      shadow={{ x: 0, y: 2, blur: 5, color: "#000000" }}>PLAY THE FREE DEMO</text>
    <text x={200} y={862} width={1520} height={48} align="center" fontFamily="DM Sans" fontWeight={400}
      typography={{ fontAssetId: regular.id, language: "en", direction: "ltr" }}
      fontSize={28} letterSpacing={5} color={CONTRACT.foreground}
      shadow={{ x: 0, y: 2, blur: 5, color: "#000000" }}>ON STEAM</text>
    </frame>
  </frame>;
}

export default async ({ project }) => {
  const supplied = process.env.EXODUSER_PRODUCTION_DIR;
  demand(nonempty(supplied) && isAbsolute(supplied) && existsSync(supplied), "set EXODUSER_PRODUCTION_DIR to an existing absolute fresh input-package directory.");
  const base = realpathSync(supplied);
  demand(lstatSync(base).isDirectory(), "EXODUSER_PRODUCTION_DIR must be a directory.");
  const manifestFile = inputFile(base, "shot-plan.json", "shot plan");
  const manifest = jsonFile(manifestFile, "shot plan");
  const plan = preflight(base, manifest);
  // Exclusive mkdir catches an occupied path/race, including a broken symlink.
  // No project or timeline mutation occurs before every source gate has passed.
  mkdirSync(plan.projectDir, { recursive: false });
  const p = await project({ dir: plan.projectDir, size: "1920x1080", fps: 30, background: "#08090c" });
  const handles = new Map();
  for (const [sourceId, source] of Object.entries(plan.sourceChecks)) handles.set(sourceId, await p.add(source.file));
  const logo = await p.add(plan.assets.logo);
  const bold = await p.add(plan.assets.bold);
  const regular = await p.add(plan.assets.regular);
  writeFileSync(join(plan.projectDir, "DM-Sans-OFL.txt"), readFileSync(plan.licenseFile), { flag: "wx" });
  for (const shot of plan.shots) {
    p.cut(handles.get(shot.sourceId), { from: shot.fromSeconds, dur: shot.durationFrames / 30,
      at: shot.atFrame / 30, fit: "contain" });
    if (shot.crop) p.compose(croppedPictureNode(handles.get(shot.sourceId), shot), {
      at: shot.atFrame / 30, dur: shot.durationFrames / 30, name: `${shot.id}-explicit-reviewed-crop`,
    });
    if (shot.caption) p.compose(featureNode(shot.caption, bold), {
      at: (shot.atFrame + shot.caption.offsetFrames) / 30,
      dur: shot.caption.durationFrames / 30, name: `${shot.id}-copy`,
    });
  }
  p.compose(endcardNode(logo, bold, regular, plan.staticEndcard), { at: plan.ctaAtFrame / 30, dur: 4, name: "original-logo-steam-cta" });
  demand(Math.abs(p.duration() - plan.duration) <= 1e-7, "native timeline length differs from approved shot total; retain the fresh project for diagnosis.");
  writeFileSync(join(plan.projectDir, "production-build-receipt.json"), JSON.stringify({
    status: plan.candidate ? "REVIEW_CANDIDATE_AUTHORED_NOT_RENDERED" : "NATIVE_AUTHORED_NOT_RENDERED", manifestFile,
    expectedBuild: plan.expectedBuild, expectedBuilds: plan.expectedBuilds,
    fps: 30, width: 1920, height: 1080, frames: plan.frames, duration: plan.duration,
    gameplayFrames: plan.gameplayFrames,
    shots: plan.shots.map(({ id, sourceId, order, role, fromSeconds, durationFrames, atFrame, crop, caption, review }) =>
      ({ id, sourceId, order, role, fromSeconds, durationFrames, atFrame, crop, caption,
        visualPass: review.visualPass, audioPass: review.audioPass })),
    sourceChecks: plan.sourceChecks, originalAssetChecks: ORIGINAL_ASSETS,
    cta: { mode: manifest.cta.mode, at: plan.ctaAtFrame / 30, dur: 4, lines: ["PLAY THE FREE DEMO", "ON STEAM"], demoUrl: manifest.cta.demoUrl,
      footageIsDemoBuild: manifest.cta.footageIsDemoBuild, descriptionDisclosure: manifest.cta.descriptionDisclosure },
    sourceAudioPreservedOnCutSpine: true, sourceSpeed: 1,
    gameplayCrop: plan.shots.some(shot => shot.crop !== null), implicitGameplayZoom: false,
    publicationAllowed: false, publicationPreflightPassed: !plan.candidate,
    publicationBlockers: plan.publicationBlockers,
    renderPerformed: false, finalViewing: "PENDING_ROOT", finalListening: "PENDING_ROOT", publicationPerformed: false,
  }, null, 2) + "\n", { flag: "wx" });
  console.log(JSON.stringify({ status: plan.candidate ? "REVIEW_CANDIDATE_AUTHORED_NOT_RENDERED" : "NATIVE_AUTHORED_NOT_RENDERED", projectDir: plan.projectDir,
    frames: plan.frames, duration: plan.duration, next: "Root owns native validation, render, full viewing/listening and publication review." }));
};
