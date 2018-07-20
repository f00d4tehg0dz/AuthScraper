/**
 * @name Puppeteer login for Yahoo
 * @desc Logs into Yahoo pre-scraping. Usr/pwd should be passed in`
 */

/* LOGIN DATA FIELDS
* yahoo usr/pass will eventually be passed, These are defaults.
*/
let yahooUsr = 'webpropopuli@gmail.com';
let yahooPwd = 'YFpwd1234yf';
const logURL = 'https://login.yahoo.com';  // 'https://github.com/login'

let d2j = require('./dom-2-json');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function runThisThing() {
  const browser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
    headless: true
  });

  const pages = await browser.pages();
  const page = pages[0];
  
  console.log('**SCRAPER: Connecting to YAHOO...');
  await page.goto(logURL)
  
  // dom element selectors
  const USERNAME_SELECTOR = '#login-username';
  const PASSWORD_SELECTOR = '#login-passwd';
  const BUTTON_SELECTOR1_NAME = '[name="signin"]';
  const BUTTON_SELECTOR2_PASS = '[name="verifyPassword"]';

  console.log('**SCRAPER: Authenticating with YAHOO...');
  await page.click(USERNAME_SELECTOR);
  await page.keyboard.type(yahooUsr);  //<input type="text" name="login" id="login_field"... >
  await page.click(BUTTON_SELECTOR1_NAME);  //<input type="submit" name="commit" value="Sign in" …">
  
  await page.waitFor(PASSWORD_SELECTOR, 5000); // this form pops up after username click
  await page.click(PASSWORD_SELECTOR);
  await page.keyboard.type(yahooPwd)
  await page.click(BUTTON_SELECTOR2_PASS);

  await page.waitForNavigation({ waitUntil: 'networkidle2' })

  console.log('**SCRAPER: Accessing YAHOO portfolio...');
  await page.goto('https://finance.yahoo.com/portfolio/p_0/view/v1', { waitUntil: 'networkidle2' })



  console.log('**SCRAPER: Munging data in strange ways...');
  const html = await page.$eval('._1TagL', e => e.outerHTML);
  const $ = cheerio.load(html);
  
  //console.log(html);
  const posts = await page.$$eval('table._1TagL tbody tr[data-index] td._1_2Qy', (posts) => 
    {
      posts.forEach(x => {
        //let jsonObj = toJSON(x);
        //console.log(jsonObj);
      });
      return posts.map(post => post.innerHTML)
    });
    let n = 0;
    posts.forEach(x => {
      n++;
      //console.log(`${n}: ${x}`);
    });


    // itemList[i] = {
    //   symbol: symbol,
    //   price: price
    // }    

  await getScreenshot(page);


//* DJM ADD TO DATABASE HERE 

  //await page.close();
  await browser.close();
} // fn


// GET PUPPETEER SCREENSHOT
async function getScreenshot(page) {
  console.log("saving screenshot");
  const outFile = 'yahoo.jpg';

 try {

  //const title = await page.$('.gIc8M');
  const title = await page.$('._1TagL');

  const styles = await page.evaluate(el => window.getComputedStyle(el), title);

  const clip = Object.assign({}, await title.boundingBox());
  //clip.y += parseFloat(styles.marginTop) || -20;
  //clip.x += parseFloat(styles.marginLeft) || -20;
  clip.x = 0;
  clip.y = 0;

  await page.setViewport({ width: 1440, height: 900 });
  const screenshot = await title.screenshot({ 
    path: outFile,
    fullpage: true,
    type: 'jpeg',
    quality: 60, 
    omitBackground: true
  });

  console.log('**SCRAPER: Done.');
  return;
} // try
catch(err) { console.log(`**SCRAPER error: ${err}`); }
}
//################
runThisThing();