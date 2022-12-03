const { find } = require('../models/chat.model')
const Chat = require('../models/chat.model')
const User = require('../models/user.model')

const createMessage = async (req, res) => {
    const {message, to} = req.body
    const from = req.id
    let chat
    try {
        chat = await Chat.findOne({users: from})
    } catch (error) {
        console.log(error)
        return res.status(400).json({message: "kesalahan sistem database"})
    }

    if(!chat){
        let passanger
        let sender
        try {
            passanger = await User.findById(to)
        } catch (error) {
            console.log(error)
        }
        if(passanger) {
            try {
                sender = await User.findById(from)
            } catch (error) {
                console.log(error)
            }
        }
        chat = new Chat({
            users: [from, to],
            user_name: [passanger.username, sender.username],
            data_message: {
                from: from,
                to: to,
                message: message,
                status: 'send'
            }
        })
        try {
            chat.save()
        } catch (error) {
            console.log(error)
        }
        return res.status(200).json({message: "pesan berhasil dibuat dan dikirim"})
    } else {
        try {
            chat = await Chat.findOneAndUpdate({users: to, users: from}, {$push: {data_message: {
                    from: from,
                    to: to,
                    message: message,
                    status: 'send'
                }
            }})
        } catch (error) {
            console.log(error)
        }
        let getChat
        try {
            getChat = await Chat.findOne({users: to, users: from})
        } catch (error) {
            console.log(error)
        }
        return res.status(200).json({message: "pesan berhasil dikirim", id_chat: chat._id, id_user_to: to, chat: getChat})
    }

}

const getAllChat = async (req, res) => {
    const id_user = req.id
    let filterChat
    try {
        filterChat = await Chat.find({users: id_user})
    } catch (error) {
        console.log(error)
        return res.status(400).json({message: "kesalahan sistem database"})
    }

    if(!filterChat){
        return res.status(400).json({message: "tidak ditemukan data"})
    }

    let allChat = new Array([Object])
    filterChat.map( async (chat) => {
        let passanger
        let findPassanger
        if(chat.users[0] == id_user) {
            passanger = chat.users[1]
        } else {
            passanger = chat.users[0]
        }
        try {
            findPassanger = await User.findById(passanger)
        } catch (error) {
            console.log('fail find passanger')
        }
        if(findPassanger){
            // console.log(findPassanger)
            // Object.assign(chat, {photo: findPassanger.photo, name_user: findPassanger.username})
            // chat['photo'] = findPassanger.photo
            // chat['name_user'] = findPassanger.username
        }
        // console.log(chat)
        // return chat
        // allChat.push(chat)
    })

    return res.status(200).json({message: "data chat ditemukan", filterChat})
}


const getAllChatRT = async (req, res) => {
    const id_user = req.id
    let filterChat
    try {
        filterChat = await Chat.find({users: id_user})
    } catch (error) {
        console.log(error)
        return res.status(400).json({message: "kesalahan sistem database"})
    }

    if(!filterChat){
        return res.status(400).json({message: "tidak ditemukan data"})
    }

    let allChat = new Array([Object])
    filterChat.map( async (chat) => {
        let passanger
        let findPassanger
        if(chat.users[0] == id_user) {
            passanger = chat.users[1]
        } else {
            passanger = chat.users[0]
        }
        try {
            findPassanger = await User.findById(passanger)
        } catch (error) {
            console.log('fail find passanger')
        }
        if(findPassanger){
            // console.log(findPassanger)
            // Object.assign(chat, {photo: findPassanger.photo, name_user: findPassanger.username})
            // chat['photo'] = findPassanger.photo
            // chat['name_user'] = findPassanger.username
        }
        // console.log(chat)
        // return chat
        // allChat.push(chat)
    })

    return res.status(200).json({message: "data chat ditemukan", filterChat})
}

exports.getAllChat = getAllChat
exports.createMessage = createMessage
exports.getAllChatRT = getAllChatRT