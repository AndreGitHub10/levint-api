require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const server = require('http').createServer(app)
const cors = require('cors')
const jwt = require('jsonwebtoken')
const Lelang = require('./models/lelang.model')

const { getLelangRT, createBid } = require('./controllers/lelang-controller')
// const { verifyTokenWithReturn } = require('./shared-service/verifyToken')

// var allowedDomains = ['http://localhost:3001', 'http://192.168.34.203:3001', 'http://192.168.191.203:3000', 'http://localhost:3000']
const io = require('socket.io')(server, {
        cors: {
            credentials: true, 
            origin: ['http://localhost:3001', 'http://192.168.87.203:3001', 'http://192.168.87.203:3000', 'http://localhost:3000'] 
        }
    }
        // handlePreflightRequest: (req, res) => {
        //     const headers = {
        //         "Access-Control-Allow-Headers": "Content-Type, Authorization",
        //         "Access-Control-Allow-Origin": "http://localhost:3000",
        //         "Access-Control-Allow-Credentials": true
        //     };
        //     res.writeHead(200, headers);
        //     res.end()
        // }
        )
// (server, cors({
//     credentials: true, origin: function (origin, callback) {
//         if(!origin) return callback(null, true)

//         if(allowedDomains.indexOf(origin) === -1) {
//             var msg = `This site ${origin} does not have an access. Only specific domains are allowed to access it.`
//             return callback(new Error(msg), false)
//         }
//         return callback(null, true)
//     }
// }))

app.use(express.json())
app.use(cookieParser())
mongoose
    .connect(
        process.env.DATABASE_URL
    )
    .then(() => {
        server.listen(
            process.env.REALTIME_LELANG_SERVER_PORT, () => {
                console.log(`RT Lelang Server is running on port ${process.env.REALTIME_LELANG_SERVER_PORT}`);
            }
        )
    })
    .catch((err) => console.log(err))

// io.use((socket, next) => {
//     if(socket.handshake) {
//         console.log(socket.handshake?.headers)
//     }
// })
global.onlineUser = new Map()

io.of('/').on('connect', (socket) => {
    
    socket.on('join', (lelang_id) => {
        let users = new Map()
        socket.join(lelang_id)
        if (socket.handshake.headers.cookie !== undefined) {
            const cookies = socket.handshake.headers.cookie
            const token = cookies.split("=")[1]
            // console.log(token);
            if (token) {
                jwt.verify(String(token), process.env.ACCESS_TOKEN_SECRET, (err, user) => {
                    if (user) {
                        console.log("real user added")
                        onlineUser.set(socket.id, `${lelang_id}` + '=' + `${user.id}`)
                    }
                })
            }
        } else {
            console.log('fake user not added')
        }
        for (let online of onlineUser.values()) {
            room_id = online.split("=")[0]
            user_id = online.split("=")[1]
            if(room_id === lelang_id) {
                users.set(user_id, user_id)
            }
        }
        io.of('/').to(lelang_id).emit('user-watching', users.size)
    })

    socket.on('disconnect', () => {
        let users = new Map()
        if(onlineUser.has(socket.id)) {
            let room = onlineUser.get(socket.id).split("=")[0]
            onlineUser.delete(socket.id)
            for (let online of onlineUser.values()) {
                room_id = online.split("=")[0]
                user_id = online.split("=")[1]
                if(room_id === room) {
                    users.set(user_id, user_id)
                }
            }
            io.of('/').to(room).emit('user-watching', users.size)
        }
    })

    socket.on('add-user', (data) => {
        console.log(data.roomLelang)
        io.of('/').to(data.lelang_id).emit('count-user', {message: data.message})
        console.log('add user berhasil')
    })

    socket.on('lelang', async (id_lelang) => {
        const dataBid = await getLelangRT(id_lelang)
        io.of('/').in(id_lelang).emit('bid', dataBid)
    })
})



    // socket.on('create-bid', async (data) => {
    //     console.log(data)
    //     let user_id
    //     console.log('verifying');
    //     if (!socket) {
    //         return res.status(401).json({message: "Silahkan login terlebih dahulu"})
    //     }
    //     const cookies = socket.handshake.headers.cookie
    //     const token = cookies.split("=")[1]
    //     // console.log(token);
    //     if (!token) {
    //         return res.status(404).json({message:"Token tidak ada"})
    //     }
    //     jwt.verify(String(token), process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    //         if (err) {
    //             return res.status(400).json({message: "Invalid Token!"})
    //         }
    //         console.log(user.id)
    //         user_id = user.id
    //     })
    //     console.log(data.userBid)
    //     let dataBid
    //     if(user_id) {
    //         try {
    //             dataBid = await createBid(user_id, data.id_lelang, data.userBid)
    //         } catch (err) {
    //             return new Error(err)
    //         }
    //     }
    //     console.log(`data sends ${dataBid} n ${onlineUser}`)
    //     io.of('/').in(data.id_lelang).emit('bid', {dataBid, onlineUser: onlineUser.size})
    // })
        // console.log(id_lelang)
        // Lelang.findByIdAndUpdate('62aa6e9cc9ca400d9403ded2', {$push:{bid:{id_bidder: "123", price: id_lelang}}}, { returnOriginal: false}).then(result => {
        //     io.emit("datas", result)
        // })
        // const data = `${bid}`