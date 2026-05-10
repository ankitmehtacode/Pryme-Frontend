const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('response', response => {
    if (response.status() === 404) {
      console.log('404 URL:', response.url());
    }
  });

  page.on('pageerror', err => console.log('PAGE ERROR:', err.message, err.stack));
  
  await page.goto('http://localhost:8081/apply', { waitUntil: 'networkidle0' });
  await browser.close();
})();
