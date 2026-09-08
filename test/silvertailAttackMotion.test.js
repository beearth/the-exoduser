import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Silvertail gives Ki Slash and E blade parry the same shared back-blade motion', async () => {
  const game = await readFile(new URL('../game.html', import.meta.url), 'utf8');
  assert.match(game, /const _SILVERTAIL_ATTACK_VISUAL_MS=360;/);
  assert.match(game, /const _SILVERTAIL_ATTACK_SPIN_FRAME_MS=60;/);
  assert.match(game, /function _startSilvertailAttackMotion\(kind\)/);
  assert.match(game, /P\._silvAttackKind=kind\|\|'lmb';/);
  assert.match(game, /function _silvertailAttackPose\(\)/);
  assert.match(game, /P\.s!=='wSwing'&&P\.s!=='wRecover'&&P\.s!=='sBash'&&P\.s!=='sRecover'/);
  assert.match(game, /const _silvElapsed=performance\.now\(\)-\(P\._silvAttackStartedAt\|\|0\);/);
  assert.match(game, /const _silvAnimating=!!P\._silvAttackStartedAt&&_silvElapsed<_SILVERTAIL_ATTACK_VISUAL_MS;/);
  assert.match(game, /const _silvSpinFrame=Math\.min\(3,~~\(_silvElapsed\/_SILVERTAIL_ATTACK_SPIN_FRAME_MS\)\);/);
  assert.match(game, /const _silvBaseDir=_facingDir8\(P\.facing\),_silvBaseDirI=_DIR8\.indexOf\(_silvBaseDir\);/);
  assert.match(game, /const _silvSpinOffsets=\[-2,-1,1,2\];/);
  assert.match(game, /spriteDir:_silvHasAtk\?_silvBaseDir:_DIR8\[\(_silvBaseDirI\+_silvSpinOffsets\[_silvSpinFrame\]\+8\)%8\]/);
  assert.match(game, /const _silvNeckLift=11;/);
  assert.match(game, /ctx\.translate\(0,-_silvNeckLift\);/);
  assert.doesNotMatch(game, /const _silvBackA=P\.facing\+Math\.PI;/);
  assert.match(game, /const _silvBladeSide=Math\.cos\(P\.facing\)>=0\?1:-1;/);
  assert.match(game, /const _silvFacingRotation=P\.facing\+Math\.PI\/2;/);
  assert.match(game, /const _silvBackBladeRotation=_silvFacingRotation-_silvBladeSide\*\(Math\.PI\/2\)\*\(1-_silvBackBladeTurn\);/);
  assert.match(game, /backBladeRotation:_silvBackBladeRotation/);
  assert.match(game, /ctx\.rotate\(pose\.backBladeRotation\);/);
  assert.doesNotMatch(game, /ctx\.rotate\(-pose\.bladeRotation\);/);
  assert.match(game, /if\(P\.s==='wSwing'&&_charIdx!==1\)/);
  assert.match(game, /if\(\(P\.s==='sBash'\|\|P\.s==='sRecover'\)&&_charIdx!==1\)/);
  assert.match(game, /_pDk=_apHasDir\?\(_silvAtk\?_silvAtk\.spriteDir:_apDir\):null;/);
  assert.doesNotMatch(game, /X\.rotate\(_silvAtk\.bodyRotation\)/);
  assert.doesNotMatch(game, /X\.rotate\(_silvAtk\.bodyRotation\)/);
  assert.match(game, /function _drawSilvertailBackBlade\(/);
  assert.match(game, /const _silvTipReveal=Math\.max\(0,Math\.min\(1,\(pose\.spinProgress-\.35\)\/\.65\)\);/);
  assert.match(game, /const _silvTipLength=49\*_silvTipReveal;/);
  assert.match(game, /const _silvTipWidth=10;/);
  assert.match(game, /짧은 칼끝만 노출/);
  assert.match(game, /const _silvBladeTipImg=new Image\(\);let _silvBladeTipReady=false;/);
  assert.match(game, /_silvBladeTipImg\.src='img\/exoduser_silvertail\/blade_tip_api_v1_cropped\.png';/);
  assert.match(game, /if\(_silvBladeTipReady\)\{ctx\.drawImage\(_silvBladeTipImg,-_silvTipWidth\/2,_silvTipEnd,_silvTipWidth,_silvTipLength\);\}/);
  assert.match(game, /ctx\.fillStyle='#c7d0d2';/);
  assert.match(game, /_drawSilvertailBackBlade\(X,_silvAtk\);/);
});

test('Silvertail keeps LMB clear of local Moon Arc VFX while preserving a compact KeyE arc', async () => {
  const game = await readFile(new URL('../game.html', import.meta.url), 'utf8');

  assert.doesNotMatch(game, /_silvMoonArcImg/);
  assert.doesNotMatch(game, /function _drawSilvertailMoonArc\(/);
  assert.doesNotMatch(game, /silvertail_moon_arc_violet_api_v2/);
  assert.doesNotMatch(game, /_silvSlashImpactSheet/);
  assert.doesNotMatch(game, /function _drawSilvertailSlashImpactFrame\(/);
  assert.doesNotMatch(game, /function _drawSilvertailAnimatedArc\(/);
  assert.doesNotMatch(game, /_drawSilvertailAnimatedArc\(X,/);
  assert.match(game, /const _silvEArcImg=new Image\(\);let _silvEArcReady=false;/);
  assert.match(game, /function _drawSilvertailEArc\(ctx,pose,scale\)\{/);
  assert.match(game, /if\(pose\.kind!=='shield'\|\|!_silvEArcReady\)return;/);
  assert.match(game, /const _silvEArcDrawW=\(200\+_silvEArcIn\*30\)\*\(scale\|\|1\);/);
  assert.match(game, /const _silvEArcPose=_silvertailAttackPose\(\);if\(_silvEArcPose\)_drawSilvertailEArc\(X,_silvEArcPose,Math\.min\(3,Math\.max\(1,P\._sBashChgMul\|\|1\)\)\);/);
  assert.match(game, /if\(P\.s==='wSwing'&&_charIdx!==1\)/);
  assert.doesNotMatch(game, /function _drawSilvertailSpinSlash\(/);
  assert.doesNotMatch(game, /function _drawSilvertailAttackImpact\(/);
  assert.doesNotMatch(game, /function _drawSilvertailAttackArc\(/);
});

test('Silvertail flies a realistic single-sprite violet slash with keyed alpha and pulse', async () => {
  const game = await readFile(new URL('../game.html', import.meta.url), 'utf8');

  assert.match(game, /const _silvKiSlashImg=new Image\(\);let _silvKiSlashReady=false,_silvKiSlashSurface=null;/);
  assert.match(game, /_silvKiSlashImg\.src='img\/vfx\/silvertail_ki_slash_realistic\.png'/);
  assert.match(game, /_silvKiSlashSurface=_makeGreenChromaCutout\(_silvKiSlashImg\)/);
  assert.match(game, /const _silvPulse=1\+Math\.sin\([^;]+\)\*\.045;/);
  assert.match(game, /X\.drawImage\(_silvKiSlashSurface\|\|_silvKiSlashImg,/);
});

test('Silvertail routes the realistic slash only to LMB projectile and compact v3 only to KeyE', async () => {
  const game = await readFile(new URL('../game.html', import.meta.url), 'utf8');

  assert.match(game, /c\.silvArc=_charIdx===1;/);
  assert.match(game, /if\(c\.silvArc&&_silvKiSlashReady\)\{/);
  assert.match(game, /const _silvCAlpha=Math\.max\(\.82,alpha\);/);
  assert.match(game, /_startSilvertailAttackMotion\('lmb'\);/);
  assert.match(game, /_silvEArcImg\.src='img\/vfx\/silvertail_violet_arc_anim_api_v3\.png\?v=20260810-silvertail-arc-anim-v3';/);
  assert.match(game, /_startSilvertailAttackMotion\('shield'\);/);
  assert.doesNotMatch(game, /\.silvEArc|_silvArcFrameT/);
});

test('Silvertail right-click Malice Orb uses a keyed silver moonblade sprite sheet', async () => {
  const game = await readFile(new URL('../game.html', import.meta.url), 'utf8');

  assert.match(game, /const _silvMaliceOrbImg=new Image\(\);let _silvMaliceOrbReady=false,_silvMaliceOrbSurface=null;/);
  assert.match(game, /_silvMaliceOrbImg\.src='img\/vfx\/silvertail_malice_orb_sheet_v3\.png'/);
  assert.match(game, /_silvMaliceOrbSurface=_makeGreenChromaCutout\(_silvMaliceOrbImg\)/);
  assert.match(game, /if\(_charIdx===1&&_silvMaliceOrbReady\)\{/);
  assert.match(game, /X\.drawImage\(_silvMaliceOrbSurface\|\|_silvMaliceOrbImg,/);
});
