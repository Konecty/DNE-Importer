var mongoose = require('mongoose');

var LogradouroSchema = mongoose.Schema({
	state: String,
	city: Number,
	startNeighbourhood: Number,
	endNeighbourhood: Number,
	place: String,
	complemento: String,
	postalCode: String,
	placeType: String,
	status: String,
	placeAbbr: String
})

module.exports = mongoose.model('Logradouro', LogradouroSchema);