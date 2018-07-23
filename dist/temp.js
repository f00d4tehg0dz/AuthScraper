'use strict';

var getData = async function getData() {
        var browser = await launch({ headless: false });
        var page = await browser.newPage();

        try {

                await page.goto(logURL);
                await page.type(logUserField, yahooUsr); //<input type="text" name="login" id="login_field"... >

                await page.click('[name="signin"]'); //<input type="submit" name="commit" value="Sign in" …">

                await page.waitFor(logPassField, 5000); // this form pops up after username click

                // fill and submit password
                await page.type(logPassField, yahooPwd);
                await page.click('[name="verifyPassword"]');

                console.log("waitForNav1");
                await page.waitForNavigation({ waitUntil: 'networkidle2' });

                console.log("goto portfolio");
                await page.goto('https://finance.yahoo.com/portfolio/p_0/view/v1', { waitUntil: 'networkidle2' });

                //console.log("waitForNav2");
                //await page.waitForNavigation({waitUntil: 'networkidle2'})
                page.bringToFront();
                // INSERT SCRAPE HERE
                var result = await page.evaluate(function () {
                        console.log("Back from eval");
                        var elements = document.querySelectorAll('.gIc8M'); // Select all Products
                        console.log(elements);
                        var scraper = require('./scrape.js');
                        //console.log(scraper);
                        scraper('https://finance.yahoo.com/portfolio/p_0/view/v1', elements);
                });
                console.log("after scrape?");
                // END SCRAPE

                getScreenshot(page);

                browser.close();
                console.log('See screenshot at: ' + screenshot);
        } // try
        catch (err) {
                console.log('omgomgomgomg somethinks wromgomgomg>' + err);
        }

        return;
};