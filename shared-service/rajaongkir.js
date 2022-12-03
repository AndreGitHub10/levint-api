require('dotenv').config()
'use strict'
var request = require('request');
var tabletojson = require('tabletojson').Tabletojson
var htmlToJson = require('html-to-json')

const listKurir = [
    {"code":"jne","description":"JNE Express"},
    {"code":"pos","description":"POS Indonesia"},
    {"code":"tiki","description":"TIKI"},
]

// const listKurir = [
//     {"code":"jne","description":"JNE Express"},
//     {"code":"pos","description":"POS Indonesia"},
//     {"code":"jnt","description":"J&T Express Indonesia"},
//     {"code":"sicepat","description":"SiCepat"},
//     {"code":"tiki","description":"TIKI"},
//     {"code":"anteraja","description":"AnterAja"},
//     {"code":"wahana","description":"Wahana"},
// ]

const getKurir = (req, res) => {
    return res.status(200).json(listKurir)
}

const getProvinsi = (req, res) => {
    var options = {
        method: 'GET',
        url: `https://api.rajaongkir.com/starter/province`,
        qs: {},
        headers: {key: process.env.RAJA_ONGKIR_API}
    };
    request(options, function (error, response, body) {
        if (error) console.log(error);
        // console.log(body);
        return res.status(200).json({body})
    });
}

const getCity = (req, res) => {
    const {province} = req.body
    console.log(province)
    var options = {
        method: 'GET',
        url: 'https://api.rajaongkir.com/starter/city',
        qs: {province},
        headers: {key: process.env.RAJA_ONGKIR_API}
    };
      
    request(options, function (error, response, body) {
        if (error) console.log(error);
        // console.log(body);
        return res.status(200).json({body})
    });
}

const getSubdistrict = (req, res) => {
    const {city} = req.body
    var linkParser = htmlToJson.createParser(['option[value]', {
        'kode': function ($a) {
          return $a.attr('value');
        },
        'kecamatan': function ($a) {
          return $a.text();
        }
      }]);
       
      linkParser.request(`https://laravel-rajaongkir.herokuapp.com/subdistrict/${city}`).done(function (links) {
        // console.log(links)  
        return res.status(200).json({links})
        
      });
}

const getCost = (req, res) => {
    const {from, to, berat, kurir} = req.body
    tabletojson.convertUrl(
        `https://laravel-rajaongkir.herokuapp.com/cost/${from}/subdistrict/${to}/subdistrict/${berat}/${kurir}`,
        function(tableAsJson) {
            return res.status(200).json({tarif: tableAsJson[0]})
            // console.log(tableAsJson[0])
        }
    )
    // var options = {
    //     method: 'POST',
    //     url: 'https://api.rajaongkir.com/starter/cost',
    //     headers: {key: process.env.RAJA_ONGKIR_API, 'content-type': 'application/x-www-form-urlencoded'},
    //     form: {origin: from, destination: to, weight: 500, courier: 'tiki'}
    //   };
      
    //   request(options, function (error, response, body) {
    //     if (error) throw new Error(error);
      
    //     console.log(body);
    //   });
}

// const wpApi = () => {

//     tabletojson.convertUrl(
//         'https://laravel-rajaongkir.herokuapp.com/cost/4080/subdistrict/5645/subdistrict/500/tiki',
//         function(tableAsJson) {
//             console.log(tableAsJson[0])
//         }
//     )
    // var options = {
    //     method: 'GET',
    //     url: 'https://laravel-rajaongkir.herokuapp.com/cost/4080/subdistrict/5645/subdistrict/500/tiki'
    // }

    // request(options, function (error, response, body) {
    //     if (error) throw new Error(error);
    //     tabletojson.convertUrl('https://laravel-rajaongkir.herokuapp.com/cost/4080/subdistrict/5645/subdistrict/500/tiki', { useFirstRowForHeadings: true }, function(tableAsJson) {
    //         console.log(tableAsJson[1])
    //     })
    //     console.log(body);
    //     // var newBody = body.tableToJSON()
    //     // console.log(newBody)
    // });
// }

const getCostRO = async (req, res) => {
    const {from, to, berat, kurir} = req.body
    var options = {
        method: 'POST',
        url: 'https://api.rajaongkir.com/starter/cost',
        headers: {key: process.env.RAJA_ONGKIR_API, 'content-type': 'application/x-www-form-urlencoded'},
        form: {origin: from, destination: to, weight: berat, courier: kurir}
    }

    request(options, function (error, response, body) {
        if (error) console.log(error);
        // console.log(body);
        return res.status(200).json({body})
    });
}

exports.getProvinsi = getProvinsi
exports.getCity = getCity
exports.getSubdistrict = getSubdistrict
exports.getCost = getCost
exports.getKurir = getKurir
exports.getCostRO = getCostRO
// exports.wpApi = wpApi