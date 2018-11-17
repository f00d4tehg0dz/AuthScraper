// @todo Testing Probot:todo
// @body Does this create and issue?
require("dotenv").config(); // get dbconnect string from env
let dbUrl = process.env.DB_CONNECT;

if (dbUrl === undefined)
  console.warn(
    "Problem reading db connect string from ENV. Please check the README"
  );

const assert = require("assert");
let fCount = 0;

const MongoClient = require("mongodb").MongoClient;

try {
  MongoClient.connect(
    dbUrl,
    { useNewUrlParser: true },
    function(err, client) {
      assert.equal(null, err);
      const db = client.db("scraper1");

      debugger;

      //Step 1: declare promise
      var myPromise = () => {
        return new Promise((resolve, reject) => {
          db.collection("snapshots")
            .find()
            .toArray(function(err, data) {
              if (err) {
                reject(err);
              } else {
                data.forEach(d => {
                  console.groupCollapsed(d._id);
                  d.data.forEach(i => console.warn(i.Symbol));
                  console.groupEnd();
                });
                console.warn(`Found ${data.length} scapes in DB`);
              }
            });
        });
      };

      //Step 2: async promise handler
      var callMyPromise = async () => {
        var result = await myPromise();
        //anything here is executed after result is resolved
        return result;
      };

      //Step 3: make the call
      callMyPromise().then(function(result) {
        client.close();
      });
    }
  ); //end mongo client
} catch (e) {
  console.error("The promise was rejected", e, e.stack);
}
