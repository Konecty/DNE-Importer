var fs = require('fs');
var stream = require('stream');
var es = require('event-stream');
var mongoose = require('mongoose');
var iconv = require('iconv-lite');

mongoose.connect('mongodb://localhost:27017/importer');

var Logradouro = require('./models/logradouro_model.js')
var Localidade = require('./models/localidade_model.js')
var Bairro = require('./models/bairro_model.js')

/*
*   Patterns
*/
var NUMBER_INIT_REGEX = new RegExp("-\\sde\\s(\\d+)/?(\\d*).*")
var NUMBER_END_REGEX = new RegExp(".*at?é?\\s(\\d+)/?(\\d*).*")
var NUMBER_EVEN_REGEX = new RegExp(".*lado\\spar.*")
var NUMBER_ODD_REGEX = new RegExp(".*lado\\símpar.*")

// Ler arquivos da pasta
var pattern_logradouro = new RegExp("(?!LOG_)LOGRADOURO")
var pattern_localidade = new RegExp("(?!LOG_)LOCALIDADE")
var pattern_bairro = new RegExp("(?!LOG_)BAIRRO")

OpenLocalidade('LOG_LOCALIDADE.TXT');

function ReadFolder(){
  fs.readdir('./resources', function(err, files){
    files.forEach(function(file){
      if(pattern_logradouro.test(file)){
        OpenLogradouro(file);
      }
    })
  });
}

function OpenBairro(file){
  var count = 0;
  console.log(file)
  var s = fs.createReadStream('./resources/'+file, {autoClose: true})
    .pipe(iconv.decodeStream('ISO-8859-1'))
    .pipe(es.split())
    .pipe(es.mapSync(function(line){
        s.pause();
        var attributes = line.split('@');
        var bairro = new Bairro();
        if(attributes.length == 5){
          count++;
          Localidade.findOne({id: attributes[2]}, 'city cityAbbr', function(err, ct){
            bairro.id = attributes[0];
            bairro.state = attributes[1];
            bairro.city = ct.city;
            bairro.cityAbbr = ct.cityAbbr;
            bairro.district = attributes[3];
            bairro.districtAbbr = attributes[4];
            bairro.save(function(err, bro){
              s.resume();
            });
          })
        }else
          s.resume();
    }))
    .on('error', function (error) {
        console.log("Caught", error);
        s.destroy();
        console.log('Leitura completada com erros. Número de linhas: ', count);
    })
    .on('end', function(){
      s.destroy();
      console.log('Leitura completada. Número de linhas: ', count);
      ReadFolder();
    });
}

function OpenLocalidade(file){
  var count = 0;
  console.log(file)
  var s = fs.createReadStream('./resources/'+file)
    .pipe(iconv.decodeStream('ISO-8859-1'))
    .pipe(es.split())
    .pipe(es.mapSync(function(line){
        s.pause();
        var attributes = line.split('@');
        var localidade = new Localidade();
        if(attributes.length == 9){
          count++;
          localidade.id = attributes[0];
          localidade.state = attributes[1];
          localidade.city = attributes[2];
          localidade.postalCode = attributes[3].trim();
          localidade.status = attributes[4];
          localidade.type = attributes[5];
          //localidade.subordination = attributes[6];
          localidade.cityAbbr = attributes[7];
          //localidade.cityIbgeCode = attributes[8];
          localidade.save(function(err, lgr){
            s.resume();
          });
        }else
          s.resume();
    }));
    s.on('error', function (error) {
        console.log("Caught", error);
        s.destroy();
        console.log('Leitura completada com erros. Número de linhas: ', count);
    });
    s.on('end', function(){
      console.log('Leitura completada. Número de linhas: ', count);
      OpenBairro('LOG_BAIRRO.TXT');
      s.destroy();
    });
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
          Localidade.findOne({id: attributes[2]}, 'city cityAbbr', function(err, ct){
            logradouro.state = attributes[1];
            logradouro.city = ct.city;
            logradouro.cityAbbr = ct.cityAbbr;
            //if( attributes[3] != "" ){
              Bairro.findOne({id: attributes[3]}, 'district districtAbbr', function(err, br){
                if(br !== null){
                  logradouro.startNeighbourhood = br.district;
                  logradouro.startNeighbourhoodAbbr = br.districtAbbr;
                }
                //if( attributes[4] != "" ){
                  Bairro.findOne({id: attributes[4]}, 'district districtAbbr', function(err, brEnd){
                    if(brEnd !== null){
                      logradouro.endNeighbourhood = brEnd.district;
                      logradouro.endNeighbourhoodAbbr = brEnd.districtAbbr;
                    }
                    logradouro.place = attributes[5];
                    logradouro.postalCode = attributes[7];
                    logradouro.placeType = attributes[8];
                    logradouro.status = attributes[9];
                    logradouro.placeAbbr = attributes[10];

                    if(attributes[6].length > 0 && typeof(attributes[6]) === 'string'){
                      var matches_init = NUMBER_INIT_REGEX.exec(attributes[6]);
                      if( matches_init !== null ){
                        logradouro._init = parseInt(matches_init[1])
                      }
                      var matches_end = NUMBER_END_REGEX.exec(attributes[6]);
                      if( matches_end !== null ){
                        logradouro.end = parseInt(matches_end[2] !== undefined ? matches_end[2] : matches_end[1])
                      }
                      var matches_even = NUMBER_EVEN_REGEX.exec(attributes[6]);
                      logradouro.even = matches_even === null;

                      var matches_odd = NUMBER_ODD_REGEX.exec(attributes[6]);
                      logradouro.odd = matches_odd === null;
                    }

                    logradouro.save(function(err, lgr){
                      s.resume();
                    });
                  });
                //}
              });
            //}

          });
        }else{
          s.resume();
        }
    }))
    .on('error', function (error) {
        s.destroy();
        console.log('Leitura completada com erros. Número de linhas: ', count);
    })
    .on('end', function(){
      s.destroy();
      console.log('Leitura completada. Número de linhas: ', count);
    });
}