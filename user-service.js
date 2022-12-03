require('dotenv').config()

const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const userRouter = require('./routes/user-routes')
const cookieParser = require('cookie-parser')
// const jwt = require('jsonwebtoken')

var allowedDomains = ['http://localhost:3001', 'http://192.168.87.203:3001', 'http://192.168.87.203:3000', 'http://localhost:3000']

app.use(cors({credentials: true, origin: function (origin, callback) {
    if(!origin) return callback(null, true)

    if(allowedDomains.indexOf(origin) === -1) {
        var msg = `This site ${origin} does not have an access. Only specific domains are allowed to access it.`
        console.log(msg)
        return callback(new Error(msg), false)
    }
    return callback(null, true)
}}))

app.use(express.json())
app.use(cookieParser())
app.use("/user", userRouter)

mongoose
    .connect(
        process.env.DATABASE_URL
    )
    .then(() => {
        app.listen(process.env.ACCOUNT_SERVER_PORT, () => {
            console.log(`Account Server is running on port ${process.env.ACCOUNT_SERVER_PORT}`)
        })
    })
    .catch((err) => console.log(err))

// app.post('/register', async (req, res) => {
//     console.log(req.body)
//     try {
//         await User.create({
//             username: req.body.username,
//             email: req.body.email,
//             password: req.body.password
//         })
//         res.json({ status: 'ok', message: 'account registered'})
//     } catch (error) {
//         console.log(error)
//         res.json({ status: 'error', message: 'unable to create account'})
//     }
// })

// app.post('/login', async (req, res) => {
//     console.log(req.body)
//     const user = await User.findOne({
//         email: req.body.email,
//         password: req.body.password
//     })

//     if(user) {

//         const token = jwt.sign({
//             username: user.username,
//             email: user.email
//         }, process.env.ACCESS_TOKEN_SECRET)

//         res.json({status: 'ok', user: token})
//     } else {
//         res.json({status: 'error', user: false})
//     }
// })

