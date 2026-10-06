/* Read-only size/resolution comparison for an editor object and its source crop.
 * Height is the displayed crop rectangle, not an inferred opaque body or collision height.
 */
const REFERENCE_HEIGHT = 80, MAX_BAR_HEIGHT = 72;
const record = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const positive = v => typeof v === 'number' && Number.isFinite(v) && v > 0;
const invalid = reason => ({ valid:false, reason, resolution:{status:'invalid',scaleX:null,scaleY:null,maxScale:null} });

/** rasterScale is the renderer's actual canvas.width/CSS width, without a DPR cap.
 * Callers own formatting and UI; this function never snaps, rounds, edits or caches inputs.
 */
export function inspectScaleComparison(object, asset, options) {
  try {
    if (!record(object) || !record(asset) || !record(asset.crop) || !record(options)) return invalid('크기 비교 입력 형식 오류');
    const width=object.width, height=object.height, cropWidth=asset.crop.w, cropHeight=asset.crop.h;
    const zoom=options.zoom, rasterScale=options.rasterScale;
    if (![width,height,cropWidth,cropHeight,zoom,rasterScale].every(positive)) return invalid('크기와 화면 배율은 양의 유한 숫자여야 합니다');
    const cssWidth=width*zoom, cssHeight=height*zoom, heightRatio=height/REFERENCE_HEIGHT;
    const common=Math.max(REFERENCE_HEIGHT,height);
    // Divide before multiplying to keep the normalized bars bounded even for large valid heights.
    const referenceBar=MAX_BAR_HEIGHT*(REFERENCE_HEIGHT/common), objectBar=MAX_BAR_HEIGHT*(height/common);
    if (![cssWidth,cssHeight,heightRatio,referenceBar,objectBar].every(Number.isFinite)) return invalid('크기 비교 계산 범위 초과');
    let resolution;
    if (Array.isArray(object.mask)) resolution={status:'masked',scaleX:null,scaleY:null,maxScale:null};
    else {
      const scaleX=cssWidth*rasterScale/cropWidth, scaleY=cssHeight*rasterScale/cropHeight;
      const maxScale=Math.max(scaleX,scaleY);
      if (![scaleX,scaleY,maxScale].every(Number.isFinite)) return invalid('크기 비교 계산 범위 초과');
      resolution={status:maxScale>1?'enlarged':maxScale===1?'native':'reduced',scaleX,scaleY,maxScale};
    }
    return {valid:true,referenceHeight:REFERENCE_HEIGHT,heightRatio,
      world:{width,height},sourceCrop:{width:cropWidth,height:cropHeight},css:{width:cssWidth,height:cssHeight},
      resolution,bars:{maxHeight:MAX_BAR_HEIGHT,reference:referenceBar,object:objectBar}};
  } catch (_) { return invalid('크기 비교 입력을 읽을 수 없습니다'); }
}
