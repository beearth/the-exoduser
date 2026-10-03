export function createReleaseConfig(target,buildId){
 if(!['full','demo'].includes(target))throw Error('Explicit --target=full|demo required');
 if(!/^\d{8}-\d{6}$/.test(buildId))throw Error('Build ID must be YYYYMMDD-HHMMSS');
 const full=target==='full';
 return {schema:1,target,buildId,appId:full?4749590:5337590,depotId:full?4749591:5337591,
  port:full?3350:3351,saveNamespace:full?'EXODUSER-HELL-FULL':'EXODUSER-HELL-DEMO',
  profile:`./userdata-${target}`,dist:`dist-release-${target}-${buildId}`,out:`out/EXODUSER-${target}-${buildId}`};
}
export function runtimeManifest(pkg,config){
 return {name:`exoduser-${config.target}`,version:pkg.version,
  main:`http://localhost:${config.port}/index.html${config.target==='demo'?'?demo=1':''}`,
  'node-main':pkg['node-main'],'node-remote':[`http://127.0.0.1:${config.port}`,`http://localhost:${config.port}`],
  window:pkg.window,'chromium-args':pkg['chromium-args'].replace(/--user-data-dir=\S+/,`--user-data-dir=${config.profile}`),
  exoduser:config};
}
export function validateReleasePackage(artifact,appId,depotId){
 const {config,package:pkg,buildTarget,lobby,game,exe}=artifact;
 const expected=createReleaseConfig(config.target,config.buildId);
 for(const key of Object.keys(expected))if(expected[key]!==config[key])throw Error(`Invalid config ${key}`);
 if(appId!==config.appId||depotId!==config.depotId)throw Error('AppID/DepotID/target mismatch');
 if(!exe)throw Error('Windows executable missing');
 const target=config.target;
 if(pkg.exoduser?.target!==target||pkg.exoduser?.appId!==appId||pkg.exoduser?.depotId!==depotId)throw Error('Manifest identity mismatch');
 if(pkg.main!==`http://localhost:${config.port}/index.html${target==='demo'?'?demo=1':''}`||pkg.inject_js_end||pkg.inject_js_start)throw Error('Invalid entrypoint or injected QA code');
 if(!pkg['chromium-args'].includes(`--user-data-dir=${config.profile}`)||pkg['chromium-args'].includes('remote-debugging'))throw Error('Invalid release profile');
 if(buildTarget.trim()!==`window.EXODUSER_BUILD_TARGET='${target}';`)throw Error('Build target marker mismatch');
 if(!lobby.includes("const _LOBBY_BUILD=window.EXODUSER_BUILD_TARGET||'demo';")||!game.includes("const _DEMO_MODE=(window.EXODUSER_BUILD_TARGET||'demo')==='demo';"))throw Error('Hardcoded content scope');
 return true;
}
