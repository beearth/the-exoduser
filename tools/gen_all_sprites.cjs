/**
 * 투사체 스프라이트시트 전체 자동 생성 스크립트
 * Electron을 headless로 사용하여 Three.js WebGL 렌더링 → img/ 폴더에 PNG 저장
 *
 * 실행: node tools/gen_all_sprites.js
 * (프로젝트 루트에서 실행)
 */

const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Electron 바이너리 경로
const electronPath = require(path.join(__dirname, '..', 'Electron', 'node_modules', 'electron'));

// 이 스크립트가 Electron 메인 프로세스로 실행된 경우
if (process.versions.electron) {
  runElectronMain();
} else {
  // Node.js에서 실행 → Electron 서브프로세스로 재실행
  console.log('[gen_all_sprites] Electron으로 스프라이트 생성 시작...');
  const imgDir = path.join(__dirname, '..', 'img');
  if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });

  try {
    execFileSync(electronPath, [__filename], {
      stdio: 'inherit',
      env: { ...process.env, ELECTRON_DISABLE_SECURITY_WARNINGS: 'true' },
      timeout: 60000
    });
  } catch (e) {
    console.error('[gen_all_sprites] Electron 실행 실패:', e.message);
    process.exit(1);
  }
}

function runElectronMain() {
  const { app, BrowserWindow, ipcMain } = require('electron');

  // GPU 가속 사용 (Three.js WebGL 렌더링 필요)

  app.whenReady().then(async () => {
    const win = new BrowserWindow({
      width: 800, height: 600,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'gen_preload.js')
      }
    });

    const htmlPath = path.join(__dirname, 'projectile_sprite_gen.html');
    await win.loadFile(htmlPath);

    // Three.js 로드 대기
    await win.webContents.executeJavaScript(`
      new Promise((resolve, reject) => {
        let tries = 0;
        const check = () => {
          if (typeof THREE !== 'undefined') return resolve(true);
          if (++tries > 50) return reject(new Error('Three.js 로드 타임아웃'));
          setTimeout(check, 100);
        };
        check();
      });
    `);

    console.log('[gen_all_sprites] Three.js 로드 완료, 렌더링 시작...');

    // 스프라이트 목록 가져오기
    const spriteList = await win.webContents.executeJavaScript(`
      (function(){
        const list = [];
        for (const type of PROJ_TYPES) {
          if (type.hasElement) {
            for (let ei = 0; ei < ELEMENTS.length; ei++) {
              list.push({ typeId: type.id, elIdx: ei, filename: 'proj_' + type.id + '_' + ELEMENTS[ei].id + '.png' });
            }
          } else {
            list.push({ typeId: type.id, elIdx: 0, filename: 'proj_' + type.id + '.png' });
          }
        }
        return list;
      })();
    `);

    const imgDir = path.join(__dirname, '..', 'img');
    let count = 0;

    for (const { typeId, elIdx, filename } of spriteList) {
      // 각 스프라이트를 렌더링하고 base64 PNG 추출
      const dataUrl = await win.webContents.executeJavaScript(`
        (function(){
          const type = PROJ_TYPES.find(t => t.id === '${typeId}');
          const el = ELEMENTS[${elIdx}];
          const sheet = renderSpriteSheet(type, el, 1);
          return sheet.toDataURL('image/png');
        })();
      `);

      const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
      const filePath = path.join(imgDir, filename);
      fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));
      count++;
      console.log(`  [${count}/${spriteList.length}] ${filename}`);
    }

    console.log(`[gen_all_sprites] 완료! ${count}개 파일 → img/ 폴더에 저장됨`);
    app.quit();
  });
}
