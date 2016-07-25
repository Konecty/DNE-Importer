var mongoose = require('mongoose');

var LocalidadeSchema = mongoose.Schema({
  id: Number,
  state: String,
  city: String,
  postalCode: String,
  status: String,
  type: String,
  // subordination: String,
  cityAbbr: String,
  // cityIbgeCode: String
});

module.exports = mongoose.model('Localidade', LocalidadeSchema);