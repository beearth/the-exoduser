// Source/render-state contracts; Mac Metal images remain the visual gate.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const base='unity/Assets/Exoduser/';
const source=read(base+'Resources/Shaders/A2RootSurface.shader');
const depth=read(base+'Resources/Shaders/GroundSkillReceiverDepth.shader');
const projection=read(base+'Runtime/NativeGroundSkillProjection.cs');
const clip=read(base+'Resources/Shaders/GroundSkillProjection.shader');
const sourceBias=source.match(/Offset\s+(-?[\d.]+),\s*(-?[\d.]+)/).slice(1).map(Number);
function rootReceiverBias(){const m=projection.match(/rootDepthMaterial\.SetFloat\("_ReceiverDepthBias",\s*(-?[\d.]+)f?\)/);return m?Number(m[1]):0;}
test('root receiver uses the same slope and units bias at registration and refresh',()=>{
  assert.match(depth,/Offset\s+\[_ReceiverDepthBias\],\s*\[_ReceiverDepthBias\]/);
  assert.deepEqual([rootReceiverBias(),rootReceiverBias()],sourceBias,'biased visible root and unbiased receiver can self-occlude on a slope');
  assert.match(projection,/draw.sharedMaterial=ReceiverDepthMaterial\(owner\)/);
  assert.match(projection,/record.Draw.sharedMaterial=ReceiverDepthMaterial\(record.Owner\)/);
});
test('same-surface grazing polygon survives the existing 2cm guard after matching its raster depth',()=>{
  // Standard perspective z=1-near/eye; use the real shader bias with a
  // polygon depth slope. A different foreground prop must still occlude.
  const z=.97,slope=.0002,unit=1e-7,eye=z=>.3/(1-z);
  const scene=eye(z+sourceBias[0]*slope+sourceBias[1]*unit);
  const receiver=eye(z+rootReceiverBias()*slope+rootReceiverBias()*unit);
  assert.ok(scene+.02>=receiver,'same visible surface rejected by the unchanged scene-depth guard');
  assert.ok(receiver-.25+.02<receiver,'foreground separation of25cm remains occluded');
});
test('receiver exclusions and global depth tolerance are not widened',()=>{
  assert.match(clip,/clip\(sceneEye\+\.02-receiverEye\)/);
  assert.match(depth,/clip\(normalize\(input.normalWS\).y-\.2\)/);
  assert.match(projection,/ProjectionRenderingLayer = 1u << 30/);
});
test('Mac batch QA uses GPU camera rendering and does not wait for an end-of-frame window capture',()=>{
  const code=read(base+'Runtime/NativeGame.GroundSkillCapture.cs');
  assert.match(code,/GraphicsDeviceType.Null/);
  assert.match(code,/if\(!batch\)yield return new WaitForEndOfFrame/);
  assert.match(code,/GroundMapRender\(r3Cam,target/);
  assert.match(code,/if\(!batch\)Screen.SetResolution/);
});
