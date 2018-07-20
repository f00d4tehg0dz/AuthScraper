const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

//let searchUrl = 'https://providence.craigslist.org/d/cars-trucks/search/cta';

function scrape(searchUrl)
{
axios.get(searchUrl)  // load the "top level" html an parse down
    .then((response) => {
        if (response.status === 200) {
            const html = response.data;
            const $ = cheerio.load(html);  // this is our html block to work from
            var itemList = [];  //this array will hold found data

            // find every element of this type in the html from cheerio
            $('.gIc8M').each(function (i, elem) {
                let symbol = $(this).find('td:nth-child(0)').text().trim();
                let price = $(this).find('td:nth-child(1)').text().trim();
                itemList[i] = {
                    symbol : symbol,
                    price: price
                }
                console.log(itemKist[i]);
            });

            // remove undefined elements
            let itemListTrimmed = itemList.filter(n => n != undefined)
            fs.writeFile('data/itemList.json',
                JSON.stringify(itemListTrimmed, null, 4), (err) => {
                    console.log(itemListTrimmed);
                })
        }
    }, (error) => console.log(error));
}

export { scrape };