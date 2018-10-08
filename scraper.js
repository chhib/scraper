const puppeteer = require("puppeteer");
const devices = require("puppeteer/DeviceDescriptors");

(async () => {
  const browser = await puppeteer.launch();

  const extractPartners = async function(url) {
    const page = await browser.newPage();
    await page.emulate(devices["iPhone 7"]);
    await page.goto(url);

    console.log(`scraping: ${url}`);

    const partnersOnPage = await page.evaluate(() =>
      Array.from(document.querySelectorAll("div.compact")).map(compact => ({
        title: compact.querySelector("h3.title").innerText.trim(),
        logo: compact.querySelector(".logo img").src
      }))
    );
    await page.close();

    // recursion
    if (partnersOnPage.length == 0) {
      console.log(`final scrape with ${url}`);
      // terminate
      return partnersOnPage;
    } else {
      const nextPageNumber = parseInt(url.match(/page=(\d+)$/)[1], 10) + 1;
      // go to next page
      const nextUrl = `https://marketingplatform.google.com/about/partners/find-a-partner?page=${nextPageNumber}`;

      return partnersOnPage.concat(await extractPartners(nextUrl));
    }
  };

  const firstPage =
    "https://marketingplatform.google.com/about/partners/find-a-partner?page=1";

  const partners = await extractPartners(firstPage);

  console.log(partners);

  await browser.close();
})();
