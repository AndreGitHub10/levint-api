const express = require('express')
const { createItem, updateItem, showItem, deleteItem, getItemBySeller, getKategori, getNewItemBySeller } = require('../controllers/item-controller')
const { verifyToken } = require('../shared-service/verifyToken')
const { refreshToken } = require('../shared-service/refreshToken')
const { getKurir, getProvinsi, getCity, getSubdistrict, getCost, getCostRO } = require('../shared-service/rajaongkir')
const { uploadImage, uploadImageCloud } = require('../shared-service/multer')
const { getFeeds, getItemByKategori, getItemBySellerId, searchItem, autoCompleteSearch } = require('../controllers/feed-controller')
const { getAktivitasBid } = require('../controllers/lelang-controller')

const itemRouter = express.Router()
itemRouter.post('/create', verifyToken, refreshToken, createItem)
itemRouter.post('/image', verifyToken, uploadImage.array('image'), uploadImageCloud)
itemRouter.post('/update', verifyToken, refreshToken, updateItem)
itemRouter.get('/getItem', showItem)
itemRouter.get('/getItemByKategori', getItemByKategori)
itemRouter.get('/getItemBySellerId', getItemBySellerId)
itemRouter.get('/delete/(:id)', verifyToken, refreshToken, deleteItem, getItemBySeller)
itemRouter.get('/getItemBySeller', getItemBySeller)
itemRouter.get('/getNewItemBySeller', getNewItemBySeller)
itemRouter.get('/kategori', getKategori)
itemRouter.get('/feeds', getFeeds)
itemRouter.get('/kurir', getKurir)
itemRouter.post('/getProvinsi', getProvinsi)
itemRouter.post('/getKabupaten', getCity)
itemRouter.post('/getKecamatan', getSubdistrict)
itemRouter.post('/getCost', getCost)
itemRouter.post('/getCostRO', getCostRO)
itemRouter.get('/getAktivitasBid', verifyToken, getAktivitasBid)
itemRouter.post('/searchItem', searchItem)
itemRouter.post('/autoCompleteSearch', autoCompleteSearch)
module.exports = itemRouter