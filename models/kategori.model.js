const mongoose = require('mongoose')

const Kategori = new mongoose.Schema({
    name: {type: String, required: true},
    deskripsi: {type: String},
    createdAt: {type: Date, required: true},
    updatedAt: {type: Date, required: true, default: Date.now}
})

const model = mongoose.model('Kategori', Kategori)

module.exports = model