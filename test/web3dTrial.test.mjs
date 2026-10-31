import test from 'node:test';
import assert from 'node:assert/strict';
import { trialEnabled, coreToWorld, worldToCore, projectGround, unprojectGround } from '../web3d/core.mjs';

test('3D trial requires the exact opt-in flag', () => {
  for (const query of ['', '?r3d=0', '?r3d=true', '?other=1']) assert.equal(trialEnabled(query), false);
  assert.equal(trialEnabled('?r3d=1'), true);
});

test('Core positions round trip without changing collision coordinates', () => {
  for (const point of [{x:0,y:0}, {x:4000,y:7120}, {x:3123.125,y:6789.875}]) {
    const inverse=worldToCore(coreToWorld(point));
    assert.ok(Math.hypot(point.x-inverse.x,point.y-inverse.y)<1e-9);
  }
});

test('camera projection and pointer inverse agree over the whole viewport', () => {
  const camera = {x:4000,y:7120,width:1920,height:1080,zoom:1,angle:52*Math.PI/180,yaw:0.26};
  for (const point of [{x:4000,y:7120}, {x:3500,y:6500}, {x:4400,y:7500}]) {
    const screen = projectGround(point,camera);
    const inverse = unprojectGround(screen,camera);
    assert.ok(Math.hypot(point.x-inverse.x,point.y-inverse.y)<1e-8);
  }
});
