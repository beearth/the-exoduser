export function createHostPortFactory(createFactory,counters,report){
  return dependencies=>{
    const port=createFactory(dependencies);
    return Object.freeze({...port,
      restoreItem(item){
        const before={base:counters.base,d10:counters.d10};
        const restored=port.restoreItem(item);
        counters.restoreCalls++;
        counters.restoreRng+=counters.base-before.base+counters.d10-before.d10;
        if(restored!==item||counters.restoreRng!==0)throw new Error('복원 객체/RNG 계약 위반');
        report();return restored;
      }
    });
  };
}

export async function verifyHTTP(fetchResource){
  const response=await fetchResource('./manifest.json',{cache:'no-store'});
  if(!response.ok)throw new Error('manifest HTTP '+response.status);
  const manifest=await response.json();
  if(manifest.schema!=='reviewOnly-browser-host-v1')throw new Error('manifest schema 불일치');
  for(const entry of manifest.httpChecks){
    const moduleResponse=await fetchResource(entry.url,{cache:'no-store'});
    const mime=moduleResponse.headers.get('content-type')||'';
    if(!moduleResponse.ok||!/(?:application|text)\/(?:javascript|ecmascript)/i.test(mime))throw new Error('전이 HTTP/MIME 오류: '+entry.url+' '+moduleResponse.status+' '+mime);
  }
  return manifest;
}

export function initializeReviewHost(document,host,fetchResource){
  const get=id=>document.getElementById(id),status=get('status'),counts=get('counts'),errors=get('errors');
  const counters={base:0,d10:0,restoreCalls:0,restoreRng:0};
  let mount=null,busy=false;
  const report=()=>{counts.textContent='base RNG='+counters.base+' · D10 RNG='+counters.d10+' · restore RNG='+counters.restoreRng+' · 복원조회='+counters.restoreCalls;};
  const failure=message=>{errors.textContent=message;status.textContent='검토 오류 · 미완료. CSP/HTTP MIME/import 진단을 확인하세요.';};
  host.addEventListener('securitypolicyviolation',event=>failure('CSP '+event.violatedDirective+' '+event.blockedURI));
  host.addEventListener('error',event=>failure('스크립트 오류 '+event.message));
  host.addEventListener('unhandledrejection',event=>failure('import/Promise 오류 '+String(event.reason)));
  get('install').addEventListener('click',async()=>{
    if(busy||mount){failure('중복 설치 요청: 먼저 해제하세요.');return;}
    if(get('opt-in').checked!==true){failure('reviewOnly opt-in을 먼저 선택하세요.');return;}
    busy=true;get('install').disabled=true;errors.textContent='';status.textContent='전이 HTTP MIME 확인 중 · 아직 미설치';
    try{
      await verifyHTTP(fetchResource);
      const [{createD10PersistenceIntegration},{createMkItemFixture},{mountD10PersistenceReview}]=await Promise.all([
        import('./persistence-integration-port.js'),import('./mk-item-fixture.js'),import('../browser-bootstrap-ui.js')
      ]);
      const mkItem=createMkItemFixture({random:()=>{counters.base++;report();return .5;}});
      const createPort=createHostPortFactory(createD10PersistenceIntegration,counters,report);
      mount=mountD10PersistenceReview({document,container:get('review'),host,reviewOnly:true,createPort,mkItem,
        rng:()=>{counters.d10++;report();return .5;},request:{proposalOnly:true,uniqueId:'UI-10',tier:1,element:0,baseRarity:2}});
      status.textContent='reviewOnly 설치 완료 · 아래 신규/JSON읽기 버튼을 명시 호출하세요. 비활성 유지.';
    }catch(error){failure(String(error.stack||error));}
    finally{busy=false;get('install').disabled=false;report();}
  });
  get('uninstall').addEventListener('click',()=>{
    if(busy){failure('설치 의존확인 중입니다. 완료 후 해제하세요.');return;}
    try{if(mount){mount.close();mount=null;}status.textContent='검토 해제 완료 · 기존 property 보존 · 자동 재설치 없음';report();}
    catch(error){failure('해제 실패 '+error.message);}
  });
  status.textContent='호스트 준비 · 실제 브라우저 import는 설치 버튼 호출 전 미확인 · 자동 설치/생성 없음';report();
  return Object.freeze({counters});
}

if(typeof document!=='undefined')initializeReviewHost(document,window,window.fetch.bind(window));
