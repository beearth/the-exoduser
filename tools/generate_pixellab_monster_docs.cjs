#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PIXELLAB_ROOT = path.join(ROOT, 'img', 'pixellab_all');
const DOCS_DIR = path.join(ROOT, 'docs', '8.0몬스터디자인');
const COMPLETION_DOC = path.join(DOCS_DIR, 'pixellab_몬스터_완성도리스트.md');
const CATEGORY_DOC = path.join(DOCS_DIR, 'pixellab_종류분류.md');
const CATEGORY_BASELINE = path.join(__dirname, 'pixellab_monster_categories_baseline.md');

const CATEGORY_OVERRIDES = {
  '7352662f-957e-4541-9a21-33e50bccda6d': '2. 얼음 (Ice) — 빙결/서리/눈',
  'f56c935d-f078-4b10-a5ec-19d1c86ae384': '2. 얼음 (Ice) — 빙결/서리/눈',
  'b6777e00-e295-45ec-814c-93b4fe13c32a': '2. 얼음 (Ice) — 빙결/서리/눈',
};

function formatToday() {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Seoul',
  }).format(new Date());
}

function walkMetadata(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkMetadata(fullPath, out);
      continue;
    }
    if (entry.isFile() && entry.name === 'metadata.json') {
      out.push(fullPath);
    }
  }
  return out;
}

function loadCharacter(filePath) {
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const character = raw.character || {};
  const rotations = raw.frames?.rotations || {};
  const animations = raw.frames?.animations || {};
  const animationTypes = Object.keys(animations).length;
  const animationDirectionSets = Object.values(animations).reduce((sum, dirs) => {
    if (!dirs || typeof dirs !== 'object') return sum;
    return sum + Object.keys(dirs).length;
  }, 0);

  return {
    id: character.id,
    name: character.name || path.basename(path.dirname(filePath)),
    directions: Number(character.directions) || Object.keys(rotations).length || 0,
    size: Number(character.size?.width) || Number(character.size?.height) || 0,
    rotationDirections: Object.keys(rotations).length,
    animationTypes,
    animationDirectionSets,
    sourcePath: filePath,
  };
}

function chooseBetterRow(nextRow, prevRow) {
  if (!prevRow) return true;
  if (nextRow.animationDirectionSets !== prevRow.animationDirectionSets) {
    return nextRow.animationDirectionSets > prevRow.animationDirectionSets;
  }
  if (nextRow.animationTypes !== prevRow.animationTypes) {
    return nextRow.animationTypes > prevRow.animationTypes;
  }
  if (nextRow.rotationDirections !== prevRow.rotationDirections) {
    return nextRow.rotationDirections > prevRow.rotationDirections;
  }
  return nextRow.sourcePath.localeCompare(prevRow.sourcePath, 'ko') < 0;
}

function collectUniqueCharacters() {
  const unique = new Map();
  for (const filePath of walkMetadata(PIXELLAB_ROOT)) {
    const row = loadCharacter(filePath);
    if (!row.id) continue;
    if (chooseBetterRow(row, unique.get(row.id))) {
      unique.set(row.id, row);
    }
  }
  return [...unique.values()].sort((a, b) => {
    if (a.animationDirectionSets !== b.animationDirectionSets) {
      return b.animationDirectionSets - a.animationDirectionSets;
    }
    if (a.animationTypes !== b.animationTypes) {
      return b.animationTypes - a.animationTypes;
    }
    if (a.rotationDirections !== b.rotationDirections) {
      return b.rotationDirections - a.rotationDirections;
    }
    const nameDiff = a.name.localeCompare(b.name, 'ko');
    if (nameDiff !== 0) return nameDiff;
    return a.id.localeCompare(b.id);
  });
}

function padIndex(index) {
  return String(index).padStart(3, '0');
}

function formatDirectionLabel(row) {
  return row.directions ? `${row.directions}dir` : '-';
}

function formatSizeLabel(row) {
  return row.size ? `${row.size}px` : '-';
}

function buildCompletionDoc(rows) {
  const today = formatToday();
  const withAnimation = rows.filter((row) => row.animationDirectionSets > 0);
  const zeroAnimation = rows.filter((row) => row.animationDirectionSets === 0);
  const eightDir = rows.filter((row) => row.directions === 8).length;
  const maxRow = rows[0];

  const lines = [
    '# PixelLab 몬스터 애니메이션 완성도 리스트',
    `> 생성일: ${today} | 총 ${rows.length}개 (플레이어/펫 제외)`,
    '> 기준: `img/pixellab_all/**/metadata.json` 유니크 ID 기준 dedupe',
    '> 정렬: 애니 방향세트 내림차순 → 애니 타입 수 → 회전 방향 수 → 이름',
    '',
    '| # | 이름 | ID | 방향 | 크기 | 애니 타입 | 애니 방향세트 |',
    '|---|------|-----|------|------|-----------|----------------|',
  ];

  rows.forEach((row, index) => {
    lines.push(
      `| ${padIndex(index + 1)} | ${row.name} | ${row.id} | ${formatDirectionLabel(row)} | ${formatSizeLabel(row)} | ${row.animationTypes} | ${row.animationDirectionSets} |`
    );
  });

  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## 요약');
  lines.push(`- **애니 1개 이상**: ${withAnimation.length}개`);
  lines.push(`- **애니 0개 (스프라이트만)**: ${zeroAnimation.length}개`);
  lines.push(`- **8방향 캐릭터**: ${eightDir}개`);
  lines.push(
    `- **최다 애니 방향세트**: #${padIndex(1)} ${maxRow.name} (${maxRow.animationDirectionSets}세트, ${maxRow.animationTypes}타입)`
  );

  return lines.join('\n') + '\n';
}

function parseCategorySections(markdown) {
  const sections = [];
  let current = null;

  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line.startsWith('## ')) {
      current = {
        title: line.slice(3).trim(),
        rows: [],
      };
      sections.push(current);
      continue;
    }
    if (!current || !line.startsWith('|')) continue;

    const cells = line
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim());

    if (cells.length < 3) continue;
    if (cells[0] === '#' || cells[0] === '이름' || cells[0].startsWith('---')) continue;

    if (cells.length >= 4 && /^\d+$/.test(cells[0])) {
      current.rows.push({
        id: cells[2],
      });
      continue;
    }

    current.rows.push({
      id: cells[1],
    });
  }

  return sections;
}

function loadCategoryBaseline() {
  if (fs.existsSync(CATEGORY_BASELINE)) {
    return fs.readFileSync(CATEGORY_BASELINE, 'utf8');
  }
  if (fs.existsSync(CATEGORY_DOC)) {
    return fs.readFileSync(CATEGORY_DOC, 'utf8');
  }
  return '';
}

function buildCategoryDoc(rows) {
  const today = formatToday();
  const rowById = new Map(rows.map((row) => [row.id, row]));
  const rowByShortId = new Map(rows.map((row) => [row.id.slice(0, 8), row]));
  const sections = parseCategorySections(loadCategoryBaseline());
  const sectionMap = new Map(sections.map((section) => [section.title, section]));
  const usedIds = new Set();

  for (const section of sections) {
    const nextRows = [];
    for (const rowRef of section.rows) {
      const row = rowById.get(rowRef.id) || rowByShortId.get(rowRef.id);
      if (!row) continue;
      nextRows.push(row);
      usedIds.add(row.id);
    }
    section.rows = nextRows;
  }

  const extras = rows.filter((row) => !usedIds.has(row.id));
  const uncategorized = [];

  for (const row of extras) {
    const targetTitle = CATEGORY_OVERRIDES[row.id];
    if (!targetTitle) {
      uncategorized.push(row);
      continue;
    }
    const section = sectionMap.get(targetTitle);
    if (!section) {
      uncategorized.push(row);
      continue;
    }
    section.rows.push(row);
    usedIds.add(row.id);
  }

  const lines = [
    '# PixelLab 몬스터 종류 분류',
    `> ${rows.length}개 유니크 캐릭터 | ${today}`,
    '> 기준: `img/pixellab_all/**/metadata.json` 유니크 ID 기준',
    '> 순번 컬럼 제거: 완성도 정렬 변경과 분리된 ID 기준 분류표',
    '',
    '---',
    '',
  ];

  for (const section of sections) {
    if (!section.rows.length) continue;
    lines.push(`## ${section.title}`);
    lines.push('| 이름 | ID | 크기 |');
    lines.push('|------|-----|------|');
    for (const row of section.rows) {
      lines.push(`| ${row.name} | ${row.id.slice(0, 8)} | ${formatSizeLabel(row)} |`);
    }
    lines.push('');
  }

  if (uncategorized.length) {
    lines.push('## 기타/미분류 — 신규 확인 필요');
    lines.push('| 이름 | ID | 크기 |');
    lines.push('|------|-----|------|');
    for (const row of uncategorized) {
      lines.push(`| ${row.name} | ${row.id.slice(0, 8)} | ${formatSizeLabel(row)} |`);
    }
    lines.push('');
  }

  return lines.join('\n') + '\n';
}

function main() {
  const rows = collectUniqueCharacters();
  fs.writeFileSync(COMPLETION_DOC, buildCompletionDoc(rows), 'utf8');
  fs.writeFileSync(CATEGORY_DOC, buildCategoryDoc(rows), 'utf8');
  console.log(
    JSON.stringify(
      {
        updated: [
          path.relative(ROOT, COMPLETION_DOC),
          path.relative(ROOT, CATEGORY_DOC),
        ],
        total: rows.length,
        withAnimation: rows.filter((row) => row.animationDirectionSets > 0).length,
        zeroAnimation: rows.filter((row) => row.animationDirectionSets === 0).length,
      },
      null,
      2
    )
  );
}

main();
