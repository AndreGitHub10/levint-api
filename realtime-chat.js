require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const server = require('http').createServer(app)
const cors = require('cors')
const jwt = require('jsonwebtoken')
const Chat = require('./models/chat.model')

// var allowedDomains = ['http://localhost:3001', 'http://192.168.34.203:3001', 'http://192.168.191.203:3000', 'http://localhost:3000']
const io = require('socket.io')(server, {
        cors: {
            credentials: true, 
            origin: ['http://localhost:3001', 'http://192.168.87.203:3001', 'http://192.168.87.203:3000', 'http://localhost:3000'] 
        }
    }
)

app.use(express.json())
app.use(cookieParser())
mongoose
    .connect(
        process.env.DATABASE_URL
    )
    .then(() => {
        server.listen(
            process.env.REALTIME_CHAT_SERVER_PORT, () => {
                console.log(`RT Lelang Server is running on port ${process.env.REALTIME_CHAT_SERVER_PORT}`);
            }
        )
    })
    .catch((err) => console.log(err))

// io.use((socket, next) => {
//     if(socket.handshake) {
//         console.log(socket.handshake?.headers)
//     }
// })
global.onlineUsers = new Map()

io.of('/').on('connect', (socket) => {

    if (socket.handshake.headers.cookie !== undefined) {
        const cookies = socket.handshake.headers.cookie
        const token = cookies.split("=")[1]
        // console.log(token);
        if (token) {
            jwt.verify(String(token), process.env.ACCESS_TOKEN_SECRET, (err, user) => {
                if (user) {
                    console.log("real user added")
                    onlineUsers.set(socket.id, {user_id: user.id, lelang_id: ''})
                }
            })
        }
    } else {
        console.log('fake user not added')
    }

    socket.on('disconnect', () => {
        if(onlineUsers.has(socket.id)) {
            onlineUsers.delete(socket.id)
            console.log('an user disconnect')
        } else {
            console.log('a guest disconnect')
        }
    })

    socket.on('send-message', async ({id_chat, id_user_to}) => {
        console.log(id_user_to)
        let newMessage = await Chat.find({id: id_chat})
        for(let [key, value] of onlineUsers.entries()) {
            if(value.user_id === id_user_to) {
                io.of('/').to(key).emit('new-message', {newMessage: newMessage})
            }
        }
    })

    socket.on('online-user-check', (id_user) => {
        for (let online of onlineUsers.values()) {
            if(online.id_user === id_user) {
                callback({
                    userOnline: true
                })
            }
        }
        callback({
            userOnline: false
        })
    })
})

// socket.on('join', (lelang_id) => {
//     let users = new Map()
//     socket.join(lelang_id)
//     if(onlineUsers.has(socket.id)) {
//         onlineUsers.set(socket.id, {...onlineUsers.get(socket.id), lelang_id: lelang_id})
//         for (let online of onlineUsers.values()) {
//             room_id = online.lelang_id
//             user_id = online.user_id
//             if(room_id === lelang_id) {
//                 users.set(user_id, user_id)
//             }
//         }
//     }
//     io.of('/').to(lelang_id).emit('user-watching', users.size)
// })
// socket.on('disconnect', () => {
//     if(onlineUsers.has(socket.id)) {
//         io.of('/').emit()
//     }
// })

// socket.on('leave-room', () => {
//     let users = new Map()
//     if(onlineUsers.has(socket.id)) {
//         let room = onlineUsers.get(socket.id).lelang_id
//         onlineUsers.delete(socket.id)
//         for (let online of onlineUsers.values()) {
//             room_id = online.lelang_id
//             user_id = online.user_id
//             if(room_id === room) {
//                 users.set(user_id, user_id)
//             }
//         }
//         io.of('/').to(room).emit('user-watching', users.size)
//     }
// })