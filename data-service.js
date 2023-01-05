require('dotenv').config()

const express = require('express')
const app = express()
// const multer = require('multer')
// const upload = multer()
const cors = require('cors')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const itemRouter = require('./routes/item-routes')
const lelangRouter = require('./routes/lelang-routes')
const transaksiRouter = require('./routes/transaksi-routes')

var allowedDomains = ['http://localhost:3001', 'http://192.168.87.203:3001', 'http://192.168.87.203:3000', 'http://localhost:3000']

// app.use(cors())
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
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json())
// app.use(upload.array())
app.use('/item', itemRouter)
app.use('/lelang', lelangRouter)
app.use('/transaksi', transaksiRouter)

mongoose
    .connect(
        process.env.DATABASE_URL
    )
    .then(() => {
        app.listen(process.env.DATA_SERVER_PORT, () => {
            console.log(`Data Server is running on port ${process.env.DATA_SERVER_PORT}`)
        })
    })
    .catch((err) => console.log(err))