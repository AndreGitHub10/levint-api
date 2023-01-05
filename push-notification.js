require('dotenv').config()
const express = require('express')
const app = express()
const cron = require('node-cron')
const Lelang = require('./models/lelang.model')
const Item = require('./models/item.model')
const PaymentAccount = require('./models/payment.account.model')
const User = require('./models/user.model')
const schedule = require('node-schedule')
const mongoose = require('mongoose')
const {sendLelangWinnerNotificationEmail, sendLelangEndedNotificationEmail, sendLelangEndedNotificationToLoserEmail} = require('./shared-service/nodemailer.config.js')
const {returnJaminanToLoser} = require('./controllers/lelang-controller')
const { createTransaksi } = require('./controllers/transaksi-controller')

mongoose
    .connect(
        process.env.DATABASE_URL
    )
    .then(() => {
        app.listen(8005, () => {
            console.log('app run on port 8001')
    })
    })
    .catch((err) => console.log(err))

// const pickWinner = cron.schedule
const job = schedule.scheduleJob('5 0-23 * * *', async () => {
    console.log('Checking winner')
    let lelangNow
    try {
        lelangNow = await Lelang.find({status: "scheduled", tanggal_akhir: { $lt: Date() } })
    } catch (err) {
        console.log(err)
    }

    if(!lelangNow) {
        console.log("Tidak ada lelang yang berakhir")
        return
    }

    console.log(lelangNow.length)

    lelangNow.map(async(lelang) => {
        if(lelang.bid.length > 0) {
            let bid = lelang.bid
            bid.sort((a, b) => { return b.price - a.price })
            let item
            let seller
            try {
                item = await Item.findByIdAndUpdate(lelang.id_item, {status: 'endLelang'})
            } catch (err) {
                console.log(err)
            }

            try {
                await Lelang.findByIdAndUpdate(lelang._id, {status: 'onTransaction'})
            } catch (err) {
                console.log(err)
            }
            returnJaminanToLoser(lelang, bid[0].id_bidder)

            bid.map( async (bidd) => {
                if(bidd.id_bidder !== bid[0].id_bidder) {
                    let loser
                    try {
                        loser = await User.findById(bidd.id_bidder)
                    } catch (err) {
                        console.log(err)
                    }
                    sendLelangEndedNotificationToLoserEmail(loser.username, loser.email, item.nama_item, "http://localhost:3000/dashboard/aktivitas")
                }
            })

            try {
                seller = await User.findById(lelang.id_seller)
            } catch (err) {
                console.log(err)
            }
            let winner
            try {
                winner = await User.findById(bid[0].id_bidder)
            } catch (err) {
                console.log(err)
            }

            createTransaksi(lelang.id_seller, lelang.id_item, winner._id, bid[0].price, lelang._id)
            sendLelangEndedNotificationEmail(seller.username, seller.email, item.nama_item, `http://localhost:3001/lelang/riwayat`)
            sendLelangWinnerNotificationEmail(winner.username, winner.email, item.nama_item, "http://localhost:3000/dashboard/transaksi")
        } else {
            let item
            let user
            try {
                item = await Item.findByIdAndUpdate(lelang.id_item, {status: 'endLelang'})
            } catch (err) {
                console.log(err)
            }

            try {
                await Lelang.findByIdAndUpdate(lelang._id, {status: 'ended'})
            } catch (err) {
                console.log(err)
            }

            try {
                await PaymentAccount.findOneAndUpdate({id_user: lelang.id_seller, "usage.id_lelang": lelang._id}, {$set: {"usage.$.type": "return"}, $inc: {saldo: 50000}})
            } catch (err) {
                console.log(err)
            }

            try {
                user = await User.findById(lelang.id_seller)
            } catch (err) {
                console.log(err)
            }

            sendLelangEndedNotificationEmail(user.username, user.email, item.nama_item, `http://localhost:3001/lelang/riwayat`)
        }
    })
    console.log('cron done notify')
    return
})

// pickWinner.start()