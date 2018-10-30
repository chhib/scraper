const puppeteer = require("puppeteer");
const fs = require('fs');
const loadFirebase = require('./lib/db.js');

(async () => {

  // Extract partners on the page, recursively check the next page in the URL pattern
  const extractPartners = async url => {
    // Scrape the data we want
    const page = await browser.newPage();
    await page.goto(url);
    const partnersOnPage = await page.evaluate(() =>
      Array.from(document.querySelectorAll("div.compact")).map(compact => ({
        title: compact.querySelector("h3.title").innerText.trim(),
        logo: compact.querySelector(".logo img").src
      }))
    );
    await page.close();

    // Recursively scrape the next page
    if (partnersOnPage.length < 1) {
      // Terminate if no partners exist
      return partnersOnPage
    } else {
      // Go fetch the next page ?page=X+1
      const nextPageNumber = parseInt(url.match(/page=(\d+)$/)[1], 10) + 1;
      const nextUrl = `https://marketingplatform.google.com/about/partners/find-a-partner?page=${nextPageNumber}`;

      return partnersOnPage.concat(await extractPartners(nextUrl))
    }
  };

  let partners;
  // If there's a local JSON, don't fetch anything
  const rawdata = fs.readFileSync('partners.json');  
  const browser = await puppeteer.launch();

  if (rawdata) {
    partners = JSON.parse(rawdata)
  } else {
    const firstUrl =
      "https://marketingplatform.google.com/about/partners/find-a-partner?page=1";
    partners = await extractPartners(firstUrl);
  }

  


  // Todo: Update database with partners
  console.log(partners);

  // loadFirebase().firestore().collection('agencies')
  //   .limit(10)
  //   .get()
  //   .then(snapshot => {
  //     let data = []
  //     snapshot.forEach((doc) => {
  //       data.push({
  //         id: doc.id,
  //         ...doc.data()
  //       })            
  //     })
  //     return { agencies: data }
  //   })


  // // Save to JSON file
  // const data = JSON.stringify(partners);  
  // fs.writeFileSync('partners.json', data);  


  await browser.close();
})();
