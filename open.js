var fs = require('fs');

//ler arquivos da pasta
fs.readdir('./resources', function(err, files){
	console.log(files);
})

