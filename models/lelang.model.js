const mongoose = require('mongoose')

// ["onLelang"]

const Bid = mongoose.Schema({
    id_bidder: {type: String},
    price: {type: Number}
})

const Lelang = new mongoose.Schema({
    id_seller: {type: String, required: true},
    id_item: {type: String, required:true},
    harga_dasar: {type: Number, required: true},
    tanggal_mulai: {type:Date, required:true},
    tanggal_akhir: {type:Date, required:true},
    auto_sell: {type: Boolean, default: false},
    auto_sell_price: {type: Number, default: 0},
    sell_limit: {type: Boolean, default: false},
    sell_limit_price: {type: Number, default: 0},
    status: {type: String, required: true},
    open_bidding: {type: Boolean, default: true},
    bid_increase: {type:Number, required: true},
    bid: {type: [Bid], default: []}
})

const model = mongoose.model('Lelang', Lelang)

module.exports = model