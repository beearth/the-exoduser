export function createReleaseConfig(target,buildId){
 if(!['full','demo'].includes(target))throw Error('Explicit --target=full|demo required');
 if(!/^\d{8}-\d{6}$/.test(buildId))throw Error('Build ID must be YYYYMMDD-HHMMSS');
 const full=target==='full';
 return {schema:1,target,buildId,appId:full?4749590:5337590,depotId:full?4749591:5337591,
  port:full?3350:3351,fallbackPorts:[10,20,30,40].map(d=>(full?3350:3351)+d),saveNamespace:full?'EXODUSER-HELL-FULL':'EXODUSER-HELL-DEMO',
  profile:`./userdata-${target}`,dist:`dist-release-${target}-${buildId}`,out:`out/EXODUSER-${target}-${buildId}`};
}
// 창은 패키지 내부 nw-boot.html로 시작해 node-main이 실제로 연 포트(기본 또는 fallback)의 localhost로 이동한다.
export function releaseEntrypoint(config){return `nw-boot.html${config.target==='demo'?'?demo=1':''}`;}
export function runtimeManifest(pkg,config){
 const ports=[config.port,...config.fallbackPorts];
 return {name:`exoduser-${config.target}`,version:pkg.version,
  main:releaseEntrypoint(config),
  'node-main':pkg['node-main'],'node-remote':ports.flatMap(p=>[`http://127.0.0.1:${p}`,`http://localhost:${p}`]),
  window:pkg.window,'chromium-args':pkg['chromium-args'].replace(/--user-data-dir=\S+/,`--user-data-dir=${config.profile}`),
  exoduser:config};
}
export function validateReleasePackage(artifact,appId,depotId){
 const {config,package:pkg,buildTarget,lobby,game,exe}=artifact;
 const expected=createReleaseConfig(config.target,config.buildId);
 for(const key of Object.keys(expected))if(JSON.stringify(expected[key])!==JSON.stringify(config[key]))throw Error(`Invalid config ${key}`);
 if(appId!==config.appId||depotId!==config.depotId)throw Error('AppID/DepotID/target mismatch');
 if(!exe)throw Error('Windows executable missing');
 const target=config.target;
 if(pkg.exoduser?.target!==target||pkg.exoduser?.appId!==appId||pkg.exoduser?.depotId!==depotId)throw Error('Manifest identity mismatch');
 if(pkg.main!==releaseEntrypoint(config)||pkg.inject_js_end||pkg.inject_js_start)throw Error('Invalid entrypoint or injected QA code');
 if(!pkg['chromium-args'].includes(`--user-data-dir=${config.profile}`)||pkg['chromium-args'].includes('remote-debugging'))throw Error('Invalid release profile');
 if(buildTarget.trim()!==`window.EXODUSER_BUILD_TARGET='${target}';`)throw Error('Build target marker mismatch');
 if(!lobby.includes("const _LOBBY_BUILD=window.EXODUSER_BUILD_TARGET||'demo';")||!game.includes("const _DEMO_MODE=(window.EXODUSER_BUILD_TARGET||'demo')==='demo';"))throw Error('Hardcoded content scope');
 return true;
}
