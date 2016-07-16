var fs = require('fs');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/importer');

//ler arquivos da pasta
fs.readdir('./resources', function(err, files){
	console.log(files);
	var pattern_logradouro = new RegExp("(?!LOG_)LOGRADOURO") 
	files.forEach(function(file){
		if(pattern_logradouro.test(file)){
			OpenLogradouro(file);
		}	
	})
});


function OpenLogradouro(file){
	fs.readFile('./resources/'+file, 'UTF-8', function(err, data){
		var lines = data.split('\n');
		console.log(lines.length);
		lines.forEach(function(lines){
			var attributes = lines.split('@');
			console.log('Attributes: ' + attributes.length)
			var obj = {};
			if(attributes.length == 11){
				obj.state = attributes[1];
				obj.city = attributes[2];
				obj.startNeighbourhood = attributes[3];
				obj.endNeighbourhood = attributes[4];
				obj.place = attributes[5];
				obj.complemento = attributes[6];
				obj.postalCode = attributes[7];
				obj.placeType = attributes[8];
				obj.status = attributes[9];
				obj.placeAbbr = attributes[10];
			}
		})
	})
}
