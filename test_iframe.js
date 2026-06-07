const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("http://localhost:5173");
  await page.click(".stumble-btn");
  await page.waitForSelector(".iframe-container");
  await page.screenshot({ path: "audit-iframe-open.png" });
  const spinner = await page.$(".iframe-loading");
  console.log("Spinner visible:", !!spinner);
  await page.click('button[aria-label="Close embedded site"]');
  const container = await page.$(".iframe-container");
  console.log("Iframe closed:", !container);
  await browser.close();
})();
