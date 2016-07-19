var mongoose = require('mongoose');

var BairroSchema = mongoose.Schema({
  id: Number,
  state: String,
  city: String,
  district: String,
  districtAbbr: String
});

module.exports = mongoose.model('Bairro', BairroSchema);