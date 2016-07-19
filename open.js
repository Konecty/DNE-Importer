var fs = require('fs');
var stream = require('stream');
var es = require('event-stream');
var mongoose = require('mongoose');
var iconv = require('iconv-lite');

mongoose.connect('mongodb://localhost:27017/importer');

var Logradouro = require('./models/logradouro_model.js')
var Localidade = require('./models/localidade_model.js')
var Bairro = require('./models/bairro_model.js')

// Ler arquivos da pasta
var pattern_logradouro = new RegExp("(?!LOG_)LOGRADOURO")
var pattern_localidade = new RegExp("(?!LOG_)LOCALIDADE")
var pattern_bairro = new RegExp("(?!LOG_)BAIRRO")
fs.readdir('./resources', function(err, files){
  files.forEach(function(file){
    console.log(file);
    if(pattern_logradouro.test(file)){
      OpenLogradouro(file);
    }
    if(pattern_localidade.test(file)){
      OpenLocalidade(file);
    }
    if(pattern_bairro.test(file)){
      OpenBairro(file);
    }
  })
  console.log('Importação concluida com sucesso!');
});

function OpenBairro(file){
  var count = 0;
  console.log(file)
  var s = fs.createReadStream('./resources/'+file, {autoClose: true})
    .pipe(iconv.decodeStream('ISO-8859-1'))
    .pipe(es.split())
    .pipe(es.mapSync(function(line){
        // pause the readstream
        s.pause();
        var attributes = line.split('@');
        var bairro = new Bairro();
        if(attributes.length == 5){
          count++;
          bairro.id = attributes[0];
          bairro.state = attributes[1];
          bairro.city = attributes[2];
          bairro.district = attributes[3];
          bairro.districtAbbr = attributes[4];
          bairro.save(function(err, bro){
            s.resume();
          });
        }
    })
    .on('error', function (error) {
        console.log("Caught", error);
        s.destroy();
        // s.close();
        console.log('Read entire file with error. Lines Read: ', count);
    })
    .on('end', function(){
      //s.close();
      s.destroy();
      console.log('Read entire file. Lines Read: ', count);
      return true;
    })
  );
}

function OpenLocalidade(file){
  var count = 0;
  console.log(file)
  var s = fs.createReadStream('./resources/'+file, {autoClose: true})
    .pipe(iconv.decodeStream('ISO-8859-1'))
    .pipe(es.split())
    .pipe(es.mapSync(function(line){
        // pause the readstream
        s.pause();
        var attributes = line.split('@');
        var localidade = new Localidade();
        if(attributes.length == 9){
          count++;
          localidade.id = attributes[0];
          localidade.state = attributes[1];
          localidade.city = attributes[2];
          localidade.postalCode = attributes[3];
          localidade.status = attributes[4];
          localidade.type = attributes[5];
          localidade.subordination = attributes[6];
          localidade.cityAbbr = attributes[7];
          localidade.cityIbgeCode = attributes[8];
          localidade.save(function(err, lgr){
            s.resume();
          });
        }
    })
    .on('error', function (error) {
        console.log("Caught", error);
        s.destroy();
        // s.close();
        console.log('Read entire file with error. Lines Read: ', count);
    })
    .on('end', function(){
      //s.close();
      s.destroy();
      console.log('Read entire file. Lines Read: ', count);
      return true;
    })
  );
}

function OpenLogradouro(file){
  var count = 0;
  console.log(file)
  var s = fs.createReadStream('./resources/'+file, {autoClose: true})
    .pipe(iconv.decodeStream('ISO-8859-1'))
    .pipe(es.split())
    .pipe(es.mapSync(function(line){
        // pause the readstream
        s.pause();
        var attributes = line.split('@');
        var logradouro = new Logradouro();
        if(attributes.length == 11){
          count++;
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
            s.resume();
          });
        }
    })
    .on('error', function (error) {
        console.log("Caught", error);
        s.close();
        console.log('Read entire file with error. Lines Read: ', count);
    })
    .on('end', function(){
      s.close();
      s.destroy();
      console.log('Read entire file. Lines Read: ', count);
      return true;
    })
  );
}