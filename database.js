var mongoose = require('mongoose');
mongoose.connect('mongodb://ScrapeLord:5Cr4P3l0rD@ds113179.mlab.com:13179/scraper1');
mongoose.connection.on('error', function() {
  console.error('Can't connect to Mongo remote at mLab. Did someone turn off the internets?');
});

var StockSchema = new mongoose.Schema({
    symbol: String,
    lastprice: Double,
    changeprc: Double,
    changepct: Double,
    currency: {type: String, default: '', uppercase: true},
    volume: Double,
    mkttime: Date
    url: String
  });
  module.exports = mongoose.model('Stocks', StockSchema);
