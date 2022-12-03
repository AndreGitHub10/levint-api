const express = require('express')
const { default: mongoose, isObjectIdOrHexString } = require('mongoose')
const Item = require('../models/item.model')
const Seller = require('../models/seller.model')
const Kategori = require('../models/kategori.model')

const createItem = async (req, res, next) => {
    console.log("Create Item")
    const { nama_item, deskripsi_item, kategori, jumlah_item, merek, item_berbahaya, panjang_cm, lebar_cm, tinggi_cm, berat, gambar, provinsi, kabupaten, kecamatan, beratPaket, ukuranPaket, kurirList, tahun } = req.body
    const seller = await Seller.findOne({id_user: req.id})
    if(!seller) {
        return res.status(400).json({message: "Data gagal disimpan, anda belum memiliki akun toko aktif"})
    }
    if (!(checkKategori(kategori))) {
        return res.status(400).json({message: "Data gagal disimpan, anda harus memilih kategori, min=1 max=5"})
    }
    let acceptedKategori = []
    let kat
    let acceptedKategoriIndex = 0
    for (let index = 0; index < (kategori.length); index++) {
        if(!(isObjectIdOrHexString(kategori[index].id))) {
            break
        }
        try {
            kat = await Kategori.findById(kategori[index].id)
            // console.log(kat);
        } catch (err) {
            console.log(err)
        }
        if (kat) {
        acceptedKategori[acceptedKategoriIndex] = {"id": kat._id}
        acceptedKategoriIndex++
        // console.log(acceptedKategori)
        }
    }

    if (acceptedKategori.length === 0) {
        return res.status(400).json({message: "Invalid kategori id"})
    }

    const item = new Item({
        id_seller: seller._id,
        nama_item,
        deskripsi_item,
        gambar,
        kategori: acceptedKategori,
        item_berbahaya,
        merek,
        panjang_cm,
        lebar_cm,
        tinggi_cm,
        berat,
        provinsi,
        kabupaten,
        kecamatan,
        ukuranPaket,
        beratPaket,
        kurirList,
        tahun,
        jumlah_item,
        status: "new",
        createdAt: Date.now(),
        updatedAt: Date.now()
    })

    try {
        await item.save()
    } catch (err) {
        console.log(err)
    }

    return res.status(202).json({message: "Item berhasil disimpan", item})

}

const updateItem = async (req, res, next) => {
    const { id_item, nama_item, deskripsi_item, kategori, merek } = req.body
    console.log(id_item)
    let item
    console.log(kategori)
    try {
        item = await Item.findById(id_item)
    } catch (err) {
        return res.status(404).json(err.message)
    }
    if (!item) {
        return res.status(404).json({message: "Data item tidak ditemukan"})
    }
    if (!(checkKategori(kategori))) {
        return res.status(400).json({message: "Data gagal disimpan, anda harus memilih minimal 1 kategori"})
    }
    let acceptedKategori = []
    let kat
    let acceptedKategoriIndex = 0
    for (let index = 0; index < (kategori.length); index++) {
        if(!(isObjectIdOrHexString(kategori[index].id))) {
            break
        }
        try {
            kat = await Kategori.findById(kategori[index].id)
            console.log(kat);
        } catch (err) {
            console.log(err)
        }
        if (kat) {
        acceptedKategori[acceptedKategoriIndex] = {"id": kat._id}
        acceptedKategoriIndex++
        // console.log(acceptedKategori)
        }
    }

    console.log(acceptedKategori)
    if (acceptedKategori.length === 0) {
        return res.status(400).json({message: "Invalid kategori id"})
    }
    let updateItem
    try {
        updateItem = await Item.findByIdAndUpdate(id_item, {nama_item: nama_item,deskripsi_item: deskripsi_item, updatedAt: Date.now(), kategori: acceptedKategori, merek}, {
            returnOriginal: false
        })
        console.log(updateItem.nama_item)
    } catch (err) {
        return res.status(400).json(err)
    }
    return res.status(202).json({message: "Data berhasil diupdate", item: updateItem})
}

const checkKategori = (kategori) => {
    if(typeof(kategori) !== 'object') {
        console.log("bukan objek");
        return false
    } else {
        console.log("objek")
    }
    if(!(kategori.length >= 1 && kategori.length <= 5)) {
        console.log("data Kosong")
        return false
    } else {
        console.log("data tidak kosong")
    }
    if(kategori[0].id === undefined || kategori[0].id === "" || kategori[0].id === '' || kategori[0].id === null) {
        console.log("format salah")
        return false
    } else {
        console.log("format benar")
    }
    return true;
}

const showItem = async (req, res) => {
    const id_item = req.query.itemId
    console.log(id_item)
    let item
    try {
        item = await Item.findById(id_item)
    } catch (err) {
        console.log(err)
        return res.status(404).json(err.message)
    }
    if(!item){
        return res.status(400).json({message: "Data item tidak ditemukan"})
    }
    let acceptedKategori = []
    for (let index = 0; index < item.kategori.length; index++) {
        const kat = await Kategori.findById(item.kategori[index].id)
        if (kat) {
            acceptedKategori[index] = item.kategori[index]
        }
    }
    item.kategori = acceptedKategori
    return res.status(200).json({message: "Data item ditemukan", item})
}

const deleteItem = async (req, res, next) => {
    const id_item = req.params.id
    console.log(id_item)
    let item
    try {
        item = await Item.findById(id_item)
    } catch (err) {
        console.log(err)
        return res.status(404).kson(err.message)
    }
    if (!item) {
        return res.status(400).json({message: "Data item tidak ditemukan"})
    }
    let seller
    try {
        seller = await Seller.findOne({id_user: req.id})
    } catch (err) {
        return res.status(404).json(err.message)
    }
    if (!seller) {
        return res.status(404).json({message: "Maaf anda tidak bisa melakukan ini, anda tidak memiliki akun seller"})
    }
    if (item.id_seller != seller._id) {
        return res.status(402).json({message: "Maaf anda tidak memiliki izin untuk menghapus data ini", id_seller: item.id_seller, id:seller._id})
    }
    try {
        await Item.findByIdAndRemove(item._id)
    } catch (err) {
        return res.status(400).json(err.message)
    }
    // res.json({message: "Data berhasil dihapus"})
    next()
}

const getItemBySeller = async (req, res) => {
    const id_seller = req.query.sellerId
    const dataItem = await Item.find({id_seller: id_seller})
    return res.status(200).json({message: "Data Item Berhasil Ditemukan", dataItem: dataItem})
}

const getKategori = async (req, res) => {
    const dataKategori = await Kategori.find({})
    return res.status(200).json({message: "Data Kategori", dataKategori: dataKategori})
}

exports.createItem = createItem
exports.updateItem = updateItem
exports.showItem = showItem
exports.deleteItem = deleteItem
exports.getItemBySeller = getItemBySeller
exports.getKategori = getKategori