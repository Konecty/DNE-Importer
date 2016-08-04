var mongoose = require('mongoose');

var LogradouroSchema = mongoose.Schema({
  id: Number,
  state: String,
  _init: {type: Number, default: 0},
  end: {type: Number, default: 99999},
  even: {type: Boolean, default: true},
  odd: {type: Boolean, default: true},
  city: String,
  startNeighbourhood: String,
  endNeighbourhood: String,
  place: String,
  postalCode: String,
  placeType: String,
  status: String,
  placeAbbr: String,
  cityAbbr: String,
  startNeighbourhoodAbbr: String,
  endNeighbourhoodAbbr: String
})

module.exports = mongoose.model('Logradouro', LogradouroSchema);