// Native Higgsedit authoring only: no React, browser, upload, or render calls.
// Build one fresh project per target; a whole-script build replaces that timeline.
// Example target selection: EXODUSER_EDIT_TARGET=shortsA higgsedit build this-file.jsx
import { existsSync, readFileSync } from "node:fs";

export const CONFIG = {
  target: "steam", // steam | youtube | shortsA | shortsB; env overrides this field.
  inputDir: "/home/user/exoduser-fresh",
  outputRoot: "/home/user/exoduser-edits/final-20261008",
  fps: 30,
  fontFamily: "DM Sans",
  background: "#08090c",
  foreground: "#f2f0e8",
  mutedText: "#b7b6b1",
  accent: "#d8b47a",
  logoPath: "/home/user/exoduser-fresh/logo.png", // Missing/null => truthful text title.
  title: "EXODUSER: HELL LORD",
  studio: "FOR DEAR GAMERS",
  cta: "PLAY THE FREE STEAM DEMO",
  platform: "WINDOWS · STEAM",
  stagedLabel: "Staged skill demonstration",
  // Probe actual source lengths in the hosted runtime; null is intentionally NOT
  // an assumed duration. Set positive seconds before building a selected target.
  sources: {
    manual: { file: "manual.webm", sourceDuration: null },
    parry: { file: "parry.webm", sourceDuration: null },
    rage_slam: { file: "rage_slam.webm", sourceDuration: null },
    fire: { file: "fire.webm", sourceDuration: null },
    ice_orb: { file: "ice_orb.webm", sourceDuration: null },
    ancestor: { file: "ancestor.webm", sourceDuration: null },
    blackhole: { file: "blackhole.webm", sourceDuration: null },
  },
  // Every value is source seconds; adjust after looking at the actual footage.
  // Keep shot durations fixed to preserve the requested deliverable runtimes.
  trims: {
    steam: { manual: 8, parry: 5, rage_slam: 1, fire: 2, ice_orb: 29 / 30, blackhole: 1 },
    shortsA: { parry: 5, rage_slam: 1 },
    shortsB: { fire: 2, ice_orb: 29 / 30, blackhole: 1 },
  },
  // Editorial descriptions, not promises of official localized skill names.
  hooks: {
    parry: "TURN PROJECTILES BACK",
    rage_slam: "RAGE. SLAM. BREAK THROUGH.",
    fire: "BRING THE FIRE",
    ice_orb: "CONTROL THE FIGHT",
    ancestor: "CALL FOR REINFORCEMENTS",
    blackhole: "ABSORB. THEN DETONATE.",
  },
};

export const TARGETS = {
  steam: {
    size: "1920x1080", width: 1920, height: 1080, vertical: false,
    duration: 37, bitrate: 20_000_000, projectName: "steam-master-37s",
    renderName: "EXODUSER_STEAM_37S_1080P30.mp4",
    shots: [
      { source: "parry", dur: 4, staged: true },
      { source: "rage_slam", dur: 7, staged: true },
      { source: "fire", dur: 8, staged: true },
      { source: "ice_orb", dur: 7, staged: true },
      { source: "blackhole", dur: 7, staged: true },
    ],
    ctaDur: 4,
  },
  shortsA: {
    size: "1080x1920", width: 1080, height: 1920, vertical: true,
    duration: 16, bitrate: 12_000_000, projectName: "shorts-a-16s",
    renderName: "EXODUSER_SHORTS_A_16S_1080P30.mp4",
    shots: [
      { source: "parry", dur: 5, staged: true },
      { source: "rage_slam", dur: 7, staged: true },
    ],
    ctaDur: 4,
  },
  shortsB: {
    size: "1080x1920", width: 1080, height: 1920, vertical: true,
    duration: 26, bitrate: 12_000_000, projectName: "shorts-b-26s",
    renderName: "EXODUSER_SHORTS_B_26S_1080P30.mp4",
    shots: [
      { source: "fire", dur: 8, staged: true },
      { source: "ice_orb", dur: 7, staged: true },
      { source: "blackhole", dur: 7, staged: true },
    ],
    ctaDur: 4,
  },
};

export function resolvePlan(config = CONFIG, requested = config.target) {
  // YouTube horizontal is the SAME approved landscape edit, not a second master.
  const key = requested === "youtube" ? "steam" : requested;
  const target = TARGETS[key];
  if (!target) throw new Error(`Unknown edit target: ${requested}`);
  let at = 0;
  const shots = target.shots.map((shot) => {
    const source = config.sources[shot.source];
    const from = config.trims[key][shot.source];
    if (!source || !Number.isFinite(source.sourceDuration) || source.sourceDuration <= 0) {
      throw new Error(`Probe and set CONFIG.sources.${shot.source}.sourceDuration before build.`);
    }
    if (!Number.isFinite(from) || from < 0 || from + shot.dur > source.sourceDuration + 1e-6) {
      throw new Error(`${key}/${shot.source}: trim ${from}+${shot.dur}s exceeds ${source.sourceDuration}s.`);
    }
    if (!Number.isInteger(shot.dur * config.fps) || !Number.isInteger(from * config.fps)) {
      throw new Error(`${key}/${shot.source}: durations and trim points must align to ${config.fps}fps.`);
    }
    const entry = { ...shot, from, at, file: source.file.startsWith("/") ? source.file : `${config.inputDir}/${source.file}` };
    at += shot.dur;
    return entry;
  });
  if (Math.abs(at + target.ctaDur - target.duration) > 1e-6) {
    throw new Error(`${key}: shot total + CTA must equal ${target.duration}s.`);
  }
  return {
    ...target, key, shots, ctaAt: at,
    projectDir: `${config.outputRoot}/${target.projectName}`,
    // depth:8 => native H.264 default. The documented codec overrides are
    // hevc|av1, so do not invent codec:"h264" or undocumented audio options.
    renderOptions: { depth: 8, bitrate: target.bitrate, accel: "cpu" },
    expectedAudioCodec: "aac", // Confirm with ffprobe after native render.
  };
}

function gameplayPanel(config, plan, shot, handle) {
  if (!plan.vertical) return (
    <frame width={1920} height={1080} layout="none">
      <text x={54} y={34} width={1740} height={60} fontSize={34} fontFamily={config.fontFamily}
        fontWeight={700} color={config.foreground}>{config.hooks[shot.source]}</text>
      <text x={54} y={1000} width={1700} height={38} fontSize={22} fontFamily={config.fontFamily}
        color={config.mutedText}>{config.stagedLabel} · Development build</text>
    </frame>
  );
  return (
    <frame width={1080} height={1920} layout="none" background={config.background}>
      <text x={84} y={150} width={840} height={58} fontSize={32} fontFamily={config.fontFamily}
        color={config.mutedText} align="center">{config.title}</text>
      <text x={84} y={228} width={840} height={128} fontSize={60} fontFamily={config.fontFamily}
        fontWeight={700} color={config.foreground} align="center">{config.hooks[shot.source]}</text>
      <text x={84} y={365} width={840} height={54} fontSize={34} fontFamily={config.fontFamily}
        fontWeight={700} color={config.accent} align="center">FREE DEMO ON STEAM</text>
      <frame x={0} y={445} width={1080} height={880} layout="column" clip={true}>
        <media file={handle} trimStart={shot.from} fit="cover" width="fill" height="fill" />
      </frame>
      <text x={84} y={1340} width={840} height={36} fontSize={23} fontFamily={config.fontFamily}
        color={config.mutedText} align="center">Staged skill demo · Development build</text>
      <frame x={120} y={1390} width={840} height={472} layout="column" clip={true}>
        <media file={handle} trimStart={shot.from} fit="contain" width="fill" height="fill" />
      </frame>
    </frame>
  );
}

function ctaCard(config, plan, logo) {
  const x = plan.vertical ? 60 : 192;
  const width = plan.vertical ? 960 : 1536;
  return (
    <frame width={plan.width} height={plan.height} layout="none" background={config.background}>
      {logo ? (
        <frame x={x} y={plan.vertical ? 430 : 90} width={width} height={plan.vertical ? 400 : 450} layout="column">
          <media file={logo} fit="contain" width="fill" height="fill" />
        </frame>
      ) : (
        <text x={x} y={plan.vertical ? 600 : 310} width={width} height={150} fontSize={76}
          fontFamily={config.fontFamily} fontWeight={700} color={config.foreground} align="center">EXODUSER</text>
      )}
      <text x={x} y={plan.vertical ? 850 : 540} width={width} height={90}
        fontSize={plan.vertical ? 64 : 46} fontFamily={config.fontFamily} color={config.foreground}
        fontWeight={700} align="center">HELL LORD</text>
      <text x={x} y={plan.vertical ? 1020 : 690} width={width} height={plan.vertical ? 170 : 100}
        fontSize={plan.vertical ? 60 : 64} fontFamily={config.fontFamily}
        fontWeight={700} color={config.accent} align="center">{config.cta}</text>
      <text x={x} y={plan.vertical ? 1240 : 810} width={width} height={60}
        fontSize={34} fontFamily={config.fontFamily} color={config.mutedText} align="center">{config.platform}</text>
      <text x={x} y={plan.vertical ? 1350 : 920} width={width} height={50}
        fontSize={28} fontFamily={config.fontFamily} color={config.mutedText} align="center">{config.studio}</text>
    </frame>
  );
}

export default async ({ project }) => {
  const probePath = `${CONFIG.inputDir}/probe.json`;
  if (existsSync(probePath)) {
    const durations = JSON.parse(readFileSync(probePath, "utf8"));
    for (const [key, seconds] of Object.entries(durations)) {
      if (CONFIG.sources[key]) CONFIG.sources[key].sourceDuration = Number(seconds);
    }
  }
  const preparedPath = `${CONFIG.inputDir}/prepared.json`;
  if (!existsSync(preparedPath)) throw new Error("Run marketing_prepare_20261008.py to create prepared.json before native build.");
  const prepared = JSON.parse(readFileSync(preparedPath, "utf8"));
  for (const [key, entry] of Object.entries(prepared)) {
    if (!CONFIG.sources[key]) continue;
    CONFIG.sources[key] = { file: entry.file, sourceDuration: Number(entry.sourceDuration) };
    for (const trims of Object.values(CONFIG.trims)) if (key in trims) trims[key] = 0;
  }
  const selected = process.env.EXODUSER_EDIT_TARGET || CONFIG.target;
  const plan = resolvePlan(CONFIG, selected); // Validate lengths BEFORE creating a project.
  for (const shot of plan.shots) {
    if (!existsSync(shot.file)) throw new Error(`Missing source: ${shot.file}`);
  }
  const p = await project({ dir: plan.projectDir, size: plan.size, fps: CONFIG.fps, background: CONFIG.background });
  const handles = {};
  for (const shot of plan.shots) {
    if (!handles[shot.source]) handles[shot.source] = await p.add(shot.file);
  }
  const logo = CONFIG.logoPath && existsSync(CONFIG.logoPath) ? await p.add(CONFIG.logoPath) : null;
  for (const shot of plan.shots) {
    // Spine retains ONLY the source's original game audio. A composed media node
    // is picture-only, so this does not duplicate audio or add a synthetic bed.
    p.cut(handles[shot.source], { from: shot.from, dur: shot.dur, at: shot.at, fit: "contain" });
    if (shot.staged || plan.vertical) {
      // Landscape preserves the full frame. Vertical shows a central detail
      // plus the complete source view below. Source audio occurs only once.
      p.compose(gameplayPanel(CONFIG, plan, shot, handles[shot.source]),
        { at: shot.at, dur: shot.dur, name: `${plan.key}-${shot.source}-${shot.at}` });
    }
    // Manual landscape shot remains the complete normal demo canvas.
  }
  p.compose(ctaCard(CONFIG, plan, logo), { at: plan.ctaAt, dur: plan.ctaDur, name: `${plan.key}-cta` });
  // CTA is deliberately silent. No new AI video, voice, music, or audio effects.
  // Authoring stops here: root runs frame/contact-sheet inspection and render.
  console.log(JSON.stringify({ target: selected, projectDir: plan.projectDir,
    duration: plan.duration, renderName: plan.renderName,
    renderOptions: plan.renderOptions, expectedAudioCodec: plan.expectedAudioCodec }));
};
