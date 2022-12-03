const mongoose = require('mongoose')

const Message = new mongoose.Schema({
    from: {type: String, required: true},
    to: {type: String, required: true},
    message: {type: String, required: true},
    status: {type: String, required: true}
},
{
    timestamps: true
})

const Chat = new mongoose.Schema({
    users: {type: [String], required: true},
    user_name: {type: [String], required: true},
    block: {type: [String], required: true, default: []},
    data_message: {type: [Message], required: true}
})

const model = mongoose.model('Chat', Chat)

module.exports = model