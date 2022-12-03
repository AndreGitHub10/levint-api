require('dotenv').config()
const express = require('express')
const Seller = require('../models/seller.model')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const register = async (req, res, next) => {
    const { nama_toko, no_telp, provinsi, kabupaten, kecamatan, alamat_lengkap } = req.body

    if (checkAvailable(req) === false) {
        return res.status(400).json({message: "Nama toko telah digunakan, silahkan menggunakan nama lain"})
    }

    let existingSeller;
    // Cek apakah user telah memiliki akun toko
    try {
        existingSeller = await Seller.findOne({
            id_user: req.id
        })
    } catch (err) {
        console.log(err)
    }

    if (existingSeller) {
        return res.status(401).json({message: `Anda telah memiliki toko dengan nama ${existingSeller.nama_toko}`})
    }
    // Cek apakah nomor telehone sudah terdaftar
    try {
        existingSeller = await Seller.findOne({
            no_telp: no_telp
        })
    } catch (err) {
        console.log(err)
    }

    if (existingSeller) {
        return res.status(401).json({message: 'Nomor Telephone sudah digunakan'})
    }

    const seller = new Seller({
        nama_toko, no_telp, id_user: req.id,
        alamat: [{
            provinsi,kabupaten,alamat_lengkap
        }],
        createdAt: Date.now()
    })

    try {
        await seller.save()
    } catch (err) {
        console.log(err)
        return res.status(400).json({message: 'Pastikan data terisi semua'})
    }
    return res.status(201).json({message: "Regestrasi data seller berhasil", seller})
}

const getSeller = async (req, res, next) => {
    const id = req.id

    let seller;
    try {
        seller = await Seller.findOne({
            id_user: id
        })
    } catch (err) {
        console.log(err)
    }

    if (!seller) {
        return res.status(404).json({message: "Seller data TIDAK ditemukan, silahkan register terlebih dahulu"})
    }
    return res.status(200).json({message: "Seller data ditemukan", seller:seller})
}

// const verifyToken = (req, res, next) => {
//     const cookies = req.headers.cookie
//     if (!cookies) {
//         console.log(cookies)
//         return res.status(401).json({message: "Sebelum masuk akun seller, silahkan login akun Levint terlebih dahulu"})
//     }
//     const token = cookies.split("=")[1]
//     console.log(token);
//     if (!token) {
//         return res.status(404).json({message:"Token tidak ada"})
//     }
//     jwt.verify(String(token), process.env.ACCESS_TOKEN_SECRET, (err, user) => {
//         if (err) {
//             return res.status(400).json({message: "Invalid Token!"})
//         } else {    
//             console.log(user.id)
//             req.id = user.id
//             next()
//         }
//     })
// }

const checkAvailable = async (req, res, next) => {
    const {nama_toko} = req.body
    console.log(nama_toko)

    let existingSeller;
    try {
        existingSeller = await Seller.findOne({
            nama_toko: nama_toko
        })
    } catch (err) {
        console.log(err);
    }

    if (existingSeller != null) {
        return false
    } else {
        return true
    }
}

const getSellerPublic = async ( req, res ) => {
    const id_seller = req.query.sellerId
    console.log(id_seller)
    let seller;
    try {
        seller = await Seller.findOne({
            _id: id_seller
        })
    } catch (err) {
        console.log(err)
    }

    if (!seller) {
        return res.status(404).json({message: "Seller data TIDAK ditemukan, silahkan register terlebih dahulu"})
    }
    return res.status(200).json({message: "Seller data ditemukan", seller:seller})
}


exports.register = register
// exports.verifyToken = verifyToken
exports.checkAvailable = checkAvailable
exports.getSeller = getSeller
exports.getSellerPublic = getSellerPublic