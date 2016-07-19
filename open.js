var fs = require('fs');
var stream = require('stream');
var es = require('event-stream');
var mongoose = require('mongoose');
var highland = require('highland');

mongoose.connect('mongodb://localhost:27017/importer');

var Logradouro = require('./models/logradouro_model.js')
// Ler arquivos da pasta
fs.readdir('./resources', function(err, files){
  var pattern_logradouro = new RegExp("(?!LOG_)LOGRADOURO")
  files.forEach(function(file){
    if(pattern_logradouro.test(file)){
      OpenLogradouro(file);
    }
  })
});

function OpenLogradouro(file){

  console.log(file)
  var s = fs.createReadStream('./resources/'+file)
    .pipe(es.split())
    .pipe(es.mapSync(function(line){
        console.log(line)
        // pause o readstream
        s.pause();
        var attributes = line.split('@');
        var logradouro = new Logradouro();
        
        if(attributes.length == 11){
          logradouro.state = attributes[1];
          logradouro.city = attributes[2];
          logradouro.startNeighbourhood = attributes[3];
          logradouro.endNeighbourhood = attributes[4];
          logradouro.place = attributes[5];
          logradouro.complemento = attributes[6];
          logradouro.postalCode = attributes[7];
          logradouro.placeType = attributes[8];
          logradouro.status = attributes[9];
          logradouro.placeAbbr = attributes[10];
          logradouro.save(function(err, lgr){
            // resume readstream
            s.resume();
          });
        }
    })
    .on('end', function(){
        console.log('Read entire file.');
    })
  );
}