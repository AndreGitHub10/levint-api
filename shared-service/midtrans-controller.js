require('dotenv').config()
const { v4: uuidv4 } = require('uuid')
const TopUp = require('../models/topUp.model')
const PaymentAccount = require('../models/payment.account.model')
const Transaksi = require('../models/transaksi.model')
var request = require('request');

const midtransClient = require('midtrans-client')
const { encodeBase64 } = require('bcryptjs')

let iris = new midtransClient.Iris({
    isProduction : false,
    serverKey : process.env.MIDTRANS_SERVER_KEY
});

let snap = new midtransClient.Snap()
snap.apiConfig.set({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY
})

const localTopUp = async () => {
    let order_id = uuidv4()
    let amount = 10000
    try {
        await createPayment(order_id, amount)
    } catch (err) {
        console.log(err)
    }
}

const topUp = async (req, res) => {
    const id_user = req.id
    const { topUpAmount } = req.body
    let order_id = uuidv4()
    console.log(order_id)
    let status = "belum dibayar"

    let transactionToken
    try {
        transactionToken = await createPayment(order_id, topUpAmount)
    } catch (err) {
        console.log(err)
    }
    const topUpDetail = new TopUp({
        id_user,
        order_id,
        topUpAmount,
        status,
        transactionToken
    })
    try {
        await topUpDetail.save()
    } catch (err) {
        console.log(err)
    }

    return res.status(200).json({ message: "invoice created", topUpDetail })
}

const getAllPayment = async (req, res) => {
    const id_user = req.id
    let dataPayment = []
    try {
        dataPayment = await TopUp.find({ id_user })
    } catch (error) {
        console.log(error)
    }
    return res.status(200).json({ message: 'Data pembayaran ditemukan', dataPayment })
}

const checkPaymentStatus = async (req, res) => {
    const id_user = req.id
    let { transactionToken } = req.body
    console.log(`token : ${transactionToken}`)
    snap.transaction.status(transactionToken).then(async (response) => {
        let order_id = response.order_id
        let transactionStatus = response.transaction_status
        let topUpDetail
        let topUpDetailUpdate
        let gross_amount = parseInt(response.gross_amount)
        // let fraudStatus = response.fraud_status

        // console.log(`Transaksi notifikasi didapatkan. Order ID: ${orderId}. Transaksi status: ${transactionStatus}. Fraud status: ${fraudStatus}`)

        if (transactionStatus == 'capture') {
            // console.log('user telah memilih kartu')
            try {
                topUpDetail = await TopUp.findOneAndUpdate(order_id, { status: "belum dibayar" })
            } catch (error) {
                console.log(error)
            }
            // if (fraudStatus == 'challenge') {
            //     console.log('challenge')
            // } else if (fraudStatus == 'accept') {
            //     console.log('accept')
            // }
        } else if (transactionStatus == 'settlement') {
            let paymentAccount
            try {
                topUpDetail = await TopUp.findOne({ order_id })
            } catch (error) {
                console.log(error)
            }
            if (!topUpDetail) {
                return res.status(400).json({ message: "data pembayaran tidak ditemukan" })
            } else if (topUpDetail.status == "belum dibayar" || topUpDetail.status == "pending") {
                try {
                    topUpDetailUpdate = await TopUp.findOneAndUpdate({order_id}, { status: "telah dibayar" })
                } catch (error) {
                    console.log(error)
                }
                if (topUpDetailUpdate) {
                    try {
                        paymentAccount = await PaymentAccount.findOneAndUpdate({ id_user }, { $inc: { saldo: gross_amount } })
                    } catch (error) {
                        return res.status(400).json({ message: "kesalahan server database" })
                    }
                    if (paymentAccount) {
                        return res.status(200).json({ message: "Saldo telah berhasil ditambahkan", topUpDetail: topUpDetailUpdate})
                    }
                }
                try {
                    topUpDetailUpdate = await TopUp.findOneAndUpdate({order_id}, { status: "belum dibayar" })
                } catch (error) {
                    console.log(error)
                }
            } else if (topUpDetail.status == "telah dibayar") {
                return res.status(200).json({ message: "data berhasil diupdate", topUpDetail })
            }
            console.log("return salah sistem")
            return res.status(400).json({ message: "Terjadi kesalahan sistem" })
            // console.log('telah dibayar')
        } else if (transactionStatus == 'deny') {
            // console.log('dtolak')
            try {
                topUpDetail = await TopUp.findOneAndUpdate(order_id, { status: "ditolak" })
            } catch (error) {
                console.log(error)
            }
        } else if (transactionStatus == 'cancel' || transactionStatus == 'expire') {
            // console.log('dibatalkan')
            try {
                topUpDetail = await TopUp.findOneAndUpdate(order_id, { status: "expire" })
            } catch (error) {
                console.log(error)
            }
        } else if (transactionStatus == 'pending') {
            // console.log('pending')
            try {
                topUpDetail = await TopUp.findOneAndUpdate(order_id, { status: "pending" })
            } catch (error) {
                console.log(error)
            }
        }
        return res.status(200).json({ message: "payment status updated", topUpDetail })
    })
        .catch((error) => {
            console.log(error.ApiResponse.status_message)
            return res.status(400).json({message: 'Silahkan tekan tombol bayar dan pilih step pembayaran'})
        })
}

const createPayment = async (order_id, topUpAmount) => {
    const gross_amount = parseInt(topUpAmount)
    let parameter = {
        "transaction_details": {
            "order_id": order_id,
            "gross_amount": gross_amount
        }, "credit_card": {
            "secure": true
        }
    }
    let transactionToken

    await snap.createTransaction(parameter)
        .then((transaction) => {
            console.log(transaction)
            transactionToken = transaction.token
            console.log('transactionToken:', transactionToken)
            // return transactionToken
            // console.log('transactionToken:', transactionToken)
        })
    return transactionToken
}
// console.log('jalan')
// snap.transaction.notification(notificationJson)
// .then((response) => {
//     let orderId = response.order_id
//     let transactionStatus = response.transaction_status
//     let fraudStatus = response.fraud_status

//     console.log(`Transaksi notifikasi didapatkan. Order ID: ${orderId}. Transaksi status: ${transactionStatus}. Fraud status: ${fraudStatus}`)

//     if(transactionStatus == 'capture'){
//         console.log('user telah memilih kartu')
//         if(fraudStatus == 'challenge'){
//             console.log('challenge')
//         } else if (fraudStatus == 'accept'){
//             console.log('accept')
//         }
//     } else if (transactionStatus == 'settlement'){
//         console.log('telah dibayar')
//     } else if(transactionStatus == 'deny'){
//         console.log('dtolak')
//     } else if(transactionStatus == 'cancel' || transactionStatus == 'expire'){
//         console.log('dibatalkan')
//     } else if(transactionStatus == 'pending'){
//         console.log('pending')
//     }
// })

const checkPaymentTransaksiStatus = async (req, res) => {
    const id_user = req.id
    let { transactionToken } = req.body
    console.log(`token : ${transactionToken}`)
    snap.transaction.status(transactionToken).then(async (response) => {
        let order_id = response.order_id
        let transactionStatus = response.transaction_status
        let transaksiDetail
        console.log(order_id)

        if (transactionStatus == 'settlement') {
            // let paymentAccount
            try {
                transaksiDetail = await Transaksi.findById(order_id)
            } catch (error) {
                console.log(error)
            }
            if (!transaksiDetail) {
                return res.status(400).json({ message: "Data transaksi tidak ditemukan" })
            } else if (transaksiDetail.status == "confirmed") {
                try {
                    transaksiDetail = await Transaksi.findByIdAndUpdate(order_id, { status: "payed" })
                } catch (error) {
                    console.log(error)
                }
                return res.status(200).json({ message: "Data berhasil diupdate, transaksi telah dibayar", transaksiDetail })
            } else if (transaksiDetail.status == "payed") {
                return res.status(200).json({ message: "Transaksi telah dibayar", transaksiDetail })
            }
            console.log("return salah sistem")
            return res.status(400).json({ message: "Terjadi kesalahan sistem" })
        } else {
            return res.status(400).json({ message: "Transaksi belum dibayar" })
        }
            // console.log('telah dibayar')
        // let fraudStatus = response.fraud_status

        // console.log(`Transaksi notifikasi didapatkan. Order ID: ${orderId}. Transaksi status: ${transactionStatus}. Fraud status: ${fraudStatus}`)

        // if (transactionStatus == 'capture') {
        //     return res.status(400).json({ message: "Transaksi belum dibayar" })
        //     // console.log('user telah memilih kartu')
        //     // try {
        //     //     transaksiDetail = await Transaksi.findByIdAndUpdate(order_id, { status: "payed" })
        //     // } catch (error) {
        //     //     console.log(error)
        //     // }
        //     // if (fraudStatus == 'challenge') {
        //     //     console.log('challenge')
        //     // } else if (fraudStatus == 'accept') {
        //     //     console.log('accept')
        //     // }
        // } else if (transactionStatus == 'settlement') {
        //     let paymentAccount
        //     try {
        //         transaksiDetail = await Transaksi.findById(order_id)
        //     } catch (error) {
        //         console.log(error)
        //     }
        //     if (!topUpDetail) {
        //         return res.status(400).json({ message: "data pembayaran tidak ditemukan" })
        //     } else if (topUpDetail.status == "belum dibayar" || topUpDetail.status == "pending") {
        //         try {
        //             topUpDetailUpdate = await TopUp.findOneAndUpdate({order_id}, { status: "telah dibayar" })
        //         } catch (error) {
        //             console.log(error)
        //         }
        //         if (topUpDetailUpdate) {
        //             try {
        //                 paymentAccount = await PaymentAccount.findOneAndUpdate({ id_user }, { $inc: { saldo: gross_amount } })
        //             } catch (error) {
        //                 return res.status(400).json({ message: "kesalahan server database" })
        //             }
        //             if (paymentAccount) {
        //                 return res.status(200).json({ message: "Saldo telah berhasil ditambahkan", topUpDetail: topUpDetailUpdate})
        //             }
        //         }
        //         try {
        //             topUpDetailUpdate = await TopUp.findOneAndUpdate({order_id}, { status: "belum dibayar" })
        //         } catch (error) {
        //             console.log(error)
        //         }
        //     } else if (topUpDetail.status == "telah dibayar") {
        //         return res.status(200).json({ message: "data berhasil diupdate", topUpDetail })
        //     }
        //     console.log("return salah sistem")
        //     return res.status(400).json({ message: "Terjadi kesalahan sistem" })
        //     // console.log('telah dibayar')
        // } else if (transactionStatus == 'deny') {
        //     // console.log('dtolak')
        //     try {
        //         topUpDetail = await TopUp.findOneAndUpdate(order_id, { status: "ditolak" })
        //     } catch (error) {
        //         console.log(error)
        //     }
        // } else if (transactionStatus == 'cancel' || transactionStatus == 'expire') {
        //     // console.log('dibatalkan')
        //     try {
        //         topUpDetail = await TopUp.findOneAndUpdate(order_id, { status: "expire" })
        //     } catch (error) {
        //         console.log(error)
        //     }
        // } else if (transactionStatus == 'pending') {
        //     // console.log('pending')
        //     try {
        //         topUpDetail = await TopUp.findOneAndUpdate(order_id, { status: "pending" })
        //     } catch (error) {
        //         console.log(error)
        //     }
        // }
        // return res.status(200).json({ message: "payment status updated", topUpDetail })
    })
        .catch((error) => {
            console.log(error.ApiResponse.status_message)
            return res.status(400).json({message: 'Silahkan tekan tombol bayar dan pilih step pembayaran'})
        })
}

const createPayout = async () => {
    const AUTH_STRING = encodeBase64(process.env.MIDTRANS_SERVER_KEY + ":")
    let order_id = uuidv4()
    console.log(AUTH_STRING)
    // console.log(order_id)
    var options = {
        method: 'POST',
        url: 'https://app.sandbox.midtrans.com/iris/api/v1/payouts',
        parameter: {
                "beneficiary_name": "Jon Snow",
                "beneficiary_account": "1172993826",
                "beneficiary_bank": "bni",
                "beneficiary_email": "beneficiary@example.com",
                "amount": "100000.00",
                "notes": "Payout April 17"
              },
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Basic ${AUTH_STRING}`,
            "X-Idempotency-Key": order_id
        }
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        console.log(body)
        // console.log(response)
        // return res.status(200).json({body})
    })

    // let payouts = {
    //     "beneficiary_name": "Jon Snow",
    //     "beneficiary_account": "1172993826",
    //     "beneficiary_bank": "bni",
    //     "beneficiary_email": "beneficiary@example.com",
    //     "amount": "100000.00",
    //     "notes": "Payout April 17"
    //   }
    // await iris.createBeneficiaries({
    //     "name": "Budi Susantoo",
    //     "account": "0611101146",
    //     "bank": "bca",
    //     "alias_name": "budisusantoo",
    //     "email": "budi.susantoo@example.com"
    //   })
    // .then((response) => {
    //     console.log(response)
    // })
    // .catch((error) => {
    //     console.log(error)
    // })
}

exports.checkPaymentStatus = checkPaymentStatus
exports.createPayment = createPayment
exports.topUp = topUp
exports.getAllPayment = getAllPayment
exports.checkPaymentTransaksiStatus = checkPaymentTransaksiStatus
exports.createPayout = createPayout
exports.localTopUp = localTopUp