import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root = fileURLToPath(new URL('../../../', import.meta.url));
export function analyze() {
  const paths = ['ch1-living-detail.js', 'game.html', ...['raw.json', 'profile.cpuprofile', 'clock.json', 'preflight.json'].map(name => `outputs/team-review-20261001/draw-attribution/${name}`)];
  const bytes = paths.map(path => readFileSync(root + path));
  const hashes = Object.fromEntries(paths.map((path, index) => [path, createHash('sha256').update(bytes[index]).digest('hex')]));
  const raw = JSON.parse(bytes[2]);
  const profile = JSON.parse(bytes[3]);
  const clock = JSON.parse(bytes[4]);
  const source = bytes[0].toString();
  const span = raw.spans.find(span => span.kind === 'draw' && span.loopId === 686);
  if (!span || span.duration !== 99) throw new Error('99ms 원표본 불일치');
  const navigationUs = clock.metrics.metrics.find(metric => metric.name === 'NavigationStart').value * 1e6;
  const anchorMs = (clock.metrics.metrics.find(metric => metric.name === 'Timestamp').value * 1e6 - navigationUs) / 1000;
  if (anchorMs < clock.anchorBefore.result.value || anchorMs > clock.anchorAfter.result.value) throw new Error('시계 bracket 불일치');
  const parents = new Map();
  const nodes = new Map(profile.nodes.map(node => [node.id, node]));
  for (const node of profile.nodes) for (const child of node.children || []) parents.set(child, node.id);
  let timestamp = profile.startTime;
  let membraneOverlapMs = 0;
  let membraneSamples = 0;
  const metadataPaths = [];
  function visit(value, path) {
    if (!value || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value)) {
      if (/variant|membrane|atlas|cachekey/i.test(key)) metadataPaths.push(`${path}.${key}`);
      visit(child, `${path}.${key}`);
    }
  }
  visit(raw, 'raw');
  for (let index = 0; index < profile.samples.length; index++) {
    timestamp += profile.timeDeltas[index];
    const start = (timestamp - navigationUs) / 1000;
    const end = (timestamp + (profile.timeDeltas[index + 1] || 0) - navigationUs) / 1000;
    const overlap = Math.max(0, Math.min(span.end, end) - Math.max(span.start, start));
    let nodeId = profile.samples[index];
    while (nodeId !== undefined) {
      if (nodes.get(nodeId).callFrame.functionName === 'membrane') {
        if (overlap) { membraneOverlapMs += overlap; membraneSamples++; }
        break;
      }
      nodeId = parents.get(nodeId);
    }
  }
  const sourceEvidence = source.split('\n').flatMap((line, index) => /const membranes=|const atlases=|const id=wet\?3:variant|const id=surfaceOnly\?|const variant=wet\|\|surfaceOnly|seed=781|membranes\[id\]=|atlases\[id\]=|getImageData\(0,0,320,320\)/.test(line) ? [{line: index + 1, text: line}] : []);
  const relevantNodes = profile.nodes.filter(node => ['membrane', 'paint', 'atlas'].includes(node.callFrame.functionName)).map(node => ({id:node.id, fields:Object.keys(node), ...node.callFrame, line1:node.callFrame.lineNumber + 1}));
  return {status:'정확 variant UNKNOWN', hashes, span, clock:{navigationUs,anchorMs,bracket:[clock.anchorBefore.result.value,clock.anchorAfter.result.value]}, sampleEstimate:{membraneOverlapMs,membraneSamples,method:'샘플 시각부터 다음 샘플까지 겹침; native/GPU 분해 아님'}, metadataPaths, rawTopKeys:Object.keys(raw), spanKeys:Object.keys(span), relevantNodes, sourceEvidence,
    dryCandidates:[0,1,2].map(variant => ({variant,membraneKey:variant,atlasKey:variant ? 3 + variant : 0,seed:781 + variant * 357})),
    inference:'기존 동일 소스와 getImageData 스택에 한해 wet=false·surfaceOnly=false·두 캐시 miss. 인수·대상 좌표·캐시 상태는 원자료에 없어 정확 variant는 미확정.',
    initialization:'각 배열은 모듈 평가 시 빈 배열. 첫 가시 draw가 atlas를 lazy 생성하고 paint 첫 프레임에서 membrane 생성. 완료 후 캐시 공개. 실제 모듈 평가·해당 키 최초 호출 시각 미기록.',
    limits:'GPU 완료·순수 CPU 분해·계측 오버헤드·픽셀·프레임 개선 미검수. 이전 정상표본과 다른 사건.'};
}
if (process.argv[1] === fileURLToPath(import.meta.url)) console.log(JSON.stringify(analyze(), null, 2));
