/**
 * Sweeper will find all the Yahoo snapshots that have not yet been integrated into the main app. It should
 * -gather them
 * -insert them into the main historical db
 * -remove them from the snapshots db
 *
 * This is PoC code to be rolled into MainApp startup and/or a button, the idea being that scraping might be a standalone process as well as something initiated by the main scraper.
 **/

// get dbconnect string from env
require("dotenv").config();

let dbUrl = process.env.DB_CONNECT;

if (dbUrl === undefined) console.warn("Problem reading db connect string from ENV. Please check the README");

// Open DB and read all snapshots
const assert = require("assert");
let fCount = 0;

const MongoClient = require("mongodb").MongoClient;

try {
  MongoClient.connect(
    dbUrl,
    { useNewUrlParser: true },
    (err, client) => {
      assert.equal(null, err);
      const db = client.db("scraper1");

      // declare db promise
      const dbPromise = () => {
        return new Promise((resolve, reject) => {
          db.collection("snapshots")
            .find()
            .toArray(function(err, data) {
              if (err) {
                reject(err);
              } else {
                //TBD logging for now, del after copy in final

                data.forEach(d => {
                  let str = ``;

                  console.groupCollapsed(d._id);
                  d.data.forEach(i => (str += `${i.Symbol} `));
                  console.log(str);
                  console.groupEnd();
                });

                cnt = data.length;
                resolve(cnt);
              }
            });
        });
      };

      // call it
      dbPromise().then(result => {
        console.log(`\nFound ${result} scrapes in DB since last run`);
        client.close();
      });
    }
  ); //end mongo client
} catch (e) {
  console.error("The promise was rejected", e, e.stack);
}
