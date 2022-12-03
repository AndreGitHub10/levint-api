const express = require('express')
const Lelang = require('../models/lelang.model')
const Item = require('../models/item.model')
const Seller = require('../models/seller.model')
const PaymentAccount = require('../models/payment.account.model')
const Transaksi = require('../models/transaksi.model')
const { isObjectIdOrHexString } = require('mongoose')
const { json } = require('express')
const moment = require('moment')
const { validationResult } = require('express-validator')
const { createTransaksi } = require('./transaksi-controller')

const createLelang = async (req, res, next) => {
    const { id_item, harga_dasar, tanggal_mulai, bid_increase, auto_sell_price, auto_sell, sell_limit, sell_limit_price, open_bidding, estLelang_hari, estLelang_jam } = req.body
    // check input
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    }
    if (!open_bidding) {
        return res.status(422).json({ message: "Kesalahan API" })
    }
    if (harga_dasar <= 0) {
        return res.status(422).json({ message: "Harga Dasar tidak diperbolehkan" })
    }
    const bidIncrement = [1000, 5000, 10000, 50000, 100000, 500000, 1000000]
    if (!bidIncrement.includes(bid_increase)) {
        return res.status(422).json({ message: "Nilai Bid Increase tidak diperbolehkan" })
    }
    if (id_item == '') {
        return res.status(422).json({ message: "Anda belum memilih item yang akan di lelang" })
    }
    const tgl_mulai_second = moment(tanggal_mulai).set('seconds', 0)
    const tgl_mulai_minute = moment(tgl_mulai_second).set('minutes', 0)
    const tgl_mulai = moment(tgl_mulai_minute).set('hours', 11)
    // if(tgl_mulai <= moment(new Date()).add(1, 'hours')){
    //     return res.status(422).json({message: "Jadwal dimulai lelang tidak sesuai, Jadwal yang anda inputkan harus lebih minimal 1 jam dari waktu saat ini"})
    // }
    console.log(`id : ${id_item}`)
    const tgl_akhir_hari = moment(tgl_mulai).add(estLelang_hari, 'days')
    const tgl_akhir = moment(tgl_akhir_hari).add(estLelang_jam, 'hours')
    // if(typeof(harga_dasar) !== 'number') {
    //     return res.status(400).json({message: "field harga awal tidak boleh kosong dan harus type number"})
    // }
    // if(typeof(tanggal_mulai) !== 'date') {
    //     return res.status(400).json({message: "field tanggal mulai tidak boleh kosong dan harus type date"})
    // }
    // if(typeof(tanggal_akhir) !== 'date') {
    //     return res.status(400).json({message: "field tanggal akhir tidak boleh kosong dan harus type date"})
    // }
    let item
    try {
        item = await Item.findById(id_item)
    } catch (err) {
        return res.status(401).json({ message: err.message })
    }

    if (!item) {
        return res.status(404).json({ message: "Data item tidak ditemukan" })
    }

    const seller = await Seller.findOne({ id_user: req.id })
    if (!seller) {
        return res.status(400).json({ message: "Data gagal disimpan, anda belum memiliki akun toko aktif" })
    }
    console.log(`seller: ${seller._id} , item: ${item.id_seller}`)

    if (seller._id != item.id_seller) {
        return res.status(400).json({ message: "Data gagal disimpan, anda tidak mempunyai akses untuk item ini" })
    }

    let lelang
    try {
        lelang = await Lelang.findOne({ id_item: id_item })
    } catch (err) {
        return res.status(404).json(err.message)
    }

    if (lelang) {
        return res.status(404).json({ message: "Anda sudah membuat jadwal lelang untuk barang ini" })
    }

    lelang = new Lelang({
        id_seller: req.id,
        id_item,
        harga_dasar,
        tanggal_mulai: tgl_mulai,
        tanggal_akhir: tgl_akhir,
        open_bidding,
        status: "scheduled",
        sell_limit_price,
        sell_limit,
        auto_sell_price,
        auto_sell,
        bid_increase,
        bid: []
    })

    try {
        await lelang.save()
    } catch (err) {
        console.log(err)
        return res.status(400).json({ message: 'Pastikan data terisi semua', error: err.message })
    }

    try {
        await Item.findByIdAndUpdate(id_item, {status: "onLelang"})
    } catch (error) {
        console.log(error)
    }

    return res.status(201).json({ message: "Data tersimpan", lelang })

    // id_seller, id_item,harga_dasar,tanggal_mulai,tanggal_mulai,bid
}

const createClosedLelang = async (req, res) => {
    const { id_item, harga_dasar, tanggal_mulai, bid_increase, open_bidding, estLelang_hari, estLelang_jam } = req.body
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    }
    if (open_bidding) {
        return res.status(422).json({ message: "Kesalahan API" })
    }
    if (harga_dasar <= 0) {
        return res.status(422).json({ message: "Harga Dasar tidak diperbolehkan" })
    }
    const bidIncrement = [1000, 5000, 10000, 50000, 100000, 500000, 1000000]
    if (!bidIncrement.includes(bid_increase)) {
        return res.status(422).json({ message: "Nilai Bid Increase tidak diperbolehkan" })
    }
    if (id_item == '') {
        return res.status(422).json({ message: "Anda belum memilih item yang akan di lelang" })
    }
    const tgl_mulai_second = moment(tanggal_mulai).set('seconds', 0)
    const tgl_mulai_minute = moment(tgl_mulai_second).set('minutes', 0)
    const tgl_mulai = moment(tgl_mulai_minute).set('hours', 11)
    // if(tgl_mulai <= moment(new Date()).add(1, 'hours')){
    //     return res.status(422).json({message: "Jadwal dimulai lelang tidak sesuai, Jadwal yang anda inputkan harus lebih minimal 1 jam dari waktu saat ini"})
    // }
    console.log(`id : ${id_item}`)
    const tgl_akhir_hari = moment(tgl_mulai).add(estLelang_hari, 'days')
    const tgl_akhir = moment(tgl_akhir_hari).add(estLelang_jam, 'hours')
    // if(typeof(harga_dasar) !== 'number') {
    //     return res.status(400).json({message: "field harga awal tidak boleh kosong dan harus type number"})
    // }
    // if(typeof(tanggal_mulai) !== 'date') {
    //     return res.status(400).json({message: "field tanggal mulai tidak boleh kosong dan harus type date"})
    // }
    // if(typeof(tanggal_akhir) !== 'date') {
    //     return res.status(400).json({message: "field tanggal akhir tidak boleh kosong dan harus type date"})
    // }
    let item
    try {
        item = await Item.findById(id_item)
    } catch (err) {
        return res.status(401).json({ message: err.message })
    }

    if (!item) {
        return res.status(404).json({ message: "Data item tidak ditemukan" })
    }

    const seller = await Seller.findOne({ id_user: req.id })
    if (!seller) {
        return res.status(400).json({ message: "Data gagal disimpan, anda belum memiliki akun toko aktif" })
    }
    console.log(`seller: ${seller._id} , item: ${item.id_seller}`)

    if (seller._id != item.id_seller) {
        return res.status(400).json({ message: "Data gagal disimpan, anda tidak mempunyai akses untuk item ini" })
    }

    let lelang
    try {
        lelang = await Lelang.findOne({ id_item: id_item })
    } catch (err) {
        return res.status(404).json(err.message)
    }

    if (lelang) {
        return res.status(404).json({ message: "Anda sudah membuat jadwal lelang untuk barang ini" })
    }

    lelang = new Lelang({
        id_seller: req.id,
        id_item,
        harga_dasar,
        tanggal_mulai: tgl_mulai,
        tanggal_akhir: tgl_akhir,
        open_bidding,
        status: "scheduled",
        bid_increase,
        bid: []
    })

    try {
        await lelang.save()
    } catch (err) {
        console.log(err)
        return res.status(400).json({ message: 'Pastikan data terisi semua', error: err.message })
    }

    try {
        await Item.findByIdAndUpdate(id_item, {status: "onLelang"})
    } catch (error) {
        console.log(error)
    }

    return res.status(201).json({ message: "Data tersimpan", lelang })
}

const updateLelang = async (req, res, next) => {
    const { id_lelang, id_item, harga_dasar, tanggal_mulai, tanggal_akhir, bid_increase } = req.body
    const tgl_mulai = new Date(tanggal_mulai)
    const tgl_akhir = new Date(tanggal_akhir)
    // if(typeof(harga_dasar) !== 'number') {
    //     return res.status(400).json({message: "field harga awal tidak boleh kosong dan harus type number"})
    // }
    // if(typeof(tanggal_mulai) !== 'date') {
    //     return res.status(400).json({message: "field tanggal mulai tidak boleh kosong dan harus type date"})
    // }
    // if(typeof(tanggal_akhir) !== 'date') {
    //     return res.status(400).json({message: "field tanggal akhir tidak boleh kosong dan harus type date"})
    // }
    let item
    try {
        item = await Item.findById(id_item)
    } catch (err) {
        return res.status(404).json(err.message)
    }

    if (!item) {
        return res.status(404).json({ message: "Data item tidak ditemukan" })
    }

    // if(item.status != 'storedOnly') {
    //     return res.status(400).json({message: "Data item tidak bisa diedit saat pelelangan berlangsung"})
    // }

    let lelang
    try {
        lelang = await Lelang.findById(id_lelang)
    } catch (err) {
        return res.status(404).json(err.message)
    }

    if (!lelang) {
        return res.status(404).json({ message: "Data lelang tidak ditemukan" })
    }

    let updateLelang
    try {
        updateLelang = await Lelang.findByIdAndUpdate(id_lelang, {
            harga_dasar,
            tanggal_mulai: tgl_mulai,
            tanggal_akhir: tgl_akhir,
            bid_increase
        }, {
            returnOriginal: false
        })
    }
    catch (err) {
        console.log(err)
        return res.status(400).json({ message: 'Pastikan data terisi semua', error: err.message })
    }

    return res.status(201).json({ message: "Data tersimpan", updateLelang })

}

const cancelLelang = async (req, res) => {
    const {id_lelang} = req.body

    let lelang
    try {
        lelang = await Lelang.findById(id_lelang)
    } catch (err) {
        return res.status(400).json({ message: "Terjadi masalah server dan database", error: err.message })
    }

    if (!lelang) {
        return res.status(400).json({ message: "Data lelang tidak ditemukan" })
    }

    if (lelang.status !== "scheduled") {
        return res.status(400).json({ message: "Lelang tidak sedang berjalan" })
    }

    try {
        lelang = await Lelang.findByIdAndUpdate(id_lelang, {status: "canceled"})
    } catch (err) {
        return res.status(400).json({ message: "Terjadi masalah server dan database", error: err.message })
    }
}

const deleteLelang = async (req, res, next) => {
    const { id_lelang } = req.body
    if (!(isObjectIdOrHexString(id_lelang))) {
        return res.status(400).json({ message: "Invalid id_lelang" })
    }
    let lelang
    try {
        lelang = await Lelang.findById(id_lelang)
    } catch (err) {
        return res.status(400).json({ message: "Terjadi masalah server dan database", error: err.message })
    }

    if (!lelang) {
        return res.status(400).json({ message: "Data lelang tidak ditemukan" })
    }

    if (lelang.tanggal_mulai < Date.now() && lelang.tanggal_akhir > Date.now()) {
        return res.status(400).json({ message: "Data lelang tidak bisa di hapus, karena sudah melewati jadwal mulai" })
    }

    if (lelang.tanggal_akhir < Date.now()) {
        return res.status(400).json({ message: "Data lelang tidak bisa di hapus" })
    }
    // delete
    try {
        await Lelang.findByIdAndRemove(id_lelang)
    } catch (err) {
        return res.status(400).json({ message: "Terjadi masalah server dan database", error: err.message })
    }
    return res.status(202).json({ message: "Data lelang berhasil dihapus" })
}

const createBid = async (req, res, next) => {
    // console.log(`create bid ${id_user} ${id_lelang} ${userBid}`)
    const { id_lelang, userBid } = req.body
    const id_user = req.id
    let paymentAccount
    try {
        paymentAccount = await PaymentAccount.findOne({ id_user: id_user })
    } catch (err) {
        return res.status(400).json(err.message)
    }
    let found = false
    let newSaldo = 0
    if (!paymentAccount) {
        return res.status(404).json({ message: "Anda belum memiliki saldo, silahkan isi ulang saldo anda" })
    } else {
        console.log(paymentAccount)
        for (let usage of paymentAccount.usage) {
            if (usage.id_lelang === id_lelang) {
                found = true
            }
        }
        if (!found) {
            if (paymentAccount.saldo < 50000) {
                return res.status(404).json({ message: "Saldo anda tidak mencukupi, silahkan isi ulang saldo anda" })
            } else {
                newSaldo = paymentAccount.saldo - 50000
            }
        }
    }
    let lelang
    try {
        lelang = await Lelang.findById(id_lelang)
    } catch (err) {
        return res.status(400).json(err.message)
    }
    if (!lelang) {
        return res.status(404).json({ message: "sesi lelang tidak ditemukan" })
    }
    if (moment(lelang.tanggal_mulai) > moment(new Date())) {
        return res.status(404).json({message: "sesi lelang belum dimulai"})
    }
    if (lelang.tanggal_akhir < Date.now()) {
        return res.status(404).json({ message: "sesi lelang sudah berakhir" })
    }
    if (id_user == lelang.id_seller) {
        return res.status(400).json({message: "maaf anda tidak bisa memasukkan bid untuk barang anda sendiri"})
    }
    if (lelang.harga_dasar > userBid) {
        return res.status(404).json({ message: "Nilai bid yang anda masukkan lebih kecil dari harga dasar" })
    }

    if (lelang.status !== "scheduled") {
        return res.status(400).json({ message: "Lelang tidak berlangsung" })
    }
    let autoSell
    if (lelang.auto_sell && (lelang.auto_sell_price <= userBid)) {
        autoSell = lelang.auto_sell_price
        if (lelang.bid.length > 0) {
            let highBid = 0
            for (let bid of lelang.bid) {
                if (bid.price > highBid) {
                    highBid = bid.price
                }
            }
    
            if (userBid <= highBid) {
                return res.status(400).json({ message: "bid anda lebih kecil dari bid tertinggi saat ini, data tidak bisa diinput" })
            }
    
            for (let bid of lelang.bid) {
                if (bid.id_bidder == id_user) {
                    try {
                        await Lelang.findByIdAndUpdate(id_lelang, { $pull: { bid: { id_bidder: id_user } } }, { new: true })
                    } catch (error) {
                        return new Error(error)
                    }
                }
            }
            try {
                lelang = await Lelang.findByIdAndUpdate(id_lelang, { status: "onTransaction", $push: { bid: { id_bidder: id_user, price: autoSell } } })
            } catch (error) {
                return new Error(error)
            }
            if(lelang) {
                createTransaksi(lelang.id_seller, lelang.id_item, id_user, autoSell, lelang._id)
                returnJaminanToLoser(lelang, id_user)
                try{
                    await Item.updateOne({_id: lelang.id_item}, {status: "endLelang"})
                } catch (error) {
                    console.log(error)
                }
            }
            // try {
    
            // } catch (err) {
            //     return res.status(400).json(err.message)
            // }
        } else {
            try {
                lelang = await Lelang.findByIdAndUpdate(id_lelang, { status: "onTransaction", $push: { bid: { id_bidder: id_user, price: autoSell } } })
            } catch (err) {
                console.log(`error : ${err.message}`)
            }
            if(lelang) {
                createTransaksi(lelang.id_seller, lelang.id_item, id_user, autoSell, lelang._id)
            }
        }
    } else {
        if (lelang.bid.length != 0) {
            let highBid = 0
            for (let bid of lelang.bid) {
                if (bid.price > highBid) {
                    highBid = bid.price
                }
            }
    
            if (userBid <= highBid) {
                return res.status(400).json({ message: "bid anda lebih kecil dari bid tertinggi saat ini, data tidak bisa diinput" })
            }
    
            for (let bid of lelang.bid) {
                if (bid.id_bidder == id_user) {
                    try {
                        await Lelang.findByIdAndUpdate(id_lelang, { $pull: { bid: { id_bidder: id_user } } }, { new: true })
                    } catch (error) {
                        console.log(error)
                    }
                }
            }
            try {
                lelang = await Lelang.findByIdAndUpdate(id_lelang, { $push: { bid: { id_bidder: id_user, price: userBid } } })
            } catch (error) {
                console.log(error)
            }
            // try {
    
            // } catch (err) {
            //     return res.status(400).json(err.message)
            // }
        } else {
            try {
                lelang = await Lelang.findByIdAndUpdate(id_lelang, { $push: { bid: { id_bidder: id_user, price: userBid } } })
            } catch (err) {
                console.log(`error : ${err.message}`)
            }
        }
    }
    
    if (!found) {
        try {
            paymentAccount = await PaymentAccount.findOneAndUpdate({ id_user: id_user }, { saldo: newSaldo, $push: { usage: { type: "jaminan", id_lelang: id_lelang, amount: 50000 } } })
        } catch (err) {
            return res.status(400).json(err.message)
        }
    }

    // return lelang
    return res.status(202).json({ message: "Bid berhasil", userBid })
}

const createClosedBid = async (req, res, next) => {
    // console.log(`create bid ${id_user} ${id_lelang} ${userBid}`)
    const { id_lelang, userBid } = req.body
    const id_user = req.id
    let paymentAccount
    try {
        paymentAccount = await PaymentAccount.findOne({ id_user: id_user })
    } catch (err) {
        return res.status(400).json(err.message)
    }
    let found = false
    let newSaldo = 0
    if (!paymentAccount) {
        return res.status(404).json({ message: "Anda belum memiliki saldo, silahkan isi ulang saldo anda" })
    } else {
        // console.log(paymentAccount)
        for (let usage of paymentAccount.usage) {
            if (usage.id_lelang === id_lelang) {
                found = true
            }
        }
        if (!found) {
            if (paymentAccount.saldo < 50000) {
                return res.status(404).json({ message: "Saldo anda tidak mencukupi, silahkan isi ulang saldo anda" })
            } else {
                newSaldo = paymentAccount.saldo - 50000
            }
        }
    }
    let lelang
    try {
        lelang = await Lelang.findById(id_lelang)
    } catch (err) {
        return res.status(400).json(err.message)
    }
    if (!lelang) {
        return res.status(404).json({ message: "sesi lelang tidak ditemukan" })
    }
    if (moment(lelang.tanggal_mulai) > moment(new Date())) {
        return res.status(404).json({message: "sesi lelang belum dimulai"})
    }
    if (lelang.tanggal_akhir < Date.now()) {
        return res.status(404).json({ message: "sesi lelang sudah berakhir" })
    }
    if (id_user == lelang.id_seller) {
        return res.status(400).json({message: "maaf anda tidak bisa memasukkan bid untuk barang anda sendiri"})
    }
    if (lelang.status !== "scheduled") {
        return res.status(400).json({ message: "Lelang tidak berlangsung" })
    }

    if (lelang.harga_dasar > userBid) {
        return res.status(404).json({ message: "Nilai bid yang anda masukkan lebih kecil dari harga dasar" })
    }
    if(lelang.bid.length != 0) {

        for (let bid of lelang.bid) {
            if(bid.id_bidder == id_user){
                try { 
                    await Lelang.findByIdAndUpdate(id_lelang, {$pull:{bid: {id_bidder: id_user}}}, {new: true})
                } catch (error) {
                    console.log(error)
                }
            }
        }
        try {
            lelang = await Lelang.findByIdAndUpdate(id_lelang, {$push:{bid: {id_bidder: id_user, price: userBid}}})
        } catch (error) {
            console.log(error)
        }
        // try {
            
        // } catch (err) {
        //     return res.status(400).json(err.message)
        // }
    } else {
        try {
            lelang = await Lelang.findByIdAndUpdate(id_lelang, { $push: { bid: {id_bidder: id_user, price: userBid} } })
        } catch (err) {
            console.log(`error : ${err.message}`)
        }
    }

    // let autoSell
    // if (lelang.auto_sell && (lelang.auto_sell_price <= userBid)) {
    //     autoSell = lelang.auto_sell_price
    //     if (lelang.bid.length != 0) {
    //         for (let bid of lelang.bid) {
    //             if (bid.id_bidder == id_user) {
    //                 try {
    //                     await Lelang.findByIdAndUpdate(id_lelang, { $pull: { bid: { id_bidder: id_user } } }, { new: true })
    //                 } catch (error) {
    //                     return new Error(error)
    //                 }
    //             }
    //         }
    //         try {
    //             lelang = await Lelang.findByIdAndUpdate(id_lelang, { status: "onTransaction", $push: { bid: { id_bidder: id_user, price: autoSell } } })
    //         } catch (error) {
    //             return new Error(error)
    //         }
    //     } else {
    //         try {
    //             lelang = await Lelang.findByIdAndUpdate(id_lelang, { $push: { status: "onTransaction", bid: { id_bidder: id_user, price: userBid } } })
    //         } catch (err) {
    //             console.log(`error : ${err.message}`)
    //         }
    //     }
    // } else {
    //     if (lelang.bid.length != 0) {

    //         for (let bid of lelang.bid) {
    //             if (bid.id_bidder == id_user) {
    //                 try {
    //                     await Lelang.findByIdAndUpdate(id_lelang, { $pull: { bid: { id_bidder: id_user } } }, { new: true })
    //                 } catch (error) {
    //                     return new Error(error)
    //                 }
    //             }
    //         }
    //         try {
    //             lelang = await Lelang.findByIdAndUpdate(id_lelang, { $push: { bid: { id_bidder: id_user, price: userBid } } })
    //         } catch (error) {
    //             return new Error(error)
    //         }
    //     } else {
    //         try {
    //             lelang = await Lelang.findByIdAndUpdate(id_lelang, { $push: { bid: { id_bidder: id_user, price: userBid } } })
    //         } catch (err) {
    //             console.log(`error : ${err.message}`)
    //         }
    //     }
    // }
    if (!found) {
        try {
            paymentAccount = await PaymentAccount.findOneAndUpdate({ id_user: id_user }, { saldo: newSaldo, $push: { usage: { type: "jaminan", id_lelang: id_lelang, amount: 50000 } } })
        } catch (err) {
            return res.status(400).json(err.message)
        }
    }

    // return lelang
    return res.status(202).json({ message: "Bid berhasil", userBid })
}

const getLelang = async (req, res) => {
    const id_item = req.params.id_item
    let lelang
    try {
        lelang = await Lelang.findOne({ id_item: id_item })
    } catch (err) {
        console.log(err.message)
    }
    if (!lelang) {
        return res.status(404).json({ message: "Tidak ada jadwal lelang untuk item ini" })
    }
    if (!lelang.open_bidding) {
        const dataLelang = await Lelang.findOne({ id_item: id_item }).select('-bid')
        return res.status(200).json({ message: "Data lelang ditemukan", lelang: dataLelang })
    }
    return res.status(200).json({ message: "Data lelang ditemukan", lelang: lelang })
}

const getLelangs = async (req, res) => {
    let lelangs
    try {
        lelangs = await Lelang.find({ tanggal_mulai: { $lt: Date() }, tanggal_akhir: { $gte: Date() } })
    } catch (error) {
        return new Error(error)
    }
    return res.status(200).json({ message: "Data list lelang berhasil didapatkan", lelangs })
}

const deleteAll = async (req, res) => {
    let lelangs
    try {
        lelangs = await Lelang.deleteMany({ seller_id: req.id })
    } catch (error) {
        return new Error(error)
    }
    return res.status(200).json({ message: "Data list lelang berhasil dihapus", lelangs })
}

const getLelangRT = async (id_lelang) => {
    console.log(id_lelang)
    let lelang
    try {
        lelang = await Lelang.findById(id_lelang)
    } catch (error) {
        return new Error(error)
    }
    let bid = []

    if (lelang) {
        if (lelang.open_bidding) {
            if (lelang.bid) {
                if (Array.isArray(lelang.bid) && lelang.bid !== []) {
                    bid = lelang.bid
                    bid.sort((a, b) => { return b.price - a.price })
                    if (bid.length > 3) {
                        return { bid: bid.slice(0, 3), length: bid.length }
                    }
                }
            }
        } else {
            return { bid: bid, length: lelang.bid.length }
        }
    }
    return { bid: bid, length: bid.length }
}

const setWinner = async () => {
    let lelangSelesai
    try {
        lelangSelesai = await Lelang.find({ status: "scheduled", tanggal_akhir: { $lt: Date() } })
    } catch (error) {
        return new Error(error)
    }

    if (lelangSelesai) {
        for (let lelang of lelangSelesai) {
            try {
                await Lelang.findByIdAndUpdate(lelang._id, {status: "lelangEnd"})
            } catch (error) {
                console.log(error)
            }
            if(lelang.bid > 0) {
                if (Array.isArray(lelang.bid) && lelang.bid !== []) {
                    try {
                        await Lelang.findByIdAndUpdate(lelang._id, {status: "onTransaction"})
                    } catch (error) {
                        console.log(error)
                    }
                    bid = lelang.bid
                    bid.sort((a, b) => { return b.price - a.price })
                    createTransaksi(lelang.id_seller, lelang.id_item, bid[0].id_bidder, bid[0].price, lelang._id)
                }
            }
        }
    }
}

const getAktivitasBid = async (req, res) => {
    const id_user = req.id
    let paymentAccount
    let allAktivitas
    try {
        paymentAccount = await PaymentAccount.findOne({id_user: id_user})
    } catch (error) {
        return res.status(400).json({message: "Kesalahan server database (mencari payment account)"})
    }

    if(!paymentAccount) {
        return res.status(400).json({message: "Anda belum memiliki aktivitas"})
    }

    allAktivitas = await Promise.all(paymentAccount.usage.flatMap( async (usage) => { 
        let lelang
        try {
            lelang = await Lelang.findById(usage.id_lelang)
        } catch (error) {
            return []
        }

        if(!lelang) {
            return []
        }
        
        let item
        try {
            item = await Item.findById(lelang.id_item)
        } catch (err) {
            console.log(err)
        }
        let bid_price
        lelang.bid.map((bid) => {
            if(bid.id_bidder == id_user){
                bid_price = bid.price
            }
        })

        let sorted_bid = lelang.bid
        sorted_bid.sort((a, b) => { return b.price - a.price })
        let index_bidder = sorted_bid.findIndex(x => x.id_bidder == id_user) + 1
        if(!lelang.open_bidding) {
            return {
                jaminan:{status: usage.type, amount: usage.amount},
                id_lelang: lelang._id,
                item: item,
                bid_price: bid_price,
                peringkat: false,
                jumlah_bidder: false,
                high_bid: false,
                open_bid: false
            }
        } else {
            return {
                jaminan:{status: usage.type, amount: usage.amount},
                id_lelang: lelang._id,
                item: item,
                id_item: lelang.id_item,
                bid_price: bid_price,
                peringkat: index_bidder,
                jumlah_bidder: sorted_bid.length,
                high_bid: sorted_bid[0].price,
                open_bid: true
            }
        }
    }))

    console.log(allAktivitas)

    return res.status(200).json({message: "Aktivitas bid berhasil didapatkan", allAktivitas})
}

const returnJaminanToLoser = async (lelang, id_user) =>{
    lelang.bid.map( async (bid) => {
        if(bid.id_bidder !== id_user) {
            let loserPaymentAccount
            try {
                loserPaymentAccount = await PaymentAccount.findOneAndUpdate({id_user: bid.id_bidder, "usage.id_lelang": id_lelang}, {$set: {"usage.$.type": "return"}, $inc: {saldo: 50000}} )
            } catch(err){
                console.log(err)
            }
            // try {
                // await PaymentAccount.findOneAndUpdate({id_user: bid.id_bidder}, {$inc : { saldo: 50000 }, $push: {usage: {type: "return", id_lelang: id_lelang, amount: 50000}}})
            // } catch (err) {
                // console.log(err)
            // }
        }
    })
    return
}


exports.createLelang = createLelang
exports.createClosedLelang = createClosedLelang
exports.updateLelang = updateLelang
exports.deleLelang = deleteLelang
exports.createBid = createBid
exports.createClosedBid = createClosedBid
exports.getLelang = getLelang
exports.getLelangs = getLelangs
exports.deleteAll = deleteAll
exports.getLelangRT = getLelangRT
exports.setWinner = setWinner
exports.getAktivitasBid = getAktivitasBid