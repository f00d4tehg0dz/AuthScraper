/**
 * @name Puppeteer login for Yahoo
 * @desc Logs into Yahoo pre-scraping. Usr/pwd should be passed in`
 */

require("dotenv").config(); // get YAHOO login and dbconnect string from env
/* TBD: yahoo usr/pass will eventually be passed, These are defaults. */
let yahooUsr = process.env.YAHOO_USR;
let yahooPwd = process.env.YAHOO_PWD;
let dbUrl = process.env.DB_CONNECT;

if (yahooUsr === undefined || yahooPwd === undefined || dbUrl === undefined)
  console.warn("Problem reading envvars. Please check the README");

const logURL = "https://login.yahoo.com";
const assert = require("assert");
const puppeteer = require("puppeteer");
const puppeteerExtra = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');
puppeteerExtra.use(pluginStealth());
const cheerio = require("cheerio");
//const theDB = require('./database');
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36';

async function runThisThing() {
  console.info("**Welcome to SCRAPER");
  console.time("Launching headless browser...");
  const browser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
    args: ['--no-sandbox'],
    headless: true,
  });
  
  console.timeEnd("Launching headless browser...");

  console.time("SCRAPER: Loading pages...");
  //Randomize User agent or Set a valid one
  const userAgent = randomUseragent.getRandom();
  const UA = userAgent || USER_AGENT;
  const page = await browser.newPage();
  // const pages = await browser.pages();
  // const page = pages[0];
  
  const context = await browser.createIncognitoBrowserContext();
  const page = await context.newPage();
  console.timeEnd("SCRAPER: Loading pages...");

  console.log("**SCRAPER: Wait for Login page...");
  await page.setUserAgent(UA);
  await page.setJavaScriptEnabled(true);
  await page.goto(logURL);

  // dom element selectors
  const USERNAME_SELECTOR = "#login-username";
  const PASSWORD_SELECTOR = "#login-passwd";
  const BUTTON_SELECTOR1_NAME = '[name="signin"]';
  const BUTTON_SELECTOR2_PASS = '[name="verifyPassword"]';
  const MAIN_TABLE_ID = "#pf-detail-table"; //".W ";

  console.log("**SCRAPER: Logging in to YAHOO...");
  console.time(" TIMER: Yahoo Login");
  await page.click(USERNAME_SELECTOR);
  await page.keyboard.type(yahooUsr); //<input type="text" name="login" id="login_field"... >
  await page.click(BUTTON_SELECTOR1_NAME); //<input type="submit" name="commit" value="Sign in" …">

  await page.waitFor(PASSWORD_SELECTOR, 5000); // this form pops up after username click
  await page.click(PASSWORD_SELECTOR);
  await page.keyboard.type(yahooPwd);
  await page.click(BUTTON_SELECTOR2_PASS);

  console.timeEnd(" TIMER: Yahoo Login");

  // await page.waitForNavigation({ waitUntil: "networkidle2" });
  // console.time("next");
  // await page.waitFor("#uh-avatar", 5000);  //not sure what this was
  // console.timeEnd("next");

  console.log("**SCRAPER: Accessing YAHOO portfolio...");
  //* Load a specific potfolio. TBD: load all and give a choice
  console.time(" TIMER: await Finance page");
  await page.goto("https://finance.yahoo.com/portfolio/p_0/view/v1", {
    waitUntil: "networkidle2"
  });
  console.timeEnd(" TIMER: await Finance page");

  console.log("**SCRAPER: Parsing through data...");

  //*
  //* Grab main results <table> from the (single) portfolio on this page
  //TBD need to handle multiple portfolios
  await page.waitFor(MAIN_TABLE_ID);

  const html = await page.$eval(MAIN_TABLE_ID, e => e.outerHTML);
  if (html == undefined) console.log(`SCRAPE ERROR: Timedout waiting for selector ${MAIN_TABLE_ID} --> ${err}`);

  const $ = cheerio.load(html, {
    normalizeWhitespace: true,
    xmlMode: false,
    decodeEntities: true
  });

  /**********************
   * March UPDATE
   *
   * table class is W(100%)
   * each table row is class simpTblRow
   * wrapping div is class pf-detail-table
   */
  //* Timestamp will be used as DB id:
  const ScrapeTime = new Date().getTime();

  //* Might save this to the DB as well ??
  await getScreenshot(page);

  //* Turn the table into json with all stocks
  const t2j = require("tabletojson");
  const table = t2j.convert(html);

  //* Walk the json and create our object tree of all stocks\
  let itemCnt = table[0].length;
  console.log("Portfolio itemCnt =", itemCnt);
  let data = [];

  for (let x = 0; x < itemCnt; x++) {
    
    const el = table[0][x];
    // console.log(table[0][x]);
    data.push({
      Symbol: el["Symbol"],
      LastPrice: el["Last Price"],
      Currency: el["Currency"],
      Change: {
        Amt: parseFloat(el["Change"]),
        Pct: parseFloat(el["Chg %"], 10)
      },
      Volume: parseFloat(el["Volume"]),
      MarketTime: el["Market Time"]
    });
    // console.log(el);
  }

  //*
  //*                 Write to database
  //*
  const MongoClient = require("mongodb").MongoClient;

  MongoClient.connect(dbUrl, { useNewUrlParser: true }, function(err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to Mongo server");

    //* add Snapshot Image file to db
    const fs = require("fs");
    const imgData = fs.readFileSync("./yahoo.jpg");
    //tbd handle errors

    //* Save complete snapshot using ScrapeTime as the db index value
    const DATA = { _id: ScrapeTime, data, imgData };

    const db = client.db("YahooFinance");
    const res = insertSnapshot(db, DATA, function() {
      client.close();
      browser.close();
    });
  });
} // fn runthisthing()

//* insertSnapshot()
const insertSnapshot = function(db, DATA, callback) {
  // Add doc to db
  db.collection("stocks").insertOne(DATA, (err, result) => {
    assert.equal(err, null);

    console.log(`**SCRAPER: Snapshot saved`);
    callback(result);
  });
};

//* GET PUPPETEER SCREENSHOT
async function getScreenshot(page) {
  const outFile = "yahoo.jpg";
  try {
    await page.setViewport({ width: 1440, height: 900 });
    const screenshot = await page.screenshot({
      path: outFile,
      fullpage: true,
      type: "jpeg",
      quality: 50,
      omitBackground: true
    });

    return;
  } catch (err) {
    console.log(`**SCRAPER error saving screenshop: ${err}`);
    return;
  }
}
//################
runThisThing();
