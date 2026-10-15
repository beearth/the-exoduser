export const CONTACT_VFX_AUTHORING_POLICY = Object.freeze({
  mediumTailStartFrame: 8,
  mediumFrameCount: 16,
  mediumTailGain: 0.16,
  darkSmokeGain: 0.12,
  fadeStart: 0.60,
  fadeEnd: 1,
  fadeTailGain: 0.25,
});

// Returns a display scalar without changing native effect data or lifetime.
export function contactVfxAlpha(options = {}) {
  const { active, kind, sheet, frame, progress, alpha, overlap } = options ?? {};
  const policy = CONTACT_VFX_AUTHORING_POLICY;
  if (active !== true || overlap !== true
    || !Number.isFinite(alpha) || alpha < 0 || alpha > 1
    || !Number.isFinite(progress) || progress < 0 || progress > 1
    || !Number.isInteger(frame) || frame < 0 || frame >= policy.mediumFrameCount) {
    return alpha;
  }

  let gain;
  if ((kind === 'dark' || kind === 'dark02')
    && sheet === 'Dark_MediumImpact.png' && frame >= policy.mediumTailStartFrame) {
    gain = policy.mediumTailGain;
  } else if (kind === 'dark' && sheet === 'Dark_DarkSmoke_FBF_4x4.png') {
    gain = policy.darkSmokeGain;
  } else {
    return alpha;
  }

  const fadeProgress = Math.max(0, Math.min(1,
    (progress - policy.fadeStart) / (policy.fadeEnd - policy.fadeStart)));
  const phaseFade = 1 - (1 - policy.fadeTailGain) * fadeProgress;
  return alpha * gain * phaseFade;
}
