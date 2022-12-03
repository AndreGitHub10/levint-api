const mongoose = require('mongoose')

// status = ["unconfirmed", "confirmed", "payed", "canceled", "packaging", "onshipping", "delivered", "done"]

const Kurir = new mongoose.Schema({
    code: {type: String, required: true, default: ""},
    service: {type: String, required: true, default: ""},
    harga: {type: Number, required: true, default: null}
})

const Transaksi = new mongoose.Schema({
    id_seller: {type: String, required: true},
    id_item: {type: String, required:true},
    id_lelang: {type: String, required:true},
    id_winner: {type: String, required: true},
    transactionToken: {type: String, default: ""},
    final_price: {type: Number, required: true},
    status: {type: String, required: true},
    jaminan: {type: Number, required: true, default: 50000},
    sub_total: {type: Number, default: null},
    canceled_by: {type: String, default: ""},
    kurir: {type: Kurir},
    nama_penerima: {type: String, default: ""},
    alamat_lengkap: {type: String, default: ""},
    no_telp: {type: String, default: ""},
    catatan: {type: String, default: ""},
    provinsi: {type: Object, required: true, default: {id: "", provinsi: ""}},
    kabupaten: {type: Object, required: true, default: {id: "", kabupaten: ""}},
    kecamatan: {type: Object, required: true, default: {id: "", kecamatan: ""}},
    resi: {type: String, default: ""}
}, {
    timestamps: true
})

const model = mongoose.model('Transaksi', Transaksi)

module.exports = model