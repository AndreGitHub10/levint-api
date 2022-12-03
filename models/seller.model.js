const mongoose = require('mongoose')

const Seller = new mongoose.Schema(
    {
        id_user: { type: String, required: true, unique: true },
        nama_toko: { type: String, required: true, unique: true },
        active: { type: Boolean, required: true, default: true },
        no_telp: { type: String, required: true },
        alamat: {
            provinsi: {
                id: {type: String, default: ''},
                provinsi: {type: String, default: ''}
            },
            kabupaten: {
                id: {type: String, default: ''},
                kabupaten: {type: String, default: ''}
            },
            kecamatan: {
                id: {type: String, default: ''},
                kecamatan: {type: String, default: ''}
            },
            alamat_lengkap: {type: String, default: ''}
        },
        rating: { type: Number, default: 100 },
        createdAt: {type: Date, required: true},
        updatedAt: {type: Date, required: true, default: Date.now}
    }
)

const model = mongoose.model('Seller', Seller)

module.exports = model