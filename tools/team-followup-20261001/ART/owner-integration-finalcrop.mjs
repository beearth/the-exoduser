/* owner-integration-finalcrop — ART 원담당 인수 연결 (ART-OWNER-NEXT-20261002)
 *
 * 목적(누락 연결 수정):
 *   원담당 모듈 wa24-delta-probe.cjs 는 cover-only `predictWa24Crop` 만 내보내,
 *   실제 렌더의 clip→zoom(Ken Burns 1.08→1.04)→shake→cover 최종 크롭을 호출부에서 얻을 수 없다.
 *   지원팀(UIUX→ART)이 이미 구현·root 검수한 `predictFinalCrop`(clip/zoom/shake/cover 전 변환,
 *   실 draw 원문과 4화면비×3시점 1e-11 대조, 눈·발·자막 UNKNOWN)을 **재작성하지 않고**
 *   원담당 내보내기 표면/호출부에 인수 연결한다.
 *
 * 원본 보존: wa24-delta-probe.cjs 와 UIUX/art-support-finalcrop.mjs 모두 수정하지 않는다(import 만).
 * 시간축: 지원 모듈이 원담당 correctedSampler(_cutLineIdx+_cutLineStartMs)를 그대로 쓰므로 보존된다.
 *
 * 검수 근거: docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/SUPPORT-root-review.md (UIUX→ART 행: 원4PASS12FAIL→후보16PASS),
 *           root-review/support-final-evidence.json.
 */
import art from './wa24-delta-probe.cjs';
import { predictFinalCrop, correctedSampler } from '../UIUX/art-support-finalcrop.mjs';

// 시간축 보존 확인용: 지원이 재export 한 샘플러가 원담당 것과 동일 참조여야 한다.
if (correctedSampler !== art.correctedSampler) {
  throw new Error('[owner-integration] 시간축 샘플러 참조 불일치 — 지원 모듈이 원담당 correctedSampler 를 쓰지 않음');
}

/**
 * 원담당 내보내기 표면(누락 연결 해소판).
 * 기존 원담당 API 전체 + 인수한 predictFinalCrop/편의함수.
 * 원 모듈 객체를 변형하지 않고 새 객체로 합성한다.
 */
export const ownerApi = Object.freeze({
  ...art,
  // ── 인수 연결: 최종(clip→zoom→shake→cover) 크롭 ──
  predictFinalCrop,
  correctedSampler, // = art.correctedSampler (동일 참조, 시간축 보존)

  /** wa24 전용 편의: 원담당 WA24 라인 + 라인-인덱스 시간축으로 최종 크롭 예측. */
  predictWa24FinalCrop({ fullW, fullH, now, lineStartMs = 0, natW, natH } = {}) {
    return predictFinalCrop({
      fullW, fullH,
      lines: [art.WA24], lineIdx: 0,
      lineStartMs, now,
      natW: natW ?? art.WA24_IMG.naturalWidth,
      natH: natH ?? art.WA24_IMG.naturalHeight
    });
  },

  /**
   * 누락 연결 증명 헬퍼: 같은 뷰포트/시점에서
   * (a) 원담당 cover-only 판정 vs (b) 인수한 최종 크롭 판정을 함께 돌려준다.
   * 줌>1 구간에서 base 는 상하 크롭을 놓치지만 final 은 포착한다.
   */
  compareOwnerBaseVsFinal({ fullW, fullH, now, lineStartMs = 0 } = {}) {
    const base = art.predictWa24Crop(fullW, fullH); // cover-only (zoom/shake 무시)
    const final = predictFinalCrop({ fullW, fullH, lines: [art.WA24], lineIdx: 0, lineStartMs, now });
    return {
      viewport: `${fullW}x${fullH}`, now,
      base: { verdict: base.verdict, cutFrac: base.cutFrac, note: 'cover-only, zoom/shake 미반영' },
      final: {
        geometryVerdict: final.geometryVerdict,
        horizontalFraction: final.horizontalFraction,
        verticalFraction: final.verticalFraction,
        zoom: final.zoom, timeBase: final.timeBase,
        eyeVerdict: final.eyeVerdict, footVerdict: final.footVerdict, subtitleVerdict: final.subtitleVerdict
      },
      missingConnectionResolved:
        base.verdict === 'OK_FULLFRAME' && final.geometryVerdict === 'CROPPED'
    };
  }
});

export { predictFinalCrop, correctedSampler };
export default ownerApi;
