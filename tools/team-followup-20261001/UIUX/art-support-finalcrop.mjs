import art from '../ART/wa24-delta-probe.cjs';

export const correctedSampler = art.correctedSampler;
const clamp = value => Math.max(0, Math.min(1, value));

export function predictFinalCrop({ fullW, fullH, lines, lineIdx, lineStartMs, now, natW = 2560, natH = 1440 }) {
  const line = lines[lineIdx];
  if (!line) throw new RangeError('활성 라인 없음');
  if (![fullW, fullH, natW, natH].every(value => Number.isFinite(value) && value > 0) || !Number.isFinite(now) || !Number.isFinite(lineStartMs)) throw new RangeError('잘못된 크기/시각');
  const lineElapsed = now - lineStartMs;
  const letterbox = art.predictLetterbox(fullW, fullH);
  const { cw, ch, lbX, lbY } = letterbox;
  const cam = line.cam || { zs: 1, ze: 1 };
  const progress = Math.min(1, lineElapsed / (line.dur || 1));
  const eased = (art.EASE[cam.ease || 'linear'] || art.EASE.linear)(progress);
  const zoom = cam.zs + (cam.ze - cam.zs) * eased;
  if (!Number.isFinite(zoom) || zoom <= 0) throw new RangeError('양의 확대율 필요');
  const shake = art.cutShake((line.vfx || {}).shake || 0, now);
  const translateX = lbX + cw / 2 + (cam.px || 0) * eased + shake.x - zoom * cw / 2;
  const translateY = lbY + ch / 2 + (cam.py || 0) * eased + shake.y - zoom * ch / 2;
  const matrix = [zoom, 0, 0, zoom, translateX, translateY];
  const imageRatio = natW / natH;
  const fitHeight = imageRatio > cw / ch;
  const dw = fitHeight ? ch * imageRatio : cw;
  const dh = fitHeight ? ch : cw / imageRatio;
  const dx = fitHeight ? (cw - dw) / 2 : 0;
  const dy = fitHeight ? 0 : (ch - dh) * 0.1;
  const drawRect = { x: translateX + zoom * dx, y: translateY + zoom * dy, w: zoom * dw, h: zoom * dh };
  const clip = { x: lbX, y: lbY, w: cw, h: ch };
  const fractions = {
    left: clamp((clip.x - drawRect.x) / drawRect.w),
    right: clamp((drawRect.x + drawRect.w - clip.x - clip.w) / drawRect.w),
    top: clamp((clip.y - drawRect.y) / drawRect.h),
    bottom: clamp((drawRect.y + drawRect.h - clip.y - clip.h) / drawRect.h)
  };
  const visibleSourceRect = {
    x: natW * fractions.left, y: natH * fractions.top,
    w: natW * Math.max(0, 1 - fractions.left - fractions.right),
    h: natH * Math.max(0, 1 - fractions.top - fractions.bottom)
  };
  const visibleDrawRect = {
    x: Math.max(clip.x, drawRect.x), y: Math.max(clip.y, drawRect.y),
    w: Math.max(0, Math.min(clip.x + clip.w, drawRect.x + drawRect.w) - Math.max(clip.x, drawRect.x)),
    h: Math.max(0, Math.min(clip.y + clip.h, drawRect.y + drawRect.h) - Math.max(clip.y, drawRect.y))
  };
  const sourceLossPixels = Object.fromEntries(Object.entries(fractions).map(([side, fraction]) => [side, fraction * (side === 'left' || side === 'right' ? natW : natH)]));
  const fade = line.fade || {};
  const fadeAlpha = art.fadeAlpha(lineElapsed, line.dur, fade.in, fade.out);
  return {
    active: line.id, timeBase: 'line-index', lineElapsed, zoom, shake, matrix, letterbox, clip, drawRect,
    visibleDrawRect, visibleSourceRect, fractions, sourceLossPixels,
    horizontalFraction: fractions.left + fractions.right,
    verticalFraction: fractions.top + fractions.bottom,
    geometryVerdict: Object.values(fractions).some(value => value > 1e-12) ? 'CROPPED' : 'FULLFRAME_GEOMETRY',
    fadeAlpha, visibilityEvidence: fadeAlpha === 0 ? 'HIDDEN_FADE_NO_VISIBILITY_EVIDENCE' : 'GEOMETRY_ONLY',
    eyeVerdict: 'UNKNOWN', footVerdict: 'UNKNOWN', subtitleVerdict: 'UNKNOWN'
  };
}
