var mongoose = require('mongoose');
var dburl = 'mongodb://ScrapeLord:5Cr4P3l0rD@ds113179.mlab.com:13179/scraper1';
//var dburl = 'mongodb://TeamGator:G4T0RD3VS@ds147544.mlab.com:47544/gators';


module.exports =  function Stop() {}
module.exports =  function Go() {


mongoose.connect(dburl, function (err) {
   if (err) throw err;
  console.log('Successfully connected to remote DB');
});


mongoose.connection
.on('connected', function() { console.log(`Mongoose CONNECT OK to ${dburl}`); })
.on('disconnected', function() { console.log(`Mongoose DISCONNECT OK from ${dburl}`); })
.on('error', function(err) { console.log(`Mongoose FAIL TO CONNECT to ${dburl} -->${err}`); });

process.on('SIGINT', function() {
  mongoose.connection.close(function() {
    console.log("Mongoose disconnected through app termination (SIGINT)");
    process.exit(0);
  });
});

process.on('SIGTERM', function() {
  mongoose.connection.close(function() {
    console.log("Mongoose disconnected through app termination (SIGTERM)");
    process.exit(0);
  });
});

process.once('SIGUSR2', function() {
  mongoose.connection.close(function() {
    console.log('Mongoose disconnected through app termination (SIGUSR2)');
    process.kill(process.pid, 'SIGUSR2');
  });
});
} //fn

var _StockSchema = new mongoose.Schema({
    symbol: String,
    lastprice: Number,
    changeprc: Number,
    changepct: Number,
    currency: {type: String, default: '', uppercase: true},
    volume: Number,
    dates: {
      mktDate: Date,
      scrapeDate: Date
    }
  });
  module.exports = mongoose.model('Stocks', _StockSchema);

