const mongoose = require('mongoose')

const User = new mongoose.Schema(
    {
        name: { type: String, required: true },
        username: {type: String, required: true, unique: true, minlength: 3},
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true, minlength: 8 },
        phone: { type: String, default: '', unique: false},
        status: {
            type: String,
            enum: ['Pending', 'Active'],
            default: 'Pending'
        },
        alamat: {
            type: {
                provinsi: {
                    id: String,
                    provinsi: String
                },
                kabupaten: {
                    id: String,
                    kabupaten: String
                },
                kecamatan: {
                    id: String,
                    kecamatan: String
                },
                alamat_lengkap: {type: String}
            },
            default: {
                provinsi: {
                    id: '',
                    provinsi: ''
                },
                kabupaten: {
                    id: '',
                    kabupaten: ''
                },
                kecamatan: {
                    id: '',
                    kecamatan: ''
                },
                alamat_lengkap: ''
            }
        },
        photo: {type: String, default: ''},
        profil: {type: String},
        history: [],
        createdAt: {type: Date, required: true},
        updatedAt: {type: Date, required: true},
        lastVerifyAt: {type: Date, required: true}
    }
)

const model = mongoose.model('User', User)

module.exports = model