const mongoose = require('mongoose')

// status = ["new", "onLelang", "endLelang"]

const UkuranPaket = new mongoose.Schema({
    panjang_cm: {type: Number},
    lebar_cm: {type: Number},
    tinggi_cm: {type: Number}
})

const Item = new mongoose.Schema({
    id_seller: {type: String, required: true},
    nama_item: {type: String, required: true},
    deskripsi_item: {type: String},
    gambar: [],
    jumlah_item: {type: Number},
    kategori: [],
    item_berbahaya: {type: Boolean, required: true},
    merek: {type: String},
    panjang_cm: {type: Number},
    lebar_cm: {type: Number},
    tinggi_cm: {type: Number},
    berat: {type: Number},
    ukuranPaket: {type: UkuranPaket, required: true},
    beratPaket: {type: Number, default: 1000},
    tahun: {type: Number},
    provinsi: {type: Object, required: true, default: {id: "", provinsi: ""}},
    kabupaten: {type: Object, required: true, default: {id: "", kabupaten: ""}},
    kecamatan: {type: Object, required: true, default: {id: "", kecamatan: ""}},
    kurirList: {type: [String], required: true},
    status: {type: String, required: true},
    createdAt: {type: Date, required: true},
    updatedAt: {type: Date, required: true, default: Date.now}
})

const model = mongoose.model('Item', Item)

module.exports = model