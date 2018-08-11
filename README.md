# AuthScraper

This is the scraping backend of the Yahoo finance project.

It uses Puppeteer to login to Yahoo, navigate to the portfolio page
Data then searched and stored in offline Mongo database (via mLabs)

Now the dotnet frontend can access the scraped data, display it and add it to it's historical SQL db.

**TBD:**

1. Pull up portfolio collection page, list all saved portfilios and use the selected one.
2. Kill the Yahoo popup when found so the screenshot is unobstructed.

