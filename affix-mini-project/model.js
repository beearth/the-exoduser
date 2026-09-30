const ID_PATTERN = /^\*\*(U-D\d{2})\*\*\s+(.+)$/;
const RANGE_PATTERN = /\*\*[^*]*?(\d+)~(\d+)([^*]*)\*\*/;

export function parseCandidates(markdown) {
  return markdown.split(/\r?\n/).flatMap((line) => {
    if (!line.startsWith('| **U-D')) return [];
    const cells = line.split('|').slice(1, -1).map((cell) => cell.trim());
    if (cells.length !== 7) throw new Error(`어픽스 표 열 수 오류: ${line.slice(0, 40)}`);
    const heading = cells[0].match(ID_PATTERN);
    const range = cells[2].match(RANGE_PATTERN);
    if (!heading || !range) throw new Error(`어픽스 형식 오류: ${cells[0]}`);
    const divider = heading[2].lastIndexOf(' / ');
    return [{
      id: heading[1],
      family: divider < 0 ? heading[2] : heading[2].slice(0, divider),
      name: divider < 0 ? heading[2] : heading[2].slice(divider + 3),
      effect: cells[1],
      rolling: cells[2],
      hook: cells[3],
      interaction: cells[4],
      balance: cells[5],
      risk: cells[6],
      min: Number(range[1]),
      max: Number(range[2]),
      unit: range[3].split('/')[0].trim(),
    }];
  });
}

export function rollCandidate(candidate, random = Math.random) {
  const count = candidate.max - candidate.min + 1;
  if (!Number.isInteger(count) || count < 1) throw new Error('잘못된 롤 범위');
  const point = Math.max(0, Math.min(0.999999999, Number(random())));
  const value = candidate.min + Math.floor(point * count);
  const lowCount = Math.ceil(count / 3);
  const midCount = Math.floor(count / 3);
  const tier = value < candidate.min + lowCount ? '하옵'
    : value < candidate.min + lowCount + midCount ? '중옵' : '상옵';
  return { value, tier, display: `${value}${candidate.unit}` };
}

export function toggleBuild(build, id, capacity = 3) {
  if (build.includes(id)) return build.filter((entry) => entry !== id);
  return build.length >= capacity ? [...build] : [...build, id];
}
