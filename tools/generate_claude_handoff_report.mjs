import fs from 'node:fs';
import path from 'node:path';
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  HeadingLevel,
  LevelFormat,
  Packer,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';

const outPath = path.resolve('docs/12퍼포먼스·최적화/CLAUDE_CODE_인수인계_전체작업보고서_2026-08-10.docx');
const contentWidth = 9026;
const border = { style: BorderStyle.SINGLE, size: 1, color: 'C8CDD3' };
const borders = { top: border, bottom: border, left: border, right: border };

const para = (text, options = {}) => new Paragraph({
  spacing: { after: 110, ...options.spacing },
  ...options,
  children: options.children || [new TextRun(text)],
});

const heading = (text, level = 1) => new Paragraph({
  heading: level === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
  children: [new TextRun(text)],
});

const bullet = (text) => new Paragraph({
  numbering: { reference: 'bullets', level: 0 },
  children: [new TextRun(text)],
});

function table(headers, rows, widths) {
  const makeCell = (text, width, header = false) => new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    shading: header ? { fill: 'E8EDF2', type: ShadingType.CLEAR } : undefined,
    children: [para(text, { spacing: { after: 0 }, children: [new TextRun({ text, bold: header })] })],
  });
  return new Table({
    width: { size: contentWidth, type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      new TableRow({ children: headers.map((h, i) => makeCell(h, widths[i], true)) }),
      ...rows.map(row => new TableRow({ children: row.map((value, i) => makeCell(value, widths[i])) })),
    ],
  });
}

const children = [
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 220 },
    children: [new TextRun({ text: 'Claude Code 인수인계 — 전체 작업 보고서', bold: true, size: 38 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 420 },
    children: [new TextRun({ text: '지옥의 길 / HELL: EXODUSER  |  2026-08-10', size: 22, color: '4E5968' })],
  }),
  table(['항목', '현재 상태'], [
    ['작업 루트', 'G:\\exoduser'],
    ['주 목표', '500여 엔티티 난전에서 프레임 스파이크 없이 안정적인 60FPS 유지'],
    ['현재 상태', '이동 시 맵 꿈틀거림/끊김은 사용자 확인상 해소. 다음 최적화는 실측 기반으로만 진행.'],
    ['인수인계 원본', 'docs/12퍼포먼스·최적화/CLAUDE_CODE_인수인계_전체작업보고서_2026-08-10.md'],
  ], [2100, 6926]),

  heading('1. 절대 규칙 및 실행 환경'),
  bullet('AGENTS.md가 최우선이다. 코드 변경 뒤에는 반드시 관련 docs 전체 검색, 수치·이름·구현 상태 동기화, 테스트와 diff 검사를 수행한다.'),
  bullet('메인 게임은 game.html 단일 파일이다. 서버는 server.cjs이며 python http.server는 API 404를 만들므로 금지다.'),
  bullet('서버/테스트는 C:\\nvm4w\\nodejs\\node.exe 전체 경로를 사용한다. 일반 node shim은 깨질 수 있다.'),
  bullet('docs/2_3 돌진+패링+방패시스템은 수정 금지. 공격 티켓 시스템, git reset/checkout, 무지개탄 패링 가능 전환도 금지다.'),
  bullet('공유 worktree는 이미 dirty다. 관련 없는 파일을 롤백·정리·포맷하지 않는다. 대형 수정 전 백업을 만든다.'),

  heading('2. 현재 성능 구조'),
  table(['영역', '현재 구조', '유지 원칙'], [
    ['적 렌더', '8방향 인스턴싱 버킷과 사전할당 전송 버퍼', 'Canvas 폴백·충돌·AI는 변경하지 않음'],
    ['VFX', 'GPU VFX 버퍼 + Canvas 폴백 + 실제 draw/flush 워밍업', '사용자 요청에 따라 공격 VFX 외형은 수정하지 않음'],
    ['맵', '스트리밍 청크와 유휴 시간 청크 빌드', 'genFromTemplate, 시작 6시·출구 12시·상단 통로 보장'],
    ['성능 진단', '?perf=1에서만 콘솔 계측', '정상 실행에서는 진단 로그 비용 없음'],
    ['정적 서버', '비HTML 1시간 캐시 + ETag, HTML gzip Buffer 캐시', 'Range 이미지/오디오 스트리밍 보존'],
    ['pProjs', '_PPROJ_POOL=120, 일반 hitSet 재사용', '피해·관통·적중 판정 불변'],
  ], [1700, 3926, 3400]),

  heading('3. 완료한 최적화'),
  heading('3.1 렌더·맵·GPU', 2),
  bullet('적 8방향 인스턴싱과 GPU VFX 버퍼 경로를 유지·검증하고 Canvas 폴백을 보존했다.'),
  bullet('적/VFX/보호막의 실사용 이미지에 실제 draw/flush 워밍업을 적용해 최초 텍스처 준비 비용을 로딩/유휴 큐로 이동했다.'),
  bullet('대형 맵의 화면 밖 청크는 유휴 시간에 분산 생성한다. 이동 중 맵 꿈틀거림은 좌표계/뷰포트 캐시 정합성 수정으로 해소됐다.'),
  heading('3.2 프레임 스파이크 진단', 2),
  table(['항목', '구현'], [
    ['디버그 활성', 'URL ?perf=1에서만 _DEBUG_PERF=true'],
    ['기본 로그 차단', '[drawP], [S6-SUB], [S7-SUB], [S7-DETAIL], [POST SPIKE]는 기본 실행에서 출력하지 않음'],
    ['프레임 히치', 'raw rAF 간격이 34ms 초과 시 [FRAME HITCH]를 500ms 간격으로 출력'],
    ['Long Task', '브라우저 Long Task API를 디버그 모드에서만 관찰'],
    ['부트 계측', '[BOOT PERF], [BOOT ASSET SLOW]로 단계별 시간과 500ms 초과 에셋을 기록'],
  ], [2100, 6926]),
  para('Headless Chrome 기준 일반 부트는 약 2.42초, 첫 에셋 이벤트는 약 1.43~1.47초였다. 다수 에셋이 동시 큐에서 완료돼 단일 불량 파일 근거가 없으므로 임의 에셋 제거/지연은 하지 않았다.'),
  heading('3.3 반복 로딩 서버 최적화', 2),
  table(['변경', '동작', '범위'], [
    ['비HTML ETag', 'size/mtime ETag, If-None-Match 일치 시 304', '이미지·오디오·JS·JSON 등 기존 1시간 캐시 유지'],
    ['HTML gzip Buffer 캐시', 'size:mtime 키로 gzip level 6 결과 Promise/Buffer 재사용', 'game.html/index.html의 같은 서버 프로세스 내 반복 요청'],
    ['자동 무효화', '크기 또는 수정시각 변경 시 새 gzip 결과 생성', 'HTML의 no-cache, no-store 정책 유지'],
  ], [2100, 3600, 3326]),
  para('이미지·오디오·Range 요청 및 HTML 이외 gzip 대상은 기존 스트리밍 경로를 유지한다. 이 서버 변경은 서버 재시작 후 적용된다.'),
  heading('3.4 런타임 할당 감소 — 플레이어 투사체', 2),
  bullet('_PPROJ_POOL=120의 각 객체는 _mkPProj()에서 _hitSet을 한 번 생성하며 reset/recycle/spawn에서 clear()로 재사용한다.'),
  bullet('청탄·번개·빙검·악의 사냥·역병 등 일반 _getPProj() 스폰부의 빈 Set 재할당을 제거했다.'),
  bullet('연쇄 분열탄 new Set(p._hitSet)은 자식탄에 피격 이력을 복사하는 예외라 유지했다.'),

  heading('4. 오류/히치 대응 이력'),
  table(['관측', '판단/조치', '현재 상태'], [
    ['아이템 스킨 404 반복', '존재하지 않는 necklace/cape/earring fire 변형의 폴백·누락 처리 경로 점검', '재발 시 Network에서 요청 원점부터 확인'],
    ['POST SPIKE bonfire', '화톳불 배리어 텍스처 업로드를 분리하고 사전 워밍업 경로 적용', '현재 끊김은 사용자 확인상 해소'],
    ['drawP S6/S7 수십 ms', '구간·서브구간 로그를 ?perf=1 전용으로 제한', '정상 실행 로그 비용 없음'],
    ['이동 시 맵 꿈틀거림', '스트리밍 캐시 뷰포트 원점/빌드 타이밍 정합성 점검', '사용자 확인상 해소'],
  ], [2200, 3900, 2926]),

  heading('5. 최근 검증 결과'),
  para('최근 실행 결과: 테스트 3개 PASS, git diff --check PASS.'),
  bullet('test/pProjHitSetPool.test.js — pProj hitSet 풀 재사용'),
  bullet('test/staticHtmlGzipCache.test.js — HTML gzip Buffer 재사용과 스트리밍 보존'),
  bullet('test/staticAssetEtagCache.test.js — 비HTML ETag/304와 HTML no-cache'),
  para('추가 도구: tools/verify_boot_stage_timing_browser.mjs, test/bootStageTimingDiagnostics.test.js, test/bootAssetSlowDiagnostics.test.js, test/frameSpikeDiagnosticDebugGate.test.js, test/frameHitchGapDiagnostics.test.js, test/longTaskDiagnostics.test.js.'),

  heading('6. 현재 보류 지점과 다음 권장 순서'),
  heading('6.1 즉시 다음 후보 — 역병 투사체 할당 감사', 2),
  para('조사만 했고 아직 수정하지 않았다. p.plagueBlade는 적중 때 p._plagueTargets.push({x, y}) 객체를 만들고, Finale 시 중복 타격 방지용 new Set()을 만든다.'),
  bullet('_plagueCap은 최대 100까지 가능하다. 임의의 30개 고정 버퍼는 금지다.'),
  bullet('타깃 이력은 Finale AoE 위치와 직접 연결되므로 x/y 버퍼·카운터·재사용 Set으로 바꿔도 순서·반경·중복 타격 판정이 동일해야 한다.'),
  bullet('실제 perf 로그에서 역병 난사 GC가 병목으로 확인되기 전에는 고위험 구조 변경을 하지 않는다.'),
  heading('6.2 이후 우선순위', 2),
  bullet('?perf=1 실기기 로그로 재현되는 병목 하나를 먼저 선택한다.'),
  bullet('첫 투사체/VFX 히치가 재현되면 실제 이미지·블렌드 경로만 워밍업한다. 임의 웜업은 금지다.'),
  bullet('GPU 배칭은 드로우콜/텍스처 전환이 병목으로 확인된 경우에만 진행한다. 충돌·AI·밸런스와 분리한다.'),
  bullet('맵 스트리밍은 안정화 상태다. 청크가 다시 16ms를 넘는 실측이 있을 때만 재검토한다.'),

  heading('7. Claude Code 작업 체크리스트'),
  bullet('해당 시스템 문서를 먼저 읽고, 관련 docs 전체를 rg로 검색한다.'),
  bullet('테스트를 먼저 추가하고 실패를 확인한 다음 최소 수정한다.'),
  bullet('관련 테스트와 git diff --check를 실행하고, 코드/문서의 구현 상태와 수치를 완전히 동기화한다.'),
  bullet('공격 VFX 외형, 돌진/패링/방패 확정 설계, 맵 필수 규칙은 바꾸지 않는다.'),
  bullet('공유 dirty worktree의 무관한 변경은 절대 롤백하거나 정리하지 않는다.'),
];

const doc = new Document({
  styles: {
    default: { document: { run: { font: 'Arial', size: 20 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 30, bold: true, font: 'Arial' }, paragraph: { spacing: { before: 260, after: 160 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 24, bold: true, font: 'Arial' }, paragraph: { spacing: { before: 180, after: 110 }, outlineLevel: 1 } },
    ],
  },
  numbering: {
    config: [{ reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 540, hanging: 270 } } } }] }],
  },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1050, right: 1440, bottom: 1050, left: 1440 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun('HELL: EXODUSER | Claude Code Handoff | Page '), new TextRun({ children: [PageNumber.CURRENT] })] })] }) },
    children,
  }],
});

const buffer = await Packer.toBuffer(doc);
fs.writeFileSync(outPath, buffer);
console.log(outPath);
