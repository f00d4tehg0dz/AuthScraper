/**
 * @name Github
 *
 * @desc Logs into Github. Provide your username and password as environment variables when running the script, i.e:
 * `GITHUB_USER=myuser GITHUB_PWD=mypassword node github.js`
 *
 */
const logURL = 'https://login.yahoo.com';  // 'https://github.com/login'
const logUserField = '#login-username';
const logPassField = '[name="password"]';
//const logPassField = '#login-passwd';

const puppeteer = require('puppeteer');
const screenshot = 'yahoo.jpg';
(async () => {
    try {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();

  console.log("goto login");
  await page.goto(logURL)

  console.log("wait login");
  await page.type(logUserField, 'webpropopuli@gmail.com')  //<input type="text" name="login" id="login_field"... >

  await page.click('[name="signin"]')  //<input type="submit" name="commit" value="Sign in" …">
  
  await page.waitFor(logPassField, 5000);

  await page.type(logPassField, 'YFpwd1234yf')

  console.log("click commit2");
  await page.click('[name="verifyPassword"]')

  console.log("waitForNav");
  await page.waitForNavigation({waitUntil: 'networkidle2'})
  
  console.log("goto portfolio");
  await page.goto('https://finance.yahoo.com/portfolio/p_0/view/v1',{waitUntil: 'networkidle2'})
  
  console.log("waitForNav");
  await page.waitForNavigation({waitUntil: 'networkidle2'})

  console.log("saving screenshot");
  await page.setViewport({width: 1440, height: 900 });
  await page.screenshot({ path: screenshot,
    fullpage: true,
    type: 'jpeg',
    quality: 50,
    //  {clip: {x: 200, y: 800 }},
    omitBackground: true })
  browser.close()
  console.log('See screenshot at: ' + screenshot)
    }
catch (err){
    console .log ('omgomgomgomg sometihngs wromg>' + err)
}
})()

//cookie code unused
  //var cookies = await page.cookies();
  //console.log('all cookies >>');
  //console.log(cookies);

  //let cookieVal = cookies[0];
  //console.log('cookie val >>' + cookieVal);

  //let arrVal = cookieVal.value.split('&');
  //console.log('arr val >>' + arrVal);

  //let theCookie='';
  //arrVal.filter (x => { 
    //  if(x.indexOf('s=') != -1)
      //  theCookie = x.slice(2);
      //else if(x.indexOf('d=') != -1)
      //theCookie2 = x.slice(2);
    //});
  //console.log('theCookie>>' + theCookie); 

//let logPass = 'https://login.yahoo.com/account/challenge/password?authMechanism=primary&display=login&yid=webpropopuli@gmail.com&done=https://www.yahoo.com/&sessionIndex=QQ--&acrumb=' + theCookie;
//console.log("logpass>>" + logPass);
//await page.goto(logPass);

//await page.setCookie(cookies[0]);

///await page.reload({'timeout' : '10'});