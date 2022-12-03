const Lelang = require('../models/lelang.model')
const Item = require('../models/item.model')

const getFeeds = async (req, res) => {
    let dataFeeds
    let randLelang
    let itemList

    try {
        randLelang = await Lelang.find({ tanggal_akhir: { $gte: Date() } })
    } catch (error) {
        console.log(error)
    }

    if(randLelang) {
        const idsRandLelang = randLelang.map((lelang) => {
            return lelang.id_item
        })
        console.log(idsRandLelang)
        try {
            // itemList = await Item.find({}).where('_id').in(idsRandLelang).exec()
            itemList = await Item.find({'_id': { $in: idsRandLelang }, status: "onLelang"})
        } catch (error) {
            console.log(error)
        }
    }

    console.log(itemList)
    dataFeeds = itemList.map((item) => {
        let lelang = randLelang.find(x => x.id_item == item._id)
        return {
            id_item: item._id,
            nama_item: item.nama_item,
            gambar: item.gambar[0],
            kota: item.kabupaten,
            harga_dasar: lelang.harga_dasar,
            total_bidder: lelang.bid.length,
            tanggal_mulai: lelang.tanggal_mulai,
            tanggal_akhir: lelang.tanggal_akhir
        }
    })

    return res.status(200).json({message: "feeds got", dataFeeds})
}


const getItemByKategori = async (req, res) => {
    const id_kategori = req.query.kategoriId
    let dataFeeds
    let randLelang
    let itemList

    try {
        randLelang = await Lelang.find({ tanggal_akhir: { $gte: Date() } })
    } catch (error) {
        console.log(error)
    }

    if(randLelang) {
        const idsRandLelang = randLelang.map((lelang) => {
            return lelang.id_item
        })
        console.log(idsRandLelang)
        try {
            // itemList = await Item.find({}).where('_id').in(idsRandLelang).exec()
            itemList = await Item.find({'_id': { $in: idsRandLelang }})
        } catch (error) {
            console.log(error)
        }
    }

    console.log(itemList)
    dataFeeds = itemList.flatMap((item) => {
        console.log(item.kategori)
        if(item.kategori.some(kat => kat.id.equals(id_kategori))) {
            let lelang = randLelang.find(x => x.id_item == item._id)
            return {
                id_item: item._id,
                nama_item: item.nama_item,
                gambar: item.gambar[0],
                kota: item.kabupaten,
                harga_dasar: lelang.harga_dasar,
                total_bidder: lelang.bid.length,
                tanggal_mulai: lelang.tanggal_mulai,
                tanggal_akhir: lelang.tanggal_akhir
            }
        } else {
            return []
        }
    })

    return res.status(200).json({message: "feeds got", dataFeeds})
}

const getItemBySellerId = async (req, res) => {
    const id_seller = req.query.sellerId
    let dataFeeds
    let randLelang
    let itemList

    try {
        randLelang = await Lelang.find({ tanggal_akhir: { $gte: Date() } })
    } catch (error) {
        console.log(error)
    }

    if(randLelang) {
        const idsRandLelang = randLelang.map((lelang) => {
            return lelang.id_item
        })
        console.log(idsRandLelang)
        try {
            // itemList = await Item.find({}).where('_id').in(idsRandLelang).exec()
            itemList = await Item.find({'_id': { $in: idsRandLelang }})
        } catch (error) {
            console.log(error)
        }
    }

    // console.log(itemList)
    dataFeeds = itemList.flatMap((item) => {
        // console.log(item.kategori)
        if(item.id_seller == id_seller) {
            let lelang = randLelang.find(x => x.id_item == item._id)
            return {
                id_item: item._id,
                nama_item: item.nama_item,
                gambar: item.gambar[0],
                kota: item.kabupaten,
                harga_dasar: lelang.harga_dasar,
                total_bidder: lelang.bid.length,
                tanggal_mulai: lelang.tanggal_mulai,
                tanggal_akhir: lelang.tanggal_akhir
            }
        } else {
            return []
        }
    })

    return res.status(200).json({message: "feeds got", dataFeeds})
}

exports.getFeeds = getFeeds
exports.getItemByKategori = getItemByKategori
exports.getItemBySellerId = getItemBySellerId