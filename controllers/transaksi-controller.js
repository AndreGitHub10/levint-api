const express = require('express')
const Transaksi = require('../models/transaksi.model')
const PaymentAccount = require('../models/payment.account.model')
const Lelang = require('../models/lelang.model')
const {createPayment} = require('../shared-service/midtrans-controller')

const createTransaksi = async (id_seller, id_item, id_winner, final_price, id_lelang) => {
    const transaksi = new Transaksi({
        id_seller,
        id_item,
        id_lelang,
        id_winner,
        final_price,
        jaminan: 50000,
        sub_total: null,
        status: "unconfirmed"
    })

    try {
        transaksi.save()
    } catch (error) {
        console.log(error)
    }
    
}

const confirmTransaksi = async (req, res) => {
    const { id_transaksi, kurir, provinsi, kabupaten, kecamatan, nama_penerima, alamat_lengkap, catatan, no_telp } = req.body
    const id_user = req.id
    // console.log(`${id_user}`)
    let transaksi
    let sub_total
    try {
        transaksi = await Transaksi.findById(id_transaksi)
    } catch (error) {
        return res.status(400).json({message: "Kesalahan server database (mencari transaksi)"})
    }

    if(!transaksi) {
        return res.status(404).json({message: "Transaksi tidak ditemukan"})
    }
    // console.log(`afa: ${transaksi}`)
    if(transaksi.id_winner !== id_user) {
        return res.status(400).json({message: "Anda tidak mempunyai akses untuk transaksi ini"})
    }

    if(transaksi.status !== "unconfirmed") {
        return res.status(400).json({message: "Gagal menkonfirmasi"})
    }

    sub_total = parseInt(kurir.harga) + parseInt(transaksi.final_price)

    let transactionToken
    try {
        transactionToken = await createPayment(transaksi._id, sub_total)
    } catch (err) {
        console.log(err)
    }
    // console.log(`token transaksi : ${transactionToken}`)

    try {
        transaksi = await Transaksi.findByIdAndUpdate(id_transaksi, {status: "confirmed", kurir: kurir, sub_total: sub_total, provinsi: provinsi, kabupaten: kabupaten, kecamatan: kecamatan, nama_penerima: nama_penerima, alamat_lengkap: alamat_lengkap, catatan: catatan, no_telp: no_telp, transactionToken: transactionToken })
    } catch (error) {
        console.log(error)
        return res.status(400).json({message: "Kesalahan server database (update konfirmasi)"})
    }

    return res.status(200).json({message: "Konfirmasi berhasil", transaksi})
}

const package = async (req, res) => {
    const {id_transaksi} = req.body
    const id_user = req.id
    let transaksi
    try {
        transaksi = await Transaksi.findById(id_transaksi)
    } catch (error) {
        return res.status(400).json({message: "Kesalahan server database (mencari transaksi)"})
    }

    if(!transaksi) {
        return res.status(404).json({message: "Transaksi tidak ditemukan"})
    }

    if(transaksi.id_seller !== id_user) {
        return res.status(400).json({message: "Anda tidak mempunyai akses untuk transaksi ini"})
    }

    if(transaksi.status !== "payed") {
        return res.status(400).json({message: "Maaf anda tidak bisa menkonfirmasi saat ini"})
    }

    try {
        transaksi = await Transaksi.findByIdAndUpdate(id_transaksi, {status: "packaging"})
    } catch (error) {
        return res.status(400).json({message: "Kesalahan server database (menupdate transaksi)"})
    }
    return res.status(200).json({message: "Berhasil menkonfirmasi, silahkan segera kirim paketnya"})
}

const inputResi = async (req, res) => {
    const {id_transaksi, resi} = req.body
    const id_user = req.id
    let transaksi
    try {
        transaksi = await Transaksi.findById(id_transaksi)
    } catch (error) {
        return res.status(400).json({message: "Kesalahan server database (mencari transaksi)"})
    }

    if(!transaksi) {
        return res.status(404).json({message: "Transaksi tidak ditemukan"})
    }

    if(transaksi.id_seller !== id_user) {
        return res.status(400).json({message: "Anda tidak mempunyai akses untuk transaksi ini"})
    }

    if(transaksi.status !== "packaging") {
        return res.status(400).json({message: "Maaf anda tidak bisa menkonfirmasi saat ini"})
    }

    try {
        transaksi = await Transaksi.findByIdAndUpdate(id_transaksi, {status: "onshipping", resi: resi})
    } catch (error) {
        return res.status(400).json({message: "Kesalahan server database (menupdate transaksi)"})
    }
    
    return res.status(200).json({message: "Berhasil memasukkan resi"})
}

const terimaPesanan = async (req, res) => {
    const {id_transaksi} = req.body
    const id_user = req.id
    let transaksi
    let paymentAccount
    try {
        transaksi = await Transaksi.findById(id_transaksi)
    } catch (error) {
        return res.status(400).json({message: "Kesalahan server database (mencari transaksi)"})
    }

    if(!transaksi) {
        return res.status(404).json({message: "Transaksi tidak ditemukan"})
    }

    if(transaksi.id_winner !== id_user) {
        return res.status(400).json({message: "Anda tidak mempunyai akses untuk transaksi ini"})
    }

    if(transaksi.status !== "onshipping") {
        return res.status(400).json({message: "Maaf anda tidak bisa menkonfirmasi saat ini"})
    }

    try {
        paymentAccount = await PaymentAccount.findOne({id_user: id_user})
    } catch (error) {
        return res.status(400).json({message: "Kesalahan server database (gagal mencari payment account)"})
    }

    if(!paymentAccount) {
        return res.status(400).json({message: "Payment account tidak ditemukan"})
    }

    try {
        transaksi = await Transaksi.findByIdAndUpdate(id_transaksi, {status: "delivered"})
    } catch (error) {
        return res.status(400).json({message: "Kesalahan server database (menupdate transaksi)"})
    }

    let confirmSaldo
    if(paymentAccount) {
        confirmSaldo = paymentAccount.saldo + transaksi.jaminan
        try {
            paymentAccount = await PaymentAccount.findOneAndUpdate({id_user: id_user, "usage.id_lelang": transaksi.id_lelang}, {saldo: confirmSaldo, $set: {"usage.$.type": "return"}})
        } catch {
            return res.status(400).json({message: "Kesalahan server database (gagal me return payment acount)"})
        }
    }

    return res.status(200).json({message: "Pesanan anda telah anda terima dan pembayaran akan diserahkan ke penjual"})
}

const transaksiSelesai = async (req, res) => {
    const {id_transaksi} = req.body
    const id_user = req.id
    let transaksi
    let paymentAccount
    try {
        transaksi = await Transaksi.findById(id_transaksi)
    } catch (error) {
        return res.status(400).json({message: "Kesalahan server database (mencari transaksi)"})
    }

    if(!transaksi) {
        return res.status(404).json({message: "Transaksi tidak ditemukan"})
    }

    if(transaksi.id_seller !== id_user) {
        return res.status(400).json({message: "Anda tidak mempunyai akses untuk transaksi ini"})
    }

    if(transaksi.status !== "delivered") {
        return res.status(400).json({message: "Maaf anda tidak bisa menkonfirmasi saat ini"})
    }

    try {
        paymentAccount = await PaymentAccount.findOne({id_user: id_user})
    } catch (error) {
        return res.status(400).json({message: "Kesalahan server database (gagal mencari payment account)"})
    }

    if(!paymentAccount) {
        return res.status(400).json({message: "Payment account tidak ditemukan"})
    }

    try {
        transaksi = await Transaksi.findByIdAndUpdate(id_transaksi, {status: "done"})
    } catch (error) {
        return res.status(400).json({message: "Kesalahan server database (menupdate transaksi)"})
    }

    let confirmSaldo
    if(paymentAccount) {
        confirmSaldo = parseInt(paymentAccount.saldo) + parseInt(transaksi.jaminan) + parseInt(transaksi.sub_total)
        try {
            paymentAccount = await PaymentAccount.findOneAndUpdate({id_user: id_user}, {saldo: confirmSaldo})
        } catch {
            return res.status(400).json({message: "Kesalahan server database (gagal me return payment acount)"})
        }
    }
    return res.status(200).json({message: "Transaksi telah selesai dan uang telah dikirim ke saldo anda"})
}

const cancelTransaksi = async (req, res) => {
    const {id_transaksi} = req.body
    const id_user = req.id
    let transaksi
    console.log('step1')
    try {
        transaksi = await Transaksi.findById(id_transaksi)
    } catch (error) {
        return res.status(400).json({message: "Kesalahan server database (mencari transaksi)"})
    }

    if(!transaksi) {
        return res.status(404).json({message: "Transaksi tidak ditemukan"})
    }

    if(transaksi.id_winner !== id_user && transaksi.id_seller !== id_user) {
        return res.status(400).json({message: "Anda tidak mempunyai akses untuk transaksi ini"})
    }

    let paymentTarget
    let paymentCancel
    let addtionalSaldo
    let lelang
    try {
        lelang = await Lelang.findById(transaksi.id_lelang)
    } catch (error) {
        return res.status(400).json({message: "Kesalahan server database (mencari data lelang)"})
    }

    if(!lelang) {
        return res.status(404).json({message: "Data lelang tidak ditemukan"})
    }
    console.log('step2')

    if(transaksi.id_seller === id_user) {
        if(transaksi.status === "canceled" || transaksi.status === "onshipping" || transaksi.status === "delivered" || transaksi.status === "done") {
            return res.status(400).json({message: "Saat ini transaksi tidak bisa dibatalkan"})
        }
        console.log('step2.1')
        try {
            paymentTarget = await PaymentAccount.findOne({id_user: transaksi.id_winner})
        } catch (error) {
            return res.status(400).json({message: "Kesalahan server database (mencari payment account)"})
        }

        if(!paymentTarget) {
            return res.status(404).json({message: "Payment account tidak ditemukan"})
        }

        try {
            paymentCancel = await PaymentAccount.findOne({id_user: id_user})
        } catch (error) {
            return res.status(400).json({message: "Kesalahan server database (mencari payment account)"})
        }
        console.log('step2.2')

        if(!paymentCancel) {
            return res.status(404).json({message: "Payment account tidak ditemukan"})
        }

        try {
            paymentCancel = await PaymentAccount.findOneAndUpdate({id_user: id_user}, { $pull: { usage: { id_lelang: transaksi.id_lelang } } }, { new: true })
        } catch (error) {
            console.log(error)
        }
        
        console.log('step2.3')

        // kemungkinan error
        if(transaksi.status === "payed" || transaksi.status === "packaging") {
            addtionalSaldo = transaksi.jaminan + transaksi.sub_total + paymentTarget.saldo
        } else {
            addtionalSaldo = transaksi.jaminan + paymentTarget.saldo
        }

        let cancelSaldo

        if(lelang.sell_limit){
            console.log('step2.4')
            if(lelang.sell_limit_price > transaksi.final_price){
                cancelSaldo = paymentCancel.saldo + transaksi.jaminan
                try {
                    paymentCancel = await PaymentAccount.findOneAndUpdate({id_user: id_user}, {saldo: cancelSaldo, $push: { usage: { type: "return", id_lelang: transaksi.id_lelang, amount: transaksi.jaminan } } })
                } catch (error) {
                    return new Error(error)
                }
            } else {
                cancelSaldo = paymentCancel.saldo
                try {
                    paymentCancel = await PaymentAccount.findOneAndUpdate({id_user: id_user}, { $push: { usage: { type: "denda", id_lelang: transaksi.id_lelang, amount: transaksi.jaminan } } })
                } catch (error) {
                    return new Error(error)
                }
            }
        } else {
            console.log('step2.5')
            cancelSaldo = paymentCancel.saldo
            try {
                paymentCancel = await PaymentAccount.findOneAndUpdate({id_user: id_user}, { $push: { usage: { type: "denda", id_lelang: transaksi.id_lelang, amount: transaksi.jaminan } } })
            } catch (error) {
                return new Error(error)
            }
        }

        console.log('step2.6')
        try {
            paymentTarget = await PaymentAccount.findOneAndUpdate({id_user: transaksi.id_seller}, { $pull: { usage: { id_lelang: transaksi.id_lelang } } }, { new: true })
        } catch (error) {
            return new Error(error)
        }

        if(paymentTarget){
            try {
                paymentTarget = await PaymentAccount.findOneAndUpdate({id_user: transaksi.id_winner}, {saldo: addtionalSaldo, $push: { usage: { type: "return", id_lelang: transaksi.id_lelang, amount: transaksi.jaminan } }})
            } catch (error) {
                return new Error(error)
            }
        }


    } else {
        console.log('step2.7')
        if(transaksi.status === "canceled" || transaksi.status === "packaging" || transaksi.status === "onshipping" || transaksi.status === "delivered" || transaksi.status === "done") {
            return res.status(400).json({message: "Saat ini transaksi tidak bisa dibatalkan"})
        }

        try {
            paymentTarget = await PaymentAccount.findOne({id_user: transaksi.id_seller})
        } catch (error) {
            return res.status(400).json({message: "Kesalahan server database (mencari payment account)"})
        }

        if(!paymentTarget) {
            return res.status(404).json({message: "Payment account tidak ditemukan"})
        }

        try {
            paymentCancel = await PaymentAccount.findOne({id_user: id_user})
        } catch (error) {
            return res.status(400).json({message: "Kesalahan server database (mencari payment account)"})
        }

        if(!paymentCancel) {
            return res.status(404).json({message: "Payment account tidak ditemukan"})
        }

        try {
            paymentCancel = await PaymentAccount.findOneAndUpdate({id_user: id_user}, { $pull: { usage: { id_lelang: transaksi.id_lelang } } }, { new: true })
        } catch (error) {
            return new Error(error)
        }
        console.log('step2.8')

        let cancelSaldo

        if(lelang.sell_limit){
            if(lelang.sell_limit_price > transaksi.final_price){
                cancelSaldo = paymentCancel.saldo + transaksi.jaminan
                try {
                    paymentCancel = await PaymentAccount.findOneAndUpdate({id_user: id_user}, {saldo: cancelSaldo, $push: { usage: { type: "return", id_lelang: transaksi.id_lelang, amount: transaksi.jaminan } } })
                } catch (error) {
                    return new Error(error)
                }
            } else {
                cancelSaldo = paymentCancel.saldo
                try {
                    paymentCancel = await PaymentAccount.findOneAndUpdate({id_user: id_user}, { $push: { usage: { type: "denda", id_lelang: transaksi.id_lelang, amount: transaksi.jaminan } } })
                } catch (error) {
                    return new Error(error)
                }
            }
        } else {
            cancelSaldo = paymentCancel.saldo
            try {
                paymentCancel = await PaymentAccount.findOneAndUpdate({id_user: id_user}, { $push: { usage: { type: "denda", id_lelang: transaksi.id_lelang, amount: transaksi.jaminan } } })
            } catch (error) {
                return new Error(error)
            }
        }

        addtionalSaldo = paymentTarget.saldo + transaksi.jaminan

        try {
            paymentTarget = await PaymentAccount.findOneAndUpdate({id_user: transaksi.id_seller}, { $pull: { usage: { id_lelang: transaksi.id_lelang } } }, { new: true })
        } catch (error) {
            return new Error(error)
        }

        if(paymentTarget){
            try {
                paymentTarget = await PaymentAccount.findOneAndUpdate({id_user: transaksi.id_seller}, {saldo: addtionalSaldo, $push: { usage: { type: "return", id_lelang: transaksi.id_lelang, amount: transaksi.jaminan } }})
            } catch (error) {
                return new Error(error)
            }
        }
    }
    console.log('step3')
    
    try {
        transaksi = await Transaksi.findByIdAndUpdate(id_transaksi, {status: "canceled", canceled_by: id_user })
    } catch (error) {
        return res.status(400).json({message: "Kesalahan server database (update cancel)"})
    }

    return res.status(200).json({message: "Berhasil membatalkan transaksi"})
}

const getTransaksiSeller = async (req, res) => {
    const id_user = req.id
    let allTransaksi
    try {
        allTransaksi = await Transaksi.find({id_seller: id_user})
    } catch {
        return res.status(400).json({message: "Kesalahan server database (gagal mengambil data transaksi)"})
    }

    if(!allTransaksi) {
        return res.status(400).json({message: "Tidak ada data transaksi"})
    }

    return res.status(200).json({message: "Data transaksi ditemukan", allTransaksi})
}

const getTransaksiBuyer = async (req, res) => {
    const id_user = req.id
    let allTransaksi
    try {
        allTransaksi = await Transaksi.find({id_winner: id_user})
    } catch {
        return res.status(400).json({message: "Kesalahan server database (gagal mengambil data transaksi)"})
    }

    if(!allTransaksi) {
        return res.status(400).json({message: "Tidak ada data transaksi"})
    }

    return res.status(200).json({message: "Data transaksi ditemukan", allTransaksi})
}

// private
exports.createTransaksi = createTransaksi

// public
exports.confirmTransaksi = confirmTransaksi
exports.cancelTransaksi = cancelTransaksi
exports.package = package
exports.inputResi = inputResi
exports.terimaPesanan = terimaPesanan
exports.transaksiSelesai = transaksiSelesai
exports.getTransaksiSeller = getTransaksiSeller
exports.getTransaksiBuyer = getTransaksiBuyer