require('dotenv').config()
var request = require('request');

const listKurir = [
    {"code":"jne","description":"JNE Express"},
    {"code":"pos","description":"POS Indonesia"},
    {"code":"jnt","description":"J&T Express Indonesia"},
    {"code":"sicepat","description":"SiCepat"},
    {"code":"tiki","description":"TIKI"},
    {"code":"anteraja","description":"AnterAja"},
    {"code":"wahana","description":"Wahana"},
    {"code":"ninja","description":"Ninja Express"},
    {"code":"lion","description":"Lion Parcel"},
    {"code":"pcp","description":"PCP Express"},
    {"code":"jet","description":"JET Express"},
    {"code":"rex","description":"REX Express"},
    {"code":"first","description":"First Logistics"},
    {"code":"ide","description":"ID Express"},
    {"code":"spx","description":"Shopee Express"},
    {"code":"kgx","description":"KGXpress"},
    {"code":"sap","description":"SAP Express"},
    {"code":"jxe","description":"JX Express"},
    {"code":"rpx","description":"RPX"}
]

const getProvinsi = () => {
    var options = {
        'method': 'GET',
        'url': `https://api.binderbyte.com/wilayah/provinsi?api_key=${process.env.BINDER_BYTE_API}`,
        'headers': {
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        console.log(response.body);
    });
}

const getKabupaten = (id_provinsi) => {
    var options = {
        'method': 'GET',
        'url': `https://api.binderbyte.com/wilayah/kabupaten?api_key=${process.env.BINDER_BYTE_API}&id_provinsi=${id_provinsi}`,
        'headers': {
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        console.log(response.body);
    });
}

const getKecamatan = (id_kabupaten) => {
    var options = {
        'method': 'GET',
        'url': `https://api.binderbyte.com/wilayah/kecamatan?api_key=${process.env.BINDER_BYTE_API}&id_kabupaten=${id_kabupaten}`,
        'headers': {
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        console.log(response.body);
    });
}

const getKelurahan = (id_kecamatan) => {
    var options = {
        'method': 'GET',
        'url': `https://api.binderbyte.com/wilayah/kelurahan?api_key=${process.env.BINDER_BYTE_API}&id_kecamatan=${id_kecamatan}`,
        'headers': {
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        console.log(response.body);
    });
}

const getKurir = () => {
    var options = {
        'method': 'GET',
        'url': `https://api.binderbyte.com/v1/list_courier?api_key=${process.env.BINDER_BYTE_API}`,
        'headers': {
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        console.log(response.body);
    });
}

// exports.getKurir = getKurir
// exports.getProvinsi = getProvinsi
// exports.getKabupaten = getKabupaten
// exports.getKecamatan = getKecamatan
// exports.getKelurahan = getKelurahan