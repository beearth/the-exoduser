// Authoring evidence only. A valid project is never a production or art approval.
export function productionReview(project, { validation, assetErrors = [], assetReady = false, preview = project.preview, profile = null } = {}) {
  const checks = [];
  const add = (id, name, status, detail, target) => checks.push({ id, name, status, detail, target });
  add('structure', '장면 구조 · 이동 경로', !validation ? 'pending' : validation.ok ? 'ready' : 'blocked',
    !validation ? '검증 대기' : validation.ok ? `구조 통과${validation.route?.path?.length ? ` · 경로 ${validation.route.path.length}셀` : ''} · 실제 주행은 별도 확인` : validation.errors.join(' / '), 'map');
  add('assets', '실제 에셋 로드', assetErrors.length ? 'blocked' : assetReady ? 'ready' : 'pending',
    assetErrors.length ? assetErrors.join(' / ') : assetReady ? '현재 장면의 에셋 로드 완료' : '디코드 완료 대기', 'map');
  const clips = project.characters.flatMap(character => Object.entries(character.animations).map(([name, clip]) => ({ character: character.name, name, ...clip })));
  const missing = clips.filter(clip => clip.frames !== 24 || clip.fps !== 24);
  add('characters', '캐릭터 · 24장 / 24FPS', missing.length || !clips.length ? 'review' : 'ready',
    missing.length ? `${missing.length}/${clips.length}클립 보완: ${missing.slice(0, 3).map(c => `${c.character} ${c.name} ${c.frames}장/${c.fps}FPS`).join(' · ')}` : clips.length ? `${clips.length}클립 선언값 충족 · 고유 그림·손·무기·발 검수는 별도` : '게임용 클립 연결 필요', 'characters');
  const references = project.characterDrafts?.length || 0;
  add('models', '본체 · 리그 · 실루엣 품질', 'pending', references ? `신규 ${references}종 참고 자료 · 게임용 모델·발 접지·8방향 검수 대기` : '실제 본체와 손·무기 연결, 발 접지, 8방향 시각 검수 대기', 'characters');
  const skill = project.skills.find(item => item.id === preview?.skillId);
  const effect = project.vfx.find(item => item.id === skill?.vfx);
  add('skill-vfx', '스킬 → VFX 연결', skill && effect ? 'ready' : 'blocked',
    skill && effect ? `${skill.name} → ${effect.name} · 본편 피해·판정·SFX 연동 대기` : '실행 스킬과 연결 효과를 선택하세요', 'skills');
  add('performance', '성능 · 같은 조건 실측', profile ? 'review' : 'pending',
    profile ? '미리보기 측정 결과 있음 · 최적화 패널에서 조건과 수치 확인 · GPU/본편 실전은 별도' : '최적화 패널에서 목표 FPS와 동시 효과 조건을 정하고 측정하세요', 'optimization');
  add('adoption', '본편 반영 · 최종 인수', 'pending', '실제 게임 caller·전투·세이브 호환과 카메라 검수 후 인수', null);
  return { version: 1, projectId: project.id, preview: { ...preview }, productionApproved: false,
    counts: Object.fromEntries(['ready', 'review', 'blocked', 'pending'].map(status => [status, checks.filter(check => check.status === status).length])), checks };
}
