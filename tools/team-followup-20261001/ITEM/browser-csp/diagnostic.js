(()=>{
  const events=[];
  let action='baseline: no intentional style injection';
  function render(){
    const output=document.getElementById('events');
    if(output)output.textContent=JSON.stringify(events,null,2);
  }
  document.addEventListener('securitypolicyviolation',event=>{
    events.push({at:performance.now(),action,effectiveDirective:event.effectiveDirective,
      violatedDirective:event.violatedDirective,blockedURI:event.blockedURI,
      sourceFile:event.sourceFile,lineNumber:event.lineNumber,columnNumber:event.columnNumber,
      sample:event.sample,disposition:event.disposition,originalPolicy:event.originalPolicy});
    render();
  });
  document.addEventListener('DOMContentLoaded',()=>{
    document.getElementById('status').textContent='초기 baseline 로그부터 확인하세요. 원주입자 귀속은 event 원자료와 DOM 증거가 필요합니다.';
    render();
    document.getElementById('element-probe').addEventListener('click',()=>{
      action='explicit STYLE element counterexample';
      const style=document.createElement('style');
      style.id='item-csp-explicit-style';style.textContent='#probe-target { color: red; }';
      document.head.appendChild(style);
    });
    document.getElementById('attribute-probe').addEventListener('click',()=>{
      action='explicit style attribute counterexample';
      document.getElementById('probe-target').setAttribute('style','color: red');
    });
  },{once:true});
})();
