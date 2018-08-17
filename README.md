# AuthScraper

This is the scraping backend of the Yahoo finance project.

It uses Puppeteer to login to Yahoo, navigate to the portfolio page
Data then searched via Cheerio and stored in offline Mongo database (via mLabs)

Now the dotnet frontend can access the scraped data, display it and add it to it's historical SQL db.

**Environment vars

You will need a .ENV file like this:

DB_CONNECT=mongodb://.....
YAHOO_USR=yahoousername
YAHOO_PWD=yahoopassword

**TBD:**

1. Pull up portfolio collection page, list all saved portfolios and use the selected one.
2. Kill the Yahoo popup when found so the screenshot is unobstructed.
3. Allow passing in of Yahoo creds, using mine only as a backup


##Tools, libs and technologies used
###Puppeteer
Chrome's headless browser. Also grabbing screenshots
###Cheerio
DOM parser to sort through page data
###devenv
Super simple tool to read sensitive data from .env file, keeping passwords and such out of the codebase.
##MongoDB
Used to save portfolio snapshot data, to be later retrieves by SQL on the dotnet end. 
For demo purposes, the MongoDB is stored offline at mLabs, but I think using any database here is probably overkill when all we need to do is store some JSON data. Still rethinking this...
##tabletojson
Convert a table from the DOM to JSON format. How easy was that?
###babel
Because ES6.
###rimraf
assists in removing dirs with -rf
