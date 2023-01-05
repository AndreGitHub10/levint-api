require('dotenv').config()
const Lelang = require('../models/lelang.model')
const Item = require('../models/item.model')
const { MongoClient} = require('mongodb')
const client = new MongoClient(process.env.DATABASE_URL)
client.connect().then(() => console.log("Connection to db"))

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

const searchItem = async (req, res) => {
    let result = []
    // console.log(req.body.searchWord)
    try {
        if(req.body.searchWord) {
            result = await client
                .db('test')
                .collection('items')
                .aggregate([
                    {
                        $search: {
                            index: 'item',
                            text: {
                                query: req.body.searchWord,
                                path: "nama_item",
                            },
                        },
                    },
                    {
                        $limit: 5,
                    },
                    // {
                    //     $project: {
                    //         _id: 0,
                    //         nama_item: 1,
                    //     },
                    // },
                ]).toArray()

                let dataFeeds = await Promise.all(result.map( async (item) => {
                    let lelang
                    try {
                        lelang = await Lelang.findOne({'id_item': item._id})
                    } catch (err) {
                        console.log(err)
                    }
                    if(lelang) {
                        return {
                            id_item: item._id,
                            nama_item: item.nama_item,
                            gambar: item.gambar[0],
                            kota: item.kabupaten,
                            status: item.status,
                            harga_dasar: lelang.harga_dasar,
                            total_bidder: lelang.bid.length,
                            tanggal_mulai: lelang.tanggal_mulai,
                            tanggal_akhir: lelang.tanggal_akhir
                        }
                    } else {
                        return {
                            id_item: item._id,
                            nama_item: item.nama_item,
                            gambar: item.gambar[0],
                            kota: item.kabupaten,
                            status: item.status,
                            harga_dasar: 0,
                            total_bidder: 0,
                            tanggal_mulai: 0,
                            tanggal_akhir: 0
                        }
                    }
                }))
            return res.status(200).json({message: "query 1", result: dataFeeds})
        } else {
            return res.status(200).json({message: "query 0", result})
        }
    } catch (err) {
        return res.status(400).json({message: "error db search", result: [], err})
    }
}

const autoCompleteSearch = async (req, res) => {
    let result = []
    // console.log(req.body.searchWord)
    if (!req.body.searchWord) {
        return res.status(400).json({message: "query 0", result})
    }
    try {
        result = await client
            .db('test')
            .collection('items')
            .aggregate([
                {
                    $search: {
                        index: "autocomplete",
                        autocomplete: {
                            query: req.body.searchWord,
                            path: "nama_item",
                            fuzzy: {
                                maxEdits: 1,
                            },
                            tokenOrder: "sequential"
                        }
                    }
                },
                {
                    $limit: 10
                },
                {
                    $project: {
                        _id: 1,nama_item: 1
                    }
                }
            ]).toArray()
            return res.status(200).json({message: "query 1", result})
    } catch (err) {
        return res.status(400).json({message: "query failed db autocomplete"})
    }
}

exports.getFeeds = getFeeds
exports.getItemByKategori = getItemByKategori
exports.getItemBySellerId = getItemBySellerId
exports.searchItem = searchItem
exports.autoCompleteSearch = autoCompleteSearch