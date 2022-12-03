require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const paymentRouter = require('./routes/payment-routes')

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
app.use('/payment', paymentRouter)

mongoose
    .connect(
        process.env.DATABASE_URL
    )
    .then(() => {
        app.listen(process.env.PAYMENT_GATEWAY_PORT, () => {
            console.log(`Payment Server is running on port ${process.env.PAYMENT_GATEWAY_PORT}`)
        })
    })
    .catch((err) => console.log(err))

// checkPaymentStatus('6144b5a2-2122-4660-9faf-346bec6852a9')
// createPayment()