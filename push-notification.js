require('dotenv').config()
const express = require('express')
const app = express()
const cron = require('node-cron')
const sendLelangWinnerNotificationEmail = require('./shared-service/nodemailer.config.js')

app.listen(8001, () => {
    console.log('app run on port 8001')
})

const pickWinner = cron.schedule('10 0-23 * * *', () => {
    console.log('email send')
    sendLelangWinnerNotificationEmail("Andre", "aansah474@gmail.com", "okey", "http://localhost:3000")
})

// pickWinner.start()