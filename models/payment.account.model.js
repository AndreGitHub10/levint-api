const mongoose = require('mongoose')

const UsageSchema = new mongoose.Schema({
    type: String,
    id_lelang: String,
    amount: Number
},{
    timestamps: true
})

const CardSchema = new mongoose.Schema({
    beneficary_name: String,
    beneficary_account: String,
    beneficary_bank: String
})

const PaymentAccount = new mongoose.Schema({
    id_user: {type: String, required: true},
    saldo: {type: Number, required: true},
    card: {type: [CardSchema], default: []},
    usage: {type: [UsageSchema], default: []},
    status: {type: String, required: true}
},
{
    timestamps: true
})

const model = mongoose.model('PaymentAccount', PaymentAccount)

module.exports = model