/**
 * record_intro.js — Playwright로 index.html 시네마틱 인트로를 녹화
 *
 * 사용법:
 *   npx playwright test record_intro.js --headed
 *
 * 또는 직접:
 *   node record_intro.js
 */

const { chromium } = require('playwright');
const path = require('path');

const WIDTH = 1920;
const HEIGHT = 1080;
const OUTPUT_DIR = path.join(__dirname, 'video');

(async () => {
  console.log('🎬 인트로 녹화 시작...');

  const browser = await chromium.launch({
    headless: false,  // headed 모드로 실행 (GPU 가속 + 오디오)
    args: [
      '--autoplay-policy=no-user-gesture-required',  // 오디오 자동재생 허용
      '--disable-features=PreloadMediaEngagementData',
    ]
  });

  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    recordVideo: {
      dir: OUTPUT_DIR,
      size: { width: WIDTH, height: HEIGHT }
    },
    // 오디오는 비디오 녹화에 포함되지 않으므로 나중에 ffmpeg로 합성
    ignoreHTTPSErrors: true,
  });

  const page = await context.newPage();

  // localhost:3333에서 index.html 로드
  await page.goto('http://localhost:3333/', { waitUntil: 'load', timeout: 30000 });
  console.log('✅ 페이지 로드 완료');

  // 잠시 대기 (리소스 로딩)
  await page.waitForTimeout(2000);

  // "CLICK TO HELL" 클릭 → 인트로 비디오 시작
  const clickPrompt = page.locator('#cinClickPrompt');
  if (await clickPrompt.isVisible()) {
    await clickPrompt.click();
    console.log('✅ 인트로 비디오 시작 (클릭)');
  }

  // 시네마틱 끝날 때까지 대기 (인트로 비디오 8.5초 + 프롤로그 ~103초 + 여유 15초)
  const TOTAL_WAIT = 130 * 1000;
  console.log(`⏳ ${TOTAL_WAIT/1000}초 대기 (시네마틱 녹화 중)...`);

  // 시네마틱이 끝나면 mainWrap.show 클래스가 추가됨
  try {
    await page.waitForSelector('#mainWrap.show', { timeout: TOTAL_WAIT });
    console.log('✅ 시네마틱 종료 감지');
  } catch {
    console.log('⚠️ 타임아웃 — 수동 종료');
  }

  // 추가 2초 대기 (마무리 프레임)
  await page.waitForTimeout(2000);

  // 녹화 종료
  await context.close();
  await browser.close();

  console.log(`\n🎬 녹화 완료! 파일 위치: ${OUTPUT_DIR}/`);
  console.log('');
  console.log('📌 다음 단계: ffmpeg로 오디오 합성');
  console.log('   Playwright 녹화는 오디오를 포함하지 않습니다.');
  console.log('   intro_voice.mp3와 lobby.mp3를 합성하려면:');
  console.log('');
  console.log('   ffmpeg -i video/<녹화파일>.webm -i bgm/intro_voice.mp3 \\');
  console.log('     -c:v libx264 -c:a aac -map 0:v -map 1:a \\');
  console.log('     -shortest video/intro_cinematic.mp4');
})();
