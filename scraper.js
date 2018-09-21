const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const url =
    "https://marketingplatform.google.com/about/partners/find-a-partner";
  await page.goto(url);

  const titles = await page.evaluate(() =>
    Array.from(document.querySelectorAll("div.compact h3.title"))
      .map(partner => partner.innerText.trim())
    )

  const logos = await page.evaluate(() =>
  Array.from(document.querySelectorAll("div.compact .logo img"))
    .map(logo => logo.src)
  )

  const partners = await page.evaluate(() =>
    Array.from(document.querySelectorAll("div.compact"))
      .map(compact => ({
        title: compact.querySelector('h3.title').innerText.trim(),
        logo: compact.querySelector('.logo img').src
      }))
  )
  console.log(partners)
  
  await browser.close();
})();
