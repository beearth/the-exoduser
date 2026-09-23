"""Run the actual packaged NW.js executable with a temporary QA injection.
The manifest is restored byte-for-byte in finally; user saves are never used.
"""
import os, sys, json, time, subprocess, hashlib
from pathlib import Path
from urllib.request import urlopen
ROOT=Path('G:/exoduser'); OUT=Path(os.environ.get('EXODUSER_QA_OUTPUT', str(ROOT/'output/steam_review_20260916'))).resolve()
APP=Path(os.environ.get('EXODUSER_QA_PACKAGE', str(ROOT/'out/EXODUSER-win64'))).resolve(); package=APP/'package.nw'
assert OUT.is_relative_to(ROOT/'output'), 'QA output must stay under workspace output'
assert APP.is_relative_to(ROOT/'out'), 'QA package must stay under workspace out'
OUT.mkdir(parents=True,exist_ok=True)
manifest=package/'package.json'; probe=package/'_steam_review_probe.js'
original=manifest.read_bytes(); config=json.loads(original)
server=package/'node-main.js';original_server=server.read_bytes()
assert not probe.exists(), 'QA injection already exists'
qa=OUT/('profiles/verified-'+time.strftime('%H%M%S'));qa.mkdir(parents=True,exist_ok=True)
smoke='--smoke' in sys.argv
report_file=OUT/('runtime-smoke.json' if smoke else 'runtime.json')
if report_file.exists():report_file.rename(OUT/('runtime-attempt-'+time.strftime('%H%M%S')+'.json'))
env=os.environ.copy();env['APPDATA']=str(qa/'appdata');env['LOCALAPPDATA']=str(qa/'localappdata');env['STEAM_LANGUAGE']='koreana'
env['EXODUSER_QA_OUTPUT']=str(OUT)
env['EXODUSER_QA_SMOKE']='1' if smoke else '0'
startup=subprocess.STARTUPINFO();startup.dwFlags|=subprocess.STARTF_USESHOWWINDOW;startup.wShowWindow=0
proc=None
try:
    probe.write_bytes((ROOT/'tools/steam-review-probe.js').read_bytes())
    config['inject_js_end']=probe.name
    config['main']=config['main'].replace(':3333/',':3346/')
    config['node-remote']=[url.replace(':3333',':3346') for url in config['node-remote']]
    server.write_bytes(original_server.replace(b'const PORT = 3333;',b'const PORT = 3346;'))
    config['chromium-args']+=' --disable-background-timer-throttling --disable-renderer-backgrounding --disable-backgrounding-occluded-windows'
    config['chromium-args']=config['chromium-args'].replace('--user-data-dir=./userdata','--user-data-dir='+str(qa/'userdata'))
    manifest.write_text(json.dumps(config),encoding='utf8')
    for launch in range(2):
        proc=subprocess.Popen([str(APP/'EXODUSER.exe')],cwd=APP,env=env,startupinfo=startup,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        verified=False
        for step in range(420):
            if not verified:
                try:
                    body=urlopen('http://127.0.0.1:3346/game.html',timeout=1).read()
                    assert hashlib.sha256(body).digest()==hashlib.sha256((package/'game.html').read_bytes()).digest(),'Wrong server'
                    verified=True
                except OSError:pass
            report=json.loads(report_file.read_text(encoding='utf8')) if report_file.exists() else {}
            if report.get('failure'):raise RuntimeError(report['failure'])
            if report.get('phase')==('restart' if launch==0 else 'complete'):break
            time.sleep(1)
        else:raise TimeoutError('Probe did not finish')
        assert verified
        try:proc.wait(timeout=15)
        except subprocess.TimeoutExpired:subprocess.run(['taskkill','/PID',str(proc.pid),'/T','/F'],capture_output=True)
        print('Launch',launch,'phase',report.get('phase'),flush=True)
        time.sleep(2)
    if not smoke:
        report['phase']='restart-matrix';report_file.write_text(json.dumps(report,ensure_ascii=False),encoding='utf8')
    for launch in range(0 if smoke else 30):
        proc=subprocess.Popen([str(APP/'EXODUSER.exe')],cwd=APP,env=env,startupinfo=startup,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        for step in range(90):
            report=json.loads(report_file.read_text(encoding='utf8'))
            if report.get('failure'):raise RuntimeError(report['failure'])
            if report.get('matrixCompletedLaunch',0)>launch or report.get('phase')=='complete':break
            time.sleep(1)
        else:raise TimeoutError('Restart matrix launch '+str(launch))
        try:proc.wait(timeout=15)
        except subprocess.TimeoutExpired:subprocess.run(['taskkill','/PID',str(proc.pid),'/T','/F'],capture_output=True)
        print('Restart matrix',len(report.get('restartMatrix',[])),flush=True)
        if report.get('phase')=='complete':break
        time.sleep(1)
    if not smoke:assert len(report.get('restartMatrix',[]))==29
finally:
    if proc and proc.poll() is None:subprocess.run(['taskkill','/PID',str(proc.pid),'/T','/F'],capture_output=True)
    manifest.write_bytes(original);server.write_bytes(original_server);probe.unlink(missing_ok=True)
    (OUT/'manifest-restored.json').write_text(json.dumps({'restored':manifest.read_bytes()==original,'serverRestored':server.read_bytes()==original_server,'qaPort':3346,'sha256':hashlib.sha256(original).hexdigest(),'probeRemoved':not probe.exists()}),encoding='utf8')
