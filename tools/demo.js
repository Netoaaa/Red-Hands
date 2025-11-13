const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  if (!fs.existsSync('../out')) fs.mkdirSync('../out', { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 400, height: 320 },
    recordVideo: { dir: 'out', size: { width: 400, height: 320 } }
  });
  const page = await context.newPage();
  const url = 'http://localhost:8000/index.html';
  console.log('Loading', url);
  await page.goto(url, { waitUntil: 'load' });
  // Wait for canvas to initialize
  await page.waitForTimeout(500);
  // Give the game some time to run
  await page.waitForTimeout(800);
  // Trigger an action: press Space
  await page.keyboard.press('Space');
  await page.waitForTimeout(800);
  // Take screenshot
  const screenshotPath = 'out/screenshot.png';
  await page.screenshot({ path: screenshotPath });
  console.log('Saved screenshot to', screenshotPath);
  // Close context to finalize video file
  await context.close();
  // Move the recorded video (Playwright creates a file in out/ with random name)
  const files = fs.readdirSync('out').filter(f => f.endsWith('.webm') || f.endsWith('.mp4'));
  if (files.length) {
    const src = `out/${files[0]}`;
    const dest = 'out/demo_video.webm';
    fs.renameSync(src, dest);
    console.log('Saved video to', dest);
  } else {
    console.log('No video file found in out/');
  }
  await browser.close();
})();
