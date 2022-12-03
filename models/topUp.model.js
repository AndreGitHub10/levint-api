const mongoose = require('mongoose')

const TopUp = new mongoose.Schema({
    id_user: {type: String, required: true},
    order_id: {type: String, required: true},
    topUpAmount: {type: String, required: true},
    transactionToken: {type: String, required: true},
    status: {type: String, required: true}
},
{
    timestamps: true
})

const model = mongoose.model('TopUp', TopUp)

module.exports = model