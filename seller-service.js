require('dotenv').config()

const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const sellerRouter = require('./routes/seller-routes')

var allowedDomains = ['http://localhost:3001', 'http://192.168.87.203:3001', 'http://192.168.87.203:3000', 'http://localhost:3000']

app.use(cors({credentials: true, origin: function (origin, callback) {
    if(!origin) return callback(null, true)

    if(allowedDomains.indexOf(origin) === -1) {
        var msg = `This site ${origin} does not have an access. Only specific domains are allowed to access it.`
        return callback(new Error(msg), false)
    }
    return callback(null, true)
}}))
app.use(express.json())
app.use(cookieParser())
app.use("/seller", sellerRouter)

mongoose
    .connect(
        process.env.DATABASE_URL
    )
    .then(() => {
        app.listen(process.env.SELLER_SERVER_PORT, () => {
            console.log(`Seller server is running on port ${process.env.SELLER_SERVER_PORT}`);
        })
    })
    .catch((err) => {
        console.log(err)
    })

