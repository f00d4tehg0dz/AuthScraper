require("dotenv").config(); // get dbconnect string from env
let dbUrl = process.env.DB_CONNECT;

if (dbUrl === undefined)
  console.warn(
    "Problem reading db connect string from ENV. Please check the README"
  );

const assert = require("assert");
let fCount = 0;

// FUNC MAIN
async function runThisThing() {
  //*                 Connect to database
  //*
  console.log("**SCRAPER: Connecting to DB...");
  const MongoClient = require("mongodb").MongoClient;

  MongoClient.connect(
    dbUrl,
    { useNewUrlParser: true },
    function(err, client) {
      assert.equal(null, err);
      assert.notEqual(client, null),
        console.log("Connected successfully to Mongo server");

      const db = client.db("scraper1");

      // Get the documents collection
      const collection = db.collection("documents");
      // Find all dos in this table
      db.collection("snapshots").find({}, function(err, docs) {
        docs.each(function(err, doc) {
          if (doc) {
            fCount++;
            console.log(doc._id);
          } else {
          }
        });
      });
      client.close();
      console.log(`${fCount} items found this sweep`);
    }
  );

  console.log(`DONE`);
  return;
} // fn runthisthing()

//################
runThisThing();
