require("dotenv").config(); // get dbconnect string from env
let dbUrl = process.env.DB_CONNECT;

if (dbUrl === undefined)
  console.warn(
    "Problem reading db connect string from ENV. Please check the README"
  );

const assert = require("assert");
let fCount = 0;

var MongoClient = require("mongodb").MongoClient;

function FindInColl() {
  return MongoClient.connect(
    dbUrl,
    { useNewUrlParser: true }
  ).then(
    function(client) {
      const db = client.db("scraper1");
      const collection = db.collection("documents");

      let arr = collection.find().toArray();
      console.log(`arr size`, arr.length);
      client.close();
      return arr;
    },
    function(err) {
      console.error("The promise was rejected", err, err.stack);
    }
  );
}

FindInColl().then(items => {
  console.log(items[0]);
  return;
});
