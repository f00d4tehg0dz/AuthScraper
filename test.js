/**
 * @name Puppeteer login for Yahoo
 * @desc Logs into Yahoo pre-scraping. Usr/pwd should be passed in`
 */

require('dotenv').config()  // get YAHOO login and dbconnect string from env
/* 
* TBD: yahoo usr/pass will eventually be passed, These are defaults.
*/
let yahooUsr = process.env.YAHOO_USR;
let yahooPwd = process.env.YAHOO_PWD;
let dbUrl = process.env.DB_CONNECT;

if(yahooUsr === undefined 
|| yahooPwd === undefined
|| dbUrl    === undefined)
  console.warn('Problem reading envvars. Please check the README')

const logURL = 'https://login.yahoo.com';  // 'https://github.com/login'

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
//const theDB = require('./database');

async function runThisThing() {
  const browser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
    headless: false
  });

  const styl = 'font-size:16px; background:lightblue; color: black; text-shadow: 2px 2px 0 white'; // for console.log

  const pages = await browser.pages();
  const page = pages[0];
  
  console.log('%c **SCRAPER: Connecting to YAHOO...', 'background:blue; color: white;');
  console.time('Await Yahoo...');
  await page.goto(logURL)
  console.timeEnd('Await Yahoo...');
  
  // dom element selectors
  const USERNAME_SELECTOR = '#login-username';
  const PASSWORD_SELECTOR = '#login-passwd';
  const BUTTON_SELECTOR1_NAME = '[name="signin"]';
  const BUTTON_SELECTOR2_PASS = '[name="verifyPassword"]';

  console.log('**SCRAPER: Logging in to YAHOO...');
console.time('Yahoo Login');
  await page.click(USERNAME_SELECTOR);
  await page.keyboard.type(yahooUsr);  //<input type="text" name="login" id="login_field"... >
  await page.click(BUTTON_SELECTOR1_NAME);  //<input type="submit" name="commit" value="Sign in" …">
  
  await page.waitFor(PASSWORD_SELECTOR, 5000); // this form pops up after username click
  await page.click(PASSWORD_SELECTOR);
  await page.keyboard.type(yahooPwd)
  await page.click(BUTTON_SELECTOR2_PASS);
console.timeEnd('Yahoo Login');
console.time('next');
  //await page.waitForNavigation({ waitUntil: 'networkidle2' })
console.timeEnd('next');


  console.log('**SCRAPER: Accessing YAHOO portfolio...');
  //* Load a specific potfolio. TBD: load all and give a choice
  console.time('await Finance page');
  await page.goto('https://finance.yahoo.com/portfolio/p_0/view/v1', { waitUntil: 'networkidle2' })
  console.timeEnd('await Finance page');

  console.log('**SCRAPER: Munging data in strange ways...');

  //*
  //* Grab main results <table> from the (single) portfolio on this page
  //? need to handle multiple portfolios
  await page.waitFor('._1TagL ');
  const html = await page.$eval('._1TagL ', e => e.outerHTML);
  const $ = cheerio.load(html, {
      normalizeWhitespace: true,
      xmlMode: false,
      decodeEntities: true
    });

    //? tbd. kill that popup on the Yahoo page
  await getScreenshot(page);

//*                 Turn the table into json with all stocks
  const t2j = require('tabletojson');
  const table = t2j.convert(html);

//*                 Walk the json and create our object tree of all stocks
//*
  let itemCnt=table[0].length;
  let data = [];
  
  const ScrapeTime = new Date().getTime();  // Capture time data was collected

  for(let x = 0; x< itemCnt; x++)
  {
    el = table[0][x];
    data.push( {
      Symbol: el['Symbol'],
      LastPrice: (el['Last Price']),
      Currency : el['Currency'],
      Change: {
        Amt: parseFloat(el['Change']),
        Pct: parseFloat(el['% Chg'], 10)
        },
      Volume : parseFloat(el['Volume']),
      MarketTime: el['Market Time']
      })
    }
  
  console.table(data[1]);


//*
//*                 Write to database
//*
var Mongo = require('mongodb').MongoClient;

Mongo.connect(dbUrl, {useNewUrlParser: true }, function(err, db) {

    //if (err) throw err;
    var dbo = db.db("scraper1");
 
    //* Turn array into an object and use ScrapeTime as the db index value
    const DATA = {_id: ScrapeTime, data};  
    dbo.collection("snapshots").insertOne(DATA, function(err, res) {
      console.log(`**SCRAPER: Snapshot saved (time: ${ScrapeTime})`);
      //console.log(res);  // this makes for boring reading
      db.close();
      });
    });

  //await page.close();
  browser.close();
} // fn


// GET PUPPETEER SCREENSHOT
async function getScreenshot(page) {
  const outFile = 'yahoo.jpg';

 try {
  await page.setViewport({ width: 1440, height: 900 });
  const screenshot = await page.screenshot({ 
    path: outFile,
    fullpage: true,
    type: 'jpeg',
    quality: 60, 
    omitBackground: true
  });

  //console.log('**SCRAPER: Done.');
  return;
} // try
catch(err) { console.log(`**SCRAPER error(yipes!): ${err}`); }
}
//################
runThisThing();